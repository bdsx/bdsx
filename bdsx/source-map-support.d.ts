interface StackState {
    nextPosition: Position | null;
    curPosition: Position | null;
}
interface UrlAndMap {
    url: string | null;
    map: string;
}
declare module 'source-map' {
    interface SourceMapConsumer {
        sources: string[];
    }
}
export declare const retrieveSourceMap: (arg: string) => UrlAndMap | null;
interface Position {
    source: string;
    line: number;
    column: number;
}
export declare function mapSourcePosition(position: Position): Position;
export declare function remapError<T extends Error>(err: T): T;
export interface FrameInfo {
    hidden: boolean;
    stackLine: string;
    internal: boolean;
    position: Position | null;
}
/**
 * remap filepath to original filepath
 */
export declare function remapStack(stack?: string): string | undefined;
/**
 * remap filepath to original filepath for one line
 */
export declare function remapStackLine(stackLine: string, state?: StackState): FrameInfo;
/**
 * remap stack and print
 */
export declare function remapAndPrintError(err: {
    stack?: string;
}): void;
export declare function getErrorSource(error: Error): string | null;
export declare function install(): void;
export declare function getCurrentFrameInfo(stackOffset?: number): FrameInfo;
export declare function partialTrace(message: string, offset?: number): void;
export {};
