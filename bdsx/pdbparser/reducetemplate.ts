import { notImplemented } from "../common";
import { templateName } from "../templatename";
import { PdbId } from "./symbolparser";

interface Identifier extends PdbId<PdbId.Data> {
    filted?:boolean;
}

class ReplacingMap {

    private replacedCount = 0;

    constructor(public item:Identifier) {
    }

    replace(idx:number):void {
        idx++;
        for (let i=this.replacedCount;i<idx;i++) {
            const param:Identifier = this.item.templateParameters![i];
            if (param.data instanceof PdbId.KeyType) {
                this.item = this.item.replaceType(param, param.data.unionWith(PdbId.Key.make(i)));
            } else {
                this.item = this.item.replaceType(param, PdbId.Key.make(i));
            }
        }
        this.replacedCount = idx;
    }
}

class ComparingBase {
    constructor(public base:Identifier) {
    }

    check(target:Identifier|null|undefined):boolean {
        const res = ComparingBase.equals(target, this.base);
        if (res === null) return false;
        this.base = res;
        return true;
    }

    static equals(target:Identifier|null|undefined, base:Identifier|null|undefined):Identifier|null {
        if (target === base) return base || null;
        if (target == null || base == null) return null;
        const bdata = base.data;
        const tdata = target.data;

        if (tdata instanceof PdbId.KeyType) {
            if (!(bdata instanceof PdbId.KeyType)) return null;

            if (tdata instanceof PdbId.Keys) {
                if (bdata instanceof PdbId.Keys) return null;
                return tdata.keys.has(base as PdbId<PdbId.Key>) ? base : null;
            } else {
                if (bdata instanceof PdbId.Keys) {
                    return bdata.keys.has(target as PdbId<PdbId.Key>) ? target : null;
                } else {
                    return (bdata as PdbId.Key).keyIndex === (tdata as PdbId.Key).keyIndex ? base : null;
                }
            }
        } else {
            if (bdata instanceof PdbId.KeyType) return null;
        }
        if (tdata instanceof PdbId.Decorated) {
            if (!(bdata instanceof PdbId.Decorated)) return null;

            if (tdata.deco !== bdata.deco) return null;
            const res = ComparingBase.equals(tdata.base, bdata.base);
            if (res === null) return null;
            if (bdata.base !== res) {
                base = res.decorate(bdata.deco);
            }
        } else {
            if (bdata instanceof PdbId.Decorated) return null;
        }
        if (tdata instanceof PdbId.Function) {
            if (!(bdata instanceof PdbId.Function)) return null;

            let bparams:PdbId<PdbId.Data>[]|null = null;
            const aparams = tdata.functionParameters;
            for (let i=0;i<aparams.length;i++) {
                const bparam:Identifier = bdata.functionParameters[i];
                const res = ComparingBase.equals(aparams[i], bparam);
                if (res === null) return null;
                if (bparam !== res) {
                    if (bparams === null) bparams = bdata.functionParameters.slice();
                    bparams[i] = res;
                }
            }

            const res = ComparingBase.equals(tdata.functionBase, bdata.functionBase);
            if (res === null) return null;
            if (bdata.functionBase !== res) {
                if (bparams === null) bparams = bdata.functionParameters.slice();
            }

            const returnType = ComparingBase.equals(tdata.returnType, bdata.returnType);
            if (returnType === null) return null;
            if (bdata.returnType !== returnType) {
                if (bparams === null) bparams = bdata.functionParameters.slice();
            }

            if (bparams !== null) {
                base = bdata.functionBase.data.makeFunction(returnType, bparams, tdata.constructor as PdbId.FunctionKind);
            }
            return base;
        } else {
            if (bdata instanceof PdbId.Function) return null;
        }
        if (target.templateBase !== null) {
            if (base.templateBase === null) {
                return null;
            }
            let bparams:PdbId<PdbId.Data>[]|null = null;
            const atemplates = target.templateParameters!;
            for (let i=0;i<atemplates.length;i++) {
                const btemplate:Identifier = base.templateParameters![i];
                const res = ComparingBase.equals(atemplates[i], btemplate);
                if (res === null) return null;
                if (btemplate !== res) {
                    if (bparams === null) bparams = base.templateParameters!.slice();
                    bparams[i] = res;
                }
            }

            const res = ComparingBase.equals(target.templateBase, base.templateBase) as PdbId<PdbId.TemplateBase>;
            if (res === null) return null;
            if (base.templateBase !== res) {
                if (bparams === null) bparams = base.templateParameters!.slice();
            }
            if (bparams !== null) {
                base = res.data.makeSpecialized(bparams);
            }
            return base;
        } else {
            if (base.templateBase !== null) {
                return null;
            }
        }

        if (tdata instanceof PdbId.ReturnAble) {
            if (!(bdata instanceof PdbId.ReturnAble)) return null;
            const res = ComparingBase.equals(tdata.returnType, bdata.returnType);
            if (res === null) return null;
            if (bdata.returnType !== res) {
                notImplemented();
            }
        } else {
            if (bdata instanceof PdbId.ReturnAble) return null;
        }

        if (tdata instanceof PdbId.MemberFunctionType) {
            if (!(bdata instanceof PdbId.MemberFunctionType)) return null;
            const res = ComparingBase.equals(tdata.memberPointerBase, bdata.memberPointerBase);
            if (res === null) return null;
            if (bdata.memberPointerBase !== res) {
                notImplemented();
            }
            return base;
        } else {
            if (bdata instanceof PdbId.MemberFunctionType) return null;
        }

        return null;
    }
}


function checkParameterDupplication(specialized:Identifier[]):number {
    if (specialized.length === 0) return 0;
    const replacingMap = specialized.map(v=>new ReplacingMap(v));
    let paramIndex = 0;
    _notMatched:for (;;) {
        const count = paramIndex+1;

        const replacer = replacingMap[0];
        if (replacer.item.templateParameters!.length <= count) {
            return 0;
        }
        replacer.replace(paramIndex);
        const base = new ComparingBase(replacer.item);

        for (let i=1;i<replacingMap.length;i++) {
            const replacer = replacingMap[i];
            if (replacer.item.templateParameters!.length <= count) {
                return 0;
            }
            replacer.replace(paramIndex);
            if (base.check(replacer.item)) continue;
            base.check(replacer.item);
            paramIndex++;
            continue _notMatched;
        }
        return count;
    }
}

export function reduceTemplateTypes():void {
    console.log(`[symbolwriter.ts] Reducing template types...`);
    for (const item of PdbId.global.loopAll()) {
        if (item.is(PdbId.TemplateBase)) {
            const count = checkParameterDupplication(item.data.specialized);
            if (count === 0) continue;

            for (const s of item.data.specialized) {
                s.templateParameters!.length = count;

                (s as Identifier).filted = undefined;
                const newkey = PdbId.makeTemplateKey(item, s.templateParameters!);
                const already = PdbId.keyMap.get(newkey);
                if (already != null) {
                    throw Error(`failed to reduce template, already defined (dupplicated=${already.name}, old=${already.originalName}, new=${s.originalName})`);
                }

                s.name = templateName(item.name, ...s.templateParameters!.map(v=>v.toString()));
                PdbId.keyMap.set(newkey, s);
            }
        }
    }
}
