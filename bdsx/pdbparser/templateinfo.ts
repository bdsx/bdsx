import { templateName } from "../templatename";
import { PdbIdentifier } from "./symbolparser";
import { tsw } from "./tswriter";

interface Identifier extends PdbIdentifier {
    templateInfo?:TemplateInfo;
    filted?:boolean;
    keyIndex?:number;
}

const keys:Identifier[] = [];
function getKey(n:number):Identifier {
    let key = keys[n];
    if (key == null) {
        key = PdbIdentifier.make('#KEY'+n);
        key.keyIndex = n;
    }
    return key;
}
function getUnionNew(keys:Identifier[]):Identifier {
    const unioned:Identifier = PdbIdentifier.makeUnionedType(keys);
    unioned.keyIndex = -1;
    return unioned;
}

function keyUnionAppend(base:Identifier, key:Identifier):Identifier {
    if (base.keyIndex == null) throw Error(`not key`);
    if (base.unionedTypes !== null) {
        if (base.unionedTypes.has(key)) return base;
        const unioned:Identifier = base.unionWith(key);
        unioned.keyIndex = -1;
        return unioned;
    } else {
        return getUnionNew([base, key]);
    }
}

class ReplacingMap {

    private replacedCount = 0;

    constructor(public item:Identifier) {
    }

    replace(idx:number):void {
        idx++;
        for (let i=this.replacedCount;i<idx;i++) {
            const param:Identifier = this.item.templateParameters[i];
            if (param.keyIndex == null) {
                this.item = this.item.replaceTypeCascade(param, getKey(i));
            } else {
                this.item = this.item.replaceTypeCascade(param, keyUnionAppend(param, getKey(i)));
            }
        }
        this.replacedCount = idx;
    }
}

class ComparingBase {
    constructor(public base:Identifier) {
    }

    check(target:Identifier|null|undefined):boolean {
        const res = ComparingBase.check(target, this.base);
        if (res === null) return false;
        this.base = res;
        return true;
    }

    static check(target:Identifier|null|undefined, base:Identifier|null|undefined):Identifier|null {
        if (target === base) return base || null;
        if (target == null || base == null) return null;
        if (target.keyIndex != null && base.keyIndex != null) {
            if (target.unionedTypes !== null) {
                if (base.unionedTypes !== null) return null;
                return target.unionedTypes.has(base) ? base : null;
            } else {
                if (base.unionedTypes !== null) {
                    return base.unionedTypes.has(target) ? target : null;
                } else {
                    return base.keyIndex === target.keyIndex ? base : null;
                }
            }
        }
        if (target.deco !== base.deco) return null;
        if (target.decoedFrom !== null) {
            const res = ComparingBase.check(target.decoedFrom, base.decoedFrom);
            if (res === null) return null;
            if (base.decoedFrom !== res) {
                base = res.decorate(base.deco!);
            }
        }
        if (target.functionBase !== null) {
            if (base.functionBase === null) return null;

            let bparams:PdbIdentifier[]|null = null;
            const aparams = target.functionParameters;
            for (let i=0;i<aparams.length;i++) {
                const bparam:Identifier = base.functionParameters[i];
                const res = ComparingBase.check(aparams[i], bparam);
                if (res === null) return null;
                if (bparam !== res) {
                    if (bparams === null) bparams = base.functionParameters.slice();
                    bparams[i] = res;
                }
            }

            let res = ComparingBase.check(target.functionBase, base.functionBase);
            if (res === null) return null;
            if (base.functionBase !== res) {
                if (bparams === null) bparams = base.functionParameters.slice();
            }

            res = ComparingBase.check(target.returnType, base.returnType);
            if (res === null) return null;
            if (base.returnType !== res) {
                if (bparams === null) bparams = base.functionParameters.slice();
            }

            if (bparams !== null) {
                base = base.functionBase!.makeFunction(bparams, res.returnType, res.isType);
            }
        }
        if (target.templateBase !== null) {
            let bparams:PdbIdentifier[]|null = null;
            const atemplates = target.templateParameters;
            for (let i=0;i<atemplates.length;i++) {
                const btemplate:Identifier = base.templateParameters[i];
                const res = ComparingBase.check(atemplates[i], btemplate);
                if (res === null) return null;
                if (btemplate !== res) {
                    if (bparams === null) bparams = base.functionParameters.slice();
                    bparams[i] = res;
                }
            }

            const res = ComparingBase.check(target.templateBase, base.templateBase);
            if (res === null) return null;
            if (base.templateBase !== res) {
                if (bparams === null) bparams = base.functionParameters.slice();
            }
            if (bparams !== null) {
                base = res.makeSpecialized(bparams);
            }
        }

        let res = ComparingBase.check(target.returnType, base.returnType);
        if (res === null) return null;
        if (base.returnType !== res) {
            throw Error(`not implemented`);
        }

        res = ComparingBase.check(target.memberPointerBase, base.memberPointerBase);
        if (res === null) return null;
        if (base.memberPointerBase !== res) {
            throw Error(`not implemented`);
        }

        return base;
    }
}


function checkParameterDupplication(specialized:Identifier[]):number {
    const replacingMap = specialized.map(v=>new ReplacingMap(v));
    let paramIndex = 0;
    _notMatched:for (;;) {
        const count = paramIndex+1;

        const pair = replacingMap[0];
        if (pair.item.templateParameters.length <= count) {
            return 0;
        }
        pair.replace(paramIndex);
        const base = new ComparingBase(pair.item);

        for (let i=1;i<replacingMap.length;i++) {
            const pair = replacingMap[i];
            if (pair.item.templateParameters.length <= count) {
                return 0;
            }
            pair.replace(paramIndex);
            if (base.check(pair.item)) continue;
            base.check(pair.item);
            paramIndex++;
            continue _notMatched;
        }
        return count;
    }
}

export class TemplateDeclParam {
    constructor(
        public readonly name:string,
        public readonly type:Identifier,
        public readonly typeWrapped:Identifier,
        public readonly variadic:boolean
    ) {
    }
}

export class TemplateInfo {

    static reduceTemplateType(base:Identifier):void {
        const count = checkParameterDupplication(base.specialized);
        if (count === 0) return;

        for (const s of base.specialized) {
            s.templateParameters.length = count;

            (s as Identifier).filted = undefined;
            const newkey = PdbIdentifier.makeTemplateKey(base, s.templateParameters);
            const already = PdbIdentifier.keyMap.get(newkey);
            if (already != null) {
                throw Error(`failed to reduce template, already defined (new=${already.name}, already=${already.originalName}, old=${s})`);
            }

            s.name = templateName(base.name, ...s.templateParameters.map(v=>v.toString()));
            PdbIdentifier.keyMap.set(newkey, s);

        }
    }

    constructor(
        public readonly parent:TemplateInfo|null,
        public readonly paramTypes:TemplateDeclParam[],
        public readonly parameters:(Identifier|Identifier[])[],
        public readonly variadicOffsetOfThis:number,
    ) {
    }

    makeTemplateDecl(toTsw:(item:PdbIdentifier)=>tsw.Type):tsw.TemplateDecl {
        const out:[string, (tsw.Type|null)?][] = [];
        for (const param of this.paramTypes) {
            if (param.variadic) {
                out.push([param.name, new tsw.ArrayType(toTsw(param.type))]);
            } else {
                if (param.type === PdbIdentifier.any_t) {
                    out.push([param.name]);
                } else {
                    out.push([param.name, toTsw(param.type)]);
                }
            }
        }
        return new tsw.TemplateDecl(out);
    }

    makeWrappedTemplateDecl(toTsw:(item:PdbIdentifier)=>tsw.Type):tsw.TemplateDecl {
        const out:[string, (tsw.Type|null)?][] = [];
        for (const param of this.paramTypes) {
            if (param.variadic) {
                out.push([param.name, new tsw.ArrayType(toTsw(param.typeWrapped))]);
            } else {
                if (param.typeWrapped === PdbIdentifier.any_t) {
                    out.push([param.name]);
                } else {
                    out.push([param.name, toTsw(param.typeWrapped)]);
                }
            }
        }
        return new tsw.TemplateDecl(out);
    }

    appendTypes(types:PdbIdentifier[], variadicType:PdbIdentifier|null):void {
        let i = this.paramTypes.length;
        for (const t of types) {
            this.paramTypes.push(new TemplateDeclParam(
                `T${i++}`,
                t.unwrapType(),
                t,
                false
            ));
        }
        if (variadicType !== null) {
            this.paramTypes.push(new TemplateDeclParam(
                `T${i++}`,
                variadicType.unwrapType(),
                variadicType,
                true
            ));
        }
    }

    static from(item:Identifier):TemplateInfo {
        if (item.templateInfo != null) {
            return item.templateInfo;
        }
        if (item.parent === null) {
            item.templateInfo = TEMPLATE_INFO_EMPTY;
            return item.templateInfo;
        }

        const parentInfo = TemplateInfo.from(item.parent);
        let parameters:(Identifier|Identifier[])[] = parentInfo.parameters;

        if (item.specialized.length !== 0) {
            const first = item.specialized[0];
            let count = first.templateParameters.length;
            const slen = item.specialized.length;
            for (let i=1;i<slen;i++) {
                const n = item.specialized[i].templateParameters.length;
                if (n !== count) {
                    if (n < count) count = n;
                }
            }

            let types:Identifier[]|null = null;
            let variadicType:Identifier|null = null;
            for (const s of item.specialized) {
                if (!PdbIdentifier.filter(s)) continue;

                let j=0;
                const srctypes = s.templateParameters;
                if (types === null) {
                    types = [];
                    for (;j<count;j++) {
                        const srctype = srctypes[j];
                        types.push(srctype.getTypeOfIt());
                    }
                } else {
                    for (;j<count;j++) {
                        const srctype = srctypes[j];
                        types[j] = types[j].unionWith(srctype.getTypeOfIt());
                    }
                }
                for (;j<srctypes.length;j++) {
                    const srctype = srctypes[j];
                    if (variadicType === null) {
                        variadicType = srctype.getTypeOfIt();
                    } else {
                        variadicType = variadicType.unionWith(srctype.getTypeOfIt());
                    }
                }
            }
            if (types === null) {
                item.templateInfo = new TemplateInfo(
                    parentInfo,
                    parentInfo.paramTypes,
                    parameters,
                    -1,
                );
            } else {
                let variadicOffset:number;
                if (variadicType !== null) {
                    variadicOffset = types.length;
                } else {
                    variadicOffset = -1;
                }
                item.templateInfo = new TemplateInfo(
                    parentInfo,
                    parentInfo.paramTypes.slice(),
                    parameters,
                    variadicOffset
                );
                item.templateInfo.appendTypes(types, variadicType);
            }
        } else if (item.templateBase !== null) {
            const base = TemplateInfo.from(item.templateBase);
            if (item.templateParameters.length !== 0) {
                if (base.variadicOffsetOfThis !== -1) {
                    const args = item.templateParameters.slice(base.variadicOffsetOfThis);
                    for (const arg of args) {
                        if (arg instanceof Array) {
                            throw Error(`Unexpected array`);
                        }
                    }
                    parameters = parameters.concat(item.templateParameters.slice(0, base.variadicOffsetOfThis), [args]);
                } else {
                    parameters = parameters.concat(item.templateParameters);
                }
            }

            item.templateInfo = new TemplateInfo(
                parentInfo,
                base.paramTypes,
                parameters,
                base.variadicOffsetOfThis
            );
        } else {
            if (parentInfo.parameters.length === 0) {
                item.templateInfo = TEMPLATE_INFO_EMPTY;
            } else {
                item.templateInfo = new TemplateInfo(
                    parentInfo,
                    parentInfo.paramTypes,
                    parameters,
                    -1
                );
            }
        }

        return item.templateInfo;
    }

}
const TEMPLATE_INFO_EMPTY = new TemplateInfo(null, [], [], -1);
