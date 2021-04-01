import { pdb } from "../core";
import { LanguageParser } from "../textparser";
import fs = require('fs');
import path = require('path');
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

enum IdType {
    Unknown,
    Namespace,
    Function,
    Type,
    Enum,
    Class,
    Struct,
}

class Identifier {
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
    public isFunctionTemplate = false;
    public isDestructor = false;
    public isStatic = false;
    public isThunk = false;
    public parent:Identifier|null = null;
    public template:Identifier|null = null;
    public returnType:Identifier|null = null;
    public readonly children = new Map<string, Identifier>();
    public type:IdType = IdType.Unknown;
    public arguments:Identifier[] = [];
    public specialized:Identifier[] = [];
    public address = 0;

    private argumentsSet = false;

    constructor (
        public readonly name:string) {
    }

    removeParameters():Identifier {
        if (this.type !== IdType.Function) return this;
        if (this.template === null) return this;
        return this.template;
    }

    get(name:string):Identifier {
        let id = this.children.get(name);
        if (id !== undefined) return id;
        this.children.set(name, id = new Identifier(name));
        id.parent = this;
        return id;
    }

    constVal(name:string):Identifier {
        const id = this.get(name);
        id.isConstant = true;
        id.isValue = true;
        return id;
    }

    toString():string {
        if (this.parent === null) return this.name.toString();
        return this.parent.toString() + '::' + this.name.toString();
    }

    setArguments(args:Identifier[]):void {
        if (this.argumentsSet) {
            return;
        }
        this.argumentsSet = true;
        this.arguments = args;
    }

    setAsNamespace():void {
        this.type = IdType.Namespace;
        this.isNamespaceLike = true;
    }
}

const global = new Identifier('');
global.setAsNamespace();
const std = new Identifier('std');
std.setAsNamespace();

const parser = new LanguageParser('');

function printParserState(id?:Identifier):void {
    if (id) console.log(id+'');
    console.log(parser.context);
    console.log(' '.repeat(parser.i)+'^');
}

function must(next:string, id?:Identifier):void {
    if (parser.nextIf(next)) return;
    printParserState(id);
    throw Error(`unexpected character(Expected=${next}, Actual=${parser.peek()})`);
}

function parseDeco(id:Identifier, from:number, eof:string, isFunction:boolean):{id:Identifier, oper:string|null} {
    for (;;) {
        const prev = parser.i;
        const oper = parser.readOperator(OPERATORS);
        if (oper === null) {
            if (eof !== '') {
                printParserState();
                throw Error(`Unexpected end`);
            }
            return {id, oper};
        } else if (oper === '' || oper === '`' || oper === '<') {
            if (oper !== '') {
                parser.i = prev;
            }
            const beforeKeyword = parser.i;
            const keyword = parser.readIdentifier();
            if (keyword === 'const') {
                const isFunctionTemplate = id.isFunctionTemplate;
                id = id.get(keyword);
                if (isFunctionTemplate) id.isFunctionTemplate = isFunctionTemplate;
                id.type = IdType.Type;
            } else if (keyword === '__cdecl' || keyword === '__stdcall') {
                id = id.get(keyword);
                id.isFunctionTemplate = true;
                isFunction = true;
            } else if (keyword === '__ptr64') {
                // do nothing
            } else {
                parser.i = beforeKeyword;
                const scope = parseIdentity(eof, true);
                const fn = scope.get(id.toString());
                fn.isFunctionTemplate = id.isFunctionTemplate;
                fn.returnType = id;

                if (parser.endsWith('*')) {
                    id = fn.get('*');
                    id.isFunctionTemplate = fn.isFunctionTemplate;
                    id.isDecoedType = true;
                    id.isMemberPointer = true;
                } else {
                    return {
                        id,
                        oper: null
                    };
                }
            }
        } else if (eof.indexOf(oper) !== -1) {
            return {id, oper: null};
        } else if (oper === '::') {
            id.isNamespaceLike = true;
            return {id, oper};
        } else if (oper === '&' || oper === '*') {
            const isFunctionTemplate = id.isFunctionTemplate;
            id = id.get(oper);
            if (isFunctionTemplate) id.isFunctionTemplate = isFunctionTemplate;
            id.type = IdType.Type;
            id.isDecoedType = true;
        } else if (oper === '(') {
            if (isFunction) {
                const args:Identifier[] = [];
                for (;;) {
                    if (parser.nextIf('...')) {
                        parser.readOperator(OPERATORS);
                        args.push(global.get('...'));
                    } else {
                        const arg = parseIdentity(",)");
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
                id = id.parent!.get(parser.getFrom(from));
                id.template = funcTempl;
                id.type = IdType.Function;
            } else {
                const res = parseDeco(id, from, ')', false);
                id = res.id;
                if (id.isFunctionTemplate) {
                    isFunction = true;
                }
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
            id.type = IdType.Type;
        } else {
            parser.i--;
            printParserState(id);
            throw Error(`Unexpected operator ${oper}`);
        }
    }
}

function parseIdentity(eof:string, isFunction:boolean = false):Identifier {
    let scope = global;
    for (;;) {
        parser.skipSpaces();
        const from = parser.i;

        let id:Identifier;

        let idname:string|null;
        for (;;) {
            const idnameNormal = parser.readIdentifier();
            idname = parser.getFrom(from);
            if (idnameNormal === null) {
                const oper = parser.readOperator(OPERATORS);
                if (oper === '~') {
                    continue;
                } else if (oper !== null && isFunction && oper === '*') {
                    scope.isClassLike = true;
                    scope.isType = true;
                    return scope;
                } else if (oper === '<') {
                    const innerText = parser.readTo('>');
                    const lambdaName = parser.getFrom(from);
                    if (innerText === 'lambda_invoker_cdecl') {
                        id = scope.get(lambdaName);
                        id.type = IdType.Function;
                    } else if (/^lambda_[a-z0-9]+$/.test(innerText)) {
                        id = scope.get(lambdaName);
                        id.isLambda = true;
                        id.type = IdType.Class;
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
                    id = global.constVal(idname);
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
                            id.setArguments([global.get(arg)]);
                        } else {
                            for (const [sname, hasParam] of SPECIAL_NAMES) {
                                if (parser.nextIf(sname)) {
                                    if (hasParam) {
                                        const iid = parseIdentity("'");
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

                if (scope === global && /^[0-9]+$/.test(idname)) {
                    id = global.constVal(idname);
                } else if (idname === 'const') {
                    id = parseIdentity(eof);
                    id.isValue = true;
                    id.isConstant = true;
                    return id;
                } else if (idname === 'enum') {
                    id = parseIdentity(eof);
                    id.type = IdType.Enum;
                    return id;
                } else if (idname === 'class') {
                    id = parseIdentity(eof);
                    id.type = IdType.Class;
                    return id;
                } else if (idname === 'struct') {
                    id = parseIdentity(eof);
                    id.type = IdType.Struct;
                    return id;
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
                id.arguments.push(global.constVal(matched[1]));
            } else if ((matched = adjustor.match(/^vtordisp{([0-9]+),([0-9]+)}$/))) {
                id = id.get(adjustor);
                const v1 = global.constVal(matched[1]);
                const v2 = global.constVal(matched[2]);
                id.arguments.push(v1, v2);
            } else {
                printParserState();
                throw Error(`Invalid adjustor ${adjustor}`);
            }
        }

        while (parser.nextIf('<')) {
            id.isTemplate = true;

            const args:Identifier[] = [];
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
            id = id.parent!.get(parser.getFrom(from));
            id.setArguments(args);
            id.isFunctionTemplate = template.isFunctionTemplate;
            id.template = template;
            template.specialized.push(id);
        }

        const res = parseDeco(id, from, eof, isFunction);
        if (res.oper === null) return res.id;
        if (res.oper === '::') {
            scope = res.id;
        }
    }

}

function parseSymbol(eof:string, isFunction:boolean = false):Identifier {
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

    const id = parseIdentity(eof, isFunction);
    id.modifier = modifier;
    if (virtualFunction) {
        id.type = IdType.Function;
        id.isVirtualFunction = true;
    }
    id.isStatic = isStatic;
    id.isThunk = isThunk;
    return id;
}

function parse(from:number = 0, to?:number):void {
    let index = 0;
    const cache = new PdbCache;
    if (to === undefined) to = cache.total;

    const bar = new ProgressBar('loading [:bar] :current/:total', to-from);
    for (const [addr, name] of cache) {
        if (index++ < from) continue;
        bar.tick();
        parser.context = pdb.undecorate(name, 0);
        parser.i = 0;
        const id = parseSymbol('');
        id.address = addr;
        if (index >= to) break;
    }
    cache.close();
}

parse(0, 10000);

// remove useless identities
for (const [key, value] of global.children) {
    if (key.startsWith('`')) { // remove private symbols
        global.children.delete(key);
    } else if (key.startsWith('<lambda_')) { // remove lambdas
        global.children.delete(key);
    } else if (/^[0-9]+$/.test(key)) { // remove numbers
        global.children.delete(key);
    } else if (!value.isTemplate && value.arguments.length === 0 && value.children.size === 0) { // imports
        global.children.delete(key);
    }
}

global.children.delete('void');
global.children.delete('bool');
global.children.delete('char');
global.children.delete('short');
global.children.delete('long');
global.children.delete('int');
global.children.delete('__int64');
global.children.delete('float');
global.children.delete('double');

// write
const ids = [...global.children.values()];

function getFiltered(filter:(id:Identifier)=>boolean):Identifier[] {
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

const globalDir = path.join(__dirname, 'globals');
if (!fs.existsSync(globalDir)) {
    fs.mkdirSync(globalDir);
}

function writeAs(name:string, filter:(id:Identifier)=>boolean):void {
    const filted = getFiltered(filter);
    filted.sort();
    fs.writeFileSync(path.join(globalDir, name), filted.join('\n'));
}

const defInstance = global.get('DefinitionInstance');
const actorFromClass = global.get('_actorFromClass');

const actors = new WeakSet<Identifier>();
for (const id of actorFromClass.specialized) {
    actors.add(id.arguments[0]);
}

writeAs('commands.txt', id=>id.name.endsWith('Command'));
writeAs('packets.txt', id=>id.name.endsWith('Packet'));
writeAs('components.txt', id=>id.name.endsWith('Component'));
writeAs('definations.txt', id=>id.name.endsWith('Definition'));
writeAs('receips.txt', id=>id.name.endsWith('Recipe'));
writeAs('listeners.txt', id=>id.name.endsWith('Listener'));
writeAs('handlers.txt', id=>id.name.endsWith('Handler'));
writeAs('actors.txt', id=>actors.has(id) || id.template === actorFromClass);
writeAs('definations.txt', id=>id === defInstance || id.template === defInstance);
writeAs('remainings.txt', id=>true);
console.log(`global id count: ${global.children.size}`);
