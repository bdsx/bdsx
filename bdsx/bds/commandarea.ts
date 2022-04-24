import { capi } from "../capi";
import { abstract } from "../common";
import { AbstractClass, nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, NativeType, void_t } from "../nativetype";
import { procHacker } from "../prochacker";
import { BlockSource } from "./block";
import { BlockPos } from "./blockpos";
import { Dimension } from "./dimension";

@nativeClass()
export class CommandArea extends AbstractClass {
    @nativeField(BlockSource.ref(), 0x8)
    blockSource:BlockSource;

    [NativeType.dtor]():void {
        abstract();
    }

    dispose():void {
        this.destruct();
        capi.free(this);
    }
}

@nativeClass()
export class CommandAreaFactory extends NativeClass {
    @nativeField(Dimension.ref())
    dimension:Dimension;

    static create(dimension:Dimension):CommandAreaFactory {
        const factory = new CommandAreaFactory(true);
        factory.dimension = dimension;
        return factory;
    }

    /**
     * @return CommandArea need to be disposed
     */
    findArea(pos1:BlockPos, pos2:BlockPos, b:boolean):CommandArea|null {
        abstract();
    }
}

CommandArea.prototype[NativeType.dtor] = procHacker.js('??1CommandArea@@QEAA@XZ', void_t, {this:CommandArea});
CommandAreaFactory.prototype.findArea = procHacker.js('?findArea@CommandAreaFactory@@QEBA?AV?$unique_ptr@VCommandArea@@U?$default_delete@VCommandArea@@@std@@@std@@AEBVBlockPos@@0_N1@Z', CommandArea.ref(), {structureReturn:true, this:CommandAreaFactory}, BlockPos, BlockPos, bool_t);
