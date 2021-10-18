import { VoidPointer } from "../core";
declare module "../minecraft" {
    interface Minecraft {
        vftable: VoidPointer;
    }
}
