import { Dimension } from "./bds/dimension";
import { Level, ServerLevel } from "./bds/level";
import { BlockPos, Vec3 } from "./blockpos";
import { abstract, RawTypeId } from "./common";
import { mce } from "./mce";
import { makefunc, VoidPointer } from "./core";
import { CxxStringPointer } from "./pointer";
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
        abstract();
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
        abstract();
    }
    getWorldPosition(): Vec3
    {
        abstract();
    }
    getLevel(origin:CommandOrigin): Level
    {
        abstract();
    }
    getDimension(origin:CommandOrigin): Dimension
    {
        abstract();
    }
    getEntity(origin:CommandOrigin):Actor
    {
        abstract();
    }
};
CommandOrigin.define({
	vftable:VoidPointer,
	uuid:mce.UUID,
	level:ServerLevel.ref(),
});

// vftable

// void destructor(CommandOrigin* origin);
CommandOrigin.prototype.destructor = makefunc.js([0x00], RawTypeId.Void, {this: CommandOrigin});

// std::string CommandOrigin::getRequestId();
const getRequestId = makefunc.js([0x08], CxxStringPointer, {this: CommandOrigin, structureReturn: true});

// std::string CommandOrigin::getName();
const getName = makefunc.js([0x10], CxxStringPointer, {this: CommandOrigin, structureReturn: true});

// BlockPos CommandOrigin::getBlockPosition();
CommandOrigin.prototype.getBlockPosition = makefunc.js([0x18], BlockPos, {this: CommandOrigin, structureReturn: true});

// Vec3 getWorldPosition(CommandOrigin* origin);
CommandOrigin.prototype.getWorldPosition = makefunc.js([0x20], Vec3, {this: CommandOrigin, structureReturn: true});

// Level* getLevel(CommandOrigin* origin);
CommandOrigin.prototype.getLevel = makefunc.js([0x28], Level, {this: CommandOrigin});

// Dimension* (*getDimension)(CommandOrigin* origin);
CommandOrigin.prototype.getDimension = makefunc.js([0x30], Dimension, {this: CommandOrigin});

// Actor* getEntity(CommandOrigin* origin);
CommandOrigin.prototype.getEntity = makefunc.js([0x30], Actor, {this: CommandOrigin});

// .....

export class PlayerCommandOrigin extends CommandOrigin
{
    // Actor*(*getEntity)(CommandOrigin* origin);
}
PlayerCommandOrigin.abstract({});
