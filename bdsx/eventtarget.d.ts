import { AnyFunction, CANCEL } from './common';
declare type FirstParameter<T extends AnyFunction> = T extends (...args: infer P) => any ? 0 extends P['length'] ? void : P[0] : void;
export declare class Event<T extends (...args: any[]) => Event.ReturnType> {
    private readonly listeners;
    private installer;
    private uninstaller;
    /**
     * call the installer when first listener registered.
     */
    setInstaller(installer: () => void, uninstaller?: (() => void) | null): void;
    /**
     * pipe two events
     * it uses setInstaller
     */
    pipe<T2 extends (...args: any[]) => Event.ReturnType>(target: Event<T2>, piper: (this: this, ...args: Parameters<T2>) => ReturnType<T2>): void;
    isEmpty(): boolean;
    /**
     * cancel event if it returns non-undefined value
     */
    on(listener: T): void;
    once(listener: T): void;
    promise(): Promise<FirstParameter<T>>;
    onFirst(listener: T): void;
    onLast(listener: T): void;
    onBefore(listener: T, needle: T): void;
    onAfter(listener: T, needle: T): void;
    remove(listener: T): boolean;
    /**
     * return value if it canceled
     */
    private _fireWithoutErrorHandling;
    /**
     * return value if it canceled
     */
    fire(...v: T extends (...args: infer ARGS) => any ? ARGS : never): (T extends (...args: any[]) => infer RET ? RET : never) | undefined;
    /**
     * reverse listener orders
     * return value if it canceled
     */
    fireReverse(...v: T extends (...args: infer ARGS) => any ? ARGS : never): (T extends (...args: any[]) => infer RET ? RET : never) | undefined;
    allListeners(): IterableIterator<T>;
    /**
     * remove all listeners
     */
    clear(): void;
    static errorHandler: Event<(error: any) => void | CANCEL>;
}
export declare namespace Event {
    type ReturnType = number | CANCEL | void | Promise<void>;
}
/**
 * @deprecated use Event.setInstaller
 */
export declare class EventEx<T extends (...args: any[]) => any> extends Event<T> {
    protected onStarted(): void;
    protected onCleared(): void;
    on(listener: T): void;
    remove(listener: T): boolean;
}
export {};
