"use strict";
/**
 * util for managing the async tasks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrencyQueue = void 0;
const os = require("os");
const common_1 = require("./common");
const EMPTY = Symbol();
const cpuCount = os.cpus().length;
const concurrencyCount = Math.min(Math.max(cpuCount * 2, 8), cpuCount);
class ConcurrencyQueue {
    constructor(concurrency = concurrencyCount) {
        this.concurrency = concurrency;
        this.reserved = [];
        this.endResolve = null;
        this.endReject = null;
        this.endPromise = null;
        this.idleResolve = null;
        this.idleReject = null;
        this.idlePromise = null;
        this.resolvePromise = Promise.resolve();
        this._ref = 0;
        this._error = EMPTY;
        this.verbose = false;
        this._next = () => {
            if (this.verbose)
                console.log(`Task - ${'*'.repeat(this.getTaskCount())}`);
            if (this.reserved.length === 0) {
                if (this.idles === 0 && this.idleResolve !== null) {
                    this.idleResolve();
                    this.idleResolve = null;
                    this.idleReject = null;
                    this.idlePromise = null;
                }
                this.idles++;
                this._fireEnd();
                return;
            }
            const task = this.reserved.shift();
            return task().then(this._next, err => this.error(err));
        };
        this.idles = this.concurrency;
    }
    _fireEnd() {
        if (this._ref === 0 && this.idles === this.concurrency) {
            if (this.verbose)
                console.log('Task - End');
            if (this.endResolve !== null) {
                this.endResolve();
                this.endResolve = null;
                this.endReject = null;
                this.endPromise = null;
            }
        }
    }
    error(err) {
        this._error = err;
        if (this.endReject !== null) {
            this.endReject(err);
            this.endResolve = null;
            this.endReject = null;
        }
        if (this.idleReject !== null) {
            this.idleReject(err);
            this.idleResolve = null;
            this.idleReject = null;
        }
        const rejected = Promise.reject(this._error);
        rejected.catch(common_1.emptyFunc);
        this.resolvePromise = this.idlePromise = this.endPromise = rejected;
    }
    ref() {
        this._ref++;
    }
    unref() {
        this._ref--;
        this._fireEnd();
    }
    onceHasIdle() {
        if (this.idlePromise !== null)
            return this.idlePromise;
        if (this.idles !== 0)
            return this.resolvePromise;
        return this.idlePromise = new Promise((resolve, reject) => {
            this.idleResolve = resolve;
            this.idleReject = reject;
        });
    }
    onceEnd() {
        if (this.endPromise !== null)
            return this.endPromise;
        if (this.idles === this.concurrency)
            return this.resolvePromise;
        return this.endPromise = new Promise((resolve, reject) => {
            this.endResolve = resolve;
            this.endReject = reject;
        });
    }
    run(task) {
        this.reserved.push(task);
        if (this.idles === 0) {
            if (this.verbose)
                console.log(`Task - ${'*'.repeat(this.getTaskCount())}`);
            if (this.reserved.length > (this.concurrency >> 1)) {
                if (this.verbose)
                    console.log('Task - Drain');
                return this.onceHasIdle();
            }
            return this.resolvePromise;
        }
        this.idles--;
        this._next();
        return this.resolvePromise;
    }
    getTaskCount() {
        return this.reserved.length + this.concurrency - this.idles;
    }
}
exports.ConcurrencyQueue = ConcurrencyQueue;
//# sourceMappingURL=concurrency.js.map