import { NativePointer, pdb, VoidPointer } from "./core";
import ProgressBar = require('progress');

let analyzeMap:Map<string, string>|undefined;
let symbols:Record<string, NativePointer>|null = null;


export namespace analyzer
{
    let total = 0;

    export function setTotalCount(n:number):void{
        total = n;
    }

    export function loadMap():void{
        if (analyzeMap) return;
        analyzeMap = new Map<string, string>();
        if (symbols === null) {
            if (total === 0) {
                symbols = pdb.getAll();
            } else {
                console.log('[BDSX] PdbReader: Search Symbols...');
                const progress = new ProgressBar(`[:bar] :current/:total`, total);
                symbols = pdb.getAll(count=>{
                    progress.update(count / total);
                });
                progress.terminate();
            }
        }
        
        for (const name in symbols) {
            analyzeMap.set(symbols[name].toString(), name);
        }
    }
    
    export function analyze(ptr:VoidPointer, count:number=32):void {
        const nptr = ptr.add();
        loadMap();
        console.log(`[analyze: ${nptr}]`);
        try {
            for (let i=0;i<count;i++) {
                let offset = (i*8).toString(16);
                offset = '0'.repeat(Math.max(3-offset.length, 0)) + offset;
                
                const addr = nptr.readPointer();
                const addrstr = addr.toString();
                
                const addrname = analyzeMap!.get(addrstr);
                if (addrname) {
                    console.log(`${offset}: ${addrname}(${addrstr})`);
                    continue;
                }
    
                try {
                    const addr2 = addr.getPointer();
                    const addr2str = addr2.toString();
                    const addr2name = analyzeMap!.get(addr2str);
                    if (addr2name) {
                        console.log(`${offset}: ${addrstr}: ${addr2name}(${addr2str})`);
                    } else {
                        console.log(`${offset}: ${addrstr}: ${addr2str}`);
                    }
                } catch (err) {
                    const nums:number[] = [];
                    for (let i=0;i<addrstr.length; i+= 2) {
                        nums.push(parseInt(addrstr.substr(i, 2), 16));
                    }
                    if (nums.every(n=>n<0x7f)) {
                        nums.reverse();
                        const text = String.fromCharCode(...nums.map(n=>n<0x20 ? 0x20 : n));
                        console.log(`${offset}: ${addrstr} ${text}`);
                    } else {
                        console.log(`${offset}: ${addrstr}`);
                    }
                }
            }
        } catch (err) {
            console.log('[VA]');
        }
    }
}