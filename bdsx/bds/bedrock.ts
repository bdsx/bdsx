import { mangle } from "../mangle";
import { AbstractClass, nativeClass, NativeClass, NativeClassType, nativeField } from "../nativeclass";
import { uint8_t } from "../nativetype";
import { Wrapper } from "../pointer";
import { CxxSharedPtr } from "../sharedpointer";
import { Singleton } from "../singleton";

export namespace Bedrock {
    export type NonOwnerPointerType<T extends NativeClass> = NativeClassType<NonOwnerPointer<T>>;

    @nativeClass()
    export class NonOwnerPointer<T extends NativeClass> extends NativeClass {
        /**
         * @deprecated CAUTION, it's not working properly
         */
        sharedptr: CxxSharedPtr<Wrapper<T>>;

        /**
         * @deprecated CAUTION, it's not working properly
         */
        get(): T | null {
            const p = this.sharedptr.p;
            return p && p.value;
        }

        assign(value: NonOwnerPointer<T>): void {
            this.sharedptr.assign(value.sharedptr);
        }

        dispose(): void {
            return this.sharedptr.dispose();
        }

        static make<T extends NativeClass>(v: new () => T): NonOwnerPointerType<T> {
            const clazz = v as NativeClassType<T>;
            return Singleton.newInstance(NonOwnerPointer, clazz, () => {
                class Class extends NonOwnerPointer<T> {}
                Class.define({
                    sharedptr: CxxSharedPtr.make(Wrapper.make(clazz.ref())),
                });
                Object.defineProperties(Class, {
                    name: { value: `NonOwnerPointer<${clazz.name}>` },
                    symbol: {
                        value: mangle.templateClass("NonOwnerPointer", clazz),
                    },
                });
                return Class;
            });
        }
    }

    /**
     * stub implement of Bedrock::Result<void, std::error_code>
     */
    @nativeClass(0x48, 8)
    export class VoidErrorCodeResult extends AbstractClass {}
}
