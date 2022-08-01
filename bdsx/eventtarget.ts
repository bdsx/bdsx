
import { CANCEL } from './common';
import { remapAndPrintError } from './source-map-support';

type ReturnPromise<T extends (...args: any[]) => (number|CANCEL|void|Promise<void>)> =
    T extends (...args: infer ARGS) => infer RET ? (...args:ARGS)=>(RET|Promise<void>) : never;

export class Event<T extends (...args: any[]) => (number|CANCEL|void|Promise<void>)> {
    private readonly listeners: ReturnPromise<T>[] = [];

    isEmpty(): boolean {
        return this.listeners.length === 0;
    }

    /**
     * cancel event if it returns non-undefined value
     */
    on(listener: ReturnPromise<T>): void {
        this.listeners.push(listener);
    }

    once(listener: T): void {
        const that = this;
        function callback(...args:any[]):any{
            that.remove(callback as ReturnPromise<T>);
            return listener(...args);
        }
        this.listeners.push(callback as ReturnPromise<T>);
    }

    onFirst(listener: ReturnPromise<T>): void {
        this.listeners.unshift(listener);
    }

    onLast(listener: ReturnPromise<T>): void {
        this.listeners.push(listener);
    }

    onBefore(listener: ReturnPromise<T>, needle: ReturnPromise<T>): void {
        const idx = this.listeners.indexOf(needle);
        if (idx === -1) throw Error('needle not found');
        this.listeners.splice(idx, 0, listener);
    }

    onAfter(listener: ReturnPromise<T>, needle: ReturnPromise<T>): void {
        const idx = this.listeners.indexOf(needle);
        if (idx === -1) throw Error('needle not found');
        this.listeners.splice(idx + 1, 0, listener);
    }

    remove(listener: ReturnPromise<T>): boolean {
        const idx = this.listeners.indexOf(listener);
        if (idx === -1) return false;
        this.listeners.splice(idx, 1);
        return true;
    }

    /**
     * return value if it canceled
     */
    private _fireWithoutErrorHandling(...v: Parameters<T>): ReturnType<T> | undefined {
        for (const listener of this.listeners.slice()) {
            try {
                const ret = listener(...v);
                if (ret === CANCEL) return CANCEL as any;
                if (typeof ret === 'number') return ret as any;
            } catch (err) {
                remapAndPrintError(err);
            }
        }
        return undefined;
    }

    private static reportError(err:unknown):void {
        const res = Event.errorHandler._fireWithoutErrorHandling(err);
        if (res == null) {
            remapAndPrintError(err as any);
        }
    }

    /**
     * return value if it canceled
     */
    promiseFire(...v: Parameters<T>): Promise<ReturnType<T> extends Promise<infer RES> ? RES[] : ReturnType<T>[]> {
        const res = this.listeners.slice().map(listener=>listener(...v));
        return Promise.all(res) as any;
    }

    /**
     * return value if it canceled
     */
    fire(...v: Parameters<T>): ReturnType<T> | undefined {
        for (const listener of this.listeners.slice()) {
            try {
                const ret = listener(...v);
                if (ret === CANCEL) return CANCEL as any;
                if (typeof ret === 'number') return ret as any;
            } catch (err) {
                Event.reportError(err);
            }
        }
    }

    /**
     * reverse listener orders
     * return value if it canceled
     */
    fireReverse(...v: T extends (...args: infer ARGS) => any ? ARGS : never): (T extends (...args: any[]) => infer RET ? RET : never) | undefined {
        for (const listener of this.listeners.slice()) {
            try {
                const ret = listener(...v);
                if (ret === CANCEL) return CANCEL as any;
                if (typeof ret === 'number') return ret as any;
            } catch (err) {
                Event.reportError(err);
            }
        }
    }

    allListeners(): IterableIterator<ReturnPromise<T>> {
        return this.listeners.values();
    }

    /**
     * remove all listeners
     */
    clear(): void {
        this.listeners.length = 0;
    }

    public static errorHandler = new Event<(error:any)=>void|CANCEL>();
}
export class EventEx<T extends (...args: any[]) => any> extends Event<T> {
    protected onStarted(): void {
        // empty
    }
    protected onCleared(): void {
        // empty
    }

    on(listener: ReturnPromise<T>): void {
        if (this.isEmpty()) this.onStarted();
        super.on(listener);
    }
    remove(listener: ReturnPromise<T>): boolean {
        if (!super.remove(listener)) return false;
        if (this.isEmpty()) this.onCleared();
        return true;
    }
}
