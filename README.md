
## BDSX: node.js + BDS!
![logo](icon.png)  
* OS: Windows & Linux(with Wine)
* Supports all BDS features!
* Supports all node.js features!
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
  
It will run `bdsx/index.js` as server script!  
It's very mutable now, I will remove or change API names frequently!  

## How to use it?
1. Install [node.js](https://nodejs.org/en/) if you didn't install it
2. (Linux) Install wine
3. Install BDSX
```sh
npm i -g bdsx # Install bdsx. It will try to install BDS.
```
4. Run BDSX
```sh
bdsx --example ./example # make example project to './example'
bdsx -M './example' # run BDSX with './example', it will read 'main' of 'path/package.json'
```

## Build Typescript (Watch Mode)
* Build with VSCode
1. Open `bdsx/` with VSCode
2. Ctrl + Shift + B
3. Select `tsc: watch`

* Build with Command Line
1. Open `bdsx/` with Prompt
2. run `npm watch`

## JS API Reference
https://github.com/karikera/bdsx/wiki

## Bug Report or Q&A
https://github.com/karikera/bdsx/issues

## Discord for Q&A
https://discord.gg/pC9XdkC

## Build It Self
* Requirement
[Visual Studio 2019](https://visualstudio.microsoft.com/ko/)  
[NASM](https://www.nasm.us/) & Set PATH - It's needed by node-chakracore  

* Clone BDSX and ken(personal library project)  
**[parent directory]**  
├ ken (https://github.com/karikera/ken)  
└ bdsx (https://github.com/karikera/bdsx)  

* Build bdsx.sln with Visual Studio 2019

If you build it with `Release` configuration, It will make `bdsx.zip` in solution directory.  
that `bdsx.zip` is standalone server files.
