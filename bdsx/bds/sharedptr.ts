import { capi } from "../capi";
import { mangle } from "../mangle";
import { nativeClass, NativeClass, NativeClassType, nativeField, vectorDeletingDestructor } from "../nativeclass";
import { int32_t, NativeType } from "../nativetype";
import { Singleton } from "../singleton";

class PtrBase<T extends NativeClass> extends NativeClass {
    p:T|null;
    useRef:number;
    weakRef:number;

    [NativeType.ctor]():void {
        this.useRef = 1;
        this.weakRef = 1;
    }

    addRef():void {
        this.interlockedIncrement32(0x8);
    }
    addRefWeak():void {
        this.interlockedIncrement32(0xc);
    }
    release():void {
        const p = this.p;
        if (this.interlockedDecrement32(0x8) === 0) {
            if (p !== null) {
                this.p = null;
                vectorDeletingDestructor.deleteIt.call(p);
            }
            this.releaseWeak();
        }
    }
    releaseWeak():void {
        if (this.interlockedDecrement32(0xc) === 0) {
            if (this.p === null) {
                capi.free(this);
            }
        }
    }

    static make<T extends NativeClass>(type:new()=>T):NativeClassType<PtrBase<T>> {
        const cls = type as NativeClassType<T>;

        return Singleton.newInstance(PtrBase, cls, ()=>{
            @nativeClass()
            class SharedPtrBaseImpl extends PtrBase<T> {
                @nativeField(cls.ref())
                p:T|null;
                @nativeField(int32_t)
                useRef:number;
                @nativeField(int32_t)
                weakRef:number;
            }
            return SharedPtrBaseImpl as NativeClassType<PtrBase<T>>;
        });
    }
}

export class SharedPtr<T extends NativeClass> extends NativeClass {
    ref:PtrBase<T>|null;

    [NativeType.dtor]():void {
        const p = this.ref;
        if (p === null) return;
        p.release();
    }

    value():T|null {
        const ref = this.ref;
        if (ref === null) return null;
        return ref.p;
    }

    addRef():void {
        const p = this.ref;
        if (p === null) return;
        p.addRef();
    }

    dispose():void {
        const p = this.ref;
        if (p === null) return;
        this.ref = null;
        p.release();
    }

    static make<T extends NativeClass>(cls:new()=>T):NativeClassType<SharedPtr<T>> {
        const clazz = cls as NativeClassType<T>;
        return Singleton.newInstance(SharedPtr, cls, ()=>{
            const Base = PtrBase.make(clazz);
            @nativeClass()
            class Clazz extends SharedPtr<NativeClass> {
                @nativeField(Base.ref())
                ref:PtrBase<T>|null;
            }
            Object.defineProperties(Clazz, {
                name: { value: `SharedPtr<${clazz.name}>` },
                symbol: { value: mangle.templateClass('SharedPtr', clazz) },
            });
            return Clazz as any;
        });
    }
}

export class WeakPtr<T extends NativeClass> extends NativeClass {
    ref:PtrBase<T>|null;

    [NativeType.dtor]():void {
        const p = this.ref;
        if (p === null) return;
        p.releaseWeak();
    }

    value():T|null {
        const ref = this.ref;
        if (ref === null) return null;
        return ref.p;
    }

    addRef():void {
        const p = this.ref;
        if (p === null) return;
        p.addRefWeak();
    }
    dispose():void {
        const p = this.ref;
        if (p === null) return;
        this.ref = null;
        p.releaseWeak();
    }

    static make<T extends NativeClass>(cls:new()=>T):NativeClassType<WeakPtr<T>> {
        const clazz = cls as NativeClassType<T>;
        return Singleton.newInstance(WeakPtr, cls, ()=>{
            const Base = PtrBase.make(clazz);
            @nativeClass()
            class Clazz extends WeakPtr<NativeClass> {
                @nativeField(Base.ref())
                ref:PtrBase<T>|null;
            }
            Object.defineProperties(Clazz, {
                name: { value: `WeakPtr<${clazz.name}>` },
                symbol: { value: mangle.templateClass('WeakPtr', clazz) },
            });
            return Clazz as any;
        });
    }
}
