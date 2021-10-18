"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minecraftTsReady = void 0;
let resolver = null;
var minecraftTsReady;
(function (minecraftTsReady) {
    minecraftTsReady.promise = new Promise(resolve => {
        resolver = resolve;
    });
    function resolve() {
        if (resolver === null)
            throw Error('minecraftTsReady is already resolved');
        const r = resolver;
        resolver = null;
        r();
    }
    minecraftTsReady.resolve = resolve;
})(minecraftTsReady = exports.minecraftTsReady || (exports.minecraftTsReady = {}));
//# sourceMappingURL=ready.js.map