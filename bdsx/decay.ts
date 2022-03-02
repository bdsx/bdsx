import { VoidPointer } from "./core";

const decayed = Symbol('[decayedproto]');

declare module "./core" {
    interface VoidPointer {
        [decayed]:VoidPointer;
    }
}
VoidPointer.prototype[decayed] = VoidPointer.prototype;

function _():never{
    throw Error("This object is decayed. Native objects are unusable after it deleted");
}

function getDecayed<T extends VoidPointer>(v:T):T {
    if (v.hasOwnProperty(decayed)) {
        return (v as any)[decayed];
    }

    const obj = Object.create(getDecayed((v as any).__proto__));
    const properties:PropertyDescriptorMap = {};
    for (const key of Object.getOwnPropertyNames(v)) {
        properties[key] = { get: _ };
    }
    Object.defineProperties(obj, properties);
    obj[decayed] = obj;
    return v[decayed] = obj;
}

/**
 * make it unusable.
 */
export function decay(obj:VoidPointer):void {
    (obj as any).__proto__ = getDecayed((obj as any).__proto__);
}

export namespace decay {
    export function isDecayed(obj:VoidPointer):boolean {
        return obj[decayed] === (obj as any).__proto__;
    }
}
