import { asm, Register } from "./assembler";
import { AllocatedPointer } from "./core";
import { NativeClass, NativeClassType } from "./nativeclass";
import { procHacker } from "./prochacker";

interface ThisGetterItem<DEST> {
    type: NativeClassType<any>;
    key: keyof DEST;
    buffer: AllocatedPointer;
}

export class ThisGetter<DEST> {
    private items: ThisGetterItem<DEST>[] = [];

    constructor(private readonly dest: DEST) {}

    register<T extends NativeClass>(type: new () => T, symbol: string, key: keyof DEST): void {
        const buffer = new AllocatedPointer(8);
        this.items.push({ type: type as NativeClassType<T>, key, buffer });
        const code = asm().stack_c(0x28).mov_r_c(Register.r10, buffer).mov_rp_r(Register.r10, 1, 0, Register.rcx).alloc();
        procHacker.hookingRawWithCallOriginal(symbol, code, [], []);
    }

    finish(): void {
        const items = this.items;
        this.items = [];
        for (const item of items) {
            this.dest[item.key] = item.buffer.getPointerAs(item.type);
        }
    }
}
