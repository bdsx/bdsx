import { StaticPointer } from "./core";
import { NativeClass } from "./nativeclass";
export declare class VirtualFunctionTable<T extends NativeClass> extends StaticPointer {
    getOffsetOf(func: T[keyof T]): [number];
}
