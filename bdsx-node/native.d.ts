import { AttributeId, DimensionId, Bufferable } from "./common";

export namespace fs {
    export function writeUtf8FileSync(path: string, content: string): void;
    export function writeBufferFileSync(path: string, content: Bufferable): void;
    export function readUtf8FileSync(path: string): string;
    export function readBufferFileSync(path: string): Uint8Array;

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
        * Read as buffer
        * @param offset position from begin of file
        * @param size reading size
        * @param callback callback, error is zero if succeeded
        */
        readBuffer(offset: number, size: number, callback: (error: string | null, buffer: Uint8Array) => void): void;
        /**
        * Read as string
        * @param offset position from begin of file
        * @param size reading size
        * @param callback callback, error is zero if succeeded
        */
        readUtf8(offset: number, size: number, callback: (error: string | null, buffer: string) => void): void;
        /**
        * Write file
        * @param offset position from begin of file
        * @param buffer buffer for writing
        * @param callback callback, error is zero if succeeded
        */
        writeUtf8(offset: number, buffer: string, callback: (error: string | null, bytes: number) => void): void;
        /**
        * Write file
        * @param offset position from begin of file
        * @param buffer buffer for writing
        * @param callback callback, error is zero if succeeded
        */
        writeBuffer(offset: number, buffer: Bufferable, callback: (error: string | null, bytes: number) => void): void;
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
export function setOnRuntimeErrorListener(cb: ((jsStack:string, nativeStack:string) => void | boolean)|null): void;

/**
 * command listener
 * it can capture all commands
 */
export function setOnCommandListener(cb: ((command:string, originName:string)=>void | number)|null):void;

export namespace ipfilter
{
    export function add(ip:string):void;
    export function remove(ip:string):void;
}

export namespace serverControl
{
    /**
     * stop the BDS
     */
    export function stop():void;
    
    /**
     * Reset scripts
     * It will clear bdsx events and reload modules
     * but cannot clear basic addon events
     */
    export function reset():void;

    /**
    * Request native debugger (not for Javascript)
    */
    export function debug(): void;
}

/**
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

type AfterPacketExtra<ID extends number> = ID extends 1 ? 
    { id: string; xuid: string; }:
    undefined;

/**
* for packet listening
*/
export namespace nethook
{
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
    export function setOnPacketAfterListener<ID extends number>(packetId: ID, listener: ((ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: number, extra:AfterPacketExtra<ID>) => void)|null): void;
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
    getAddress():string[];
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
     */
    getCxxString(offset?:number): string;

    /**
     * set C++ std::string
     * Need to target pointer to string
     * It will call string::assign method to pointer
     */
    setCxxString(str:string, offset?:number): void;

    /**
     * get UTF16 string
     * @param bytes if it's not provided, It will read until reach null character
     */
    getUtf16(bytes?: number, offset?:number): string;

    /**
     * set UTF16 string
     */
    setUtf16(text: string, offset?:number): void;

    /**
     * get UTF8 string
     * @param bytes if it's not provided, It will read until reach null character
     */
    getUtf8(bytes?: number, offset?:number): string;

    /**
     * set UTF8 string
     */
    setUtf8(text: string, offset?:number): void;

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
    * read C++ std::string
    */
    readCxxString(): string;

    /**
    * write C++ std::string
    * Need to target pointer to string
    * It will call string::assign method to pointer
    */
    writeCxxString(str:string): void;

    /**
     * read UTF16 string
     * @param bytes if it's not provided, It will read until reach null character
     */
    readUtf16(bytes?: number): string;

    /**
     * write UTF16 string
     */
    writeUtf16(text: string): void;

    /**
     * read UTF8 string
     * @param bytes if it's not provided, It will read until reach null character
     */
    readUtf8(bytes?: number): string;

    /**
     * write UTF8 string
     */
    writeUtf8(text: string): void;

    readBuffer(bytes: number): Uint8Array;

    writeBuffer(buffer: Bufferable): void;
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
 * MariaDB access
 */
export class MariaDB
{
    constructor(host?:string|null, username?:string|null, password?:string|null, db?:string|null, port?:number);
    close():void;
    ready():void;
    rollback():void;
    commit():void;
    query(query:string, callback:(error:string|null, res:MariaDB.Result)=>void):void;
}

export namespace MariaDB
{
    class Result
    {
        fetch(callback:(row:string[]|null)=>void):void;
        isClosed():boolean;
        close():void;
    }
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

export function execSync(command:string, cwd?:string):string;

export function wget(url:string, callback:(callback:string)=>void):void;

export function loadPdb():{[key:string]:NativePointer};
