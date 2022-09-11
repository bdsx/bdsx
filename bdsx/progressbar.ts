import ProgressBar = require("progress");

let bar:ProgressBar|null = null;

export namespace progressBar {
    export function start(name:string, total: number|ProgressBar.ProgressBarOptions):void {
        finish();
        bar = new ProgressBar(`${name} [:bar] :current/:total`, total as any);
    }
    export function setTotal(total:number):void {
        if (bar === null) return;
        bar.total = total;
    }
    export function finish():void {
        if (bar === null) return;
        bar.update(bar.total);
        bar.terminate();
        bar = null;
    }
    export function terminate():void {
        if (bar === null) return;
        bar.terminate();
        bar = null;
    }
    export function tick(count?:number):void {
        if (bar === null) return;
        bar.tick(count);
    }
    export function printOnProgress(message:string):void {
        process.stdout.cursorTo(0);
        process.stdout.write(message);
        process.stdout.clearLine(1);
        console.log();
    }
}
