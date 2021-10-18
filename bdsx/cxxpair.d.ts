import { VoidPointer } from "./core";
import { NativeClass, NativeClassType } from "./nativeclass";
import { Type } from "./nativetype";
export interface CxxPairType<A, B> extends NativeClassType<CxxPair<A, B>> {
    new (address?: VoidPointer | boolean): CxxPair<A, B>;
    readonly firstType: Type<any>;
    readonly secondType: Type<any>;
}
/**
 * std::pair
 */
export declare abstract class CxxPair<T1, T2> extends NativeClass {
    first: T1;
    second: T2;
    readonly firstType: Type<any>;
    readonly secondType: Type<any>;
    static readonly firstType: Type<any>;
    static readonly secondType: Type<any>;
    abstract setFirst(first: T1): void;
    abstract setSecond(second: T2): void;
    static make<T1, T2>(firstType: Type<T1>, secondType: Type<T2>): CxxPairType<T1, T2>;
}
