"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PseudoRandom = void 0;
/**
 * imitate VC srand/rand
 */
class PseudoRandom {
    constructor(n) {
        this.n = n;
    }
    srand(n) {
        this.n = n;
    }
    rand() {
        this.n = ((this.n * 214013) | 0 + 2531011) | 0;
        return (this.n >> 16) & PseudoRandom.RAND_MAX;
    }
}
exports.PseudoRandom = PseudoRandom;
PseudoRandom.RAND_MAX = 0x7fff;
//# sourceMappingURL=pseudorandom.js.map