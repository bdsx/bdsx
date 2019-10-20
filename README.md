
## Chakra X: The Server Modding Project!  
It makes more javascript functions to bedrock_server.exe by injecting DLL  

## Run with NPM
https://www.npmjs.com/package/bedrock-server-x
```sh
npm i -g bedrock-server-x
cd path/to/bedrock_server
bedrock-server-x
```

## Run with EXE
1. Build it with Visual Studio  
2. Go to output directory with Prompt
2. `injector.exe "path/to/bedrock_server.exe" chakraX.dll`  

## Build
It needs [ken](https://github.com/karikera/ken) project on same directory to build.  
  
**[parent directory]**  
├ken(https://github.com/karikera/ken)  
└chakraX(https://github.com/karikera/chakraX)  
  
Outputs are `injector.exe` and `chakraX.dll`.  others are useless in this project.  

## ETC
I will release it with binary build  
