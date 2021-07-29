
import path = require('path');
import { HtmlSearcher, htmlutil } from './htmlutil';
import { styling } from './styling';
import { DocField, DocFixItem, DocMethod, DocType as DocType } from './type';
import { FileWriter } from '../../writer/filewriter';

const DOCURL_SCRIPTING = 'https://bedrock.dev/docs/stable/Scripting';
const DOCURL_ADDONS = 'https://bedrock.dev/docs/stable/Addons';

const OUT_SCRIPTING = path.join(__dirname, '../generated.scripting.d.ts');
const OUT_ADDONS = path.join(__dirname, '../generated.addons.d.ts');

const docfixRaw = require('./docfix.json') as Record<string, DocFixItem|string|null>;
docfixRaw.__proto__ = null;
const docfix = new Map<string, DocType>();
for (const name in docfixRaw) {
    const item = docfixRaw[name];
    docfix.set(name, DocType.fromDocFix(item));
}



const BINDING_SUFFIX = ' Bindings';
const COMPONENT_SUFFIX = ' Components';
const EVENT_SUFFIX = ' Events';

const system = new DocType;
const compMap = new DocType;
const listenerEvents = new DocType;
const triggerEvents = new DocType;

async function printInterface(writer:FileWriter, iname:string, s:HtmlSearcher):Promise<void> {

    let type:DocType|null = null;
    try {
        type = DocType.fromTable(s.searchTableAsObject());
    } finally {
        const docfixItem = docfix.get(iname);
        if (docfixItem) {
            if (type) type.patch(docfixItem);
            else type = docfixItem;
        }
        if (type === null) {
            type = DocType.inline('any');
            type.desc = 'Not documented';
        }
        await type.writeTo(iname, writer);
    }
}

async function printComponent(writer:FileWriter, id:string, postfix:string, s:HtmlSearcher):Promise<string> {
    const ns = id.indexOf(':');
    if (ns === -1) {
        console.error(`   └ ${id}: Component without colon`);
        return '';
    }
    const name = `I${styling.toCamelStyle(id.substr(ns+1), '_', true)}${postfix}`;
    console.log(`   └ ${id}: ${name}`);
    await printInterface(writer, name, s);
    return name;
}

async function parseScriptingDoc():Promise<void> {
    console.log('# Parse Scripting Document');
    const base = await htmlutil.wgetElement(DOCURL_SCRIPTING, 'html', 'body', 'div', 'div', 'div', 'div', 'div', 'div');
    if (base === null) {
        console.error(`Scripting: Target element not found`);
        return;
    }

    const writer = new FileWriter(OUT_SCRIPTING);
    await writer.write(`/**\n * Generated with bdsx/bds-scripting/parser.ts\n * docfix.json overrides it.\n * Please DO NOT modify this directly.\n */\ndeclare global {\n\n`);

    try {
        const s = new HtmlSearcher(base);
        await s.minecraftDocHeader('Item', 'h1', async(node, id)=>{
            console.log(id);
            const iname = styling.apiObjectNameToInterfaceName(id);
            if (iname !== null) {
                if (iname === 'IBlock') { // doc bug, wrong <p> tag
                    const p = s.nextIf('p');
                    if (p) {
                        const table = htmlutil.firstChild(p);
                        if (table && table.tagName === 'TABLE') {
                            s.enter(p);
                        }
                    }
                }
                console.log(` └ interface ${iname}`);
                await printInterface(writer, iname, s);
                if (iname === 'ILevelTickingArea') {
                    s.leave();
                }
            } else if (id.endsWith(BINDING_SUFFIX) || id === 'Entity Queries' || id === 'Slash Commands') {
                await s.minecraftDocHeader('Function', 'h2', async(node, id)=>{
                    console.log(` └ ${id}`);
                    const p = s.nextIf('p');
                    const desc = p !== null ? p.innerText : '';
                    const funcidx = id.indexOf('(');
                    if (funcidx !== -1) {
                        const funcloseidx = id.lastIndexOf(')');
                        const funcname = id.substr(0, funcidx).trim();
                        const paramNameMap = new Map<string, number>();
                        const paramNames = id.substring(funcidx+1, funcloseidx).split(',');
                        for (let i=0;i<paramNames.length;i++) {
                            paramNameMap.set(paramNames[i].trim(), i);
                        }
                        const method = new DocMethod(funcname);
                        method.desc = desc;
                        system.methods.push(method);
                        const docfixItem = docfix.get('IVanillaServerSystem')!.getMethod(funcname);
                        if (docfixItem !== null && docfixItem.deleted) return;
                        try {
                            await s.each('Types', node=>{
                                if (node.innerHTML === 'Parameters') return true; // doc bug, 'addFilterToQuery' has not anchor
                                return htmlutil.checks(node, {tag:'h3', class:'anchored-heading'}, {tag: 'span'});
                            }, node=>{
                                const span = htmlutil.follow(node, 'span');
                                const id = span !== null ? span.id : node.innerHTML;
                                switch (id) {
                                case 'Parameters': {
                                    const structure = DocType.fromTable(s.searchTableAsObject());
                                    const fields = structure.fields;
                                    const nfields:DocField[] = [];
                                    for (const field of fields) {
                                        const fieldIndex = paramNameMap.get(field.name);
                                        if (fieldIndex == null) {
                                            console.error(`param name not found: ${field.name}`);
                                            continue;
                                        }
                                        nfields[fieldIndex] = field;
                                    }
                                    method.params.push(...nfields.filter(v=>v));
                                    method.setCamel();
                                    break;
                                }
                                case 'Return Value': {
                                    const structure = DocType.fromTable(s.searchTableAsObject());
                                    if (structure.fields.length !== 0) {
                                        method.return = structure.fields[0].type;
                                    }
                                    break;
                                }
                                }
                            });
                        } finally {
                            if (docfixItem !== null) method.patch(docfixItem);
                        }
                    }
                });
            } else if (id.endsWith(COMPONENT_SUFFIX)) {
                if (id === 'Client Components') return;
                await s.minecraftDocHeader('Components', 'h2', async(node, id)=>{
                    const name = await printComponent(writer, id, 'Component', s);
                    if (name) {
                        compMap.fields.push(new DocField(id, DocType.inline(`IComponent<${name}>`)));
                    }
                });

            } else if (id.endsWith(EVENT_SUFFIX)) {
                if (id === 'Client Events') return;

                await s.minecraftDocHeader('Types', 'h2', async(node, id)=>{
                    console.log(` └ ${id}`);
                    switch (id) {
                    case 'Listening Events':
                        await s.minecraftDocHeader('Events', 'h3', async(node, id)=>{
                            const name = await printComponent(writer, id, 'EventData', s);
                            if (name) {
                                listenerEvents.fields.push(new DocField(id, DocType.inline(`IEventData<${name}>`)));
                            }
                        });
                        break;
                    case 'Trigger-able Events':
                        await s.minecraftDocHeader('Events', 'h3', async(node, id)=>{
                            const name = await printComponent(writer, id, 'Parameters', s);
                            if (name) {
                                triggerEvents.fields.push(new DocField(id, DocType.inline(`IEventData<${name}>`)));
                            }
                        });
                        break;
                    }
                });
            }
        });

    } catch (err) {
        if (err === HtmlSearcher.EOF) return;
        console.error(err && (err.stack || err));
    } finally {
        await compMap.writeTo('MinecraftComponentNameMap', writer);
        await triggerEvents.writeTo('MinecraftServerEventNameMap', writer);
        await listenerEvents.writeTo('MinecraftClientEventNameMap', writer);
        system.patch(docfix.get('IVanillaServerSystem')!);
        await system.writeTo('IVanillaServerSystem', writer);
        await writer.write('}\nexport {};\n');
        await writer.end();
    }
}

async function parseAddonsDoc():Promise<void> {
    console.log('# Parse Addons Document');
    const base = await htmlutil.wgetElement(DOCURL_ADDONS, 'html', 'body', 'div', 'div', 'div', 'div', 'div', 'div');
    if (base === null) {
        console.error(`Addons: Target element not found`);
        return;
    }
    const s = new HtmlSearcher(base);
    let blockParsed = false;

    const writer = new FileWriter(OUT_ADDONS);
    await writer.write(`/**\n * Generated with bdsx/bds-scripting/parser.ts\n * Please DO NOT modify this directly.\n */\n`);
    await writer.write(`declare global {\n\n`);

    try {
        await s.minecraftDocHeader('Blocks', 'h1', async(node, id)=>{
            console.log(id);
            switch (id) {
            case 'Blocks':
                if (blockParsed) break;
                blockParsed = true;
                await DocType.writeTableKeyUnion('BlockId', 'minecraft:', s.searchTableAsObject(), 'Name', v=>v, writer);
                break;
            case 'Entities': {
                const table = s.searchTableAsObject();
                await DocType.writeTableKeyUnion('EntityId', '', table, 'Identifier', v=>`minecraft:${v}`, writer);
                // await DocType.writeTableKeyUnion('EntityFullId', '', table, 'Identifier', row=>row.FullID.text, writer);
                // await DocType.writeTableKeyUnion('EntityShortId', '', table, 'Identifier', row=>row.ShortID.text, writer);
                break;
            }
            case 'Items': {
                const table = s.searchTableAsObject();
                await DocType.writeTableKeyUnion('ItemId', '', table, 'Name', name=>{
                    if (name.startsWith('item.')) return null;
                    return `minecraft:${name}`;
                }, writer);
                // await DocType.writeTableKeyUnion('ItemNumberId', '', table, 'Name', row=>row['ID'].text, writer);
                break;
            }
            case 'Entity Damage Source': {
                await DocType.writeTableKeyUnion('MinecraftDamageSource', '', s.searchTableAsObject(), 'DamageSource', v=>v, writer);
                break;
            }
            }
        });
    } catch (err) {
        if (err === HtmlSearcher.EOF) return;
        console.error(err && (err.stack || err));
    } finally {
        await writer.write('}\n');
        await writer.write('export {};\n');
        await writer.end();
    }
}

(async()=>{
    await parseScriptingDoc();
    await parseAddonsDoc();
})();
