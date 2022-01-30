import type { Type } from "./nativetype";

export namespace CommandParameterType {
    /**
     * fake symbol for the type checking
     */
    export declare const symbol:unique symbol;
}
export interface CommandParameterType<T> extends Type<T> {
    [CommandParameterType.symbol]:true;
}
