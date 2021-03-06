
### Make the bdsx plugin project with bootstrap
```sh
> npm run newplugin ./path/to/plugin 
# it will install the generated plugin as a local package
```

### Publish the bdsx plugin
1. Create an npm account if you don't have one yet. [NPM Sign Up](https://www.npmjs.com/signup)
2. Login with the command line
```sh
> npm login
npm notice Log in on https://registry.npmjs.org/
Username: # Enter Username
Password: # Enter Password
Email: (this IS public) # Enter Email
```
3. Publish with the command line
```sh
> cd path/to/plugin # move to the plugin directory
> npm publish --access=public # publish the plugin
```

## Install the plugin to the other project
```sh
> npm i @bdsx/pluginname
```