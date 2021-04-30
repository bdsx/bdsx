import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { abstract } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { mce } from "bdsx/mce";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { makefunc } from "../makefunc";
import { CxxString, void_t } from "../nativetype";
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
    getRequestId():CxxString {
        abstract();
    }
    getName():string {
        abstract();
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

    /**
     * actually, it's nullable when the server is just started without any joining
     */
    getDimension(): Dimension {
        abstract();
    }
    /**
     * it returns null if the command origin is the console
     */
    getEntity():Actor|null {
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
CommandOrigin.prototype.destruct = makefunc.js([0x00], void_t, {this: CommandOrigin});

// std::string CommandOrigin::getRequestId();
CommandOrigin.prototype.getRequestId = makefunc.js([0x08], CxxString, {this: CommandOrigin, structureReturn: true});

// std::string CommandOrigin::getName();
CommandOrigin.prototype.getName = makefunc.js([0x10], CxxString, {this: CommandOrigin, structureReturn: true});

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
