
## BDSX: The Server Modding Project!  
![image](image.png)  
**Windows Only**  
Download: [bdsx.zip](https://github.com/karikera/bdsx/releases)  
* It's standalone!
* It will run `bdsx/index.js` as server script without any settings (Even without experimental play!)
* It has `require` function likes NodeJS!
* It can access file!
* It can write text to console!  
  
It makes more javascript functions to bedrock_server.exe by injecting DLL  
It's very mutable now, I will remove or change API names frequently  

## Files
├ bdsx/ - Project folder  
│  ├ index.js - Javascript File  
│  ├ index.ts - Typescript File, You can delete it If you don't use Typescript  
│  ├ package-lock.json - Installed packages informtaion  
│  ├ package.json - Meta datas for the project  
│  └ tsconfig.json - Compile options for Typescript, You can delete it If you don't use Typescript  
├ server/ - [Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock/)  
├ bin/ - Injector.exe & Injected DLL  
└ bdsx.bat - Launcher  

## How to Build Typescript? (Watch Mode)
You need to install [NodeJS](https://nodejs.org/en/) before use Typescript

* Build with VSCode
1. Open `bdsx/` with VSCode
2. Ctrl + Shift + B
3. Select `tsc: watch`

* Build with Command Line
1. Open `bdsx/` with Prompt
2. run `npm watch`

## JS API Reference
```ts

/**
* Catch global errors
* default error printing is disabled if cb returns false
*/
function setOnErrorListener(cb:(err:Error)=>void|boolean): void;

/**
* Native file, It will open file with CreateFile WinAPI function
* Must be closed
*/
class NativeFile
{
    /**
    * @param path file path
    * @param access bit flags, NativeFile.WRITE or NativeFile.READ
    * @param creation NativeFile.CREATE_NEW or NativeFile.CREATE_ALWAYS or NativeFile.OPEN_EXISTING or NativFile.OPEN_ALWAYS
    */
    constructor(path:string, access:number, creation:number);
    /**
    * NativeFile must be closed after used
    */
    close(): void;
    /**
    * Read as buffer
    * @param offset position from begin of file
    * @param size reading size
    * @param callback callback, error is zero if succeeded
    * @param buffer true = result is buffer, false = result is string
    */
    read(offset:number, size:number, callback:(error:number, buffer:Uint8Array)=>void, buffer:true):void;
    /**
    * Read as string
    * @param offset position from begin of file
    * @param size reading size
    * @param callback callback, error is zero if succeeded
    * @param buffer true = result is buffer, false = result is string
    */
    read(offset:number, size:number, callback:(error:number, buffer:string, bytes:number)=>void, buffer:false):void;
    /**
    * Write file
    * @param offset position from begin of file
    * @param buffer buffer for writing
    * @param callback callback, error is zero if succeeded
    */
    write(offset:number, buffer:string|ArrayBuffer|ArrayBufferView|DataView, callback:(error:number, bytes:number)=>void):void;
    close():void;

    static readonly WRITE:number;
    static readonly READ:number;
    static readonly CREATE_NEW:number;
    static readonly CREATE_ALWAYS:number;
    static readonly OPEN_EXISTING:number;
    static readonly OPEN_ALWAYS:number;
}

/**
* for packet listening
*/
const nethook: {
    /**
    * @param packetId Listening packetId, I refer to this document: https://github.com/NiclasOlofsson/MiNET/blob/master/src/MiNET/MiNET/Net/MCPE%20Protocol%20Documentation.md
    * @param listener Callback function, ptr is native pointer of a parsed packet, 
    * Maybe you cannot find any document about the parsed packet structure
    * Just Read It and Print It!
    */
    setOnPacketReadListener(packetId: number, listener: (ptr: NativePointer, networkIdentifier: string, packetId: number) => void | boolean): void;
    setOnPacketAfterListener(packetId: number, listener: (ptr: NativePointer, networkIdentifier: string, packetId: number) => void | boolean): void;
    setOnPacketAfterListener(packetId: 1, listener: (ptr: NativePointer, networkIdentifier: string, packetId: number, loginInfo: { id: string, ip: string, xuid: string }) => void | boolean): void;
    setOnConnectionClosedListener(listener: (networkIdentifier: string)=>void):void;
};

/**
* for access native pointer
*/
class NativePointer
{
    setAddress(lowBits:number, highBits:number):void;
    move(lowBits: number, highBits?: number): void;
    readUint8():number;
    readUint16():number;
    readUint32():number;
    readInt8():number;
    readInt16():number;
    readInt32():number;
    readPointer():NativePointer;

    /**
    * @param bytes if it's not provided, It will read until reach null character
    */
    readUtf8(bytes?:number):string;
    readBuffer(bytes:number):Uint8Array;
}

enum PacketId;

namespace fs
{
	function writeFile(path: string, content: string): Promise<void>;
	function readFile(path: string): Promise<string>;
}

namespace fsx
{
    writeUtf8FileSync(path: string, content: string): void;
    writeBufferFileSync(path: string, content: Bufferable): void;
    readUtf8FileSync(path: string): string;
    readBufferFileSync(path: string): Uint8Array;

    /**
    *  Current working directory
    */
    cwd(): string;

    /**
    *  Change directory
    */
    chdir(dir:string): void;
}

```

## Build
It needs [ken](https://github.com/karikera/ken) project on same directory to build.  
  
**[parent directory]**  
├ken(https://github.com/karikera/ken)  
└bdsx(https://github.com/karikera/bdsx)  
  
If you build it with `Release` configuration, It will make `bdsx.zip` in solution directory.  
that `bdsx.zip` is standalone server files.
