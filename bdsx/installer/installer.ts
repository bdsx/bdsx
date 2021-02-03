'use strict';

import fs_ori = require('fs');
import unzipper = require('unzipper');
import path = require('path');
import readline = require('readline');
import ProgressBar = require('progress');
import { https } from 'follow-redirects';
import version = require('../version.json');

const sep = path.sep;

const BDS_VERSION = '1.16.201.02';
const BDS_LINK = `https://minecraft.azureedge.net/bin-win/bedrock-server-${BDS_VERSION}.zip`;
const BDSX_CORE_VERSION = version.coreVersion;
const BDSX_CORE_LINK = `https://github.com/bdsx/bdsx-core/releases/download/${BDSX_CORE_VERSION}/bdsx-core-${BDSX_CORE_VERSION}.zip`;

function yesno(question:string, defaultValue?:boolean):Promise<boolean> {
    const yesValues = [ 'yes', 'y'];
    const noValues  = [ 'no', 'n' ];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise<boolean>(resolve=>{
        if (!process.stdin.isTTY || process.env.BDSX_YES === "true") {
            resolve(true);
            return;
        }

        rl.question(question + ' ', async(answer)=>{
            rl.close();

            const cleaned = answer.trim().toLowerCase();
            if (cleaned === '' && defaultValue !== undefined)
                return resolve(defaultValue);
    
            if (yesValues.indexOf(cleaned) >= 0)
                return resolve(true);
                
            if (noValues.indexOf(cleaned) >= 0)
                return resolve(false);
    
            process.stdout.write('\nInvalid Response.\n');
            process.stdout.write('Answer either yes : (' + yesValues.join(', ')+') \n');
            process.stdout.write('Or no: (' + noValues.join(', ') + ') \n\n');
            resolve(yesno(question, defaultValue));
        });
    });
}

const fs = {
    readFile(path:string):Promise<string> {
        return new Promise((resolve, reject)=>{
            fs_ori.readFile(path, 'utf-8', (err, data)=>{
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    writeFile(path:string, content:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs_ori.writeFile(path, content, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
    },
    readdir(path:string):Promise<string[]> {
        return new Promise((resolve, reject)=>{
            fs_ori.readdir(path, 'utf-8', (err, data)=>{
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    mkdir(path:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs_ori.mkdir(path, (err)=>{
                if (err) {
                    if (err.code === 'EEXIST') resolve();
                    else reject(err);
                } else resolve();
            });
        });
    }, 
    _processMkdirError(dirname:string, err:any):boolean {
        if (err.code === 'EEXIST') {
            return true;
        }
        if (err.code === 'ENOENT') {
            throw new Error(`EACCES: permission denied, mkdir '${dirname}'`);
        }
        return false;
    },
    rmdir(path:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs_ori.rmdir(path, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
    },
    stat(path:string):Promise<fs_ori.Stats> {
        return new Promise((resolve, reject)=>{
            fs_ori.stat(path, (err, data)=>{
                if (err) reject(err);
                else resolve(data);
            });
        });
    },
    unlink(path:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs_ori.unlink(path, (err)=>{
                if (err) reject(err);
                else resolve();
            });
        });
    },
    copyFile(from:string, to:string):Promise<void> {
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
    exists(path:string):Promise<boolean> {
        return fs.stat(path).then(()=>true, ()=>false);
    },
    async del(filepath:string):Promise<void> {
        const stat = await fs.stat(filepath);
        if (stat.isDirectory()) {
            const files = await fs.readdir(filepath);
            for (const file of files) {
                await fs.del(path.join(filepath, file));
            }
            await fs.rmdir(filepath);
        } else {
            await fs.unlink(filepath);
        }
    }
};

interface InstallInfo
{
    bdsVersion?:string|null;
    bdsxCoreVersion?:string|null;
    files?:string[];
}

const KEEPS = new Set([
    `${sep}whitelist.json`,
    `${sep}valid_known_packs.json`,
    `${sep}server.properties`,
    `${sep}permissions.json`,
]);

class MessageError extends Error {
    constructor(msg:string) {
        super(msg);
    }
}

async function removeInstalled(dest:string, files:string[]):Promise<void> {
    for (let i = files.length - 1; i >= 0; i--) {
        try {
            const file = files[i];
            if (file.endsWith(sep)) {
                await fs.rmdir(path.join(dest, file.substr(0, file.length-1)));
            } else {
                await fs.unlink(path.join(dest, file));
            }
        } catch (err) {
        }
    }
}

let installInfo:InstallInfo;

const bdsPath = process.argv[2];
const agree = process.argv[3] === '-y';
const installInfoPath = `${bdsPath}${sep}installinfo.json`;

async function readInstallInfo():Promise<void> {
    try {
        const file = await fs.readFile(installInfoPath);
        installInfo = JSON.parse(file);
        if (!installInfo) installInfo = {};
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
        installInfo = {};
    }
}

function saveInstallInfo():Promise<void> {
    return fs.writeFile(installInfoPath, JSON.stringify(installInfo, null, 4));
}

class InstallItem {
    constructor(public readonly opts:{
        name:string,
        key:keyof InstallInfo,
        version:string,
        targetPath:string,
        url:string,
        keyFile?:string,
        confirm?:()=>Promise<void>|void,
        preinstall?:()=>Promise<void>|void,
        postinstall?:(writedFiles:string[])=>Promise<void>|void,
        skipExists?:boolean,
        oldFiles?:string[],
    }) {
    }

    private async _downloadAndUnzip():Promise<string[]> {
        const url = this.opts.url;
        const dest = path.join(this.opts.targetPath);
        const writedFiles:string[] = [];
        
        const zipfiledir = path.join(__dirname, 'zip');
        try { await fs.del(zipfiledir); } catch (err) {}

        const bar = new ProgressBar(`${this.opts.name}: Install :bar :current/:total`, { 
            total: 1,
            width: 20,
        });

        const dirhas = new Set<string>();
        dirhas.add(dest);

        async function mkdirRecursive(dirpath:string):Promise<void> {
            if (dirhas.has(dirpath)) return;
            await mkdirRecursive(path.dirname(dirpath));
            await fs.mkdir(dirpath);
        }

        await new Promise<unzipper.ParseStream>((resolve, reject)=>{
            https.get(url, (response)=>{
                bar.total = +response.headers['content-length']!;
                if (response.statusCode !== 200) {
                    reject(new MessageError(`${this.opts.name}: ${response.statusCode} ${response.statusMessage}, Failed to download ${url}`));
                    return;
                }
                response.on('data', (data:Buffer)=>{
                    bar.tick(data.length);
                });

                const zip = response.pipe(unzipper.Parse());
                zip.on('entry', async(entry:unzipper.Entry)=>{
                    let filepath = entry.path;
                    if (sep !== '/') filepath = filepath.replace(/\//g, sep);
                    else filepath = filepath.replace(/\\/g, sep);
                    if (!filepath.startsWith(sep)) {
                        filepath = sep+filepath;
                        entry.path = filepath;
                    } else {
                        entry.path = filepath.substr(1);
                    }
                    writedFiles.push(filepath);

                    const extractPath = path.join(dest, entry.path);
                    if (entry.type === 'Directory') {
                        await mkdirRecursive(extractPath);
                        entry.autodrain();
                        return;
                    }
            
                    if (this.opts.skipExists) {
                        const exists = await fs.exists(path.join(dest, entry.path));
                        if (exists) {
                            entry.autodrain();
                            return;
                        }
                    }
                    
                    await mkdirRecursive(path.dirname(extractPath));
                    entry.pipe(fs_ori.createWriteStream(extractPath)).on('error', reject);
                }).on('finish', resolve).on('error', reject);
            }).on('error', reject);
        });
        
        return writedFiles;
    }
    
    private async _install():Promise<void> {
        const oldFiles = this.opts.oldFiles;
        if (oldFiles) {
            for (const oldfile of oldFiles) {
                try {
                    await fs.del(path.join(this.opts.targetPath, oldfile));
                } catch (err) {
                }
            }
        }
        const preinstall = this.opts.preinstall;
        if (preinstall) await preinstall();
        const writedFiles = await this._downloadAndUnzip();
        installInfo[this.opts.key] = this.opts.version as any;

        const postinstall = this.opts.postinstall;
        if (postinstall) await postinstall(writedFiles);
    }
        
    async install():Promise<void> {
        await fs.mkdir(this.opts.targetPath);
        const name = this.opts.name;
        const key = this.opts.key;
        if (installInfo[key] === undefined) {
            const keyFile = this.opts.keyFile;
            if (keyFile && await fs.exists(path.join(this.opts.targetPath, keyFile))) {
                if (await yesno(`${name}: Would you like to use what already installed?`)) {
                    installInfo[key] = 'manual' as any;
                    console.log(`${name}: manual`);
                    return;
                }
            }
            const confirm = this.opts.confirm;
            if (confirm) await confirm();
            await this._install();
            console.log(`${name}: Installed successfully`);
        } else if (installInfo[key] === null || installInfo[key] === 'manual') {
            console.log(`${name}: manual`);
        } else if (installInfo[key] === this.opts.version) {
            console.log(`${name}: ${this.opts.version}`);
        } else {
            console.log(`${name}: Old (${installInfo[key]})`);
            console.log(`${name}: New (${this.opts.version})`);
            await this._install();
            console.log(`${name}: Updated`);
        }
    }

}

const bds = new InstallItem({
    name: 'BDS',
    version:BDS_VERSION,
    url: BDS_LINK,
    targetPath: bdsPath,
    key: 'bdsVersion',
    keyFile: 'bedrock_server.exe',
    async confirm() {
        console.log(`It will download and install Bedrock Dedicated Server to '${path.resolve(bdsPath)}'`);
        console.log(`BDS Version: ${BDS_VERSION}`);
        console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
        console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);
        if (!agree) {
            const ok = await yesno("Would you like to agree it?(Y/n)");
            if (!ok) throw new MessageError("Canceled");
        } else {
            console.log("Agreed by -y");
        }  
    },
    async preinstall() {
        if (installInfo.files) {
            await removeInstalled(bdsPath, installInfo.files!);
        }
    },
    async postinstall(writedFiles) {
        installInfo.files = writedFiles.filter(file=>!KEEPS.has(file));
    }
});

const bdsxCore = new InstallItem({
    name: 'bdsx-core',
    version: BDSX_CORE_VERSION,
    url: BDSX_CORE_LINK,
    targetPath: bdsPath,
    key: 'bdsxCoreVersion',
    keyFile: 'Chakra.dll',
    oldFiles: ['mods'],
});

(async()=>{
    try {
        await readInstallInfo();
        await bds.install();
        await bdsxCore.install();
        await saveInstallInfo();
    } catch (err) {
        if (err instanceof MessageError) {
            console.error(err.message);
        } else {
            console.error(err.stack);
        }
        await saveInstallInfo();
        process.exit(-1);
    }
})();
