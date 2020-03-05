
import { fs, encode, decode } from "./native";
import { Bufferable, Encoding, TypeFromEncoding } from "./common";
import Event from "krevent";

import File = fs.File;

export interface ReadReport<T>
{
    data:T;
    readedBytes:number;
    failed:Uint8Array|null;
}

export interface WriteReport
{
    writedBytes:number;
    failed:Uint8Array|null;
}

declare module './native'
{
    namespace fs
    {
        export interface File
        {
            /**
             * Read as a string
             * @param offset position from begin of file
             * @param size reading size
             */
            readString<T extends Encoding>(offset: number, size: number, encoding?:T): Promise<ReadReport<TypeFromEncoding<T>>>;

            /**
             * Write file
             * @param offset position from begin of file
             * @param buffer buffer for writing
             */
            writeString(offset: number, buffer: string, encoding?:Encoding): Promise<WriteReport>;
            
            /**
            * Read as a buffer
            * @param offset position from begin of file
            * @param size reading size
            */
            readBuffer(offset: number, size: number):Promise<Uint8Array>;
                   
            /**
             * Write file
             * @param offset position from begin of file
             * @param buffer buffer for writing
             */
            writeBuffer(offset: number, buffer: Bufferable): Promise<number>;
        }
    }
}

File.prototype.readBuffer = function(offset: number, size: number):Promise<Uint8Array>
{
    return new Promise((resolve, reject)=>{
        this.read(offset, size, (err, data)=>{
            if (err) reject(Error(err));
            else resolve(data);
        });
    });
};

File.prototype.readString = function<T extends Encoding>(offset: number, size: number, encoding?:T): Promise<ReadReport<TypeFromEncoding<T>>>
{
    return new Promise((resolve, reject)=>{
        this.read(offset, size, (err, data)=>{
            const [decoded, readedlen] = decode<T>(data, encoding);
            if (err) reject(Error(err));
            else resolve({
                data: decoded,
                readedBytes: data.length,
                failed: data.length === readedlen ? null : data.subarray(readedlen),
            });
        });
    });
}

File.prototype.writeString = function(offset: number, buffer: string|Bufferable, encoding?:Encoding): Promise<WriteReport>
{
    return new Promise((resolve, reject)=>{
        const buf = encode(buffer, encoding);
        this.write(offset, buf, (err, bytes)=>{
            if (err) reject(Error(err));
            else resolve({
                writedBytes: bytes,
                failed: buf.subarray(bytes)
            });
        });
    });
};

File.prototype.writeBuffer = function(offset: number, buffer: Bufferable): Promise<number>
{
    return new Promise((resolve, reject)=>{
        this.write(offset, buffer, (err, bytes)=>{
            if (err) reject(Error(err));
            else resolve(bytes);
        });
    });
};

export { File, File as NativeFile };
export const readFileSync = fs.readUtf8FileSync;
export const writeFileSync = fs.writeUtf8FileSync;
export const appendFileSync = fs.appendUtf8FileSync;
export const cwd = fs.cwd;
export const chdir = fs.chdir;

export async function writeFile(path: string, content: string, encoding?:Encoding): Promise<void> {
    const file = new File(path, File.WRITE, File.CREATE_ALWAYS);
    try
    {
        let buf = encode(content, encoding);
        let offset = 0;
        while (buf.length !== 0)
        {
            const writed = await file.writeBuffer(offset, buf);
            offset += writed;
            buf = buf.subarray(writed);
        }
        file.close();
    }
    catch (err)
    {
        file.close();
        throw err;
    }
}

export async function appendFile(path: string, content: string, encoding?:Encoding): Promise<void> {
    const file = new File(path, File.WRITE, File.OPEN_ALWAYS);
    try
    {
        let buf = encode(content, encoding);
        while (buf.length !== 0)
        {
            const writed = await file.writeBuffer(-1, buf);
            buf = buf.subarray(writed);
        }
        file.close();
    }
    catch (err)
    {
        file.close();
        throw err;
    }
}

export async function readFile(path: string, encoding?:Encoding): Promise<string> {
    const file = new File(path, File.READ, File.OPEN_EXISTING);
    let out = '';
    let byteOffset = 0;
    let remained:Uint8Array|null = null;
    try
    {
        for (;;)
        {
            let data = await file.readBuffer(byteOffset, 8192);
            if (data.length == 0) {
                file.close();
                return out;
            }
            byteOffset += data.length;

            if (remained)
            {
                const concat = new Uint8Array(remained.length + data.length);
                concat.set(remained);
                concat.set(data, remained.length);
                data = concat;
            }
            const [decoded, decodedBytes] = decode(data, encoding);
            out += decoded;
            remained = data.subarray(decodedBytes);
        }
    }
    catch (err)
    {
        file.close();
        throw err;
    }
}

export function resolve(path:string):string
{
    path = path.replace(/\//g, '\\');

    let out:string[];
    const dirs = path.split('\\');
    if (dirs[0] !== '' && !dirs[0].endsWith(':'))
    {
        out = cwd().split(/\\/g);
    }
    else
    {
        out = [];
    }

    for (const dir of path.split('\\'))
    {
        if (dir.charAt(0) === '.')
        {
            if (dir.length === 1)
            {
                continue;
            }
            else if (dir.length === 2 && dir.charAt(1) === '.')
            {
                out.pop();
                continue;
            }
        }
        out.push(dir);
    }
    return out.join('\\');
}

export function basename(path:string):string
{
    const idx = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
    if (idx === -1) return path;
    return path.substr(idx+1);
}

export function dirname(path:string):string
{
    const idx = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
    if (idx === -1) return '.';
    return path.substr(0, idx);
}

export class DirectoryWatcher extends fs.Watcher
{
    private static readonly all = new Map<string, DirectoryWatcher>();

    public readonly onCreated = new Event<(path:string)=>void>();
    public readonly onDeleted = new Event<(path:string)=>void>();
    public readonly onModified = new Event<(path:string)=>void>();
    public readonly onRenamed = new Event<(to:string, from:string)=>void>();
    
    private reference:number = 0;

    constructor(path:string)
    {
        super(path, false);

        this.setOnCreated(name=>this.onCreated.fire(name));
        this.setOnDeleted(name=>this.onDeleted.fire(name));
        this.setOnModified(name=>this.onModified.fire(name));
        this.setOnRenamed((to, from)=>this.onRenamed.fire(to, from));
    }

    release():void
    {
        console.assert(this.reference !== 0, "out of reference count");
        this.reference --;
        if (this.reference === 0)
        {
            this.close();
        }
    }

    static getInstance(path:string):DirectoryWatcher
    {
        path = resolve(path);
        let watcher = DirectoryWatcher.all.get(path);
        if (!watcher)
        {
            watcher = new DirectoryWatcher(path);
            DirectoryWatcher.all.set(path, watcher);
        }
        watcher.reference++;
        return watcher;
    }
}

class WatchEvent
{
    private _onCreated:((path:string)=>void)|null = null;
    private _onDeleted:((path:string)=>void)|null = null;
    private _onModified:((path:string)=>void)|null = null;
    private _onRenamed:((to:string, from:string)=>void)|null = null;

    private closed:boolean = false;

    constructor(private readonly shared:DirectoryWatcher)
    {
    }

    setOnCreated(listener:((name:string)=>void)|null)
    {
        if (this.closed) return;
        if (this._onCreated === listener) return;
        if (this._onCreated) this.shared.onCreated.remove(this._onCreated);
        if (listener) this.shared.onCreated.on(listener);
        this._onCreated = listener;
    }
    setOnDeleted(listener:((name:string)=>void)|null)
    {
        if (this.closed) return;
        if (this._onDeleted === listener) return;
        if (this._onDeleted) this.shared.onDeleted.remove(this._onDeleted);
        if (listener) this.shared.onDeleted.on(listener);
        this._onDeleted = listener;
    }
    setOnModified(listener:((name:string)=>void)|null)
    {
        if (this.closed) return;
        if (this._onModified === listener) return;
        if (this._onModified) this.shared.onModified.remove(this._onModified);
        if (listener) this.shared.onModified.on(listener);
        this._onModified = listener;
    }
    setOnRenamed(listener:((to:string, from:string)=>void)|null)
    {
        if (this.closed) return;
        if (this._onRenamed === listener) return;
        if (this._onRenamed) this.shared.onRenamed.remove(this._onRenamed);
        if (listener) this.shared.onRenamed.on(listener);
        this._onRenamed = listener;
    }

    close():void
    {
        if (this.closed) return;
        this.closed = true;
        if (this._onCreated)
        {
            this.shared.onCreated.remove(this._onCreated);
            this._onCreated = null;
        }
        if (this._onDeleted)
        {
            this.shared.onDeleted.remove(this._onDeleted);
            this._onDeleted = null;
        }
        if (this._onModified)
        {
            this.shared.onModified.remove(this._onModified);
            this._onModified = null;
        }
        if (this._onRenamed)
        {
            this.shared.onRenamed.remove(this._onRenamed);
            this._onRenamed = null;
        }
        this.shared.release();
    }
}
class FilteredWatchEvent extends WatchEvent
{
    constructor(shared:DirectoryWatcher, private readonly name:string)
    {
        super(shared);
    }

    setOnCreated(listener:((name:string)=>void)|null)
    {
        if (listener) 
        {
            super.setOnCreated(name=>{
                if (name !== this.name) return;
                listener(name);
            });
        }
        else
        {
            super.setOnCreated(null);
        }
    }
    setOnDeleted(listener:((name:string)=>void)|null)
    {
        if (listener) 
        {
            super.setOnDeleted(name=>{
                if (name !== this.name) return;
                listener(name);
            });
        }
        else
        {
            super.setOnDeleted(null);
        }
    }
    setOnModified(listener:((name:string)=>void)|null)
    {
        if (listener) 
        {
            super.setOnModified(name=>{
                if (name !== this.name) return;
                listener(name);
            });
        }
        else
        {
            super.setOnModified(null);
        }
    }
    setOnRenamed(listener:((to:string, from:string)=>void)|null)
    {
        if (listener) 
        {
            super.setOnRenamed((to, from)=>{
                if (from !== this.name && to !== this.name) return;
                listener(to, from);
            });
        }
        else
        {
            super.setOnRenamed(null);
        }
    }
}

export function watch(path:string):WatchEvent
{
    path = resolve(path);
    const watcher = DirectoryWatcher.getInstance(dirname(path));
    return new FilteredWatchEvent(watcher, basename(path));
}

export function watchDir(path:string):WatchEvent
{
    const watcher = DirectoryWatcher.getInstance(path);
    return new WatchEvent(watcher);
}

