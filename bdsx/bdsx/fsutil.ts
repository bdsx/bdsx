
// fsutil.ts should be compatible with old node.js
// it's used by BDS installer

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { BufferWriter } from './writer/bufferstream';

class DirentFromStat extends (fs.Dirent || class{}) {
    constructor(name:string, private readonly stat:fs.Stats) {
        super();
        this.name = name;
    }

    isFile(): boolean {
        return this.stat.isFile();
    }
    isDirectory(): boolean{
        return this.stat.isDirectory();
    }
    isBlockDevice(): boolean{
        return this.stat.isBlockDevice();
    }
    isCharacterDevice(): boolean{
        return this.stat.isCharacterDevice();
    }
    isSymbolicLink(): boolean{
        return this.stat.isSymbolicLink();
    }
    isFIFO(): boolean{
        return this.stat.isFIFO();
    }
    isSocket(): boolean{
        return this.stat.isSocket();
    }
}

function mkdirRaw(path:string):Promise<void> {
    return new Promise((resolve, reject)=>{
        fs.mkdir(path, (err)=>{
            if (err !== null) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
async function mkdirRecursiveWithDirSet(dirpath:string, dirhas:Set<string>):Promise<void> {
    if (dirhas.has(dirpath)) return;
    const parent = path.dirname(dirpath);
    if (parent === dirpath) return;
    await mkdirRecursiveWithDirSet(parent, dirhas);
    await fsutil.mkdir(dirpath);
}

export namespace fsutil {
    let dirname = path.dirname(__dirname);
    const dirparsed = path.parse(dirname);
    if (dirparsed.base === 'node_modules') {
        // bypass the issue on Wine & BDSX
        // Wine & node cannot resolve the linked module path.
        dirname = dirparsed.dir;
    }

    export const projectPath = dirname;

    /** @deprecated use fsutil.projectPath */
    export function getProjectPath():string {
        return projectPath;
    }

    export function isDirectory(filepath:string):Promise<boolean> {
        return new Promise((resolve, reject)=>{
            fs.stat(filepath, (err, stat)=>{
                if (err !== null) {
                    if (err.code === 'ENOENT') resolve(false);
                    else reject(err);
                } else {
                    resolve(stat.isDirectory());
                }
            });
        });
    }
    export function isFile(filepath:string):Promise<boolean> {
        return new Promise((resolve, reject)=>{
            fs.stat(filepath, (err, stat)=>{
                if (err !== null) {
                    if (err.code === 'ENOENT') resolve(false);
                    else reject(err);
                } else {
                    resolve(stat.isFile());
                }
            });
        });
    }
    export function isDirectorySync(filepath:string):boolean {
        try {
            return fs.statSync(filepath).isDirectory();
        } catch (err) {
            return false;
        }
    }
    export function isFileSync(filepath:string):boolean {
        try {
            return fs.statSync(filepath).isFile();
        } catch (err) {
            return false;
        }
    }
    export function checkModified(ori:string, out:string):Promise<boolean>{
        return new Promise((resolve, reject)=>{
            fs.stat(ori, (err, ostat)=>{
                if (err !== null) {
                    reject(err);
                } else {
                    fs.stat(out, (err, nstat)=>{
                        if (err !== null) resolve(true);
                        else resolve(ostat.mtimeMs >= nstat.mtimeMs);
                    });
                }
            });
        });
    }
    export function checkModifiedSync(ori:string, out:string):boolean{
        const ostat = fs.statSync(ori);

        try{
            const nstat = fs.statSync(out);
            return ostat.mtimeMs >= nstat.mtimeMs;
        } catch (err){
            return true;
        }
    }
    export function readFile(path:string):Promise<string>;
    export function readFile(path:string, encoding:null):Promise<Buffer>;
    export function readFile(path:string, encoding:string):Promise<string>;

    export function readFile(path:string, encoding?:string|null):Promise<string|Buffer> {
        if (encoding === undefined) encoding = 'utf-8';
        return new Promise((resolve, reject)=>{
            fs.readFile(path, encoding, (err, data)=>{
                if (err !== null) reject(err);
                else resolve(data);
            });
        });
    }
    export function writeFile(path:string, content:string|Uint8Array):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.writeFile(path, content, (err)=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    export function appendFile(path:string, content:string|Uint8Array):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.appendFile(path, content, (err)=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    /**
     * uses system EOL and add a last line
     */
    export function writeJson(path:string, content:unknown):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.writeFile(path, JSON.stringify(content, null, 2).replace(/\n/g, os.EOL)+os.EOL, 'utf8', (err)=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    /**
     * uses system EOL and add a last line
     */
    export function writeJsonSync(path:string, content:unknown):void {
        fs.writeFileSync(path, JSON.stringify(content, null, 2).replace(/\n/g, os.EOL)+os.EOL, 'utf8');
    }
    export function readdir(path:string):Promise<string[]> {
        return new Promise((resolve, reject)=>{
            fs.readdir(path, (err, data)=>{
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    export function readdirWithFileTypes(path:string):Promise<fs.Dirent[]> {
        return new Promise((resolve, reject)=>{
            fs.readdir(path, {withFileTypes: true}, (err, data)=>{
                if (err !== null) {
                    if (err.code === 'ENOENT') resolve([]);
                    else reject(err);
                } else {
                    if (data.length !== 0 && typeof data[0] === 'string') {
                        (async()=>{
                            const stats:fs.Dirent[] = [];
                            for (const d of data) {
                                const stat = await fsutil.stat(d as any);
                                stats.push(new DirentFromStat(d as any, stat));
                            }
                            resolve(stats);
                        })();
                    } else {
                        resolve(data);
                    }
                }
            });
        });
    }
    export function readdirWithFileTypesSync(path:string):fs.Dirent[] {
        const data = fs.readdirSync(path, {withFileTypes: true});
        if (data.length !== 0 && typeof data[0] === 'string') {
            const stats:fs.Dirent[] = [];
            for (const d of data) {
                const stat = fs.statSync(d as any);
                stats.push(new DirentFromStat(d as any, stat));
            }
            return stats;
        } else {
            return data;
        }
    }
    export function opendir(path:string):Promise<fs.Dir> {
        return new Promise((resolve, reject)=>{
            fs.opendir(path, (err, dir)=>{
                if (err !== null) reject(err);
                else resolve(dir);
            });
        });
    }
    export function mkdir(path:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.mkdir(path, (err)=>{
                if (err !== null) {
                    if (err.code === 'EEXIST') resolve();
                    else reject(err);
                } else resolve();
            });
        });
    }
    export async function mkdirRecursive(dirpath:string, dirhas?:Set<string>):Promise<void> {
        if (dirhas == null) {
            await mkdirRecursiveFromBack(dirpath);
            return;
        }
        await mkdirRecursiveWithDirSet(dirpath, dirhas);
    }
    export async function mkdirRecursiveFromBack(dir:string):Promise<boolean> {
        try {
            await mkdirRaw(dir);
            return false;
        } catch (err) {
            if (err.code === 'EEXIST') {
                return true;
            } else if (['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) !== -1) {
                throw err;
            }
        }
        await mkdirRecursiveFromBack(path.dirname(dir));
        try {
            await mkdirRaw(dir);
        } catch (err) {
            if (err.code === 'EEXIST') {
                return true;
            } else {
                throw err;
            }
        }
        return false;
    }
    export function rmdir(path:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.rmdir(path, (err)=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    export function stat(path:string):Promise<fs.Stats> {
        return new Promise((resolve, reject)=>{
            fs.stat(path, (err, data)=>{
                if (err !== null) reject(err);
                else resolve(data);
            });
        });
    }
    export function lstat(path:string):Promise<fs.Stats> {
        return new Promise((resolve, reject)=>{
            fs.lstat(path, (err, data)=>{
                if (err !== null) reject(err);
                else resolve(data);
            });
        });
    }
    export function utimes(path:string, atime:string|number|Date, mtime:string|number|Date):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.utimes(path, atime, mtime, err=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    export function unlink(path:string):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.unlink(path, (err)=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    export async function unlinkRecursive(filepath:string):Promise<void> {
        async function unlinkDir(filepath:string):Promise<void> {
            const files = await readdirWithFileTypes(filepath);
            for (const stat of files) {
                const childpath = filepath+path.sep+stat.name;
                if (stat.isDirectory()) {
                    await unlinkDir(childpath);
                } else {
                    await unlink(childpath);
                }
            }
        }
        async function unlinkAny(stat:{isDirectory():boolean, isFile():boolean}, childpath:string):Promise<void> {
            if (stat.isDirectory()) {
                await unlinkDir(childpath);
            } else if (stat.isFile()) {
                await unlink(childpath);
            }
        }
        const st = await stat(filepath);
        await unlinkAny(st, filepath);
    }
    export function unlinkRecursiveSync(filepath:string):void {
        function unlinkDir(filepath:string):void {
            const files = readdirWithFileTypesSync(filepath);
            for (const stat of files) {
                const childpath = filepath+path.sep+stat.name;
                if (stat.isDirectory()) {
                    unlinkDir(childpath);
                } else {
                    unlink(childpath);
                }
            }
        }
        function unlinkAny(stat:{isDirectory():boolean, isFile():boolean}, childpath:string):void {
            if (stat.isDirectory()) {
                unlinkDir(childpath);
            } else if (stat.isFile()) {
                unlink(childpath);
            }
        }
        const st = fs.statSync(filepath);
        unlinkAny(st, filepath);
    }
    export function copyFile(from:string, to:string):Promise<void> {
        if (fs.copyFile != null) {
            return new Promise((resolve, reject)=>fs.copyFile(from, to, err=>{
                if (err !== null) reject(err);
                else resolve();
            }));
        } else {
            return new Promise((resolve, reject)=>{
                const rd = fs.createReadStream(from);
                rd.on("error", reject);
                const wr = fs.createWriteStream(to);
                wr.on("error", reject);
                wr.on("close", ()=>{
                    resolve();
                });
                rd.pipe(wr);
            });
        }
    }
    export async function exists(path:string):Promise<boolean> {
        try {
            await stat(path);
            return true;
        } catch (err) {
            return false;
        }
    }
    export async function del(filepath:string):Promise<void> {
        const s = await stat(filepath);
        if (s.isDirectory()) {
            const files = await readdir(filepath);
            for (const file of files) {
                await del(path.join(filepath, file));
            }
            await rmdir(filepath);
        } else {
            await unlink(filepath);
        }
    }
    export function unlinkQuiet(path:string):Promise<boolean> {
        return new Promise(resolve=>{
            fs.unlink(path, err=>resolve(err !== null));
        });
    }
    export function symlink(target:string, path:string, type?:fs.symlink.Type):Promise<void> {
        return new Promise((resolve, reject)=>{
            fs.symlink(target, path, type, err=>{
                if (err !== null) reject(err);
                else resolve();
            });
        });
    }
    export function readFirstLineSync(path:string):string {
        const fd = fs.openSync(path, 'r');
        const BUF_SIZE = 4*1024;
        const writer = new BufferWriter(new Uint8Array(BUF_SIZE), 0);
        for (;;) {
            const off = writer.size;
            writer.resize(off + BUF_SIZE);
            const readlen = fs.readSync(fd, writer.array, off, BUF_SIZE, null);
            writer.size = off + readlen;

            const buf = writer.buffer();
            let idx:number;
            if (readlen !== 0) {
                idx = buf.indexOf(0x0a, off); // ASCII of \n
                if (idx === -1) continue;
                if (writer.array[idx-1] === 0xd) { // ASCII of \r
                    idx --;
                }
            } else {
                idx = buf.length;
            }
            fs.closeSync(fd);

            return Buffer.from(buf.buffer, buf.byteOffset, idx).toString();
        }
    }
    export function rename(oldPath:string, newPath:string):Promise<void> {
        return new Promise<void>((resolve, reject)=>fs.rename(oldPath, newPath, err=>{
            if (err !== null) reject(err);
            else resolve();
        }));
    }

    export class DirectoryMaker {
        public readonly dirhas = new Set<string>();

        async make(pathname:string):Promise<void> {
            const resolved = path.resolve(pathname);
            if (this.dirhas.has(resolved)) return;
            await mkdirRecursive(resolved, this.dirhas);
            this.dirhas.add(resolved);
        }

        del(pathname:string):void {
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
}
