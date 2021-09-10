import { TsFile, TsImportItem } from "./tsimport";
import { tswNames } from "./tswnames";
import { tsw } from "./tswriter";


export namespace wrapperUtil {
    export function isWrappedWith(wrapper:tsw.ItemPair, item:tsw.ItemPair):item is ItemPair {
        if ((item.type === null || (item.type instanceof tsw.TemplateType && item.type.type === wrapper.type)) &&
            (item.value === null || (item.value instanceof tsw.DotCall && item.value.item === wrapper.value && item.value.property === tswNames.make))) {
            return true;
        }
        return false;
    }
    export function wrapWith(wrapper:tsw.ItemPair, item:tsw.ItemPair):ItemPair {
        const out = new ItemPair;
        if (item.value !== null) {
            out.value = new tsw.DotCall(wrapper.value, tswNames.make, [item.value]);
        }
        if (item.type !== null) {
            out.type = new tsw.TemplateType(wrapper.type, [item.type]);
        }
        return out;
    }
    export function unwrap(item:ItemPair):tsw.ItemPair {
        return new tsw.ItemPair(item.value && item.value.params[0], item.type && item.type.params[0]);
    }

    export class ItemPair extends tsw.ItemPair {
        value:tsw.DotCall;
        type:tsw.TemplateType;
    }

    export class WrapperPair extends tsw.NamePair {
        constructor(name:string) {
            super(new tsw.Name(name), new tsw.TypeName(name));
        }

        wrap(pair:tsw.ItemPair):ItemPair {
            return wrapWith(this, pair);
        }

        is(pair:tsw.ItemPair):pair is ItemPair {
            return isWrappedWith(this, pair);
        }
    }
    export class TypeWrapper {
        readonly type:tsw.TypeName;
        constructor(name:string) {
            this.type = new tsw.TypeName(name);
        }

        wrap(pair:tsw.ItemPair):tsw.ItemPair {
            const out = new tsw.ItemPair;
            if (pair.value !== null) out.value = pair.value;
            if (pair.type !== null) out.type = new tsw.TemplateType(this.type, [pair.type]);
            return out;
        }
        unwrap(pair:tsw.ItemPair&{type:tsw.TemplateType}):tsw.ItemPair {
            const out = new tsw.ItemPair;
            if (pair.value !== null) out.value = pair.value;
            if (pair.type !== null) out.type = pair.type.params[0];
            return out;
        }
        is(pair:tsw.ItemPair):pair is tsw.ItemPair&{type:tsw.TemplateType} {
            if (pair.type instanceof tsw.TemplateType && pair.type.type === this.type) {
                return true;
            }
            return false;
        }
    }
    export class RefWrapper {
        readonly value:tsw.NameProperty;
        constructor(name:string) {
            this.value = new tsw.NameProperty(name);
        }

        wrap(pair:tsw.ItemPair):tsw.ItemPair {
            const out = new tsw.ItemPair;
            if (pair.value !== null) out.value = new tsw.DotCall(pair.value, this.value, []);
            if (pair.type !== null) out.type = pair.type;
            return out;
        }
        unwrap(pair:tsw.ItemPair&{value:tsw.DotCall}):tsw.ItemPair {
            const out = new tsw.ItemPair;
            if (pair.value !== null) out.value = pair.value.item;
            if (pair.type !== null) out.type = pair.type;
            return out;
        }
        is(pair:tsw.ItemPair):pair is tsw.ItemPair&{value:tsw.DotCall} {
            if (pair.value instanceof tsw.DotCall && pair.value.property === this.value) {
                return true;
            }
            return false;
        }
    }
    export class ImportItem extends TsImportItem {
        constructor(
            base:TsFile,
            from:TsFile,
            name:string) {
            super(base, from, name);
        }

        wrap(pair:tsw.ItemPair):tsw.ItemPair {
            const This = this.import(pair.getKind());
            return wrapWith(This, pair);
        }

        is(pair:tsw.ItemPair):pair is ItemPair {
            const This = this.import(pair.getKind());
            return isWrappedWith(This, pair);
        }
    }
}
