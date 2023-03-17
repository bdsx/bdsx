import { AnyFunction } from "./common";

const RESERVED_WORDS = new Set([
    "$imp",

    // statements
    "do",
    "if",
    "in",
    "for",
    "let",
    "new",
    "try",
    "var",
    "case",
    "else",
    "enum",
    "eval",
    "false",
    "null",
    "undefined",
    "NaN",
    "this",
    "true",
    "void",
    "with",
    "break",
    "catch",
    "class",
    "const",
    "super",
    "throw",
    "while",
    "yield",
    "delete",
    "export",
    "import",
    "public",
    "return",
    "static",
    "switch",
    "typeof",
    "default",
    "extends",
    "finally",
    "package",
    "private",
    "continue",
    "debugger",
    "function",
    "arguments",
    "interface",
    "protected",
    "implements",
    "instanceof",
]);

export class FunctionGen {
    private readonly importNames: string[] = [];
    private readonly imports: unknown[] = [];
    private out: string;

    public readonly functionName: string;

    constructor(functionName: string | undefined, ...parameters: string[]) {
        if (!functionName) {
            functionName = "_";
        } else {
            functionName = functionName.replace(/[^a-zA-Z0-9_$]+/g, "_");
            if (RESERVED_WORDS.has(functionName) || /^[0-9]/.test(functionName)) {
                functionName = "_" + functionName;
            }
        }
        this.functionName = functionName;

        let out = '"use strict";\n';
        out += `function ${functionName}(${parameters.join(",")}){`;
        this.out = out;
    }

    import(name: string, value: unknown): void {
        this.importNames.push(name);
        this.imports.push(value);
    }

    writeln(line: string): void {
        this.out += line;
        this.out += "\n";
    }

    generate(): AnyFunction {
        this.out += "}\n";
        this.out += `const [${[...this.importNames].join(",")}]=$imp;\n`;
        this.out += `return ${this.functionName};`;
        return new Function("$imp", this.out)(this.imports);
    }
}
