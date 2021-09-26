

import child_process = require('child_process');
import blessed = require('blessed');
import { fsutil } from '../fsutil';

const SELECTABLE_ITEM_STYLE = {
    fg: 'magenta',
    selected: {
        bg: 'blue'
    }
};

interface PackageInfoJson {
    name:string;
    scope:string;
    version:string;
    description?:string;
    date:string;
    links: {
        npm:string;
    };
    author?:{
        name:string;
        email:string;
        url:string;
    };
    publisher:{
        username:string;
        email:string;
    };
    maintainers:{
        username:string;
        email:string;
    }[];
}

function exec(command:string):Promise<string>{
    return new Promise((resolve, reject)=>{
        child_process.exec(command, {
            encoding: 'utf-8'
        }, (err, output)=>{
            if (err) {
                reject(err);
            } else {
                resolve(output);
            }
        });
    });
}


function execWithoutError(command:string):Promise<string>{
    return new Promise((resolve, reject)=>{
        child_process.exec(command, {
            encoding: 'utf-8'
        }, (err, output)=>{
            resolve(output);
        });
    });
}

class PackageInfo {
    public readonly name: string;
    public readonly desc: string;
    public readonly author: string;
    public readonly date: string;
    public readonly version: string;
    public readonly installed: string|null;

    private versions:string[]|null = null;

    constructor(info: PackageInfoJson, deps?:Record<string, {version:string|null}>) {
        this.name = info.name;
        this.desc = info.description || '';
        this.author = info.publisher.username;
        this.date = info.date;
        this.version = info.version;

        const installedInfo = deps && deps[this.name];
        this.installed = (installedInfo && installedInfo.version) || null;
    }

    async getVersions():Promise<string[]> {
        if (this.versions !== null) return this.versions;
        const versions = await exec(`npm view "${this.name}" versions --json`);
        const vs = JSON.parse(versions.replace(/'/g, '"'));
        return this.versions = vs;
    }

    static async search(name: string, deps?:Record<string, {version:string}>): Promise<PackageInfo[]> {
        const output = await execWithoutError(`npm search --json "${name}"`);
        const result = JSON.parse(output) as PackageInfoJson[];
        return result.map(item => new PackageInfo(item, deps));
    }

    toMenuString(): string[] {
        const author = this.author;
        const MAX_LEN = 18;
        return [this.installed || 'No', this.name, this.desc, author.length > MAX_LEN ? `${author.substr(0, MAX_LEN-3)}...` : author, this.date];
    }

    toString(): string {
        return JSON.stringify(this);
    }
}

let screen:blessed.Widgets.Screen|null = null;

function loadingWrap<T>(text:string, prom:Promise<T>):Promise<T>{
    if (screen === null) throw Error('blessed.screen not found');
    const loading = blessed.loading({
        border: 'line',
        top: 3,
        width: '100%-1'
    });
    screen.append(loading);
    loading.load(text);
    screen.render();
    return prom.then(v=>{
        loading.stop();
        loading.destroy();
        return v;
    }, err=>{
        loading.stop();
        loading.destroy();
        throw err;
    });
}

let latestSelected = 0;
let latestSearched = '';
function searchAndSelect(prefixes:string[], deps:Record<string, {version:string}>):Promise<PackageInfo> {
    return new Promise(resolve=>{
        if (screen === null) throw Error('blessed.screen not found');
        const scr = screen;

        const search = blessed.textbox({
            border:'line',
            keys: true,
            mouse: true,
            width:'100%-1',
            height: 3,
            style: {
                fg: 'blue',
                focus: {
                    fg: 'white'
                }
            },
        });

        const table = blessed.listtable({
            border:'line',
            keys: true,
            mouse: true,
            style: {
                header: {
                    fg: 'blue',
                    bold: true
                },
                cell: SELECTABLE_ITEM_STYLE
            },
            top: 3,
            scrollable: true,
            width: '100%-1',
            height: '100%-3',
            align: 'left',
        });

        let packages:PackageInfo[] = [];
        let preparing = true;
        table.on('select item', (item, index)=>{
            if (preparing) return;
            setTimeout(()=>{
                latestSelected = index;
            }, 0);
        });
        table.on('select', (item, index)=>{
            const plugin = packages[index-1];
            if (!plugin) return;
            table.destroy();
            search.destroy();
            resolve(plugin);
        });
        table.key('up', ()=>{
            if (latestSelected === 1) {
                processInput();
            }
        });
        search.key('down', ()=>{
            if (packages.length !== 0) {
                search.cancel();
            }
        });
        search.key('C-c', ()=>{
            process.exit(0);
        });

        async function searchText(name:string):Promise<void> {
            scr.remove(table);

            const waits = prefixes.map(prefix=>PackageInfo.search(prefix+name, deps));
            let pkgsArray:PackageInfo[][];
            try {
                pkgsArray = await loadingWrap('Searching...', Promise.all(waits));
            } catch (err) {
                const stack:string = err.stack;
                table.setData(stack.split('\n').map(str=>[str]));
                scr.append(table);
                processInput();
                return;
            }
            packages = ([] as PackageInfo[]).concat(...pkgsArray);
            packages = packages.filter(info=>{
                for (const prefix of prefixes) {
                    if (!info.name.startsWith(prefix)) continue;
                    return true;
                }
                return false;
            });
            scr.append(table);
            preparing = false;

            if (packages.length === 0) {
                latestSelected = -1;
                table.setData([['No result']]);
                processInput();
            } else {
                table.setData([['Installed', 'Name', 'Description', 'Author', 'Date']].concat(packages.map(item=>item.toMenuString())));
                table.select(latestSelected);
                table.focus();
                scr.render();
            }
        }

        function processInput():void {
            table.select(-1);
            scr.render();
            search.readInput(async(err, value)=>{
                if (value == null) {
                    table.select(1);
                    table.focus();
                    scr.render();
                    return;
                }

                latestSearched = value;
                searchText(value);
            });
        }
        table.key('escape', processInput);
        scr.append(search);
        search.setValue(latestSearched);
        scr.append(table);
        searchText(latestSearched);
    });
}

function reverse<T>(items:T[]):T[] {
    const n = items.length;
    const last = n-1;
    const half = n >> 1;
    for (let i=0;i<half;i++) {
        const j = last-i;
        const t = items[i];
        items[i] = items[j];
        items[j] = t;
    }
    return items;
}

function selectVersion(name:string, latestVersion:string, installedVersion:string|null, versions:string[]):Promise<(string|null)> {
    return new Promise(resolve=>{
        if (screen === null) throw Error('blessed.screen not found');

        const vnames = reverse(versions).map(v=>`${name}@${v}`);
        for (let i=0;i<versions.length;i++) {
            let moveToTop = false;
            if (versions[i] === latestVersion) {
                vnames[i] += ' (Latest)';
                moveToTop = true;
            }
            if (versions[i] === installedVersion) continue;

            if (moveToTop) {
                vnames.unshift(vnames.splice(i, 1)[0]);
                versions.unshift(versions.splice(i, 1)[0]);
            }
        }

        if (installedVersion !== null) {
            if (versions.indexOf(installedVersion) === -1) {
                vnames.unshift(installedVersion + ' (Installed)');
                versions.unshift(installedVersion);
            }
            if (!installedVersion.startsWith('file:plugins/')) {
                vnames.unshift('Remove');
                versions.unshift('');
            }
        }

        const list = blessed.list({
            items:vnames,
            border:'line',
            style:SELECTABLE_ITEM_STYLE,
            top: 3,
            scrollable: true,
            width: '100%-1',
            height: '100%-3',
            keys: true,
            mouse: true,
        });
        screen.append(list);
        list.select(0);
        list.focus();
        screen.render();

        list.key('escape', ()=>{
            list.destroy();
            resolve(null);
        });
        list.on('select', (item, index)=>{
            list.destroy();
            const version = versions[index];
            resolve(version);
        });
    });
}

(async()=>{
    for (;;) {
        if (screen === null)  {
            screen = blessed.screen({
                smartCSR: true
            });
            screen.title = 'BDSX Plugin Manager';
            screen.key(['q', 'C-c'], (ch, key)=>process.exit(0));
        }

        let packagejson:any;
        try {
            packagejson = JSON.parse(await fsutil.readFile('./package-lock.json'));
        } catch (err) {
            screen.destroy();
            screen = null;
            console.error(err.message);
            return;
        }
        const deps = packagejson.dependencies || {};

        const plugin = await searchAndSelect(['@bdsx/'], deps);

        const topbox = blessed.box({
            border:'line',
            width: '100%',
            height: 3,
            content: plugin.name,
        });
        screen.append(topbox);
        screen.render();

        const versions = await loadingWrap('Loading...', plugin.getVersions());
        const version = await selectVersion(plugin.name, plugin.version, plugin.installed, versions);
        topbox.destroy();
        if (version === null) continue;
        if (version === plugin.installed) continue;
        screen.destroy();
        screen = null;

        if (version === '') {
            child_process.execSync(`npm r ${plugin.name}`, {stdio:'inherit'});
        } else {
            child_process.execSync(`npm i ${plugin.name}@${version}`, {stdio:'inherit'});
        }

        await new Promise(resolve=>setTimeout(resolve, 2000));
    }
})().catch(err=>console.error(err.stack));
