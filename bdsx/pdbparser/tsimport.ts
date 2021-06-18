import { tsw } from "./tswriter";
import path = require('path');

const filenames = new Set<string>();

class ImportName {
    constructor(
        public readonly name:string,
        public type:tsw.Kind) {
    }
}

class ImportTarget {
    public imports:Map<string, ImportName> = new Map;
    public varName:tsw.Name|null = null;

    constructor(public readonly path:string) {
    }
}

export class TsFileBase {
    public readonly imports = new ImportInfo(this);
    constructor(public readonly path:string) {
        if (filenames.has(path)) throw Error(`${path}: Filename dupplicated`);
        filenames.add(path);
    }

    makeTarget():ImportTarget {
        return new ImportTarget(this.path);
    }

    existName(name:string):boolean {
        return false;
    }

}

export class ImportInfo {
    public readonly imports = new Map<TsFileBase, ImportTarget>();
    private readonly globalNames = new Map<string, number>();

    constructor(public readonly base:TsFileBase|null) {
    }

    makeGlobalName(name:string):string {
        let counter:number|undefined;
        for (;;) {
            counter = this.globalNames.get(name);
            if (counter == null) {
                if (this.base !== null && !this.base.existName(name)) {
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

    importDirect(hint:unknown, module?:TsFileBase|null):tsw.Name {
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
        } else {
            if (target.varName !== null) {
                return target.varName;
            }
        }
        const name = path.basename(module.path);
        return target.varName = new tsw.Name(this.makeGlobalName(name));
    }

    importName<T extends tsw.Kind>(host:TsFileBase|undefined|null, name:string, kind:T):tsw.KindToName<T> {
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

        const imported = target.imports.get(name);
        let renamed:string;
        if (imported == null) {
            renamed = this.makeGlobalName(name);
            target.imports.set(name, new ImportName(renamed, kind));
        } else {
            renamed = imported.name;
            if (kind > imported.type) {
                imported.type = kind;
            }
        }
        return kind.asName(renamed);
    }

    toTsw():(tsw.Import|tsw.ImportDirect|tsw.ImportType)[] {
        const imports:(tsw.Import|tsw.ImportDirect|tsw.ImportType)[] = [];
        for (const target of this.imports.values()) {
            if (target.varName !== null) {
                imports.push(new tsw.ImportDirect(target.varName.name, target.path));
            }
            const types:[string, string][] = [];
            const values:[string, string][] = [];
            for (const [name, imported] of target.imports) {
                switch (imported.type) {
                case tsw.Type: types.push([name, imported.name]); break;
                case tsw.Identifier: values.push([name, imported.name]); break;
                }
            }
            if (types.length !== 0) imports.push(new tsw.ImportType(types, target.path));
            if (values.length !== 0) imports.push(new tsw.ImportType(values, target.path));
        }
        return imports;
    }

}
