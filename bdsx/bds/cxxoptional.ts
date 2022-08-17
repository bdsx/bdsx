import { VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { mangle } from "../mangle";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "../nativeclass";
import { bool_t, NativeType, Type } from "../nativetype";
import { Singleton } from "../singleton";

type NullPtrable<T> = (T extends VoidPointer ? null : never)|T;

export interface CxxOptionalType<T> extends NativeClassType<CxxOptional<T>> {
    new(address?:VoidPointer|boolean):CxxOptional<T>;
    componentType:Type<T>;
}

function getOptionalSymbol(type:Type<any>):string {
    return mangle.templateClass(['std', 'optional'], type);
}

export abstract class CxxOptional<T> extends NativeClass {
    abstract value():T|undefined;
    abstract setValue(value:NullPtrable<T>|undefined):void;
    abstract initValue():void;
    abstract hasValue():boolean;
    abstract reset():void;

    static make<T>(type:Type<T>):CxxOptionalType<T> {
        return Singleton.newInstance(CxxOptional, type, ()=>{
            @nativeClass()
            class OptionalImpl extends CxxOptional<T> {
                @nativeField(type, {noInitialize: true})
                _value:T;
                @nativeField(bool_t)
                _hasValue:bool_t;
                static readonly componentType = type;

                [NativeType.ctor]():void {
                    this._hasValue = false;
                }
                [NativeType.ctor_copy](value:OptionalImpl):void {
                    const hasValue = value._hasValue;
                    this._hasValue = hasValue;
                    if (hasValue) type[NativeType.ctor_copy](this as any, value as any);
                }
                [NativeType.ctor_move](value:OptionalImpl):void {
                    const hasValue = value._hasValue;
                    this._hasValue = hasValue;
                    if (hasValue) type[NativeType.ctor_move](this as any, value as any);
                }
                [NativeType.dtor]():void {
                    if (this._hasValue) {
                        type[NativeType.dtor](this as any);
                    }
                }

                value():T|undefined {
                    return this._hasValue ? this._value : undefined;
                }
                setValue(value:NullPtrable<T>|undefined):void {
                    if (value === undefined) {
                        this.reset();
                    } else {
                        this.initValue();
                        this._value = value!;
                    }
                }
                initValue():void {
                    if (!this._hasValue) {
                        this._hasValue = true;
                        type[NativeType.ctor](this as any);
                    }
                }
                hasValue():boolean {
                    return this._hasValue;
                }
                reset():void {
                    if (this._hasValue) {
                        type[NativeType.dtor](this as any);
                        this._hasValue = false;
                    }
                }
            }
            Object.defineProperties(OptionalImpl, {
                name: { value:`CxxOptional<${type.name}>` },
                symbol: {value: getOptionalSymbol(type) },
            });
            return OptionalImpl;
        });
    }
}

export class CxxOptionalToUndefUnion<T> extends NativeType<T|undefined> {
    public readonly type:CxxOptionalType<T>;

    private constructor(public readonly compType:Type<T>) {
        const optionalType = CxxOptional.make(compType);
        const hasValueOffset = optionalType.offsetOf('_hasValue' as any);

        super(getOptionalSymbol(compType), `CxxOptionalToJsValue<${compType.name}>`,
            optionalType[NativeType.size], optionalType[NativeType.align],
            v=>v === undefined || compType.isTypeOf(v),
            undefined,
            (ptr, offset)=>ptr.addAs(this.type, offset).value(),
            (ptr, v, offset)=>ptr.addAs(this.type, offset).setValue(v),
            (stackptr, offset)=>stackptr.getPointerAs(this.type, offset).value(),
            undefined,
            ptr=>ptr.setBoolean(false, hasValueOffset),
            ptr=>{
                if (ptr.getBoolean(hasValueOffset)) {
                    compType[NativeType.dtor](ptr);
                }
            },
            (to, from)=>to.as(this.type)[NativeType.ctor_copy](from.as(this.type)),
            (to, from)=>{
                const hasValue = from.getBoolean(hasValueOffset);
                to.setBoolean(hasValue, hasValueOffset);
                if (hasValue) {
                    from.setBoolean(false, hasValueOffset);
                    compType[NativeType.ctor_move](to, from);
                    compType[NativeType.dtor](from);
                }
            },
        );
        this.type = optionalType;
        this[makefunc.paramHasSpace] = true;
    }

    static make<T>(compType:Type<T>):CxxOptionalToUndefUnion<T> {
        return Singleton.newInstance<CxxOptionalToUndefUnion<T>>(CxxOptionalToUndefUnion, compType, ()=>new CxxOptionalToUndefUnion<T>(compType));
    }
}
