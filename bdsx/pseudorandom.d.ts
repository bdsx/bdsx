/**
 * imitate VC srand/rand
 */
export declare class PseudoRandom {
    private n;
    static readonly RAND_MAX = 32767;
    constructor(n: number);
    srand(n: number): void;
    rand(): number;
}
