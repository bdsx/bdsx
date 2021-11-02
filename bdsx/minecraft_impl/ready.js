"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.minecraftTsReady = void 0;
let callbacks = [];
function minecraftTsReady(callback) {
    if (callbacks === null) {
        callback();
        return;
    }
    callbacks.push(callback);
}
exports.minecraftTsReady = minecraftTsReady;
(function (minecraftTsReady) {
    function isReady() {
        return callbacks === null;
    }
    minecraftTsReady.isReady = isReady;
    /**
     * @internal
     */
    function resolve() {
        if (callbacks === null)
            throw Error('minecraftTsReady is already resolved');
        const cbs = callbacks;
        callbacks = null;
        for (const callback of cbs) {
            callback();
        }
    }
    minecraftTsReady.resolve = resolve;
})(minecraftTsReady = exports.minecraftTsReady || (exports.minecraftTsReady = {}));
//# sourceMappingURL=ready.js.map