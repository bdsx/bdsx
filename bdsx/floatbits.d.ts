export declare namespace floatbits {
    function f32_to_bits(n: number): number;
    function bits_to_f32(n: number): number;
    function bits_to_f64(low: number, high: number): number;
    function bin_to_f64(b: string): number;
    function f64_to_bits(n: number): [number, number];
    function f64_to_bin(n: number): string;
}
