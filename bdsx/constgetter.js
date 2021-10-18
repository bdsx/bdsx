"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineConstGetter = void 0;
/**
 * it defines the getter property.
 * and stores and freezes the value after calling the getter
 */
function defineConstGetter(base, key, getter) {
    Object.defineProperty(base, key, {
        get() {
            const value = getter();
            Object.defineProperty(base, key, { value });
        },
        configurable: true
    });
}
exports.defineConstGetter = defineConstGetter;
//# sourceMappingURL=constgetter.js.map