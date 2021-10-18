/**
 * util for managing the async tasks
 */
export declare class ConcurrencyQueue {
    private readonly concurrency;
    private idles;
    private readonly reserved;
    private endResolve;
    private endReject;
    private endPromise;
    private idleResolve;
    private idleReject;
    private idlePromise;
    private resolvePromise;
    private _ref;
    private _error;
    verbose: boolean;
    constructor(concurrency?: number);
    private readonly _next;
    private _fireEnd;
    error(err: unknown): void;
    ref(): void;
    unref(): void;
    onceHasIdle(): Promise<void>;
    onceEnd(): Promise<void>;
    run(task: () => Promise<unknown>): Promise<void>;
    getTaskCount(): number;
}
