"use strict";
// fsutil.ts should be compatible with old node.js
// it's used by BDS installer
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsutil = void 0;
const fs = require("fs");
const path = require("path");
const os = require("os");
class DirentFromStat extends (fs.Dirent || class {
}) {
    constructor(name, stat) {
        super();
        this.stat = stat;
        this.name = name;
    }
    isFile() {
        return this.stat.isFile();
    }
    isDirectory() {
        return this.stat.isDirectory();
    }
    isBlockDevice() {
        return this.stat.isBlockDevice();
    }
    isCharacterDevice() {
        return this.stat.isCharacterDevice();
    }
    isSymbolicLink() {
        return this.stat.isSymbolicLink();
    }
    isFIFO() {
        return this.stat.isFIFO();
    }
    isSocket() {
        return this.stat.isSocket();
    }
}
function mkdirRaw(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, (err) => {
            if (err !== null) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
const EXT_REGEXP = /\.(?:js\.map|d\.ts|[^.]*)$/;
var fsutil;
(function (fsutil) {
    fsutil.projectPath = path.resolve(process.cwd(), process.argv[1]);
    /** @deprecated use fsutil.projectPath */
    function getProjectPath() {
        return fsutil.projectPath;
    }
    fsutil.getProjectPath = getProjectPath;
    /**
     * @param filepath any file path
     * @param extname contains dot
     * @returns
     */
    function replaceExt(filepath, extname) {
        const matched = EXT_REGEXP.exec(filepath);
        if (matched == null)
            return filepath + extname;
        const oldext = matched[0];
        return filepath.substr(0, filepath.length - oldext.length) + extname;
    }
    fsutil.replaceExt = replaceExt;
    function isDirectory(filepath) {
        return new Promise((resolve, reject) => {
            fs.stat(filepath, (err, stat) => {
                if (err !== null) {
                    if (err.code === 'ENOENT')
                        resolve(false);
                    else
                        reject(err);
                }
                else {
                    resolve(stat.isDirectory());
                }
            });
        });
    }
    fsutil.isDirectory = isDirectory;
    function isFile(filepath) {
        return new Promise((resolve, reject) => {
            fs.stat(filepath, (err, stat) => {
                if (err !== null) {
                    if (err.code === 'ENOENT')
                        resolve(false);
                    else
                        reject(err);
                }
                else {
                    resolve(stat.isFile());
                }
            });
        });
    }
    fsutil.isFile = isFile;
    function isDirectorySync(filepath) {
        try {
            return fs.statSync(filepath).isDirectory();
        }
        catch (err) {
            return false;
        }
    }
    fsutil.isDirectorySync = isDirectorySync;
    function isFileSync(filepath) {
        try {
            return fs.statSync(filepath).isFile();
        }
        catch (err) {
            return false;
        }
    }
    fsutil.isFileSync = isFileSync;
    function checkModified(ori, out) {
        return new Promise((resolve, reject) => {
            fs.stat(ori, (err, ostat) => {
                if (err !== null) {
                    reject(err);
                }
                else {
                    fs.stat(out, (err, nstat) => {
                        if (err !== null)
                            resolve(true);
                        else
                            resolve(ostat.mtimeMs >= nstat.mtimeMs);
                    });
                }
            });
        });
    }
    fsutil.checkModified = checkModified;
    function checkModifiedSync(ori, out) {
        const ostat = fs.statSync(ori);
        try {
            const nstat = fs.statSync(out);
            return ostat.mtimeMs >= nstat.mtimeMs;
        }
        catch (err) {
            return true;
        }
    }
    fsutil.checkModifiedSync = checkModifiedSync;
    function readFile(path, encoding) {
        if (encoding === undefined)
            encoding = 'utf-8';
        return new Promise((resolve, reject) => {
            fs.readFile(path, encoding, (err, data) => {
                if (err !== null)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }
    fsutil.readFile = readFile;
    function writeFile(path, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, (err) => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    fsutil.writeFile = writeFile;
    /**
     * uses system EOL and add a last line
     */
    function writeJson(path, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, JSON.stringify(content, null, 2).replace(/\n/g, os.EOL) + os.EOL, 'utf8', (err) => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    fsutil.writeJson = writeJson;
    /**
     * uses system EOL and add a last line
     */
    function writeJsonSync(path, content) {
        fs.writeFileSync(path, JSON.stringify(content, null, 2).replace(/\n/g, os.EOL) + os.EOL, 'utf8');
    }
    fsutil.writeJsonSync = writeJsonSync;
    function readdir(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, data) => {
                if (err !== null) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    fsutil.readdir = readdir;
    function readdirWithFileTypes(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, { withFileTypes: true }, (err, data) => {
                if (err !== null) {
                    if (err.code === 'ENOENT')
                        resolve([]);
                    else
                        reject(err);
                }
                else {
                    if (data.length !== 0 && typeof data[0] === 'string') {
                        (async () => {
                            const stats = [];
                            for (const d of data) {
                                const stat = await fsutil.stat(d);
                                stats.push(new DirentFromStat(d, stat));
                            }
                            resolve(stats);
                        })();
                    }
                    else {
                        resolve(data);
                    }
                }
            });
        });
    }
    fsutil.readdirWithFileTypes = readdirWithFileTypes;
    function mkdir(path) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, (err) => {
                if (err !== null) {
                    if (err.code === 'EEXIST')
                        resolve();
                    else
                        reject(err);
                }
                else
                    resolve();
            });
        });
    }
    fsutil.mkdir = mkdir;
    async function mkdirRecursive(dirpath, dirhas) {
        if (dirhas == null) {
            await mkdirRecursiveFromBack(dirpath);
            return;
        }
        if (dirhas.has(dirpath))
            return;
        await mkdirRecursive(path.dirname(dirpath), dirhas);
        await mkdir(dirpath);
    }
    fsutil.mkdirRecursive = mkdirRecursive;
    async function mkdirRecursiveFromBack(dir) {
        try {
            await mkdirRaw(dir);
            return false;
        }
        catch (err) {
            if (err.code === 'EEXIST') {
                return true;
            }
            else if (err.code === 'ENOENT') {
                await mkdirRecursiveFromBack(path.dirname(dir));
            }
            else {
                throw err;
            }
        }
        try {
            await mkdirRaw(dir);
        }
        catch (err) {
            if (err.code === 'EEXIST') {
                return true;
            }
            else {
                throw err;
            }
        }
        return false;
    }
    fsutil.mkdirRecursiveFromBack = mkdirRecursiveFromBack;
    function rmdir(path) {
        return new Promise((resolve, reject) => {
            fs.rmdir(path, (err) => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    fsutil.rmdir = rmdir;
    function stat(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, data) => {
                if (err !== null)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }
    fsutil.stat = stat;
    function lstat(path) {
        return new Promise((resolve, reject) => {
            fs.lstat(path, (err, data) => {
                if (err !== null)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }
    fsutil.lstat = lstat;
    function utimes(path, atime, mtime) {
        return new Promise((resolve, reject) => {
            fs.utimes(path, atime, mtime, err => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    fsutil.utimes = utimes;
    function unlink(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    fsutil.unlink = unlink;
    async function copyFile(from, to) {
        if (fs.copyFile != null) {
            return new Promise((resolve, reject) => fs.copyFile(from, to, err => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            }));
        }
        else {
            return new Promise((resolve, reject) => {
                const rd = fs.createReadStream(from);
                rd.on("error", reject);
                const wr = fs.createWriteStream(to);
                wr.on("error", reject);
                wr.on("close", () => {
                    resolve();
                });
                rd.pipe(wr);
            });
        }
    }
    fsutil.copyFile = copyFile;
    async function isModified(from, to) {
        const fromstatsProm = stat(from);
        const tostatsProm = stat(to);
        tostatsProm.catch();
        const fromstats = await fromstatsProm;
        try {
            const tostats = await tostatsProm;
            return +fromstats.mtime > +tostats.mtime;
        }
        catch (err) {
            if (err.code === 'ENOENT')
                return true;
            throw err;
        }
    }
    fsutil.isModified = isModified;
    async function exists(path) {
        try {
            await stat(path);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    fsutil.exists = exists;
    async function del(filepath) {
        const s = await stat(filepath);
        if (s.isDirectory()) {
            const files = await readdir(filepath);
            for (const file of files) {
                await del(path.join(filepath, file));
            }
            await rmdir(filepath);
        }
        else {
            await unlink(filepath);
        }
    }
    fsutil.del = del;
    function unlinkQuiet(path) {
        return new Promise(resolve => {
            fs.unlink(path, () => resolve());
        });
    }
    fsutil.unlinkQuiet = unlinkQuiet;
    function symlink(target, path, type) {
        return new Promise((resolve, reject) => {
            fs.symlink(target, path, type, err => {
                if (err !== null)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    fsutil.symlink = symlink;
    class DirectoryMaker {
        constructor() {
            this.dirhas = new Set();
        }
        async make(pathname) {
            const resolved = path.resolve(pathname);
            if (this.dirhas.has(resolved))
                return;
            await mkdirRecursive(resolved, this.dirhas);
            this.dirhas.add(resolved);
        }
        del(pathname) {
            const resolved = path.resolve(pathname);
            for (const dir of this.dirhas) {
                if (dir.startsWith(resolved)) {
                    if (dir.length === resolved.length || dir.charAt(resolved.length) === path.sep) {
                        this.dirhas.delete(dir);
                    }
                }
            }
        }
    }
    fsutil.DirectoryMaker = DirectoryMaker;
})(fsutil = exports.fsutil || (exports.fsutil = {}));
//# sourceMappingURL=fsutil.js.map