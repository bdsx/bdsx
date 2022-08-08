
/**
 * imitate VC srand/rand
 */
export class PseudoRandom {
    public static readonly RAND_MAX = 0x7fff;

    constructor(private n:number) {
    }

    srand(n:number):void {
        this.n = n;
    }

    rand():number {
        this.n = ((this.n * 214013)|0 + 2531011)|0;
        return (this.n >> 16) & PseudoRandom.RAND_MAX;
    }
}
