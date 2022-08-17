
import { AnyFunction, CANCEL } from './common';
import { remapAndPrintError } from './source-map-support';

type ReturnPromise<T extends (...args: any[]) => Event.ReturnType> =
    T extends (...args: infer ARGS) => infer RET ? (...args:ARGS)=>(RET|Promise<void>) : never;
type ComponentType<T extends any[]> = T extends (infer V)[] ? V : any;
type FirstParameter<T extends AnyFunction> = T extends (...args:infer P)=>any ? any[] extends P ? ComponentType<P>|undefined : 0 extends P['length'] ? void : P[0] : void;

export class Event<T extends (...args: any[]) => Event.ReturnType> {
    private readonly listeners: ReturnPromise<T>[] = [];
    private installer:(()=>void)|null = null;
    private uninstaller:(()=>void)|null = null;

    /**
     * call the installer when first listener registered.
     */
    setInstaller(installer:()=>void, uninstaller:(()=>void)|null = null):void {
        if (this.listeners.length !== 0) {
            if (this.uninstaller !== null) {
                this.uninstaller();
            }
            installer();

            if (uninstaller === null) {
                this.installer = null;
            } else {
                this.installer = installer;
            }
        } else {
            this.installer = installer;
        }
        this.uninstaller = uninstaller;
    }

    /**
     * pipe two events
     * it uses setInstaller
     */
    pipe<T2 extends (...args: any[]) => Event.ReturnType>(
        target:Event<T2>,
        piper:(this:this, ...args:Parameters<T2>)=>ReturnType<T2>,
    ):void {
        const pipe = ((...args)=>piper.call(this, ...args)) as ReturnPromise<T2>;
        this.setInstaller(
            ()=>target.on(pipe),
            ()=>target.remove(pipe),
        );
    }

    isEmpty(): boolean {
        return this.listeners.length === 0;
    }

    /**
     * cancel event if it returns non-undefined value
     */
    on(listener: ReturnPromise<T>): void {
        if (this.listeners.length === 0 && this.installer !== null) {
            this.installer();
            if (this.uninstaller === null) {
                this.installer = null;
            }
        }
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

    promise():Promise<FirstParameter<T>> {
        return new Promise(resolve=>this.once(resolve as T));
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
        if (this.listeners.length === 0 && this.uninstaller != null) {
            this.uninstaller();
        }
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
        for (const listener of this.listeners.slice().reverse()) {
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
export namespace Event {
    export type ReturnType = number|CANCEL|void|Promise<void>;
}

/**
 * @deprecated use Event.setInstaller
 */
export class EventEx<T extends (...args: any[]) => Event.ReturnType> extends Event<T> {
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
