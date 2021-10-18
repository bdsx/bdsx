import { VoidPointer } from "../core";
import { MobEffectIds } from "../enums";
declare type EntityStringId = EntityId;
declare module "../minecraft" {
    interface Actor {
        vftable: VoidPointer;
        identifier: EntityStringId;
        removeEffect(id: MobEffectIds): void;
    }
    namespace Actor {
        function all(): IterableIterator<Actor>;
        function registerType(type: {
            new (): Actor;
            __vftable: VoidPointer;
        }): void;
    }
}
export {};
