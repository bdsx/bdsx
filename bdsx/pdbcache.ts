
import * as colors from 'colors';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config';
import { hashString } from './util';

const cachePath = path.join(Config.BDS_PATH, 'pdbcache.bin');

function openCacheFile():number {
    try {
        return fs.openSync(cachePath, 'r');
    } catch(err) {
        console.error(colors.red(`[BDSX] pdbcache.bin not found`));
        console.log("[BDSX] Please run 'npm i' or " + (process.platform === "win32" ? 'update.bat' : 'update.sh') + " to install it");
        process.exit(0);
    }
}

const fd = openCacheFile();

const HASHMAP_CAP_OFFSET = 4 + 16 + 4; // version + md5 + main rva
const TABLE_OFFSET = HASHMAP_CAP_OFFSET + 4; // version + md5 + main rva + hashmap capacity
const ENTRY_SIZE = 4+4+4; // hash + name offset + rva
const ENTRY_INT_COUNT = ENTRY_SIZE >> 2;

const READ_AT_ONCE = 85;
const buffer = new Uint32Array(READ_AT_ONCE * ENTRY_INT_COUNT);

fs.readSync(fd, buffer, 0, 4, HASHMAP_CAP_OFFSET);
const hashmapCapacity = buffer[0];
const namesOffset = TABLE_OFFSET + ENTRY_SIZE * hashmapCapacity;

interface Entry {
    hash:number;
    nameOffset:number;
    rva:number;
}

function nameEquals(nameOffset:number, keyUtf8:Buffer):boolean {
    const readkey = Buffer.allocUnsafe(keyUtf8.length);
    const readSize = fs.readSync(fd, readkey, 0, readkey.length, nameOffset);
    if (readSize !== readkey.length) return false;
    if (!keyUtf8.equals(readkey)) return false;
    return true;
}
function* readFrom(startIndex:number):IterableIterator<Entry> {
    let readCount:number;
    let index = startIndex;
    let readTo = hashmapCapacity;

    for (;;) {
        const readFrom = index;
        const countToEnd = readTo - index;
        if (READ_AT_ONCE < countToEnd) {
            readCount = READ_AT_ONCE;
            index += readCount;
        } else {
            readCount = countToEnd;
            index = 0;
            readTo = startIndex;
        }
        fs.readSync(fd, buffer, 0, readCount * ENTRY_SIZE, readFrom * ENTRY_SIZE + TABLE_OFFSET);

        const intCount = readCount*3;
        for (let offset=0;offset<intCount;) {
            const hash = buffer[offset++];
            const nameOffset = buffer[offset++];
            const rva = buffer[offset++];

            if (nameOffset === 0) return;
            yield { hash, nameOffset, rva };
        }
        if (index === startIndex) break;
    }
}

export namespace pdbcache {
    export function* readKeys():IterableIterator<string> {
        let offset = namesOffset;
        let buffer = Buffer.allocUnsafe(8192);

        let filled = 0;
        for (;;) {
            const readSize = fs.readSync(fd, buffer, filled, buffer.length - filled, offset);
            if (readSize === 0) break;
            filled += readSize;
            offset += readSize;

            let index = 0;
            for (;;) {
                const nullterm = buffer.indexOf(0, index);
                if (nullterm !== -1 && nullterm < filled) {
                    const key = buffer.subarray(index, nullterm).toString('utf8');
                    yield key;
                    index = nullterm+1;
                } else {
                    const remainedData = filled - index;
                    if (remainedData*2 > buffer.length) {
                        // need to expand
                        const nbuffer = Buffer.allocUnsafe(buffer.length*2);
                        buffer.copy(nbuffer, 0, index, filled);
                        buffer = nbuffer;
                    } else {
                        // need to truncate
                        buffer.copy(buffer, 0, index, filled);
                    }
                    filled -= index;
                    break;
                }
            }
        }
    }

    /**
     * @return -1 if not found
     */
    export function search(key:string):number {
        const hash = hashString(key);
        const keyUtf8 = Buffer.from(key+'\0', 'utf8');
        for (const entry of readFrom(hash % hashmapCapacity)) {
            if (entry.hash === hash && nameEquals(entry.nameOffset, keyUtf8)) {
                return entry.rva;
            }
        }
        return -1;
    }
}
