/**
 * util for managing the async tasks
 */

import os = require('os');

const EMPTY = Symbol();

const cpuCount = os.cpus().length;
const concurrencyCount = Math.min(Math.max(cpuCount*2, 8), cpuCount);

export class ConcurrencyQueue {
    private idles:number;
    private readonly reserved:(()=>Promise<void>)[] = [];
    private endResolve:(()=>void)|null = null;
    private endReject:((err:any)=>void)|null = null;
    private endPromise:Promise<void>|null = null;
    private idleResolve:(()=>void)|null = null;
    private idleReject:((err:any)=>void)|null = null;
    private idlePromise:Promise<void>|null = null;
    private _ref = 0;
    private _error:any = EMPTY;
    public verbose = false;

    constructor(private readonly concurrency = concurrencyCount) {
        this.idles = this.concurrency;
    }

    private readonly _next:()=>(Promise<void>|void) = ()=>{
        if (this.verbose) console.log(`Task - ${'*'.repeat(this.getTaskCount())}`);

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
        const task = this.reserved.shift()!;
        return task().then(this._next, err=>this.error(err));
    };

    private _fireEnd():void {
        if (this._ref === 0 && this.idles === this.concurrency) {
            if (this.verbose) console.log('Task - End');
            if (this.endResolve !== null) {
                this.endResolve();
                this.endResolve = null;
                this.endReject = null;
                this.endPromise = null;
            }
        }
    }

    error(err:unknown):void {
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
        this.idlePromise = this.endPromise = Promise.reject(this._error);
    }

    ref():void {
        this._ref++;
    }

    unref():void {
        this._ref--;
        this._fireEnd();
    }

    onceHasIdle():Promise<void> {
        if (this.idlePromise !== null) return this.idlePromise;
        if (this.idles !== 0) return Promise.resolve();
        return this.idlePromise = new Promise((resolve, reject)=>{
            this.idleResolve = resolve;
            this.idleReject = reject;
        });
    }

    onceEnd():Promise<void> {
        if (this.endPromise !== null) return this.endPromise;
        if (this.idles === this.concurrency) return Promise.resolve();
        return this.endPromise = new Promise((resolve, reject)=>{
            this.endResolve = resolve;
            this.endReject = reject;
        });
    }

    run(task:()=>Promise<void>):Promise<void> {
        this.reserved.push(task);
        if (this.idles === 0) {
            if (this.verbose) console.log(`Task - ${'*'.repeat(this.getTaskCount())}`);

            if (this.reserved.length > (this.concurrency>>1)) {
                if (this.verbose) console.log('Task - Drain');
                return this.onceHasIdle();
            }
            return Promise.resolve();
        }
        this.idles--;
        this._next();
        return Promise.resolve();
    }

    getTaskCount():number {
        return this.reserved.length + this.concurrency - this.idles;
    }
}
