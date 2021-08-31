import { tsw } from "./tswriter";
import path = require('path');

const modulePathes = new Set<string>();

class ImportName {
    public value:tsw.Name|null = null;
    public type:tsw.TypeName|null = null;

    constructor(
        public readonly name:string) {
    }

    import(kind:tsw.Kind):tsw.ItemPair {
        const out = new tsw.ItemPair;
        if ((kind & tsw.Kind.Value) !== 0) {
            if (this.value === null) {
                this.value = new tsw.Name(this.name);
            }
            out.value = this.value;
        }
        if (((kind & tsw.Kind.Type) !== 0)) {
            if (this.type === null) {
                this.type = new tsw.TypeName(this.name);
            }
            out.type = this.type;
        }
        return out;
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
    public readonly imports = new TsImportInfo(this);
    constructor(
        public readonly path:string
    ) {
        if (modulePathes.has(path)) throw Error(`${path}: Filename dupplicated`);
        modulePathes.add(path);
    }

    existName(name:string):boolean {
        return this.imports.existName(name);
    }

    existNameInScope(name:string):boolean {
        return false;
    }

}

export class TsImportInfo {
    public readonly imports = new Map<TsFile, ImportTarget>();
    public readonly globalNames = new Map<string, number>();

    constructor(public readonly base:TsFile|null) {
    }

    getTarget(from:TsFile):ImportTarget {
        let target = this.imports.get(from);
        if (target == null) {
            target = new ImportTarget(from.path);
            this.imports.set(from, target);
        }
        return target;
    }

    append(other:TsImportInfo):void {
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
                    if (imported.type === null) throw Error(`${imported.name}: Imported but no type of value`);
                    types.push([new tsw.NameProperty(name), imported.type]);
                }
            }
            if (types.length !== 0) imports.push(new tsw.ImportType(types, target.path));
            if (values.length !== 0) imports.push(new tsw.Import(values, target.path));
        }
        return imports;
    }

}

export class TsImportItem {
    private target:ImportTarget|null = null;
    private basicImport:ImportName|null = null;

    constructor(
        public readonly base:TsFile,
        public readonly from:TsFile,
        public readonly name:string) {
    }

    private _importDirect(kind:tsw.Kind):tsw.ItemPair {
        const target = this.target!;
        if (target.direct.length !== 0) {
            for (const direct of target.direct) {
                const base = this.base.imports.base;
                if (base !== null && base.existNameInScope(direct.name)) {
                    continue;
                }
                return direct.import(kind);
            }
        }
        const name = path.basename(this.from.path);
        const varname = this.base.imports.makeGlobalName(name);
        const direct = new ImportName(varname);
        target.direct.push(direct);
        direct.import(tsw.Kind.Value);
        return direct.import(kind);
    }

    import(kind:tsw.Kind):tsw.ItemPair {
        if (this.basicImport === null) {
            if (this.target === null) {
                this.target = this.base.imports.getTarget(this.from);
            }

            let imported = this.target.imports.get(this.name);
            if (imported != null) {
                this.basicImport = imported;
            } else {
                const importName = this.base.imports.makeGlobalName(this.name);
                if (this.base.existNameInScope(importName)) {
                    this.base.imports.globalNames.delete(importName);
                    return this._importDirect(kind).member(this.name);
                }
                imported = new ImportName(importName);
                this.target.imports.set(this.name, imported);
                this.basicImport = imported;
                return this.basicImport.import(kind);
            }
        }

        const importName = this.basicImport.name;
        if (this.base.existNameInScope(importName)) {
            return this._importDirect(kind).member(this.name);
        }
        return this.basicImport.import(kind);
    }

    importValue():tsw.Value {
        return this.import(tsw.Kind.Value).value;
    }
    importType():tsw.Type {
        return this.import(tsw.Kind.Type).type;
    }
}
