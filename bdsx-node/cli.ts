import request = require('request');
import fs = require('fs');
import yesno = require('yesno');
import unzipper = require('unzipper');
import { sep } from 'path';
import path = require('path');
import { Writer } from 'fstream';

import version = require('./gen/version.json');
import pkg = require("./package.json");

try
{
    require('source-map-support/register');
}
catch (err)
{
}

const homedir:string = require('os').homedir();
const BDS_VERSION = version.BDS_VERSION;
const BDSX_VERSION = pkg.version;
const BDS_ZIP_NAME = `bedrock-server-${BDS_VERSION}.zip`;
const BDS_LINK = `https://minecraft.azureedge.net/bin-win/${BDS_ZIP_NAME}`;
const EMINUS_INFO_URL = `https://api.github.com/repos/karikera/elementminus/releases/latest`;
const BDS_DIR = `${homedir}${sep}.bds`;
const EXE_NAME = `bedrock_server.exe`;
const USER_AGENT = 'nodebs/1.0';
const INSTALL_INFO_PATH = `${BDS_DIR}${sep}installinfo.json`;
const MOD_DIR = `${BDS_DIR}${sep}mods`;

enum ExitCode
{
    DO_NOTHING,
    ERROR,
    RUN_BDS,
}

interface InstallInfo
{
    bdsVersion:string;
    bdsxVersion:string;
    eminusVersion:string;
    files:string[];
}

const KEEPS = new Set([
    `${sep}whitelist.json`,
    `${sep}valid_known_packs.json`,
    `${sep}server.properties`,
    `${sep}permissions.json`,
]);

async function readInstallInfo():Promise<InstallInfo>
{
    try
    {
        const file = await fs.promises.readFile(INSTALL_INFO_PATH, 'utf-8');
        return JSON.parse(file);
    }
    catch (err)
    {
        if (err.code !== 'ENOENT') throw err;
        const iinfo:InstallInfo = require('./ii_unknown.json');;

        if (sep !== '/')
        {
            iinfo.files = iinfo.files.map(file => file.replace(/\//g, sep));
        }
        return iinfo;
    }
}

class MessageError extends Error
{
    constructor(msg:string)
    {
        super(msg);
    }
}

function wget(url:string):Promise<string>
{
    return new Promise((resolve, reject)=>{
        request({
            url,
            headers:{'User-Agent': USER_AGENT},
        }, (error, resp, body)=>{
            if (error) return reject(error);
            resolve(body);
        });
    });
}

interface GitHubInfo
{
    version:string;
    url:string;
}
async function wgetGitHubInfo(url:string):Promise<GitHubInfo>
{
    const latest = JSON.parse(await wget(url));
    return {
        version: latest.tag_name,
        url: latest.assets[0].browser_download_url
    }
}
async function readFiles(root:string):Promise<string[]>
{
    const out:string[] = [];
    async function _readFiles(path:string):Promise<void>
    {
        const proms:Promise<void>[] = [];
        for (const file of await fs.promises.readdir(root+path, {withFileTypes: true}))
        {
            if (!file.isDirectory())
            {
                out.push(`${path}${sep}${file.name}`);
                continue;
            }
            else
            {
                out.push(`${path}${sep}${file.name}${sep}`);
                proms.push(_readFiles(`${path}${sep}${file.name}`));
            }
        }
        await Promise.all(proms);
    }
    await _readFiles('');
    return out;
}
async function rmdirRecursive(path:string, filter:(path:string)=>boolean=()=>true):Promise<void>
{
    const files = await fs.promises.readdir(path, {withFileTypes: true});
    const filecount = files.length;
    if (filecount === 0)
    {
        await fs.promises.rmdir(path);
        return;
    }
    if (path.endsWith(sep)) path = path.substr(0, path.length-1);

    const proms = files.map(async(file)=>{
        const filepath = `${path}${sep}${file.name}`;
        if (!filter(filepath)) return;
        if (file.isDirectory())
        {
            await rmdirRecursive(filepath);
        }
        else
        {
            await fs.promises.unlink(filepath);
        }
    });
    await Promise.all(proms);
    await fs.promises.rmdir(path);
}
async function fileExists(path:string):Promise<boolean>
{
    try
    {
        await fs.promises.stat(path);
        return true;
    }
    catch (err)
    {
        if (err.code !== 'ENOENT') throw err;
        return false;
    }
}
async function concurrencyLoop<T>(array:T[], concurrency:number, callback:(entry:T)=>Promise<void>):Promise<void>
{
    if (concurrency <= 1)
    {
        for (const entry of array)
        {
            await callback(entry);
        }
    }
    else
    {
        const waitings = new Set<Promise<void>>();
        let errored:Error|null = null;
        for (const entry of array)
        {
            while (waitings.size >= concurrency)
            {
                await Promise.race(waitings);
                if (errored) throw errored;
            }
            const prom = callback(entry).then(
                ()=>waitings.delete(prom), 
                err=>{
                errored = err;
            });
            waitings.add(prom);
        }
        await Promise.all(waitings);
    }
}
function unzipBdsxTo(dest:string):Promise<void>
{
    return fs.createReadStream(`${__dirname}${sep}bdsx-bin.zip`)
    .pipe(unzipper.Extract({ path: dest }))
    .promise();
}
async function downloadAndUnzip(url:string, dest:string, skipExists:boolean):Promise<string[]>
{
    const archive = await unzipper.Open.url(request as any, url);
    const writedFiles:string[] = [];

    const files:unzipper.File[] = [];
    for (const file of archive.files)
    {
        let filepath = file.path;
        if (sep !== '/') filepath = filepath.replace(/\//g, sep);
        if (!filepath.startsWith(sep)) filepath = sep+filepath;
        writedFiles.push(filepath);

        if (skipExists)
        {
            try
            {
                const stat = await fs.promises.stat(BDS_DIR+filepath);
                if (!stat.isDirectory()) continue;
            }
            catch (err)
            {
            }
            files.push(file);
        }
    }

    if (skipExists)
    {
        await concurrencyLoop(files, 5, async(entry)=>{
            if (entry.type == 'Directory') return;
            var extractPath = path.join(dest, entry.path);
            if (extractPath.indexOf(dest) != 0) return;
            var writer = Writer({ path: extractPath });
            await new Promise(function(resolve, reject) {
                entry.stream()
                    .on('error',reject)
                    .pipe(writer)
                    .on('close',resolve)
                    .on('error',reject);
            });
        });
    }
    else
    {
        await archive.extract({
            path: dest,
            concurrency: 5,
            verbose: true,
        });
    }
    return writedFiles;
}
async function removeInstalled(files:string[])
{
    for (let i=files.length - 1;i>=0;i--)
    {
        const file = files[i];
        if (file.endsWith(sep))
        {
            try
            {
                await fs.promises.rmdir(BDS_DIR+file.substr(0, file.length-1));
            }
            catch (err)
            {
            }
        }
        else
        {
            try
            {
                await fs.promises.unlink(BDS_DIR+file);
            }
            catch (err)
            {
            }
        }
    }
}
async function downloadBDS(installinfo:InstallInfo, agree?:boolean):Promise<boolean>
{
    try
    {
        await fs.promises.mkdir(BDS_DIR);
    }
    catch (err)
    {
        if (err.code !== 'EEXIST') throw err;
    }
    if (await fileExists(`${BDS_DIR}${sep}${EXE_NAME}`)) return false;
    console.log(`It will download and install Bedrock Dedicated Server to '${BDS_DIR}'`);
    console.log(`BDS Version: ${BDS_VERSION}`);
    console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
    console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);

    if (!agree)
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

    console.log(`BDS: Install to ${BDS_DIR}`);
    const writedFiles = await downloadAndUnzip(BDS_LINK, BDS_DIR, true);
    installinfo.bdsVersion = BDS_VERSION;
    installinfo.files = writedFiles.filter(file=>!KEEPS.has(file));

    // eminus
    console.log(`Element Minus: Install to ${BDS_DIR}`);
    const eminusInfo = await wgetGitHubInfo(EMINUS_INFO_URL);
    await downloadAndUnzip(eminusInfo.url, BDS_DIR, false);
    installinfo.eminusVersion = eminusInfo.version;
    await fs.promises.mkdir(MOD_DIR);

    // bdsx
    console.log(`BDSX-mod: Install to ${MOD_DIR}`);
    await unzipBdsxTo(MOD_DIR);
    installinfo.bdsxVersion = BDSX_VERSION;

    console.log(`BDSX: Done`);
    return true;
}

async function update(installinfo:InstallInfo):Promise<void>
{
    console.log(`BDSX: Check update`);
    let updated = false;
    if (installinfo.bdsVersion === BDS_VERSION)
    {
        console.log(`BDS: Latest (${BDS_VERSION})`);
    }
    else
    {
        console.log(`BDS: Old (${installinfo.bdsVersion})`);
        console.log(`BDS: Install to ${BDS_DIR}`);
        await removeInstalled(installinfo.files);
        const writedFiles = await downloadAndUnzip(BDS_LINK, BDS_DIR, true);
        installinfo.bdsVersion = BDS_VERSION;
        installinfo.files = writedFiles.filter(file=>!KEEPS.has(file));
        updated = true;
    }
    
    // element minus
    const eminusInfo = await wgetGitHubInfo(EMINUS_INFO_URL);
    if (installinfo.eminusVersion === eminusInfo.version)
    {
        console.log(`Element Minus: Latest (${eminusInfo.version})`);
    }
    else
    {
        console.log(`Element Minus: Old (${installinfo.eminusVersion})`);
        console.log(`Element Minus: Install to ${BDS_DIR}`);
        await downloadAndUnzip(eminusInfo.url, BDS_DIR, false);
        installinfo.eminusVersion = eminusInfo.version;
        updated = true;
    }
    try
    {
        await fs.promises.mkdir(MOD_DIR);
    }
    catch (err)
    {
    }

    // bdsx
    if (installinfo.bdsxVersion === BDSX_VERSION)
    {
        console.log(`BDSX-mod: Latest (${BDSX_VERSION})`);
    }
    else
    {
        console.log(`BDSX-mod: Old (${installinfo.bdsxVersion})`);
        console.log(`BDSX-mod: Install to ${MOD_DIR}`);
        await unzipBdsxTo(MOD_DIR);
        installinfo.bdsxVersion = BDSX_VERSION;
        updated = true;
    }

    if (updated) console.log(`BDSX: Updated`);
    else console.log(`BDSX: Latest`);
}

interface ArgsOption
{
    command?:string;
    yes?:boolean;
}
function parseOption():ArgsOption
{
    const option:ArgsOption = {};

    for (let i=2;i<process.argv.length;i++)
    {
        const arg = process.argv[i];
        if (/^[a-zA-Z]/.test(arg))
        {
            if (option.command) throw Error('');
            option.command = arg;
        }
        else if (arg.startsWith('-'))
        {
            switch (arg.substr(1))
            {
            case 'y': option.yes = true; break;
            }
        }
    }
    return option;
}

(async()=>{
    try
    {
        let removing = false;
        const installinfo = await readInstallInfo();
        try
        {
            const option = parseOption();
            switch (option.command)
            {
            case 'i':
            case 'install':
                if (!await downloadBDS(installinfo, option.yes))
                {
                    await update(installinfo);
                }
                return ExitCode.DO_NOTHING;
            case 'r':
            case 'remove':
                removing = true;
                if (await fileExists(BDS_DIR))
                {
                    if (!option.yes)
                    {
                        const ok = await yesno({
                            question: "BDSX: It will remove worlds and addons. Are you sure?(Y/n)"
                        });
                        if (!ok) throw new MessageError("Canceled");
                    }
                    console.log(`${BDS_DIR}: Removing`);
                    await rmdirRecursive(BDS_DIR);
                    console.log(`${BDS_DIR}: Removed`);
                }
                else
                {
                    console.log(`${BDS_DIR}: Not found`);
                }
                return ExitCode.DO_NOTHING;
            default:
                break;
            }
        
            await downloadBDS(installinfo);
            return ExitCode.RUN_BDS;
        }
        finally
        {
            if (!removing)
            {
                await fs.promises.writeFile(INSTALL_INFO_PATH, 
                    JSON.stringify(installinfo, null, 4), 
                    'utf-8');
            }
        }
    }
    catch (err)
    {
        if (err instanceof MessageError)
        {
            console.error(err.message);
        }
        else
        {
            console.error(err);
        }
    }
    return ExitCode.DO_NOTHING;
})().then(exitCode=>{
    process.exit(exitCode);
});
