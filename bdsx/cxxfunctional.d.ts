import { Type } from "./nativetype";
/**
 * std::less
 */
export declare const CxxLess: {
    /**
     * get defined std::less<type>
     *
     * it's just a kind of getter but uses 'make' for consistency.
     */
    make<T>(type: Type<T>): (a: T, b: T) => boolean;
    /**
     * define std::less<type>
     */
    define<T_1>(type: Type<T_1>, less: (a: T_1, b: T_1) => boolean): void;
};
export declare type CxxLess<T> = (a: T, b: T) => boolean;
