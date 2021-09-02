
import { Bufferable, Encoding, TypeFromEncoding } from "./common";

export interface VoidPointerConstructor
{
    new():VoidPointer;

    fromAddress<T extends VoidPointer>(this:{new():T}, addressLow:number, addressHigh?:number):T;
    fromAddressBin<T extends VoidPointer>(this:{new():T}, addressBin:string):T;
    fromAddressBuffer<T extends VoidPointer>(this:{new():T}, buffer:Bufferable):T;
    fromAddressString<T extends VoidPointer>(this:{new():T}, str:string):T;
    fromAddressFloat<T extends VoidPointer>(this:{new():T}, value:number):T;
}

export declare const VoidPointer:VoidPointerConstructor;

/**
 * the root of all pointer-based classes
 */
export interface VoidPointer {
    equals(ptr: VoidPointer|null): boolean;

    /**
     * make cloned pointer with offset
     */
    add(lowBits?: number, highBits?: number): NativePointer;
    /**
     * make cloned pointer with offset
     */
    sub(lowBits?: number, highBits?: number): NativePointer;
    /**
     * make cloned pointer with offset
     */
    addBin(bin: string): NativePointer;
    /**
     * make cloned pointer with offset
     */
    subBin(bin: string): NativePointer;
    subptr(ptr: VoidPointer): number;
    isNull(): boolean;
    isNotNull(): boolean;
    getAddressHigh(): number;
    getAddressLow(): number;
    getAddressBin(): string;
    getAddressAsFloat(): number;
    /**
     * with radix, it returns like Number.toString.
     * or it retruns 0x0000000000000000 format.
     */
    toString(radix?:number):string;

    as<T extends VoidPointer>(ctor:{new():T}): T;
    addAs<T extends VoidPointer>(ctor:{new():T}, lowBits?: number, highBits?: number): T;
    subAs<T extends VoidPointer>(ctor:{new():T}, lowBits?: number, highBits?: number): T;
    addBinAs<T extends VoidPointer>(ctor:{new():T}, bin: string): T;
    subBinAs<T extends VoidPointer>(ctor:{new():T}, bin: string): T;

    /**
     * pointer of pointer
     * pointer of the 64bits internal address field of this
     * not using currently
     */
    // addressOfThis():NativePointer;
}

/**
 * StaticPointer but protected accessors
 * It's the same class as StaticPointer actually (PrivatePointer === StaticPointer)
 */
export declare class PrivatePointer extends VoidPointer {
    protected getBoolean(offset?: number): boolean;
    protected getUint8(offset?: number): number;
    protected getUint16(offset?: number): number;
    protected getUint32(offset?: number): number;
    protected getUint64AsFloat(offset?: number): number;
    protected getInt8(offset?: number): number;
    protected getInt16(offset?: number): number;
    protected getInt32(offset?: number): number;
    protected getInt64AsFloat(offset?: number): number;
    protected getFloat32(offset?: number): number;
    protected getFloat64(offset?: number): number;
    protected getNullablePointer(offset?: number): NativePointer|null;
    protected getNullablePointerAs<T extends VoidPointer>(ctor:{new():T}, offset?: number): T|null;
    protected getPointer(offset?: number): NativePointer;
    protected getPointerAs<T extends VoidPointer>(ctor:{new():T}, offset?: number): T;

    protected fill(bytevalue:number, bytes:number, offset?: number): void;
    protected copyFrom(from: VoidPointer, bytes:number, this_offset?: number, from_offset?:number): void;
    protected setBoolean(value: boolean, offset?: number): void;
    protected setUint8(value: number, offset?: number): void;
    protected setUint16(value: number, offset?: number): void;
    protected setUint32(value: number, offset?: number): void;
    protected setUint64WithFloat(value: number, offset?: number): void;
    protected setInt8(value: number, offset?: number): void;
    protected setInt16(value: number, offset?: number): void;
    protected setInt32(value: number, offset?: number): void;
    protected setInt64WithFloat(value: number, offset?: number): void;
    protected setFloat32(value: number, offset?: number): void;
    protected setFloat64(value: number, offset?: number): void;
    protected setPointer(value: VoidPointer|null, offset?: number): void;

    /**
     * get C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    protected getCxxString<T extends Encoding = Encoding.Utf8>(offset?: number, encoding?: T): TypeFromEncoding<T>;

    /**
     * set C++ std::string
     * Need to target pointer to string
     * It will call string::assign method to pointer
     * @param encoding default = Encoding.Utf8
     */
    protected setCxxString(str: string | Bufferable, offset?: number, encoding?: Encoding): void;

    /**
     * get string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call getBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    protected getString<T extends Encoding = Encoding.Utf8>(bytes?: number, offset?: number, encoding?: T): TypeFromEncoding<T>;

    /**
     * set string with null character
     * @param encoding default = Encoding.Utf8
     * @return written bytes without null character
     * if encoding is Encoding.Buffer it will call setBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    protected setString(text: string, offset?: number, encoding?: Encoding): number;

    protected getBuffer(bytes: number, offset?: number): Uint8Array;

    protected setBuffer(buffer: Bufferable, offset?: number): void;

    /**
     * Read memory as binary string.
     * It stores 2bytes per character
     * @param words 2bytes per word
     */
    protected getBin(words: number, offset?:number): string;

    /**
     * is same with getBin(4).
     * It stores 2bytes per character for 64bits.
     */
    protected getBin64(offset?:number): string;

    /**
     * Write memory with binary string.
     * It reads 2bytes per character
     * @param words 2bytes per word
     */
    protected setBin(v:string, offset?:number): void;

    protected setInt32To64WithZero(value: number, offset?: number): void;
    protected setFloat32To64WithZero(value: number, offset?: number): void;

    protected interlockedIncrement16(offset?:number):number;
    protected interlockedIncrement32(offset?:number):number;
    protected interlockedIncrement64(offset?:number):number;
    protected interlockedDecrement16(offset?:number):number;
    protected interlockedDecrement32(offset?:number):number;
    protected interlockedDecrement64(offset?:number):number;
    protected interlockedCompareExchange8(exchange:number, compare:number, offset?:number):number;
    protected interlockedCompareExchange16(exchange:number, compare:number, offset?:number):number;
    protected interlockedCompareExchange32(exchange:number, compare:number, offset?:number):number;
    protected interlockedCompareExchange64(exchange:string, compare:string, offset?:number):string;

    protected getJsValueRef(offset?:number):any;
    protected setJsValueRef(value:unknown, offset?:number):void;
}

/**
 * the pointer with accessors
 */
export declare class StaticPointer extends PrivatePointer {
    getBoolean(offset?: number): boolean;
    getUint8(offset?: number): number;
    getUint16(offset?: number): number;
    getUint32(offset?: number): number;
    getUint64AsFloat(offset?: number): number;
    getInt8(offset?: number): number;
    getInt16(offset?: number): number;
    getInt32(offset?: number): number;
    getInt64AsFloat(offset?: number): number;
    getFloat32(offset?: number): number;
    getFloat64(offset?: number): number;
    getNullablePointer(offset?: number): NativePointer|null;
    getNullablePointerAs<T extends VoidPointer>(ctor:{new():T}, offset?: number): T|null;
    getPointer(offset?: number): NativePointer;
    getPointerAs<T extends VoidPointer>(ctor:{new():T}, offset?: number): T;

    fill(bytevalue:number, bytes:number, offset?: number): void;
    copyFrom(from: VoidPointer, bytes:number, this_offset?: number, from_offset?:number): void;
    setBoolean(value: boolean, offset?: number): void;
    setUint8(value: number, offset?: number): void;
    setUint16(value: number, offset?: number): void;
    setUint32(value: number, offset?: number): void;
    setUint64WithFloat(value: number, offset?: number): void;
    setInt8(value: number, offset?: number): void;
    setInt16(value: number, offset?: number): void;
    setInt32(value: number, offset?: number): void;
    setInt64WithFloat(value: number, offset?: number): void;
    setFloat32(value: number, offset?: number): void;
    setFloat64(value: number, offset?: number): void;
    setPointer(value: VoidPointer|null, offset?: number): void;

    /**
     * get C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    getCxxString<T extends Encoding = Encoding.Utf8>(offset?: number, encoding?: T): TypeFromEncoding<T>;

    /**
     * set C++ std::string
     * Need to target pointer to string
     * It will call string::assign method to pointer
     * @param encoding default = Encoding.Utf8
     */
    setCxxString(str: string | Bufferable, offset?: number, encoding?: Encoding): void;

    /**
     * get string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call getBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    getString<T extends Encoding = Encoding.Utf8>(bytes?: number|undefined, offset?: number, encoding?: T): TypeFromEncoding<T>;

    /**
     * set string with null character
     * @param encoding default = Encoding.Utf8
     * @return written bytes without null character
     * if encoding is Encoding.Buffer it will call setBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    setString(text: string, offset?: number, encoding?: Encoding): number;

    getBuffer(bytes: number, offset?: number): Uint8Array;

    setBuffer(buffer: Bufferable, offset?: number): void;

    /**
     * Read memory as binary string.
     * It stores 2bytes per character
     * @param words 2bytes per word
     */
    getBin(words: number, offset?:number): string;

    /**
     * is same with getBin(4).
     * It stores 2bytes per character for 64bits.
     */
    getBin64(offset?:number): string;

    /**
     * Write memory with binary string.
     * It reads 2bytes per character
     * @param words 2bytes per word
     */
    setBin(v:string, offset?:number): void;

    setInt32To64WithZero(value: number, offset?: number): void;
    setFloat32To64WithZero(value: number, offset?: number): void;

    interlockedIncrement16(offset?:number):number;
    interlockedIncrement32(offset?:number):number;
    interlockedIncrement64(offset?:number):number;
    interlockedDecrement16(offset?:number):number;
    interlockedDecrement32(offset?:number):number;
    interlockedDecrement64(offset?:number):number;
    interlockedCompareExchange8(exchange:number, compare:number, offset?:number):number;
    interlockedCompareExchange16(exchange:number, compare:number, offset?:number):number;
    interlockedCompareExchange32(exchange:number, compare:number, offset?:number):number;
    interlockedCompareExchange64(exchange:string, compare:string, offset?:number):string;

    getJsValueRef(offset?:number):any;
    setJsValueRef(value:unknown, offset?:number):void;
}

/**
 * this pointer has the buffer itself
 */
export declare class AllocatedPointer extends StaticPointer {
    constructor(size:number);

    /**
     * allocate a encoded string
     * include the null character
     */
    static fromString(str:string, encoding?:Encoding):AllocatedPointer;
}

export declare class StructurePointer extends PrivatePointer {
    static readonly contentSize:unique symbol;
    static readonly nativeCtor:unique symbol;
    static readonly nativeDtor:unique symbol;
    static [StructurePointer.contentSize]:number;
    constructor(allocateItSelf?:boolean);
}

/**
 * extends of StaticPointer
 * moveable
 * It can be treated as a binary stream
 */
export declare class NativePointer extends StaticPointer {
    move(lowBits: number, highBits?: number): void;
    setAddressPointer(pointer: VoidPointer): void;
    setAddress(lowBits: number, highBits: number): void;
    setAddressBin(bin:string):void;
    setAddressFromBuffer(buffer:Bufferable):void;
    setAddressFromString(str:string):void;
    setAddressWithFloat(value:number):void;


    readBoolean(): boolean;
    readUint8(): number;
    readUint16(): number;
    readUint32(): number;
    readUint64AsFloat(): number;
    readInt8(): number;
    readInt16(): number;
    readInt32(): number;
    readInt64AsFloat(): number;
    readFloat32(): number;
    readFloat64(): number;
    readPointer(): NativePointer;

    writeBoolean(value: boolean): void;
    writeUint8(value: number): void;
    writeUint16(value: number): void;
    writeUint32(value: number): void;
    writeUint64WithFloat(value: number): void;
    writeInt8(value: number): void;
    writeInt16(value: number): void;
    writeInt32(value: number): void;
    writeInt64WithFloat(value: number): void;
    writeFloat32(value: number): void;
    writeFloat64(value: number): void;
    writePointer(value: VoidPointer|null): void;

    /**
     * read a C++ std::string
     * @param encoding default = Encoding.Utf8
     */
    readCxxString<T extends Encoding = Encoding.Utf8>(encoding?: T): TypeFromEncoding<T>;

    /**
     * write a C++ std::string
     * Need to target the pointer to a string
     * It will call string::assign method to the pointer
     * @param encoding default = Encoding.Utf8
     */
    writeCxxString(str: string | Bufferable, encoding?: Encoding): void;

    /**
     * read string
     * @param bytes if it's not provided, It will read until reach null character
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call readBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    readString<T extends Encoding = Encoding.Utf8>(bytes?: number|null, encoding?: T): TypeFromEncoding<T>;

    /**
     * write string
     * @param encoding default = Encoding.Utf8
     * if encoding is Encoding.Buffer it will call writeBuffer
     * if encoding is Encoding.Utf16, bytes will be twice
     */
    writeString(text: string, encoding?: Encoding): void;

    readBuffer(bytes: number): Uint8Array;

    writeBuffer(buffer: Bufferable): void;

    /**
     * Variable length unsigned integer
     * The maximum is 32bits
     */
    readVarUint(): number;

    /**
     * Variable length integer
     * The maximum is 32bits
     */
    readVarInt(): number;

    /**
     * Variable length number
     * Unlimited maximum
     */
    readVarBin(): string;

    /**
     *
     * @param encoding default = Encoding.Utf8
     */
    readVarString(encoding?: Encoding): string;

    /**
     * Variable length unsigned integer
     * The maximum is 32bits
     */
    writeVarUint(v: number): void;

    /**
     * Variable length integer
     * The maximum is 32bits
     */
    writeVarInt(v: number): void;

    /**
     * Variable length number
     * It stores 2bytes per character
     * Unlimited maximum
     */
    writeVarBin(v: string): void;

    /**
     * Variable length number
     * It reads 2bytes per character
     * @param encoding default = Encoding.Utf8
     */
    writeVarString(v: string, encoding?: Encoding): void;

    /**
     * Read memory as binary string.
     * It stores 2bytes per character
     * @param words 2bytes per word
     */
    readBin(words: number): string;

    /**
     * is same with readBin(4).
     * It stores 2bytes per character for 64bits.
     */
    readBin64(): string;

    /**
     * Write memory with binary string.
     * It reads 2bytes per character
     * @param words 2bytes per word
     */
    writeBin(v:string, words: number): string;

    readJsValueRef():any;
    writeJsValueRef(value:unknown):void;
}

export interface RuntimeStack {
    base:NativePointer|null;
    address:NativePointer;
    moduleName:string|null;
    fileName:string|null;
    functionName:string|null;
    lineNumber:number;
}

export declare class RuntimeError extends Error {
    nativeStack?:RuntimeStack[];
    code?:number;
    exceptionInfos?:number[];
}

/**
 * queue for multi threading.
 */
export declare class MultiThreadQueue extends VoidPointer {
    constructor(size:number);

    enqueue(src:VoidPointer):void;

    /**
     * blocking method
     */
    dequeue(dest:VoidPointer):void;

    /**
     * non blocking method
     */
    tryDequeue(dest:VoidPointer):void;

    /**
     * native function
     * void enqueue(MultiThreadQueue*, void*)
     */
    static readonly enqueue:VoidPointer;
    /**
     * native function
     * blocking method
     * void dequeue(MultiThreadQueue*, void*)
     */
    static readonly dequeue:VoidPointer;
    /**
     * native function
     * non blocking method
     * bool tryDequeue(MultiThreadQueue*, void*)
     */
    static readonly tryDequeue:VoidPointer;
}

/**
 * native debug information handlers
 */
export declare namespace pdb
{
    export const coreCachePath:string;

    export function close():void;

    export function getOptions():number;

    /**
     * Wrapper of SymSetOptions
     * You can find more options from https://docs.microsoft.com/en-us/windows-hardware/drivers/debugger/symbol-options
     * @param dbghelpOptions
     */
    export function setOptions(dbghelpOptions:number):number;

    /**
     * undecorate the decorated symbol
     */
    export function undecorate(decorated:string, flags:number):string;

    /**
     * get symbols from cache.
     * if symbols don't exist in cache. it reads pdb.
     * @returns 'out' the first parameter.
     */
    export function getList<OLD extends Record<string, any>, KEY extends string, KEYS extends readonly [...KEY[]]>(cacheFilePath:string, out:OLD, names:KEYS, quiet?:boolean, undecorateFlags?:number):{[key in KEYS[number]]: NativePointer} & OLD;

    /**
     * get all symbols
     */
    export function search(callback: (name: string, address: NativePointer) => boolean): void;

    /**
     * find symbols with a wildcard
     */
    export function search(filter: string|null, callback: (name: string, address: NativePointer) => boolean): void;

    /**
     * find symbols with a name array
     */
    export function search<KEYS extends string[]>(names: KEYS, callback: (name: KEYS[number], address: NativePointer, index: number)=>boolean): void;

    /**
     * get all symbols
     */
    export function getAll(onprogress?:(count:number)=>void):Record<string, NativePointer>;

    export interface SymbolInfo {
        typeIndex:number;
        index:number;
        size:number;
        flags:number;
        value:NativePointer;
        address:NativePointer;
        register:number;
        scope:number;
        tag:number;
        name:string;
    }
    /**
     * get all symbols.
     * @param read calbacked per 100ms, stop the looping if it returns false
     */
    export function getAllEx(read?:(data:SymbolInfo[])=>boolean|void):void;

}

/**
 * native error handling
 */
export declare namespace runtimeError
{
    export function codeToString(code:number):string;
    export function setHandler(handler:(err:RuntimeError)=>void):void;

    /**
     * [[noreturn]] fire(JsValueRef error)
     */
    export const fire:VoidPointer;

    // int raise(EXCEPTION_POINTERS* exptr)
    export const raise: VoidPointer;

    // wrapper of RtlLookupFunctionEntry
    export function lookUpFunctionEntry(address:VoidPointer):[VoidPointer]|[VoidPointer, number, number, number]|null;
    // wrapper of RtlAddFunctionTable
	export function addFunctionTable(functionTable:VoidPointer, entryCount:number, baseAddress:VoidPointer):void;
}

export declare namespace bedrock_server_exe
{
    export const md5:string;

    export const argc: number;

    export const args: VoidPointer;

    export const argsLine: string;

    /**
     * main of bedrock_server.exe
     * int main(int argc, char** args, char** env)
     */
    export const main: VoidPointer;

    /**
     * original bytes of main before hooked
     */
    export const mainOriginal12Bytes: VoidPointer;

    /**
     * kill this process without any termination process
     */
    export function forceKill(exitcode:number):never;
}

export declare namespace uv_async
{
    /**
     * init uv_async for asyncCall
     * need to call before using uv_async.call.
     * if it's called multiple time, it increases a internal reference count.
     */
    export function open():void;

    /**
     * close uv_async
     * if open is called multiple time. also it needs to call close multiple time.
     */
    export function close():void;

    /**
     * native function
     * send and execute the function to the main thread
     * void call(void(*fn)())
     */
    export const call: VoidPointer;

    /**
     * size of the task instance
     */
    export const sizeOfTask:number;

    /**
     * native function
     * allocate the task with a extra buffer for 'uv_async.post'
     * AsyncTask* alloc(void(*fn)(AsyncTask*), size_t extraSize)
     */
    export const alloc: VoidPointer;

    /**
     * native function
     * send and execute the function to the main thread
     * the task can be allocated by 'uv_async.alloc'
     * void post(AsyncTask*)
     */
    export const post: VoidPointer;
}

export declare namespace cgate
{
    export const bdsxCoreVersion:string;

    /**
     * the native function in kernal32.dll
     * HMODULE GetModuleHandleW(LPCWSTR lpModuleName)
     */
    export const GetModuleHandleWPtr: VoidPointer;

    /**
     * the native function in kernal32.dll
     * FARPROC GetProcAddress(HMODULE hModule, LPCSTR lpProcName)
     */
    export const GetProcAddressPtr: VoidPointer;

    /**
     * get NativeModule
     */
    export function GetModuleHandleW(name:string|null):VoidPointer;

    /**
     * get the function pointer from NativeModule
     */
    export function GetProcAddress(nativeModule:VoidPointer, name:string):VoidPointer;

    /**
     * get the function pointer from NativeModule
     */
    export function GetProcAddressByOrdinal(nativeModule:VoidPointer, ordinal:number):VoidPointer;

    /**
     * native function
     * process node uv_loop
     * void nodeLoop(std::chrono::duration<int64_t, std::nano>)
     */
    export const nodeLoop: VoidPointer;

    /**
     * just dummy function
     */
    export const tester: VoidPointer;

    /**
     * it will allocate a executable memory by VirtualAlloc
     */
    export function allocExecutableMemory(size:number, alignment?:number):StaticPointer;

    export function nodeLoopOnce():void;
}

export declare namespace chakraUtil {
    // void* pointer_js2np(JsValueRef value)
    export const pointer_js2class:VoidPointer;

    export function JsCreateFunction(funcptr:VoidPointer, state:VoidPointer|null):(...args:any[])=>any;

    export function JsAddRef(value:unknown):number;

    export function JsRelease(value:unknown):number;

    export function asJsValueRef(value:unknown):VoidPointer;
}

export declare namespace ipfilter
{
    /**
     * block ip
     * It does not store permanently
     * You need to re-add it on startup
     *
     * it blocks packets on very early phase
     */
    export function add(ip:string, periodSeconds?:number):void;

    /**
     * block ip
     * It does not store permanently
     * You need to re-add it on startup
     *
     * it blocks packets on very early phase
     */
     export function addAt(ip:string, unixTimeStamp?:number):void;

    /**
     * un-block ip
     */
    export function remove(ip:string):boolean;

    /**
     * remove all registed filters
     */
    export function clear():void;

    /**
     * check the ip is blocked
     */
    export function has(ip:string):boolean;

    /**
     * get the un-blocking time in unix time stamp
     * 0 : permanent
     * -1 : not found
     */
    export function getTime(ip:string):number;

    /**
     * log traffics to the file
     */
    export function logTraffic(path:string|null):void;

    /**
     * set traffic limit with bytes
     * it will block IP when it exceeds
     */
    export function setTrafficLimit(bytes:number):void;

    /**
     * blocking period for setTrafficLimit
     */
    export function setTrafficLimitPeriod(seconds:number):void;

    /**
     * IP of the last sender
     */
    export function getLastSender():string;


    /**
     * it's called in bedrockServer.launch
     * no need to call manually
     */
    export function init(callbackOnExceeded:(ip:string)=>void):void;

    /**
     * all filtering IPs as Array with [IP, time] pairs.
     * time is for expiring in unix time stamp.
     * if time is 0, it's permanent.
     */
    export function entries():[string, number][];
    /**
     * @deprecated Typo!
     */
    export function entires():[string, number][];
}

type ErrorListener = (err:Error)=>void;

export declare namespace jshook
{
    export function init():void;
    /** @deprecated */
    export function init(onError:ErrorListener):void;
    export function setOnError(onError:ErrorListener):ErrorListener;
    export function getOnError():ErrorListener;
    export function fireError(err:Error):void;
    export const fireErrorPointer:VoidPointer;
}

export declare namespace cxxException
{
    /**
     * void trycatch(void* param, void(*try)(void* param), void(*catch)(void* param, const char* error));
     */
    export const trycatch:VoidPointer;

    /**
     * void cxxthrow();
     * will not pass catch
     */
    export const cxxthrow:VoidPointer;

    /**
     * void cxxthrowString(const char*);
     */
    export const cxxthrowString:VoidPointer;
}

const core = module.exports = (process as any)._linkedBinding('bdsx_core');
core.ipfilter.entries = core.ipfilter.entires;
module.exports.PrivatePointer = module.exports.StaticPointer;
