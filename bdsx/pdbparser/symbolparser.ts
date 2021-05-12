import { pdb } from "../core";
import { templateName } from "../templatename";
import { LanguageParser } from "../textparser";
import { PdbCache } from "./pdbcache";
import ProgressBar = require('progress');

const OPERATORS = new Set<string>([
    '::',
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

const SPECIAL_NAMES:[string, boolean][] = [
    ["dynamic initializer for '", true],
    ["dynamic atexit destructor for '", true],
    ["anonymous namespace'", false],
    ["scalar deleting destructor'", false],
    ["eh vector constructor iterator'", false],
    ["eh vector copy constructor iterator'", false],
    ["eh vector destructor iterator'", false],
    ["vector deleting destructor'", false],
    ["RTTI Type Descriptor'", false],
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

export class PdbIdentifier {
    public modifier:string|null = null;
    public isVirtualFunction = false;
    public isNamespaceLike = false;
    public isNamespace = false;
    public isClassLike = false;
    public isFunction = false;
    public isFunctionBase = false;
    public isTemplateFunctionBase = false;
    public isMemberPointer = false;
    public isEnum = false;
    public isTemplate = false;
    public isPrivate = false;
    public isLambda = false;
    public isType = false;
    public arraySize:number|null = null;
    public isFunctionType = false;
    public isDecoedType = false;
    public isBasicType = false;
    public isRedirectType = false;
    public isConstructor = false;
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
    public returnType:PdbIdentifier|null = null;
    public readonly children = new Map<string, PdbIdentifier>();
    public arguments:PdbIdentifier[] = [];
    public specialized:PdbIdentifier[] = [];
    public overloads:PdbIdentifier[] = [];
    public address = 0;
    public redirectTo:PdbIdentifier|null = null;
    public redirectedFrom:PdbIdentifier|null = null;
    public source = '';
    public constFunction:PdbIdentifier|null = null;
    public ref = 0;

    private argumentsSet = false;

    constructor (
        public name:string) {
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

    getTemplateTypes():PdbIdentifier[] {
        if (this.specialized.length === 0) throw Error('No template');
        const specialized = this.specialized[0];
        return specialized.arguments.map(item=>{
            if (item.isClassLike) return typename;
            if (item.isBasicType) return typename;
            if (item.isConstant) {
                debugger;
                return typename;
            }
            if (item.isValue) {
                debugger;
                return typename;
            }
            return typename;
        });
    }

    union(other:PdbIdentifier):PdbIdentifier{
        if (this === other) return this;
        debugger;
        return this;
    }

    unionParameters(to:PdbIdentifier[]|null):PdbIdentifier[]|null {
        if (to === null) return this.arguments.slice();

        const n = Math.max(to.length, this.arguments.length);
        for (let i=0;i<n;i++) {
            const a = to[i];
            const b = this.arguments[i];
            to[i] = (a && b) ? a.union(b) : (a || b);
        }
        return to;
    }

    hasArrayParam():boolean {
        for (const param of this.arguments) {
            if (param.getArraySize() !== null) return true;
        }
        return false;
    }

    *allOverloads():IterableIterator<PdbIdentifier> {
        if (this.isTemplate) {
            for (const s of this.specialized) {
                for (const o of s.overloads) {
                    if (o.hasArrayParam()) continue;
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

    decorate(deco:string, from:number):PdbIdentifier {
        let name = this.name;
        if (/^[a-zA-z]/.test(deco)) {
            name += ' ';
        }
        name += deco;
        const id = this.parent!.get(name);
        if (id === this) throw Error(`self deco linked (deco:${deco})`);
        id.isType = true;
        id.isDecoedType = true;
        id.deco = deco;
        id.decoedFrom = this;
        id.source = parser.getFrom(from);
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

    get(name:string):PdbIdentifier {
        let id = this.children.get(name);
        if (id !== undefined) return id;
        this.children.set(name, id = new PdbIdentifier(name));
        id.parent = this;
        return id;
    }

    constVal(name:string):PdbIdentifier {
        const id = this.get(name);
        id.isConstant = true;
        id.isValue = true;
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

    setArguments(args:PdbIdentifier[]):void {
        if (this.argumentsSet) {
            return;
        }
        this.argumentsSet = true;
        this.arguments = args;
    }

    setAsNamespace():void {
        this.isNamespaceLike = true;
        this.isNamespace = true;
    }

    setAsBasicType():void {
        this.isType = true;
        this.isBasicType = true;
    }

    setAsClass():void {
        this.isClassLike = true;
        this.isType = true;
        this.isNamespaceLike = true;

        if (this.templateBase !== null) {
            this.templateBase.setAsClass();
        }
    }

    setAsEnum():void {
        this.isEnum = true;
        this.isClassLike = true;
        this.isType = true;
        this.isNamespaceLike = true;
    }

    setAsFunction():void {
        this.isFunction = true;
    }

    getTypeOfIt():PdbIdentifier {
        if (this.isValue) {
            if (this.parent === PdbIdentifier.global) {
                if (this.isConstant && /^[0-9]+$/.test(this.name)) {
                    return PdbIdentifier.global.get('int');
                }
            }
        }
        return PdbIdentifier.global.get('typename');
    }

    redirect(target:PdbIdentifier):void {
        this.redirectTo = target;
        target.redirectedFrom = this;
        this.isRedirectType = true;
    }

    public static global = new PdbIdentifier('');
    public static std = PdbIdentifier.global.get('std');
}

PdbIdentifier.global.setAsNamespace();
PdbIdentifier.std.setAsNamespace();
PdbIdentifier.global.get('__int64').setAsBasicType();
PdbIdentifier.global.get('__int64 unsigned').setAsBasicType();
PdbIdentifier.global.get('int').setAsBasicType();
PdbIdentifier.global.get('int unsigned').setAsBasicType();
PdbIdentifier.global.get('long').setAsBasicType();
PdbIdentifier.global.get('long unsigned').setAsBasicType();
PdbIdentifier.global.get('short').setAsBasicType();
PdbIdentifier.global.get('short unsigned').setAsBasicType();
PdbIdentifier.global.get('char').setAsBasicType();
PdbIdentifier.global.get('char unsigned').setAsBasicType();
PdbIdentifier.global.get('float').setAsBasicType();
PdbIdentifier.global.get('double').setAsBasicType();
const void_t = PdbIdentifier.global.get('void');
void_t.setAsBasicType();
const typename = PdbIdentifier.global.get('typename');
typename.isType = true;

const parser = new LanguageParser('');

interface ParsingInfo {
    isFunction:boolean;
    callingConvension:string|null;
}

function printParserState(id?:PdbIdentifier):void {
    if (id) console.log(id+'');
    console.log(parser.context);
    console.log(' '.repeat(parser.i)+'^');
}

function must(next:string, id?:PdbIdentifier):void {
    if (parser.nextIf(next)) return;
    printParserState(id);
    throw Error(`unexpected character(Expected=${next}, Actual=${parser.peek()})`);
}

function setAsFunction(func:PdbIdentifier, funcbase:PdbIdentifier, args:PdbIdentifier[], returnType:PdbIdentifier, isType:boolean):void {
    if (args.length === 1 && args[0] === void_t) {
        args.length = 0;
    }
    func.setArguments(args);
    funcbase.overloads.push(func);

    func.returnType = returnType;
    if (isType) {
        func.isType = true;
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

function parseParameters(funcbase:PdbIdentifier, returnType:PdbIdentifier, isType:boolean):PdbIdentifier {
    const prev = parser.i-1;
    const args:PdbIdentifier[] = [];
    for (;;) {
        if (parser.nextIf('...')) {
            parser.readOperator(OPERATORS);
            args.push(PdbIdentifier.global.get('...'));
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
    const id = funcbase.parent!.get(funcbase.name + parser.getFrom(prev));
    setAsFunction(id, funcbase, args, returnType, isType);
    return id;
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
    base:PdbIdentifier,
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
                printParserState();
                throw Error(`Unexpected end`);
            }
            return deco.apply(base);
        } else if (oper === '' || oper === '`' || oper === '<') {
            if (oper !== '') {
                parser.i = prev;
            }
            const beforeKeyword = parser.i;
            const keyword = parser.readIdentifier();
            if (keyword === 'const') {
                const decoed = base.decorate(keyword, sourceFrom);
                if (base.isFunction) {
                    base.constFunction = decoed;
                    setAsFunction(decoed, base.functionBase!, base.arguments.slice(), base.returnType!, base.isType);
                    decoed.isType = false;
                }
                base = decoed;
            } else if (keyword === '__cdecl' || keyword === '__stdcall') {
                info.callingConvension = keyword;
                info.isFunction = true;
            } else if (keyword === '__ptr64') {
                // do nothing
            } else {
                parser.i = beforeKeyword;
                const fnOrThisType = parseIdentity(info.isFunction ? '(' : eof, {isTypeInside: true});
                const returnType = deco.apply(base);
                deco.clear();

                if (parser.endsWith('(')) {
                    base = parseParameters(fnOrThisType, returnType, false);
                    base.source = parser.getFrom(sourceFrom);
                    info.isFunction = false;
                } else if (parser.endsWith('*')) {
                    base = PdbIdentifier.global.get(returnType+' '+fnOrThisType+'::*');
                    base.isMemberPointer = true;
                    base.memberPointerBase = fnOrThisType;
                    base.returnType = returnType;
                    base.isType = true;
                    base.source = parser.getFrom(sourceFrom);
                } else {
                    if (info.isFunction) {
                        // vcall, code chunk?
                    }
                    base = fnOrThisType;
                    base.returnType = returnType;
                    base.source = parser.getFrom(sourceFrom);
                    return base;
                }
            }
        } else if (eof.indexOf(oper) !== -1) {
            return base;
        } else if (oper === '&' || oper === '*') {
            base = base.decorate(oper, sourceFrom);
        } else if (oper === '(') {
            if (info.isFunction) {
                const baseType = base.isMemberPointer ? base.memberPointerBase! : base;
                const returnType = base.isMemberPointer ? base.returnType! : base;
                base = parseParameters(baseType, returnType, true);
                info.isFunction = false;
                if (base.isMemberPointer) {
                    base.isType = true;
                    base.isFunctionType = true;
                }
            } else {
                base = parseDeco(base, info, from, sourceFrom, ')');
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

            base = base.decorate(`[${number}]`, sourceFrom);
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
    if (info.isTypeInside === undefined) info.isTypeInside = false;
    parser.skipSpaces();
    const sourceFrom = parser.i;

    for (;;) {
        parser.skipSpaces();
        const from = parser.i;

        let id:PdbIdentifier;

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
                    scope.isType = true;
                    return scope;
                } else if (oper === '<') {
                    const innerText = parser.readTo('>');
                    const lambdaName = parser.getFrom(from);
                    if (innerText === 'lambda_invoker_cdecl') {
                        id = scope.get(lambdaName);
                        id.setAsFunction();
                        id.source = parser.getFrom(sourceFrom);
                    } else if (/^lambda_[a-z0-9]+$/.test(innerText)) {
                        id = scope.get(lambdaName);
                        id.isLambda = true;
                        id.source = parser.getFrom(sourceFrom);
                        id.setAsClass();
                    } else if (/^unnamed-type-.+$/.test(innerText)) {
                        id = scope.get(lambdaName);
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
                    id = PdbIdentifier.global.constVal(idname);
                } else if (oper === '&') {
                    id = parseSymbol(eof);
                    id.isValue = true;
                    id.source = parser.getFrom(sourceFrom);
                    id = id.decorate('&', from);
                    id.isValue = true;
                    id.source = parser.getFrom(sourceFrom);
                    return id;
                } else if (oper === '`') {
                    _idfind:{
                        if (parser.nextIf("vftable'") || parser.nextIf("vbtable'")) {
                            scope.setAsClass();
                            if (parser.nextIf('{for `')) {
                                const arg = parseSymbol("'");
                                must('}');
                                id = scope.get(parser.getFrom(from));
                                id.setArguments([arg]);
                            } else {
                                id = scope.get(parser.getFrom(from));
                            }
                            id.isVFTable = true;
                        } else if (parser.nextIf("vcall'")) {
                            const arg = parser.readTo("'");
                            parser.readTo("'");
                            id = scope.get(parser.getFrom(from));
                            id.isPrivate = true;
                            id.setArguments([PdbIdentifier.global.get(arg)]);
                            eof = eof.replace(/\(/, '');
                        } else {
                            for (const [sname, hasParam] of SPECIAL_NAMES) {
                                if (parser.nextIf(sname)) {
                                    if (hasParam) {
                                        const iid = parseIdentity("'", {}, scope);
                                        must("'");
                                        id = scope.get(parser.getFrom(from));
                                        id.setArguments([iid]);
                                    } else {
                                        id = scope.get(parser.getFrom(from));
                                    }
                                    break _idfind;
                                }
                            }
                            const arg = parseSymbol("'");
                            parser.readTo("'");
                            id = scope.get(parser.getFrom(from));
                            id.isPrivate = true;
                            id.setArguments([arg]);
                            id.source = parser.getFrom(sourceFrom);
                        }
                    }
                }  else {
                    parser.i--;
                    printParserState();
                    throw Error(`Unexpected operator ${oper}`);
                }
            } else {
                let isUnsigned = 0;

                if (scope === PdbIdentifier.global && /^[0-9]+$/.test(idname)) {
                    id = PdbIdentifier.global.constVal(idname);
                } else if (idname === '__cdecl' || idname === '__stdcall') {
                    if (scope === PdbIdentifier.global) {
                        id = void_t;
                    } else {
                        throw Error(`Invalid scope(${scope}) for ${idname}`);
                    }
                    parser.i = from;
                    break;
                } else if (idname === 'const') {
                    id = parseIdentity(eof);
                    id.isValue = true;
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
                } else if(idname === 'operator') {
                    const oi = parser.i;
                    const oper = parser.readOperator(OPERATORS_FOR_OPERATOR);
                    const oi2 = parser.i;
                    const oper2 = parser.readOperator(OPERATORS);
                    if (oper === '<<' && oper2 === '') {
                        parser.i = oi;
                        idname += parser.readOperator(OPERATORS);
                    } else {
                        parser.i = oi2;
                        idname += oper;
                    }
                } else if(idname === 'unsigned') {
                    isUnsigned = 1;
                    idname = parser.readIdentifier();
                    if (idname === null) {
                        idname = 'int';
                    }
                } else if(idname === 'signed') {
                    isUnsigned = 2;
                    idname = parser.readIdentifier();
                    if (idname === null) {
                        idname = 'int';
                    }
                } else if (idname === 'delete') {
                    if (parser.nextIf('[]')) {
                        idname += '[]';
                    }
                } else if (idname === 'new') {
                    if (parser.nextIf('[]')) {
                        idname += '[]';
                    }
                }
                id = scope.get(idname);
                if (isUnsigned !== 0) {
                    id = id.decorate((isUnsigned === 1 ? 'unsigned' : 'signed'), sourceFrom);
                    id.setAsBasicType();
                }
                if (idname.startsWith('~')) {
                    id.parent!.setAsClass();
                }
                id.source = parser.getFrom(sourceFrom);
            }
            break;
        }

        if(FIELD_FOR_CLASS.has(idname)) {
            if (id.parent === PdbIdentifier.std) debugger;
            id.parent!.setAsClass();
        }

        id.addRef();
        if (parser.nextIf('`')) {
            id.release();
            const adjustor = parser.readTo("'");
            let matched:RegExpMatchArray|null;
            if ((matched = adjustor.match(/^adjustor{([0-9]+)}$/))) {
                id = scope.get(id.name+adjustor);
                id.arguments.push(PdbIdentifier.global.constVal(matched[1]));
            } else if ((matched = adjustor.match(/^vtordisp{([0-9]+),([0-9]+)}$/))) {
                id = scope.get(id.name+adjustor);
                const v1 = PdbIdentifier.global.constVal(matched[1]);
                const v2 = PdbIdentifier.global.constVal(matched[2]);
                id.arguments.push(v1, v2);
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
                // template constructor base
                id.parent!.children.delete(id.name);
            }
            const template = id;
            id = id.parent!.get(templateName(template.name, ...args.map(id=>id.toString())));
            id.setArguments(args);
            id.templateBase = template;
            id.source = parser.getFrom(sourceFrom);
            template.specialized.push(id);
        }

        parser.skipSpaces();
        if (parser.nextIf('::')) {
            id.isNamespaceLike = true;
            scope = id;
        } else {
            if (info.isClassLike) {
                id.setAsClass();
            }
            id.source = parser.getFrom(sourceFrom);
            return parseDeco(id, {callingConvension: null, isFunction: false}, from, sourceFrom, eof);
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

    let index = 0;
    const cache = new PdbCache;
    if (to === undefined) to = cache.total;

    const bar = new ProgressBar('loading [:bar] :current/:total', to-from);
    for (const {address, name, flags, tag} of cache) {
        if (index++ < from) continue;
        bar.tick();
        parser.context = pdb.undecorate(name, 0);
        parser.i = 0;
        const id = parseSymbol('');
        id.address = address;
        id.source = parser.context;
        if (index >= to) break;
    }
    bar.terminate();
    cache.close();
}

PdbIdentifier.global.get('bool').isBasicType = true;
PdbIdentifier.global.get('void').isBasicType = true;
PdbIdentifier.global.get('float').isBasicType = true;
PdbIdentifier.global.get('double').isBasicType = true;
PdbIdentifier.global.get('char').isBasicType = true;
PdbIdentifier.global.get('char unsigned').isBasicType = true;
PdbIdentifier.global.get('short').isBasicType = true;
PdbIdentifier.global.get('short unsigned').isBasicType = true;
PdbIdentifier.global.get('int').isBasicType = true;
PdbIdentifier.global.get('int unsigned').isBasicType = true;
PdbIdentifier.global.get('__int64').isBasicType = true;
PdbIdentifier.global.get('__int64 unsigned').isBasicType = true;
PdbIdentifier.global.get('typename').isBasicType = true;
PdbIdentifier.global.get('void*').isBasicType = true;

// parser.context = "class Block const * __ptr64 const __ptr64 VanillaBlocks::mElement104";
// parseSymbol('');

parse(0, 10000);
