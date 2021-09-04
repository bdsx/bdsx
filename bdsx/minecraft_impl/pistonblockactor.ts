import { BlockPos, PistonBlockActor } from "../minecraft";
import { int8_t } from "../nativetype";

declare module "../minecraft" {
    interface PistonBlockActor {
        blockPos: BlockPos;
        pistonAction: int8_t;
    }
}

PistonBlockActor.abstract({
    blockPos: [BlockPos, 0x2c],
    pistonAction: [int8_t, 0xE0],
});
