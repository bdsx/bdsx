# BDSX 2.0 : BDS + node.js
![logo](bdsx/icon/icon.png)  
It's Minecraft Bedrock Dedicated Server with [node.js](https://nodejs.org/) supports.  

* OS: Windows & Linux(with Wine)
* Basic Minecraft features as usual.
* node.js features [(?)](https://github.com/bdsx/bdsx/wiki/Available-NPM-Modules)
* [Debug with Visual Studio Code (You can debug addons too)](https://github.com/bdsx/bdsx/wiki/Debug-with-VSCode)
* Hijack network packet + Get IP Address & XUID
```ts
import { nethook, MinecraftPacketIds } from "bdsx";
nethook.after(MinecraftPacketIds.Login).on((ptr, networkIdentifier, packetId)=>{
    const ip = networkIdentifier.getAddress();
    const cert = ptr.connreq.cert;
    const xuid = cert.getXuid();
    const username = cert.getId();
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
});
```
* [Command hooking](https://github.com/bdsx/bdsx/wiki/Command-Hooking)
* [DLL Call](https://github.com/bdsx/bdsx/wiki/Call-DLL-Directly)

## How to use it?
* Requirement  
[node.js](https://nodejs.org/)  
Wine(for Linux)  
git clone https://github.com/bdsx/bdsx.git or download it
* Recommended  
[VSCode](https://code.visualstudio.com/)  
GIT

### Starting with VSCode
```sh
1. Open the project with VSCode
2. Open a terminal(Ctrl+Shift+｀)
3. run `npm i` # install npm packages and BDS
4. Press `F5` # build & run
```

### Starting with the executable
run `./bdsx.bat` (on Windows)  
run `./bdsx.sh` (on Linux)

### Starting with Docker
```sh
docker run -ti karikera/bdsx
```

## File Structure
```sh
[bdsx project]
├ [bdsx] # Core Library
├ [example_and_test]
├ [bedrock_server] # Installed BDS
├ launcher.ts # Script before launching BDS.
├ index.ts # Main entry point.
├ bdsx.sh # Executable for Linux
└ bdsx.bat # Executable for Windows
# ./launcher.ts imports ./index.ts after launching BDS
# Please start your own code from ./index.ts
```

## BDSX Discussions
https://github.com/bdsx/bdsx/discussions

## BDSX Wiki(Include JS API Reference)
https://github.com/bdsx/bdsx/wiki

## Bug Report or Q&A
https://github.com/bdsx/bdsx/issues

## Discord for Q&A
https://discord.gg/pC9XdkC

## BDSX Core
https://github.com/bdsx/bdsx-core
