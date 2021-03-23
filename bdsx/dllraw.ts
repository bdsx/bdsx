import { cgate } from "./core";


export namespace dllraw {

    export namespace kernel32 {
        export const module = cgate.GetModuleHandleW('kernel32.dll');
        export const GetCurrentThreadId = cgate.GetProcAddress(module, 'GetCurrentThreadId');
        export const Sleep = cgate.GetProcAddress(module, 'Sleep');
    }
    export namespace vcruntime140 {
        export const module = cgate.GetModuleHandleW('vcruntime140.dll');
        export const memcpy = cgate.GetProcAddress(module, 'memcpy');
    }
    export namespace ucrtbase {
        export const module = cgate.GetModuleHandleW('ucrtbase.dll');
        export const malloc = cgate.GetProcAddress(module, 'malloc');
    }
}
