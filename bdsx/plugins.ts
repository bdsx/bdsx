
import {promises as fsp} from 'fs';
import path = require('path');
import colors = require('colors');
import { remapStack } from './source-map-support';
import { ConcurrencyQueue } from './concurrency';

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

export async function loadAllPlugins():Promise<void> {
    const taskQueue = new ConcurrencyQueue;
    const loaded = new Set<string>();
    async function loadPackageJson(name:string, json:any):Promise<boolean> {
        if (!json) {
            console.error(`[BDSX-Plugins] Invalid ${name}/package.json`);
            return false;
        }
        if (!json.dependencies) return true;
        const counter = new PromCounter;
        for (const name in json.dependencies) {
            if (!name.startsWith('@bdsx/')) continue;
            if (loaded.has(name)) continue;
            loaded.add(name);
            counter.ref();
            taskQueue.run(async()=>{
                try {
                    const jsonpath = require.resolve(name+'/package.json');
                    const json = JSON.parse(await fsp.readFile(jsonpath, 'utf-8'));
                    if (json.bdsxPlugin) {
                        await loadPackageJson(name, json);
                    }
                } catch (err) {
                    console.error(`[BDSX-Plugins] Failed to get ${name}/package.json`);
                }
                counter.unref();
            });
        }
        await counter.wait();
        return true;
    }

    try {
        const packagejson = path.resolve(process.cwd(), process.argv[1], 'package.json');
        const mainjson = JSON.parse(await fsp.readFile(packagejson, 'utf-8'));
        loadPackageJson('[entrypoint]', mainjson);
        await taskQueue.onceEnd();
        if (loaded.size === 0) {
            console.log('[BDSX-Plugins] No Plugins');
        } else {
            let index = 0;
            for (const name of loaded) {
                try {
                    console.log(`[BDSX-Plugins] (${++index}/${loaded.size}) ${name}`);
                    require(name);
                } catch (err) {
                    console.error(`[BDSX-Plugins] Failed to load ${name}`);
                    console.error(remapStack(err.stack));
                }
            }
        }
    } catch (err) {
        console.error(colors.red(`[BDSX-Plugins] Failed to load`));
        if (err.code === 'ENOENT') {
            console.error(colors.red(`[BDSX-Plugins] package.json not found. please set the entry point as package.json directory`));
        } else {
            console.error(colors.red(`[BDSX-Plugins] Failed to read package.json. `+err.message));
        }
        return;
    }
}