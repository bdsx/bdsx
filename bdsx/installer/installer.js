'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_ori = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const readline = require("readline");
const ProgressBar = require("progress");
const follow_redirects_1 = require("follow-redirects");
const version = require("../version.json");
const sep = path.sep;
const BDS_VERSION = '1.16.201.02';
const BDS_LINK = `https://minecraft.azureedge.net/bin-win/bedrock-server-${BDS_VERSION}.zip`;
const BDSX_CORE_VERSION = version.coreVersion;
const BDSX_CORE_LINK = `https://github.com/bdsx/bdsx-core/releases/download/${BDSX_CORE_VERSION}/bdsx-core-${BDSX_CORE_VERSION}.zip`;
function yesno(question, defaultValue) {
    const yesValues = ['yes', 'y'];
    const noValues = ['no', 'n'];
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve => {
        rl.question(question + ' ', (answer) => __awaiter(this, void 0, void 0, function* () {
            rl.close();
            const cleaned = answer.trim().toLowerCase();
            if (cleaned == '' && defaultValue !== undefined)
                return resolve(defaultValue);
            if (yesValues.indexOf(cleaned) >= 0)
                return resolve(true);
            if (noValues.indexOf(cleaned) >= 0)
                return resolve(false);
            process.stdout.write('\nInvalid Response.\n');
            process.stdout.write('Answer either yes : (' + yesValues.join(', ') + ') \n');
            process.stdout.write('Or no: (' + noValues.join(', ') + ') \n\n');
            resolve(yesno(question, defaultValue));
        }));
    });
}
const fs = {
    readFile(path) {
        return new Promise((resolve, reject) => {
            fs_ori.readFile(path, 'utf-8', (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    },
    writeFile(path, content) {
        return new Promise((resolve, reject) => {
            fs_ori.writeFile(path, content, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    readdir(path) {
        return new Promise((resolve, reject) => {
            fs_ori.readdir(path, 'utf-8', (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    },
    mkdir(path) {
        return new Promise((resolve, reject) => {
            fs_ori.mkdir(path, (err) => {
                if (err) {
                    if (err.code === 'EEXIST')
                        resolve();
                    else
                        reject(err);
                }
                else
                    resolve();
            });
        });
    },
    _processMkdirError(dirname, err) {
        if (err.code === 'EEXIST') {
            return true;
        }
        if (err.code === 'ENOENT') {
            throw new Error(`EACCES: permission denied, mkdir '${dirname}'`);
        }
        return false;
    },
    rmdir(path) {
        return new Promise((resolve, reject) => {
            fs_ori.rmdir(path, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    stat(path) {
        return new Promise((resolve, reject) => {
            fs_ori.stat(path, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    },
    unlink(path) {
        return new Promise((resolve, reject) => {
            fs_ori.unlink(path, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    },
    copyFile(from, to) {
        return new Promise((resolve, reject) => {
            const rd = fs_ori.createReadStream(from);
            rd.on("error", reject);
            const wr = fs_ori.createWriteStream(to);
            wr.on("error", reject);
            wr.on("close", () => {
                resolve();
            });
            rd.pipe(wr);
        });
    },
    exists(path) {
        return fs.stat(path).then(() => true, () => false);
    },
    del(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield fs.stat(filepath);
            if (stat.isDirectory()) {
                const files = yield fs.readdir(filepath);
                for (const file of files) {
                    yield fs.del(path.join(filepath, file));
                }
                yield fs.rmdir(filepath);
            }
            else {
                yield fs.unlink(filepath);
            }
        });
    }
};
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
function removeInstalled(dest, files) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = files.length - 1; i >= 0; i--) {
            try {
                const file = files[i];
                if (file.endsWith(sep)) {
                    yield fs.rmdir(path.join(dest, file.substr(0, file.length - 1)));
                }
                else {
                    yield fs.unlink(path.join(dest, file));
                }
            }
            catch (err) {
            }
        }
    });
}
let installInfo;
const bdsPath = process.argv[2];
const agree = process.argv[3] === '-y';
const installInfoPath = `${bdsPath}${sep}installinfo.json`;
function readInstallInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = yield fs.readFile(installInfoPath);
            installInfo = JSON.parse(file);
            if (!installInfo)
                installInfo = {};
        }
        catch (err) {
            if (err.code !== 'ENOENT')
                throw err;
            installInfo = {};
        }
    });
}
function saveInstallInfo() {
    return fs.writeFile(installInfoPath, JSON.stringify(installInfo, null, 4));
}
class InstallItem {
    constructor(opts) {
        this.opts = opts;
    }
    _downloadAndUnzip() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.opts.url;
            const dest = path.join(this.opts.targetPath);
            const writedFiles = [];
            const zipfiledir = path.join(__dirname, 'zip');
            try {
                yield fs.del(zipfiledir);
            }
            catch (err) { }
            const bar = new ProgressBar(`${this.opts.name}: Install :bar :current/:total`, {
                total: 1,
                width: 20,
            });
            const dirhas = new Set();
            dirhas.add(dest);
            function mkdirRecursive(dirpath) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (dirhas.has(dirpath))
                        return;
                    yield mkdirRecursive(path.dirname(dirpath));
                    yield fs.mkdir(dirpath);
                });
            }
            yield new Promise((resolve, reject) => {
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
                    zip.on('entry', (entry) => __awaiter(this, void 0, void 0, function* () {
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
                        if (entry.type == 'Directory') {
                            yield mkdirRecursive(extractPath);
                            entry.autodrain();
                            return;
                        }
                        if (this.opts.skipExists) {
                            const exists = yield fs.exists(path.join(dest, entry.path));
                            if (exists) {
                                entry.autodrain();
                                return;
                            }
                        }
                        yield mkdirRecursive(path.dirname(extractPath));
                        entry.pipe(fs_ori.createWriteStream(extractPath)).on('error', reject);
                    })).on('finish', resolve).on('error', reject);
                }).on('error', reject);
            });
            return writedFiles;
        });
    }
    _install() {
        return __awaiter(this, void 0, void 0, function* () {
            const oldFiles = this.opts.oldFiles;
            if (oldFiles) {
                for (const oldfile of oldFiles) {
                    try {
                        yield fs.del(path.join(this.opts.targetPath, oldfile));
                    }
                    catch (err) {
                    }
                }
            }
            const preinstall = this.opts.preinstall;
            if (preinstall)
                yield preinstall();
            const writedFiles = yield this._downloadAndUnzip();
            installInfo[this.opts.key] = this.opts.version;
            const postinstall = this.opts.postinstall;
            if (postinstall)
                yield postinstall(writedFiles);
        });
    }
    install() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.mkdir(this.opts.targetPath);
            const name = this.opts.name;
            const key = this.opts.key;
            if (installInfo[key] === undefined) {
                const keyFile = this.opts.keyFile;
                if (keyFile && (yield fs.exists(path.join(this.opts.targetPath, keyFile)))) {
                    if (yield yesno(`${name}: Would you like to use what already installed?`)) {
                        installInfo[key] = 'manual';
                        console.log(`${name}: manual`);
                        return;
                    }
                }
                const confirm = this.opts.confirm;
                if (confirm)
                    yield confirm();
                yield this._install();
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
                yield this._install();
                console.log(`${name}: Updated`);
            }
        });
    }
}
const bds = new InstallItem({
    name: 'BDS',
    version: BDS_VERSION,
    url: BDS_LINK,
    targetPath: bdsPath,
    key: 'bdsVersion',
    keyFile: 'bedrock_server.exe',
    confirm() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`It will download and install Bedrock Dedicated Server to '${path.resolve(bdsPath)}'`);
            console.log(`BDS Version: ${BDS_VERSION}`);
            console.log(`Minecraft End User License Agreement: https://account.mojang.com/terms`);
            console.log(`Privacy Policy: https://go.microsoft.com/fwlink/?LinkId=521839`);
            if (!agree) {
                const ok = yield yesno("Would you like to agree it?(Y/n)");
                if (!ok)
                    throw new MessageError("Canceled");
            }
            else {
                console.log("Agreed by -y");
            }
        });
    },
    preinstall() {
        return __awaiter(this, void 0, void 0, function* () {
            if (installInfo.files) {
                yield removeInstalled(bdsPath, installInfo.files);
            }
        });
    },
    postinstall(writedFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            installInfo.files = writedFiles.filter(file => !KEEPS.has(file));
            ;
        });
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield readInstallInfo();
        yield bds.install();
        yield bdsxCore.install();
        yield saveInstallInfo();
    }
    catch (err) {
        if (err instanceof MessageError) {
            console.error(err.message);
        }
        else {
            console.error(err.stack);
        }
        yield saveInstallInfo();
        process.exit(-1);
    }
}))();
//# sourceMappingURL=installer.js.map