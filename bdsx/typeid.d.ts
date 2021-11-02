import { typeid_t } from "./minecraft";
import { NativeClass } from "./nativeclass";
import { Type } from "./nativetype";
declare const typeidmap: unique symbol;
/**
 * dummy class for typeid
 */
export declare class TypeIdCounter extends NativeClass {
    static readonly [typeidmap]: WeakMap<Type<any>, typeid_t<any>>;
    static makeId<T, BASE extends TypeIdCounter>(this: typeof TypeIdCounter & (new () => BASE), type: Type<T>): typeid_t<BASE>;
}
export {};
