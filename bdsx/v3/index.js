"use strict";
const __tsb = {
// server.ts
server(){
if(__tsb.server.exports!=null) return __tsb.server.exports;
const exports=__tsb.server.exports={};
exports.server = void 0;
const constgetter_1 = require("../constgetter");
const mcglobal_1 = require("../mcglobal");
const minecraft_1 = require("../minecraft");
const events_1 = __tsb.events();
var server;
(function (server) {
    function getMotd() {
        return mcglobal_1.mcglobal.minecraft.getServerNetworkHandler().motd;
    }
    server.getMotd = getMotd;
    function setMotd(motd) {
        return mcglobal_1.mcglobal.minecraft.getServerNetworkHandler().setMotd(motd);
    }
    server.setMotd = setMotd;
    function getMaxPlayers() {
        return mcglobal_1.mcglobal.minecraft.getServerNetworkHandler().maxPlayers;
    }
    server.getMaxPlayers = getMaxPlayers;
    function setMaxPlayers(count) {
        mcglobal_1.mcglobal.minecraft.getServerNetworkHandler().setMaxNumPlayers(count);
    }
    server.setMaxPlayers = setMaxPlayers;
    function disconnectAllClients(message = 'disconnectionScreen.disconnected') {
        mcglobal_1.mcglobal.serverInstance.disconnectAllClients(message);
    }
    server.disconnectAllClients = disconnectAllClients;
    function getActivePlayerCount() {
        return mcglobal_1.mcglobal.level.getActivePlayerCount();
    }
    server.getActivePlayerCount = getActivePlayerCount;
    function nextTick() {
        return events_1.events.serverUpdate.promise();
    }
    server.nextTick = nextTick;
    server.networkProtocolVersion = minecraft_1.SharedConstants.NetworkProtocolVersion;
})(server = exports.server || (exports.server = {}));
(0, constgetter_1.defineConstGetter)(server, 'bdsVersion', () => {
    const ver = minecraft_1.SharedConstants.CurrentGameSemVersion;
    return ver.getMajor() + '.' + ver.getMinor() + '.' + ver.getPatch();
});
return exports;
},
// entity.ts
entity(){
if(__tsb.entity.exports!=null) return __tsb.entity.exports;
const exports=__tsb.entity.exports={};
exports.EntityCreatedEvent = exports.Entity = void 0;
const enums_1 = require("../enums");
const hook_1 = require("../hook");
const mcglobal_1 = require("../mcglobal");
const minecraft_1 = require("../minecraft");
const util_1 = require("../util");
const events_1 = __tsb.events();
const colors = require("colors");
const entityKey = Symbol('entity');
const entityMapper = Symbol('entityMapper');
const ATTRIBUTE_ID_MIN = enums_1.AttributeId.ZombieSpawnReinforcementsChange;
const ATTRIBUTE_ID_MAX = enums_1.AttributeId.JumpStrength;
class Entity {
    constructor(actor) {
        this.actor = actor;
        this.entity = null;
    }
    actorMust() {
        if (this.actor === null)
            throw Error(`${this}'s actor is not ready`);
        return this.actor;
    }
    get name() {
        if (this.actor === null)
            return 'unknown';
        return this.actorMust().getNameTag();
    }
    get identifier() {
        return this.actor.identifier;
    }
    get dimensionId() {
        return this.actorMust().getDimensionId();
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawEntity() {
        return this.actor;
    }
    // Actor.prototype.isItem = function() {
    //     return this instanceof Item;
    // };
    getPosition() {
        return this.actorMust().getPos();
    }
    getUniqueID() {
        return this.actorMust().getUniqueID();
    }
    getUniqueIdBin() {
        return this.actorMust().getUniqueID().value;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getAttributeInstance(id) {
        if (id < ATTRIBUTE_ID_MIN || id > ATTRIBUTE_ID_MAX)
            throw Error(`AttributeId ${id}, Out of range`);
        const instance = this.actorMust().getAttributes().getMutableInstance(id);
        if (instance === null)
            throw Error(`${this} has not ${enums_1.AttributeId[id]} attribute`);
        return instance;
    }
    getAttributeValues(id) {
        const attr = this.getAttributeInstance(id);
        return {
            current: attr.currentValue,
            min: attr.minValue,
            max: attr.maxValue,
            default: attr.defaultValue,
        };
    }
    getAttribute(id) {
        const attr = this.getAttributeInstance(id);
        return attr.currentValue;
    }
    setAttribute(id, value) {
        const attr = this.getAttributeInstance(id);
        if (typeof value === 'number') {
            attr.currentValue = value;
        }
        else {
            const { current, min, max, default: defaultv } = value;
            if (current != null)
                attr.currentValue = current;
            if (min != null)
                attr.minValue = min;
            if (max != null)
                attr.maxValue = max;
            if (defaultv != null)
                attr.defaultValue = defaultv;
        }
        return true;
    }
    teleport(pos, dimensionId = minecraft_1.DimensionId.Overworld) {
        const actor = this.actorMust();
        const cmd = minecraft_1.TeleportCommand.computeTarget(actor, pos, new minecraft_1.Vec3(true), dimensionId, minecraft_1.RelativeFloat.create(0, false), minecraft_1.RelativeFloat.create(0, false), 0);
        minecraft_1.TeleportCommand.applyTarget(actor, cmd);
    }
    addEffect(id, duration, amplifier = 0) {
        const mob = new minecraft_1.MobEffectInstance(true);
        mob.constructWith(id, duration, amplifier);
    }
    hasEffect(id) {
        const effect = minecraft_1.MobEffect.create(id);
        const retval = this.actorMust().hasEffect(effect);
        effect.destruct();
        return retval;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getEffect(id) {
        const effect = minecraft_1.MobEffect.create(id);
        const retval = this.actorMust().getEffect(effect);
        effect.destruct();
        return retval;
    }
    static registerMapper(rawClass, mapper) {
        rawClass.prototype[entityMapper] = mapper;
    }
    static fromUniqueId(lowBitsOrBin, highBits) {
        const id = minecraft_1.ActorUniqueID.create(lowBitsOrBin, highBits);
        const actor = mcglobal_1.mcglobal.level.fetchEntity(id, true);
        if (actor === null)
            return null;
        return Entity.fromRaw(actor);
    }
    static fromRaw(actor) {
        const actorx = actor;
        let entity = actorx[entityKey];
        if (entity != null)
            return entity;
        entity = actorx[entityMapper]();
        if (entity === null) {
            console.error(colors.red(`failed to get the Entity of [${actorx.constructor.name}:${actorx}]`));
            return null;
        }
        return actorx[entityKey] = entity;
    }
    /**
     * from the scripting API entity.
     */
    static fromEntity(entity) {
        const u = entity.__unique_id__;
        return Entity.fromUniqueId(u["64bit_low"], u["64bit_high"]);
    }
    toString() {
        if (this.actor !== null) {
            return this.actor.getNameTag();
        }
        else {
            return `[unknown ${this.constructor.name}]`;
        }
    }
}
exports.Entity = Entity;
Entity.registerMapper(minecraft_1.Actor, actor => new Entity(actor));
class EntityCreatedEvent {
    constructor(entity) {
        this.entity = entity;
    }
}
exports.EntityCreatedEvent = EntityCreatedEvent;
function onEntityCreated(actor) {
    const entity = Entity.fromRaw(actor);
    if (entity === null) {
        return _onEntityCreated.call(this, actor);
    }
    const event = new EntityCreatedEvent(entity);
    events_1.events.entityCreated.fire(event);
    (0, util_1._tickCallback)();
    return _onEntityCreated.call(this, event.entity.getRawEntity());
}
const _onEntityCreated = (0, hook_1.hook)(minecraft_1.ScriptServerActorEventListener, 'onActorCreated').call(onEntityCreated);
return exports;
},
// events\index.ts
events(){
if(__tsb.events.exports!=null) return __tsb.events.exports;
const exports=__tsb.events.exports={};
exports.events = void 0;
const common_1 = require("../common");
const eventtarget_1 = require("../eventtarget");
const minecraft_1 = require("../minecraft");
const source_map_support_1 = require("../source-map-support");
const PACKET_ID_COUNT = 0x100;
const PACKET_EVENT_COUNT = 0x500;
function getNetEventTarget(type, packetId) {
    if ((packetId >>> 0) >= PACKET_ID_COUNT) {
        throw Error(`Out of range: packetId < 0x100 (packetId=${packetId})`);
    }
    const id = type * PACKET_ID_COUNT + packetId;
    const target = packetAllTargets[id];
    if (target !== null)
        return target;
    return packetAllTargets[id] = new eventtarget_1.Event;
}
const packetAllTargets = new Array(PACKET_EVENT_COUNT);
for (let i = 0; i < PACKET_EVENT_COUNT; i++) {
    packetAllTargets[i] = null;
}
var events;
(function (events) {
    ////////////////////////////////////////////////////////
    // Block events
    /** Cancellable */
    events.blockDestroy = new eventtarget_1.Event;
    /** Cancellable */
    events.blockPlace = new eventtarget_1.Event;
    /** Not cancellable */
    events.pistonMove = new eventtarget_1.Event;
    /** Cancellable */
    events.farmlandDecay = new eventtarget_1.Event;
    /** Cancellable but requires additional stimulation */
    events.campfireLight = new eventtarget_1.Event;
    /** Cancellable but requires additional stimulation */
    events.campfireDouse = new eventtarget_1.Event;
    ////////////////////////////////////////////////////////
    // Entity events
    /** Cancellable */
    events.entityHurt = new eventtarget_1.Event;
    /** Not cancellable */
    events.entityHealthChange = new eventtarget_1.Event;
    /** Not cancellable */
    events.entityDie = new eventtarget_1.Event;
    /** Not cancellable */
    events.entitySneak = new eventtarget_1.Event;
    /** Cancellable */
    events.entityStartRiding = new eventtarget_1.Event;
    /** Cancellable but the client is still exiting though it will automatically ride again after rejoin */
    events.entityStopRiding = new eventtarget_1.Event;
    /** Not cancellable */
    events.entityCreated = new eventtarget_1.Event;
    /** Cancellable */
    events.splashPotionHit = new eventtarget_1.Event;
    ////////////////////////////////////////////////////////
    // Player events
    /** Cancellable */
    events.playerStartSwimming = new eventtarget_1.Event;
    /** Cancellable */
    events.playerAttack = new eventtarget_1.Event;
    /** Cancellable but only when player is in container screens*/
    events.playerDropItem = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerInventoryChange = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerRespawn = new eventtarget_1.Event;
    /** Cancellable */
    events.playerLevelUp = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerJoin = new eventtarget_1.Event;
    /** Cancellable */
    events.playerPickupItem = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerCrit = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerUseItem = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerLogin = new eventtarget_1.Event;
    /** Not cancellable */
    events.playerDisconnect = new eventtarget_1.Event;
    /** Cancellable */
    events.playerChat = new eventtarget_1.Event;
    ////////////////////////////////////////////////////////
    // Level events
    /** Cancellable */
    events.levelExplode = new eventtarget_1.Event;
    /** Not cancellable */
    events.levelTick = new eventtarget_1.Event;
    /** Cancellable but you won't be able to stop the server */
    events.levelSave = new eventtarget_1.Event;
    /** Cancellable */
    events.levelWeatherChange = new eventtarget_1.Event;
    ////////////////////////////////////////////////////////
    // Server events
    /**
     * before launched. after execute the main thread of BDS.
     * BDS will be loaded on the separated thread. this event will be executed concurrently with the BDS loading
     */
    events.serverLoading = new eventtarget_1.Event;
    /**
     * after BDS launched
     */
    events.serverOpen = new eventtarget_1.Event;
    /**
     * on tick
     */
    events.serverUpdate = new eventtarget_1.Event;
    /**
     * before system.shutdown, Minecraft is alive yet
     */
    events.serverStop = new eventtarget_1.Event;
    /**
     * after BDS closed
     */
    events.serverClose = new eventtarget_1.Event;
    /**
     * server console outputs
     */
    events.serverLog = new eventtarget_1.Event;
    ////////////////////////////////////////////////////////
    // Packet events
    let PacketEventType;
    (function (PacketEventType) {
        PacketEventType[PacketEventType["Raw"] = 0] = "Raw";
        PacketEventType[PacketEventType["Before"] = 1] = "Before";
        PacketEventType[PacketEventType["After"] = 2] = "After";
        PacketEventType[PacketEventType["Send"] = 3] = "Send";
        PacketEventType[PacketEventType["SendRaw"] = 4] = "SendRaw";
    })(PacketEventType = events.PacketEventType || (events.PacketEventType = {}));
    function packetEvent(type, packetId) {
        if ((packetId >>> 0) >= PACKET_ID_COUNT) {
            console.error(`Out of range: packetId < 0x100 (type=${PacketEventType[type]}, packetId=${packetId})`);
            return null;
        }
        const id = type * PACKET_ID_COUNT + packetId;
        return packetAllTargets[id];
    }
    events.packetEvent = packetEvent;
    /**
     * before 'before' and 'after'
     * earliest event for the packet receiving.
     * It will bring raw packet buffers before parsing
     * It can be canceled the packet if you return 'CANCEL'
     */
    function packetRaw(id) {
        return getNetEventTarget(PacketEventType.Raw, id);
    }
    events.packetRaw = packetRaw;
    /**
     * after 'raw', before 'after'
     * the event that before processing but after parsed from raw.
     * It can be canceled the packet if you return 'CANCEL'
     */
    function packetBefore(id) {
        return getNetEventTarget(PacketEventType.Before, id);
    }
    events.packetBefore = packetBefore;
    /**
     * after 'raw' and 'before'
     * the event that after processing. some fields are assigned after the processing
     */
    function packetAfter(id) {
        return getNetEventTarget(PacketEventType.After, id);
    }
    events.packetAfter = packetAfter;
    /**
     * before serializing.
     * it can modify class fields.
     */
    function packetSend(id) {
        return getNetEventTarget(PacketEventType.Send, id);
    }
    events.packetSend = packetSend;
    /**
     * after serializing. before sending.
     * it can access serialized buffer.
     */
    function packetSendRaw(id) {
        return getNetEventTarget(PacketEventType.SendRaw, id);
    }
    events.packetSendRaw = packetSendRaw;
    /**
     * @alias packetBefore(MinecraftPacketIds.Text)
     */
    events.chat = packetBefore(minecraft_1.MinecraftPacketIds.Text);
    ////////////////////////////////////////////////////////
    // Misc
    /** Not cancellable */
    events.queryRegenerate = new eventtarget_1.Event;
    /** Cancellable */
    events.scoreReset = new eventtarget_1.Event;
    /** Cancellable */
    events.scoreSet = new eventtarget_1.Event;
    /** Cancellable */
    events.scoreAdd = new eventtarget_1.Event;
    /** Cancellable */
    events.scoreRemove = new eventtarget_1.Event;
    /** Cancellable */
    events.objectiveCreate = new eventtarget_1.Event;
    /**
     * global error listeners
     * if returns 'CANCEL', then default error printing is disabled
     */
    events.error = eventtarget_1.Event.errorHandler;
    function errorFire(err) {
        if (err instanceof Error) {
            err.stack = (0, source_map_support_1.remapStack)(err.stack);
        }
        if (events.error.fire(err) !== common_1.CANCEL) {
            console.error(err && (err.stack || err));
        }
    }
    events.errorFire = errorFire;
    /**
     * command console outputs
     */
    events.commandOutput = new eventtarget_1.Event;
    /**
     * command input
     * Commands will be canceled if you return a error code.
     * 0 means success for error codes but others are unknown.
     */
    events.command = new eventtarget_1.Event;
})(events = exports.events || (exports.events = {}));
return exports;
},
// player.ts
player(){
if(__tsb.player.exports!=null) return __tsb.player.exports;
const exports=__tsb.player.exports={};
exports.Player = exports.PlayerComponent = void 0;
const minecraft_1 = require("../minecraft");
const entity_1 = __tsb.entity();
const events_1 = __tsb.events();
const system_1 = __tsb.system();
const colors = require("colors");
const inventory_1 = __tsb.inventory();
class PlayerComponent {
    constructor(player) {
        this.player = player;
    }
    /**
     * register this component class.
     * it will add the component to all Player instances.
     * can be filtered with UserComponent.available.
     */
    static register() {
        components.push(this);
        for (const player of namemap.values()) {
            if (this.available != null && !this.available(player))
                continue;
            player.addComponent(this);
        }
    }
}
exports.PlayerComponent = PlayerComponent;
const components = [];
const namemap = new Map();
const xuidmap = new Map();
const entityidmap = new Map();
const playerKey = Symbol('player');
class Player extends entity_1.Entity {
    constructor(networkIdentifier, _name, xuid) {
        super(null);
        this.networkIdentifier = networkIdentifier;
        this._name = _name;
        this.xuid = xuid;
        this.components = new Map();
        networkIdentifier[playerKey] = this;
        namemap.set(_name, this);
        xuidmap.set(xuid, this);
        this.ip;
    }
    actorMust() {
        if (this.actor === null)
            throw Error(`${this}'s actor is not ready`);
        return this.actor;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    sendPacket(packet) {
        packet.sendTo(this.networkIdentifier);
    }
    get disconnected() {
        return false;
    }
    get name() {
        return this._name;
    }
    get ip() {
        const ipport = this.networkIdentifier.toString();
        const idx = ipport.indexOf('|');
        return (idx !== -1) ? ipport.substr(0, idx) : ipport;
    }
    get inventory() {
        if (this._inv !== null)
            return this._inv;
        const inv = this.actorMust().getSupplies();
        return this._inv = new inventory_1.Inventory(inv);
    }
    addComponent(componentClass) {
        let component = this.components.get(componentClass);
        if (component == null) {
            this.components.set(componentClass, component = new componentClass(this));
        }
        return component;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawNetworkIdentifier() {
        return this.networkIdentifier;
    }
    getRawEntity() {
        return super.getRawEntity();
    }
    getCommandPermissionLevel() {
        return this.actorMust().getCommandPermissionLevel();
    }
    message(message) {
        if (this.disconnected)
            return;
        const textPacket = minecraft_1.TextPacket.create();
        textPacket.message = message;
        textPacket.sendTo(this.networkIdentifier);
        textPacket.dispose();
    }
    toString() {
        return `[${this._name} Player]`;
    }
    static all() {
        return namemap.values();
    }
    static *fromIP(ipaddr) {
        for (const player of namemap.values()) {
            if (player.ip === ipaddr)
                yield player;
        }
    }
    static fromName(name) {
        return namemap.get(name) || null;
    }
    static fromXuid(xuid) {
        return xuidmap.get(xuid) || null;
    }
    static fromEntity(entity) {
        return entityidmap.get(entity.id) || null;
    }
    static fromNetworkIdentifier(networkIdentifier) {
        return networkIdentifier[playerKey] || null;
    }
    static fromRaw(actor) {
        const entity = super.fromRaw(actor);
        return entity instanceof Player ? entity : null;
    }
}
exports.Player = Player;
events_1.events.serverOpen.on(() => {
    system_1.system.listenForEvent('minecraft:entity_created', ev => {
        const entity = ev.data.entity;
        if (entity.__identifier__ !== 'minecraft:player')
            return;
        const nameable = system_1.system.getComponent(entity, 'minecraft:nameable');
        if (nameable === null)
            return;
        const player = namemap.get(nameable.data.name);
        if (player == null) {
            console.error(colors.red(`player not found on entity_created (name=${nameable.data.name})`));
            return;
        }
        player.entity = entity;
    });
});
entity_1.Entity.registerMapper(minecraft_1.Player, actor => {
    const name = actor.getNameTag();
    return namemap.get(name) || null;
});
return exports;
},
// command.ts
command(){
if(__tsb.command.exports!=null) return __tsb.command.exports;
const exports=__tsb.command.exports={};
exports.command = void 0;
const tslib_1 = __tsb.tslib;
const command_1 = require("../bds/command");
const bin_1 = require("../bin");
const capi_1 = require("../capi");
const core_1 = require("../core");
const jsonvalue_1 = require("../jsonvalue");
const makefunc_1 = require("../makefunc");
const mcglobal_1 = require("../mcglobal");
const minecraft_1 = require("../minecraft");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const sharedpointer_1 = require("../sharedpointer");
const entity_1 = __tsb.entity();
const events_1 = __tsb.events();
const commandVersion = minecraft_1.CommandVersion.CurrentVersion;
const commandContextRefCounterVftable = minecraft_1.std._Ref_count_obj2.make(minecraft_1.CommandContext).__vftable;
const CommandContextSharedPtr = sharedpointer_1.SharedPtr.make(minecraft_1.CommandContext);
function createServerCommandOrigin(name, level, permissionLevel, dimension) {
    const origin = capi_1.capi.malloc(minecraft_1.ServerCommandOrigin[nativetype_1.NativeType.size]).as(minecraft_1.ServerCommandOrigin);
    origin.constructWith(name, level, permissionLevel, dimension);
    return origin;
}
function createCommandContext(command, origin) {
    const sharedptr = new CommandContextSharedPtr(true);
    sharedptr.create(commandContextRefCounterVftable);
    sharedptr.p.constructWith(command, origin, commandVersion);
    return sharedptr;
}
let CustomCommand = class CustomCommand extends minecraft_1.Command {
    [nativetype_1.NativeType.ctor]() {
        this.self_vftable.destructor = customCommandDtor;
        this.self_vftable.execute = null;
        this.vftable = this.self_vftable;
    }
    execute(origin, output) {
        // empty
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(minecraft_1.Command.VFTable)
], CustomCommand.prototype, "self_vftable", void 0);
CustomCommand = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CustomCommand);
const customCommandDtor = makefunc_1.makefunc.np(function () {
    this[nativetype_1.NativeType.dtor]();
}, nativetype_1.void_t, { this: CustomCommand }, nativetype_1.int32_t);
function registerOverloadClass(name, commandClass, params) {
    const cls = commandClass;
    const size = cls[nativetype_1.NativeType.size];
    if (!size)
        throw Error(`${cls.name}: size is not defined`);
    const allocator = makefunc_1.makefunc.np((returnval) => {
        const ptr = capi_1.capi.malloc(size);
        const cmd = ptr.as(cls);
        cmd.construct();
        returnval.setPointer(cmd);
        return returnval;
    }, core_1.StaticPointer, null, core_1.StaticPointer);
    const sig = mcglobal_1.mcglobal.commandRegistry.findCommand(name);
    if (sig === null)
        throw Error(`${name}: command not found`);
    const overload = minecraft_1.CommandRegistry.Overload.construct();
    overload.commandVersion = bin_1.bin.make64(1, 0x7fffffff);
    overload.allocator = allocator;
    overload.parameters.setFromArray(params);
    overload.commandVersionOffset = -1;
    sig.overloads.push(overload);
    mcglobal_1.mcglobal.commandRegistry.registerOverloadInternal(sig, sig.overloads.back());
    overload.destruct();
}
class ParamsBuilder {
    constructor() {
        this.fields = Object.create(null);
        this.paramInfos = [];
    }
}
var command;
(function (command_2) {
    class Param {
        optional() {
            return new OptionalParam(this);
        }
    }
    command_2.Param = Param;
    class ParamBase extends Param {
        constructor(baseType) {
            super();
            this.baseType = baseType;
        }
        build(name, target) {
            if (name in target.fields)
                throw Error(`${name}: field name duplicated`);
            target.fields[name] = this.baseType;
            const out = { name };
            target.paramInfos.push(out);
            return out;
        }
    }
    class ParamDirect extends ParamBase {
        convert(out, native, info, origin) {
            const name = info.name;
            out[name] = native[name];
        }
    }
    class ParamConverter extends ParamBase {
        constructor(baseType, converter) {
            super(baseType);
            this.converter = converter;
        }
        convert(out, native, info, origin) {
            const name = info.name;
            out[name] = this.converter(native[name], origin);
        }
    }
    class ExtendedParam extends Param {
        constructor(base) {
            super();
            this.base = base;
        }
        optional() {
            return this;
        }
    }
    class OptionalParam extends ExtendedParam {
        build(name, target) {
            const info = this.base.build(name, target);
            const optkey = name + '__set';
            if (optkey in target.fields)
                throw Error(`${optkey}: field name duplicated`);
            target.fields[optkey] = nativetype_1.bool_t;
            info.optkey = optkey;
            return info;
        }
        convert(out, native, info, origin) {
            const optkey = info.optkey;
            if (optkey == null || native[optkey]) {
                this.base.convert(out, native, info, origin);
            }
        }
    }
    class Origin {
        constructor(origin) {
            this.origin = origin;
            this._pos = null;
            this._blockPos = null;
            this._entity = null;
        }
        /**
         * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
         */
        getRawOrigin() {
            return this.origin;
        }
        get isServerOrigin() {
            return this.origin.isServerCommandOrigin();
        }
        get isScriptOrigin() {
            return this.origin.isScriptCommandOrigin();
        }
        get entity() {
            if (this._entity !== null)
                return this._entity;
            const actor = this.origin.getEntity();
            if (actor === null)
                return null;
            return entity_1.Entity.fromRaw(actor);
        }
        get position() {
            if (this._pos !== null)
                return this._pos;
            return this._pos = this.origin.getWorldPosition();
        }
        get blockPosition() {
            if (this._blockPos !== null)
                return this._blockPos;
            return this._blockPos = this.origin.getBlockPosition();
        }
    }
    command_2.Origin = Origin;
    command_2.Boolean = new ParamDirect(nativetype_1.bool_t);
    command_2.Integer = new ParamDirect(nativetype_1.int32_t);
    command_2.String = new ParamDirect(nativetype_1.CxxString);
    command_2.RawText = new ParamConverter(minecraft_1.CommandRawText, value => value.getText());
    command_2.RelativeFloat = new ParamDirect(minecraft_1.RelativeFloat);
    command_2.EntityWildcard = new ParamConverter(minecraft_1.WildcardCommandSelector.make(minecraft_1.Actor), (selector, origin) => selector.newResults(origin));
    command_2.Json = new ParamDirect(jsonvalue_1.JsonValue);
    class Factory {
        constructor(name) {
            this.name = name;
        }
        overload(callback, parameters) {
            const builder = new ParamsBuilder;
            const paramInfos = builder.paramInfos;
            class CustomCommandImpl extends CustomCommand {
                [nativetype_1.NativeType.ctor]() {
                    this.self_vftable.execute = customCommandExecute;
                }
                execute(origin, output) {
                    try {
                        const out = {};
                        for (const info of paramInfos) {
                            info.type.convert(out, this, info, origin);
                        }
                        callback(out, origin, output);
                    }
                    catch (err) {
                        events_1.events.errorFire(err);
                    }
                }
            }
            parameters.__proto__ = null;
            for (const name in parameters) {
                const type = parameters[name];
                type.build(name, builder);
            }
            const params = [];
            CustomCommandImpl.define(builder.fields);
            for (const { name, optkey } of builder.paramInfos) {
                if (optkey != null)
                    params.push(CustomCommandImpl.optional(name, optkey));
                else
                    params.push(CustomCommandImpl.mandatory(name, null));
            }
            const customCommandExecute = makefunc_1.makefunc.np(function (origin, output) {
                this.execute(origin, output);
            }, nativetype_1.void_t, { this: CustomCommandImpl }, minecraft_1.CommandOrigin, minecraft_1.CommandOutput);
            registerOverloadClass(this.name, CustomCommandImpl, params);
            for (const param of params) {
                param.destruct();
            }
            return this;
        }
        alias(alias) {
            mcglobal_1.mcglobal.commandRegistry.registerAlias(this.name, alias);
            return this;
        }
    }
    command_2.Factory = Factory;
    function register(name, description, perm = minecraft_1.CommandPermissionLevel.Normal) {
        const registry = mcglobal_1.mcglobal.commandRegistry;
        const cmd = registry.findCommand(name);
        if (cmd !== null)
            throw Error(`${name}: command already registered`);
        registry.registerCommand(name, description, perm, minecraft_1.CommandFlag.create(command_1.CommandCheatFlag.NotCheat), minecraft_1.CommandFlag.create(command_1.CommandUsageFlag._Unknown));
        return new Factory(name);
    }
    command_2.register = register;
    /**
     * it does the same thing with bedrockServer.executeCommandOnConsole
     * but call the internal function directly
     */
    function execute(command, dimension = null) {
        const origin = createServerCommandOrigin('Server', mcglobal_1.mcglobal.level, // I'm not sure it's always ServerLevel
        4, dimension);
        const ctx = createCommandContext(command, origin);
        const res = mcglobal_1.mcglobal.commands.executeCommand(ctx, true);
        ctx.destruct();
        origin.destruct();
        return res;
    }
    command_2.execute = execute;
    /**
     * resend the command list packet to clients
     */
    function update() {
        const serialized = mcglobal_1.mcglobal.commandRegistry.serializeAvailableCommands();
        for (const player of mcglobal_1.mcglobal.level.players) {
            player.sendNetworkPacket(serialized);
        }
    }
    command_2.update = update;
})(command = exports.command || (exports.command = {}));
return exports;
},
// events\commandevent.ts
commandevent(){
if(__tsb.commandevent.exports!=null) return __tsb.commandevent.exports;
const exports=__tsb.commandevent.exports={};
exports.CommandEvent = void 0;
const _1 = __tsb.events();
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const util_1 = require("../util");
const command_1 = __tsb.command();
class CommandEvent {
    constructor(command, origin, context) {
        this.command = command;
        this.origin = origin;
        this.context = context;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawContext() {
        return this.context;
    }
}
exports.CommandEvent = CommandEvent;
_1.events.command.setInstaller(() => {
    const executeCommandOriginal = (0, hook_1.hook)(minecraft_1.MinecraftCommands, 'executeCommand').call(function (ctxptr, mute) {
        try {
            const ctx = ctxptr.p;
            const ev = new CommandEvent(ctx.command, new command_1.command.Origin(ctx.origin), ctx);
            const resv = _1.events.command.fire(ev);
            switch (typeof resv) {
                case 'number':
                    (0, util_1._tickCallback)();
                    return minecraft_1.MCRESULT.create(resv);
                default:
                    (0, util_1._tickCallback)();
                    ctx.command = ev.command;
                    return executeCommandOriginal.call(this, ctxptr, mute);
            }
        }
        catch (err) {
            _1.events.errorFire(err);
            return minecraft_1.MCRESULT.create(-1);
        }
    });
});
return exports;
},
// events\blockevent.ts
blockevent(){
if(__tsb.blockevent.exports!=null) return __tsb.blockevent.exports;
const exports=__tsb.blockevent.exports={};
exports.CampfireTryDouseFire = exports.CampfireTryLightFire = exports.FarmlandDecayEvent = exports.PistonMoveEvent = exports.BlockPlaceEvent = exports.BlockEvent = exports.BlockDestroyEvent = void 0;
const _1 = __tsb.events();
const common_1 = require("../common");
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const util_1 = require("../util");
const block_1 = __tsb.block();
const entity_1 = __tsb.entity();
const player_1 = __tsb.player();
const playerevent_1 = __tsb.playerevent();
class BlockDestroyEvent extends playerevent_1.PlayerEvent {
    constructor(player, blockPos) {
        super(player);
        this.blockPos = blockPos;
    }
}
exports.BlockDestroyEvent = BlockDestroyEvent;
class BlockEvent {
    constructor(blockPos, blockSource) {
        this.blockPos = blockPos;
        this.blockSource = blockSource;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawBlockSource() {
        return this.blockSource;
    }
}
exports.BlockEvent = BlockEvent;
class BlockPlaceEvent extends BlockEvent {
    constructor(player, blockPos, rawBlock, blockSource) {
        super(blockPos, blockSource);
        this.player = player;
        this.rawBlock = rawBlock;
    }
    get block() {
        const block = new block_1.Block(this.rawBlock);
        Object.defineProperty(this, 'block', { value: block });
        return block;
    }
}
exports.BlockPlaceEvent = BlockPlaceEvent;
_1.events.blockDestroy.setInstaller(() => {
    function onBlockDestroy(blockPos, facing) {
        const user = player_1.Player.fromRaw(this.actor);
        if (user === null) {
            return _onBlockDestroy.call(this, blockPos, facing);
        }
        const event = new BlockDestroyEvent(user, blockPos);
        if (_1.events.blockDestroy.fire(event) === common_1.CANCEL) {
            (0, util_1._tickCallback)();
            return false;
        }
        this.actor = event.player.getRawEntity();
        (0, util_1._tickCallback)();
        return _onBlockDestroy.call(this, event.blockPos, facing);
    }
    function onBlockDestroyCreative(blockPos, facing) {
        const user = player_1.Player.fromRaw(this.actor);
        if (user === null) {
            return _onBlockDestroyCreative.call(this, blockPos, facing);
        }
        const event = new BlockDestroyEvent(user, blockPos);
        if (_1.events.blockDestroy.fire(event) === common_1.CANCEL) {
            (0, util_1._tickCallback)();
            return false;
        }
        this.actor = event.player.getRawEntity();
        (0, util_1._tickCallback)();
        return _onBlockDestroyCreative.call(this, event.blockPos, facing);
    }
    const _onBlockDestroy = (0, hook_1.hook)(minecraft_1.SurvivalMode, 'destroyBlock').call(onBlockDestroy);
    const _onBlockDestroyCreative = (0, hook_1.hook)(minecraft_1.GameMode, '_creativeDestroyBlock').call(onBlockDestroyCreative);
});
_1.events.blockPlace.setInstaller(() => {
    function onBlockPlace(block, blockPos, facing, actor, ignoreEntities) {
        const user = player_1.Player.fromRaw(actor);
        if (user === null) {
            return _onBlockPlace.call(this, block, blockPos, facing, actor, ignoreEntities);
        }
        const event = new BlockPlaceEvent(user, blockPos, block, this);
        if (_1.events.blockPlace.fire(event) === common_1.CANCEL) {
            (0, util_1._tickCallback)();
            return false;
        }
        (0, util_1._tickCallback)();
        return _onBlockPlace.call(this, event.block, event.blockPos, facing, event.player.getRawEntity(), ignoreEntities);
    }
    const _onBlockPlace = (0, hook_1.hook)(minecraft_1.BlockSource, 'mayPlace').call(onBlockPlace);
});
class PistonMoveEvent extends BlockEvent {
    constructor(blockPos, action, blockSource) {
        super(blockPos, blockSource);
        this.action = action;
    }
}
exports.PistonMoveEvent = PistonMoveEvent;
_1.events.pistonMove.setInstaller(() => {
    function onPistonMove(blockSource) {
        const event = new PistonMoveEvent(minecraft_1.BlockPos.create(this.getInt32(0x2C), this.getUint32(0x30), this.getInt32(0x34)), this.getInt8(0xE0), blockSource);
        _1.events.pistonMove.fire(event);
        (0, util_1._tickCallback)();
        return _onPistonMove.call(this, event.getRawBlockSource());
    }
    const _onPistonMove = (0, hook_1.hook)(minecraft_1.PistonBlockActor, '_spawnMovingBlocks').call(onPistonMove);
});
class FarmlandDecayEvent extends BlockEvent {
    constructor(blockPos, culprit, rawBlock, blockSource) {
        super(blockPos, blockSource);
        this.culprit = culprit;
        this.rawBlock = rawBlock;
    }
    get block() {
        const block = new block_1.Block(this.rawBlock);
        Object.defineProperty(this, 'block', { value: block });
        return block;
    }
}
exports.FarmlandDecayEvent = FarmlandDecayEvent;
_1.events.farmlandDecay.setInstaller(() => {
    function onFarmlandDecay(blockSource, blockPos, culprit, fallDistance) {
        const entity = entity_1.Entity.fromRaw(culprit);
        if (entity == null) {
            return _onFarmlandDecay.call(this, blockSource, blockPos, culprit, fallDistance);
        }
        const event = new FarmlandDecayEvent(blockPos, entity, this, blockSource);
        const canceled = _1.events.farmlandDecay.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (!canceled) {
            return _onFarmlandDecay.call(this, blockSource, event.blockPos, event.culprit, fallDistance);
        }
    }
    const _onFarmlandDecay = (0, hook_1.hook)(minecraft_1.FarmBlock, 'transformOnFall').call(onFarmlandDecay);
});
class CampfireTryLightFire extends BlockEvent {
}
exports.CampfireTryLightFire = CampfireTryLightFire;
_1.events.campfireLight.setInstaller(() => {
    function onCampfireTryLightFire(blockSource, blockPos) {
        const event = new CampfireTryLightFire(blockPos, blockSource);
        const canceled = _1.events.campfireLight.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled)
            return false;
        else
            return _CampfireTryLightFire(blockSource, event.blockPos);
    }
    const _CampfireTryLightFire = (0, hook_1.hook)(minecraft_1.CampfireBlock.tryLightFire).call(onCampfireTryLightFire);
});
class CampfireTryDouseFire extends BlockEvent {
}
exports.CampfireTryDouseFire = CampfireTryDouseFire;
_1.events.campfireDouse.setInstaller(() => {
    function onCampfireTryDouseFire(blockSource, blockPos, b) {
        const event = new CampfireTryDouseFire(blockPos, blockSource);
        const canceled = _1.events.campfireDouse.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled)
            return false;
        else
            return _CampfireTryDouseFire(event.getRawBlockSource(), event.blockPos, b);
    }
    const _CampfireTryDouseFire = (0, hook_1.hook)(minecraft_1.CampfireBlock.tryDouseFire).call(onCampfireTryDouseFire);
});
return exports;
},
// events\entityevent.ts
entityevent(){
if(__tsb.entityevent.exports!=null) return __tsb.entityevent.exports;
const exports=__tsb.entityevent.exports={};
exports.SplashPotionHitEvent = exports.EntitySneakEvent = exports.EntityStopRidingEvent = exports.EntityStartRidingEvent = exports.EntityDieEvent = exports.EntityHeathChangeEvent = exports.EntityHurtEvent = exports.EntityEvent = void 0;
const _1 = __tsb.events();
const common_1 = require("../common");
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const util_1 = require("../util");
const entity_1 = __tsb.entity();
class EntityEvent {
    constructor(_actor) {
        this._actor = _actor;
        this._entity = null;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawEntity() {
        return this._entity !== null ? this._entity.getRawEntity() : this._actor;
    }
    static defineEntityGetter(target, entityKey, internalEntityKey, internalActorKey) {
        Object.defineProperty(target, entityKey, {
            get() {
                let entity = this[internalEntityKey];
                if (entity !== null)
                    return entity;
                entity = entity_1.Entity.fromRaw(this[internalActorKey]);
                if (entity === null)
                    throw Error(`failed to get the Entity of ${this[internalActorKey]}`);
                return this[internalEntityKey] = entity;
            },
            set(entity) {
                if (entity.getRawEntity() === null)
                    throw Error(`${entity.name} does not have the entity`);
                this[internalEntityKey] = entity;
            }
        });
    }
}
exports.EntityEvent = EntityEvent;
EntityEvent.defineEntityGetter(EntityEvent.prototype, 'entity', '_entity', '_actor');
class EntityHurtEvent extends EntityEvent {
    constructor(actor, damage, knock, ignite, damageSource) {
        super(actor);
        this.damage = damage;
        this.knock = knock;
        this.ignite = ignite;
        this.damageSource = damageSource;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawActorDamageSource() {
        return this.damageSource;
    }
}
exports.EntityHurtEvent = EntityHurtEvent;
class EntityHeathChangeEvent extends EntityEvent {
    constructor(actor, oldHealth, newHealth) {
        super(actor);
        this.oldHealth = oldHealth;
        this.newHealth = newHealth;
    }
}
exports.EntityHeathChangeEvent = EntityHeathChangeEvent;
class EntityDieEvent extends EntityEvent {
    constructor(actor, damageSource) {
        super(actor);
        this.damageSource = damageSource;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawActorDamageSource() {
        return this.damageSource;
    }
}
exports.EntityDieEvent = EntityDieEvent;
class EntityStartRidingEvent extends EntityEvent {
    constructor(actor, _rideActor) {
        super(actor);
        this._rideActor = _rideActor;
        this._rideEntity = null;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawRideEntity() {
        return this._rideEntity !== null ? this._rideEntity.getRawEntity() : this._rideActor;
    }
}
exports.EntityStartRidingEvent = EntityStartRidingEvent;
EntityStartRidingEvent.defineEntityGetter(EntityStartRidingEvent.prototype, 'ride', '_rideEntity', '_rideActor');
class EntityStopRidingEvent extends EntityEvent {
    constructor(actor, exitFromRider, actorIsBeingDestroyed, switchingRides) {
        super(actor);
        this.exitFromRider = exitFromRider;
        this.actorIsBeingDestroyed = actorIsBeingDestroyed;
        this.switchingRides = switchingRides;
    }
}
exports.EntityStopRidingEvent = EntityStopRidingEvent;
class EntitySneakEvent extends EntityEvent {
    constructor(actor, isSneaking) {
        super(actor);
        this.isSneaking = isSneaking;
    }
}
exports.EntitySneakEvent = EntitySneakEvent;
class SplashPotionHitEvent extends EntityEvent {
    constructor(entity, potionEffect) {
        super(entity);
        this.potionEffect = potionEffect;
    }
}
exports.SplashPotionHitEvent = SplashPotionHitEvent;
_1.events.entityHurt.setInstaller(() => {
    function onEntityHurt(actorDamageSource, damage, knock, ignite) {
        const event = new EntityHurtEvent(this, damage, knock, ignite, actorDamageSource);
        const canceled = _1.events.entityHurt.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            return false;
        }
        return _onEntityHurt.call(event.getRawEntity(), event.getRawActorDamageSource(), event.damage, knock, ignite);
    }
    const _onEntityHurt = (0, hook_1.hook)(minecraft_1.Actor, 'hurt').call(onEntityHurt);
});
_1.events.entityHealthChange.setInstaller(() => {
    function onEntityHealthChange(oldHealth, newHealth, attributeBuffInfo) {
        const event = new EntityHeathChangeEvent(this.actor, oldHealth, newHealth);
        _1.events.entityHealthChange.fire(event);
        this.actor = event.getRawEntity();
        (0, util_1._tickCallback)();
        return _onEntityHealthChange.call(this, oldHealth, newHealth, attributeBuffInfo);
    }
    const _onEntityHealthChange = (0, hook_1.hook)(minecraft_1.HealthAttributeDelegate, 'change').call(onEntityHealthChange);
});
_1.events.entityDie.setInstaller(() => {
    function onEntityDie(damageSource) {
        const event = new EntityDieEvent(this, damageSource);
        _1.events.entityDie.fire(event);
        (0, util_1._tickCallback)();
        return _onEntityDie.call(event.getRawEntity(), event.getRawActorDamageSource());
    }
    const _onEntityDie = (0, hook_1.hook)(minecraft_1.Mob, 'die').call(onEntityDie);
});
_1.events.entityStartRiding.setInstaller(() => {
    function onEntityStartRiding(ride) {
        const event = new EntityStartRidingEvent(this, ride);
        const canceled = _1.events.entityStartRiding.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            return false;
        }
        return _onEntityStartRiding.call(event.entity, event.ride);
    }
    const _onEntityStartRiding = (0, hook_1.hook)(minecraft_1.Actor, 'startRiding').call(onEntityStartRiding);
});
_1.events.entityStopRiding.setInstaller(() => {
    function onEntityStopRiding(exitFromRider, actorIsBeingDestroyed, switchingRides) {
        const event = new EntityStopRidingEvent(this, exitFromRider, actorIsBeingDestroyed, switchingRides);
        const notCanceled = _1.events.entityStopRiding.fire(event) !== common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (notCanceled) {
            return _onEntityStopRiding.call(event.entity, event.exitFromRider, event.actorIsBeingDestroyed, event.switchingRides);
        }
    }
    const _onEntityStopRiding = (0, hook_1.hook)(minecraft_1.Actor, 'stopRiding').call(onEntityStopRiding);
});
_1.events.entitySneak.setInstaller(() => {
    function onEntitySneak(entity, isSneaking) {
        const event = new EntitySneakEvent(entity, isSneaking);
        _1.events.entitySneak.fire(event);
        (0, util_1._tickCallback)();
        return _onEntitySneak.call(this, event.entity, event.isSneaking);
    }
    const _onEntitySneak = (0, hook_1.hook)(minecraft_1.ScriptServerActorEventListener, 'onActorSneakChanged').call(onEntitySneak);
});
_1.events.splashPotionHit.setInstaller(() => {
    function onSplashPotionHit(entity, projectileComponent) {
        const event = new SplashPotionHitEvent(entity, this.potionEffect);
        const canceled = _1.events.splashPotionHit.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (!canceled) {
            this.potionEffect = event.potionEffect;
            return _onSplashPotionHit.call(this, event.entity, projectileComponent);
        }
    }
    const _onSplashPotionHit = (0, hook_1.hook)(minecraft_1.SplashPotionEffectSubcomponent, 'doOnHitEffect').call(onSplashPotionHit);
});
return exports;
},
// events\playerevent.ts
playerevent(){
if(__tsb.playerevent.exports!=null) return __tsb.playerevent.exports;
const exports=__tsb.playerevent.exports={};
exports.PlayerChatEvent = exports.PlayerStartSwimmingEvent = exports.PlayerJumpEvent = exports.PlayerUseItemEvent = exports.PlayerCritEvent = exports.PlayerPickupItemEvent = exports.PlayerJoinEvent = exports.PlayerLevelUpEvent = exports.PlayerRespawnEvent = exports.PlayerInventoryChangeEvent = exports.PlayerDropItemEvent = exports.PlayerAttackEvent = exports.PlayerDisconnectEvent = exports.PlayerLoginEvent = exports.PlayerEvent = void 0;
const _1 = __tsb.events();
const common_1 = require("../common");
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const util_1 = require("../util");
const item_1 = __tsb.item();
const itementity_1 = __tsb.itementity();
const player_1 = __tsb.player();
const entityevent_1 = __tsb.entityevent();
class PlayerEvent {
    constructor(player) {
        this.player = player;
    }
}
exports.PlayerEvent = PlayerEvent;
class PlayerLoginEvent extends PlayerEvent {
    constructor(player, packet) {
        super(player);
        this.packet = packet;
    }
    get os() {
        return this.packet.connreq.getDeviceOS();
    }
    get deviceId() {
        return this.packet.connreq.getDeviceId();
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawPacket() {
        return this.packet;
    }
}
exports.PlayerLoginEvent = PlayerLoginEvent;
class PlayerDisconnectEvent extends PlayerEvent {
}
exports.PlayerDisconnectEvent = PlayerDisconnectEvent;
class PlayerAttackEvent extends PlayerEvent {
    constructor(player, _victimActor) {
        super(player);
        this._victimActor = _victimActor;
        this._victimEntity = null;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawVictimEntity() {
        return this._victimEntity !== null ? this._victimEntity.getRawEntity() : this._victimActor;
    }
}
exports.PlayerAttackEvent = PlayerAttackEvent;
entityevent_1.EntityEvent.defineEntityGetter(PlayerAttackEvent.prototype, 'victim', '_victimEntity', '_victimActor');
class PlayerDropItemEvent extends PlayerEvent {
    constructor(player, item) {
        super(player);
        this.item = item;
    }
}
exports.PlayerDropItemEvent = PlayerDropItemEvent;
class PlayerInventoryChangeEvent extends PlayerEvent {
    constructor(player, oldItem, newItem, slot) {
        super(player);
        this.oldItem = oldItem;
        this.newItem = newItem;
        this.slot = slot;
    }
}
exports.PlayerInventoryChangeEvent = PlayerInventoryChangeEvent;
class PlayerRespawnEvent extends PlayerEvent {
}
exports.PlayerRespawnEvent = PlayerRespawnEvent;
class PlayerLevelUpEvent extends PlayerEvent {
    constructor(player, 
    /** Amount of levels upgraded */
    levels) {
        super(player);
        this.levels = levels;
    }
}
exports.PlayerLevelUpEvent = PlayerLevelUpEvent;
class PlayerJoinEvent extends PlayerEvent {
    constructor(player) {
        super(player);
    }
}
exports.PlayerJoinEvent = PlayerJoinEvent;
class PlayerPickupItemEvent extends PlayerEvent {
    constructor(player, itemActor) {
        super(player);
        this.itemActor = itemActor;
    }
}
exports.PlayerPickupItemEvent = PlayerPickupItemEvent;
class PlayerCritEvent extends PlayerEvent {
}
exports.PlayerCritEvent = PlayerCritEvent;
class PlayerUseItemEvent extends PlayerEvent {
    constructor(player, useMethod, consumeItem, item) {
        super(player);
        this.useMethod = useMethod;
        this.consumeItem = consumeItem;
        this.item = item;
    }
}
exports.PlayerUseItemEvent = PlayerUseItemEvent;
(function (PlayerUseItemEvent) {
    PlayerUseItemEvent.Actions = minecraft_1.CompletedUsingItemPacket.Actions;
})(PlayerUseItemEvent = exports.PlayerUseItemEvent || (exports.PlayerUseItemEvent = {}));
class PlayerJumpEvent extends PlayerEvent {
}
exports.PlayerJumpEvent = PlayerJumpEvent;
class PlayerStartSwimmingEvent extends PlayerEvent {
}
exports.PlayerStartSwimmingEvent = PlayerStartSwimmingEvent;
class PlayerChatEvent extends PlayerEvent {
    constructor(player, message) {
        super(player);
        this.message = message;
    }
}
exports.PlayerChatEvent = PlayerChatEvent;
_1.events.playerUseItem.setInstaller(() => {
    function onPlayerUseItem(itemStack, useMethod, consumeItem) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerUseItem.call(this, itemStack, useMethod, consumeItem);
        }
        const item = new item_1.Item(itemStack, null);
        const event = new PlayerUseItemEvent(player, useMethod, consumeItem, item);
        _1.events.playerUseItem.fire(event);
        (0, util_1._tickCallback)();
        return _onPlayerUseItem.call(event.player.getRawEntity(), event.item.getRawItemStack(), event.useMethod, event.consumeItem);
    }
    const _onPlayerUseItem = (0, hook_1.hook)(minecraft_1.Player, 'useItem').call(onPlayerUseItem);
});
_1.events.playerCrit.setInstaller(() => {
    function onPlayerCrit(actor) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerCrit.call(this, actor);
        }
        const event = new PlayerCritEvent(player);
        _1.events.playerCrit.fire(event);
        (0, util_1._tickCallback)();
        return _onPlayerCrit.call(event.player.getRawEntity(), actor);
    }
    const _onPlayerCrit = (0, hook_1.hook)(minecraft_1.Player, '_crit').call(onPlayerCrit);
});
_1.events.playerStartSwimming.setInstaller(() => {
    function onPlayerStartSwimming() {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerStartSwimming.call(this);
        }
        const event = new PlayerStartSwimmingEvent(player);
        const canceled = _1.events.playerStartSwimming.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (!canceled) {
            return _onPlayerStartSwimming.call(event.player.getRawEntity());
        }
    }
    const _onPlayerStartSwimming = (0, hook_1.hook)(minecraft_1.Player, 'startSwimming').call(onPlayerStartSwimming);
});
_1.events.playerAttack.setInstaller(() => {
    function onPlayerAttack(victim) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerAttack.call(player, victim);
        }
        const event = new PlayerAttackEvent(player, victim);
        const canceled = _1.events.playerAttack.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            return false;
        }
        return _onPlayerAttack.call(event.player, event.victim);
    }
    const _onPlayerAttack = (0, hook_1.hook)(minecraft_1.Player, 'attack').call(onPlayerAttack);
});
_1.events.playerDropItem.setInstaller(() => {
    function onPlayerDropItem(itemStack, randomly) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerDropItem.call(this, itemStack, randomly);
        }
        const event = new PlayerDropItemEvent(player, new item_1.Item(itemStack, null));
        const canceled = _1.events.playerDropItem.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            return false;
        }
        return _onPlayerDropItem.call(event.player.getRawEntity(), event.item.getRawItemStack(), randomly);
    }
    const _onPlayerDropItem = (0, hook_1.hook)(minecraft_1.Player, 'drop').call(onPlayerDropItem);
});
_1.events.playerInventoryChange.setInstaller(() => {
    function onPlayerInventoryChange(container, slot, oldItemStack, newItemStack, unknown) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerInventoryChange.call(player, container, slot, oldItemStack, newItemStack, unknown);
        }
        const event = new PlayerInventoryChangeEvent(player, new item_1.Item(oldItemStack, null), new item_1.Item(newItemStack, null), slot);
        _1.events.playerInventoryChange.fire(event);
        (0, util_1._tickCallback)();
        return _onPlayerInventoryChange.call(event.player.getRawEntity(), container, slot, event.oldItem.getRawItemStack(), event.newItem.getRawItemStack(), unknown);
    }
    const _onPlayerInventoryChange = (0, hook_1.hook)(minecraft_1.Player, 'inventoryChanged').call(onPlayerInventoryChange);
});
_1.events.playerRespawn.setInstaller(() => {
    function onPlayerRespawn() {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerRespawn.call(player);
        }
        const event = new PlayerRespawnEvent(player);
        _1.events.playerRespawn.fire(event);
        (0, util_1._tickCallback)();
        return _onPlayerRespawn.call(event.player.getRawEntity());
    }
    const _onPlayerRespawn = (0, hook_1.hook)(minecraft_1.Player, 'respawn').call(onPlayerRespawn);
});
_1.events.playerLevelUp.setInstaller(() => {
    function onPlayerLevelUp(levels) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerLevelUp.call(this, levels);
        }
        const event = new PlayerLevelUpEvent(player, levels);
        const canceled = _1.events.playerLevelUp.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled)
            return;
        return _onPlayerLevelUp.call(event.player.getRawEntity(), event.levels);
    }
    const _onPlayerLevelUp = (0, hook_1.hook)(minecraft_1.Player, "addLevels").call(onPlayerLevelUp);
});
_1.events.playerJoin.setInstaller(() => {
    _1.events.packetAfter(minecraft_1.MinecraftPacketIds.SetLocalPlayerAsInitialized).on((pk, ni) => {
        const player = player_1.Player.fromNetworkIdentifier(ni);
        if (player === null)
            return;
        const event = new PlayerJoinEvent(player);
        _1.events.playerJoin.fire(event);
    });
});
_1.events.playerPickupItem.setInstaller(() => {
    function onPlayerPickupItem(itemActor, orgCount, favoredSlot) {
        const player = player_1.Player.fromRaw(this);
        if (player === null) {
            return _onPlayerPickupItem.call(player, itemActor, orgCount, favoredSlot);
        }
        const event = new PlayerPickupItemEvent(player, itementity_1.ItemEntity.fromRaw(itemActor));
        const canceled = _1.events.playerPickupItem.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            return false;
        }
        return _onPlayerPickupItem.call(event.player.getRawEntity(), itemActor, orgCount, favoredSlot);
    }
    const _onPlayerPickupItem = (0, hook_1.hook)(minecraft_1.Player, "take").call(onPlayerPickupItem);
});
_1.events.packetAfter(minecraft_1.MinecraftPacketIds.Login).on((ptr, ni) => {
    const connreq = ptr.connreq;
    if (connreq === null)
        return; // wrong client
    const cert = connreq.getCertificate();
    const xuid = minecraft_1.ExtendedCertificate.getXuid(cert);
    const username = minecraft_1.ExtendedCertificate.getIdentityName(cert);
    const player = new player_1.Player(ni, username, xuid);
    const ev = new PlayerLoginEvent(player, ptr);
    _1.events.playerLogin.fire(ev);
});
_1.events.packetBefore(minecraft_1.MinecraftPacketIds.Text).on((ptr, ni) => {
    const player = player_1.Player.fromNetworkIdentifier(ni);
    if (player === null)
        return;
    const ev = new PlayerChatEvent(player, ptr.message);
    if (_1.events.playerChat.fire(ev) === common_1.CANCEL) {
        return common_1.CANCEL;
    }
    ptr.message = ev.message;
});
return exports;
},
// inventory.ts
inventory(){
if(__tsb.inventory.exports!=null) return __tsb.inventory.exports;
const exports=__tsb.inventory.exports={};
exports.Inventory = void 0;
class Inventory {
    constructor(inventory) {
        this.inventory = inventory;
        this._slotsArray = null;
    }
    _slots() {
        // assume that it's same until the end of the JS processing.
        if (this._slotsArray !== null)
            return this._slotsArray;
        this._slotsArray = this.inventory.getSlots(); // it will process through the entire inventory, reduce to call it for optimizing.
        process.nextTick(() => {
            this._slotsArray = null;
        });
        return this._slotsArray;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawContainer() {
        return this.inventory;
    }
    get size() {
        return this._slots().length;
    }
    get(i) {
        return this._slots()[i];
    }
}
exports.Inventory = Inventory;
return exports;
},
// system.ts
system(){
if(__tsb.system.exports!=null) return __tsb.system.exports;
const exports=__tsb.system.exports={};
exports.system = void 0;
const index_1 = __tsb.events();
index_1.events.serverOpen.on(() => {
    exports.system = server.registerSystem(0, 0);
});
return exports;
},
// events\miscevent.ts
miscevent(){
if(__tsb.miscevent.exports!=null) return __tsb.miscevent.exports;
const exports=__tsb.miscevent.exports={};
exports.ObjectiveCreateEvent = exports.ScoreRemoveEvent = exports.ScoreAddEvent = exports.ScoreSetEvent = exports.ScoreResetEvent = exports.QueryRegenerateEvent = void 0;
const common_1 = require("../common");
const core_1 = require("../core");
const _1 = __tsb.events();
const hook_1 = require("../hook");
const launcher_1 = require("../launcher");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const pointer_1 = require("../pointer");
const util_1 = require("../util");
const mcglobal_1 = require("../mcglobal");
class QueryRegenerateEvent {
    constructor(motd, levelname, currentPlayers, maxPlayers, isJoinableThroughServerScreen) {
        this.motd = motd;
        this.levelname = levelname;
        this.currentPlayers = currentPlayers;
        this.maxPlayers = maxPlayers;
        this.isJoinableThroughServerScreen = isJoinableThroughServerScreen;
    }
}
exports.QueryRegenerateEvent = QueryRegenerateEvent;
_1.events.queryRegenerate.setInstaller(() => {
    function onQueryRegenerate(motd, levelname, gameType, currentPlayers, maxPlayers, isJoinableThroughServerScreen) {
        const event = new QueryRegenerateEvent(motd, levelname, currentPlayers, maxPlayers, isJoinableThroughServerScreen);
        _1.events.queryRegenerate.fire(event);
        (0, util_1._tickCallback)();
        return _onQueryRegenerate.call(this, event.motd, event.levelname, gameType, event.currentPlayers, event.maxPlayers, event.isJoinableThroughServerScreen);
    }
    const _onQueryRegenerate = (0, hook_1.hook)(minecraft_1.RakNetServerLocator, 'announceServer').call(onQueryRegenerate);
    launcher_1.bedrockServer.afterOpen().then(() => mcglobal_1.mcglobal.serverInstance.minecraft.getServerNetworkHandler().updateServerAnnouncement());
});
class ScoreResetEvent {
    constructor(identityRef, objective) {
        this.identityRef = identityRef;
        this.objective = objective;
    }
}
exports.ScoreResetEvent = ScoreResetEvent;
_1.events.queryRegenerate.setInstaller(() => {
    function onScoreReset(scoreboard, objective) {
        const event = new ScoreResetEvent(this, objective);
        const canceled = _1.events.scoreReset.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            scoreboard.sync(this.scoreboardId, objective);
            return false;
        }
        return _onScoreReset.call(event.identityRef, scoreboard, event.objective);
    }
    const _onScoreReset = (0, hook_1.hook)(minecraft_1.ScoreboardIdentityRef, 'removeFromObjective').call(onScoreReset);
});
class ScoreSetEvent {
    constructor(identityRef, objective, 
    /** The score to be set */
    score) {
        this.identityRef = identityRef;
        this.objective = objective;
        this.score = score;
    }
}
exports.ScoreSetEvent = ScoreSetEvent;
class ScoreAddEvent extends ScoreSetEvent {
    constructor(identityRef, objective, 
    /** The score to be added */
    score) {
        super(identityRef, objective, score);
        this.identityRef = identityRef;
        this.objective = objective;
        this.score = score;
    }
}
exports.ScoreAddEvent = ScoreAddEvent;
class ScoreRemoveEvent extends ScoreSetEvent {
    constructor(identityRef, objective, 
    /** The score to be removed */
    score) {
        super(identityRef, objective, score);
        this.identityRef = identityRef;
        this.objective = objective;
        this.score = score;
    }
}
exports.ScoreRemoveEvent = ScoreRemoveEvent;
const Int32Wrapper = pointer_1.Wrapper.make(nativetype_1.int32_t);
let scoreModifyHooked = false;
function hookScoreModify() {
    if (scoreModifyHooked)
        return;
    scoreModifyHooked = true;
    function onScoreModify(result, objective, score, mode) {
        let event;
        let canceled;
        switch (mode) {
            case minecraft_1.PlayerScoreSetFunction.Set:
                event = new ScoreSetEvent(this, objective, score);
                canceled = _1.events.scoreSet.fire(event) === common_1.CANCEL;
                break;
            case minecraft_1.PlayerScoreSetFunction.Add:
                event = new ScoreAddEvent(this, objective, score);
                canceled = _1.events.scoreAdd.fire(event) === common_1.CANCEL;
                break;
            case minecraft_1.PlayerScoreSetFunction.Subtract:
                event = new ScoreRemoveEvent(this, objective, score);
                canceled = _1.events.scoreRemove.fire(event) === common_1.CANCEL;
                break;
            default:
                (0, common_1.unreachable)();
        }
        (0, util_1._tickCallback)();
        if (canceled) {
            return false;
        }
        return _onScoreModify.call(event.identityRef, result, event.objective, event.score, mode);
    }
    const _onScoreModify = (0, hook_1.hook)(minecraft_1.ScoreboardIdentityRef, 'modifyScoreInObjective').call(onScoreModify);
}
_1.events.scoreSet.setInstaller(hookScoreModify);
_1.events.scoreAdd.setInstaller(hookScoreModify);
_1.events.scoreRemove.setInstaller(hookScoreModify);
class ObjectiveCreateEvent {
    constructor(name, displayName, criteria) {
        this.name = name;
        this.displayName = displayName;
        this.criteria = criteria;
    }
}
exports.ObjectiveCreateEvent = ObjectiveCreateEvent;
_1.events.objectiveCreate.setInstaller(() => {
    function onObjectiveCreate(name, displayName, criteria) {
        const event = new ObjectiveCreateEvent(name, displayName, criteria);
        const canceled = _1.events.objectiveCreate.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (canceled) {
            return core_1.VoidPointer;
        }
        return _onObjectiveCreate.call(this, event.name, event.displayName, event.criteria);
    }
    const _onObjectiveCreate = (0, hook_1.hook)(minecraft_1.Scoreboard, "addObjective").call(onObjectiveCreate);
});
return exports;
},
// events\levelevent.ts
levelevent(){
if(__tsb.levelevent.exports!=null) return __tsb.levelevent.exports;
const exports=__tsb.levelevent.exports={};
exports.LevelWeatherChangeEvent = exports.LevelTickEvent = exports.LevelSaveEvent = exports.LevelExplodeEvent = void 0;
const _1 = __tsb.events();
const common_1 = require("../common");
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const util_1 = require("../util");
const entityevent_1 = __tsb.entityevent();
class LevelExplodeEvent extends entityevent_1.EntityEvent {
    constructor(actor, position, 
    /** The radius of the explosion in blocks and the amount of damage the explosion deals. */
    power, 
    /** If true, blocks in the explosion radius will be set on fire. */
    causesFire, 
    /** If true, the explosion will destroy blocks in the explosion radius. */
    breaksBlocks, 
    /** A blocks explosion resistance will be capped at this value when an explosion occurs. */
    maxResistance, allowUnderwater, level, blockSource) {
        super(actor);
        this.position = position;
        this.power = power;
        this.causesFire = causesFire;
        this.breaksBlocks = breaksBlocks;
        this.maxResistance = maxResistance;
        this.allowUnderwater = allowUnderwater;
        this.level = level;
        this.blockSource = blockSource;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawLevel() {
        return this.level;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawBlockSource() {
        return this.blockSource;
    }
}
exports.LevelExplodeEvent = LevelExplodeEvent;
class LevelSaveEvent {
    constructor(level) {
        this.level = level;
    }
}
exports.LevelSaveEvent = LevelSaveEvent;
class LevelTickEvent {
    constructor(level) {
        this.level = level;
    }
}
exports.LevelTickEvent = LevelTickEvent;
class LevelWeatherChangeEvent {
    constructor(rainLevel, rainTime, lightningLevel, lightningTime, level) {
        this.rainLevel = rainLevel;
        this.rainTime = rainTime;
        this.lightningLevel = lightningLevel;
        this.lightningTime = lightningTime;
        this.level = level;
    }
}
exports.LevelWeatherChangeEvent = LevelWeatherChangeEvent;
_1.events.levelExplode.setInstaller(() => {
    function onLevelExplode(blockSource, entity, position, power, causesFire, breaksBlocks, maxResistance, allowUnderwater) {
        const event = new LevelExplodeEvent(entity, position, power, causesFire, breaksBlocks, maxResistance, allowUnderwater, this, blockSource);
        const canceled = _1.events.levelExplode.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (!canceled) {
            return _onLevelExplode.call(event.entity, event.position, event.power, event.causesFire, event.breaksBlocks, event.maxResistance, event.allowUnderwater, this, blockSource);
        }
    }
    const _onLevelExplode = (0, hook_1.hook)(minecraft_1.Level, 'explode', minecraft_1.BlockSource, minecraft_1.Actor, minecraft_1.Vec3, nativetype_1.float32_t, nativetype_1.bool_t, nativetype_1.bool_t, nativetype_1.float32_t, nativetype_1.bool_t).call(onLevelExplode);
});
_1.events.levelSave.setInstaller(() => {
    function onLevelSave() {
        const event = new LevelSaveEvent(this);
        const canceled = _1.events.levelSave.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (!canceled) {
            return _onLevelSave.call(this);
        }
    }
    const _onLevelSave = (0, hook_1.hook)(minecraft_1.Level, 'save').call(onLevelSave);
});
_1.events.levelTick.setInstaller(() => {
    function onLevelTick() {
        const event = new LevelTickEvent(this);
        _1.events.levelTick.fire(event);
        _onLevelTick.call(this);
    }
    const _onLevelTick = (0, hook_1.hook)(minecraft_1.Level, 'tick').call(onLevelTick);
});
_1.events.levelWeatherChange.setInstaller(() => {
    function onLevelWeatherChange(rainLevel, rainTime, lightningLevel, lightningTime) {
        const event = new LevelWeatherChangeEvent(rainLevel, rainTime, lightningLevel, lightningTime, this);
        const canceled = _1.events.levelWeatherChange.fire(event) === common_1.CANCEL;
        (0, util_1._tickCallback)();
        if (!canceled) {
            return _onLevelWeatherChange.call(event.rainLevel, event.rainTime, event.lightningLevel, event.lightningTime, this);
        }
    }
    const _onLevelWeatherChange = (0, hook_1.hook)(minecraft_1.Level, 'updateWeather').call(onLevelWeatherChange);
});
return exports;
},
// block.ts
block(){
if(__tsb.block.exports!=null) return __tsb.block.exports;
const exports=__tsb.block.exports={};
exports.Block = void 0;
class Block {
    constructor(block) {
        this.block = block;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawBlock() {
        return this.block;
    }
}
exports.Block = Block;
return exports;
},
// item.ts
item(){
if(__tsb.item.exports!=null) return __tsb.item.exports;
const exports=__tsb.item.exports={};
exports.Item = void 0;
const minecraft_1 = require("../minecraft");
class Item {
    constructor(itemStack, item) {
        this.itemStack = itemStack;
        this.item = item;
        if (itemStack === null && item === null)
            throw Error(`both cannot be null`);
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawItemStack() {
        if (this.itemStack !== null)
            return this.itemStack;
        const itemStack = new minecraft_1.ItemStack(true);
        itemStack.constructWith(this.item);
        this.itemStack = itemStack;
        setImmediate(() => {
            itemStack.destruct();
            this.itemStack = null;
        });
        return itemStack;
    }
    /**
     * @deprecated compatibility warning. it returns the native class of Bedrock Dedicated Server. it can be modified by updates.
     */
    getRawItem() {
        if (this.item !== null)
            return this.item;
        return this.item = this.itemStack.getItem();
    }
}
exports.Item = Item;
return exports;
},
// itementity.ts
itementity(){
if(__tsb.itementity.exports!=null) return __tsb.itementity.exports;
const exports=__tsb.itementity.exports={};
exports.ItemEntity = void 0;
const minecraft_1 = require("../minecraft");
const entity_1 = __tsb.entity();
class ItemEntity extends entity_1.Entity {
    static fromRaw(actor) {
        const entity = super.fromRaw(actor);
        if (entity == null)
            throw Error(`is not ItemEntity [${actor.constructor.name}:${actor}]`);
        return entity;
    }
}
exports.ItemEntity = ItemEntity;
entity_1.Entity.registerMapper(minecraft_1.ItemActor, actor => new ItemEntity(actor));
return exports;
},
tslib:require('tslib'),
};
// index.ts
exports.bdsx = void 0;
const eventsModule = __tsb.events();
const serverModule = __tsb.server();
const entityModule = __tsb.entity();
const playerModule = __tsb.player();
const commandModule = __tsb.command();
var bdsx;
(function (bdsx) {
    bdsx.Entity = entityModule.Entity;
    bdsx.Player = playerModule.Player;
    bdsx.events = eventsModule.events;
    bdsx.server = serverModule.server;
    bdsx.command = commandModule.command;
})(bdsx = exports.bdsx || (exports.bdsx = {}));

//# sourceMappingURL=index.js.map