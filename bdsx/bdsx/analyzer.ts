import { proc } from "./bds/symbols";
import { bin } from "./bin";
import { NativePointer, VoidPointer } from "./core";
import { pdbcache } from "./pdbcache";

let analyzeMap:Map<string, string>|undefined;
let symbols:Record<string, NativePointer>|null = null;

export namespace analyzer {
    export function loadMap():void{
        if (analyzeMap) return;
        analyzeMap = new Map<string, string>();
        if (symbols === null) {
            symbols = {__proto__:null as any};
            for (const key of pdbcache.readKeys()) {
                symbols[key] = proc[key];
            }
        }

        for (const [name, value] of Object.entries(symbols)) {
            analyzeMap.set(value.getAddressBin(), name);
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
                const addrstr = addr+'';

                const addrname = analyzeMap!.get(addrstr);
                if (addrname) {
                    console.log(`${offset}: ${addrname}(${addrstr})`);
                    continue;
                }

                try {
                    const addr2 = addr.getPointer();
                    const addr2bin = addr2.getAddressBin();
                    const addr2name = analyzeMap!.get(addr2bin);
                    if (addr2name) {
                        console.log(`${offset}: ${addrstr}: ${addr2name}(0x${bin.reversedHex(addr2bin)})`);
                    } else {
                        console.log(`${offset}: ${addrstr}: ${addr2bin}`);
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
