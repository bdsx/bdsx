
import {promises as fsp} from 'fs';
import path = require('path');
import colors = require('colors');
import child_process = require('child_process');
import { remapStack } from './source-map-support';
import { ConcurrencyQueue } from './concurrency';
import os = require('os');

class PromCounter {
    private resolve:(()=>void)|null = null;
    private counter = 0;
    private prom:Promise<void> = Promise.resolve();

    ref():void {
        if (this.counter === 0) {
            this.prom = new Promise<void>(resolve=>{
                this.resolve = resolve;
            });
        }
        this.counter++;
    }

    unref():void {
        this.counter --;
        if (this.counter === 0) {
            this.resolve!();
            this.resolve = null;
        }
    }

    wait():Promise<void> {
        return this.prom;
    }
}

const BDSX_SCOPE = '@bdsx/';

export const loadedPlugins: string[] = [];

export async function loadAllPlugins():Promise<void> {
    let packagejsonModified = false;
    const projpath = path.resolve(process.cwd(), process.argv[1]);
    const pluginspath = `${projpath}${path.sep}plugins`;
    const taskQueue = new ConcurrencyQueue;
    const loaded = new Set<string>();
    function requestLoad(counter:PromCounter, name:string, json?:any):void {
        if (loaded.has(name)) return;
        loaded.add(name);
        counter.ref();
        taskQueue.run(async()=>{
            try {
                const jsonpath = require.resolve(`${name}/package.json`);
                const json = JSON.parse(await fsp.readFile(jsonpath, 'utf-8'));
                if (json.bdsxPlugin) {
                    await loadPackageJson(name, json, false);
                }
            } catch (err) {
                loaded.delete(name);
                if (json && json.dependencies[name].startsWith('file:./plugins/')) {
                    try {
                        const stat = await fsp.stat(`${pluginspath}${path.sep}${name.substr(BDSX_SCOPE.length)}`);
                        console.log(stat);
                    } catch (err) {
                        if (err.code === 'ENOENT') {
                            console.error(colors.red(`[BDSX-Plugins] ${name}: removed`));
                            delete json.dependencies[name];
                            packagejsonModified = true;
                            counter.unref();
                            return;
                        }
                    }
                }
                console.error(colors.red(`[BDSX-Plugins] Failed to read '${name}/package.json'`));
            }
            counter.unref();
        });
    }
    async function loadPackageJson(name:string, json:any, rootPackage:boolean):Promise<boolean> {
        if (!json) {
            console.error(`[BDSX-Plugins] Invalid ${name}/package.json`);
            return false;
        }
        if (!json.dependencies) return true;
        const counter = new PromCounter;
        for (const name in json.dependencies) {
            if (!name.startsWith(BDSX_SCOPE)) continue;
            requestLoad(counter, name, rootPackage ? json : null);
        }
        await counter.wait();
        return true;
    }

    // read package.json
    const packagejson = `${projpath}${path.sep}package.json`;
    let mainjson:any;
    try {
        mainjson = JSON.parse(await fsp.readFile(packagejson, 'utf-8'));
    } catch (err) {
        console.error(colors.red(`[BDSX-Plugins] Failed to load`));
        if (err.code === 'ENOENT') {
            console.error(colors.red(`[BDSX-Plugins] 'package.json' not found. Please set the entry point to the directory containing package.json`));
        } else {
            console.error(colors.red(`[BDSX-Plugins] Failed to read package.json. ${err.message}`));
        }
        return;
    }

    try {
        // load plugins from package.json
        loadPackageJson('[entrypoint]', mainjson, true);
        await taskQueue.onceEnd();

        // load plugins from the directory
        const plugins = await fsp.readdir(pluginspath, {withFileTypes: true});
        const newplugins:string[] = [];
        for (const info of plugins) {
            if (!info.isDirectory()) continue;
            const plugin = info.name;
            const fullname = `${BDSX_SCOPE}${plugin}`;
            if (mainjson.dependencies[fullname]) continue;
            mainjson.dependencies[fullname] = `file:./plugins/${plugin}`;
            packagejsonModified = true;
            newplugins.push(fullname);
            try {
                const json = JSON.parse(await fsp.readFile(`${pluginspath}${path.sep}${plugin}${path.sep}package.json`, 'utf-8'));
                if (json.name !== fullname) {
                    console.error(colors.red(`[BDSX-Plugins] Wrong plugin name. Name in 'package.json' must be '${fullname}' but was '${json.name}'`));
                    continue;
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.error(colors.red(`[BDSX-Plugins] 'plugins/${plugin}/package.json' not found. Plugins need 'package.json'`));
                } else {
                    console.error(colors.red(`[BDSX-Plugins] Failed to read 'plugins/${plugin}/package.json'. ${err.message}`));
                }
            }
            console.log(colors.green(`[BDSX-Plugins] ${fullname}: added`));
        }

        // apply changes
        if (packagejsonModified) {
            console.error(`[BDSX-Plugins] Apply the package changes`);
            await fsp.writeFile(packagejson, JSON.stringify(mainjson, null, 2).replace('\n', os.EOL));
            child_process.execSync('npm i', {stdio:'inherit', cwd:projpath});

            const counter = new PromCounter;
            for (const plugin of newplugins) {
                requestLoad(counter, plugin);
            }
            await counter.wait();
        }
        await taskQueue.onceEnd();

        // import
        if (loaded.size === 0) {
            console.log('[BDSX-Plugins] No Plugins');
        } else {
            let index = 0;
            for (const name of loaded) {
                try {
                    loadedPlugins.push(name);
                    console.log(colors.green(`[BDSX-Plugins] Loading ${name} (${++index}/${loaded.size})`));
                    require(name);
                } catch (err) {
                    console.error(colors.red(`[BDSX-Plugins] Failed to load ${name}`));
                    console.error(remapStack(err.stack));
                }
            }
        }
    } catch (err) {
        console.error(colors.red(`[BDSX-Plugins] ${err.message}`));
    }
}
