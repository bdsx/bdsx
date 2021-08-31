import { ProcHacker } from "../prochacker";
import symbols = require("./symbols");


export import proc = symbols.proc;
export import proc2 = symbols.proc2;

/** @deprecated use hook() instead, check example_and_test/lowlevel-apihooking.ts */
export const procHacker = new ProcHacker(Object.assign({}, proc, proc2));
