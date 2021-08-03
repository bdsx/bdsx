
// Low Level - define C++ class or structure

import { NativePointer } from "bdsx/core";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { int16_t, int32_t, int8_t, NativeType } from "bdsx/nativetype";

/**
 * All packets in packets.ts are NativeClass also
 */

@nativeClass()
class SampleStructure extends NativeClass {
    @nativeField(int32_t)
    a:int32_t;
    @nativeField(int16_t)
    b:int16_t;
    @nativeField(int8_t)
    c:int8_t;
    @nativeField(int32_t)
    d:int32_t;
    @nativeField(int32_t, null, 1)
    bitfield1:int32_t;
    @nativeField(int32_t, null, 1)
    bitfield2:int32_t;
    @nativeField(int32_t, null, 30)
    bitfield3:int32_t;
}
/**
 * struct SampleStructure
 * {
 *     int32_t a;
 *     int16_t b;
 *     int8_t c;
 *     int32_t d;
 *     int8_t bitfield1:1;
 *     int8_t bitfield2:1;
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

// int8_t/uint8_t will be truncated within 8bits
obj.c = 0xffffff01;
console.assert(obj.c === 1 && obj.c === pointer.getInt8(6));

console.assert(SampleStructure.offsetOf('a') === 0); // the a offset is 0
console.assert(SampleStructure.offsetOf('b') === 4); // the b offset is 4
console.assert(SampleStructure.offsetOf('d') === 8); // the d offset is 8 by C/C++ field alignments

pointer.setInt32(SampleStructure.offsetOf('bitfield1'), 0);

obj.bitfield1 = 1;
obj.bitfield2 = 0xfffffffe;
console.assert(obj.bitfield2 === 0); // all is masked without the first bit
obj.bitfield3 = 1;
const bitfield = pointer.getInt32(SampleStructure.offsetOf('bitfield1'));
console.assert(bitfield === 0b101); // bitfield = 101 (2)

// override the copy constructor
@nativeClass()
class Class extends NativeClass {
    @nativeField(int32_t)
    value:int32_t;
    [NativeType.ctor_copy](from:Class):void {
        this.value = from.value+1;
    }
}

const original = new Class(true);
original.value = 10;
const copied = Class.construct(original); // call the copy constructor
console.assert(copied.value === 11);
