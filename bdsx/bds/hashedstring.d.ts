import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { CxxString, NativeType } from "../nativetype";
export declare class HashedString extends NativeClass {
    hash: VoidPointer | null;
    str: CxxString;
    [NativeType.ctor](): void;
    set(str: string): void;
}
