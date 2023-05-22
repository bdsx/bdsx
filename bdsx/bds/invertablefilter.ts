import { abstract } from "../common";
import { VoidPointer } from "../core";
import { mangle } from "../mangle";
import { NativeClass, NativeClassType } from "../nativeclass";
import { Type, bool_t } from "../nativetype";
import { Singleton } from "../singleton";
import { isBaseOf } from "../util";

export interface InvertableFilterType<T> extends NativeClassType<InvertableFilter<T>> {
    new (address?: VoidPointer | boolean): InvertableFilter<T>;
    readonly type: Type<any>;
}

function setValueWithClass<T>(this: InvertableFilter<T>, v: T): void {
    const cls = this.value as any as NativeClass;
    cls.destruct();
    cls.construct(v as any);
}

function setValueWithPrimitive<T>(this: InvertableFilter<T>, v: T): void {
    this.value = v;
}

export abstract class InvertableFilter<T> extends NativeClass {
    value: T;
    inverted: boolean;
    readonly type: Type<any>;
    static readonly type: Type<any>;

    abstract setValue(value: T): void;

    static make<T>(type: Type<T>): InvertableFilterType<T> {
        return Singleton.newInstance(InvertableFilter, type, () => {
            class InvertableFilterImpl extends InvertableFilter<T> {
                type: Type<T>;
                static readonly type: Type<T> = type;
                setValue(value: T): void {
                    abstract();
                }
            }
            InvertableFilterImpl.prototype.setValue = isBaseOf(type, NativeClass) ? setValueWithClass : setValueWithPrimitive;
            InvertableFilterImpl.prototype.type = type;
            InvertableFilterImpl.define({ value: type, inverted: bool_t } as any);
            Object.defineProperties(InvertableFilterImpl, {
                name: {
                    value: `InvertableFilter<${type.name}>`,
                },
                symbol: { value: mangle.templateClass("InvertableFilter", type.symbol) },
            });
            return InvertableFilterImpl;
        });
    }
}
