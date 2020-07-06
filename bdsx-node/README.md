<div style="text-align:center"><img src="icon.png"></div>

bdsx is the MOD for [Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock/). It's merged with [node-chakracore](https://github.com/nodejs/node-chakracore) and [BDS](https://www.minecraft.net/en-us/download/server/bedrock/).

## How to install and execute
```sh
npm i -g bdsx # Install bdsx.
bdsx # Execute bdsx. It will try to install BDS to [home]/.bds
```

## Features
* bdsx [path_to_module] - Run BDS with node module. It will install BDS if BDS is not installed
* bdsx install, bdsx i - Install BDS. It will update BDS if installed BDS is old
* bdsx remove, bdsx r - Remove BDS. It will remove all worlds & addons
