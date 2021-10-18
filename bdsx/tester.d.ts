export declare class Tester {
    private subject;
    private state;
    private pending;
    static errored: boolean;
    static isPassed(): boolean;
    private _done;
    private _logPending;
    private static _log;
    log(message: string, error?: boolean): void;
    private _error;
    error(message: string, stackidx?: number): void;
    processError(err: Error): void;
    fail(): void;
    assert(cond: boolean, message: string): void;
    equals<T>(actual: T, expected: T, message?: string, toString?: (v: T) => string): void;
    skip(message: string): void;
    wrap<ARGS extends any[]>(run: (...args: ARGS) => (void | Promise<void>), count?: number): (...args: ARGS) => Promise<void>;
    static test(tests: Record<string, (this: Tester) => Promise<void> | void>, waitOneTick?: boolean): Promise<void>;
}
export declare namespace Tester {
    enum State {
        Pending = 0,
        Passed = 1,
        Skipped = 2,
        Failed = 3
    }
}
