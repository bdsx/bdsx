import asmcode = require("bdsx/asm/asmcode");
import { Register } from "bdsx/assembler";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { LoopbackPacketSender } from "bdsx/bds/loopbacksender";
import { StaticPointer, VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { makefunc, RawTypeId } from "bdsx/makefunc";
import { mce } from "bdsx/mce";
import { CxxString, float32_t, NativeType, uint8_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { Actor, ActorRuntimeID } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Block, BlockLegacy, BlockSource } from "./block";
import { MinecraftCommands } from "./command";
import { Certificate, ConnectionRequest } from "./connreq";
import { Dimension } from "./dimension";
import { GameMode } from "./gamemode";
import { HashedString } from "./hashedstring";
import { Item, ItemStack, PlayerInventory } from "./inventory";
import { Level, ServerLevel } from "./level";
import { CompoundTag } from "./nbt";
import { networkHandler, NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { ExtendedStreamReadResult, Packet } from "./packet";
import { AttributeData, UpdateAttributesPacket } from "./packets";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { Player, ServerPlayer } from "./player";
import { proc, procHacker } from "./proc";
import { RakNetInstance } from "./raknetinstance";
import { DedicatedServer, EntityRegistryOwned, Minecraft, Minecraft$Something, MinecraftEventing, MinecraftServerScriptEngine, PrivateKeyManager, ResourcePackManager, ScriptFramework, serverInstance, ServerInstance, ServerMetrics, VanilaGameModuleServer, VanilaServerGameplayEventListener, Whitelist } from "./server";
import { BinaryStream } from "./stream";

// avoiding circular dependency

// level.ts
Level.prototype.createDimension = procHacker.js("Level::createDimension", Dimension, {this:Level}, RawTypeId.Int32);
Level.prototype.fetchEntity = procHacker.js("Level::fetchEntity", Actor, {this:Level, nullableReturn: true}, RawTypeId.Bin64, RawTypeId.Boolean);
Level.prototype.getActivePlayerCount = procHacker.js("Level::getActivePlayerCount", RawTypeId.Int32, {this:Level});

Level.abstract({players:[CxxVector.make(ServerPlayer.ref()), 0x58]});

ServerLevel.abstract({
    packetSender:[LoopbackPacketSender.ref(), 0x830],
    actors:[CxxVector.make(Actor.ref()), 0x1590],
});

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
    identifier: [CxxString as NativeType<EntityId>, 0x458], // minecraft:player
    attributes: [BaseAttributeMap.ref(), 0x480],
    runtimeId: [ActorRuntimeID, 0x540],
});
(Actor.prototype as any)._sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", RawTypeId.Void, {this:Actor}, VoidPointer);
(Actor.prototype as any)._getName = procHacker.js("Actor::getNameTag", CxxStringWrapper, {this:Actor});
(Actor.prototype as any)._setName = procHacker.js("Actor::setNameTag", RawTypeId.Void, {this:Actor}, CxxStringWrapper);
(Actor.prototype as any)._addTag = procHacker.js("Actor::addTag", RawTypeId.Boolean, {this:Actor}, CxxStringWrapper);
(Actor.prototype as any)._hasTag = procHacker.js("Actor::hasTag", RawTypeId.Boolean, {this:Actor}, CxxStringWrapper);
Actor.prototype.getPosition = procHacker.js("Actor::getPos", Vec3, {this:Actor});
Actor.prototype.getRegion = procHacker.js("Actor::getRegionConst", BlockSource, {this:Actor});
Actor.prototype.getUniqueIdPointer = procHacker.js("Actor::getUniqueID", StaticPointer, {this:Actor});
Actor.prototype.getTypeId = makefunc.js([0x518], RawTypeId.Int32, {this:Actor}); // ActorType getEntityTypeId()
(Actor.prototype as any)._getDimensionId = makefunc.js([0x568], RawTypeId.Void, {this:Actor}, RawTypeId.Buffer); // DimensionId* getDimensionId(DimensionId*)
Actor.prototype.getCommandPermissionLevel = makefunc.js([0x620], RawTypeId.Int32, {this:Actor});

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
Player.prototype.getGameType = procHacker.js("Player::getPlayerGameType", RawTypeId.Int32, {this:Player});
Player.prototype.getInventory = procHacker.js("Player::getSupplies", PlayerInventory, {this:Player});
Player.prototype.getMainhandSlot = procHacker.js("Player::getCarriedItem", ItemStack, {this:Player});
Player.prototype.getOffhandSlot = procHacker.js("Actor::getOffhandSlot", ItemStack, {this:Player});
Player.prototype.getPermissionLevel = procHacker.js("Player::getPlayerPermissionLevel", RawTypeId.Int32, {this:Player});

ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, 0x9f0]
});
(ServerPlayer.prototype as any)._sendInventory = procHacker.js("ServerPlayer::sendInventory", RawTypeId.Void, {this:ServerPlayer});
ServerPlayer.prototype.openInventory = procHacker.js("ServerPlayer::openInventory", RawTypeId.Void, {this: ServerPlayer});
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", RawTypeId.Void, {this: ServerPlayer}, VoidPointer);
ServerPlayer.prototype.getNetworkIdentifier = function () {
    return this.networkIdentifier;
};

// networkidentifier.ts
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
    instance: [RakNetInstance.ref(), 0x48]
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

const ServerNetworkHandler$_getServerPlayer = procHacker.js("ServerNetworkHandler::_getServerPlayer", ServerPlayer, {nullableReturn:true}, ServerNetworkHandler, NetworkIdentifier, RawTypeId.Int32);
(ServerNetworkHandler.prototype as any)._disconnectClient = procHacker.js("ServerNetworkHandler::disconnectClient", RawTypeId.Void, {this: ServerNetworkHandler}, NetworkIdentifier, RawTypeId.Int32, CxxStringWrapper, RawTypeId.Int32);
ServerNetworkHandler.prototype.updateServerAnnouncement = procHacker.js("ServerNetworkHandler::updateServerAnnouncement", RawTypeId.Void, {this:ServerNetworkHandler});

// connreq.ts
Certificate.prototype.getXuid = function():string {
    const out = getXuid(this);
    const xuid = out.value;
    out.destruct();
    return xuid;
};
Certificate.prototype.getIdentityName = function():string {
    const out = getIdentityName(this);
    const id = out.value;
    out.destruct();
    return id;
};
Certificate.prototype.getIdentity = function():mce.UUID {
    return getIdentity(this).value;
};
const getXuid = procHacker.js("ExtendedCertificate::getXuid", CxxStringWrapper, {structureReturn: true}, Certificate);
const getIdentityName = procHacker.js("ExtendedCertificate::getIdentityName", CxxStringWrapper, {structureReturn: true}, Certificate);
const getIdentity = procHacker.js("ExtendedCertificate::getIdentity", mce.UUIDWrapper, {structureReturn: true}, Certificate);
ConnectionRequest.abstract({
    cert:[Certificate.ref(), 0x08],
    something:[Certificate.ref(), 0x10],
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

BaseAttributeMap.prototype.getMutableInstance = procHacker.js("?getMutableInstance@BaseAttributeMap@@QEAAPEAVAttributeInstance@@I@Z", AttributeInstance, {this:BaseAttributeMap, nullableReturn: true}, RawTypeId.Int32);

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
    server:[DedicatedServer.ref(), 0x98],
    minecraft:[Minecraft.ref(), 0xa0],
    networkHandler:[NetworkHandler.ref(), 0xa8],
    scriptEngine:[MinecraftServerScriptEngine.ref(), 0x210],
});
(ServerInstance.prototype as any)._disconnectAllClients = procHacker.js("ServerInstance::disconnectAllClientsWithMessage", RawTypeId.Void, {this:ServerInstance}, CxxStringWrapper);

// gamemode.ts
GameMode.define({
    actor: [Actor.ref(), 8]
});

// inventory.ts
(Item.prototype as any)._getCommandName = procHacker.js("Item::getCommandName", CxxStringWrapper, {this:Item});
Item.prototype.allowOffhand = procHacker.js("Item::allowOffhand", RawTypeId.Boolean, {this:Item});
Item.prototype.isDamageable = procHacker.js("Item::isDamageable", RawTypeId.Boolean, {this:Item});
Item.prototype.isFood = procHacker.js("Item::isFood", RawTypeId.Boolean, {this:Item});
Item.prototype.setAllowOffhand = procHacker.js("Item::setAllowOffhand", RawTypeId.Void, {this:Item}, RawTypeId.Boolean);
Item.prototype.getCreativeCategory = procHacker.js("Item::getCreativeCategory", RawTypeId.Int32, {this:Item});
ItemStack.abstract({
    amount:[uint8_t, 0x22],
});
(ItemStack.prototype as any)._getId = procHacker.js("ItemStackBase::getId", RawTypeId.Int32, {this:ItemStack});
(ItemStack.prototype as any)._getItem = procHacker.js("ItemStackBase::getItem", Item, {this:ItemStack});
(ItemStack.prototype as any)._getCustomName = procHacker.js("ItemStackBase::getName", CxxStringWrapper, {this:ItemStack, structureReturn:true});
(ItemStack.prototype as any)._setCustomName = procHacker.js("ItemStackBase::setCustomName", RawTypeId.Void, {this:ItemStack}, CxxStringWrapper);
ItemStack.prototype.getUserData = procHacker.js("ItemStackBase::getUserData", CompoundTag, {this:ItemStack});
ItemStack.prototype.hasCustomName = procHacker.js("ItemStackBase::hasCustomHoverName", RawTypeId.Boolean, {this:ItemStack});
ItemStack.prototype.isBlock = procHacker.js("ItemStackBase::isBlock", RawTypeId.Boolean, {this:ItemStack});
ItemStack.prototype.isNull = procHacker.js("ItemStackBase::isNull", RawTypeId.Boolean, {this:ItemStack});

PlayerInventory.prototype.getItem = procHacker.js("PlayerInventory::getItem", ItemStack, {this:PlayerInventory}, RawTypeId.Int32, RawTypeId.Int32);

// block.ts
(BlockLegacy.prototype as any)._getCommandName = procHacker.js("BlockLegacy::getCommandName", CxxStringWrapper, {this:BlockLegacy});
BlockLegacy.prototype.getCreativeCategory = procHacker.js("BlockLegacy::getCreativeCategory", RawTypeId.Int32, {this:Block});
BlockLegacy.prototype.setDestroyTime = procHacker.js("BlockLegacy::setDestroyTime", RawTypeId.Void, {this:Block}, RawTypeId.Float32);
Block.abstract({
    blockLegacy: [BlockLegacy.ref(), 0x10],
});
(Block.prototype as any)._getName = procHacker.js("Block::getName", HashedString, {this:Block});
BlockSource.prototype.getBlock = procHacker.js("BlockSource::getBlock", Block, {this:BlockSource}, BlockPos);
