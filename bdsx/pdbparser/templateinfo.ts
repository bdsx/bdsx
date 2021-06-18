import { templateName } from "../templatename";
import { PdbIdentifier } from "./symbolparser";
import { tsw } from "./tswriter";

interface Identifier extends PdbIdentifier {
    templateInfo?:TemplateInfo;
    filted?:boolean;
}

const keys:PdbIdentifier[] = [];
function getKey(n:number):PdbIdentifier {
    let key = keys[n];
    if (key == null) key = PdbIdentifier.global.make('#KEY'+n);
    return key;
}

class ReplacingMap {

    private replacedCount = 0;

    constructor(public item:Identifier) {
    }

    replace(idx:number):void {
        idx++;
        for (let i=this.replacedCount;i<idx;i++) {
            this.item = this.item.replaceTypeCascade(this.item.templateParameters[i], getKey(i));
        }
        this.replacedCount = idx;
    }
}

function checkParameterDupplication(specialized:Identifier[]):number {
    const replacingMap = specialized.map(v=>new ReplacingMap(v));
    let paramIndex = 0;
    _notMatched:for (;;) {
        const count = paramIndex+1;

        const pair = replacingMap[0];
        if (pair.item.templateParameters.length <= count) return 0;
        pair.replace(paramIndex);
        const firstItem = pair.item;

        for (let i=1;i<replacingMap.length;i++) {
            const pair = replacingMap[i];
            if (pair.item.templateParameters.length <= count) return 0;
            pair.replace(paramIndex);
            if (pair.item === firstItem) continue;

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
            base.children.delete(s.name);
            s.name = templateName(base.name, ...s.templateParameters.map(v=>v.toString()));
            base.children.set(s.name, s);
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

