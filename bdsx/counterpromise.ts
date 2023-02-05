export class CounterPromise {
    private resolve: (() => void) | null = null;
    private counter = 0;
    private prom: Promise<void> = Promise.resolve();

    increase(): void {
        if (this.counter === Number.MAX_SAFE_INTEGER) throw Error("counter overflow");
        if (this.counter === 0) {
            this.prom = new Promise<void>(resolve => {
                this.resolve = resolve;
            });
        }
        this.counter++;
    }

    decrease(): void {
        if (this.counter === 0) throw Error("counter overflow");
        this.counter--;
        if (this.counter === 0) {
            this.resolve!();
            this.resolve = null;
        }
    }

    /**
     * wait till the counter is zero.
     */
    wait(): Promise<void> {
        return this.prom;
    }
}
