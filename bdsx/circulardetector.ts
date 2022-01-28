import { bin } from "./bin";
import { VoidPointer } from "./core";

let detector:CircularDetector|null = null;
let ref = 0;

export class CircularDetector {
    private readonly map = new Map<unknown, unknown>();
    private keyCounter = 0;

    static decreaseDepth(options:Record<string, any>):Record<string, any> {
        return Object.assign({}, options, {
            depth: options.depth === null ? null : (options as any).depth - 1,
        });
    }
    static makeTemporalClass(name:string, instance:VoidPointer, options:Record<string, any>):new()=>Record<string, any> {
        if (options.seen.length === 0) {
            name += `<${options.stylize(instance.toString(), 'number')}>`;
        }
        class Class{}
        Object.defineProperty(Class, 'name', {value:name});
        return Class;
    }

    check<T>(instance:VoidPointer, allocator:()=>T, cb:(value:T)=>void):T {
        let ctorKey = this.map.get(instance.constructor) as string|undefined;
        if (ctorKey == null) {
            ctorKey = bin.makeVar(this.keyCounter++);
            this.map.set(instance.constructor, ctorKey);
        }

        const key = instance.getAddressBin();
        const res = this.map.get(key+ctorKey);
        if (res != null) return res as T;
        const value = allocator();
        this.map.set(key, value);
        cb(value);
        return value;
    }

    release():void {
        if (--ref === 0) {
            process.nextTick(()=>{
                if (ref === 0) detector = null;
            });
        }
    }
    static getInstance():CircularDetector {
        if (ref++ === 0 && detector === null) {
            detector = new CircularDetector;
        }
        return detector!;
    }
    static check<T>(instance:VoidPointer, allocator:()=>T, cb:(value:T)=>void):T {
        const detector = CircularDetector.getInstance();
        const res = detector.check(instance, allocator, cb);
        detector.release();
        return res;
    }
}
