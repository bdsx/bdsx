import { CxxString } from "../nativetype";
declare module "../minecraft" {
    interface Objective {
        name: CxxString;
        displayName: CxxString;
        criteria: ObjectiveCriteria;
    }
}
