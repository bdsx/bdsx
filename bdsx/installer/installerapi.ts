
import fs_ori = require('fs');
import unzipper = require('unzipper');
import path = require('path');
import readline = require('readline');
import ProgressBar = require('progress');
import { https } from 'follow-redirects';
import BDSX_CORE_VERSION = require('../version-bdsx.json');
import BDS_VERSION = require('../version-bds.json');
import { fsutil } from '../fsutil';
import { printOnProgress } from '../util';

const BDSX_YES = process.env.BDSX_YES;
const sep = path.sep;

const BDS_LINK = `https://minecraft.azureedge.net/bin-win/bedrock-server-${BDS_VERSION}.zip`;
const BDSX_CORE_LINK = `https://github.com/bdsx/bdsx-core/releases/download/${BDSX_CORE_VERSION}/bdsx-core-${BDSX_CORE_VERSION}.zip`;

export async function installBDS(bdsPath:string, agreeOption:boolean = false):Promise<boolean> {
    if (BDSX_YES === 'skip') {
        return true;
    }
    function yesno(question:string, defaultValue?:boolean):Promise<boolean> {
        const yesValues = [ 'yes', 'y'];
        const noValues  = [ 'no', 'n' ];

        return new Promise<boolean>(resolve=>{
            if (BDSX_YES === 'false') {
                return resolve(false);
            }
            if (!process.stdin.isTTY || BDSX_YES === 'true') {
                return resolve(true);
            }
            if (agreeOption) {
                console.log('Agreed by -y');
                return resolve(true);
            }

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question(`${question} `, async(answer)=>{
                rl.close();

                const cleaned = answer.trim().toLowerCase();
                if (cleaned === '' && defaultValue != null)
                    return resolve(defaultValue);

                if (yesValues.indexOf(cleaned) >= 0)
                    return resolve(true);

                if (noValues.indexOf(cleaned) >= 0)
                    return resolve(false);

                console.log();
                console.log('Invalid Response.');
                console.log(`Answer either yes : (${yesValues.join(', ')})`);
                console.log(`Or no: (${noValues.join(', ')})`);
                console.log();
                resolve(yesno(question, defaultValue));
            });
        });
    }

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
            const file = files[i];
            try {
                if (file.endsWith(sep)) {
                    await fsutil.rmdir(path.join(dest, file.substr(0, file.length-1)));
                } else {
                    await fsutil.unlink(path.join(dest, file));
                }
            } catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`Failed to remove ${file}, ${err.message}`);
                }
            }
        }
    }

    let installInfo:InstallInfo;

    const installInfoPath = `${bdsPath}${sep}installinfo.json`;

    async function readInstallInfo():Promise<void> {
        try {
            const file = await fsutil.readFile(installInfoPath);
            installInfo = JSON.parse(file);
            if (!installInfo) installInfo = {};
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
            installInfo = {};
        }
    }

    function saveInstallInfo():Promise<void> {
        return fsutil.writeJson(installInfoPath, installInfo);
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
            try { await fsutil.del(zipfiledir); } catch (err) {}

            const bar = new ProgressBar(`${this.opts.name}: Install :bar :current/:total`, {
                total: 1,
                width: 20,
            });

            const dirhas = new Set<string>();
            dirhas.add(dest);

            await new Promise<void>((resolve, reject)=>{
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
                            await fsutil.mkdirRecursive(extractPath, dirhas);
                            entry.autodrain();
                            return;
                        }

                        if (this.opts.skipExists) {
                            const exists = await fsutil.exists(path.join(dest, entry.path));
                            if (exists) {
                                printOnProgress(`Keep ${entry.path}`);
                                entry.autodrain();
                                return;
                            }
                        }

                        await fsutil.mkdirRecursive(path.dirname(extractPath), dirhas);
                        entry.pipe(fs_ori.createWriteStream(extractPath)).on('error', reject);
                    }).on('finish', ()=>{
                        resolve();
                        bar.terminate();
                    }).on('error', reject);
                }).on('error', reject);
            });

            return writedFiles;
        }

        private async _install():Promise<void> {
            const oldFiles = this.opts.oldFiles;
            if (oldFiles) {
                for (const oldfile of oldFiles) {
                    try {
                        await fsutil.del(path.join(this.opts.targetPath, oldfile));
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
            await fsutil.mkdir(this.opts.targetPath);
            const name = this.opts.name;
            const key = this.opts.key;
            if (installInfo[key] == null) {
                const keyFile = this.opts.keyFile;
                if (keyFile && await fsutil.exists(path.join(this.opts.targetPath, keyFile))) {
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
        skipExists: true,
        async confirm() {
            console.log(`This will download and install Bedrock Dedicated Server to '${path.resolve(bdsPath)}'`);
            console.log(`BDS Version: ${BDS_VERSION}`);
            console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
            console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);
            const ok = await yesno('Do you agree to the terms above? (y/n)');
            if (!ok) throw new MessageError("Canceled");
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

    try {
        await readInstallInfo();
        await bds.install();
        await bdsxCore.install();
        await saveInstallInfo();
        return true;
    } catch (err) {
        if (err instanceof MessageError) {
            console.error(err.message);
        } else {
            console.error(err.stack);
        }
        await saveInstallInfo();
        return false;
    }
}
