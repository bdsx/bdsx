
import chakraX = require("./chakraX");

import NativeFile = chakraX.NativeFile;

export function writeFile(path: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = new NativeFile(path, NativeFile.WRITE, NativeFile.CREATE_ALWAYS);
        file.write(0, content, err => {
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
        function onread(err, buffer):void {
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
                file.read(out.length, 8192, onread, false);
            }
        }
        file.read(0, 8192, onread, false);
    });
}



