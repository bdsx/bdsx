
import fs = require('fs');
import { abstract } from '../common';

function* joinWrite<T>(fd:number, params:Iterable<T>, glue:string):IterableIterator<T> {
    const iter = params[Symbol.iterator]();
    let v = iter.next();
    if (!v.done) {
        yield v.value;
        while (!(v = iter.next()).done) {
            fs.writeSync(fd, glue);
            yield v.value;
        }
    }
}

enum Precedence {
    Default=0,

    Dot=10,
    Call=11,

    As=20,

    TypeArray=21,

    TypeOf=22,

    TypeAnd=23,
    TypeOr=24,

    Assign=50,
    Return=51,
    Comma=100,
}

export namespace tsw {

    export type KindToItem<T extends Kind> = T extends {prototype:infer I} ? I : never;
    export type KindToName<T extends Kind> = KindToItem<T>&{name:string};
    type AsNameConstructor = typeof AsName;
    export interface Kind extends AsNameConstructor {
    }


    export const opts = {
        writeJS:false,
        tab:'',
    };

    export abstract class Item {
        precedence():Precedence {
            return Precedence.Default;
        }
        abstract writeTo(fd:number):void;
        wrappedWriteTo(fd:number, priority:Precedence):void {
            if (this.precedence() > priority) {
                fs.writeSync(fd, '(');
                this.writeTo(fd);
                fs.writeSync(fd, ')');
            } else {
                this.writeTo(fd);
            }
        }
    }

    export abstract class AsName extends Item {
        __name_dummy:Name|TypeName;
        public static asName<T extends Kind>(this:T,name:string):KindToName<T> {
            abstract();
        }
    }

    export abstract class Identifier extends AsName {
        __name_dummy:Name;

        public static asName<T extends Kind>(this:T,name:string):KindToName<T> {
            return new Name(name) as unknown as KindToName<T>;
        }

        call(fnname:string, params:Identifier[]):DotCall {
            return new DotCall(this, new NameProperty(fnname), params);
        }
    }

    export class Name extends Identifier {
        constructor(public name:string) {
            super();
        }
        writeTo(fd:number):void {
            fs.writeSync(fd, this.name);
        }
    }

    export class Constant extends Identifier {
        constructor(public value:string|number|boolean|null) {
            super();
        }

        writeTo(fd:number):void {
            if (typeof this.value === 'string') {
                fs.writeSync(fd, JSON.stringify(this.value));
            } else {
                fs.writeSync(fd, this.value+'');
            }
        }

        public static readonly null = new Constant(null);
    }

    export abstract class BlockItem extends Item {
    }

    export class ExpressionWrap extends BlockItem {
        constructor(public item:Identifier) {
            super();
        }

        writeTo(fd:number):void {
            this.item.writeTo(fd);
            fs.writeSync(fd, ';\n');
        }
    }

    export class Comment extends BlockItem {
        constructor(public comment:string) {
            super();
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, opts.tab+'// '+this.comment+'\n');
        }
    }

    export abstract class Expression extends Identifier {
    }

    export class Member extends Expression {
        constructor(public item:Identifier, public property:Property) {
            super();
        }
        precedence():Precedence {
            return Precedence.Dot;
        }
        writeTo(fd:number):void {
            if (!(this.property instanceof BracketProperty)) {
                fs.writeSync(fd, '.');
            }
            this.property.writeTo(fd);
        }
    }

    export class Assign extends Expression {
        constructor(public dest:Identifier, public src:Identifier) {
            super();
        }

        precedence():Precedence {
            return Precedence.Assign;
        }
        writeTo(fd:number):void {
            this.dest.writeTo(fd);
            fs.writeSync(fd, ' = ');
            this.src.writeTo(fd);
        }
    }

    export class As extends Expression {
        constructor(public value:Identifier, public type:Identifier) {
            super();
        }

        precedence():Precedence {
            return Precedence.As;
        }
        writeTo(fd:number):void {
            this.value.writeTo(fd);
            fs.writeSync(fd, ' as ');
            this.type.writeTo(fd);
        }
    }

    export class DotCall extends Member {
        constructor(
            public thisVar:Identifier,
            callee:Property,
            public params:Identifier[]) {
            super(thisVar, callee);
        }
        precedence():Precedence {
            return Precedence.Call;
        }
        writeTo(fd:number):void {
            this.thisVar.writeTo(fd);
            super.writeTo(fd);
            fs.writeSync(fd, '(');
            for (const item of joinWrite(fd, this.params, ', ')) {
                item.writeTo(fd);
            }
            fs.writeSync(fd, ')');
        }
    }

    export class Call extends Identifier {
        constructor(
            public callee:Identifier,
            public params:Identifier[]) {
            super();
        }
        precedence():Precedence {
            return Precedence.Call;
        }
        writeTo(fd:number):void {
            this.callee.writeTo(fd);
        }
    }

    export class Return extends BlockItem {
        constructor(public value:Identifier) {
            super();
        }
        precedence():Precedence {
            return Precedence.As;
        }
        writeTo(fd:number):void {
            fs.writeSync(fd, 'return ');
            this.value.writeTo(fd);
            fs.writeSync(fd, ';\n');
        }
    }

    export class Block extends Item {
        public items:(BlockItem|Comment)[] = [];

        comment(comment:string):void {
            this.items.push(new Comment(comment));
        }

        assign(dest:Identifier, src:Identifier):void {
            this.items.push(new ExpressionWrap(new Assign(dest, src)));
        }
        export(item:Exportable):void {
            this.items.push(new Export(item));
        }

        writeTo(fd:number):void {
            for (const item of this.items) {
                fs.writeSync(fd, opts.tab);
                item.writeTo(fd);
            }
        }

    }

    export class Document extends Block {
        save(filename:string):void {
            const fd = fs.openSync(filename, 'w');
            this.writeTo(fd);
            fs.closeSync(fd);
        }
    }

    export abstract class ClassItem extends Item {
        constructor(public modifier:'public'|'protected'|'private'|null, public isStatic:boolean, public isReadonly:boolean) {
            super();
        }

        writeTo(fd:number):void {
            if (this.modifier !== null) {
                fs.writeSync(fd, this.modifier+' ');
            }
            if (this.isReadonly) {
                fs.writeSync(fd, 'readonly ');
            }
        }
    }

    export class Vars extends Item {
        constructor(public defines:[Property, (Type|null)?, (Identifier|null)?][]) {
            super();
        }

        writeTo(fd:number):void {
            for (const [name, type, initial] of joinWrite(fd, this.defines, ', ')) {
                fs.writeSync(fd, name);
                if (type != null && !opts.writeJS) {
                    fs.writeSync(fd, ':');
                    type.writeTo(fd);
                }
                if (initial != null) {
                    fs.writeSync(fd, ' = ');
                    initial.writeTo(fd);
                }
            }
        }
    }

    export class Fields extends ClassItem{
        public vars:Vars;
        constructor(public modifier:'public'|'protected'|'private'|null, isStatic:boolean, isReadonly:boolean, defines:[Property, (Type|null)?, (Identifier|null)?][]) {
            super(modifier, isStatic, isReadonly);
            this.vars = new Vars(defines);
        }

        writeTo(fd:number):void {
            super.writeTo(fd);
            this.vars.writeTo(fd);
        }
    }

    export interface Exportable {
        writeTo(fd:number):void;
    }

    export class TemplateDecl extends Item {
        constructor(public params:[string, (tsw.Type|null)?][]) {
            super();
        }
        writeTo(fd:number):void {
            fs.writeSync(fd, '<');
            for (const [name, type] of joinWrite(fd, this.params, ', ')) {
                fs.writeSync(fd, name);
                if (type != null) {
                    fs.writeSync(fd, ' extends ');
                    type.writeTo(fd);
                }
            }
            fs.writeSync(fd, '>');
        }
    }

    export class Class extends Item implements Exportable {
        public items:(ClassItem|Comment)[] = [];
        public extends:Identifier|null = null;
        public templates:TemplateDecl|null = null;

        constructor(public name:Property) {
            super();
        }

        comment(comment:string):void {
            this.items.push(new Comment(comment));
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, 'class ');
            this.name.writeTo(fd);
            if (this.templates !== null) {
                this.templates.writeTo(fd);
            }
            fs.writeSync(fd, ' ');

            blockOpen(fd);
            for (const item of this.items) {
                item.writeTo(fd);
            }
            blockClose(fd);
        }
    }

    export class Namespace extends BlockItem implements Exportable {
        public block:Block = new Block;
        constructor(public name:string) {
            super();
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, `namespace ${this.name} `);
            blockOpen(fd);
            this.block.writeTo(fd);
            blockClose(fd);
        }
    }

    export function tab():void {
        opts.tab += '  ';
    }
    export function detab():void {
        opts.tab = opts.tab.substr(0, opts.tab.length-2);
    }
    export function blockOpen(fd:number):void {
        fs.writeSync(fd, '{\n');
        tab();
    }
    export function blockClose(fd:number):void {
        detab();
        fs.writeSync(fd, opts.tab+'}\n');
    }

    export class Export extends BlockItem {
        constructor(public item:Exportable) {
            super();
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, 'export ');
            this.item.writeTo(fd);
        }
    }

    export abstract class Type extends AsName {
        __name_dummy:TypeName;

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
        public static asName<T extends Kind>(this:T,name:string):tsw.KindToName<T> {
            return new TypeName(name) as any;
        }
    }
    export class TypeOf extends Type {
        constructor(public value:Identifier) {
            super();
        }
        precedence():Precedence {
            return Precedence.TypeOf;
        }
        writeTo(fd:number):void {
            fs.writeSync(fd, 'typeof ');
            this.value.wrappedWriteTo(fd, this.precedence());
        }
    }
    export class TypeMember extends Type {
        constructor(public item:Type, public property:Property) {
            super();
        }
        precedence():Precedence {
            return Precedence.Dot;
        }
        writeTo(fd:number):void {
            if (!(this.property instanceof BracketProperty)) {
                fs.writeSync(fd, '.');
            }
            this.property.writeTo(fd);
        }
    }
    export class TypeName extends Type {
        constructor(public name:string) {
            super();
        }
        writeTo(fd:number):void {
            fs.writeSync(fd, this.name);
        }

        public static readonly null = new TypeName('null');
        public static readonly unknown = new TypeName('unknown');
    }
    export abstract class Property extends Item {
    }
    export class BracketProperty extends Property {
        constructor(public value:Identifier) {
            super();
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, '[');
            this.value.writeTo(fd);
            fs.writeSync(fd, ']');
        }
    }
    export class NameProperty extends Property {
        constructor(public name:string) {
            super();
        }
        writeTo(fd:number):void {
            fs.writeSync(fd, this.name);
        }

        public static readonly prototypeName = new NameProperty('prototype');
    }
    export class ArrayType extends Type {
        constructor(public component:Type) {
            super();
        }

        precedence():Precedence {
            return Precedence.TypeArray;
        }
        writeTo(fd:number):void {
            this.component.wrappedWriteTo(fd, Precedence.TypeArray);
            fs.writeSync(fd, '[]');
        }

        public static readonly null = new TypeName('null');
        public static readonly unknown = new TypeName('unknown');
    }

    export class ParamDef extends Item {
        constructor(public params:[string, Type][]) {
            super();
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, '(');
            if (opts.writeJS) {
                for (const [name, type] of joinWrite(fd, this.params, ', ')) {
                    fs.writeSync(fd, name);
                }
            } else {
                for (const [name, type] of joinWrite(fd, this.params, ', ')) {
                    fs.writeSync(fd, name+':');
                    type.writeTo(fd);
                }
            }
            fs.writeSync(fd, ')');
        }
    }

    export class TypeDef extends BlockItem implements Exportable {
        constructor(public name:string, public type:Type) {
            super();
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, 'type ');
            fs.writeSync(fd, ' = ');
            this.type.writeTo(fd);
            fs.writeSync(fd, ';\n');
        }
    }

    export class VariableDef extends BlockItem implements Exportable {
        public vars:Vars;
        constructor(public define:'var'|'let'|'const', defines:[Property, (Type|null)?, (Identifier|null)?][]) {
            super();
            this.vars = new Vars(defines);
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, this.define+ ' ');
            this.vars.writeTo(fd);
            fs.writeSync(fd, ';\n');
        }
    }

    export class FunctionDecl extends BlockItem implements Exportable {
        public params:ParamDef;
        constructor(public name:Property, params:[string, Type][], public returnType:Type) {
            super();
            this.params = new ParamDef(params);
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, 'function '+this.name);
            this.params.writeTo(fd);
            fs.writeSync(fd, ':');
            this.returnType.writeTo(fd);
            fs.writeSync(fd, ';\n');
        }
    }

    export class FunctionDef extends FunctionDecl implements Exportable {
        public block = new Block;
        constructor(name:Property, params:[string, Type][], returnType:Type) {
            super(name, params, returnType);
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, 'function '+this.name);
            this.params.writeTo(fd);
            fs.writeSync(fd, ':');
            this.returnType.writeTo(fd);
            fs.writeSync(fd, ' ');
            blockOpen(fd);
            this.block.writeTo(fd);
            blockClose(fd);
        }
    }

    export class MethodDecl extends ClassItem {
        public params:ParamDef;
        constructor(
            modifier:'public'|'protected'|'private'|null,
            isStatic:boolean,
            public name:Property,
            params:[string, Type][],
            public returnType:Type|null = null) {
            super(modifier, isStatic, false);
            this.params = new ParamDef(params);
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, this.name);
            this.params.writeTo(fd);
            if (this.returnType !== null) {
                fs.writeSync(fd, ':');
                this.returnType.writeTo(fd);
            }
            fs.writeSync(fd, ';\n');
        }
    }
    export class MethodDef extends MethodDecl {
        public block = new Block;
        public templates:TemplateDecl|null = null;

        constructor(
            modifier:'public'|'protected'|'private'|null,
            isStatic:boolean,
            name:Property,
            params:[string, Type][],
            returnType?:Type|null) {
            super(modifier, isStatic, name, params, returnType);
        }

        writeTo(fd:number):void {
            fs.writeSync(fd, this.name);
            if (this.templates !== null) {
                this.templates.writeTo(fd);
            }
            this.params.writeTo(fd);
            if (this.returnType !== null) {
                fs.writeSync(fd, ':');
                this.returnType.writeTo(fd);
            }
            fs.writeSync(fd, ' ');
            blockOpen(fd);
            this.block.writeTo(fd);
            blockClose(fd);
        }
    }

    export class Array extends Identifier {
        constructor(public fields:Identifier[]) {
            super();
        }

        writeTo(fd:number):void {
            for (const value of joinWrite(fd, this.fields, ', ')) {
                value.writeTo(fd);
            }
        }
    }

    export class Object extends Identifier {
        public fields = new Map<string, Identifier>();

        constructor() {
            super();
        }

        writeTo(fd:number):void {
            for (const [name, value] of joinWrite(fd, this.fields, ', ')) {
                fs.writeSync(fd, name+':');
                value.writeTo(fd);
            }
        }
    }

    export class TemplateType extends Type {
        constructor (public type:Type, public params:Type[]) {
            super();
        }

        writeTo(fd:number):void {
            this.type.writeTo(fd);
            fs.writeSync(fd, '<');
            for (const type of joinWrite(fd, this.params, ', ')) {
                type.wrappedWriteTo(fd, Precedence.Comma);
            }
            fs.writeSync(fd, '>');
        }
    }

    export class FunctionType extends Type {
        public params:ParamDef;
        constructor(public returnType:Type, params:[string, Type][]) {
            super();
            this.params = new ParamDef(params);
        }

        precedence():Precedence {
            return 1;
        }
        writeTo(fd:number):void {
            this.params.writeTo(fd);
            fs.writeSync(fd, '=>');
            this.returnType.writeTo(fd);
        }
    }

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
        writeTo(fd:number):void {
            for (const type of joinWrite(fd, this.types, '|')) {
                type.wrappedWriteTo(fd, Precedence.TypeOr);
            }
        }
    }

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
        writeTo(fd:number):void {
            for (const type of joinWrite(fd, this.types, '&')) {
                type.wrappedWriteTo(fd, Precedence.TypeOr);
            }
        }
    }

    export class ImportDirect extends BlockItem {
        constructor(public name:string, public path:string) {
            super();
        }

        writeTo(fd:number):void {
            const def = tsw.opts.writeJS ? 'const' : 'import';
            fs.writeSync(fd,  `${def} ${this.name} = require("${this.path}");\n`);
        }
    }

    export class Import extends BlockItem {

        constructor(public imports:[string, string][], public path:string) {
            super();
        }

        writeTo(fd:number):void {
            const def = tsw.opts.writeJS ? 'const' : 'import';
            fs.writeSync(fd, def+' { ');
            for (const [from, to] of joinWrite(fd, this.imports, ', ')) {
                let name:string;
                if (from === to) {
                    name = from;
                } else {
                    if (tsw.opts.writeJS) {
                        name = `${from}:${to}`;
                    } else {
                        name = `${from} as ${to}`;
                    }
                }
                fs.writeSync(fd, name);
            }
            fs.writeSync(fd, ` } from "${this.path}";\n`);
        }
    }

    export class ImportType extends BlockItem {

        constructor(public imports:[string, string][], public path:string) {
            super();
        }

        writeTo(fd:number):void {
            if (opts.writeJS) return;
            fs.writeSync(fd, 'import type { ');
            for (const [from, to] of joinWrite(fd, this.imports, ', ')) {
                let name:string;
                if (from === to) {
                    name = from;
                } else {
                    name = `${from} as ${to}`;
                }
                fs.writeSync(fd, name);
            }
            fs.writeSync(fd, ` } from "${this.path}";\n`);
        }
    }

    export function dots<T extends Item>(host:T, ...names:string[]):T {
        if (host instanceof Identifier) {
            let member:Identifier = host;
            for (const name of names) {
                member = new tsw.Member(member, new tsw.NameProperty(name));
            }
            return member as any;
        } else if (host instanceof Type) {
            let member:Type = host;
            for (const name of names) {
                member = new tsw.TypeMember(member, new tsw.NameProperty(name));
            }
            return member as any;
        } else {
            throw Error(`unexpected host type ${host.constructor.name}`);
        }
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
