import * as fs from 'fs';
import * as path from 'path';
import { StorageData, StorageDriver } from ".";
import { fsutil } from "../fsutil";
import { hexn } from "../util";
import { BufferReader, BufferWriter } from '../writer/bufferstream';
import { jsdata } from "./jsdata";

const globalClassId = '#global';

const FILE_DB_VERSION_0 = 0;

const WRITING_EXT = '.writing';
const DB_EXT = '.db';
const ALIAS_EXT = '.alias';

function toFileName(name:string):string {
    return name.replace(/[\x00-\x1f\\/?<>:*|%$"#]/g, chr=>{
        if (chr === '/') return '$';
        return '%'+hexn(chr.charCodeAt(0), 2);
    });
}

function fromFileName(name:string):string {
    return name.replace(/(?:%[0-9A-F]{2}|\$)/g, matched=>{
        if (matched === '$') return '/';
        else return String.fromCharCode(parseInt(matched.substr(1), 16));
    });
}

function ignoreFileNotFound(err:NodeJS.ErrnoException):void {
    if (err.code !== 'ENOENT') throw err;
}

/**
 * rough driver for bdsx storage
 */
export class FileStorageDriver extends StorageDriver {
    private readonly loading:Promise<void>;
    public readonly basePath:string;

    constructor(basePath:string) {
        super();
        this.basePath = path.join(basePath);
        this.loading = this._load();
    }
    private async _load():Promise<void> {
        await fsutil.mkdirRecursive(this.basePath);
    }
    private _getClassPath(classId:string|null):string {
        return path.join(this.basePath, classId === null ? globalClassId : toFileName(classId));
    }

    async write(classId:string|null, mainId:string, aliasId:string|null, data:StorageData):Promise<void> {
        await this.loading;

        const classPath = this._getClassPath(classId);
        await fsutil.mkdir(classPath);

        const classPathSep = classPath + path.sep;
        const linkBuffer = Buffer.from(mainId, 'utf8');

        async function checkOldFile(oldFilePath:string):Promise<boolean> {
            try {
                const content = await fsutil.readFile(oldFilePath, null);
                return content.equals(linkBuffer);
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
                return false;
            }
        }

        async function writeAliasFile(oldId:string|null, newId:string|null):Promise<void> {
            if (oldId != null) {
                const oldFilePath = classPathSep+toFileName(oldId)+ALIAS_EXT;
                if (await checkOldFile(oldFilePath)) {
                    if (newId === oldId) return;
                    if (newId !== null) {
                        await fsutil.rename(oldFilePath, classPathSep+toFileName(newId)+ALIAS_EXT);
                    } else {
                        await fsutil.unlinkQuiet(oldFilePath);
                    }
                    return;
                }
            }
            if (newId === null) return;
            proms.push(fsutil.writeFile(classPathSep+toFileName(newId)+ALIAS_EXT, linkBuffer));
        }

        async function writeMainFile(data:unknown):Promise<void> {
            const filePathBase = classPathSep+toFileName(mainId);
            const filePathWriting = filePathBase+WRITING_EXT;
            const writer = new BufferWriter;
            writer.writeVarUint(FILE_DB_VERSION_0);
            jsdata.serialize(data, writer);
            jsdata.serialize(aliasId, writer);
            const buffer = writer.buffer();
            await fsutil.writeFile(filePathWriting, buffer);
            await fsutil.rename(filePathWriting, filePathBase+DB_EXT);
        }
        const proms:Promise<unknown>[] = [];
        if (data.data !== undefined) {
            proms.push(writeMainFile(data.data));
        }
        if (data.mainId !== null) {
            if (mainId !== data.mainId || data.data === undefined) {
                proms.push(fsutil.unlinkQuiet(classPathSep+toFileName(data.mainId)+DB_EXT));
            }
        }
        proms.push(writeAliasFile(data.aliasId, aliasId));
        await Promise.all(proms);
    }
    private _parse(id:string, dataBuffer:Buffer):StorageData {
        const reader = new BufferReader(dataBuffer);
        const version = reader.readVarUint();
        switch (version) {
        case FILE_DB_VERSION_0: {
            const data = jsdata.deserialize(reader);
            const aliasId = jsdata.deserialize(reader);
            return { mainId: id, aliasId, data };
        }
        default:
            throw Error(`Unsupported File DB, version=${version}`);
        }
    }
    async read(classId:string|null, id:string):Promise<StorageData|null> {
        const classPath = this._getClassPath(classId);
        for (;;) {
            const filePathBase = classPath+path.sep+toFileName(id);
            const [dataBuffer, linkTo] = await Promise.all([
                fsutil.readFile(filePathBase+DB_EXT, null).catch(ignoreFileNotFound),
                fsutil.readFile(filePathBase+ALIAS_EXT).catch(ignoreFileNotFound),
            ]);
            if (dataBuffer != null) {
                return this._parse(id, dataBuffer);
            }
            if (linkTo != null) {
                id = linkTo;
                continue;
            }
            return null;
        }
    }
    readSync(classId:string|null, id:string):StorageData|null {
        const classPath = this._getClassPath(classId);
        for (;;) {
            const filePathBase = classPath+path.sep+toFileName(id);
            try {
                const dataBuffer = fs.readFileSync(filePathBase+DB_EXT, null);
                return this._parse(id, dataBuffer);
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }
            try {
                id = fs.readFileSync(filePathBase+ALIAS_EXT, 'utf8');
                continue;
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }
            return null;
        }
    }

    createIndex(classId:string, indexKey:string):Promise<void> {
        throw Error('not implemented yet');
    }
    deleteIndex(classId:string, indexKey:string):Promise<void> {
        throw Error('not implemented yet');
    }
    search(classId:string, indexKey:string, value:unknown):AsyncIterableIterator<string> {
        throw Error('not implemented yet');
    }

    async *list(classId:string|null):AsyncIterableIterator<string> {
        const classPath = this._getClassPath(classId);
        const dir = await fsutil.opendir(classPath);
        for (;;) {
            const res = await dir.read();
            if (res === null) {
                await dir.close();
                return;
            }
            if (res.name.endsWith(ALIAS_EXT)) continue;
            yield fromFileName(res.name.substr(0, res.name.length-ALIAS_EXT.length));
            dir.close();
        }
    }
    async *listClass():AsyncIterableIterator<string> {
        const dir = await fsutil.opendir(this.basePath);
        for (;;) {
            const res = await dir.read();
            if (res === null) {
                await dir.close();
                return;
            }
            yield fromFileName(res.name);
            dir.close();
        }
    }
}
