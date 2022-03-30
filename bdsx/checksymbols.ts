import { undecoratedSymbols, decoratedSymbols } from './bds/symbollist';
import { readFileSync } from 'fs';
import { join } from 'path';

class Errors {
    public readonly items:string[] = [];

    constructor(
        public readonly preMessage:string|null = null,
        public readonly postMessage:string|null = null,
    ) {
    }
    private listed = false;

    private _listIt():void {
        if (this.listed) return;
        this.listed = true;
        Errors.list.push(this);
    }

    add(item:string):void {
        this.items.push(item);
        this._listIt();
    }

    print():void {
        if (this.preMessage !== null) {
            console.error(this.preMessage);
            for(const item of this.items) {
                console.error(`  ${item}`);
            }
        } else {
            for(const item of this.items) {
                console.error(item);
            }
        }
        if (this.postMessage !== null) {
            console.error(this.postMessage);
        }
    }

    static isFailed():boolean {
        return Errors.list.length !== 0;
    }
    static printAll():void {
        for (const err of Errors.list) {
            err.print();
        }
    }

    private static readonly list:Errors[] = [];
}

// check duplicated from symbollist.ts
const jsSymbols = new Set<string>();
const jsDuplicated = new Errors('Duplicated symbols in the list:', `Please reduce these symbols from bdsx/bds/symbollist.ts`);
for(const symbol of undecoratedSymbols) {
    if (jsSymbols.has(symbol)) jsDuplicated.add(symbol);
    else jsSymbols.add(symbol);
}
for(const symbol of decoratedSymbols) {
    if (jsSymbols.has(symbol)) jsDuplicated.add(symbol);
    else jsSymbols.add(symbol);
}

// check duplicated from pdb.ini
const iniSymbols = new Set<string>(); // use Set for the better key search
const regexp = /^[ \t\0]*(.*[^ \t\0])[ \t\0]*=/gm; // use the similar rule with bdsx-core
const content = readFileSync(join(__dirname, 'bds', 'pdb.ini'), 'utf8');
const iniDuplicated = new Errors('Duplicated symbols in the cache:', `Please reduce these symbols from bdsx/bds/pdb.ini`);
let matched:RegExpExecArray|null = null;
while ((matched = regexp.exec(content)) !== null) {
    const symbol = matched[1];
    if (iniSymbols.has(symbol)) iniDuplicated.add(symbol);
    else iniSymbols.add(symbol);
}

// check missing from pdb.ini
const missing = new Errors('Missing symbols:', `Please add these symbols to bdsx/bds/pdb.ini`);
for(const symbol of undecoratedSymbols) {
    if(!iniSymbols.has(symbol)) missing.add(symbol);
}
for(const symbol of decoratedSymbols) {
    if(!iniSymbols.has(symbol)) missing.add(symbol);
}

if (Errors.isFailed()) {
    Errors.printAll();
    process.exit(1);
} else {
    console.log(`All symbols are present`);
}
