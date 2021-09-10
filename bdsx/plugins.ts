
import { ConcurrencyQueue } from './concurrency';
import { fsutil } from './fsutil';
import { remapAndPrintError } from './source-map-support';
import path = require('path');
import colors = require('colors');
import child_process = require('child_process');

const PLUGINS_BDSX_PATH = 'file:../bdsx';

interface PackageJsonForm {
    bdsxPlugin?:boolean;
    dependencies?:Record<string, string>;
}

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
export const loadedPackages: {name:string, loaded:boolean, jsonpath:string|null, json:any|null}[] = [];

export async function loadAllPlugins():Promise<void> {

    class PackageJson {
        private loaded:boolean = false;
        private jsonpath:string|null = null;
        private json:any|null = null;

        constructor(public readonly name:string) {
        }

        setJsonPath(jsonpath:string):void {
            if (this.jsonpath !== null) throw Error(`already`);
            this.jsonpath = jsonpath;
        }

        async getJson():Promise<any> {
            if (this.json !== null) return this.json;
            return this.json = JSON.parse(await fsutil.readFile(this.getPath()));
        }

        getPath():string {
            if (this.jsonpath !== null) return this.jsonpath;
            return this.jsonpath = require.resolve(`${this.name}/package.json`);
        }

        async fix():Promise<void> {
            const json = await this.getJson();
            const deps = json.dependencies;
            let modified = false;
            if (deps != null && deps.bdsx != null && deps.bdsx !== PLUGINS_BDSX_PATH) {
                deps.bdsx = PLUGINS_BDSX_PATH;
                modified = true;
            }
            const devDeps = json.devDependencies;
            if (devDeps != null && devDeps.bdsx != null && devDeps.bdsx !== PLUGINS_BDSX_PATH) {
                devDeps.bdsx = PLUGINS_BDSX_PATH;
                modified = true;
            }
            if (json.scripts != null && json.scripts.prepare === 'tsc') {
                json.scripts.prepare = 'tsc || exit 0';
                modified = true;
            }

            if (modified) {
                await this.save();
            }
        }

        async load(rootPackage:boolean):Promise<boolean> {
            const packagejson = await this.getJson();
            if (typeof packagejson !== 'object') {
                console.error(`[BDSX-Plugins] Invalid ${this.name}/package.json`);
                return false;
            }
            if (packagejson.dependencies == null) return true;
            const counter = new PromCounter;
            for (const name in packagejson.dependencies) {
                if (!name.startsWith(BDSX_SCOPE)) continue;
                PackageJson.get(name).requestLoad(counter, rootPackage ? packagejson : null);
            }
            await counter.wait();
            return true;
        }
        async save():Promise<void> {
            if (this.json === null) return;
            await fsutil.writeJson(this.getPath(), this.json);
        }

        static get(name:string):PackageJson {
            let pkg = PackageJson.all.get(name);
            if (pkg != null) return pkg;
            pkg = new PackageJson(name);
            PackageJson.all.set(name, pkg);
            return pkg;
        }

        requestLoad(counter:PromCounter, parentjson:any):void {
            if (this.loaded) return;
            this.loaded = true;

            counter.ref();
            taskQueue.run(async()=>{
                try {
                    const json:PackageJsonForm = await this.getJson();
                    if (json.bdsxPlugin) {
                        this.load(false);
                    }
                } catch (err) {
                    this.loaded = false;
                    if (parentjson != null && /^file:(:?\.[\\/])?plugins[\\/]/.test(parentjson.dependencies[this.name])) {
                        try {
                            await fsutil.stat(`${pluginspath}${path.sep}${this.name.substr(BDSX_SCOPE.length)}`);
                        } catch (err) {
                            if (err.code === 'ENOENT') {
                                console.error(colors.red(`[BDSX-Plugins] ${this.name}: removed`));
                                delete parentjson.dependencies[this.name];
                                packagejsonModified = true;
                                PackageJson.all.delete(this.name);
                                counter.unref();
                                return;
                            }
                            remapAndPrintError(err);
                        }
                    } else {
                        remapAndPrintError(err);
                    }
                    console.error(colors.red(`[BDSX-Plugins] Failed to read '${this.name}/package.json'`));
                }
                counter.unref();
            });
        }

        public static readonly all = new Map<string, PackageJson>();
    }

    let packagejsonModified = false;
    let needToNpmInstall = false;
    const projpath = fsutil.projectPath;
    const pluginspath = `${projpath}${path.sep}plugins`;
    const taskQueue = new ConcurrencyQueue;

    // read package.json
    const mainpkg = new PackageJson('[entrypoint]');
    mainpkg.setJsonPath(`${projpath}${path.sep}package.json`);
    let mainjson:PackageJsonForm;
    try {
        mainjson = await mainpkg.getJson();
    } catch (err) {
        console.error(colors.red(`[BDSX-Plugins] Failed to load`));
        if (err.code === 'ENOENT') {
            console.error(colors.red(`[BDSX-Plugins] 'package.json' not found. Please set the entry point to the directory containing package.json`));
        } else {
            console.error(colors.red(`[BDSX-Plugins] Failed to read package.json. ${err.message}`));
        }
        return;
    }
    if (mainjson.dependencies == null) mainjson.dependencies = {};

    try {
        // load plugins from the directory
        const counter = new PromCounter;
        const pluginsFiles = await fsutil.readdirWithFileTypes(pluginspath);
        const pluginsInDirectory:PackageJson[] = [];

        // check new plugins
        for (const info of pluginsFiles) {
            if (!info.isDirectory()) continue;
            const pluginname = info.name;
            const fullname = `${BDSX_SCOPE}${pluginname}`;
            const plugin = PackageJson.get(fullname);

            try {
                plugin.getPath();
            } catch (err) {
                if (err.code === 'MODULE_NOT_FOUND') {
                    plugin.setJsonPath(`${pluginspath}${path.sep}${pluginname}${path.sep}package.json`);
                    needToNpmInstall = true;
                } else {
                    console.error(colors.red(`[BDSX-Plugins] Failed to read 'plugins/${pluginname}/package.json'.`));
                    remapAndPrintError(err);
                    continue;
                }
            }

            pluginsInDirectory.push(plugin);

            if (mainjson.dependencies[fullname] != null) continue;
            mainjson.dependencies[fullname] = `file:plugins/${pluginname}`;
            packagejsonModified = true;
            needToNpmInstall = true;
            try {
                const json = await plugin.getJson();
                if (json.name !== fullname) {
                    console.error(colors.red(`[BDSX-Plugins] Wrong plugin name. Name in 'package.json' must be '${fullname}' but was '${json.name}'`));
                    continue;
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.error(colors.red(`[BDSX-Plugins] 'plugins/${pluginname}/package.json' not found. Plugins need 'package.json'`));
                } else {
                    console.error(colors.red(`[BDSX-Plugins] Failed to read 'plugins/${pluginname}/package.json'.`));
                    remapAndPrintError(err);
                }
            }
            console.log(colors.green(`[BDSX-Plugins] ${fullname}: added`));
        }

        for (const plugin of pluginsInDirectory) {
            taskQueue.run(()=>plugin.fix());
            plugin.requestLoad(counter, mainjson);
        }

        await mainpkg.load(true);
        await taskQueue.onceEnd();
        await counter.wait();

        // apply changes
        if (packagejsonModified) {
            console.log(`[BDSX-Plugins] Apply the package changes`);
            await mainpkg.save();
        }
        if (needToNpmInstall) {
            child_process.execSync('npm i', {stdio:'inherit', cwd:projpath});
        }
        await taskQueue.onceEnd();

        // import
        const pluginCount = PackageJson.all.size;
        if (pluginCount === 0) {
            console.log('[BDSX-Plugins] No Plugins');
        } else {
            let index = 0;
            for (const pkg of PackageJson.all.values()) {
                try {
                    console.log(colors.green(`[BDSX-Plugins] Loading ${pkg.name} (${++index}/${pluginCount})`));
                    require(pkg.name);
                    loadedPlugins.push(pkg.name);
                    loadedPackages.push({name:pkg.name, loaded:(pkg as any).loaded, jsonpath:(pkg as any).jsonpath, json:(pkg as any).json});
                } catch (err) {
                    console.error(colors.red(`[BDSX-Plugins] Failed to load ${pkg.name}`));
                    remapAndPrintError(err);
                }
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
