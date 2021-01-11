import { Dimension } from "./bds/dimension";
import { Level, ServerLevel } from "./bds/level";
import { BlockPos, Vec3 } from "./blockpos";
import { makefunc_vf } from "./capi";
import { RawTypeId } from "./common";
import { mce } from "./mce";
import { VoidPointer } from "./core";
import { CxxStringPointer, Pointer } from "./pointer";
import { NativeClass } from "./nativeclass";
import { Actor } from "./bds/actor";

export class CommandOrigin extends NativeClass
{
	vftable:VoidPointer;
	uuid:mce.UUID;
	level:ServerLevel;

    construct(vftable:VoidPointer, level:ServerLevel):void
    {
        this.vftable = this.vftable;
        this.level = level;
        this.uuid = mce.UUID.generate();
    }
    
    destructor():void
    {
        throw 'abstract';
    }
    getRequestId():string
    {
        const p = getRequestId.call(this) as CxxStringPointer;
        const str = p.p;
        p.destruct();
        return str;
    }
    getName():string
    {
        const p = getName.call(this) as CxxStringPointer;
        const str = p.p;
        p.destruct();
        return str;
    }
    getBlockPosition(): BlockPos
    {
        throw 'abstract';
    }
    getWorldPosition(): Vec3
    {
        throw 'abstract';
    }
    getLevel(origin:CommandOrigin): Level
    {
        throw 'abstract';
    }
    getDimension(origin:CommandOrigin): Dimension
    {
        throw 'abstract';
    }
    getEntity(origin:CommandOrigin):Actor
    {
        throw 'abstract';
    }
};
CommandOrigin.define({
	vftable:VoidPointer,
	uuid:mce.UUID,
	level:ServerLevel.ref(),
});

// vftable

// void destructor(CommandOrigin* origin);
CommandOrigin.prototype.destructor = makefunc_vf(0, 0x00, RawTypeId.Void, false);

// std::string getRequestId(CommandOrigin* origin);
const getRequestId = makefunc_vf(0, 0x08, CxxStringPointer, true);

// std::string getName(CommandOrigin* origin);
const getName = makefunc_vf(0, 0x10, CxxStringPointer, true);

// BlockPos getBlockPosition(CommandOrigin* origin);
CommandOrigin.prototype.getBlockPosition = makefunc_vf(0, 0x18, BlockPos, true);

// Vec3 getWorldPosition(CommandOrigin* origin);
CommandOrigin.prototype.getWorldPosition = makefunc_vf(0, 0x20, Vec3, true);

// Level* getLevel(CommandOrigin* origin);
CommandOrigin.prototype.getLevel = makefunc_vf(0, 0x28, Level, false);

// Dimension* (*getDimension)(CommandOrigin* origin);
CommandOrigin.prototype.getDimension = makefunc_vf(0, 0x30, Dimension, false);

// Actor* getEntity(CommandOrigin* origin);
CommandOrigin.prototype.getEntity = makefunc_vf(0, 0x30, Actor, false);

// .....

export class PlayerCommandOrigin extends CommandOrigin
{
    // Actor*(*getEntity)(CommandOrigin* origin);
}
PlayerCommandOrigin.abstract({});
