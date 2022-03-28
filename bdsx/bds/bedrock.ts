import { nativeClass, NativeClass, NativeClassType } from "../nativeclass";
import { Wrapper } from "../pointer";
import { CxxSharedPtr } from "../sharedpointer";
import { Singleton } from "../singleton";
import { templateName } from "../templatename";

export namespace Bedrock {
    export type NonOwnerPointerType<T extends NativeClass> = NativeClassType<NonOwnerPointer<T>>;

    @nativeClass()
    export class NonOwnerPointer<T extends NativeClass> extends NativeClass {
        sharedptr:CxxSharedPtr<Wrapper<T>>;

        get():T|null {
            const p = this.sharedptr.p;
            return p && p.value;
        }

        dispose():void {
            return this.sharedptr.dispose();
        }

        static make<T extends NativeClass>(v:new()=>T):NonOwnerPointerType<T> {
            const clazz = v as NativeClassType<T>;
            return Singleton.newInstance(NonOwnerPointer, clazz, ()=>{
                class Class extends NonOwnerPointer<T> {
                }
                Class.define({
                    sharedptr: CxxSharedPtr.make(Wrapper.make(clazz.ref())),
                });
                Object.defineProperty(Class, 'name', {value: templateName('NonOwnerPointer', v.name)});
                return Class;
            });
        }
    }
}
