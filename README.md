
## BDSX: The Extended BDS!
![logo](logo.png)  
* Download: [bdsx.zip](https://github.com/karikera/bdsx/releases/download/1.0.9/bdsx.zip) or [Other Releases](https://github.com/karikera/bdsx/releases)
* **Windows Only!**
* Supports all BDS features!
* Run scripts without any addons or experimental play!
* `require` function supports likes NodeJS!
* Write to console!
```ts
console.log("Hello, World!");
```
* File IO!
```ts
import { fs } from 'bsx';
console.log('Current Directory: '+fs.cwd());
fs.writeFile("textfile.txt", "Hello, World!");
```
* Hijack chatting!
```ts
import { chat } from 'bdsx';
chat.on(ev=>{
    ev.setMessage(ev.message.toUpperCase()+" YEY!");
});
```
* Hijack network packet + Get IP Address & XUID!
```ts
import { netevent, PacketId } from "bdsx";
netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId, loginInfo)=>{
    // networkIdentifier has non-printable character, It will breaks standard output
    console.log(`${loginInfo.id}> IP=${loginInfo.ip}, XUID=${loginInfo.xuid}`);
})
```
* [Directory Watcher](https://github.com/karikera/bdsx/wiki#watcher)!
* [DLL Call](https://github.com/karikera/bdsx/wiki#NativeModule)!
  
It will run `bdsx/index.js` as server script!  
It's very mutable now, I will remove or change API names frequently!  

## Files
├ <img src="icon/folder.svg" style="width:16px;height:16px;vertical-align:middle"> bdsx - Project folder  
│  ├ <img src="icon/folder.svg" style="width:16px;height:16px;vertical-align:middle"> node_modules - JS Modules   
│  ├ <img src="icon/js.svg" style="width:20px;height:20px;vertical-align:middle">index.js - Javascript File  
│  ├ <img src="icon/ts.svg" style="width:20px;height:20px;vertical-align:middle">index.ts - *(TS)* Typescript File  
│  ├ <img src="icon/json.svg" style="width:20px;height:20px;vertical-align:middle">package-lock.json - JS Modules information  
│  ├ <img src="icon/json.svg" style="width:20px;height:20px;vertical-align:middle">package.json - Meta datas for the project  
│  └ <img src="icon/json.svg" style="width:20px;height:20px;vertical-align:middle">tsconfig.json - *(TS)* Compiler options for Typescript  
├ <img src="icon/folder.svg" style="width:16px;height:16px;vertical-align:middle"> server - [Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock/)  
├ <img src="icon/folder.svg" style="width:16px;height:16px;vertical-align:middle"> bin - Injector.exe & bdsx.dll  
└ <img src="icon/win.svg" style="width:20px;height:20px;vertical-align:middle">bdsx.bat - Launcher    
*(TS)*: You can delete it If you don't want to use Typescript

## Build Typescript (Watch Mode)
You need to install [NodeJS](https://nodejs.org/en/) before use Typescript

* Build with VSCode
1. Open `bdsx/` with VSCode
2. Ctrl + Shift + B
3. Select `tsc: watch`

* Build with Command Line
1. Open `bdsx/` with Prompt
2. run `npm watch`

## JS API Reference
https://github.com/karikera/bdsx/wiki

## Bug Report
https://github.com/karikera/bdsx/issues

## Discord for Q&A
https://discordapp.com/channels/646456965983240212/646456965983240218

## Build It Self
It needs [ken](https://github.com/karikera/ken) project on same directory to build.  
  
**[parent directory]**  
├ ken (https://github.com/karikera/ken)  
└ bdsx (https://github.com/karikera/bdsx)  
  
If you build it with `Release` configuration, It will make `bdsx.zip` in solution directory.  
that `bdsx.zip` is standalone server files.
