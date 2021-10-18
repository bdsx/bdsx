import { AbstractReader, AbstractWriter } from "./abstractstream";
export declare class BufferWriter extends AbstractWriter {
    array: Uint8Array;
    size: number;
    constructor(array: Uint8Array, size: number);
    put(v: number): void;
    putRepeat(v: number, count: number): void;
    write(values: number[] | Uint8Array): void;
    resize(nsize: number): void;
    buffer(): Uint8Array;
}
export declare class BufferReader extends AbstractReader {
    array: Uint8Array;
    p: number;
    constructor(array: Uint8Array);
    get(): number;
    read(values: Uint8Array, offset: number, length: number): number;
    remaining(): Uint8Array;
}
