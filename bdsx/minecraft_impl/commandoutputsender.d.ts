import { VoidPointer } from "../core";
declare module "../minecraft" {
    interface CommandOutputSender {
        vftable: VoidPointer;
    }
}
