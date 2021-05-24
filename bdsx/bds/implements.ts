import asmcode = require("bdsx/asm/asmcode");
import { Register } from "bdsx/assembler";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { LoopbackPacketSender } from "bdsx/bds/loopbacksender";
import { AllocatedPointer, StaticPointer, VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { makefunc } from "bdsx/makefunc";
import { mce } from "bdsx/mce";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, NativeType, uint8_t, void_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { Actor, ActorRuntimeID, DimensionId } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Block, BlockLegacy, BlockSource } from "./block";
import { MinecraftCommands } from "./command";
import { Certificate, ConnectionRequest } from "./connreq";
import { Dimension } from "./dimension";
import { GameMode } from "./gamemode";
import { HashedString } from "./hashedstring";
import { ComponentItem, Item, ItemStack, PlayerInventory } from "./inventory";
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
Level.prototype.createDimension = procHacker.js("Level::createDimension", Dimension, {this:Level}, int32_t);
Level.prototype.fetchEntity = procHacker.js("Level::fetchEntity", Actor, {this:Level}, bin64_t, bool_t);
Level.prototype.getActivePlayerCount = procHacker.js("Level::getActivePlayerCount", int32_t, {this:Level});

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
(Actor as any)._singletoning = function(ptr:StaticPointer|null):Actor|null {
    if (ptr === null) return null;
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
Actor.prototype.getName = procHacker.js("Actor::getNameTag", CxxString, {this:Actor});
Actor.prototype.setName = procHacker.js("Actor::setNameTag", void_t, {this:Actor}, CxxString);
Actor.prototype.addTag = procHacker.js("Actor::addTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.hasTag = procHacker.js("Actor::hasTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.removeTag = procHacker.js("Actor::removeTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.getPosition = procHacker.js("Actor::getPos", Vec3, {this:Actor});
Actor.prototype.getRegion = procHacker.js("Actor::getRegionConst", BlockSource, {this:Actor});
Actor.prototype.getUniqueIdPointer = procHacker.js("Actor::getUniqueID", StaticPointer, {this:Actor});
Actor.prototype.getTypeId = makefunc.js([0x518], int32_t, {this:Actor}); // ActorType getEntityTypeId()
Actor.prototype.getDimension = Actor.prototype.getDimensionId = makefunc.js([0x568], int32_t, {this:Actor, structureReturn: true}); // DimensionId* getDimensionId(DimensionId*)
Actor.prototype.getCommandPermissionLevel = makefunc.js([0x620], int32_t, {this:Actor});
const _computeTarget = procHacker.js("TeleportCommand::computeTarget", void_t, null, StaticPointer, Actor, Vec3, Vec3, int32_t);
const _applyTarget = procHacker.js("TeleportCommand::applyTarget", void_t, null, Actor, StaticPointer);
Actor.prototype.teleport = function(pos:Vec3, dimensionId:DimensionId=DimensionId.Overworld) {
    const alloc = new AllocatedPointer(0x80);
    _computeTarget(alloc, this, pos, new Vec3(true), dimensionId);
    _applyTarget(this, alloc);
};
Actor.prototype.getArmor = procHacker.js('Actor::getArmor', ItemStack, {this:Actor}, int32_t);

Actor.prototype.setSneaking = procHacker.js("Actor::setSneaking", void_t, {this:Actor}, bool_t);
Actor.prototype.getHealth = procHacker.js("Actor::getHealth", int32_t, {this:Actor});
Actor.prototype.getMaxHealth = procHacker.js("Actor::getMaxHealth", int32_t, {this:Actor});

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
    if (this instanceof ServerPlayer) {
        this.sendNetworkPacket(packet);
    }
    packet.dispose();
};

function _removeActor(actor:Actor):void {
    actorMaps.delete(actor.getAddressBin());
}

procHacker.hookingRawWithCallOriginal(
    'Level::removeEntityReferences',
    makefunc.np((level, actor, b)=>{
        _removeActor(actor);
    }, void_t, null, Level, Actor, bool_t),
    [Register.rcx, Register.rdx, Register.r8], []
);

asmcode.removeActor = makefunc.np(_removeActor, void_t, null, Actor);
procHacker.hookingRawWithCallOriginal('Actor::~Actor', asmcode.actorDestructorHook, [Register.rcx], []);

// player.ts
Player.prototype.setName = procHacker.js("Player::setName", void_t, {this: Player}, CxxString);
Player.prototype.changeDimension = procHacker.js("ServerPlayer::changeDimension", void_t, {this:Player}, int32_t, bool_t);
Player.prototype.teleportTo = procHacker.js("Player::teleportTo", void_t, {this:Player}, Vec3, bool_t, int32_t, int32_t, bin64_t);
Player.prototype.getGameType = procHacker.js("Player::getPlayerGameType", int32_t, {this:Player});
Player.prototype.getInventory = procHacker.js("Player::getSupplies", PlayerInventory, {this:Player});
Player.prototype.getMainhandSlot = procHacker.js("Player::getCarriedItem", ItemStack, {this:Player});
Player.prototype.getOffhandSlot = procHacker.js("Actor::getOffhandSlot", ItemStack, {this:Player});
Player.prototype.getPermissionLevel = procHacker.js("Player::getPlayerPermissionLevel", int32_t, {this:Player});
Player.prototype.startCooldown = procHacker.js("Player::startCooldown", void_t, {this:Player}, Item);
Player.prototype.setSize = procHacker.js("Player::setSize", void_t, {this:Player}, float32_t, float32_t);
Player.prototype.setSleeping = procHacker.js("Player::setSleeping", void_t, {this:Player}, bool_t);
Player.prototype.isSleeping = procHacker.js("Player::isSleeping", bool_t, {this:Player});
Player.prototype.isJumping = procHacker.js("Player::isJumping", bool_t, {this:Player});

ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, 0x9f0]
});
(ServerPlayer.prototype as any)._sendInventory = procHacker.js("ServerPlayer::sendInventory", void_t, {this:ServerPlayer}, bool_t);
ServerPlayer.prototype.openInventory = procHacker.js("ServerPlayer::openInventory", void_t, {this: ServerPlayer});
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", void_t, {this: ServerPlayer}, VoidPointer);
ServerPlayer.prototype.getNetworkIdentifier = function () {
    return this.networkIdentifier;
};

// networkidentifier.ts
NetworkIdentifier.prototype.getActor = function():ServerPlayer|null {
    return ServerNetworkHandler$_getServerPlayer(serverInstance.minecraft.something.shandler, this, 0);
};
NetworkIdentifier.prototype.equals = procHacker.js("NetworkIdentifier::operator==", bool_t, {this:NetworkIdentifier}, NetworkIdentifier);

asmcode.NetworkIdentifierGetHash = proc['NetworkIdentifier::getHash'];
NetworkIdentifier.prototype.hash = makefunc.js(asmcode.networkIdentifierHash, int32_t, {this:NetworkIdentifier});

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
NetworkHandler.prototype.send = procHacker.js('NetworkHandler::send', void_t, {this:NetworkHandler}, NetworkIdentifier, Packet, int32_t);

// void NetworkHandler::_sendInternal(const NetworkIdentifier& ni, Packet* packet, std::string& data)
NetworkHandler.prototype.sendInternal = procHacker.js('NetworkHandler::_sendInternal', void_t, {this:NetworkHandler}, NetworkIdentifier, Packet, CxxStringWrapper);

BatchedNetworkPeer.prototype.sendPacket = procHacker.js('BatchedNetworkPeer::sendPacket', void_t, {this:BatchedNetworkPeer}, CxxString, int32_t, int32_t, int32_t, int32_t);

// packet.ts
Packet.prototype.sendTo = function(target:NetworkIdentifier, unknownarg:number=0):void {
    networkHandler.send(target, this, unknownarg);
};
Packet.prototype.destruct = makefunc.js([0x0], void_t, {this:Packet});
Packet.prototype.getId = makefunc.js([0x8], int32_t, {this:Packet});
Packet.prototype.getName = makefunc.js([0x10], CxxString, {this:Packet, structureReturn: true});
Packet.prototype.write = makefunc.js([0x18], void_t, {this:Packet}, BinaryStream);
Packet.prototype.read = makefunc.js([0x20], int32_t, {this:Packet}, BinaryStream);
Packet.prototype.readExtended = makefunc.js([0x28], ExtendedStreamReadResult, {this:Packet}, ExtendedStreamReadResult, BinaryStream);
// Packet.prototype.unknown = makefunc.js([0x30], bool_t, {this:Packet});

const ServerNetworkHandler$_getServerPlayer = procHacker.js("ServerNetworkHandler::_getServerPlayer", ServerPlayer, {nullableReturn:true}, ServerNetworkHandler, NetworkIdentifier, int32_t);
(ServerNetworkHandler.prototype as any)._disconnectClient = procHacker.js("ServerNetworkHandler::disconnectClient", void_t, {this: ServerNetworkHandler}, NetworkIdentifier, int32_t, CxxString, int32_t);
ServerNetworkHandler.prototype.updateServerAnnouncement = procHacker.js("ServerNetworkHandler::updateServerAnnouncement", void_t, {this:ServerNetworkHandler});

// connreq.ts
Certificate.prototype.getXuid = function():string {
    return ExtendedCertificate.getXuid(this);
};
Certificate.prototype.getIdentityName = function():string {
    return ExtendedCertificate.getIdentityName(this);
};
Certificate.prototype.getIdentity = function():mce.UUID {
    return ExtendedCertificate.getIdentity(this).value;
};

namespace ExtendedCertificate {
    export const getXuid = procHacker.js("ExtendedCertificate::getXuid", CxxString, {structureReturn: true}, Certificate);
    export const getIdentityName = procHacker.js("ExtendedCertificate::getIdentityName", CxxString, {structureReturn: true}, Certificate);
    export const getIdentity = procHacker.js("ExtendedCertificate::getIdentity", mce.UUIDWrapper, {structureReturn: true}, Certificate);
}
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

BaseAttributeMap.prototype.getMutableInstance = procHacker.js("?getMutableInstance@BaseAttributeMap@@QEAAPEAVAttributeInstance@@I@Z", AttributeInstance, {this:BaseAttributeMap}, int32_t);

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
(ServerInstance.prototype as any)._disconnectAllClients = procHacker.js("ServerInstance::disconnectAllClientsWithMessage", void_t, {this:ServerInstance}, CxxString);

// gamemode.ts
GameMode.define({
    actor: [Actor.ref(), 8]
});

// inventory.ts
Item.prototype.getCommandName = procHacker.js("Item::getCommandName", CxxString, {this:Item});
Item.prototype.allowOffhand = procHacker.js("Item::allowOffhand", bool_t, {this:Item});
Item.prototype.isDamageable = procHacker.js("Item::isDamageable", bool_t, {this:Item});
Item.prototype.isFood = procHacker.js("Item::isFood", bool_t, {this:Item});
Item.prototype.setAllowOffhand = procHacker.js("Item::setAllowOffhand", void_t, {this:Item}, bool_t);
Item.prototype.getCreativeCategory = procHacker.js("Item::getCreativeCategory", int32_t, {this:Item});
ItemStack.abstract({
    amount:[uint8_t, 0x22],
});
ItemStack.prototype.getId = procHacker.js("ItemStackBase::getId", int16_t, {this:ItemStack});
(ItemStack.prototype as any)._getItem = procHacker.js("ItemStackBase::getItem", Item, {this:ItemStack});
ItemStack.prototype.getCustomName = procHacker.js("ItemStackBase::getName", CxxString, {this:ItemStack, structureReturn:true});
ItemStack.prototype.setCustomName = procHacker.js("ItemStackBase::setCustomName", void_t, {this:ItemStack}, CxxString);
(ItemStack.prototype as any)._setCustomLore = procHacker.js("ItemStackBase::setCustomLore", void_t, {this:ItemStack}, CxxVector.make(CxxStringWrapper));
ItemStack.prototype.getUserData = procHacker.js("ItemStackBase::getUserData", CompoundTag, {this:ItemStack});
ItemStack.prototype.hasCustomName = procHacker.js("ItemStackBase::hasCustomHoverName", bool_t, {this:ItemStack});
ItemStack.prototype.isBlock = procHacker.js("ItemStackBase::isBlock", bool_t, {this:ItemStack});
ItemStack.prototype.isNull = procHacker.js("ItemStackBase::isNull", bool_t, {this:ItemStack});
ItemStack.prototype.getEnchantValue = procHacker.js("ItemStackBase::getEnchantValue", int32_t, {this:ItemStack});
ItemStack.prototype.isEnchanted = procHacker.js("ItemStackBase::isEnchanted", bool_t, {this:ItemStack});
ItemStack.prototype.setDamageValue = procHacker.js("ItemStackBase::setDamageValue", void_t, {this:ItemStack}, int32_t);
ItemStack.prototype.startCoolDown = procHacker.js("ItemStackBase::startCoolDown", void_t, {this:ItemStack}, ServerPlayer);
ItemStack.prototype.load = procHacker.js("ItemStackBase::load", void_t, {this:ItemStack}, CompoundTag);
ItemStack.prototype.sameItem = procHacker.js("ItemStackBase::sameItem", bool_t, {this:ItemStack}, ItemStack);
ItemStack.prototype.isStackedByData = procHacker.js("ItemStackBase::isStackedByData", bool_t, {this:ItemStack});
ItemStack.prototype.isStackable = procHacker.js("ItemStackBase::isStackable", bool_t, {this:ItemStack});
ItemStack.prototype.isPotionItem = procHacker.js("ItemStackBase::isPotionItem", bool_t, {this:ItemStack});
ItemStack.prototype.isPattern = procHacker.js("ItemStackBase::isPattern", bool_t, {this:ItemStack});
ItemStack.prototype.isMusicDiscItem = procHacker.js("ItemStackBase::isMusicDiscItem", bool_t, {this:ItemStack});
ItemStack.prototype.isLiquidClipItem = procHacker.js("ItemStackBase::isLiquidClipItem", bool_t, {this:ItemStack});
ItemStack.prototype.isHorseArmorItem = procHacker.js("ItemStackBase::isHorseArmorItem", bool_t, {this:ItemStack});
ItemStack.prototype.isGlint = procHacker.js("ItemStackBase::isGlint", bool_t, {this:ItemStack});
ItemStack.prototype.isFullStack = procHacker.js("ItemStackBase::isFullStack", bool_t, {this:ItemStack});
ItemStack.prototype.isFireResistant = procHacker.js("ItemStackBase::isFireResistant", bool_t, {this:ItemStack});
ItemStack.prototype.isExplodable = procHacker.js("ItemStackBase::isExplodable", bool_t, {this:ItemStack});
ItemStack.prototype.isDamaged = procHacker.js("ItemStackBase::isDamaged", bool_t, {this:ItemStack});
ItemStack.prototype.isDamageableItem = procHacker.js("ItemStackBase::isDamageableItem", bool_t, {this:ItemStack});
ItemStack.prototype.isArmorItem = procHacker.js("ItemStackBase::isArmorItem", bool_t, {this:ItemStack});
ItemStack.prototype.getComponentItem = procHacker.js("ItemStackBase::getComponentItem", ComponentItem, {this:ItemStack});
ItemStack.prototype.getMaxDamage = procHacker.js("ItemStackBase::getMaxDamage", int32_t, {this:ItemStack});
ItemStack.prototype.getDamageValue = procHacker.js("ItemStackBase::getDamageValue", int32_t, {this:ItemStack});
ItemStack.prototype.isWearableItem = procHacker.js("ItemStackBase::isWearableItem", bool_t, {this:ItemStack});
ItemStack.prototype.getAttackDamage = procHacker.js("ItemStackBase::getAttackDamage", int32_t, {this:ItemStack});

PlayerInventory.prototype.addItem = procHacker.js("PlayerInventory::add", bool_t, {this:PlayerInventory}, ItemStack, bool_t);
PlayerInventory.prototype.clearSlot = procHacker.js("PlayerInventory::clearSlot", void_t, {this:PlayerInventory}, int32_t, int32_t);
PlayerInventory.prototype.getContainerSize = procHacker.js("PlayerInventory::getContainerSize", int32_t, {this:PlayerInventory}, int32_t);
PlayerInventory.prototype.getFirstEmptySlot = procHacker.js("PlayerInventory::getFirstEmptySlot", int32_t, {this:PlayerInventory});
PlayerInventory.prototype.getHotbarSize = procHacker.js("PlayerInventory::getHotbarSize", int32_t, {this:PlayerInventory});
PlayerInventory.prototype.getItem = procHacker.js("PlayerInventory::getItem", ItemStack, {this:PlayerInventory}, int32_t, int32_t);
PlayerInventory.prototype.getSelectedItem = procHacker.js("PlayerInventory::getSelectedItem", ItemStack, {this:PlayerInventory});
PlayerInventory.prototype.getSlots = procHacker.js("PlayerInventory::getSlots", CxxVector.make(ItemStack.ref()), {this:PlayerInventory, structureReturn:true});
PlayerInventory.prototype.selectSlot = procHacker.js("PlayerInventory::selectSlot", void_t, {this:PlayerInventory}, int32_t, int32_t);
PlayerInventory.prototype.setItem = procHacker.js("PlayerInventory::setItem", void_t, {this:PlayerInventory}, int32_t, ItemStack, int32_t, bool_t);
PlayerInventory.prototype.setSelectedItem = procHacker.js("PlayerInventory::setSelectedItem", void_t, {this:PlayerInventory}, ItemStack);
PlayerInventory.prototype.swapSlots = procHacker.js("PlayerInventory::swapSlots", void_t, {this:PlayerInventory}, int32_t, int32_t);

// block.ts
BlockLegacy.prototype.getCommandName = procHacker.js("BlockLegacy::getCommandName", CxxString, {this:BlockLegacy});
BlockLegacy.prototype.getCreativeCategory = procHacker.js("BlockLegacy::getCreativeCategory", int32_t, {this:Block});
BlockLegacy.prototype.setDestroyTime = procHacker.js("BlockLegacy::setDestroyTime", void_t, {this:Block}, float32_t);
Block.abstract({
    blockLegacy: [BlockLegacy.ref(), 0x10],
});
(Block.prototype as any)._getName = procHacker.js("Block::getName", HashedString, {this:Block});
BlockSource.prototype.getBlock = procHacker.js("BlockSource::getBlock", Block, {this:BlockSource}, BlockPos);
