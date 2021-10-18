import { NativePointer, StaticPointer } from "./core";
export declare namespace msAlloc {
    const allocate: (bytes: number) => NativePointer;
    function deallocate(ptr: StaticPointer, bytes: number): void;
}
