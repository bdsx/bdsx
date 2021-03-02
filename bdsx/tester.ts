
import { remapError, remapStackLine } from "./source-map-support";
import { getLineAt } from "./util";
import colors = require('colors');

let passed = 0;
let testnum = 1;
let testcount = 0;

export class Tester {
    subject = '';
    errored = false;
    done = false;

    public static errored = false;

    log(message:string):void {
        console.log(`[test/${this.subject}] ${message}`);
    }

    private _error(message:string, errorpos:string):void {
        console.error(colors.red(`[test/${this.subject}] failed. ${message}`));
        console.error(colors.red(errorpos));
        if (!this.errored) {
            if (this.done) {
                passed--;
                console.error(colors.red(`[test] FAILED (${passed}/${testcount})`));
            }
            this.errored = true;
            Tester.errored = true;
        }
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

    static async test(tests:Record<string, (this:Tester)=>Promise<void>|void>):Promise<void> {
        await new Promise(resolve=>setTimeout(resolve, 100)); // run after examples
        
        // pass one tick, wait until result of the list command example
        {
            const system = server.registerSystem(0, 0);
            await new Promise<void>(resolve=>{
                system.update = ()=>{
                    resolve();
                    system.update = undefined;
                };
            });
        }
    
        console.log(`[test] node: ${process.versions.node}`);
        console.log('[test] engine: '+process.jsEngine+'@'+process.versions[process.jsEngine!]);
    
        const testlist = Object.entries(tests);        
        testcount += testlist.length;

        for (const [subject, test] of testlist) {
            const tester = new Tester;
            try {
                console.log(`[test] (${testnum++}/${testcount}) ${subject}`);
                tester.subject = subject;
                tester.errored = false;
                await test.call(tester);
                if (!tester.errored) passed++;
                tester.done = true;
            } catch (err) {
                tester.processError(err);
            }
        }
        if (passed !== testcount) {
            console.error(colors.red(`[test] FAILED (${passed}/${testcount})`));
        } else {
            console.log(`[test] PASSED (${passed}/${testcount})`);
        }
    }
}
