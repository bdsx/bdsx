
import { remapError, remapStackLine } from "./source-map-support";
import { getLineAt } from "./util";
import colors = require('colors');

let testnum = 1;
let testcount = 0;
let done = 0;
let testIsDone = false;

const total:number[] = [0,0,0,0];

export class Tester {
    private subject = '';
    private state = Tester.State.Pending;
    private pending = 0;

    public static errored = false;
    public static isPassed():boolean {
        return testIsDone && !Tester.errored;
    }

    private _done(state:Tester.State):void {
        if (state <= this.state) return;
        if (this.pending !== 0 && state === Tester.State.Passed) {
            this._logPending();
            return;
        }
        total[this.state]--;
        total[state]++;
        if (this.state === Tester.State.Pending) done++;
        if (state === Tester.State.Failed) {
            Tester._log(`FAILED (${total[Tester.State.Passed]}/${testcount})`, true);
            Tester.errored = true;
        }
        this.state = state;

        if (done === testcount) {
            const error = total[Tester.State.Failed] !== 0;
            const message = `TEST ${error ? 'FAILED' : 'PASSED'} (${total[Tester.State.Passed]}/${testcount - total[Tester.State.Skipped]})`;

            Tester._log(message, error);
            testIsDone = true;
        }
    }

    private _logPending():void {
        if (this.pending === 0) this.log(`Pending done`);
        else this.log(`Pending ${this.pending} tasks`);
    }
    private static _log(message:string, error?:boolean):void {
        if (error) console.error(colors.red(`[test] ${message}`));
        else console.log(colors.brightGreen(`[test] ${message}`));
    }

    log(message:string, error?:boolean):void {
        const msg = `[test/${this.subject}] ${message}`;
        if (error) console.error(colors.red(msg));
        else console.log(colors.brightGreen(msg));
    }

    private _error(message:string, errorpos:string):void {
        this.log(`failed. ${message}`, true);
        console.error(colors.red(errorpos));
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

    equals<T>(actual:T, expected:T, message:string='', toString:(v:T)=>string=v=>v+''):void {
        if (actual !== expected) {
            if (message !== '') message = ', ' + message;
            this.error(`Expected: ${toString(expected)}, Actual: ${toString(actual)}${message}`, 3);
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
                    this._logPending();
                    if (this.pending === 0) {
                        this._done(Tester.State.Passed);
                    }
                }
            }
        };
    }

    static async test(tests:Record<string, (this:Tester)=>Promise<void>|void>, waitOneTick?:boolean):Promise<void> {
        await new Promise(resolve=>setTimeout(resolve, 100)); // run after examples

        // pass one tick, wait until result of the list command example
        if (waitOneTick) {
            const system = server.registerSystem(0, 0);
            await new Promise<void>(resolve=>{
                system.update = ()=>{
                    resolve();
                    system.update = undefined;
                };
            });
        }

        Tester._log(`node version: ${process.versions.node}`);
        Tester._log(`engine version: ${process.jsEngine}@${process.versions[process.jsEngine!]}`);

        const testlist = Object.entries(tests);
        testcount += testlist.length;

        for (const [subject, test] of testlist) {
            const tester = new Tester;
            try {
                Tester._log(`(${testnum++}/${testcount}) ${subject}`);
                tester.subject = subject;
                await test.call(tester);
                tester._done(Tester.State.Passed);
            } catch (err) {
                tester.processError(err);
            }
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
