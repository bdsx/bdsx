import { bin64_t } from "../nativetype";
declare module "../minecraft" {
    interface ActorUniqueID {
        value: bin64_t;
        lowBits: number;
        highBits: number;
        equals(other: ActorUniqueID): boolean;
    }
    namespace ActorUniqueID {
        function create(lowBits: number, highBits: number): ActorUniqueID;
        function create(value: bin64_t): ActorUniqueID;
    }
}
