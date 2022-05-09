import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config';
import { bedrock_server_exe, NativePointer, VoidPointer } from "../core";
import { dllraw } from "../dllraw";
import { fsutil } from '../fsutil';
import { pdbcache } from '../pdbcache';
import { TextParser } from '../textparser';
import { timeout } from '../util';

namespace procNamespace {
    export const vftable:Record<string, [number, number?]> = {};
}

/**
 * @remark Backward compatibility cannot be guaranteed. The symbol name can be changed by BDS updating.
 */
export const proc:Record<string, NativePointer>&typeof procNamespace = procNamespace as any;

(proc as any).__proto__ = new Proxy({}, {
    get(target:Record<string|symbol, any>, key):NativePointer {
        if (typeof key !== 'string') {
            return target[key];
        } else {
            const rva = pdbcache.search(key);
            if (rva === -1) throw Error(`Symbol not found: ${key}`);
            PdbCacheL2.addRva(key, rva);
            return proc[key] = dllraw.current.add(rva);
        }
    },
    has(target, key):boolean {
        if (typeof key !== 'string') {
            return key in target;
        }
        const rva = pdbcache.search(key);
        if (rva !== -1) {
            PdbCacheL2.addRva(key, rva);
            proc[key] = dllraw.current.add(rva);
            return true;
        } else {
            return false;
        }
    },
});

function getVftableOffset(key:string):[number]|null {
    const [from, target] = key.split('\\', 2);
    const vftableSearch = proc[from].add();
    const targetptr = proc[target];
    let offset = 0;
    while (offset < 4096) {
        let ptr:VoidPointer;
        try {
            ptr = vftableSearch.readPointer();
        } catch (err) {
            // access violation expected
            break;
        }
        const rva = ptr.subptr(dllraw.current);
        if (rva < 0x1000) break; // too low
        if (rva >= 0x1000000000) break; // too big

        if (ptr.equalsptr(targetptr)) {
            PdbCacheL2.addVftableOffset(key, offset);
            return proc.vftable[key] = [offset];
        }
        offset += 8;
    }
    return null;
}
(proc.vftable as any).__proto__ = new Proxy({}, {
    get(target:Record<string|symbol, any>, key):[number, number?] {
        if (typeof key !== 'string') {
            return target[key];
        } else {
            const offset = getVftableOffset(key);
            if (offset === null) {
                throw Error(`vftable offset not found: ${key}`);
            }
            return offset;
        }
    },
    has(target:Record<string|symbol, any>, key):boolean {
        if (typeof key !== 'string') {
            return key in target;
        }
        return getVftableOffset(key) !== null;
    },
});

/** @deprecated use proc */
export const proc2 = proc;

const cachePath = path.join(Config.BDS_PATH, 'pdbcache.l2');
class PdbCacheL2 {
    private saving = false;
    private saveRequestedAgain = false;
    private contents:string = '';
    private static instance:PdbCacheL2|null = null;

    private constructor(private appendMode:boolean) {
        if (!this.appendMode) {
            this.contents = `${bedrock_server_exe.md5}\n`;
        }
    }

    static load():void {
        let content:string;
        try {
            content = fs.readFileSync(cachePath, 'utf8');
        } catch (err) { // file not found
            PdbCacheL2.instance = new PdbCacheL2(false);
            return;
        }
        const reader = new TextParser(content);
        const line = reader.readLine();
        if (line !== bedrock_server_exe.md5) { // md5 mismatch
            PdbCacheL2.instance = new PdbCacheL2(false);
            return;
        }

        for (;;) {
            const line = reader.readLine();
            if (line == null) break;
            const values = line.split('|');
            const first = values[0];
            switch (first) {
            case 'v': { // vftable offset
                const key = values[1];
                const offset = parseInt(values[2], 16);
                proc.vftable[key] = [offset];
                break;
            }
            default: { // rva
                const rva = parseInt(values[1], 16);
                proc[first] = dllraw.current.add(rva);
                break;
            }
            }
        }
    }

    static addRva(symbol:string, rva:number):void {
        if (PdbCacheL2.instance === null) {
            PdbCacheL2.instance = new PdbCacheL2(true);
        }
        const cache = PdbCacheL2.instance;

        cache.contents += symbol;
        cache.contents += '|';
        cache.contents += rva.toString(16);
        cache.contents += '\n';
        cache._save();
    }

    static addVftableOffset(symbol:string, offset:number):void {
        if (PdbCacheL2.instance === null) {
            PdbCacheL2.instance = new PdbCacheL2(true);
        }
        const cache = PdbCacheL2.instance;

        cache.contents += 'v|';
        cache.contents += symbol;
        cache.contents += '|';
        cache.contents += offset.toString(16);
        cache.contents += '\n';
        cache._save();
    }

    private async _save():Promise<void> {
        if (this.saving) {
            this.saveRequestedAgain = true;
            return;
        }
        this.saving = true;
        await timeout(10);
        try {
            for (;;) {
                const contents = this.contents;
                this.contents = '';
                if (this.appendMode) {
                    await fsutil.appendFile(cachePath, contents);
                } else {
                    await fsutil.writeFile(cachePath, contents);
                    this.appendMode = true;
                }
                if (!this.saveRequestedAgain) break;
                this.saveRequestedAgain = false;
            }
        } finally {
            this.saving = false;
        }
    }
}

PdbCacheL2.load();
