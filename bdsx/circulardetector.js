"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircularDetector = void 0;
let detector = null;
let ref = 0;
class CircularDetector {
    constructor() {
        this.map = new Map();
    }
    static decreaseDepth(options) {
        return Object.assign({}, options, {
            depth: options.depth === null ? null : options.depth - 1
        });
    }
    static makeTemporalClass(name, instance, options) {
        if (options.seen.length === 0) {
            name += `<${options.stylize(instance.toString(), 'number')}>`;
        }
        class DummyClass {
        }
        Object.defineProperty(DummyClass, 'name', { value: name });
        return DummyClass;
    }
    check(instance, allocator, cb) {
        const key = instance.getAddressBin();
        const res = this.map.get(key);
        if (res != null)
            return res;
        const value = allocator();
        this.map.set(key, value);
        cb(value);
        return value;
    }
    release() {
        if (--ref === 0) {
            process.nextTick(() => {
                if (ref === 0)
                    detector = null;
            });
        }
    }
    static getInstance() {
        if (ref++ === 0 && detector === null) {
            detector = new CircularDetector;
        }
        return detector;
    }
    static check(instance, allocator, cb) {
        const detector = CircularDetector.getInstance();
        const res = detector.check(instance, allocator, cb);
        detector.release();
        return res;
    }
}
exports.CircularDetector = CircularDetector;
//# sourceMappingURL=circulardetector.js.map