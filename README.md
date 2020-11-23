
## BDSX: Minecraft Bedrock Dedicated Server + node.js!
![logo](icon.png)  
It's Minecraft Bedrock Dedicated Server with [node.js](https://nodejs.org/) supports.  
* OS: Windows & Linux(with Wine)
* Supports all BDS features!
* Supports all node.js features!
* [Debug with Visual Studio Code! (You can debug addons too!)](https://github.com/karikera/bdsx/wiki/Debug-with-VSCode)
* Run scripts without any addons or experimental play!
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
netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId)=>{
    const ip = networkIdentifier.getAddress();
    const [xuid, username] = netevent.readLoginPacket(ptr);
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
});
```
* [Command hooking](https://github.com/karikera/bdsx/wiki/Command-Hooking)!
* [DLL Call](https://github.com/karikera/bdsx/wiki/Call-DLL-Directly)!
  
It's very mutable now, I will remove or change API names frequently!  

## How to use it?
### by executable
* Requirement  
Wine(for Linux)  
[Download Link](https://github.com/karikera/bdsx/releases/latest)

### by npm module
* Requirement  
[node.js](https://nodejs.org/)  
Wine(for Linux)  
```sh
# Install BDSX
npm i bdsx -g # If you use linux, maybe it needs sudo 
# Run BDSX
bdsx example ./example # make example project to './example'
bdsx ./example # run BDSX with './example', it will read 'main' of 'path/package.json
```

## Build (Watch Mode)
It will build by rollup/babel/typescript in watch mode.  
babel can transpile latest scripts to es2015. and it makes compatibility.

* Build with VSCode
1. Open `bdsx/` with VSCode
2. Ctrl + Shift + B
3. Select `tsc: watch`

* Build with Command Line
1. Open `bdsx/` with Prompt
2. run `npm run watch`

## JS API Reference
https://github.com/karikera/bdsx/wiki

## Bug Report or Q&A
https://github.com/karikera/bdsx/issues

## Discord for Q&A
https://discord.gg/pC9XdkC

## for ChakraCore
https://github.com/karikera/bdsx/wiki

## Build It Self
* Requirement
[Visual Studio 2019](https://visualstudio.microsoft.com/)  
[Visual Studio Code](https://code.visualstudio.com/)  
[NASM](https://www.nasm.us/) & Set PATH - It's needed by node-chakracore  

1. Clone BDSX and ken.(personal library project)  
**[parent directory]**  
├ ken (https://github.com/karikera/ken)  
└ bdsx (https://github.com/karikera/bdsx)  

2. Update git submodules.

3. Build bdsx.sln with Visual Studio 2019.

4. Build `bdsx/bdsx-node` with Visual Studio Code. And select `tsc watch`.

5. Build `bdsx/bdsx-node` with Visual Studio Code. And select `Package`.  
 It will generate a zip file to `bdsx/release-zip/bdsx-[version].zip`

