import { imageSections } from "./imagesections";
import { PdbIdentifier } from "./symbolparser";
import fs = require('fs');
import path = require('path');
import { styling } from "../externs/bds-scripting/styling";

const specialNameRemap = new Map<string, string>();
specialNameRemap.set("`vector deleting destructor'", '__vector_deleting_destructor');
specialNameRemap.set("`scalar deleting destructor'", '__scalar_deleting_destructor');
specialNameRemap.set("`vbase destructor'", '__vbase_destructor');
specialNameRemap.set('any', '_any');
specialNameRemap.set('string', '_string');
specialNameRemap.set('function', '_function');
specialNameRemap.set('add', '_add');
specialNameRemap.set('null', '_null');
specialNameRemap.set('finally', '_finally');
specialNameRemap.set('yield', '_yield');
specialNameRemap.set('Symbol', '_Symbol');
specialNameRemap.set("`vftable'", '__vftable');
specialNameRemap.set("`vbtable'", '__vbtable');
specialNameRemap.set('operator new', 'operator_new');
specialNameRemap.set('operator new[]', 'operator_new_array');
specialNameRemap.set('operator delete', 'operator_delete');
specialNameRemap.set('operator delete[]', 'operator_delete_array');
specialNameRemap.set('operator=', 'operator_mov');
specialNameRemap.set('operator+', 'operator_add');
specialNameRemap.set('operator-', 'operator_sub');
specialNameRemap.set('operator*', 'operator_mul');
specialNameRemap.set('operator/', 'operator_div');
specialNameRemap.set('operator%', 'operator_mod');
specialNameRemap.set('operator+=', 'operator_add_mov');
specialNameRemap.set('operator-=', 'operator_sub_mov');
specialNameRemap.set('operator*=', 'operator_mul_mov');
specialNameRemap.set('operator/=', 'operator_div_mov');
specialNameRemap.set('operator%=', 'operator_mod_mov');
specialNameRemap.set('operator==', 'operator_e');
specialNameRemap.set('operator!=', 'operator_ne');
specialNameRemap.set('operator>', 'operator_gt');
specialNameRemap.set('operator<', 'operator_lt');
specialNameRemap.set('operator>=', 'operator_gte');
specialNameRemap.set('operator<=', 'operator_lte');
specialNameRemap.set('operator>>', 'operator_shr');
specialNameRemap.set('operator<<', 'operator_shl');
specialNameRemap.set('operator()', 'operator_call');
specialNameRemap.set('operator[]', 'operator_index');
specialNameRemap.set('operator++', 'operator_inc');
specialNameRemap.set('operator--', 'operator_dec');
specialNameRemap.set('getString', '_getString');

class IgnoreThis {
    constructor(public message:string) {
    }
}

const outpath = path.join(__dirname, 'globals');
try {
    fs.mkdirSync(outpath);
} catch (err) {
}

class TemplateInfo {
    constructor(
        public readonly parent:TemplateInfo|null,
        public readonly paramTypes:Identifier[],
        public readonly parameters:(Identifier|Identifier[])[],
        public readonly totalCount:number,
        public readonly totalVariadicCount:number,
        public readonly count:number,
        public readonly variadicType:Identifier|null,
    ) {
    }

    private readonly names = new Map<TsFile, string[]>();

    makeNames(file:TsFile):string[] {
        let names = this.names.get(file);
        if (names != null) return names;
        if (this.parent === null) {
            this.names.set(file, names = []);
            return names;
        }
        names = this.parent.makeNames(file).slice();
        this.names.set(file, names);

        for (let i=0;i<this.count;i++) {
            const name = file.stringify(this.paramTypes[i].unwrapType(), IdType.Type);
            names.push(`T${this.parent.totalCount+i} extends ${name}`);
        }
        if (this.variadicType !== null) {
            names.push(`ARGS extends any[]`);
        }
        return names;
    }
}

interface Identifier extends PdbIdentifier {
    host?:TsFileBase|null;
    jsTypeName?:string;
    paramVarName?:string;
    isOverloaded?:boolean;
    templateInfo?:TemplateInfo;
    unuse?:boolean;
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

function getFirstIterableItem<T>(item:Iterable<T>):T|undefined {
    for (const v of item) {
        return v;
    }
    return undefined;
}

const TEMPLATE_INFO_EMPTY = new TemplateInfo(null, [], [], 0, 0, 0, null);

function usingFilter(item:Identifier):boolean {
    if (item.unuse != null) return item.unuse;
    item = item.decay();
    if (item.isLambda) return item.unuse = false;
    if (item.parent === null) return item.unuse = true;
    if (!usingFilter(item.parent)) return item.unuse = false;
    if ((item.isFunctionBase || item.isTemplateFunctionBase || item.isFunction || item.isClassLike) && item.parent === PdbIdentifier.std && item.name.startsWith('_')) return item.unuse = false;
    if (item.name === "`anonymous namespace'") return item.unuse = false;
    if (item.templateBase !== null) {
        if (item.templateBase.parent!.name === 'JsonUtil') {
            switch (item.templateBase.name) {
            case 'JsonSchemaNode':
            case 'JsonParseState':
            case 'JsonSchemaEnumNode':
            case 'JsonSchemaNodeChildSchemaOptions':
            case 'JsonSchemaNode_CanHaveChildren':
            case 'JsonSchemaChildOption':
            case 'JsonSchemaObjectNode':
            case 'JsonSchemaArrayNode':
            case 'JsonSchemaTypedNode':
            case 'JsonSchemaChildOptionBase':
                return item.unuse = false;
            }
        }
        for (const param of item.templateParameters) {
            if (!usingFilter(param)) return item.unuse = false;
        }
    }
    for (const param of item.functionParameters) {
        if (!usingFilter(param)) return item.unuse = false;
    }
    if (item.unionedTypes !== null) {
        for (const t of item.unionedTypes) {
            if (!usingFilter(t)) return item.unuse = false;
        }
    }
    if (item.returnType !== null) {
        if (!usingFilter(item.returnType)) return item.unuse = false;
    }

    return item.unuse = true;
}

function remapRecursive(item:Identifier, parameters:Identifier[]):Identifier[] {
    const idx = parameters.indexOf(item);
    return parameters;
    if (idx === -1) return parameters;
    return parameters.map(param=>{
        if (param !== item) return param;
        const base = item.templateBase;
        if (base === null) throw Error(`no base (${base})`);
        return base.makeSpecialized(item.templateParameters.map(()=>any_t));
    });
}

function setBasicType(name:string|PdbIdentifier, jsTypeName:string, paramVarName:string, host:TsFileBase|null):Identifier {
    const item:Identifier = name instanceof PdbIdentifier ? name : PdbIdentifier.parse(name);
    item.isBasicType = true;
    item.host = host;
    item.jsTypeName = jsTypeName;
    item.paramVarName = paramVarName;
    return item;
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

class ImportInfo {
    private readonly imports = new Map<TsFileBase, ImportTarget>();
    private readonly globalNames = new Map<string, number>();

    constructor(public readonly base:TsFileBase|null) {
    }

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

    importDirect(hint:Identifier, module?:TsFileBase|null):string {
        if (module === undefined) {
            throw Error(`host not found (${hint})`);
        }
        if (module === this.base) {
            throw Error(`self import (${hint})`);
        }
        if (module === null) {
            throw Error(`is const identifier (${hint})`);
        }
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

    importName(host:TsFileBase|undefined|null, name:string, idType:IdType):string {
        if (host === this.base) return name;
        if (host === undefined) {
            console.log('_____'+(PdbIdentifier.global.children.get('int') as Identifier).host);
            throw Error(`host not found (${name})`);
        }
        if (host === null) {
            return name;
        }
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
    }

    makeImportString():string {
        const MAX_LEN = 200;
        let importtext = '\n';
        function writeImportString(prefix:string, imports:[string, string][], postfix:string):void {
            importtext += prefix;
            let linelen = prefix.length;
            let first = true;
            for (const [from, to] of imports) {
                let name:string;
                if (from === to) {
                    name = from;
                } else {
                    name = `${from} as ${to}`;
                }
                linelen += name.length;
                if (linelen >= MAX_LEN) {
                    importtext += '\n    ';
                    linelen = name.length + 4;
                }

                if (!first) {
                    importtext += ', ';
                    linelen += 2;
                } else {
                    first = false;
                }
                importtext += name;
            }
            importtext += postfix;
        }
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
            if (types.length !== 0) writeImportString('import type { ', types, ` } from "${target.path}";\n`);
            if (values.length !== 0) writeImportString('import { ', values, ` } from "${target.path}";\n`);
        }
        importtext += '\n';
        return importtext;
    }
}

class TsFileBase {
    public readonly imports = new ImportInfo(this);
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
    if (item.parent === null) {
        throw Error(`${item.name}: parent is null`);
    }
    if (item.isStatic) {
        return FieldType.Static;
    }
    if (item.isFunctionBase || item.isTemplateFunctionBase || item.isFunction) {
        return FieldType.Member;
    }
    return FieldType.InNamespace;
}

let insideOfClass = false;
let isStatic = false;


const adjustorRegExp = /^(.+)`adjustor{([0-9]+)}'$/;
const idremap:Record<string, string> = {'{':'','}':'',',':'_','<':'_','>':'_'};
const recursiveCheck = new Set<Identifier>();

class TsFile extends TsFileBase {
    public readonly source = new TsWriter;
    private currentNs:Identifier = PdbIdentifier.global;
    public isEmpty = false;

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
            } else if (baseid.isFunctionType) {
                return 'cb';
            } else {
                break;
            }
        }
        if (baseid.memberPointerBase !== null) {
            const postfix = baseid.isFunction ? '_fn' : '_m';
            return this._getVarName(baseid.memberPointerBase)+postfix;
        }
        if (baseid.isTypeUnion) return 'arg';
        let basename = this.getNameOnly(baseid, IdType.Value, {noImport: true});
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

    isClassMethod(id:Identifier, isStatic?:boolean):boolean {
        return !id.isType && id.parent!.isClassLike && !(isStatic || id.isStatic);
    }

    getIdName(item:Identifier):string {
        if (item.redirectedFrom !== null) {
            return this.getIdName(item.redirectedFrom);
        }
        if (item.templateBase !== null) {
            return this.getIdName(item.templateBase)+'_'+item.templateParameters.map(id=>this.getIdName(id)).join('_');
        }
        if (item.decoedFrom !== null) {
            return this.getIdName(item.decoedFrom);
        }
        if (item.memberPointerBase !== null) {
            const postfix = item.isFunction ? '_fn' : '_m';
            return this.getIdName(item.memberPointerBase)+postfix;
        }
        let name = this.getNameOnly(item, IdType.Value, {noImport: true}).replace(/[{},<>]/g, v=>idremap[v]);
        if (name.startsWith('-')) {
            name = 'minus_'+name.substr(1);
        }
        return name;
    }

    getTemplateInfo(item:Identifier):TemplateInfo {
        if (item.templateInfo != null) {
            return item.templateInfo;
        }
        if (item.parent === null) {
            item.templateInfo = TEMPLATE_INFO_EMPTY;
            return item.templateInfo;
        }

        const parentInfo = this.getTemplateInfo(item.parent);
        let parameters:(Identifier|Identifier[])[] = parentInfo.parameters;

        if (item.specialized.length !== 0) {
            const first = item.specialized[0];
            let count = first.templateParameters.length;
            const slen = item.specialized.length;
            for (let i=1;i<slen;i++) {
                const n = item.specialized[i].templateParameters.length;
                if (n !== count) {
                    if (n < count) count = n;
                }
            }

            let types:Identifier[]|null = null;
            let variadicType:Identifier|null = null;
            for (const s of item.specialized) {
                if (!usingFilter(s)) continue;

                let j=0;
                const srctypes = s.templateParameters;
                if (types === null) {
                    types = [];
                    for (;j<count;j++) {
                        types.push(srctypes[j].getTypeOfIt());
                    }
                } else {
                    for (;j<count;j++) {
                        types[j] = types[j].union(srctypes[j].getTypeOfIt());
                    }
                }
                for (;j<srctypes.length;j++) {
                    const t = srctypes[j];
                    if (variadicType === null) {
                        variadicType = t.getTypeOfIt();
                    } else {
                        variadicType = variadicType.union(t.getTypeOfIt());
                    }
                }
            }
            if (types === null) {
                item.templateInfo = new TemplateInfo(
                    parentInfo,
                    remapRecursive(item, parentInfo.paramTypes),
                    parameters,
                    parentInfo.totalCount,
                    parentInfo.totalVariadicCount,
                    0,
                    null
                );
            } else {
                if (variadicType !== null) {
                    // types.push(variadicType); // TODO: array-lize
                    types.push(anys_t);
                }

                const variadicCount = (variadicType !== null ? 1 : 0);
                item.templateInfo = new TemplateInfo(
                    parentInfo,
                    remapRecursive(item, parentInfo.paramTypes.concat(types)),
                    parameters,
                    count + parentInfo.totalCount,
                    parentInfo.totalVariadicCount+ +variadicCount,
                    count,
                    variadicType
                );
            }
        } else if (item.templateBase !== null) {
            const base = this.getTemplateInfo(item.templateBase);
            if (item.templateParameters.length !== 0) {
                if (base.variadicType !== null) {
                    const args = item.templateParameters.slice(base.count);
                    for (const arg of args) {
                        if (arg instanceof Array) {
                            throw Error(`Unexpected array`);
                        }
                    }
                    parameters = parameters.concat(item.templateParameters.slice(0, base.count), [args]);
                } else {
                    parameters = parameters.concat(item.templateParameters);
                }
            }
            item.templateInfo = new TemplateInfo(
                parentInfo,
                remapRecursive(item, base.paramTypes),
                parameters,
                base.totalCount,
                base.totalVariadicCount,
                base.count,
                base.variadicType
            );
        } else {
            if (parentInfo.parameters.length === 0) {
                item.templateInfo = TEMPLATE_INFO_EMPTY;
            } else {
                item.templateInfo = new TemplateInfo(
                    parentInfo,
                    remapRecursive(item, parentInfo.paramTypes),
                    parameters,
                    parentInfo.totalCount,
                    parentInfo.totalVariadicCount,
                    0,
                    null
                );
            }
        }

        return item.templateInfo;
    }

    getNameOnly(item:Identifier, idType:IdType, opts:{needDot?:boolean, noImport?:boolean} = {}):string {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.isTypeUnion) {
            throw Error(`${item}: getName with type union`);
        }
        if (item.decoedFrom !== null) {
            throw Error(`getName with deco type(${item})`);
        }
        if (item.isFunctionType) {
            throw Error(`${item.name}: getName with function type`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.isLambda) {
            throw new IgnoreThis(`lambda (${item})`);
        }

        let name = item.removeParameters().name;
        if (item.isConstructor) {
            let result = '';
            if (opts.needDot) result += '.';
            return result + '__constructor';
        } else {
            if (item.isDestructor) {
                const NativeType = this.imports.importName(imports.nativetype, 'NativeType', idType);
                return `[${NativeType}.dtor]`;
            }
        }

        const remapped = specialNameRemap.get(name);
        let matched:RegExpMatchArray|null;
        if (remapped != null) {
            name = remapped;
        } else if (name.startsWith("`vector deleting destructor'")) {
            name = '__vector_deleting_destructor_'+item.adjustors.join('_');
        } else if (name.startsWith("`vftable'")) {
            name = '__vftable_for_'+item.adjustors.map(id=>this.getIdName(id)).join('_');
        } else if (name.startsWith("`vbtable'")) {
            name = '__vbtable_for_'+item.adjustors.map(id=>this.getIdName(id)).join('_');
        } else if (name.startsWith("`vcall'")) {
            name = '__vcall_'+item.adjustors.map(id=>this.getIdName(id)).join('_');
        } else if ((matched = name.match(adjustorRegExp)) !== null) {
            name = matched[1]+'_adjustor_'+matched[2];
        } else if (name.startsWith('operator ')) {
            if (item.returnType === null) {
                throw Error(`failed to get return type(${item})`);
            } else {
                name = 'operator_castto_'+this.getIdName(item.returnType);
            }
        } else if (name === '...') {
            if (opts.needDot) throw Error(`Variadic not need dot`);
        }
        if (item.parent === PdbIdentifier.global && !item.isConstant) {
            if (!opts.needDot && !opts.noImport) {
                name = this.imports.importName(item.host, name, idType);
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
        if (item.isLambda) {
            throw new IgnoreThis(`lambda (${item})`);
        }

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
        if (item.isLambda) {
            throw new IgnoreThis(`lambda (${item})`);
        }

        let result = '';
        let needDot = false;
        if (item.parent === PdbIdentifier.global) {
            if (opts.assignee) {
                const name = this.imports.importDirect(item, item.host);
                result += name;
                needDot = true;
            }
        } else {
            result = this.stringify(item.parent, idType);
            if (insideOfClass && !isStatic && !item.isType && idType !== IdType.Type && item.parent.isClassLike && (item.isFunction || item.isFunctionBase || item.isTemplateFunctionBase)) {
                result += '.prototype';
            }
            needDot = true;
        }

        return result + this.getNameOnly(item, idType, {needDot});
    }

    makeFuncDeclaration(args:Identifier[], thisType?:Identifier|null):{declaration:string[], parameterNames:string[]} {
        const names = new Map<string, {index:number, counter:number}>();
        const declaration:string[] = [];
        const parameters:string[] = [];
        for (let i=0;i<args.length;i++) {
            const basename = this._getVarName(args[i]);
            let name = basename;
            const info = names.get(name);
            if (info == null) {
                names.set(name, {index:i, counter:1});
            } else {
                if (info.counter === 1) {
                    declaration[info.index] = basename + '_' + info.counter;
                }
                info.counter++;
                name = basename + '_' + info.counter;
            }
            declaration[i] = name;
        }
        for (let i=0;i<declaration.length;i++) {
            const name = declaration[i];
            declaration[i] = `${name}:${this.stringify(args[i], IdType.Type, {isParameter: true})}`;
            parameters[i] = name;
        }
        if (thisType != null) {
            let type = 'this:';
            if (isStatic) type += 'NativeClassType<';
            type += this.stringify(thisType, IdType.Type, {isParameter: true});
            if (isStatic) type += '>';
            declaration.unshift(type);
        }
        return {
            declaration,
            parameterNames: parameters
        };
    }

    makeFuncParams_params(item:Identifier[]):string[]{
        return item.map(id=>this.stringify(id, IdType.Value, {isParameter: true}));
    }

    makefuncParams_this(item:Identifier):string|null {
        if (this.isClassMethod(item, false)) {
            return this.stringify(item.parent!, IdType.Value, {isParameter: true});
        } else {
            return null;
        }
    }

    makefuncParams_return(item:Identifier):string {
        if (item.returnType === null) {
            throw Error(`${item}: function but no return type`);
        }
        return this.stringify(item.returnType, IdType.Value, {isParameter: true});
    }

    makeFuncParams(item:Identifier):string {
        const returnType = this.makefuncParams_return(item);
        const params = this.makeFuncParams_params(item.functionParameters);
        const dll = this.imports.importName(imports.dll, 'dll', IdType.Value);
        const thistype = this.makefuncParams_this(item);
        if (thistype !== null) {
            params.unshift(`{this:${thistype}}`);
        } else {
            if (params.length !== 0) {
                params.unshift('null');
            }
        }

        params.unshift(returnType);
        params.unshift(`${dll}.current.add(${item.address})`);
        return params.join(', ');
    }

    makeFunction(item:Identifier):string {
        const makefunc = this.imports.importName(imports.makefunc, 'makefunc', IdType.Value);
        return `${makefunc}.js(${this.makeFuncParams(item)})`;
    }

    getArgNames(args:(Identifier|Identifier[])[], idType:IdType):string {
        return args.map(id=>{
            if (id instanceof Array) {
                return `[${id.map(id=>this.stringify(id, idType)).join(', ')}]`;
            }
            return this.stringify(id, idType);
        }).join(', ');
    }

    stringify(item:Identifier, idType:IdType, opts:{isField?:boolean, isParameter?:boolean, noTemplate?:boolean}={}):string {
        try {
            if (recursiveCheck.has(item)) {
                throw Error(`recursive (${item})`);
            }
            recursiveCheck.add(item);

            if (item.parent === null) {
                throw Error(`stringify root`);
            }
            if (item.isLambda) {
                throw new IgnoreThis(`lambda (${item})`);
            }
            if (item.parent === PdbIdentifier.global && item.name.startsWith('`')) {
                throw new IgnoreThis(`private symbol (${item})`);
            }
            if (item.redirectedFrom !== null) {
                return this.stringify(item.redirectedFrom, idType, opts);
            }
            if (item.decoedFrom !== null) {
                if (item.deco === 'const') return this.stringify(item.decoedFrom, idType, opts);
                if (item.deco === '[0]') throw new IgnoreThis(`incomprehensible syntax(${item})`);
            }
            if (item.unionedTypes !== null) {
                if (idType === IdType.Value) throw Error(`Value union (${item})`);

                const names:string[] = [];
                for (const union of item.unionedTypes) {
                    let name = this.stringify(union, idType, opts);
                    if (union.isFunctionType) name = '('+name+')';
                    names.push(name);
                }
                return names.join('|');
            }
            if (item.jsTypeName != null) {
                if (opts.isParameter) {
                    if (item === any_t) return 'unknown';
                }
                return this.imports.importName(item.host, item.jsTypeName, idType);
            }
            if (item.decoedFrom !== null) {
                if (item.deco === '*' || item.deco === '&' || item.deco === '&&') {
                    const str = this.stringify(item.decoedFrom, idType);
                    if (item.isValue) {
                        if (item.decoedFrom.address === 0) {
                            console.error(`${item.source}: address not found`);
                            throw new IgnoreThis(`address not found (${item})`);
                        }
                        if (idType === IdType.Type) {
                            return this.stringify(item.getTypeOfIt(), idType);
                        }
                        return str;
                    }
                    if (item.decoedFrom.isMemberPointer) return str;

                    if (idType === IdType.Type) {
                        if (opts.isField || opts.isParameter) {
                            return str;
                        } else {
                            const Wrapper = this.imports.importName(imports.pointer, 'Wrapper', idType);
                            return `${Wrapper}<${str}>`;
                        }
                    } else {
                        if (opts.isParameter) {
                            return str;
                        } else if (opts.isField) {
                            return `${str}.ref()`;
                        } else {
                            const Wrapper = this.imports.importName(imports.pointer, 'Wrapper', idType);
                            return `${Wrapper}.make(${str}.ref())`;
                        }
                    }
                }
            }

            let out = '';
            if (item.templateBase !== null) {
                const nopts = {...opts};
                nopts.noTemplate = true;
                out = this.stringify(item.templateBase, idType, nopts);
            } else {
                if (item.isMemberPointer) {
                    const base = this.stringify(item.memberPointerBase!, idType);
                    const type = this.stringify(item.returnType!, idType);
                    const MemberPointer = this.imports.importName(imports.complextype, 'MemberPointer', idType);
                    if (idType === IdType.Type) {
                        return `${MemberPointer}<${base}, ${type}>`;
                    } else {
                        return `${MemberPointer}.make(${base}, ${type})`;
                    }
                }
                if (item.isFunctionType) {
                    if (idType === IdType.Type) {
                        const params = this.makeFuncDeclaration(item.functionParameters).declaration;
                        return `(${params.join(', ')})=>${this.stringify(item.returnType!, idType, {isParameter: true})}`;
                    } else {
                        const NativeFunctionType = this.imports.importName(imports.complextype, 'NativeFunctionType', idType);
                        return `${NativeFunctionType}.make(${this.stringify(item.returnType!, idType, {isParameter: true})}, null, ${item.functionParameters.map(id=>this.stringify(id, idType, {isParameter: true}))})`;
                    }
                }

                let needDot = false;
                if (item.parent !== PdbIdentifier.global && item.parent !== this.currentNs) {
                    out += this.stringify(item.parent!, idType, {noTemplate: true});
                    needDot = true;
                    if (!isStatic && !item.isType && idType !== IdType.Type && item.parent!.isClassLike && (item.isFunction || item.isFunctionBase || item.isTemplateFunctionBase)) {
                        out += '.prototype';
                    }
                }

                out += this.getNameOnly(item, idType, {needDot});

                if (item.isOverloaded) {
                    const OverloadedFunction = this.imports.importName(imports.complextype, 'OverloadedFunction', idType);
                    out = `(${out} as ${OverloadedFunction}).get(${this.makefuncParams_this(item)}, [${this.makeFuncParams_params(item.functionParameters)}])`;
                }
            }

            if (opts.noTemplate) {
                return out;
            }

            const tinfo = this.getTemplateInfo(item);
            if (tinfo.parameters.length === 0) {
                return out;
            }
            if (idType === IdType.Type) {
                return `${out}<${this.getArgNames(tinfo.parameters, IdType.Type)}>`;
            } else {
                return `${out}.make(${this.getArgNames(tinfo.parameters, IdType.Value)})`;
            }
        } finally {
            recursiveCheck.delete(item);
        }
    }

    writeAll():void {
        if (this.source.text === '') {
            this.isEmpty = true;
            return;
        }

        const importtext = this.imports.makeImportString();
        fs.writeFileSync(path.join(outpath, this.path+'.ts'), importtext+this.source.text);
        this.source.text = '';
    }
}

class TsFileImplement extends TsFile {

    private _writeImplements(target:Identifier, item:Identifier):void {
        if (item.address === 0) {
            console.error(`${item}: address not found`);
            throw new IgnoreThis(`address not found (${item})`);
        }
        if (item.returnType === null) {
            const targetName = this.getName(target, IdType.Value, {assignee: true});
            if (!item.isVFTable && item.functionParameters.length !== 0) console.error(`${item}: function but no return type`);
            const dll = this.imports.importName(imports.dll, 'dll', IdType.Value);
            this.source.writeln(`${targetName} = ${dll}.current.add(${item.address});`);

        } else if (item.isFunction) {
            const targetName = this.getName(target, IdType.Value, {assignee: true});
            this.source.writeln(`${targetName} = ${this.makeFunction(item)};`);
        } else {
            if (target.parent === null) {
                throw Error(`${target}: has not parent`);
            }

            let parent = '';
            if (target.parent === PdbIdentifier.global) {
                parent = this.imports.importDirect(target, target.host);
            } else {
                parent = this.stringify(target.parent, IdType.Value);
            }

            const dll = this.imports.importName(imports.dll, 'dll', IdType.Value);
            const NativeType = this.imports.importName(imports.nativetype, 'NativeType', IdType.Value);
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
                const OverloadedFunction = this.imports.importName(imports.complextype, 'OverloadedFunction', IdType.Value);

                let lastSourceLine = 0;
                const lines:string[] = [`${OverloadedFunction}.make()`];
                for (const overload of overloads) {
                    lines.push(`// ${overload.source}`);
                    try {
                        lastSourceLine = lines.push(`.overload(${this.makeFuncParams(overload)})`) - 1;
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) throw err;
                        lines.push(`// ignored: ${err.message}`);
                    }
                }
                lines[lastSourceLine] += ';';
                const targetName = this.getName(target, IdType.Value, {assignee: true});
                this.source.writeln(`${targetName} = ${lines.join('\n')}`);
            }
        } catch (err) {
            if (err instanceof IgnoreThis) {
                this.source.writeln(`// ignored: ${err.message}`);
                return;
            }
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

        let name = '';
        if (base.isConstructor) {
            name = '#constructor';
        } else if (base.isDestructor) {
            name = '#destructor';
        } else {
            name = nametarget.name;
        }
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
        this.set(base, item).overloads.push(item);
    }

    set(base:Identifier, item:Identifier = base):IdField {
        if (base.templateBase !== null) {
            throw Error('base is template');
        }
        switch (getFieldType(item)) {
        case FieldType.Member: return this.member.get(base);
        case FieldType.Static: return this.staticMember.get(base);
        case FieldType.InNamespace: return this.inNamespace.get(base);
        }
    }
}

function retTrue():true {
    return true;
}

class TsFileDeclaration extends TsFile {
    private readonly implements:[(item:Identifier)=>boolean, TsFileImplement][];
    private readonly ids:Identifier[];

    public static readonly all:TsFileDeclaration[] = [];

    constructor(
        path:string,
        ...filters:Filter[]) {
        super(path);
        this.implements = [[retTrue, new TsFileImplement(path+'_impl')]];
        this.ids = getFiltered(filters);
        this.ids.sort();
        for (const id of this.ids) {
            if (id.host !== undefined) continue;
            id.host = this;
        }
        TsFileDeclaration.all.push(this);
    }

    addImplementFile(filter:(item:Identifier)=>boolean, path:string):void {
        this.implements.push([filter, new TsFileImplement(path)]);
    }

    getImplementFile(item:Identifier):TsFileImplement {
        const arr = this.implements;
        for (let i=arr.length-1;i>=0;i--) {
            const [filter, file] = arr[i];
            if (filter(item)) return file;
        }
        throw Error(`${this.path}: target not found (${item})`);
    }

    hasOverloads(item:Identifier):boolean {
        return item.isTemplateFunctionBase || (item.isFunctionBase && item.templateBase === null);
    }

    private _writeRedirect(item:Identifier):void {
        try {
            const ori = item.redirectTo;
            if (ori === null) {
                console.error(`${item}: is not redirecting`);
                return;
            }
            const from = ori.redirectedFrom;
            ori.redirectedFrom = null;
            const typestr = this.stringify(ori, IdType.Type);
            const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', IdType.Type);
            this.source.writeln(`// ${ori.source}`);
            this.source.writeln(`${this.getDeclaration(item, null, 'type')} = ${typestr};`);
            this.source.writeln(`${this.getDeclaration(item, `${NativeClassType}<${typestr}>&typeof ${this.stringify(ori.removeTemplateParameters(), IdType.Value)}`, 'let')};`);
            const impl = this.getImplementFile(item);
            impl.source.writeln(`// ${ori.source}`);
            impl.source.writeln(`${impl.getName(item, IdType.Value, {assignee:true})} = ${impl.stringify(ori, IdType.Value)};`);
            ori.redirectedFrom = from;
        } catch (err) {
            if (err instanceof IgnoreThis) {
                this.source.writeln(`ignored: ${err.message}`);
                return;
            }
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
            else if (isStatic) prefix += 'static ';
            const name = this.getNameOnly(field.base, IdType.Value);

            if (overloads.length === 1) {
                const item = overloads[0];
                if (item.returnType === null) {
                    if (item.functionParameters.length !== 0) console.error(`${item}: no has the return type but has the arguments types`);
                    const StaticPointer = this.imports.importName(imports.core, 'StaticPointer', IdType.Type);
                    this.source.writeln(`// ${item.source}`);
                    this.source.writeln(`${prefix}${item.removeParameters().name}:${StaticPointer};`);
                } else {
                    const abstract = this.imports.importName(imports.common, 'abstract', IdType.Value);
                    const params = this.makeFuncDeclaration(item.functionParameters, item.parent!.templateBase !== null ? item.parent! : null).declaration;
                    this.source.writeln(`// ${item.source}`);
                    this.source.writeln(`${prefix}${name}(${params.join(', ')}):${this.stringify(item.returnType, IdType.Type, {isParameter: true})} { ${abstract}(); }`);
                }
            } else {
                for (const over of overloads) {
                    try {
                        this.source.writeln(`// ${over.source}`);
                        const params = this.makeFuncDeclaration(over.functionParameters, over.parent!.templateBase !== null ? over.parent! : null).declaration;
                        this.source.writeln(`${prefix}${name}(${params.join(', ')}):${this.stringify(over.returnType!, IdType.Type, {isParameter: true})};`);
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) {
                            console.error(`> Writing ${over} (symbolIndex=${over.symbolIndex})`);
                            throw err;
                        }
                        this.source.writeln(`// ignored: ${err.message}`);
                    }
                }
                const abstract = this.imports.importName(imports.common, 'abstract', IdType.Value);
                this.source.writeln(`${prefix}${name}(...args:any[]):any { ${abstract}(); }`);
            }
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.source.writeln(`// ignored: ${err.message}`);
                return;
            }
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
                const StaticPointer = this.imports.importName(imports.core, 'StaticPointer', IdType.Type);
                this.source.writeln(`${this.getDeclaration(item, StaticPointer, 'let')};`);
            }
            const impl = this.getImplementFile(item);
            impl.writeAssign(new IdField(item));
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.source.writeln(`// ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _getField(out:FieldInfo, item:Identifier):void {
        if (item.parent === null) {
            throw Error(`${item.name}: parent not found`);
        }
        if (!usingFilter(item)) return;
        if (item.isDecoed) return;
        if (item.isFunctionType) return;
        if (item.isNameBase) return;
        if (item.templateBase !== null && !item.isTemplateFunctionBase && !item.isFunctionBase) {
            if (/^[A-Z]/.test(item.name) && item.address === 0) { // assume class if template
                item.setAsClass();
                item.templateBase.setAsClass();
            }
            return;
        }
        if (item.templateBase !== null && item.isFunctionBase) {
            return;
        }
        if (item.functionBase !== null) return;
        if (item.address !== 0) { // expect type from section
            const section = imageSections.getSectionOfRva(item.address);
            if (section === null) {
                console.error(`${item.name}: Unknown section`);
            } else {
                switch (section.name) {
                case '.reloc': // data?
                    break;
                case '.pdata': // exception info
                    return;
                case '.data': // user section?
                    return;
                case '.rdata': // readonly
                    item.setAsFunction();
                    break;
                default:
                    console.error(`${section.name}, ${item.name}: unspecified section`);
                    break;
                }
            }
        }

        if (this.hasOverloads(item)) {
            for (const o of item.allOverloads()) {
                if (!usingFilter(item)) continue;
                if (o.isTemplate && o.hasArrayParam()) continue;
                if (item.isTemplateFunctionBase) {
                    if (o.functionParameters.some(arg=>arg.getArraySize() !== null)) continue;
                }
                if (!o.functionParameters.every(usingFilter)) {
                    continue;
                }
                if (!usingFilter(o.parent!)) {
                    continue;
                }
                if (o.returnType !== null && !usingFilter(o.returnType)) {
                    continue;
                }
                out.push(item, o);
            }
        } else {
            out.set(item);
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

            const info = this.getTemplateInfo(item);
            if (info.paramTypes.length !== 0) {

                const NativeTemplateClass = this.imports.importName(imports.complextype, 'NativeTemplateClass', IdType.Value);
                this.source.writeln(`// ${item.source}`);
                const names = info.makeNames(this);
                const paramsText =  `<${names.join(', ')}>`;
                const clsname = this.getNameOnly(item, IdType.Value);
                this.source.open(`export class ${clsname}${paramsText} extends ${NativeTemplateClass} {`, true);
                opened = true;

                try {
                    const args = this.makeFuncDeclaration(info.paramTypes);
                    const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', IdType.Value);
                    this.source.open(`static make(${args.declaration.join(', ')}):${NativeClassType}<${clsname}<${args.parameterNames.map(()=>'any').join(', ')}>>&typeof ${clsname} {`);
                    this.source.writeln(`return super.make(${args.parameterNames.join(', ')});`);
                    this.source.close('}');
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.source.writeln(`// ignored: ${err.message}`);
                    } else {
                        throw err;
                    }
                }
            } else {
                if (item.isClassLike) {
                    const NativeClass = this.imports.importName(imports.nativeclass, 'NativeClass', IdType.Value);
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
            for (const _ of this.enterNamespace(item)) {
                if (!opened) {
                    for (const field of fields.member) {
                        try {
                            this.writeMembers(field);
                        } catch (err) {
                            if ((err instanceof IgnoreThis)) {
                                this.source.writeln(`// ignored: ${err.message}`);
                            } else {
                                console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                                throw err;
                            }
                        }
                    }
                }

                for (const field of fields.inNamespace) {
                    try {
                        this.writeMembers(field);
                    } catch (err) {
                        if ((err instanceof IgnoreThis)) {
                            this.source.writeln(`// ignored: ${err.message}`);
                        } else {
                            console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                            throw err;
                        }
                    }
                }
            }
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.source.writeln(`// ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    writeMembers(field:IdField):void {
        const overloads = field.overloads;
        if (overloads.length !== 0) {
            // set default constructor
            if (insideOfClass) {
                for (const overload of overloads) {
                    if (overload.functionParameters.length === 0 && overload.functionBase!.name === overload.parent!.name) {
                        const NativeType = this.imports.importName(imports.nativetype, 'NativeType', IdType.Value);
                        this.source.writeln(`[${NativeType}.ctor]():void{ return this.__constructor(); }`);
                        break;
                    }
                }
            }

            // write overloads
            try {
                this._writeOverloads(field);
                const impl = this.getImplementFile(field.base);
                impl.writeAssign(field);
            } catch (err) {
                if ((err instanceof IgnoreThis)) {
                    this.source.writeln(`// ignored: ${err.message}`);
                } else {
                    throw err;
                }
            }
        } else {
            const base = field.base;
            if (base.isFunction) {
                this._writeField(base);
            } else if (base.isClassLike) {
                if (!insideOfClass) {
                    this._writeClass(base);
                }
            } else if (base.isStatic) {
                this._writeField(base);
            } else if (base.isRedirectType) {
                this._writeRedirect(base);
            } else if (base.templateBase === null) {
                if (!insideOfClass) {
                    this._writeClass(base);
                }
            }
            // throw Error(`${base.source || base}: unexpected identifier`);
        }
    }

    writeAll():void {
        try {
            const out = new FieldInfo;
            for (const item of this.ids) {
                this._getField(out, item);
            }
            if (out.staticMember.size !== 0) {
                const first = getFirstIterableItem(out.staticMember)!;
                throw Error(`global static member: ${first.base}`);
            }
            for (const field of out.inNamespace) {
                try {
                    this.writeMembers(field);
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.source.writeln(`// ignored: ${err.message}`);
                        continue;
                    }
                    console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                    throw err;
                }
            }
            for (const field of out.member) {
                try {
                    this.writeMembers(field);
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.source.writeln(`// ignored: ${err.message}`);
                        continue;
                    }
                    console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                    throw err;
                }
            }
            super.writeAll();

            for (const [filter, impl] of this.implements) {
                impl.writeAll();
            }
        } catch (err) {
            console.error(`> Writing ${this.path}`);
            throw err;
        }
    }

}

const std = PdbIdentifier.std;
setBasicType('bool', 'bool_t', 'b', imports.nativetype);
setBasicType('void', 'void_t', 'v', imports.nativetype);
setBasicType('float', 'float32_t', 'f', imports.nativetype);
setBasicType('double', 'float64_t', 'd', imports.nativetype);
setBasicType('char', 'int8_t', 'c', imports.nativetype);
setBasicType('wchar_t', 'uint16_t', 'wc', imports.nativetype);
setBasicType('char signed', 'int8_t', 'sc', imports.nativetype);
setBasicType('char unsigned', 'uint8_t', 'uc', imports.nativetype);
setBasicType('short', 'int16_t', 's', imports.nativetype);
setBasicType('short unsigned', 'uint16_t', 'us', imports.nativetype);
setBasicType('int', 'int32_t', 'i', imports.nativetype);
setBasicType('int unsigned', 'uint32_t', 'u', imports.nativetype);
setBasicType('long', 'int32_t', 'i', imports.nativetype);
setBasicType('long unsigned', 'uint32_t', 'u', imports.nativetype);
setBasicType('__int64', 'bin64_t', 'i', imports.nativetype);
setBasicType('__int64 unsigned', 'bin64_t', 'u', imports.nativetype);
setBasicType('void*', 'VoidPointer', 'p', imports.core);
setBasicType('void const*', 'VoidPointer', 'p', imports.core);
setBasicType('std::nullptr_t', 'null', 'v', null);
const typename_t = setBasicType('typename', 'Type', 't', imports.nativetype);
const any_t = setBasicType('any', 'any', 'v', null);
const anys_t = setBasicType(any_t.decorate('[]'), 'any[]', 'args', null);
setBasicType(std.find('basic_string<char,std::char_traits<char>,std::allocator<char> >'), 'CxxString', 'str', imports.nativetype);
setBasicType(PdbIdentifier.global.make('...'), 'NativeVarArgs', '...args', imports.complextype);

// std.make('string').redirect(std.find('basic_string<char,std::char_traits<char>,std::allocator<char> >'));
std.make('ostream').redirect(std.find('basic_ostream<char,std::char_traits<char> >'));
std.make('istream').redirect(std.find('basic_istream<char,std::char_traits<char> >'));
std.make('iostream').redirect(std.find('basic_iostream<char,std::char_traits<char> >'));
std.make('stringbuf').redirect(std.find('basic_stringbuf<char,std::char_traits<char>,std::allocator<char> >'));
std.make('istringstream').redirect(std.find('basic_istringstream<char,std::char_traits<char>,std::allocator<char> >'));
std.make('ostringstream').redirect(std.find('basic_ostringstream<char,std::char_traits<char>,std::allocator<char> >'));
std.make('stringstream').redirect(std.find('basic_stringstream<char,std::char_traits<char>,std::allocator<char> >'));

PdbIdentifier.global.make('RakNet').make('RakNetRandom').setAsClass();

// remove useless identities
PdbIdentifier.global.children.delete('...'); // variadic args

const ids:Identifier[] = [];
for (const [key, value] of PdbIdentifier.global.children) {
    if (value.isBasicType) {
        // basic types
    } else if (key.startsWith('`')) {
        // private symbols
    } else if (value.isLambda) {
        // lambdas
    } else if (value.isConstant && /^[0-9]+$/.test(key)) {
        // numbers
    } else if (key.startsWith('{')) {
        // code chunk?
    } else if (key.startsWith('__imp_')) {
        // import
    } else if (/^main\$dtor\$[0-9]+$/.test(key)) {
        // dtor in main
    } else {
        ids.push(value);
    }
}

new TsFileDeclaration('./raknet', 'RakNet');
const stdfile = new TsFileDeclaration('./std', 'std',
    'strchr', 'strcmp', 'strcspn', 'strerror_s', 'strncmp', 'strncpy', 'strrchr',
    'strspn', 'strstart', 'strstr', 'strtol', 'strtoul', 'wcsstr', '_stricmp',
    'tan', 'tanh', 'cos', 'cosf', 'cosh', 'sin', 'sinf', 'sinh', 'log', 'log10', 'log1p', 'log2', 'logf', 'fabs',
    'asin', 'asinf', 'asinh', 'atan2f', 'powf', 'fmod', 'fmodf', 'atan', 'atan2', 'atanf', 'atanh',
    'fclose', 'feof', 'ferror', 'fgets', 'fflush', 'fopen', 'ftell', 'fwrite',
    'terminate', 'sscanf', 'sprintf_s', 'printf', 'atexit',
    'snprintf', 'sprintf',
    'memcpy', 'memmove', 'operator delete[]', 'operator new[]',
    'free', 'malloc', '_aligned_malloc', 'delete', 'delete[]', 'delete[](void * __ptr64)', 'delete[](void * __ptr64,unsigned __int64)');
stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'vector'), './std_vector_impl');
stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'unique_ptr') || item.checkBase(PdbIdentifier.std, 'make_unique'), './std_unique_ptr_impl');
stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'shared_ptr'), './std_shared_ptr_impl');
stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'allocator'), './std_allocator_impl');
stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'function'), './std_function_impl');
stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'list'), './std_list_impl');

new TsFileDeclaration('./socket',
    'sockaddr_in', 'sockaddr_in6', '');
new TsFileDeclaration('./zlib',
    'comp_zlib_cleanup_int', 'compressBound',
    /^unz/, /^zip/, /^zc/, /^zlib_/, 'z_errmsg', /^deflate/, /^_tr_/);
new TsFileDeclaration('./quickjs', /^js_/, /^JS_/, /^lre_/, /^string_/, /^dbuf_/);
new TsFileDeclaration('./openssl',
    'err_free_strings_int',
    /^EVP_/, /^OPENSSL_/, /^OSSL_/, /^RSA_/, /^SEED_/,
    /^SHA1/, /^SHA224/, /^SHA256/, /^SHA384/, /^SHA3/, /^SHA512/,
    /^X509/, /^X509V3/, /^X448/, /^X25519/, /^XXH64/, /^curve448_/, /^openssl_/, /^rand_/,
    /^d2i_/, /^ec_/, /^i2a_/, /^hmac_/, /^i2c_/, /^i2d_/, /^i2o_/, /^i2s_/, /^i2t_/, /^i2v_/, /^o2i_/, /^v3_/, /^v2i_/,
    /^x448_/, /^x509_/, /^ecdh_/, /^dsa_/, /_meth$/, /^CMS_/, /^CRYPTO_/, /^AES_/, /^ASN1_/, /^sha512_/, /^sm2_/, /^sm3_/,
    /^rsa_/, /^ripemd160_/, /^ossl_/, /^md5_/, /^int_rsa_/, /^gf_/, /^evp_/, /^cr_/, /^cms_/, /^c448_/, /^c2i_/, /^bn_/,
    /^asn1_/, /^aria_/, /^a2i_/, /^a2d_/, /^ERR_/, /^EC_/, /^BN_/, /^BIO_/);
new TsFileDeclaration('./rapidjson', 'rapidjson');
new TsFileDeclaration('./gsl', 'gsl');
new TsFileDeclaration('./glm', 'glm');
new TsFileDeclaration('./gltf', 'glTF');
new TsFileDeclaration('./leveldb', 'leveldb');
new TsFileDeclaration('./entt', 'entt');
new TsFileDeclaration('./json', 'Json', /^Json/);
new TsFileDeclaration('./chakra', /^Js[A-Z]/);
new TsFileDeclaration('./minecraft_bedrock', 'Bedrock');
new TsFileDeclaration('./minecraft_scripting', 'Scripting');
new TsFileDeclaration('./minecraft_crypto', 'Crypto');
new TsFileDeclaration('./minecraft_core', 'Core');
new TsFileDeclaration('./minecraft_goal', /Goal$/);
new TsFileDeclaration('./minecraft_events', /Event$/);
new TsFileDeclaration('./minecraft_handlers', /Handler$/);
new TsFileDeclaration('./minecraft_triggers', /Trigger$/);
new TsFileDeclaration('./minecraft_attributes', /Attributes$/);
new TsFileDeclaration('./minecraft_components', /Component$/);
new TsFileDeclaration('./minecraft_packets', /Packet$/, 'make_packet');
new TsFileDeclaration('./minecraft_defs', /^Definition/, /Definition$/);
new TsFileDeclaration('./minecraft_tests', /Test$/);
new TsFileDeclaration('./minecraft_items', item=>item.children.has('buildDescriptionId') ||
                                                item.children.has('getSilkTouchItemInstance') ||
                                                item.children.has('asItemInstance') ||
                                                item.children.has('getResourceItem') ||
                                                item.children.has('getPlacementBlock') ||
                                                item.children.has('isGlint') ||
                                                item.children.has('onPlace'));
new TsFileDeclaration('./minecraft_actors', item=>item.children.has('aiStep') ||
                                                item.children.has('checkSpawnRules') ||
                                                item.children.has('reloadHardcoded') ||
                                                item.children.has('reloadHardcodedClient') ||
                                                item.children.has('useNewAi'));
new TsFileDeclaration('./minecraft', ()=>true);
for (const file of TsFileDeclaration.all) {
    file.writeAll();
}
console.log(`global id count: ${PdbIdentifier.global.children.size}`);
