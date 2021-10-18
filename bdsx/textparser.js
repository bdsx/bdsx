"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsingErrorContainer = exports.ParsingError = exports.ErrorPosition = exports.TextLineParser = exports.LanguageParser = exports.TextParser = void 0;
const colors = require("colors");
const util_1 = require("./util");
const SPACE_REG = /^([\s\uFEFF\xA0]*)(.*[^\s\uFEFF\xA0])[\s\uFEFF\xA0]*$/;
const DEFAULT_SEPERATOR = "[!@#%^&*()+-=`~[]{};\\':\",./<>?]";
const NONSPACE = /[^\s\uFEFF\xA0]/g;
const SPACES = ' \t\r\n\uFEFF\xa0';
class TextParser {
    constructor(context) {
        this.context = context;
        this.i = 0;
    }
    getFrom(from) {
        return this.context.substring(from, this.i);
    }
    eof() {
        return this.i >= this.context.length;
    }
    peek() {
        return this.context.charAt(this.i);
    }
    endsWith(str) {
        return this.context.endsWith(str, this.i);
    }
    nextIf(str) {
        if (!this.context.startsWith(str, this.i))
            return false;
        this.i += str.length;
        return true;
    }
    skipSpaces() {
        NONSPACE.lastIndex = this.i;
        const res = NONSPACE.exec(this.context);
        if (res === null) {
            this.i = this.context.length;
        }
        else {
            this.i = res.index;
        }
    }
}
exports.TextParser = TextParser;
class LanguageParser extends TextParser {
    constructor(context, seperators = DEFAULT_SEPERATOR) {
        super(context);
        this.seperators = seperators;
        const slashed = this.seperators.replace(/[\]\\-]/g, match => '\\' + match);
        this.seperatorsSet = (0, util_1.str2set)(this.seperators + SPACES);
        this.regexpReadToOperator = new RegExp('[' + slashed + SPACES + ']', 'g');
    }
    unget(str) {
        this.i = this.context.lastIndexOf(str, this.i - 1);
        if (this.i === -1)
            throw Error(`${str} not found in '${this.context}'`);
    }
    readIdentifier() {
        this.skipSpaces();
        const from = this.i;
        if (from >= this.context.length)
            return null;
        const regexp = this.regexpReadToOperator;
        regexp.lastIndex = from;
        const res = regexp.exec(this.context);
        if (res === null) {
            this.i = this.context.length;
        }
        else {
            this.i = res.index;
        }
        if (from === this.i)
            return null;
        return this.context.substring(from, this.i);
    }
    readOperator(operators) {
        this.skipSpaces();
        const from = this.i;
        if (from >= this.context.length)
            return null;
        let out = '';
        for (;;) {
            const code = this.context.charCodeAt(this.i);
            if (!this.seperatorsSet.has(code))
                break;
            out += String.fromCharCode(code);
            if (out.length !== 1 && !operators.has(out))
                break;
            this.i++;
        }
        return this.context.substring(from, this.i);
    }
    readTo(needle) {
        const context = this.context;
        const idx = context.indexOf(needle, this.i);
        const matched = (idx === -1 ? context.substr(this.i) : context.substring(this.i, idx)).trim();
        this.i = idx === -1 ? context.length : idx + 1;
        return matched;
    }
    readAll() {
        return this.context.substr(this.i).trim();
    }
}
exports.LanguageParser = LanguageParser;
class TextLineParser extends TextParser {
    constructor(context, lineNumber, offset = 0) {
        super(context);
        this.lineNumber = lineNumber;
        this.offset = offset;
        this.matchedIndex = 0;
        this.matchedWidth = context.length;
    }
    static prespace(text) {
        return text.match(/^[\s\uFEFF\xA0]*/)[0].length;
    }
    static trim(context) {
        const matched = SPACE_REG.exec(context);
        if (matched === null)
            return ['', 0, context.length];
        const res = matched[2];
        return [res, matched[1].length, res.length];
    }
    readQuotedStringTo(chr) {
        let p = this.i + 1;
        for (;;) {
            const np = this.context.indexOf(chr, p);
            if (np === -1) {
                this.matchedIndex = this.i + this.offset;
                this.matchedWidth = 1;
                throw this.error('qouted string does not end');
            }
            let count = 0;
            p = np;
            for (;;) {
                const chr = this.context.charAt(--p);
                if (chr === '\\') {
                    count++;
                    continue;
                }
                break;
            }
            if ((count & 1) === 0) {
                const out = this.context.substring(this.i - 1, np + 1);
                this.matchedIndex = this.i + this.offset;
                this.matchedWidth = out.length;
                this.i = np + 1;
                try {
                    return JSON.parse(out);
                }
                catch (err) {
                    throw this.error(err.message);
                }
            }
            p = np + 1;
        }
    }
    readQuotedString() {
        this.skipSpaces();
        const chr = this.context.charAt(this.i);
        if (chr !== '"' && chr !== "'")
            return null;
        return this.readQuotedStringTo(chr);
    }
    readToSpace() {
        const context = this.context;
        const spaceMatch = /[\s\uFEFF\xA0]+/g;
        spaceMatch.lastIndex = this.i;
        for (;;) {
            const res = spaceMatch.exec(context);
            let content;
            this.matchedIndex = this.i + this.offset;
            if (res === null) {
                content = context.substr(this.i);
                this.matchedWidth = content.length;
                this.i = this.context.length;
            }
            else {
                if (res.index === 0) {
                    this.i = spaceMatch.lastIndex;
                    continue;
                }
                content = context.substring(this.i, res.index);
                this.matchedWidth = content.length;
                this.i = spaceMatch.lastIndex;
            }
            return content;
        }
    }
    *splitWithSpaces() {
        const context = this.context;
        if (this.i >= context.length)
            return;
        const oriindex = this.matchedIndex;
        const offset = this.offset;
        const spaceMatch = /[\s\uFEFF\xA0]+/g;
        spaceMatch.lastIndex = this.i;
        for (;;) {
            const res = spaceMatch.exec(context);
            let content;
            if (res === null) {
                content = context.substr(this.i);
            }
            else {
                if (res.index === 0) {
                    this.i = spaceMatch.lastIndex;
                    continue;
                }
                content = context.substring(this.i, res.index);
            }
            this.offset = this.matchedIndex = this.i + offset;
            this.matchedWidth = content.length;
            this.i = 0;
            yield this.context = content;
            if (res === null)
                break;
            this.i = spaceMatch.lastIndex;
        }
        this.offset = offset;
        this.context = context;
        this.i = context.length;
        this.matchedWidth = this.matchedIndex + this.matchedWidth - oriindex;
        this.matchedIndex = oriindex;
    }
    readTo(needle) {
        const context = this.context;
        const idx = context.indexOf(needle, this.i);
        const [matched, prespace, width] = TextLineParser.trim(idx === -1 ? context.substr(this.i) : context.substring(this.i, idx));
        this.matchedIndex = this.offset + this.i + prespace;
        this.matchedWidth = width;
        this.i = idx === -1 ? context.length : idx + 1;
        return matched;
    }
    readAll() {
        const [matched, prespace, width] = TextLineParser.trim(this.context.substr(this.i));
        this.matchedIndex = this.i + prespace;
        this.matchedWidth = width;
        this.i = this.context.length;
        return matched;
    }
    *split(needle) {
        const context = this.context;
        if (this.i >= context.length)
            return;
        const oriindex = this.matchedIndex;
        const offset = this.offset;
        for (;;) {
            const idx = context.indexOf(needle, this.i);
            const [matched, prespace, width] = TextLineParser.trim(idx === -1 ? context.substr(this.i) : context.substring(this.i, idx));
            this.offset = this.matchedIndex = this.i + prespace + offset;
            this.matchedWidth = width;
            this.i = 0;
            yield this.context = matched;
            if (idx === -1)
                break;
            this.i = idx + 1;
        }
        this.offset = offset;
        this.context = context;
        this.i = context.length;
        this.matchedWidth = this.matchedIndex + this.matchedWidth - oriindex;
        this.matchedIndex = oriindex;
    }
    error(message) {
        return new ParsingError(message, {
            column: this.matchedIndex,
            width: this.matchedWidth,
            line: this.lineNumber
        });
    }
    getPosition() {
        return {
            line: this.lineNumber,
            column: this.matchedIndex,
            width: this.matchedWidth
        };
    }
}
exports.TextLineParser = TextLineParser;
class ErrorPosition {
    constructor(message, severity, pos) {
        this.message = message;
        this.severity = severity;
        this.pos = pos;
    }
    report(sourcePath, lineText) {
        console.error();
        const pos = this.pos;
        if (pos !== null) {
            console.error(`${colors.cyan(sourcePath)}:${colors.yellow(pos.line + '')}:${colors.yellow(pos.column + '')} - ${colors.red(this.severity)}: ${this.message}`);
            if (lineText !== null) {
                const linestr = pos.line + '';
                console.error(`${colors.black(colors.bgWhite(linestr))} ${lineText}`);
                console.error(colors.bgWhite(' '.repeat(linestr.length)) + ' '.repeat(pos.column + 1) + colors.red('~'.repeat(Math.max(pos.width, 1))));
            }
        }
        else {
            console.error(`${colors.cyan(sourcePath)} - ${colors.red(this.severity)}: ${this.message}`);
            if (lineText !== null) {
                console.error(`${colors.bgWhite(' ')} ${lineText}`);
            }
        }
    }
}
exports.ErrorPosition = ErrorPosition;
class ParsingError extends Error {
    constructor(message, pos) {
        super(pos !== null ? `${message}, line:${pos.line}` : message);
        this.pos = pos;
        this.errors = [];
        this.errors.push(new ErrorPosition(message, 'error', pos));
    }
    report(sourcePath, lineText) {
        this.errors[0].report(sourcePath, lineText);
    }
    reportAll(sourcePath, sourceText) {
        for (const err of this.errors) {
            err.report(sourcePath, sourceText);
        }
    }
}
exports.ParsingError = ParsingError;
class ParsingErrorContainer {
    constructor() {
        this.error = null;
    }
    add(error) {
        if (this.error !== null) {
            this.error.errors.push(...error.errors);
        }
        else {
            this.error = error;
        }
    }
}
exports.ParsingErrorContainer = ParsingErrorContainer;
//# sourceMappingURL=textparser.js.map