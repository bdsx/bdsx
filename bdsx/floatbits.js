"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.floatbits = void 0;
const bin_1 = require("./bin");
const i32buf = new Int32Array(2);
const f32buf = new Float32Array(i32buf.buffer);
const f64buf = new Float64Array(i32buf.buffer);
var floatbits;
(function (floatbits) {
    function f32_to_bits(n) {
        f32buf[0] = n;
        return i32buf[0];
    }
    floatbits.f32_to_bits = f32_to_bits;
    function bits_to_f32(n) {
        i32buf[0] = n;
        return f32buf[0];
    }
    floatbits.bits_to_f32 = bits_to_f32;
    function bits_to_f64(low, high) {
        i32buf[0] = low;
        i32buf[1] = high;
        return f64buf[0];
    }
    floatbits.bits_to_f64 = bits_to_f64;
    function bin_to_f64(b) {
        i32buf[0] = b.charCodeAt(0) | (b.charCodeAt(1) << 16);
        i32buf[1] = b.charCodeAt(2) | (b.charCodeAt(3) << 16);
        return f64buf[0];
    }
    floatbits.bin_to_f64 = bin_to_f64;
    function f64_to_bits(n) {
        f64buf[0] = n;
        return [i32buf[0], i32buf[1]];
    }
    floatbits.f64_to_bits = f64_to_bits;
    function f64_to_bin(n) {
        f64buf[0] = n;
        return bin_1.bin.make64(i32buf[0], i32buf[1]);
    }
    floatbits.f64_to_bin = f64_to_bin;
})(floatbits = exports.floatbits || (exports.floatbits = {}));
//# sourceMappingURL=floatbits.js.map