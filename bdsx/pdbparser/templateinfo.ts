import { notImplemented } from "../common";
import { PdbId } from "./symbolparser";
import { tsw } from "./tswriter";

interface Identifier extends PdbId<PdbId.Data> {
    templateInfo?:TemplateInfo;
    filted?:boolean;
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
    constructor(
        public readonly parent:TemplateInfo|null,
        public readonly paramTypes:TemplateDeclParam[],
        public readonly parameters:(Identifier|Identifier[])[],
        public readonly variadicOffsetOfThis:number,
    ) {
    }


    infer(template:PdbId<PdbId.Data>[]):PdbId<PdbId.Data>[]|null {
        const n = template.length;
        if (n !== this.parameters.length) return null;
        const out:PdbId<PdbId.Data>[] = [];
        for (let i=0;i<n;i++) {
            const type = this.parameters[i];
            if (type instanceof Array) {
                notImplemented();
            } else {
                const key = template[i];
                if (type.infer(key, out) === null) return null;
            }
        }
        return out;
    }

    makeTemplateDecl(toTsw:(item:PdbId<PdbId.Data>)=>tsw.Type):tsw.TemplateDecl {
        const out:[string, (tsw.Type|null)?][] = [];
        for (const param of this.paramTypes) {
            if (param.variadic) {
                out.push([param.name, new tsw.ArrayType(toTsw(param.type))]);
            } else {
                if (param.type === PdbId.any_t) {
                    out.push([param.name]);
                } else {
                    out.push([param.name, toTsw(param.type)]);
                }
            }
        }
        return new tsw.TemplateDecl(out);
    }

    makeWrappedTemplateDecl(toTsw:(item:PdbId<PdbId.Data>)=>tsw.Type):tsw.TemplateDecl {
        const out:[string, (tsw.Type|null)?][] = [];
        for (const param of this.paramTypes) {
            if (param.variadic) {
                out.push([param.name, new tsw.ArrayType(toTsw(param.typeWrapped))]);
            } else {
                if (param.typeWrapped === PdbId.any_t) {
                    out.push([param.name]);
                } else {
                    out.push([param.name, toTsw(param.typeWrapped)]);
                }
            }
        }
        return new tsw.TemplateDecl(out);
    }

    appendTypes(types:PdbId<PdbId.Data>[], variadicType:PdbId<PdbId.Data>|null):void {
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
        try {
            if (item.templateInfo != null) {
                return item.templateInfo;
            }
            if (item.parent === null) {
                item.templateInfo = TEMPLATE_INFO_EMPTY;
                return item.templateInfo;
            }

            const parentInfo = TemplateInfo.from(item.parent);
            let parameters:(Identifier|Identifier[])[] = parentInfo.parameters;

            let types:Identifier[]|null = null;
            let variadicType:Identifier|null = null;

            const data = item.data;
            if (data instanceof PdbId.TemplateBase) {
                if (data.specialized.length !== 0) {
                    const first = data.specialized[0];
                    let count = first.templateParameters!.length;
                    const slen = data.specialized.length;
                    for (let i=1;i<slen;i++) {
                        const n = data.specialized[i].templateParameters!.length;
                        if (n !== count) {
                            if (n < count) count = n;
                        }
                    }
                    for (const s of data.specialized) {
                        if (!PdbId.filter(s)) continue;

                        let j=0;
                        const srctypes = s.templateParameters!;
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
                if (base.variadicOffsetOfThis !== -1) {
                    const args = item.templateParameters!.slice(base.variadicOffsetOfThis);
                    for (const arg of args) {
                        if (arg instanceof Array) {
                            throw Error(`Unexpected array`);
                        }
                    }
                    parameters = parameters.concat(item.templateParameters!.slice(0, base.variadicOffsetOfThis), [args]);
                } else {
                    parameters = parameters.concat(item.templateParameters!);
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
        } catch (err) {
            console.error('> TemplateInfo.from');
            throw err;
        }
    }
}
const TEMPLATE_INFO_EMPTY = new TemplateInfo(null, [], [], -1);
