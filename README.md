
## About This
![image](readme_image/image.png)  
It makes more javascript functions to bedrock_server.exe to inject DLL  
This project is **working in progress**

## Build
It needs [ken](https://github.com/karikera/ken) project on same directory to build.  
  
**[parent directory]**  
├ken(https://github.com/karikera/ken)  
└rechakra(https://github.com/karikera/rechakra)  
  
Outputs are `injector.exe` and `rechakra.dll`.  others are useless in this project.  

## Run
`injector.exe "path/to/bedrock_server.exe" rechakra.dll`  

## JS API Reference
```ts

namespace chakraX
{
    /**
     * It need to call in minec
     */
    function update():void;

    /**
     * Print message to console
     */
    function log(message:string):void;

    /**
     * Native file, It will open file with CreateFile WinAPI function
     */
    class NativeFile
    {
        /**
         * @param path file path
         * @param access bit flags, NativeFile.WRITE or NativeFile.READ
         * @param creation NativeFile.CREATE_NEW or NativeFile.CREATE_ALWAYS or NativeFile.OPEN_EXISTING or NativFile.OPEN_ALWAYS
         */
        constructor(path:string, access:number, creation:number);
        read(offset:number, size:number, callback:(error:number, buffer:Uint8Array)=>void, buffer:true):void;
        write(offset:number, buffer:string|ArrayBuffer|ArrayBufferView|DataView, callback:(error:number, bytes:number)=>void):void;
        close():void;

        static readonly WRITE = 0x80000000|0;
        static readonly READ = 0x40000000|0;
        static readonly CREATE_NEW = 1;
        static readonly CREATE_ALWAYS = 2;
        static readonly OPEN_EXISTING = 3;
        static readonly OPEN_ALWAYS = 4;
    }
}

```


## ETC
  
I will wrap this project with npm