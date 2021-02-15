
import path = require('path');
import { RawTypeId } from 'bdsx/common';
import { dll } from 'bdsx/dll';
import { isFile } from 'bdsx/util';
import { MAX_PATH } from 'bdsx/windows_h';

const GetDllDirectoryW = dll.kernel32.module.getFunction('GetDllDirectoryW', RawTypeId.Int32, null, RawTypeId.Int32, RawTypeId.Buffer);
const GetSystemDirectoryW = dll.kernel32.module.getFunction('GetSystemDirectoryW', RawTypeId.Int32, null, RawTypeId.Buffer, RawTypeId.Int32);
const GetWindowsDirectoryW = dll.kernel32.module.getFunction('GetWindowsDirectoryW', RawTypeId.Int32, null, RawTypeId.Buffer, RawTypeId.Int32);

function winapiToString(fn:(buffer:Uint8Array, cap:number)=>number):string{
    const buf = Buffer.alloc(MAX_PATH);
    const size = fn(buf, MAX_PATH);
    return buf.slice(0, size).toString('utf16le');
}

function winapiToString2(fn:(cap:number, buffer:Uint8Array)=>number):string{
    const buf = Buffer.alloc(MAX_PATH);
    const size = fn(MAX_PATH, buf);
    return buf.slice(0, size).toString('utf16le');
}


export function findDll(filename:string):string|null {
    // search exe path
    {
        const exePath = process.argv[0];
        const dllpath = path.join(path.dirname(exePath), filename);
        if (isFile(dllpath)) return dllpath;
    }

    // search dll path
    {
        const dlldir = winapiToString2(GetDllDirectoryW);
        const dllpath = path.join(dlldir, filename);
        if (isFile(dllpath)) return dllpath;
    }

    // search system directory
    {
        const systemdir = winapiToString(GetSystemDirectoryW);
        const dllpath = path.join(systemdir, filename);
        if (isFile(dllpath)) return dllpath;
    }

    // search windows directory
    {
        const windir = winapiToString(GetWindowsDirectoryW);
        const dllpath = path.join(windir, filename);
        if (isFile(dllpath)) return dllpath;
    }

    // search pathes
    {
        const pathes = process.env.PATH || '';
        for (const dirname of pathes.split(';')) {
            const dllpath = path.join(dirname, filename);
            if (isFile(dllpath)) return dllpath;
        }
    }
    return null;
}
