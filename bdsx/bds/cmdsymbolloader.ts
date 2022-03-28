import { NativePointer, pdb, VoidPointer } from "../core";
import { SYMOPT_PUBLICS_ONLY, UNDNAME_NAME_ONLY } from "../dbghelp";
import { Type } from "../nativetype";
import { templateName } from "../templatename";

interface TypeIdSymbols {
    fnTypes:Type<any>[];
    fnSymbols:string[];
    ptrTypes:Type<any>[];
    ptrSymbols:string[];
}

export class CommandSymbols {
    public enumParser:VoidPointer;

    private readonly counterSymbols:string[] = [];

    private readonly parserSymbols:string[] = [];
    private readonly parserTypes:Type<any>[] = [];
    private readonly counterBases:Type<any>[] = [];
    private readonly typeForIds = new Map<Type<any>, TypeIdSymbols>();

    private symbols:Record<string, NativePointer>;

    private _getTypeIdSymbols(base:Type<any>):TypeIdSymbols {
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

    addCounterSymbol(base:Type<any>):void {
        const baseSymbol = base.symbol || base.name;
        this.counterBases.push(base);
        this.counterSymbols.push(templateName('typeid_t', baseSymbol)+'::count');
    }

    addTypeIdFnSymbols(base:Type<any>, typesWithFunction:Type<any>[]):void {
        const baseSymbol = base.symbol || base.name;
        const symbols = this._getTypeIdSymbols(base);

        for (const v of typesWithFunction) {
            symbols.fnTypes.push(v);
            symbols.fnSymbols.push(templateName('type_id', baseSymbol, v.symbol || v.name));
        }
    }

    addTypeIdPtrSymbols(base:Type<any>, typesWithValuePtr:Type<any>[]):void {
        const baseSymbol = base.symbol || base.name;
        const symbols = this._getTypeIdSymbols(base);

        for (const v of typesWithValuePtr) {
            symbols.ptrTypes.push(v);
            symbols.ptrSymbols.push(`\`type_id<${baseSymbol},${v.symbol || v.name}>'::\`2'::id`);
        }
    }

    addParserSymbols(types:Type<any>[]):void {
        this.parserTypes.push(...types);
        for (const type of types) {
            this.parserSymbols.push(templateName('CommandRegistry::parse', type.symbol || type.name));
        }
    }

    load():void {
        const enumParserSymbol = `CommandRegistry::parseEnum<int,CommandRegistry::DefaultIdConverter<int> >`;

        pdb.setOptions(SYMOPT_PUBLICS_ONLY);
        const symbols = this.parserSymbols.concat(this.counterSymbols, [enumParserSymbol]);
        for (const idsymbols of this.typeForIds.values()) {
            symbols.push(...idsymbols.fnSymbols);
            symbols.push(...idsymbols.ptrSymbols);
        }
        this.symbols = pdb.getList(pdb.coreCachePath, {}, symbols, false, UNDNAME_NAME_ONLY);
        pdb.setOptions(0);
        pdb.close();

        this.enumParser = this.symbols[enumParserSymbol];
    }

    *iterateTypeIdFns(base:Type<any>):IterableIterator<[Type<any>, NativePointer]> {
        const symbols = this.typeForIds.get(base);
        if (symbols == null) return;

        for (let i=0;i<symbols.fnSymbols.length;i++) {
            const addr = this.symbols[symbols.fnSymbols[i]];
            if (addr == null) continue;
            yield [symbols.fnTypes[i], addr];
        }
    }
    *iterateTypeIdPtrs(base:Type<any>):IterableIterator<[Type<any>, NativePointer]> {
        const symbols = this.typeForIds.get(base);
        if (symbols == null) return;

        for (let i=0;i<symbols.ptrSymbols.length;i++) {
            const addr = this.symbols[symbols.ptrSymbols[i]];
            if (addr == null) continue;
            yield [symbols.ptrTypes[i], addr];
        }
    }
    *iterateCounters():IterableIterator<[Type<any>, NativePointer]> {
        for (let i=0;i<this.counterBases.length;i++) {
            const addr = this.symbols[this.counterSymbols[i]];
            if (addr == null) continue;
            yield [this.counterBases[i], addr];
        }
    }
    *iterateParsers():IterableIterator<[Type<any>, NativePointer]> {
        for (let i=0;i<this.parserTypes.length;i++) {
            const addr = this.symbols[this.parserSymbols[i]];
            if (addr == null) continue;
            yield [this.parserTypes[i], addr];
        }
    }
}
