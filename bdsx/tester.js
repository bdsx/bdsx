"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tester = void 0;
const source_map_support_1 = require("./source-map-support");
const util_1 = require("./util");
const colors = require("colors");
let testnum = 1;
let testcount = 0;
let done = 0;
let testIsDone = false;
const total = [0, 0, 0, 0];
class Tester {
    constructor() {
        this.subject = '';
        this.state = Tester.State.Pending;
        this.pending = 0;
    }
    static isPassed() {
        return testIsDone && !Tester.errored;
    }
    _done(state) {
        if (state <= this.state)
            return;
        if (this.pending !== 0 && state === Tester.State.Passed) {
            this._logPending();
            return;
        }
        total[this.state]--;
        total[state]++;
        if (this.state === Tester.State.Pending)
            done++;
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
    _logPending() {
        if (this.pending === 0)
            this.log(`Pending done`);
        else
            this.log(`Pending ${this.pending} tasks`);
    }
    static _log(message, error) {
        if (error)
            console.error(colors.red(`[test] ${message}`));
        else
            console.log(colors.brightGreen(`[test] ${message}`));
    }
    log(message, error) {
        const msg = `[test/${this.subject}] ${message}`;
        if (error)
            console.error(colors.red(msg));
        else
            console.log(colors.brightGreen(msg));
    }
    _error(message, errorpos) {
        this.log(`failed. ${message}`, true);
        console.error(colors.red(errorpos));
        this._done(Tester.State.Failed);
    }
    error(message, stackidx = 2) {
        const stack = Error().stack;
        this._error(message, (0, source_map_support_1.remapStackLine)((0, util_1.getLineAt)(stack, stackidx)).stackLine);
    }
    processError(err) {
        const stack = ((0, source_map_support_1.remapError)(err).stack || '').split('\n');
        this._error(err.message, stack[1]);
        console.error(stack.slice(2).join('\n'));
    }
    fail() {
        this.error('', 3);
    }
    assert(cond, message) {
        if (!cond)
            this.error(message, 3);
    }
    equals(actual, expected, message = '', toString = v => v + '') {
        if (actual !== expected) {
            if (message !== '')
                message = ', ' + message;
            this.error(`Expected: ${toString(expected)}, Actual: ${toString(actual)}${message}`, 3);
        }
    }
    skip(message) {
        this.log(message);
        this._done(Tester.State.Skipped);
    }
    wrap(run, count = 1) {
        if (count !== 0)
            this.pending++;
        return async (...args) => {
            try {
                await run(...args);
            }
            catch (err) {
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
    static async test(tests, waitOneTick) {
        await new Promise(resolve => setTimeout(resolve, 100)); // run after examples
        // pass one tick, wait until result of the list command example
        if (waitOneTick) {
            const system = server.registerSystem(0, 0);
            await new Promise(resolve => {
                system.update = () => {
                    resolve();
                    system.update = undefined;
                };
            });
        }
        Tester._log(`node version: ${process.versions.node}`);
        Tester._log(`engine version: ${process.jsEngine}@${process.versions[process.jsEngine]}`);
        const testlist = Object.entries(tests);
        testcount += testlist.length;
        for (const [subject, test] of testlist) {
            const tester = new Tester;
            try {
                Tester._log(`(${testnum++}/${testcount}) ${subject}`);
                tester.subject = subject;
                await test.call(tester);
                tester._done(Tester.State.Passed);
            }
            catch (err) {
                tester.processError(err);
            }
        }
    }
}
exports.Tester = Tester;
Tester.errored = false;
(function (Tester) {
    let State;
    (function (State) {
        State[State["Pending"] = 0] = "Pending";
        State[State["Passed"] = 1] = "Passed";
        State[State["Skipped"] = 2] = "Skipped";
        State[State["Failed"] = 3] = "Failed";
    })(State = Tester.State || (Tester.State = {}));
})(Tester = exports.Tester || (exports.Tester = {}));
//# sourceMappingURL=tester.js.map