import { undecoratedSymbols, decoratedSymbols } from './bds/symbollist';
import { readFileSync } from 'fs';
import { join } from 'path';

const missing: string[] = [];

const iniSymbols = readFileSync(join(__dirname, 'bds', 'pdb.ini'), 'utf8').split('\n').map(l => l.split(' = ')[0].trim());
for(const symbol of undecoratedSymbols) {
    if(!iniSymbols.includes(symbol)) missing.push(symbol);
}

for(const symbol of decoratedSymbols) {
    if(!iniSymbols.includes(symbol)) missing.push(symbol);
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
