import * as colors from 'colors';
import * as fs from 'fs';
import * as path from 'path';
import { proc } from './bds/symbols';
import { bedrock_server_exe, NativePointer, pdb } from "./core";
import { dllraw } from "./dllraw";
import { fsutil } from './fsutil';
import { pdbcache } from './pdbcache';

const wildecardRemap:Record<string, string> = {
    '*': '.+',
    '[': '\\[',
    '(': '\\(',
    '.': '\\.',
    '+': '\\+',
    '{': '\\{',
    '^': '\\^',
    '$': '\\$',
    '\\': '\\\\',
};

/**
 * @deprecated
 */
export namespace pdblegacy {
    export const coreCachePath = path.join(fsutil.projectPath, 'legacy_pdb_cache.ini');

    export function close():void {
        // does nothing
    }

    /**
     * get symbols from cache.
     * if symbols don't exist in cache. it reads pdb.
     * @returns 'out' the first parameter.
     */
    export function getList<OLD extends Record<string, any>, KEY extends string, KEYS extends readonly [...KEY[]]>(cacheFilePath:string, out:OLD, names:KEYS, quiet?:boolean, undecorateFlags?:number):{[key in KEYS[number]]: NativePointer} & OLD {
        const namesMap = new Set<string>(names);
        let lineEnd = false;
        let newContent = false;
        try {
            const regexp = /^[ \t\0]*(.*[^ \t\0])[ \t\0]*=[ \t\0]*(.+)$/gm;
            const content = fs.readFileSync(cacheFilePath, 'utf8');
            const firstLine = content.indexOf('\n');
            if (content.substr(0, firstLine).trim() === bedrock_server_exe.md5) {
                lineEnd = content.endsWith('\n');
                regexp.lastIndex = firstLine+1;
                let matched:RegExpExecArray|null = null;
                while ((matched = regexp.exec(content)) !== null) {
                    const symbol = matched[1];
                    namesMap.delete(symbol);
                    (out as any)[symbol] = dllraw.current.add(+matched[2]);
                }
            } else {
                newContent = true;
            }
        } catch (err) {
            newContent = true;
        }
        if (namesMap.size !== 0) {
            if (!quiet) console.error(colors.yellow(`[pdblegacy] Symbol searching...`));
            let content = newContent ? bedrock_server_exe.md5 + '\r\n' : lineEnd ? '' : '\r\n';
            if (undecorateFlags == null) {
                for (const name of namesMap) {
                    const addr = proc[name];
                    (out as any)[name] = addr;

                    if (addr == null) {
                        if (!quiet) console.error(colors.red(`[pdblegacy] Symbol not found: ${name}`));
                    } else {
                        content += `${name} = 0x${addr.subptr(dllraw.current).toString(16)}\r\n`;
                    }
                }
            } else {
                for (const symbol of pdbcache.readKeys()) {
                    const name = pdb.undecorate(symbol, undecorateFlags);
                    if (namesMap.delete(name)) {
                        const addr = proc[symbol];
                        (out as any)[name] = addr;
                        if (addr == null) {
                            if (!quiet) console.error(colors.red(`[pdblegacy] Symbol not found: ${name}`));
                        } else {
                            content += `${name} = 0x${addr.subptr(dllraw.current).toString(16)}\r\n`;
                        }
                        if (namesMap.size === 0) break;
                    }
                }
            }
            if (newContent) {
                fs.writeFileSync(cacheFilePath, content, 'utf8');
            } else if (content !== '') {
                fs.appendFileSync(cacheFilePath, content, 'utf8');
            }
        }
        return out;
    }

    export function search(callback: (name: string, address: NativePointer) => boolean): void;
    export function search(filter: string|null, callback: (name: string, address: NativePointer) => boolean): void;
    export function search<KEYS extends string[]>(names: KEYS, callback: (name: KEYS[number], address: NativePointer, index: number)=>boolean): void;

    export function search(filter: string|null|((name: string, address: NativePointer) => boolean)|string[], callback?: (name: string, address: NativePointer, index?:number) => boolean): void {
        if (filter == null) {
            for (const key of pdbcache.readKeys()) {
                if (!callback!(key, proc[key])) break;
            }
        } else if (typeof filter === 'string') {
            const regexp = new RegExp(filter.replace(/[*[(.+{^$\\]/g, str=>wildecardRemap[str]));
            for (const key of pdbcache.readKeys()) {
                if (regexp.test(key)) {
                    if (!callback!(key, proc[key])) break;
                }
            }
        } else if (filter instanceof Array) {
            const names = new Map<string, number>();
            for (let i=0;i<filter.length;i++) {
                names.set(filter[i], i);
            }
            for (const key of pdbcache.readKeys()) {
                const idx = names.get(key);
                if (idx == null) continue;
                if (!callback!(key, proc[key], idx)) break;
            }
        } else {
            for (const key of pdbcache.readKeys()) {
                if (!filter(key, proc[key])) break;
            }
        }
    }

    export function getAll(onprogress?:(count:number)=>void):Record<string, NativePointer> {
        let count = 0;
        let next = Date.now()+500;
        for (const key of pdbcache.readKeys()) {
            proc[key];
            const now = Date.now();
            if (now > next) {
                if (onprogress != null) {
                    onprogress(count);
                }
                next += 500;
            }
            count++;
        }
        return proc;
    }

    export interface SymbolInfo {
        address:NativePointer;
        name:string;
    }

    /**
     * get all symbols.
     * @param read calbacked per 100ms, stop the looping if it returns false
     */
    export function getAllEx(read:(data:SymbolInfo[])=>boolean|void):void {
        let count = 0;
        let next = Date.now()+100;
        const array:SymbolInfo[] = [];
        for (const key of pdbcache.readKeys()) {
            proc[key];
            const now = Date.now();
            if (now > next) {
                const res = read(array);
                next += 100;
            }
            count++;
        }
    }
}

for (const key in pdblegacy) {
    (pdb as any)[key] = (pdblegacy as any)[key];
}
