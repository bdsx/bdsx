
### Make the plugin project with the bootstrap
```sh
> npm run newplugin ./path/to/plugin 
# it will install the generated plugin as a local package
# Please execute this on the bdsx directory
```

### Build the plugin
* With VSCode
Ctrl+Shift+B -> tsc: watch

* With the command line
```sh
> npm run watch
```

### Publish the plugin
1. Create an npm account if you don't have one yet. [NPM Sign Up](https://www.npmjs.com/signup)
2. Request for joining `@bdsx` organization at `#npm-bdsx-org-member-request` channel of [the discord server](https://discord.gg/pC9XdkC) with npm ID or EMail.
3. Login with the command line.
```sh
> npm login
npm notice Log in on https://registry.npmjs.org/
Username: # Enter Username
Password: # Enter Password
Email: (this IS public) # Enter Email
```
4. Publish with the command line
```sh
> cd path/to/plugin # move to the plugin directory
> npm publish --access=public # publish the plugin
```

## Install the plugin to the other project
* With the plugin manager
Run plugin-manager.bat/sh.  
Search and select the plugin.
Select the version.

* With the command line
```sh
> npm i @bdsx/pluginname
```

* With `plugins/` directory
Copy to `plugins/` directory

## Remove the plugin
* With the plugin manager
Run plugin-manager.bat/sh.  
Search and select the plugin.
Select `Remove`.

* With the command line
```sh
> npm r @bdsx/pluginname
```

* With `plugins/` directory
Delete from `plugins/` directory
