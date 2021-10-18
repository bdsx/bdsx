import { NativeClass } from "../nativeclass";
import { Type } from "../nativetype";
import minecraft = require('../minecraft');
/** @deprecated */
export declare const typeid_t: typeof minecraft.typeid_t;
/** @deprecated */
export declare type typeid_t<T> = minecraft.typeid_t<T>;
/**
 * dummy class for typeid
 */
export declare class HasTypeId extends NativeClass {
}
/** @deprecated */
export declare function type_id<T, BASE extends HasTypeId>(base: typeof HasTypeId & {
    new (): BASE;
}, type: Type<T>): typeid_t<BASE>;
/** @deprecated */
export declare namespace type_id {
    /** @deprecated */
    function pdbimport(base: typeof HasTypeId, types: Type<any>[]): void;
}
