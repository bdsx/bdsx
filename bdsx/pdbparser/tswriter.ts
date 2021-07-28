
import fs = require('fs');
import os = require('os');
import { abstract, unreachable } from '../common';
import { intToVarString } from '../util';

enum Precedence {
    Default=0,

    Dot=10,
    Call=11,
    ArrowFunction=12,

    AddSubtract=15,

    TypeArray=21,
    TypeOf=22,

    Optional=25,
    TypeAnd=26,
    TypeOr=27,

    FunctionType=30,

    As=40,

    Assign=50,
    Return=51,
    Comma=100,
}


function cannotCloneToDecl(obj:Record<string, any>):never {
    throw Error(`'${obj.constructor.name}' cannot be cloned to decl`);
}

abstract class OutStream {
    private len = 0;
    private _tab = '';
    private tabbed = false;

    lineBreakIfLong(sep:string):void {
        if (this.len >= 300) {
            this._write(sep.trimRight());
            this.lineBreak();
        } else {
            this._write(sep);
        }
    }

    lineBreak():void {
        this._write(os.EOL);
        this.tabbed = false;
        this.len = 0;
    }

    protected abstract _write(value:string):void;

    write(value:string):void {
        if (!this.tabbed) {
            this.tabbed = true;
            this._write(this._tab);
        }
        this.len += value.length;
        this._write(value);
    }
    *join<T>(params:Iterable<T>, glue:string, linePerComponent?:boolean):IterableIterator<T> {
        const iter = params[Symbol.iterator]();
        let v = iter.next();
        if (linePerComponent) {
            this.lineBreak();
        }
        this.tab();
        if (!v.done) {
            yield v.value;
            while (!(v = iter.next()).done) {
                if (linePerComponent) {
                    this._write(glue.trimRight());
                    this.lineBreak();
                } else {
                    this.lineBreakIfLong(glue);
                }
                yield v.value;
            }
        }
        this.detab();
        if (linePerComponent) {
            this.lineBreak();
        }
    }


    tab():void {
        this._tab += '    ';
    }
    detab():void {
        this._tab = this._tab.substr(0, this._tab.length-4);
    }
}

class StringOutStream extends OutStream {
    public result:string = '';

    protected _write(value:string):void {
        this.result += value;
    }
}

class FileOutStream extends OutStream {
    constructor(public readonly fd:number) {
        super();
    }

    protected _write(value:string):void {
        fs.writeSync(this.fd, value);
    }
}

export namespace tsw {

    export type Kind = typeof IdBase;
    export type KindToItem<T extends Kind> = T extends {prototype:infer I} ? I : never;
    export type KindToName<T extends Kind> = KindToItem<T>&KindToItem<T>['__name_type_dummy']&{name:string};

    export class JsCloningContext {
        constructor(
            public readonly block:Block,
            public readonly newBlock:Block) {
        }

        write(item:BlockItem):void {
            this.newBlock.write(item);
        }
    }

    export interface BlockItem extends ItemBase {
        blockedWriteTo(os:OutStream):void;
        writeJS(ctx:JsCloningContext):void;
        cloneToDecl():BlockItem|null;
    }

    export interface ClassItem {
        classedWriteTo(os:OutStream):void;
        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[]):void;
        cloneToDecl():ClassItem|null;
    }

    export interface DefinationHost {
        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type, isStatic:boolean):void;
        addVariable(name:Name|Property, returnType:Type, isStatic:boolean):void;
        const(name:Name, type:Type|null, value:Identifier):void;
    }

    export abstract class ItemBase {
        isDefination():this is Defination {
            return false;
        }
        toString(this:WritableItem|BlockItem|ClassItem):string {
            const os = new StringOutStream;
            if ('writeTo' in this) {
                this.writeTo(os);
            } else if ('blockedWriteTo' in this) {
                this.blockedWriteTo(os);
            } else {
                this.classedWriteTo(os);
            }
            return os.result.replace(/\r?\n/g, '');
        }
    }

    export abstract class Item extends ItemBase {
        readonly precedence:Precedence;
    }
    Object.defineProperty(Item.prototype, 'precedence', {value: Precedence.Default});

    export interface WritableItem {
        writeTo(os:OutStream):void;
    }

    export abstract class IdBase extends Item implements WritableItem {
        __name_type_dummy:unknown;
        public static asName<T extends Kind>(this:T,name:string):KindToName<T> {
            abstract();
        }
        abstract member<T extends IdBase>(this:T,name:string|Property):T;
        abstract writeTo(os:OutStream):void;
        wrappedWriteTo(os:OutStream, precedence:Precedence):void {
            if (this.precedence > precedence) {
                os.write('(');
                this.writeTo(os);
                os.write(')');
            } else {
                this.writeTo(os);
            }
        }
    }

    export abstract class Identifier extends IdBase implements BlockItem {
        __name_type_dummy:Name;

        public static asName<T extends Kind>(this:T,name:string):KindToName<T> {
            return new Name(name) as unknown as KindToName<T>;
        }
        member<T extends IdBase>(this:T,name:string|number|Property|Identifier):T{
            switch (typeof name) {
            case 'string':
                name = new NameProperty(name);
                break;
            case 'number':
                name = new BracketProperty(new Constant(name));
                break;
            default:
                if (name instanceof Identifier) {
                    name = new BracketProperty(name);
                }
                break;
            }
            return new Member(this as any, name) as any;
        }
        add(value:string|number|Identifier):Add{
            switch (typeof value) {
            case 'number':
            case 'string':
                value = new Constant(value);
                break;
            }
            return new Add(this, value);
        }
        subtract(value:string|number|Identifier):Subtract{
            switch (typeof value) {
            case 'number':
            case 'string':
                value = new Constant(value);
                break;
            }
            return new Subtract(this, value);
        }
        abstract cloneToDecl():Identifier|null;
        abstract cloneToJS(ctx:JsCloningContext):Identifier;
        writeJS(ctx:JsCloningContext):void {
            ctx.write(this.cloneToJS(ctx));
        }

        call(fnname:string|Property, params:Identifier[]):DotCall;
        call(params:Identifier[]):Call;
        call(paramsOrName:string|Property|Identifier[], params?:Identifier[]):DotCall|Call {
            if (paramsOrName instanceof Array) {
                return new Call(this, paramsOrName);
            } else {
                if (!(paramsOrName instanceof Property)) paramsOrName = new NameProperty(paramsOrName);
                return new DotCall(this, paramsOrName, params!);
            }
        }
        callNew(params:Identifier[]):New {
            return new New(this, params);
        }

        blockedWriteTo(os:OutStream):void {
            this.writeTo(os);
            os.write(';');
        }
    }

    export class Name extends Identifier {
        private prop:NameProperty|null = null;

        constructor(public readonly name:string) {
            super();
        }
        cloneToDecl():Name {
            return this;
        }
        cloneToJS(ctx:JsCloningContext):Name {
            return this;
        }
        writeTo(os:OutStream):void {
            os.write(this.name);
        }
        toProperty():NameProperty {
            if (this.prop !== null) return this.prop;
            return this.prop = new NameProperty(this.name);
        }

        public static readonly this = new Name('this');
        public static readonly require = new Name('require');
        public static readonly exports = new Name('exports');
        public static readonly super = new Name('super');

    }

    export class Constant extends Identifier {
        constructor(public value:string|number|boolean|null) {
            super();
        }

        cloneToDecl():Constant {
            return this;
        }
        cloneToJS(ctx:JsCloningContext):Constant {
            return this;
        }
        writeTo(os:OutStream):void {
            if (typeof this.value === 'string') {
                os.write(JSON.stringify(this.value));
            } else {
                os.write(this.value+'');
            }
        }

        public static readonly null = new Constant(null);
    }

    export class Comment extends ItemBase implements BlockItem, ClassItem {
        constructor(public readonly comment:string) {
            super();
        }

        toJS(ctx:JsCloningContext):Comment {
            return this;
        }
        writeJS(ctx:JsCloningContext):void {
            ctx.write(this);
        }
        cloneToDecl():Comment {
            return this;
        }
        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[]):void {
            dest.push(this);
        }
        classedWriteDecl(dest:ClassItem[]):void {
            dest.push(this);
        }
        blockedWriteTo(os:OutStream):void {
            os.write('// '+this.comment.trimRight());
        }
        classedWriteTo(os:OutStream):void {
            this.blockedWriteTo(os);
        }
    }

    export abstract class BinaryOperator extends Identifier {
        constructor(public first:Identifier, public second:Identifier) {
            super();
        }
        readonly operatorSymbol:string;

        cloneToDecl():this|null {
            unreachable();
        }
        cloneToJS(ctx:JsCloningContext):this {
            const ctor = this.constructor as any;
            return new ctor(this.first.cloneToJS(ctx), this.second.cloneToJS(ctx));
        }
        writeTo(os:OutStream):void {
            this.first.wrappedWriteTo(os, Precedence.AddSubtract);
            os.write(` ${this.operatorSymbol} `);
            this.second.wrappedWriteTo(os, Precedence.AddSubtract-1);
        }
    }

    export class Add extends BinaryOperator {
    }
    Object.defineProperty(Add.prototype, 'precedence', {value: Precedence.AddSubtract});
    Object.defineProperty(Add.prototype, 'operatorSymbol', {value:'+'});

    export class Subtract extends BinaryOperator {
    }
    Object.defineProperty(Subtract.prototype, 'precedence', {value: Precedence.AddSubtract});
    Object.defineProperty(Subtract.prototype, 'operatorSymbol', {value:'-'});

    export class Member extends Identifier {
        constructor(public readonly item:Identifier, public readonly property:Property) {
            super();
        }
        cloneToDecl():Member|null {
            const cloned = this.item.cloneToDecl();
            if (cloned === null) return null;
            return new Member(cloned, this.property);
        }
        cloneToJS(ctx:JsCloningContext):Member {
            return new Member(this.item.cloneToJS(ctx), this.property);
        }
        writeTo(os:OutStream):void {
            this.item.writeTo(os);
            this.property.memberedWriteTo(os);
        }
    }
    Object.defineProperty(Member.prototype, 'precedence', {value: Precedence.Dot});

    export abstract class Expression extends Identifier {

        cloneToDecl():null {
            return null;
        }
    }

    export class Assign extends Expression {
        constructor(public dest:Identifier, public src:Identifier) {
            super();
        }

        cloneToJS(ctx:JsCloningContext):Assign {
            return new Assign(this.dest.cloneToJS(ctx), this.src.cloneToJS(ctx));
        }
        writeTo(os:OutStream):void {
            this.dest.writeTo(os);
            os.write(' = ');
            this.src.writeTo(os);
        }
    }
    Object.defineProperty(Assign.prototype, 'precedence', {value: Precedence.Assign});

    export class As extends Expression {
        constructor(public value:Identifier, public type:Identifier) {
            super();
        }

        cloneToJS(ctx:JsCloningContext):Identifier {
            return this.value.cloneToJS(ctx);
        }
        writeTo(os:OutStream):void {
            this.value.writeTo(os);
            os.write(' as ');
            this.type.writeTo(os);
        }
    }
    Object.defineProperty(As.prototype, 'precedence', {value: Precedence.As});

    export class DotCall extends Member {
        constructor(
            thisVar:Identifier,
            callee:Property,
            public params:Identifier[]) {
            super(thisVar, callee);
        }
        cloneToJS(ctx:JsCloningContext):DotCall {
            return new DotCall(this.item.cloneToJS(ctx), this.property, this.params.map(p=>p.cloneToJS(ctx)));
        }
        writeTo(os:OutStream):void {
            super.writeTo(os);
            os.write('(');
            for (const item of os.join(this.params, ', ')) {
                item.writeTo(os);
            }
            os.write(')');
        }
    }
    Object.defineProperty(DotCall.prototype, 'precedence', {value: Precedence.Call});

    export class Call extends Expression {
        constructor(
            public callee:Identifier,
            public params:Identifier[]) {
            super();
        }
        cloneToJS(ctx:JsCloningContext):Call {
            return new Call(this.callee.cloneToJS(ctx), this.params.map(p=>p.cloneToJS(ctx)));
        }
        writeTo(os:OutStream):void {
            this.callee.wrappedWriteTo(os, this.precedence);
            os.write('(');
            for (const param of os.join(this.params, ', ')) {
                param.writeTo(os);
            }
            os.write(')');
        }
    }
    Object.defineProperty(DotCall.prototype, 'precedence', {value: Precedence.Call});

    export class New extends Expression {
        constructor(
            public clazz:Identifier,
            public params:Identifier[]) {
            super();
        }
        cloneToJS(ctx:JsCloningContext):New {
            return new New(this.clazz.cloneToJS(ctx), this.params.map(p=>p.cloneToJS(ctx)));
        }
        writeTo(os:OutStream):void {
            os.write(`new `);
            this.clazz.wrappedWriteTo(os, this.precedence);
            if (this.params.length === 0) return;
            os.write('(');
            for (const param of os.join(this.params, ', ')) {
                param.writeTo(os);
            }
            os.write(')');
        }
    }
    Object.defineProperty(New.prototype, 'precedence', {value: Precedence.Call});

    export class Return extends ItemBase implements BlockItem {
        constructor(public value:Identifier) {
            super();
        }
        cloneToDecl():never {
            cannotCloneToDecl(this);
        }
        writeJS(ctx:JsCloningContext):void {
            const value = this.value.cloneToJS(ctx);
            ctx.write(new Return(value));
        }
        blockedWriteTo(os:OutStream):void {
            os.write('return ');
            this.value.writeTo(os);
            os.write(';');
        }
    }

    export class Names {
        private readonly values = new Map<string, [Name, Defination, Identifier|null]>();
        private readonly types = new Map<string, [TypeName, Defination, Type]>();

        getValues():IterableIterator<[Name, Defination, Identifier|null]> {
            return this.values.values();
        }

        getTypes():IterableIterator<[TypeName, Defination, Type]> {
            return this.types.values();
        }

        addValue(name:Name, host:Defination, value:Identifier|null):void {
            this.values.set(name.name, [name, host, value]);
        }

        addType(name:TypeName, host:Defination, type:Type):void {
            this.types.set(name.name, [name, host, type]);
        }

        hasValue(name:string):boolean {
            return this.values.has(name);
        }

        getValue(name:Name):Defination|null {
            const v = this.values.get(name.name);
            if (v == null) return null;
            return v[1];
        }

        hasType(name:string):boolean {
            return this.types.has(name);
        }

        getType(name:TypeName):Defination|null {
            const v = this.types.get(name.name);
            if (v == null) return null;
            return v[1];
        }

        addNamesFrom(items:BlockItem[]):void {
            for (const item of items) {
                if (item.isDefination()) {
                    item.getDefineNames(this);
                } else if (item instanceof Export) {
                    item.item.getDefineNames(this);
                } else {
                    return;
                }
            }
        }
    }

    export class Block extends ItemBase implements BlockItem, DefinationHost {
        private readonly items:BlockItem[] = [];
        private readonly names = new Names;
        private temporalIndexCounter = 0;

        addValueName(name:Name, host:Defination, value:Identifier|null):void {
            this.names.addValue(name, host, value);
        }

        size():number {
            return this.items.length;
        }

        get(i:number):BlockItem {
            return this.items[i];
        }

        unshift(...items:BlockItem[]):void {
            this.names.addNamesFrom(items);
            // this.items.unshift(...item); // it made the "out of stack space" error with too many items
            const shift = items.length;
            const src = this.items;
            let n = src.length;
            src.length = n + shift;
            for (let i=n-1;i>=0;i--) {
                src[i+shift] = src[i];
            }
            n = items.length;
            for (let i=0;i<n;i++) {
                src[i] = items[i];
            }
        }

        write(...item:BlockItem[]):void {
            this.names.addNamesFrom(item);
            this.items.push(...item);
        }

        unshiftBlock(block:Block):void {
            this.unshift(...block.items);
        }

        writeBlock(block:Block):void {
            this.write(...block.items);
        }

        makeTemporalVariableName(...scopes:Block[]):Name {
            for (;;this.temporalIndexCounter++) {
                const varname = '$'+intToVarString(this.temporalIndexCounter);
                if (this.names.hasValue(varname)) continue;
                for (const scope of scopes) {
                    if (scope.names.hasValue(varname)) continue;
                }
                return new Name(varname);
            }
        }

        getValue(name:Name):Defination|null {
            return this.names.getValue(name);
        }

        getType(name:TypeName):Defination|null {
            return this.names.getType(name);
        }

        cloneToDecl():Block {
            const newblock = new Block;
            for (const item of this.items) {
                if (item instanceof Export) {
                    const cloned = item.cloneToDecl();
                    if (cloned === null) continue;
                    newblock.write(cloned);
                }
            }
            return newblock;
        }
        cloneToJS():Block {
            const newblock = new Block;
            const ctx = new JsCloningContext(this, newblock);
            for (const item of this.items) {
                item.writeJS(ctx);
            }
            return newblock;
        }

        comment(comment:string):void {
            this.items.push(new Comment(comment));
        }

        const(name:Name, type:Type|null, value:Identifier):void {
            this.write(new VariableDef('const', [
                new VariableDefineItem(name, type, value)
            ]));
        }
        assign(dest:Identifier, src:Identifier):Assign {
            const res = new Assign(dest, src);
            this.items.push(res);
            return res;
        }
        export(item:Exportable):Export {
            const res = new Export(item);
            this.write(res);
            return res;
        }
        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type, isStatic:boolean):void {
            if (!(name instanceof Name)) {
                name = name.toName(Identifier);
            }
            this.write(new Export(new FunctionDecl(name, params, returnType)));
        }
        addVariable(name:Name|Property, type:Type, isStatic:boolean):void {
            if (!(name instanceof Name)) {
                name = name.toName(Identifier);
            }
            this.write(new Export(new VariableDef('let', [new VariableDefineItem(name, type)])));
        }

        writeJS(ctx:JsCloningContext):void {
            ctx.write(this.cloneToJS());
        }
        private writeTo(os:OutStream):void {
            for (const item of this.items) {
                item.blockedWriteTo(os);
                os.lineBreak();
            }
        }
        blockedWriteTo(os:OutStream):void {
            os.write('{');
            os.tab();
            os.lineBreak();
            this.writeTo(os);
            os.detab();
            os.write('}');
        }

        save(filename:string):void {
            const fd = fs.openSync(filename, 'w');
            this.writeTo(new FileOutStream(fd));
            fs.closeSync(fd);
        }

        toString():string {
            return `{ [code block] }`;
        }
    }

    export abstract class DefineItem extends ItemBase {
        abstract getDefineNames(name:Names, host:Defination):void;
        abstract writeTo(os:OutStream):void;
        cloneToJS(ctx:JsCloningContext, isConstDefine:boolean):DefineItem|null {
            return this;
        }
        cloneToDecl():DefineItem {
            return this;
        }
        cloneToDeclNoOptional():DefineItem {
            return this;
        }
    }

    class OptionalIndicator extends Identifier {
        cloneToJS():OptionalIndicator {
            return this;
        }
        cloneToDecl():OptionalIndicator|null {
            return this;
        }
        writeTo(os:OutStream):void {
            // empty
        }
    }
    export const OPTIONAL = new OptionalIndicator;

    export class VariableDefineItem extends DefineItem {
        constructor(
            public name:Name,
            public type:Type|null = null,
            public initial:Identifier|null = null) {
            super();
        }

        cloneToJS(ctx:JsCloningContext, isConstDefine:boolean):DefineItem|null {
            if (isConstDefine && this.initial === null) {
                ctx.newBlock.comment(`${this.name.name} skipped, const without initialization`);
                return null;
            }
            return new VariableDefineItem(this.name, null, this.initial?.cloneToJS(ctx));
        }
        cloneToDecl():DefineItem {
            return new VariableDefineItem(this.name, this.type, this.initial !== null ? OPTIONAL : null);
        }
        cloneToDeclNoOptional():DefineItem {
            return new VariableDefineItem(this.name, this.type, null);
        }
        getDefineNames(name:Names, host:Defination):void {
            name.addValue(this.name, host, this.initial);
        }

        writeTo(os:OutStream):void {
            this.name.writeTo(os);
            if (this.initial === OPTIONAL) {
                os.write('?');
            }
            if (this.type !== null) {
                os.write(':');
                this.type.writeTo(os);
            }
            if (this.initial !== null && this.initial !== OPTIONAL) {
                os.write(' = ');
                this.initial.writeTo(os);
            }
        }
    }

    export class ObjectUnpackDefineItem extends DefineItem {
        constructor(
            public names:[NameProperty, Name][],
            public initial:Identifier) {
            super();
        }

        cloneToJS(ctx:JsCloningContext, isConstDefine:boolean):ObjectUnpackDefineItem {
            return new ObjectUnpackDefineItem(this.names, this.initial.cloneToJS(ctx));
        }
        cloneToDecl():DefineItem {
            throw Error(`not implemented yet`);
        }
        cloneToDeclNoOptional():DefineItem {
            throw Error(`not implemented yet`);
        }

        getDefineNames(names:Names, host:Defination):void {
            for (const [prop, name] of this.names) {
                names.addValue(name, host, null);
            }
        }


        writeTo(os:OutStream):void {
            os.write('{ ');
            for (const [from, to] of os.join(this.names, ', ')) {
                if (from.name === to.name) {
                    os.write(from.name);
                } else {
                    os.write(`${from.name}:${to.name}`);
                }
            }
            os.write(' } = ');
            this.initial.writeTo(os);
        }
    }

    export class ArrayUnpackDefineItem extends DefineItem {
        constructor(
            public names:Name[],
            public initial:Identifier) {
            super();
        }

        cloneToJS(ctx:JsCloningContext, isConstDefine:boolean):ArrayUnpackDefineItem {
            return new ArrayUnpackDefineItem(this.names, this.initial.cloneToJS(ctx));
        }
        cloneToDecl():DefineItem {
            throw Error(`not implemented yet`);
        }
        cloneToDeclNoOptional():DefineItem {
            throw Error(`not implemented yet`);
        }

        getDefineNames(names:Names, host:Defination):void {
            for (const name of this.names) {
                names.addValue(name, host, null);
            }
        }

        writeTo(os:OutStream):void {
            os.write('[');
            for (const item of os.join(this.names, ', ')) {
                os.write(item.name);
            }
            os.write(']=');
            this.initial.writeTo(os);
        }
    }

    export interface Defination extends BlockItem {
        isDefination():true;
        getDefineNames(names:Names):void;
        blockedWriteTo(os:OutStream):void;
        writeJS(ctx:JsCloningContext):void;
    }

    export interface Exportable extends Defination {
        cloneToExportedDecl():Exportable|null;
    }

    export class Defines extends ItemBase {
        constructor(public readonly defines:DefineItem[]) {
            super();
        }

        getDefineNames(names:Names, host:Defination):void {
            for (const def of this.defines) {
                def.getDefineNames(names, host);
            }
        }

        paramsCloneToJS(ctx:JsCloningContext, isConstDefine:boolean):DefineItem[] {
            const out:DefineItem[] = [];
            for (const def of this.defines) {
                const js = def.cloneToJS(ctx, isConstDefine);
                if (js === null) continue;
                out.push(js);
            }
            return out;
        }
        paramsCloneToDecl():DefineItem[] {
            return this.defines.map(def=>def.cloneToDecl());
        }
        paramsCloneToDeclNoOptional():DefineItem[] {
            return this.defines.map(def=>def.cloneToDeclNoOptional());
        }

        writeTo(os:OutStream):void {
            for (const item of os.join(this.defines, ', ')) {
                item.writeTo(os);
            }
        }
    }

    export abstract class ModifiedClassItem extends ItemBase implements ClassItem {
        constructor(public modifier:'public'|'protected'|'private'|null, public isStatic:boolean, public isReadonly:boolean) {
            super();
        }

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[]):void {
            this.modifier = null;
            this.isReadonly = false;
            dest.push(this);
        }
        classedWriteTo(os:OutStream):void {
            if (this.modifier !== null) {
                os.write(this.modifier+' ');
            }
            if (this.isStatic) {
                os.write('static ');
            }
            if (this.isReadonly) {
                os.write('readonly ');
            }
        }
        cloneToDecl():ClassItem {
            return this;
        }
    }

    export class ClassField extends ModifiedClassItem{
        constructor(public modifier:'public'|'protected'|'private'|null, isStatic:boolean, isReadonly:boolean,
            public name:Property,
            public type:Type|null = null,
            public initial:Identifier|null = null) {
            super(modifier, isStatic, isReadonly);
        }

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[]):void {
            if (this.initial !== null) throw Error('not implemented');
        }
        classedWriteDecl(dest:ClassItem[]):void {
            const field = new ClassField(this.modifier, this.isStatic, this.isReadonly, this.name, this.type, null);
            dest.push(field);
        }
        classedWriteTo(os:OutStream):void {
            super.classedWriteTo(os);
            this.name.classedWriteTo(os);
            if (this.type !== null) {
                os.write(':');
                this.type.writeTo(os);
            }
            if (this.initial !== null) {
                this.initial.writeTo(os);
            }
            os.write(';');
        }
    }

    export class TemplateDecl extends Item implements WritableItem {
        constructor(public params:[string, (Type|null)?][]) {
            super();
        }
        writeTo(os:OutStream):void {
            os.write('<');
            for (const [name, type] of os.join(this.params, ', ')) {
                os.write(name);
                if (type != null) {
                    os.write(' extends ');
                    type.writeTo(os);
                }
            }
            os.write('>');
        }
    }

    export class Class extends Identifier implements Defination, DefinationHost {
        private readonly items:ClassItem[] = [];
        public extends:Identifier|null = null;
        public templates:TemplateDecl|null = null;

        constructor(public name:Name) {
            super();
        }

        isDefination():true {
            return true;
        }

        write(item:ClassItem):void {
            this.items.push(item);
        }

        comment(comment:string):void {
            this.items.push(new Comment(comment));
        }

        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type, isStatic:boolean):void{
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new MethodDecl(null, isStatic, name, params, returnType));
        }
        addVariable(name:Name|Property, type:Type, isStatic:boolean):void {
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new ClassField(null, isStatic, false, name, type));
        }
        const(name:Name|Property, type:Type|null, value:Identifier):void {
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new ClassField(null, true, true, name, type, value));
        }

        cloneToJS(ctx:JsCloningContext):Class {
            const cls = new Class(this.name);
            cls.extends = this.extends;
            for (let i=0;i<this.items.length;i++) {
                this.items[i].classedWriteJS(ctx, cls.items);
            }
            return cls;
        }

        cloneToDecl():Class|null {
            return null;
        }
        cloneToExportedDecl():Class {
            const cls = new Class(this.name);
            cls.templates = this.templates;
            cls.extends = this.extends;
            for (const item of this.items) {
                const cloned = item.cloneToDecl();
                if (cloned === null) continue;
                cls.items.push(cloned);
            }
            return cls;
        }

        getDefineNames(names:Names):void {
            names.addValue(this.name, this, this);
        }

        writeTo(os:OutStream):void {
            os.write('class ');
            this.name.writeTo(os);
            if (this.templates !== null) {
                this.templates.writeTo(os);
            }
            if (this.extends !== null) {
                os.write(' extends ');
                this.extends.writeTo(os);
            }
            os.write(' {');
            os.tab();
            os.lineBreak();
            for (const item of this.items) {
                item.classedWriteTo(os);
                os.lineBreak();
            }
            os.detab();
            os.write('}');
        }

        blockedWriteTo(os:OutStream):void {
            this.writeTo(os);
        }
    }

    export class Namespace extends ItemBase implements Defination, BlockItem {
        constructor(
            public readonly name:Name,
            public readonly block:Block = new Block) {
            super();
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            const func = new ArrowFunctionDef([new VariableDefineItem(Name.exports)], null);
            func.block = this.block.cloneToJS();

            const already = ctx.newBlock.getValue(this.name);
            if (already == null) {
                ctx.write(new VariableDef('const', [
                    new VariableDefineItem(this.name, null, new ObjectDef([]))
                ]));
            }
            if (func.block.size() === 0) return;
            ctx.write(func.call([this.name]));
        }
        cloneToDecl():Namespace|null {
            return null;
        }
        cloneToExportedDecl():Namespace {
            const cloned = this.block.cloneToDecl();
            return new Namespace(this.name, cloned);
        }
        getDefineNames(names:Names):void {
            names.addValue(this.name, this, null);
        }

        blockedWriteTo(os:OutStream):void {
            os.write(`namespace ${this.name} `);
            this.block.blockedWriteTo(os);
        }
    }

    export class Export extends ItemBase implements BlockItem, Defination {
        constructor(public item:Exportable) {
            super();
        }

        isDefination():true {
            return true;
        }
        writeJS(ctx:JsCloningContext):void {
            const names = new Names;
            this.item.getDefineNames(names);
            this.item.writeJS(ctx);

            for (const [name] of names.getValues()) {
                ctx.write(new Assign(new Member(Name.exports, name.toProperty()), name));
            }
        }
        cloneToDecl():Export|null {
            const cloned = this.item.cloneToExportedDecl();
            if (cloned === null) return null;
            return new Export(cloned);
        }

        blockedWriteTo(os:OutStream):void {
            os.write(`export `);
            this.item.blockedWriteTo(os);
        }
        getDefineNames(names:Names):void {
            this.item.getDefineNames(names);
        }

        toString():string {
            return 'export '+this.item;
        }
    }

    export abstract class Type extends IdBase {
        __name_type_dummy:TypeName;

        member<T extends IdBase>(this:T,name:string|Property):T{
            if (!(name instanceof Property)) {
                name = new NameProperty(name);
            }
            return new TypeMember(this as any, name) as any;
        }
        union<T extends TypeUnion>(unionType:{new(types:Type[]):T}, ...others:Type[]):T {
            const out:Type[] = [this];
            for (const other of others) {
                if (other instanceof unionType) {
                    out.push(...other.types);
                } else {
                    out.push(other);
                }
            }
            return new unionType(out);
        }
        and(...others:Type[]):TypeAnd {
            return this.union(TypeAnd, ...others);
        }
        or(...others:Type[]):TypeOr {
            return this.union(TypeOr, ...others);
        }
        public static asName<T extends Kind>(this:T,name:string):KindToName<T> {
            return new TypeName(name) as any;
        }
        abstract toString():string;
    }
    export class TypeOf extends Type {
        constructor(public value:Identifier) {
            super();
        }
        writeTo(os:OutStream):void {
            os.write('typeof ');
            this.value.wrappedWriteTo(os, this.precedence);
        }
        toString():string {
            return 'typeof '+this.value;
        }
    }
    Object.defineProperty(TypeOf.prototype, 'precedence', {value: Precedence.TypeOf});
    export class TypeMember extends Type {
        constructor(public item:Type, public property:Property) {
            super();
        }
        writeTo(os:OutStream):void {
            this.item.writeTo(os);
            if (!(this.property instanceof BracketProperty)) {
                os.write('.');
            }
            this.property.classedWriteTo(os);
        }
        toString():string {
            return this.item+'.'+this.property;
        }
    }
    Object.defineProperty(TypeMember.prototype, 'precedence', {value: Precedence.Dot});
    export class TypeName extends Type {
        private prop:NameProperty|null = null;

        constructor(public name:string) {
            super();
        }
        writeTo(os:OutStream):void {
            os.write(this.name);
        }
        toString():string {
            return this.name;
        }
        toProperty():NameProperty {
            if (this.prop !== null) return this.prop;
            return this.prop = new NameProperty(this.name);
        }

        public static readonly void = new TypeName('void');
        public static readonly null = new TypeName('null');
        public static readonly unknown = new TypeName('unknown');
    }
    export abstract class Property extends Item {
        abstract toName<T extends Kind>(kind:T):KindToName<T>;
        abstract classedWriteTo(os:OutStream):void;
        abstract memberedWriteTo(os:OutStream):void;
    }
    export class BracketProperty extends Property {
        constructor(public value:Identifier) {
            super();
        }

        classedWriteTo(os:OutStream):void {
            os.write('[');
            this.value.writeTo(os);
            os.write(']');
        }
        memberedWriteTo(os:OutStream):void {
            this.classedWriteTo(os);
        }
        toString():string {
            return '['+this.value.toString()+']';
        }
        toName<T extends Kind>(kind:T):KindToName<T> {
            throw Error(`${this} is not name property`);
        }
    }
    export class NameProperty extends Property {
        private idname:Name|null = null;
        private typename:TypeName|null = null;

        constructor(public name:string) {
            super();
        }
        classedWriteTo(os:OutStream):void {
            os.write(this.name);
        }
        memberedWriteTo(os:OutStream):void {
            os.write('.'+this.name);
        }
        toString():string {
            return '.'+this.name;
        }
        toName<T extends Kind>(kind:T):KindToName<T> {
            if (isType(kind)) {
                if (this.typename !== null) return this.typename as any;
                return this.typename = kind.asName(this.name) as any;
            } else {
                if (this.idname !== null) return this.idname as any;
                return this.idname = kind.asName(this.name) as any;
            }
        }

        public static readonly prototypeName = new NameProperty('prototype');
    }
    export class ArrayType extends Type {
        constructor(public component:Type) {
            super();
        }

        writeTo(os:OutStream):void {
            this.component.wrappedWriteTo(os, Precedence.TypeArray);
            os.write('[]');
        }
        toString():string {
            return this.component+'[]';
        }

        public static readonly null = new TypeName('null');
        public static readonly unknown = new TypeName('unknown');
    }
    Object.defineProperty(ArrayType.prototype, 'precedence', {value: Precedence.TypeArray});
    export class Tuple extends Type {
        constructor(public readonly fields:Type[]) {
            super();
        }

        writeTo(os:OutStream):void {
            os.write('[');
            for (const value of os.join(this.fields, ', ')) {
                value.writeTo(os);
            }
            os.write(']');
        }
        toString():string {
            return `[${this.fields.join(',')}]`;
        }
    }

    export class ParamDef extends Item {
        constructor(public params:DefineItem[]) {
            super();
        }

        paramsCloneToJS(ctx:JsCloningContext):DefineItem[] {
            return this.params.map(p=>p.cloneToJS(ctx, false)!);
        }
        paramsCloneToDecl():DefineItem[] {
            return this.params;
        }

        writeTo(os:OutStream):void {
            os.write('(');
            for (const item of os.join(this.params, ', ')) {
                item.writeTo(os);
            }
            os.write(')');
        }
        toString():string {
            return `(${this.params.join(',')})`;
        }
    }

    export class TypeDef extends ItemBase implements Exportable {

        constructor(public name:TypeName, public type:Type) {
            super();
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            // empty
        }
        cloneToDecl():TypeDef|null {
            return null;
        }
        cloneToExportedDecl():TypeDef {
            return this;
        }

        getDefineNames(names:Names):void {
            names.addType(this.name, this, this.type);
        }

        blockedWriteTo(os:OutStream):void {
            os.write(`type ${this.name} = `);
            this.type.writeTo(os);
            os.write(';');
        }

        toString():string {
            return `type ${this.name} = ${this.type}`;
        }
    }

    export class VariableDef extends ItemBase implements Defination {
        public vars:Defines;

        constructor(public define:'var'|'let'|'const', defines:DefineItem[]) {
            super();
            this.vars = new Defines(defines);
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            const params = this.vars.paramsCloneToJS(ctx, this.define === 'const');
            ctx.write(new VariableDef(this.define, params));
        }
        cloneToDecl():VariableDef|null {
            return null;
        }
        cloneToExportedDecl():VariableDef {
            return new VariableDef(this.define, this.vars.paramsCloneToDeclNoOptional());
        }


        getDefineNames(names:Names):void {
            this.vars.getDefineNames(names, this);
        }

        blockedWriteTo(os:OutStream):void {
            os.write(this.define+ ' ');
            this.vars.writeTo(os);
            os.write(';');
        }

        toString():string {
            return `${this.define} ${this.vars}`;
        }
    }

    export class FunctionDecl extends ItemBase implements Defination {
        public params:ParamDef;
        public templates:TemplateDecl|null = null;

        constructor(public name:Name, params:DefineItem[], public returnType:Type|null) {
            super();
            this.params = new ParamDef(params);
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            // empty
        }

        cloneToDecl():FunctionDecl {
            return this;
        }

        cloneToExportedDecl():FunctionDecl {
            return this;
        }

        getDefineNames(names:Names):void {
            // it's empty for JS
        }

        blockedWriteTo(os:OutStream):void {
            os.write('function ');
            this.name.writeTo(os);
            this.params.writeTo(os);
            if (this.returnType !== null) {
                os.write(':');
                this.returnType.writeTo(os);
            }
            os.write(';');
        }

        toString():string {
            let out = `function ${this.name}${this.params}`;
            if (this.templates !== null) {
                out += this.templates;
            }
            if (this.returnType !== null) {
                out += ':';
                out += this.returnType;
            }
            return out;
        }
    }

    export class FunctionDef extends FunctionDecl implements BlockItem {
        public block = new Block;

        constructor(name:Name, params:DefineItem[], returnType:Type|null) {
            super(name, params, returnType);
        }

        writeJS(ctx:JsCloningContext):void {
            const def = new FunctionDef(this.name, this.params.paramsCloneToJS(ctx), null);
            def.block = this.block.cloneToJS();
            ctx.write(def);
        }

        writeTo(os:OutStream):void {
            os.write('function ');
            this.name.writeTo(os);
            this.params.writeTo(os);
            if (this.templates !== null) {
                this.templates.writeTo(os);
            }
            if (this.returnType !== null) {
                os.write(':');
                this.returnType.writeTo(os);
            }
            os.write(' ');
            this.block.blockedWriteTo(os);
        }

        blockedWriteTo(os:OutStream):void {
            this.writeTo(os);
        }

        toString():string {
            return super.toString()+this.block;
        }
    }

    export class ArrowFunctionDef extends Identifier {
        public params:ParamDef;
        public block = new Block;

        constructor(params:DefineItem[], public returnType:Type|null) {
            super();
            this.params = new ParamDef(params);
        }

        private _noNeedParenthess():boolean {
            if (this.returnType !== null) return false;
            if (this.params.params.length !== 1) return false;
            const item = this.params.params[0];
            if (!(item instanceof VariableDefineItem)) return false;
            if (item.type !== null) return false;
            if (item.initial !== null) return false;
            return true;
        }
        cloneToJS(ctx:JsCloningContext):ArrowFunctionDef {
            const def = new ArrowFunctionDef(this.params.paramsCloneToJS(ctx), null);
            def.block = this.block.cloneToJS();
            return def;
        }
        cloneToDecl():never {
            cannotCloneToDecl(this);
        }
        writeTo(os:OutStream):void {
            if (this._noNeedParenthess()) {
                (this.params.params[0] as VariableDefineItem).name.writeTo(os);
            } else {
                this.params.writeTo(os);
            }
            if (this.returnType !== null) {
                os.write(':');
                this.returnType.writeTo(os);
            }
            os.write('=>');
            if (this.block.size() === 1) {
                const first = this.block.get(0);
                if (first instanceof Return) {
                    first.value.writeTo(os);
                    return;
                }
            }
            this.block.blockedWriteTo(os);
        }
        toString():string {
            let out = this.params.toString();
            if (this.returnType !== null) {
                out += ':';
                out += this.returnType;
            }
            out += '=>{ ... }';
            return out;
        }
    }
    Object.defineProperty(ArrowFunctionDef.prototype, 'precedence', {value: Precedence.ArrowFunction});

    export class MethodDecl extends ModifiedClassItem {
        public params:ParamDef;
        public templates:TemplateDecl|null = null;

        constructor(
            modifier:'public'|'protected'|'private'|null,
            isStatic:boolean,
            public name:Property,
            params:DefineItem[],
            public returnType:Type|null = null) {
            super(modifier, isStatic, false);
            this.params = new ParamDef(params);
        }

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[]):void {
            // empty
        }

        classedWriteTo(os:OutStream):void {
            super.classedWriteTo(os);
            this.name.classedWriteTo(os);
            if (this.templates !== null) {
                this.templates.writeTo(os);
            }
            this.params.writeTo(os);
            if (this.returnType !== null) {
                os.write(':');
                this.returnType.writeTo(os);
            }
            os.write(';');
        }

        toString():string {
            let out = `${this.name}${this.params}`;
            if (this.templates !== null) {
                out += this.templates;
            }
            if (this.returnType !== null) {
                out += ':';
                out += this.returnType;
            }
            return out;
        }
    }

    export class MethodDef extends MethodDecl {
        public block = new Block;

        constructor(
            modifier:'public'|'protected'|'private'|null,
            isStatic:boolean,
            name:Property,
            params:DefineItem[],
            returnType:Type|null) {
            super(modifier, isStatic, name, params, returnType);
        }

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[]):void {
            const def = new MethodDef(
                null,
                this.isStatic,
                this.name,
                this.params.paramsCloneToJS(ctx), null);
            def.block = this.block.cloneToJS();
            dest.push(def);
        }
        cloneToDecl():MethodDecl {
            const decl = new MethodDecl(this.modifier, this.isStatic, this.name, this.params.paramsCloneToDecl(), this.returnType);
            decl.templates = this.templates;
            return decl;
        }

        classedWriteTo(os:OutStream):void {
            this.name.classedWriteTo(os);
            if (this.templates !== null) {
                this.templates.writeTo(os);
            }
            this.params.writeTo(os);
            if (this.returnType !== null) {
                os.write(':');
                this.returnType.writeTo(os);
            }
            os.write(' ');
            this.block.blockedWriteTo(os);
        }

        toString():string {
            return super.toString()+this.block;
        }
    }

    export class ArrayDef extends Identifier {
        constructor(public fields:Identifier[], public linePerComponent:boolean = false) {
            super();
        }

        cloneToJS(ctx:JsCloningContext):ArrayDef {
            return new ArrayDef(this.fields.map(v=>v.cloneToJS(ctx)), this.linePerComponent);
        }
        cloneToDecl():never {
            cannotCloneToDecl(this);
        }
        writeTo(os:OutStream):void {
            os.write('[');
            for (const value of os.join(this.fields, ', ', this.linePerComponent)) {
                value.writeTo(os);
            }
            os.write(']');
        }
    }

    export class ObjectDef extends Identifier {
        constructor(public readonly fields:[Property, Identifier][]) {
            super();
        }

        cloneToJS(ctx:JsCloningContext):ObjectDef {
            const def = new ObjectDef([]);
            for (const [name, value] of this.fields) {
                def.fields.push([name, value.cloneToJS(ctx)]);
            }
            return def;
        }
        cloneToDecl():never {
            cannotCloneToDecl(this);
        }
        writeTo(os:OutStream):void {
            os.write('{');
            for (const [name, value] of os.join(this.fields, ', ')) {
                name.classedWriteTo(os);
                os.write(':');
                value.writeTo(os);
            }
            os.write('}');
        }
    }

    export class TemplateType extends Type {
        constructor (public type:Type, public params:Type[]) {
            super();
        }

        writeTo(os:OutStream):void {
            this.type.writeTo(os);
            os.write('<');
            for (const type of os.join(this.params, ', ')) {
                type.wrappedWriteTo(os, Precedence.Comma);
            }
            os.write('>');
        }

        toString():string {
            return `${this.type}<${this.params.join(',')}>`;
        }
    }

    export class FunctionType extends Type {
        public params:ParamDef;
        constructor(public returnType:Type, params:DefineItem[]) {
            super();
            this.params = new ParamDef(params);
        }

        writeTo(os:OutStream):void {
            this.params.writeTo(os);
            os.write('=>');
            this.returnType.writeTo(os);
        }

        toString():string {
            return `${this.params}=>${this.returnType}`;
        }
    }
    Object.defineProperty(FunctionType.prototype, 'precedence', {value: Precedence.FunctionType});

    export abstract class TypeUnion extends Type {
        constructor(public types:Type[]){
            super();
        }
    }

    export class TypeOr extends TypeUnion {
        or(...others:Type[]):TypeOr {
            const out:Type[] = this.types.slice();
            for (const other of others) {
                if (other instanceof TypeOr) {
                    out.push(...other.types);
                } else {
                    out.push(other);
                }
            }
            return new TypeOr(out);
        }
        writeTo(os:OutStream):void {
            for (const type of os.join(this.types, '|')) {
                type.wrappedWriteTo(os, Precedence.TypeOr);
            }
        }
        toString():string {
            return this.types.join('|');
        }
    }
    Object.defineProperty(TypeOr.prototype, 'precedence', {value: Precedence.TypeOr});

    export class TypeAnd extends TypeUnion {
        and(...others:Type[]):TypeAnd {
            const out:Type[] = this.types.slice();
            for (const other of others) {
                if (other instanceof TypeAnd) {
                    out.push(...other.types);
                } else {
                    out.push(other);
                }
            }
            return new TypeAnd(out);
        }
        writeTo(os:OutStream):void {
            for (const type of os.join(this.types, '&')) {
                type.wrappedWriteTo(os, Precedence.TypeAnd);
            }
        }
        toString():string {
            return this.types.join('&');
        }
    }
    Object.defineProperty(TypeAnd.prototype, 'precedence', {value: Precedence.TypeAnd});

    export class ImportDirect extends ItemBase implements Defination, BlockItem {
        constructor(
            public readonly name:Name,
            public readonly path:string) {
            super();
        }

        isDefination():true {
            return true;
        }
        writeJS(dest:JsCloningContext):void {
            dest.write(new VariableDef('const', [
                new VariableDefineItem(this.name, null, Name.require.call([new Constant(this.path)]))
            ]));
        }
        cloneToDecl():ImportDirect {
            return this;
        }
        cloneToExportedDecl():ImportDirect {
            return this;
        }

        blockedWriteTo(os:OutStream):void {
            os.write( `import ${this.name} = require("${this.path}");`);
        }
        getDefineNames(names:Names):void {
            names.addValue(this.name, this, null);
        }
        toString():string {
            return `import ${this.name} = require("${this.path}")`;
        }
    }

    export class Import extends ItemBase implements BlockItem, Defination {

        constructor(public imports:[NameProperty, Name][], public path:string) {
            super();
        }

        isDefination():true {
            return true;
        }
        writeJS(ctx:JsCloningContext):void {
            ctx.write(new VariableDef('const', [
                new ObjectUnpackDefineItem(
                    this.imports,
                    Name.require.call([new Constant(this.path)]))
            ]));
        }
        cloneToDecl():Import {
            return this;
        }
        cloneToExportedDecl():Import {
            return this;
        }

        blockedWriteTo(os:OutStream):void {
            os.write('import { ');
            os.tab();
            for (const [from, to] of os.join(this.imports, ', ')) {
                let name:string;
                if (from.name === to.name) {
                    name = from.name;
                } else {
                    name = `${from.name} as ${to.name}`;
                }
                os.lineBreakIfLong(name);
            }
            os.detab();
            os.write(` } from "${this.path}";`);
        }
        getDefineNames(names:Names):void {
            for (const [from, to] of this.imports) {
                names.addValue(to, this, null);
            }
        }
        toString():string {
            return `import { ... } = from "${this.path}"`;
        }
    }

    export class ImportType extends ItemBase implements BlockItem {

        constructor(public imports:[NameProperty, TypeName][], public path:string) {
            super();
        }

        writeJS(ctx:JsCloningContext):void {
            // empty
        }
        cloneToDecl():ImportType {
            return this;
        }

        blockedWriteTo(os:OutStream):void {
            if (this.imports.length === 0) return;

            os.write('import type { ');
            os.tab();
            for (const [from, to] of os.join(this.imports, ', ')) {
                let name:string;
                if (from.name === to.name) {
                    name = from.name;
                } else {
                    name = `${from} as ${to}`;
                }
                os.write(name);
            }
            os.detab();
            os.write(` } from "${this.path}";`);
        }
        toString():string {
            return `import type { ... } = from "${this.path}"`;
        }
    }

    export function dots<T extends IdBase>(host:T, ...names:(string|Property|Name|number)[]):T {
        let member:IdBase = host;
        for (const name of names) {
            let prop:Property;
            switch (typeof name) {
            case 'string':
                prop = new NameProperty(name);
                break;
            case 'number':
                prop = new BracketProperty(new Constant(name));
                break;
            default:
                if (name instanceof Property) {
                    prop = name;
                } else {
                    prop = new NameProperty(name.name);
                }
                break;
            }
            if (member instanceof Identifier) {
                member = new Member(member, prop);
            } else if (member instanceof Type) {
                member = new TypeMember(member, prop);
            } else {
                throw Error(`unexpected host type ${host.constructor.name}`);
            }
        }
        return member as any;
    }

    export function constVal(value:number|string|boolean|null):Constant {
        return new Constant(value);
    }
    export function isIdentifier(kind:Kind):kind is typeof Identifier{
        return kind === Identifier;
    }
    export function isType(kind:Kind):kind is typeof Type{
        return kind === Type;
    }
}
