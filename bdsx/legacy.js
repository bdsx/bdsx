//@ts-check
/**
 * @deprecated
 */
"use strict";

const { bedrockServer } = require("./launcher");
const { makefunc } = require("./makefunc");
const { RuntimeError, ipfilter, chakraUtil } = require("./core");
const { remapError } = require("./source-map-support");
const { LoginPacket } = require("./bds/packets");
const { events } = require("./event");
const { MinecraftPacketIds } = require("./bds/packetids");
const { EventEx } = require("./eventtarget");
const { capi } = require('./capi');
const { BlockPos } = require("./bds/blockpos");
const { NetworkIdentifier } = require('./bds/networkidentifier');
const { NativeType, CxxString, bool_t, void_t } = require("./nativetype");
const { CommandOrigin } = require("./bds/commandorigin");
const { fsutil } = require('./fsutil');
const { mce } = require('./mce');
const { Actor } = require("./bds/actor");
const { HashSet } = require("./hashset");
const { CommandOutput } = require("./bds/command");
const { asm, Register } = require("./assembler");
const { hacktool } = require('./hacktool');
const { ScoreboardId } = require("./bds/scoreboard");
const core = require('./core');
const packet = require("./bds/packet");
const command = require('./command');
const common = require('./common');
const connreq = require('./bds/connreq');
const pointer = require('./pointer');
const util = require('./util');
const packets = require('./bds/packets');
const sharedpointer = require('./sharedpointer');
const CANCEL = common.CANCEL;
const abstract = common.abstract;
//@ts-ignore
core.pdb.open = ()=>{};

let onRuntimeError = null;

exports.legacy = {
    setOnRuntimeErrorListener(cb) {
        onRuntimeError = cb;
    },
    catchAndSendToRuntimeErrorListener(err) {
        remapError(err);
        if (!(err instanceof RuntimeError)) {
            console.error(err.stack || err.message);
            return;
        }
        const lastSender = ipfilter.getLastSender();
        if (onRuntimeError !== null) {
            try {
                onRuntimeError(err.stack, err.nativeStack || '', lastSender) !== false;
            }
            catch (err) {
                const errstr = err.stack;
                console.log("[Error in onRuntimeError callback]");
                console.log(errstr);
            }
        }
    }
};

// sharedpointer
class SharedPointer extends core.StaticPointer {
    constructor(sharedptr) {
        //@ts-ignore
        super(sharedptr.p);
        this.sharedptr = sharedptr;
    }

    assignTo(dest) {
        this.assignTo(dest);
    }

    dispose() {
        this.sharedptr.dispose();
    }
};
//@ts-ignore
sharedpointer.SharedPointer = SharedPointer;
exports.SharedPointer = SharedPointer;

// bds/packet
//@ts-ignore
packet.createPacket = function createPacket(packetId) {
    const p = new packet.PacketSharedPtr(true);
    packet.createPacketRaw(p, packetId);
    return new SharedPointer(p);
};
//@ts-ignore
packet.Packet.prototype.destructor = function destructor() {
    abstract();
};

// nethook
const EventType = {};
EventType[EventType["Raw"] = 0] = "Raw";
EventType[EventType["Before"] = 1] = "Before";
EventType[EventType["After"] = 2] = "After";
EventType[EventType["Send"] = 3] = "Send";
EventType[EventType["SendRaw"] = 4] = "SendRaw";

function readLoginPacket(packet) {
    const loginpacket = new LoginPacket(packet);
    const conn = loginpacket.connreq;
    if (conn !== null) {
        const cert = conn.cert;
        if (cert !== null) {
            return [cert.getXuid(), cert.getId()];
        }
    }
    throw Error('LoginPacket does not have cert info');
}
exports.readLoginPacket = readLoginPacket;

function sendPacket(networkIdentifier, packet, unknownarg = 0) {
    new packet.Packet(packet).sendTo(networkIdentifier, unknownarg);
}
function raw(id) {
    return events.packetRaw(id);
}
function before(id) {
    return events.packetBefore(id);
}
function after(id) {
    return events.packetAfter(id);
}
function send(id) {
    return events.packetSend(id);
}
function sendRaw(id) {
    return events.packetSendRaw(id);
}

require('./nethook').nethook = {
    //@ts-ignore
    readLoginPacket,
    //@ts-ignore
    createPacket: packet.createPacket,
    sendPacket,
    raw,
    before,
    after,
    send,
    sendRaw,
    close: events.networkDisconnected
};

// deprecated common
//@ts-ignore
common.SYMOPT_UNDNAME = 0x00000002;
//@ts-ignore
common.UNDNAME_COMPLETE = 0x0000;
//@ts-ignore
common.UNDNAME_NAME_ONLY = 0x1000;

//@ts-ignore
capi.getJsValueRef = chakraUtil.asJsValueRef;

// deprecated command

//@ts-ignore
command.hookingForCommand = function hookingForCommand() {};

class CommandEventImpl {
    constructor(command, networkIdentifier) {
        this.command = command;
        this.networkIdentifier = networkIdentifier;
        this.isModified = false;
    }

    setCommand(command) {
        this.isModified = true;
        this.command = command;
    }
}

class UserCommandEvents extends EventEx {
    constructor() {
        super();

        this.listener = (ptr, networkIdentifier) => {
            const command = ptr.command;
            const ev = new CommandEventImpl(command, networkIdentifier);
            if (this.fire(ev) === CANCEL) return CANCEL;
            if (ev.isModified) {
                ptr.command = ev.command;
            }
        };
    }

    onStarted() {
        events.packetBefore(MinecraftPacketIds.CommandRequest).on(this.listener);
    }
    onCleared() {
        events.packetBefore(MinecraftPacketIds.CommandRequest).remove(this.listener);
    }
}
//@ts-ignore
command.net = new UserCommandEvents();

// bds/enumfilter

//@ts-ignore
const MinecraftComponent = global.MinecraftComponent = {};
MinecraftComponent["ArmorContainer"] = "minecraft:armor_container";
MinecraftComponent["Attack"] = "minecraft:attack";
MinecraftComponent["CollisionBox"] = "minecraft:collision_box";
MinecraftComponent["DamageSensor"] = "minecraft:damage_sensor";
MinecraftComponent["Equipment"] = "minecraft:equipment";
MinecraftComponent["Equippable"] = "minecraft:equippable";
MinecraftComponent["Explode"] = "minecraft:explode";
MinecraftComponent["HandContainer"] = "minecraft:hand_container";
MinecraftComponent["Healable"] = "minecraft:healable";
MinecraftComponent["Health"] = "minecraft:health";
MinecraftComponent["HotbarContainer"] = "minecraft:hotbar_container";
MinecraftComponent["Interact"] = "minecraft:interact";
MinecraftComponent["Inventory"] = "minecraft:inventory";
MinecraftComponent["InventoryContainer"] = "minecraft:inventory_container";
MinecraftComponent["LookAt"] = "minecraft:lookat";
MinecraftComponent["Nameable"] = "minecraft:nameable";
MinecraftComponent["Position"] = "minecraft:position";
MinecraftComponent["Rotation"] = "minecraft:rotation";
MinecraftComponent["Shooter"] = "minecraft:shooter";
MinecraftComponent["SpawnEntity"] = "minecraft:spawn_entity";
MinecraftComponent["Teleport"] = "minecraft:teleport";
MinecraftComponent["TickWorld"] = "minecraft:tick_world";

//@ts-ignore
const MinecraftDimension = global.MinecraftDimension = {};
MinecraftDimension["Overworld"] = "overworld";
MinecraftDimension["Nether"] = "nether";
MinecraftDimension["End"] = "the end";

//@ts-ignore
const MinecraftParticleEffect = global.MinecraftParticleEffect = {};
MinecraftParticleEffect["MobSpellAmbient"] = "minecraft:mobspellambient";
MinecraftParticleEffect["VillagerAngry"] = "minecraft:villagerangry";
MinecraftParticleEffect["BlockBreak"] = "minecraft:blockbreak";
MinecraftParticleEffect["BlockDust"] = "minecraft:blockdust";
MinecraftParticleEffect["Bubble"] = "minecraft:bubble";
MinecraftParticleEffect["Evaporation"] = "minecraft:evaporation";
MinecraftParticleEffect["CriticalHit"] = "minecraft:crit";
MinecraftParticleEffect["DragonBreath"] = "minecraft:dragonbreath";
MinecraftParticleEffect["DripLava"] = "minecraft:driplava";
MinecraftParticleEffect["DripWater"] = "minecraft:dripwater";
MinecraftParticleEffect["RedstoneDust"] = "minecraft:reddust";
MinecraftParticleEffect["Spell"] = "minecraft:spell";
MinecraftParticleEffect["MobAppearance"] = "minecraft:mobappearance";
MinecraftParticleEffect["EnchantingTable"] = "minecraft:enchantingtable";
MinecraftParticleEffect["EndRod"] = "minecraft:endrod";
MinecraftParticleEffect["MobSpell"] = "minecraft:mobspell";
MinecraftParticleEffect["LargeExplosion"] = "minecraft:largeexplode";
MinecraftParticleEffect["FallingDust"] = "minecraft:fallingdust";
MinecraftParticleEffect["FireworksSpark"] = "minecraft:fireworksspark";
MinecraftParticleEffect["WaterWake"] = "minecraft:waterwake";
MinecraftParticleEffect["Flame"] = "minecraft:flame";
MinecraftParticleEffect["VillagerHappy"] = "minecraft:villagerhappy";
MinecraftParticleEffect["Heart"] = "minecraft:heart";
MinecraftParticleEffect["HugeExplosion"] = "minecraft:hugeexplosion";
MinecraftParticleEffect["MobSpellInstantaneous"] = "minecraft:mobspellinstantaneous";
MinecraftParticleEffect["IconCrack"] = "minecraft:iconcrack";
MinecraftParticleEffect["Slime"] = "minecraft:slime";
MinecraftParticleEffect["SnowballPoof"] = "minecraft:snowballpoof";
MinecraftParticleEffect["LargeSmoke"] = "minecraft:largesmoke";
MinecraftParticleEffect["Lava"] = "minecraft:lava";
MinecraftParticleEffect["MobFlame"] = "minecraft:mobflame";
MinecraftParticleEffect["TownAura"] = "minecraft:townaura";
MinecraftParticleEffect["Nautilus"] = "minecraft:nautilus";
MinecraftParticleEffect["Note"] = "minecraft:note";
MinecraftParticleEffect["Explode"] = "minecraft:explode";
MinecraftParticleEffect["Portal"] = "minecraft:portal";
MinecraftParticleEffect["RainSplash"] = "minecraft:rainsplash";
MinecraftParticleEffect["Smoke"] = "minecraft:smoke";
MinecraftParticleEffect["WaterSplash"] = "minecraft:watersplash";
MinecraftParticleEffect["Ink"] = "minecraft:ink";
MinecraftParticleEffect["Terrain"] = "minecraft:terrain";
MinecraftParticleEffect["Totem"] = "minecraft:totem";
MinecraftParticleEffect["TrackingEmitter"] = "minecraft:trackingemitter";
MinecraftParticleEffect["WitchSpell"] = "minecraft:witchspell";

//@ts-ignore
const ReceiveFromMinecraftServer = global.ReceiveFromMinecraftServer = {};
ReceiveFromMinecraftServer["BlockDestructionStarted"] = "minecraft:block_destruction_started";
ReceiveFromMinecraftServer["BlockDestructionStopped"] = "minecraft:block_destruction_stopped";
ReceiveFromMinecraftServer["BlockInteractedWith"] = "minecraft:block_interacted_with";
ReceiveFromMinecraftServer["EntityAcquiredItem"] = "minecraft:entity_acquired_item";
ReceiveFromMinecraftServer["EntityCarriedItemChanged"] = "minecraft:entity_carried_item_changed";
ReceiveFromMinecraftServer["EntityCreated"] = "minecraft:entity_created";
ReceiveFromMinecraftServer["EntityDeath"] = "minecraft:entity_death";
ReceiveFromMinecraftServer["EntityDroppedItem"] = "minecraft:entity_dropped_item";
ReceiveFromMinecraftServer["EntityEquippedArmor"] = "minecraft:entity_equipped_armor";
ReceiveFromMinecraftServer["EntityStartRiding"] = "minecraft:entity_start_riding";
ReceiveFromMinecraftServer["EntityStopRiding"] = "minecraft:entity_stop_riding";
ReceiveFromMinecraftServer["EntityTick"] = "minecraft:entity_tick";
ReceiveFromMinecraftServer["EntityUseItem"] = "minecraft:entity_use_item";
ReceiveFromMinecraftServer["PistonMovedBlock"] = "minecraft:piston_moved_block";
ReceiveFromMinecraftServer["PlaySound"] = "minecraft:play_sound";
ReceiveFromMinecraftServer["PlayerAttackedEntity"] = "minecraft:player_attacked_entity";
ReceiveFromMinecraftServer["PlayerDestroyedBlock"] = "minecraft:player_destroyed_block";
ReceiveFromMinecraftServer["PlayerPlacedBlock"] = "minecraft:player_placed_block";
ReceiveFromMinecraftServer["WeatherChanged"] = "minecraft:weather_changed";

//@ts-ignore
const SendToMinecraftServer = global.SendToMinecraftServer = {};
SendToMinecraftServer["DisplayChat"] = "minecraft:display_chat_event";
SendToMinecraftServer["ExecuteCommand"] = "minecraft:execute_command";
SendToMinecraftServer["PlaySound"] = "minecraft:play_sound";
SendToMinecraftServer["ScriptLoggerConfig"] = "minecraft:script_logger_config";
SendToMinecraftServer["SpawnParticleAttachedEntity"] = "minecraft:spawn_particle_attached_entity";
SendToMinecraftServer["SpawnParticleInWorld"] = "minecraft:spawn_particle_in_world";

// bds/packets

//@ts-ignore
packets.NetworkBlockPosition = BlockPos;
//@ts-ignore
packets.EntityEventPacket = packets.ActorEventPacket;
//@ts-ignore
packets.ScoreboardId = ScoreboardId;

// bds/connreq
//@ts-ignore
connreq.ConnectionReqeust = connreq.ConnectionRequest;

// networkdientifier
//@ts-ignore
NetworkIdentifier.close = events.networkDisconnected;

// cxxvector
//@ts-ignore
require('./cxxvector').CxxVector.prototype.dispose = function dispose() {
    this[NativeType.dtor]();
};

// bds/commandorigin
//@ts-ignore
CommandOrigin.prototype.destructor = function destructor() {
    abstract();
};

// util

//@ts-ignore
util.isDirectory = function isDirectory(filepath) {
    return fsutil.isDirectorySync(filepath);
};

//@ts-ignore
util.isFile = function isFile(filepath) {
    return fsutil.isDirectorySync(filepath);
};


// pointer

//@ts-ignore
class Pointer extends pointer.Wrapper {
    static make(type) {
        //@ts-ignore
        class TypedPointer extends Pointer {}
        TypedPointer.prototype.type = type;
        // @ts-ignore
        TypedPointer.defineAsUnion({p:type, value:type});
        return TypedPointer;
    }
}
//@ts-ignore
pointer.Pointer = Pointer;
//@ts-ignore
pointer.CxxStringStructure = pointer.CxxStringWrapper;
//@ts-ignore
pointer.CxxStringPointer = pointer.Wrapper.make(CxxString);
//@ts-ignore
pointer.CxxStringWrapper.prototype.dispose = function dispose() {
    this.destruct();
};

// mce
//@ts-ignore
mce.UUIDPointer = Pointer.make(mce.UUID);

// launcher
//@ts-ignore
bedrockServer.loading = events.serverLoading;
//@ts-ignore
bedrockServer.open = events.serverOpen;
//@ts-ignore
bedrockServer.close = events.serverClose;
//@ts-ignore
bedrockServer.update = events.serverUpdate;
//@ts-ignore
bedrockServer.error = events.error;
//@ts-ignore
bedrockServer.bedrockLog = events.serverLog;
//@ts-ignore
bedrockServer.commandOutput = events.commandOutput;

// makefunc
const RawTypeId = {};
RawTypeId[RawTypeId["Int32"] = 0] = "Int32";
RawTypeId[RawTypeId["FloatAsInt64"] = 1] = "FloatAsInt64";
RawTypeId[RawTypeId["Float32"] = 2] = "Float32";
RawTypeId[RawTypeId["Float64"] = 3] = "Float64";
RawTypeId[RawTypeId["StringAnsi"] = 4] = "StringAnsi";
RawTypeId[RawTypeId["StringUtf8"] = 5] = "StringUtf8";
RawTypeId[RawTypeId["StringUtf16"] = 6] = "StringUtf16";
RawTypeId[RawTypeId["Buffer"] = 7] = "Buffer";
RawTypeId[RawTypeId["Bin64"] = 8] = "Bin64";
RawTypeId[RawTypeId["Boolean"] = 9] = "Boolean";
RawTypeId[RawTypeId["JsValueRef"] = 10] = "JsValueRef";
RawTypeId[RawTypeId["Void"] = 11] = "Void";
RawTypeId[RawTypeId["Float"] = 3] = "Float";

//@ts-ignore
core.makefunc = makefunc.makefunc;
//@ts-ignore
makefunc.RawTypeId = RawTypeId;
//@ts-ignore
common.RawTypeId = RawTypeId;

// actor

//@ts-ignore
Actor.prototype.getTypeId = Actor.prototype.getEntityTypeId;
//@ts-ignore
Actor.prototype.getRuntimeId = Actor.prototype.getRuntimeID;
Object.defineProperties(Actor.prototype, {
    runtimeId:{
        get(){
            return this.getRuntimeID();
        }
    },
    demension: {
        get(){
            return this.getDimension();
        }
    }
});

// hashset

//@ts-ignore
HashSet.prototype.entires = HashSet.prototype.keys;

// command
//@ts-ignore
command.hook = events.command;
//@ts-ignore
command.command.hook = events.command;
//@ts-ignore
command.CustomCommandFactory.prototype.override = function override(callback, ...parameters) {
    const fields = Object.create(null);
    for (const [name, type, optkey] of parameters) {
        if (name in fields)
            throw Error(`${name}: field name dupplicated`);
        fields[name] = type;
        if (optkey != null) {
            if (optkey in fields)
                throw Error(`${optkey}: field name dupplicated`);
            fields[optkey] = bool_t;
        }
    }
    class CustomCommandImpl extends command.CustomCommand {
        [NativeType.ctor]() {
            this.self_vftable.execute = customCommandExecute;
        }
        execute(origin, output) {
            callback(this, origin, output);
        }
    }
    CustomCommandImpl.define(fields);
    const customCommandExecute = makefunc.np(function (origin, output) {
        this.execute(origin, output);
    }, void_t, { this: CustomCommandImpl }, CommandOrigin, CommandOutput);
    const params = [];
    for (const [name, type, optkey] of parameters) {
        if (optkey !== undefined) {
            //@ts-ignore
            params.push(CustomCommandImpl.optional(name, optkey));
        }
        else {
            //@ts-ignore
            params.push(CustomCommandImpl.mandatory(name, null));
        }
    }
    this.registry.registerOverload(this.name, CustomCommandImpl, params);
    return this;
};

// hacktool
//@ts-ignore
hacktool.hook = function hook(from, to, originalCodeSize, tempRegister) {
    const newcode = asm().write(...from.getBuffer(originalCodeSize));
    if (tempRegister != null) newcode.jmp64(from, tempRegister);
    else newcode.jmp64_notemp(from.add(originalCodeSize));
    const original = newcode.alloc();

    hacktool.jump(from, to, Register.rax, originalCodeSize);
    return original;
}
