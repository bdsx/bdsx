
import * as colors from 'colors';
import { bedrockServer } from './launcher';
import { remapError, remapStackLine } from "./source-map-support";
import { getLineAt, timeout } from "./util";

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

    error(message:string, stackidx:number = 2):void {
        const stack = Error().stack!;
        this._error(message, remapStackLine(getLineAt(stack, stackidx)).stackLine);
    }

    processError(err:Error):void {
        const stack = (remapError(err).stack||'').split('\n');
        this._error(err.message, stack[1]);
        console.error(stack.slice(2).join('\n'));
    }

    fail():void {
        this.error('', 3);
    }

    assert(cond:boolean, message:string):void {
        if (!cond) this.error(message, 3);
    }

    equals<T>(actual:T, expected:T, message?:string, toString:(v:T)=>string=v=>v+''):void {
        if (actual !== expected) {
            if (message == null) message = '';
            else message = ', ' + message;
            this.error(`Expected: ${toString(expected)}, Actual: ${toString(actual)}${message}`, 3);
        }
    }

    deepEquals<T>(actual:T, expected:T, message?:string, toString:(v:T)=>string=v=>v+''):void {
        if (!deepEquals(actual, expected)) {
            if (message == null) message = '';
            else message = ', ' + message;
            this.error(`Expected: ${toString(expected)}, Actual: ${toString(actual)}${message}`, 3);
        }
    }

    arrayEquals<T extends ArrayLike<any>>(actual:T, expected:T, message?:string, toString:(v:T)=>string=v=>v+''):void {
        if (message == null) message = '';
        else message = ', ' + message;

        let n = actual.length;
        const expectedLen = expected.length;
        if (n !== expectedLen) {
            this.error(`Expected: length=${expectedLen}, Actual: length=${n}${message}`, 3);
            if (expectedLen < n) {
                n = expectedLen;
            }
        }
        for (let i=0;i<n;i++) {
            const a = actual[i];
            const e = expected[i];
            if (a !== e) {
                this.error(`Expected: [${i}]=${toString(e)}, Actual: [${i}]=${toString(a)}${message}`, 3);
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
    export enum State {
        Pending,
        Passed,
        Skipped,
        Failed,
    }
}
