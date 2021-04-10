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

export class PdbIdentifier {
    public modifier:string|null = null;
    public isVirtualFunction = false;
    public isNamespaceLike = false;
    public isClassLike = false;
    public isTemplate = false;
    public isPrivate = false;
    public isLambda = false;
    public isType = false;
    public isDecoedType = false;
    public isMemberPointer = false;
    public isValue = false;
    public isConstant = false;
    public callingConvension:string|null = null;
    public isDestructor = false;
    public isStatic = false;
    public isThunk = false;
    public parent:PdbIdentifier|null = null;
    public templateBase:PdbIdentifier|null = null;
    public functionBase:PdbIdentifier|null = null;
    public returnType:PdbIdentifier|null = null;
    public readonly children = new Map<string, PdbIdentifier>();
    public type:PdbIdentifier.Type = 0;
    public arguments:PdbIdentifier[] = [];
    public specialized:PdbIdentifier[] = [];
    public address = 0;

    private argumentsSet = false;

    constructor (
        public name:string) {
    }

    decay():PdbIdentifier {
        let id:PdbIdentifier = this;
        for (;;) {
            if (!id.isDecoedType) return id;
            id = id.parent!;
        }
    }

    removeParameters():PdbIdentifier {
        return this.functionBase || this;
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
                return this.returnType.toString() + '  '+ name;
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
        this.type = PdbIdentifier.Type.Namespace;
        this.isNamespaceLike = true;
    }

    setAsClass():void {
        this.type = PdbIdentifier.Type.Class;
        this.isClassLike = true;
        this.isType = true;
        this.isNamespaceLike = true;

        if (this.templateBase !== null) {
            this.templateBase.setAsClass();
        }
    }

    setAsStruct():void {
        this.type = PdbIdentifier.Type.Struct;
        this.isClassLike = true;
        this.isType = true;
        this.isNamespaceLike = true;
    }

    setAsEnum():void {
        this.type = PdbIdentifier.Type.Enum;
        this.isClassLike = true;
        this.isType = true;
        this.isNamespaceLike = true;
    }

    setAsFunction():void {
        this.type = PdbIdentifier.Type.Function;
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

    public static global = new PdbIdentifier('');
    public static std = PdbIdentifier.global.get('std');
}

export namespace PdbIdentifier {
    export enum Type {
        Unknown,
        Namespace,
        Function,
        FunctionBase,
        Type,
        Enum,
        Class,
        Struct,
    }
}
PdbIdentifier.global.setAsNamespace();
PdbIdentifier.std.setAsNamespace();
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

function parseParameters(id:PdbIdentifier, returnType:PdbIdentifier):PdbIdentifier {
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
    const funcTempl = id;
    id = id.parent!.get(funcTempl.name + parser.getFrom(prev));
    funcTempl.type = PdbIdentifier.Type.FunctionBase;
    id.functionBase = funcTempl;
    id.type = PdbIdentifier.Type.Function;
    id.returnType = returnType;
    return id;
}

function parseDeco(
    info:ParsingInfo,
    id:PdbIdentifier,
    from:number,
    eof:string):PdbIdentifier {

    for (;;) {
        const prev = parser.i;
        const oper = parser.readOperator(OPERATORS);
        if (oper === null) {
            if (eof !== '') {
                printParserState();
                throw Error(`Unexpected end`);
            }
            return id;
        } else if (oper === '' || oper === '`' || oper === '<') {
            if (oper !== '') {
                parser.i = prev;
            }
            const beforeKeyword = parser.i;
            const keyword = parser.readIdentifier();
            if (keyword === 'const') {
                id = id.get(keyword);
                id.type = PdbIdentifier.Type.Type;
            } else if (keyword === '__cdecl' || keyword === '__stdcall') {
                info.callingConvension = keyword;
                info.isFunction = true;
            } else if (keyword === '__ptr64') {
                // do nothing
            } else {
                parser.i = beforeKeyword;
                const fn = parseIdentity(info.isFunction ? '(' : eof, {isTypeInside: true});
                const returnType = id;

                if (parser.endsWith('(')) {
                    id = parseParameters(fn, returnType);
                    info.isFunction = false;
                } else if (parser.endsWith('*')) {
                    id = fn.get('*').get(returnType.toString());
                    id.isDecoedType = true;
                    id.isMemberPointer = true;
                    id.isType = true;
                } else {
                    if (info.isFunction) {
                        // vcall, code chunk?
                    }
                    id = fn;
                    id.returnType = returnType;
                    return id;
                }
            }
        } else if (eof.indexOf(oper) !== -1) {
            return id;
        } else if (oper === '&' || oper === '*') {
            id = id.get(oper);
            id.type = PdbIdentifier.Type.Type;
            id.isDecoedType = true;
        } else if (oper === '(') {
            if (info.isFunction) {
                id = parseParameters(id, id);
                id.isType = true;
                info.isFunction = false;
            } else {
                id = parseDeco(info, id, from, ')');
            }
        } else if (oper === '[') {
            const number = parser.readIdentifier();
            if (number === null) {
                printParserState(id);
                throw Error(`Invalid number ${number}`);
            }
            if (!/^[0-9]+$/.test(number)) {
                printParserState(id);
                throw Error(`Unexpected index ${number}`);
            }
            must(']');
            id = id.get(`[${number}]`);
            id.type = PdbIdentifier.Type.Type;
        } else {
            parser.i--;
            printParserState(id);
            throw Error(`Unexpected operator ${oper}`);
        }
    }
}

function parseIdentity(eof:string, info:{isTypeInside?:boolean, scope?:PdbIdentifier, type?:PdbIdentifier.Type} = {}, scope:PdbIdentifier=PdbIdentifier.global):PdbIdentifier {
    if (info.isTypeInside === undefined) info.isTypeInside = false;
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
                        id.type = PdbIdentifier.Type.Function;
                    } else if (/^lambda_[a-z0-9]+$/.test(innerText)) {
                        id = scope.get(lambdaName);
                        id.isLambda = true;
                        id.setAsClass();
                    } else if (/^unnamed-type-.+$/.test(innerText)) {
                        id = scope.get(lambdaName);
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
                    id = id.get('&');
                    id.isValue = true;
                    return id;
                } else if (oper === '`') {
                    _idfind:{
                        if (parser.nextIf("vftable'") || parser.nextIf("vbtable'")) {
                            if (parser.nextIf('{for `')) {
                                const arg = parseSymbol("'");
                                must('}');
                                id = scope.get(parser.getFrom(from));
                                id.setArguments([arg]);
                            } else {
                                id = scope.get(parser.getFrom(from));
                            }
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
                        }
                    }
                }  else {
                    parser.i--;
                    printParserState();
                    throw Error(`Unexpected operator ${oper}`);
                }
            } else {
                let isUnsigned = false;

                if (scope === PdbIdentifier.global && /^[0-9]+$/.test(idname)) {
                    id = PdbIdentifier.global.constVal(idname);
                } else if (idname === '__cdecl' || idname === '__stdcall') {
                    id = scope.get('[type]');
                    parser.i = from;
                    break;
                } else if (idname === 'const') {
                    id = parseIdentity(eof);
                    id.isValue = true;
                    id.isConstant = true;
                    return id;
                } else if (idname === 'enum') {
                    id = parseIdentity(eof, {type: PdbIdentifier.Type.Enum});
                    return id;
                } else if (idname === 'class') {
                    id = parseIdentity(eof, {type: PdbIdentifier.Type.Class});
                    return id;
                } else if (idname === 'struct') {
                    return parseIdentity(eof, {type: PdbIdentifier.Type.Struct});
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
                    isUnsigned = true;
                    idname = parser.readIdentifier();
                    if (idname === null) {
                        idname = 'int';
                    }
                } else if(idname === 'signed') {
                    isUnsigned = true;
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
                if (isUnsigned) id = id.get('unsigned');
            }
            break;
        }

        if (parser.nextIf('`')) {
            const adjustor = parser.readTo("'");
            let matched:RegExpMatchArray|null;
            if ((matched = adjustor.match(/^adjustor{([0-9]+)}$/))) {
                id = id.get(adjustor);
                id.arguments.push(PdbIdentifier.global.constVal(matched[1]));
            } else if ((matched = adjustor.match(/^vtordisp{([0-9]+),([0-9]+)}$/))) {
                id = id.get(adjustor);
                const v1 = PdbIdentifier.global.constVal(matched[1]);
                const v2 = PdbIdentifier.global.constVal(matched[2]);
                id.arguments.push(v1, v2);
            } else {
                printParserState();
                throw Error(`Invalid adjustor ${adjustor}`);
            }
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
            const template = id;
            id = id.parent!.get(templateName(template.name, ...args.map(id=>id.toString())));
            id.setArguments(args);
            id.templateBase = template;
            template.specialized.push(id);
        }

        parser.skipSpaces();
        if (parser.nextIf('::')) {
            id.isNamespaceLike = true;
            scope = id;
        } else {
            switch (info.type) {
            case PdbIdentifier.Type.Class: id.setAsClass(); break;
            case PdbIdentifier.Type.Struct: id.setAsClass(); break;
            case PdbIdentifier.Type.Enum: id.setAsClass(); break;
            }
            return parseDeco({callingConvension: null, isFunction: false},id, from, eof);
        }
    }

}

function parseSymbol(eof:string, isFunction:boolean = false):PdbIdentifier {
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
        id.decay().parent!.isClassLike = true;
    }
    if (virtualFunction) {
        id.type = PdbIdentifier.Type.Function;
        id.isVirtualFunction = true;
        id.decay().parent!.isClassLike = true;
    }
    if (isStatic) {
        id.isStatic = true;
        id.decay().parent!.isClassLike = true;
    }
    id.isThunk = isThunk;
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
        if (index >= to) break;
    }
    bar.terminate();
    cache.close();
}

// parser.context = "class Block const * __ptr64 const __ptr64 VanillaBlocks::mElement104";
// parseSymbol('');

// if (Math.random() < 2) process.exit(0);
parse(0, 10000);
