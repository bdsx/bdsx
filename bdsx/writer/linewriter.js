"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLineWriter = exports.StringLineWriter = exports.LineWriter = void 0;
const fs = require("fs");
class LineWriter {
    constructor() {
        this.len = 0;
        this._tab = '';
        this.tabbed = false;
        this.eol = '\r\n';
        this.tabSize = 4;
    }
    lineBreakIfLong(sep) {
        if (this.len >= 300) {
            this._write(sep.trimRight());
            this.lineBreak();
        }
        else {
            this._write(sep);
        }
    }
    lineBreak() {
        this._write(this.eol);
        this.tabbed = false;
        this.len = 0;
    }
    write(value) {
        if (!this.tabbed) {
            this.tabbed = true;
            this._write(this._tab);
        }
        this.len += value.length;
        this._write(value);
    }
    writeln(line) {
        this.write(line);
        this.lineBreak();
    }
    *join(params, glue, linePerComponent) {
        const iter = params[Symbol.iterator]();
        let v = iter.next();
        if (linePerComponent) {
            this.lineBreak();
        }
        this.tab();
        if (!v.done) {
            yield v.value;
            while (!(v = iter.next()).done) {
                if (linePerComponent) {
                    this._write(glue.trimRight());
                    this.lineBreak();
                }
                else {
                    this.lineBreakIfLong(glue);
                }
                yield v.value;
            }
        }
        this.detab();
    }
    tab() {
        this._tab += ' '.repeat(this.tabSize);
    }
    detab() {
        this._tab = this._tab.substr(0, this._tab.length - this.tabSize);
    }
    static generateWarningComment(generatorName, instead) {
        const out = [];
        if (generatorName != null)
            out.push(`Generated with ${generatorName}.`);
        else
            out.push(`Generated script.`);
        out.push(`Please DO NOT modify this directly.`);
        if (instead != null) {
            out.push(`If it's needed to update, Modify ${instead} instead`);
        }
        return out;
    }
    generateWarningComment(generatorName, instead) {
        this.writeln('/**');
        for (const line of LineWriter.generateWarningComment(generatorName, instead)) {
            this.writeln(' * ' + line);
        }
        this.writeln(' */');
    }
}
exports.LineWriter = LineWriter;
class StringLineWriter extends LineWriter {
    constructor() {
        super(...arguments);
        this.result = '';
    }
    _write(content) {
        this.result += content;
    }
}
exports.StringLineWriter = StringLineWriter;
class FileLineWriter extends LineWriter {
    constructor(fd) {
        super();
        this.fd = fd;
    }
    _write(value) {
        fs.writeSync(this.fd, value);
    }
}
exports.FileLineWriter = FileLineWriter;
//# sourceMappingURL=linewriter.js.map