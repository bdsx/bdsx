"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polynominal = void 0;
const textparser_1 = require("./textparser");
function unexpected() {
    throw Error('Unexpected operation');
}
function method(a, b, method) {
    return [a, b, method];
}
var polynominal;
(function (polynominal) {
    class Operand {
        _constantOperating(oper, other) {
            return null;
        }
        equals(other) {
            return false;
        }
        equalsConstant(v) {
            return false;
        }
        add(other) {
            const res = this._constantOperating(operation.binaryPlus, other);
            if (res !== null)
                return res;
            for (const [a, b, func] of operation.add) {
                if (this instanceof a && other instanceof b) {
                    const res = func(this, other);
                    if (res === null)
                        continue;
                    return res;
                }
                if (this instanceof b && other instanceof a) {
                    const res = func(other, this);
                    if (res === null)
                        continue;
                    return res;
                }
            }
            const out = new Additive;
            out.add(this); // must not normalize
            out.add(other);
            return out;
        }
        multiply(other) {
            const res = this._constantOperating(operation.binaryMultiply, other);
            if (res !== null)
                return res;
            for (const [a, b, func] of operation.multiply) {
                if (this instanceof a && other instanceof b) {
                    const res = func(this, other);
                    if (res === null)
                        continue;
                    return res;
                }
                if (this instanceof b && other instanceof a) {
                    const res = func(other, this);
                    if (res === null)
                        continue;
                    return res;
                }
            }
            const out = new Multiplicative;
            out.multiply(this); // must not normalize
            out.multiply(other);
            return out;
        }
        exponent(other) {
            const res = this._constantOperating(operation.binaryExponent, other);
            if (res !== null)
                return res;
            return new polynominal.Variable(this, other);
        }
        asAdditive() {
            const out = new Additive;
            const mult = new Multiplicative;
            mult.pushVariable(new Variable(this, new Constant(1)));
            out.pushTerm(mult);
            return out;
        }
        defineVariable(name, value) {
            return this;
        }
        toString() {
            unexpected();
        }
    }
    polynominal.Operand = Operand;
    class Constant extends Operand {
        constructor(value) {
            super();
            this.value = value;
        }
        _constantOperating(oper, other) {
            if (!(other instanceof Constant))
                return null;
            this.value = oper.operationConst(this.value, other.value);
            return this;
        }
        equals(other) {
            if (!(other instanceof Constant))
                return false;
            return this.value === other.value;
        }
        equalsConstant(v) {
            return this.value === v;
        }
        asAdditive() {
            const out = new Additive;
            out.constant = this.value;
            return out;
        }
        toString() {
            return this.value + '';
        }
    }
    polynominal.Constant = Constant;
    class Name extends Operand {
        constructor(name) {
            super();
            this.name = name;
            this.column = -1;
            this.length = -1;
        }
        equals(other) {
            if (!(other instanceof Name))
                return false;
            return this.name === other.name;
        }
        defineVariable(name, value) {
            if (name === this.name)
                return new Constant(value);
            return this;
        }
        toString() {
            return this.name;
        }
    }
    polynominal.Name = Name;
    class Variable extends Operand {
        constructor(term, degree) {
            super();
            this.term = term;
            this.degree = degree;
        }
        equals(other) {
            if (!(other instanceof Variable))
                return false;
            return this.degree.equals(other.degree) && this.term.equals(other.term);
        }
        asAdditive() {
            const out = new Additive;
            out.pushVariable(this);
            return out;
        }
        defineVariable(name, value) {
            this.term = this.term.defineVariable(name, value);
            this.degree = this.degree.defineVariable(name, value);
            return this.normalize();
        }
        normalize() {
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
        toString() {
            if (this.degree instanceof Constant && this.degree.value === 1)
                return this.term + '';
            return `(${this.term}^${this.degree})`;
        }
    }
    polynominal.Variable = Variable;
    class Multiplicative extends Operand {
        constructor() {
            super(...arguments);
            this.variables = [];
            this.constant = 1;
        }
        has(v) {
            for (const thisv of this.variables) {
                if (thisv.equals(v))
                    return true;
            }
            return false;
        }
        isOnlyVariable(o) {
            if (this.variables.length !== 1)
                return false;
            if (!this.variables[0].equals(o))
                return false;
            return true;
        }
        isSameVariables(o) {
            const arr = this.variables.slice();
            _foundSame: for (const v of o.variables) {
                for (let i = 0; i < arr.length; i++) {
                    if (!arr[i].equals(v))
                        continue;
                    const last = arr.length - 1;
                    if (i !== last) {
                        arr[i] = arr.pop();
                    }
                    else {
                        arr.length = last;
                    }
                    continue _foundSame;
                }
                return false;
            }
            return true;
        }
        pushVariable(v) {
            for (const thisvar of this.variables) {
                if (!v.term.equals(thisvar.term))
                    continue;
                v.degree = v.degree.multiply(thisvar);
                return;
            }
            this.variables.push(v);
        }
        pushMultiplicative(item) {
            this.constant *= item.constant;
            for (const term of item.variables) {
                this.pushVariable(term);
            }
        }
        asAdditive() {
            const out = new Additive;
            out.pushTerm(this);
            return out;
        }
        defineVariable(name, value) {
            const out = new Multiplicative;
            out.constant = this.constant;
            for (const v of this.variables) {
                out.multiply(v.defineVariable(name, value));
            }
            return out.normalize();
        }
        normalize() {
            if (this.constant === 0)
                return new Constant(0);
            if (this.variables.length === 0)
                return new Constant(this.constant);
            if (this.variables.length === 1 && this.constant === 1)
                return this.variables[0];
            return this;
        }
        toString() {
            if (this.variables.length === 0)
                return this.constant + '';
            if (this.constant === 1) {
                if (this.variables.length === 1)
                    return this.variables[0] + '';
                return `(${this.variables.join('*')})`;
            }
            return `(${this.variables.join('*')}*${this.constant})`;
        }
    }
    polynominal.Multiplicative = Multiplicative;
    class Additive extends Operand {
        constructor() {
            super(...arguments);
            this.terms = [];
            this.constant = 0;
        }
        pushTerm(term) {
            for (let i = 0; i < this.terms.length; i++) {
                const thisterm = this.terms[i];
                if (!term.isSameVariables(thisterm))
                    continue;
                thisterm.pushMultiplicative(term);
                if (thisterm.constant === 0) {
                    this.terms.splice(i, 1);
                }
                return;
            }
            this.terms.push(term);
        }
        pushVariable(variable) {
            for (const term of this.terms) {
                if (term.isOnlyVariable(variable)) {
                    term.constant++;
                    return;
                }
            }
            const mult = new Multiplicative;
            mult.variables.push(variable);
            this.terms.push(mult);
        }
        pushAddtive(item) {
            this.constant += item.constant;
            for (const term of item.terms) {
                this.pushTerm(term);
            }
        }
        asAdditive() {
            return this;
        }
        defineVariable(name, value) {
            const out = new Additive;
            out.constant = this.constant;
            for (const term of this.terms) {
                out.add(term.defineVariable(name, value));
            }
            return out.normalize();
        }
        normalize() {
            if (this.terms.length === 1 && this.constant === 0)
                return this.terms[0];
            if (this.terms.length === 0)
                return new Constant(this.constant);
            return this;
        }
        toString() {
            if (this.terms.length === 0)
                return this.constant + '';
            return `(${this.terms.join('+')}+${this.constant})`;
        }
    }
    polynominal.Additive = Additive;
    class Operation extends Operand {
        constructor(oper, operands) {
            super();
            this.oper = oper;
            this.operands = operands;
        }
        toString() {
            return `(${this.operands.join(this.oper.name)})`;
        }
        defineVariable(name, value) {
            const values = [];
            for (let i = 0; i < this.operands.length; i++) {
                const operand = this.operands[i].defineVariable(name, value);
                this.operands[i] = operand;
                if (operand instanceof Constant)
                    values.push(operand.value);
            }
            if (values.length === this.operands.length)
                return new Constant(this.oper.operationConst(...values));
            return this;
        }
    }
    polynominal.Operation = Operation;
    class Operator {
        constructor(precedence, operationConst, operation = function (...args) {
            return new Operation(this, args);
        }) {
            this.precedence = precedence;
            this.operationConst = operationConst;
            this.operation = operation;
        }
        toString() {
            return this.name;
        }
    }
    polynominal.Operator = Operator;
    /**
     * @return null if invalid
     */
    function parseToNumber(text) {
        let i = 0;
        let firstchr = text.charCodeAt(i);
        const minus = (firstchr === 0x2d);
        if (minus) {
            do {
                firstchr = text.charCodeAt(++i);
                if (isNaN(firstchr))
                    return null;
            } while (firstchr === 0x20 || firstchr === 0x09 || firstchr === 0x0d || firstchr === 0x0a);
        }
        if (text.charAt(text.length - 1) === 'h') {
            const numstr = text.substring(i, text.length - 1);
            if (/^[a-fA-F0-9]+$/.test(numstr)) {
                return parseInt(numstr, 16);
            }
            return null;
        }
        else {
            if (0x30 <= firstchr && firstchr <= 0x39) { // number
                const n = +text.substr(i);
                if (isNaN(n))
                    return null;
                return minus ? -n : n;
            }
        }
        return null;
    }
    polynominal.parseToNumber = parseToNumber;
    function parse(text, lineNumber = 0, offset = 0) {
        const parser = new textparser_1.LanguageParser(text);
        const ungettedOperators = [];
        function error(message, word) {
            throw new textparser_1.ParsingError(message, {
                column: offset + parser.i - word.length,
                width: word.length,
                line: lineNumber
            });
        }
        function readOperator(...types) {
            if (ungettedOperators.length !== 0) {
                return ungettedOperators.shift();
            }
            const opername = parser.readOperator(OPERATORS);
            if (opername === null) {
                return OPER_EOF;
            }
            const opers = OPERATORS.get(opername);
            if (opers == null)
                error(`Unexpected operator '${opername}'`, opername);
            for (const type of types) {
                const oper = opers[type];
                if (oper != null)
                    return oper;
            }
            error(`Unexpected operator '${opername}' for ${types.join(',')}`, opername);
        }
        function ungetOperator(oper) {
            ungettedOperators.push(oper);
        }
        function readOperand() {
            const word = parser.readIdentifier();
            if (word === null)
                return null;
            const n = parseToNumber(word);
            let out;
            if (n === null) {
                out = new Name(word);
                out.column = parser.i - word.length;
                out.length = word.length;
            }
            else {
                if (isNaN(n))
                    throw error(`Unexpected number: ${word}`, word);
                out = new Constant(n);
            }
            return out;
        }
        function readStatement(endPrecedence) {
            let operand = readOperand();
            if (operand === null) {
                const oper = readOperator('unaryPrefix');
                if (oper === OPER_EOF) {
                    error('unexpected end', '');
                }
                else if (oper.name === '(') {
                    operand = readStatement(OPER_CLOSE.precedence);
                    const endoper = readOperator('unarySuffix');
                    if (endoper !== OPER_CLOSE)
                        error(`Unexpected operator: '${oper}', expected: ')'`, endoper.name);
                }
                else {
                    return oper.operation(readStatement(oper.precedence));
                }
            }
            for (;;) {
                const oper = readOperator('binary', 'unarySuffix');
                if (oper.precedence <= endPrecedence) {
                    ungetOperator(oper);
                    return operand;
                }
                if (oper.type === 'unarySuffix') {
                    if (operand instanceof Constant) {
                        operand.value = oper.operationConst(operand.value);
                    }
                    else {
                        operand = oper.operation(operand);
                    }
                    continue;
                }
                const operand2 = readStatement(oper.precedence);
                if ((operand instanceof Constant) && (operand2 instanceof Constant)) {
                    operand.value = oper.operationConst(operand.value, operand2.value);
                }
                else {
                    operand = oper.operation(operand, operand2);
                }
            }
        }
        return readStatement(-1);
    }
    polynominal.parse = parse;
})(polynominal = exports.polynominal || (exports.polynominal = {}));
var operation;
(function (operation) {
    operation.add = [
        method(polynominal.Additive, polynominal.Constant, (a, b) => {
            a.constant += b.value;
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Variable, (a, b) => {
            a.pushVariable(b);
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Multiplicative, (a, b) => {
            a.pushTerm(b);
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Additive, (a, b) => {
            a.pushAddtive(b);
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Name, (a, b) => {
            a.pushVariable(new polynominal.Variable(b, new polynominal.Constant(1)));
            return a.normalize();
        }),
        method(polynominal.Additive, polynominal.Operand, (a, b) => {
            a.pushVariable(new polynominal.Variable(b, new polynominal.Constant(1)));
            return a.normalize();
        }),
    ];
    operation.multiply = [
        method(polynominal.Multiplicative, polynominal.Multiplicative, (a, b) => {
            a.pushMultiplicative(b);
            return a.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Variable, (a, b) => {
            a.pushVariable(b);
            return a.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Constant, (a, b) => {
            a.constant *= b.value;
            return a.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Name, (a, b) => {
            a.pushVariable(new polynominal.Variable(b, new polynominal.Constant(1)));
            return a.normalize();
        }),
        method(polynominal.Variable, polynominal.Operand, (a, b) => {
            if (a.term.equals(b)) {
                a.degree = a.degree.add(new polynominal.Constant(1));
                return a.normalize();
            }
            return null;
        }),
        method(polynominal.Additive, polynominal.Operand, (a, b) => {
            const out = new polynominal.Additive;
            for (const term of a.terms) {
                out.add(term.multiply(b));
            }
            out.add(new polynominal.Constant(a.constant).multiply(b));
            return out.normalize();
        }),
        method(polynominal.Multiplicative, polynominal.Operand, (a, b) => {
            a.pushVariable(new polynominal.Variable(b, new polynominal.Constant(1)));
            return a.normalize();
        }),
    ];
    operation.binaryPlus = new polynominal.Operator(14, (a, b) => a + b, (a, b) => a.add(b));
    operation.binaryMultiply = new polynominal.Operator(15, (a, b) => a * b, (a, b) => a.multiply(b));
    operation.binaryExponent = new polynominal.Operator(16, (a, b) => a ** b, (a, b) => a.exponent(b));
})(operation || (operation = {}));
const OPERATORS = new Map();
OPERATORS.set('**', {
    binary: operation.binaryExponent
});
OPERATORS.set('*', {
    binary: operation.binaryMultiply
});
OPERATORS.set('/', { binary: new polynominal.Operator(15, (a, b) => a / b, (a, b) => a.multiply(b.exponent(new polynominal.Constant(-1)))) });
OPERATORS.set('+', {
    unaryPrefix: new polynominal.Operator(17, v => v, v => v),
    binary: operation.binaryPlus
});
OPERATORS.set('-', {
    unaryPrefix: new polynominal.Operator(17, v => -v, v => v.multiply(new polynominal.Constant(-1))),
    binary: new polynominal.Operator(14, (a, b) => a - b, (a, b) => a.add(b.multiply(new polynominal.Constant(-1))))
});
OPERATORS.set('~', { unaryPrefix: new polynominal.Operator(17, v => ~v) });
OPERATORS.set('<<', { binary: new polynominal.Operator(13, (a, b) => a << b) });
OPERATORS.set('>>', { binary: new polynominal.Operator(13, (a, b) => a >> b) });
OPERATORS.set('>>>', { binary: new polynominal.Operator(13, (a, b) => a >>> b) });
OPERATORS.set('&', { binary: new polynominal.Operator(10, (a, b) => a & b) });
OPERATORS.set('^', { binary: new polynominal.Operator(9, (a, b) => a ^ b) });
OPERATORS.set('|', { binary: new polynominal.Operator(8, (a, b) => a | b) });
OPERATORS.set('(', { unaryPrefix: new polynominal.Operator(0, unexpected, unexpected) });
OPERATORS.set(')', { unarySuffix: new polynominal.Operator(0, unexpected, unexpected) });
OPERATORS.set(';', { unarySuffix: new polynominal.Operator(0, unexpected, unexpected) });
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
const OPER_CLOSE = OPERATORS.get(')').unarySuffix;
//# sourceMappingURL=polynominal.js.map