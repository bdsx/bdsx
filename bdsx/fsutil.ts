
import fs = require('fs');

export namespace fsutil {
    export async function isDirectory(file:string):Promise<boolean> {
        try {
            return (await fs.promises.stat(file)).isDirectory();
        } catch (err) {
            return false;
        }
    }
    export async function isFile(filepath:string):Promise<boolean> {
        try {
            return (await fs.promises.stat(filepath)).isFile();
        } catch (err) {
            return false;
        }
    }
    export function isDirectorySync(file:string):boolean {
        try {
            return fs.statSync(file).isDirectory();
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

    export async function checkModified(ori:string, out:string):Promise<boolean>{
        const ostat = await fs.promises.stat(ori);

        try{
            const nstat = await fs.promises.stat(out);
            return ostat.mtimeMs >= nstat.mtimeMs;
        } catch (err){
            return true;
        }
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
}
