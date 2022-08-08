
/**
 * static the function returning for optimizing
 */
export function staticResult<CLS, NAME extends keyof CLS>(cls:{prototype:CLS}, fnname:NAME, fn:CLS[NAME]):void {
    function pipe(this:any):any{
        const result = (fn as any).apply(this, arguments);
        cls.prototype[fnname] = (()=>result) as any;
        return result;
    }
    cls.prototype[fnname] = pipe as any;
}
