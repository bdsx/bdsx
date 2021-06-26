import { NativePointer, pdb } from "../core";
import { UNDNAME_NAME_ONLY } from "../dbghelp";
import { makefunc } from "../makefunc";
import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { Type, uint16_t } from "../nativetype";
import { Wrapper } from "../pointer";
import { templateName } from "../templatename";

@nativeClass()
export class typeid_t<T> extends NativeClass{
    @nativeField(uint16_t)
    id:uint16_t;
}

const counterWrapper = Symbol();
const typeidmap = Symbol();

const IdCounter = Wrapper.make(uint16_t);
type IdCounter = Wrapper<uint16_t>;

/**
 * dummy class for typeid
 */
export class HasTypeId extends NativeClass {
    static [counterWrapper]:IdCounter;
    static readonly [typeidmap] = new WeakMap<Type<any>, typeid_t<any>|NativePointer>();
}

export function type_id<T, BASE extends HasTypeId>(base:typeof HasTypeId&{new():BASE}, type:Type<T>):typeid_t<BASE> {
    const map = base[typeidmap];
    const typeid = map.get(type);
    if (typeid instanceof typeid_t) {
        return typeid;
    }

    const counter = base[counterWrapper];
    if (counter.value === 0) throw Error('Cannot make type_id before launch');
    if (typeid != null) {
        const newid = makefunc.js(typeid, typeid_t, {structureReturn: true})();
        map.set(type, newid);
        return newid;
    } else {
        const newid = new typeid_t<BASE>(true);
        newid.id = counter.value++;
        map.set(type, newid);
        return newid;
    }
}

export namespace type_id {
    export function pdbimport(base:typeof HasTypeId, types:Type<any>[]):void {
        const baseSymbol = base.symbol || base.name;
        const symbols = types.map(v=>templateName('type_id', baseSymbol, v.symbol || v.name));
        const counter = templateName('typeid_t', baseSymbol)+'::count';
        symbols.push(counter);

        const addrs = pdb.getList(pdb.coreCachePath, {}, symbols, false, UNDNAME_NAME_ONLY);

        symbols.pop();

        base[counterWrapper] = addrs[counter].as(IdCounter);

        const map = base[typeidmap];
        for (let i=0;i<symbols.length;i++) {
            const addr = addrs[symbols[i]];
            if (addr == null) continue;
            map.set(types[i], addr);
        }
    }
}
