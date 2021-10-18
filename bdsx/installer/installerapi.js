"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installBDS = void 0;
const fs_ori = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const readline = require("readline");
const ProgressBar = require("progress");
const follow_redirects_1 = require("follow-redirects");
const BDSX_CORE_VERSION = require("../version-bdsx.json");
const BDS_VERSION = require("../version-bds.json");
const fsutil_1 = require("../fsutil");
const util_1 = require("../util");
const BDSX_YES = process.env.BDSX_YES;
const sep = path.sep;
const BDS_LINK = `https://minecraft.azureedge.net/bin-win/bedrock-server-${BDS_VERSION}.zip`;
const BDSX_CORE_LINK = `https://github.com/bdsx/bdsx-core/releases/download/${BDSX_CORE_VERSION}/bdsx-core-${BDSX_CORE_VERSION}.zip`;
async function installBDS(bdsPath, agreeOption = false) {
    if (BDSX_YES === 'skip') {
        return true;
    }
    function yesno(question, defaultValue) {
        const yesValues = ['yes', 'y'];
        const noValues = ['no', 'n'];
        return new Promise(resolve => {
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
            rl.question(`${question} `, async (answer) => {
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
    const KEEPS = new Set([
        `${sep}whitelist.json`,
        `${sep}valid_known_packs.json`,
        `${sep}server.properties`,
        `${sep}permissions.json`,
    ]);
    class MessageError extends Error {
        constructor(msg) {
            super(msg);
        }
    }
    async function removeInstalled(dest, files) {
        for (let i = files.length - 1; i >= 0; i--) {
            const file = files[i];
            try {
                if (file.endsWith(sep)) {
                    await fsutil_1.fsutil.rmdir(path.join(dest, file.substr(0, file.length - 1)));
                }
                else {
                    await fsutil_1.fsutil.unlink(path.join(dest, file));
                }
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    console.error(`Failed to remove ${file}, ${err.message}`);
                }
            }
        }
    }
    let installInfo;
    const installInfoPath = `${bdsPath}${sep}installinfo.json`;
    async function readInstallInfo() {
        try {
            const file = await fsutil_1.fsutil.readFile(installInfoPath);
            installInfo = JSON.parse(file);
            if (installInfo == null)
                installInfo = {};
        }
        catch (err) {
            if (err.code !== 'ENOENT')
                throw err;
            installInfo = {};
        }
    }
    function saveInstallInfo() {
        return fsutil_1.fsutil.writeJson(installInfoPath, installInfo);
    }
    class InstallItem {
        constructor(opts) {
            this.opts = opts;
        }
        async _downloadAndUnzip() {
            const url = this.opts.url;
            const dest = path.join(this.opts.targetPath);
            const writedFiles = [];
            const zipfiledir = path.join(__dirname, 'zip');
            try {
                await fsutil_1.fsutil.del(zipfiledir);
            }
            catch (err) { }
            const bar = new ProgressBar(`${this.opts.name}: Install :bar :current/:total`, {
                total: 1,
                width: 20,
            });
            const dirhas = new Set();
            dirhas.add(dest);
            await new Promise((resolve, reject) => {
                follow_redirects_1.https.get(url, (response) => {
                    bar.total = +response.headers['content-length'];
                    if (response.statusCode !== 200) {
                        reject(new MessageError(`${this.opts.name}: ${response.statusCode} ${response.statusMessage}, Failed to download ${url}`));
                        return;
                    }
                    response.on('data', (data) => {
                        bar.tick(data.length);
                    });
                    const zip = response.pipe(unzipper.Parse());
                    zip.on('entry', async (entry) => {
                        let filepath = entry.path;
                        if (sep !== '/')
                            filepath = filepath.replace(/\//g, sep);
                        else
                            filepath = filepath.replace(/\\/g, sep);
                        if (!filepath.startsWith(sep)) {
                            filepath = sep + filepath;
                            entry.path = filepath;
                        }
                        else {
                            entry.path = filepath.substr(1);
                        }
                        writedFiles.push(filepath);
                        const extractPath = path.join(dest, entry.path);
                        if (entry.type === 'Directory') {
                            await fsutil_1.fsutil.mkdirRecursive(extractPath, dirhas);
                            entry.autodrain();
                            return;
                        }
                        if (this.opts.skipExists) {
                            const exists = await fsutil_1.fsutil.exists(path.join(dest, entry.path));
                            if (exists) {
                                (0, util_1.printOnProgress)(`Keep ${entry.path}`);
                                entry.autodrain();
                                return;
                            }
                        }
                        await fsutil_1.fsutil.mkdirRecursive(path.dirname(extractPath), dirhas);
                        entry.pipe(fs_ori.createWriteStream(extractPath)).on('error', reject);
                    }).on('finish', () => {
                        resolve();
                        bar.terminate();
                    }).on('error', reject);
                }).on('error', reject);
            });
            return writedFiles;
        }
        async _install() {
            const oldFiles = this.opts.oldFiles;
            if (oldFiles) {
                for (const oldfile of oldFiles) {
                    try {
                        await fsutil_1.fsutil.del(path.join(this.opts.targetPath, oldfile));
                    }
                    catch (err) {
                    }
                }
            }
            const preinstall = this.opts.preinstall;
            if (preinstall)
                await preinstall();
            const writedFiles = await this._downloadAndUnzip();
            installInfo[this.opts.key] = this.opts.version;
            const postinstall = this.opts.postinstall;
            if (postinstall)
                await postinstall(writedFiles);
        }
        async install() {
            await fsutil_1.fsutil.mkdir(this.opts.targetPath);
            const name = this.opts.name;
            const key = this.opts.key;
            if (installInfo[key] == null) {
                const keyFile = this.opts.keyFile;
                if (keyFile && await fsutil_1.fsutil.exists(path.join(this.opts.targetPath, keyFile))) {
                    if (await yesno(`${name}: Would you like to use what already installed?`)) {
                        installInfo[key] = 'manual';
                        console.log(`${name}: manual`);
                        return;
                    }
                }
                const confirm = this.opts.confirm;
                if (confirm)
                    await confirm();
                await this._install();
                console.log(`${name}: Installed successfully`);
            }
            else if (installInfo[key] === null || installInfo[key] === 'manual') {
                console.log(`${name}: manual`);
            }
            else if (installInfo[key] === this.opts.version) {
                console.log(`${name}: ${this.opts.version}`);
            }
            else {
                console.log(`${name}: Old (${installInfo[key]})`);
                console.log(`${name}: New (${this.opts.version})`);
                await this._install();
                console.log(`${name}: Updated`);
            }
        }
    }
    const bds = new InstallItem({
        name: 'BDS',
        version: BDS_VERSION,
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
            if (!ok)
                throw new MessageError("Canceled");
        },
        async preinstall() {
            if (installInfo.files) {
                await removeInstalled(bdsPath, installInfo.files);
            }
        },
        async postinstall(writedFiles) {
            installInfo.files = writedFiles.filter(file => !KEEPS.has(file));
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
    }
    catch (err) {
        if (err instanceof MessageError) {
            console.error(err.message);
        }
        else {
            console.error(err.stack);
        }
        await saveInstallInfo();
        return false;
    }
}
exports.installBDS = installBDS;
//# sourceMappingURL=installerapi.js.map