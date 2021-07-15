
// fsutil.ts should be compatible with old node.js
// it's used by BDS installer

import fs = require('fs');
import path = require('path');
import os = require('os');

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

export namespace fsutil {
    export const projectPath = path.resolve(process.cwd(), process.argv[1]);

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
        if (dirhas != null && dirhas.has(dirpath)) return;
        await mkdirRecursive(path.dirname(dirpath), dirhas);
        await mkdir(dirpath);
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
    export function unlinkQuiet(path:string):Promise<void> {
        return new Promise(resolve=>{
            fs.unlink(path, ()=>resolve());
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
