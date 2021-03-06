
import colors = require('colors');

const SPACE_REG = /^([\s\uFEFF\xA0]*)(.*[^\s\uFEFF\xA0])[\s\uFEFF\xA0]*$/;

export class TextLineParser {
    private p = 0;
    public matchedWidth:number;
    public matchedIndex = 0;

    constructor(
        private context:string, 
        public readonly lineNumber:number,
        private offset = 0) {
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

    eof():boolean {
        return this.p >= this.context.length;
    }

    nextIf(str:string):boolean {
        if (!this.context.startsWith(str, this.p)) return false;
        this.p += str.length;
        return true;
    }

    readQuotedStringTo(chr:string):string|null {
        let p = this.p+1;
        
        for (;;) {
            const np = this.context.indexOf(chr, p);
            if (np === -1) {
                this.matchedIndex = this.p + this.offset;
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
                const out = this.context.substring(this.p-1, np+1);
                this.matchedIndex = this.p + this.offset;
                this.matchedWidth = out.length;
                this.p = np+1;
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
        const chr = this.context.charAt(this.p);
        if (chr !== '"' && chr !== "'") return null;
        return this.readQuotedStringTo(chr);
    }

    skipSpaces():void {
        const nonspace = /[^\s\uFEFF\xA0]/g;
        nonspace.lastIndex = this.p;
        const res = nonspace.exec(this.context);
        if (res === null) {
            this.p = this.context.length;
            return;
        }
        this.p = res.index;
    }

    readToSpace():string {
        const context = this.context;
        const spaceMatch = /[\s\uFEFF\xA0]+/g;
        spaceMatch.lastIndex = this.p;

        for (;;) {
            const res = spaceMatch.exec(context);
            let content:string;
            this.matchedIndex = this.p + this.offset;
            if (res === null) {
                content = context.substr(this.p);
                this.matchedWidth = content.length;
                this.p = this.context.length;
            } else {
                if (res.index === 0) {
                    this.p = spaceMatch.lastIndex;
                    continue;
                }
                content = context.substring(this.p, res.index);
                this.matchedWidth = content.length;
                this.p = spaceMatch.lastIndex;
            }
            return content;
        }
    }
    
    *splitWithSpaces():IterableIterator<string> {
        const context = this.context;
        if (this.p >= context.length) return;
        const oriindex = this.matchedIndex;
        const offset = this.offset;
        const spaceMatch = /[\s\uFEFF\xA0]+/g;
        spaceMatch.lastIndex = this.p;

        for (;;) {
            const res = spaceMatch.exec(context);

            let content:string;
            if (res === null) {
                content = context.substr(this.p);
            } else {
                if (res.index === 0) {
                    this.p = spaceMatch.lastIndex;
                    continue;
                }
                content = context.substring(this.p, res.index);
            }
            this.offset = this.matchedIndex = this.p + offset;
            this.matchedWidth = content.length;
            this.p = 0;
            yield this.context = content;
            if (res === null) break;
            this.p = spaceMatch.lastIndex;
        }

        this.offset = offset;
        this.context = context;
        this.p = context.length;
        this.matchedWidth = this.matchedIndex + this.matchedWidth - oriindex;
        this.matchedIndex = oriindex;
    }

    readTo(needle:string):string {
        const context = this.context;
        const idx = context.indexOf(needle, this.p);
        const [matched, prespace, width] = TextLineParser.trim(idx === -1 ? context.substr(this.p) : context.substring(this.p, idx));
        this.matchedIndex = this.offset + this.p + prespace;
        this.matchedWidth = width;
        this.p = idx === -1 ? context.length : idx + 1;
        return matched;
    }

    readAll():string {
        const [matched, prespace, width] = TextLineParser.trim(this.context.substr(this.p));
        this.matchedIndex = this.p + prespace;
        this.matchedWidth = width;
        this.p = this.context.length;
        return matched;
    }

    *split(needle:string):IterableIterator<string> {
        const context = this.context;
        if (this.p >= context.length) return;
        const oriindex = this.matchedIndex;
        const offset = this.offset;

        for (;;) {
            const idx = context.indexOf(needle, this.p);
            const [matched, prespace, width] = TextLineParser.trim(idx === -1 ? context.substr(this.p) : context.substring(this.p, idx));
            this.offset = this.matchedIndex = this.p + prespace + offset;
            this.matchedWidth = width;
            this.p = 0;
            yield this.context = matched;
            if (idx === -1) break;
            this.p = idx + 1;
        }
        
        this.offset = offset;
        this.context = context;
        this.p = context.length;
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
                console.error(colors.black(colors.bgWhite(linestr))+` ${lineText}`);
                console.error(colors.bgWhite(' '.repeat(linestr.length))+' '.repeat(pos.column+1)+colors.red('~'.repeat(Math.max(pos.width, 1))));
            }
        } else {
            console.error(`${colors.cyan(sourcePath)} - ${colors.red(this.severity)}: ${this.message}`);
            
            if (lineText !== null) {
                console.error(colors.bgWhite(' ')+` ${lineText}`);
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