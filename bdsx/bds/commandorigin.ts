import { BlockPos, Vec3 } from "../bds/blockpos";
import { capi } from "../capi";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { AbstractClass, nativeClass, nativeField, vectorDeletingDestructor } from "../nativeclass";
import { CxxString, int32_t, NativeType, uint8_t, void_t } from "../nativetype";
import { Actor } from "./actor";
import type { CommandPermissionLevel, CommandPositionFloat } from "./command";
import { JsonValue } from "./connreq";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { CompoundTag } from "./nbt";
import { procHacker } from "./proc";
import { proc } from "./symbols";

export enum CommandOriginType {
    Player,
    CommandBlock,
    MinecartCommandBlock,
    DevConsole,
    Test,
    AutomationPlayer,
    ClientAutomation,
    Server,
    Entity,
    Virtual,
    GameArgument,
    EntityServer,
    Precompiled,
    GameMasterEntityServer,
    Scripting,
}

@nativeClass(null)
export class CommandOrigin extends AbstractClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(mce.UUID)
    uuid:mce.UUID;
    @nativeField(ServerLevel.ref())
    level:ServerLevel;

    dispose():void {
        abstract();
    }

    constructWith(vftable:VoidPointer, level:ServerLevel):void {
        this.vftable = vftable;
        this.level = level;
        this.uuid = mce.UUID.generate();
    }

    isServerCommandOrigin():boolean {
        return this.vftable.equalsptr(ServerCommandOrigin_vftable);
    }
    /**
     * @deprecated bedrock scripting API is removed.
     */
    isScriptCommandOrigin():boolean {
        return false; // this.vftable.equalsptr(ScriptCommandOrigin_vftable);
    }

    getRequestId():CxxString {
        abstract();
    }
    /**
     * @remarks Do not call this the second time, assign it to a variable when calling this
     */
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
    getOriginType():CommandOriginType {
        abstract();
    }

    /**
     * Returns the dimension of the recieved command
     */
    getDimension(): Dimension {
        abstract();
    }
    /**
     * Returns the entity that send the command
     * @remarks Null if the command origin is the console
     */
    getEntity():Actor|null {
        abstract();
    }

    /**
     * return the command result
     */
    handleCommandOutputCallback(value:unknown & IExecuteCommandCallback['data']):void {
        const v = capi.malloc(JsonValue[NativeType.size]).as(JsonValue);
        v.constructWith(value);
        handleCommandOutputCallback.call(this, v);
        v.destruct();
        capi.free(v);
    }

    /**
     * @param tag this function stores nbt values to this parameter
     */
    save(tag:CompoundTag):boolean;
     /**
      * it returns JS converted NBT
      */
    save():Record<string, any>;
    save(tag?:CompoundTag):any{
        abstract();
    }
    allocateAndSave():CompoundTag{
        const tag = CompoundTag.allocate();
        this.save(tag);
        return tag;
    }
}

@nativeClass(null)
export class PlayerCommandOrigin extends CommandOrigin {
    // Actor*(*getEntity)(CommandOrigin* origin);
}

@nativeClass(0x28)
export class ActorCommandOrigin extends CommandOrigin {
    // Actor*(*getEntity)(CommandOrigin* origin);

    static constructWith(actor:Actor):ActorCommandOrigin {
        const origin = new ActorCommandOrigin(true);
        ActorCommandOrigin$ActorCommandOrigin(origin, actor);
        return origin;
    }
    static allocateWith(actor:Actor):ActorCommandOrigin {
        const origin = capi.malloc(ActorCommandOrigin[NativeType.size]).as(ActorCommandOrigin);
        ActorCommandOrigin$ActorCommandOrigin(origin, actor);
        return origin;
    }
}

const ActorCommandOrigin$ActorCommandOrigin = procHacker.js("ActorCommandOrigin::ActorCommandOrigin", void_t, null, ActorCommandOrigin, Actor);

@nativeClass(0x50)
export class VirtualCommandOrigin extends CommandOrigin {
    static allocateWith(origin:CommandOrigin, actor:Actor, cmdPos:CommandPositionFloat):VirtualCommandOrigin {
        abstract();
    }
}

/**
 * @deprecated bedrock scripting API is removed.
 */
@nativeClass(null)
export class ScriptCommandOrigin extends PlayerCommandOrigin {
}

@nativeClass(0x48)
export class ServerCommandOrigin extends CommandOrigin {
    static constructWith(requestId:string, level:ServerLevel, permissionLevel:CommandPermissionLevel, dimension:Dimension|null):ServerCommandOrigin {
        const ptr = new ServerCommandOrigin(true);
        ServerCommandOrigin$ServerCommandOrigin(ptr, requestId, level, permissionLevel, dimension);
        return ptr;
    }
    static allocateWith(requestId:string, level:ServerLevel, permissionLevel:CommandPermissionLevel, dimension:Dimension|null):ServerCommandOrigin {
        const ptr = capi.malloc(ServerCommandOrigin[NativeType.size]).as(ServerCommandOrigin);
        ServerCommandOrigin$ServerCommandOrigin(ptr, requestId, level, permissionLevel, dimension);
        return ptr;
    }
}

const ServerCommandOrigin$ServerCommandOrigin = procHacker.js('ServerCommandOrigin::ServerCommandOrigin', void_t, null, ServerCommandOrigin,
    CxxString, ServerLevel, int32_t, Dimension);
const ServerCommandOrigin_vftable = proc["ServerCommandOrigin::`vftable'"];

CommandOrigin.prototype[NativeType.dtor] = vectorDeletingDestructor;

// std::string& CommandOrigin::getRequestId();
CommandOrigin.prototype.getRequestId = makefunc.js([0x08], CxxString, {this: CommandOrigin});

// std::string CommandOrigin::getName();
CommandOrigin.prototype.getName = makefunc.js([0x10], CxxString, {this: CommandOrigin, structureReturn: true});

// BlockPos CommandOrigin::getBlockPosition();
CommandOrigin.prototype.getBlockPosition = makefunc.js([0x18], BlockPos, {this: CommandOrigin, structureReturn: true});

// Vec3 CommandOrigin::getWorldPosition();
CommandOrigin.prototype.getWorldPosition = makefunc.js([0x20], Vec3, {this: CommandOrigin, structureReturn: true});

// std::optional<Vec2> CommandOrigin::getRotation();

// Level* CommandOrigin::getLevel();
CommandOrigin.prototype.getLevel = makefunc.js([0x30], Level, {this: CommandOrigin});

// Dimension* (*CommandOrigin::getDimension)();
CommandOrigin.prototype.getDimension = makefunc.js([0x38], Dimension, {this: CommandOrigin});

// Actor* CommandOrigin::getEntity();
CommandOrigin.prototype.getEntity = makefunc.js([0x40], Actor, {this: CommandOrigin});

// enum CommandOriginType CommandOrigin::getOriginType();
CommandOrigin.prototype.getOriginType = makefunc.js([0xb8], uint8_t, {this: CommandOrigin});

// void handleCommandOutputCallback(Json::Value &&);
const handleCommandOutputCallback = makefunc.js([0xd0], void_t, {this: CommandOrigin}, JsonValue);

// struct CompoundTag CommandOrigin::serialize(void)
const serializeCommandOrigin = makefunc.js([0xe8], CompoundTag, {this:CommandOrigin}, CompoundTag);
CommandOrigin.prototype.save = function(tag?:CompoundTag):any {
    if (tag != null) {
        return serializeCommandOrigin.call(this, tag);
    }
    tag = CompoundTag.allocate();
    if (!serializeCommandOrigin.call(this, tag)) return null;
    const res = tag.value();
    tag.dispose();
    return res;
};

ServerCommandOrigin.prototype[NativeType.dtor] = vectorDeletingDestructor;
