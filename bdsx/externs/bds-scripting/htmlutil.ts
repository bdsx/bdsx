import { HTMLElement, NodeType, parse as parseHtml } from "node-html-parser";
import https = require('https');

export class HtmlRule {
    constructor(public readonly filter: htmlutil.Filter) {
    }
    public readonly finally:(()=>(Promise<void>|void))[] = [];
}

export namespace htmlutil {
    export type Filter = { tag?:string, id?:string; class?:string} | number | string | ((node:HTMLElement)=>any) | Filter[];

    export function *children(node:HTMLElement):IterableIterator<HTMLElement> {
        for (const child of node.childNodes) {
            if (child.nodeType === NodeType.ELEMENT_NODE) {
                yield child as HTMLElement;
            }
        }
    }
    export function firstChild(node:HTMLElement):HTMLElement|null {
        for (const child of children(node)) {
            return child;
        }
        return null;
    }
    export function *childrenFilter(node:HTMLElement, opts:Filter):IterableIterator<HTMLElement> {
        let i=0;
        for (const child of children(node)) {
            if (check(child, opts, i)) {
                yield child;
            }
            i++;
        }
    }
    export function get(node:HTMLElement, opt:Filter):HTMLElement|null {
        switch (typeof opt) {
        case 'number':
            for (const child of children(node)) {
                if (opt === 0) {
                    return child;
                }
                opt--;
            }
            break;
        case 'string':
            opt = opt.toUpperCase();
            for (const child of children(node)) {
                if (child.tagName === opt) {
                    return child;
                }
            }
            break;
        case 'function':
            for (const child of children(node)) {
                if (opt(child)) return child;
            }
            break;
        default:
            if (opt instanceof Array) {
                for (const filter of opt) {
                    const item = get(node, filter);
                    if (item !== null) return item;
                }
            } else {
                if (opt.tag) opt.tag = opt.tag.toUpperCase();
                for (const child of children(node)) {
                    if (opt.id && child.id !== opt.id) continue;
                    if (opt.class && child.classNames.indexOf(opt.class!) === -1) continue;
                    if (opt.tag && child.tagName !== opt.tag) continue;
                    return child;
                }
            }
            break;
        }
        return null;
    }
    export function follow(node:HTMLElement, ...opts:Filter[]):HTMLElement|null {
        for (const opt of opts) {
            const child = get(node, opt);
            if (child === null) return null;
            node = child;
        }
        return node;
    }
    export function check(node:HTMLElement, opt:Filter, index?:number):boolean {
        switch (typeof opt) {
        case 'number': return index === opt;
        case 'string':  return node.tagName === opt.toUpperCase();
        case 'function': return !!opt(node);
        default:
            if (opt instanceof Array) {
                for (const filter of opt) {
                    if (check(node, filter)) return true;
                }
                return false;
            } else {
                if (opt.id && node.id !== opt.id) return false;
                if (opt.class && node.classNames.indexOf(opt.class) === -1) return false;
                if (opt.tag && node.tagName !== opt.tag.toUpperCase()) return false;
                return true;
            }
        }
    }
    export function checks(node:HTMLElement, opt:Filter, ...opts:Filter[]):HTMLElement|null {
        if (!check(node, opt)) return null;
        return follow(node, ...opts);
    }

    export function tableToObject(table:HTMLElement):HtmlSearcher.TableRow[] {
        const out:HtmlSearcher.TableRow[] = [];

        const keys:string[] = [];

        for (const row of htmlutil.childrenFilter(table, 'tr')) {
            let i=0;
            const obj:HtmlSearcher.TableRow = {};
            let isCell = false;
            for (const cell of htmlutil.childrenFilter(row, ['td', 'th'])) {
                if (cell.tagName === 'TH') {
                    keys[i] = cell.innerText.replace(/ /g, '');
                } else {
                    if (cell.childNodes.length !== 0) {
                        const column = obj[keys[i]] = {text: cell.childNodes[0].innerText} as {text:string, table?:HtmlSearcher.TableRow[]};
                        isCell = true;
                        const searcher = new HtmlSearcher(cell);
                        try {
                            column.table = htmlutil.tableToObject(searcher.search('table'));
                        } catch (err) {
                            if (err !== HtmlSearcher.EOF) throw err;
                        }
                    }
                }
                i++;
            }
            if (isCell) {
                out.push(obj);
            }
        }
        return out;
    }

    export function wgetText(url:string):Promise<string> {
        return new Promise((resolve ,reject)=>{
            https.get(url, res=>{
                let text = '';
                res.on('data', data=>{
                    text += data.toString();
                });
                res.on('end', ()=>{
                    resolve(text);
                });
                res.on('error', reject);
            }).on('error', reject);
        });
    }

    export async function wgetElement(url:string, ...followFilter:Filter[]):Promise<HTMLElement|null> {
        const out = parseHtml(await wgetText(url));
        return follow(out, ...followFilter);
    }
}

export class HtmlSearcher {
    private index = -1;
    private readonly rules:HtmlRule[] = [];
    private readonly queue:[HTMLElement, number][] = [];

    constructor(public base:HTMLElement) {
    }

    current():HTMLElement {
        return this.base.childNodes[this.index] as HTMLElement;
    }

    nextIf(filter:htmlutil.Filter):HTMLElement|null {
        const oldidx = this.index;
        const element = this.next();
        if (!htmlutil.check(element, filter)) {
            this.index = oldidx;
            return null;
        }
        return element;
    }
    next():HTMLElement {
        for (;;) {
            const node = this.base.childNodes[++this.index];
            if (!node) throw HtmlSearcher.EOF;
            if (node.nodeType !== NodeType.ELEMENT_NODE) continue;
            const element = node as HTMLElement;
            for (let i=this.rules.length-1;i>=0;i--) {
                const rule = this.rules[i];
                if (htmlutil.check(element, rule.filter)) throw rule;
            }
            return element;
        }
    }
    search(filter:htmlutil.Filter):HTMLElement{
        for (;;) {
            const node = this.next();
            if (htmlutil.check(node, filter)) return node;
        }
    }
    searchTableAsObject():HtmlSearcher.TableRow[] {
        return htmlutil.tableToObject(this.search('table'));
    }
    async each(name:string, filter:htmlutil.Filter, wrap:(node:HTMLElement)=>(Promise<void>|void)):Promise<void> {
        let count = 0;
        for (;;) {
            try {
                this.search(filter);
            } catch (err) {
                if (count === 0) console.error(` └ no ${name}`);
                throw err;
            }
            const rule = new HtmlRule(filter);
            this.rules.push(rule);
            for (;;) {
                try {
                    count ++;
                    await wrap(this.current());
                    break;
                } catch (err) {
                    if (err instanceof HtmlRule) {
                        if (rule === err) continue;
                        this.rules.pop();
                    }
                    throw err;
                } finally {
                    for (const final of rule.finally) {
                        await final();
                    }
                    rule.finally.length = 0;
                }
            }
            this.rules.pop();
        }
    }

    minecraftDocHeader(name:string, headerTag:string, inner:(node:HTMLElement, id:string)=>(void|Promise<void>)):Promise<void> {
        return this.each(name, node=>htmlutil.checks(node, {tag:headerTag, class:'anchored-heading'}, {tag:'span'}), async(node)=>{
            const id = htmlutil.follow(node, 'span')!.id;
            await inner(node, id);
        });
    }

    async inside(target:HTMLElement, fn:()=>(Promise<void>|void)):Promise<void> {
        this.enter(target);
        try {
            await fn();
        } catch (err) {
            if (err === HtmlSearcher.EOF) return;
            throw err;
        }
        this.leave();
    }
    onexit(final:()=>(Promise<void>|void)):void {
        const last = this.rules[this.rules.length-1];
        last.finally.push(final);
    }

    enter(target:HTMLElement):void {
        this.queue.push([this.base, this.index]);
        this.base = target;
        this.index = -1;
    }

    leave():void {
        const last = this.queue.pop();
        if (!last) throw Error('Out of bounds');
        this.base = last[0];
        this.index = last[1];
    }
    public static readonly EOF = {};
}

export namespace HtmlSearcher {
    export interface TableRow {
        [key:string]:{text:string, table?:TableRow[]};
    }
}
