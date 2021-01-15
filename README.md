# BDSX 2.0 : BDS + node.js
![logo](icon.png)  
It's Minecraft Bedrock Dedicated Server with [node.js](https://nodejs.org/) supports.  

* OS: Windows & Linux(with Wine)
* Basic Minecraft features as usual.
* node.js features [(?)](https://github.com/karikera/bdsx/wiki/Available-NPM-Modules)
* [Debug with Visual Studio Code (You can debug addons too)](https://github.com/karikera/bdsx/wiki/Debug-with-VSCode)
* Hijack chatting
```ts
import { chat } from 'bdsx';
chat.on(ev=>{
    ev.setMessage(ev.message.toUpperCase()+" YEY!");
});
```
* Hijack network packet + Get IP Address & XUID
```ts
import { netevent, PacketId } from "bdsx";
netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId)=>{
    const ip = networkIdentifier.getAddress();
    const cert = ptr.connreq.cert;
    const xuid = cert.getXuid();
    const username = cert.getId();
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
});
```
* [Command hooking](https://github.com/karikera/bdsx/wiki/Command-Hooking)
* [DLL Call](https://github.com/karikera/bdsx/wiki/Call-DLL-Directly)

## How to use it?
* Requirement  
[node.js](https://nodejs.org/)  
Wine(for Linux)  
git clone https://github.com/karikera/bdsx.git or download it
* Recommended  
[VSCode](https://code.visualstudio.com/)  
GIT

### Starting with VSCode
```sh
1. Open the project with VSCode
2. Open a terminal(Ctrl+Shift+｀) and run
npm i # install modules
npm run install_bds # install bedrock server
3. Press `Ctrl+Shift+B` # Build with watch mode
4. Press `F5` # run
```

### Starting with the executable
run `./bdsx/bdsx.bat` (on Windows)  
run `./bdsx/bdsx.sh` (on Linux)

### by docker
```sh
docker run karikera/bdsx
```

## BDSX Wiki(Include JS API Reference)
https://github.com/karikera/bdsx/wiki

## Bug Report or Q&A
https://github.com/karikera/bdsx/issues

## Discord for Q&A
https://discord.gg/pC9XdkC

## BDSX Core
https://github.com/karikera/bdsx-core
