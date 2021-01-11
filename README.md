[EN](README.md)|[KR](README.ko.md)

## BDSX: Minecraft Bedrock Dedicated Server + node.js!
![logo](icon.png)  
It's Minecraft Bedrock Dedicated Server with [node.js](https://nodejs.org/) supports.  
* OS: Windows & Linux(with Wine)
* Supports all BDS features!
* Supports all[(?)](https://github.com/karikera/bdsx/wiki/Available-NPM-Modules) node.js features!
* [Debug with Visual Studio Code! (You can debug addons too!)](https://github.com/karikera/bdsx/wiki/Debug-with-VSCode)
* Run scripts without any addons!
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

## How to use it?

### by git
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

### by docker
```sh
docker run karikera/bdsx
```

## Build (Watch Mode)
It will build by rollup/babel/typescript in watch mode.  
babel can transpile latest scripts to es2015. and it makes compatibility.

* Build with VSCode
1. Open the project directory with VSCode
2. Ctrl + Shift + B

* Build with Command Line
1. Open `bdsx/` with Prompt
2. run `npm run watch`

## BDSX Wiki(Include JS API Reference)
https://github.com/karikera/bdsx/wiki

## Bug Report or Q&A
https://github.com/karikera/bdsx/issues

## Discord for Q&A
https://discord.gg/pC9XdkC

## BDSX Core
https://github.com/karikera/bdsx-core