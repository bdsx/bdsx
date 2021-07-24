
import { CANCEL } from './common';
import { remapAndPrintError } from './source-map-support';

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

export class Event<T extends (...args: any[]) => (number|CANCEL|void|Promise<void>)> implements CapsuledEvent<T> {
    private readonly listeners: T[] = [];

    isEmpty(): boolean {
        return this.listeners.length === 0;
    }

    /**
     * cancel event if it returns non-undefined value
     */
    on(listener: T): void {
        this.listeners.push(listener);
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
        for (const listener of this.listeners) {
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
        for (const listener of this.listeners) {
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
