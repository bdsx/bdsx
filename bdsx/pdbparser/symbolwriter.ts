import { styling } from "../externs/bds-scripting/styling";
import { imageSections } from "./imagesections";
import { PdbIdentifier } from "./symbolparser";
import { TemplateInfo } from "./templateinfo";
import fs = require('fs');
import path = require('path');
import { tsw } from "./tswriter";
import { TsFileBase } from "./tsimport";

const COMMENT_SYMBOL = false;

const specialNameRemap = new Map<string, string>();
specialNameRemap.set("`vector deleting destructor'", '__vector_deleting_destructor');
specialNameRemap.set("`scalar deleting destructor'", '__scalar_deleting_destructor');
specialNameRemap.set("`vbase destructor'", '__vbase_destructor');
specialNameRemap.set('any', 'any_');
specialNameRemap.set('make', 'make_');
specialNameRemap.set('string', 'string_');
specialNameRemap.set('function', 'function_');
specialNameRemap.set('add', 'add_');
specialNameRemap.set('null', '_null');
specialNameRemap.set('finally', 'finally_');
specialNameRemap.set('yield', 'yield_');
specialNameRemap.set('Symbol', 'Symbol_');
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
specialNameRemap.set('operator&', 'operator_and');
specialNameRemap.set('operator|', 'operator_or');
specialNameRemap.set('operator^', 'operator_xor');
specialNameRemap.set('operator()', 'operator_call');
specialNameRemap.set('operator[]', 'operator_index');
specialNameRemap.set('operator++', 'operator_inc');
specialNameRemap.set('operator--', 'operator_dec');
specialNameRemap.set('operator->', 'operator_der');
specialNameRemap.set('getString', 'getString_');
specialNameRemap.set('getBoolean', 'getBoolean_');
specialNameRemap.set('fill', 'fill_');

class IgnoreThis {
    constructor(public message:string) {
    }
}

const outpath = path.join(__dirname, 'globals');
try {
    fs.mkdirSync(outpath);
} catch (err) {
}

let insideOfClass = false;
let isStatic = false;


const adjustorRegExp = /^(.+)`adjustor{([0-9]+)}'$/;
const idremap:Record<string, string> = {'{':'','}':'',',':'_','<':'_','>':'_'};
const recursiveCheck = new Set<Identifier>();

interface Identifier extends PdbIdentifier {
    host?:TsFileBase|null;
    jsTypeName?:string;
    jsTypeNullable?:boolean;
    paramVarName?:string;
    isOverloaded?:boolean;
    filted?:boolean;
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

PdbIdentifier.filter = (item:Identifier):boolean=>{
    if (item.filted != null) return item.filted;
    item = item.decay();
    if (item.isLambda) return item.filted = false;
    if (item.parent === null) return item.filted = true;
    if (!PdbIdentifier.filter(item.parent)) return item.filted = false;
    if ((item.isFunctionBase || item.isTemplateFunctionBase || item.isFunction || item.isClassLike) && item.parent === PdbIdentifier.std && item.name.startsWith('_')) return item.filted = false;
    if (item.name === "`anonymous namespace'") return item.filted = false;
    if (item.name.startsWith('<unnamed-type-')) return item.filted = false;
    if (item.name.startsWith('#')) return item.filted = false;
    if (item.templateBase !== null) {
        if (item.parent === PdbIdentifier.std) {
            if (item.templateBase.name === 'allocator') {
                return item.filted = false;
            }
        } else if (item.templateBase.parent!.name === 'JsonUtil') {
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
                return item.filted = false;
            }
        }
        for (const param of item.templateParameters) {
            if (!PdbIdentifier.filter(param)) return item.filted = false;
        }
    }
    for (const param of item.functionParameters) {
        if (!PdbIdentifier.filter(param)) return item.filted = false;
    }
    if (item.unionedTypes !== null) {
        for (const t of item.unionedTypes) {
            if (!PdbIdentifier.filter(t)) return item.filted = false;
        }
    }
    if (item.returnType !== null) {
        if (!PdbIdentifier.filter(item.returnType)) return item.filted = false;
    }

    return item.filted = true;
};

function setBasicType(name:string|PdbIdentifier, jsTypeName:string, paramVarName:string, host:TsFileBase|null, jsTypeNullable?:boolean):Identifier {
    const item:Identifier = name instanceof PdbIdentifier ? name : PdbIdentifier.parse(name);
    item.isBasicType = true;
    item.host = host;
    item.jsTypeName = jsTypeName;
    item.paramVarName = paramVarName;
    if (jsTypeNullable != null) item.jsTypeNullable = jsTypeNullable;
    return item;
}

function makeDot<T extends tsw.Type|tsw.Identifier>(item:T, key:string):T {
    if (item instanceof tsw.Type) {
        return new tsw.TypeMember(item, new tsw.NameProperty(key)) as any;
    } else {
        return new tsw.Member(item, new tsw.NameProperty(key)) as any;
    }
}

function nullableType(out:tsw.Identifier|tsw.Type, item:Identifier):tsw.TypeOr {
    if (!(out instanceof tsw.Type)) throw Error(`nullable but not type (${item})`);
    return out.or(tsw.TypeName.null);
}

function makeTemplate<T extends tsw.Identifier|tsw.Type>(base:T, params:T[]):T {
    if (base instanceof tsw.Type) {
        return new tsw.TemplateType(base, params as tsw.Type[]) as any;
    } else {
        return new tsw.DotCall(base, new tsw.NameProperty('make'), params as tsw.Identifier[]) as any;
    }
}
function propertyToName<T extends tsw.Kind>(kind:T, prop:tsw.Property):tsw.KindToName<T> {
    if (!(prop instanceof tsw.NameProperty)) throw Error(`${prop} is not name property`);
    return kind.asName(prop.name);
}

function retTrue():true {
    return true;
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

class TsFile extends TsFileBase {
    public readonly doc = new tsw.Document;

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
        let basename = propertyToName(tsw.Identifier, this.getNameOnly(baseid, tsw.Identifier, {noImport: true})).name;
        if (basename.endsWith('_t')) basename = basename.substr(0, basename.length-2);
        basename = styling.toCamelStyle(basename, /[[\] :*]/g, false);
        return basename;
    }

    insideOf(namespace:Identifier):boolean {
        return false;
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
        const nameobj = this.getNameOnly(item, tsw.Identifier, {noImport: true});
        if (!(nameobj instanceof tsw.NameProperty)) throw Error(`is not name(${item})`);
        let name = nameobj.name.replace(/[{},<>]/g, v=>idremap[v]);
        if (name.startsWith('-')) {
            name = 'minus_'+name.substr(1);
        }
        return name;
    }

    getNameOnly(item:Identifier, kind:tsw.Kind, opts:{noImport?:boolean} = {}):tsw.Property {
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
            return new tsw.NameProperty('__constructor');
        } else {
            if (item.isDestructor) {
                const NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Identifier);
                return new tsw.BracketProperty(tsw.dots(NativeType, 'dtor'));
            }
        }

        const remapped = specialNameRemap.get(name);
        let matched:RegExpMatchArray|null;
        if (remapped !== undefined) {
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
        }
        if (item.parent === PdbIdentifier.global && !item.isConstant) {
            if (!opts.noImport) {
                name = this.imports.importName(item.host, name, kind).name;
            }
        }
        return new tsw.NameProperty(name);
    }

    getDeclaration(item:Identifier, type:tsw.Type|null, define:'const'|'type'|'let'):tsw.BlockItem|tsw.ClassItem {
        if (item.templateBase !== null) {
            throw Error(`${item}: getNameDeclaration with template`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.isLambda) {
            throw new IgnoreThis(`lambda (${item})`);
        }

        const name = this.getNameOnly(item, tsw.Identifier);
        if (insideOfClass) {
            if (type == null) throw Error(`variable but no type (${item})`);
            if (isStatic) {
                if (define === 'type') throw Error(`static but type (${item})`);
                if (define === null) throw Error(`static but no define (${item})`);
                return new tsw.Fields(null, true, define === 'const', [[name, type]]);
            } else {
                return new tsw.Fields(null, false, define === 'const', [[name, type]]);
            }
        } else {
            if (define == null) throw Error(`non class member but no define (${item})`);
            if (define === 'type') {
                if (!(name instanceof tsw.NameProperty)) throw Error(`type but invalid name (${item})`);
                return new tsw.Export(new tsw.TypeName(name.name));
            } else {
                if (type == null) throw Error(`variable but no type (${item})`);
                return new tsw.Export(new tsw.VariableDef(define, [[name, type]]));
            }
        }
    }

    getName<T extends tsw.Kind>(item:Identifier, kind:T, opts:{assignee?:boolean} = {}):tsw.KindToItem<T> {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.isLambda) {
            throw new IgnoreThis(`lambda (${item})`);
        }

        let result:tsw.KindToItem<T>|null = null;
        if (item.parent === PdbIdentifier.global) {
            if (opts.assignee) {
                const imported = this.imports.importDirect(item, item.host);
                if (imported instanceof kind) {
                    result = imported as tsw.KindToItem<T>;
                } else {
                    result = imported;
                }
            }
        } else {
            result = this.toTsw(item.parent, kind);
            if (insideOfClass && !isStatic && !item.isType && tsw.isType(kind) && item.parent.isClassLike && (item.isFunction || item.isFunctionBase || item.isTemplateFunctionBase)) {
                result = tsw.dots(result, 'prototype');
            }
        }

        const name = this.getNameOnly(item, kind);
        return (result !== null) ? tsw.dots(result, name) : propertyToName(kind, name);
    }

    makeFuncDeclaration(args:(Identifier|tsw.TypeName)[], thisType?:Identifier|null):{declaration:[string, tsw.Type][], parameterNames:tsw.Name[]} {
        const names = new Map<string, {index:number, counter:number}>();
        const declaration:[string, tsw.Type][] = [];
        const varNames:string[] = [];
        const parameters:tsw.Name[] = [];
        for (let i=0;i<args.length;i++) {
            const type = args[i];
            let basename:string;
            if (type instanceof PdbIdentifier) basename = this._getVarName(type);
            else basename = 'arg'+i;

            let name = basename;
            const info = names.get(name);
            if (info === undefined) {
                names.set(name, {index:i, counter:1});
            } else {
                if (info.counter === 1) {
                    varNames[info.index] = basename + '_' + info.counter;
                }
                info.counter++;
                name = basename + '_' + info.counter;
            }
            varNames[i] = name;
        }
        for (let i=0;i<declaration.length;i++) {
            let type:tsw.Type|PdbIdentifier = args[i];
            if (type instanceof PdbIdentifier) {
                type = this.toTsw(type, tsw.Type, {isParameter: true, nullable: true});
            }
            const name = varNames[i];
            declaration[i] = [name, type];
            parameters[i] = new tsw.Name(name);
        }
        if (thisType != null) {
            let type:tsw.Type;
            if (isStatic) {
                const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', tsw.Type);
                type = new tsw.TemplateType(NativeClassType, [this.toTsw(thisType, tsw.Type, {isParameter: true})]);
            } else {
                type = this.toTsw(thisType, tsw.Type, {isParameter: true, nullable: true, noJsType: true});
            }
            declaration.unshift(['this', type]);
        }
        return {
            declaration,
            parameterNames: parameters
        };
    }

    makeFuncParams_params(item:Identifier[]):tsw.Identifier[]{
        return item.map(id=>this.toTsw(id, tsw.Identifier, {isParameter: true}));
    }

    makefuncParams_this(item:Identifier):tsw.Identifier|null {
        if (this.isClassMethod(item, false)) {
            return this.toTsw(item.parent!, tsw.Identifier, {isParameter: true});
        } else {
            return null;
        }
    }

    makefuncParams_return(item:Identifier):tsw.Identifier {
        if (item.returnType === null) {
            throw Error(`${item}: function but no return type`);
        }
        return this.toTsw(item.returnType, tsw.Identifier, {isParameter: true});
    }

    makeFuncParams(item:Identifier):tsw.Identifier[] {
        const returnType = this.makefuncParams_return(item);
        const params = this.makeFuncParams_params(item.functionParameters);
        const dll = this.imports.importName(imports.dll, 'dll', tsw.Identifier);
        const thistype = this.makefuncParams_this(item);
        if (thistype !== null) {
            const obj = new tsw.Object;
            obj.fields.set('this', thistype);
            params.unshift(obj);
        } else {
            if (params.length !== 0) {
                params.unshift(tsw.Constant.null);
            }
        }

        params.unshift(returnType);
        params.unshift(tsw.dots(dll, 'current').call('add', [new tsw.Constant(item.address)]));
        return params;
    }

    makeFunction(item:Identifier):tsw.Identifier {
        const makefunc = this.imports.importName(imports.makefunc, 'makefunc', tsw.Identifier);
        return new tsw.DotCall(makefunc, 'js', this.makeFuncParams(item));
    }

    toTswArgs<T extends tsw.Kind>(args:(Identifier[]|Identifier)[], kind:T):tsw.KindToItem<T>[] {
        return args.map((id):tsw.KindToItem<T>=>{
            if (id instanceof Array) {
                if (kind === tsw.Identifier) {
                    const templateArgs = this.imports.importName(imports.nativetype, 'templateArgs', tsw.Identifier);
                    return new tsw.Call(templateArgs, id.map(id=>this.toTsw(id, kind))) as tsw.KindToItem<T>;
                } else {
                    return new tsw.Array(id.map(id=>this.toTsw(id, kind))) as tsw.KindToItem<T>;
                }
            }
            return this.toTsw(id, kind);
        });
    }

    toTsw<T extends tsw.Kind>(item:Identifier, kind:T, opts:{isField?:boolean, isParameter?:boolean, noTemplate?:boolean, nullable?:boolean, noJsType?:boolean}={}):tsw.KindToItem<T> {
        if (opts.nullable) {
            if (!tsw.isType(kind)) {
                throw TypeError(`nullable but no type (${item})`);
            }
            if (opts.noTemplate) {
                throw TypeError(`nullable but no noTemplate`);
            }
        }
        if (item.parent === null) {
            if (item === PdbIdentifier.global) {
                throw TypeError(`stringify root`);
            }
            throw TypeError(`stringify disconnected {${item}}`);
        }
        if (item.isLambda) {
            throw new IgnoreThis(`lambda (${item})`);
        }
        if (item.parent === PdbIdentifier.global && item.name.startsWith('`')) {
            throw new IgnoreThis(`private symbol (${item})`);
        }

        if (recursiveCheck.has(item)) {
            throw Error(`recursive (${item})`);
        }

        try {
            recursiveCheck.add(item);

            if (item.redirectedFrom !== null) {
                return this.toTsw(item.redirectedFrom, kind, opts);
            }
            if (item.decoedFrom !== null) {
                if (item.deco === 'const') return this.toTsw(item.decoedFrom, kind, opts);
                if (item.deco === '[0]') throw new IgnoreThis(`incomprehensible syntax(${item})`);
            }
            if (item.unionedTypes !== null) {
                if (!tsw.isType(kind)) throw Error(`union is not type (${item})`);

                const nopts = {...opts};
                nopts.nullable = false;
                const types:tsw.Type[] = [];
                for (const union of item.unionedTypes) {
                    types.push(this.toTsw(union, tsw.Type, nopts));
                }
                if (opts.nullable) types.push(tsw.TypeName.null);
                return new tsw.TypeOr(types) as tsw.KindToItem<T>;
            }
            if (!opts.noJsType && item.jsTypeName != null) {
                if (opts.isParameter) {
                    if (item === any_t) return tsw.TypeName.unknown as tsw.KindToItem<T>;
                }
                let out:tsw.KindToItem<T> = this.imports.importName(item.host, item.jsTypeName, kind);
                if (opts.nullable && item.jsTypeNullable) {
                    out = nullableType(out, item) as tsw.KindToItem<T>;
                }
                return out;
            }
            if (item.decoedFrom !== null) {
                if (item.deco === '*' || item.deco === '&' || item.deco === '&&') {
                    let out = this.toTsw(item.decoedFrom, kind);
                    if (item.isValue) {
                        if (item.decoedFrom.address === 0) {
                            console.error(`${item.source}: address not found`);
                            throw new IgnoreThis(`address not found (${item})`);
                        }
                        if (tsw.isType(kind)) {
                            out = this.toTsw(item.getTypeOfIt(), kind);
                        }
                        if (opts.nullable) {
                            out = nullableType(out, item) as tsw.KindToItem<T>;
                        }
                        return out;
                    }
                    if (item.decoedFrom.isMemberPointer) {
                        if (opts.nullable) {
                            out = nullableType(out, item) as tsw.KindToItem<T>;
                        }
                        return out;
                    }

                    if (tsw.isType(kind)) {
                        if (!opts.isField && !opts.isParameter) {
                            const Wrapper = this.imports.importName(imports.pointer, 'Wrapper', tsw.Type);
                            out = new tsw.TemplateType(Wrapper, [out as tsw.Type]) as tsw.KindToItem<T>;
                        }
                        if (opts.nullable) {
                            out = nullableType(out, item) as tsw.KindToItem<T>;
                        }
                        return out;
                    } else {
                        if (!opts.isParameter) {
                            out = new tsw.DotCall(out as tsw.Identifier, 'ref', []) as tsw.KindToItem<T>;
                            if (!opts.isField) {
                                const Wrapper = this.imports.importName(imports.pointer, 'Wrapper', kind);
                                out = new tsw.DotCall(Wrapper, 'make', [out]) as tsw.KindToItem<T>;
                            }
                        }
                        return out;
                    }
                }
            }

            let out:tsw.KindToItem<T>|null = null;
            if (item.templateBase !== null) {
                const nopts = {...opts};
                nopts.nullable = false;
                nopts.noTemplate = true;
                out = this.toTsw(item.templateBase, kind, nopts);
            } else {
                if (item.isMemberPointer) {
                    const base = this.toTsw(item.memberPointerBase!, kind);
                    const type = this.toTsw(item.returnType!, kind);
                    const MemberPointer = this.imports.importName(imports.complextype, 'MemberPointer', kind);
                    if (MemberPointer instanceof tsw.Type) {
                        let out:tsw.Type = new tsw.TemplateType(MemberPointer, [base as tsw.Type, type as tsw.Type]);
                        if (opts.nullable) {
                            out = nullableType(out, item);
                        }
                        return out as tsw.KindToItem<T>;
                    } else {
                        const out = new tsw.DotCall(MemberPointer as tsw.Identifier, 'make', [base as tsw.Identifier, type as tsw.Identifier]);
                        return out as tsw.KindToItem<T>;
                    }
                }
                if (item.isFunctionType) {
                    if (tsw.isType(kind)) {
                        const params = this.makeFuncDeclaration(item.functionParameters).declaration;
                        const returnType = this.toTsw(item.returnType!, tsw.Type, {isParameter: true});
                        let out:tsw.Type = new tsw.FunctionType(returnType, params);
                        if (opts.nullable) {
                            out = nullableType(out, item);
                        }
                        return out as tsw.KindToItem<T>;
                    } else {
                        const NativeFunctionType = this.imports.importName(imports.complextype, 'NativeFunctionType', kind);
                        const out = new tsw.DotCall(NativeFunctionType, 'make', [
                            this.toTsw(item.returnType!, kind, {isParameter: true}),
                            tsw.TypeName.null,
                            ...item.functionParameters.map(id=>this.toTsw(id, kind, {isParameter: true}))
                        ]);
                        return out as any;
                    }
                }

                let needDot = false;
                if (item.parent !== PdbIdentifier.global && this.insideOf(item.parent)) {
                    const parent = this.toTsw(item.parent!, kind, {noTemplate: true});
                    needDot = true;
                    if (!isStatic && !item.isType && tsw.isType(kind) && item.parent!.isClassLike && (item.isFunction || item.isFunctionBase || item.isTemplateFunctionBase)) {
                        out = new tsw.Member(parent, new tsw.NameProperty('prototype')) as any;
                    }
                }

                const name =  this.getNameOnly(item, kind, {noImport: needDot});
                if (out !== null) {
                    out = new tsw.Member(out, name) as tsw.KindToItem<T>;
                } else {
                    out = propertyToName(kind, name);
                }

                if (item.isOverloaded) {
                    if (!(out instanceof tsw.Identifier)) throw Error(`is not value (${item})`);
                    const OverloadedFunction = this.imports.importName(imports.complextype, 'OverloadedFunction', kind);
                    out = new tsw.DotCall(new tsw.As(out, OverloadedFunction), 'get', [this.makefuncParams_this(item) || tsw.Constant.null, new tsw.Array(this.makeFuncParams_params(item.functionParameters))]) as any as tsw.KindToItem<T>;
                }
            }

            if (opts.noTemplate) {
                return out;
            }

            const tinfo = TemplateInfo.from(item);
            if (tinfo.parameters.length !== 0) {
                out = makeTemplate(out, this.toTswArgs(tinfo.parameters, kind));
            }
            if (opts.nullable) {
                out = nullableType(out, item) as tsw.KindToItem<T>;
            }
            return out;
        } finally {
            recursiveCheck.delete(item);
        }
    }

    save(filename:string):void {
        if (this.doc.items.length === 0) {
            return;
        }

        this.doc.items.unshift(...this.imports.toTsw());
        this.doc.save(filename);
        this.doc.items.length = 0;
    }
}

class TsFileImplement extends TsFile {

    existName(name:string):boolean  {
        return false;
    }

    private _writeImplements(target:Identifier, item:Identifier):void {
        if (item.address === 0) {
            console.error(`${item}: address not found`);
            throw new IgnoreThis(`address not found (${item})`);
        }
        if (item.returnType === null) {
            const targetName = this.getName(target, tsw.Identifier, {assignee: true});
            if (!item.isVFTable && item.functionParameters.length !== 0) console.error(`${item}: function but no return type`);
            const dll = this.imports.importName(imports.dll, 'dll', tsw.Identifier);
            this.doc.assign(targetName, new tsw.DotCall(tsw.dots(dll, 'current'), 'add', [new tsw.Constant(item.address)]));

        } else if (item.isFunction) {
            const targetName = this.getName(target, tsw.Identifier, {assignee: true});
            this.doc.assign(targetName, this.makeFunction(item));
        } else {
            if (target.parent === null) {
                throw Error(`${target}: has not parent`);
            }

            let parent:tsw.Identifier;
            if (target.parent === PdbIdentifier.global) {
                parent = this.imports.importDirect(target, target.host);
            } else {
                parent = this.toTsw(target.parent, tsw.Identifier);
            }

            const dll = this.imports.importName(imports.dll, 'dll', tsw.Identifier);
            const NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Identifier);
            const type = this.toTsw(item.returnType, tsw.Identifier, {isField: true});
            const key = this.getNameOnly(target, tsw.Identifier);
            this.doc.items.push(new tsw.DotCall(NativeType, 'definePointedProperty', [
                parent,
                new tsw.Constant(propertyToName(tsw.Identifier, key).name),
                new tsw.DotCall(tsw.dots(dll, 'current'), 'add', [tsw.constVal(item.address)]),
                type
            ]));
        }
    }

    writeAssign(field:IdField):void {
        try {
            const target = field.base.removeTemplateParameters();
            if (COMMENT_SYMBOL) this.doc.comment(field.base.source);
            const overloads = field.overloads;
            if (overloads == null || overloads.length === 0) {
                this._writeImplements(target, field.base);
            } else if (overloads.length === 1) {
                this._writeImplements(target, overloads[0]);
            } else {
                const OverloadedFunction = this.imports.importName(imports.complextype, 'OverloadedFunction', tsw.Identifier);

                const comments:string[] = [];
                let call = new tsw.DotCall(OverloadedFunction, 'make', []);
                for (const overload of overloads) {
                    if (COMMENT_SYMBOL) comments.push(`${overload.source}`);
                    try {
                        call = new tsw.DotCall(call, 'overload', this.makeFuncParams(overload));
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) throw err;
                        comments.push(`ignored: ${err.message}`);
                    }
                }
                const targetName = this.getName(target, tsw.Identifier, {assignee: true});
                this.doc.assign(targetName, call);
                for (const comment of comments) {
                    this.doc.comment(comment);
                }
            }
        } catch (err) {
            if (err instanceof IgnoreThis) {
                this.doc.comment(`ignored: ${err.message}`);
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

class TsFileDeclaration extends TsFile {
    private readonly implements:[(item:Identifier)=>boolean, TsFileImplement][];
    private readonly ids:Identifier[];
    public readonly idsMap = new Set<Identifier>();
    private readonly nameMaker = (item:PdbIdentifier):tsw.Type=>this.toTsw(item, tsw.Type);

    public currentNs:Identifier = PdbIdentifier.global;
    public currentBlock:tsw.Block|tsw.Class;

    public static readonly all:TsFileDeclaration[] = [];

    constructor(
        path:string,
        ...filters:Filter[]) {
        super(path);
        this.implements = [[retTrue, new TsFileImplement(path)]];
        this.ids = getFiltered(filters);
        this.ids.sort();
        for (const id of this.ids) {
            if (id.host !== undefined) continue;
            id.host = this;
        }
        TsFileDeclaration.all.push(this);
    }

    insideOf(namespace:Identifier):boolean {
        return namespace === this.currentNs;
    }

    *enterNamespace(item:Identifier):IterableIterator<void> {
        if (!(this.currentBlock instanceof tsw.Block)) throw Error(`${this.currentBlock} is not namespace`);
        const name = this.getNameOnly(item, tsw.Identifier);

        const ns = new tsw.Namespace(propertyToName(tsw.Identifier, name).name);
        this.currentBlock.items.push(new tsw.Export(ns));

        const oldblock = this.currentBlock;
        this.currentBlock = ns.block;
        const oldns = this.currentNs;
        this.currentNs = item;
        yield;
        this.currentNs = oldns;
        this.currentBlock = oldblock;
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
        if (!(this.currentBlock instanceof tsw.Block)) {
            throw Error(`${this.currentBlock} is not block`);
        }

        try {
            const ori = item.redirectTo;
            if (ori === null) {
                console.error(`${item}: is not redirecting`);
                return;
            }
            const from = ori.redirectedFrom;
            ori.redirectedFrom = null;
            const type = this.toTsw(ori, tsw.Type);
            const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', tsw.Type);
            if (COMMENT_SYMBOL) this.currentBlock.comment(ori.source);
            this.currentBlock.items.push(this.getDeclaration(item, null, 'type'));
            const classType = new tsw.TemplateType(NativeClassType, [type]).and(new tsw.TypeOf(this.toTsw(ori.removeTemplateParameters(), tsw.Identifier)));
            this.currentBlock.items.push(this.getDeclaration(item, classType, 'let'));
            const impl = this.getImplementFile(item);
            if (COMMENT_SYMBOL) impl.doc.comment(ori.source);
            impl.doc.assign(impl.getName(item, tsw.Identifier, {assignee:true}), impl.toTsw(ori, tsw.Identifier));
            ori.redirectedFrom = from;
        } catch (err) {
            if (err instanceof IgnoreThis) {
                this.currentBlock.comment(`ignored: ${err.message}`);
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

            let addFunction:(name:tsw.Property, params:[string, tsw.Type][], returnType:tsw.Type)=>void;
            if (!insideOfClass) {
                prefix = 'export function ';
                addFunction = (name, params, returnType)=>{
                    if (!(this.currentBlock instanceof tsw.Block)) {
                        throw Error(`${this.currentBlock} is not block`);
                    }
                    this.currentBlock.items.push(new tsw.Export(new tsw.FunctionDecl(name, params, returnType)));
                };
            } else {
                if (isStatic) {
                    prefix += 'static ';
                }
                addFunction = (name, params, returnType)=>{
                    if (!(this.currentBlock instanceof tsw.Class)) {
                        throw Error(`${this.currentBlock} is not class`);
                    }
                    this.currentBlock.items.push(new tsw.MethodDecl(null, isStatic, name, params, returnType));
                };
            }
            const name = this.getNameOnly(field.base, tsw.Identifier);

            if (overloads.length === 1) {
                const item = overloads[0];
                if (item.returnType === null) {
                    if (item.functionParameters.length !== 0) console.error(`${item}: no has the return type but has the arguments types`);
                    const StaticPointer = this.imports.importName(imports.core, 'StaticPointer', tsw.Type);
                    if (COMMENT_SYMBOL) this.currentBlock.comment(`${item.source}`);
                    this.currentBlock.comment(`${prefix}${item.removeParameters().name}:${StaticPointer};`);
                } else {
                    const params = this.makeFuncDeclaration(item.functionParameters, item.parent!.templateBase !== null ? item.parent! : null).declaration;
                    if (COMMENT_SYMBOL) this.currentBlock.comment(item.source);
                    addFunction(name, params, this.toTsw(item.returnType, tsw.Type, {isParameter: true}));
                }
            } else {
                for (const over of overloads) {
                    try {
                        if (COMMENT_SYMBOL) this.currentBlock.comment(over.source);
                        const params = this.makeFuncDeclaration(over.functionParameters, over.parent!.templateBase !== null ? over.parent! : null).declaration;
                        addFunction(name, params, this.toTsw(over.returnType!, tsw.Type, {isParameter: true}));
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) {
                            console.error(`> Writing ${over} (symbolIndex=${over.symbolIndex})`);
                            throw err;
                        }
                        this.currentBlock.comment(`ignored: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.currentBlock.comment(`ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _writeField(item:Identifier):void {
        if (!(this.currentBlock instanceof tsw.Block)) {
            throw Error(`${this.currentBlock} is not block`);
        }
        try {
            if (COMMENT_SYMBOL) this.currentBlock.comment(item.source);
            if (item.returnType !== null) {
                const type = this.toTsw(item.returnType, tsw.Type, {isField: true});
                this.currentBlock.items.push(this.getDeclaration(item, type, 'let'));
            } else {
                const StaticPointer = this.imports.importName(imports.core, 'StaticPointer', tsw.Type);
                this.currentBlock.items.push(this.getDeclaration(item, StaticPointer, 'let'));
            }
            const impl = this.getImplementFile(item);
            impl.writeAssign(new IdField(item));
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.currentBlock.comment(`ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _getField(out:FieldInfo, item:Identifier):void {
        if (item.parent === null) {
            throw Error(`${item.name}: parent not found`);
        }
        if (!PdbIdentifier.filter(item)) return;
        if (item.isDecoed) return;
        if (item.isFunctionType) return;
        if (item.isNameBase) return;
        if (item.templateBase !== null) return; // class or function template
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
                if (!PdbIdentifier.filter(item)) continue;
                if (o.isTemplate && o.hasArrayParam()) continue;
                if (item.isTemplateFunctionBase) {
                    if (o.functionParameters.some(arg=>arg.getArraySize() !== null)) {
                        continue;
                    }
                }
                if (!o.functionParameters.every(PdbIdentifier.filter)) {
                    continue;
                }
                if (!PdbIdentifier.filter(o.parent!)) {
                    continue;
                }
                if (o.returnType !== null && !PdbIdentifier.filter(o.returnType)) {
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
        if (!(this.currentBlock instanceof tsw.Block)) {
            throw Error(`${this.currentBlock} is not block`);
        }
        try {
            const oldblock = this.currentBlock;
            let opened = false;

            const tinfo = TemplateInfo.from(item);
            if (tinfo.paramTypes.length !== 0) {

                if (COMMENT_SYMBOL) this.currentBlock.comment(item.source);
                const templateDecl =  tinfo.makeTemplateDecl(this.nameMaker);
                const clsname = this.getNameOnly(item, tsw.Identifier);
                const cls = new tsw.Class(clsname);
                cls.templates = templateDecl;
                cls.extends = this.imports.importName(imports.complextype, 'NativeTemplateClass', tsw.Identifier);
                this.currentBlock.export(cls);
                this.currentBlock = cls;
                opened = true;

                try {
                    const makeTemplateParams = tinfo.makeWrappedTemplateDecl(this.nameMaker);
                    const args = this.makeFuncDeclaration(tinfo.paramTypes.map(v=>new tsw.TypeName(v.name)));
                    const UnwrapType = this.imports.importName(imports.nativetype, 'UnwrapType', tsw.Type);
                    const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', tsw.Type);
                    const unwrapedType = tinfo.paramTypes.map(v=>new tsw.TemplateType(UnwrapType, [new tsw.TypeName(v.name)]));
                    const returnType = new tsw.TemplateType(NativeClassType, [
                        new tsw.TemplateType(propertyToName(tsw.Type, clsname), unwrapedType)
                    ]).and(new tsw.TypeOf(propertyToName(tsw.Identifier, clsname)));
                    const def = new tsw.MethodDef(null, true, new tsw.NameProperty('make'), args.declaration, returnType);
                    def.templates = makeTemplateParams;
                    def.block.items.push(new tsw.Return(new tsw.DotCall(new tsw.Name('super'), new tsw.NameProperty('make'), args.parameterNames)));
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.currentBlock.comment(`ignored: ${err.message}`);
                    } else {
                        throw err;
                    }
                }
            } else {
                if (item.isClassLike) {
                    if (item.isEnum) {
                        if (COMMENT_SYMBOL) this.currentBlock.comment(item.source);
                        const int32_t = this.imports.importName(imports.nativetype, 'int32_t', tsw.Identifier);
                        this.currentBlock.export(new tsw.VariableDef('const', [
                            [this.getNameOnly(item, tsw.Identifier), null, new tsw.DotCall(int32_t, new tsw.NameProperty('extends'), [])]
                        ]));
                    } else {
                        const NativeClass = this.imports.importName(imports.nativeclass, 'NativeClass', tsw.Identifier);
                        if (COMMENT_SYMBOL) this.currentBlock.comment(item.source);
                        const cls = new tsw.Class(this.getNameOnly(item, tsw.Identifier));
                        cls.extends = NativeClass;
                        this.currentBlock = cls;
                        opened = true;
                    }
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
                insideOfClass = false;
            }

            for (const _ of this.enterNamespace(item)) {
                if (!opened) {
                    for (const field of fields.member) {
                        try {
                            this.writeMembers(field);
                        } catch (err) {
                            if ((err instanceof IgnoreThis)) {
                                this.currentBlock.comment(`ignored: ${err.message}`);
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
                            this.currentBlock.comment(`ignored: ${err.message}`);
                        } else {
                            console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                            throw err;
                        }
                    }
                }
            }
            this.currentBlock = oldblock;
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.currentBlock.comment(`ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    writeMembers(field:IdField):void {
        const overloads = field.overloads;
        if (overloads.length !== 0) {
            // set default constructor
            if (this.currentBlock instanceof tsw.Class) {
                for (const overload of overloads) {
                    if (overload.functionParameters.length === 0 && overload.functionBase!.name === overload.parent!.name) {
                        const NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Identifier);
                        const method = new tsw.MethodDef(null, false, new tsw.BracketProperty(tsw.dots(NativeType, 'ctor')), [], null);
                        method.block.items.push(new tsw.Return(new tsw.DotCall(new tsw.Name('this'), new tsw.NameProperty('__constructor'), [])));
                        this.currentBlock.items.push(method);
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
                    this.currentBlock.comment(`ignored: ${err.message}`);
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
                        this.currentBlock.comment(`ignored: ${err.message}`);
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
                        this.currentBlock.comment(`ignored: ${err.message}`);
                        continue;
                    }
                    console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                    throw err;
                }
            }

            this.save(this.path+'.d.ts');

            tsw.opts.writeJS = true;
            for (const [filter, impl] of this.implements) {
                impl.save(impl.path+'.js');
            }
            tsw.opts.writeJS = false;
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
setBasicType('__int64', 'bin64_t', 'i', imports.nativetype, true);
setBasicType('__int64 unsigned', 'bin64_t', 'u', imports.nativetype, true);
setBasicType('void*', 'VoidPointer', 'p', imports.core, true);
setBasicType('void const*', 'VoidPointer', 'p', imports.core, true);
setBasicType('std::nullptr_t', 'nullptr_t', 'v', imports.nativetype);
const typename_t = setBasicType('typename', 'Type', 't', imports.nativetype);
const any_t = setBasicType('any', 'any', 'v', null);
setBasicType(any_t.decorate('[]'), 'any[]', 'args', null);
setBasicType('never', 'never', 'v', null);
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

for (const item of PdbIdentifier.global.loopAll()) {
    if (item.isTemplate) {
        TemplateInfo.reduceTemplateType(item);
    }
}

// new TsFileDeclaration('./raknet', 'RakNet');
// const stdfile = new TsFileDeclaration('./std', 'std',
//     'strchr', 'strcmp', 'strcspn', 'strerror_s', 'strncmp', 'strncpy', 'strrchr',
//     'strspn', 'strstart', 'strstr', 'strtol', 'strtoul', 'wcsstr', '_stricmp',
//     'tan', 'tanh', 'cos', 'cosf', 'cosh', 'sin', 'sinf', 'sinh', 'log', 'log10', 'log1p', 'log2', 'logf', 'fabs',
//     'asin', 'asinf', 'asinh', 'atan2f', 'powf', 'fmod', 'fmodf', 'atan', 'atan2', 'atanf', 'atanh',
//     'fclose', 'feof', 'ferror', 'fgets', 'fflush', 'fopen', 'ftell', 'fwrite',
//     'terminate', 'sscanf', 'sprintf_s', 'printf', 'atexit',
//     'snprintf', 'sprintf',
//     'memcpy', 'memmove', 'operator delete[]', 'operator new[]',
//     'free', 'malloc', '_aligned_malloc', 'delete', 'delete[]', 'delete[](void * __ptr64)', 'delete[](void * __ptr64,unsigned __int64)');
// stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'vector'), './std_vector_impl');
// stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'unique_ptr') || item.checkBase(PdbIdentifier.std, 'make_unique'), './std_unique_ptr_impl');
// stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'shared_ptr'), './std_shared_ptr_impl');
// // stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'allocator'), './std_allocator_impl');
// stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'function'), './std_function_impl');
// stdfile.addImplementFile(item=>item.checkBase(PdbIdentifier.std, 'list'), './std_list_impl');

// new TsFileDeclaration('./socket',
//     'sockaddr_in', 'sockaddr_in6', '');
// new TsFileDeclaration('./zlib',
//     'comp_zlib_cleanup_int', 'compressBound',
//     /^unz/, /^zip/, /^zc/, /^zlib_/, 'z_errmsg', /^deflate/, /^_tr_/);
// new TsFileDeclaration('./quickjs', /^js_/, /^JS_/, /^lre_/, /^string_/, /^dbuf_/);
// new TsFileDeclaration('./openssl',
//     'err_free_strings_int',
//     /^EVP_/, /^OPENSSL_/, /^OSSL_/, /^RSA_/, /^SEED_/,
//     /^SHA1/, /^SHA224/, /^SHA256/, /^SHA384/, /^SHA3/, /^SHA512/,
//     /^X509/, /^X509V3/, /^X448/, /^X25519/, /^XXH64/, /^curve448_/, /^openssl_/, /^rand_/,
//     /^d2i_/, /^ec_/, /^i2a_/, /^hmac_/, /^i2c_/, /^i2d_/, /^i2o_/, /^i2s_/, /^i2t_/, /^i2v_/, /^o2i_/, /^v3_/, /^v2i_/,
//     /^x448_/, /^x509_/, /^ecdh_/, /^dsa_/, /_meth$/, /^CMS_/, /^CRYPTO_/, /^AES_/, /^ASN1_/, /^sha512_/, /^sm2_/, /^sm3_/,
//     /^rsa_/, /^ripemd160_/, /^ossl_/, /^md5_/, /^int_rsa_/, /^gf_/, /^evp_/, /^cr_/, /^cms_/, /^c448_/, /^c2i_/, /^bn_/,
//     /^asn1_/, /^aria_/, /^a2i_/, /^a2d_/, /^ERR_/, /^EC_/, /^BN_/, /^BIO_/);
// new TsFileDeclaration('./rapidjson', 'rapidjson');
// new TsFileDeclaration('./gsl', 'gsl');
// new TsFileDeclaration('./glm', 'glm');
// new TsFileDeclaration('./gltf', 'glTF');
// new TsFileDeclaration('./leveldb', 'leveldb');
// new TsFileDeclaration('./entt', 'entt');
// new TsFileDeclaration('./json', 'Json', /^Json/);
// new TsFileDeclaration('./chakra', /^Js[A-Z]/);
// new TsFileDeclaration('./gametest', 'gametest');
// new TsFileDeclaration('./minecraft_bedrock', 'Bedrock');
// new TsFileDeclaration('./minecraft_scripting', 'Scripting');
// new TsFileDeclaration('./minecraft_crypto', 'Crypto');
// new TsFileDeclaration('./minecraft_core', 'Core');
// new TsFileDeclaration('./minecraft_goal', /Goal$/);
// new TsFileDeclaration('./minecraft_events', /Event$/);
// new TsFileDeclaration('./minecraft_handler', /Handler$/);
// new TsFileDeclaration('./minecraft_trigger', /Trigger$/);
// new TsFileDeclaration('./minecraft_listener', /Listener$/);
// new TsFileDeclaration('./minecraft_component', /Component$/);
// new TsFileDeclaration('./minecraft_enchant', /Enchant$/);
// new TsFileDeclaration('./minecraft_packet', /Packet$/, 'make_packet');
// new TsFileDeclaration('./minecraft_test', /Test$/);
// new TsFileDeclaration('./minecraft_structure', item=>{
//     if (item.name.endsWith('Room')) return true;
//     const funcbase = item.children.get('getType');
//     if (funcbase == null) return false;
//     const func = funcbase.overloads[0];
//     if (func == null) return false;
//     if (func.returnType == null) return false;
//     const returnType = func.returnType.name;
//     return returnType === 'StructureFeatureType' || returnType === 'StructurePieceType';
// });
// new TsFileDeclaration('./minecraft_item', 'WeakPtr', item=>item.children.has('buildDescriptionId') ||
//                                                 item.children.has('getSilkTouchItemInstance') ||
//                                                 item.children.has('asItemInstance') ||
//                                                 item.children.has('getResourceItem') ||
//                                                 item.children.has('getPlacementBlock') ||
//                                                 item.children.has('isGlint') ||
//                                                 item.children.has('onPlace') ||
//                                                 item.children.has('playerDestroy') ||
//                                                 item.children.has('isWaterBlocking') ||
//                                                 item.name.endsWith('Item') || item.name.endsWith('Block'));
// new TsFileDeclaration('./minecraft_actor', item=>item.children.has('aiStep') ||
//                                                 item.children.has('checkSpawnRules') ||
//                                                 item.children.has('reloadHardcoded') ||
//                                                 item.children.has('reloadHardcodedClient') ||
//                                                 item.children.has('useNewAi') ||
//                                                 item.children.has('die') ||
//                                                 item.name.endsWith('Actor'));
// new TsFileDeclaration('./minecraft_def', /^Definition/, /Definition$/);
// new TsFileDeclaration('./minecraft_command', /Command/);
// new TsFileDeclaration('./minecraft_attribute', /Attribute/);
// new TsFileDeclaration('./minecraft_script', /Script/);
// new TsFileDeclaration('./minecraft_filter', /Filter/);
// new TsFileDeclaration('./minecraft_world', /World/);
// new TsFileDeclaration('./minecraft_chunk', /Chunk/);
// new TsFileDeclaration('./minecraft_file', /Directory/, /File/);

new TsFileDeclaration('./minecraft', ()=>true);

for (const file of fs.readdirSync(outpath)) {
    try {
        fs.unlinkSync(path.join(outpath, file));
    } catch (err) {
        console.error(`${file}: ${err.message}`);
    }
}
for (const file of TsFileDeclaration.all) {
    file.writeAll();
}
console.log(`global id count: ${PdbIdentifier.global.children.size}`);
