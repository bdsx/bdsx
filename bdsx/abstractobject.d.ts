/**
 * @param message error message when accessing
 */
export declare function createAbstractObject(message: string): any;
export declare namespace createAbstractObject {
    function setAbstractProperty<T>(o: T, p: keyof T): void;
    function setAbstractProperties<T>(o: T, ...properties: (keyof T)[]): void;
}
