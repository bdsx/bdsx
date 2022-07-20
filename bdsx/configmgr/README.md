# ConfigMgr

ConfigMgr is the plugin configuration manager.

## Basic usage

```typescript
import { events } from "bdsx/event";
import { ConfigMgr, Options } from 'bdsx/configmgr'

class MyOptions extends Options {
    'my-other-setting' = "hello";
}

class MyOtherOptions extends Options {
    'enabled' = false;
    'hello-setting' = "is it me you're looking for?";
}

const config = new ConfigMgr(MyOptions, 'MyPluginName');
const config2 = new ConfigMgr(MyOtherOptions, 'MyPluginName', 'my-other-settings');

events.serverOpen.on(()=>{
    console.log(config.options['my-other-setting']);
    config.options['my-other-setting'] = "good bye";
    config.save();
    if (config2.options['enabled'] == false) {
        console.log(config2.options['hello-setting'])
    }
    console.log(config.options['my-other-setting']);

    const testInterval = setInterval(() => {
        // Obviously don't try to continuously reload config too often like this. You should only do it infrequently or by command.
        const stats = config2.reload();
        if (stats.modified && stats.updated.includes('hello-setting')) {
            console.log(config2.options['hello-setting']);
        }
    }, 1000);
    events.serverClose.on(() => {
        clearInterval(testInterval)
    })
});
```

### Console
```
[BDSX-ConfigMgr: MyPluginName] Loading config from D:\Games\MinecraftBedrockServer\bdsx\config\MyPluginName\config.json
[BDSX-ConfigMgr: MyPluginName] Loading config from D:\Games\MinecraftBedrockServer\bdsx\config\MyPluginName\my-other-settings.json

[...]

[23:38:05] Server started.
hello,
is it me you're looking for?
good bye
```

### `settings.json`
```json
{
 "enabled": true,
 "my-other-setting": "good bye"
}
```

### `my-other-settings.json`
```json
{
 "enabled": false,
 "hello-setting": "is it me you're looking for?"
}
```

## Changing the options
```json
{
 "enabled": true,
 "hello-setting": "I can see it in your eyes, I can see it in your smile"
}
```

### Console
```
[BDSX-ConfigMgr: MyPluginName] Configuration option enabled on disk (true) is different to running value (false). Updating running value.
[BDSX-ConfigMgr: MyPluginName] Configuration option hello-setting on disk (I can see it in your eyes, I can see it in your smile) is different to running value (is it me you're looking for?). Updating running value.
I can see it in your eyes, I can see it in your smile
```