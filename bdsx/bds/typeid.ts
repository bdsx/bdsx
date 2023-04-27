import { NativePointer } from "../core";
import { makefunc } from "../makefunc";
import { AbstractClass, NativeClass, nativeClass, nativeField, NativeStruct } from "../nativeclass";
import { Type, uint16_t } from "../nativetype";
import { CommandSymbols } from "./cmdsymbolloader";

@nativeClass()
export class typeid_t<T> extends NativeStruct {
    @nativeField(uint16_t)
    id: uint16_t;
}

const counterWrapper = Symbol("IdCounter");
const typeidmap = Symbol("typeidmap");

@nativeClass()
class IdCounter extends NativeClass {
    getValue(): number {
        return this.isoVolatileLoad16() & 0xffff;
    }

    /**
     * @return incremented value
     */
    increase(): number {
        return this.interlockedIncrement16() & 0xffff;
    }
}

/**
 * dummy class for typeid
 */
export class HasTypeId extends AbstractClass {
    static [counterWrapper]: IdCounter;
    static readonly [typeidmap] = new WeakMap<Type<any>, typeid_t<any> | NativePointer>();
}

export function type_id<T, BASE extends HasTypeId>(base: typeof HasTypeId & { new (): BASE }, type: Type<T>): typeid_t<BASE> {
    const map = base[typeidmap];
    const typeid = map.get(type);
    if (typeid instanceof typeid_t) {
        return typeid;
    }

    const counter = base[counterWrapper];
    if (counter.getValue() === 0) throw Error("Cannot make type_id before launch");
    if (typeid != null) {
        const newid = makefunc.js(typeid, typeid_t, {
            structureReturn: true,
        })();
        map.set(type, newid);
        return newid;
    } else {
        const newid = new typeid_t<BASE>(true);
        newid.id = counter.increase() - 1;
        map.set(type, newid);
        return newid;
    }
}

export namespace type_id {
    /**
     * @deprecated dummy
     */
    export function pdbimport(base: Type<any>, types: Type<any>[]): void {
        // dummy
    }
    export function load(symbols: CommandSymbols): void {
        for (const [basetype, addr] of symbols.iterateCounters()) {
            const base = basetype as typeof HasTypeId;
            const map = base[typeidmap];
            base[counterWrapper] = addr.as(IdCounter);

            for (const [type, addr] of symbols.iterateTypeIdFns(basetype)) {
                map.set(type, addr);
            }
            for (const [type, addr] of symbols.iterateTypeIdPtrs(basetype)) {
                map.set(type, addr.as(typeid_t));
            }
        }
    }
    export function clone(base: typeof HasTypeId, oriType: Type<any>, newType: Type<any>): void {
        const map = base[typeidmap];
        let typeid = map.get(oriType);
        if (typeid == null) {
            throw Error(`type_id ${oriType.name} not found`);
        }
        if (!(typeid instanceof typeid_t)) {
            typeid = makefunc.js(typeid, typeid_t, { structureReturn: true })();
            map.set(oriType, typeid);
        }
        map.set(newType, typeid);
    }
    export function register(base: typeof HasTypeId, type: Type<any>, id: number): void {
        const map = base[typeidmap];
        const newid = new typeid_t<any>(true);
        newid.id = id;
        map.set(type, newid);
    }
}
