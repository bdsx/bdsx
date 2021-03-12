
// Low Level - define C++ class or structure

import { NativePointer } from "bdsx";
import { nativeField, defineNative, NativeClass } from "bdsx/nativeclass";
import { int16_t, int32_t, int8_t } from "bdsx/nativetype";

/**
 * All packets in packets.ts are NativeClass also
 */

@defineNative()
class SampleStructure extends NativeClass {
    @nativeField(int32_t)
    a:int32_t;
    @nativeField(int16_t)
    b:int16_t;
    @nativeField(int8_t)
    c:int8_t;
    @nativeField(int32_t)
    d:int32_t;
}
/**
 * struct SampleStructure
 * {
 *     int32_t a;
 *     int16_t b;
 *     int8_t c;
 *     int32_t d;
 * };
 */

/**
 * it allocates itself if it's received 'true'
 */
const obj = new SampleStructure(true);
const pointer = obj.as(NativePointer);

// full bits is -1
obj.a = 0xffffffff;
console.assert(obj.a === -1);

// &obj.a == (address of obj + 0);
console.assert(obj.a === pointer.getInt32(0));

// int8_t/uint8_t will be truncated without 8bits
obj.c = 0xffffff01;
console.assert(obj.c === 1 && obj.c === pointer.getInt8(6));

// &obj.d == (address of obj + 8);
// C/C++ field alignments
obj.d = 123;
console.assert(obj.d === pointer.getInt32(8));
