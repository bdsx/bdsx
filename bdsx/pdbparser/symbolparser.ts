import { pdb } from "../core";
import { templateName } from "../templatename";
import { LanguageParser } from "../textparser";
import { PdbCache } from "./pdbcache";
import ProgressBar = require('progress');

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
export class PdbIdentifier {
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
    public deco = '';
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
    public readonly children = new Map<string, PdbIdentifier>();
    public functionParameters:PdbIdentifier[] = [];
    public templateParameters:PdbIdentifier[] = [];
    public adjustors:PdbIdentifier[] = [];
    public specialized:PdbIdentifier[] = [];
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

    constructor (
        public name:string) {
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

    release():void {
        this.ref--;
        if (this.ref === 0) {
            this.parent!.children.delete(this.name);
        }
    }

    removeConst():PdbIdentifier {
        return this.removeDeco('const');
    }

    removeDeco(deco:string):PdbIdentifier {
        if (this.decoedFrom !== null) {
            if (this.deco === deco) return this.decoedFrom;
            const removed = this.decoedFrom.removeDeco(deco);
            if (removed === this) return this;
            return removed.decorate(this.deco);
        }
        return this;
    }

    containTypes(other:PdbIdentifier):boolean {
        if (this === other) return true;
        if (this === any_t) return true;
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
        return false;
    }

    static makeUnionTypes(types:PdbIdentifier[]):PdbIdentifier {
        if (types.length >= 5) return any_t;

        const set = new Set<PdbIdentifier>();
        for (const t of types) {
            if (t.unionedTypes !== null) {
                for (const item of t.unionedTypes) {
                    set.add(item);
                }
            } else {
                set.add(t);
            }
        }
        if (set.size >= 5) return any_t;

        const names = [...set].map(v=>v.toString());
        names.sort((a,b)=>a.localeCompare(b));
        const union = PdbIdentifier.global.make(`${names.join('|')}`);
        if (union.unionedTypes === null) {
            union.unionedTypes = set;
        }
        return union;
    }

    makeUnionTypes(other:PdbIdentifier):PdbIdentifier {
        return PdbIdentifier.makeUnionTypes([this, other]);
    }

    union(other:PdbIdentifier):PdbIdentifier{
        const a = this.removeConst();
        const b = other.removeConst();
        if (a === b) return a;
        if (a === any_t || b === any_t) return any_t;
        if (a.templateBase !== null) {
            if (a.templateParameters.length === 0) throw Error(`template but no params (${a})`);
            return a.makeUnionTypes(b);
        }
        if (int32Types.has(a) && int32Types.has(b)) {
            return int_t;
        }
        return a.makeUnionTypes(b);
        throw Error(`not implemented (${a}, ${b})`);
    }

    unionParameters(to:PdbIdentifier[]|null):PdbIdentifier[]|null {
        if (to === null) return this.functionParameters.slice();

        const n = Math.max(to.length, this.functionParameters.length);
        for (let i=0;i<n;i++) {
            const a = to[i];
            const b = this.functionParameters[i];
            to[i] = (a && b) ? a.union(b) : (a || b);
        }
        return to;
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
        if (this.deco === '&' || this.deco === '*') return true;
        if (this.decoedFrom !== null) return this.decoedFrom.isPointerLike();
        return false;
    }

    decorate(deco:string, source?:string):PdbIdentifier {
        let name = this.name;
        if (/^\w/.test(deco)) {
            name += ' ';
        }
        name += deco;
        const id = this.parent!.make(name);
        if (id === this) throw Error(`self deco linked (deco:${deco})`);
        if (this.isType) id.setAsType();
        if (this.isValue) id.setAsValue();
        if (this.isBasicType) id.setAsBasicType();
        id.isDecoed = true;
        id.deco = deco;
        id.decoedFrom = this;
        if (source != null) id.source = source;
        return id;
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

    find(name:string):PdbIdentifier {
        const item = this.children.get(name);
        if (item == null) throw Error(`${name} not found in '${this}'`);
        return item;
    }

    make(name:string):PdbIdentifier {
        let id = this.children.get(name);
        if (id != null) return id;
        this.children.set(name, id = new PdbIdentifier(name));
        id.parent = this;
        return id;
    }

    makeSpecialized(args:PdbIdentifier[], source?:string):PdbIdentifier {
        if (this.parent === null) throw Error(`no parent`);
        const name = templateName(this.name, ...args.map(id=>id.toString()));
        let specialized = this.parent.children.get(name);
        if (specialized == null) {
            specialized = this.parent.make(name);
            specialized.templateParameters = args;
            specialized.templateBase = this;
            if (source != null) specialized.source = source;
            this.specialized.push(specialized);
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

    constVal(name:string):PdbIdentifier {
        const id = this.make(name);
        id.isConstant = true;
        id.setAsValue();
        return id;
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
        if (this.isType) throw Error(`type but value (${this})`);
        this.isValue = true;
    }

    setAsType():void {
        if (this.isTemplateFunctionBase) throw Error(`function base but type (${this})`);
        if (this.isFunctionBase) throw Error(`function base but type (${this})`);
        if (this.isFunction) throw Error(`function but type (${this})`);
        if (this.isValue) throw Error(`value but type (${this})`);
        this.isType = true;
    }

    setAsBasicType():void {
        this.setAsType();
        this.isBasicType = true;
    }

    setAsClass():void {
        this.setAsType();
        this.isClassLike = true;
        this.setAsNamespaceLike();

        if (this.templateBase !== null) {
            this.templateBase.setAsClass();
        }

        if (this.parent !== null) {
            this.parent.setAsNamespaceLike();
        }
    }

    setAsClassLike():void {
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
                return int_t;
            } else {
                throw Error(`${this}: unexpected constant`);
            }
        }
        if (this.isClassLike || this.isBasicType) {
            return typename.makeSpecialized([this]);
        }
        if (this.isValue) {
            const item = this.removeDeco('&').removeConst();
            if (item.isFunction) {
                if (item.isMemberPointer) {
                    const base = PdbIdentifier.global.make(`${item.returnType} ${item.memberPointerBase}::*`);
                    return makeFunction(base, item.returnType!, item.functionParameters, true);
                } else {
                    const base = PdbIdentifier.global.make(`${item.returnType}`);
                    return makeFunction(base, item.returnType!, item.functionParameters, true);
                }
            }
            if (item.returnType === null) {
                return item;
            }
            return item.returnType;
        }
        return typename.makeSpecialized([this]);
    }

    unwrapType():PdbIdentifier {
        if (this.templateBase === typename) return this.templateParameters[0];
        if (this.unionedTypes !== null) {
            return PdbIdentifier.makeUnionTypes([...this.unionedTypes].map(u=>u.unwrapType()));
        }
        return this;
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

    public static global = new PdbIdentifier('');
    public static std = PdbIdentifier.global.make('std');
}

PdbIdentifier.global.setAsNamespace();
PdbIdentifier.std.setAsNamespace();
PdbIdentifier.global.make('__int64').setAsBasicType();
PdbIdentifier.global.make('__int64 unsigned').setAsBasicType();
PdbIdentifier.global.make('bool').setAsBasicType();
PdbIdentifier.global.make('void').setAsBasicType();
const uniqueType_t = PdbIdentifier.global.make('UniqueType');
const int_t = PdbIdentifier.global.make('int');
int_t.setAsBasicType();
PdbIdentifier.global.make('int unsigned').setAsBasicType();
PdbIdentifier.global.make('long').setAsBasicType();
PdbIdentifier.global.make('long unsigned').setAsBasicType();
PdbIdentifier.global.make('short').setAsBasicType();
PdbIdentifier.global.make('short unsigned').setAsBasicType();
PdbIdentifier.global.make('char').setAsBasicType();
PdbIdentifier.global.make('char unsigned').setAsBasicType();
PdbIdentifier.global.make('wchar_t').setAsBasicType();
PdbIdentifier.global.make('wchar_t unsigned').setAsBasicType();
PdbIdentifier.global.make('float').setAsBasicType();
PdbIdentifier.global.make('double').setAsBasicType();
const any_t = PdbIdentifier.global.make('any');
any_t.setAsBasicType();

const void_t = PdbIdentifier.global.make('void');
void_t.setAsBasicType();
const typename = PdbIdentifier.global.make('typename');
typename.isType = true;

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
    funcbase.overloads.push(func);

    if (returnType !== null) {
        func.setReturnType(returnType);
    }
    if (isType) {
        func.setAsType();
        func.isFunctionType = true;
    } else {
        func.setAsFunction();
        func.functionBase = funcbase;
        funcbase.isFunctionBase = true;
        const templateBase = funcbase.templateBase;
        if (templateBase !== null)  {
            templateBase.isTemplateFunctionBase = true;
            func.templateBase = templateBase;
        }
    }
}

function makeFunction(funcbase:PdbIdentifier, returnType:PdbIdentifier|null, args:PdbIdentifier[], isType:boolean):PdbIdentifier {
    const id = funcbase.parent!.make(funcbase.name+'('+args.join(',')+')');
    id.isConstructor = funcbase.isConstructor;
    id.isDestructor = funcbase.isDestructor;
    if (id.isConstructor || id.isDestructor) id.parent!.setAsClass();
    setAsFunction(id, funcbase, args, returnType, isType);
    return id;
}

function parseParameters():PdbIdentifier[] {
    const args:PdbIdentifier[] = [];
    for (;;) {
        if (parser.nextIf('...')) {
            parser.readOperator(OPERATORS);
            args.push(PdbIdentifier.global.make('...'));
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
                const decoed = base.decorate(keyword, parser.getFrom(sourceFrom));
                if (base.isFunction) {
                    base.constFunction = decoed;
                    setAsFunction(decoed, base.functionBase!, base.functionParameters.slice(), base.returnType!, base.isType);
                    decoed.isType = false;
                }
                base = decoed;
            } else if (keyword === '__cdecl' || keyword === '__stdcall') {
                info.callingConvension = keyword;
                info.isFunction = true;
            } else if (keyword === '__ptr64') {
                // do nothing
            } else if (keyword === 'unsigned' || keyword === 'signed') {
                if (base === null) throw Error(`null base`);
                base = base.decorate(keyword, parser.getFrom(sourceFrom));
                base.setAsBasicType();
            } else if (keyword === 'noexcept') {
                if (base === null) throw Error(`null base`);
                if (!base.isFunction && !base.isFunctionType) throw Error(`base is not function (${base})`);
                if (base.isType) {
                    base = base.decorate('noexcept', parser.getFrom(sourceFrom));
                }
                base.isNoExcept = true;
            } else {
                if (keyword === null) {
                    parser.skipSpaces();
                    if (parser.nextIf('`')) {
                        const name = parser.readTo("'");
                        if (name === 'RTTI Type Descriptor') {
                            if (base === null) throw Error(`null base`);
                            base = base.make("`RTTI Type Descriptor'");
                            base.source = parser.getFrom(sourceFrom);
                            base.isStatic = true;
                            base.setAsValue();
                            continue;
                        }
                    }
                }
                parser.i = beforeKeyword;
                const fnOrThisType = parseIdentity(info.isParenthesesInside ? ')' : info.isFunction ? '(' : eof, {isTypeInside: true});
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
                    base = PdbIdentifier.global.make(`${returnType} ${fnOrThisType}::*`);
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
            base = base.decorate(oper, parser.getFrom(sourceFrom));
        } else if (oper === '(') {
            if (info.isFunction) {
                if (base === null) throw Error(`null base`);
                const baseType = base.isMemberPointer ? base.memberPointerBase! : base;
                const returnType = base.isMemberPointer ? base.returnType! : base;
                const args = parseParameters();
                base = makeFunction(baseType, returnType, args, true);
                info.isFunction = false;
                if (base.isMemberPointer) {
                    base.setAsType();
                    base.isFunctionType = true;
                }
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
            base = base.decorate(`[${number}]`, parser.getFrom(sourceFrom));
            base.arraySize = +number;
            +number;
        } else {
            parser.i--;
            printParserState(base);
            throw Error(`Unexpected operator ${oper}`);
        }
    }
}

function parseIdentity(eof:string, info:{isTypeInside?:boolean, scope?:PdbIdentifier, isClassLike?:boolean} = {}, scope:PdbIdentifier=PdbIdentifier.global):PdbIdentifier {
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
                    scope.isClassLike = true;
                    scope.setAsType();
                    return scope;
                } else if (oper === '<') {
                    const innerText = parser.readTo('>');
                    const lambdaName = parser.getFrom(from);
                    if (innerText === 'lambda_invoker_cdecl') {
                        id = scope.make(lambdaName);
                        id.setAsFunction();
                        id.source = parser.getFrom(sourceFrom);
                    } else if (/^lambda_[a-z0-9]+$/.test(innerText)) {
                        id = scope.make(lambdaName);
                        id.isLambda = true;
                        id.source = parser.getFrom(sourceFrom);
                        id.setAsClass();
                    } else if (/^unnamed-type-.+$/.test(innerText)) {
                        id = scope.make(lambdaName);
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
                    id = PdbIdentifier.global.constVal('-'+idname);
                } else if (oper === '&') {
                    id = parseSymbol(eof);
                    id.setAsValue();
                    id.source = parser.getFrom(sourceFrom);
                    id = id.decorate(oper, parser.getFrom(from));
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
                                id = scope.make(parser.getFrom(from));
                                id.adjustors = [arg];
                            } else {
                                id = scope.make(parser.getFrom(from));
                            }
                            id.isVFTable = true;
                            id.isStatic = true;
                            id.setAsValue();
                        } else if (parser.nextIf("vcall'")) {
                            const arg = parser.readTo("'");
                            parser.readTo("'");
                            id = scope.make(parser.getFrom(from));
                            id.isPrivate = true;
                            id.adjustors = [PdbIdentifier.global.make(arg)];
                            eof = eof.replace(/\(/, '');
                        } else {
                            for (const [sname, hasParam] of SPECIAL_NAMES) {
                                if (parser.nextIf(sname)) {
                                    if (hasParam) {
                                        const iid = parseIdentity("'", {}, scope);
                                        must("'");
                                        id = scope.make(parser.getFrom(from));
                                        id.adjustors = [iid];
                                    } else {
                                        id = scope.make(parser.getFrom(from));
                                    }
                                    break _idfind;
                                }
                            }
                            const arg = parseSymbol("'");
                            parser.readTo("'");
                            id = scope.make(parser.getFrom(from));
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
                    id = PdbIdentifier.global.constVal(idname);
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
                    id = parseIdentity(eof, {isClassLike: true});
                    return id;
                } else if (idname === 'class') {
                    id = parseIdentity(eof, {isClassLike: true});
                    return id;
                } else if (idname === 'struct') {
                    return parseIdentity(eof, {isClassLike: true});
                } else if (idname === 'union') {
                    return parseIdentity(eof, {isClassLike: true});
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
                id = scope.make(idname);
                if (castTo !== null) {
                    id.returnType = castTo;
                }
                if (isUnsigned !== 0) {
                    id = id.decorate((isUnsigned === 1 ? 'unsigned' : 'signed'), parser.getFrom(sourceFrom));
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
                    id = scope.make(id.name+'`'+adjustor+"'");
                    id.adjustors.push(PdbIdentifier.global.constVal(matched[1]));
                } else if ((matched = adjustor.match(/^vtordisp{([0-9]+),([0-9]+)}$/))) {
                    id = scope.make(id.name+'`'+adjustor+"'");
                    const v1 = PdbIdentifier.global.constVal(matched[1]);
                    const v2 = PdbIdentifier.global.constVal(matched[2]);
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
            if (info.isClassLike) {
                if (id === null) {
                    throw Error('class without name');
                }
                id.setAsClass();
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

function parse(from:number = 0, to?:number):void {

    const cache = new PdbCache;
    if (to == null) to = cache.total;

    const bar = new ProgressBar('loading [:bar] :current/:total', to-from);
    symbolIndex = -1;
    for (const {address, name, flags, tag} of cache) {
        if (++symbolIndex < from) continue;
        if (symbolIndex >= to) break;
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

const int32Types = new Set<PdbIdentifier>([
    PdbIdentifier.global.make('char'),
    PdbIdentifier.global.make('char unsigned'),
    PdbIdentifier.global.make('wchar_t'),
    PdbIdentifier.global.make('wchar_t unsigned'),
    PdbIdentifier.global.make('short'),
    PdbIdentifier.global.make('short unsigned'),
    PdbIdentifier.global.make('int'),
    PdbIdentifier.global.make('long'),
]);

PdbIdentifier.parse('class std::basic_string<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_ostream<char,class std::char_traits<char> >');
PdbIdentifier.parse('class std::basic_istream<char,class std::char_traits<char> >');
PdbIdentifier.parse('class std::basic_iostream<char,class std::char_traits<char> >');
PdbIdentifier.parse('class std::basic_stringbuf<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_istringstream<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_ostringstream<char,class std::char_traits<char>,class std::allocator<char> >');
PdbIdentifier.parse('class std::basic_stringstream<char,class std::char_traits<char>,class std::allocator<char> >');

// 57136, Error: function but type
parse(0, 50000);
