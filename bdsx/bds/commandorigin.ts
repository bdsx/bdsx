import { BlockPos, Vec3 } from "../bds/blockpos";
import { capi } from "../capi";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { mce } from "../mce";
import { AbstractClass, nativeClass, nativeField, vectorDeletingDestructor } from "../nativeclass";
import { CxxString, int32_t, NativeType, uint8_t, void_t } from "../nativetype";
import { procHacker } from "../prochacker";
import { Actor, DimensionId } from "./actor";
import type { CommandPermissionLevel, CommandPositionFloat } from "./command";
import { JsonValue } from "./connreq";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { CompoundTag } from "./nbt";
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
     * Returns the dimension of the received command
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
    handleCommandOutputCallback(value:unknown & IExecuteCommandCallback['data'], statusCode?:number, statusMessage?:string):void {
        if (statusCode == null) statusCode = value.statusCode;
        if (statusMessage == null) statusMessage = value.statusMessage;
        const v = capi.malloc(JsonValue[NativeType.size]).as(JsonValue);
        v.constructWith(value);
        handleCommandOutputCallback.call(this, statusCode, statusMessage, v);
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

const ActorCommandOrigin$ActorCommandOrigin = procHacker.js("??0ActorCommandOrigin@@QEAA@AEAVActor@@@Z", void_t, null, ActorCommandOrigin, Actor);

@nativeClass(0x50)
export class VirtualCommandOrigin extends CommandOrigin {
    static allocateWith(origin:CommandOrigin, actor:Actor, cmdPos:CommandPositionFloat):VirtualCommandOrigin {
        abstract();
    }
    static constructWith(origin:CommandOrigin, actor:Actor, cmdPos:CommandPositionFloat):VirtualCommandOrigin {
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
        ServerCommandOrigin$ServerCommandOrigin(ptr, requestId, level, permissionLevel, dimension?.getDimensionId() ?? DimensionId.Overworld);
        return ptr;
    }
    static allocateWith(requestId:string, level:ServerLevel, permissionLevel:CommandPermissionLevel, dimension:Dimension|null):ServerCommandOrigin {
        const ptr = capi.malloc(ServerCommandOrigin[NativeType.size]).as(ServerCommandOrigin);
        ServerCommandOrigin$ServerCommandOrigin(ptr, requestId, level, permissionLevel, dimension?.getDimensionId() ?? DimensionId.Overworld);
        return ptr;
    }
}

const ServerCommandOrigin$ServerCommandOrigin = procHacker.js('??0ServerCommandOrigin@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAVServerLevel@@W4CommandPermissionLevel@@V?$AutomaticID@VDimension@@H@@@Z', void_t, null, ServerCommandOrigin,
    CxxString, ServerLevel, int32_t, int32_t);
const ServerCommandOrigin_vftable = proc["??_7ServerCommandOrigin@@6B@"];

CommandOrigin.prototype[NativeType.dtor] = vectorDeletingDestructor;

// std::string& CommandOrigin::getRequestId();
CommandOrigin.prototype.getRequestId = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getRequestId@ServerCommandOrigin@@UEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ',
    CxxString, {this: CommandOrigin});

// std::string CommandOrigin::getName();
CommandOrigin.prototype.getName = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getName@ServerCommandOrigin@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ',
    CxxString, {this: CommandOrigin, structureReturn: true});

// BlockPos CommandOrigin::getBlockPosition();
CommandOrigin.prototype.getBlockPosition = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getBlockPosition@ServerCommandOrigin@@UEBA?AVBlockPos@@XZ',
    BlockPos, {this: CommandOrigin, structureReturn: true});

// Vec3 CommandOrigin::getWorldPosition();
CommandOrigin.prototype.getWorldPosition = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getWorldPosition@ServerCommandOrigin@@UEBA?AVVec3@@XZ',
    Vec3, {this: CommandOrigin, structureReturn: true});

// std::optional<Vec2> CommandOrigin::getRotation();

// Level* CommandOrigin::getLevel();
CommandOrigin.prototype.getLevel = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getLevel@ServerCommandOrigin@@UEBAPEAVLevel@@XZ',
    Level, {this: CommandOrigin});

// Dimension* (*CommandOrigin::getDimension)();
CommandOrigin.prototype.getDimension = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getDimension@ServerCommandOrigin@@UEBAPEAVDimension@@XZ',
    Dimension, {this: CommandOrigin});

// Actor* CommandOrigin::getEntity();
CommandOrigin.prototype.getEntity = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getEntity@ServerCommandOrigin@@UEBAPEAVActor@@XZ',
    Actor, {this: CommandOrigin});

// enum CommandOriginType CommandOrigin::getOriginType();
CommandOrigin.prototype.getOriginType = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?getOriginType@ServerCommandOrigin@@UEBA?AW4CommandOriginType@@XZ',
    uint8_t, {this: CommandOrigin});

// void CommandOrigin::handleCommandOutputCallback(int, std::string &&, Json::Value &&) const
const handleCommandOutputCallback = procHacker.jsv(
    '??_7ScriptCommandOrigin@@6B@', '?handleCommandOutputCallback@ScriptCommandOrigin@@UEBAXH$$QEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@$$QEAVValue@Json@@@Z',
    void_t, {this: CommandOrigin}, int32_t, CxxString, JsonValue);

// struct CompoundTag CommandOrigin::serialize(void)
const serializeCommandOrigin = procHacker.jsv(
    '??_7ServerCommandOrigin@@6B@', '?serialize@ServerCommandOrigin@@UEBA?AVCompoundTag@@XZ',
    CompoundTag, {this:CommandOrigin}, CompoundTag);
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
