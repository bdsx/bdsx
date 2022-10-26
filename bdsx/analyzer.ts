import { NativePointer, VoidPointer } from "./core";
import { pdbcache } from "./pdbcache";

let analyzeMap:Map<string, string>|undefined;
let symbols:Record<string, NativePointer>|null = null;

function asAscii(addr:VoidPointer):string|undefined {
    const nums:number[] = [];
    const bin = addr.getAddressBin();
    for (let i=0;i<bin.length; i++) {
        nums.push(bin.charCodeAt(i));
    }
    if (!nums.every(n=>n<0x7f)) return undefined;
    nums.reverse();
    const text = String.fromCharCode(...nums.map(n=>n<0x20 ? 0x20 : n));
    return text;
}

export namespace analyzer {
    export function loadMap():void{
        if (analyzeMap) return;
        analyzeMap = new Map<string, string>();
        const proc:typeof import('./bds/symbols').proc = require('./bds/symbols').proc;

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

    export interface AddressInfo {
        symbol?:string;
        address:string;
        address2?:string;
        ascii?:string;
    }

    export function getAddressInfo(addr:VoidPointer):AddressInfo {
        loadMap();
        const addrname = analyzeMap!.get(addr.getAddressBin());
        if (addrname !== undefined) {
            return {
                symbol:addrname,
                address:addr+'',
            };
        }
        try {
            const addr2 = addr.add().getPointer();
            const addr2name = analyzeMap!.get(addr2.getAddressBin());
            if (addr2name !== undefined) {
                return {
                    symbol: '& '+addr2name,
                    address: addr+'',
                    address2: addr2+'',
                };
            } else {
                return {
                    address: addr+'',
                    address2: addr2+'',
                    ascii: asAscii(addr2),
                };
            }
        } catch (err) {
            return {
                address: addr+'',
                ascii: asAscii(addr),
            };
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
                const info = getAddressInfo(addr);
                let line = `${offset}: ${info.address}`;
                if (info.address2 !== undefined) {
                    line += ': ';
                    line += info.address2;
                }
                if (info.symbol !== undefined) {
                    line += info.symbol;
                }
                if (info.ascii !== undefined) {
                    line += `"${info.ascii}"`;
                }
            }
        } catch (err) {
            console.log('[VA]');
        }
    }
}
