"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWriter = void 0;
const fs = require("fs");
const fsutil_1 = require("../fsutil");
class FileWriter {
    constructor(path) {
        this.path = path;
        this.ws = fs.createWriteStream(path, 'utf-8');
        this.errprom = new Promise((resolve, reject) => {
            this.ws.on('error', reject);
        });
    }
    write(data) {
        return Promise.race([
            new Promise(resolve => {
                if (!this.ws.write(data)) {
                    this.ws.once('drain', resolve);
                }
                else {
                    resolve();
                }
            }), this.errprom
        ]);
    }
    end() {
        return Promise.race([
            new Promise((resolve) => {
                this.ws.end(resolve);
            }), this.errprom
        ]);
    }
    copyTo(path) {
        return fsutil_1.fsutil.copyFile(this.path, path);
    }
}
exports.FileWriter = FileWriter;
//# sourceMappingURL=filewriter.js.map