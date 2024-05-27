import * as fs from "fs";
import * as path from "path";
import { Config } from "../config";
import { bedrock_server_exe, NativePointer, VoidPointer } from "../core";
import { dllraw } from "../dllraw";
import { fsutil } from "../fsutil";
import { pdbcache } from "../pdbcache";
import { destackThrow } from "../source-map-support";
import { TextParser } from "../textparser";
import { timeout } from "../util";

type PROC_T = { readonly vftable: { readonly [key: string]: [number, number?] } }; // [offset in vftable, offset of vftable]

/**
 * @remark Backward compatibility cannot be guaranteed. The symbol name can be changed by BDS updating.
 */
export const proc = {
    vftable: {},
} as PROC_T & { readonly [key: string]: NativePointer };

(proc as any).__proto__ = new Proxy(
    {},
    {
        get(target: Record<string | symbol, any>, key): NativePointer {
            if (typeof key !== "string") {
                return target[key];
            } else {
                const rva = pdbcache.search(key);
                if (rva === -1) destackThrow(Error(`Symbol not found: ${key}`), 1);
                PdbCacheL2.addRva(key, rva);
                const value = dllraw.current.add(rva);
                Object.defineProperty(proc, key, { value });
                return value;
            }
        },
        has(target, key): boolean {
            if (typeof key !== "string") {
                return key in target;
            }
            const rva = pdbcache.search(key);
            if (rva !== -1) {
                PdbCacheL2.addRva(key, rva);
                const value = dllraw.current.add(rva);
                Object.defineProperty(proc, key, { value });
                return true;
            } else {
                return false;
            }
        },
    },
);

function getVftableOffset(key: string): readonly [number] | null {
    const [from, target] = key.split("\\", 2);
    const vftableSearch = proc[from].add();
    const targetptr = proc[target];

    const base = dllraw.current.getAddressBin();
    let offset = 0;
    while (offset < 4096) {
        let ptr: VoidPointer;
        try {
            ptr = vftableSearch.readPointer();
        } catch (err) {
            // access violation expected
            break;
        }
        const diff = ptr.subBin(base);
        const rva_high = diff.getAddressHigh();
        const rva = diff.getAddressLow();
        if (rva_high !== 0) {
            break; // invalid
        }
        if (rva < 0x1000) {
            break; // too low
        }
        if (rva >= 0x1000000000) {
            break; // too big
        }

        if (ptr.equalsptr(targetptr)) {
            PdbCacheL2.addVftableOffset(key, offset);
            const value: readonly [number] = [offset];
            Object.freeze(value);
            Object.defineProperty(proc.vftable, key, { value });
            return value;
        }
        offset += 8;
    }
    return null;
}
(proc.vftable as any).__proto__ = new Proxy(
    {},
    {
        get(target: Record<string | symbol, any>, key): readonly [number, number?] {
            if (typeof key !== "string") {
                return target[key];
            } else {
                const offset = getVftableOffset(key);
                if (offset === null) {
                    throw Error(`vftable offset not found: ${key}`);
                }
                return offset;
            }
        },
        has(target: Record<string | symbol, any>, key): boolean {
            if (typeof key !== "string") {
                return key in target;
            }
            return getVftableOffset(key) !== null;
        },
    },
);

/** @deprecated use proc */
export const proc2 = proc;

const cachePath = path.join(Config.BDS_PATH, "pdbcache.l2");
class PdbCacheL2 {
    private saving = false;
    private saveRequestedAgain = false;
    private contents: string = "";
    private static instance: PdbCacheL2 | null = null;

    private constructor(private appendMode: boolean) {
        if (!this.appendMode) {
            this.contents = `${bedrock_server_exe.md5}\n`;
        }
    }

    static load(): void {
        let content: string;
        try {
            content = fs.readFileSync(cachePath, "utf8");
        } catch (err) {
            // file not found
            PdbCacheL2.instance = new PdbCacheL2(false);
            return;
        }
        const reader = new TextParser(content);
        const line = reader.readLine();
        if (line !== bedrock_server_exe.md5) {
            // md5 mismatch
            PdbCacheL2.instance = new PdbCacheL2(false);
            return;
        }

        const procProperties: PropertyDescriptorMap = {};
        const vftableProperties: PropertyDescriptorMap = {};

        for (;;) {
            const line = reader.readLine();
            if (line == null) break;
            const values = line.split("|");
            const first = values[0];
            switch (first) {
                case "v": {
                    // vftable offset
                    const key = values[1];
                    const offset = parseInt(values[2], 16);
                    const value = [offset];
                    Object.freeze(value);
                    vftableProperties[key] = { value };
                    break;
                }
                default: {
                    // rva
                    const rva = parseInt(values[1], 16);
                    const value = dllraw.current.add(rva);
                    procProperties[first] = { value };
                    break;
                }
            }
        }
        Object.defineProperties(proc.vftable, vftableProperties);
        Object.defineProperties(proc, procProperties);
    }

    static addRva(symbol: string, rva: number): void {
        if (PdbCacheL2.instance === null) {
            PdbCacheL2.instance = new PdbCacheL2(true);
        }
        const cache = PdbCacheL2.instance;

        cache.contents += symbol;
        cache.contents += "|";
        cache.contents += rva.toString(16);
        cache.contents += "\n";
        cache._save();
    }

    static addVftableOffset(symbol: string, offset: number): void {
        if (PdbCacheL2.instance === null) {
            PdbCacheL2.instance = new PdbCacheL2(true);
        }
        const cache = PdbCacheL2.instance;

        cache.contents += "v|";
        cache.contents += symbol;
        cache.contents += "|";
        cache.contents += offset.toString(16);
        cache.contents += "\n";
        cache._save();
    }

    private async _save(): Promise<void> {
        if (this.saving) {
            this.saveRequestedAgain = true;
            return;
        }
        this.saving = true;
        await timeout(10);
        try {
            for (;;) {
                const contents = this.contents;
                this.contents = "";
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
