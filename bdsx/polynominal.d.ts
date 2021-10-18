export declare namespace polynominal {
    class Operand {
        protected _constantOperating(oper: Operator, other: Operand): Constant | null;
        equals(other: Operand): boolean;
        equalsConstant(v: number): boolean;
        add(other: Operand): Operand;
        multiply(other: Operand): Operand;
        exponent(other: Operand): Operand;
        asAdditive(): Additive;
        defineVariable(name: string, value: number): Operand;
        toString(): string;
    }
    class Constant extends Operand {
        value: number;
        constructor(value: number);
        protected _constantOperating(oper: Operator, other: Operand): Constant | null;
        equals(other: Operand): boolean;
        equalsConstant(v: number): boolean;
        asAdditive(): Additive;
        toString(): string;
    }
    class Name extends Operand {
        name: string;
        column: number;
        length: number;
        constructor(name: string);
        equals(other: Operand): boolean;
        defineVariable(name: string, value: number): Operand;
        toString(): string;
    }
    class Variable extends Operand {
        term: Operand;
        degree: Operand;
        constructor(term: Operand, degree: Operand);
        equals(other: Operand): boolean;
        asAdditive(): Additive;
        defineVariable(name: string, value: number): Operand;
        normalize(): Operand;
        toString(): string;
    }
    class Multiplicative extends Operand {
        readonly variables: Variable[];
        constant: number;
        has(v: Variable): boolean;
        isOnlyVariable(o: Variable): boolean;
        isSameVariables(o: Multiplicative): boolean;
        pushVariable(v: Variable): void;
        pushMultiplicative(item: Multiplicative): void;
        asAdditive(): Additive;
        defineVariable(name: string, value: number): Operand;
        normalize(): Operand;
        toString(): string;
    }
    class Additive extends Operand {
        readonly terms: Multiplicative[];
        constant: number;
        pushTerm(term: Multiplicative): void;
        pushVariable(variable: Variable): void;
        pushAddtive(item: Additive): void;
        asAdditive(): Additive;
        defineVariable(name: string, value: number): Operand;
        normalize(): Additive | Multiplicative | Constant;
        toString(): string;
    }
    class Operation extends Operand {
        readonly oper: Operator;
        readonly operands: Operand[];
        constructor(oper: Operator, operands: Operand[]);
        toString(): string;
        defineVariable(name: string, value: number): Operand;
    }
    class Operator {
        readonly precedence: number;
        readonly operationConst: (...args: number[]) => number;
        readonly operation: ((this: Operator, ...args: Operand[]) => Operand);
        name: string;
        type: keyof OperatorSet;
        constructor(precedence: number, operationConst: (...args: number[]) => number, operation?: ((this: Operator, ...args: Operand[]) => Operand));
        toString(): string;
    }
    /**
     * @return null if invalid
     */
    function parseToNumber(text: string): number | null;
    function parse(text: string, lineNumber?: number, offset?: number): Operand;
}
interface OperatorSet {
    unaryPrefix?: polynominal.Operator;
    unarySuffix?: polynominal.Operator;
    binary?: polynominal.Operator;
}
export {};
