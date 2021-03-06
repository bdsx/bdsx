

import child_process = require('child_process');
import blessed = require('blessed');
import fs = require('fs');
import { version } from 'typescript';

const SELECTABLE_ITEM_STYLE = {
    fg: 'magenta',
    selected: {
        bg: 'blue'
    }
};

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

class PackageInfo {
    public readonly name: string;
    public readonly desc: string;
    public readonly author: string[];
    public readonly date: string;
    public readonly version: string;
    public readonly installed: string;

    private versions:string[]|null = null;

    constructor(line: string, deps?:Record<string, {version:string}>) {
        const [name, desc, author, date, version] = line.split('\t');
        this.name = name;
        this.desc = desc;
        this.author = author.split(' ').map(v=>v.substr(1));
        this.date = date;
        this.version = version;
        
        const info = deps && deps[this.name];
        this.installed = info && info.version || '';
    }

    async getVersions():Promise<string[]> {
        if (this.versions !== null) return this.versions;
        const versions = await exec(`npm view "${this.name}" versions --json`);
        return this.versions = JSON.parse(versions.replace(/'/g, '"'));
    }

    static async search(name: string, deps?:Record<string, {version:string}>): Promise<PackageInfo[]> {
        const output = await exec(`npm search --parseable "${name}"`);
        const result = output.split('\n');
        const last = result.pop();
        if (last) result.push(last);
        return result.map(item => new PackageInfo(item, deps));
    }

    toMenuString(): string[] {
        const authors = this.author.join(' ');
        const MAX_LEN = 18;
        return [this.installed || 'No', this.name, this.desc, authors.length > MAX_LEN ? authors.substr(0, MAX_LEN-3)+'...' : authors, this.date];
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
function searchAndSelect(prefix:string, deps:Record<string, {version:string}>):Promise<PackageInfo> {
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
            if (name === '') {
                table.setData([['Please enter the plugin name for searching']]);
                processInput();
                return;
            }
            scr.remove(table);
            packages = await loadingWrap('Searching...', PackageInfo.search(name, deps));
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
                searchText(prefix+value);
            });
        }
        table.key('escape', processInput);
        scr.append(search);
        search.setValue(latestSearched);
        scr.append(table);
        searchText(prefix+latestSearched);
    });
}

function selectVersion(name:string, latestVersion:string, installedVersion:string, versions:string[]):Promise<(string|null)> {
    return new Promise(resolve=>{
        if (screen === null) throw Error('blessed.screen not found');
        
        const vnames = versions.reverse().map(v=>`${name}@${v}`);
        let installed = false;
        for (let i=0;i<versions.length;i++) {
            let moveToTop = false;
            if (versions[i] === latestVersion) {
                vnames[i] += ' (Latest)';
                moveToTop = true;
            } 
            if (versions[i] === installedVersion) {
                vnames[i] += ' (Installed)';
                moveToTop = true;
                installed = true;
            }

            if (moveToTop) {
                vnames.unshift(vnames.splice(i, 1)[0]);
                versions.unshift(versions.splice(i, 1)[0]);
            }
        }

        if (installed) {
            vnames.unshift('Remove');
            versions.unshift('');
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
            resolve(versions[index]);
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

        const packagejson = JSON.parse(fs.readFileSync('./package-lock.json', 'utf8'));
        const deps = packagejson.dependencies || {};
    
        const plugin = await searchAndSelect('@bdsx/', deps);
    
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