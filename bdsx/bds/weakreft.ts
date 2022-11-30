import { NativeClass } from "../nativeclass";
import { CxxWeakPtr } from "../sharedpointer";

export const WeakRefT = CxxWeakPtr;
export type WeakRefT<T extends NativeClass> = CxxWeakPtr<T>;
