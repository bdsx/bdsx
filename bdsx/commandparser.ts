import { CommandSymbols } from "./bds/cmdsymbolloader";
import { proc } from "./bds/symbols";
import { StaticPointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { NativeClass } from "./nativeclass";
import { CommandParameterNativeType, NativeType, Type as DataType, Type } from "./nativetype";

const parsers = new Map<DataType<any>, VoidPointer>();
const stringParser = proc['??$parse@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z'];
let enumParser:VoidPointer = proc['??$parseEnum@HU?$DefaultIdConverter@H@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z'];

function passNativeTypeCtorParams<T>(type:Type<T>):[
    number, number,
    (v:unknown)=>boolean,
    ((v:unknown)=>boolean)|undefined,
    (ptr:StaticPointer, offset?:number)=>T,
    (ptr:StaticPointer, v:T, offset?:number)=>void,
    (stackptr:StaticPointer, offset?:number)=>T|null,
    (stackptr:StaticPointer, param:T extends VoidPointer ? (T|null) : T, offset?:number)=>void,
    (ptr:StaticPointer)=>void,
    (ptr:StaticPointer)=>void,
    (to:StaticPointer, from:StaticPointer)=>void,
    (to:StaticPointer, from:StaticPointer)=>void,
] {
    if (NativeClass.isNativeClassType(type)) {
        return [
            type[NativeType.size],
            type[NativeType.align],
            v=>type.isTypeOf(v),
            v=>type.isTypeOfWeak(v),
            (ptr, offset)=>type[NativeType.getter](ptr, offset),
            (ptr, param, offset)=>type[NativeType.setter](ptr, param, offset),
            (stackptr, offset)=>type[makefunc.getFromParam](stackptr, offset),
            (stackptr, param, offset)=>type[makefunc.setToParam](stackptr, param, offset),
            ptr=>type[NativeType.ctor](ptr),
            ptr=>type[NativeType.dtor](ptr),
            (to, from)=>type[NativeType.ctor_copy](to, from),
            (to, from)=>type[NativeType.ctor_move](to, from),
        ];
    } else {
        return [
            type[NativeType.size],
            type[NativeType.align],
            type.isTypeOf,
            type.isTypeOfWeak,
            type[NativeType.getter],
            type[NativeType.setter],
            type[makefunc.getFromParam],
            type[makefunc.setToParam],
            type[NativeType.ctor],
            type[NativeType.dtor],
            type[NativeType.ctor_copy],
            type[NativeType.ctor_move],
        ];
    }
}

/**
 * The command parameter type with the type converter
 */
export abstract class CommandMappedValue<BaseType, NewType=BaseType> extends CommandParameterNativeType<BaseType> {
    readonly nameUtf8?:StaticPointer;

    constructor(type:Type<BaseType>, symbol:string = type.symbol, name:string = type.name) {
        super(symbol, name, ...passNativeTypeCtorParams(type));
    }

    abstract mapValue(value:BaseType):NewType;
    getParser?():VoidPointer;
}

export namespace commandParser {
    export enum Type {
        Unknown,
        Int,
        String,
    }

    export function get<T>(type:DataType<T>):VoidPointer {
        if (type instanceof CommandMappedValue && type.getParser !== undefined) {
            return type.getParser();
        }
        const parser = parsers.get(type);
        if (parser != null) return parser;
        throw Error(`${type.name} parser not found`);
    }

    export function has<T>(type:DataType<T>):boolean {
        if (type instanceof CommandMappedValue && type.getParser !== undefined) return true;
        return parsers.has(type);
    }

    export function load(symbols:CommandSymbols):void {
        for (const [type, addr] of symbols.iterateParsers()) {
            parsers.set(type, addr);
        }
    }

    export function set(type:DataType<any>, parserFnPointer:VoidPointer):void {
        parsers.set(type, parserFnPointer);
    }

    /**
     * @deprecated no need to use
     */
    export function setEnumParser(parserFnPointer:VoidPointer):void {
        enumParser = parserFnPointer;
    }

    export function getType(parser:VoidPointer):Type {
        if (parser.equalsptr(stringParser)) {
            return Type.String;
        } else if (parser.equalsptr(enumParser)) {
            return Type.Int;
        } else {
            return Type.Unknown;
        }
    }
}
