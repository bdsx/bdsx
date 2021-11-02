import { Type } from "../nativetype";
import { TypeIdCounter } from "../typeid";
import minecraft = require('../minecraft');
/** @deprecated */
export declare const typeid_t: typeof minecraft.typeid_t;
/** @deprecated */
export declare type typeid_t<T> = minecraft.typeid_t<T>;
/** @deprecated */
export declare const HasTypeId: typeof TypeIdCounter;
/** @deprecated */
export declare type HasTypeId = TypeIdCounter;
/** @deprecated */
export declare function type_id<T, BASE extends TypeIdCounter>(base: typeof TypeIdCounter & {
    new (): BASE;
}, type: Type<T>): typeid_t<BASE>;
/** @deprecated */
export declare namespace type_id {
    /** @deprecated it does nothing */
    function pdbimport(base: typeof HasTypeId, types: Type<any>[]): void;
}
