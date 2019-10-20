
## Bedrock Server X: The Server Modding Project!  
**Windows Only**  
It makes more javascript functions to bedrock_server.exe by injecting DLL  

## How to Apply to server
It needs [NodeJS](https://nodejs.org/)  
Run belows with Command Prompt (You can open Command Prompt with `Windows Key -> cmd -> Enter`)  
```sh
npm i -g bedrock-server-x # install bedrock-server-x
cd path/to/bedrock_server # move to bedrock dedicated server directory
bedrock-server-x # run bedrock-server-x
```

## How to Use it on Addon
If it installed correctly, It will print `ChakraX Attached` at first line in console  
And then You can access `chakraX` global variable in Javascript  

* Use it with Webpack  
I recomment to use it with Webpack  
[My project starter](https://www.npmjs.com/package/mcaddon-start) can make webpack project easily  
You can import it with webpack from `bedrock-server-x` package  
```ts
import {chakraX} from require('bedrock-server-x');
```

## JS API Reference
```ts

namespace chakraX
{
    /**
     * It must be called on system.update
     * It process I/O completion from File Writing/Reading
     */
    function update():void;

    /**
     * Native console object
     */
    const console:{
        /**
         * print message to console
         */
        log(message:string):void;
        setTextAttribute(color:number):void;
        getTextAttribute():number;
        readonly FOREGROUND_BLUE:number;
        readonly FOREGROUND_GREEN:number;
        readonly FOREGROUND_RED:number;
        readonly FOREGROUND_INTENSITY:number;
        readonly BACKGROUND_BLUE:number;
        readonly BACKGROUND_GREEN:number;
        readonly BACKGROUND_RED:number;
        readonly BACKGROUND_INTENSITY:number;
    };

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
        read(offset:number, size:number, callback:(error:number, buffer:Uint8Array)=>void, buffer:true):void;
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
        setListener(packetId: number, listener: (ptr: NativePointer, packetId: number)=>void):void;
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

}

```
