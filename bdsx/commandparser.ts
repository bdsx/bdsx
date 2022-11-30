import { CommandSymbols } from "./bds/cmdsymbolloader";
import { proc } from "./bds/symbols";
import { NativePointer, StaticPointer, VoidPointer } from "./core";
import { makefunc } from "./makefunc";
import { NativeClass } from "./nativeclass";
import { CommandParameterNativeType, NativeType, Type as DataType, Type } from "./nativetype";
import * as colors from 'colors';

/**
 * For findding the default enum parser.
 * There is no default parser symbol, but many parsers refer to the default parser.
 */
function selectMore(...symbols:string[]):NativePointer {
    interface Item {
        addr:NativePointer;
        count:number;
        symbol:string;
    }
    let maximum:Item = {
        addr: new NativePointer,
        count: 0,
        symbol: '',
    };
    const map = new Map<string, Item>();
    for (const symbol of symbols) {
        const addr = proc[symbol];
        const addrbin = addr.getAddressBin();
        let item = map.get(addrbin);
        if (item === undefined) {
            map.set(addrbin, item = {count:1, addr, symbol});
        } else {
            item.count = item.count+1|0;
        }
        if (item.count > maximum.count) {
            maximum = item;
        }
    }
    for (const item of map.values()) {
        if (item !== maximum) {
            console.error(colors.yellow(`[BDSX] selectMore exception: ${item.symbol}`));
        }
    }
    return maximum.addr;
}

const parsers = new Map<DataType<any>, VoidPointer>();
const stringParser = proc['??$parse@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z'];
let enumParser:VoidPointer = selectMore(
    '??$parseEnum@W4Mode@ExecuteCommand@@U?$DefaultIdConverter@W4Mode@ExecuteCommand@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
    '??$parseEnum@W4DebuggerAction@ScriptDebugCommand@@U?$DefaultIdConverter@W4DebuggerAction@ScriptDebugCommand@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
    '??$parseEnum@W4ActionType@ResourceUriCommand@@U?$DefaultIdConverter@W4ActionType@ResourceUriCommand@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
    '??$parseEnum@W4StructureActionType@@U?$DefaultIdConverter@W4StructureActionType@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
    '??$parseEnum@W4WatchdogAction@ScriptDebugCommand@@U?$DefaultIdConverter@W4WatchdogAction@ScriptDebugCommand@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
    '??$parseEnum@W4Biomes@LocateCommandUtil@@U?$DefaultIdConverter@W4Biomes@LocateCommandUtil@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
    '??$parseEnum@W4ActorLocation@@U?$DefaultIdConverter@W4ActorLocation@@@CommandRegistry@@@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z',
);

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
