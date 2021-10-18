import { int8_t } from "../nativetype";
declare module "../minecraft" {
    interface PistonBlockActor {
        blockPos: BlockPos;
        pistonAction: int8_t;
    }
}
