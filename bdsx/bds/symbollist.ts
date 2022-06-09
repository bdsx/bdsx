import { pdbcache } from "../pdbcache";

let symbolNames:string[]|null = null;

export function loadAllSymbols():string[] {
    if (symbolNames !== null) return symbolNames;
    return symbolNames = [...pdbcache.readKeys()];
}

/** @deprecated use loadAllSymbols() */
export const undecoratedPrivateSymbols:string[] = [];

/** @deprecated use loadAllSymbols() */
export const undecoratedSymbols:string[] = [];

/** @deprecated use loadAllSymbols() */
export declare const decoratedSymbols:string[];

Object.defineProperty(exports, 'decoratedSymbols', { get:loadAllSymbols });
