import { imageSections } from "./imagesections";
import { PdbIdentifier } from "./symbolparser";
import fs = require('fs');
import path = require('path');
import { styling } from "../externs/bds-scripting/styling";



const specialNamesForClass = [
    "`vector deleting destructor'",
    "`scalar deleting destructor'"
];
const specialNameRemap = new Map<string, string>();
specialNameRemap.set("`vector deleting destructor'", '__vector_deleting_destructor');
specialNameRemap.set("`scalar deleting destructor'", '__scalar_deleting_destructor');
specialNameRemap.set('any', '_any');
specialNameRemap.set('string', '_string');
specialNameRemap.set('function', '_function');
specialNameRemap.set('add', '_add');
specialNameRemap.set('Symbol', '_Symbol');
specialNameRemap.set("`vftable'", '__vftable');

const IGNORE_THIS = {};

const outpath = path.join(__dirname, 'globals');
try {
    fs.mkdirSync(outpath);
} catch (err) {
}

interface Identifier extends PdbIdentifier {
    host?:TsFile;
    jsTypeName?:string;
    paramVarName?:string;
}

const NAMES = ['T','U','V','W','X','Y','Z'];

type Filter = ((id:Identifier)=>boolean)|string|null|RegExp;

function filterToFunction(filters:Filter[]):(id:Identifier)=>boolean {
    filters = filters.filter(f=>f!==null);
    return id=>{
        for (const filter of filters) {
            switch (typeof filter) {
            case 'string':
                if (id.name === filter) return true;
                break;
            case 'function':
                if (filter(id)) return true;
                break;
            default:
                if (filter!.test(id.name)) return true;
                break;
            }
        }
        return false;
    };
}

function getFiltered(filters:Filter[]):Identifier[] {
    const filter = filterToFunction(filters);
    const filted:Identifier[] = [];
    for (let i=0;i<ids.length;) {
        const id = ids[i];
        if (filter(id)) {
            filted.push(id);
            if (i === ids.length-1) {
                ids.pop();
            } else {
                ids[i] = ids.pop()!;
            }
        } else {
            i++;
        }
    }
    return filted;
}

function templateSpecialized(name:string):((id:Identifier)=>boolean)|null {
    const base = PdbIdentifier.global.get(name);
    if (!base.isTemplate) return null;
    return id=>id === base || id.templateBase === base;
}

function templateArgs(name:string, idx:number):((id:Identifier)=>boolean)|null {
    const base = PdbIdentifier.global.get(name);
    if (!base.isTemplate) return null;
    const list = new WeakSet<Identifier>();
    for (const spec of base.specialized) {
        list.add(spec.arguments[idx]);
    }
    return id=>list.has(id);
}

function perTemplateArg(name:string, idx:number, ...filters:Filter[]):((id:Identifier)=>boolean)|null {
    const base = PdbIdentifier.global.get(name);
    if (!base.isTemplate) return null;

    const func = filterToFunction(filters);

    return id=>{
        if (id.templateBase !== base) return false;
        return func(id.arguments[idx]);
    };
}

function checkIterableItemCount(iter:Iterable<any>, n:number):boolean{
    for (const item of iter) {
        n --;
        if (n === 0) return true;
    }
    return false;
}

enum IdType {
    Type,
    Value
}

class ImportTarget {
    public imports:Map<string, IdType> = new Map;

    constructor(public readonly path:string) {
    }

    import(item:string, idType:IdType):void {
        const v = this.imports.get(item);
        if (v === idType) return;
        this.imports.set(item, (v!|0) | idType);
    }

}

class TsWriter {
    public text:string = '';
    private tabtext:string = '';

    private opened:string|null = null;

    appendAtLastLine(str:string):void {
        if (!this.text.endsWith('\n')) return;
        this.text = this.text.substr(0, this.text.length-1) + str + '\n';
    }
    writeln(text?:string):void {
        if (this.opened !== null) {
            this.text += this.opened;
            this.opened = null;
        }
        if (!text) {
            this.text += '\n';
        } else {
            text = text.trim();
            if (text === '') {
                this.text += '\n';
            } else {
                this.text += `${this.tabtext}${text}\n`;
            }
        }
    }
    open(openstr:string, always?:boolean):void {
        if (this.opened !== null) {
            this.text += this.opened;
            this.opened = null;
        }
        if (always) {
            this.text += `${this.tabtext}${openstr}\n`;
            this.tab();
            return;
        }
        this.opened = `${this.tabtext}${openstr}\n`;
        this.tab();
    }

    close(closestr:string):void {
        this.detab();
        if (this.opened === null) {
            this.text += `${this.tabtext}${closestr}\n`;
        } else {
            this.opened = null;
        }
    }

    tab():void {
        this.tabtext += '    ';
    }

    detab():void {
        this.tabtext = this.tabtext.substr(0, this.tabtext.length-4);
    }
}

class TsFileBase {
    constructor(public readonly path:string) {
    }

    makeTarget():ImportTarget {
        return new ImportTarget(this.path);
    }

}

class TsFileExtern extends TsFileBase {

}

const imports = {
    nativetype: new TsFileExtern('../../nativetype'),
    complextype: new TsFileExtern('../../complextype'),
    nativeclass: new TsFileExtern('../../nativeclass'),
    makefunc: new TsFileExtern('../../makefunc'),
    dll: new TsFileExtern('../../dll'),
    core: new TsFileExtern('../../core'),
    common: new TsFileExtern('../../common'),
    pointer: new TsFileExtern('../../pointer'),
};

class TsFile extends TsFileBase {
    private readonly imports = new Map<TsFileBase, ImportTarget>();
    public readonly source = new TsWriter;
    private currentNs:PdbIdentifier = PdbIdentifier.global;

    private _getVarName(type:Identifier):string {
        let baseid:Identifier = type;
        for (;;) {
            if (baseid.paramVarName) return baseid.paramVarName;
            if (baseid.decoedFrom !== null) {
                baseid = baseid.decoedFrom;
            } else if (baseid.functionBase !== null) {
                baseid = baseid.functionBase;
            } else if (baseid.templateBase !== null) {
                baseid = baseid.templateBase;
            } else {
                break;
            }
        }
        let basename = this.getName(baseid, IdType.Value, {stripParent: true});
        if (basename.endsWith('_t')) basename = basename.substr(0, basename.length-2);
        basename = styling.toCamelStyle(basename, /[[\] ]/g, false);
        return basename;
    }

    *enterNamespace(item:Identifier):IterableIterator<void> {
        const name = this.getName(item, IdType.Value);
        this.source.open(`export namespace ${name} {`);
        const oldns = this.currentNs;
        this.currentNs = item;
        yield;
        this.source.close(`}`);
        this.currentNs = oldns;
    }

    importName(host:TsFileBase|undefined, name:string, idType:IdType):void {
        if (host === this) return;
        if (host !== undefined) {
            let target = this.imports.get(host);
            if (!target) this.imports.set(host, target = host.makeTarget());
            target.import(name, idType);
        } else {
            console.error(`${name}: host not found`);
        }
    }

    importId(id:Identifier, idType:IdType):void {
        for (;;) {
            if (id.isLambda) throw IGNORE_THIS;
            if (id.isMemberPointer) {
                this.importId(id.memberPointerBase!, idType);
                this.importId(id.returnType!, idType);
                for (const arg of id.arguments) {
                    this.importId(arg, idType);
                }
                return;
            }
            if (id.isFunctionType) {
                this.importId(id.returnType!, idType);
                for (const arg of id.arguments) {
                    this.importId(arg, idType);
                }
                return;
            }
            if (id.jsTypeName !== undefined) {
                if (id.jsTypeName === 'VoidPointer') {
                    this.importName(imports.core, id.jsTypeName, idType);
                } else {
                    this.importName(imports.nativetype, id.jsTypeName, idType);
                }
                return;
            }
            if (id.decoedFrom !== null) {
                id = id.decoedFrom!;
                continue;
            }
            if (id.parent !== PdbIdentifier.global) {
                id = id.parent!;
                continue;
            }
            break;
        }
        if (/^[0-9]+$/.test(id.name)) {
            if (id.parent !== PdbIdentifier.global) {
                console.error(`Constant is not in global`);
            }
            return; // constant
        }
        if (id.templateBase !== null) {
            id = id.templateBase;
        }
        this.importName(id.host, id.name, idType);
    }

    ItHasParent(item:Identifier):boolean {
        return item.parent !== PdbIdentifier.global && item.parent !== this.currentNs;
    }

    getName(id:Identifier, idType:IdType, opts:{stripParent?:boolean, define?:'const'|'type'|'let', isStatic?:boolean} = {}):string {
        let result = '';
        let needDot = false;
        if (this.ItHasParent(id)) {
            if (!opts.stripParent) {
                result = this.stringify(id.parent!, idType, false);
                if (idType !== IdType.Type) {
                    if (!id.isType && id.parent!.isClassLike && !(opts.isStatic ?? id.isStatic)) result += '.prototype';
                }
                needDot = true;
            }
        } else {
            if (opts.define) {
                result += `export ${opts.define} `;
            }
        }

        let name = id.removeParameters().name;
        if (id.parent === null) {
            throw Error(`${id.name} has not parent`);
        }
        if (id.parent.isClassLike) {
            if (id.parent.name === name) {
                if (idType !== null)  {
                    this.importName(imports.nativetype, 'NativeType', idType);
                }
                if (needDot) result += '.';
                return result + '__constructor';
            } else {
                if (name.startsWith('~')) {
                    if (idType !== null) {
                        this.importName(imports.nativetype, 'NativeType', idType);
                    }
                    return result + `[NativeType.dtor]`;
                }
            }
        }

        if (id.isLambda) throw IGNORE_THIS;

        const remapped = specialNameRemap.get(name);
        if (remapped !== undefined) name = remapped;
        if (needDot) result += '.';
        return result + name;
    }

    makeVarParams(args:Identifier[]):string {
        const names = new Map<string, {index:number, counter:number}>();
        const namearr:string[] = [];
        for (let i=0;i<args.length;i++) {
            const basename = this._getVarName(args[i]);
            let name = basename;
            const info = names.get(name);
            if (info === undefined) {
                names.set(name, {index:i, counter:1});
            } else {
                if (info.counter === 1) {
                    namearr[info.index] = basename + '_' + info.counter;
                }
                info.counter++;
                name = basename + '_' + info.counter;
            }
            namearr[i] = name;
        }
        for (let i=0;i<namearr.length;i++) {
            namearr[i] = `${namearr[i]}:${this.stringify(args[i], IdType.Type, true)}`;
        }
        return namearr.join(', ');
    }

    stringify(id:Identifier, idType:IdType, deref:boolean):string {
        if (id.redirectedFrom !== null) {
            return this.stringify(id.redirectedFrom, idType, deref);
        }
        if (id.decoedFrom !== null && id.deco === 'const') return this.stringify(id.decoedFrom, idType, deref);
        this.importId(id, idType);
        if (id.jsTypeName !== undefined) {
            return id.jsTypeName;
        }
        if (id.decoedFrom !== null && (id.deco === '*' || id.deco === '&')) {
            const str = this.stringify(id.decoedFrom, idType, false);
            if (idType === IdType.Value && id.isValue) {
                if (id.decoedFrom.address === 0) {
                    console.error(`${id}: address not found`);
                    throw IGNORE_THIS;
                }
                return str;
            }

            if (deref) return str;
            this.importName(imports.pointer, 'Wrapper', idType);
            if (idType === IdType.Type) return `Wrapper<${str}>`;
            else return `Wrapper.make(${str}.ref())`;
        }
        if (id.templateBase !== null) {
            if (idType === IdType.Type) {
                return `${this.stringify(id.templateBase, idType, deref)}<${id.arguments.map(id=>this.stringify(id, idType, deref)).join(', ')}>`;
            } else {
                if (id.name.startsWith('_read')) debugger;
                return `${this.stringify(id.templateBase, idType, false)}.make(${id.arguments.map(id=>this.stringify(id, idType, false)).join(', ')})`;
            }
        }
        if (id.isMemberPointer) {
            this.importName(imports.complextype, 'MemberPointer', idType);
            const base = this.stringify(id.memberPointerBase!, idType, false);
            const type = this.stringify(id.returnType!, idType, false);
            if (idType === IdType.Type) {
                return `MemberPointer<${base}, ${type}>`;
            } else {
                return `MemberPointer.make(${base}, ${type})`;
            }
        }
        if (id.isFunctionType) {
            if (idType === IdType.Type) {
                const params = this.makeVarParams(id.arguments);
                return `(${params})=>${this.stringify(id.returnType!, idType, deref)}`;
            } else {
                this.importName(imports.complextype, 'NativeFunctionType', idType);
                return `NativeFunctionType.make(${this.stringify(id.returnType!, idType, true)}, null, ${id.arguments.map(id=>this.stringify(id, idType, true))})`;
            }
        }
        return this.getName(id, idType);
    }
    getConstructorType(item:Identifier):string {
        if (item.isClassLike) {
            this.importName(imports.nativeclass, 'NativeClassType', IdType.Type);
            return `NativeClassType<${this.stringify(item, IdType.Type, false)}>`;
        } else {
            debugger;
            return '';
        }
    }

    getValueString(item:Identifier):string {
        if (item.address === 0) {
            console.error(`${item}: does not have the address`);
            throw IGNORE_THIS;
        }
        this.importName(imports.dll, 'dll', IdType.Value);
        this.importName(imports.core, 'StaticPointer', IdType.Value);
        if (item.returnType === null) {
            if (item.arguments.length !== 0) console.error(`${item.name}: no has the return type but has the arguments types`);
            return `dll.current.addAs(StaticPointer, ${item.address})`;
        }
        if (item.isFunction) {
            this.importName(imports.makefunc, 'makefunc', IdType.Value);
            const params = item.arguments.map(id=>this.stringify(id, IdType.Value, true));
            params.unshift(this.stringify(item.returnType, IdType.Value, true), 'null');
            params.unshift(`dll.current.addAs(StaticPointer, ${item.address})`);
            return `makefunc.js(${params.join(', ')})`;
        } else {
            this.importName(imports.pointer, 'Wrapper', IdType.Value);
            return `dll.current.addAs(Wrapper.make(${this.stringify(item.returnType, IdType.Value, false)}), ${item.address})`;
        }
    }

    isSkipable(item:Identifier):boolean {
        if (item.isFunction) return true;
        if (item.decoedFrom !== null) return true;
        if (item.isLambda) return true;
        return false;
    }

    writeAll():void {
        let importtext = '\n';
        for (const target of this.imports.values()) {
            if (target.imports === null) continue;
            const types:string[] = [];
            const values:string[] = [];
            for (const [name, type] of target.imports) {
                switch (type) {
                case IdType.Type: types.push(name); break;
                case IdType.Value: values.push(name); break;
                }
            }
            if (types.length !== 0) importtext += `import type { ${types.join(', ')} } from "${target.path}";\n`;
            if (values.length !== 0) importtext += `import { ${values.join(', ')} } from "${target.path}";\n`;
        }
        importtext += '\n';

        fs.writeFileSync(path.join(outpath, this.path+'.ts'), importtext+this.source.text);
        this.source.text = '';
    }
}

class TsFileImplement extends TsFile {

    writeGlobalRedirect(item:Identifier):void {
        const ori = item.redirectTo;
        if (ori === null) {
            console.error(`${item}: is not redirecting`);
            return;
        }
        const from = ori.redirectedFrom;
        ori.redirectedFrom = null;
        this.source.writeln(`${this.getName(item, IdType.Value, {define: 'const'})} = ${this.stringify(ori, IdType.Value, false)};`);
        ori.redirectedFrom = from;
    }

    writeGlobalMake(item:Identifier):void {
        this.source.writeln(`// ${item.source}`);
        const from = item.redirectedFrom;
        item.redirectedFrom = null;
        this.source.writeln(`${this.stringify(item, IdType.Value, false)};`);
        item.redirectedFrom = from;
    }

    writeGlobalPointer(item:Identifier):void {
        this.importName(imports.core, 'StaticPointer', IdType.Value);
        this.importName(imports.dll, 'dll', IdType.Value);
        this.source.writeln(`${this.getName(item.removeParameters(), IdType.Value, {define: 'const'})} = dll.current.addAs(StaticPointer, ${item.address});`);
    }

    writeOverloads(item:Identifier, overloads:Identifier[], isStatic:boolean):void {
        if (overloads.length === 0) return;
        this.source.writeln(`// ${item.source}`);
        if (overloads.length >= 2) {
            this.importName(imports.complextype, 'OverloadedFunction', IdType.Value);
            this.source.writeln(`${this.getName(item, IdType.Value, {isStatic})} = OverloadedFunction.make()`);
            const last = overloads.pop()!;
            for (const overload of overloads) {
                try {
                    const params = overload.arguments.map(id=>this.stringify(id, IdType.Value, true));
                    params.unshift(this.getValueString(overload));
                    this.source.writeln(`// ${overload.source}`);
                    this.source.writeln(`.overload(${params.join(', ')})`);
                } catch (err) {
                    if (err !== IGNORE_THIS) throw err;
                }
            }
            try {
                const params = last.arguments.map(id=>this.stringify(id, IdType.Value, true));
                params.unshift(this.getValueString(last));
                this.source.writeln(`// ${last.source}`);
                this.source.writeln(`.overload(${params.join(', ')});`);
            } catch (err) {
                if (err !== IGNORE_THIS) throw err;
                this.source.appendAtLastLine(`;`);
            }
        } else {
            const fn = overloads[0];
            this.source.writeln(`${this.getName(fn.removeTemplateParameters(), IdType.Value, {isStatic})} = ${this.getValueString(fn)};`);
        }
    }

    writeField(item:Identifier):void {
        if (item.isFunctionBase || item.isTemplateFunctionBase) {
            if (item.templateBase !== null) return;
            this.writeOverloads(item, [...item.allOverloads(false)], false);
            this.writeOverloads(item, [...item.allOverloads(true)], true);
        } else {
            this.source.writeln(`// ${item.source}`);
            this.source.writeln(`${this.getName(item, IdType.Value)} = ${this.getValueString(item)};`);
        }
    }
}

class TsFileDeclaration extends TsFile {
    public readonly implements:TsFileImplement;
    private readonly ids:Identifier[];

    public static readonly all:TsFileDeclaration[] = [];

    constructor(
        path:string,
        ...filters:Filter[]) {
        super(path);
        this.implements = new TsFileImplement(path+'_impl');
        this.ids = getFiltered(filters);
        this.ids.sort();
        for (const id of this.ids) {
            id.host = this;
        }
        TsFileDeclaration.all.push(this);
    }

    writeOverloads(item:Identifier, isGlobal:boolean, isStatic:boolean):void {
        if (!item.isTemplateFunctionBase && !item.isFunctionBase) {
            throw Error(`${item}: is not a function base`);
        }
        if (isGlobal && isStatic) {
            console.error(`${item}: is static but it's also global`);
        }

        let overloads = [...item.allOverloads(isStatic)];
        if (item.isTemplateFunctionBase) {
            overloads = overloads.filter(over=>{
                for (const arg of over.arguments) {
                    if (arg.getArraySize() !== null) return false; // ignore template array argument
                }
                return true;
            });
        }
        if (overloads.length === 0) {
            return;
        }
        let prefix = isStatic ? 'static ' : '';
        if (isGlobal) prefix = 'export function ';
        const name = this.getName(item.removeTemplateParameters(), IdType.Value, {stripParent: true, isStatic});
        if (overloads.length === 1) {
            item = overloads[0];
            if (item.returnType === null) {
                if (item.arguments.length !== 0) console.error(`${item}: no has the return type but has the arguments types`);
                this.importName(imports.core, 'StaticPointer', IdType.Type);
                this.source.writeln(`// ${item.source}`);
                this.source.writeln(`${prefix}${item.removeParameters().name}:StaticPointer;`);
            } else {
                this.importName(imports.common, 'abstract', IdType.Value);
                const params = this.makeVarParams(item.arguments);
                this.source.writeln(`// ${item.source}`);
                this.source.writeln(`${prefix}${name}(${params}):${this.stringify(item.returnType, IdType.Type, true)} { abstract(); }`);
            }
        } else {
            for (const over of overloads) {
                this.source.writeln(`// ${over.source}`);
                const params = this.makeVarParams(over.arguments);
                this.source.writeln(`${prefix}${name}(${params}):${this.stringify(over.returnType!, IdType.Type, true)};`);
            }
            this.source.writeln(`// ${item.source}`);
            this.source.writeln(`${prefix}${name}(...args:any[]):any { abstract(); }`);
        }

    }

    writeGlobalRedirect(item:Identifier):void {
        const ori = item.redirectTo;
        if (ori === null) {
            console.error(`${item}: is not redirecting`);
            return;
        }
        const from = ori.redirectedFrom;
        ori.redirectedFrom = null;
        this.source.writeln(`${this.getName(item, IdType.Type, {define: 'type'})} = ${this.stringify(ori, IdType.Type, true)};`);
        this.source.writeln(`${this.getName(item, IdType.Type, {define: 'let'})}:${this.getConstructorType(ori)};`);
        item.redirectTo = from;
    }

    writeIdAsField(item:Identifier):void {
        if (this.isSkipable(item)) return;
        if (item.isTemplateFunctionBase || item.isFunctionBase) {
            if (item.templateBase !== null) return;
            this.writeOverloads(item, false, false);
            this.writeOverloads(item, false, true);
            this.implements.writeField(item);
        } else {
            if (item.isStatic) {
                if (item.returnType !== null) {
                    const type = this.stringify(item.returnType, IdType.Type, false);
                    this.importName(imports.pointer, 'Wrapper', IdType.Type);
                    this.source.writeln(`static ${this.getName(item, IdType.Value, {stripParent: true})}:Wrapper<${type}>;`);
                } else {
                    this.importName(imports.core, 'StaticPointer', IdType.Type);
                    this.source.writeln(`static ${this.getName(item, IdType.Value, {stripParent: true})}:StaticPointer;`);
                }
                this.implements.writeField(item);
            } else {
                throw Error(`${item}: Unexpected field`);
            }
        }
    }

    writeId(item:Identifier):void {
        if (this.isSkipable(item)) return;
        if (item.templateBase !== null) { // serialized template class
            if (item.isFunctionBase) return;
            this.implements.writeGlobalMake(item);
        } else {
            if (item.isTemplateFunctionBase || item.isFunctionBase) {
                this.writeOverloads(item, true, false);
                this.implements.writeOverloads(item, [...item.allOverloads(false)], false);
            } else if (item.isRedirectType) {
                this.implements.writeGlobalRedirect(item);
                this.writeGlobalRedirect(item);
            } else if (item.isTemplate) {
                const params:string[] = [];
                if (item.specialized.length === 0) {
                    console.error(`${item.name}: has not the specialized class`);
                    params.push('T');
                } else {
                    const first = item.specialized[0];
                    const n = first.arguments.length;
                    for (let i=0;i<n;i++) {
                        params.push(NAMES[i]);
                    }
                }
                this.importName(imports.complextype, 'NativeTemplateClass', IdType.Value);
                this.source.writeln(`// ${item.source}`);
                const paramsText = (params.length !== 0) ? `<${params.join(', ')}>`: '';
                this.source.writeln(`export class ${this.getName(item, IdType.Value)}${paramsText} extends NativeTemplateClass {`);
                this.source.writeln(`}`);
            } else {
                for (const name of specialNamesForClass) {
                    if (item.children.has(name)) {
                        item.isClassLike = true;
                    }
                }

                this.importName(imports.nativeclass, 'NativeClass', IdType.Value);

                const skip = new Set<Identifier>();
                if (item.isClassLike) {
                    this.source.writeln(`// ${item.source}`);
                    this.source.open(`export class ${this.getName(item, IdType.Value)} extends NativeClass {`, true);
                    for (const child of item.children.values()) {
                        if (child.isClassLike) {
                            continue;
                        } else if (child.isFunction) {
                            skip.add(child);
                            if (child.functionBase!.name === item.name && child.arguments.length === 0) {
                                this.source.writeln(`[NativeType.ctor]():void{ return this.__constructor(); }`);
                            }
                        } else if (child.isTemplateFunctionBase || child.isFunctionBase) {
                            skip.add(child);
                            if (child.templateBase !== null) continue;
                            try {
                                this.writeIdAsField(child);
                            } catch (err) {
                                if (err !== IGNORE_THIS) throw err;
                            }
                        } else if (child.isDecoedType) {
                            skip.add(child);
                        } else if (child.isStatic) {
                            try {
                                this.writeIdAsField(child);
                            } catch (err) {
                                if (err !== IGNORE_THIS) throw err;
                            }
                        } else if (child.name === "`vftable'") {
                            child.isStatic = true;
                            this.writeIdAsField(child);
                        }
                    }
                    this.source.close(`}`);
                }
                if (skip.size !== item.children.size) {
                    for (const _ of this.enterNamespace(item)) {
                        for (const child of item.children.values()) {
                            try {
                                this.writeId(child);
                            } catch (err) {
                                if (err !== IGNORE_THIS) throw err;
                            }
                        }
                    }
                }
            }
        }
    }

    writeAll():void {
        for (const item of this.ids) {
            try {
                this.writeId(item);
            } catch (err) {
                if (err !== IGNORE_THIS) throw err;
            }
        }
        super.writeAll();

        this.implements.source.writeln();
        this.implements.writeAll();
    }

}

const bool_t:Identifier = PdbIdentifier.global.get('bool');
const void_t:Identifier = PdbIdentifier.global.get('void');
const float_t:Identifier = PdbIdentifier.global.get('float');
const double_t:Identifier = PdbIdentifier.global.get('double');
const char_t:Identifier = PdbIdentifier.global.get('char');
const uchar_t:Identifier = PdbIdentifier.global.get('char unsigned');
const short_t:Identifier = PdbIdentifier.global.get('short');
const ushort_t:Identifier = PdbIdentifier.global.get('short unsigned');
const int_t:Identifier = PdbIdentifier.global.get('int');
const uint_t:Identifier = PdbIdentifier.global.get('int unsigned');
const __int64_t:Identifier = PdbIdentifier.global.get('__int64');
const __uint64_t:Identifier = PdbIdentifier.global.get('__int64 unsigned');
const typename_t:Identifier = PdbIdentifier.global.get('typename');
const voidptr_t:Identifier = PdbIdentifier.global.get('void*');
const voidconstptr_t:Identifier = PdbIdentifier.global.get('void const*');
const std = PdbIdentifier.std;
const string_t = std.get('basic_string<char,std::char_traits<char>,std::allocator<char> >');
bool_t.jsTypeName = 'bool_t';
bool_t.paramVarName = 'b';
void_t.jsTypeName = 'void_t';
char_t.jsTypeName = 'int8_t';
char_t.paramVarName = 'c';
uchar_t.jsTypeName = 'uint8_t';
uchar_t.paramVarName = 'uc';
short_t.jsTypeName = 'int16_t';
short_t.paramVarName = 's';
ushort_t.jsTypeName = 'uint16_t';
ushort_t.paramVarName = 'us';
int_t.jsTypeName = 'int32_t';
int_t.paramVarName = 'i';
uint_t.jsTypeName = 'uint32_t';
uint_t.paramVarName = 'u';
__int64_t.jsTypeName = 'bin64_t';
__int64_t.paramVarName = 'i';
__uint64_t.jsTypeName = 'bin64_t';
__uint64_t.paramVarName = 'u';
voidptr_t.jsTypeName = 'VoidPointer';
voidptr_t.paramVarName = 'p';
voidconstptr_t.jsTypeName = 'VoidPointer';
voidconstptr_t.paramVarName = 'p';
float_t.jsTypeName = 'float32_t';
float_t.paramVarName = 'f';
double_t.jsTypeName = 'float64_t';
double_t.paramVarName = 'd';
std.get('string').redirect(string_t);

PdbIdentifier.global.get('RakNet').get('RakNetRandom').setAsClass();

// remove useless identities

PdbIdentifier.global.children.delete('[type]');
PdbIdentifier.global.children.delete('void');
PdbIdentifier.global.children.delete('bool');
PdbIdentifier.global.children.delete('char');
PdbIdentifier.global.children.delete('short');
PdbIdentifier.global.children.delete('long');
PdbIdentifier.global.children.delete('int');
PdbIdentifier.global.children.delete('__int64');
PdbIdentifier.global.children.delete('float');
PdbIdentifier.global.children.delete('double');
for (const [key, value] of PdbIdentifier.global.children) {
    if (key.startsWith('`')) { // remove private symbols
        PdbIdentifier.global.children.delete(key);
    } else if (key.startsWith('<lambda_')) { // remove lambdas
        PdbIdentifier.global.children.delete(key);
    } else if (/^[0-9]+$/.test(key)) { // remove numbers
        PdbIdentifier.global.children.delete(key);
    } else if (key.startsWith('{')) { // code chunk?
        PdbIdentifier.global.children.delete(key);
    } else if (key === '...') { // variadic args
        PdbIdentifier.global.children.delete(key);
    } else if (key.startsWith('__imp_')) { // import
        PdbIdentifier.global.children.delete(key);
    } else if (/^main\$dtor\$[0-9]+$/.test(key)) { // dtor in main
        PdbIdentifier.global.children.delete(key);
    } else if (value.isFunctionBase && value.templateBase !== null) { // skip symbols that have base. they will be writed through the base
        PdbIdentifier.global.children.delete(key);
    } else if (value.functionBase !== null) { // skip symbols that have base. they will be writed through the base
        PdbIdentifier.global.children.delete(key);
    } else if (value.isType && value.returnType !== null) { // function type
        PdbIdentifier.global.children.delete(key);
    } else if (value.templateBase !== null && /^[A-Z]/.test(value.name) && value.address === 0) { // expect
        value.setAsClass();
        value.templateBase.setAsClass();
    } else if (value.address !== 0) {
        const section = imageSections.getSectionOfRva(value.address);
        if (section === null) {
            console.error(`${value.name}: Unknown section`);
            continue;
        }

        switch (section.name) {
        case '.pdata': // exception info
            PdbIdentifier.global.children.delete(key);
            break;
        case '.data': // user section?
        case '.rdata': // readonly
            value.setAsFunction();
            break;
        default:
            console.error(`${section.name}, ${value.name}: unspecified section`);
            break;
        }
    }
}

const ids = [...PdbIdentifier.global.children.values()];
// new TsFileWithImpl('./commandbase', /^Command/, /CommandOrigin$/);
// new TsFileWithImpl('./commands', /Command$/);
// new TsFileWithImpl('./packets', /Packet$/);
// new TsFileWithImpl('./makepacket', /^make_packet/);
// new TsFileWithImpl('./packethandlers', /^PacketHandlerDispatcherInstance/);
// new TsFileWithImpl('./components', /Component$/);
// new TsFileWithImpl('./definations', /Definition$/, templateSpecialized('DefinitionSerializer'), templateSpecialized('DefinitionInstanceTyped'), templateSpecialized('EntityComponentDefinition'), templateSpecialized('definition'));
// new TsFileWithImpl('./receips', /Recipe$/);
// new TsFileWithImpl('./listeners', /Listener$/);
// new TsFileWithImpl('./filters', /Test$/, templateSpecialized('FilterOperationNode'), templateSpecialized('FilteredTransformationAttributes'));
// new TsFileWithImpl('./items', /Item$/, perTemplateArg('SharedPtr', 0, /Item$/), perTemplateArg('WeakPtr', 0, /Item$/));
// new TsFileWithImpl('./blocks', /Block[2-4]?$/, perTemplateArg('SharedPtr', 0, /Block[2-4]?$/, perTemplateArg('WeakPtr', 0, /Block[2-4]?$/)));
// new TsFileWithImpl('./actorbases', /Actor$/, /Player$/);
// new TsFileWithImpl('./actors', templateArgs('_actorFromClass', 0));
// new TsFileWithImpl('./actorfrom', /^_actorFromClass/);
// new TsFileWithImpl('./definations', templateSpecialized('DefinitionInstance'));
// new TsFileWithImpl('./scripts', /^Script/);
// new TsFileWithImpl('./actorgoals', templateArgs('ActorGoalDefinition', 0), templateArgs('ActorGoalDefinition', 1), templateSpecialized('ActorGoalDefinition'));
// new TsFileWithImpl('./descriptions', /Description$/);
// new TsFileWithImpl('./filtertest', /^FilterTest/);
// new TsFileWithImpl('./structures', /Pieces$/, /^Structure/);
// new TsFileWithImpl('./biomes', templateSpecialized('BiomeDecorationAttributes'), templateSpecialized('WeightedBiomeAttributes'), /^Biome/);
// new TsFileWithImpl('./molang', /^Molang/);
// new TsFileWithImpl('./features', /Feature$/, /Features$/);
// new TsFileWithImpl('./attributes', /^Attribute/);
// new TsFileWithImpl('./itemstates', templateSpecialized('ItemStateVariant'), templateArgs('ItemStateVariant', 0));
// new TsFileWithImpl('./server',
//     'ServerInstance',
//     'Minecraft',
//     'MinecraftEventing',
//     'VanilaGameModuleServer',
//     'MinecraftScheduler',
//     'MinecraftWorkerPool');
// new TsFileWithImpl('./typeid', /^type_id/, /^typeid_t/);
new TsFileDeclaration('./raknet', 'RakNet');
new TsFileDeclaration('./std', 'std',
    'strchr', 'strcmp', 'strcspn', 'strerror_s', 'strncmp', 'strncpy', 'strrchr',
    'strspn', 'strstart', 'strstr', 'strtol', 'strtoul', 'wcsstr', 'wchar_t',
    'tan', 'tanh', 'cos', 'cosf', 'cosh', 'sin', 'sinf', 'sinh', 'log', 'log10', 'log1p', 'log2', 'logf', 'fabs',
    'asin', 'asinf', 'asinh', 'atan2f',
    'fclose', 'feof', 'ferror', 'fgets', 'fflush',
    'free', 'malloc', '_aligned_malloc', 'delete', 'delete[]', 'delete[](void * __ptr64)', 'delete[](void * __ptr64,unsigned __int64)');
new TsFileDeclaration('./zlib', /^unz/, /^zip/, /^zc/, /^zlib_/, 'z_errmsg');
new TsFileDeclaration('./quickjs', /^js_/, /^JS_/, /^lre_/, /^string_/);
new TsFileDeclaration('./openssl',
    /^EVP_/, /^OPENSSL_/, /^OSSL_/, /^RSA_/, /^SEED_/,
    /^SHA1/, /^SHA224/, /^SHA256/, /^SHA384/, /^SHA3/, /^SHA512/,
    /^X509/, /^X509V3/, /^X448/, /^X25519/, /^XXH64/, /^curve448_/, /^openssl_/, /^rand_/,
    /^d2i_/, /^ec_/, /^i2a_/, /^hmac_/, /^i2c_/, /^i2d_/, /^i2o_/, /^i2s_/, /^i2t_/, /^i2v_/, /^o2i_/, /^v3_/, /^v2i_/,
    /^x448_/, /^x509_/, /^ecdh_/, /^dsa_/, /_meth$/, /^CMS_/, /^CRYPTO_/, /^AES_/, /^ASN1_/);
// new TsFileWithImpl('./classes', id=>id.isClassLike);
// new TsFileWithImpl('./remainings', ()=>true);
new TsFileDeclaration('./minecraft', ()=>true);
for (const file of TsFileDeclaration.all) {
    file.writeAll();
}
console.log(`global id count: ${PdbIdentifier.global.children.size}`);
