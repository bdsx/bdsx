import { VoidPointer } from "../core";
import { nativeClass, NativeClass, NativeClassType, nativeField } from "../nativeclass";
import { bool_t, NativeType, Type } from "../nativetype";
import { Singleton } from "../singleton";

export interface CxxOptionalType<T> extends NativeClassType<CxxOptional<T>> {
    new(address?:VoidPointer|boolean):CxxOptional<T>;
    componentType:Type<T>;
}

export abstract class CxxOptional<T> extends NativeClass {
    abstract value():T|undefined;
    abstract setValue(value:T):void;
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
                setValue(value:T):void {
                    this.initValue();
                    type[NativeType.setter](this as any, value);
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
            return OptionalImpl;
        });
    }
}

