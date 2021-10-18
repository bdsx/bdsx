"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAbstractObject = void 0;
/**
 * @param message error message when accessing
 */
function createAbstractObject(message) {
    function _() { throw Error(message); }
    return new Proxy({}, {
        get: _,
        set: _,
        ownKeys: _,
        getPrototypeOf: _,
        defineProperty: _,
        isExtensible: _,
        preventExtensions: _,
        setPrototypeOf: _,
        has: _,
        deleteProperty: _,
        getOwnPropertyDescriptor: _,
    });
}
exports.createAbstractObject = createAbstractObject;
(function (createAbstractObject) {
    function setAbstractProperty(o, p) {
        Object.defineProperty(o, p, {
            get() {
                throw Error(`'${p} is not ready'`);
            },
            set(value) {
                Object.defineProperty(o, p, { value });
            },
            configurable: true
        });
    }
    createAbstractObject.setAbstractProperty = setAbstractProperty;
    function setAbstractProperties(o, ...properties) {
        const descmap = {};
        for (const prop of properties) {
            descmap[prop] = {
                get() {
                    throw Error(`'${prop} is not ready'`);
                },
                set(value) {
                    Object.defineProperty(o, prop, { value });
                },
                configurable: true
            };
        }
        Object.defineProperties(o, descmap);
    }
    createAbstractObject.setAbstractProperties = setAbstractProperties;
})(createAbstractObject = exports.createAbstractObject || (exports.createAbstractObject = {}));
//# sourceMappingURL=abstractobject.js.map