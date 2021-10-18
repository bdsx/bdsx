import { AbstractClass } from './common';
export declare function memdiff(dst: number[] | Uint8Array, src: number[] | Uint8Array): number[];
export declare function memdiff_contains(larger: number[], smaller: number[]): boolean;
export declare function memcheck(code: Uint8Array, originalCode: number[], skip?: number[]): number[] | null;
export declare function hex(values: number[] | Uint8Array, nextLinePer?: number): string;
export declare namespace hex {
    function format(n: number, chrwidth: number): string;
}
export declare function unhex(hex: string): Uint8Array;
export declare const _tickCallback: () => void;
/**
 * @param lineIndex first line is zero
 */
export declare function indexOfLine(context: string, lineIndex: number, p?: number): number;
/**
 * removeLine("a \n b \n c", 1, 2) === "a \n c"
 * @param lineFrom first line is zero
 * @param lineTo first line is one
 */
export declare function removeLine(context: string, lineFrom: number, lineTo: number): string;
/**
 * @param lineIndex first line is zero
 */
export declare function getLineAt(context: string, lineIndex: number): string;
export declare function isBaseOf<BASE>(t: unknown, base: AbstractClass<BASE>): t is AbstractClass<BASE>;
/**
 * @deprecated use util.inspect
 */
export declare function anyToString(v: unknown): string;
export declare function str2set(str: string): Set<number>;
export declare function str2array(str: string): number[];
export declare function arrayEquals(arr1: unknown[], arr2: unknown[], count?: number): boolean;
export declare namespace arrayEquals {
    function deep(arr1: {
        equals(other: any): boolean;
    }[], arr2: {
        equals(other: any): boolean;
    }[]): boolean;
}
/**
 * check elements are same
 */
export declare function arraySame(array: unknown[]): boolean;
export declare function makeSignature(sig: string): number;
export declare function checkPowOf2(n: number): void;
export declare function intToVarString(n: number): string;
export declare function numberWithFillZero(n: number, width: number, radix?: number): string;
export declare function filterToIdentifierableString(name: string): string;
export declare function printOnProgress(message: string): void;
export declare type DeferPromise<T> = Promise<T> & {
    resolve: (value?: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
};
export declare namespace DeferPromise {
    function make<T>(): DeferPromise<T>;
}
