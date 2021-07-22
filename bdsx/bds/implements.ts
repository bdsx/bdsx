import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { BlockPos, Vec3 } from "../bds/blockpos";
import { LoopbackPacketSender } from "../bds/loopbacksender";
import { AllocatedPointer, StaticPointer, VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { EnchantUtils } from "./enchants";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, NativeType, uint32_t, uint8_t, void_t } from "../nativetype";
import { CxxStringWrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { Abilities, Ability } from "./abilities";
import { Actor, ActorRuntimeID, ActorUniqueID, DimensionId, ItemActor } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Block, BlockLegacy, BlockSource } from "./block";
import { MinecraftCommands } from "./command";
import { Certificate, ConnectionRequest } from "./connreq";
import { Dimension } from "./dimension";
import { MobEffect, MobEffectInstance } from "./effects";
import { GameMode } from "./gamemode";
import { HashedString } from "./hashedstring";
import { ComponentItem, InventoryAction, InventorySource, InventoryTransaction, InventoryTransactionItemGroup, Item, ItemStack, PlayerInventory } from "./inventory";
import { AdventureSettings, Level, ServerLevel, TagRegistry } from "./level";
import { CompoundTag } from "./nbt";
import { networkHandler, NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { ExtendedStreamReadResult, Packet } from "./packet";
import { AdventureSettingsPacket, AttributeData, PlayerListPacket, TextPacket, UpdateAttributesPacket, UpdateBlockPacket } from "./packets";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { Player, PlayerListEntry, ServerPlayer } from "./player";
import { proc, procHacker } from "./proc";
import { RakNetInstance } from "./raknetinstance";
import { DisplayObjective, Objective, ObjectiveCriteria, Scoreboard, ScoreboardId, ScoreboardIdentityRef, ScoreInfo } from "./scoreboard";
import { DedicatedServer, Minecraft, Minecraft$Something, ScriptFramework, serverInstance, ServerInstance, VanilaGameModuleServer, VanilaServerGameplayEventListener } from "./server";
import { SerializedSkin } from "./skin";
import { BinaryStream } from "./stream";

// avoiding circular dependency

// level.ts
Level.prototype.createDimension = procHacker.js("Level::createDimension", Dimension, {this:Level}, int32_t);
Level.prototype.destroyBlock = procHacker.js("Level::destroyBlock", bool_t, {this:Level}, BlockSource, BlockPos, bool_t);
Level.prototype.fetchEntity = procHacker.js("Level::fetchEntity", Actor, {this:Level}, bin64_t, bool_t);
Level.prototype.getActivePlayerCount = procHacker.js("Level::getActivePlayerCount", int32_t, {this:Level});
Level.prototype.getAdventureSettings = procHacker.js("Level::getAdventureSettings", AdventureSettings, {this:Level});
Level.prototype.getScoreboard = procHacker.js("Level::getScoreboard", Scoreboard, {this:Level});
Level.prototype.getTagRegistry = procHacker.js("Level::getTagRegistry", TagRegistry, {this:Level});

Level.abstract({
    vftable: VoidPointer,
    players:[CxxVector.make(ServerPlayer.ref()), 0x58],
});

ServerLevel.abstract({
    packetSender:[LoopbackPacketSender.ref(), 0x830],
    actors:[CxxVector.make(Actor.ref()), 0x1590],
});
ServerLevel.prototype.setCommandsEnabled = procHacker.js("ServerLevel::setCommandsEnabled", void_t, {this:ServerLevel}, bool_t);
ServerLevel.prototype.setShouldSendSleepMessage = procHacker.js("ServerLevel::setShouldSendSleepMessage", void_t, {this:ServerLevel}, bool_t);

// actor.ts
const actorMaps = new Map<string, Actor>();
const ServerPlayer_vftable = proc["ServerPlayer::`vftable'"];
const ItemActor_vftable = proc["ItemActor::`vftable'"];
Actor.prototype.isPlayer = function() {
    return this.vftable.equals(ServerPlayer_vftable);
};
Actor.prototype.isItem = function() {
    return this.vftable.equals(ItemActor_vftable);
};
(Actor as any)._singletoning = function(ptr:StaticPointer|null):Actor|null {
    if (ptr === null) return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMaps.get(binptr);
    if (actor) return actor;
    if (ptr.getPointer().equals(ServerPlayer_vftable)) {
        actor = ptr.as(ServerPlayer);
    } else if (ptr.getPointer().equals(ItemActor_vftable)) {
        actor = ptr.as(ItemActor);
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
    identifier: [CxxString as NativeType<EntityId>, 0x458], // minecraft:player
});
Actor.prototype.getAttributes = procHacker.js('Actor::getAttributes', BaseAttributeMap.ref(), {this:Actor, structureReturn: true});
Actor.prototype.getName = procHacker.js("Actor::getNameTag", CxxString, {this:Actor});
Actor.prototype.setName = procHacker.js("Actor::setNameTag", void_t, {this:Actor}, CxxString);
Actor.prototype.addTag = procHacker.js("Actor::addTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.hasTag = procHacker.js("Actor::hasTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.removeTag = procHacker.js("Actor::removeTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.getPosition = procHacker.js("Actor::getPos", Vec3, {this:Actor});
Actor.prototype.getScoreTag = procHacker.js("Actor::getScoreTag", CxxString, {this:Actor});
Actor.prototype.setScoreTag = procHacker.js("Actor::setScoreTag", void_t, {this:Actor}, CxxString);
Actor.prototype.getRegion = procHacker.js("Actor::getRegionConst", BlockSource, {this:Actor});
Actor.prototype.getUniqueIdPointer = procHacker.js("Actor::getUniqueID", StaticPointer, {this:Actor});
Actor.prototype.getEntityTypeId = makefunc.js([0x520], int32_t, {this:Actor}); // ActorType getEntityTypeId()
Actor.prototype.getRuntimeID = procHacker.js('Actor::getRuntimeID', ActorRuntimeID, {this:Actor, structureReturn: true});
Actor.prototype.getDimension = procHacker.js('Actor::getDimension', Dimension, {this:Actor});
Actor.prototype.getDimensionId = procHacker.js('Actor::getDimensionId', int32_t, {this:Actor, structureReturn: true}); // DimensionId* getDimensionId(DimensionId*)
Actor.prototype.getCommandPermissionLevel = procHacker.js('Actor::getCommandPermissionLevel', int32_t, {this:Actor});
const TeleportCommand$computeTarget = procHacker.js("TeleportCommand::computeTarget", void_t, null, StaticPointer, Actor, Vec3, Vec3, int32_t);
const TeleportCommand$applyTarget = procHacker.js("TeleportCommand::applyTarget", void_t, null, Actor, StaticPointer);
Actor.prototype.teleport = function(pos:Vec3, dimensionId:DimensionId=DimensionId.Overworld) {
    const alloc = new AllocatedPointer(0x80);
    TeleportCommand$computeTarget(alloc, this, pos, new Vec3(true), dimensionId);
    TeleportCommand$applyTarget(this, alloc);
};
Actor.prototype.getArmor = procHacker.js('Actor::getArmor', ItemStack, {this:Actor}, int32_t);

Actor.prototype.setSneaking = procHacker.js("Actor::setSneaking", void_t, {this:Actor}, bool_t);
Actor.prototype.getHealth = procHacker.js("Actor::getHealth", int32_t, {this:Actor});
Actor.prototype.getMaxHealth = procHacker.js("Actor::getMaxHealth", int32_t, {this:Actor});

Actor.fromUniqueIdBin = function(bin) {
    return serverInstance.minecraft.getLevel().fetchEntity(bin, true);
};

Actor.prototype.addEffect = procHacker.js("?addEffect@Actor@@QEAAXAEBVMobEffectInstance@@@Z", void_t, {this:Actor}, MobEffectInstance);
Actor.prototype.removeEffect = procHacker.js("?removeEffect@Actor@@QEAAXH@Z", void_t, {this:Actor}, int32_t);
(Actor.prototype as any)._hasEffect = procHacker.js("Actor::hasEffect", bool_t, {this:Actor}, MobEffect);
(Actor.prototype as any)._getEffect = procHacker.js("Actor::getEffect", MobEffectInstance, {this:Actor}, MobEffect);

ItemActor.abstract({
    itemStack: [ItemStack, 1824],
});

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
ServerPlayer.prototype.setAttribute = function(this:Actor, id:AttributeId, value:number):AttributeInstance|null {
    const attr = Actor.prototype.setAttribute.call(this, id, value);
    if (attr === null) return null;
    const packet = UpdateAttributesPacket.create();
    packet.actorId = this.getRuntimeID();
    const data = AttributeData.construct();
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
    return attr;
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
Player.abstract({
    abilities:[Abilities, 0x948],
    deviceId:[CxxString, 0x20A0],
});
(Player.prototype as any)._setName = procHacker.js("Player::setName", void_t, {this: Player}, CxxString);
const PlayerListPacket$emplace = procHacker.js("PlayerListPacket::emplace", void_t, null, PlayerListPacket, PlayerListEntry);
Player.prototype.setName = function(name:string):void {
    (this as any)._setName(name);
    const entry = PlayerListEntry.create(this);
    const pk = PlayerListPacket.create();
    PlayerListPacket$emplace(pk, entry);
    for (const player of serverInstance.minecraft.getLevel().players) {
        player.sendNetworkPacket(pk);
    }
    entry.destruct();
    pk.dispose();
};
Player.prototype.changeDimension = procHacker.js("ServerPlayer::changeDimension", void_t, {this:Player}, int32_t, bool_t);
Player.prototype.teleportTo = procHacker.js("Player::teleportTo", void_t, {this:Player}, Vec3, bool_t, int32_t, int32_t, bin64_t);
Player.prototype.getGameType = procHacker.js("Player::getPlayerGameType", int32_t, {this:Player});
Player.prototype.getInventory = procHacker.js("Player::getSupplies", PlayerInventory, {this:Player});
Player.prototype.getMainhandSlot = procHacker.js("Player::getCarriedItem", ItemStack, {this:Player});
Player.prototype.getOffhandSlot = procHacker.js("Actor::getOffhandSlot", ItemStack, {this:Player});
Player.prototype.getCommandPermissionLevel = procHacker.js('Player::getCommandPermissionLevel', int32_t, {this:Actor});
Player.prototype.getPermissionLevel = procHacker.js("Player::getPlayerPermissionLevel", int32_t, {this:Player});
Player.prototype.getSkin = procHacker.js("Player::getSkin", SerializedSkin, {this:Player});
Player.prototype.startCooldown = procHacker.js("Player::startCooldown", void_t, {this:Player}, Item);
Player.prototype.setGameType = procHacker.js("ServerPlayer::setPlayerGameType", void_t, {this:Player}, int32_t);
Player.prototype.setSize = procHacker.js("Player::setSize", void_t, {this:Player}, float32_t, float32_t);
Player.prototype.setSleeping = procHacker.js("Player::setSleeping", void_t, {this:Player}, bool_t);
Player.prototype.isSleeping = procHacker.js("Player::isSleeping", bool_t, {this:Player});
Player.prototype.isJumping = procHacker.js("Player::isJumping", bool_t, {this:Player});
const AdventureSettingsPacket$AdventureSettingsPacket = procHacker.js("AdventureSettingsPacket::AdventureSettingsPacket", void_t, null, AdventureSettingsPacket, AdventureSettings, Abilities, ActorUniqueID, bool_t);
Player.prototype.syncAbilties = function() {
    const pk = AdventureSettingsPacket.create();
    AdventureSettingsPacket$AdventureSettingsPacket(pk, serverInstance.minecraft.getLevel().getAdventureSettings(), this.abilities, this.getUniqueIdBin(), false);
    this.sendPacket(pk);
    pk.dispose();
};

ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, 0xa98]
});
(ServerPlayer.prototype as any)._sendInventory = procHacker.js("ServerPlayer::sendInventory", void_t, {this:ServerPlayer}, bool_t);
ServerPlayer.prototype.knockback = procHacker.js("ServerPlayer::knockback", void_t, {this: ServerPlayer}, Actor, int32_t, float32_t, float32_t, float32_t, float32_t, float32_t);
ServerPlayer.prototype.openInventory = procHacker.js("ServerPlayer::openInventory", void_t, {this: ServerPlayer});
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", void_t, {this: ServerPlayer}, VoidPointer);
ServerPlayer.prototype.getNetworkIdentifier = function () {
    return this.networkIdentifier;
};
const CxxStringVector = CxxVector.make(CxxString);
const TextPacket$createTranslated = procHacker.js("TextPacket::createTranslated", TextPacket, null, TextPacket, CxxString, CxxStringVector);
ServerPlayer.prototype.sendTranslatedMessage = function(message:CxxString, params:string[] = []) {
    const pk = TextPacket.create();
    const _params = new CxxStringVector(true);
    _params.construct();
    _params.push(...params);
    TextPacket$createTranslated(pk, message, _params);
    this.sendNetworkPacket(pk);
    _params.destruct();
    pk.dispose();
};

const PlayerListEntry$PlayerListEntry = procHacker.js("??0PlayerListEntry@@QEAA@AEBVPlayer@@@Z", PlayerListEntry, null, PlayerListEntry, Player);
PlayerListEntry.create = function(player:Player):PlayerListEntry {
    const entry = new PlayerListEntry(true);
    entry.construct();
    return PlayerListEntry$PlayerListEntry(entry, player);
};

// networkidentifier.ts
NetworkIdentifier.prototype.getActor = function():ServerPlayer|null {
    return ServerNetworkHandler$_getServerPlayer(serverInstance.minecraft.getServerNetworkHandler(), this, 0);
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

const ServerNetworkHandler$_getServerPlayer = procHacker.js("ServerNetworkHandler::_getServerPlayer", ServerPlayer, null, ServerNetworkHandler, NetworkIdentifier, int32_t);
(ServerNetworkHandler.prototype as any)._disconnectClient = procHacker.js("ServerNetworkHandler::disconnectClient", void_t, {this: ServerNetworkHandler}, NetworkIdentifier, int32_t, CxxString, int32_t);
ServerNetworkHandler.prototype.allowIncomingConnections = procHacker.js("ServerNetworkHandler::allowIncomingConnections", void_t, {this:ServerNetworkHandler}, CxxString, bool_t);
ServerNetworkHandler.prototype.updateServerAnnouncement = procHacker.js("ServerNetworkHandler::updateServerAnnouncement", void_t, {this:ServerNetworkHandler});
ServerNetworkHandler.prototype.setMaxNumPlayers = procHacker.js("ServerNetworkHandler::setMaxNumPlayers", void_t, {this:ServerNetworkHandler}, int32_t);

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
    level:ServerLevel.ref(),
});
Minecraft.abstract({
    vftable:VoidPointer,
    vanillaGameModuleServer:[SharedPtr, 0x28], // VanilaGameModuleServer
    server:DedicatedServer.ref(),
});
Minecraft.prototype.getLevel = procHacker.js("Minecraft::getLevel", Level, {this:Minecraft});
Minecraft.prototype.getNetworkHandler = procHacker.js("Minecraft::getNetworkHandler", NetworkHandler, {this:Minecraft});
Minecraft.prototype.getServerNetworkHandler = procHacker.js("Minecraft::getServerNetworkHandler", ServerNetworkHandler, {this:Minecraft});
Minecraft.prototype.getCommands = procHacker.js("Minecraft::getCommands", MinecraftCommands, {this:Minecraft});
ScriptFramework.abstract({
    vftable:VoidPointer,
});
ServerInstance.abstract({
    vftable:VoidPointer,
    server:[DedicatedServer.ref(), 0x98],
    minecraft:[Minecraft.ref(), 0xa0],
    networkHandler:[NetworkHandler.ref(), 0xa8],
});
(ServerInstance.prototype as any)._disconnectAllClients = procHacker.js("ServerInstance::disconnectAllClientsWithMessage", void_t, {this:ServerInstance}, CxxString);

// gamemode.ts
GameMode.define({
    actor: [Actor.ref(), 8]
});

// inventory.ts
Item.prototype.allowOffhand = procHacker.js("Item::allowOffhand", bool_t, {this:Item});
Item.prototype.isDamageable = procHacker.js("Item::isDamageable", bool_t, {this:Item});
Item.prototype.isFood = procHacker.js("Item::isFood", bool_t, {this:Item});
Item.prototype.setAllowOffhand = procHacker.js("Item::setAllowOffhand", void_t, {this:Item}, bool_t);
Item.prototype.getCommandNames = procHacker.js("Item::getCommandNames", CxxVector.make(CxxString), {this:Item, structureReturn: true});
Item.prototype.getCreativeCategory = procHacker.js("Item::getCreativeCategory", int32_t, {this:Item});

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
const CommandUtils$createItemStack = procHacker.js("CommandUtils::createItemStack", ItemStack, null, ItemStack, CxxString, int32_t, int32_t);
ItemStack.create = function (itemName: CxxString, amount: int32_t = 1, data: int32_t = 0):ItemStack {
    const itemStack = new ItemStack(true);
    itemStack.construct();
    CommandUtils$createItemStack(itemStack, itemName, amount, data);
    return itemStack;
};

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

InventoryTransaction.prototype.addItemToContent = procHacker.js("InventoryTransaction::addItemToContent", void_t, {this:InventoryTransaction}, ItemStack, int32_t);
(InventoryTransaction.prototype as any)._getActions = procHacker.js("InventoryTransaction::getActions", CxxVector.make(InventoryAction), {this:InventoryTransaction}, InventorySource);
InventoryTransactionItemGroup.prototype.getItemStack = procHacker.js("InventoryTransactionItemGroup::getItemInstance", ItemStack, {this:InventoryTransaction, structureReturn:true});

// block.ts
BlockLegacy.prototype.getCommandNames = procHacker.js("BlockLegacy::getCommandNames", CxxVector.make(CxxString), {this:Item, structureReturn: true});
BlockLegacy.prototype.getCreativeCategory = procHacker.js("BlockLegacy::getCreativeCategory", int32_t, {this:Block});
BlockLegacy.prototype.setDestroyTime = procHacker.js("BlockLegacy::setDestroyTime", void_t, {this:Block}, float32_t);
Block.abstract({
    blockLegacy: [BlockLegacy.ref(), 0x10],
});
(Block.prototype as any)._getName = procHacker.js("Block::getName", HashedString, {this:Block});
Block.create = function(blockName:string, data:number = 0):Block|null {
    const itemStack = ItemStack.create(blockName, 1, data);
    if (itemStack.isBlock()) {
        const block = itemStack.block;
        itemStack.destruct();
        return block;
    }
    itemStack.destruct();
    return null;
};
(BlockSource.prototype as any)._setBlock = procHacker.js("?setBlock@BlockSource@@QEAA_NHHHAEBVBlock@@H@Z", bool_t, {this:BlockSource}, int32_t, int32_t, int32_t, Block, int32_t);
BlockSource.prototype.getBlock = procHacker.js("BlockSource::getBlock", Block, {this:BlockSource}, BlockPos);
const UpdateBlockPacket$UpdateBlockPacket = procHacker.js("UpdateBlockPacket::UpdateBlockPacket", void_t, null, UpdateBlockPacket, BlockPos, uint32_t, Block, uint8_t);
BlockSource.prototype.setBlock = function(blockPos:BlockPos, block:Block):boolean {
    const retval = (this as any)._setBlock(blockPos.x, blockPos.y, blockPos.z, block, 0);
    const pk = UpdateBlockPacket.create();
    UpdateBlockPacket$UpdateBlockPacket(pk, blockPos, 0, block, 3);
    for (const player of serverInstance.minecraft.getLevel().players) {
        player.sendNetworkPacket(pk);
    }
    pk.dispose();
    return retval;
};

// abilties.ts
Abilities.prototype.getCommandPermissionLevel = procHacker.js("Abilities::getCommandPermissions", int32_t, {this:Abilities});
Abilities.prototype.getPlayerPermissionLevel = procHacker.js("Abilities::getPlayerPermissions", int32_t, {this:Abilities});
Abilities.prototype.setCommandPermissionLevel = procHacker.js("Abilities::setCommandPermissions", void_t, {this:Abilities}, int32_t);
Abilities.prototype.setPlayerPermissionLevel = procHacker.js("Abilities::setPlayerPermissions", void_t, {this:Abilities}, int32_t);
Abilities.prototype.getAbility = procHacker.js("Abilities::getAbility", Ability, {this:Abilities}, uint8_t);
(Abilities.prototype as any)._setAbility = procHacker.js("Abilities::setAbility", void_t, {this:Abilities}, uint8_t, bool_t);

Ability.abstract({
    type: int32_t,
    value: Ability.Value,
    options: int32_t,
});
Ability.prototype.getBool = procHacker.js("Ability::getBool", bool_t, {this:Ability});
Ability.prototype.getFloat = procHacker.js("Ability::getFloat", float32_t, {this:Ability});
Ability.prototype.setBool = procHacker.js("Ability::setBool", void_t, {this:Ability}, bool_t);

// scoreboard.ts
(Scoreboard.prototype as any)._getObjectiveNames = procHacker.js("Scoreboard::getObjectiveNames", CxxVector.make(CxxString), {this:Scoreboard, structureReturn: true});
(Scoreboard.prototype as any)._getObjectives = procHacker.js("Scoreboard::getObjectives", CxxVector.make(Objective.ref()), {this:Scoreboard, structureReturn: true});
Scoreboard.prototype.clearDisplayObjective = procHacker.js("ServerScoreboard::clearDisplayObjective", Objective, {this:Scoreboard}, CxxString);
Scoreboard.prototype.setDisplayObjective = procHacker.js("ServerScoreboard::setDisplayObjective", DisplayObjective, {this:Scoreboard}, CxxString, Objective, uint8_t);
Scoreboard.prototype.addObjective = procHacker.js("Scoreboard::addObjective", Objective, {this:Scoreboard}, CxxString, CxxString, ObjectiveCriteria);
Scoreboard.prototype.getCriteria = procHacker.js("Scoreboard::getCriteria", ObjectiveCriteria, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getDisplayObjective = procHacker.js("Scoreboard::getDisplayObjective", DisplayObjective, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getObjective = procHacker.js("Scoreboard::getObjective", Objective, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getActorScoreboardId = procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVActor@@@Z", ScoreboardId, {this:Scoreboard}, Actor);
Scoreboard.prototype.getFakePlayerScoreboardId = procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", ScoreboardId, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getPlayerScoreboardId = procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVPlayer@@@Z", ScoreboardId, {this:Scoreboard}, Player);
Scoreboard.prototype.getScoreboardIdentityRef = procHacker.js("Scoreboard::getScoreboardIdentityRef", ScoreboardIdentityRef, {this:Scoreboard, structureReturn:true}, ScoreboardId);
Scoreboard.prototype.removeObjective = procHacker.js("Scoreboard::removeObjective", bool_t, {this:Scoreboard}, Objective);
Scoreboard.prototype.resetPlayerScore = procHacker.js("?resetPlayerScore@Scoreboard@@QEAAXAEBUScoreboardId@@AEAVObjective@@@Z", void_t, {this:Scoreboard}, ScoreboardId, Objective);
//Scoreboard.prototype.sync = procHacker.js("ServerScoreboard::onScoreChanged", void_t, {this:Scoreboard}, ScoreboardId, Objective);
//(Scoreboard.prototype as any)._modifyPlayerScore = procHacker.js("Scoreboard::modifyPlayerScore", int32_t, {this:Scoreboard}, bool_t, ScoreboardId, Objective, int32_t, int8_t);

(Objective.prototype as any)._getPlayers = procHacker.js("Objective::getPlayers", CxxVector.make(ScoreboardId.ref()), {this:Objective, structureReturn: true});
(Objective.prototype as any)._getPlayerScore = procHacker.js("Objective::getPlayerScore", ScoreInfo, {this:Objective}, ScoreInfo, ScoreboardId);

//ScoreboardIdentityRef.prototype.modifyScoreInObjective = procHacker.js("ScoreboardIdentityRef::modifyScoreInObjective", bool_t, {this:ScoreboardIdentityRef}, int32_t, Objective, int32_t, int8_t);

// effects.ts
MobEffect.create = procHacker.js("MobEffect::getById", MobEffect, null, int32_t);
(MobEffectInstance.prototype as any)._create = procHacker.js("??0MobEffectInstance@@QEAA@IHH_N00@Z", void_t, {this:MobEffectInstance}, uint32_t, int32_t, int32_t, bool_t, bool_t, bool_t);

// enchants.ts
EnchantUtils.applyEnchant = procHacker.js("?applyEnchant@EnchantUtils@@SA_NAEAVItemStackBase@@W4Type@Enchant@@H_N@Z", bool_t, null, ItemStack, int16_t, int32_t, bool_t);
EnchantUtils.getEnchantLevel = procHacker.js("EnchantUtils::getEnchantLevel", int32_t, null, int16_t, ItemStack);
EnchantUtils.hasEnchant = procHacker.js("EnchantUtils::hasEnchant", bool_t, null, int16_t, ItemStack);
