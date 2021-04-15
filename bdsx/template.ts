import { NativeClass, NativeClassType } from "./nativeclass";
import { arrayEquals } from "./util";


export interface NativeTemplateFunction<FN extends (...args:any[])=>any> {
    (...args:FN extends (...args:infer ARGS)=>any ? ARGS : never):FN extends (...args:any[])=>infer RET ? RET : never;
    make(fn:FN, ...templateArgs:any[]):void;
}

export namespace NativeTemplateFunction {
    export function make<FN extends (...args:any[])=>any>(templateCount:number):NativeTemplateFunction<FN> {
        const specialized:[any[], FN][] = [];
        const tfunc = ((...args:any[]):void=>{
            const realargs = args.splice(templateCount);
            for (const [sargs, fn] of specialized) {
                if (!arrayEquals(args, sargs, templateCount)) continue;
                return fn(...realargs);
            }
            throw Error(`template function not found`);
        }) as NativeTemplateFunction<any>;
        tfunc.make = (fn:FN, ...templateArgs:any[]):void=> {
            specialized.push([templateArgs, fn]);
        };
        return tfunc;
    }
}

export class NativeTemplateClass extends NativeClass {
    static make<T extends NativeTemplateClass, V extends NativeClass, ITEMS extends {new():V}[]>(this:{new():T}, ...items:ITEMS):NativeClassType<T> {
        const base = this as NativeClassType<T>;
        class SpecializedTemplateClass extends (this as {new():NativeClass}) {
        }
        Object.defineProperty(SpecializedTemplateClass, 'name', {value: `${base.name}<${items.map(item=>item.name).join(',')}>`});
        return base;
    }
}
