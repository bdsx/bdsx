import { AnyFunction } from "./common";
export declare class FunctionGen {
    private readonly importNames;
    private readonly imports;
    private out;
    import(name: string, value: unknown): void;
    writeln(line: string): void;
    generate(...parameters: string[]): AnyFunction;
}
