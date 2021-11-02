import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { int16_t, int32_t } from "../nativetype";
declare module "../minecraft" {
    namespace Command {
        class VFTable extends NativeClass {
            destructor: VoidPointer;
            execute: VoidPointer | null;
        }
    }
    interface Command {
        vftable: Command.VFTable;
        u1: int32_t;
        u2: VoidPointer | null;
        u3: int32_t;
        u4: int16_t;
    }
}
