import { pdb } from "../core";
import { templateName } from "../templatename";
import { LanguageParser } from "../textparser";
import { arraySame } from "../util";
import { PdbCache } from "./pdbcache";
import ProgressBar = require('progress');

export class DecoSymbol {
    public readonly needSpace:boolean;

    private constructor(
        public readonly key:string,
        public readonly name:string) {
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

    static make(key:string, name:string):DecoSymbol {
        const already = DecoSymbol.all.get(key);
        if (already != null) return already;
        const deco = new DecoSymbol(key, name);
        DecoSymbol.all.set(key, deco);
        return deco;
    }
    static array(count:number):DecoSymbol {
        return DecoSymbol.make(count+'', '['+count+']');
    }

    private static readonly all = new Map<string, DecoSymbol>();
}

const OPERATORS = new Set<string>([
    '::',
    '&&',
]);

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

// [name, hasParam]
const SPECIAL_NAMES:[string, boolean][] = [
    ["dynamic initializer for '", true],
    ["dynamic atexit destructor for '", true],
    ["RTTI Complete Object Locator'", false],
    ["RTTI Class Hierarchy Descriptor'", false],
    ["RTTI Base Class Array'", false],
    ["anonymous namespace'", false],
    ["scalar deleting destructor'", false],
    ["eh vector constructor iterator'", false],
    ["eh vector copy constructor iterator'", false],
    ["eh vector destructor iterator'", false],
    ["vector deleting destructor'", false],
    ["RTTI Type Descriptor'", false],
    ["vbase destructor'", false],
];

const FIELD_FOR_CLASS = new Set<string>([
    "`vector deleting destructor'",
    "`scalar deleting destructor'",
]);

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


function unionIfAny(from:PdbIdentifier, other:PdbIdentifier):PdbIdentifier|null {
    if (from === other) return from;
    if (from === PdbIdentifier.any_t || other === PdbIdentifier.any_t) return PdbIdentifier.any_t;
    if (from.templateBase !== null && from.templateBase === other.templateBase) {
        if (from.templateParameters.length !== other.templateParameters.length) return null;
        const params:PdbIdentifier[] = [];
        for (let i=0;i<from.templateParameters.length;i++) {
            const param = unionIfAny(from.templateParameters[i], other.templateParameters[i]);
            if (param === null) return null;
            params.push(param);
        }
        return from.templateBase.makeSpecialized(params);
    }
    return null;
}
function unionAdd(types:Set<PdbIdentifier>, other:PdbIdentifier):PdbIdentifier|null {
    if (other.unionedTypes !== null) {
        throw Error(`${other} is unionedType`);
    }
    if (other === PdbIdentifier.any_t) {
        return PdbIdentifier.any_t;
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
function getKey(key:string, or:(key:string)=>PdbIdentifier):PdbIdentifier {
    let item = PdbIdentifier.keyMap.get(key);
    if (item != null) return item;
    item = or(key);
    PdbIdentifier.keyMap.set(key, item);
    return item;
}

export class PdbIdentifier {
    public id = ++idCounter;
    public readonly originalName:string;
    public modifier:string|null = null;
    public isVirtualFunction = false;
    public isNamespaceLike = false;
    public isNamespace = false;
    public isClassLike = false;
    public isFunction = false;
    public isFunctionBase = false;
    public isTemplateFunctionBase = false;
    public isNameBase = false;
    public isMemberPointer = false;
    public isEnum = false;
    public isTemplate = false;
    public isPrivate = false;
    public isLambda = false;
    public isType = false;
    public arraySize:number|null = null;
    public isFunctionType = false;
    public isDecoed = false;
    public isBasicType = false;
    public isRedirectType = false;
    public isConstructor = false;
    public isNoExcept = false;
    public isTemplateConstructorBase = false;
    public deco:DecoSymbol|null = null;
    public decoedFrom:PdbIdentifier|null = null;
    public memberPointerBase:PdbIdentifier|null = null;
    public isValue = false;
    public isConstant = false;
    public callingConvension:string|null = null;
    public isDestructor = false;
    public isStatic = false;
    public isThunk = false;
    public isVFTable = false;
    public parent:PdbIdentifier|null = null;
    public templateBase:PdbIdentifier|null = null;
    public functionBase:PdbIdentifier|null = null;
    public nameBase:PdbIdentifier|null = null;
    public returnType:PdbIdentifier|null = null;
    public readonly children:PdbIdentifier[] = [];
    public functionParameters:PdbIdentifier[] = [];
    public templateParameters:PdbIdentifier[] = [];
    public adjustors:PdbIdentifier[] = [];
    public specialized:PdbIdentifier[] = [];
    public isTemplateBase = false;
    public overloads:PdbIdentifier[] = [];
    public address = 0;
    public redirectTo:PdbIdentifier|null = null;
    public redirectedFrom:PdbIdentifier|null = null;
    public source = '';
    public constFunction:PdbIdentifier|null = null;
    public ref = 0;
    public symbolIndex = symbolIndex;
    public unionedTypes:Set<PdbIdentifier>|null = null;
    public get isTypeUnion():boolean {
        return this.unionedTypes !== null;
    }


    static makeTypeUnionKey(types:PdbIdentifier[]):string {
        return '!'+types.map(a=>a.id).join('|');
    }
    static makeDecoKey(base:PdbIdentifier, deco:DecoSymbol):string {
        return `!${base.id}D${deco.key}`;
    }
    static makeChildKey(base:PdbIdentifier, child:string):string {
        return `!${base.id}/${child}`;
    }
    static makeMemberFunctionTypeKey(base:PdbIdentifier):string {
        return `!m${base.returnType!.id} ${base.memberPointerBase!.id}`;
    }
    static makeFunctionTypeKey(base:PdbIdentifier):string {
        return `!f${base.returnType!.id}`;
    }
    static makeFunctionKey(base:PdbIdentifier, args:PdbIdentifier[]):string {
        return `!${base.id}(${args.map(v=>v.id).join(',')})`;
    }
    static makeTemplateKey(base:PdbIdentifier, args:PdbIdentifier[]):string {
        return templateName('!'+base.id, ...args.map(id=>id.id+''));
    }

    constructor (
        public name:string,
        public readonly key:string) {
        this.originalName = name;
    }

    hasNonGlobalParent():this is {parent:PdbIdentifier} {
        return this.parent !== null && this.parent !== PdbIdentifier.global;
    }

    getBase():PdbIdentifier {
        if (this.templateBase !== null) {
            return this.templateBase.getBase();
        }
        if (this.functionBase !== null) {
            return this.functionBase.getBase();
        }
        return this;
    }

    checkBase(...baseNames:(string|PdbIdentifier)[]):boolean {
        const list:PdbIdentifier[] = [];
        let base:PdbIdentifier = this.decay();
        while (base.parent !== null) {
            list.push(base);
            base = base.parent.decay();
        }

        function check(target:PdbIdentifier, base:PdbIdentifier|string):boolean {
            if (target.templateBase !== null) {
                if (check(target.templateBase, base)) return true;
            }
            if (target.functionBase !== null) {
                if (check(target.functionBase, base)) return true;
            }
            return target === base || target.name === base;
        }

        for (const base of baseNames) {
            const target = list.pop();
            if (target == null) return false;
            if (!check(target, base)) return false;
        }
        return true;
    }

    addRef():void {
        this.ref++;
    }

    delete():void {
        if (this.templateBase !== null) {
            const idx = this.templateBase.specialized.indexOf(this);
            if (idx !== -1) this.templateBase.specialized.splice(idx, 1);
        }
        if (this.functionBase !== null) {
            const idx = this.functionBase.overloads.indexOf(this);
            if (idx !== -1) this.functionBase.overloads.splice(idx, 1);
        }
        const children = this.parent!.children;
        const idx = children.indexOf(this);
        if (idx !== -1) children.splice(idx ,1);
    }

    release():void {
        this.ref--;
        if (this.ref === 0) {
            this.delete();
        }
    }

    removeConst():PdbIdentifier {
        return this.removeDeco(DecoSymbol.const);
    }

    removeDeco(deco:DecoSymbol):PdbIdentifier {
        if (this.decoedFrom !== null) {
            if (this.deco === deco) return this.decoedFrom;
            const removed = this.decoedFrom.removeDeco(deco);
            if (removed === this) return this;
            return removed.decorate(this.deco!);
        }
        return this;
    }

    static arrangeTemplateParameters(types:PdbIdentifier[]):PdbIdentifier[][] {
        const params:PdbIdentifier[][] = [];
        for (const s of types) {
            const sparams = s.templateParameters;
            for (let i=0;i<sparams.length;i++) {
                if (i === params.length) {
                    params.push([]);
                }
                params[i].push(sparams[i]);
            }
        }
        return params;
    }

    static checkSameBase(types:PdbIdentifier[]):boolean {
        const first = types[0];
        const base = first.templateBase;
        if (base === null) return false;
        for (const t of types) {
            if (t.templateBase !== base) return false;
        }
        return true;
    }

    static anyOrSame(items:PdbIdentifier[]):boolean {
        if (arraySame(items)) return true;
        if (items.indexOf(PdbIdentifier.any_t) !== -1) return true;
        if (!PdbIdentifier.checkSameBase(items)) return false;
        if (!arraySame(items.map(item=>item.templateParameters.length))) return false;
        const types = PdbIdentifier.arrangeTemplateParameters(items);
        for (const ts of types) {
            if (!PdbIdentifier.anyOrSame(ts)) {
                return false;
            }
        }
        return true;
    }

    contains(other:PdbIdentifier):boolean {
        if (this === other) return true;
        if (this === PdbIdentifier.any_t) return true;
        if (this.unionedTypes !== null) {
            if (other.unionedTypes !== null) {
                for (const t of other.unionedTypes) {
                    if (!this.unionedTypes.has(t)) return false;
                }
                return true;
            } else {
                if (this.unionedTypes.has(other)) return true;
            }
        }
        if (this.templateBase !== null && this.templateBase === other.templateBase) {
            if (this.templateParameters.length !== other.templateParameters.length) {
                return false;
            }
            for (let i=0;i<this.templateParameters.length;i++) {
                if (!PdbIdentifier.anyOrSame([this.templateParameters[i], other.templateParameters[i]])) return false;
            }
            return true;
        }
        return false;
    }

    unionWith(other:PdbIdentifier):PdbIdentifier{
        const a = this.removeConst();
        const b = other.removeConst();
        if (a === b) return a;
        if (a === PdbIdentifier.any_t || b === PdbIdentifier.any_t) return PdbIdentifier.any_t;
        if (a.unionedTypes !== null) {
            if (a.unionedTypes.has(b)) {
                return a;
            }
        } else {
            if (b.unionedTypes !== null) {
                if (b.unionedTypes.has(a)) return b;
            }
        }

        const unionedTypes = new Set<PdbIdentifier>();
        if (a.unionedTypes !== null) {
            for (const item of a.unionedTypes) {
                unionedTypes.add(item);
            }
        } else {
            unionedTypes.add(a);
        }

        if (b.unionedTypes !== null) {
            for (const item of b.unionedTypes) {
                unionAdd(unionedTypes, item);
                if (unionedTypes.size > 5) {
                    return PdbIdentifier.any_t;
                }
            }
        } else {
            unionAdd(unionedTypes, b);
            if (unionedTypes.size > 5) {
                return PdbIdentifier.any_t;
            }
        }

        const array = [...unionedTypes].sort((a,b)=>a.id-b.id);
        return getKey(PdbIdentifier.makeTypeUnionKey(array), key=>{
            const name = array.map(a=>a.name).join('|');
            const unioned = new PdbIdentifier(name, key);
            unioned.unionedTypes = unionedTypes;
            return unioned;
        });
    }

    static makeUnionedType(items:PdbIdentifier[]):PdbIdentifier {
        items.sort((a,b)=>a.id-b.id);
        return getKey(PdbIdentifier.makeTypeUnionKey(items), key=>{
            const name = items.map(a=>a.name).join('|');
            const unioned = new PdbIdentifier(name, key);
            unioned.unionedTypes = new Set(items);
            return unioned;
        });
    }

    hasArrayParam():boolean {
        for (const param of this.functionParameters) {
            if (param.getArraySize() !== null) return true;
        }
        return false;
    }

    *allOverloads():IterableIterator<PdbIdentifier> {
        if (this.isTemplate) {
            for (const s of this.specialized) {
                for (const o of s.overloads) {
                    if (o.address === 0) continue;
                    yield o;
                }
            }
        } else if (this.isFunctionBase) {
            for (const o of this.overloads) {
                if (o.address === 0) continue;
                yield o;
            }
        }
    }

    isPointerLike():boolean {
        if (this.deco === DecoSymbol["&"] || this.deco === DecoSymbol["*"]) return true;
        if (this.decoedFrom !== null) return this.decoedFrom.isPointerLike();
        return false;
    }

    decorate(deco:DecoSymbol, source?:string):PdbIdentifier {
        return getKey(PdbIdentifier.makeDecoKey(this, deco), key=>{
            let name = this.name;
            if (deco.needSpace) {
                name += ' ';
            }
            name += deco.name;
            const id = new PdbIdentifier(name, key);
            if (this.isType) id.setAsType();
            if (this.isValue) id.setAsValue();
            if (this.isBasicType) id.setAsBasicType();
            id.isDecoed = true;
            id.deco = deco;
            id.decoedFrom = this;
            if (source != null) id.source = source;
            return id;
        });
    }

    append(child:PdbIdentifier):void {
        if (child.parent !== null) {
            if (child.parent === this) return;
            throw Error(`${this} already has parent`);
        }
        child.parent = this;
        this.children.push(child);
    }

    makeChild(name:string):PdbIdentifier {
        return getKey(PdbIdentifier.makeChildKey(this, name), key=>{
            const item = new PdbIdentifier(name, key);
            this.append(item);
            return item;
        });
    }

    findChild(name:string):PdbIdentifier|null {
        return PdbIdentifier.keyMap.get(PdbIdentifier.makeChildKey(this, name)) || null;
    }

    getArraySize():number|null {
        let node:PdbIdentifier = this;
        for (;;) {
            if (node.decoedFrom === null) return null;
            if (node.arraySize !== null) return node.arraySize;
            node = node.decoedFrom;
        }
    }

    decay():PdbIdentifier {
        let id:PdbIdentifier = this;
        for (;;) {
            if (id.decoedFrom === null) return id;
            id = id.decoedFrom;
        }
    }

    removeParameters():PdbIdentifier {
        return this.functionBase || this;
    }

    removeTemplateParameters():PdbIdentifier {
        return this.templateBase || this;
    }

    makeSpecialized(args:PdbIdentifier[], source?:string):PdbIdentifier {
        if (this.parent === null) throw Error(`no parent`);
        const key = PdbIdentifier.makeTemplateKey(this, args);
        this.isTemplateBase = true;
        let specialized = PdbIdentifier.keyMap.get(key);
        if (specialized == null) {
            const name = templateName(this.name, ...args.map(id=>id.toString()));
            specialized = new PdbIdentifier(name, key);
            specialized.templateParameters = args;
            specialized.templateBase = this;
            this.parent.append(specialized);
            if (source != null) specialized.source = source;
            this.specialized.push(specialized);
            PdbIdentifier.keyMap.set(key, specialized);
        } else {
            if (specialized.isConstructor || specialized.isDestructor) {
                // ctor or dtor
            } else {
                for (let i=0;i<args.length;i++) {
                    if (specialized.templateParameters[i] !== args[i]) {
                        throw Error(`name is same but parameters mismatched. (${specialized.templateParameters[i]} != ${args[i]})`);
                    }
                }
                if (specialized.templateBase !== this) {
                    throw Error(`name is same but template base mismatched. (${specialized.templateBase} != ${this})`);
                }
            }
        }
        return specialized;
    }

    makeFunction(args:PdbIdentifier[], returnType:PdbIdentifier|null, isType:boolean):PdbIdentifier {
        return makeFunction(this, returnType, args, isType);
    }

    replaceTypeCascade(from:PdbIdentifier, to:PdbIdentifier):PdbIdentifier {
        if (this === from) return to;
        if (this.decoedFrom !== null) {
            return this.decoedFrom.replaceTypeCascade(from, to).decorate(this.deco!);
        }
        if (this.templateBase !== null) {
            const types = this.templateParameters.map(v=>v.replaceTypeCascade(from, to));
            for (let i=0;i<types.length;i++) {
                if (this.templateParameters[i] !== types[i]) {
                    return this.templateBase.makeSpecialized(types);
                }
            }
        } else if (this.functionBase !== null) {
            if (this.returnType === null) throw Error(`function but no returntype (${this})`);
            const returnType = this.returnType.replaceTypeCascade(from, to);
            const types = this.functionParameters.map(v=>v.replaceTypeCascade(from, to));
            if (returnType !== this.returnType) {
                return this.functionBase.makeFunction(types, returnType, this.isType);
            }
            for (let i=0;i<types.length;i++) {
                if (this.functionParameters[i] !== types[i]) {
                    return this.functionBase.makeFunction(types, returnType, this.isType);
                }
            }
        }
        return this;
    }

    toString():string {
        let name = '';
        if (this.parent === null || this.parent === PdbIdentifier.global) name = this.name.toString();
        else name = this.parent.toString() + '::' + this.name.toString();
        if (this.returnType !== null) {
            if (!this.isType) {
                return this.returnType.toString() + ' ' + name;
            }
        }
        return name;
    }

    setReturnType(returnType:PdbIdentifier):void {
        this.returnType = returnType;
    }

    setAsNamespace():void {
        this.setAsNamespaceLike();
        if (this.isClassLike) throw Error(`namespace but class(${this})`);
        this.isNamespace = true;
    }

    setAsNamespaceLike():void {
        if (this.isNamespaceLike) return;
        this.isNamespaceLike = true;
        if (this.parent !== null) {
            if (this.parent.isClassLike) {
                this.setAsClass();
            } else {
                this.parent.setAsNamespaceLike();
            }
        }
    }

    setAsValue():void {
        if (this.isType) {
            throw Error(`type but value (${this})`);
        }
        this.isValue = true;
    }

    setAsType():void {
        if (this.isTemplateFunctionBase) throw Error(`function base but type (${this})`);
        if (this.isFunctionBase) throw Error(`function base but type (${this})`);
        if (this.isFunction) {
            throw Error(`function but type (${this})`);
        }
        if (this.isValue) throw Error(`value but type (${this})`);
        this.isType = true;
    }

    setAsBasicType():void {
        this.setAsType();
        this.isBasicType = true;
    }

    setAsClass():void {
        this.setAsType();
        this.setAsClassLike();

        if (this.templateBase !== null) {
            this.templateBase.setAsClass();
        }

        if (this.parent !== null) {
            this.parent.setAsNamespaceLike();
        }
    }

    setAsClassLike():void {
        if (this === PdbIdentifier.global) throw Error(`set class to root`);
        this.isClassLike = true;
        this.setAsNamespaceLike();
    }

    setAsEnum():void {
        this.setAsType();
        this.isEnum = true;
        this.setAsClassLike();
    }

    setAsFunction():void {
        this.isFunction = true;
    }

    getTypeOfIt():PdbIdentifier {
        if (this.isConstant) {
            if (this.parent !== PdbIdentifier.global) {
                throw Error(`${this}: constant parent is not global`);
            }
            if (/^-?[0-9]+$/.test(this.name)) {
                return PdbIdentifier.int_t;
            } else {
                throw Error(`${this}: unexpected constant`);
            }
        }
        if (this.isClassLike || this.isBasicType) {
            return PdbIdentifier.typename.makeSpecialized([this]);
        }
        if (this.isValue) {
            const item = this.removeDeco(DecoSymbol['&']).removeConst();
            if (item.isFunction) {
                if (item.isMemberPointer) {
                    const base = getKey(PdbIdentifier.makeMemberFunctionTypeKey(item),
                        key=>new PdbIdentifier(`${item.returnType} ${item.memberPointerBase}::*`, key));
                    return makeFunction(base, item.returnType!, item.functionParameters, true);
                } else {
                    const base = getKey(PdbIdentifier.makeFunctionTypeKey(item),
                        key=>new PdbIdentifier(`${item.returnType}`, key));
                    return makeFunction(base, item.returnType!, item.functionParameters, true);
                }
            }
            if (item.returnType === null) {
                return item;
            }
            return item.returnType;
        }
        return PdbIdentifier.typename.makeSpecialized([this]);
    }

    redirect(target:PdbIdentifier):void {
        this.redirectTo = target;
        target.redirectedFrom = this;
        this.isRedirectType = true;
    }
    static parse(symbol:string):PdbIdentifier {
        const oldi = parser.i;
        const oldctx = parser.context;
        parser.i = 0;
        parser.context = symbol;
        const out = parseSymbol('');
        parser.context = oldctx;
        parser.i = oldi;
        return out;
    }

    unwrapType():PdbIdentifier {
        if (this.templateBase === PdbIdentifier.typename) {
            return this.templateParameters[0];
        }
        if (this.unionedTypes !== null) {
            return PdbIdentifier.makeUnionedType([...this.unionedTypes].map(u=>u.unwrapType()));
        }
        return this;
    }

    *loopAll():IterableIterator<PdbIdentifier> {
        for (const item of this.children.values()) {
            yield item;
            yield * item.loopAll();
        }
    }

    *components():IterableIterator<PdbIdentifier> {
        if (this.parent !== null) {
            yield this.parent;
        }
        yield *this.functionParameters;
        yield *this.templateParameters;
        if (this.unionedTypes !== null) {
            yield *this.unionedTypes;
        }
        if (this.returnType !== null) {
            yield this.returnType;
        }
    }

    static makeConst(name:string):PdbIdentifier {
        const id = PdbIdentifier.make(name);
        id.isConstant = true;
        id.setAsValue();
        return id;
    }

    static make(name:string):PdbIdentifier {
        return PdbIdentifier.global.makeChild(name);
    }

    static filter:(item:PdbIdentifier)=>boolean = ()=>true;

    public static readonly keyMap = new Map<string, PdbIdentifier>();
    public static readonly global = new PdbIdentifier('', '');
    public static readonly std = PdbIdentifier.make('std');
    public static readonly any_t = PdbIdentifier.make('any');
    public static readonly never_t = PdbIdentifier.make('never');
    public static readonly typename = PdbIdentifier.make('typename');
    public static readonly int_t = PdbIdentifier.make('int');
}

PdbIdentifier.global.setAsNamespace();
PdbIdentifier.std.setAsNamespace();
PdbIdentifier.make('__int64').setAsBasicType();
PdbIdentifier.make('__int64 unsigned').setAsBasicType();
PdbIdentifier.make('bool').setAsBasicType();
PdbIdentifier.make('void').setAsBasicType();
PdbIdentifier.int_t.setAsBasicType();
PdbIdentifier.make('int unsigned').setAsBasicType();
PdbIdentifier.make('long').setAsBasicType();
PdbIdentifier.make('long unsigned').setAsBasicType();
PdbIdentifier.make('short').setAsBasicType();
PdbIdentifier.make('short unsigned').setAsBasicType();
PdbIdentifier.make('char').setAsBasicType();
PdbIdentifier.make('char unsigned').setAsBasicType();
PdbIdentifier.make('wchar_t').setAsBasicType();
PdbIdentifier.make('wchar_t unsigned').setAsBasicType();
PdbIdentifier.make('float').setAsBasicType();
PdbIdentifier.make('double').setAsBasicType();
PdbIdentifier.any_t.setAsBasicType();

const void_t = PdbIdentifier.make('void');
void_t.setAsBasicType();
PdbIdentifier.typename.isType = true;

const parser = new LanguageParser('');

interface ParsingInfo {
    isFunction:boolean;
    callingConvension:string|null;
    isParenthesesInside:boolean;
}

function printParserState(id?:PdbIdentifier|null):void {
    console.log();
    console.log();
    console.log('index: '+symbolIndex);
    if (id != null) console.log(id+'');
    console.log(parser.context);
    console.log(' '.repeat(parser.i)+'^');
}

function must(next:string, id?:PdbIdentifier):void {
    if (parser.nextIf(next)) return;
    printParserState(id);
    throw Error(`unexpected character(Expected=${next}, Actual=${parser.peek()})`);
}

function setAsFunction(func:PdbIdentifier, funcbase:PdbIdentifier, args:PdbIdentifier[], returnType:PdbIdentifier|null, isType:boolean):void {
    if (args.length === 1 && args[0] === void_t) {
        args.length = 0;
    }
    func.functionParameters = args;

    if (returnType !== null) {
        func.setReturnType(returnType);
    }
    if (isType) {
        func.setAsType();
        func.isFunctionType = true;
    } else {
        funcbase.overloads.push(func);
        func.setAsFunction();
        func.functionBase = funcbase;
        funcbase.isFunctionBase = true;
        const templateBase = funcbase.templateBase;
        if (templateBase !== null)  {
            templateBase.isTemplateFunctionBase = true;
            func.templateBase = templateBase;
            func.templateParameters = func.functionBase.templateParameters.slice();
        }
    }
}

function makeFunction(funcbase:PdbIdentifier, returnType:PdbIdentifier|null, args:PdbIdentifier[], isType:boolean):PdbIdentifier {
    return getKey(PdbIdentifier.makeFunctionKey(funcbase, args), key=>{
        const id = new PdbIdentifier(funcbase.name+'('+args.join(',')+')', key);
        if (funcbase.parent !== null) {
            funcbase.parent.append(id);
        }
        id.isConstructor = funcbase.isConstructor;
        id.isDestructor = funcbase.isDestructor;
        if (id.isConstructor || id.isDestructor) id.parent!.setAsClass();
        setAsFunction(id, funcbase, args, returnType, isType);
        return id;
    });
}

function parseParameters():PdbIdentifier[] {
    const args:PdbIdentifier[] = [];
    for (;;) {
        if (parser.nextIf('...')) {
            parser.readOperator(OPERATORS);
            args.push(PdbIdentifier.make('...'));
        } else {
            const arg = parseIdentity(',)');
            arg.setAsType();
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

abstract class Deco {
    chain:Deco|null = null;
    abstract apply(id:PdbIdentifier):PdbIdentifier;

    add(chain:Deco):void {
        chain.chain = this.chain;
        this.chain = chain;
    }

    clear():void {
        this.chain = null;
    }
}

class DecoRoot extends Deco {
    apply(id:PdbIdentifier):PdbIdentifier {
        if (this.chain === null) return id;
        return this.chain.apply(id);
    }
}

function parseDeco(
    base:PdbIdentifier|null,
    info:ParsingInfo,
    from:number,
    sourceFrom:number,
    eof:string):PdbIdentifier {

    const deco = new DecoRoot;

    for (;;) {
        const prev = parser.i;
        const oper = parser.readOperator(OPERATORS);
        if (oper === null) {
            if (eof !== '') {
                throw Error(`Unexpected end, ${eof} expected`);
            }
            if (base === null) throw Error(`null base`);
            return deco.apply(base);
        } else if (oper === '' || oper === '`' || oper === '<') {
            if (oper !== '') {
                parser.i = prev;
            }
            const beforeKeyword = parser.i;
            const keyword = parser.readIdentifier();
            if (keyword === 'const') {
                if (base === null) throw Error(`null base`);
                const decoed = base.decorate(DecoSymbol.const, parser.getFrom(sourceFrom));
                if (base.isFunction) {
                    base.constFunction = decoed;
                    setAsFunction(decoed, base.functionBase!, base.functionParameters.slice(), base.returnType!, base.isType);
                    base.parent!.append(decoed);
                    decoed.isType = false;
                }
                base = decoed;
            } else if (keyword === '__cdecl' || keyword === '__stdcall') {
                if (info.callingConvension !== null) {
                    base = parseDeco(base,
                        {callingConvension: keyword, isFunction: true, isParenthesesInside: info.isParenthesesInside},
                        from, sourceFrom, ')');
                    parser.unget(')');
                } else {
                    info.callingConvension = keyword;
                    info.isFunction = true;
                }
            } else if (keyword === '__ptr64') {
                // do nothing
            } else if (keyword === 'unsigned' || keyword === 'signed') {
                if (base === null) throw Error(`null base`);
                base = base.decorate(DecoSymbol[keyword], parser.getFrom(sourceFrom));
                base.setAsBasicType();
            } else if (keyword === 'noexcept') {
                if (base === null) throw Error(`null base`);
                if (!base.isFunction && !base.isFunctionType) throw Error(`base is not function (${base})`);
                if (base.isType) {
                    base = base.decorate(DecoSymbol.noexcept, parser.getFrom(sourceFrom));
                }
                base.isNoExcept = true;
            } else {
                if (keyword === null) {
                    parser.skipSpaces();
                    if (parser.nextIf('`')) {
                        const name = parser.readTo("'");
                        if (name === 'RTTI Type Descriptor') {
                            if (base === null) throw Error(`null base`);
                            base = base.makeChild("`RTTI Type Descriptor'");
                            base.source = parser.getFrom(sourceFrom);
                            base.isStatic = true;
                            base.setAsValue();
                            continue;
                        }
                    }
                }
                parser.i = beforeKeyword;
                let neof = '';
                if (info.isParenthesesInside) neof += ')';
                if (info.isFunction) neof += '(';
                const fnOrThisType = parseIdentity(neof || eof, {isTypeInside: true});
                let returnType:PdbIdentifier|null;
                if (base !== null) {
                    returnType = deco.apply(base);
                    if (fnOrThisType.returnType !== null) {
                        throw Error(`returnType dupplicated (${fnOrThisType})`);
                    }
                } else {
                    if (fnOrThisType.returnType !== null) {
                        returnType = fnOrThisType.returnType;
                    } else if (fnOrThisType.name.startsWith('~')) {
                        returnType = void_t;
                        fnOrThisType.isDestructor = true;
                        if (fnOrThisType.templateBase !== null) {
                            fnOrThisType.nameBase = fnOrThisType.templateBase;
                            fnOrThisType.nameBase.isNameBase = true;
                            fnOrThisType.templateBase = null;
                        }
                    } else {
                        let ctor:PdbIdentifier|null = null;
                        const parent = fnOrThisType.parent!;
                        if (parent.name === fnOrThisType.name) {
                            ctor = fnOrThisType;
                        } else if (fnOrThisType.templateBase !== null && fnOrThisType.templateBase.name === parent.name) {
                            ctor = fnOrThisType.templateBase;
                        }
                        if (ctor !== null) {
                            if (ctor.templateBase !== null) {
                                ctor.nameBase = ctor.templateBase;
                                ctor.nameBase!.isNameBase = true;
                                ctor.templateBase = null;
                            }
                            ctor.isConstructor = true;
                            returnType = void_t;
                            fnOrThisType.isConstructor = true;
                        } else {
                            returnType = null;
                        }
                    }
                }
                deco.clear();

                if (parser.endsWith('(')) {
                    const args = parseParameters();
                    base = makeFunction(fnOrThisType, returnType, args, false);
                    base.source = parser.getFrom(sourceFrom);
                    info.isFunction = false;
                } else if (parser.endsWith('*')) {
                    base = PdbIdentifier.make(`${returnType} ${fnOrThisType}::*`);
                    base.isMemberPointer = true;
                    base.memberPointerBase = fnOrThisType;
                    if (returnType !== null) {
                        base.setReturnType(returnType);
                    }
                    base.setAsType();
                    base.source = parser.getFrom(sourceFrom);
                } else {
                    base = fnOrThisType;
                    if (info.isFunction) {
                        // vcall, code chunk?
                    } else {
                        base.setAsValue();
                    }
                    if (returnType !== null) {
                        base.setReturnType(returnType);
                    }
                    base.source = parser.getFrom(sourceFrom);
                    return base;
                }
            }
        } else if (eof.indexOf(oper) !== -1) {
            if (base === null) throw Error(`null base`);
            return base;
        } else if (oper === '*' || oper === '&' || oper === '&&') {
            if (base === null) throw Error(`null base`);
            base = base.decorate(DecoSymbol[oper], parser.getFrom(sourceFrom));
        } else if (oper === '(') {
            if (info.isFunction) {
                if (base === null) throw Error(`null base`);
                const args = parseParameters();
                let baseType:PdbIdentifier;
                let returnType:PdbIdentifier;
                let isType = false;
                if (base.isFunction) {
                    baseType = base.functionBase!;
                    returnType = makeFunction(base.returnType!, base.returnType!, args, true);
                } else if (base.isMemberPointer) {
                    baseType = base.memberPointerBase!;
                    returnType = base.returnType!;
                    isType = true;
                } else {
                    baseType = base;
                    returnType = base;
                    isType = true;
                }
                base = makeFunction(baseType, returnType, args, isType);
                info.isFunction = false;
            } else {
                const old = info.isParenthesesInside;
                info.isParenthesesInside = true;
                base = parseDeco(base, info, from, sourceFrom, ')');
                info.isParenthesesInside = old;
            }
        } else if (oper === '[') {
            const number = parser.readIdentifier();
            if (number === null) {
                printParserState(base);
                throw Error(`Invalid number ${number}`);
            }
            if (!/^[0-9]+$/.test(number)) {
                printParserState(base);
                throw Error(`Unexpected index ${number}`);
            }
            must(']');

            if (base === null) throw Error(`null base`);
            const n = +number;
            base = base.decorate(DecoSymbol.array(n), parser.getFrom(sourceFrom));
            base.arraySize = n;
        } else {
            parser.i--;
            printParserState(base);
            throw Error(`Unexpected operator ${oper}`);
        }
    }
}

function parseIdentity(eof:string, info:{isTypeInside?:boolean, scope?:PdbIdentifier, prefixType?:string, isEnum?:boolean} = {}, scope:PdbIdentifier=PdbIdentifier.global):PdbIdentifier {
    if (info.isTypeInside == null) info.isTypeInside = false;
    parser.skipSpaces();
    const sourceFrom = parser.i;

    for (;;) {
        parser.skipSpaces();
        const from = parser.i;

        let id:PdbIdentifier|null;

        let idname:string|null;
        for (;;) {
            const idnameNormal = parser.readIdentifier();
            idname = parser.getFrom(from);
            if (idnameNormal === null) {
                const oper = parser.readOperator(OPERATORS);
                if (oper === '~') {
                    continue;
                } else if (oper !== null && info.isTypeInside && oper === '*') {
                    scope.setAsClassLike();
                    scope.setAsType();
                    return scope;
                } else if (oper === '<') {
                    const innerText = parser.readTo('>');
                    const lambdaName = parser.getFrom(from);
                    if (innerText === 'lambda_invoker_cdecl') {
                        id = scope.makeChild(lambdaName);
                        id.setAsFunction();
                        id.source = parser.getFrom(sourceFrom);
                    } else if (/^lambda_[a-z0-9]+$/.test(innerText)) {
                        id = scope.makeChild(lambdaName);
                        id.isLambda = true;
                        id.source = parser.getFrom(sourceFrom);
                        id.setAsClass();
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
                    id = PdbIdentifier.makeConst('-'+idname);
                } else if (oper === '&') {
                    id = parseSymbol(eof);
                    id.setAsValue();
                    id.source = parser.getFrom(sourceFrom);
                    id = id.decorate(DecoSymbol[oper], parser.getFrom(from));
                    id.setAsValue();
                    id.source = parser.getFrom(sourceFrom);
                    return id;
                } else if (oper === '`') {
                    _idfind:{
                        if (parser.nextIf("vftable'") || parser.nextIf("vbtable'")) {
                            scope.setAsClass();
                            if (parser.nextIf('{for `')) {
                                const arg = parseSymbol("'");
                                must('}');
                                id = scope.makeChild(parser.getFrom(from));
                                id.adjustors = [arg];
                            } else {
                                id = scope.makeChild(parser.getFrom(from));
                            }
                            id.isVFTable = true;
                            id.isStatic = true;
                            id.setAsValue();
                        } else if (parser.nextIf("vcall'")) {
                            const arg = parser.readTo("'");
                            parser.readTo("'");
                            id = scope.makeChild(parser.getFrom(from));
                            id.isPrivate = true;
                            id.adjustors = [PdbIdentifier.make(arg)];
                            eof = eof.replace(/\(/, '');
                        } else if (parser.nextIf('RTTI Base Class Descriptor at (')) {
                            const arg = parser.readTo("'");
                            id = scope.makeChild(parser.getFrom(from));
                            if (!arg.endsWith(")")) {
                                throw Error(`Unexpected base descriptor name: ${id.name}`);
                            }
                            id.adjustors = arg.substr(0, arg.length-1).split(',').map(v=>PdbIdentifier.makeConst(v));
                        } else {
                            for (const [sname, hasParam] of SPECIAL_NAMES) {
                                if (parser.nextIf(sname)) {
                                    if (hasParam) {
                                        const iid = parseIdentity("'", {}, scope);
                                        must("'");
                                        id = scope.makeChild(parser.getFrom(from));
                                        id.adjustors = [iid];
                                    } else {
                                        id = scope.makeChild(parser.getFrom(from));
                                    }
                                    break _idfind;
                                }
                            }
                            const arg = parseSymbol("'");
                            parser.readTo("'");
                            id = scope.makeChild(parser.getFrom(from));
                            id.isPrivate = true;
                            id.adjustors = [arg];
                            id.source = parser.getFrom(sourceFrom);
                        }
                    }
                } else {
                    parser.i--;
                    printParserState();
                    throw Error(`Unexpected operator ${oper}`);
                }
            } else {
                let isUnsigned = 0;
                let castTo:PdbIdentifier|null = null;

                if (scope === PdbIdentifier.global && /^[0-9]+$/.test(idname)) {
                    id = PdbIdentifier.makeConst(idname);
                } else if (idname === '__cdecl' || idname === '__stdcall') {
                    if (scope === PdbIdentifier.global) {
                        id = null;
                    } else {
                        throw Error(`Invalid scope(${scope}) for ${idname}`);
                    }
                    parser.i = from;
                    break;
                } else if (idname === 'const') {
                    id = parseIdentity(eof);
                    id.setAsValue();
                    id.isConstant = true;
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
                }
                id = scope.makeChild(idname);
                if (castTo !== null) {
                    id.returnType = castTo;
                }
                if (isUnsigned !== 0) {
                    id = id.decorate(
                        isUnsigned === 1 ? DecoSymbol.unsigned : DecoSymbol.signed,
                        parser.getFrom(sourceFrom));
                    id.setAsBasicType();
                }
                if (idname.startsWith('~')) {
                    id.parent!.setAsClass();
                }
                id.source = parser.getFrom(sourceFrom);
            }
            break;
        }

        if (id !== null) {
            if(FIELD_FOR_CLASS.has(idname)) {
                if (id.isNamespace) {
                    throw Error(`${id}: is not class`);
                }
                id.parent!.setAsClass();
            }
            id.addRef();
            if (parser.nextIf('`')) {
                id.release();
                const adjustor = parser.readTo("'");
                let matched:RegExpMatchArray|null;
                if ((matched = adjustor.match(/^adjustor{([0-9]+)}$/))) {
                    id = scope.makeChild(id.name+'`'+adjustor+"'");
                    id.adjustors.push(PdbIdentifier.makeConst(matched[1]));
                } else if ((matched = adjustor.match(/^vtordisp{([0-9]+),([0-9]+)}$/))) {
                    id = scope.makeChild(id.name+'`'+adjustor+"'");
                    const v1 = PdbIdentifier.makeConst(matched[1]);
                    const v2 = PdbIdentifier.makeConst(matched[2]);
                    id.adjustors.push(v1, v2);
                } else {
                    printParserState();
                    throw Error(`Invalid adjustor ${adjustor}`);
                }
                id.source = parser.getFrom(sourceFrom);
            }
            while (parser.nextIf('<')) {
                id.isTemplate = true;

                const args:PdbIdentifier[] = [];
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
                const base = id.parent!.templateBase;
                if (base !== null && base.name === id.name) {
                    base.isTemplateConstructorBase = true;
                }
                const source = parser.getFrom(sourceFrom);
                id = id.makeSpecialized(args, source);
            }
        }

        parser.skipSpaces();
        if (parser.nextIf('::')) {
            if (id === null) {
                throw Error('namespace without name');
            }
            id.setAsNamespaceLike();
            scope = id;
        } else {
            if (info.prefixType != null) {
                if (id === null) {
                    throw Error('class without name');
                }
                if (id.isFunctionBase) {
                    // function base but type
                    id = id.parent!.makeChild(id.name + '_');
                }
                id.setAsClass();
                if (info.prefixType === 'enum') {
                    id.setAsEnum();
                }
            }
            if (id !== null) {
                id.source = parser.getFrom(sourceFrom);
            }
            return parseDeco(id, {callingConvension: null, isFunction: false, isParenthesesInside: false}, from, sourceFrom, eof);
        }
    }

}

function parseSymbol(eof:string, isFunction:boolean = false):PdbIdentifier {
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
        id.decay().parent!.setAsClass();
    }
    if (virtualFunction) {
        id.setAsFunction();
        id.isVirtualFunction = true;
        id.decay().parent!.setAsClass();
    }
    if (isStatic) {
        id.isStatic = true;
        id.decay().parent!.setAsClass();
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
    const bar = new ProgressBar('loading [:bar] :current/:total', count);
    symbolIndex = -1;
    for (const {address, name, flags, tag} of cache) {
        const from = list[listIndex];
        if (++symbolIndex < from) continue;
        const to = list[listIndex+1];
        if (symbolIndex >= to) {
            listIndex += 2;
            if (listIndex >= list.length) break;
            continue;
        }
        if (SKIPS.has(symbolIndex)) continue;

        bar.tick();
        parser.context = pdb.undecorate(name, 0);
        parser.i = 0;
        try {
            const id = parseSymbol('');
            id.address = address;
            id.source = parser.context;
        } catch (err) {
            printParserState();
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

PdbIdentifier.parse('class std::basic_string<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_ostream<char,class std::char_traits<char> >');
PdbIdentifier.parse('class std::basic_istream<char,class std::char_traits<char> >');
PdbIdentifier.parse('class std::basic_iostream<char,class std::char_traits<char> >');
PdbIdentifier.parse('class std::basic_stringbuf<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_istringstream<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_ostringstream<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_stringstream<char,class std::char_traits<char>,class std::allocator<char> >');

const SKIPS = new Set([2974, 106441]);
// void __cdecl `public: static struct PlatformUtils::PlatformData::get & __ptr64 __cdecl Bedrock::PlatformUtils::PlatformData::get(void)'::`2'::`dynamic atexit destructor for 'sharedInstance''(void)
// void __cdecl `public: static class Threading::CustomTLS::TLSManager::getSharedInstance & __ptr64 __cdecl Bedrock::Threading::CustomTLS::TLSManager::getSharedInstance(void)'::`2'::`dynamic atexit destructor for 'sharedInstance''(void)

parse([10000, 1000000]);
