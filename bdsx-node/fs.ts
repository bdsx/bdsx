
import native = require("./native");

import NativeFile = native.NativeFile;

export const readFileSync = native.fs.readUtf8FileSync;
export const writeFileSync = native.fs.writeUtf8FileSync;
export const cwd = native.fs.cwd;
export const chdir = native.fs.chdir;

export function writeFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = new NativeFile(path, NativeFile.WRITE, NativeFile.CREATE_ALWAYS);
        file.writeUtf8(0, content, err => {
            if (err) reject(err);
            else resolve();
        });
        file.close();
    });
}

export function readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const file = new NativeFile(path, NativeFile.READ, NativeFile.OPEN_EXISTING);
        let out = '';
        function onread(err, buffer): void {
            if (err) {
                file.close();
                return reject(err);
            }
            out += buffer;
            if (buffer.length == 0) {
                file.close();
                resolve(out);
            }
            else {
                file.readUtf8(out.length, 8192, onread);
            }
        }
        file.readUtf8(0, 8192, onread);
    });
}

