
import path = require('path');
import fs = require('fs');
import { pdb } from '../core';
import { dll } from '../dll';
import { SYMOPT_PUBLICS_ONLY, UNDNAME_COMPLETE, UNDNAME_NAME_ONLY } from '../dbghelp';

const cachepath = path.join(__dirname, 'pdbcachedata.bin');
const VERSION = 0;

function makePdbCache():number {
    if (fs.existsSync(cachepath)) {
        const fd = fs.openSync(cachepath, 'r');
        const buffer = new Int32Array(1);
        fs.readSync(fd, buffer, 0, 4, null);
        if (buffer[0] === VERSION) return fd;
        fs.closeSync(fd);
    }
    let no = 0;
    const filtered:[number, number, number, string][] = [];
    const fd = fs.openSync(cachepath, 'w');
    const old = pdb.setOptions(SYMOPT_PUBLICS_ONLY);
    pdb.getAllEx(symbols=>{
        for (const info of symbols) {
            let item = info.name;
            no++;
            if (item.length > 2000) {
                console.log(`skipped ${no}, too long (deco_length == ${item.length})`);
                continue; // too long
            }

            if (item.startsWith('__imp_?')) { // ?
                item = item.substr(6);
            }
            item = pdb.undecorate(item, UNDNAME_COMPLETE);
            if (item.startsWith('?')) {
                console.log(`unresolved symbol: ${item}`);
                continue;
            }
            if (item.length > 4050) {
                console.log(`skipped ${no}, too long (undeo_length == ${item.length})`);
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
            const undeco = pdb.undecorate(item, UNDNAME_NAME_ONLY);
            const address = info.address.subptr(dll.current);
            filtered.push([address, info.tag, info.flags, undeco]);
        }
    });
    pdb.setOptions(old);

    const intv = new Int32Array(3);
    const NULL = Buffer.alloc(1);
    NULL[0] = 0;

    intv[0] = VERSION;
    intv[1] = filtered.length;
    fs.writeSync(fd, intv.subarray(0, 2));
    for (const [address, tag, flags, name] of filtered) {
        intv[0] = address;
        intv[1] = tag;
        intv[2] = flags;
        fs.writeSync(fd, intv);
        fs.writeSync(fd, name);
        fs.writeSync(fd, NULL);
    }
    fs.closeSync(fd);
    const rfd = fs.openSync(cachepath, 'r');
    fs.readSync(rfd, intv, 0, 4, null);
    return rfd;
}

const BUFFER_SIZE = 1024*16;
export interface SymbolInfo {
    address:number;
    tag:number;
    flags:number;
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

    static clearCache():void {
        try { fs.unlinkSync(cachepath); } catch(err) {}
    }

    close():void {
        fs.closeSync(this.fd);
    }

    private _readMore():void {
        const remained = this.bufsize - this.offset;
        this.buffer.set(this.buffer.subarray(this.offset));
        this.bufsize = fs.readSync(this.fd, this.buffer, remained, BUFFER_SIZE - remained, null) + remained;
        this.offset = 0;
    }

    private _readInt():number {
        if (this.bufsize - this.offset < 4) this._readMore();
        const n = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return n;
    }

    private _readString():string {
        let nullend = this.buffer.indexOf(0, this.offset);
        if (nullend === -1) {
            this._readMore();
            nullend = this.buffer.indexOf(0, this.offset);
            if (nullend === -1) throw Error(`Null character not found`);
        }

        const str = this.buffer.subarray(this.offset, nullend).toString('utf8');
        this.offset = nullend+1;
        return str;
    }

    *[Symbol.iterator]():IterableIterator<SymbolInfo> {
        for (;;) {
            const address = this._readInt();
            const tag = this._readInt();
            const flags = this._readInt();
            const name = this._readString();
            yield {address, tag, flags, name};
        }
    }
}
