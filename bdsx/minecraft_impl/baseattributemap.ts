import { AttributeId } from "../bds/attribute";

declare module "../minecraft" {
    interface BaseAttributeMap {
        getMutableInstance(type:AttributeId):AttributeInstance|null;
    }
}
