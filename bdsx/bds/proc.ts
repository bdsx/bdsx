import { ProcHacker } from "bdsx/prochacker";
import symbols = require("./symbols");


export import proc = symbols.proc;
export import proc2 = symbols.proc2;

export const procHacker = new ProcHacker(Object.assign({}, proc, proc2));
