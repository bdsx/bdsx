import { pdb } from "../core";
import { SYMOPT_NO_PUBLICS, SYMOPT_PUBLICS_ONLY, UNDNAME_NAME_ONLY } from "../dbghelp";
import { decoratedSymbols, undecoratedPrivateSymbols, undecoratedSymbols } from "./symbollist";

pdb.setOptions(SYMOPT_NO_PUBLICS);
const v1 = pdb.getList(pdb.coreCachePath, {}, undecoratedPrivateSymbols,
    false, UNDNAME_NAME_ONLY);
pdb.setOptions(SYMOPT_PUBLICS_ONLY);
const v2 = pdb.getList(pdb.coreCachePath, v1, undecoratedSymbols,
    false, UNDNAME_NAME_ONLY);
const v3 = pdb.getList(pdb.coreCachePath, v2, decoratedSymbols);
pdb.setOptions(0);
pdb.close();

export const proc = v3;
/** @deprecated use proc */
export const proc2 = v3;
