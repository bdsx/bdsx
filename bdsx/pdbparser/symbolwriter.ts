import { emptyFunc, unreachable } from "../common";
import { styling } from "../externs/bds-scripting/styling";
import { remapAndPrintError } from "../source-map-support";
import { arrayEquals } from "../util";
import { imageSections } from "./imagesections";
import { DecoSymbol, PdbIdentifier } from "./symbolparser";
import { TemplateInfo } from "./templateinfo";
import { ImportInfo, TsFile } from "./tsimport";
import { tsw } from "./tswriter";
import fs = require('fs');
import path = require('path');


const outDir = path.join(__dirname, '..');
const COMMENT_SYMBOL = false;


const properties = {
    overloadInfo: new tsw.NameProperty('overloadInfo'),
    this: new tsw.NameProperty('this'),
    add: new tsw.NameProperty('add'),
    overloads: new tsw.NameProperty('overloads'),
    definePointedProperty: new tsw.NameProperty('definePointedProperty'),
    make: new tsw.NameProperty('make'),
    get: new tsw.NameProperty('get'),
    ref: new tsw.NameProperty('ref'),
    constructWith:new tsw.NameProperty('constructWith'),
};

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
specialNameRemap.set('construct', 'construct_');
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

const adjustorRegExp = /^(.+)`adjustor{([0-9]+)}'$/;
const idremap:Record<string, string> = {'{':'','}':'',',':'_','<':'_','>':'_'};
const recursiveCheck = new Set<Identifier>();

interface Identifier extends PdbIdentifier {
    host?:TsFile|null;
    jsTypeName?:string;
    jsTypeNullable?:boolean;
    paramVarName?:string;
    isOverloaded?:boolean;
    filted?:boolean;
    keyIndex?:number;
    tswVar?:tsw.Name;
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
    if ((item.isFunctionBase || item.isTemplateFunctionBase || item.isFunction || item.isClassLike) && item.parent === PdbIdentifier.std && item.name.startsWith('_')) {
        return item.filted = false;
    }
    if (item.name === "`anonymous namespace'") return item.filted = false;
    if (item.name.startsWith('<unnamed-type-')) return item.filted = false;
    if (item.keyIndex != null) return item.filted = false;
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
    }
    for (const comp of item.components()) {
        if (!PdbIdentifier.filter(comp)) return item.filted = false;
    }

    return item.filted = true;
};

function setBasicType(name:string|PdbIdentifier, jsTypeName:string, paramVarName:string, host:TsFile|null, jsTypeNullable?:boolean):Identifier {
    const item:Identifier = name instanceof PdbIdentifier ? name : PdbIdentifier.parse(name);
    item.isBasicType = true;
    item.host = host;
    item.jsTypeName = jsTypeName;
    item.paramVarName = paramVarName;
    if (jsTypeNullable != null) item.jsTypeNullable = jsTypeNullable;
    return item;
}

function nullableType(out:tsw.IdBase):tsw.TypeOr {
    if (!(out instanceof tsw.Type)) throw Error(`nullable but not type (${out})`);
    return out.or(tsw.TypeName.null);
}
class TsFileExtern extends TsFile {

}

const imports = {
    nativetype: new TsFileExtern('./nativetype'),
    complextype: new TsFileExtern('./complextype'),
    dnf: new TsFileExtern('./dnf'),
    nativeclass: new TsFileExtern('./nativeclass'),
    makefunc: new TsFileExtern('./makefunc'),
    dll: new TsFileExtern('./dll'),
    core: new TsFileExtern('./core'),
    common: new TsFileExtern('./common'),
    pointer: new TsFileExtern('./pointer'),
};

enum FieldType {
    Member,
    Static,
    InNamespace,
}

function getFieldType(item:Identifier):FieldType {
    if (item.isStatic) {
        return FieldType.Static;
    }
    if (item.isFunctionBase || item.isTemplateFunctionBase || item.isFunction) {
        return FieldType.Member;
    }
    return FieldType.InNamespace;
}

class TsCode {
    public readonly doc = new tsw.Block;
    public readonly imports:ImportInfo;

    constructor(public readonly base:MinecraftTsFile) {
        this.imports = this.base.imports;
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
        let basename = this.getNameOnly(baseid, tsw.Identifier, {noImport: true}).toName(tsw.Identifier).name;
        if (basename.endsWith('_t')) basename = basename.substr(0, basename.length-2);
        basename = styling.toCamelStyle(basename, /[[\] :*]/g, false);
        return basename;
    }

    insideOf(namespace:Identifier):boolean {
        return false;
    }

    isClassMethod(id:Identifier):boolean {
        return !id.isType && id.parent!.isClassLike && !id.isStatic;
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
        if (item.parent !== null && item.parent !== PdbIdentifier.global) {
            name = this.getIdName(item.parent) + '_' + name;
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
        if (item.keyIndex != null) {
            throw new IgnoreThis(`temporal key (${item})`);
        }

        let name = item.removeParameters().name;
        if (item.isConstructor) {
            return properties.constructWith;
        } else {
            if (item.isDestructor) {
                const NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Identifier);
                return new tsw.BracketProperty(NativeType.member('dtor'));
            }
        }

        const remapped = specialNameRemap.get(name);
        let matched:RegExpMatchArray|null;
        if (remapped != null) {
            name = remapped;
        } else if (name.startsWith('`')) {
            if (name.startsWith("`vector deleting destructor'")) {
                name = '__vector_deleting_destructor_'+item.adjustors.join('_');
            } else if (name.startsWith("`vftable'")) {
                name = '__vftable_for_'+item.adjustors.map(id=>this.getIdName(id)).join('_');
            } else if (name.startsWith("`vbtable'")) {
                name = '__vbtable_for_'+item.adjustors.map(id=>this.getIdName(id)).join('_');
            } else if (name.startsWith("`vcall'")) {
                name = '__vcall_'+item.adjustors.map(id=>this.getIdName(id)).join('_');
            } else {
                name = '__'+name.replace(/[`' ()\-,0-9]/g, '');
                // name = '__'+name.replace(/[`' ()-,0-9]/g, '')+'_'+item.adjustors.join('_').replace(/-/g, 'minus_');
            }
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
                const imported = this.imports.importName(item.host, name, kind);
                if (!(imported instanceof tsw.Name) && !(imported instanceof tsw.TypeName)) {
                    throw Error(`${imported} is not name`);
                }
                return imported.toProperty();
            }
        }
        return new tsw.NameProperty(name);
    }

    defineType(item:Identifier, type:tsw.Type):tsw.BlockItem {
        const name = this.getNameOnly(item, tsw.Identifier);
        return new tsw.Export(new tsw.TypeDef(name.toName(tsw.Type), type));
    }

    defineVariable(item:Identifier, type:tsw.Type|null, define:'const'|'let', initial?:tsw.Identifier):tsw.BlockItem {
        const name = this.getNameOnly(item, tsw.Identifier);
        const exported = new tsw.Export(new tsw.VariableDef(define, [new tsw.VariableDefineItem(name.toName(tsw.Identifier), type, initial)]));
        if (initial == null) exported.writeJS = emptyFunc;
        return exported;
    }

    getClassDeclaration(item:Identifier, type:tsw.Type|null, isReadonly:boolean, isStatic:boolean):tsw.ClassItem {
        const name = this.getNameOnly(item, tsw.Identifier);
        return new tsw.ClassField(null, isStatic, isReadonly, name, type);
    }

    getName<T extends tsw.Kind>(item:Identifier, kind:T, opts:{insideOfClass?:boolean, isStatic?:boolean, assignee?:boolean} = {}):tsw.KindToItem<T> {
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
                if (tsw.isIdentifier(kind)) {
                    if (item.host !== this.base) {
                        result = this.imports.importDirect(item, item.host, kind);
                    } else {
                        result = tsw.Name.exports as any;
                    }
                } else {
                    throw Error('assignnee but not identifier');
                }
            }
        } else {
            result = this.toTsw(item.parent, kind);
            if (opts.insideOfClass && !opts.isStatic && !item.isType && tsw.isType(kind) && item.parent.isClassLike && (item.isFunction || item.isFunctionBase || item.isTemplateFunctionBase)) {
                result = result.member(tsw.NameProperty.prototypeName);
            }
        }

        const prop = this.getNameOnly(item, kind);
        return (result !== null) ? result.member(prop) : prop.toName(kind);
    }

    makeFuncDeclaration(isStaticMethod:boolean, args:(Identifier|tsw.TypeName)[], thisType?:Identifier|tsw.Type|null):{declaration:tsw.DefineItem[], parameterNames:tsw.Name[]} {
        const names = new Map<string, {index:number, counter:number}>();
        const declaration:tsw.DefineItem[] = [];
        const varNames:string[] = [];
        const parameters:tsw.Name[] = [];
        for (let i=0;i<args.length;i++) {
            const type = args[i];
            let basename:string;
            if (type instanceof PdbIdentifier) basename = this._getVarName(type);
            else basename = 'arg'+i;

            let name = basename;
            const info = names.get(name);
            if (info == null) {
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
        for (let i=0;i<varNames.length;i++) {
            let type:tsw.Type|PdbIdentifier = args[i];
            if (type instanceof PdbIdentifier) {
                type = this.toTsw(type, tsw.Type, {isParameter: true, nullable: true});
            }
            const name = new tsw.Name(varNames[i]);
            declaration[i] = new tsw.VariableDefineItem(name, type);
            parameters[i] = name;
        }
        if (thisType != null) {
            let type:tsw.Type;
            if (isStaticMethod) {
                const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', tsw.Type);
                thisType = thisType instanceof tsw.Type ? thisType : this.toTsw(thisType, tsw.Type, {isParameter: true});
                type = new tsw.TemplateType(NativeClassType, [thisType]);
            } else {
                thisType = thisType instanceof tsw.Type ? thisType : this.toTsw(thisType, tsw.Type, {isParameter: true, nullable: true, noJsType: true});
            }
            declaration.unshift(new tsw.VariableDefineItem(tsw.Name.this, thisType));
        }
        return {
            declaration,
            parameterNames: parameters
        };
    }

    makeFuncParams_params(item:Identifier[]):tsw.Identifier[]{
        return item.map(id=>this.toTsw(id, tsw.Identifier, {isParameter: true}));
    }

    getThisType<T extends tsw.Kind>(item:Identifier, kind:T):tsw.KindToItem<T> {
        if (this.isClassMethod(item)) {
            return this.toTsw(item.parent!, kind, {isParameter: true});
        } else {
            return (tsw.isIdentifier(kind) ? tsw.Constant.null : tsw.TypeName.null) as any;
        }
    }

    makefuncParams_return(item:Identifier):tsw.Identifier {
        if (item.returnType === null) {
            throw Error(`${item}: function but no return type`);
        }
        return this.toTsw(item.returnType, tsw.Identifier, {isParameter: true});
    }

    writeDnfOverload(item:Identifier):void {
        const thistype = this.getThisType(item, tsw.Identifier);

        const parameterTypes = this.makeFuncParams_params(item.functionParameters);
        const returnType = this.makefuncParams_return(item);
        let opts:tsw.Identifier;
        if (thistype !== null) {
            opts = new tsw.ObjectDef([
                [properties.this, thistype]
            ]);
        } else {
            opts = tsw.Constant.null;
        }
        const params:tsw.Identifier[] = [
            new tsw.Constant(item.address),
            new tsw.ArrayDef(parameterTypes),
            returnType,
            opts
        ];

        if (item.templateBase !== null) {
            const templates = item.templateParameters.map(t=>this.toTsw(t, tsw.Identifier));
            params.push(new tsw.ArrayDef(templates));
        }

        const varid = this.base.getOverloadVarId(item);
        this.doc.assign(varid.member(properties.overloadInfo), new tsw.ArrayDef(params));
    }

    toTswArgs<T extends tsw.Kind>(args:(Identifier[]|Identifier)[], kind:T):tsw.KindToItem<T>[] {
        return args.map((id):tsw.KindToItem<T>=>{
            if (id instanceof Array) {
                if (tsw.isIdentifier(kind)) {
                    const templateArgs = this.imports.importName(imports.nativetype, 'templateArgs', tsw.Identifier);
                    return new tsw.Call(templateArgs, id.map(id=>this.toTsw(id, kind))) as tsw.KindToItem<T>;
                } else if (tsw.isType(kind)) {
                    return new tsw.Tuple(id.map(id=>this.toTsw(id, tsw.Type))) as tsw.KindToItem<T>;
                } else {
                    throw Error(`unreachable`);
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
                if (item.deco === DecoSymbol.const) return this.toTsw(item.decoedFrom, kind, opts);
                if (item.deco !== null && item.deco.name === '[0]') throw new IgnoreThis(`incomprehensible syntax(${item})`);
            }
            if (item.unionedTypes !== null) {
                if (!tsw.isType(kind)) throw Error(`union is not type (${item})`);

                const nopts = {...opts};
                nopts.nullable = false;
                const types:tsw.Type[] = [];
                let ignored:IgnoreThis|null = null;
                for (const union of item.unionedTypes) {
                    try {
                        const type = this.toTsw(union, tsw.Type, nopts);
                        types.push(type);
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) throw err;
                        ignored = err;
                    }
                }
                if (types.length === 0) {
                    throw ignored || new IgnoreThis('No types');
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
                    out = nullableType(out) as tsw.KindToItem<T>;
                }
                return out;
            }
            if (item.decoedFrom !== null) {
                if (item.deco === DecoSymbol['*'] || item.deco === DecoSymbol['&'] || item.deco === DecoSymbol['&&']) {
                    let out:tsw.IdBase = this.toTsw(item.decoedFrom, kind);
                    if (item.isValue) {
                        if (item.decoedFrom.address === 0) {
                            console.error(`${item.source}: address not found`);
                            throw new IgnoreThis(`address not found (${item})`);
                        }
                        if (tsw.isType(kind)) {
                            out = this.toTsw(item.getTypeOfIt(), kind);
                        }
                        if (opts.nullable) {
                            out = nullableType(out);
                        }
                        return out as tsw.KindToItem<T>;
                    }
                    if (item.decoedFrom.isMemberPointer) {
                        if (opts.nullable) {
                            out = nullableType(out);
                        }
                        return out as tsw.KindToItem<T>;
                    }

                    if (out instanceof tsw.Type) {
                        if (!opts.isField && !opts.isParameter) {
                            const Wrapper = this.imports.importName(imports.pointer, 'Wrapper', tsw.Type);
                            out = new tsw.TemplateType(Wrapper, [out as tsw.Type]);
                        }
                        if (opts.nullable) {
                            out = nullableType(out);
                        }
                        return out as tsw.KindToItem<T>;
                    } else if (out instanceof tsw.Identifier) {
                        if (!opts.isParameter) {
                            out = out.call(properties.ref, []);
                            if (!opts.isField) {
                                const Wrapper = this.base.importWrapper();
                                out = Wrapper.call(properties.make, [out as tsw.Identifier]);
                            }
                        }
                        return out as tsw.KindToItem<T>;
                    }
                }
            }

            let out:tsw.KindToItem<T>|null = null;
            if (item.templateBase !== null) {
                const nopts = {...opts};
                nopts.nullable = false;
                nopts.noTemplate = true;
                out = this.toTsw(item.templateBase, kind, nopts);
            } else if (item.isMemberPointer) {
                const base = this.toTsw(item.memberPointerBase!, kind);
                const type = this.toTsw(item.returnType!, kind);
                const MemberPointer = this.imports.importName(imports.complextype, 'MemberPointer', kind);
                if (MemberPointer instanceof tsw.Type) {
                    let out:tsw.Type = new tsw.TemplateType(MemberPointer, [base as tsw.Type, type as tsw.Type]);
                    if (opts.nullable) {
                        out = nullableType(out);
                    }
                    return out as tsw.KindToItem<T>;
                } else if (MemberPointer instanceof tsw.Identifier) {
                    const out = MemberPointer.call(properties.make, [base as tsw.Identifier, type as tsw.Identifier]);
                    return out as tsw.KindToItem<T>;
                } else {
                    unreachable();
                }
            } else if (item.isFunctionType) {
                if (tsw.isType(kind)) {
                    const params = this.makeFuncDeclaration(false, item.functionParameters).declaration;
                    const returnType = this.toTsw(item.returnType!, tsw.Type, {isParameter: true});
                    let out:tsw.Type = new tsw.FunctionType(returnType, params);
                    if (opts.nullable) {
                        out = nullableType(out);
                    }
                    return out as tsw.KindToItem<T>;
                }  else if (tsw.isIdentifier(kind)) {
                    const NativeFunctionType = this.imports.importName(imports.complextype, 'NativeFunctionType', kind);
                    const out = NativeFunctionType.call(properties.make, [
                        this.toTsw(item.returnType!, kind, {isParameter: true}),
                        tsw.Constant.null,
                        ...item.functionParameters.map(id=>this.toTsw(id, kind, {isParameter: true}))
                    ]);
                    return out as tsw.KindToItem<T>;
                } else {
                    unreachable();
                }
            } else {
                if (item.hasNonGlobalParent() && !this.insideOf(item.parent)) {
                    out = this.toTsw(item.parent, kind, {noTemplate: true});
                    if (!item.isStatic && !item.isType && tsw.isIdentifier(kind) && item.parent.isClassLike && (item.isFunction || item.isFunctionBase || item.isTemplateFunctionBase)) {
                        out = out.member(tsw.NameProperty.prototypeName);
                    }
                    out = out.member(this.getNameOnly(item, kind));
                } else {
                    const prop = this.getNameOnly(item, kind);
                    out = prop.toName(kind);
                }

                if (item.isOverloaded) {
                    if (!(out instanceof tsw.Identifier)) throw Error(`is not value (${item})`);

                    const params = this.makeFuncParams_params(item.functionParameters);
                    const thisType = this.getThisType(item, tsw.Identifier);
                    const args:tsw.Identifier[] = [out, thisType, new tsw.ArrayDef(params)];
                    if (item.templateBase !== null) {
                        const typebases = item.templateParameters.map(t=>t.getTypeOfIt());
                        const ids = typebases.map(t=>this.toTsw(t, tsw.Identifier));
                        args.push(new tsw.ArrayDef(ids));
                    }
                    const dnf = this.base.importDnf();
                    out = dnf.call(properties.get, args) as tsw.KindToItem<T>;
                }
            }

            if (opts.noTemplate) {
                return out;
            }

            const tinfo = TemplateInfo.from(item);
            if (tinfo.parameters.length !== 0) {
                const base = item.functionBase;
                if (base !== null) {
                    if (out instanceof tsw.Type) {
                        const thisType = this.getThisType(item, tsw.Type);
                        const retType = this.toTsw(item.returnType!, tsw.Type);
                        const paramTypes = this.makeFuncDeclaration(item.isStatic, item.functionParameters, thisType);
                        return new tsw.FunctionType(retType, paramTypes.declaration) as any;
                    } else if (out instanceof tsw.Identifier) {
                        return this.base.getOverloadVarId(item) as any;
                    } else {
                        unreachable();
                    }
                } else {
                    const params = this.toTswArgs(tinfo.parameters, kind);
                    if (out instanceof tsw.Type) {
                        return new tsw.TemplateType(out, params as any[]) as any;
                    } else if (out instanceof tsw.Identifier) {
                        return new tsw.DotCall(out, properties.make, params as any[]) as any;
                    } else {
                        unreachable();
                    }
                }
            }
            if (opts.nullable) {
                out = nullableType(out) as tsw.KindToItem<T>;
            }
            return out;
        } finally {
            recursiveCheck.delete(item);
        }
    }
}

class TsCodeDeclaration extends TsCode {
    public readonly idsMap = new Set<Identifier>();
    private readonly nameMaker = (item:PdbIdentifier):tsw.Type=>this.toTsw(item, tsw.Type);
    public readonly defs = new tsw.VariableDef('const', []);

    public currentNs:Identifier = PdbIdentifier.global;
    public currentBlock:tsw.Block = this.doc;
    public currentClass:tsw.Class|null = null;

    public readonly implementation:TsCode;

    constructor(
        public readonly base:MinecraftTsFile,
        private readonly ids:Identifier[]
    ) {
        super(base);
        this.implementation = new TsCode(base);
        this.doc.write(this.defs);
        this.ids.sort();
        for (const id of this.ids) {
            if (id.host !== undefined) continue;
            id.host = base;
        }
    }

    existName(name:string):boolean {
        const item:Identifier|null = PdbIdentifier.global.findChild(name);
        if (item == null) return false;
        return item.host === this.base;
    }

    existNameInScope(name:string):boolean {
        let ns = this.currentNs;
        while (ns !== PdbIdentifier.global) {
            const item:Identifier|null = ns.findChild(name);
            if (item != null) return true;
            ns = ns.parent!;
        }
        const item:Identifier|null = PdbIdentifier.global.findChild(name);
        if (item == null) return false;
        return item.host === this.base;
    }

    insideOf(namespace:Identifier):boolean {
        return namespace === this.currentNs;
    }

    *enterNamespace(item:Identifier):IterableIterator<void> {
        if (!(this.currentBlock instanceof tsw.Block)) throw Error(`${this.currentBlock} is not namespace`);
        const prop = this.getNameOnly(item, tsw.Identifier);

        const ns = new tsw.Namespace(prop.toName(tsw.Identifier));

        const oldblock = this.currentBlock;
        const oldclass = this.currentClass;
        const oldns = this.currentNs;
        this.currentBlock = ns.block;
        this.currentClass = null;
        this.currentNs = item;
        try {
            yield;
        } catch (err) {
            remapAndPrintError(err);
        }
        this.currentNs = oldns;
        this.currentClass = oldclass;
        this.currentBlock = oldblock;
        if (ns.block.size() !== 0) {
            this.currentBlock.write(new tsw.Export(ns));
        }
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
            if (COMMENT_SYMBOL) this.currentBlock.comment(ori.symbolIndex+': '+ori.source);
            this.currentBlock.write(this.defineType(item, type));
            const classType = new tsw.TemplateType(NativeClassType, [type]).and(new tsw.TypeOf(this.toTsw(ori.removeTemplateParameters(), tsw.Identifier)));
            this.currentBlock.write(this.defineVariable(item, classType, 'const', this.toTsw(ori, tsw.Identifier)));
            ori.redirectedFrom = from;
        } catch (err) {
            if (err instanceof IgnoreThis) {
                this.currentBlock.comment(`ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _writeOverloads(field:IdField, insideOfClass:boolean):void {
        try {
            const impl = this.implementation;
            const overloads = field.overloads;
            if (overloads.length === 0) {
                throw Error(`empty overloads`);
            }
            if (!insideOfClass && field.isStatic) {
                throw Error(`${overloads[0]}: is static but not in the class`);
            }

            const target = field.base.removeTemplateParameters();
            const name = this.getNameOnly(field.base, tsw.Identifier);
            const funcdef = this.base.getFunctionVarId(target);
            if (this.currentClass !== null) {
                this.currentBlock.assign(this.currentClass.name.member(tsw.NameProperty.prototypeName).member(name), funcdef);
            } else {
                const exported = this.currentBlock.export(new tsw.VariableDef('const', [
                    new tsw.VariableDefineItem(name.toName(tsw.Identifier), null, funcdef)
                ]));
                exported.cloneToDecl = ()=>null;
            }

            const scope = this.currentClass || this.currentBlock;

            if (overloads.length === 1) {
                // single overload
                const overload = overloads[0];
                if (overload.returnType === null) {
                    // no function type, use pointer
                    if (overload.functionParameters.length !== 0) console.error(`${overload}: no has the return type but has the arguments types`);
                    if (COMMENT_SYMBOL) this.currentBlock.comment(overload.symbolIndex+': '+overload.source);
                    this.currentBlock.const(name.toName(tsw.Identifier), null,
                        this.base.importDllCurrent().call(properties.add, [new tsw.Constant(overload.address)]));
                } else {
                    // typed function
                    const params = this.makeFuncDeclaration(
                        field.isStatic,
                        overload.functionParameters,
                        overload.parent!.templateBase !== null ? overload.parent! : null).declaration;
                    if (COMMENT_SYMBOL) this.currentBlock.comment(overload.symbolIndex+': '+overload.source);
                    const returnType = this.toTsw(overload.returnType, tsw.Type, {isParameter: true});
                    scope.addFunctionDecl(name, params, returnType, field.isStatic);
                    impl.writeDnfOverload(overload);
                }
            } else {
                // multiple overloads
                let previousParams:PdbIdentifier[]|null = null;
                let previousThis:PdbIdentifier|null = null;
                for (const overload of overloads) {
                    try {
                        if (COMMENT_SYMBOL) scope.comment(overload.symbolIndex+': '+overload.source);
                        const thisParam = overload.parent!.templateBase !== null ? overload.parent! : null;
                        const params = this.makeFuncDeclaration(field.isStatic, overload.functionParameters, thisParam).declaration;
                        const returnType = this.toTsw(overload.returnType!, tsw.Type, {isParameter: true});
                        if (previousParams === null || (
                            !arrayEquals(overload.functionParameters, previousParams) ||
                            previousThis !== thisParam
                        )) {
                            previousParams = overload.functionParameters;
                            previousThis = thisParam;
                            scope.addFunctionDecl(name, params, returnType, field.isStatic);
                        } else {
                            scope.comment(`dupplicated: ${name}(${params.join(', ')}):${returnType};`);
                        }
                        if (overload.templateBase !== null) {
                            const typeOfTemplates = overload.templateParameters.map(v=>v.getTypeOfIt());
                            let thisType:PdbIdentifier|null = null;
                            let stripThis = 0;
                            if (overload.parent!.templateBase !== null) {
                                thisType = overload.parent;
                                stripThis = 1;
                            }
                            const tparams = this.makeFuncDeclaration(field.isStatic, typeOfTemplates, thisType).declaration;
                            for (const param of tparams) {
                                if (param instanceof tsw.VariableDefineItem) {
                                    if (param.name === tsw.Name.this) continue;
                                    param.initial = tsw.OPTIONAL;
                                }
                            }
                            scope.addFunctionDecl(name, tparams, new tsw.FunctionType(returnType, tparams.slice(stripThis)), field.isStatic);
                        }
                        impl.writeDnfOverload(overload);
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) {
                            console.error(`> Writing ${overload} (symbolIndex=${overload.symbolIndex})`);
                            throw err;
                        }
                        scope.comment(`ignored: ${err.message}`);
                    }
                }
            }
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                (this.currentClass || this.currentBlock).comment(`ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _writeField(item:Identifier, isStatic:boolean):void {
        try {
            if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
            let type:tsw.Type;
            if (item.returnType !== null) {
                type = this.toTsw(item.returnType, tsw.Type, {isField: true});
            } else {
                type = this.imports.importName(imports.core, 'StaticPointer', tsw.Type);
            }
            if (this.currentClass !== null) {
                this.currentClass.write(this.getClassDeclaration(item, type, false, isStatic));
            } else {
                this.currentBlock.write(this.defineVariable(item, type, 'const'));
            }

            const impl = this.implementation;
            const target:Identifier = item.removeTemplateParameters();
            if (COMMENT_SYMBOL) impl.doc.comment(item.symbolIndex+': '+item.source);
            if (item.address === 0) {
                console.error(`${item}: address not found`);
                throw new IgnoreThis(`address not found (${item})`);
            }
            if (item.returnType === null) {
                const targetName = impl.getName(target, tsw.Identifier, {assignee: true});
                if (!item.isVFTable && item.functionParameters.length !== 0) console.error(`${item}: function but no return type`);
                impl.doc.assign(targetName, this.base.importDllCurrent().call(properties.add, [new tsw.Constant(item.address)]));
            } else {
                if (target.parent === null) {
                    throw Error(`${target}: has not parent`);
                }

                let parent:tsw.Identifier;
                if (target.parent === PdbIdentifier.global) {
                    parent = tsw.Name.exports;
                } else {
                    parent = impl.toTsw(target.parent, tsw.Identifier);
                }

                const NativeType = this.base.importNativeType();
                const type = impl.toTsw(item.returnType, tsw.Identifier, {isField: true});
                const prop = impl.getNameOnly(target, tsw.Identifier);
                impl.doc.write(NativeType.call(properties.definePointedProperty, [
                    parent,
                    new tsw.Constant(prop.toName(tsw.Identifier).name),
                    this.base.importDllCurrent().call(properties.add, [tsw.constVal(item.address)]),
                    type
                ]));
            }
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
                if (!PdbIdentifier.filter(o)) continue;
                if (o.isTemplate && o.hasArrayParam()) continue;
                if (item.isTemplateFunctionBase) {
                    if (o.functionParameters.some(arg=>arg.getArraySize() !== null)) {
                        continue;
                    }
                }
                if (!o.functionParameters.every(PdbIdentifier.filter)) {
                    continue;
                }
                if (o.parent !== null && !PdbIdentifier.filter(o.parent)) {
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
            let opened = false;

            const tinfo = TemplateInfo.from(item);
            if (tinfo.paramTypes.length !== 0) {

                if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
                const templateDecl =  tinfo.makeTemplateDecl(this.nameMaker);
                const clsname = this.getNameOnly(item, tsw.Identifier);
                const cls = new tsw.Class(clsname.toName(tsw.Identifier));
                cls.templates = templateDecl;
                cls.extends = this.imports.importName(imports.complextype, 'NativeTemplateClass', tsw.Identifier);
                this.currentBlock.export(cls);
                this.currentClass = cls;
                opened = true;

                try {
                    const makeTemplateParams = tinfo.makeWrappedTemplateDecl(this.nameMaker);
                    const args = this.makeFuncDeclaration(true, tinfo.paramTypes.map(v=>new tsw.TypeName(v.name)));

                    const unwrappedType:tsw.TemplateType[] = [];
                    const NativeClassType = this.imports.importName(imports.nativeclass, 'NativeClassType', tsw.Type);
                    if (tinfo.paramTypes.length !== 0) {
                        const UnwrapType = this.imports.importName(imports.nativetype, 'UnwrapType', tsw.Type);
                        for (const param of tinfo.paramTypes) {
                            unwrappedType.push(new tsw.TemplateType(UnwrapType, [new tsw.TypeName(param.name)]));
                        }
                    }
                    const returnType = new tsw.TemplateType(NativeClassType, [
                        new tsw.TemplateType(clsname.toName(tsw.Type), unwrappedType)
                    ]).and(new tsw.TypeOf(clsname.toName(tsw.Identifier)));
                    const def = new tsw.MethodDef(null, true, properties.make, args.declaration, returnType);
                    def.templates = makeTemplateParams;
                    def.block.write(new tsw.Return(new tsw.DotCall(tsw.Name.super, properties.make, args.parameterNames)));
                    this.currentClass.write(def);
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
                        if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
                        const NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Type);
                        const int32_t = this.imports.importName(imports.nativetype, 'int32_t', tsw.Identifier);
                        const int32_t_type = this.imports.importName(imports.nativetype, 'int32_t', tsw.Type);
                        const name = this.getNameOnly(item, tsw.Identifier);
                        this.currentBlock.export(new tsw.VariableDef('const', [
                            new tsw.VariableDefineItem(
                                name.toName(tsw.Identifier),
                                new tsw.TemplateType(NativeType, [int32_t_type]),
                                int32_t.call('extends', []))
                        ]));
                        this.currentBlock.export(new tsw.TypeDef(
                            name.toName(tsw.Type),
                            int32_t_type
                        ));
                    } else {
                        const NativeClass = this.imports.importName(imports.nativeclass, 'NativeClass', tsw.Identifier);
                        if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
                        const cls = new tsw.Class(this.getNameOnly(item, tsw.Identifier).toName(tsw.Identifier));
                        cls.extends = NativeClass;
                        this.currentBlock.export(cls);
                        this.currentClass = cls;
                        opened = true;
                    }
                }
            }

            const fields = this.getAllFields(item);
            if (opened) {
                for (const field of fields.staticMember) {
                    this.writeMembers(field, true);
                }
                for (const field of fields.member) {
                    this.writeMembers(field, true);
                }
            }

            this.currentClass = null;

            for (const _ of this.enterNamespace(item)) {
                if (!opened) {
                    for (const field of fields.member) {
                        try {
                            this.writeMembers(field, false);
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
                        this.writeMembers(field, false);
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
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.currentBlock.comment(`ignored: ${err.message}`);
                return;
            }
            throw err;
        }
    }

    writeMembers(field:IdField, insideOfClass:boolean):void {
        const overloads = field.overloads;
        if (overloads.length !== 0) {
            // set default constructor
            if (this.currentClass !== null) {
                for (const overload of overloads) {
                    if (overload.functionParameters.length === 0 && overload.functionBase!.name === overload.parent!.name) {
                        const NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Identifier);
                        const method = new tsw.MethodDef(null, false, new tsw.BracketProperty(NativeType.member('ctor')), [], tsw.TypeName.void);
                        method.block.write(new tsw.Return(new tsw.DotCall(new tsw.Name('this'), properties.constructWith, [])));
                        this.currentClass.write(method);
                        break;
                    }
                }
            }

            // write overloads
            try {
                this._writeOverloads(field, insideOfClass);
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
                this._writeField(base, false);
            } else if (base.isClassLike) {
                if (!insideOfClass) {
                    this._writeClass(base);
                }
            } else if (base.isStatic) {
                this._writeField(base, false);
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

    parseAll():void {
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
                this.writeMembers(field, false);
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
                this.writeMembers(field, false);
            } catch (err) {
                if (err instanceof IgnoreThis) {
                    this.currentBlock.comment(`ignored: ${err.message}`);
                    continue;
                }
                console.error(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                throw err;
            }
        }
    }
}

class MinecraftTsFile extends TsFile {
    private readonly decl:TsCodeDeclaration;


    private dnf:tsw.Identifier|null = null;
    private dll:tsw.Identifier|null = null;
    private dnfMakeCall:tsw.Call|null = null;
    private dnfOverloadNew:tsw.Call|null = null;
    private StaticPointer:tsw.Identifier|null = null;
    private StaticPointerType:tsw.Type|null = null;
    private NativeType:tsw.Identifier|null = null;
    private Wrapper:tsw.Identifier|null = null;
    private dllCurrent:tsw.Identifier|null = null;
    private ctorProperty:tsw.BracketProperty|null = null;

    constructor(ids:Identifier[]) {
        super('./minecraft');

        this.decl = new TsCodeDeclaration(this, ids);
    }

    makeVariable(value:tsw.Identifier):tsw.Name {
        const tswvar = this.decl.doc.makeTemporalVariableName(this.decl.implementation.doc);
        this.decl.defs.vars.defines.push(new tsw.VariableDefineItem(tswvar, null, value));
        this.decl.doc.addValueName(tswvar, this.decl.defs, value);
        return tswvar;
    }

    getOverloadVarId(item:Identifier):tsw.Name {
        if (item.tswVar != null) return item.tswVar;
        if (!item.isFunction) {
            throw Error(`is not function (${item})`);
        }
        const value = this.callDnfMakeOverload();
        return item.tswVar = this.makeVariable(value);
    }

    getFunctionVarId(item:Identifier):tsw.Name {
        if (item.tswVar != null) return item.tswVar;
        if (!item.isTemplateFunctionBase && !item.isFunctionBase) {
            throw Error(`is not function base (${item})`);
        }
        const value = this.callDnfMake();
        return item.tswVar = this.makeVariable(value);
    }

    importDnf():tsw.Identifier {
        if (this.dnf !== null) return this.dnf;
        return this.dnf = this.imports.importName(imports.dnf, 'dnf', tsw.Identifier);
    }

    importDll():tsw.Identifier {
        if (this.dll !== null) return this.dll;
        return this.dll = this.imports.importName(imports.dll, 'dll', tsw.Identifier);
    }

    importStaticPointer():tsw.Identifier {
        if (this.StaticPointer !== null) return this.StaticPointer;
        return this.StaticPointer = this.imports.importName(imports.core, 'StaticPointer', tsw.Identifier);
    }

    importStaticPointerType():tsw.Type {
        if (this.StaticPointerType !== null) return this.StaticPointerType;
        return this.StaticPointerType = this.imports.importName(imports.core, 'StaticPointer', tsw.Type);
    }

    importNativeType():tsw.Identifier {
        if (this.NativeType !== null) return this.NativeType;
        return this.NativeType = this.imports.importName(imports.nativetype, 'NativeType', tsw.Identifier);
    }

    importWrapper():tsw.Identifier {
        if (this.Wrapper !== null) return this.Wrapper;
        return this.Wrapper = this.imports.importName(imports.pointer, 'Wrapper', tsw.Identifier);
    }

    callDnfMake():tsw.Call {
        if (this.dnfMakeCall !== null) return this.dnfMakeCall;

        const dnf = this.importDnf();
        const dnfMake = new tsw.Name('$F');
        const assign = new tsw.VariableDef('const', [new tsw.VariableDefineItem(dnfMake, null, dnf.member(properties.make))]);
        this.decl.doc.unshift(assign);

        return this.dnfMakeCall = dnfMake.call([]);
    }

    callDnfMakeOverload():tsw.Call {
        if (this.dnfOverloadNew !== null) return this.dnfOverloadNew;
        const dnf = this.importDnf();
        const dnfMakeOverload = new tsw.Name('$O');
        const assign = new tsw.VariableDef('const', [new tsw.VariableDefineItem(dnfMakeOverload, null, dnf.member('makeOverload'))]);
        this.decl.doc.unshift(assign);
        return this.dnfOverloadNew = dnfMakeOverload.call([]);
    }

    importDllCurrent():tsw.Identifier {
        if (this.dllCurrent != null) return this.dllCurrent;
        const dll = this.importDll();
        const dllCurrent = new tsw.Name('$C');
        const assign = new tsw.VariableDef('const', [new tsw.VariableDefineItem(dllCurrent, null, dll.member('current'))]);
        this.decl.doc.unshift(assign);
        return this.dllCurrent = dllCurrent;
    }

    getNativeTypeCtor():tsw.BracketProperty {
        if (this.ctorProperty != null) return this.ctorProperty;
        const NativeType = this.importNativeType();
        return this.ctorProperty = new tsw.BracketProperty(NativeType.member('ctor'));
    }

    existName(name:string):boolean {
        return super.existName(name) || this.decl.existName(name);
    }

    existNameInScope(name:string):boolean {
        return super.existNameInScope(name) || this.decl.existNameInScope(name);
    }

    writeAll():void {
        try {
            this.decl.parseAll();
        } catch (err) {
            console.error(`> Parsing ${this.path}`);
            throw err;
        }
        const imports = this.imports.toTsw();
        const comment = new tsw.Comment("This script is generated by the PDB Parser, Please don't modify it directly");

        try {
            const decl = this.decl.doc.cloneToDecl();
            decl.unshift(comment, ...imports);
            decl.save(path.join(outDir,this.path)+'.d.ts');
        } catch (err) {
            console.error(`> Writing ${this.path}.d.ts`);
            throw err;
        }
        try {
            const impl = this.decl.implementation;
            impl.doc.unshiftBlock(this.decl.doc);
            impl.doc.unshift(comment, ...imports);
            impl.doc.cloneToJS().save(path.join(outDir,this.path)+'.js');
        } catch (err) {
            console.error(`> Writing ${this.path}.js`);
            throw err;
        }
    }
}

class IdField {
    public readonly overloads:Identifier[] = [];
    public isStatic:boolean;
    constructor(public readonly base:Identifier) {
    }
}

class IdFieldMap implements Iterable<IdField> {

    private readonly map = new Map<string, IdField>();

    append(list:Iterable<IdField>, isStatic:boolean):this {
        for (const item of list) {
            this.get(item.base, isStatic).overloads.push(...item.overloads);
        }
        return this;
    }

    get(base:Identifier, isStatic:boolean):IdField {
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
            isStatic = false;
        } else if (base.isDestructor) {
            name = '#destructor';
            isStatic = false;
        } else {
            name = nametarget.name;
        }
        let field = this.map.get(name);
        if (field != null) return field;
        field = new IdField(base);
        field.isStatic = isStatic;

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
        case FieldType.Member: return this.member.get(base, false);
        case FieldType.Static: return this.staticMember.get(base, true);
        case FieldType.InNamespace: return this.inNamespace.get(base, false);
        }
    }
}

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
setBasicType('typename', 'Type', 't', imports.nativetype);
const any_t = setBasicType('any', 'any', 'v', null);
setBasicType(any_t.decorate(DecoSymbol.make('a', '[]')), 'any[]', 'args', null);
setBasicType('never', 'never', 'v', null);
setBasicType(PdbIdentifier.parse('std::basic_string<char,std::char_traits<char>,std::allocator<char> >'), 'CxxString', 'str', imports.nativetype);
setBasicType(PdbIdentifier.parse('gsl::basic_string_span<char const,-1>'), 'GslStringSpan', 'str', imports.nativetype);
setBasicType(PdbIdentifier.make('...'), 'NativeVarArgs', '...args', imports.complextype);

// std.make('string').redirect(std.find('basic_string<char,std::char_traits<char>,std::allocator<char> >'));
PdbIdentifier.parse('std::ostream').redirect(PdbIdentifier.parse('std::basic_ostream<char,std::char_traits<char> >'));
PdbIdentifier.parse('std::istream').redirect(PdbIdentifier.parse('std::basic_istream<char,std::char_traits<char> >'));
PdbIdentifier.parse('std::iostream').redirect(PdbIdentifier.parse('std::basic_iostream<char,std::char_traits<char> >'));
PdbIdentifier.parse('std::stringbuf').redirect(PdbIdentifier.parse('std::basic_stringbuf<char,std::char_traits<char>,std::allocator<char> >'));
PdbIdentifier.parse('std::istringstream').redirect(PdbIdentifier.parse('std::basic_istringstream<char,std::char_traits<char>,std::allocator<char> >'));
PdbIdentifier.parse('std::ostringstream').redirect(PdbIdentifier.parse('std::basic_ostringstream<char,std::char_traits<char>,std::allocator<char> >'));
PdbIdentifier.parse('std::stringstream').redirect(PdbIdentifier.parse('std::basic_stringstream<char,std::char_traits<char>,std::allocator<char> >'));

PdbIdentifier.parse('RakNet::RakNetRandom').setAsClass();

const ids:Identifier[] = [];
for (const item of PdbIdentifier.global.children) {
    if (item.isBasicType) {
        // basic types
    } else if (item.name.startsWith('`')) {
        // private symbols
    } else if (item.isLambda) {
        // lambdas
    } else if (item.isConstant && /^[0-9]+$/.test(item.name)) {
        // numbers
    } else if (item.name.startsWith('{')) {
        // code chunk?
    } else if (item.name.startsWith('__imp_')) {
        // import
    } else if (/^main\$dtor\$[0-9]+$/.test(item.name)) {
        // dtor in main
    } else {
        ids.push(item);
    }
}

for (const item of PdbIdentifier.global.loopAll()) {
    if (item.isTemplate) {
        TemplateInfo.reduceTemplateType(item);
    }
}

const minecraft = new MinecraftTsFile(ids);
minecraft.writeAll();
console.log(`global id count: ${PdbIdentifier.global.children.length}`);
