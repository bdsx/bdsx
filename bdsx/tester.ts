
import { remapError, remapStackLine } from "bdsx/source-map-support";
import colors = require('colors');

let passed = 0;
let testnum = 1;
let testcount = 0;

export class Tester
{
    subject = '';
    errored = false;
    done = false;

    constructor()
    {
    }

    log(message:string):void
    {
        console.log(`[test/${this.subject}] ${message}`);
    }
    
    error(message:string, stackidx = 2):void
    {
        console.error(colors.red(`[test/${this.subject}] failed. ${message}`));
        const stack = Error().stack!;
        console.error(colors.red(remapStackLine(stack.split('\n')[stackidx]).stackLine));
        if (this.done)
        {
            if (!this.errored)
            {
                passed--;
                console.error(colors.red(`[test] FAILED (${passed}/${testcount})`));
            }
        }
        this.errored = true;
    }

    fail():void
    {
        this.error('failed', 3);
    }

    assert(cond:boolean, message:string):void
    {
        if (!cond) this.error(message, 3);
    }

    static async test(tests:Record<string, (this:Tester)=>Promise<void>|void>):Promise<void>
    {
        await new Promise(resolve=>setTimeout(resolve, 100)); // run after examples
    
        console.log(`[test] node: ${process.versions.node}`);
        console.log('[test] engine: '+process.jsEngine+'@'+process.versions[process.jsEngine!]);
    
        const testlist = Object.entries(tests);        
        testcount += testlist.length;

        for (const [subject, test] of testlist)
        {
            try
            {
                const tester = new Tester;
                console.log(`[test] (${testnum++}/${testcount}) ${subject}`);
                tester.subject = subject;
                tester.errored = false;
                await test.call(tester);
                if (!tester.errored) passed++;
                tester.done = true;
            }
            catch (err)
            {
                console.error(remapError(err));
            }
        }
        if (passed !== testcount)
        {
            console.error(colors.red(`[test] FAILED (${passed}/${testcount})`));
        }
        else
        {
            console.log(`[test] PASSED (${passed}/${testcount})`);
        }
    }
}
