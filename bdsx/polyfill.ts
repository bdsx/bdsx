
if (Promise.prototype.finally == null) {
    Promise.prototype.finally = function<T>(this:Promise<T>, onfinally?: (() => void) | undefined | null) {
        async function voiding(value:any):Promise<any> {
            if (!onfinally) return;
            onfinally();
            return value;
        }
        return this.then(voiding, voiding);
    };
}
