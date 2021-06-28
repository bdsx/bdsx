import { pdb } from "bdsx/core";
import { UNDNAME_NAME_ONLY } from "bdsx/dbghelp";
import { bool_t } from 'bdsx/nativetype';
import { ProcHacker } from "bdsx/prochacker";



let hacker = ProcHacker.load("../pdb.ini", ["MapItemSavedData::_updateTrackedEntityDecoration"], UNDNAME_NAME_ONLY); // Getting the function from the PDB.
pdb.close(); // Closing the PDB to save on memory

hacker.hooking("MapItemSavedData::_updateTrackedEntityDecoration", bool_t)(()=>false);