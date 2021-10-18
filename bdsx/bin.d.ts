export declare namespace bin {
    function isZero(value: string): boolean;
    function uint8(value: string): number;
    function uint16(value: string): number;
    function int32(value: string): number;
    function int32_high(value: string): number;
    function int32_2(value: string): [number, number];
    function make64(low: number, high: number): string;
    function make128(a: number, b: number, c: number, d: number): string;
    function toNumber(v: string): number;
    function makeVar(n: number): string;
    function make(n: number, size: number): string;
    function fromBuffer(buffer: Uint8Array, pad?: number): string;
    function toString(v: string, radix?: number): string;
    function add(a: string, b: string): string;
    function zero(size: number): string;
    function sub(a: string, b: string): string;
    function divn(a: string, b: number): [string, number];
    function muln(a: string, b: number): string;
    function mul(a: string, b: string): string;
    function bitand(a: string, b: string): string;
    function bitor(a: string, b: string): string;
    function bitxor(a: string, b: string): string;
    /**
     * bitwise shift right
     */
    function bitshr(a: string, shift: number): string;
    /**
     * bitwise shift right
     */
    function bitshl(a: string, shift: number): string;
    function neg(a: string): string;
    function reads32(str: string): number[];
    /**
     * makes as hex bytes
     */
    function hex(a: string): string;
    function as64(v: string): string;
}
