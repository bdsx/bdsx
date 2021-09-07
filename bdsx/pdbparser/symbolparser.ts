import { AbstractClass } from "../common";
import { templateName } from "../templatename";
import { LanguageParser } from "../textparser";
import { arraySame, isBaseOf } from "../util";
import { PdbCache } from "./pdbcache";
import ProgressBar = require('progress');

export class DecoSymbol {
    public readonly needSpace:boolean;

    private constructor(
        public readonly key:string,
        public readonly name:string,
        public readonly arraySize:number|null = null) {
        this.needSpace = /^[A-Za-z]/.test(name);
    }

    static readonly const = new DecoSymbol('c', 'const');
    static readonly unsigned = new DecoSymbol('u', 'unsigned');
    static readonly signed = new DecoSymbol('s', 'signed');
    static readonly noexcept = new DecoSymbol('e', 'noexcept');
    static readonly '&' = new DecoSymbol('l', '&');
    static readonly '&&' = new DecoSymbol('r', '&&');
    static readonly '|' = new DecoSymbol('o', '|');
    static readonly '*' = new DecoSymbol('p', '*');

    static make(key:string, name:string, arraySize:number|null = null):DecoSymbol {
        const already = DecoSymbol.all.get(key);
        if (already != null) return already;
        const deco = new DecoSymbol(key, name, arraySize);
        DecoSymbol.all.set(key, deco);
        return deco;
    }
    static array(count:number):DecoSymbol {
        return DecoSymbol.make(count+'', '['+count+']', count);
    }

    private static readonly all = new Map<string, DecoSymbol>();

    toString():string {
        return `[DecoSymbol ${this.name}]`;
    }
}

const OPERATORS = new Set<string>([
    '::',
    '&&',
]);
const NUMBER_ONLY = /^[0-9]+$/;

const OPERATORS_FOR_OPERATOR = new Set<string>([
    '++',
    '--',
    '>>',
    '<<',
    '&&',
    '||',
    '!=',
    '==',
    '>=',
    '<=',
    '()',
    '[]',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '&=',
    '^=',
    '|=',
    '<<=',
    '>>=',
    '->',
]);

function functionBaseDeterminator(id:PdbId<any>, param:PdbId<PdbId.Data>|null):void {
    id.determine(PdbId.FunctionBase);
    if (param === null) return;
    id.params = [param];
}
function defaultDeterminator(id:PdbId<any>, param:PdbId<PdbId.Data>|null):void {
    if (param === null) return;
    id.params = [param];
}

interface SpecialNameInfo {
    name:string;
    hasParam?:boolean;
    determinator?:((id:PdbId<any>, param:PdbId<PdbId.Data>|null)=>void);
}

// [name, hasParam, determinator]
const SPECIAL_NAMES:(SpecialNameInfo|string)[] = [
    {
        name: "dynamic initializer for '",
        hasParam: true,
    },
    {
        name: "dynamic atexit destructor for '",
        hasParam: true,
        determinator: functionBaseDeterminator,
    },
    "RTTI Complete Object Locator'",
    "RTTI Class Hierarchy Descriptor'",
    "RTTI Base Class Array'",
    "anonymous namespace'",
    "scalar deleting destructor'",
    "eh vector constructor iterator'",
    "eh vector copy constructor iterator'",
    "eh vector destructor iterator'",
    {
        name: "vector deleting destructor'",
        determinator: functionBaseDeterminator,
    },
    "RTTI Type Descriptor'",
    "vbase destructor'",
];

const FIELD_FOR_CLASS = new Set<string>([
    "`vector deleting destructor'",
    "`scalar deleting destructor'",
]);

const SKIP = {};

// "operator=",
// "operator+",
// "operator-",
// "operator*",
// "operator/",
// "operator%",

// "operator()",
// "operator[]",

// "operator==",
// "operator!=",
// "operator>=",
// "operator<=",
// "operator>",
// "operator<",

// "operator+=",
// "operator-=",
// "operator*=",
// "operator/=",
// "operator%=",

// "operator>>",
// "operator<<",

let symbolIndex = -1;
let idCounter = 0;

function unionIfAny(from:PdbId<PdbId.Data>, other:PdbId<PdbId.Data>):PdbId<PdbId.Data>|null {
    if (from === other) return from;
    if (from === PdbId.any_t || other === PdbId.any_t) return PdbId.any_t;
    if (from.templateBase !== null && from.templateBase === other.templateBase) {
        if (from.templateParameters!.length !== other.templateParameters!.length) return null;
        const params:PdbId<PdbId.Data>[] = [];
        for (let i=0;i<from.templateParameters!.length;i++) {
            const param = unionIfAny(from.templateParameters![i], other.templateParameters![i]);
            if (param === null) return null;
            params.push(param);
        }
        return from.templateBase.data.makeSpecialized(params);
    }
    return null;
}
function unionAdd(types:Set<PdbId<PdbId.Data>>, other:PdbId<PdbId.Data>):PdbId<PdbId.Data>|null {
    if (other.data instanceof PdbId.TypeUnion) {
        throw new IdError(`is unionedType`, other);
    }
    if (other === PdbId.any_t) {
        return PdbId.any_t;
    }
    if (types.has(other)) {
        return null;
    }
    for (const t of types) {
        const res = unionIfAny(t, other);
        if (res !== null && t !== res) {
            types.delete(t);
            types.add(res);
            return null;
        }
    }
    types.add(other);
    return null;
}
function getKey<T extends PdbId.Data>(key:string, orCreate:(key:string)=>PdbId<T>):PdbId<T> {
    let item = PdbId.keyMap.get(key);
    if (item != null) return item;
    item = orCreate(key);
    PdbId.keyMap.set(key, item);
    return item;
}

function corrupted(message:string):never {
    PdbId.printOnProgress(`[symbolparser.ts] corrupted: ${message}`);
    console.log(`[symbolparser.ts] symbolIndex: ${symbolIndex}`);
    console.log(`[symbolparser.ts] symbol: ${parser.context}`);
    console.log();
    throw SKIP;
}

const keys:PdbId<PdbId.Key>[] = [];

class IdError extends Error {
    public readonly ids:PdbId<PdbId.Data>[];
    constructor(message:string, ...ids:(PdbId<PdbId.Data>|null)[]) {
        super(message);
        this.ids = ids.filter(v=>v !== null) as PdbId<PdbId.Data>[];
    }
}

export class PdbId<DATA extends PdbId.Data> {
    public symbolIndex = symbolIndex;
    public id = ++idCounter;
    public readonly originalName:string;
    public parent:PdbId<PdbId.Data>|null = null;
    public data:DATA = new PdbId.Data(this) as any;
    public isPrivate = false;
    public isStatic = false;
    public isValue = false;
    public isConst = false;
    public isType = false;
    public isThunk = false;
    public isBasicType = false;
    public modifier:string|null = null;
    public address = 0;
    public ref = 0;
    public source = '';
    public redirectedFrom:PdbId<PdbId.Data>|null = null;
    public templateBase:PdbId<PdbId.TemplateBase>|null = null;
    public templateParameters:PdbId<PdbId.Data>[]|null = null;
    public params:PdbId<PdbId.Data>[]|null = null;

    public readonly children:PdbId<PdbId.Data>[] = [];

    is<T extends PdbId.Data>(kind:AbstractClass<T>):this is {data:T} {
        return (this.data instanceof (kind as any)) || this.data.instanceOf(kind);
    }

    compareTemplates(base:PdbId<PdbId.TemplateBase>|null, templates:PdbId<PdbId.Data>[]):void {
        const sdata = this.data;
        if (this.templateParameters === null) {
            throw new IdError(`this does not have parameters`, this);
        }
        if (sdata instanceof PdbId.Function && (sdata.isConstructor || sdata.isDestructor)) {
            // ctor or dtor
        } else {
            for (let i=0;i<templates.length;i++) {
                if (this.templateParameters[i] !== templates[i]) {
                    throw new IdError(`parameters mismatched. (${this.templateParameters![i]} != ${templates[i]})`, this);
                }
            }
            if (this.templateBase !== base) {
                throw new IdError(`template base mismatched. (${this.templateBase} != ${base})`, this);
            }
        }
    }

    static makeTypeUnionKey(types:PdbId<PdbId.Data>[]):string {
        return '!'+types.map(a=>a.id).join('|');
    }
    static makeNoExceptKey(base:PdbId<PdbId.Data>):string {
        return `!${base.id}N`;
    }
    static makeDecoKey(base:PdbId<PdbId.Data>, deco:DecoSymbol):string {
        return `!${base.id}D${deco.key}`;
    }
    static makeChildKey(base:PdbId<PdbId.Data>, child:string):string {
        return `!${base.id}/${child}`;
    }
    static makeMemberFunctionTypeKey(base:PdbId<PdbId.MemberFunctionType>):string {
        const returnType = base.data.returnType;
        if (returnType === null) throw new IdError(`return type is not defined`, base);
        return `!m${returnType.id} ${base.data.memberPointerBase.id}`;
    }
    static makeFunctionTypeKey(returnType:PdbId<PdbId.Function>):string {
        return `!f${returnType.id}`;
    }
    static makeFunctionKey(base:PdbId<PdbId.Data>, args:PdbId<PdbId.Data>[]):string {
        return `!${base.id}(${args.map(v=>v.id).join(',')})`;
    }
    static makeTemplateKey(base:PdbId<PdbId.Data>, args:PdbId<PdbId.Data>[]):string {
        return templateName('!'+base.id, ...args.map(id=>id.id+''));
    }

    constructor (
        public name:string,
        public readonly key:string) {
        this.originalName = name;
    }

    infer(template:PdbId<PdbId.Data>, out:PdbId<PdbId.Data>[] = []):PdbId<PdbId.Data>[]|null {
        if (template.is(PdbId.Key)) {
            const idx = template.data.keyIndex;
            const already = out[idx];
            if (already == null) {
                out[idx] = this;
            } else if (already !== this) {
                return null;
            }
        } else if (this.templateBase !== template.templateBase) {
            return null;
        } else if (this.templateBase !== null) {
            const params = this.templateParameters!;
            const tparams = template.templateParameters!;
            const n = params.length;
            if (n !== tparams.length) {
                return null;
            }
            for (let i=0;i<n;i++) {
                const res = params[i].infer(tparams[i], out);
                if (res === null) return null;
            }
        } else if (template.is(PdbId.Decorated)) {
            if (!this.is(PdbId.Decorated)) return null;
            if (template.data.deco !== this.data.deco) return null;
            return this.data.base.infer(template.data.base, out);
        } else if (template !== this) {
            return null;
        }
        return out;
    }

    hasNonGlobalParent():this is {parent:PdbId<PdbId.Data>} {
        return this.parent !== null && this.parent !== PdbId.global;
    }

    addRef():void {
        this.ref++;
    }

    addNoExcept(source?:string):PdbId<PdbId.Data> {
        const base = this.decay();
        if (base === this && this.is(PdbId.Function) && !this.is(PdbId.FunctionType)) {
            this.data.isNoExcept = true;
            return this;
        }
        if (!base.is(PdbId.FunctionType)) {
            throw new IdError(`base is not function type`, this);
        }

        const noexcept = getKey(PdbId.makeNoExceptKey(base), key=>{
            const name = base.name + ' noexcept';
            const id = new PdbId(name, key);
            const data = id.determine(PdbId.FunctionType);
            data.isNoExcept = true;
            if (source != null) id.source = source;
            return id;
        });
        const list = this.getDecoList();
        return list.apply(noexcept);
    }

    delete():void {
        if (this.templateBase !== null) {
            const idx = this.templateBase.data.specialized.indexOf(this);
            if (idx !== -1) this.templateBase.data.specialized.splice(idx, 1);
        }
        this.data._delete();
        if (this.parent !== null) {
            PdbId.keyMap.delete(PdbId.makeChildKey(this.parent, this.name));
        }
    }

    release():void {
        this.ref--;
        if (this.ref === 0) {
            this.delete();
        }
    }

    removeConst():PdbId<PdbId.Data> {
        return this.removeDeco(DecoSymbol.const);
    }

    removeDeco(deco:DecoSymbol):PdbId<PdbId.Data> {
        const data = this.data;
        if (data instanceof PdbId.Decorated) {
            return data.removeDeco(deco);
        }
        return this;
    }

    static arrangeTemplateParameters(types:PdbId<PdbId.Data>[]):PdbId<PdbId.Data>[][] {
        const params:PdbId<PdbId.Data>[][] = [];
        for (const s of types) {
            const sparams = s.templateParameters;
            if (sparams !== null) {
                for (let i=0;i<sparams.length;i++) {
                    if (i === params.length) {
                        params.push([]);
                    }
                    params[i].push(sparams[i]);
                }
            }
        }
        return params;
    }

    static checkSameBase(types:PdbId<PdbId.Data>[]):boolean {
        const first = types[0];
        const base = first.templateBase;
        if (base === null) return false;

        for (const t of types) {
            if (t.templateBase !== base) return false;
        }
        return true;
    }

    static anyOrSame(items:PdbId<PdbId.Data>[]):boolean {
        if (arraySame(items)) return true;
        if (items.indexOf(PdbId.any_t) !== -1) return true;
        if (!PdbId.checkSameBase(items)) return false;

        let templateCount = -2;
        for (const item of items) {
            const params = item.templateParameters;
            if (params !== null) {
                const n = params.length;
                if (n === templateCount) continue;
                if (templateCount === -2) {
                    templateCount = n;
                    continue;
                }
                return false;
            }
            if (templateCount >= 0) return false;
            templateCount = -1;
        }
        if (templateCount <= 0) return true;

        const types = PdbId.arrangeTemplateParameters(items);
        for (const ts of types) {
            if (!PdbId.anyOrSame(ts)) {
                return false;
            }
        }
        return true;
    }

    contains(other:PdbId<PdbId.Data>):boolean {
        if (this === other) return true;
        if (this === PdbId.any_t) return true;
        const data = this.data;
        const odata = other.data;
        if (data instanceof PdbId.TypeUnion) {
            if (odata instanceof PdbId.TypeUnion) {
                for (const t of odata.unionedTypes) {
                    if (!data.unionedTypes.has(t)) return false;
                }
                return true;
            } else {
                if (data.unionedTypes.has(other)) return true;
            }
        }
        if (this.templateBase !== null && this.templateBase === other.templateBase) {
            if (this.templateParameters!.length !== other.templateParameters!.length) {
                return false;
            }
            for (let i=0;i<this.templateParameters!.length;i++) {
                if (!PdbId.anyOrSame([this.templateParameters![i], other.templateParameters![i]])) return false;
            }
            return true;
        }
        return false;
    }

    unionWith(other:PdbId<PdbId.Data>):PdbId<PdbId.Data>{
        const a = this.removeConst();
        const b = other.removeConst();
        if (a === b) return a;
        if (a === PdbId.any_t || b === PdbId.any_t) return PdbId.any_t;
        const adata = a.data;
        const bdata = b.data;
        if (adata instanceof PdbId.TypeUnion) {
            if (adata.unionedTypes.has(b)) {
                return a;
            }
        } else {
            if (bdata instanceof PdbId.TypeUnion) {
                if (bdata.unionedTypes.has(a)) return b;
            }
        }

        const unionedTypes = new Set<PdbId<PdbId.Data>>();
        if (adata instanceof PdbId.TypeUnion) {
            for (const item of adata.unionedTypes) {
                unionedTypes.add(item);
            }
        } else {
            unionedTypes.add(a);
        }

        if (bdata instanceof PdbId.TypeUnion) {
            for (const item of bdata.unionedTypes) {
                unionAdd(unionedTypes, item);
                if (unionedTypes.size > 5) {
                    return PdbId.any_t;
                }
            }
        } else {
            unionAdd(unionedTypes, b);
            if (unionedTypes.size > 5) {
                return PdbId.any_t;
            }
        }

        const array = [...unionedTypes].sort((a,b)=>a.id-b.id);
        return getKey(PdbId.makeTypeUnionKey(array), key=>{
            const name = array.map(a=>a.name).join('|');
            const unioned = new PdbId<PdbId.TypeUnion>(name, key);
            unioned.data = new PdbId.TypeUnion(unioned);
            unioned.data.unionedTypes = unionedTypes;
            return unioned;
        });
    }

    static makeUnionedType(items:PdbId<PdbId.Data>[]):PdbId<PdbId.TypeUnion> {
        items.sort((a,b)=>a.id-b.id);
        return getKey(PdbId.makeTypeUnionKey(items), key=>{
            const name = items.map(a=>a.name).join('|');
            const unioned = new PdbId<PdbId.TypeUnion>(name, key);
            unioned.data = new PdbId.TypeUnion(unioned);
            unioned.data.unionedTypes = new Set(items);
            return unioned;
        });
    }

    hasOverloads():this is PdbId<PdbId.HasOverloads> {
        return this.is(PdbId.TemplateFunctionBase) || (this.is(PdbId.FunctionBase) && this.templateBase === null);
    }

    isPointerLike():boolean {
        const data = this.data;
        if (!(data instanceof PdbId.Decorated)) return false;
        if (data.deco === DecoSymbol["&"] || data.deco === DecoSymbol["*"]) return true;
        if (data.base !== null) return data.base.isPointerLike();
        return false;
    }

    decorate(deco:DecoSymbol, source?:string):PdbId<PdbId.Data> {
        if (deco === DecoSymbol.const) {
            if (this.is(PdbId.Function)) {
                const data = this.data.makeConst();
                if (source != null) data.source = source;
                return data;
            }
        }
        return getKey(PdbId.makeDecoKey(this, deco), key=>{
            let name = this.name;
            if (deco.needSpace) {
                name += ' ';
            }
            name += deco.name;
            const id = new PdbId(name, key);
            const data = id.determine(PdbId.Decorated);
            data.base = this;
            data.deco = deco;
            if (this.isValue) id.isValue = true;
            if (source != null) id.source = source;
            return id;
        });
    }

    append(child:PdbId<PdbId.Data>):void {
        if (child.parent !== null) {
            if (child.parent === this) return;
            throw new IdError(`already has parent`, child);
        }
        child.parent = this;
        this.children.push(child);
    }

    makeChild(name:string):PdbId<PdbId.Data> {
        return getKey(PdbId.makeChildKey(this, name), key=>{
            const item = new PdbId(name, key);
            this.append(item);
            return item;
        });
    }

    getChild(name:string):PdbId<PdbId.Data>|null {
        return PdbId.keyMap.get(PdbId.makeChildKey(this, name)) || null;
    }

    getArraySize():number|null {
        let node:PdbId<PdbId.Data> = this;
        for (;;) {
            const data = node.data;
            if (!(data instanceof PdbId.Decorated)) {
                return null;
            }
            if (data.deco.arraySize !== null) return data.deco.arraySize;
            node = data.base;
        }
    }

    getDecoList():DecoList {
        const list = new DecoList;
        list.addFrom(this);
        return list;
    }

    decay():PdbId<PdbId.Data> {
        let node:PdbId<PdbId.Data> = this;
        for (;;) {
            const data = node.data;
            if (!(data instanceof PdbId.Decorated)) {
                return node;
            }
            node = data.base;
        }
    }

    removeParameters():PdbId<PdbId.Data> {
        const data = this.data;
        if (data instanceof PdbId.Function) {
            return data.functionBase;
        }
        return this;
    }

    removeTemplateParameters():PdbId<PdbId.Data> {
        return this.templateBase || this;
    }

    replaceType(from:PdbId<PdbId.Data>, to:PdbId<PdbId.Data>):PdbId<PdbId.Data> {
        if (this === from) return to;
        const data = this.data;
        if (data instanceof PdbId.Decorated) {
            return data.base.replaceType(from, to).decorate(data.deco);
        }
        if (this.templateBase !== null) {
            const types = this.templateParameters!.map(v=>v.replaceType(from, to));
            for (let i=0;i<types.length;i++) {
                if (this.templateParameters![i] !== types[i]) {
                    return this.templateBase.data.makeSpecialized(types);
                }
            }
        } else if (data instanceof PdbId.Function) {
            const returnType = data.returnType && data.returnType.replaceType(from, to);
            const types = data.functionParameters.map(v=>v.replaceType(from, to));
            if (returnType !== data.returnType) {
                return data.functionBase.data.makeFunction(returnType, types, PdbId.FunctionType);
            }
            for (let i=0;i<types.length;i++) {
                if (data.functionParameters[i] !== types[i]) {
                    return data.functionBase.data.makeFunction(returnType, types, PdbId.FunctionType);
                }
            }
        }
        return this;
    }

    toString():string {
        let name = '';
        if (this.parent === null || this.parent === PdbId.global) name = this.name.toString();
        else name = this.parent.toString() + '::' + this.name.toString();
        return this.data.toStringWith(name);
    }

    determine<T extends PdbId.Data>(type:new(id:PdbId<any>)=>T):T {
        if (this.data.instanceOf(type) as any) {
            return this.data as any;
        }
        if (isBaseOf(type, this.data.constructor)) {
            const data = new type(this);
            this.data.moveTo(data as any);
            this.data = data as any;
            return data;
        } else {
            return this.data = (this.data as any).convertTo(type);
        }
    }

    getTypeOfIt():PdbId<PdbId.Data> {
        try {
            return this.data.getTypeOfIt();
        } catch (err) {
            console.error(`> getTypeOfIt`);
            throw err;
        }
    }

    redirect(target:PdbId<PdbId.Data>):void {
        const data = this.determine(PdbId.Redirect);
        data.redirectTo = target;
        target.redirectedFrom = this;
    }
    static parse(symbol:string):PdbId<PdbId.Data> {
        const oldi = parser.i;
        const oldctx = parser.context;
        parser.i = 0;
        parser.context = symbol;
        const out = parseSymbol('');
        parser.context = oldctx;
        parser.i = oldi;
        return out;
    }

    unwrapType():PdbId<PdbId.Data> {
        const data = this.data;
        if (this.templateBase === PdbId.typename) {
            return this.templateParameters![0];
        }
        if (data instanceof PdbId.TypeUnion) {
            return PdbId.makeUnionedType([...data.unionedTypes].map(u=>u.unwrapType()));
        }
        return this;
    }

    *loopAll():IterableIterator<PdbId<PdbId.Data>> {
        yield * this.children;
        for (const item of this.children) {
            yield * item.loopAll();
        }
    }

    *components():IterableIterator<PdbId<PdbId.Data>> {
        if (this.parent !== null) {
            yield this.parent;
        }
        if (this.templateParameters !== null) {
            yield *this.templateParameters;
        }
        yield * this.data._components();
    }

    static makeConstantNumber(value:number):PdbId<PdbId.ConstantNumber> {
        const id = PdbId.make(value+'');
        id.determine(PdbId.ConstantNumber).value = value;
        return id;
    }

    static make(name:string):PdbId<any> {
        return PdbId.global.makeChild(name);
    }

    static filter:(item:PdbId<PdbId.Data>)=>boolean = ()=>true;
}

function makeSpecialized(
    id:PdbId<PdbId.TemplateBase|PdbId.TemplateClassBase>,
    args:PdbId<PdbId.Data>[],
    source?:string):PdbId<PdbId.Data> {
    if (id.parent === null) throw new IdError(`no parent`, id);
    const key = PdbId.makeTemplateKey(id, args);
    const data = id.determine(PdbId.TemplateBase);

    let specialized:PdbId<PdbId.Data>|undefined = PdbId.keyMap.get(key);
    if (specialized == null) {
        const name = templateName(id.name, ...args.map(id=>id.toString()));
        specialized = new PdbId(name, key);
        specialized.templateParameters = args;
        specialized.templateBase = id as PdbId<PdbId.TemplateBase>;
        id.parent.append(specialized);
        if (source != null) specialized.source = source;
        data.specialized.push(specialized);
        PdbId.keyMap.set(key, specialized);
    } else {
        specialized.compareTemplates(id, args);
    }
    return specialized;
}

function makeConstFunction(base:PdbId<PdbId.Function>, kind:PdbId.FunctionKind):PdbId<PdbId.Function> {
    return getKey(PdbId.makeDecoKey(base, DecoSymbol.const), key=>{
        const id = new PdbId<any>(base.name+' const', key);
        id.isConst = true;
        base.data.constFunction = id;
        if (base.parent !== null) {
            base.parent.append(id);
        }
        const data = id.determine(kind);
        base.data.moveTo(data);
        data.isConst = true;
        base.data.functionBase.data.overloads.push(id);
        return id;
    });
}

export namespace PdbId {
    export function printOnProgress(message:string):void {
        process.stdout.cursorTo(0);
        process.stdout.write(message);
        process.stdout.clearLine(1);
        console.log();
    }

    export type FunctionKind = new(id:PdbId<Data>)=>PdbId.Function;
    export class Data {
        constructor(public readonly id:PdbId<any>) {
        }
        makeFunctionTypeBase():PdbId<FunctionTypeBase> {
            this.id.isType = true;
            const base = getKey(PdbId.makeFunctionTypeKey(this.id),
                key=>new PdbId<FunctionTypeBase>(`${this.id}`, key));
            base.determine(FunctionTypeBase);
            return base;
        }
        *_components():IterableIterator<PdbId<Data>> {
            // empty
        }

        getTypeOfIt():PdbId<Data> {
            if (this.id.isValue) {
                throw new IdError('unexpected value', this.id);
            }
            return typename.data.makeSpecialized([this.id]);
        }

        moveTo(other:this):void {
            // empty
        }

        _delete():void {
            const children = this.id.parent!.children;
            const idx = children.indexOf(this.id);
            if (idx !== -1) children.splice(idx ,1);
        }
        toStringWith(name:string):string {
            return name;
        }
        instanceOf<T extends Data>(type:AbstractClass<T>):this is T {
            return this instanceof type;
        }
        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            throw new IdError(`Unexpected type converting (${this.constructor.name} -> ${type.name})`, this.id);
        }
    }
    export interface HasOverloads extends Data {
        allOverloads():IterableIterator<PdbId<PdbId.Function>>;
    }
    export class NamespaceLike extends Data {
        private __isNamespaceLike?:void;

        constructor(id:PdbId<Data>) {
            super(id);

            if (id.parent !== null) {
                if (id.parent instanceof ClassLike) {
                    id.determine(Class);
                } else {
                    id.parent.determine(PdbId.NamespaceLike);
                }
            }
        }
    }
    export class Namespace extends NamespaceLike {
    }
    export abstract class Constant extends Data {
        private __isConstant?:void;

        constructor(id:PdbId<any>) {
            super(id);
            id.isConst = true;
        }
        getTypeOfIt():PdbId<Data> {
            throw new IdError(`unexpected constant`, this.id);
        }
    }
    export class ConstantNumber extends Constant {
        public value:number;

        constructor(id:PdbId<Data>) {
            super(id);
        }
        getTypeOfIt():PdbId<Data> {
            return PdbId.int_t;
        }
    }
    export class ClassLike extends NamespaceLike {
        constructor(id:PdbId<Data>) {
            super(id);

            if (id === PdbId.global) throw new IdError(`set class to root`, id);
            if (id.templateBase !== null) {
                id.templateBase.determine(TemplateClassBase);
            }

            if (id.parent !== null) {
                id.parent.determine(NamespaceLike);
            }
        }
    }
    export class Enum extends ClassLike {
    }
    export class Class extends ClassLike {
        canBeTemplateBase = false;
        super:PdbId<PdbId.Class>|null = null;

        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            if (this.canBeTemplateBase && type as any === TemplateBase) {
                return new TemplateBase(this.id) as any;
            }
            return super.convertTo(type);
        }
    }
    export class LambdaClass extends Class {
        instanceOf<T extends Data>(type:AbstractClass<T>):this is T {
            return this instanceof type || isBaseOf(type, LambdaClassOrFunction);
        }
        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            return super.convertTo(type);
        }
    }
    export class LambdaClassOrFunction extends NamespaceLike {
        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            if (type as any === Class) {
                return new LambdaClass(this.id) as any;
            }
            if (type as any === FunctionBase) {
                return new FunctionBase(this.id) as any;
            }
            return super.convertTo(type);
        }
    }
    export class TypeUnion extends Data {
        public unionedTypes:Set<PdbId<Data>>;

        constructor(id:PdbId<Data>) {
            super(id);
        }
        *_components():IterableIterator<PdbId<PdbId.Data>> {
            yield *this.unionedTypes;
        }
    }

    export class TemplateBase extends Data {
        public specialized:PdbId<Data>[] = [];

        constructor(id:PdbId<any>) {
            super(id);
        }
        moveTo(other:this):void {
            other.specialized = this.specialized;
            super.moveTo(other);
        }

        makeSpecialized(args:PdbId<Data>[], source?:string):PdbId<Data> {
            return makeSpecialized(this.id, args, source);
        }

        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            if (type === FunctionBase as any || type === TemplateFunctionBase as any) {
                const data = new TemplateFunctionBase(this.id);
                data.specialized = this.specialized;
                return data as any;
            }
            return super.convertTo(type);
        }
    }
    export class TemplateClassBase extends TemplateBase {
    }
    export class ReturnAble extends Data {
        public returnType:PdbId<Data>|null = void_t;
        *_components():IterableIterator<PdbId<Data>> {
            if (this.returnType !== null) {
                yield this.returnType;
            }
        }
        moveTo(other:this):void {
            other.returnType = this.returnType;
        }
        toStringWith(name:string):string {
            return (this.returnType === null ? '[[null]]' : this.returnType)+' '+name;
        }
    }
    export class Variable extends ReturnAble {
        getTypeOfIt():PdbId<Data> {
            if (this.returnType === null) throw new IdError(`Unresolved variable type`, this.id);
            return this.returnType;
        }
    }
    export class FunctionBase extends Data implements HasOverloads {
        public isConstructor = false;
        public isDestructor = false;
        public overloads:PdbId<PdbId.Function>[] = [];

        getFunction(args:PdbId<Data>[]):PdbId<PdbId.Function>|undefined {
            const funcbase = this.id;
            const func = PdbId.keyMap.get(PdbId.makeFunctionKey(funcbase, args));
            if (func != null && !func.is(PdbId.Function)) throw Error(`${func} is not function`);
            return func;
        }
        makeFunction<T extends FunctionKind>(returnType:PdbId<Data>|null, args:PdbId<Data>[],
            kind:T):PdbId<InstanceType<T>> {
            if (args.length === 1 && args[0] === void_t) {
                args.length = 0;
            }

            const funcbase = this.id;
            return getKey(PdbId.makeFunctionKey(funcbase, args), key=>{
                const id = new PdbId<InstanceType<T>>(funcbase.name+'('+args.join(',')+')', key);
                if (funcbase.parent !== null) {
                    funcbase.parent.append(id);
                }
                const data = id.determine(kind);
                data.functionBase = funcbase;
                data.functionParameters = args;
                funcbase.data.overloads.push(id);

                if (!(data instanceof FunctionType)) {
                    const templateBase = funcbase.templateBase;
                    if (templateBase !== null)  {
                        templateBase.determine(TemplateFunctionBase);
                        data.id.templateBase = templateBase;
                        data.id.templateParameters = funcbase.templateParameters!.slice();
                    }
                }

                data.returnType = returnType;
                if (data.isConstructor || data.isDestructor) id.parent!.determine(Class);
                return id;
            });
        }
        *allOverloads():IterableIterator<PdbId<PdbId.Function>> {
            for (const o of this.overloads) {
                if (o.address === 0) continue;
                yield o;
            }
        }

        moveTo(other:this):void {
            other.isConstructor = this.isConstructor;
            other.isDestructor = this.isDestructor;
            other.overloads = this.overloads;
            super.moveTo(other);
        }

        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            if (type === TemplateBase as any) {
                const data = new TemplateFunctionBase(this.id);
                this.moveTo(data as any);
                return data as any;
            }
            return super.convertTo(type);
        }
    }
    export class CastFunctionBase extends FunctionBase {
        castTo:PdbId<PdbId.Data>;
        moveTo(other:this):void {
            other.castTo = this.castTo;
            super.moveTo(other);
        }
    }
    export class TemplateFunctionBase extends FunctionBase implements HasOverloads {
        public specialized:PdbId<Data>[] = [];
        *allOverloads():IterableIterator<PdbId<PdbId.Function>> {
            for (const s of this.specialized) {
                const sdata = s.data;
                if (sdata instanceof FunctionBase) {
                    yield * sdata.allOverloads();
                }
            }
        }
        instanceOf<T extends Data>(type:AbstractClass<T>):this is T {
            return this instanceof type || isBaseOf(TemplateFunctionBase, type);
        }
        convertTo<T extends Data>(type:new(id:PdbId<any>)=>T):T {
            if (type === TemplateBase as any) {
                const data = new TemplateFunctionBase(this.id);
                this.moveTo(data as any);
                return data as any;
            }
            return super.convertTo(type);
        }
        makeSpecialized(args:PdbId<Data>[], source?:string):PdbId<Data> {
            return makeSpecialized(this.id, args, source);
        }
    }
    export class FunctionTypeBase extends FunctionBase {
    }
    export class TemplateFunctionNameBase extends TemplateBase {
        makeSpecialized(args:PdbId<Data>[], source?:string):PdbId<Data> {
            const id = this.specialized[0];
            id.compareTemplates(null, args);
            return id;
        }
    }
    export class Function extends ReturnAble {
        public isNoExcept = false;
        public isVirtual = false;
        public isConst = false;
        public constFunction:PdbId<PdbId.Function>|null = null;

        public functionBase:PdbId<FunctionBase>;
        public functionParameters:PdbId<Data>[] = [];

        constructor(id:PdbId<any>) {
            super(id);
        }
        get isConstructor():boolean {
            return this.functionBase.data.isConstructor;
        }
        get isDestructor():boolean {
            return this.functionBase.data.isDestructor;
        }
        *_components():IterableIterator<PdbId<Data>> {
            yield *this.functionParameters;
            yield *super._components();
        }
        getTypeOfIt():PdbId<Data> {
            if (this.returnType === null) {
                // unknown type function
                return void_ptr_t;
            }
            const base = this.returnType.data.makeFunctionTypeBase();
            return base.data.makeFunction(this.returnType, this.functionParameters, FunctionType);
        }

        hasArrayParam():boolean {
            for (const param of this.functionParameters) {
                if (param.getArraySize() !== null) return true;
            }
            return false;
        }
        _delete():void {
            if (this.functionBase !== null) {
                const idx = this.functionBase.data.overloads.indexOf(this.id);
                if (idx !== -1) this.functionBase.data.overloads.splice(idx, 1);
            }
            super._delete();
        }
        makeConst():PdbId<PdbId.Function> {
            return makeConstFunction(this.id, PdbId.Function);
        }

        moveTo(other:this):void {
            other.isNoExcept = this.isNoExcept;
            other.isVirtual = this.isVirtual;
            other.constFunction = this.constFunction;
            other.isConst = this.isConst;

            other.functionBase = this.functionBase;
            other.functionParameters = this.functionParameters;

            super.moveTo(other);
        }
    }
    export class MemberPointerType extends Data {
        public type:PdbId<Data>;
        public memberPointerBase:PdbId<Class>;
    }
    export class FunctionType extends Function {
        private __isFunctionType?:void;
        makeConst():PdbId<PdbId.Function> {
            return makeConstFunction(this.id, PdbId.FunctionType);
        }
    }
    export class MemberFunctionType extends FunctionType {
        memberPointerBase:PdbId<Class>;
        makeConst():PdbId<PdbId.Function> {
            return makeConstFunction(this.id, PdbId.MemberFunctionType);
        }
        moveTo(other:this):void {
            other.memberPointerBase = this.memberPointerBase;

            super.moveTo(other);
        }
    }
    export abstract class KeyType extends Data {
        abstract unionWith(other:PdbId<Key>):PdbId<Keys>;
    }
    export class Key extends KeyType {
        public keyIndex:number;

        unionWith(key:PdbId<Key>):PdbId<Keys> {
            return Keys.make([this.id as PdbId<Key>, key]);
        }
        static make(n:number):PdbId<Key> {
            let key = keys[n];
            if (key == null) {
                key = PdbId.make('#KEY'+n);
                const data = key.determine(Key);
                data.keyIndex = n;
            }
            return key;
        }
    }
    export class Keys extends KeyType {
        public keys:Set<PdbId<Key>>;

        unionWith(key:PdbId<Key>):PdbId<Keys> {
            if (this.keys.has(key)) return this.id;
            return Keys.make([...this.keys, key]);
        }

        static make(keys:PdbId<Key>[]):PdbId<Keys> {
            return getKey(PdbId.makeTypeUnionKey(keys), key=>{
                const name = keys.map(a=>a.name).join('|');
                const unioned = new PdbId<Keys>(name, key);
                unioned.data = new Keys(unioned);
                unioned.data.keys = new Set(keys);
                return unioned;
            });
        }
    }
    export abstract class TextName extends NamespaceLike {
        constructor(id:PdbId<Data>) {
            super(id);
            id.isStatic = true;
        }
    }
    export class Referenced extends TextName {
        public target:PdbId<Data>;
    }
    export class VTable extends Data {
        public for:PdbId<Data>;

        constructor(id:PdbId<Data>) {
            super(id);
            id.isStatic = true;
        }
    }
    export class VCall extends Data {
        param:PdbId<PdbId.Data>;

        getTypeOfIt():PdbId<Data> {
            return void_ptr_t;
        }
    }
    export class RTTIBaseClassDescriptor extends Variable {
    }
    export class Decorated extends Data {
        public base:PdbId<Data>;
        public deco:DecoSymbol;

        constructor(id:PdbId<Data>) {
            super(id);
        }
        removeDeco(deco:DecoSymbol):PdbId<Data> {
            if (this.deco === deco) return this.base;
            const removed = this.base.removeDeco(deco);
            if (removed === this.id) return this.id;
            return removed.decorate(this.deco);
        }
        getTypeOfIt():PdbId<Data> {
            if (this.id.isValue) {
                if (this.deco === DecoSymbol["&"]) {
                    return this.base.getTypeOfIt().decorate(DecoSymbol['*']);
                }
            }
            return super.getTypeOfIt();
        }
    }
    export class Redirect extends Data {
        public redirectTo:PdbId<Data>;
        constructor(id:PdbId<Data>) {
            super(id);
        }
    }

    export const keyMap = new Map<string, PdbId<any>>();
    export const addressMap = new Map<number, PdbId<any>>();
    export const global = new PdbId('', '');
    export const std = PdbId.make('std');
    export const any_t = PdbId.make('any');
    export const never_t = PdbId.make('never');
    export const typename:PdbId<PdbId.TemplateBase> = PdbId.make('typename');
    export const int_t = PdbId.make('int');
    export const unknown_ptr_t = PdbId.make('unknown_ptr_t');
}

PdbId.global.determine(PdbId.Namespace);
PdbId.std.determine(PdbId.Namespace);
PdbId.make('__int64').isBasicType = true;
PdbId.make('bool').isBasicType = true;
PdbId.make('void').isBasicType = true;
PdbId.int_t.isBasicType = true;
PdbId.make('long').isBasicType = true;
PdbId.make('short').isBasicType = true;
PdbId.make('char').isBasicType = true;
PdbId.make('wchar_t').isBasicType = true;
PdbId.make('float').isBasicType = true;
PdbId.make('double').isBasicType = true;
PdbId.any_t.isBasicType = true;
PdbId.unknown_ptr_t.isBasicType = true;

const void_t = PdbId.make('void');
void_t.isBasicType = true;
const void_ptr_t = void_t.decorate(DecoSymbol["*"]);
void_ptr_t.isBasicType = true;
PdbId.typename.determine(PdbId.TemplateBase);

const parser = new LanguageParser('');

function printParserState(...ids:(PdbId<PdbId.Data>|null)[]):void {
    console.log();
    console.log();
    console.log('[symbolparser.ts] Reporting');
    console.log('symbolIndex: '+symbolIndex);
    ids = ids.filter(id=>id !== null);
    if (ids.length === 1) {
        const id = ids[0]!;
        console.log('PdbId id: '+id.id);
        console.log('PdbId name: '+id);
        console.log('PdbId type: '+id.data.constructor.name);
    } else {
        let i = 0;
        for (const id of ids) {
            i++;
            console.log(`PdbId${i} id: ${id!.id}`);
            console.log(`PdbId${i} name: ${id}`);
            console.log(`PdbId${i} type: ${id!.data.constructor.name}`);
        }
    }

    const width = process.stdout.columns-6;
    let index = parser.i;
    let context = parser.context;
    let left = 0;
    let right = 0;
    if (context.length > width) {
        left = Math.max(index-(width >> 1), 0);
        right = left+width;
        const shift = context.length - right;
        if (shift < 0) {
            left += shift;
            if (left < 0) left = 0;
            right += shift;
        }
        context = context.substring(left, right);
        index -= left;
        if (right < context.length) context += '...';
        if (left !== 0) {
            context = '...'+context;
            index += 3;
        }
    }
    console.log();
    console.log(context);
    console.log(' '.repeat(index)+'^');
    console.log();
}

function must(next:string, ...ids:PdbId<PdbId.Data>[]):void {
    if (parser.nextIf(next)) return;
    printParserState(...ids);
    throw new IdError(`unexpected character(Expected=${next}, Actual=${parser.peek()})`, ...ids);
}

function parseParameters():PdbId<PdbId.Data>[] {
    const args:PdbId<PdbId.Data>[] = [];
    for (;;) {
        if (parser.nextIf('...')) {
            parser.readOperator(OPERATORS);
            args.push(PdbId.make('...'));
        } else {
            const arg = parseIdentity(',)');
            arg.isType = true;
            args.push(arg);
        }
        if (parser.endsWith(',')) continue;
        if (!parser.endsWith(')')) {
            printParserState();
            throw Error(`Unexpected end`);
        }
        break;
    }
    return args;
}

class DecoList {
    public readonly decos:DecoSymbol[] = [];

    add(...deco:DecoSymbol[]):void {
        this.decos.push(...deco);
    }

    addFrom(id:PdbId<PdbId.Data>):void {
        while (id.is(PdbId.Decorated)) {
            this.decos.push(id.data.deco);
            id = id.data.base;
        }
    }

    apply(target:PdbId<PdbId.Data>):PdbId<PdbId.Data> {
        for (const deco of this.decos) {
            target = target.decorate(deco);
        }
        this.decos.length = 0;
        return target;
    }
}

class DecoParser {
    isFunction:boolean = false;
    callingConvension:string|null = null;
    returnType:PdbId<PdbId.Data>|null = null;

    isParenthesesInside:boolean = false;

    base:PdbId<PdbId.Data>|null = null;
    readonly list = new DecoList;

    addDeco(...deco:DecoSymbol[]):void {
        this.list.add(...deco);
    }

    decoListMustEmpty():void {
        if (this.list.decos.length !== 0) {
            throw Error(`deco remained (${this.list.decos.join(', ')})`);
        }
    }

    parse(
        from:number,
        sourceFrom:number,
        eof:string):void {

        for (;;) {
            const prev = parser.i;
            const oper = parser.readOperator(OPERATORS);
            if (oper === null) {
                if (eof !== '') {
                    throw Error(`Unexpected end, ${eof} expected`);
                }
                if (this.base === null) throw Error(`null base`);
                break;
            } else if (oper === '' || oper === '`' || oper === '<') {
                if (oper !== '') {
                    parser.i = prev;
                }
                const beforeKeyword = parser.i;
                const keyword = parser.readIdentifier();
                if (keyword === 'const') {
                    if (this.base === null) {
                        this.list.decos.unshift(DecoSymbol.const);
                    } else {
                        this.base = this.base.decorate(DecoSymbol.const, parser.getFrom(sourceFrom));
                    }
                } else if (keyword === '__cdecl' || keyword === '__stdcall') {
                    if (this.callingConvension !== null) {
                        const decoParser = new DecoParser;
                        decoParser.callingConvension = keyword;
                        decoParser.isFunction = true;
                        decoParser.isParenthesesInside = this.isParenthesesInside;
                        decoParser.returnType = this.base;
                        decoParser.parse(from, sourceFrom, ')');
                        this.list.add(...decoParser.list.decos);
                        this.base = decoParser.base;
                        parser.unget(')');
                    } else {
                        this.callingConvension = keyword;
                        this.isFunction = true;
                        this.returnType = this.base;
                        this.base = null;
                    }
                    // if (this.castTo !== null) {
                    //     if (this.returnType !== null) {
                    //         printParserState(this.returnType);
                    //         throw Error(`returnType conflict (castTo=${this.castTo}, returnType=${this.returnType})`);
                    //     }
                    //     this.returnType = this.castTo;
                    // }
                } else if (keyword === '__ptr64') {
                    // do nothing
                } else if (keyword === 'unsigned' || keyword === 'signed') {
                    if (this.base === null) throw Error(`null base`);
                    this.base = this.base.decorate(DecoSymbol[keyword], parser.getFrom(sourceFrom));
                } else if (keyword === 'noexcept') {
                    if (this.base === null) throw Error(`null base`);
                    this.base = this.base.addNoExcept();
                } else {
                    if (keyword === null) {
                        parser.skipSpaces();
                        if (parser.nextIf('`')) {
                            const name = parser.readTo("'");
                            if (name === 'RTTI Type Descriptor') {
                                if (this.base === null) throw Error(`null base`);
                                this.base = this.base.makeChild("`RTTI Type Descriptor'");
                                this.base.source = parser.getFrom(sourceFrom);
                                const data = this.base.determine(PdbId.Variable);
                                data.returnType = void_t;
                                this.base.isStatic = true;
                                continue;
                            }
                        }
                    }
                    parser.i = beforeKeyword;
                    let neof = '';
                    if (this.isFunction) neof += '(';
                    if (this.isParenthesesInside) neof += ')';
                    else neof += eof;
                    const fnOrThisType = parseIdentity(neof || eof, {isTypeInside: true});
                    let returnType:PdbId<PdbId.Data>|null = this.returnType;

                    if (returnType !== null && this.base !== null) {
                        throw new IdError(`base, returnType, both found`, this.base);
                    }

                    if (this.base !== null) {
                        // __cdecl not found
                        returnType = this.base;
                    } else if (returnType === null) {
                        // functions without return type
                        if (fnOrThisType.name.startsWith('~')) {
                            // is destructor
                            returnType = void_t;
                            const data = fnOrThisType.determine(PdbId.FunctionBase);
                            data.isDestructor = true;
                            if (fnOrThisType.templateBase !== null) {
                                fnOrThisType.templateBase.determine(PdbId.TemplateFunctionNameBase);
                                fnOrThisType.templateBase = null;
                            }
                        } else {
                            let ctor:PdbId<PdbId.Data>|null = null;
                            const parent = fnOrThisType.parent!;
                            if (parent.name === fnOrThisType.name) {
                                ctor = fnOrThisType;
                            } else if (fnOrThisType.templateBase !== null && fnOrThisType.templateBase.name === parent.name) {
                                ctor = fnOrThisType.templateBase;
                            }
                            if (ctor !== null) {
                                // constructor
                                returnType = void_t;
                                if (ctor.templateBase !== null) {
                                    ctor.templateBase.determine(PdbId.TemplateFunctionNameBase);
                                    ctor.templateBase = null;
                                }
                                const data = ctor.determine(PdbId.FunctionBase);
                                data.isConstructor = true;
                                ctor.parent!.determine(PdbId.Class);
                            }
                        }
                    }

                    if (returnType === null) returnType = void_t;

                    if (parser.endsWith('(')) {
                        // parameters start
                        const args = parseParameters();
                        const funcbase = fnOrThisType.determine(PdbId.FunctionBase);
                        if (funcbase instanceof PdbId.CastFunctionBase) {
                            returnType = funcbase.castTo;
                        }
                        this.base = funcbase.makeFunction(returnType, args, PdbId.Function);
                        this.base.isValue = true;
                        this.base.source = parser.getFrom(sourceFrom);
                        this.isFunction = false;
                    } else if (parser.endsWith('*')) {
                        // member function pointer
                        this.base = PdbId.make(`${returnType} ${fnOrThisType}::*`);
                        const data = this.base.determine(PdbId.MemberPointerType);
                        data.type = returnType;
                        fnOrThisType.determine(PdbId.Class);
                        data.memberPointerBase = fnOrThisType as PdbId<PdbId.Class>;
                        this.base.source = parser.getFrom(sourceFrom);
                    } else {
                        // deco end without parameters starting
                        this.base = fnOrThisType;
                        if (this.isFunction && this.base.is(PdbId.VCall)) {
                            // do nothing
                        } else {
                            if (this.list.decos.length !== 0) {
                                // function pointer
                                this.base.isValue = true;
                                const data = this.base.determine(PdbId.Variable);
                                data.returnType = null;
                                this.returnType = returnType;
                            } else if (!this.isFunction) {
                                // variable
                                this.base.isValue = true;
                                const data = this.base.determine(PdbId.Variable);
                                data.returnType = returnType;
                            }
                        }
                        this.base.source = parser.getFrom(sourceFrom);
                        break;
                    }
                }
            } else if (eof.indexOf(oper) !== -1) {
                break;
            } else if (oper === '*' || oper === '&' || oper === '&&') {
                const deco = DecoSymbol[oper];
                if (this.isFunction) {
                    // function deco
                    this.list.add(deco);
                } else {
                    // variable deco
                    if (this.base === null) throw Error(`null base`);
                    this.base = this.base.decorate(deco, parser.getFrom(sourceFrom));
                }
            } else if (oper === '(') {
                if (this.isFunction) {
                    if (this.returnType === null) throw Error(`returnType not found`);
                    const args = parseParameters();
                    let baseType:PdbId<PdbId.FunctionBase>;
                    const returnType:PdbId<PdbId.Data> = this.returnType;
                    if (this.base !== null) {
                        if (this.base.is(PdbId.MemberPointerType)) {
                            // member function pointer
                            baseType = this.base.data.makeFunctionTypeBase();
                            this.base = baseType.data.makeFunction(returnType, args, PdbId.MemberFunctionType);
                            this.base = this.list.apply(this.base);
                        } else if (this.base.is(PdbId.ReturnAble)) {
                            // function pointer variable or function return
                            baseType = returnType.data.makeFunctionTypeBase();
                            this.base.data.returnType = this.list.apply(baseType.data.makeFunction(returnType, args, PdbId.FunctionType));
                        } else {
                            throw new IdError(`unexpected base`, this.base);
                        }
                    } else {
                        baseType = returnType.data.makeFunctionTypeBase();
                        this.base = baseType.data.makeFunction(returnType, args, PdbId.FunctionType);
                        this.base = this.list.apply(this.base);
                    }
                    this.isFunction = false;
                } else {
                    const old = this.isParenthesesInside;
                    this.isParenthesesInside = true;
                    this.parse(from, sourceFrom, ')');
                    this.isParenthesesInside = old;
                }
            } else if (oper === '[') {
                const number = parser.readIdentifier();
                if (number === null) {
                    printParserState(this.base);
                    throw Error(`Invalid number`);
                }
                if (!/^[0-9]+$/.test(number)) {
                    printParserState(this.base);
                    throw Error(`Unexpected index ${number}`);
                }
                must(']');

                if (this.base === null) throw Error(`null base`);
                const n = +number;
                this.base = this.base.decorate(DecoSymbol.array(n), parser.getFrom(sourceFrom));
            } else {
                parser.i--;
                printParserState(this.base);
                throw Error(`Unexpected operator ${oper}`);
            }
        }
    }

}

function parseIdentity(eof:string, info:{isTypeInside?:boolean, scope?:PdbId<PdbId.Data>, prefixType?:string, isEnum?:boolean} = {}, scope:PdbId<PdbId.Data>=PdbId.global):PdbId<PdbId.Data> {
    if (info.isTypeInside == null) info.isTypeInside = false;
    parser.skipSpaces();
    const sourceFrom = parser.i;

    for (;;) {
        parser.skipSpaces();
        const from = parser.i;

        let id:PdbId<PdbId.Data>|null;

        let idname:string|null;
        for (;;) {
            const idnameNormal = parser.readIdentifier();
            idname = parser.getFrom(from);
            if (idnameNormal === null) {
                const oper = parser.readOperator(OPERATORS);
                if (oper === '#') {
                    continue;
                } else if (oper === '~') {
                    continue;
                } else if (oper !== null && info.isTypeInside && oper === '*') {
                    scope.determine(PdbId.ClassLike);
                    return scope;
                } else if (oper === '<') {
                    const innerText = parser.readTo('>');
                    const lambdaName = parser.getFrom(from);
                    if (innerText === 'lambda_invoker_cdecl') {
                        id = scope.makeChild(lambdaName);
                        const data = id.determine(PdbId.FunctionBase);
                        id.source = parser.getFrom(sourceFrom);
                    } else if (/^lambda_[a-z0-9]+$/.test(innerText)) {
                        id = scope.makeChild(lambdaName);
                        id.source = parser.getFrom(sourceFrom);
                        id.determine(PdbId.LambdaClassOrFunction);
                    } else if (/^unnamed-type-.+$/.test(innerText)) {
                        id = scope.makeChild(lambdaName);
                        id.source = parser.getFrom(sourceFrom);
                    } else {
                        printParserState();
                        throw Error(`Unexpected name <${innerText}>`);
                    }
                } else if (oper === '-') {
                    const idname = parser.readIdentifier();
                    if (idname === null) {
                        printParserState();
                        throw Error(`Unexpected end`);
                    }
                    if (!/^[0-9]+$/.test(idname)) {
                        printParserState();
                        throw Error(`Unexpected identifier ${idname}`);
                    }
                    id = PdbId.makeConstantNumber(-idname);
                } else if (oper === '&') {
                    id = parseSymbol(eof);
                    id.isValue = true;
                    id.source = parser.getFrom(sourceFrom);
                    id = id.decorate(DecoSymbol[oper], parser.getFrom(from));
                    id.source = parser.getFrom(sourceFrom);
                    return id;
                } else if (oper === '`') {
                    _idfind:{
                        if (parser.nextIf("vftable'") || parser.nextIf("vbtable'")) {
                            scope.determine(PdbId.Class);
                            if (parser.nextIf('{for `')) {
                                const arg = parseSymbol("'");
                                must('}');
                                id = scope.makeChild(parser.getFrom(from));
                                id.determine(PdbId.VTable).for = arg;
                                id.params = [arg];
                                arg.determine(PdbId.Class);
                            } else {
                                id = scope.makeChild(parser.getFrom(from));
                            }
                        } else if (parser.nextIf("vcall'")) {
                            const arg = parser.readTo("'");
                            parser.readTo("'");
                            id = scope.makeChild(parser.getFrom(from));
                            id.isPrivate = true;
                            id.determine(PdbId.VCall).param = PdbId.make(arg);
                            id.parent!.determine(PdbId.Class);
                            eof = eof.replace(/\(/, '');
                        } else if (parser.nextIf('RTTI Base Class Descriptor at (')) {
                            const arg = parser.readTo("'");
                            id = scope.makeChild(parser.getFrom(from));
                            if (!arg.endsWith(")")) {
                                throw new IdError(`Unexpected base descriptor name: ${id.name}`, id);
                            }
                            id.determine(PdbId.RTTIBaseClassDescriptor);
                            id.params = arg.substr(0, arg.length-1).split(',').map(v=>PdbId.makeConstantNumber(+v));
                        } else if (parser.nextIf('template-parameter-')) {
                            corrupted('Referenced template parameter not found');
                        } else {
                            for (let info of SPECIAL_NAMES) {
                                if (typeof info === 'string') {
                                    info = {name:info};
                                }
                                if (parser.nextIf(info.name)) {
                                    let param:PdbId<PdbId.Data>|null = null;
                                    if (info.hasParam) {
                                        param = parseIdentity("'", {}, scope);
                                        must("'");
                                    }
                                    id = scope.makeChild(parser.getFrom(from));
                                    (info.determinator || defaultDeterminator)(id, param);
                                    break _idfind;
                                }
                            }
                            const arg = parseSymbol("'");
                            parser.readTo("'");
                            id = scope.makeChild(parser.getFrom(from));
                            id.isPrivate = true;
                            id.determine(PdbId.Referenced).target = arg;
                            id.source = parser.getFrom(sourceFrom);
                        }
                    }
                } else {
                    parser.i--;
                    throw Error(`Unexpected operator ${oper}`);
                }
            } else {
                let isUnsigned = 0;
                let castTo:PdbId<PdbId.Data>|null = null;

                id = null;
                if (scope === PdbId.global && NUMBER_ONLY.test(idname)) {
                    id = PdbId.makeConstantNumber(+idname);
                } else if (idname === '__cdecl' || idname === '__stdcall') {
                    if (scope === PdbId.global) {
                        id = null;
                    } else {
                        throw Error(`Invalid scope(${scope}) for ${idname}`);
                    }
                    parser.i = from;
                    break;
                } else if (idname === 'const') {
                    id = parseIdentity(eof);
                    id.isValue = true;
                    id.isConst = true;
                    return id;
                } else if (idname === 'enum') {
                    id = parseIdentity(eof, {prefixType: 'enum'});
                    return id;
                } else if (idname === 'class') {
                    id = parseIdentity(eof, {prefixType: 'class'});
                    return id;
                } else if (idname === 'struct') {
                    return parseIdentity(eof, {prefixType: 'struct'});
                } else if (idname === 'union') {
                    return parseIdentity(eof, {prefixType: 'union'});
                } else if (idname === 'operator') {
                    const oi = parser.i;
                    const oper = parser.readOperator(OPERATORS_FOR_OPERATOR);
                    if (oper === '') {
                        const prev = parser.i;
                        let next = parser.readIdentifier();
                        if (next === null) {
                            printParserState();
                            throw Error(`Unexpected end, identifier expected`);
                        }
                        if (next === 'delete') {
                            if (parser.nextIf('[]')) {
                                next += '[]';
                            }
                        } else if (next === 'new') {
                            if (parser.nextIf('[]')) {
                                next += '[]';
                            }
                        } else {
                            parser.i = prev;
                            castTo = parseIdentity('(');
                            parser.unget('(');
                            next = castTo.toString();
                        }
                        idname += ' '+next;
                    } else {
                        const oi2 = parser.i;
                        const oper2 = parser.readOperator(OPERATORS);
                        if (oper === '<<' && oper2 === '') {
                            parser.i = oi;
                            idname += parser.readOperator(OPERATORS);
                        } else {
                            parser.i = oi2;
                            idname += oper;
                        }
                    }
                } else if (idname === 'unsigned') {
                    isUnsigned = 1;
                    idname = parser.readIdentifier();
                    if (idname === null) {
                        idname = 'int';
                    }
                } else if (idname === 'signed') {
                    isUnsigned = 2;
                    idname = parser.readIdentifier();
                    if (idname === null) {
                        idname = 'int';
                    }
                } else if (scope === PdbId.global) {
                    const matched = idname.match(/^#KEY([0-9]+)$/);
                    if (matched !== null) {
                        id = PdbId.Key.make(+matched[1]);
                    }
                }
                if (id === null) id = scope.makeChild(idname);
                if (isUnsigned !== 0) {
                    id = id.decorate(
                        isUnsigned === 1 ? DecoSymbol.unsigned : DecoSymbol.signed,
                        parser.getFrom(sourceFrom));
                }
                if (idname.startsWith('~')) {
                    id.parent!.determine(PdbId.Class);
                }
                id.source = parser.getFrom(sourceFrom);
                if (castTo !== null) {
                    id.determine(PdbId.CastFunctionBase).castTo = castTo;
                }
            }
            break;
        }

        if (id !== null) {
            id.addRef();

            if(FIELD_FOR_CLASS.has(idname)) {
                id.parent!.determine(PdbId.Class);
            }
            if (parser.nextIf('`')) {
                id.release();
                const adjustor = parser.readTo("'");
                let matched:RegExpMatchArray|null;
                if ((matched = adjustor.match(/^adjustor{([0-9]+)}$/))) {
                    id = scope.makeChild(id.name+'`'+adjustor+"'");
                    id.params = [PdbId.makeConstantNumber(+matched[1])];
                } else if ((matched = adjustor.match(/^vtordisp{([0-9]+),([0-9]+)}$/))) {
                    id = scope.makeChild(id.name+'`'+adjustor+"'");
                    const v1 = PdbId.makeConstantNumber(+matched[1]);
                    const v2 = PdbId.makeConstantNumber(+matched[2]);
                    id.params = [v1, v2];
                } else {
                    printParserState();
                    throw Error(`Invalid adjustor ${adjustor}`);
                }
                id.source = parser.getFrom(sourceFrom);
            }
            while (parser.nextIf('<')) {
                const tbase:PdbId.TemplateBase = id.determine(PdbId.TemplateBase);
                const args:PdbId<PdbId.Data>[] = [];
                if (!parser.nextIf('>')) {
                    for (;;) {
                        const arg = parseIdentity(",>");
                        args.push(arg);
                        if (parser.endsWith(',')) continue;
                        if (!parser.endsWith('>')) {
                            printParserState();
                            throw Error(`Unexpected end`);
                        }
                        break;
                    }
                }
                const source = parser.getFrom(sourceFrom);
                id = tbase.makeSpecialized(args, source);
            }
        }

        parser.skipSpaces();
        if (parser.nextIf('::')) {
            if (id === null) {
                throw Error('namespace without name');
            }
            id.determine(PdbId.NamespaceLike);
            scope = id;
        } else {
            if (info.prefixType != null) {
                if (id === null) {
                    throw Error('class without name');
                }
                if (id.data instanceof PdbId.FunctionBase) {
                    // function base but type
                    id = id.parent!.makeChild(id.name + '_');
                }
                if (info.prefixType === 'enum') {
                    id.determine(PdbId.Enum);
                } else {
                    if (!id.is(PdbId.TemplateBase)) {
                        const cls = id.determine(PdbId.Class);
                        cls.canBeTemplateBase = true;
                    }
                }
            }
            if (id !== null) {
                id.source = parser.getFrom(sourceFrom);
            }
            const decoParser = new DecoParser;
            decoParser.base = id;
            decoParser.parse(from, sourceFrom, eof);
            if (decoParser.base === null) throw Error(`no base`);
            decoParser.decoListMustEmpty();
            return decoParser.base;
        }
    }

}

function parseSymbol(eof:string, isFunction:boolean = false):PdbId<PdbId.Data> {
    const from = parser.i;
    let modifier:string|null = null;
    const isThunk = parser.nextIf('[thunk]:');
    if (parser.nextIf('public:')) {
        modifier = 'public';
    } else if (parser.nextIf('private:')) {
        modifier = 'private';
    } else if (parser.nextIf('protected:')) {
        modifier = 'protected';
    }
    parser.skipSpaces();
    const virtualFunction = parser.nextIf('virtual');
    const isStatic = parser.nextIf('static');

    const id = parseIdentity(eof, {isTypeInside:isFunction});
    if (modifier !== null) {
        id.modifier = modifier;
        id.decay().parent!.determine(PdbId.Class);
    }
    if (virtualFunction) {
        const func = id.determine(PdbId.Function);
        func.isVirtual = true;

        id.decay().parent!.determine(PdbId.Class);
    }
    if (isStatic) {
        id.isStatic = true;
        id.decay().parent!.determine(PdbId.Class);
    }
    id.isThunk = isThunk;
    id.source = parser.getFrom(from);
    return id;
}

function parse(list?:number[]):void {
    const cache = new PdbCache;
    if (list == null) list = [0, cache.total];
    for (let i=list.length-1;i>=0;i--) {
        if (list[i] <= cache.total) break;
        list.pop();
    }

    let count = 0;
    for (let i=0;i<list.length;) {
        const from = list[i++];
        let to = list[i++];
        if (to == null) to = cache.total;
        count += to - from;
    }

    let listIndex = 0;
    const bar = new ProgressBar('[symbolparser.ts] Parsing [:bar] :current/:total', count);
    symbolIndex = -1;
    for (const {address, name} of cache) {
        const from = list[listIndex];
        if (++symbolIndex < from) continue;
        const to = list[listIndex+1];
        if (symbolIndex >= to) {
            listIndex += 2;
            if (listIndex >= list.length) break;
            continue;
        }

        bar.tick();
        parser.context = name;
        parser.i = 0;
        try {
            const id = parseSymbol('');
            id.address = address;
            PdbId.addressMap.set(address, id);
            id.source = parser.context;
        } catch (err) {
            if (err === SKIP) continue;
            printParserState(...(err instanceof IdError ? err.ids : []));
            throw err;
        }
    }
    bar.terminate();
    cache.close();
}

function arround(list:number[], range:number = 10):number[] {
    list.sort((a,b)=>a-b);
    const narray:number[] = [];
    let prevmax = 0;
    for (const n of list) {
        const min = Math.max(n-range, prevmax);
        const max = n+range;
        if (max > prevmax) {
            narray.push(min, max);
            prevmax = max;
        }
    }
    return narray;
}

PdbId.parse('class std::basic_string<char,class std::char_traits<char>,class std::allocator<char> >');
PdbId.parse('class std::basic_ostream<char,class std::char_traits<char> >');
PdbId.parse('class std::basic_istream<char,class std::char_traits<char> >');
PdbId.parse('class std::basic_iostream<char,class std::char_traits<char> >');
PdbId.parse('class std::basic_stringbuf<char,class std::char_traits<char>,class std::allocator<char> >');
PdbId.parse('class std::basic_istringstream<char,class std::char_traits<char>,class std::allocator<char> >');
PdbId.parse('class std::basic_ostringstream<char,class std::char_traits<char>,class std::allocator<char> >');
PdbId.parse('class std::basic_stringstream<char,class std::char_traits<char>,class std::allocator<char> >');

parse();
