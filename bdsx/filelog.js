"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLog = void 0;
const fs = require("fs");
const path = require("path");
const util_1 = require("./util");
class FileLog {
    constructor(filepath) {
        this.appending = '';
        this.flushing = false;
        this.path = path.resolve(filepath);
    }
    _flush() {
        fs.appendFile(this.path, this.appending, () => {
            if (this.appending !== '') {
                this._flush();
            }
            else {
                this.flushing = false;
            }
        });
        this.appending = '';
    }
    log(...message) {
        this.appending += message.map(util_1.anyToString).join(' ');
        if (!this.flushing) {
            this.flushing = true;
            this._flush();
        }
    }
}
exports.FileLog = FileLog;
//# sourceMappingURL=filelog.js.map