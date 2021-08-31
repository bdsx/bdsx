import { ActorUniqueID } from "../minecraft";
import { bin64_t } from "../nativetype";

declare module "../minecraft" {
    interface ActorUniqueID {
        value:bin64_t;
    }
    namespace ActorUniqueID {
        function createFromBin(value:bin64_t):ActorUniqueID;
    }
}

ActorUniqueID.define({
    value: bin64_t,
});
ActorUniqueID.createFromBin = function(value:bin64_t):ActorUniqueID {
    const out = new ActorUniqueID(true);
    out.value = value;
    return out;
};
