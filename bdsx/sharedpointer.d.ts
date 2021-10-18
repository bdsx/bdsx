import { StaticPointer, VoidPointer } from "./core";
import { NativeClass, NativeClassType } from "./nativeclass";
import { NativeType, Type, uint32_t } from "./nativetype";
export declare class SharedPtrBase<T> extends NativeClass {
    vftable: VoidPointer;
    useRef: uint32_t;
    weakRef: uint32_t;
    value: T;
    [NativeType.ctor](): void;
    addRef(): void;
    release(): void;
    _DeleteThis(): void;
    _Destroy(): void;
    static make<T>(type: Type<T>): NativeClassType<SharedPtrBase<T>>;
}
/**
 * wrapper for std::shared_ptr
 */
export declare abstract class SharedPtr<T> extends NativeClass {
    static readonly type: NativeClassType<any>;
    readonly p: T | null;
    readonly ref: SharedPtrBase<T> | null;
    abstract ctor_move(value: SharedPtr<T>): void;
    abstract [NativeType.ctor_copy](value: SharedPtr<T>): void;
    abstract [NativeType.ctor_move](value: SharedPtr<T>): void;
    abstract dispose(): void;
    [NativeType.dtor](): void;
    assign(value: SharedPtr<T>): this;
    assign_move(value: SharedPtr<T>): this;
    exists(): boolean;
    addRef(): void;
    assignTo(dest: StaticPointer): void;
    abstract create(vftable: VoidPointer): void;
    static make<T extends NativeClass>(type: Type<T>): NativeClassType<SharedPtr<T>>;
}
