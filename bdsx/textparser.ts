
import colors = require('colors');
import { str2set } from './util';

const SPACE_REG = /^([\s\uFEFF\xA0]*)(.*[^\s\uFEFF\xA0])[\s\uFEFF\xA0]*$/;
const DEFAULT_SEPERATOR = str2set('!@#%^&*()+-=`~[]{};\':",./<>?');

const SPACES = str2set(' \t\r\n\uFEFF\xa0');

export class TextParser {
    public i = 0;
    constructor(
        public context:string) {
    }

    getFrom(from:number):string {
        return this.context.substring(from, this.i);
    }

    eof():boolean {
        return this.i >= this.context.length;
    }

    peek():string {
        return this.context.charAt(this.i);
    }

    endsWith(str:string):boolean {
        return this.context.endsWith(str, this.i);
    }

    nextIf(str:string):boolean {
        if (!this.context.startsWith(str, this.i)) return false;
        this.i += str.length;
        return true;
    }

    skipSpaces():void {
        const nonspace = /[^\s\uFEFF\xA0]/g;
        nonspace.lastIndex = this.i;
        const res = nonspace.exec(this.context);
        if (res === null) {
            this.i = this.context.length;
            return;
        }
        this.i = res.index;
    }

}

export class LanguageParser extends TextParser {

    constructor(
        context:string,
        public readonly seperators:Set<number> = DEFAULT_SEPERATOR) {
        super(context);
        for (const chr of SPACES) {
            this.seperators.add(chr);
        }
    }

    unget(str:string):void {
        this.i = this.context.lastIndexOf(str, this.i-1);
        if (this.i === -1) throw Error(`${str} not found in '${this.context}'`);
    }

    readIdentifier():string|null {
        this.skipSpaces();
        const from = this.i;
        for (;;) {
            if (this.i >= this.context.length) break;
            const code = this.context.charCodeAt(this.i);
            if (this.seperators.has(code)) break;
            this.i++;
        }
        if (from === this.i) return null;
        return this.context.substring(from, this.i);
    }

    readOperator(operators:{has(key:string):boolean}):string|null {
        this.skipSpaces();
        const from = this.i;
        if (from >= this.context.length) return null;
        let out = '';
        for (;;) {
            const code = this.context.charCodeAt(this.i);
            if (!this.seperators.has(code)) break;
            out += String.fromCharCode(code);
            if (out.length !== 1 && !operators.has(out)) break;
            this.i++;
        }
        return this.context.substring(from, this.i);
    }

    readTo(needle:string):string {
        const context = this.context;
        const idx = context.indexOf(needle, this.i);
        const matched = (idx === -1 ? context.substr(this.i) : context.substring(this.i, idx)).trim();
        this.i = idx === -1 ? context.length : idx + 1;
        return matched;
    }

    readAll():string {
        return this.context.substr(this.i).trim();
    }

}

export class TextLineParser extends TextParser {
    public matchedWidth:number;
    public matchedIndex = 0;

    constructor(
        context:string,
        public readonly lineNumber:number,
        private offset = 0) {
        super(context);
        this.matchedWidth = context.length;
    }

    static prespace(text:string):number {
        return text.match(/^[\s\uFEFF\xA0]*/)![0].length;
    }

    static trim(context:string):[string, number, number] {
        const matched = SPACE_REG.exec(context);
        if (matched === null) return ['', 0, context.length];
        const res = matched[2];
        return [res, matched[1].length, res.length];
    }

    readQuotedStringTo(chr:string):string|null {
        let p = this.i+1;

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
                    count ++;
                    continue;
                }
                break;
            }
            if ((count&1) === 0) {
                const out = this.context.substring(this.i-1, np+1);
                this.matchedIndex = this.i + this.offset;
                this.matchedWidth = out.length;
                this.i = np+1;
                try {
                    return JSON.parse(out);
                } catch (err) {
                    throw this.error(err.message);
                }
            }
            p = np+1;
        }
    }

    readQuotedString():string|null {
        this.skipSpaces();
        const chr = this.context.charAt(this.i);
        if (chr !== '"' && chr !== "'") return null;
        return this.readQuotedStringTo(chr);
    }

    readToSpace():string {
        const context = this.context;
        const spaceMatch = /[\s\uFEFF\xA0]+/g;
        spaceMatch.lastIndex = this.i;

        for (;;) {
            const res = spaceMatch.exec(context);
            let content:string;
            this.matchedIndex = this.i + this.offset;
            if (res === null) {
                content = context.substr(this.i);
                this.matchedWidth = content.length;
                this.i = this.context.length;
            } else {
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

    *splitWithSpaces():IterableIterator<string> {
        const context = this.context;
        if (this.i >= context.length) return;
        const oriindex = this.matchedIndex;
        const offset = this.offset;
        const spaceMatch = /[\s\uFEFF\xA0]+/g;
        spaceMatch.lastIndex = this.i;

        for (;;) {
            const res = spaceMatch.exec(context);

            let content:string;
            if (res === null) {
                content = context.substr(this.i);
            } else {
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
            if (res === null) break;
            this.i = spaceMatch.lastIndex;
        }

        this.offset = offset;
        this.context = context;
        this.i = context.length;
        this.matchedWidth = this.matchedIndex + this.matchedWidth - oriindex;
        this.matchedIndex = oriindex;
    }

    readTo(needle:string):string {
        const context = this.context;
        const idx = context.indexOf(needle, this.i);
        const [matched, prespace, width] = TextLineParser.trim(idx === -1 ? context.substr(this.i) : context.substring(this.i, idx));
        this.matchedIndex = this.offset + this.i + prespace;
        this.matchedWidth = width;
        this.i = idx === -1 ? context.length : idx + 1;
        return matched;
    }

    readAll():string {
        const [matched, prespace, width] = TextLineParser.trim(this.context.substr(this.i));
        this.matchedIndex = this.i + prespace;
        this.matchedWidth = width;
        this.i = this.context.length;
        return matched;
    }

    *split(needle:string):IterableIterator<string> {
        const context = this.context;
        if (this.i >= context.length) return;
        const oriindex = this.matchedIndex;
        const offset = this.offset;

        for (;;) {
            const idx = context.indexOf(needle, this.i);
            const [matched, prespace, width] = TextLineParser.trim(idx === -1 ? context.substr(this.i) : context.substring(this.i, idx));
            this.offset = this.matchedIndex = this.i + prespace + offset;
            this.matchedWidth = width;
            this.i = 0;
            yield this.context = matched;
            if (idx === -1) break;
            this.i = idx + 1;
        }

        this.offset = offset;
        this.context = context;
        this.i = context.length;
        this.matchedWidth = this.matchedIndex + this.matchedWidth - oriindex;
        this.matchedIndex = oriindex;
    }

    error(message:string):ParsingError {
        return new ParsingError(message, {
            column: this.matchedIndex,
            width: this.matchedWidth,
            line: this.lineNumber
        });
    }

    getPosition():SourcePosition {
        return {
            line: this.lineNumber,
            column: this.matchedIndex,
            width: this.matchedWidth
        };
    }
}

export interface SourcePosition {
    line:number;
    column:number;
    width:number;
}

export class ErrorPosition {

    constructor(
        public readonly message:string,
        public readonly severity:'error'|'warning'|'info',
        public readonly pos:SourcePosition|null) {
    }

    report(sourcePath:string, lineText:string|null):void {
        console.error();
        const pos = this.pos;
        if (pos !== null) {
            console.error(`${colors.cyan(sourcePath)}:${colors.yellow(pos.line+'')}:${colors.yellow(pos.column+'')} - ${colors.red(this.severity)}: ${this.message}`);

            if (lineText !== null) {
                const linestr = pos.line+'';
                console.error(`${colors.black(colors.bgWhite(linestr))} ${lineText}`);
                console.error(colors.bgWhite(' '.repeat(linestr.length))+' '.repeat(pos.column+1)+colors.red('~'.repeat(Math.max(pos.width, 1))));
            }
        } else {
            console.error(`${colors.cyan(sourcePath)} - ${colors.red(this.severity)}: ${this.message}`);

            if (lineText !== null) {
                console.error(`${colors.bgWhite(' ')} ${lineText}`);
            }
        }
    }

}

export class ParsingError extends Error {
    public readonly errors:ErrorPosition[] = [];

    constructor(
        message:string,
        public readonly pos:SourcePosition|null
    ) {
        super(pos !== null ? `${message}, line:${pos.line}` : message);
        this.errors.push(new ErrorPosition(message, 'error', pos));
    }

    report(sourcePath:string, lineText:string|null):void {
        this.errors[0].report(sourcePath, lineText);
    }

    reportAll(sourcePath:string, sourceText:string):void {
        for (const err of this.errors) {
            err.report(sourcePath, sourceText);
        }
    }
}

export class ParsingErrorContainer {
    public error:ParsingError|null = null;

    add(error:ParsingError):void {
        if (this.error !== null) {
            this.error.errors.push(...error.errors);
        } else {
            this.error = error;
        }
    }
}
