import { Register, X64Assembler } from "./assembler";
import { AnyFunction, NonNullableParameters } from "./common";
import { NativePointer, VoidPointer } from "./core";
import { dnf } from "./dnf";
import { Type, UnwrapTypeArrayToArray } from "./nativetype";
declare type UnwrapFunc<T, TYPES extends Type<any>[]> = T extends AnyFunction ? (...params: UnwrapTypeArrayToArray<TYPES>) => ReturnType<T> : never;
declare type ShouldFunction<T> = T extends AnyFunction ? T : never;
declare type EmptyOpts = {};
export declare function hook<T extends AnyFunction>(nf: T | null): hook.Tool<unknown, T, EmptyOpts>;
export declare function hook<THIS, NAME extends keyof THIS>(nf: {
    name: string;
    prototype: THIS;
} | null, name: NAME): hook.Tool<THIS, ShouldFunction<THIS[NAME]>, EmptyOpts>;
declare type VoidReturnFunc<THIS, T extends AnyFunction> = T extends (...args: infer PARAMS) => any ? NonNullableParameters<THIS, (...args: PARAMS) => void> : never;
export declare namespace hook {
    export interface Options {
        /**
         * name for error or crash
         */
        name?: string;
        /**
         * do not generate the original function.
         * it will return null instead of the original function
         */
        noOriginal?: boolean;
        /**
         * call the original function at the end of the hooked function.
         * it can receive only 4 parameters.
         */
        callOriginal?: boolean;
    }
    export class PtrTool {
        name: string;
        private ptr;
        private _subject?;
        private _offset?;
        constructor(name: string, ptr: NativePointer);
        /**
         * @param offset offset from target
         * @returns
         */
        offset(offset: number): this;
        /**
         * @param subject for printing on error
         * @returns
         */
        subject(subject: string): this;
        getAddress(): NativePointer;
        /**
         * @param offset offset from target
         * @param ptr target pointer
         * @param originalCode old codes
         * @param ignoreArea pairs of offset, ignores partial bytes.
         */
        private _check;
        /**
         * @param newCode call address
         * @param tempRegister using register to call
         * @param call true - call, false - jump
         * @param originalCode bytes comparing before hooking
         * @param ignoreArea pair offsets to ignore of originalCode
         */
        patch(newCode: VoidPointer, tempRegister: Register, call: boolean, originalCode: number[], ignoreArea?: number[] | null): void;
        /**
         * @param ptr target pointer
         * @param originalCode bytes comparing
         * @param ignoreArea pairs of offset, ignores partial bytes.
         */
        check(originalCode: number[], ignoreArea?: number[] | null): boolean;
        /**
         * @param offset offset from target
         * @param originalCode bytes comparing before hooking
         * @param ignoreArea pair offsets to ignore of originalCode
         */
        writeNop(originalCode: number[], ignoreArea?: number[] | null): void;
        write(asm: X64Assembler | Uint8Array, offset?: number | null, originalCode?: number[] | null, ignoreArea?: number[] | null): void;
    }
    export interface Tool<THIS, T extends AnyFunction, OPTS extends Options> extends PtrTool {
    }
    type OriginalPtr<OPTS extends Options> = OPTS extends {
        noOriginal: true;
    } ? null : VoidPointer;
    type OriginalFunc<T extends AnyFunction, OPTS extends Options> = OPTS extends {
        noOriginal: true;
    } ? null : T;
    type Callback<THIS, T extends AnyFunction, OPTS extends Options> = OPTS extends {
        callOriginal: true;
    } ? VoidReturnFunc<THIS, T> : NonNullableParameters<THIS, T>;
    export class Tool<THIS, T extends AnyFunction, OPTS extends Options> extends dnf.Tool<THIS> {
        private opts;
        constructor(nf: T, name: string, thisType: Type<THIS> | null, opts: OPTS);
        options<NOPTS extends Options>(opts: NOPTS): Tool<THIS, T, NOPTS>;
        types<TYPES extends Type<any>[]>(...types: Type<any>[]): Tool<THIS, UnwrapFunc<T, TYPES>, OPTS>;
        /**
         * @param key target symbol name
         * @param to call address
         */
        raw(to: VoidPointer | ((original: OriginalPtr<OPTS>) => VoidPointer)): OriginalPtr<OPTS>;
        call(callback: Callback<THIS, T, OPTS>): OriginalFunc<T, OPTS>;
    }
    class FailedTool extends Tool<any, AnyFunction, any> {
        constructor();
        raw(): VoidPointer | null;
        call(callback: AnyFunction): AnyFunction;
        patch(): void;
        check(): boolean;
    }
    export const fail: FailedTool;
    export {};
}
export {};
