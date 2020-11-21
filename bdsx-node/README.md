<div style="text-align:center"><img src="icon.png"></div>

bdsx is the MOD for [Bedrock Dedicated Server](https://www.minecraft.net/en-us/download/server/bedrock/). It's merged with [node-chakracore](https://github.com/nodejs/node-chakracore) and [BDS](https://www.minecraft.net/en-us/download/server/bedrock/).

## How to install and execute
```sh
npm i -g bdsx # Install bdsx.
bdsx # Execute bdsx. It will try to install BDS to [home]/.bds
```

## Commands
* bdsx [path_to_module]: Run BDS with node module. It will install BDS if BDS is not installed
* bdsx install, bdsx i: Install BDS. It will update BDS if installed BDS is old
* bdsx remove, bdsx r: Remove BDS. It will remove all worlds & addons
## Options
* --mutex [name]: Set mutex to limit to single instance, It will wait for the exit of previous one
* --pipe-socket [host] [port] [param]: Connect the standard output to a socket, BDSX will send [param] as first line
* -y: Agree all and no prompt about Minecraft End User License & Privacy Policy at installation
* --manual-bds: Do not install BDS, You need to install BDS manually at [userdir]/.bds
* --help: Show these options