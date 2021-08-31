import { PdbId } from "./symbolparser";

enum FieldType {
    Member,
    Static,
    InNamespace,
}

function getFieldType(item:PdbId<PdbId.Data>):FieldType {
    if (item.isStatic) {
        return FieldType.Static;
    }
    if (item.data instanceof PdbId.FunctionBase ||
        item.data instanceof PdbId.TemplateFunctionBase ||
        item.data instanceof PdbId.Function) {
        return FieldType.Member;
    }
    return FieldType.InNamespace;
}

export class PdbMember {
    public readonly overloads:PdbId<PdbId.Function>[] = [];
    public isStatic:boolean;
    constructor(public readonly base:PdbId<PdbId.Data>) {
    }
}

class IdFieldMap implements Iterable<PdbMember> {

    private readonly map = new Map<string, PdbMember>();

    append(list:Iterable<PdbMember>, isStatic:boolean):this {
        for (const item of list) {
            this.get(item.base, isStatic).overloads.push(...item.overloads);
        }
        return this;
    }

    get(base:PdbId<PdbId.Data>, isStatic:boolean):PdbMember {
        let nametarget:PdbId<PdbId.Data> = base;
        if (base.is(PdbId.Function)) {
            nametarget = base.data.functionBase;
        }
        if (base.templateBase !== null) {
            nametarget = base.templateBase;
        }

        let name = nametarget.name;
        if (base.is(PdbId.FunctionBase)) {
            if (base.data.isConstructor) {
                name = '#constructor';
                isStatic = false;
            } else if (base.data.isDestructor) {
                name = '#destructor';
                isStatic = false;
            }
        }

        let field = this.map.get(name);
        if (field != null) return field;
        field = new PdbMember(base);
        field.isStatic = isStatic;

        this.map.set(name, field);
        return field;
    }

    clear():void {
        this.map.clear();
    }

    get size():number {
        return this.map.size;
    }

    values():IterableIterator<PdbMember> {
        return this.map.values();
    }

    [Symbol.iterator]():IterableIterator<PdbMember> {
        return this.map.values();
    }
}

export class PdbMemberList {
    public readonly inNamespace = new IdFieldMap;
    public readonly staticMember = new IdFieldMap;
    public readonly member = new IdFieldMap;

    push(base:PdbId<PdbId.Data>, item:PdbId<PdbId.Function>):void {
        this.set(base, item).overloads.push(item);
    }

    set(base:PdbId<PdbId.Data>, item:PdbId<PdbId.Data> = base):PdbMember {
        if (base.templateBase !== null) {
            throw Error('base is template');
        }
        switch (getFieldType(item)) {
        case FieldType.Member: return this.member.get(base, false);
        case FieldType.Static: return this.staticMember.get(base, true);
        case FieldType.InNamespace: return this.inNamespace.get(base, false);
        }
    }

    sortedMember():PdbMember[]{
        return [...this.member].sort(nameSort);
    }
    sortedStaticMember():PdbMember[]{
        return [...this.staticMember].sort(nameSort);
    }
    sortedInNamespace():PdbMember[]{
        return [...this.inNamespace].sort(nameSort);
    }
}

function nameSort(a:PdbMember, b:PdbMember):number {
    return a.base.name.localeCompare(b.base.name);
}

