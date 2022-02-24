import { pdb } from "../core";
import { UNDNAME_NAME_ONLY } from "../dbghelp";
import { undecoratedSymbols, decoratedSymbols } from "./symbollist";

export const proc = pdb.getList(
    pdb.coreCachePath,
    {},
    undecoratedSymbols,
    false,
    UNDNAME_NAME_ONLY,
);
export const proc2 = pdb.getList(pdb.coreCachePath, {}, decoratedSymbols);

pdb.close();
