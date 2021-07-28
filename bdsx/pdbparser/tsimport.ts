import { unreachable } from "../common";
import { tsw } from "./tswriter";
import path = require('path');

const modulePathes = new Set<string>();

class ImportName {
    public value:tsw.Name|null = null;
    public type:tsw.TypeName|null = null;

    constructor(
        public readonly name:string) {
    }


    import<T extends tsw.Kind>(kind:T):tsw.KindToName<T> {
        if (tsw.isIdentifier(kind)) {
            if (this.value === null) {
                this.value = new tsw.Name(this.name);
            }
            return this.value as any;
        } else if (tsw.isType(kind)) {
            if (this.type === null) {
                this.type = new tsw.TypeName(this.name);
            }
            return this.type as any;
        } else {
            unreachable();
        }
    }
}

class ImportTarget {
    public readonly imports:Map<string, ImportName> = new Map;
    public readonly direct:ImportName[] = [];

    constructor(public readonly path:string) {
    }

    append(other:ImportTarget):void {
        const news:ImportName[] = [];
        for (const direct of other.direct) {
            if (this.direct.some(v=>v.name === direct.name)) continue;
            news.push(direct);
        }
        this.direct.push(...news);

        for (const [name, value] of other.imports) {
            const already = this.imports.get(name);
            if (already == null) {
                this.imports.set(name, value);
            } else {
                if (already.name !== value.name) throw new Error(`import name is dupplicated (name=${name}, ${already.name}, ${value.name})`);
            }
        }
    }
}

export class TsFile {
    public readonly imports = new ImportInfo(this);
    constructor(
        public readonly path:string
    ) {
        if (modulePathes.has(path)) throw Error(`${path}: Filename dupplicated`);
        modulePathes.add(path);
    }

    makeTarget():ImportTarget {
        return new ImportTarget(this.path);
    }

    existName(name:string):boolean {
        return this.imports.existName(name);
    }

    existNameInScope(name:string):boolean {
        return false;
    }

}

export class ImportInfo {
    public readonly imports = new Map<TsFile, ImportTarget>();
    private readonly globalNames = new Map<string, number>();

    constructor(public readonly base:TsFile|null) {
    }

    append(other:ImportInfo):void {
        for (const [file, target] of other.imports) {
            const already = this.imports.get(file);
            if (already == null) {
                this.imports.set(file, target);
            } else {
                already.append(target);
            }
        }
    }

    existName(name:string):boolean {
        return this.globalNames.has(name);
    }

    makeGlobalName(name:string):string {
        let counter:number|undefined;
        for (;;) {
            counter = this.globalNames.get(name);
            if (counter == null) {
                if (this.base !== null && this.base.existName(name)) {
                    this.globalNames.set(name, 1);
                    continue;
                }
                this.globalNames.set(name, 1);
                return name;
            }
            break;
        }
        for (;;) {
            const nname = name + (++counter);
            if (!this.globalNames.has(nname)) {
                this.globalNames.set(nname, counter);
                return nname;
            }
        }
    }

    importDirect<T extends tsw.Kind>(hint:unknown, module:TsFile|null|undefined, kind:T):tsw.KindToName<T> {
        if (module === undefined) {
            throw Error(`host not found (${hint})`);
        }
        if (module === this.base) {
            throw Error(`self import (${hint})`);
        }
        if (module === null) {
            throw Error(`is const identifier (${hint})`);
        }
        let target = this.imports.get(module);
        if (target == null) {
            this.imports.set(module, target = module.makeTarget());
        }
        if (target.direct.length !== 0) {
            for (const direct of target.direct) {
                if (this.base !== null && this.base.existNameInScope(direct.name)) {
                    continue;
                }
                return direct.import(kind);
            }
        }
        const name = path.basename(module.path);
        const varname = this.makeGlobalName(name);
        const direct = new ImportName(varname);
        target.direct.push(direct);
        direct.import(tsw.Identifier);
        return direct.import(kind);
    }

    importName<T extends tsw.Kind>(host:TsFile|undefined|null, name:string, kind:T):tsw.KindToItem<T> {
        if (host === this.base) {
            return kind.asName(name);
        }

        if (host === undefined) {
            throw Error(`host not found (${name})`);
        }
        if (host === null) {
            return kind.asName(name);
        }
        let target = this.imports.get(host);
        if (!target) this.imports.set(host, target = host.makeTarget());

        let imported = target.imports.get(name);
        let renamed:string;
        if (imported == null) {
            renamed = this.makeGlobalName(name);
            imported = new ImportName(renamed);
            target.imports.set(name, imported);
        } else {
            renamed = imported.name;
        }

        if (this.base !== null && this.base.existNameInScope(renamed)) {
            const module = this.importDirect(name, host, kind);
            return module.member(name);
        }
        return imported.import(kind);
    }

    toTsw():(tsw.Import|tsw.ImportDirect|tsw.ImportType)[] {
        const imports:(tsw.Import|tsw.ImportDirect|tsw.ImportType)[] = [];
        for (const target of this.imports.values()) {
            for (const direct of target.direct) {
                imports.push(new tsw.ImportDirect(direct.value!, target.path));
            }
            const types:[tsw.NameProperty, tsw.TypeName][] = [];
            const values:[tsw.NameProperty, tsw.Name][] = [];
            for (const [name, imported] of target.imports) {
                if (imported.value !== null) {
                    values.push([new tsw.NameProperty(name), imported.value]);
                } else {
                    types.push([new tsw.NameProperty(name), imported.type!]);
                }
            }
            if (types.length !== 0) imports.push(new tsw.ImportType(types, target.path));
            if (values.length !== 0) imports.push(new tsw.Import(values, target.path));
        }
        return imports;
    }

}
