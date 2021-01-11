// one page TS

/// <reference path='./fstream.d.ts' />
'use strict';


import fs_ori = require('fs');
import unzipper = require('unzipper');
import path = require('path');
import { Writer } from 'fstream';
import readline = require('readline');
import ProgressBar = require('progress');
import { https } from 'follow-redirects';

const sep = path.sep;

export const BDS_VERSION = '1.16.200.02';
const BDS_LINK = `https://minecraft.azureedge.net/bin-win/bedrock-server-${BDS_VERSION}.zip`;

function yesno({ question, defaultValue }:{question:string, defaultValue?:boolean}):Promise<boolean>{
    const yesValues = [ 'yes', 'y'];
    const noValues  = [ 'no', 'n' ];

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise<boolean>(resolve=>{
        rl.question(question + ' ', async(answer)=>{
            rl.close();

            const cleaned = answer.trim().toLowerCase();
            if (cleaned == '' && defaultValue != null)
                return resolve(defaultValue);
    
            if (yesValues.indexOf(cleaned) >= 0)
                return resolve(true);
                
            if (noValues.indexOf(cleaned) >= 0)
                return resolve(false);
    
            process.stdout.write('\nInvalid Response.\n');
            process.stdout.write('Answer either yes : (' + yesValues.join(', ')+') \n');
            process.stdout.write('Or no: (' + noValues.join(', ') + ') \n\n');
            resolve(yesno({ question, defaultValue }));
        });
    });
}

const fs = {
    readFile(path:string):Promise<string>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.readFile(path, 'utf-8', (err, data)=>{
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    writeFile(path:string, content:string):Promise<void>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.writeFile(path, content, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
    },
    readdir(path:string):Promise<string[]>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.readdir(path, 'utf-8', (err, data)=>{
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    mkdir(path:string):Promise<void>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.mkdir(path, (err)=>{
                if (err)
                {
                    if (err.code === 'EEXIST') resolve();
                    else reject(err);
                }
                else resolve();
            });
        });
    },
    rmdir(path:string):Promise<void>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.rmdir(path, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
    },
    stat(path:string):Promise<fs_ori.Stats>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.stat(path, (err, data)=>{
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    unlink(path:string):Promise<void>
    {
        return new Promise((resolve, reject)=>{
            fs_ori.unlink(path, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
    },
    copyFile(from:string, to:string):Promise<void>
    {
        return new Promise((resolve, reject)=>{
            const rd = fs_ori.createReadStream(from);
            rd.on("error", reject);
            const wr = fs_ori.createWriteStream(to);
            wr.on("error", reject);
            wr.on("close", ()=>{
                resolve();
            });
            rd.pipe(wr);
        });
    },
    exists(path:string):Promise<boolean>
    {
        return fs.stat(path).then(()=>true, ()=>false);
    },
};

interface InstallInfo
{
    bdsVersion?:string|null;
    files?:string[];
}

const KEEPS = new Set([
    `${sep}whitelist.json`,
    `${sep}valid_known_packs.json`,
    `${sep}server.properties`,
    `${sep}permissions.json`,
]);

class MessageError extends Error
{
    constructor(msg:string)
    {
        super(msg);
    }
}

const resolved = Promise.resolve();

async function concurrencyLoop<T>(array:T[], concurrency:number, callback:(entry:T)=>Promise<void>):Promise<void>
{    if (concurrency <= 1)
    {
        for (const item of array)
        {
            await callback(item);
        }
        return;
    }
    
    let entryidx = 0;
    async function process():Promise<void>
    {
        while (entryidx < array.length)
        {
            await callback(array[entryidx++]);
        }
    }

    const waitings:Promise<void>[] = [];
    const n = Math.min(array.length, concurrency);
    for (let i=0;i<n;i++)
    {
        waitings.push(process());
    }
    await Promise.all(waitings);
}

function downloadFile(filepath:string, url:string):Promise<void>
{
    return new Promise((resolve, reject)=>{
        function download()
        {
            const file = fs_ori.createWriteStream(filepath);
            https.get(url, (response)=>{
                if (response.statusCode !== 200)
                {
                    fs.unlink(filepath);
                    reject(Error(`${response.statusCode} ${response.statusMessage}, Failed to download ${url}`));
                    return;
                }
                response.pipe(file)
                .on('end', resolve);
            }).on('error', err=>{
                fs.unlink(filepath);
                reject(err);
            });
        }
        fs.stat(filepath).then(stat=>{
            if (stat.size >= 10) resolve();
            else download();
        }, download);
    });
}

async function downloadAndUnzip(prefix:string, url:string, dest:string, skipExists:boolean):Promise<string[]>
{
    const bar = new ProgressBar(prefix+': :bar :current/:total', { 
        total: 1,
        width: 20,
    });
    const urlidx = url.lastIndexOf('/');
    const zipfilename = url.substr(urlidx+1);
    const zipfiledir = path.join(__dirname, 'zip');
    const zipfilepath = path.join(zipfiledir, zipfilename);
    
    const writedFiles:string[] = [];
    
    await fs.mkdir(zipfiledir);
    await downloadFile(zipfilepath, url);
    const archive = await unzipper.Open.file(zipfilepath);
    
    const files:unzipper.File[] = [];
    for (const entry of archive.files)
    {
        if (entry.type == 'Directory') continue;

        let filepath = entry.path;
        if (sep !== '/') filepath = filepath.replace(/\//g, sep);
        if (!filepath.startsWith(sep)) filepath = sep+filepath;
        writedFiles.push(filepath);

        if (skipExists)
        {
            const exists = fs_ori.existsSync(path.join(dest, filepath));
            if (exists) continue;
        }
        files.push(entry);
    }

    bar.total = files.length;

    await concurrencyLoop(files, 5, entry=>{
        const extractPath = path.join(dest, entry.path);
        if (extractPath.indexOf(dest) != 0) return resolved;
        const writer = Writer({ path: extractPath });
        return new Promise<void>((resolve, reject)=>{
            entry.stream()
                .on('error',reject)
                .pipe(writer)
                .on('close',()=>{
                    bar.tick();
                    resolve();
                })
                .on('error',reject);
        });
    });
    return writedFiles;
}

async function removeInstalled(dest:string, files:string[]):Promise<void>
{
    for (let i = files.length - 1; i >= 0; i--)
    {
        try
        {
            const file = files[i];
            if (file.endsWith(sep))
            {
                await fs.rmdir(path.join(dest, file.substr(0, file.length-1)));
            }
            else
            {
                await fs.unlink(path.join(dest, file));
            }
        }
        catch (err)
        {
        }
    }
}

let installInfo:InstallInfo;

const bdsPath = process.argv[2];
const agree = process.argv[3] === '-y';
const installInfoPath = `${bdsPath}${sep}installinfo.json`;

async function readInstallInfoSync():Promise<void>
{
    try
    {
        const file = await fs.readFile(installInfoPath);
        installInfo = JSON.parse(file);
    }
    catch (err)
    {
        if (err.code !== 'ENOENT') throw err;
        installInfo = {};
    }
}

function saveInstallInfo():Promise<void>
{
    if (installInfo === null) return resolved;
    return fs.writeFile(installInfoPath, JSON.stringify(installInfo, null, 4));
}

async function installBDS():Promise<void>
{
    console.log(`BDS: Install to ${bdsPath}`);
    let prom:Promise<void>;
    if (installInfo.files)
    {
        prom = removeInstalled(bdsPath, installInfo.files!);
    }
    else
    {
        prom = resolved;
    }
    const writedFiles = await downloadAndUnzip('BDS', BDS_LINK, installInfoPath, true);
    if (installInfo === null) installInfo = {};
    installInfo.bdsVersion = BDS_VERSION;
    installInfo.files = writedFiles.filter(file=>!KEEPS.has(file));;
}

async function downloadBDS(yes:boolean):Promise<void>
{
    await fs.mkdir(bdsPath);
    // BDS
    if (installInfo.bdsVersion === null || installInfo.bdsVersion === 'manual')
    {
        console.log(`BDS: --manual-bds`);
        return;
    }
    if (installInfo.bdsVersion === undefined)
    {
        // not installed
        console.log(`It will download and install Bedrock Dedicated Server to '${bdsPath}'`);
        console.log(`BDS Version: ${BDS_VERSION}`);
        console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
        console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);
        if (!yes)
        {
            const ok = await yesno({
                question: "Would you like to agree it?(Y/n)"
            });
            if (!ok) throw new MessageError("Canceled");
        }
        else
        {
            console.log("Agreed by -y");
        }
        await installBDS();
        console.log(`BDS: Installed successfully`);
    }
    else if (installInfo.bdsVersion === BDS_VERSION)
    {
        console.log(`BDS: ${BDS_VERSION}`);
    }
    else
    {
        console.log(`BDS: Old (${installInfo.bdsVersion})`);
        console.log(`BDS: New (${BDS_VERSION})`);
        await installBDS();
        console.log(`BDS: Updated`);
    }
}

(async()=>{
    try
    {
        await readInstallInfoSync();
        await downloadBDS(agree);
        await saveInstallInfo();
    }
    catch (err)
    {
        if (err instanceof MessageError)
        {
            console.error(err.message);
        }
        else
        {
            console.error(err.stack);
        }
    }
})();