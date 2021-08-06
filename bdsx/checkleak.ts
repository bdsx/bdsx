
import colors = require('colors');

/**
 * check the memory leak of the input function.
 * @return the promise will be resolved when it succeeded. it does not finish if it leaked.
 */
export async function checkMemoryLeak(cb:()=>void, opts:checkLeak.Options = {}):Promise<void> {
    return new Promise<void>(resolve=>{
        const loopIteration = opts.iterationForTask || 1000;
        const passIteration = opts.iterationForPass || 100;
        const sleep = opts.sleepForCollect || 500;
        let deltaSmooth = 0;
        let leakExpected = 0;
        let max = 0;
        let min = Infinity;
        let skipFront = 10;

        function printUsage(usage:number, message:string):void {
            process.stdout.cursorTo(0);
            const n = usage / (1024*1024);
            process.stdout.write(`Memory Usage: ${n.toFixed(1)}MiB ${message}`);
            process.stdout.clearLine(1);
        }
        let maxUpdated = false;
        function checkUsage():boolean {
            const now = process.memoryUsage().rss;
            const delta = now - usage;
            usage = now;
            deltaSmooth *= 0.9;
            deltaSmooth += delta * 0.1;
            if (skipFront > 0) {
                skipFront--;
            } else {
                pass ++;
                maxUpdated = now > max;
                if (maxUpdated) max = now;
                if (now < min) min = now;
                if (maxUpdated) pass = 0;
            }

            let message = '';
            let color:(str:string)=>string;
            if (delta < 0) {
                message = '▼';
                color = colors.yellow;
            } else if (delta > 0) {
                message = '▲';
                color = maxUpdated ? colors.red : colors.yellow;
            } else {
                message = '■';
                color = colors.green;
            }

            if (skipFront === 0) {
                message += ` (${pass}/${passIteration})`;

                if (maxUpdated) {
                    if (leakExpected < 400) leakExpected += 20;
                } else {
                    if (leakExpected > 0) leakExpected --;
                }
                if (leakExpected > 200) {
                    warn = 10;
                } else if (warn > 0) {
                    warn--;
                }
                if (warn !== 0) {
                    message += colors.red(` - It seems it has a memory leak issue (Increase per iteration: ${(deltaSmooth/loopIteration).toFixed(1)}Bytes)`);
                } else {
                    if (max !== 0) message += colors.white(` Max=${(max/(1024*1024)).toFixed(1)}MiB`);
                }
            }
            printUsage(usage, color(message));

            return pass >= passIteration;
        }
        let usage = process.memoryUsage().rss;
        printUsage(usage, '');
        let pass = 0;
        let warn = 0;

        const interval = setInterval(()=>{
            for (let i=0;i<loopIteration;i++) {
                cb();
            }
            if (checkUsage()) {
                clearInterval(interval);
                resolve();
                console.log();
                console.error(colors.green(`memory check passed`));
            }
        }, sleep);
    });
}

namespace checkLeak {
    export interface Options {
        iterationForTask?:number;
        iterationForPass?:number;
        sleepForCollect?:number;
    }
}
