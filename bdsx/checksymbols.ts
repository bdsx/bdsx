import { undecoratedSymbols, decoratedSymbols } from './bds/symbollist';
import { readFileSync } from 'fs';
import { join } from 'path';

const missing: string[] = [];

const iniSymbols = new Set<string>(); // use Set for the better key search
const regexp = /^[ \t\0]*(.*[^ \t\0])[ \t\0]*=/gm; // use the similar rule with bdsx-core
const content = readFileSync(join(__dirname, 'bds', 'pdb.ini'), 'utf8');
let matched:RegExpExecArray|null = null;
while ((matched = regexp.exec(content)) !== null) {
    iniSymbols.add(matched[1]);
}

for(const symbol of undecoratedSymbols) {
    if(!iniSymbols.has(symbol)) missing.push(symbol);
}

for(const symbol of decoratedSymbols) {
    if(!iniSymbols.has(symbol)) missing.push(symbol);
}

if(missing.length > 0) {
    console.log(`Missing symbols:`);
    for(const symbol of missing) {
        console.log(`  ${symbol}`);
    }
    console.log(`Please add these symbols to bdsx/bds/pdb.ini`);
    process.exit(1);
} else {
    console.log(`All symbols are present`);
}
