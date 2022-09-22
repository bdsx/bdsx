
import * as colors from 'colors';
import { bedrockServer } from './launcher';
import { getCurrentStackLine, remapError } from "./source-map-support";
import { timeout } from "./util";

let testnum = 1;
let testcount = 0;
let done = 0;
let testIsDone = false;

const total:number[] = [0,0,0,0];

function logError(message:string):void {
    console.error(colors.red(`[test] ${message}`));
}
function logMessage(message:string):void {
    console.log(colors.brightGreen(`[test] ${message}`));
}
function deepEquals(a:unknown, b:unknown):boolean {
    if (typeof a === 'object') {
        if (typeof b !== 'object') return false;
        if ((a instanceof Array) && (b instanceof Array)) {
            if (a.length !== b.length) return false;
            for (let i=0;i<a.length;i++) {
                if (!deepEquals(a[i], b[i])) return false;
            }
            return true;
        } else {
            if (a === null) {
                if (b === null) return true;
                return false;
            } else if (b === null) {
                return false;
            }
            return deepEquals(Object.entries(a), Object.entries(b));
        }
    }
    return a === b;
}
type RemoveOptional<T> = {[key in keyof T]-?:T[key]};
type FilledOptions = RemoveOptional<Tester.Options>;
const defaultOpts = {
    stringify: (val:any)=>val+'',
};
function resolveOpts(opts:Tester.Options|number|undefined|((value:any)=>string), additionalStackOffset:number, fullStackOffset:number):FilledOptions {
    if (opts == null) return {
        stackOffset: additionalStackOffset,
        stringify: defaultOpts.stringify,
    };
    switch (typeof opts) {
    case 'number': {
        return {
            stackOffset: opts + additionalStackOffset - fullStackOffset,
            stringify: defaultOpts.stringify,
        };
    }
    case 'function': {
        return {
            stackOffset: additionalStackOffset,
            stringify: opts,
        };
    }
    }
    if (opts.stackOffset == null) {
        opts.stackOffset = additionalStackOffset;
    } else {
        opts.stackOffset += additionalStackOffset;
    }
    if (opts.stringify == null) {
        opts.stringify = defaultOpts.stringify;
    }
    return opts as FilledOptions;
}

export class Tester {
    private state = Tester.State.Pending;
    private pending = 0;
    private errors:string[] = [];
    private firstFlush = false;

    constructor(private readonly subject = '') {
    }

    public static errored = false;
    public static isPassed():boolean {
        return testIsDone && !Tester.errored;
    }

    private _done(state:Tester.State):void {
        this._flush();

        if (state <= this.state) return;
        if (this.pending !== 0 && state === Tester.State.Passed) {
            this.log(`Pending ${this.pending} tasks`);
            return;
        }

        total[this.state]--;
        total[state]++;
        if (this.state === Tester.State.Pending) done++;
        if (state === Tester.State.Failed) {
            logError(`FAILED (${total[Tester.State.Passed]}/${testcount})`);
            Tester.errored = true;
        }
        this.state = state;

        if (done === testcount) {
            const error = total[Tester.State.Failed] !== 0;
            const message = `TEST ${error ? 'FAILED' : 'PASSED'} (${total[Tester.State.Passed]}/${testcount - total[Tester.State.Skipped]})`;

            (error ? logError : logMessage)(message);
            testIsDone = true;
            if (error) {
                logError('Unit tests can fail If other user scripts are running.');
            }
        }
    }

    private _flush():void {
        if (!this.firstFlush) {
            this.firstFlush = true;
            logMessage(`(${testnum++}/${testcount}) ${this.subject}`);
        }
        for (const err of this.errors) {
            this.log(err, true);
        }
        this.errors.length = 0;
    }

    log(message:string, error?:boolean):void {
        const msg = `[test/${this.subject}] ${message}`;
        if (error) console.error(colors.red(msg));
        else console.log(colors.brightGreen(msg));
    }

    private _error(message:string, errorpos:string):void {
        this.errors.push(`failed. ${message}`);
        this.errors.push(colors.red(errorpos));
        this._done(Tester.State.Failed);
    }

    error(message:string, opts?:Tester.Options|number):void {
        const nopts = resolveOpts(opts, 1, 2);
        this._error(message, getCurrentStackLine(nopts.stackOffset));
    }

    processError(err:Error):void {
        const stack = (remapError(err).stack||'').split('\n');
        this._error(err.message, stack[1]);
        console.error(stack.slice(2).join('\n'));
    }

    fail(opts?:{stackOffset?:number}):void {
        this.error('', resolveOpts(opts, 1, 3));
    }

    assert(cond:boolean, message:string, opts?:Tester.Options):void {
        if (!cond) {
            this.error(message, resolveOpts(opts, 1, 3));
        }
    }

    equals<T>(actual:T, expected:T, message?:string, opts?:Tester.Options|((v:any)=>string)):void {
        if (actual !== expected) {
            if (message == null) message = '';
            else message = ', ' + message;
            const nopts = resolveOpts(opts, 1, 3);
            this.error(`Expected: ${nopts.stringify(expected)}, Actual: ${nopts.stringify(actual)}${message}`, nopts);
        }
    }

    deepEquals<T>(actual:T, expected:T, message?:string, opts?:Tester.Options|((v:any)=>string)):void {
        if (!deepEquals(actual, expected)) {
            if (message == null) message = '';
            else message = ', ' + message;
            const nopts = resolveOpts(opts, 1, 3);
            this.error(`Expected: ${nopts.stringify(expected)}, Actual: ${nopts.stringify(actual)}${message}`, nopts);
        }
    }

    arrayEquals<T extends ArrayLike<any>>(actual:T, expected:T, message?:string, opts?:Tester.Options|((v:any)=>string)):void {
        if (message == null) message = '';
        else message = ', ' + message;

        let n = actual.length;
        const expectedLen = expected.length;
        if (n !== expectedLen) {
            const nopts = resolveOpts(opts, 1, 3);
            this.error(`Expected: length=${expectedLen}, Actual: length=${n}${message}`, nopts);
            if (expectedLen < n) {
                n = expectedLen;
            }
        }
        for (let i=0;i<n;i++) {
            const a = actual[i];
            const e = expected[i];
            if (a !== e) {
                const nopts = resolveOpts(opts, 1, 3);
                this.error(`Expected: [${i}]=${nopts.stringify(e)}, Actual: [${i}]=${nopts.stringify(a)}${message}`, nopts);
            }
        }
    }

    skip(message:string):void {
        this.log(message);
        this._done(Tester.State.Skipped);
    }

    wrap<ARGS extends any[]>(run:(...args:ARGS)=>(void|Promise<void>), count:number = 1):(...args:ARGS)=>Promise<void> {
        if (count !== 0) this.pending ++;
        return async(...args:ARGS)=>{
            try {
                await run(...args);
            } catch (err) {
                this.processError(err);
            }
            if (count !== 0) {
                if ((--count) === 0) {
                    this.pending--;
                    if (this.pending === 0) {
                        this.log(`Pending done`);
                    }
                    this._done(Tester.State.Passed);
                }
            }
        };
    }

    static async test(tests:Record<string, (this:Tester)=>Promise<void>|void>, waitOneTick?:boolean):Promise<void> {
        await timeout(100); // run after examples

        // pass one tick, wait until result of the list command example
        if (waitOneTick) {
            await bedrockServer.serverInstance.nextTick();
        }

        logMessage(`node version: ${process.versions.node}`);
        if (process.jsEngine != null) {
            logMessage(`engine version: ${process.jsEngine}@${process.versions[process.jsEngine!]}`);
        }

        const testlist = Object.entries(tests);
        testcount += testlist.length;

        for (const [subject, test] of testlist) {
            const tester = new Tester(subject);
            try {
                await test.call(tester);
                tester._done(Tester.State.Passed);
            } catch (err) {
                tester.processError(err);
            }
        }
    }

    static async consecutive(...tests:Record<string, (this:Tester)=>Promise<void>|void>[]):Promise<void> {
        await timeout(100); // run after examples

        logMessage(`node version: ${process.versions.node}`);
        if (process.jsEngine != null) {
            logMessage(`engine version: ${process.jsEngine}@${process.versions[process.jsEngine!]}`);
        }

        const allTests = tests.map(test=>{
            const list = Object.entries(test);
            testcount += list.length;
            return list;
        });

        for (const tests of allTests) {
            for (const [subject, test] of tests) {
                const tester = new Tester(subject);
                try {
                    await test.call(tester);
                    tester._done(Tester.State.Passed);
                } catch (err) {
                    tester.processError(err);
                }
            }
        }
    }

    static async concurrency(...tests:Record<string, (this:Tester)=>Promise<void>|void>[]):Promise<void> {
        await timeout(100); // run after examples

        logMessage(`node version: ${process.versions.node}`);
        if (process.jsEngine != null) {
            logMessage(`engine version: ${process.jsEngine}@${process.versions[process.jsEngine!]}`);
        }

        const allTests = tests.map(test=>{
            const list = Object.entries(test);
            testcount += list.length;
            return list;
        });

        for (const testlist of allTests) {
            const proms:Promise<void>[] = [];
            for (const [subject, test] of testlist) {
                const tester = new Tester(subject);
                proms.push((async()=>{
                    try {
                        await test.call(tester);
                        tester._done(Tester.State.Passed);
                    } catch (err) {
                        tester.processError(err);
                    }
                })());
            }
            await Promise.all(proms);
        }
    }
}

export namespace Tester {
    export interface Options {
        stackOffset?:number;
        stringify?:(value:any)=>string;
    }
    export enum State {
        Pending,
        Passed,
        Skipped,
        Failed,
    }
}
