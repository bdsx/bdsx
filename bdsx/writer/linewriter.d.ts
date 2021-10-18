export declare abstract class LineWriter {
    private len;
    private _tab;
    private tabbed;
    eol: string;
    tabSize: number;
    lineBreakIfLong(sep: string): void;
    lineBreak(): void;
    protected abstract _write(value: string): void;
    write(value: string): void;
    writeln(line: string): void;
    join<T>(params: Iterable<T>, glue: string, linePerComponent?: boolean): IterableIterator<T>;
    tab(): void;
    detab(): void;
    static generateWarningComment(generatorName?: string, instead?: string): string[];
    generateWarningComment(generatorName?: string, instead?: string): void;
}
export declare class StringLineWriter extends LineWriter {
    result: string;
    protected _write(content: string): void;
}
export declare class FileLineWriter extends LineWriter {
    readonly fd: number;
    constructor(fd: number);
    protected _write(value: string): void;
}
