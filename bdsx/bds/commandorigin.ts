import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { abstract } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { mce } from "bdsx/mce";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { makefunc, RawTypeId } from "../makefunc";
import { CxxStringWrapper } from "../pointer";
import { Actor } from "./actor";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { proc } from "./symbols";

@nativeClass(null)
export class CommandOrigin extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(mce.UUID)
    uuid:mce.UUID;
    @nativeField(ServerLevel.ref())
    level:ServerLevel;

    constructWith(vftable:VoidPointer, level:ServerLevel):void {
        this.vftable = vftable;
        this.level = level;
        this.uuid = mce.UUID.generate();
    }

    isServerCommandOrigin():boolean {
        return this.vftable.equals(ServerCommandOrigin_vftable);
    }

    /**
     * @deprecated use cmdorigin.destruct();
     */
    destructor():void {
        abstract();
    }
    getRequestId():string {
        const p = getRequestId.call(this) as CxxStringWrapper;
        const str = p.value;
        p.destruct();
        return str;
    }
    getName():string {
        const p = getName.call(this) as CxxStringWrapper;
        const str = p.value;
        p.destruct();
        return str;
    }
    getBlockPosition(): BlockPos {
        abstract();
    }
    getWorldPosition(): Vec3 {
        abstract();
    }
    getLevel(): Level {
        abstract();
    }
    getDimension(): Dimension {
        abstract();
    }
    getEntity():Actor {
        abstract();
    }
}

@nativeClass(null)
export class PlayerCommandOrigin extends CommandOrigin {
    // Actor*(*getEntity)(CommandOrigin* origin);
}

@nativeClass(null)
export class ScriptCommandOrigin extends PlayerCommandOrigin {
    // struct VFTable
    // {
    //     void (*destructor)(ScriptCommandOrigin*);
    //     Level* (*getLevel)(ScriptCommandOrigin*);
    // };
    // VFTable* vftable;
}

@nativeClass(0x58)
export class ServerCommandOrigin extends CommandOrigin {
}

const ServerCommandOrigin_vftable = proc["ServerCommandOrigin::`vftable'"];

// void destruct(CommandOrigin* origin);
CommandOrigin.prototype.destruct = makefunc.js([0x00], RawTypeId.Void, {this: CommandOrigin});

// std::string CommandOrigin::getRequestId();
const getRequestId = makefunc.js([0x08], CxxStringWrapper, {this: CommandOrigin, structureReturn: true});

// std::string CommandOrigin::getName();
const getName = makefunc.js([0x10], CxxStringWrapper, {this: CommandOrigin, structureReturn: true});

// BlockPos CommandOrigin::getBlockPosition();
CommandOrigin.prototype.getBlockPosition = makefunc.js([0x18], BlockPos, {this: CommandOrigin, structureReturn: true});

// Vec3 getWorldPosition(CommandOrigin* origin);
CommandOrigin.prototype.getWorldPosition = makefunc.js([0x20], Vec3, {this: CommandOrigin, structureReturn: true});

// Level* getLevel(CommandOrigin* origin);
CommandOrigin.prototype.getLevel = makefunc.js([0x28], Level, {this: CommandOrigin});

// Dimension* (*getDimension)(CommandOrigin* origin);
CommandOrigin.prototype.getDimension = makefunc.js([0x30], Dimension, {this: CommandOrigin});

// Actor* getEntity(CommandOrigin* origin);
CommandOrigin.prototype.getEntity = makefunc.js([0x38], Actor, {this: CommandOrigin});
