import { VoidPointer } from "./core";
export declare class CircularDetector {
    private readonly map;
    static decreaseDepth(options: Record<string, any>): Record<string, any>;
    static makeTemporalClass(name: string, instance: VoidPointer, options: Record<string, any>): new () => Record<string, any>;
    check<T>(instance: VoidPointer, allocator: () => T, cb: (value: T) => void): T;
    release(): void;
    static getInstance(): CircularDetector;
    static check<T>(instance: VoidPointer, allocator: () => T, cb: (value: T) => void): T;
}
