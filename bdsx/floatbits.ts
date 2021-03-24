import { bin } from "./bin";


const i32buf = new Int32Array(2);
const f32buf = new Float32Array(i32buf.buffer);
const f64buf = new Float64Array(i32buf.buffer);

export namespace floatbits {
    export function f32_to_bits(n:number):number{
        f32buf[0] = n;
        return i32buf[0];
    }
    export function bits_to_f32(n:number):number{
        i32buf[0] = n;
        return f32buf[0];
    }
    export function bits_to_f64(low:number, high:number):number{
        i32buf[0] = low;
        i32buf[1] = high;
        return f64buf[0];
    }
    export function bin_to_f64(b:string):number{
        i32buf[0] = b.charCodeAt(0) | (b.charCodeAt(1) << 16);
        i32buf[1] = b.charCodeAt(2) | (b.charCodeAt(3) << 16);
        return f64buf[0];
    }
    export function f64_to_bits(n:number):[number, number]{
        f64buf[0] = n;
        return [i32buf[0], i32buf[1]];
    }
    export function f64_to_bin(n:number):string{
        f64buf[0] = n;
        return bin.make64(i32buf[0], i32buf[1]);
    }
}
