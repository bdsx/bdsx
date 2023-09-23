declare global {
    interface Blob {
        __dummy?: void;
    }

    interface SymbolConstructor {
        readonly dispose: unique symbol;
        readonly asyncDispose: unique symbol;
    }

    interface Disposable {
        [Symbol.dispose](): void;
    }
}

if (!Promise.prototype.finally) {
    Promise.prototype.finally = function <T>(this: Promise<T>, onfinally?: (() => void) | undefined | null) {
        async function voiding(value: any): Promise<any> {
            if (!onfinally) return;
            onfinally();
            return value;
        }
        return this.then(voiding, voiding);
    };
}
(Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export {};
