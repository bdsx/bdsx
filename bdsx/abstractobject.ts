
/**
 * @param message error message when accessing
 */
export function createAbstractObject(message:string):any {
    function error():never { throw Error(message); }
    return new Proxy({}, {
        get: error,
        set: error,
        ownKeys: error,
        getPrototypeOf: error,
        defineProperty: error,
        isExtensible: error,
        preventExtensions: error,
        setPrototypeOf: error,
        has: error,
        deleteProperty: error,
        getOwnPropertyDescriptor: error,
    });
}
