
import colors = require('colors');

const SPACE_REG = /^([\s\uFEFF\xA0]*)(.*[^\s\uFEFF\xA0])[\s\uFEFF\xA0]*$/;

export class TextLineParser {
    private p = 0;
    public matchedWidth:number;
    public matchedIndex = 0;
    private offset = 0;

    constructor(private context:string) {
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
                this.p = content.length;
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
        spaceMatch.lastIndex = this.matchedIndex;

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

    enter(needle:string):[number, number, string]|null {
        const context = this.context;
        const idx = context.indexOf(needle, this.p);
        if (idx === -1) return null;
        const [matched, prespace, width] = TextLineParser.trim(context.substring(this.p, idx));
        const offset = this.offset;
        this.offset = this.matchedIndex = this.p + offset + prespace;
        this.matchedWidth = width;
        this.p = this.matchedIndex - this.offset;
        this.context = matched;
        return [idx + 1, offset, context];
    }

    leave(ctx:[number, number, string]):void {
        this.p = ctx[0];
        this.offset = ctx[1];
        this.context = ctx[2];
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

    error(message:string):never {
        throw new ParsingError(message, this.matchedIndex, this.matchedWidth);
    }
}

export class ParsingError extends Error {
    public severity:'error'|'warning' = 'error';
    public lineText?:string;
    public line?:number;

    constructor(
        message:string, 
        public column:number, 
        public width:number) {
        super(message);
    }

    report(sourcePath:string):void {
        console.error();
        console.error(`${colors.cyan(sourcePath)}:${colors.yellow(this.line+'')}:${colors.yellow(this.column+'')} - ${colors.red(this.severity)}: ${this.message}`);
        
        const linestr = this.line+'';
        console.error(colors.black(colors.bgWhite(linestr))+` ${this.lineText}`);
        console.error(colors.bgWhite(' '.repeat(linestr.length))+' '.repeat(this.column+1)+colors.red('~'.repeat(Math.max(this.width, 1))));
    }
}