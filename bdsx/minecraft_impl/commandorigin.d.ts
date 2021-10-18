import { VoidPointer } from "../core";
import { CxxString } from "../nativetype";
declare module "../minecraft" {
    interface CommandOrigin {
        vftable: VoidPointer;
        uuid: mce.UUID;
        level: ServerLevel;
        constructWith(vftable: VoidPointer, level: ServerLevel): void;
        isServerCommandOrigin(): boolean;
        isScriptCommandOrigin(): boolean;
        getRequestId(): CxxString;
        getName(): string;
        getBlockPosition(): BlockPos;
        getWorldPosition(): Vec3;
        getLevel(): Level;
        /**
         * actually, it's nullable when the server is just started without any joining
         */
        getDimension(): Dimension;
        /**
         * it returns null if the command origin is the console
         */
        getEntity(): Actor | null;
        /**
         * return the command result
         */
        handleCommandOutputCallback(value: unknown & IExecuteCommandCallback['data']): void;
    }
}
