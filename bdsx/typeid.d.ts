import { typeid_t } from "./minecraft";
import { NativeClass } from "./nativeclass";
import { Type, uint16_t } from "./nativetype";
import { Wrapper } from "./pointer";
declare const counterWrapper: unique symbol;
declare const typeidmap: unique symbol;
declare const IdCounter: import("./pointer").WrapperType<number>;
declare type IdCounter = Wrapper<uint16_t>;
/**
 * dummy class for typeid
 */
export declare class TypeIdCounter extends NativeClass {
    static [counterWrapper]: IdCounter;
    static readonly [typeidmap]: WeakMap<Type<any>, typeid_t<any>>;
    static makeId<T, BASE extends TypeIdCounter>(this: typeof TypeIdCounter & (new () => BASE), type: Type<T>): typeid_t<BASE>;
}
export {};
