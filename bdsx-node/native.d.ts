import { AttributeId, DimensionId, Bufferable, Encoding, TypeFromEncoding } from "./common";

export namespace fs {
    export function appendFileSync(path: string, content: string|Bufferable, encoding?:Encoding): void;
    export function writeFileSync(path: string, content: string|Bufferable, encoding?:Encoding): void;
    export function readFileSync<T extends Encoding=Encoding.Utf8>(path: string, encoding?:T): TypeFromEncoding<T>;
    export function deleteFileSync(path: string):boolean;
    export function deleteRecursiveSync(path: string):boolean;
    export function copyFileSync(from: string, to: string):boolean;
    export function copyRecursiveSync(from: string, to: string):boolean;
    export function mkdirSync(path: string):boolean;
    export function mkdirRecursiveSync(path: string):boolean;

    /**
    *  Current working directory
    */
    export function cwd(): string;

    /**
    *  Change directory
    */
    export function chdir(dir: string): void;

    /**
    * Native file, It will open file with CreateFile WinAPI function
    * Must be closed
    */
    export class File {
        /**
        * @param path file path
        * @param access bit flags, NativeFile.WRITE or NativeFile.READ
        * @param creation NativeFile.CREATE_NEW or NativeFile.CREATE_ALWAYS or NativeFile.OPEN_EXISTING or NativFile.OPEN_ALWAYS
        */
        constructor(path: string, access: number, creation: number);
        /**
        * NativeFile must be closed after used
        */
        close(): void;
        /**
        * Read as a buffer
        * @param offset position from begin of file
        * @param size reading size
        * @param callback callback, error is zero if succeeded
        */
        read(offset: number, size: number, callback: (error: string | null, buffer: Uint8Array) => void): void;
        /**
        * Write file
        * @param offset position from begin of file
        * @param buffer buffer for writing
        * @param callback callback, error is zero if succeeded
        */
        write(offset: number, buffer: Bufferable, callback: (error: string | null, bytes: number) => void): void;
        /**
        * get file size
        * is not async function
        */
        size(): number;

        static readonly WRITE: number;
        static readonly READ: number;
        static readonly CREATE_NEW: number;
        static readonly CREATE_ALWAYS: number;
        static readonly OPEN_EXISTING: number;
        static readonly OPEN_ALWAYS: number;
    }

    /**
    * Watch directory changes
    */
    export class Watcher {
        constructor(path:string, subtree?:boolean);
        setOnCreated(func: (name: string) => void): void;
        setOnDeleted(func: (name: string) => void): void;
        setOnModified(func: (name: string) => void): void;
        setOnRenamed(func: (newname: string, oldname: string) => void): void;
        close():void;
    }
}

/**
* Catch global errors
* default error printing is disabled if cb returns false
*/
export function setOnErrorListener(cb: ((err: Error) => void | boolean)|null): void;
export function setOnRuntimeErrorListener(cb: ((jsStack:string, nativeStack:string, lastSender:string) => void | boolean)|null): void;

/**
 * command listener
 * it can capture all commands
 */
export function setOnCommandListener(cb: ((command:string, originName:string)=>void | number)|null):void;

export namespace ipfilter
{
    export function add(ip:string, periodSeconds?:number):void;
    export function remove(ip:string):boolean;
    export function has(ip:string):boolean;
    export function logTraffic(path:string|null):void;
    export function setTrafficLimit(bytes:number):void;
    export function setTrafficLimitPeriod(seconds:number):void;
}

export namespace serverControl
{
    /**
     * stop the BDS
     * It will stop next tick
     */
    export function stop():void;
    
    /**
     * Reset scripts
     * It will clear bdsx events and reload modules
     * but cannot clear basic addon events
     * @deprecated too unstable
     */
    export function reset():void;

    /**
    * Request native debugger (not for Javascript)
    */
    export function debug(): void;
    
    /**
     * shutdown server and restart
     */
    export function restart(forceTerminate?:false):void;
    
    /**
     * shutdown server and restart
     */
    export function restart(forceTerminate:true):never;
}

/**
 * @deprecated use node.js standard IO
 * Native console object
 */
export const console: {
    /**
    * print message to console
    */
    log(message: string): void;
    /**
    * set text color
    * @param color color bit flags, You can composite like console.FOREGROUND_BLUE | console.FOREGROUND_RED
    */
    setTextAttribute(color: number): void;
    /**
    * get text color
    */
    getTextAttribute(): number;
    readonly FOREGROUND_BLUE: number;
    readonly FOREGROUND_GREEN: number;
    readonly FOREGROUND_RED: number;
    readonly FOREGROUND_INTENSITY: number;
    readonly BACKGROUND_BLUE: number;
    readonly BACKGROUND_GREEN: number;
    readonly BACKGROUND_RED: number;
    readonly BACKGROUND_INTENSITY: number;
};

/**
* for packet listening
*/
export namespace nethook
{
    /**
     * @param ptr login packet pointer
     * @return [xuid, username]
     */
    export function readLoginPacket(ptr: StaticPointer):[string, string];

    /**
    * @param packetId You can use enum PacketId
    * It will bring raw packet buffers before parsing
    * It will cancel the packet if you return false
    */
    export function setOnPacketRawListener(packetId: number, listener: ((ptr: NativePointer, size: number, networkIdentifier: NetworkIdentifier, packetId: number) => void | boolean)|null):void;

    /**
    * @param packetId You can use enum PacketId
    * It will bring parsed packets by the native
    * It will cancel the packet if you return false
    * Maybe you cannot find any documents about the parsed packet structure
    * You need to discover it self!
    */
    export function setOnPacketBeforeListener(packetId: number, listener: ((ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: number) => void | boolean)|null): void;
    /**
    * @param packetId You can use enum PacketId
    * It will bring parsed packets by the native
    * This event is called after the packet process, So It's too late to cancel packet.
    * Maybe you cannot find any documents about the parsed packet structure
    * You need to discover it self!
    */
    export function setOnPacketAfterListener(packetId: number, listener: ((ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: number) => void)|null): void;
    /**
    * @param packetId You can use enum PacketId
    * Maybe you cannot find any documents about the parsed packet structure
    * You need to discover it self!
    */
    export function setOnPacketSendListener(packetId: number, listener: ((ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: number) => void)|null): void;
    export function setOnConnectionClosedListener(listener: ((networkIdentifier: NetworkIdentifier) => void)|null): void;

    export function createPacket(packetId:number):SharedPointer;
    export function sendPacket(networkIdentifier:NetworkIdentifier, packet:StaticPointer, whatIsThis?:number):void;
}

export class NetworkIdentifier
{
    /**
     * get IP address
     */
    getAddress():string;
    assignTo(ptr:StaticPointer):void;
    getActor():Actor|null;
    
    static fromPointer(ptr:StaticPointer):NetworkIdentifier;
}

export class StaticPointer
{
    constructor(pointer?:StaticPointer);

    clone():NativePointer;
    add(lowBits: number, highBits?: number):NativePointer;
    sub(lowBits: number, highBits?: number):NativePointer;
    subptr(ptr: StaticPointer):number;
    equals(ptr: StaticPointer):boolean;
    
    setAddress(lowBits: number, highBits: number): void;
    getAddressHigh():number;
    getAddressLow():number;
    
    getUint8(offset?:number): number;
    getUint16(offset?:number): number;
    getUint32(offset?:number): number;
    getInt8(offset?:number): number;
    getInt16(offset?:number): number;
    getInt32(offset?:number): number;
    getFloat32(offset?:number): number;
    getFloat64(offset?:number): number;
    getPointer(offset?:number): NativePointer;
    
    setUint8(value: number, offset?:number): void;
    setUint16(value: number, offset?:number): void;
    setUint32(value: number, offset?:number): void;
    setInt8(value: number, offset?:number): void;
    setInt16(value: number, offset?:number): void;
    setInt32(value: number, offset?:number): void;
    setFloat32(value: number, offset?:number): void;
    setFloat64(value: number, offset?:number): void;
    setPointer(value: StaticPointer, offset?:number): void;

    /**
     * get C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    getCxxString<T extends Encoding=Encoding.Utf8>(offset?:number, encoding?:T): TypeFromEncoding<T>;

    /**
     * set C++ std::string
     * Need to target pointer to string
     * It will call string::assign method to pointer
     * @param encoding default = Encoding.Utf8
     */
    setCxxString(str:string|Bufferable, offset?:number, encoding?:Encoding): void;

    /**
     * get string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call getBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    getString<T extends Encoding=Encoding.Utf8>(bytes?: number, offset?:number, encoding?:T): TypeFromEncoding<T>;
    
    /**
     * set string
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call setBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    setString(text: string, offset?:number, encoding?:Encoding): void;

    getBuffer(bytes: number, offset?:number): Uint8Array;

    setBuffer(buffer: Bufferable, offset?:number): void;
}

/**
* for access native pointer
*/
export class NativePointer extends StaticPointer
{
    constructor(ptr?:StaticPointer);

    move(lowBits: number, highBits?: number): void;
    
    readUint8(): number;
    readUint16(): number;
    readUint32(): number;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readFloat32(): void;
    readFloat64(): void;
    readPointer(): NativePointer;
    
    writeUint8(value: number):void;
    writeUint16(value: number):void;
    writeUint32(value: number):void;
    writeInt8(value: number):void;
    writeInt16(value: number):void;
    writeInt32(value: number):void;
    writeFloat32(value: number): void;
    writeFloat64(value: number): void;
    writePointer(value: StaticPointer): void;

    /**
     * read a C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    readCxxString<T extends Encoding=Encoding.Utf8>(encoding?:T): TypeFromEncoding<T>;

    /**
     * write a C++ std::string
     * Need to target the pointer to a string
     * It will call string::assign method to the pointer
     * @param encoding default = Encoding.Utf8
     */
    writeCxxString(str:string|Bufferable, encoding?:Encoding): void;

    /**
     * read string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call readBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    readString<T extends Encoding=Encoding.Utf8>(bytes?: number, encoding?:T): TypeFromEncoding<T>;

    /**
     * write string
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call writeBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    writeString(text: string, encoding?:Encoding): void;

    readBuffer(bytes: number): Uint8Array;

    writeBuffer(buffer: Bufferable): void;
    
    readVarUint():number;
    readVarInt():number;
    
    /**
     * 
     * @param encoding default = Encoding.Utf8
     */
    readVarString(encoding?:Encoding):string;

    writeVarUint(v:number):void;
    writeVarInt(v:number):void;

    /**
     * 
     * @param encoding default = Encoding.Utf8
     */
    writeVarString(v:string, encoding?:Encoding):void;
}

/**
 * Native entity wrapper
 */
export class Actor extends StaticPointer
{
    private constructor();

    isPlayer():boolean;
    getNetworkIdentifier():NetworkIdentifier;
    sendPacket(packet:StaticPointer):void;

    getTypeId():number;

    getUniqueIdHigh():number;
    getUniqueIdLow():number;
    getRuntimeId():StaticPointer;

    getIdentifier():string;
    getDimension():DimensionId;
    
    getAttribute(id:AttributeId):number;
    setAttribute(id:AttributeId, value:number):void;
    
    static fromPointer(ptr:StaticPointer):Actor;
    static fromUniqueId(_64bit_low:number, _64bit_high:number):Actor;
}

/**
 * C++ std::shared_ptr wrapper
 */
export class SharedPointer extends StaticPointer
{
    constructor(ptr:StaticPointer);
    assignTo(ptr:StaticPointer):void;
    dispose():void;
}

/**
 * native type information
 */
export interface Type<T>
{
    get(ptr:StaticPointer):T;
    set(ptr:StaticPointer, value:T):void;
    ctor?(ptr:StaticPointer):void;
    ctor_copy?(ptr:StaticPointer, from:StaticPointer):void;
    ctor_move?(ptr:StaticPointer, from:StaticPointer):void;
    dtor?(ptr:StaticPointer):void;
    size?:number;
    name:string;
}

/**
 * primitive native type information
 */
export class Primitive implements Type<number>
{
    get(ptr:StaticPointer):number;
    set(ptr:StaticPointer, value:number):void;
    size:number;
    name:string;

    static readonly Uint8:Primitive;
    static readonly Uint16:Primitive;
    static readonly Uint32:Primitive;
    static readonly Int8:Primitive;
    static readonly Int16:Primitive;
    static readonly Int32:Primitive;
    static readonly Float32:Primitive;
    static readonly Float64:Primitive;
}

interface NativeFunction extends Function
{
    (...args: any[]): NativePointer;
    address:NativePointer;
}

/**
 * Load external DLL
 * You can call native functions by name
 */
export class NativeModule
{
    constructor(moduleName:string);
    get(name:string):NativeFunction|null;

    static pointerToFunction(ptr:StaticPointer):NativeFunction;
}

/**
 * @deprecated use npm package
 * MariaDB access
 */
export class MariaDB
{
    constructor(cb?:(error?:string, errno?:number)=>void, host?:string|null, username?:string|null, password?:string|null, db?:string|null, port?:number);
    close():void;
    autocommit(enabled:boolean):void;
    rollback():void;
    commit():void;

    /**
     * @param callbackOrLogError false: suppress error
     */
    query(query:string, callbackOrLogError?:((error:string|null, fieldCount:number)=>void)|boolean):void;
    fetch(callback:(row:(string|null)[]|null)=>void):void;
    close():void;
    closeResult():void;
}

/**
 * @deprecated use node.js
 */
export class Request
{
    send(text:string):void;
    sendFile(file:string):void;
    end():void;
}

/**
 * @deprecated use npm package
 */
export class WebServer
{
    constructor(localPath:string, port?:number);
    page(path:string, cb:(req:Request)=>void):void;
}

/**
 * the alloc function for std::vector
 */
export function std$_Allocate$16(size:number):NativePointer;
/**
 * memory allocate by native c
 */
export function malloc(size:number):NativePointer;
/**
 * memory release by native c
 */
export function free(ptr:StaticPointer):void;

export function getHashFromCxxString(ptr:StaticPointer):NativePointer;

/**
 * @deprecated use node.js
 */
export function execSync(command:string, cwd?:string):string;

/**
 * @deprecated use node.js
 */
export function exec(command:string, cwd?:string, callback?:(output:string)=>void):void;

/**
 * @deprecated use node.js
 */
export function shell(program:string, command:string, cwd?:string):string;

/**
 * @deprecated use node.js
 */
export function wget(url:string, callback:(callback:string)=>void):void;

export function loadPdb():{[key:string]:NativePointer};

export function encode(data:string|Bufferable, encoding?:Encoding):Uint8Array;

/**
 * @return [decoded, decoded bytes]
 */
export function decode<T extends Encoding=Encoding.Utf8>(data:Uint8Array, encoding?:T):[TypeFromEncoding<T>, number];

export const moduleRoot:string;
