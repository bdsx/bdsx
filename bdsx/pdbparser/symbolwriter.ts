import { imageSections } from "./imagesections";
import { PdbIdentifier } from "./symbolparser";
import fs = require('fs');
import path = require('path');
import { styling } from "../externs/bds-scripting/styling";

const specialNameRemap = new Map<string, string>();
specialNameRemap.set("`vector deleting destructor'", '__vector_deleting_destructor');
specialNameRemap.set("`scalar deleting destructor'", '__scalar_deleting_destructor');
specialNameRemap.set('any', '_any');
specialNameRemap.set('string', '_string');
specialNameRemap.set('function', '_function');
specialNameRemap.set('add', '_add');
specialNameRemap.set('Symbol', '_Symbol');
specialNameRemap.set("`vftable'", '__vftable');
specialNameRemap.set("`vbtable'", '__vbtable');
specialNameRemap.set('operator=', 'operator_assign');
specialNameRemap.set('operator+', 'operator_add');
specialNameRemap.set('operator==', 'operator_equals');
specialNameRemap.set('operator>>', 'operator_shr');
specialNameRemap.set('operator<<', 'operator_shl');
specialNameRemap.set('operator()', 'operator_call');
specialNameRemap.set('getString', '_getString');

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
    minTemplateArgs?:number;
}

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

function getFirstIterableItem<T>(item:Iterable<T>):T|undefined {
    for (const v of item) {
        return v;
    }
    return undefined;
}

function checkIterableItemCount(iter:Iterable<any>, n:number):boolean {
    for (const item of iter) {
        n --;
        if (n === 0) return true;
    }
    return false;
}

function parameterFilter(param:Identifier):boolean {
    if (param.templateBase !== null) {
        if (param.templateBase.name === 'JsonParseState') return false;
    }

    return true;
}

enum IdType {
    Type,
    Value
}

class ImportName {
    constructor(
        public readonly name:string,
        public type:IdType) {
    }
}

class ImportTarget {
    public imports:Map<string, ImportName> = new Map;
    public varName:string|null = null;

    constructor(public readonly path:string) {
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

enum FieldType {
    Member,
    Static,
    InNamespace,
}

function getFieldType(item:Identifier):FieldType {
    if (item.isClassLike || item.isType || item.parent!.isNamespaceLike) return FieldType.InNamespace;
    if (item.isStatic) return FieldType.Static;
    return FieldType.Member;
}

function makeTemplateParameters(item:Identifier):string[] {
    const params:string[] = [];
    if (item.specialized.length === 0) {
        throw Error(`${item.name}: has not the specialized class`);
    }

    const first = item.specialized[0];
    let arglen = first.arguments.length;
    const slen = item.specialized.length;
    let variadic = false;
    for (let i=1;i<slen;i++) {
        const n = item.specialized[i].arguments.length;
        if (n !== arglen) {
            variadic = true;
            if (n < arglen) arglen = n;
        }
    }
    arglen += namespaceTemplatePass.length;

    for (let i=0;i<arglen;i++) {
        params.push('T'+i);
    }
    if (variadic) {
        params.push('ARGS');
        item.minTemplateArgs = arglen;
    }

    return params;
}

const namespaceTemplatePass:string[] = [];
let insideOfClass = false;
let isStatic = false;

class TsFile extends TsFileBase {
    private readonly imports = new Map<TsFileBase, ImportTarget>();
    public readonly source = new TsWriter;
    private readonly globalNames = new Map<string, number>();
    private currentNs:Identifier = PdbIdentifier.global;

    makeGlobalName(name:string):string {
        let counter = this.globalNames.get(name);
        if (counter == null) {
            this.globalNames.set(name, 1);
            return name;
        }
        for (;;) {
            const nname = name + (++counter);
            if (!this.globalNames.has(nname)) {
                this.globalNames.set(nname, counter);
                return nname;
            }
        }
    }

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
        let basename = this.getNameOnly(baseid, IdType.Value);
        if (basename.endsWith('_t')) basename = basename.substr(0, basename.length-2);
        basename = styling.toCamelStyle(basename, /[[\] :*]/g, false);
        return basename;
    }

    *enterNamespace(item:Identifier):IterableIterator<void> {
        const name = this.getNameOnly(item, IdType.Value);
        this.source.open(`export namespace ${name} {`);
        const oldns = this.currentNs;
        this.currentNs = item;
        yield;
        this.source.close(`}`);
        this.currentNs = oldns;
    }

    importDirect(hint:Identifier, module?:TsFile):string {
        if (module == null) {
            throw Error(`${hint}: host not found`);
        }
        if (module === this) throw Error(`${hint}: self direct import`);
        let target = this.imports.get(module);
        if (target == null) {
            this.imports.set(module, target = module.makeTarget());
        } else {
            if (target.varName !== null) {
                return target.varName;
            }
        }
        const name = path.basename(module.path);
        target.varName = this.makeGlobalName(name);
        return target.varName;
    }

    importName(host:TsFileBase|undefined, name:string, idType:IdType):string {
        if (host === this) return name;
        if (host !== undefined) {
            let target = this.imports.get(host);
            if (!target) this.imports.set(host, target = host.makeTarget());

            const imported = target.imports.get(name);
            let renamed:string;
            if (imported == null) {
                renamed = this.makeGlobalName(name);
                target.imports.set(name, new ImportName(renamed, idType));
            } else {
                renamed = imported.name;
                if (idType > imported.type) {
                    imported.type = idType;
                }
            }
            return renamed;
        } else {
            throw Error(`${name}: host not found`);
        }
    }

    importId(id:Identifier):void {
        if (id.parent !== PdbIdentifier.global) return;

    }

    isClassMethod(id:Identifier, isStatic?:boolean):boolean {
        return !id.isType && id.parent!.isClassLike && !(isStatic || id.isStatic);
    }

    getNameOnly(item:Identifier, idType:IdType, opts:{needDot?:boolean} = {}):string {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.isLambda) throw IGNORE_THIS;

        let name = item.removeParameters().name;
        if (item.parent.isClassLike) {
            if (item.parent.name === name) {
                let result = '';
                if (opts.needDot) result += '.';
                return result + '__constructor';
            } else {
                if (name.startsWith('~')) {
                    const NativeType = this.importName(imports.nativetype, 'NativeType', idType);
                    return `[${NativeType}.dtor]`;
                }
            }
        }

        const remapped = specialNameRemap.get(name);
        if (remapped !== undefined) {
            name = remapped;
        } else if (name.startsWith("`vector deleting destructor'")) {
            name = '__vector_deleting_destructor_'+item.arguments.join('_');
        } else if (name.startsWith("`vftable'")) {
            name = '__vftable_for_'+item.arguments.map(id=>id.name).join('_');
        }
        if (item.parent === PdbIdentifier.global && !item.isConstant) {
            if (!opts.needDot) {
                name = this.importName(item.host, name, idType);
            }
        }
        if (opts.needDot) name = '.' + name;
        return name;
    }

    getDeclaration(item:Identifier, type:string|null, define:'const'|'type'|'let'):string {
        if (item.templateBase !== null) {
            throw Error(`${item}: getNameDeclaration with template`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.isLambda) throw IGNORE_THIS;

        let result = '';
        if (insideOfClass) {
            if (isStatic) {
                result += 'static ';
            }
        } else {
            if (define == null) throw Error(`non class member but no define`);
            result += `export ${define} `;
        }

        result += this.getNameOnly(item, IdType.Value);
        if (type !== null) result += ':' + type;
        return result;
    }

    getName(item:Identifier, idType:IdType, opts:{assignee?:boolean} = {}):string {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.isLambda) throw IGNORE_THIS;

        let result = '';
        let needDot = false;
        if (item.parent === PdbIdentifier.global) {
            if (opts.assignee) {
                const name = this.importDirect(item, item.host);
                result += name;
                needDot = true;
            }
        } else {
            result = this.stringify(item.parent, idType);
            if (insideOfClass && !isStatic && !item.isType && idType !== IdType.Type && item.parent.isClassLike) {
                result += '.prototype';
            }
            needDot = true;
        }

        return result + this.getNameOnly(item, idType, {needDot});
    }

    makeVarParams(args:Identifier[], thisType?:Identifier|null):string {
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
            namearr[i] = `${namearr[i]}:${this.stringify(args[i], IdType.Type, {isParameter: true})}`;
        }
        if (thisType != null) {
            namearr.unshift('this:'+this.stringify(thisType, IdType.Type, {isParameter: true}));
        }
        return namearr.join(', ');
    }

    getArgNames(args:(Identifier|Identifier[])[], idType:IdType):string {
        return args.map(id=>{
            if (id instanceof Array) {
                return `[${id.map(id=>this.stringify(id, idType)).join(', ')}]`;
            }
            return this.stringify(id, idType);
        }).join(', ');
    }

    stringify(id:Identifier, idType:IdType, opts:{isField?:boolean, isParameter?:boolean, templatePass?:(Identifier|Identifier[])[]}={}):string {
        if (id.isLambda) throw IGNORE_THIS;
        if (id.redirectedFrom !== null) {
            return this.stringify(id.redirectedFrom, idType, opts);
        }
        if (id.decoedFrom !== null && id.deco === 'const') return this.stringify(id.decoedFrom, idType, opts);

        if (id.jsTypeName != null) {
            return this.importName(imports.nativetype, id.jsTypeName, idType);
        }
        if (id.decoedFrom !== null && (id.deco === '*' || id.deco === '&')) {
            if (idType === IdType.Value && id.isValue) {
                if (id.decoedFrom.address === 0) {
                    console.error(`${id.source}: address not found`);
                    throw IGNORE_THIS;
                }
                return this.getName(id, idType);
            }
            const str = this.stringify(id.decoedFrom, idType);
            const Wrapper = this.importName(imports.pointer, 'Wrapper', idType);
            if (idType === IdType.Type) {
                if (opts.isField || opts.isParameter) {
                    return str;
                } else {
                    return `${Wrapper}<${str}>`;
                }
            } else {
                if (opts.isParameter) {
                    return str;
                } else if (opts.isField) {
                    return `${str}.ref()`;
                } else {
                    return `${Wrapper}.make(${str}.ref())`;
                }
            }
        }

        let templateEnd = false;
        if (opts.templatePass == null) {
            opts.templatePass = [];
            templateEnd = true;
        }

        let out = '';
        if (id.templateBase !== null) {
            const from = opts.templatePass.length;
            for (const arg of id.arguments) {
                opts.templatePass.push(arg);
            }

            id = id.templateBase;
            if (id.minTemplateArgs != null) {
                const internal = opts.templatePass.splice(from+id.minTemplateArgs);
                for (const comp of internal) {
                    if (comp instanceof Array) throw Error(`${id}: array is not allowed`);
                }
                opts.templatePass.push(internal as Identifier[]);
            }
        } else {
            if (id.isMemberPointer) {
                const base = this.stringify(id.memberPointerBase!, idType);
                const type = this.stringify(id.returnType!, idType);
                const MemberPointer = this.importName(imports.complextype, 'MemberPointer', idType);
                if (idType === IdType.Type) {
                    return `${MemberPointer}<${base}, ${type}>`;
                } else {
                    return `${MemberPointer}.make(${base}, ${type})`;
                }
            }
            if (id.isFunctionType) {
                if (idType === IdType.Type) {
                    const params = this.makeVarParams(id.arguments);
                    return `(${params})=>${this.stringify(id.returnType!, idType)}`;
                } else {
                    const NativeFunctionType = this.importName(imports.complextype, 'NativeFunctionType', idType);
                    return `${NativeFunctionType}.make(${this.stringify(id.returnType!, idType)}, null, ${id.arguments.map(id=>this.stringify(id, idType))})`;
                }
            }
        }
        let needDot = false;
        if (id.parent !== PdbIdentifier.global && id.parent !== this.currentNs) {
            out += this.stringify(id.parent!, idType, {templatePass: opts.templatePass});
            needDot = true;
        }
        out += this.getNameOnly(id, idType, {needDot});

        if (!templateEnd || opts.templatePass.length === 0) {
            return out;
        }

        if (idType === IdType.Type) {
            return `${out}<${this.getArgNames(opts.templatePass, IdType.Type)}>`;
        } else {
            return `${out}.make<typeof ${out}, ${out}<${this.getArgNames(opts.templatePass, IdType.Type)}>>(${this.getArgNames(opts.templatePass, IdType.Value)})`;
        }
    }

    getConstructorType(item:Identifier):string {
        if (item.isClassLike) {
            const NativeClassType = this.importName(imports.nativeclass, 'NativeClassType', IdType.Type);
            return `${NativeClassType}<${this.stringify(item, IdType.Type)}>`;
        } else {
            throw Error(`${item}: Not implemented constructor type`);
        }
    }

    isSkipable(item:Identifier):boolean {
        if (item.isFunction) return true;
        if (item.decoedFrom !== null) return true;
        if (item.isLambda) return true;
        if (item.isFunctionBase && item.templateBase !== null) return true;
        return false;
    }

    writeAll():void {
        function remapNameStyle(pair:[string, string]):string {
            return pair[0] === pair[1] ? pair[0] : `${pair[0]} as ${pair[1]}`;
        }
        let importtext = '\n';
        for (const target of this.imports.values()) {
            if (target.varName !== null) {
                importtext += `import ${target.varName} = require("${target.path}");\n`;
            }
            const types:[string, string][] = [];
            const values:[string, string][] = [];
            for (const [name, imported] of target.imports) {
                switch (imported.type) {
                case IdType.Type: types.push([name, imported.name]); break;
                case IdType.Value: values.push([name, imported.name]); break;
                }
            }
            if (types.length !== 0) importtext += `import type { ${types.map(remapNameStyle).join(', ')} } from "${target.path}";\n`;
            if (values.length !== 0) importtext += `import { ${values.map(remapNameStyle).join(', ')} } from "${target.path}";\n`;
        }
        importtext += '\n';

        fs.writeFileSync(path.join(outpath, this.path+'.ts'), importtext+this.source.text);
        this.source.text = '';
    }
}

class TsFileImplement extends TsFile {

    private _makeFunction(item:Identifier):string {
        const dll = this.importName(imports.dll, 'dll', IdType.Value);
        if (item.returnType === null) {
            throw Error(`${item}: function but no return type`);
        }
        const makefunc = this.importName(imports.makefunc, 'makefunc', IdType.Value);
        const params = item.arguments.map(id=>this.stringify(id, IdType.Value, {isParameter: true}));
        if (this.isClassMethod(item, false)) {
            params.unshift(`{this:${this.stringify(item.parent!, IdType.Value, {isParameter: true})}}`);
        } else {
            if (params.length !== 0) {
                params.unshift('null');
            }
        }
        params.unshift(this.stringify(item.returnType, IdType.Value, {isParameter: true}));
        params.unshift(`${dll}.current.add(${item.address})`);
        return `${makefunc}.js(${params.join(', ')})`;
    }

    private _writeImplements(target:Identifier, item:Identifier):void {
        if (item.address === 0) {
            console.error(`${item}: does not have the address`);
            throw IGNORE_THIS;
        }
        if (item.returnType === null) {
            const targetName = this.getName(target, IdType.Value, {assignee: true});
            if (!item.isVFTable && item.arguments.length !== 0) console.error(`${item}: function but no return type`);
            const dll = this.importName(imports.dll, 'dll', IdType.Value);
            this.source.writeln(`${targetName} = ${dll}.current.add(${item.address});`);

        } else if (item.isFunction) {
            const targetName = this.getName(target, IdType.Value, {assignee: true});
            this.source.writeln(`${targetName} = ${this._makeFunction(item)};`);
        } else {
            if (target.parent === null) {
                throw Error(`${target}: has not parent`);
            }

            let parent = '';
            if (target.parent === PdbIdentifier.global) {
                parent = this.importDirect(target, target.host);
            } else {
                parent = this.stringify(target.parent, IdType.Value);
            }

            const dll = this.importName(imports.dll, 'dll', IdType.Value);
            const NativeType = this.importName(imports.nativetype, 'NativeType', IdType.Value);
            const type = this.stringify(item.returnType, IdType.Value, {isField: true});
            const key = this.getNameOnly(target, IdType.Value);
            this.source.writeln(`${NativeType}.definePointedProperty(${parent}, '${key}', ${dll}.current.add(${item.address}), ${type});`);
        }
    }

    writeAssign(field:IdField):void {
        try {
            const target = field.base.removeTemplateParameters();
            this.source.writeln(`// ${field.base.source}`);
            const overloads = field.overloads;
            if (overloads == null || overloads.length === 0) {
                this._writeImplements(target, field.base);
            } else if (overloads.length === 1) {
                this._writeImplements(target, overloads[0]);
            } else {
                const OverloadedFunction = this.importName(imports.complextype, 'OverloadedFunction', IdType.Value);
                let out = `${OverloadedFunction}.make()\n`;
                for (const overload of overloads) {
                    try {
                        const params = overload.arguments.map(id=>this.stringify(id, IdType.Value, {isParameter: true}));
                        params.unshift('null');
                        params.unshift(this._makeFunction(overload));
                        out += `// ${overload.source}\n`;
                        out += `.overload(${params.join(', ')})\n`;
                    } catch (err) {
                        if (err !== IGNORE_THIS) throw err;
                    }
                }
                out = out.substr(0, out.length-1);
                const targetName = this.getName(target, IdType.Value, {assignee: true});
                this.source.writeln(`${targetName} = ${out};`);
            }
        } catch (err) {
            if (err === IGNORE_THIS) return;
            throw err;
        }
    }
}

class IdField {
    public readonly overloads:Identifier[] = [];
    constructor(public readonly base:Identifier) {
    }
}

class IdFieldMap implements Iterable<IdField> {

    private readonly map = new Map<string, IdField>();

    append(list:Iterable<IdField>):this {
        for (const item of list) {
            this.get(item.base).overloads.push(...item.overloads);
        }
        return this;
    }

    get(base:Identifier):IdField {
        let nametarget = base;
        if (base.functionBase !== null) {
            nametarget = base.functionBase;
        }
        if (base.templateBase !== null) {
            nametarget = base.templateBase;
        }
        const name = nametarget.name;
        let field = this.map.get(name);
        if (field != null) return field;
        field = new IdField(base);
        this.map.set(name, field);
        return field;
    }

    clear():void {
        this.map.clear();
    }

    get size():number {
        return this.map.size;
    }

    values():IterableIterator<IdField> {
        return this.map.values();
    }

    [Symbol.iterator]():IterableIterator<IdField> {
        return this.map.values();
    }
}

class FieldInfo {
    public readonly inNamespace = new IdFieldMap;
    public readonly staticMember = new IdFieldMap;
    public readonly member = new IdFieldMap;

    push(base:Identifier, item:Identifier):void {
        this.set(base).overloads.push(item);
    }

    set(item:Identifier):IdField {
        if (item.templateBase !== null) {
            throw Error('base is template');
        }
        switch (getFieldType(item)) {
        case FieldType.Member: return this.member.get(item);
        case FieldType.Static: return this.staticMember.get(item);
        case FieldType.InNamespace: return this.inNamespace.get(item);
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

    hasOverloads(item:Identifier):boolean {
        return item.isTemplateFunctionBase || (item.isFunctionBase && item.templateBase === null);
    }

    private _writeGlobalRedirect(item:Identifier):void {
        try {
            const ori = item.redirectTo;
            if (ori === null) {
                console.error(`${item}: is not redirecting`);
                return;
            }
            const from = ori.redirectedFrom;
            ori.redirectedFrom = null;
            this.source.writeln(`${this.getDeclaration(item, null, 'type')} = ${this.stringify(ori, IdType.Type)};`);
            this.source.writeln(`${this.getDeclaration(item, this.getConstructorType(ori), 'let')};`);
            this.implements.source.writeln(`${this.implements.getName(item, IdType.Value, {assignee:true})} = ${this.implements.stringify(ori, IdType.Value)};`);
            ori.redirectedFrom = from;
        } catch (err) {
            if (err === IGNORE_THIS) return;
            throw err;
        }
    }

    private _writeOverloads(field:IdField):void {
        try {
            const overloads = field.overloads;
            if (overloads.length === 0) {
                throw Error(`empty overloads`);
            }
            if (!insideOfClass && isStatic) {
                throw Error(`${overloads[0]}: is static but not in the class`);
            }
            let prefix = '';
            if (!insideOfClass) prefix = 'export function ';
            const name = this.getNameOnly(field.base, IdType.Value);

            if (overloads.length === 1) {
                const item = overloads[0];
                if (item.returnType === null) {
                    if (item.arguments.length !== 0) console.error(`${item}: no has the return type but has the arguments types`);
                    const StaticPointer = this.importName(imports.core, 'StaticPointer', IdType.Type);
                    this.source.writeln(`// ${item.source}`);
                    this.source.writeln(`${prefix}${item.removeParameters().name}:${StaticPointer};`);
                } else {
                    const abstract = this.importName(imports.common, 'abstract', IdType.Value);
                    const params = this.makeVarParams(item.arguments, item.parent!.templateBase !== null ? item.parent! : null);
                    this.source.writeln(`// ${item.source}`);
                    this.source.writeln(`${prefix}${name}(${params}):${this.stringify(item.returnType, IdType.Type, {isParameter: true})} { ${abstract}(); }`);
                }
            } else {
                for (const over of overloads) {
                    this.source.writeln(`// ${over.source}`);
                    const params = this.makeVarParams(over.arguments, over.parent!.templateBase !== null ? over.parent! : null);
                    this.source.writeln(`${prefix}${name}(${params}):${this.stringify(over.returnType!, IdType.Type, {isParameter: true})};`);
                }
                this.source.writeln(`${prefix}${name}(...args:any[]):any { abstract(); }`);
            }
        } catch (err) {
            if (err === IGNORE_THIS) return;
            throw err;
        }
    }

    private _writeField(item:Identifier):void {
        try {
            this.source.writeln(`// ${item.source}`);
            if (item.returnType !== null) {
                const type = this.stringify(item.returnType, IdType.Type, {isField: true});
                this.source.writeln(`${this.getDeclaration(item, `${type}`, 'let')};`);
            } else {
                const StaticPointer = this.importName(imports.core, 'StaticPointer', IdType.Type);
                this.source.writeln(`${this.getDeclaration(item, StaticPointer, 'let')};`);
            }
            this.implements.writeAssign(new IdField(item));
        } catch (err) {
            if (err === IGNORE_THIS) return;
            throw err;
        }
    }

    private _getField(out:FieldInfo, base:Identifier):void {
        if (base.isDecoedType || base.isFunctionType || base.templateBase !== null || base.functionBase !== null) {
            return;
        }
        if (this.hasOverloads(base)) {
            for (const o of base.allOverloads()) {
                if (base.isTemplateFunctionBase) {
                    if (o.arguments.some(arg=>arg.getArraySize() !== null)) continue;
                }
                if (o.arguments.some(arg=>parameterFilter(arg))) {
                    continue;
                }
                if (parameterFilter(o.parent!)) {
                    continue;
                }
                if (o.returnType !== null && parameterFilter(o.returnType)) {
                    continue;
                }
                out.push(base, o);
            }
        } else {
            out.set(base);
        }
    }

    getAllFields(item:Identifier):FieldInfo {
        const out = new FieldInfo;

        if (item.specialized.length !== 0) {
            for (const specialized of item.specialized) {
                for (const child of specialized.children.values()) {
                    this._getField(out, child);
                }
            }
        }
        for (const child of item.children.values()) {
            this._getField(out, child);
        }
        return out;
    }

    private _writeClass(item:Identifier):void {
        try {
            let opened = false;

            let params:string[]|null = null;
            if (item.isTemplate || namespaceTemplatePass.length !== 0) {
                params = item.isTemplate ? makeTemplateParameters(item) : namespaceTemplatePass;

                const NativeTemplateClass = this.importName(imports.complextype, 'NativeTemplateClass', IdType.Value);
                this.source.writeln(`// ${item.source}`);
                const paramsText = (params.length !== 0) ? `<${params.join(', ')}>`: '';
                this.source.open(`export class ${this.getNameOnly(item, IdType.Value)}${paramsText} extends ${NativeTemplateClass} {`, true);
                opened = true;
            } else {
                if (item.isClassLike) {
                    const NativeClass = this.importName(imports.nativeclass, 'NativeClass', IdType.Value);
                    this.source.writeln(`// ${item.source}`);
                    this.source.open(`export class ${this.getNameOnly(item, IdType.Value)} extends ${NativeClass} {`, true);
                    opened = true;
                }
            }

            const fields = this.getAllFields(item);
            if (opened) {
                insideOfClass = true;
                for (const field of fields.staticMember) {
                    isStatic = true;
                    this.writeMembers(field);
                    isStatic = false;
                }
                for (const field of fields.member) {
                    this.writeMembers(field);
                }
                this.source.close(`}`);
                insideOfClass = false;
            }
            const templatePassCount = namespaceTemplatePass.length;
            if (params !== null) {
                namespaceTemplatePass.push(...params.slice(templatePassCount));
            }
            for (const _ of this.enterNamespace(item)) {
                for (const field of fields.inNamespace) {
                    try {
                        this.writeMembers(field);
                    } catch (err) {
                        if (err !== IGNORE_THIS) throw err;
                    }
                }
            }
            namespaceTemplatePass.length = templatePassCount;
        } catch (err) {
            if (err === IGNORE_THIS) return;
            throw err;
        }
    }

    writeMembers(field:IdField):void {
        const overloads = field.overloads;
        if (overloads.length !== 0) {
            // set default constructor
            if (insideOfClass) {
                for (const overload of overloads) {
                    if (overload.arguments.length === 0 && overload.functionBase!.name === overload.parent!.name) {
                        const NativeType = this.importName(imports.nativetype, 'NativeType', IdType.Value);
                        this.source.writeln(`[${NativeType}.ctor]():void{ return this.__constructor(); }`);
                        break;
                    }
                }
            }

            // write overloads
            try {
                this._writeOverloads(field);
                this.implements.writeAssign(field);
            } catch (err) {
                if (err !== IGNORE_THIS) throw err;
            }
        } else {
            const base = field.base;
            if (base.isFunction) {
                this._writeField(base);
            } else if (base.isClassLike) {
                if (!insideOfClass) {
                    this._writeClass(base);
                }
            } else if (this.isSkipable(base)) {
                // empty
            } else if (base.name.startsWith("`vftable'") || base.name === "`vbtable'") {
                base.isStatic = true;
                this._writeField(base);
            } else if (base.isStatic) {
                this._writeField(base);
            } else if (base.isRedirectType) {
                this._writeGlobalRedirect(base);
            } else if (base.templateBase === null) {
                if (!insideOfClass) {
                    this._writeClass(base);
                }
            }
            // throw Error(`${base.source || base}: unexpected identifier`);
        }
    }

    writeAll():void {
        const out = new FieldInfo;
        for (const item of this.ids) {
            this._getField(out, item);
        }
        if (out.staticMember.size !== 0) {
            const first = getFirstIterableItem(out.staticMember)!;
            throw Error(`global static member: ${first.base}`);
        }
        for (const field of out.inNamespace) {
            this.writeMembers(field);
        }
        for (const field of out.member) {
            this.writeMembers(field);
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
const schar_t:Identifier = PdbIdentifier.global.get('char signed');
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
schar_t.jsTypeName = 'int8_t';
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
