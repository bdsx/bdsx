
import * as child_process from 'child_process';
import * as colors from 'colors';
import { https } from 'follow-redirects';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as unzipper from 'unzipper';
import { fsutil } from '../fsutil';
import { progressBar } from '../progressbar';
import { printOnProgress } from '../util';
import * as BDS_VERSION_DEFAULT from '../version-bds.json';
import * as BDSX_CORE_VERSION_DEFAULT from '../version-bdsx.json';
import { InstallInfo } from './installinfo';
import { GitHubClient } from './publisher';
import * as JSZip from 'jszip';
import { key } from '../util/key';

const BDSX_YES = process.env.BDSX_YES;
const sep = path.sep;

const BDS_LINK_DEFAULT = 'https://minecraft.azureedge.net/bin-win/bedrock-server-%BDS_VERSION%.zip';
const BDSX_CORE_LINK_DEFAULT = 'https://github.com/bdsx/bdsx-core/releases/download/%BDSX_CORE_VERSION%/bdsx-core-%BDSX_CORE_VERSION%.zip';
const PDBCACHE_LINK_DEFAULT = 'https://github.com/bdsx/pdbcache/releases/download/%BDS_VERSION%/pdbcache.zip';

const BDS_VERSION = process.env.BDSX_BDS_VERSION || BDS_VERSION_DEFAULT;
const BDSX_CORE_VERSION = process.env.BDSX_CORE_VERSION || BDSX_CORE_VERSION_DEFAULT;
const BDS_LINK = replaceVariable(process.env.BDSX_BDS_LINK || BDS_LINK_DEFAULT);
const BDSX_CORE_LINK = replaceVariable(process.env.BDSX_CORE_LINK || BDSX_CORE_LINK_DEFAULT);
const PDBCACHE_LINK = replaceVariable(process.env.BDSX_PDBCACHE_LINK || PDBCACHE_LINK_DEFAULT);

function replaceVariable(str: string): string {
    return str.replace(/%(.*?)%/g, (match, name: string) => {
        switch (name.toUpperCase()) {
        case '':
            return '%';
        case 'BDS_VERSION':
            return BDS_VERSION;
        case 'BDSX_CORE_VERSION':
            return BDSX_CORE_VERSION;
        default:
            return match;
        }
    });
}

const KEEPS = new Set([
    `${sep}whitelist.json`,
    `${sep}allowlist.json`,
    `${sep}valid_known_packs.json`,
    `${sep}server.properties`,
    `${sep}permissions.json`,
]);

class MessageError extends Error {
    constructor(msg:string) {
        super(msg);
    }
}

export class BDSInstaller {
    public readonly info:InstallInfo;
    public target:string;

    constructor(public readonly bdsPath:string, public readonly agreeOption:boolean) {
        this.info = new InstallInfo(bdsPath);
    }

    yesno(question:string, defaultValue?:boolean):Promise<boolean> {
        const yesValues = [ 'yes', 'y'];
        const noValues  = [ 'no', 'n' ];

        return new Promise<boolean>(resolve=>{
            if (BDSX_YES === 'false') {
                return resolve(false);
            }
            if (!process.stdin.isTTY || BDSX_YES === 'true') {
                return resolve(true);
            }
            if (this.agreeOption) {
                console.log('Agreed by -y');
                return resolve(true);
            }

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
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
                resolve(this.yesno(question, defaultValue));
            });
        });
    }

    async removeInstalled(dest:string, files:string[]):Promise<void> {
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
}

interface InstallItemOptions {
    name:string;
    key?:keyof InstallInfo;
    version?:string;
    targetPath:string;
    url:string;
    keyFile?:string;
    confirm?:(installer:BDSInstaller)=>Promise<void>|void;
    preinstall?:(installer:BDSInstaller)=>Promise<void>|void;
    postinstall?:(installer:BDSInstaller, writedFiles:string[])=>Promise<void>|void;
    fallback?:(installer:BDSInstaller, statusCode:number)=>Promise<boolean|void>|boolean|void;
    skipExists?:boolean;
    oldFiles?:string[];
}

class InstallItem {
    constructor(
        public readonly opts:InstallItemOptions) {
    }

    private async _downloadAndUnzip(installer:BDSInstaller):Promise<string[]> {
        const dest = installer.target;
        const url = this.opts.url;
        const writedFiles:string[] = [];

        const zipfiledir = path.join(__dirname, 'zip');
        try { await fsutil.del(zipfiledir); } catch (err) {}

        progressBar.start(`${this.opts.name}: Install`, {
            total: 1,
            width: 20,
        });

        const dirhas = new Set<string>();
        dirhas.add(dest);

        await new Promise<void>((resolve, reject)=>{
            https.get(url, (response)=>{
                progressBar.setTotal(+response.headers['content-length']!);
                if (response.statusCode !== 200) {
                    (async()=>{
                        if (this.opts.fallback != null) {
                            const res = await this.opts.fallback(installer, response.statusCode!);
                            if (res === false) {
                                resolve();
                            }
                        }
                        reject(new MessageError(`${this.opts.name}: ${response.statusCode} ${response.statusMessage}, Failed to download ${url}`));
                    })().catch(reject);
                    return;
                }
                response.on('data', (data:Buffer)=>{
                    progressBar.tick(data.length);
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
                    entry.pipe(fs.createWriteStream(extractPath)).on('error', reject);
                }).on('finish', ()=>{
                    resolve();
                    progressBar.finish();
                }).on('error', reject);
            }).on('error', reject);
        });

        return writedFiles;
    }

    private async _install(installer:BDSInstaller):Promise<void> {

        const oldFiles = this.opts.oldFiles;
        if (oldFiles != null) {
            for (const oldfile of oldFiles) {
                try {
                    await fsutil.del(path.join(installer.target, oldfile));
                } catch (err) {
                }
            }
        }
        await fsutil.mkdir(installer.target);
        const preinstall = this.opts.preinstall;
        if (preinstall) await preinstall(installer);
        const writedFiles = await this._downloadAndUnzip(installer);
        if (this.opts.key != null) {
            installer.info[this.opts.key] = this.opts.version as any;
        }

        const postinstall = this.opts.postinstall;
        if (postinstall) await postinstall(installer, writedFiles);
    }

    private async _confirmAndInstall(installer:BDSInstaller):Promise<void> {
        const confirm = this.opts.confirm;
        if (confirm != null) await confirm(installer);
        await this._install(installer);
        console.log(`${this.opts.name}: Installed successfully`);
    }

    async install(installer:BDSInstaller):Promise<void> {
        installer.target = path.join(installer.bdsPath, this.opts.targetPath);

        const name = this.opts.name;
        const key = this.opts.key;
        if (key == null || this.opts.version == null) {
            await this._install(installer);
            return;
        }
        const keyFile = this.opts.keyFile;
        const keyExists = keyFile != null && await fsutil.exists(path.join(installer.target, keyFile));
        const keyNotFound = keyFile != null && !keyExists;
        const version = installer.info[key];

        if (version === undefined) {
            if (keyExists) {
                if (await installer.yesno(`${name}: Would you like to use what already installed?`)) {
                    installer.info[key] = 'manual' as any;
                    console.log(`${name}: manual`);
                    return;
                }
            }
            this._confirmAndInstall(installer);
        } else {
            if (keyNotFound) {
                console.log(colors.yellow(`${name}: ${keyFile} not found`));
                this._confirmAndInstall(installer);
            } else {
                if (version === null || version === 'manual') {
                    console.log(`${name}: manual`);
                } else if (version === this.opts.version) {
                    console.log(`${name}: ${this.opts.version}`);
                } else {
                    console.log(`${name}: Old (${version})`);
                    console.log(`${name}: New (${this.opts.version})`);
                    await this._install(installer);
                    console.log(`${name}: Updated`);
                }
            }
        }
    }

}

const pdbcache = new InstallItem({
    name: 'pdbcache',
    version: BDS_VERSION,
    url: PDBCACHE_LINK,
    targetPath: '.',
    key: 'pdbcacheVersion',
    keyFile: 'pdbcache.bin',
    async fallback(installer, statusCode) {
        if (statusCode !== 404) return;
        console.error(colors.yellow(`pdbcache-${BDS_VERSION} does not exist on the server`));
        console.error(colors.yellow('Generate through pdbcachegen.exe'));
        const pdbcachegen = path.join(installer.bdsPath, 'pdbcachegen.exe');
        const pdbcachebin = path.join(installer.bdsPath, 'pdbcache.bin');
        const bedrockserver = path.join(installer.bdsPath, 'bedrock_server.exe');
        const res = child_process.spawnSync(pdbcachegen, [bedrockserver, pdbcachebin], {stdio:'inherit'});
        if (res.status !== 0) throw new MessageError(`Failed to generate pdbcache`);

        const githubToken = await key.getGithubToken();
        if (githubToken !== undefined) {
            // zip file
            const cachePath = path.join(installer.bdsPath, 'pdbcache.bin');
            const zipPath = path.join(installer.bdsPath, 'pdbcache.zip');
            const zip = new JSZip;
            zip.file('pdbcache.bin', await fsutil.readFile(cachePath, null));
            await fsutil.writeStream(zipPath, zip.generateNodeStream());

            // create release
            console.error(colors.yellow('publish pdbcache.bin'));
            const client = new GitHubClient(githubToken);
            const release = await client.createRelease('bdsx', 'pdbcache', BDS_VERSION);
            await release.upload(zipPath);
        }
        return false;
    },
});

const bds = new InstallItem({
    name: 'BDS',
    version: BDS_VERSION,
    url: BDS_LINK,
    targetPath: '.',
    key: 'bdsVersion',
    keyFile: 'bedrock_server.exe',
    skipExists: true,
    async confirm(installer) {
        console.log(`This will download and install Bedrock Dedicated Server to '${path.resolve(installer.bdsPath)}'`);
        console.log(`BDS Version: ${BDS_VERSION}`);
        console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
        console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);
        const ok = await installer.yesno('Do you agree to the terms above? (y/n)');
        if (!ok) throw new MessageError("Canceled");
    },
    async preinstall(installer) {
        if (installer.info.files) {
            await installer.removeInstalled(installer.bdsPath, installer.info.files!);
        }
    },
    async postinstall(installer, writedFiles) {
        installer.info.files = writedFiles.filter(file=>!KEEPS.has(file));
    },
});

const bdsxCore = new InstallItem({
    name: 'bdsx-core',
    version: BDSX_CORE_VERSION,
    url: BDSX_CORE_LINK,
    targetPath: '.',
    key: 'bdsxCoreVersion',
    keyFile: 'VCRUNTIME140_1.dll',
    oldFiles: ['mods', 'Chakra.pdb'],
});

export async function installBDS(bdsPath:string, agreeOption:boolean = false):Promise<boolean> {
    if (BDSX_YES === 'skip') {
        return true;
    }

    const installer = new BDSInstaller(bdsPath, agreeOption);
    await installer.info.load();
    try {
        await bds.install(installer);
        await bdsxCore.install(installer);
        await pdbcache.install(installer);
        await installer.info.save();
        return true;
    } catch (err) {
        if (err instanceof MessageError) {
            console.error(err.message);
        } else {
            console.error(err.stack);
        }
        await installer.info.save();
        return false;
    }
}
