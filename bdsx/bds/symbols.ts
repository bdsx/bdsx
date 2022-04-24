import { NativePointer } from "../core";
import { dllraw } from "../dllraw";
import { pdbcache } from '../pdbcache';

export const proc:Record<string, NativePointer> = {};

(proc as any).__proto__ = new Proxy({}, {
    get(target:Record<string|symbol, any>, key):NativePointer {
        if (typeof key !== 'string') {
            return target[key];
        } else {
            const rva = pdbcache.search(key);
            if (rva === -1) throw Error(`Symbol not found: ${key}`);
            return proc[key] = dllraw.current.add(rva);
        }
    },
    has(target, p):boolean {
        if (typeof p !== 'string') {
            return p in target;
        }
        return pdbcache.search(p) !== -1;
    },
});
/** @deprecated use proc */
export const proc2 = proc;
