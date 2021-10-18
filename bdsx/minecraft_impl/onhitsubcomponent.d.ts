import { VoidPointer } from "../core";
declare module "../minecraft" {
    interface OnHitSubcomponent {
        vftable: VoidPointer;
        readfromJSON(value: Json.Value): void;
        writetoJSON(value: Json.Value): void;
    }
}
