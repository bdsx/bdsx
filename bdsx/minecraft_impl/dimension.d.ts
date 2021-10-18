import { VoidPointer } from "../core";
declare module "../minecraft" {
    interface Dimension {
        vftable: VoidPointer;
    }
}
