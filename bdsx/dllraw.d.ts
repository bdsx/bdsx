export declare namespace dllraw {
    const bedrock_server: {
        "??$_Allocate@$0BA@U_Default_allocate_traits@std@@$0A@@std@@YAPEAX_K@Z": import("./core").NativePointer;
        "??0?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@QEAA@XZ": import("./core").NativePointer;
        "?_Tidy_deallocate@?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAAXXZ": import("./core").NativePointer;
    };
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
