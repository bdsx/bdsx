import { ProcHacker } from "../prochacker";
import * as symbols from "./symbols";

export import proc = symbols.proc;
export import proc2 = symbols.proc2;

export const procHacker = new ProcHacker(Object.assign({}, proc, proc2));
