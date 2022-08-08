
/**
 * @param message error message when accessing
 */
export function createAbstractObject(message:string):any {
    function _():never { throw Error(message); }
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
