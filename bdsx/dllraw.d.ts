export declare namespace dllraw {
    namespace kernel32 {
        const module: import("./core").VoidPointer;
        const GetCurrentThreadId: import("./core").VoidPointer;
        const Sleep: import("./core").VoidPointer;
    }
    namespace vcruntime140 {
        const module: import("./core").VoidPointer;
        const memcpy: import("./core").VoidPointer;
    }
    namespace ucrtbase {
        const module: import("./core").VoidPointer;
        const malloc: import("./core").VoidPointer;
    }
}
