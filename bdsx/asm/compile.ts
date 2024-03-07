import * as fs from "fs";
import * as path from "path";
import { asm } from "../assembler";
import { uv_async } from "../core";
import { remapAndPrintError } from "../source-map-support";
import { ParsingError } from "../textparser";
import { PACKET_ID_COUNT } from "../const";

try {
    console.log(`[bdsx-asm] start`);
    const code = asm();
    const asmpath = path.join(__dirname, "./asmcode.asm");
    const defines = {
        asyncSize: uv_async.sizeOfTask,
        sizeOfCxxString: 0x20,
        PACKET_ID_COUNT,
    };
    code.compile(fs.readFileSync(asmpath, "utf8"), defines, asmpath);
    const { js, dts, map } = code.toScript("..", "asmcode");
    fs.writeFileSync(path.join(__dirname, "./asmcode.js"), js);
    fs.writeFileSync(path.join(__dirname, "./asmcode.d.ts"), dts + `//# sourceMappingURL=asmcode.asm.map\n`);
    fs.writeFileSync(path.join(__dirname, "./asmcode.asm.map"), map!);
    console.log(`[bdsx-asm] done. no errors`);
} catch (err) {
    if (!(err instanceof ParsingError)) {
        remapAndPrintError(err);
    } else {
        console.log(`[bdsx-asm] failed`);
    }
}
