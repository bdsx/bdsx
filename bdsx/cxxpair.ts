import { abstract } from "./common";
import { VoidPointer } from "./core";
import { combineObjectKey } from "./keycombine";
import { NativeClass, NativeClassType } from "./nativeclass";
import { Type } from "./nativetype";
import { Singleton } from "./singleton";
import { templateName } from "./templatename";
import { isBaseOf } from "./util";

export interface CxxPairType<A, B> extends NativeClassType<CxxPair<A, B>>
{
    new(address?:VoidPointer|boolean):CxxPair<A, B>;
    readonly firstType:Type<any>;
    readonly secondType:Type<any>;
}

function setFirstWithClass<T1, T2>(this:CxxPair<T1, T2>, v:T1):void {
    const cls = (this.first as any) as NativeClass;
    cls.destruct();
    cls.construct(v as any);
}

function setSecondWithClass<T1, T2>(this:CxxPair<T1, T2>, v:T2):void {
    const cls = (this.second as any) as NativeClass;
    cls.destruct();
    cls.construct(v as any);
}

function setFirstWithPrimitive<T1, T2>(this:CxxPair<T1, T2>, v:T1):void {
    this.first = v;
}

function setSecondWithPrimitive<T1, T2>(this:CxxPair<T1, T2>, v:T2):void {
    this.second = v;
}

/**
 * std::pair
 */
export abstract class CxxPair<T1, T2> extends NativeClass {
    first:T1;
    second:T2;
    readonly firstType:Type<any>;
    readonly secondType:Type<any>;
    static readonly firstType:Type<any>;
    static readonly secondType:Type<any>;

    abstract setFirst(first:T1):void;
    abstract setSecond(second:T2):void;

    static make<T1, T2>(firstType:Type<T1>, secondType:Type<T2>):CxxPairType<T1, T2> {
        const key = combineObjectKey(firstType, secondType);
        return Singleton.newInstance(CxxPair, key, ()=>{
            class CxxPairImpl extends CxxPair<T1, T2> {
                firstType:Type<T1>;
                secondType:Type<T2>;
                static readonly firstType:Type<T1> = firstType;
                static readonly secondType:Type<T2> = secondType;
                setFirst(first:T1):void {
                    abstract();
                }
                setSecond(second:T2):void {
                    abstract();
                }
            }
            CxxPairImpl.prototype.setFirst = isBaseOf(firstType, NativeClass) ? setFirstWithClass : setFirstWithPrimitive;
            CxxPairImpl.prototype.setSecond = isBaseOf(secondType, NativeClass) ? setSecondWithClass : setSecondWithPrimitive;
            Object.defineProperty(CxxPairImpl, 'name', {value:getPairName(firstType, secondType)});
            CxxPairImpl.prototype.firstType = firstType;
            CxxPairImpl.prototype.secondType = secondType;
            CxxPairImpl.define({ first: firstType, second: secondType } as any);
            return CxxPairImpl;
        });
    }
}

function getPairName(type1:Type<any>, type2:Type<any>):string {
    return templateName('std::pair', type1.name, type2.name);
}
