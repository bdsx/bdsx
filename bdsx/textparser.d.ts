export declare class TextParser {
    context: string;
    i: number;
    constructor(context: string);
    getFrom(from: number): string;
    eof(): boolean;
    peek(): string;
    endsWith(str: string): boolean;
    nextIf(str: string): boolean;
    must(str: string): void;
    skipSpaces(): void;
}
export declare class LanguageParser extends TextParser {
    readonly seperators: string;
    private readonly regexpReadToOperator;
    readonly seperatorsSet: Set<number>;
    constructor(context: string, seperators?: string);
    unget(str: string): void;
    readIdentifier(): string | null;
    readOperator(operators: {
        has(key: string): boolean;
    }): string | null;
    readTo(needle: string): string;
    readAll(): string;
}
export declare class TextLineParser extends TextParser {
    readonly lineNumber: number;
    private offset;
    matchedWidth: number;
    matchedIndex: number;
    constructor(context: string, lineNumber: number, offset?: number);
    static prespace(text: string): number;
    static trim(context: string): [string, number, number];
    readQuotedStringTo(chr: string): string | null;
    readQuotedString(): string | null;
    readToSpace(): string;
    splitWithSpaces(): IterableIterator<string>;
    readTo(needle: string): string;
    readAll(): string;
    split(needle: string): IterableIterator<string>;
    error(message: string): ParsingError;
    getPosition(): SourcePosition;
}
export interface SourcePosition {
    line: number;
    column: number;
    width: number;
}
export declare class ErrorPosition {
    readonly message: string;
    readonly severity: 'error' | 'warning' | 'info';
    readonly pos: SourcePosition | null;
    constructor(message: string, severity: 'error' | 'warning' | 'info', pos: SourcePosition | null);
    report(sourcePath: string, lineText: string | null): void;
}
export declare class ParsingError extends Error {
    readonly pos: SourcePosition | null;
    readonly errors: ErrorPosition[];
    constructor(message: string, pos: SourcePosition | null);
    report(sourcePath: string, lineText: string | null): void;
    reportAll(sourcePath: string, sourceText: string): void;
}
export declare class ParsingErrorContainer {
    error: ParsingError | null;
    add(error: ParsingError): void;
}
