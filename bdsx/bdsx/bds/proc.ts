import { NativePointer } from "../core";
import * as prochacker from "../prochacker";
import * as symbols from "./symbols";

/** @deprecated use proc in bdsx/bds/symbols */
export import proc = symbols.proc;
/** @deprecated use proc in bdsx/bds/symbols */
export import proc2 = symbols.proc;

/** @deprecated use procHacker in bdsx/prochacker */
export const procHacker = new prochacker.ProcHacker<Record<string, NativePointer>>(proc);
