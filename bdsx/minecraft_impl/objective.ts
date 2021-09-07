import { Objective, ObjectiveCriteria } from "../minecraft";
import { CxxString } from "../nativetype";

declare module "../minecraft" {
    interface Objective {
        name:CxxString;
        displayName:CxxString;
        criteria:ObjectiveCriteria;
    }
}

Objective.abstract({
    name:[CxxString, 0x40],
    displayName:CxxString,
    criteria:ObjectiveCriteria.ref(),
});
