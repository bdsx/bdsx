import { Register } from "./assembler";
import { AnyFunction, NonNullableParameters } from "./common";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { dnf } from "./dnf";
import { Type, UnwrapTypeArrayToArray } from "./nativetype";
declare type UnwrapFunc<T, TYPES extends Type<any>[]> = T extends AnyFunction ? (...params: UnwrapTypeArrayToArray<TYPES>) => ReturnType<T> : never;
declare type ShouldFunction<T> = T extends AnyFunction ? T : never;
export declare function hook<T extends AnyFunction>(nf: T | null): hook.Tool<unknown, T>;
export declare function hook<T extends AnyFunction, TYPES extends Type<any>[]>(nf: T | null, ...types: TYPES): hook.Tool<unknown, UnwrapFunc<T, TYPES>>;
export declare function hook<THIS, NAME extends keyof THIS>(nf: {
    name: string;
    prototype: THIS;
} | null, name: NAME, ...types: Type<any>[]): hook.Tool<THIS, ShouldFunction<THIS[NAME]>>;
export declare function hook<THIS, NAME extends keyof THIS, TYPES extends Type<any>[]>(nf: {
    name: string;
    prototype: THIS;
} | null, name: NAME, ...types: TYPES): hook.Tool<THIS, UnwrapFunc<THIS[NAME], TYPES>>;
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
         * noOriginal will be ignored.
         */
        callOriginal?: boolean;
    }
    export class Tool<THIS, T extends AnyFunction> extends dnf.Tool<THIS> {
        getAddress(): NativePointer;
        /**
         * @param key target symbol name
         * @param to call address
         */
        raw(to: VoidPointer | ((original: VoidPointer) => VoidPointer), options?: hook.Options): VoidPointer;
        call(callback: NonNullableParameters<THIS, T>, options?: hook.Options): T;
        /**
         * @param subject for printing on error
         * @param offset offset from target
         * @param newCode call address
         * @param tempRegister using register to call
         * @param call true - call, false - jump
         * @param originalCode bytes comparing before hooking
         * @param ignoreArea pair offsets to ignore of originalCode
         */
        patch(subject: string, offset: number, newCode: VoidPointer, tempRegister: Register, call: boolean, originalCode: number[], ignoreArea: number[]): void;
        /**
         * @param subject name of hooking
         * @param offset offset from target
         * @param ptr target pointer
         * @param originalCode old codes
         * @param ignoreArea pairs of offset, ignores partial bytes.
         */
        check(subject: string, offset: number, ptr: StaticPointer, originalCode: number[], ignoreArea: number[]): boolean;
    }
    class FailedTool extends Tool<any, AnyFunction> {
        constructor();
        call(): AnyFunction;
        patch(): void;
        check(): boolean;
    }
    export const fail: FailedTool;
    export {};
}
export {};
