import * as colors from "colors";
import { NativePointer } from "../core";
import { Type } from "../nativetype";
import { proc } from "./symbols";

interface TypeIdSymbols {
    fnTypes: Type<any>[];
    fnSymbols: string[];
    ptrTypes: Type<any>[];
    ptrSymbols: { symbol: string; type: Type<any> }[];
}

function errorlog(message: string): void {
    console.error(colors.red(message));
}

export class CommandSymbols {
    private readonly counterSymbols: string[] = [];

    private readonly parserSymbols: string[] = [];
    private readonly parserTypes: Type<any>[] = [];
    private readonly counterBases: Type<any>[] = [];
    private readonly typeForIds = new Map<Type<any>, TypeIdSymbols>();

    private _getTypeIdSymbols(base: Type<any>): TypeIdSymbols {
        let symbols = this.typeForIds.get(base);
        if (symbols != null) return symbols;
        symbols = {
            fnSymbols: [],
            fnTypes: [],
            ptrSymbols: [],
            ptrTypes: [],
        };
        this.typeForIds.set(base, symbols);
        return symbols;
    }

    addCounterSymbol(base: Type<any>): void {
        this.counterBases.push(base);
        this.counterSymbols.push(`?storage@?1??_getCounter@?$typeid_t@${base.symbol}@Bedrock@@CAAEAU?$atomic@G@std@@XZ@4U45@A`);
    }

    addTypeIdFnSymbols(base: Type<any>, typesWithFunction: Type<any>[]): void {
        const symbols = this._getTypeIdSymbols(base);

        for (const v of typesWithFunction) {
            symbols.fnTypes.push(v);
            symbols.fnSymbols.push(`??$type_id@${base.symbol}${v.symbol}@Bedrock@@YA?AV?$typeid_t@${base.symbol}@0@XZ`);
        }
    }

    addTypeIdPtrSymbols(base: Type<any>, typesWithValuePtr: Type<any>[]): void {
        const symbols = this._getTypeIdSymbols(base);

        for (const v of typesWithValuePtr) {
            symbols.ptrTypes.push(v);
            symbols.ptrSymbols.push({
                symbol: `?id@?1???$type_id@${base.symbol}${v.symbol}@Bedrock@@YA?AV?$typeid_t@${base.symbol}@1@XZ@4V21@A`,
                type: v,
            });
        }
    }

    addParserSymbols(types: Type<any>[]): void {
        this.parserTypes.push(...types);
        for (const type of types) {
            this.parserSymbols.push(
                `??$parse@${type.symbol}@CommandRegistry@@AEBA_NPEAXAEBUParseToken@0@AEBVCommandOrigin@@HAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@4@@Z`,
            );
        }
    }

    *iterateTypeIdFns(base: Type<any>): IterableIterator<[Type<any>, NativePointer]> {
        const symbols = this.typeForIds.get(base);
        if (symbols == null) return;

        for (let i = 0; i < symbols.fnSymbols.length; i++) {
            const symbol = symbols.fnSymbols[i];
            try {
                const addr = proc[symbol];
                yield [symbols.fnTypes[i], addr];
            } catch (err) {
                errorlog(`type_id<${base.name}, ${symbols.fnTypes[i].name}>() function not found`);
                errorlog(`symbol: ${symbol}`);
            }
        }
    }
    *iterateTypeIdPtrs(base: Type<any>): IterableIterator<[Type<any>, NativePointer]> {
        const symbols = this.typeForIds.get(base);
        if (symbols == null) return;

        for (let i = 0; i < symbols.ptrSymbols.length; i++) {
            const { symbol, type } = symbols.ptrSymbols[i];
            try {
                const addr = proc[symbol];
                yield [symbols.ptrTypes[i], addr];
            } catch (err) {
                errorlog(`type_id<${base.name}, ${type.name}> id pointer not found`);
                errorlog(`symbol: ${symbol}`);
            }
        }
    }
    *iterateCounters(): IterableIterator<[Type<any>, NativePointer]> {
        for (let i = 0; i < this.counterBases.length; i++) {
            const symbol = this.counterSymbols[i];
            const addr = proc[symbol];
            yield [this.counterBases[i], addr];
        }
    }
    *iterateParsers(): IterableIterator<[Type<any>, NativePointer]> {
        for (let i = 0; i < this.parserTypes.length; i++) {
            const symbol = this.parserSymbols[i];
            const addr = proc[symbol];
            yield [this.parserTypes[i], addr];
        }
    }
}
