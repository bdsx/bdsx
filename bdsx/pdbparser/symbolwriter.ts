import { emptyFunc } from "../common";
import { styling } from "../externs/bds-scripting/styling";
import { remapAndPrintError } from "../source-map-support";
import { arrayEquals } from "../util";
import { ScriptWriter } from "../writer/scriptwriter";
import { resolvePacketClasses } from "./packetresolver";
import { reduceTemplateTypes } from "./reducetemplate";
import { DecoSymbol, PdbId } from "./symbolparser";
import { PdbMember, PdbMemberList } from "./symbolsorter";
import { TemplateInfo } from "./templateinfo";
import { TsFile, TsImportInfo, TsImportItem } from "./tsimport";
import { tswNames } from "./tswnames";
import { wrapperUtil } from "./tswrapperutil";
import { tsw } from "./tswriter";
import path = require('path');
import ProgressBar = require("progress");

let installedBdsVersion = '';
try {
    const json = require('../../bedrock_server/installinfo.json');
    if (json == null) installedBdsVersion = 'unknown';
    else installedBdsVersion = json.bdsVersion || 'unknown';
} catch (err) {
    installedBdsVersion = 'unknown';
}

// resolveSuper(); // pretty inaccurate
resolvePacketClasses();

const outDir = path.join(__dirname, '..');
const COMMENT_SYMBOL = false;

const primitiveTypes = new Set<string>();
primitiveTypes.add('int32_t');
primitiveTypes.add('uint32_t');
primitiveTypes.add('int16_t');
primitiveTypes.add('uint16_t');
primitiveTypes.add('int8_t');
primitiveTypes.add('uint8_t');
primitiveTypes.add('float32_t');
primitiveTypes.add('float64_t');
primitiveTypes.add('CxxString');

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

interface TemplateRedirect {
    redirect(item:PdbId<PdbId.TemplateBase>, templates:Identifier[], kind:tsw.Kind, opts:ToTswOptions):tsw.ItemPair;
    templates:Identifier[];
}

interface Identifier extends PdbId<PdbId.Data> {
    jsType?:((item:Identifier, kind:tsw.Kind)=>tsw.ItemPair)|tsw.ItemPair|TsImportItem|null;
    jsTypeOnly?:tsw.Type;
    jsTypeNullable?:boolean;
    templateRedirects?:TemplateRedirect[];

    dontExport?:boolean;
    paramVarName?:string|null;
    filted?:boolean;
    tswVar?:tsw.Name;

    isMantleClass?:boolean;
}

PdbId.filter = (item:Identifier):boolean=>{
    if (item.filted != null) return item.filted;
    item = item.decay();
    if (item.data instanceof PdbId.LambdaClass) return item.filted = false;
    if ((item.data instanceof PdbId.FunctionBase ||
        item.data instanceof PdbId.TemplateFunctionBase ||
        item.data instanceof PdbId.Function ||
        item.data instanceof PdbId.ClassLike) &&
        item.parent === PdbId.std &&
        item.name.startsWith('_')) {
        return item.filted = false;
    }
    if (item.name === "`anonymous namespace'") return item.filted = false;
    if (item.name.startsWith('<unnamed-type-')) return item.filted = false;
    if (item.data instanceof PdbId.KeyType) return item.filted = false;
    if (item.templateBase !== null) {
        if (item.parent === PdbId.std) {
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
        if (!PdbId.filter(comp)) {
            return item.filted = false;
        }
    }

    return item.filted = true;
};

function getFirstIterableItem<T>(item:Iterable<T>):T|undefined {
    for (const v of item) {
        return v;
    }
    return undefined;
}

function typePlaining(item:tsw.Type):tsw.Type {
    item = item.notNull();
    if (item instanceof tsw.TemplateType) {
        if (item.type === Const.type) {
            return typePlaining(item.params[0]);
        } else {
            return new tsw.TemplateType(item.type, item.params.map(typePlaining));
        }
    }
    if (item instanceof tsw.ArrayType) {
        return new tsw.ArrayType(typePlaining(item.component));
    }
    if (item instanceof tsw.Tuple) {
        return new tsw.Tuple(item.fields.map(typePlaining));
    }
    return item;
}

function isPrimitiveType(item:tsw.ItemPair, raw:Identifier):boolean {
    if (raw.is(PdbId.Enum)) return true;
    if (item.type !== null) {
        if (!(item.type instanceof tsw.TypeName)) return false;
        if (!primitiveTypes.has(item.type.name)) return false;
    }
    if (item.value !== null) {
        if (!(item.value instanceof tsw.Name)) return false;
        if (!primitiveTypes.has(item.value.name)) return false;
    }
    return true;
}

class Definer {
    public item:Identifier;

    constructor(name:string|PdbId<PdbId.Data>) {
        this.item = name instanceof PdbId ? name : PdbId.parse(name);
    }

    paramName(name:string):this {
        this.item.paramVarName = name;
        return this;
    }

    js(jsType:[string, TsFile]|((item:Identifier, kind:tsw.Kind)=>tsw.ItemPair)|TsImportItem|tsw.ItemPair|null, opts:{
        jsTypeNullable?:boolean,
        jsTypeOnly?:tsw.Type,
    } = {}):this {
        if (jsType instanceof Array) {
            const [name, host] = jsType;
            this.item.jsType = new wrapperUtil.ImportItem(minecraft, host, name);
        } else {
            this.item.jsType = jsType;
        }
        this.item.jsTypeOnly = opts.jsTypeOnly;
        this.item.dontExport = true;
        if (opts.jsTypeNullable != null) this.item.jsTypeNullable = opts.jsTypeNullable;
        return this;
    }

    templateRedirect(
        templateRedirect:(item:PdbId<PdbId.TemplateBase>, templates:Identifier[], kind:tsw.Kind, opts:ToTswOptions)=>tsw.ItemPair,
        opts:{
        exportOriginal?:boolean,
    } = {}):this {
        if (this.item.templateBase === null) {
            throw Error(`templateRedirect but is not template`);
        }
        const params = this.item.templateParameters;
        if (params === null) {
            throw Error(`templateRedirect but no templateParameters`);
        }

        this.item = this.item.templateBase;
        if (this.item.templateRedirects == null) this.item.templateRedirects = [];
        this.item.templateRedirects.push({
            templates: params,
            redirect: templateRedirect
        });
        if (!opts.exportOriginal) this.item.dontExport = true;
        return this;
    }
}

const imports = {
    nativetype: new TsFile('./nativetype'),
    cxxvector: new TsFile('./cxxvector'),
    complextype: new TsFile('./complextype'),
    dnf: new TsFile('./dnf'),
    nativeclass: new TsFile('./nativeclass'),
    dll: new TsFile('./dll'),
    core: new TsFile('./core'),
    common: new TsFile('./common'),
    enums: new TsFile('./enums'),
    pointer: new TsFile('./pointer'),
    sharedpointer: new TsFile('./sharedpointer'),
};

interface ToTswOptions {
    isField?:boolean;
    noTemplate?:boolean;
    noJsType?:boolean;
    absoluteValue?:boolean;
}

class MakeFuncOptions {
    private value:tsw.ObjectDef|null = null;
    private readonly map = new Map<string, number>();

    has(key:string):boolean {
        return this.map.has(key);
    }

    add(prop:tsw.NameProperty, value:tsw.Value):void {
        if (this.value === null) {
            this.value = new tsw.ObjectDef([]);
        }
        const oidx = this.map.get(prop.name);
        if (oidx != null) {
            this.value.fields[oidx] = [prop, value];
        } else {
            const idx = this.value.fields.push([prop, value])-1;
            this.map.set(prop.name, idx);
        }
    }

    get():tsw.Value {
        return this.value || tsw.Constant.null;
    }
}

class FunctionMaker {
    public readonly opts = new MakeFuncOptions;
    public returnType:tsw.ItemPair;
    public parameters:tsw.ItemPair[];
    public parametersWithoutThis:tsw.ItemPair[];
    public parameterNames:tsw.Name[];
    public parametersOffset = 0;
    private paramDeclares:tsw.DefineItem[]|null = null;

    constructor(
        private readonly file:MinecraftTsFile,
        kind:tsw.Kind,
        public readonly isStatic:boolean,
        returnType:Identifier,
        parameters:Identifier[],
        public readonly classType:tsw.ItemPair|null) {
        if (!isStatic && classType != null && classType.value !== null) {
            this.opts.add(tswNames.this, classType.value);
        }
        this.returnType = file.toTswReturn(returnType, kind, this.opts, true);
        this.parametersWithoutThis = this.parameters = file.toTswParameters(parameters, kind, true);
        this.parameterNames = file.makeParamNamesByTypes(parameters);
        if (classType != null && classType.type !== null) {
            if (classType.type instanceof tsw.TemplateType) {
                this.parametersWithoutThis = this.parameters.slice();
                if (isStatic) {
                    this.parameters.unshift(file.NativeClassType.wrap(classType));
                    this.parametersOffset = 0;
                } else {
                    this.parameters.unshift(classType);
                }
                this.parameterNames.unshift(tsw.Name.this);
            }
        }

    }

    private _getParamDeclares():tsw.DefineItem[] {
        if (this.paramDeclares !== null) return this.paramDeclares;
        return this.paramDeclares = this.file.makeParameterDecls(this.parameters, this.parameterNames);
    }

    makeType():tsw.ItemPair {
        const out = new tsw.ItemPair;
        if (this.returnType.value !== null) {
            const NativeFunctionType = this.file.NativeFunctionType.import(tsw.Kind.Value);
            out.value = NativeFunctionType.value.call(tswNames.make, [
                this.returnType.value,
                this.opts.get(),
                ...this.parametersWithoutThis.map(id=>id.value)
            ]);
        }

        if (this.returnType.type !== null) {
            out.type = new tsw.FunctionType(this.returnType.type, this._getParamDeclares());
        }

        return out;
    }

    make(name:tsw.Property, overload:Identifier):MethodPair {
        const out = {} as MethodPair;
        if (this.returnType.type !== null) {
            out.declare = new tsw.MethodDecl(null, this.isStatic, name, this._getParamDeclares(), this.returnType.type);
        }
        if (this.returnType.value !== null) {
            const paramDefs:tsw.Value[] = [
                new tsw.Constant(overload.address),
                new tsw.ArrayDef(this.parametersWithoutThis.map(pair=>pair.value!)),
                this.returnType.value!,
                this.opts.get()
            ];

            if (overload.templateBase !== null) {
                const templates = overload.templateParameters!.map(t=>this.file.toTsw(t, tsw.Kind.Value, {absoluteValue: true}).value!);
                paramDefs.push(new tsw.ArrayDef(templates));
            }

            out.variable = this.file.getOverloadVarId(overload);
            out.assign = new tsw.Assign(out.variable.member(tswNames.overloadInfo), new tsw.ArrayDef(paramDefs));
        }
        return out;
    }
}

interface MethodPair {
    declare:tsw.MethodDecl;
    variable:tsw.Name;
    assign:tsw.Assign;
}

class ParsedFunction {
    declare:tsw.MethodDecl;
    templateDeclare:tsw.MethodDecl|null = null;
    variable:tsw.Name;
    assign:tsw.Assign;

    constructor(file:MinecraftTsFile, name:tsw.Property, field:PdbMember, overload:Identifier) {
        if (!overload.is(PdbId.Function)) throw Error(`is not function(${overload})`);
        if (overload.data.returnType === null) throw Error(`Unresolved return type (${overload})`);
        if (overload.parent === null) throw Error(`is function but no parent`);

        let funcKind = tsw.Kind.Value;
        if (overload.parent.templateBase !== null) {
            funcKind = tsw.Kind.Both;
        }

        const classType = file.getClassType(overload, funcKind, true);

        const func = new FunctionMaker(
            file, tsw.Kind.Both, field.isStatic,
            overload.data.returnType, overload.data.functionParameters, classType);

        const method = func.make(name, overload);
        this.declare = method.declare;
        this.variable = method.variable;
        this.assign = method.assign;

        if (overload.templateBase !== null) {
            const typeOfTemplates = overload.templateParameters!.map(v=>v.getTypeOfIt());
            const types = file.toTswParameters(typeOfTemplates, tsw.Kind.Type);
            const tswNames = file.makeParamNamesByTypes(typeOfTemplates);
            const tparams = file.makeParameterDecls(types, tswNames, field.isStatic, classType?.type);
            for (const param of tparams) {
                if (param instanceof tsw.VariableDefineItem) {
                    if (param.name === tsw.Name.this) continue;
                    param.initial = tsw.OPTIONAL;
                }
            }
            const treturnType = new tsw.FunctionType(func.returnType.type!, tparams.slice(classType != null ? 1 : 0));
            this.templateDeclare = new tsw.MethodDecl(null, field.isStatic, name, tparams, treturnType);
        }
    }
}

class TsCode {
    public readonly doc = new tsw.Block;
    public readonly imports:TsImportInfo;

    constructor(public readonly base:MinecraftTsFile) {
        this.imports = this.base.imports;
    }

    getIdName(item:Identifier):string {
        if (item.redirectedFrom !== null) {
            return this.getIdName(item.redirectedFrom);
        }
        if (item.templateBase !== null) {
            return this.getIdName(item.templateBase)+'_'+item.templateParameters!.map(id=>this.getIdName(id)).join('_');
        }
        if (item.data instanceof PdbId.Decorated) {
            return this.getIdName(item.data.base);
        }
        if (item.data instanceof PdbId.MemberPointerType) {
            return this.getIdName(item.data.memberPointerBase)+'_m';
        }
        if (item.data instanceof PdbId.MemberFunctionType) {
            return this.getIdName(item.data.memberPointerBase)+'_fn';
        }
        const nameobj = this.getNameOnly(item);
        if (!(nameobj instanceof tsw.NameProperty)) throw Error(`is not name(${item})`);
        let name = nameobj.name.replace(/[{},<>]/g, v=>idremap[v]);
        if (name.startsWith('-')) {
            name = 'minus_'+name.substr(1);
        }
        if (item.parent !== null && item.parent !== PdbId.global) {
            name = this.getIdName(item.parent) + '_' + name;
        }
        return name;
    }

    getNameOnly(item:Identifier):tsw.Property {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.is(PdbId.TypeUnion)) {
            throw Error(`${item}: getName with type union`);
        }
        if (item.is(PdbId.Decorated)) {
            throw Error(`getName with deco type(${item})`);
        }
        if (item.is(PdbId.FunctionType) || item.is(PdbId.FunctionTypeBase)) {
            throw Error(`${item.name}: getName with function type`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent, (type=${item.data.constructor.name})`);
        }
        if (item.is(PdbId.LambdaClass)) {
            throw new IgnoreThis(`lambda (${item})`);
        }
        if (item.is(PdbId.KeyType)) {
            throw new IgnoreThis(`temporal key (${item})`);
        }

        let name = item.removeParameters().name;
        if (item.is(PdbId.Function) || item.is(PdbId.FunctionBase)) {
            if (item.data.isConstructor) {
                return tswNames.constructWith;
            } else if (item.data.isDestructor) {
                const NativeType = this.base.NativeType.importValue();
                return new tsw.BracketProperty(NativeType.member(tswNames.dtor));
            }
        }

        if (item.is(PdbId.VCall)) {
            return new tsw.NameProperty('__vcall_'+this.getIdName(item.data.param));
        }
        const remapped = specialNameRemap.get(name);
        let matched:RegExpMatchArray|null;
        if (remapped != null) {
            name = remapped;
        } else if (name.startsWith('`')) {
            if (item.params !== null) {
                const params = [...item.params];
                if (name.startsWith("`vector deleting destructor'")) {
                    name = '__vector_deleting_destructor_'+params.join('_');
                } else if (name.startsWith("`vftable'")) {
                    name = '__vftable_for_'+params.map(id=>this.getIdName(id)).join('_');
                } else if (name.startsWith("`vbtable'")) {
                    name = '__vbtable_for_'+params.map(id=>this.getIdName(id)).join('_');
                } else {
                    name = '__'+name.replace(/[`' ()\-,0-9]/g, '');
                    // name = '__'+name.replace(/[`' ()-,0-9]/g, '')+'_'+item.adjustors.join('_').replace(/-/g, 'minus_');
                }
            } else {
                name = '__'+name.replace(/[`' ()\-,0-9]/g, '');
            }
        } else if ((matched = name.match(adjustorRegExp)) !== null) {
            name = matched[1]+'_adjustor_'+matched[2];
        } else if (name.startsWith('operator ')) {
            if (item.is(PdbId.FunctionBase) || item.is(PdbId.TemplateFunctionBase)) {
                for (const over of item.data.allOverloads()) {
                    if (over.data.returnType === null) throw Error(`Unresolved return type ${over}`);
                    name = 'operator_castto_'+this.getIdName(over.data.returnType);
                    break;
                }
            } else {
                throw Error(`failed to get return type(${item})`);
            }
        }
        return new tsw.NameProperty(name);
    }

    defineType(item:Identifier, type:tsw.Type):tsw.BlockItem {
        const name = this.getNameOnly(item);
        return new tsw.Export(new tsw.TypeDef(name.toName(tsw.Kind.Type).type, type));
    }

    defineVariable(item:Identifier, type:tsw.Type|null, define:'const'|'let', initial?:tsw.Value):tsw.BlockItem {
        const name = this.getNameOnly(item);
        const exported = new tsw.Export(new tsw.VariableDef(define, [new tsw.VariableDefineItem(name.toName(tsw.Kind.Value).value, type, initial)]));
        if (initial == null) exported.writeJS = emptyFunc;
        return exported;
    }

    getClassDeclaration(item:Identifier, type:tsw.Type|null, isReadonly:boolean, isStatic:boolean):tsw.ClassItem {
        const name = this.getNameOnly(item);
        return new tsw.ClassField(null, isStatic, isReadonly, name, type);
    }

    getName<T extends tsw.Kind>(item:Identifier, kind:T, opts:{assignee?:boolean, insideOfClass?:boolean, absoluteValue?:boolean} = {}):tsw.ItemPair {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent`);
        }
        if (item.is(PdbId.LambdaClass)) {
            throw new IgnoreThis(`lambda (${item})`);
        }

        let result:tsw.ItemPair|null = null;
        if (item.parent !== PdbId.global) {
            result = this.base.toTsw(item.parent, kind, {absoluteValue: opts.absoluteValue});
            if (opts.insideOfClass && !item.isStatic && !item.isType &&
                result.type != null &&
                item.parent.is(PdbId.ClassLike) &&
                (item.is(PdbId.Function) || item.is(PdbId.FunctionBase) || item.is(PdbId.TemplateFunctionBase))) {
                result.type = result.type.member(tsw.NameProperty.prototypeName);
            }
        }

        const prop = this.getNameOnly(item);
        if (result !== null) {
            if (result.type != null) {
                result.type = result.type.member(prop);
            }
            if (result.value != null) {
                result.value = result.value.member(prop);
            }
        } else {
            if (opts.assignee) {
                result = new tsw.ItemPair(
                    tsw.Name.exports.member(prop),
                    prop.toName(kind & tsw.Kind.Type).type
                );
            } else {
                result = prop.toName(kind);
            }
        }
        return result;
    }
}

class TsCodeDeclaration extends TsCode {
    public readonly idsMap = new Set<Identifier>();
    private readonly nameMaker = (item:PdbId<PdbId.Data>):tsw.Type=>this.base.toTsw(item, tsw.Kind.Type).type;
    public readonly defs = new tsw.VariableDef('const', []);

    public currentNs:Identifier = PdbId.global;
    public currentBlock:tsw.Block = this.doc;
    public currentClass:tsw.Class|null = null;

    constructor(
        public readonly base:MinecraftTsFile,
        private readonly ids:Identifier[]
    ) {
        super(base);
        this.doc.write(this.defs);
    }

    private _writeRedirect(item:Identifier):void {
        if (!(this.currentBlock instanceof tsw.Block)) {
            throw Error(`${this.currentBlock} is not block`);
        }

        try {
            if (!item.is(PdbId.Redirect)) {
                PdbId.printOnProgress(`[symbolwriter.ts] ${item}: is not redirecting`);
                return;
            }
            const ori = item.data.redirectTo;
            const from = ori.redirectedFrom;
            ori.redirectedFrom = null;
            const type = this.base.toTsw(ori, tsw.Kind.Type).type;
            const NativeClassType = this.base.NativeClassType.importType();
            if (COMMENT_SYMBOL) this.currentBlock.comment(ori.symbolIndex+': '+ori.source);
            this.currentBlock.write(this.defineType(item, type));
            const typeOfThis = new tsw.TypeOf(this.base.toTsw(ori.removeTemplateParameters(), tsw.Kind.Value).value);
            const classType = NativeClassType.template(type).and(typeOfThis);
            this.currentBlock.write(this.defineVariable(item, classType, 'const', this.base.toTsw(ori, tsw.Kind.Value).value));
            ori.redirectedFrom = from;
        } catch (err) {
            if (err instanceof IgnoreThis) {
                this.currentBlock.comment(`ignored: ${item}`);
                this.currentBlock.comment(`  ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _writeOverloads(field:PdbMember, insideOfClass:boolean):void {
        try {
            const impl = this.base.doc.impl;
            const overloads = field.overloads;
            if (overloads.length === 0) {
                throw Error(`empty overloads`);
            }
            if (!insideOfClass && field.isStatic) {
                throw Error(`${overloads[0]}: is static but not in the class`);
            }

            const target = field.base.removeTemplateParameters();
            const name = this.getNameOnly(field.base);

            const scope = this.currentClass || this.currentBlock;

            const writedOverloads:tsw.Name[] = [];
            let previousParams:PdbId<PdbId.Data>[]|null = null;
            let previousThis:PdbId<PdbId.Data>|null = null;
            for (const overload of overloads) {
                try {
                    const thisParam = overload.parent!.templateBase !== null ? overload.parent! : null;
                    if (COMMENT_SYMBOL) scope.comment(overload.symbolIndex+': '+overload.source);
                    if (overload.data.returnType === null) throw Error(`Unresolved return type (${overload})`);
                    const func = new ParsedFunction(this.base, name, field, overload);

                    if (previousParams === null || (
                        !arrayEquals(overload.data.functionParameters, previousParams) ||
                        previousThis !== thisParam
                    )) {
                        previousParams = overload.data.functionParameters;
                        previousThis = thisParam;
                        scope.addFunctionDecl(name, func.declare.params.params, func.declare.returnType, field.isStatic);
                    } else {
                        scope.comment(`dupplicated: ${func.declare};`);
                    }
                    impl.doc.write(func.assign);
                    writedOverloads.push(func.variable);
                } catch (err) {
                    if (!(err instanceof IgnoreThis)) {
                        PdbId.printOnProgress(`> Writing ${overload} (symbolIndex=${overload.symbolIndex})`);
                        throw err;
                    }
                    scope.comment(`ignored: ${overload}`);
                    scope.comment(`  ${err.message}`);
                }
            }

            if (writedOverloads.length !== 0) {
                const funcdef = this.base.getFunctionVarId(target);
                if (this.currentClass !== null) {
                    const clsName = this.currentClass.name;
                    if (field.isStatic) {
                        this.currentBlock.assign(clsName.member(name), funcdef);
                    } else {
                        this.currentBlock.assign(clsName.member(tsw.NameProperty.prototypeName).member(name), funcdef);
                    }
                } else {
                    const exported = this.currentBlock.export(new tsw.VariableDef('const', [
                        new tsw.VariableDefineItem(name.toName(tsw.Kind.Value).value, null, funcdef)
                    ]));
                    exported.cloneToDecl = ()=>null;
                }
                this.currentBlock.assign(funcdef.member(tswNames.overloads), new tsw.ArrayDef(writedOverloads));
            }

        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                const block = this.currentClass || this.currentBlock;
                block.comment(`ignored: ${field.base.name}`);
                block.comment(`  ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _writeField(item:Identifier, isStatic:boolean):void {
        try {
            if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
            let type:tsw.Type;
            if (item.is(PdbId.ReturnAble)) {
                if (item.data.returnType === null) throw Error(`Unresolved return type (${item})`);
                type = this.base.toTsw(item.data.returnType, tsw.Kind.Type, {isField: true}).type;
            } else {
                type = this.base.StaticPointer.importType();
            }
            // unwrap const
            if (type instanceof tsw.TemplateType && type.type === Const.type) {
                type = type.params[0];
            }

            if (this.currentClass !== null) {
                this.currentClass.write(this.getClassDeclaration(item, type, false, isStatic));
            } else {
                this.currentBlock.write(this.defineVariable(item, type, 'const'));
            }

            const impl = this.base.doc.impl;
            const target:Identifier = item.removeTemplateParameters();
            if (COMMENT_SYMBOL) impl.doc.comment(item.symbolIndex+': '+item.source);
            if (item.address === 0) {
                PdbId.printOnProgress(`[symbolwriter.ts] ${item}: address not found`);
                throw new IgnoreThis(`address not found (${item})`);
            }

            const addrvar = this.base.getAddressVarId(item);
            if (item.is(PdbId.ReturnAble)) {
                if (target.parent === null) {
                    throw Error(`${target}: has not parent`);
                }

                let parent:tsw.Value;
                if (target.parent === PdbId.global) {
                    parent = tsw.Name.exports;
                } else {
                    parent = impl.base.toTsw(target.parent, tsw.Kind.Value, {absoluteValue: true}).value;
                }

                const NativeType = this.base.NativeType.importValue();
                if (item.data.returnType === null) throw Error(`Unresolved return type (${item})`);
                const type = impl.base.toTsw(item.data.returnType, tsw.Kind.Value, {isField: true, absoluteValue: true}).value;
                const prop = impl.getNameOnly(target);
                impl.doc.write(NativeType.call(tswNames.definePointedProperty, [
                    parent,
                    new tsw.Constant(prop.toName(tsw.Kind.Value).value.name),
                    addrvar,
                    type
                ]));
            } else {
                const targetName = impl.getName(target, tsw.Kind.Value, {assignee: true, absoluteValue: true}).value;
                impl.doc.assign(targetName, addrvar);
            }
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.currentBlock.comment(`ignored: ${item}`);
                this.currentBlock.comment(`  ${err.message}`);
                return;
            }
            throw err;
        }
    }

    private _getField(out:PdbMemberList, item:Identifier):void {
        if (item.parent === null) {
            throw Error(`${item.name}: parent not found`);
        }
        if (item.dontExport) return;
        if (!PdbId.filter(item)) return;
        if (item.is(PdbId.Decorated)) return;
        if (item.is(PdbId.FunctionType)) return;
        if (item.is(PdbId.MemberPointerType)) return;
        if (item.is(PdbId.TemplateFunctionNameBase)) return;
        if (item.templateBase !== null) return; // class or function template
        if (item.is(PdbId.Function)) return;

        if (item.hasOverloads()) {
            for (const o of item.data.allOverloads()) {
                if (!PdbId.filter(o)) continue;
                if (o.templateBase !== null && o.data.hasArrayParam()) continue;
                if (item.is(PdbId.TemplateFunctionBase)) {
                    if (o.data.functionParameters.some(arg=>arg.getArraySize() !== null)) {
                        continue;
                    }
                }
                if (!o.data.functionParameters.every(PdbId.filter)) {
                    continue;
                }
                if (o.parent !== null && !PdbId.filter(o.parent)) {
                    continue;
                }
                if (o.data.returnType !== null && !PdbId.filter(o.data.returnType)) {
                    continue;
                }
                out.push(item, o);
            }
        } else {
            out.set(item);
        }
    }

    private _writeClass(item:Identifier):void {
        try {
            let opened = false;

            const tinfo = TemplateInfo.from(item);
            if (tinfo.paramTypes.length !== 0) {
                if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
                const templateDecl =  tinfo.makeTemplateDecl(this.nameMaker);
                const clsname = this.getNameOnly(item);
                const cls = new tsw.Class(clsname.toName(tsw.Kind.Value).value);
                cls.templates = templateDecl;
                cls.extends = this.base.NativeTemplateClass.importValue();
                this.currentBlock.export(cls);
                this.currentClass = cls;
                this.base.currentClassId = item;
                opened = true;

                try {
                    const makeTemplateParams = tinfo.makeWrappedTemplateDecl(this.nameMaker);
                    const types = tinfo.paramTypes.map(v=>new tsw.ItemPair(null, new tsw.TypeName(v.name)));
                    const paramNames = this.base.makeParamNamesByLength(types.length);
                    const args = this.base.makeParameterDecls(types, paramNames);

                    const unwrappedType:tsw.TemplateType[] = [];
                    const NativeClassType = this.base.NativeClassType.importType();
                    if (tinfo.paramTypes.length !== 0) {
                        const UnwrapType = this.base.UnwrapType.importType();
                        for (const param of tinfo.paramTypes) {
                            unwrappedType.push(new tsw.TemplateType(UnwrapType, [new tsw.TypeName(param.name)]));
                        }
                    }
                    const returnType = new tsw.TemplateType(NativeClassType, [
                        new tsw.TemplateType(clsname.toName(tsw.Kind.Type).type, unwrappedType)
                    ]).and(new tsw.TypeOf(clsname.toName(tsw.Kind.Value).value));
                    const def = new tsw.MethodDecl(null, true, tswNames.make, args, returnType);
                    def.templates = makeTemplateParams;
                    this.currentClass.write(def);
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.currentBlock.comment(`ignored: ${item}`);
                        this.currentBlock.comment(`  ${err.message}`);
                    } else {
                        throw err;
                    }
                }
            } else {
                if (
                    item.is(PdbId.ClassLike) ||
                    item.is(PdbId.TemplateClassBase) // template but no template parameters.
                ) {
                    if (item.is(PdbId.Enum)) {
                        if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
                        const name = this.getNameOnly(item);
                        this.currentBlock.export(new tsw.Enum(name.toName(tsw.Kind.Value).value, []));
                    } else {
                        if (COMMENT_SYMBOL) this.currentBlock.comment(item.symbolIndex+': '+item.source);
                        const cls = new tsw.Class(this.getNameOnly(item).toName(tsw.Kind.Value).value);
                        if (item.isMantleClass) {
                            const MantleClass = this.base.MantleClass.importValue();
                            cls.extends = MantleClass;
                        } else {
                            let supercls:tsw.Value|null = null;
                            if (item.is(PdbId.Class)) {
                                const superid = item.data.super;
                                if (superid !== null) {
                                    supercls = this.base.toTsw(superid, tsw.Kind.Value).value;
                                }
                            }
                            if (supercls === null) {
                                const NativeClass = this.base.NativeClass.importValue();
                                supercls = NativeClass;
                            }
                            cls.extends = supercls;
                        }
                        this.currentBlock.export(cls);
                        this.currentClass = cls;
                        opened = true;
                    }
                }
            }

            const fields = this.getAllFields(item);
            const sortedMember = fields.sortedMember();
            if (opened) {
                for (const field of fields.sortedStaticMember()) {
                    this.writeMembers(field, true);
                }
                for (const field of sortedMember) {
                    this.writeMembers(field, true);
                }
            }

            this.currentClass = null;

            for (const _ of this.enterNamespace(item)) {
                if (!opened) {
                    for (const field of sortedMember) {
                        try {
                            this.writeMembers(field, false);
                        } catch (err) {
                            if ((err instanceof IgnoreThis)) {
                                this.currentBlock.comment(`ignored: ${field.base.name}`);
                                this.currentBlock.comment(`  ${err.message}`);
                            } else {
                                PdbId.printOnProgress(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                                throw err;
                            }
                        }
                    }
                }

                for (const field of fields.sortedInNamespace()) {
                    try {
                        this.writeMembers(field, false);
                    } catch (err) {
                        if ((err instanceof IgnoreThis)) {
                            this.currentBlock.comment(`ignored: ${field.base.name}`);
                            this.currentBlock.comment(`  ${err.message}`);
                        } else {
                            PdbId.printOnProgress(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                            throw err;
                        }
                    }
                }
            }
        } catch (err) {
            if ((err instanceof IgnoreThis)) {
                this.currentBlock.comment(`ignored: ${item}`);
                this.currentBlock.comment(`  ${err.message}`);
                return;
            }
            throw err;
        }
    }

    existName(name:string):boolean {
        const item:Identifier|null = PdbId.global.getChild(name);
        return item != null && !item.dontExport;
    }

    existNameInScope(name:string):boolean {
        let ns = this.currentNs;
        while (ns !== PdbId.global) {
            const item:Identifier|null = ns.getChild(name);
            if (item != null) return !item.dontExport;
            ns = ns.parent!;
        }
        const item:Identifier|null = PdbId.global.getChild(name);
        return item != null && !item.dontExport;
    }

    *enterNamespace(item:Identifier):IterableIterator<void> {
        if (!(this.currentBlock instanceof tsw.Block)) throw Error(`${this.currentBlock} is not namespace`);
        const prop = this.getNameOnly(item);

        const ns = new tsw.Namespace(prop.toName(tsw.Kind.Value).value);

        const oldblock = this.currentBlock;
        const oldclass = this.currentClass;
        const oldclassid = this.base.currentClassId;
        const oldns = this.currentNs;
        this.currentBlock = ns.block;
        this.currentClass = null;
        this.base.currentClassId = null;
        this.currentNs = item;
        try {
            yield;
        } catch (err) {
            remapAndPrintError(err);
        }
        this.currentNs = oldns;
        this.base.currentClassId = oldclassid;
        this.currentClass = oldclass;
        this.currentBlock = oldblock;
        if (ns.block.size() !== 0) {
            this.currentBlock.write(new tsw.Export(ns));
        }
    }

    getAllFields(item:PdbId<PdbId.Data>):PdbMemberList {
        const out = new PdbMemberList;

        if (item.is(PdbId.TemplateBase)) {
            if (item.data.specialized.length !== 0) {
                for (const specialized of item.data.specialized) {
                    for (const child of specialized.children.values()) {
                        this._getField(out, child);
                    }
                }
            }
        }
        for (const child of item.children.values()) {
            this._getField(out, child);
        }
        return out;
    }

    writeMembers(field:PdbMember, insideOfClass:boolean):void {
        const overloads = field.overloads;
        if (overloads.length !== 0) {
            // set default constructor
            if (this.currentClass !== null) {
                for (const overload of overloads) {
                    if (overload.data.functionParameters.length === 0 && overload.data.functionBase.name === overload.parent!.name) {
                        const NativeType = this.base.NativeType.importValue();
                        const method = new tsw.MethodDef(null, false, new tsw.BracketProperty(NativeType.member(tswNames.ctor)), [], tsw.BasicType.void);
                        method.block.write(new tsw.Return(new tsw.DotCall(tsw.Name.this, tswNames.constructWith, [])));
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
                    this.currentBlock.comment(`ignored: ${field.base.name}`);
                    this.currentBlock.comment(`  ${err.message}`);
                } else {
                    throw err;
                }
            }
        } else {
            const base = field.base;
            if (base.is(PdbId.Redirect)) {
                this._writeRedirect(base);
            } else if (base.is(PdbId.NamespaceLike) || base.is(PdbId.TemplateBase)) {
                if (base.address !== 0) {
                    throw Error(`class but has address (${base})`);
                }
                if (!insideOfClass) {
                    this._writeClass(base);
                }
            } else {
                this._writeField(base, true);
            }
            // throw Error(`${base.source || base}: unexpected identifier`);
        }
    }

    parseAll():void {
        const out = new PdbMemberList;
        for (const item of this.ids) {
            this._getField(out, item);
        }
        if (out.staticMember.size !== 0) {
            const first = getFirstIterableItem(out.staticMember)!;
            throw Error(`global static member: ${first.base}`);
        }
        const total = out.inNamespace.size + out.member.size;
        const bar = new ProgressBar('[symbolwriter.ts] Converting [:bar] :current/:total', total);
        try {
            for (const field of out.inNamespace) {
                try {
                    this.writeMembers(field, false);
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.currentBlock.comment(`ignored: ${field.base.name}`);
                        this.currentBlock.comment(`  ${err.message}`);
                        continue;
                    }
                    PdbId.printOnProgress(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                    throw err;
                }
                bar.tick();
            }
            for (const field of out.member) {
                try {
                    this.writeMembers(field, false);
                } catch (err) {
                    if (err instanceof IgnoreThis) {
                        this.currentBlock.comment(`ignored: ${field.base.name}`);
                        this.currentBlock.comment(`  ${err.message}`);
                        continue;
                    }
                    PdbId.printOnProgress(`> Writing ${field.base} (symbolIndex=${field.base.symbolIndex})`);
                    throw err;
                }
                bar.tick();
            }
        } finally {
            bar.terminate();
        }
    }
}

class MinecraftDocument {
    public readonly decl:TsCodeDeclaration;
    public readonly impl:TsCode;

    constructor(base:MinecraftTsFile, ids:Identifier[]) {
        this.decl = new TsCodeDeclaration(base, ids);
        this.impl = new TsCode(base);
    }

    makeVariable(value:tsw.Value):tsw.Name {
        const tswvar = this.decl.doc.makeTemporalVariableName(this.impl.doc);
        this.decl.defs.vars.defines.push(new tsw.VariableDefineItem(tswvar, null, value));
        this.decl.doc.addValueName(tswvar, this.decl.defs, value);
        return tswvar;
    }

}

class MinecraftTsFile extends TsFile {
    public readonly Bufferable = new TsImportItem(this, imports.common, 'Bufferable');

    public readonly VoidPointer = new TsImportItem(this, imports.core, 'VoidPointer');
    public readonly StaticPointer = new TsImportItem(this, imports.core, 'StaticPointer');

    public readonly NativeType = new TsImportItem(this, imports.nativetype, 'NativeType');
    public readonly templateArgs = new TsImportItem(this, imports.nativetype, 'templateArgs');
    public readonly UnwrapType = new TsImportItem(this, imports.nativetype, 'UnwrapType');
    public readonly int32_t = new TsImportItem(this, imports.nativetype, 'int32_t');

    public readonly NativeTemplateClass = new TsImportItem(this, imports.complextype, 'NativeTemplateClass');
    public readonly NativeFunctionType = new TsImportItem(this, imports.complextype, 'NativeFunctionType');
    public readonly MemberPointer = new TsImportItem(this, imports.complextype, 'MemberPointer');

    public readonly MantleClass = new TsImportItem(this, imports.nativeclass, 'MantleClass');
    public readonly NativeClass = new TsImportItem(this, imports.nativeclass, 'NativeClass');

    public readonly dnf = new TsImportItem(this, imports.dnf, 'dnf');
    public readonly dll = new TsImportItem(this, imports.dll, 'dll');

    public readonly NativeClassType = new wrapperUtil.ImportItem(this, imports.nativeclass, 'NativeClassType');
    public readonly Wrapper = new wrapperUtil.ImportItem(this, imports.pointer, 'Wrapper');
    public readonly Ptr = new wrapperUtil.ImportItem(this, imports.pointer, 'Ptr');
    public readonly SharedPtr = new wrapperUtil.ImportItem(this, imports.sharedpointer, 'SharedPtr');
    public readonly CxxVectorToArray = new wrapperUtil.ImportItem(this, imports.cxxvector, 'CxxVectorToArray');

    private dnfMakeCall:tsw.Call|null = null;
    private dnfOverloadNew:tsw.Call|null = null;
    private dllCurrent:tsw.Value|null = null;
    private ctorProperty:tsw.BracketProperty|null = null;
    public currentClassId:Identifier|null = null;

    public readonly doc:MinecraftDocument;

    constructor(ids:Identifier[]) {
        super('./minecraft');
        this.doc = new MinecraftDocument(this, ids);
    }

    private _getVarName(type:Identifier):string {
        let baseid:Identifier = type;
        for (;;) {
            if (baseid.paramVarName != null) return baseid.paramVarName;
            if (baseid.data instanceof PdbId.Decorated) {
                baseid = baseid.data.base;
            } else if (baseid.data instanceof PdbId.Function) {
                if (baseid.data instanceof PdbId.FunctionType) {
                    return 'cb';
                } else {
                    baseid = baseid.data.functionBase;
                }
            } else if (baseid.templateBase !== null) {
                baseid = baseid.templateBase;
            } else {
                break;
            }
        }
        if (baseid.data instanceof PdbId.MemberPointerType) {
            return this._getVarName(baseid.data.memberPointerBase)+'_m';
        }
        if (baseid.data instanceof PdbId.FunctionTypeBase) {
            return 'fn';
        }
        if (baseid.data instanceof PdbId.FunctionType) {
            if (baseid.data.returnType === null) throw Error(`returnType unresolved (${baseid})`);
            return this._getVarName(baseid.data.returnType)+'_fn';
        }
        if (baseid.data instanceof PdbId.MemberFunctionType) {
            return this._getVarName(baseid.data.memberPointerBase)+'_fn';
        }
        if (baseid.is(PdbId.TypeUnion)) return 'arg';
        let basename = this.getNameOnly(baseid).toName(tsw.Kind.Value).value.name;
        if (basename.endsWith('_t')) basename = basename.substr(0, basename.length-2);
        basename = styling.toCamelStyle(basename, /[[\] :*]/g, false);
        return basename;
    }

    makeParamNamesByTypes(ids:Identifier[]):tsw.Name[] {
        const namemap = new Map<string, {index:number, counter:number}>();
        const tswNames:string[] = new Array(ids.length);
        for (let i=0;i<ids.length;i++) {
            const basename = this._getVarName(ids[i]);

            let name = basename;
            const info = namemap.get(name);
            if (info == null) {
                namemap.set(name, {index:i, counter:1});
            } else {
                if (info.counter === 1) {
                    tswNames[info.index] = basename + '_' + info.counter;
                }
                info.counter++;
                name = basename + '_' + info.counter;
            }
            tswNames[i] = name;
        }
        return tswNames.map(name=>new tsw.Name(name));
    }

    makeParamNamesByLength(len:number):tsw.Name[] {
        const tswNames:tsw.Name[] = new Array(len);
        for (let i=0;i<len;i++) {
            tswNames[i] = new tsw.Name('arg'+i);
        }
        return tswNames;
    }

    insideOf(namespace:Identifier):boolean {
        return namespace === this.doc.decl.currentNs;
    }

    getIdName(item:Identifier):string {
        if (item.redirectedFrom !== null) {
            return this.getIdName(item.redirectedFrom);
        }
        if (item.templateBase !== null) {
            return this.getIdName(item.templateBase)+'_'+item.templateParameters!.map(id=>this.getIdName(id)).join('_');
        }
        if (item.data instanceof PdbId.Decorated) {
            return this.getIdName(item.data.base);
        }
        if (item.data instanceof PdbId.MemberPointerType) {
            return this.getIdName(item.data.memberPointerBase)+'_m';
        }
        if (item.data instanceof PdbId.MemberFunctionType) {
            return this.getIdName(item.data.memberPointerBase)+'_fn';
        }
        const nameobj = this.getNameOnly(item);
        if (!(nameobj instanceof tsw.NameProperty)) throw Error(`is not name(${item})`);
        let name = nameobj.name.replace(/[{},<>]/g, v=>idremap[v]);
        if (name.startsWith('-')) {
            name = 'minus_'+name.substr(1);
        }
        if (item.parent !== null && item.parent !== PdbId.global) {
            name = this.getIdName(item.parent) + '_' + name;
        }
        return name;
    }

    getNameOnly(item:Identifier):tsw.Property {
        if (item.templateBase !== null) {
            throw Error(`${item}: getName with template`);
        }
        if (item.is(PdbId.TypeUnion)) {
            throw Error(`${item}: getName with type union`);
        }
        if (item.is(PdbId.Decorated)) {
            throw Error(`getName with deco type(${item})`);
        }
        if (item.is(PdbId.FunctionType) || item.is(PdbId.FunctionTypeBase)) {
            throw Error(`${item.name}: getName with function type`);
        }
        if (item.parent === null) {
            throw Error(`${item.name} has not parent, (type=${item.data.constructor.name})`);
        }
        if (item.is(PdbId.LambdaClass)) {
            throw new IgnoreThis(`lambda (${item})`);
        }
        if (item.is(PdbId.KeyType)) {
            throw new IgnoreThis(`temporal key (${item})`);
        }

        let name = item.removeParameters().name;
        if (item.is(PdbId.Function) || item.is(PdbId.FunctionBase)) {
            if (item.data.isConstructor) {
                return tswNames.constructWith;
            } else if (item.data.isDestructor) {
                const NativeType = this.NativeType.importValue();
                return new tsw.BracketProperty(NativeType.member(tswNames.dtor));
            }
        }

        if (item.is(PdbId.VCall)) {
            return new tsw.NameProperty('__vcall_'+this.getIdName(item.data.param));
        }
        const remapped = specialNameRemap.get(name);
        let matched:RegExpMatchArray|null;
        if (remapped != null) {
            name = remapped;
        } else if (name.startsWith('`')) {
            if (item.params !== null) {
                const params = [...item.params];
                if (name.startsWith("`vector deleting destructor'")) {
                    name = '__vector_deleting_destructor_'+params.join('_');
                } else if (name.startsWith("`vftable'")) {
                    name = '__vftable_for_'+params.map(id=>this.getIdName(id)).join('_');
                } else if (name.startsWith("`vbtable'")) {
                    name = '__vbtable_for_'+params.map(id=>this.getIdName(id)).join('_');
                } else {
                    name = '__'+name.replace(/[`' ()\-,0-9]/g, '');
                    // name = '__'+name.replace(/[`' ()-,0-9]/g, '')+'_'+item.adjustors.join('_').replace(/-/g, 'minus_');
                }
            } else {
                name = '__'+name.replace(/[`' ()\-,0-9]/g, '');
            }
        } else if ((matched = name.match(adjustorRegExp)) !== null) {
            name = matched[1]+'_adjustor_'+matched[2];
        } else if (name.startsWith('operator ')) {
            if (item.is(PdbId.FunctionBase) || item.is(PdbId.TemplateFunctionBase)) {
                for (const over of item.data.allOverloads()) {
                    if (over.data.returnType === null) throw Error(`Unresolved return type ${over}`);
                    name = 'operator_castto_'+this.getIdName(over.data.returnType);
                    break;
                }
            } else {
                throw Error(`failed to get return type(${item})`);
            }
        }
        return new tsw.NameProperty(name);
    }

    getClassType<T extends tsw.Kind>(item:Identifier, kind:T, absoluteValue?:boolean):tsw.ItemPair|null {
        if (!item.isType && (item.parent!.data instanceof PdbId.ClassLike)) {
            return this.toTsw(item.parent!, kind, {absoluteValue});
        } else {
            return null;
        }
    }

    makeParameterDecls(paramTypes:tsw.ItemPair[], paramNames:tsw.Name[], isStaticMethod?:boolean, classType?:tsw.Type|null):tsw.DefineItem[] {
        const declaration:tsw.DefineItem[] = [];
        for (let i=0;i<paramNames.length;i++) {
            declaration[i] = new tsw.VariableDefineItem(paramNames[i], paramTypes[i].type);
        }
        if (classType != null) {
            if (isStaticMethod) {
                const NativeClassType = this.NativeClassType.importType();
                classType = new tsw.TemplateType(NativeClassType, [classType]);
            }
            declaration.unshift(new tsw.VariableDefineItem(tsw.Name.this, classType));
        }
        return declaration;
    }

    toTswTemplateParameters<T extends tsw.Kind>(args:(Identifier[]|Identifier)[], kind:T, absoluteValue?:boolean):tsw.ItemPair[] {
        return args.map((id):tsw.ItemPair=>{
            const opts = {absoluteValue};
            let out:tsw.ItemPair;
            if (id instanceof Array) {
                const params = id.map(id=>this.toTsw(id, kind, opts));
                out = new tsw.ItemPair;
                if ((kind & tsw.Kind.Value) !== 0) {
                    const templateArgs = this.templateArgs.importValue();
                    out.value = new tsw.Call(templateArgs, params.map(id=>id.value));
                }
                if ((kind & tsw.Kind.Type) !== 0) {
                    out.type = new tsw.Tuple(params.map(id=>id.type));
                }
            } else {
                out = this.toTsw(id, kind, opts);
            }
            return out;
        });
    }

    toTswReturn(type:Identifier, kind:tsw.Kind, opts:MakeFuncOptions, absoluteValue?:boolean):tsw.ItemPair {
        const returnType = this.toTsw(type, kind, {absoluteValue});
        return this.plaining(type, returnType, opts);
    }

    toTswParameters(items:Identifier[], kind:tsw.Kind, absoluteValue?:boolean):tsw.ItemPair[] {
        return items.map((item, idx)=>{
            const v = this.toTsw(item, kind, {absoluteValue});
            return this.plaining(item, v, null);
        });
    }

    wrapAnyTemplate(type:tsw.Type, item:Identifier):tsw.Type {
        if (type === null) return type;
        if (!item.is(PdbId.TemplateClassBase)) return type;

        const tinfo = TemplateInfo.from(item);
        if (tinfo.paramTypes.length === 0) return type;

        if (item.templateRedirects != null) {
            for (const redirect of item.templateRedirects) {
                const templates = tinfo.paramTypes.map(()=>any_t);
                return redirect.redirect(item, templates, tsw.Kind.Type, {}).type;
            }
        }
        const params = tinfo.paramTypes.map(()=>tsw.BasicType.any);
        return new tsw.TemplateType(type, params);
    }

    toTsw(item:Identifier, kind:tsw.Kind, opts:ToTswOptions = {}):tsw.ItemPair {
        if (item.is(PdbId.LambdaClass)) {
            throw new IgnoreThis(`lambda (${item})`);
        }
        if (item.parent === PdbId.global && item.name.startsWith('`')) {
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
            if (item.is(PdbId.Decorated)) {
                if (item.data.deco === DecoSymbol.const) {
                    return Const.wrap(this.toTsw(item.data.base, kind, opts));
                }
                if (item.data.deco !== null && item.data.deco.name === '[0]') throw new IgnoreThis(`incomprehensible syntax(${item})`);
            }
            if (item.is(PdbId.TypeUnion)) {
                if (kind !== tsw.Kind.Type) throw Error(`union is not type (${item})`);

                const types:tsw.Type[] = [];
                let ignored:IgnoreThis|null = null;
                for (const union of item.data.unionedTypes) {
                    try {
                        const type = this.toTsw(union, tsw.Kind.Type, opts);
                        types.push(type.type);
                    } catch (err) {
                        if (!(err instanceof IgnoreThis)) throw err;
                        ignored = err;
                    }
                }
                if (types.length === 0) {
                    throw ignored || new IgnoreThis('No types');
                }
                return {
                    type: new tsw.TypeOr(types)
                } as any;
            }
            if (!opts.noJsType && item.jsType != null) {
                if (item.jsTypeOnly != null) kind &= ~tsw.Kind.Type;
                let out:tsw.ItemPair;
                if (item.jsType instanceof tsw.ItemPair) {
                    out = item.jsType;
                } else if (item.jsType instanceof TsImportItem) {
                    out = item.jsType.import(kind);
                } else {
                    out = item.jsType(item, kind);
                }
                if (item.jsTypeOnly != null) {
                    out.type = item.jsTypeOnly;
                }
                if (!opts.noTemplate) {
                    out.type = this.wrapAnyTemplate(out.type, item);
                }
                return out;
            }
            if (item.isValue && (kind & tsw.Kind.Type) !== 0) {
                const out = this.toTsw(item.getTypeOfIt(), tsw.Kind.Type);
                if ((kind & tsw.Kind.Value) !== 0) {
                    recursiveCheck.delete(item);
                    out.value = this.toTsw(item, tsw.Kind.Value, opts).value;
                }
                return out;
            }
            if (item.is(PdbId.Decorated)) {
                let isRef = false;
                switch (item.data.deco) {
                case DecoSymbol['&']:
                case DecoSymbol['&&']:
                    isRef = true;
                    // fall through
                case DecoSymbol['*']: {
                    const baseitem = item.data.base;
                    if (item.isValue && item.data.deco === DecoSymbol['&']) {
                        if (baseitem.address === 0) {
                            PdbId.printOnProgress(`[symbolwriter.ts] ${item.source}: address not found`);
                            throw new IgnoreThis(`address not found (${item})`);
                        }
                        let out:tsw.ItemPair;
                        if ((kind & tsw.Kind.Value) !== 0) {
                            if (baseitem.is(PdbId.Function)) {
                                out = new tsw.ItemPair;
                                out.value = this.getOverloadVarId(baseitem);
                                if ((kind & tsw.Kind.Type) !== 0) {
                                    out.type = this.toTsw(baseitem, tsw.Kind.Type).type;
                                }
                            } else {
                                out = new tsw.ItemPair;
                                out.value = this.getAddressVarId(baseitem);
                                if ((kind & tsw.Kind.Type) !== 0) {
                                    out.type = this.toTsw(baseitem, tsw.Kind.Type).type;
                                }
                            }
                        } else {
                            out = this.toTsw(baseitem, kind, {absoluteValue: opts.absoluteValue});
                        }
                        return out;
                    }
                    let out = this.toTsw(baseitem, kind, {absoluteValue: opts.absoluteValue});
                    if (baseitem.is(PdbId.FunctionType)) {
                        return out;
                    }
                    if (baseitem.is(PdbId.MemberPointerType)) {
                        return out;
                    }

                    if (out.type != null) {
                        if (!isRef) out.type = out.type.or(tsw.BasicType.null);
                    }
                    if (opts.isField) {
                        out = refCall.wrap(out);
                    } else {
                        if (isRef) out = Ref.wrap(out);
                        else out = this.Ptr.wrap(out);
                    }
                    return out;
                }
                }
            }

            let out = new tsw.ItemPair;
            if (item.templateBase !== null) {
                const base:Identifier = item.templateBase;
                out = this.toTsw(base, kind, {...opts, noTemplate:true});
            } else if (item.is(PdbId.MemberPointerType)) {
                const base = this.toTsw(item.data.memberPointerBase, kind, {absoluteValue:opts.absoluteValue});
                const type = this.toTsw(item.data.type, kind, {absoluteValue:opts.absoluteValue});
                const MemberPointer = this.MemberPointer.import(kind);
                if (MemberPointer.type !== null) {
                    out.type = new tsw.TemplateType(MemberPointer.type, [base.type!, type.type!]);
                }
                if (MemberPointer.value !== null) {
                    out.value = MemberPointer.value.call(tswNames.make, [base.value!, type.value!]);
                }
                return out;
            } else if (item.is(PdbId.FunctionType)) {
                if (item.data.returnType === null) throw Error(`Unresolved return type (${item})`);
                const func = new FunctionMaker(this, kind, false, item.data.returnType, item.data.functionParameters, null);
                return func.makeType();
            } else {
                const prop = this.getNameOnly(item);
                if (item.hasNonGlobalParent()) {
                    const insideOfNamespace = this.insideOf(item.parent);
                    if (insideOfNamespace && !opts.absoluteValue) {
                        out = prop.toName(kind);
                    } else {
                        if (!insideOfNamespace) {
                            out = this.toTsw(item.parent, kind, {noTemplate: true, absoluteValue:opts.absoluteValue});
                            if (out.type != null) {
                                out.type = out.type.member(prop);
                            }
                        } else { // absoluteValue=true
                            out = this.toTsw(item.parent, kind & tsw.Kind.Value, {noTemplate: true, absoluteValue:true});
                            out.type = prop.toName(kind & tsw.Kind.Type).type;
                        }
                        if (out.value != null) {
                            if (!item.isStatic && !item.isType &&
                                item.parent.is(PdbId.ClassLike) &&
                                (item.is(PdbId.Function) || item.is(PdbId.FunctionBase) || item.is(PdbId.TemplateFunctionBase))) {
                                out.value = out.value.member(tsw.NameProperty.prototypeName);
                            }
                            out.value = out.value.member(prop);
                        }
                    }
                } else {
                    out = prop.toName(kind);
                }
            }

            const tinfo = TemplateInfo.from(item);
            if (tinfo.parameters.length === 0 && item.is(PdbId.Enum)) {
                out.value = this.int32_t.importValue();
            }

            if (opts.noTemplate) {
                return out;
            }

            if (tinfo.parameters.length !== 0) {
                if (item.is(PdbId.Function)) {
                    if (out.type != null) {
                        if (item.data.returnType === null) throw Error(`Unresolved return type (${item})`);
                        const classType = this.getClassType(item, tsw.Kind.Type);
                        const retType = this.toTsw(item.data.returnType, tsw.Kind.Type).type;
                        const types = this.toTswParameters(item.data.functionParameters, tsw.Kind.Type, opts.absoluteValue);
                        const tswNames = this.makeParamNamesByTypes(item.data.functionParameters);
                        const params = this.makeParameterDecls(types, tswNames, item.isStatic, classType?.type);
                        out.type = new tsw.FunctionType(retType, params);
                    }
                    if (out.value != null) {
                        out.value = this.getOverloadVarId(item);
                    }
                    return out;
                } else {
                    const base:(Identifier&PdbId<PdbId.TemplateBase>)|null = item.templateBase;
                    if (base !== null && base !== this.currentClassId) {
                        if (base.templateRedirects != null) {
                            for (const redirect of base.templateRedirects) {
                                const templates = tinfo.infer(redirect.templates);
                                if (templates !== null) {
                                    return redirect.redirect(base, templates, kind, {absoluteValue: opts.absoluteValue});
                                }
                            }
                        }
                    }

                    const params = this.toTswTemplateParameters(tinfo.parameters, kind, opts.absoluteValue);
                    if (out.type != null) {
                        out.type = new tsw.TemplateType(out.type, params.map(v=>v.type!));
                    }
                    if (out.value != null) {
                        out.value = new tsw.DotCall(out.value, tswNames.make, params.map(v=>v.value!));
                    }
                    return out;
                }
            } else {
                out.type = this.wrapAnyTemplate(out.type, item);
            }
            return out;
        } finally {
            recursiveCheck.delete(item);
        }
    }

    plaining(raw:Identifier, item:tsw.ItemPair, opts:MakeFuncOptions|null):tsw.ItemPair {
        try {
            // remove const
            if (Const.is(item)) {
                item = Const.unwrap(item);
            }

            let pointerRemoved = false;
            if (isPrimitiveType(item, raw)) {
                if (Ref.is(item)) {
                    const inner = Ref.unwrap(item);
                    if (Const.is(inner)) {
                        // Ref<Const<T>> -> T.ref()
                        item = refCall.wrap(Const.unwrap(inner));
                        pointerRemoved = true;
                    }
                }
            } else {
                if (Ref.is(item) || this.Ptr.is(item)) {
                    item = Ref.unwrap(item);
                    // Ptr<T> or Ref<T> -> T
                    pointerRemoved = true;
                }
            }
            if (Const.is(item)) {
                item = Const.unwrap(item);
            }
            const PtrToRef = (item:tsw.ItemPair):(tsw.ItemPair|null)=> {
                if (Ref.is(item)) {
                    item = Ref.unwrap(item);
                } else if (this.Ptr.is(item)) {
                    item = wrapperUtil.unwrap(item);
                } else {
                    return null;
                }
                return refCall.wrap(plainingInner(item));
            };
            const plainingInner = (item:tsw.ItemPair):tsw.ItemPair=> {
                if (this.Wrapper.is(item)) {
                    const ref = PtrToRef(wrapperUtil.unwrap(item));
                    if (ref !== null) item = this.Wrapper.wrap(ref);
                }
                if (this.CxxVectorToArray.is(item)) {
                    let component = wrapperUtil.unwrap(item);
                    const ref = PtrToRef(component);
                    if (ref !== null) component = ref;

                    const out = new tsw.ItemPair;
                    if (component.type !== null) {
                        out.type = new tsw.ArrayType(component.type) as any;
                    }
                    if (component.value !== null) {
                        out.value = this.CxxVectorToArray.importValue().call(tswNames.make, [component.value]) as any;
                    }
                    return out;
                }
                return item;
            };
            item = plainingInner(item);
            if (opts !== null && item.type !== null) {
                item.type = typePlaining(item.type);
            }
            if (!pointerRemoved) {
                if (opts !== null) {
                    if (this.Wrapper.is(item)) {
                        item = wrapperUtil.unwrap(item);
                        opts.add(tswNames.structureReturn, tsw.Name.true);
                    } else if (!raw.isBasicType && !raw.is(PdbId.Enum)) {
                        opts.add(tswNames.structureReturn, tsw.Name.true);
                    }
                }
            }
        } catch (err) {
            PdbId.printOnProgress(`> Planing ${item.type || item.value} (symbolIndex=${raw.symbolIndex})`);
            throw err;
        }
        return item;
    }

    getOverloadVarId(item:Identifier):tsw.Name {
        if (item.tswVar != null) return item.tswVar;
        if (!item.is(PdbId.Function)) {
            throw Error(`is not function (${item})`);
        }
        const value = this.callDnfMakeOverload();
        return item.tswVar = this.doc.makeVariable(value);
    }

    getFunctionVarId(item:Identifier):tsw.Name {
        if (item.tswVar != null) return item.tswVar;
        if (!item.is(PdbId.TemplateFunctionBase) && !item.is(PdbId.FunctionBase)) {
            throw Error(`is not function base (${item})`);
        }
        const value = this.callDnfMake();
        return item.tswVar = this.doc.makeVariable(value);
    }

    getAddressVarId(item:Identifier):tsw.Name {
        if (item.tswVar != null) return item.tswVar;
        const value = this.importDllCurrent().call(tswNames.add, [tsw.constVal(item.address)]);
        return item.tswVar = this.doc.makeVariable(value);
    }

    callDnfMake():tsw.Call {
        if (this.dnfMakeCall !== null) return this.dnfMakeCall;

        const dnf = this.dnf.importValue();
        const dnfMake = new tsw.Name('$F');
        const assign = new tsw.VariableDef('const', [
            new tsw.VariableDefineItem(dnfMake, null, dnf.member(tswNames.make))
        ]);
        this.doc.decl.doc.unshift(assign);

        return this.dnfMakeCall = dnfMake.call([]);
    }

    callDnfMakeOverload():tsw.Call {
        if (this.dnfOverloadNew !== null) return this.dnfOverloadNew;
        const dnf = this.dnf.importValue();
        const dnfMakeOverload = new tsw.Name('$O');
        const assign = new tsw.VariableDef('const', [new tsw.VariableDefineItem(dnfMakeOverload, null, dnf.member('makeOverload'))]);
        this.doc.decl.doc.unshift(assign);
        return this.dnfOverloadNew = dnfMakeOverload.call([]);
    }

    importDllCurrent():tsw.Value {
        if (this.dllCurrent != null) return this.dllCurrent;
        const dll = this.dll.importValue();
        const dllCurrent = new tsw.Name('$C');
        const assign = new tsw.VariableDef('const', [new tsw.VariableDefineItem(dllCurrent, null, dll.member('current'))]);
        this.doc.decl.doc.unshift(assign);
        return this.dllCurrent = dllCurrent;
    }

    getNativeTypeCtor():tsw.BracketProperty {
        if (this.ctorProperty != null) return this.ctorProperty;
        const NativeType = this.NativeType.importValue();
        return this.ctorProperty = new tsw.BracketProperty(NativeType.member(tswNames.ctor));
    }

    existName(name:string):boolean {
        return super.existName(name) || this.doc.decl.existName(name);
    }

    existNameInScope(name:string):boolean {
        return super.existNameInScope(name) || this.doc.decl.existNameInScope(name);
    }

    parseAll():void {
        try {
            this.doc.decl.parseAll();
        } catch (err) {
            PdbId.printOnProgress(`> Parsing ${this.path}`);
            throw err;
        }
    }

    save():void {
        const head:tsw.BlockItem[] = this.imports.toTsw();
        head.unshift(...[
            `BDS Version: ${installedBdsVersion}`,
            ...ScriptWriter.generateWarningComment('bdsx/pdbparser/symbolwriter.ts')
        ].map(msg=>new tsw.Comment(msg)));

        const minecraftTsReady = new tsw.Name('minecraftTsReady');

        console.log(`[symbolwriter.ts] Writing ${this.path}.d.ts`);
        const decl = this.doc.decl.doc.cloneToDecl();
        decl.unshift(
            ...head,
            new tsw.TypeDef(Ref.type, minecraft.Ptr.importType().template(tswNames.T), [tswNames.T]),
            new tsw.TypeDef(Const.type, tswNames.T, [tswNames.T]),
        );
        decl.save(path.join(outDir,this.path)+'.d.ts');

        console.log(`[symbolwriter.ts] Writing ${this.path}.js`);
        const impl = this.doc.impl;
        impl.doc.unshift(new tsw.ImportOnly('./minecraft_impl'));
        impl.doc.unshiftBlock(this.doc.decl.doc);
        impl.doc.unshift(...head);
        impl.doc.write(
            new tsw.Import([[minecraftTsReady.toProperty(), minecraftTsReady]], './minecraft_impl/ready'),
            minecraftTsReady.call('resolve', [])
        );

        impl.doc.cloneToJS().save(path.join(outDir,this.path)+'.js');
    }
}

// std.make('string').redirect(std.find('basic_string<char,std::char_traits<char>,std::allocator<char> >'));
PdbId.parse('std::ostream').redirect(PdbId.parse('std::basic_ostream<char,std::char_traits<char> >'));
PdbId.parse('std::istream').redirect(PdbId.parse('std::basic_istream<char,std::char_traits<char> >'));
PdbId.parse('std::iostream').redirect(PdbId.parse('std::basic_iostream<char,std::char_traits<char> >'));
PdbId.parse('std::stringbuf').redirect(PdbId.parse('std::basic_stringbuf<char,std::char_traits<char>,std::allocator<char> >'));
PdbId.parse('std::istringstream').redirect(PdbId.parse('std::basic_istringstream<char,std::char_traits<char>,std::allocator<char> >'));
PdbId.parse('std::ostringstream').redirect(PdbId.parse('std::basic_ostringstream<char,std::char_traits<char>,std::allocator<char> >'));
PdbId.parse('std::stringstream').redirect(PdbId.parse('std::basic_stringstream<char,std::char_traits<char>,std::allocator<char> >'));

PdbId.parse('RakNet::RakNetRandom').determine(PdbId.Class);

console.log(`[symbolwriter.ts] Filtering...`);

const ids:Identifier[] = [];
const packets:Identifier[] = [];
for (const item of PdbId.global.children) {
    if (item.isBasicType) {
        // basic types
    } else if (item.name.startsWith('`')) {
        // private symbols
    } else if (item.data instanceof PdbId.Constant) {
        // numbers
    } else if (item.name.startsWith('{')) {
        // code chunk?
    } else if (item.name.startsWith('__imp_')) {
        // import
    } else if (/^main\$dtor\$[0-9]+$/.test(item.name)) {
        // dtor in main
    } else {
        const packetId = resolvePacketClasses.getId(item);
        if (packetId == null) {
            ids.push(item);
        } else {
            packets.push(item);
        }
    }
}
ids.sort((a,b)=>a.name.localeCompare(b.name));
packets.sort((a,b)=>resolvePacketClasses.getId(a)!-resolvePacketClasses.getId(b)!);
const minecraft = new MinecraftTsFile(ids.concat(packets));
minecraft.callDnfMake();
minecraft.callDnfMakeOverload();
const Const = new wrapperUtil.TypeWrapper('Const');
const Ref = new wrapperUtil.TypeWrapper('Ref');
const refCall = new wrapperUtil.RefWrapper('ref');
const PointerLike = new wrapperUtil.ImportItem(minecraft, imports.nativetype, 'PointerLike');

new Definer('bool').js(['bool_t', imports.nativetype]).paramName('b');
new Definer('void').js(['void_t', imports.nativetype], {jsTypeOnly: tsw.BasicType.void}).paramName('v');
new Definer('std::nullptr_t').js(['nullptr_t', imports.nativetype], {jsTypeOnly: tsw.BasicType.null}).paramName('v');
new Definer('float').js(['float32_t', imports.nativetype]).paramName('f');
new Definer('double').js(['float64_t', imports.nativetype]).paramName('d');
new Definer('char').js(['int8_t', imports.nativetype]).paramName('c');
new Definer('char const *').js(['StringUtf8', imports.nativetype]).paramName('str');
new Definer('wchar_t const *').js(['StringUtf16', imports.nativetype]).paramName('str');
new Definer('char *').js(PointerLike).paramName('char_ptr');
new Definer('wchar_t').js(['uint16_t', imports.nativetype]).paramName('wc');
new Definer('char signed').js(['int8_t', imports.nativetype]).paramName('sc');
new Definer('char unsigned').js(['uint8_t', imports.nativetype]).paramName('uc');
new Definer('short').js(['int16_t', imports.nativetype]).paramName('s');
new Definer('short unsigned').js(['uint16_t', imports.nativetype]).paramName('us');
new Definer('int').js(['int32_t', imports.nativetype]).paramName('i');
new Definer('int unsigned').js(['uint32_t', imports.nativetype]).paramName('u');
new Definer('long').js(['int32_t', imports.nativetype]).paramName('i');
new Definer('long unsigned').js(['uint32_t', imports.nativetype]).paramName('u');
new Definer('__int64').js(['bin64_t', imports.nativetype], {jsTypeNullable: true}).paramName('i');
new Definer('__int64 unsigned').js(['bin64_t', imports.nativetype], {jsTypeNullable: true}).paramName('u');
new Definer('void*').js(PointerLike, {jsTypeNullable: true}).paramName('p');
new Definer('void const*').js(PointerLike, {jsTypeNullable: true}).paramName('p');
new Definer('typename').js(['Type', imports.nativetype]).paramName('t');
const any_t = new Definer('any').js(tsw.ItemPair.any).paramName('v').item;
const anyArray = new tsw.ArrayType(tsw.BasicType.any);
new Definer(any_t.decorate(DecoSymbol.make('a', '[]'))).js(new tsw.ItemPair(null, anyArray)).paramName('args');
new Definer('never').js(tsw.ItemPair.never).paramName('v');
new Definer('std::basic_string<char,std::char_traits<char>,std::allocator<char> >').js(['CxxString', imports.nativetype]).paramName('str');
new Definer('gsl::basic_string_span<char const,-1>').js(['GslStringSpan', imports.nativetype]).paramName('str');
new Definer(PdbId.make('...')).js(['NativeVarArgs', imports.complextype]).paramName('...args');
new Definer('gsl::not_null<#KEY0>').templateRedirect((item, templates, kind, opts)=>minecraft.Wrapper.wrap(minecraft.toTsw(templates[0], kind, opts))).paramName('v');
new Definer('std::unique_ptr<#KEY0, std::default_delete<#KEY0>>').templateRedirect((item, templates, kind, opts)=>minecraft.Ptr.wrap(minecraft.toTsw(templates[0], kind, opts)), {exportOriginal: true}).paramName('v');
new Definer('std::shared_ptr<#KEY0>').templateRedirect((item, templates, kind, opts)=>minecraft.SharedPtr.wrap(minecraft.toTsw(templates[0], kind, opts))).paramName('v');
new Definer('AutomaticID<Dimension, int>').js(['DimensionId', imports.enums]).paramName('dim');
new Definer('Packet').item.isMantleClass = true;
new Definer('CxxStringWrapper').js(['CxxStringWrapper', imports.pointer]).paramName('data');

// NetworkHandler::_sendInternal - 3rd parameter, CxxString to CxxStringWrapper
const _sendInternal = PdbId.parse('NetworkHandler::_sendInternal');
if (_sendInternal.is(PdbId.FunctionBase)) {
    _sendInternal.data.overloads[0].data.functionParameters[2] = PdbId.parse('CxxStringWrapper');
}

reduceTemplateTypes();
new Definer('std::vector<#KEY0>').templateRedirect((item, templates, kind, opts)=>minecraft.CxxVectorToArray.wrap(minecraft.toTsw(templates[0], kind, opts))).paramName('array');

minecraft.parseAll();

// set packet Ids
const packetClasses:[tsw.NumberProperty, tsw.Value][] = [];
const packetTypes:tsw.ClassField[] = [];
for (const packet of resolvePacketClasses.list.sort((a,b)=>a.packetId!-b.packetId!)) {
    const cls = minecraft.doc.decl.doc.getValue(packet.name);
    if (cls == null) {
        console.error(`[symbolwriter.ts] Packet not found: ${packet.name}`);
        continue;
    }
    if (!(cls instanceof tsw.Class)) {
        console.error(`[symbolwriter.ts] Packet is not class: ${packet.name}`);
        continue;
    }
    const packetId = new tsw.Constant(packet.packetId!);
    cls.unshift(new tsw.ClassField(null, true, true, tswNames.ID, new tsw.TypeName(packet.packetId+''), packetId));
    const packetIdProp = new tsw.NumberProperty(packet.packetId!);
    packetClasses.push([packetIdProp, cls.name]);
    packetTypes.push(new tsw.ClassField(null, false, false, packetIdProp, new tsw.TypeOf(cls.name)));
}
const packetClass = minecraft.doc.decl.doc.getValue('Packet') as tsw.Class;
packetClass.unshift(new tsw.ClassField(null, true, true, tswNames.idMap, new tsw.ObjectType(packetTypes)));
minecraft.doc.impl.doc.assign(packetClass.name.member(tswNames.idMap), new tsw.ObjectDef(packetClasses));

minecraft.save();
console.log(`[symbolwriter.ts] done`);
