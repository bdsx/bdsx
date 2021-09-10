
import fs = require('fs');
import os = require('os');
import { notImplemented, unreachable } from '../common';
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

    export enum Kind {
        None,
        Value,
        Type,
        Both,
    }

    export class JsCloningContext {
        public readonly exported = new Set<string>();
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
        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[], clazz:Class):void;
        cloneToDecl():ClassItem|null;
    }

    export interface DefinationHost {
        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type|null, isStatic:boolean):void;
        addVariable(name:Name|Property, type:Type|null, isStatic:boolean, initial?:Value|null):void;
        const(name:Name, type:Type|null, value:Value):void;
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
        abstract member(name:string|number|Property|Value):Member|TypeMember;
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

    export abstract class Value extends IdBase implements BlockItem {
        __name_type_dummy:Name;

        public static asName(name:string):Name {
            return new Name(name);
        }
        member(name:string|number|Property|Value):Member{
            switch (typeof name) {
            case 'string':
                name = new NameProperty(name);
                break;
            case 'number':
                name = new NumberProperty(name);
                break;
            default:
                if (name instanceof Value) {
                    name = new BracketProperty(name);
                }
                break;
            }
            return new Member(this as any, name);
        }
        add(value:string|number|Value):Add{
            switch (typeof value) {
            case 'number':
            case 'string':
                value = new Constant(value);
                break;
            }
            return new Add(this, value);
        }
        subtract(value:string|number|Value):Subtract{
            switch (typeof value) {
            case 'number':
            case 'string':
                value = new Constant(value);
                break;
            }
            return new Subtract(this, value);
        }
        abstract cloneToDecl():Value|null;
        abstract cloneToJS(ctx:JsCloningContext):Value;
        writeJS(ctx:JsCloningContext):void {
            ctx.write(this.cloneToJS(ctx));
        }

        call(fnname:string|Property, params:Value[]):DotCall;
        call(params:Value[]):Call;
        call(paramsOrName:string|Property|Value[], params?:Value[]):DotCall|Call {
            if (paramsOrName instanceof Array) {
                return new Call(this, paramsOrName);
            } else {
                if (!(paramsOrName instanceof Property)) paramsOrName = new NameProperty(paramsOrName);
                return new DotCall(this, paramsOrName, params!);
            }
        }
        callNew(params:Value[]):New {
            return new New(this, params);
        }

        blockedWriteTo(os:OutStream):void {
            this.writeTo(os);
            os.write(';');
        }
    }

    export class Name extends Value {
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
        toTypeName():TypeName {
            return this.toProperty().toName(tsw.Kind.Type).type;
        }

        public static readonly this = new Name('this');
        public static readonly require = new Name('require');
        public static readonly exports = new Name('exports');
        public static readonly super = new Name('super');
        public static readonly true = new Name('true');
        public static readonly false = new Name('false');
    }

    export class Constant extends Value {
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
        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[], clazz:Class):void {
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

    export abstract class BinaryOperator extends Value {
        constructor(public first:Value, public second:Value) {
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

    export class Member extends Value {
        constructor(public readonly item:Value, public readonly property:Property) {
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

    export abstract class Expression extends Value {

        cloneToDecl():null {
            return null;
        }
    }

    export class Assign extends Expression {
        constructor(public dest:Value, public src:Value) {
            super();
            if (dest == null) throw TypeError('invalid param');
            if (src == null) throw TypeError('invalid param');
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
        constructor(public value:Value, public type:Value) {
            super();
        }

        cloneToJS(ctx:JsCloningContext):Value {
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
            thisVar:Value,
            callee:Property,
            public params:Value[]) {
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
            public callee:Value,
            public params:Value[]) {
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
            public clazz:Value,
            public params:Value[]) {
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
        constructor(public value:Value) {
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
        private readonly values = new Map<string, [Name, Defination, Value|null]>();
        private readonly types = new Map<string, [TypeName, Defination, Type]>();

        getValues():IterableIterator<[Name, Defination, Value|null]> {
            return this.values.values();
        }

        getTypes():IterableIterator<[TypeName, Defination, Type]> {
            return this.types.values();
        }

        addValue(name:Name, host:Defination, value:Value|null):void {
            if (this.values.has(name.name) && host instanceof Namespace && host.name === name) {
                return;
            }
            this.values.set(name.name, [name, host, value]);
        }

        addType(name:TypeName, host:Defination, type:Type):void {
            if (this.types.has(name.name) && host instanceof Namespace && host.name.toTypeName() === type) {
                return;
            }
            this.types.set(name.name, [name, host, type]);
        }

        hasValue(name:string):boolean {
            return this.values.has(name);
        }

        getValue(name:string):Defination|null {
            const v = this.values.get(name);
            if (v == null) return null;
            return v[1];
        }

        hasType(name:string):boolean {
            return this.types.has(name);
        }

        getType(name:string):Defination|null {
            const v = this.types.get(name);
            if (v == null) return null;
            return v[1];
        }

        addNamesFrom(items:BlockItem[]):void {
            for (const item of items) {
                if (item.isDefination()) {
                    item.getDefineNames(this);
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

        addValueName(name:Name, host:Defination, value:Value|null):void {
            this.names.addValue(name, host, value);
        }

        size():number {
            return this.items.length;
        }

        get(i:number):BlockItem {
            return this.items[i];
        }

        private _unshift(items:BlockItem[]):void {
            this.names.addNamesFrom(items);
            // this.items.unshift(...items); // it made the "out of stack space" error with too many items

            const dest = this.items;
            const destlen = dest.length;
            const srclen = items.length;
            dest.length = destlen + srclen;
            dest.copyWithin(srclen, 0, destlen);
            for (let i=0;i<srclen;i++) {
                dest[i] = items[i];
            }
        }

        private _push(items:BlockItem[]):void {
            this.names.addNamesFrom(items);
            // this.items.push(...items); // it made the "out of stack space" error with too many items

            const dest = this.items;
            const destlen = dest.length;
            const srclen = items.length;
            dest.length = destlen + srclen;
            for (let i=0;i<srclen;i++) {
                dest[i+destlen] = items[i];
            }
        }

        unshift(...items:BlockItem[]):void {
            this._unshift(items);
        }

        write(...item:BlockItem[]):void {
            this._push(item);
        }

        unshiftBlock(block:Block):void {
            this._unshift(block.items);
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

        getValue(name:string):Defination|null {
            return this.names.getValue(name);
        }

        getType(name:string):Defination|null {
            return this.names.getType(name);
        }

        cloneToDecl():Block {
            const newblock = new Block;
            for (const item of this.items) {
                if ((item instanceof Export) || item instanceof TypeDef) {
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

        const(name:Name, type:Type|null, value:Value):void {
            this.write(new VariableDef('const', [
                new VariableDefineItem(name, type, value)
            ]));
        }
        assign(dest:Value, src:Value):Assign {
            const res = new Assign(dest, src);
            this.items.push(res);
            return res;
        }
        export(item:Exportable):Export {
            const res = new Export(item);
            this.write(res);
            return res;
        }
        declare(item:Exportable):Declare {
            const res = new Declare(item);
            this.write(res);
            return res;
        }
        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type|null, isStatic:boolean):void {
            if (!(name instanceof Name)) {
                name = name.toName(Kind.Value).value;
            }
            this.write(new Export(new FunctionDecl(name, params, returnType)));
        }
        addVariable(name:Name|Property, type:Type|null, isStatic:boolean, initial?:Value|null):void {
            if (!(name instanceof Name)) {
                name = name.toName(Kind.Value).value;
            }
            this.write(new Export(new VariableDef('let', [new VariableDefineItem(name, type, initial)])));
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
        abstract getDefineNamesWithHost(name:Names, host:Defination):void;
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

    class OptionalIndicator extends Value {
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
            public initial:Value|null = null) {
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
        getDefineNamesWithHost(name:Names, host:Defination):void {
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

    export class ObjectUnpack extends ItemBase implements Exportable, Defination {
        constructor(public readonly names:[NameProperty, Name][]) {
            super();
        }

        writeJS(ctx:JsCloningContext):void {
            // empty
        }
        cloneToJS(ctx:JsCloningContext):ObjectUnpack {
            return new ObjectUnpack(this.names);
        }
        cloneToDecl():ObjectUnpack {
            notImplemented();
        }

        getDefineNames(names:Names):void {
            for (const [from, to] of this.names) {
                names.addValue(to, this, null);
            }
        }
        isDefination():true {
            return true;
        }
        cloneToExportedDecl():Exportable|null {
            return this;
        }
        blockedWriteTo(os:OutStream):void {
            os.write('{ ');
            for (const [from, to] of os.join(this.names, ', ')) {
                if (from.name === to.name) {
                    os.write(from.name);
                } else {
                    os.write(`${from.name}:${to.name}`);
                }
            }
            os.write(' }');
        }
    }

    export class ObjectUnpackDefineItem extends DefineItem {
        public readonly unpack:ObjectUnpack;
        constructor(
            names:[NameProperty, Name][],
            public initial:Value) {
            super();
            this.unpack = new ObjectUnpack(names);
        }

        cloneToJS(ctx:JsCloningContext, isConstDefine:boolean):ObjectUnpackDefineItem {
            return new ObjectUnpackDefineItem(this.unpack.names, this.initial.cloneToJS(ctx));
        }
        cloneToDecl():ObjectUnpackDefineItem {
            notImplemented();
        }
        cloneToDeclNoOptional():DefineItem {
            notImplemented();
        }

        getDefineNamesWithHost(names:Names, host:Defination):void {
            for (const [prop, name] of this.unpack.names) {
                names.addValue(name, host, null);
            }
        }

        writeTo(os:OutStream):void {
            this.unpack.blockedWriteTo(os);
            os.write(' = ');
            this.initial.writeTo(os);
        }
    }

    export class ArrayUnpackDefineItem extends DefineItem {
        constructor(
            public names:Name[],
            public initial:Value) {
            super();
        }

        cloneToJS(ctx:JsCloningContext, isConstDefine:boolean):ArrayUnpackDefineItem {
            return new ArrayUnpackDefineItem(this.names, this.initial.cloneToJS(ctx));
        }
        cloneToDecl():DefineItem {
            notImplemented();
        }
        cloneToDeclNoOptional():DefineItem {
            notImplemented();
        }

        getDefineNamesWithHost(names:Names, host:Defination):void {
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
                def.getDefineNamesWithHost(names, host);
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

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[], clazz:Class):void {
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
            public initial:Value|null = null) {
            super(modifier, isStatic, isReadonly);
        }

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[], clazz:Class):void {
            if (this.initial !== null) {
                if (this.isStatic) {
                    ctx.newBlock.assign(clazz.name.member(this.name), this.initial);
                } else {
                    notImplemented();
                }
            }
        }
        cloneToDecl():ClassField {
            return new ClassField(this.modifier, this.isStatic, this.isReadonly, this.name, this.type, null);
        }
        classedWriteTo(os:OutStream):void {
            super.classedWriteTo(os);
            this.name.classedWriteTo(os);
            if (this.type !== null) {
                os.write(':');
                this.type.writeTo(os);
            }
            if (this.initial !== null) {
                os.write(' = ');
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

    export class Class extends Value implements Defination, DefinationHost {
        private readonly items:ClassItem[] = [];
        public extends:Value|null = null;
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
        unshift(item:ClassItem):void {
            this.items.unshift(item);
        }

        comment(comment:string):void {
            this.items.push(new Comment(comment));
        }

        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type|null, isStatic:boolean):void{
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new MethodDecl(null, isStatic, name, params, returnType));
        }
        addVariable(name:Name|Property, type:Type|null, isStatic:boolean, initial?:Value|null):void {
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new ClassField(null, isStatic, false, name, type, initial));
        }
        const(name:Name|Property, type:Type|null, value:Value):void {
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new ClassField(null, true, true, name, type, value));
        }

        writeJS(ctx:JsCloningContext):void {
            const cls = new Class(this.name);
            cls.extends = this.extends;
            ctx.write(cls);

            for (const item of this.items) {
                item.classedWriteJS(ctx, cls.items, this);
            }
        }
        cloneToJS(ctx:JsCloningContext):Class {
            const cls = new Class(this.name);
            cls.extends = this.extends;
            for (const item of this.items) {
                item.classedWriteJS(ctx, cls.items, this);
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
            names.addValue(this.name, this, this.name);
            const typeName = this.name.toTypeName();
            names.addType(typeName, this, typeName);
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

    export class Enum extends ItemBase implements Defination, BlockItem{
        constructor(
            public readonly name:Name,
            public readonly items:[string, Value?][]) {
            super();
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            ctx.write(new VariableDef('const', [
                new VariableDefineItem(this.name, null, new ObjectDef([]))
            ]));
            let previous:number|null = -1;
            for (const [key, value] of this.items) {
                let nvalue:Value;
                if (value != null) {
                    if (value instanceof Constant && typeof value.value === 'number') {
                        previous = value.value;
                    }
                    nvalue = value;
                } else {
                    if (previous === null) {
                        throw Error('Enum member must have initializer.');
                    }
                    ++previous;
                    nvalue = new Constant(previous);
                }
                const setKey = new Assign(this.name.member(nvalue), new Constant(key));
                ctx.write(new Assign(this.name.member(setKey), nvalue));
            }
        }
        cloneToDecl():Namespace|null {
            return null;
        }
        cloneToExportedDecl():Enum {
            return new Enum(this.name, this.items);
        }
        getDefineNames(names:Names):void {
            names.addValue(this.name, this, null);
        }

        blockedWriteTo(os:OutStream):void {
            os.write(`enum ${this.name} {`);
            for (const [key, value] of os.join(this.items, ',', true)) {
                os.write(key);
                if (value != null) {
                    os.write(' = ');
                    value.writeTo(os);
                }
            }
            os.lineBreak();
            os.write('}');
        }
    }

    export abstract class NamespaceLike extends ItemBase implements Defination, BlockItem {
        abstract name:Value;

        constructor(
            public readonly block:Block = new Block) {
            super();
        }

        isDefination():true {
            return true;
        }

        cloneToDecl():NamespaceLike|null {
            return null;
        }
        getDefineNames(names:Names):void {
            if (this.name instanceof Name) {
                names.addValue(this.name, this, this.name);
                const typeName = this.name.toTypeName();
                names.addType(typeName, this, typeName);
            }
        }

        writeJS(ctx:JsCloningContext):void {
            if (!(this.name instanceof Name)) {
                throw Error(`unexpected name with module`);
            }
            const already = ctx.newBlock.getValue(this.name.name);
            if (already == null) {
                ctx.write(new VariableDef('const', [
                    new VariableDefineItem(this.name, null, new ObjectDef([]))
                ]));
            }

            const block = this.block.cloneToJS();
            if (block.size() === 0) return;
            const func = new ArrowFunctionDef([new VariableDefineItem(Name.exports)], null);
            func.block = block;
            ctx.write(func.call([this.name]));
        }
        blockedWriteTo(os:OutStream):void {
            os.write('module ');
            this.name.writeTo(os);
            os.write(' ');
            this.block.blockedWriteTo(os);
        }
    }

    export class Namespace extends NamespaceLike {
        constructor(
            public name:Name,
            block?:Block) {
            super(block);
        }

        cloneToExportedDecl():Namespace {
            const cloned = this.block.cloneToDecl();
            return new Namespace(this.name, cloned);
        }
    }

    export class Module extends NamespaceLike {
        constructor(
            public name:Value,
            block?:Block) {
            super(block);
        }
        cloneToExportedDecl():Module {
            const cloned = this.block.cloneToDecl();
            return new Module(this.name, cloned);
        }
    }

    export abstract class ExportLike extends ItemBase implements BlockItem, Defination {
        constructor(public item:Exportable) {
            super();
        }

        isDefination():true {
            return true;
        }

        getDefineNames(names:Names):void {
            this.item.getDefineNames(names);
        }

        abstract cloneToDecl():BlockItem|null;
        abstract writeJS(ctx:JsCloningContext):void;
        abstract blockedWriteTo(os:OutStream):void;
    }

    export class Export extends ExportLike {

        cloneToDecl():Export|null {
            const cloned = this.item.cloneToExportedDecl();
            if (cloned === null) return null;
            return new Export(cloned);
        }
        writeJS(ctx:JsCloningContext):void {
            const names = new Names;
            this.item.getDefineNames(names);
            this.item.writeJS(ctx);

            for (const [name] of names.getValues()) {
                if (ctx.exported.has(name.name)) continue;
                ctx.exported.add(name.name);
                ctx.write(new Assign(new Member(Name.exports, name.toProperty()), name));
            }
        }
        blockedWriteTo(os:OutStream):void {
            os.write(`export `);
            this.item.blockedWriteTo(os);
        }
        toString():string {
            return 'export '+this.item;
        }
    }

    export class Declare extends ExportLike {
        cloneToDecl():Exportable|null {
            return this.item;
        }
        writeJS(ctx:JsCloningContext):void {
            // empty
        }
        blockedWriteTo(os:OutStream):void {
            os.write('declare ');
            this.item.blockedWriteTo(os);
        }
        toString():string {
            return 'declare '+this.item;
        }
    }

    export abstract class Type extends IdBase {
        __name_type_dummy:TypeName;

        member(name:string|number|Property|Value):TypeMember{
            switch (typeof name) {
            case 'string':
                name = new NameProperty(name);
                break;
            case 'number':
                name = new NumberProperty(name);
                break;
            default:
                if (name instanceof Value) {
                    name = new BracketProperty(name);
                }
                break;
            }
            return new TypeMember(this, name);
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
        template(...types:Type[]):TemplateType {
            return new TemplateType(this, types);
        }
        notNull():Type {
            return this;
        }
        public static asName(name:string):TypeName {
            return new TypeName(name);
        }
        abstract toString():string;
    }
    export class ObjectType extends Type {
        constructor(public readonly items:ClassItem[] = []) {
            super();
        }

        write(item:ClassItem):void {
            this.items.push(item);
        }
        unshift(item:ClassItem):void {
            this.items.unshift(item);
        }
        comment(comment:string):void {
            this.items.push(new Comment(comment));
        }


        writeTo(os:OutStream):void {
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

        toString():string {
            const os = new StringOutStream;
            this.writeTo(os);
            return os.result.replace(/\r?\n/g, '');
        }
    }
    export class Interface extends ObjectType implements Defination, DefinationHost {
        public readonly extends:Value[] = [];
        public templates:TemplateDecl|null = null;

        constructor(public name:TypeName) {
            super();
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            // empty
        }
        cloneToDecl():Interface|null {
            return null;
        }
        cloneToExportedDecl():Interface {
            const cls = new Interface(this.name);
            cls.templates = this.templates;
            cls.extends.push(...this.extends);
            for (const item of this.items) {
                const cloned = item.cloneToDecl();
                if (cloned === null) continue;
                cls.items.push(cloned);
            }
            return cls;
        }

        addFunctionDecl(name:Name|Property, params:DefineItem[], returnType:Type|null, isStatic:boolean):void{
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new MethodDecl(null, isStatic, name, params, returnType));
        }
        addVariable(name:Name|Property, type:Type|null, isStatic:boolean, initial?:Value|null):void {
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new ClassField(null, isStatic, false, name, type, initial));
        }
        const(name:Name|Property, type:Type|null, value:Value):void {
            if (!(name instanceof Property)) {
                name = name.toProperty();
            }
            this.write(new ClassField(null, true, true, name, type, value));
        }

        getDefineNames(names:Names):void {
            names.addType(this.name, this, this);
        }

        writeTo(os:OutStream):void {
            if (this.templates === null) throw Error(`object type but has template`);
            if (this.extends.length !== 0) throw Error(`object type but extended`);
            super.writeTo(os);
        }

        blockedWriteTo(os:OutStream):void {
            os.write('interface ');
            this.name.writeTo(os);
            if (this.templates !== null) {
                this.templates.writeTo(os);
            }
            if (this.extends.length !== 0) {
                os.write(' extends ');
                for (const item of os.join(this.extends, ', ')) {
                    item.writeTo(os);
                }
            }
            super.writeTo(os);
        }
    }

    export class TypeOf extends Type {
        constructor(public value:Value) {
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
            return this.item.toString()+this.property;
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
        toName():Name {
            return this.toProperty().toName(tsw.Kind.Value).value;
        }
    }
    export class BasicType extends TypeName {
        public static readonly number = new BasicType('number');
        public static readonly boolean = new BasicType('boolean');
        public static readonly string = new BasicType('string');
        public static readonly void = new BasicType('void');
        public static readonly null = new BasicType('null');
        public static readonly unknown = new BasicType('unknown');
        public static readonly any = new BasicType('any');
        public static readonly never = new BasicType('never');
    }
    export abstract class Property extends Item {
        abstract toName(kind:Kind):NamePair;
        abstract classedWriteTo(os:OutStream):void;
        abstract memberedWriteTo(os:OutStream):void;
        abstract toStringWithoutDot():string;
    }
    export class BracketProperty extends Property {
        constructor(public value:Value) {
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
        toName(kind:Kind):NamePair {
            throw Error(`${this} is not name property`);
        }
        toStringWithoutDot():string {
            return this.toString();
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
        toStringWithoutDot():string {
            return this.name;
        }
        toName(kind:Kind):NamePair {
            const out = new NamePair;
            if (kind & 1) {
                if (this.idname === null) {
                    this.idname = Value.asName(this.name);
                }
                out.value = this.idname;
            }
            if (kind & 2) {
                if (this.typename === null) {
                    this.typename = Type.asName(this.name);
                }
                out.type = this.typename;
            }
            return out;
        }

        public static readonly prototypeName = new NameProperty('prototype');
    }
    export class NumberProperty extends Property {
        constructor(public number:number) {
            super();
        }
        classedWriteTo(os:OutStream):void {
            os.write(this.number+'');
        }
        memberedWriteTo(os:OutStream):void {
            os.write('['+this.number+']');
        }
        toString():string {
            return '['+this.number+']';
        }
        toName(kind:Kind):NamePair {
            throw Error(`${this} is not name property`);
        }
        toStringWithoutDot():string {
            return this.number.toString();
        }
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

        constructor(public name:TypeName, public type:Type, public readonly templates:tsw.TypeName[]|null = null) {
            super();
        }

        isDefination():true {
            return true;
        }

        writeJS(ctx:JsCloningContext):void {
            // empty
        }
        cloneToDecl():TypeDef|null {
            return this;
        }
        cloneToExportedDecl():TypeDef {
            return this;
        }

        getDefineNames(names:Names):void {
            names.addType(this.name, this, this.type);
        }

        blockedWriteTo(os:OutStream):void {
            os.write(`type ${this.name}`);
            if (this.templates !== null) {
                os.write('<');
                for (const item of os.join(this.templates, ', ')) {
                    item.writeTo(os);
                }
                os.write('>');
            }
            os.write(` = `);
            this.type.writeTo(os);
            os.write(';');
        }

        toString():string {
            if (this.templates !== null) {
                return `type ${this.name}<${this.templates.join(', ')}> = ${this.type}`;
            } else {
                return `type ${this.name} = ${this.type}`;
            }
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

    export class ArrowFunctionDef extends Value {
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

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[], clazz:Class):void {
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
            let out = `${this.name.toStringWithoutDot()}${this.params}`;
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

        classedWriteJS(ctx:JsCloningContext, dest:ClassItem[], clazz:Class):void {
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

    export class ArrayDef extends Value {
        constructor(public fields:Value[], public linePerComponent:boolean = false) {
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

    export class ObjectDef extends Value {
        constructor(public readonly fields:[Property, Value][]) {
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
                if (name instanceof tsw.NameProperty && value instanceof tsw.Name) {
                    if (name.name === value.name) {
                        value.writeTo(os);
                        continue;
                    }
                }
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
            if (this.params.length === 0) throw Error(`Empty parameter types (${this.toString()})`);
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
        notNull():TypeOr {
            const idx = this.types.indexOf(tsw.BasicType.null);
            if (idx !== -1) {
                const cloned = this.types.slice();
                cloned.splice(idx, 1);
                return new tsw.TypeOr(cloned);
            }
            return this;
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

    export class ImportOnly extends ItemBase implements Defination, BlockItem {
        constructor(
            public readonly path:string) {
            super();
        }

        isDefination():true {
            return true;
        }
        writeJS(dest:JsCloningContext):void {
            dest.write(Name.require.call([new Constant(this.path)]));
        }
        cloneToDecl():ImportOnly {
            return this;
        }
        cloneToExportedDecl():ImportOnly {
            return this;
        }

        blockedWriteTo(os:OutStream):void {
            os.write( `import "${this.path}");`);
        }
        getDefineNames(names:Names):void {
            // empty
        }
        toString():string {
            return `import "${this.path}")`;
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

    export class ItemPair {
        public value:Value;
        public type:Type;
        constructor(
            value:Value|null = null,
            type:Type|null = null) {
            this.value = value!;
            this.type = type!;
        }
        static asName(name:string, kind:Kind):NamePair {
            const out = new NamePair;
            if ((kind & Kind.Value) !== 0) out.value = Value.asName(name);
            if ((kind & Kind.Type) !== 0) out.type = Type.asName(name);
            return out;
        }
        getKind():Kind {
            let kind = Kind.None;
            if (this.value !== null) kind |= Kind.Value;
            if (this.type !== null) kind |= Kind.Type;
            return kind;
        }
        set(pair:tsw.ItemPair):void {
            this.value = pair.value;
            this.type = pair.type;
        }
        notNull():tsw.ItemPair {
            if (this.type !== null) {
                return new tsw.ItemPair(this.value, this.type.notNull());
            }
            return this;
        }
        clone():tsw.ItemPair {
            return new tsw.ItemPair(this.value, this.type);
        }
        member(name:string|number|Property|Value):tsw.ItemPair {
            const out = new ItemPair;
            if (this.value !== null) out.value = this.value.member(name);
            if (this.type !== null) out.type = this.type.member(name);
            return out;
        }
        each(forValue:(value:Value)=>Value, forType:(type:Type)=>Type):ItemPair {
            const out = new ItemPair;
            if (this.value !== null) out.value = forValue(this.value);
            if (this.type !== null) out.type = forType(this.type);
            return out;
        }
        toString():string {
            let out = '[';
            if (this.value !== null) out += `value=${this.value},`;
            if (this.type !== null) out += `type=${this.type},`;
            return out = out.substr(0, out.length-1)+']';
        }
    }
    export class NamePair extends ItemPair {
        public value:Name;
        public type:TypeName;

        static create(name:string):NamePair {
            return new NamePair(new Name(name), new TypeName(name));
        }
    }
    export namespace ItemPair {
        export const any = new NamePair(null, BasicType.any);
        export const never = new NamePair(null, BasicType.never);
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
            if (member instanceof Value) {
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
}
