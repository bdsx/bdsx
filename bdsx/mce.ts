import { bin } from "./bin";
import { capi } from "./capi";
import { abstract } from "./common";
import { StaticPointer, VoidPointer } from "./core";
import { AbstractClass, nativeClass, NativeClass, nativeField, NativeStruct } from "./nativeclass";
import { bin128_t, bin64_t, float32_t, NativeType, uint16_t, uint32_t, uint64_as_float_t, uint8_t, void_t } from "./nativetype";
import { Wrapper } from "./pointer";
import { procHacker } from "./prochacker";

export namespace mce {
    export const UUID = bin128_t.extends({
        v1(uuid:UUID):uint32_t {
            return uuid.charCodeAt(0) | (uuid.charCodeAt(1)<<16);
        },
        v2(uuid:UUID):uint16_t {
            return uuid.charCodeAt(2);
        },
        v3(uuid:UUID):uint16_t {
            return uuid.charCodeAt(3);
        },
        v4(uuid:UUID):bin64_t {
            return uuid.substr(4);
        },
        generate():UUID {
            return generateUUID().value;
        },
        toString(uuid:UUID) {
            const hex = bin.reversedHex(uuid);
            const u4 = hex.substr(0, 4);
            const u5 = hex.substr(4, 12);

            const u1 = hex.substr(16, 8);
            const u2 = hex.substr(24, 4);
            const u3 = hex.substr(28, 4);
            return `${u1}-${u2}-${u3}-${u4}-${u5}`;
        },
    }, 'UUID');
    export type UUID = string;
    export const UUIDWrapper = Wrapper.make(mce.UUID);

    @nativeClass()
    export class Color extends NativeStruct {
        @nativeField(float32_t)
        r:float32_t;
        @nativeField(float32_t)
        g:float32_t;
        @nativeField(float32_t)
        b:float32_t;
        @nativeField(float32_t)
        a:float32_t;
    }

    // I don't think there are any circumstances you would need to construct or destruct this
    // You would construct a SerializedSkin instance instead.
    @nativeClass()
    export class Blob extends AbstractClass {
        @nativeField(VoidPointer)
        deleter:VoidPointer;
        @nativeField(StaticPointer)
        bytes:StaticPointer;
        @nativeField(uint64_as_float_t)
        size:uint64_as_float_t;

        [NativeType.ctor]():void {
            abstract();
        }
        [NativeType.dtor]():void {
            abstract();
        }

        toArray():number[] {
            const bytes = [];
            const size = this.size;
            const ptr = this.getPointer(8); // get as NativePointer
            for (let i = 0; i < size; i++) {
                bytes.push(ptr.readUint8());
            }
            return bytes;
        }

        setFromArray(bytes:number[]):void {
            this.destruct(); // it uses the deleter to deleting bytes
            this.construct(); // it initializes with the default deleter

            const size = bytes.length;
            this.size = size;
            const ptr = capi.malloc(size);
            this.bytes = ptr; // the pointer will be copied because it's the primitive type in the C level
            for (const n of bytes) {
                ptr.writeUint8(n);
            }
        }

        toBuffer():Uint8Array {
            return this.bytes.getBuffer(this.size);
        }

        setFromBuffer(bytes:Uint8Array):void {
            capi.free(this.bytes);
            this.size = bytes.length;
            const ptr = capi.malloc(bytes.length);
            this.bytes = ptr;
            ptr.setBuffer(bytes);
        }
    }

    export enum ImageFormat {
        Unknown,
        RGB8Unorm,
        RGBA8Unorm,
    }

    export enum ImageUsage {
        Unknown,
        sRGB,
        Data,
    }

    @nativeClass()
    export class Image extends NativeClass {
        @nativeField(uint32_t)
        imageFormat:ImageFormat;
        @nativeField(uint32_t)
        width:uint32_t;
        @nativeField(uint32_t)
        height:uint32_t;
        @nativeField(uint8_t)
        usage:ImageUsage;
        @nativeField(mce.Blob, 0x10)
        blob:mce.Blob;
    }
}

mce.Blob.prototype[NativeType.ctor] = procHacker.js('??0Blob@mce@@QEAA@XZ', void_t, {this:mce.Blob});
mce.Blob.prototype[NativeType.dtor] = procHacker.js('??1Blob@mce@@QEAA@XZ', void_t, {this:mce.Blob});
const generateUUID = procHacker.js("?generateUUID@Random@Crypto@@YA?AVUUID@mce@@XZ", mce.UUIDWrapper, {structureReturn: true});
