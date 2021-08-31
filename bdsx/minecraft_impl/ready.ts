let resolver:(()=>void)|null = null;

export namespace minecraftTsReady {
    export const promise = new Promise<void>(resolve=>{
        resolver = resolve;
    });

    export function resolve():void {
        if (resolver === null) throw Error('minecraftTsReady is already resolved');
        const r = resolver;
        resolver = null;
        r();
    }
}
