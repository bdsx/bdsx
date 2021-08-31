
import path = require('path');
import fs = require('fs');
import { pdb } from '../core';
import { SYMOPT_PUBLICS_ONLY, UNDNAME_COMPLETE } from '../dbghelp';
import { dll } from '../dll';

const cachepath = path.join(__dirname, 'pdbcachedata.bin');
const VERSION = 1;
const EOF = {};

// corrupted
const SKIPS = new Set<string>([
    // wrong return type, class but it's a function itself
    // void __cdecl `public: static class Threading::CustomTLS::TLSManager::getSharedInstance & __ptr64 __cdecl Bedrock::Threading::CustomTLS::TLSManager::getSharedInstance(void)'::`2'::`dynamic atexit destructor for 'sharedInstance''(void)
    '??__FsharedInstance@?1??getSharedInstance@TLSManager@CustomTLS@Threading@Bedrock@@SAAEAV1234@XZ@YAXXZ',
    // wrong return type, class but it's a function itself
    // void __cdecl `public: static struct PlatformUtils::PlatformData::get & __ptr64 __cdecl Bedrock::PlatformUtils::PlatformData::get(void)'::`2'::`dynamic atexit destructor for 'sharedInstance''(void)
    '??__FsharedInstance@?1??get@PlatformData@PlatformUtils@Bedrock@@SAAEAU123@XZ@YAXXZ',
    // wrong parameter type, enum but it's a function itself
    // void __cdecl `enum BlockRenderLayer __cdecl renderMethodToRenderLayer(class std::basic_string<char,struct std::char_traits<char>,class std::allocator<char> > const & __ptr64,enum renderMethodToRenderLayer)'::`2'::`dynamic atexit destructor for 'renderMethodToRenderLayerMap''(void)
    '??__FrenderMethodToRenderLayerMap@?1??renderMethodToRenderLayer@@YA?AW4BlockRenderLayer@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@W41@@Z@YAXXZ',
]);

function makePdbCache():number {
    try {
        const cacheStat = fs.statSync(cachepath);
        const bedrockExe = process.argv0;
        const exeStat = fs.statSync(bedrockExe);
        if (cacheStat.mtimeMs > exeStat.mtimeMs) {
            const fd = fs.openSync(cachepath, 'r');
            const buffer = new Int32Array(1);
            fs.readSync(fd, buffer, 0, 4, null);
            if (buffer[0] === VERSION) return fd;
            fs.closeSync(fd);
        }
    } catch (err) {
    }
    console.log(`[pdbcache.ts] caching...`);

    let no = 0;
    const filtered:SymbolInfo[] = [];
    const fd = fs.openSync(cachepath, 'w');
    const old = pdb.setOptions(SYMOPT_PUBLICS_ONLY);
    pdb.getAllEx(symbols=>{
        for (const info of symbols) {
            let item = info.name;
            no++;
            if (item.length > 2000) {
                console.log(`[pdbcache.ts] skipped ${no}, too long (deco_length == ${item.length})`);
                continue; // too long
            }

            if (SKIPS.has(item)) continue;
            if (item.startsWith('__imp_?')) { // ?
                item = item.substr(6);
            }
            item = pdb.undecorate(item, UNDNAME_COMPLETE);
            if (item.startsWith('?')) {
                console.log(`[pdbcache.ts] unresolved symbol: ${item}`);
                continue;
            }
            if (item.length > 4050) {
                console.log(`[pdbcache.ts] skipped ${no}, too long (undeo_length == ${item.length})`);
                continue; // too long
            }
            if (item.startsWith('__IMPORT_DESCRIPTOR_api-')) { // ?
                continue;
            }
            if (item.startsWith('_CT??')) { // ?
                continue;
            }
            if (item.startsWith('__@@_')) { // ?
                continue;
            }
            if (item.startsWith('\x7f')) { // ?
                continue;
            }
            if (/^_CTA[0-9]\?/.test(item)) { // ?
                continue;
            }
            if (/^_TI[0-9]\?/.test(item)) { // ?
                continue;
            }
            if (item.startsWith('_TI5?')) { // ?
                continue;
            }
            if (item.startsWith("TSS0<`template-parameter-2',")) { // ?
                continue;
            }
            if (/^__real@[0-9a-z]+$/.test(item)) { // constant values
                continue;
            }
            if (/^__xmm@[0-9a-z]+$/.test(item)) { // constant values
                continue;
            }
            if (/^__sse2_sinf4@@[0-9a-z]+$/.test(item)) { // constant values
                continue;
            }
            if (/^__sse4_sinf4@@[0-9a-z]+$/.test(item)) { // constant values
                continue;
            }
            const address = info.address.subptr(dll.current);
            filtered.push({address, name: item});
        }
    });
    pdb.setOptions(old);

    const intv = new Int32Array(3);
    const singleInt = intv.subarray(0, 1);
    const NULL = Buffer.alloc(1);
    NULL[0] = 0;

    intv[0] = VERSION;
    intv[1] = filtered.length;
    fs.writeSync(fd, intv.subarray(0, 2));
    for (const {address, name} of filtered) {
        singleInt[0] = address;
        fs.writeSync(fd, singleInt);
        fs.writeSync(fd, name);
        fs.writeSync(fd, NULL);
    }
    fs.closeSync(fd);
    const rfd = fs.openSync(cachepath, 'r');
    fs.readSync(rfd, intv, 0, 4, null);
    console.log(`[pdbcache.ts] done`);
    return rfd;
}

const BUFFER_SIZE = 1024*16;
export interface SymbolInfo {
    address:number;
    name:string;
}

export class PdbCache implements Iterable<SymbolInfo> {
    private readonly fd:number;
    private readonly buffer = Buffer.alloc(BUFFER_SIZE);
    private offset = 0;
    private bufsize = 0;
    public readonly total:number;

    constructor() {
        this.fd = makePdbCache();
        this.total = this._readInt();
    }

    close():void {
        fs.closeSync(this.fd);
    }

    private _need(need?:number):void {
        const remained = this.bufsize - this.offset;
        if (need != null && remained >= need) return;

        this.buffer.set(this.buffer.subarray(this.offset, this.bufsize));
        const readed = fs.readSync(this.fd, this.buffer, remained, BUFFER_SIZE - remained, null);
        this.bufsize = readed + remained;
        this.offset = 0;
        if (need != null) {
            if (this.bufsize < need) {
                throw EOF;
            }
        } else {
            if (readed <= 0) {
                throw EOF;
            }
        }
    }

    private _readInt():number {
        this._need(4);
        const n = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return n;
    }

    private _readString():string {
        let nullend = this.buffer.indexOf(0, this.offset);
        if (nullend === -1 || nullend >= this.bufsize) {
            const lastidx = this.bufsize - this.offset;
            this._need();
            nullend = this.buffer.indexOf(0, lastidx);
            if (nullend === -1|| nullend >= this.bufsize) {
                throw Error(`Null character not found, (bufsize=${this.bufsize})`);
            }
        }

        const str = this.buffer.subarray(this.offset, nullend).toString('utf8');
        this.offset = nullend+1;
        return str;
    }

    *[Symbol.iterator]():IterableIterator<SymbolInfo> {
        try {
            for (;;) {
                const address = this._readInt();
                const name = this._readString();
                yield {address, name};
            }
        } catch (err) {
            if (err !== EOF) throw err;
        }
    }
}
