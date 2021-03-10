import asmcode = require("bdsx/asm/asmcode");
import { Register } from "bdsx/assembler";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { CommandOrigin, PlayerCommandOrigin, ScriptCommandOrigin, ServerCommandOrigin } from "bdsx/bds/commandorigin";
import { LoopbackPacketSender } from "bdsx/bds/loopbacksender";
import { StaticPointer, VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { makefunc, RawTypeId } from "bdsx/makefunc";
import { mce } from "bdsx/mce";
import { CxxStringWrapper } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { bin64_t, CxxString, float32_t, NativeType, uint16_t, uint32_t, uint8_t } from "bdsx/nativetype";
import { Actor, ActorRuntimeID } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { CommandContext, CommandOutputSender, MCRESULT, MinecraftCommands } from "./command";
import { Certificate, ConnectionRequest } from "./connreq";
import { Dimension } from "./dimension";
import { GameMode } from "./gamemode";
import { ItemStack, PlayerInventory } from "./inventory";
import { Level, ServerLevel } from "./level";
import { networkHandler, NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { ExtendedStreamReadResult, Packet } from "./packet";
import { AttributeData, UpdateAttributesPacket } from "./packets";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { Player, ServerPlayer } from "./player";
import { proc, procHacker } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";
import { DedicatedServer, EntityRegistryOwned, Minecraft, Minecraft$Something, MinecraftEventing, MinecraftServerScriptEngine, PrivateKeyManager, ResourcePackManager, ScriptFramework, serverInstance, ServerInstance, ServerMetrics, VanilaGameModuleServer, VanilaServerGameplayEventListener, Whitelist } from "./server";
import { BinaryStream } from "./stream";

// avoiding circular dependency

// raknet.ts
RakNet.SystemAddress.define({
    systemIndex:[uint16_t, 130]
}, 136);
RakNet.SystemAddress.prototype.ToString = procHacker.js("RakNet::SystemAddress::ToString", RawTypeId.Void, {this: RakNet.SystemAddress}, RawTypeId.Boolean, RawTypeId.Buffer, RawTypeId.Int32);

RakNet.RakNetGUID.define({
    g:bin64_t,
    systemIndex:uint16_t
}, 16);
RakNet.RakPeer.abstract({
    vftable: VoidPointer
});
RakNet.RakPeer.prototype.GetSystemAddressFromIndex = makefunc.js([0xf0], RakNet.SystemAddress, {this:RakNet.RakPeer, structureReturn: true}, RawTypeId.Int32);
RakNet.AddressOrGUID.define({
    rakNetGuid:RakNet.RakNetGUID,
    systemAddress:RakNet.SystemAddress,
});

// level.ts
Level.prototype.createDimension = procHacker.js("Level::createDimension", Dimension, {this:Level}, RawTypeId.Int32);
Level.prototype.fetchEntity = procHacker.js("Level::fetchEntity", Actor, {this:Level, nullableReturn: true}, RawTypeId.Bin64, RawTypeId.Boolean);


Level.abstract({players:[CxxVector.make(ServerPlayer.ref()), 0x58]});

ServerLevel.abstract({
    packetSender:[LoopbackPacketSender.ref(), 0x830],
    actors:[CxxVector.make(Actor.ref()), 0x1590],
});

// commandorigin.ts
CommandOrigin.define({
    vftable:VoidPointer,
    uuid:mce.UUID,
    level:ServerLevel.ref(),
});
PlayerCommandOrigin.abstract({});
ScriptCommandOrigin.abstract({});

const ServerCommandOrigin_vftable = proc["ServerCommandOrigin::`vftable'"];
ServerCommandOrigin.prototype.isServerCommandOrigin = function() {
    return this.vftable.equals(ServerCommandOrigin_vftable);
};

// void destruct(CommandOrigin* origin);
CommandOrigin.prototype.destruct = makefunc.js([0x00], RawTypeId.Void, {this: CommandOrigin});

// std::string CommandOrigin::getRequestId();
const getRequestId = makefunc.js([0x08], CxxStringWrapper, {this: CommandOrigin, structureReturn: true});
CommandOrigin.prototype.getRequestId = function():string {
    const p = getRequestId.call(this) as CxxStringWrapper;
    const str = p.value;
    p.destruct();
    return str;
};

// std::string CommandOrigin::getName();
const getName = makefunc.js([0x10], CxxStringWrapper, {this: CommandOrigin, structureReturn: true});
CommandOrigin.prototype.getName = function():string {
    const p = getName.call(this) as CxxStringWrapper;
    const str = p.value;
    p.destruct();
    return str;
};

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

// command.ts
MCRESULT.define({
    result:uint32_t
});
CommandContext.abstract({
    command:CxxString,
    origin:ServerCommandOrigin.ref(),
});
MinecraftCommands.abstract({
    sender:CommandOutputSender.ref(),
    u1:VoidPointer,
    u2:bin64_t,
    minecraft:Minecraft.ref(),
});
MinecraftCommands.prototype._executeCommand = procHacker.js("MinecraftCommands::executeCommand", MCRESULT, {this: MinecraftCommands, structureReturn:true }, SharedPtr.make(CommandContext), RawTypeId.Boolean);

// actor.ts
const actorMaps = new Map<string, Actor>();
const ServerPlayer_vftable = proc["ServerPlayer::`vftable'"];
Actor.prototype.isPlayer = function() {
    return this.vftable.equals(ServerPlayer_vftable);
};
(Actor as any)._singletoning = function(ptr:StaticPointer):Actor|null {
    if (ptr.isNull()) return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMaps.get(binptr);
    if (actor) return actor;
    if (ptr.getPointer().equals(ServerPlayer_vftable)) {
        actor = ptr.as(ServerPlayer);
    } else {
        actor = ptr.as(Actor);
    }
    actorMaps.set(binptr, actor);
    return actor;
};
Actor.all = function():IterableIterator<Actor> {
    return actorMaps.values();
};

Actor.abstract({
    vftable: VoidPointer,
    dimension: [Dimension, 0x350],
    identifier: [CxxString as NativeType<EntityId>, 0x450], // minecraft:player
    attributes: [BaseAttributeMap.ref(), 0x478],
    runtimeId: [ActorRuntimeID, 0x538],
});
(Actor.prototype as any)._sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", RawTypeId.Void, {this:Actor}, VoidPointer);
(Actor.prototype as any)._getName = procHacker.js("Actor::getNameTag", CxxStringWrapper, {this:Actor});
Actor.prototype.getPosition = procHacker.js("Actor::getPos", Vec3, {this:Actor});
Actor.prototype.getUniqueIdPointer = procHacker.js("Actor::getUniqueID", StaticPointer, {this:Actor});

Actor.prototype.getTypeId = makefunc.js([0x508], RawTypeId.Int32, {this:Actor}); // ActorType getEntityTypeId()
(Actor.prototype as any)._getDimensionId = makefunc.js([0x548], RawTypeId.Void, {this:Actor}, RawTypeId.Buffer); // DimensionId* getDimensionId(DimensionId*)

Actor.fromUniqueIdBin = function(bin) {
    return serverInstance.minecraft.something.level.fetchEntity(bin, true);  
};

const attribNames = [
    "minecraft:zombie.spawn.reinforcements",
    "minecraft:player.hunger",
    "minecraft:player.saturation",
    "minecraft:player.exhaustion",
    "minecraft:player.level",
    "minecraft:player.experience",
    "minecraft:health",
    "minecraft:follow_range",
    "minecraft:knockback_registance",
    "minecraft:movement",
    "minecraft:underwater_movement",
    "minecraft:attack_damage",
    "minecraft:absorption",
    "minecraft:luck",
    "minecraft:horse.jump_strength",
];
(Actor.prototype as any)._sendAttributePacket = function(this:Actor, id:AttributeId, value:number, attr:AttributeInstance):void {
    const packet = UpdateAttributesPacket.create();
    packet.actorId = this.runtimeId;

    const data = new AttributeData(true);
    data.construct();
    data.name.set(attribNames[id - 1]);
    data.current = value;
    data.min = attr.minValue;
    data.max = attr.maxValue;
    data.default = attr.defaultValue;
    packet.attributes.push(data);
    data.destruct();
    this._sendNetworkPacket(packet);
    packet.dispose();
};

function _removeActor(actor:Actor):void {
    actorMaps.delete(actor.getAddressBin());
}

procHacker.hookingRawWithCallOriginal(
    'Level::removeEntityReferences', 
    makefunc.np((level, actor, b)=>{
        _removeActor(actor);
    }, RawTypeId.Void, null, Level, Actor, RawTypeId.Boolean),
    [Register.rcx, Register.rdx, Register.r8], []
);

asmcode.removeActor = makefunc.np(_removeActor, RawTypeId.Void, null, Actor);
procHacker.hookingRawWithCallOriginal('Actor::~Actor', asmcode.actorDestructorHook, [Register.rcx], []);

// player.ts
(Player.prototype as any)._setName = procHacker.js("Player::setName", RawTypeId.Void, {this: Player}, CxxStringWrapper);
Player.prototype.changeDimension = procHacker.js("ServerPlayer::changeDimension", RawTypeId.Void, {this:Player}, RawTypeId.Int32, RawTypeId.Boolean);
Player.prototype.teleportTo = procHacker.js("Player::teleportTo", RawTypeId.Void, {this:Player}, Vec3, RawTypeId.Boolean, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.Bin64);
Player.prototype.getInventory = procHacker.js("Player::getSupplies", PlayerInventory, {this:Player});

ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, 0x9e8]
});
ServerPlayer.prototype.openInventory = procHacker.js("ServerPlayer::openInventory", RawTypeId.Void, {this: ServerPlayer});
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", RawTypeId.Void, {this: ServerPlayer}, VoidPointer);
ServerPlayer.prototype.getNetworkIdentifier = function () {
    return this.networkIdentifier;
};

// networkidentifier.ts
NetworkIdentifier.define({
    address:RakNet.AddressOrGUID
});
NetworkIdentifier.prototype.getActor = function():ServerPlayer|null {
    return ServerNetworkHandler$_getServerPlayer(serverInstance.minecraft.something.shandler, this, 0);
};
NetworkIdentifier.prototype.equals = procHacker.js("NetworkIdentifier::operator==", RawTypeId.Boolean, {this:NetworkIdentifier}, NetworkIdentifier);

asmcode.NetworkIdentifierGetHash = proc['NetworkIdentifier::getHash'];
NetworkIdentifier.prototype.hash = makefunc.js(asmcode.networkIdentifierHash, RawTypeId.Int32, {this:NetworkIdentifier});

NetworkHandler.Connection.abstract({
    networkIdentifier:NetworkIdentifier,
    u1:VoidPointer, // null
    u2:VoidPointer, // null
    u3:VoidPointer, // null
    epeer:SharedPtr.make(EncryptedNetworkPeer),
    bpeer:SharedPtr.make(BatchedNetworkPeer),
    bpeer2:SharedPtr.make(BatchedNetworkPeer),
});
NetworkHandler.abstract({
    vftable: VoidPointer,
    instance: [RakNetInstance.ref(), 0x30]
});

// NetworkHandler::Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni)
NetworkHandler.prototype.getConnectionFromId = procHacker.js(`NetworkHandler::_getConnectionFromId`, NetworkHandler.Connection, {this:NetworkHandler});

// void NetworkHandler::send(const NetworkIdentifier& ni, Packet* packet, unsigned char u)
NetworkHandler.prototype.send = procHacker.js('NetworkHandler::send', RawTypeId.Void, {this:NetworkHandler}, NetworkIdentifier, Packet, RawTypeId.Int32);

// void NetworkHandler::_sendInternal(const NetworkIdentifier& ni, Packet* packet, std::string& data)
NetworkHandler.prototype.sendInternal = procHacker.js('NetworkHandler::_sendInternal', RawTypeId.Void, {this:NetworkHandler}, NetworkIdentifier, Packet, CxxStringWrapper);

BatchedNetworkPeer.prototype.sendPacket = procHacker.js('BatchedNetworkPeer::sendPacket', RawTypeId.Void, {this:BatchedNetworkPeer}, CxxStringWrapper, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.Int32, RawTypeId.Int32);

// packet.ts
Packet.prototype.sendTo = function(target:NetworkIdentifier, unknownarg:number=0):void {
    networkHandler.send(target, this, unknownarg);
};
Packet.prototype.destruct = makefunc.js([0x0], RawTypeId.Void, {this:Packet});
Packet.prototype.getId = makefunc.js([0x8], RawTypeId.Int32, {this:Packet});
Packet.prototype.getName = makefunc.js([0x10], RawTypeId.Void, {this:Packet}, CxxStringWrapper);
Packet.prototype.write = makefunc.js([0x18], RawTypeId.Void, {this:Packet}, BinaryStream);
Packet.prototype.read = makefunc.js([0x20], RawTypeId.Int32, {this:Packet}, BinaryStream);
Packet.prototype.readExtended = makefunc.js([0x28], ExtendedStreamReadResult, {this:Packet}, ExtendedStreamReadResult, BinaryStream);
// Packet.prototype.unknown = makefunc.js([0x30], RawTypeId.Boolean, {this:Packet});

const ServerNetworkHandler$_getServerPlayer = procHacker.js(
    "ServerNetworkHandler::_getServerPlayer", ServerPlayer, {nullableReturn:true}, ServerNetworkHandler, NetworkIdentifier, RawTypeId.Int32);
(ServerNetworkHandler.prototype as any)._setMotd = procHacker.js("ServerNetworkHandler::allowIncomingConnections", RawTypeId.Void, {this: ServerNetworkHandler}, CxxStringWrapper, RawTypeId.Boolean);
(ServerNetworkHandler.prototype as any)._disconnectClient = procHacker.js("ServerNetworkHandler::disconnectClient", RawTypeId.Void, {this: ServerNetworkHandler}, NetworkIdentifier, RawTypeId.Int32, CxxStringWrapper, RawTypeId.Int32);

// connreq.ts
Certificate.prototype.getXuid = function():string {
    const out = getXuid(this);
    const xuid = out.value;
    out.destruct();
    return xuid;
};
Certificate.prototype.getId = function():string {
    const out = getIdentityName(this);
    const id = out.value;
    out.destruct();
    return id;
};
Certificate.prototype.getTitleId = function():number {
    return getTitleId(this);
};
Certificate.prototype.getIdentity = function():mce.UUID {
    return getIdentity(this).value;
};
const getXuid = procHacker.js("ExtendedCertificate::getXuid", CxxStringWrapper, {structureReturn: true}, Certificate);
const getIdentityName = procHacker.js("ExtendedCertificate::getIdentityName", CxxStringWrapper, {structureReturn: true}, Certificate);
const getTitleId = procHacker.js("ExtendedCertificate::getTitleID", RawTypeId.Int32, null, Certificate);
const getIdentity = procHacker.js("ExtendedCertificate::getIdentity", mce.UUIDWrapper, {structureReturn: true}, Certificate);
ConnectionRequest.abstract({
    u1: VoidPointer,
    cert:Certificate.ref()
});

// attribute.ts
AttributeInstance.abstract({
    vftable:VoidPointer,
    u1:VoidPointer,
    u2:VoidPointer,
    currentValue: [float32_t, 0x84],
    minValue: [float32_t, 0x7C],
    maxValue: [float32_t, 0x80],
    defaultValue: [float32_t, 0x78],
});
BaseAttributeMap.abstract({});

BaseAttributeMap.prototype.getMutableInstance = procHacker.js("BaseAttributeMap::getMutableInstance", AttributeInstance, {this:BaseAttributeMap, nullableReturn: true}, RawTypeId.Int32);

// server.ts
VanilaGameModuleServer.abstract({
    listener:[VanilaServerGameplayEventListener.ref(), 0x8]
});
DedicatedServer.abstract({});
Minecraft$Something.abstract({
    network:NetworkHandler.ref(),
    level:ServerLevel.ref(),
    shandler:ServerNetworkHandler.ref(),
});
Minecraft.abstract({
    vftable:VoidPointer,
    serverInstance:ServerInstance.ref(),
    minecraftEventing:MinecraftEventing.ref(),
    resourcePackManager:ResourcePackManager.ref(),
    offset_20:VoidPointer,
    vanillaGameModuleServer:[SharedPtr, 0x28], // VanilaGameModuleServer
    whitelist:Whitelist.ref(),
    permissionsJsonFileName:CxxString.ref(),
    privateKeyManager:PrivateKeyManager.ref(),
    serverMetrics:[ServerMetrics.ref(), 0x78],
    commands:[MinecraftCommands.ref(), 0xa0],
    something:Minecraft$Something.ref(),
    network:[NetworkHandler.ref(), 0xc0],
    LoopbackPacketSender:LoopbackPacketSender.ref(),
    server:DedicatedServer.ref(),
    entityRegistryOwned:[SharedPtr.make(EntityRegistryOwned), 0xe0],
});
Minecraft.prototype.getLevel = procHacker.js("Minecraft::getLevel", Level, {this:Minecraft});
ScriptFramework.abstract({
    vftable:VoidPointer,
});
MinecraftServerScriptEngine.abstract({
    scriptEngineVftable:[VoidPointer, 0x428]
});
ServerInstance.abstract({
    vftable:VoidPointer,
    server:[DedicatedServer.ref(), 0x90],
    minecraft:[Minecraft.ref(), 0x98],
    networkHandler:[NetworkHandler.ref(), 0xa0],
    scriptEngine:[MinecraftServerScriptEngine.ref(), 0x208],
});

// gamemode.ts
GameMode.define({
    actor: [Actor.ref(), 8]
});

// inventory.ts
ItemStack.abstract({
    amount:[uint8_t, 0x22],
});
(ItemStack.prototype as any)._getId = procHacker.js("ItemStackBase::getId", RawTypeId.Int32, {this:ItemStack});
(ItemStack.prototype as any)._setCustomName = procHacker.js("ItemStackBase::setCustomName", RawTypeId.Void, {this:ItemStack}, CxxStringWrapper);
ItemStack.prototype.isBlock = procHacker.js("ItemStackBase::isBlock", RawTypeId.Boolean, {this:ItemStack});
ItemStack.prototype.isEmptyStack = procHacker.js("ItemStackBase::isEmptyStack", RawTypeId.Boolean, {this:ItemStack});

PlayerInventory.prototype.getItem = procHacker.js("PlayerInventory::getItem", ItemStack, {this:PlayerInventory}, RawTypeId.Int32, RawTypeId.Int32);
