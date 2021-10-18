/**
 * check the memory leak of the input function.
 * @return the promise will be resolved when it succeeded. it does not finish if it leaked.
 */
export declare function checkMemoryLeak(cb: () => void, opts?: checkLeak.Options): Promise<void>;
declare namespace checkLeak {
    interface Options {
        iterationForTask?: number;
        iterationForPass?: number;
        sleepForCollect?: number;
    }
}
export {};
