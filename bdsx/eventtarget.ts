
import { AnyFunction, CANCEL } from './common';
import { remapAndPrintError } from './source-map-support';

/**
 * @deprecated unusing
 */
export interface CapsuledEvent<T extends (...args: any[]) => any> {
    /**
     * return true if there are no connected listeners
     */
    isEmpty(): boolean;
    /**
     * add listener
     */
    on(listener: T): void;
    onFirst(listener: T): void;
    onLast(listener: T): void;
    /**
     * add listener before needle
     */
    onBefore(listener: T, needle: T): void;
    /**
     * add listener after needle
     */
    onAfter(listener: T, needle: T): void;
    remove(listener: T): boolean;
}

type FirstParameter<T extends AnyFunction> = T extends (first:infer P, ...args:any[])=>any ? P : void;

export class Event<T extends (...args: any[]) => Event.ReturnType> implements CapsuledEvent<T> {
    private readonly listeners: T[] = [];
    private installer:(()=>void)|null = null;
    private uninstaller:(()=>void)|null = null;

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
        piper:(this:this, ...args:Parameters<T2>)=>ReturnType<T2>
    ):void {
        const pipe = ((...args)=>piper.call(this, ...args)) as T2;
        this.setInstaller(
            ()=>target.on(pipe),
            ()=>target.remove(pipe)
        );
    }

    isEmpty(): boolean {
        return this.listeners.length === 0;
    }

    /**
     * cancel event if it returns non-undefined value
     */
    on(listener: T): void {
        if (this.listeners.length === 0 && this.installer !== null) {
            this.installer();
            if (this.uninstaller === null) {
                this.installer = null;
            }
        }
        this.listeners.push(listener);
    }

    once(listener: T): void {
        const listenerWrap = (...args:any):any=>{
            this.remove(listenerWrap as T);
            return listener(...args);
        };
        this.on(listenerWrap as T);
    }

    promise():Promise<FirstParameter<T>> {
        return new Promise(resolve=>this.once(resolve as T));
    }

    onFirst(listener: T): void {
        this.listeners.unshift(listener);
    }

    onLast(listener: T): void {
        this.listeners.push(listener);
    }

    onBefore(listener: T, needle: T): void {
        const idx = this.listeners.indexOf(needle);
        if (idx === -1) throw Error('needle not found');
        this.listeners.splice(idx, 0, listener);
    }

    onAfter(listener: T, needle: T): void {
        const idx = this.listeners.indexOf(needle);
        if (idx === -1) throw Error('needle not found');
        this.listeners.splice(idx + 1, 0, listener);
    }

    remove(listener: T): boolean {
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
    private _fireWithoutErrorHandling(...v: T extends (...args: infer ARGS) => any ? ARGS : never): (T extends (...args: any[]) => infer RET ? RET : never) | undefined {
        for (const listener of this.listeners) {
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

    /**
     * return value if it canceled
     */
    fire(...v: T extends (...args: infer ARGS) => any ? ARGS : never): (T extends (...args: any[]) => infer RET ? RET : never) | undefined {
        for (const listener of this.listeners.slice()) {
            try {
                const ret = listener(...v);
                if (ret === CANCEL) return CANCEL as any;
                if (typeof ret === 'number') return ret as any;
            } catch (err) {
                Event.errorHandler._fireWithoutErrorHandling(err);
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
                Event.errorHandler._fireWithoutErrorHandling(err);
            }
        }
    }

    allListeners(): IterableIterator<T> {
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
export class EventEx<T extends (...args: any[]) => any> extends Event<T> {
    protected onStarted(): void {
        // empty
    }
    protected onCleared(): void {
        // empty
    }

    on(listener: T): void {
        if (this.isEmpty()) this.onStarted();
        super.on(listener);
    }
    remove(listener: T): boolean {
        if (!this.remove(listener)) return false;
        if (this.isEmpty()) this.onCleared();
        return true;
    }
}
