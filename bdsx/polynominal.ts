

function str2set(str:string):Set<number>{
    const out = new Set<number>();
    for (let i=0;i<str.length;i++) {
        out.add(str.charCodeAt(i));
    }
    return out;
}

function unexpected():never {
    throw Error('Unexpected operation');
}

const OPERATOR_CHRS = str2set('!@#%^&*()+-=`~[]{};\':",./<>?');
const SPACES = str2set(' \t\r\n');

type Constructor<T> = {new(...args:any[]):T};

function method<A extends polynominal.Operand, B extends polynominal.Operand>(
    a:Constructor<A>, b:Constructor<B>, method:(a:A, b:B)=>(polynominal.Operand|null)):[Constructor<A>, Constructor<B>, (a:A,b:B)=>(polynominal.Operand|null)]{
    return [a, b, method];
}

export namespace polynominal {
    export class Operand {

        equals(other:Operand):boolean {
            return false;
        }
        equalsConstant(v:number):boolean {
            return false;
        }
        add(other:Operand):Operand {
            for (const [a, b, func] of operation.add) {
                if (this instanceof a && other instanceof b) {
                    const res = func(this, other);
                    if (res === null) continue;
                    return res;
                }
                if (this instanceof b && other instanceof a) {
                    const res = func(other, this);
                    if (res === null) continue;
                    return res;
                }
            }
            const out = new Additive;
            out.add(this); // must not normalize
            out.add(other);
            return out;
        }
        multiply(other:Operand): Operand {
            for (const [a, b, func] of operation.multiply) {
                if (this instanceof a && other instanceof b) {
                    const res = func(this, other);
                    if (res === null) continue;
                    return res;
                }
                if (this instanceof b && other instanceof a) {
                    const res = func(other, this);
                    if (res === null) continue;
                    return res;
                }
            }
            const out = new Multiplicative;
            out.multiply(this); // must not normalize
            out.multiply(other);
            return out;
        }
        exponent(other:Operand): Operand {
            for (const [a, b, func] of operation.exponent) {
                if (this instanceof a && other instanceof b) {
                    const res = func(this, other);
                    if (res === null) continue;
                    return res;
                }
            }
            return new polynominal.Variable(this, other);
        }
        asAdditive():Additive {
            const out = new Additive;
            const mult = new Multiplicative();
            mult.pushVariable(new Variable(this, new Constant(1)));
            out.pushTerm(mult);
            return out;
        }
        defineVariable(name:string, value:number):Operand {
            return this;
        }
        toString():string {
            unexpected();
        }
    }
    export class Constant extends Operand {
        constructor(public value:number) {
            super();
        }
        equals(other:Operand):boolean {
            if (!(other instanceof Constant)) return false;
            return this.value === other.value;
        }
        equalsConstant(v:number):boolean {
            return this.value === v;
        }
        asAdditive():Additive {
            const out = new Additive;
            out.constant = this.value;
            return out;
        }
        toString():string {
            return this.value+'';
        }
    }
    export class Name extends Operand {
        public column = -1;
        public length = -1;

        constructor(public name:string) {
            super();
        }
        equals(other:Operand):boolean {
            if (!(other instanceof Name)) return false;
            return this.name === other.name;
        }
        defineVariable(name:string, value:number):Operand {
            if (name === this.name) return new Constant(value);
            return this;
        }
        toString():string {
            return this.name;
        }
    }
    export class Variable extends Operand {
        constructor(public term:Operand, public degree:Operand) {
            super();
        }

        equals(other:Operand):boolean {
            if (!(other instanceof Variable)) return false;
            return this.degree.equals(other.degree) && this.term.equals(other.term);
        }
        asAdditive():Additive {
            const out = new Additive;
            out.pushVariable(this);
            return out;
        }
        defineVariable(name:string, value:number):Operand {
            this.term = this.term.defineVariable(name, value);
            this.degree = this.degree.defineVariable(name, value);
            return this.normalize();
        }
        normalize():Operand {
            if (this.degree instanceof Constant) {
                if (this.term instanceof Constant) {
                    return new Constant(this.term.value ** this.degree.value);
                }
                if (this.degree.value === 0) {
                    return new Constant(1);
                }
                if (this.degree.value === 1) {
                    return this.term;
                }
            }
            if (this.term instanceof Constant) {
                if (this.term.value === 0) {
                    return new Constant(0);
                }
                if (this.term.value === 1) {
                    return new Constant(1);
                }
            }
            return this;
        }
        toString():string {
            if (this.degree instanceof Constant && this.degree.value === 1) return this.term.toString();
            return `(${this.term}^${this.degree})`;
        }
    }
    export class Multiplicative extends Operand {
        public readonly variables:Variable[] = [];
        public constant:number = 1;

        has(v:Variable):boolean {
            for (const thisv of this.variables) {
                if (thisv.equals(v)) return true;
            }
            return false;
        }
        isOnlyVariable(o:Variable):boolean {
            if (this.variables.length !== 1) return false;
            if (!this.variables[0].equals(o)) return false;
            return true;
        }
        isSameVariables(o:Multiplicative):boolean {
            for (const v of o.variables) {
                if (!o.has(v)) return false;
            }
            return true;
        }
        pushVariable(v:Variable):void {
            for (const thisvar of this.variables) {
                if (!v.term.equals(thisvar.term)) continue;
                v.degree = v.degree.multiply(thisvar);
                return;
            }
            this.variables.push(v);
        }
        pushMultiplicative(item:Multiplicative):void {
            this.constant *= item.constant;
            for (const term of item.variables) {
                this.pushVariable(term);
            }
        }
        asAdditive():Additive {
            const out = new Additive;
            out.pushTerm(this);
            return out;
        }
        defineVariable(name:string, value:number):Operand {
            const out = new Multiplicative;
            out.constant = this.constant;
            for (const v of this.variables) {
                out.multiply(v.defineVariable(name, value));
            }
            return out.normalize();
        }
        normalize():Operand {
            if (this.constant === 0) return new Constant(0);
            if (this.variables.length === 0) return new Constant(this.constant);
            if (this.variables.length === 1 && this.constant === 1) return this.variables[0];
            return this;
        }
        toString():string {
            if (this.variables.length === 0) return this.constant+'';
            if (this.constant === 1) {
                if (this.variables.length === 1) return this.variables[0].toString();
                return `(${this.variables.join('*')})`;
            }
            return `(${this.variables.join('*')}*${this.constant})`;
        }
    }
    export class Additive extends Operand {
        public readonly terms:Multiplicative[] = [];
        public constant:number = 0;
    
        pushTerm(term:Multiplicative):void {
            for (let i=0;i<this.terms.length;i++){
                const thisterm = this.terms[i];
                if (!term.isSameVariables(thisterm)) continue;                
                thisterm.pushMultiplicative(term);
                if (thisterm.constant === 0) {
                    this.terms.splice(i, 1);
                }
                return;
            }
            this.terms.push(term);
        }
        pushVariable(variable:Variable):void {
            for (const term of this.terms) {
                if (term.isOnlyVariable(variable)) {
                    term.constant ++;
                    return;
                }
            }
            const mult = new Multiplicative;
            mult.variables.push(variable);
            this.terms.push(mult);
        }
        pushAddtive(item:Additive):void {
            this.constant += item.constant;
            for (const term of item.terms) {
                this.pushTerm(term);
            }
        }
        asAdditive():Additive {
            return this;
        }
        defineVariable(name:string, value:number):Operand {
            const out = new Additive;
            out.constant = this.constant;
            for (const term of this.terms) {
                out.add(term.defineVariable(name, value));
            }
            return out.normalize();
        }
        normalize():Additive|Multiplicative|Constant {
            if (this.terms.length === 1 && this.constant === 0) return this.terms[0];
            if (this.terms.length === 0) return new Constant(this.constant);
            return this;
        }
        toString():string {
            if (this.terms.length === 0) return this.constant+'';
            return `(${this.terms.join('+')}+${this.constant})`;
        }
    }
    export class SyntaxError extends Error {
        public severity:'error'|'warning' = 'error';
        public lineText?:string;
        public line?:number;

        constructor(
            message:string, 
            public column:number, 
            public width:number) {
            super(message);
        }
    }
    export class Operator {
        public name:string;
        public type:keyof OperatorSet;

        constructor(
            public readonly precedence:number,
            public readonly operation:(...args:Operand[])=>Operand) {
        }

        toString():string {
            return this.name;
        }
    }

    export function parseToNumber(text:string):number|null {
        const firstchr = text.charCodeAt(0);
        const minus = (firstchr === 0x2d);
        if (minus) {
            text = text.substr(1).trim();
        }
        if (minus || (0x30 <= firstchr && firstchr <= 0x39)) { // number
            let n:number;
            if (text.endsWith('h')) {
                n = parseInt(text.substr(0, text.length-1), 16);
            } else {
                n = +text;
            }
            if (isNaN(n)) return NaN;
            return minus ? -n : n;
        }
        return null;
    }

    export function parse(text:string):Operand {
        let i = 0;

        const ungettedOperators:Operator[] = [];

        function error(message:string, word:string):never {
            throw new SyntaxError(message, i-word.length, word.length); 
        }
    
        function skipSpace():void {
            for (;;) {
                const code = text.charCodeAt(i);
                if (!SPACES.has(code)) break;
                i++;
            }
        }
    
        function readOperator(...types:(keyof OperatorSet)[]):Operator {
            if (ungettedOperators.length !== 0) {
                return ungettedOperators.shift()!;
            }
            const from = i;
            if (from >= text.length) return OPER_EOF;
            let out = '';
            for (;;) {
                const code = text.charCodeAt(i);
                if (!OPERATOR_CHRS.has(code)) break;
                out += String.fromCharCode(code);
                if (out.length !== 1 && !OPERATORS.has(out)) break;
                i++;
            }
            const opername = text.substring(from, i);
            const opers = OPERATORS.get(opername);
            if (opers === undefined) throw new SyntaxError(`Unexpected operator '${opername}'`, from, i-from);

            for (const type of types) {
                const oper = opers[type];
                if (oper !== undefined) return oper;
            }
            throw new SyntaxError(`Unexpected operator '${opername}' for ${types.join(',')}`, from, i-from);
        }

        function ungetOperator(oper:Operator):void {
            ungettedOperators.push(oper);
        }
    
        function parseOperand(text:string):polynominal.Name|polynominal.Constant {
            const n = polynominal.parseToNumber(text);
            let out:polynominal.Name|polynominal.Constant;

            if (n === null) {
                out = new polynominal.Name(text);
                out.column = i-text.length;
                out.length = text.length;
            } else {
                if (isNaN(n)) throw error(`Unexpected number: ${text}`, text);
                out = new polynominal.Constant(n);
            }
            return out;
        }

        function readOperand():Operand|null {
            skipSpace();
            const from = i;
            for (;;) {
                if (i >= text.length) break;
                const code = text.charCodeAt(i);
                if (OPERATOR_CHRS.has(code) || SPACES.has(code)) break;
                i++;
            }
            if (from === i) return null;
            return parseOperand(text.substring(from, i));
        }

        function readStatement(endPrecedence:number):Operand {
            let operand = readOperand();
            if (operand === null) {
                const oper = readOperator('unaryPrefix');
                if (oper.name === '(') {
                    operand = readStatement(OPER_CLOSE.precedence);
                    const endoper = readOperator('unarySuffix');
                    if (endoper !== OPER_CLOSE) error(`Unexpected operator: '${oper}', expected: ')'`, endoper.name);
                } else {
                    return readStatement(oper.precedence);   
                }
            } 
            for (;;) {
                const oper = readOperator('binary', 'unarySuffix');
                if (oper.precedence <= endPrecedence) {
                    ungetOperator(oper);
                    return operand;
                }
                if (oper.type === 'unarySuffix') {
                    operand = oper.operation(operand);
                    continue;
                }
                
                const operand2 = readStatement(oper.precedence);
                operand = oper.operation(operand, operand2);
            }
        }
        
        return readStatement(-1);
    }
}

namespace operation {
    export const add:[Constructor<polynominal.Operand>, Constructor<polynominal.Operand>, (a:polynominal.Operand, b:polynominal.Operand)=>(polynominal.Operand|null)][] = [
        method(polynominal.Constant, polynominal.Constant, (a,b)=>{
            a.value += b.value;
            return a;
        }),
        method(polynominal.Additive, polynominal.Constant, (a,b)=>{
            a.constant += b.value;
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Variable, (a,b)=>{
            a.pushVariable(b);
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Multiplicative, (a,b)=>{
            a.pushTerm(b);
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Additive, (a,b)=>{
            a.pushAddtive(b);
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Name, (a,b)=>{
            a.pushVariable(new polynominal.Variable(b, new polynominal.Constant(1)));
            return a.normalize();
        }),
    ];
    export const multiply:[Constructor<polynominal.Operand>, Constructor<polynominal.Operand>, (a:polynominal.Operand, b:polynominal.Operand)=>(polynominal.Operand|null)][] = [
        
        method(polynominal.Multiplicative, polynominal.Multiplicative, (a,b)=>{
            a.pushMultiplicative(b);
            return a.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Variable, (a,b)=>{
            a.pushVariable(b);
            return a.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Constant, (a,b)=>{
            a.constant *= b.value;
            return a.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Name, (a,b)=>{
            a.pushVariable(new polynominal.Variable(b, new polynominal.Constant(1)));
            return a.normalize();
        }),
        method(polynominal.Constant, polynominal.Constant, (a,b)=>{
            a.value *= b.value;
            return a;
        }),
        method(polynominal.Variable, polynominal.Operand, (a,b)=>{
            if (a.term.equals(b)) {
                a.degree = a.degree.add(new polynominal.Constant(1));
                return a.normalize();
            }
            return null;
        }),
        method(polynominal.Additive, polynominal.Operand, (a,b)=>{
            const out = new polynominal.Additive;
            for (const term of a.terms) {
                out.add(term.multiply(b));
            }
            out.add(new polynominal.Constant(a.constant).multiply(b));
            return out.normalize();
        }),
    ];
    export const exponent:[Constructor<polynominal.Operand>, Constructor<polynominal.Operand>, (a:polynominal.Operand, b:polynominal.Operand)=>(polynominal.Operand|null)][] = [
        method(polynominal.Constant, polynominal.Constant, (a,b)=>{
            a.value **= b.value;
            return a;
        }),
    ];
}



interface OperatorSet {
    unaryPrefix?:polynominal.Operator; 
    unarySuffix?:polynominal.Operator;
    binary?:polynominal.Operator;
}
const OPERATORS = new Map<string, OperatorSet>();
OPERATORS.set('+', { unaryPrefix: new polynominal.Operator(17, v=>v) });
OPERATORS.set('-', { unaryPrefix: new polynominal.Operator(17, v=>v.multiply(new polynominal.Constant(-1))) });

OPERATORS.set('**', { binary: new polynominal.Operator(16 , (a,b)=>a.exponent(b)) });
OPERATORS.set('^', { binary: new polynominal.Operator(16 , (a,b)=>a.exponent(b)) });

OPERATORS.set('*', { binary: new polynominal.Operator(15 , (a,b)=>a.multiply(b)) });
OPERATORS.set('/', { binary: new polynominal.Operator(15 , (a,b)=>a.multiply(b.exponent(new polynominal.Constant(-1)))) });

OPERATORS.set('+', { binary: new polynominal.Operator(14 , (a,b)=>a.add(b)) });
OPERATORS.set('-', { binary: new polynominal.Operator(14 , (a,b)=>a.add(b.multiply(new polynominal.Constant(-1)))) });

OPERATORS.set('(', {unaryPrefix: new polynominal.Operator(0, unexpected) });
OPERATORS.set(')', {unarySuffix: new polynominal.Operator(0, unexpected)});
OPERATORS.set(';', {unarySuffix: new polynominal.Operator(0, unexpected)});

for (const [name, oper] of OPERATORS.entries()) {
    if (oper.unaryPrefix) {
        oper.unaryPrefix.name = name;
        oper.unaryPrefix.type = 'unarySuffix';
    }
    if (oper.unarySuffix) {
        oper.unarySuffix.name = name;
        oper.unarySuffix.type = 'unarySuffix';
    }
    if (oper.binary) {
        oper.binary.name = name;
        oper.binary.type = 'binary';
    }
}

const OPER_EOF = new polynominal.Operator(-1, unexpected);
const OPER_CLOSE = OPERATORS.get(')')!.unarySuffix!;
