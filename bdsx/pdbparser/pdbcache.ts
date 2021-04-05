
import path = require('path');
import fs = require('fs');
import { UNDNAME_COMPLETE, UNDNAME_NAME_ONLY } from '../common';
import { pdb } from '../core';
import { NativeModule } from '../dll';

const cachepath = path.join(__dirname, 'pdbcachedata.bin');

function makePdbCache():void {
    if (fs.existsSync(cachepath)) return;
    const exe = NativeModule.get(null);
    const all = pdb.getAll();
    let no = 0;
    const filtered:[number, string][] = [];
    for (const deco in all) {
        let item = deco;
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
        const value = all[deco];
        const address = value.subptr(exe);
        filtered.push([address, undeco]);
    }

    filtered.sort((a,b)=>a[1].localeCompare(b[1]));
    const fd = fs.openSync(cachepath, 'w');
    const intv = new Int32Array(1);
    const NULL = Buffer.alloc(1);
    NULL[0] = 0;

    intv[0] = filtered.length;
    fs.writeSync(fd, intv);
    for (const [address, name] of filtered) {
        intv[0] = address;
        fs.writeSync(fd, intv);
        fs.writeSync(fd, name);
        fs.writeSync(fd, NULL);
    }
    fs.closeSync(fd);
}

makePdbCache();

const BUFFER_SIZE = 1024*16;
export class PdbCache implements Iterable<[number, string]> {
    private readonly fd = fs.openSync(cachepath, 'r');
    private readonly buffer = Buffer.alloc(BUFFER_SIZE);
    private offset = 0;
    private bufsize = 0;
    public readonly total = this._readInt();

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

    *[Symbol.iterator]():IterableIterator<[number, string]> {
        for (;;) {
            const n = this._readInt();
            const str = this._readString();
            yield [n, str];
        }
    }

}
