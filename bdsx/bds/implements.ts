import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { BlockPos, Vec2, Vec3 } from "../bds/blockpos";
import { bin } from "../bin";
import { AllocatedPointer, StaticPointer, VoidPointer } from "../core";
import { CxxVector, CxxVectorToArray } from "../cxxvector";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { bin64_t, bool_t, CxxString, CxxStringWith8Bytes, float32_t, int16_t, int32_t, int64_as_float_t, int8_t, uint16_t, uint32_t, uint8_t, void_t } from "../nativetype";
import { CxxStringWrapper, Wrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { Abilities, Ability } from "./abilities";
import { Actor, ActorDamageSource, ActorDefinitionIdentifier, ActorRuntimeID, ActorUniqueID, DimensionId, EntityContext, EntityRefTraits, ItemActor, OwnerStorageEntity } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Block, BlockLegacy, BlockSource } from "./block";
import { MinecraftCommands } from "./command";
import { CommandName } from "./commandname";
import { OnHitSubcomponent } from "./components";
import { Certificate, ConnectionRequest, JsonValue } from "./connreq";
import { Dimension } from "./dimension";
import { MobEffect, MobEffectInstance } from "./effects";
import { EnchantUtils, ItemEnchants } from "./enchants";
import { GameMode } from "./gamemode";
import { GameRule, GameRuleId, GameRules } from "./gamerules";
import { HashedString } from "./hashedstring";
import { ComponentItem, InventoryAction, InventorySource, InventoryTransaction, InventoryTransactionItemGroup, Item, ItemStack, NetworkItemStackDescriptor, PlayerInventory } from "./inventory";
import { ActorFactory, AdventureSettings, BlockPalette, Level, LevelData, ServerLevel, TagRegistry } from "./level";
import { CompoundTag } from "./nbt";
import { networkHandler, NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { ExtendedStreamReadResult, Packet } from "./packet";
import { AdventureSettingsPacket, AttributeData, GameRulesChangedPacket, PlayerListPacket, UpdateAttributesPacket, UpdateBlockPacket } from "./packets";
import { BatchedNetworkPeer } from "./peer";
import { Player, PlayerListEntry, ServerPlayer } from "./player";
import { proc, procHacker } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";
import { DisplayObjective, IdentityDefinition, Objective, ObjectiveCriteria, Scoreboard, ScoreboardId, ScoreboardIdentityRef, ScoreInfo } from "./scoreboard";
import { DedicatedServer, Minecraft, ScriptFramework, serverInstance, ServerInstance, VanilaGameModuleServer, VanilaServerGameplayEventListener } from "./server";
import { SerializedSkin } from "./skin";
import { BinaryStream } from "./stream";

// avoiding circular dependency

// level.ts
Level.prototype.createDimension = procHacker.js("Level::createDimension", Dimension, {this:Level}, int32_t);
Level.prototype.destroyBlock = procHacker.js("Level::destroyBlock", bool_t, {this:Level}, BlockSource, BlockPos, bool_t);
Level.prototype.fetchEntity = procHacker.js("Level::fetchEntity", Actor, {this:Level}, bin64_t, bool_t);
Level.prototype.getActivePlayerCount = procHacker.js("Level::getActivePlayerCount", int32_t, {this:Level});
Level.prototype.getActorFactory = procHacker.js("Level::getActorFactory", ActorFactory, {this:Level});
Level.prototype.getAdventureSettings = procHacker.js("Level::getAdventureSettings", AdventureSettings, {this:Level});
Level.prototype.getBlockPalette = procHacker.js("Level::getBlockPalette", BlockPalette, {this:Level});
Level.prototype.getDimension = procHacker.js("Level::getDimension", Dimension, {this:Level}, int32_t);
Level.prototype.getLevelData = procHacker.js("Level::getLevelData", LevelData.ref(), {this:Level});
Level.prototype.getGameRules = procHacker.js("Level::getGameRules", GameRules, {this:Level});
Level.prototype.getScoreboard = procHacker.js("Level::getScoreboard", Scoreboard, {this:Level});
Level.prototype.getSeed = procHacker.js("Level::getSeed", uint32_t, {this:Level});
Level.prototype.getTagRegistry = procHacker.js("Level::getTagRegistry", TagRegistry, {this:Level});
Level.prototype.hasCommandsEnabled = procHacker.js("Level::hasCommandsEnabled", bool_t, {this:Level});
Level.prototype.setCommandsEnabled = procHacker.js("ServerLevel::setCommandsEnabled", void_t, {this:ServerLevel}, bool_t);
Level.prototype.setShouldSendSleepMessage = procHacker.js("ServerLevel::setShouldSendSleepMessage", void_t, {this:ServerLevel}, bool_t);
const GameRules$createAllGameRulesPacket = procHacker.js("GameRules::createAllGameRulesPacket", Wrapper.make(GameRulesChangedPacket.ref()), {this:GameRules}, Wrapper.make(GameRulesChangedPacket.ref()));
Level.prototype.syncGameRules = function() {
    const wrapper = Wrapper.make(GameRulesChangedPacket.ref()).construct();
    wrapper.value = GameRulesChangedPacket.create();
    GameRules$createAllGameRulesPacket.call(this.getGameRules(), wrapper);
    for (const player of serverInstance.getPlayers()) {
        player.sendNetworkPacket(wrapper.value);
    }
    wrapper.destruct();
};
Level.prototype.getPlayers = function() {
    const out:ServerPlayer[] = [];
    for (const user of this.getUsers()) {
        const entity = Actor.tryGetFromEntity(user.context._getStackRef());
        if (!(entity instanceof ServerPlayer)) continue;
        out.push(entity);
    }
    return out;
};
Level.prototype.getUsers = procHacker.js('Level::getUsers', CxxVector.make(EntityRefTraits), {this:Level});

Level.abstract({
    vftable: VoidPointer,
});

ServerLevel.abstract({});

LevelData.prototype.getGameDifficulty = procHacker.js("LevelData::getGameDifficulty", uint32_t, {this:LevelData});
LevelData.prototype.setGameDifficulty = procHacker.js("LevelData::setGameDifficulty", void_t, {this:LevelData}, uint32_t);

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
});
const CommandUtils$spawnEntityAt = procHacker.js("CommandUtils::spawnEntityAt", Actor, null, BlockSource, Vec3, ActorDefinitionIdentifier, StaticPointer, VoidPointer);
Actor.summonAt = function(region: BlockSource, pos: Vec3, type: ActorDefinitionIdentifier, id:ActorUniqueID|int64_as_float_t, summoner?:Actor):Actor {
    const ptr = new AllocatedPointer(8);
    switch (typeof id) {
    case "number":
        ptr.setInt64WithFloat(id);
        break;
    case "string":
        ptr.setBin(id);
        break;
    }
    return CommandUtils$spawnEntityAt(region, pos, type, ptr, summoner ?? new VoidPointer());
};
(Actor.prototype as any)._getArmorValue = procHacker.js("Mob::getArmorValue", int32_t, {this:Actor});
Actor.prototype.getAttributes = procHacker.js('Actor::getAttributes', BaseAttributeMap.ref(), {this:Actor, structureReturn: true});
Actor.prototype.getName = procHacker.js("Actor::getNameTag", CxxString, {this:Actor});
Actor.prototype.setName = procHacker.js("Actor::setNameTag", void_t, {this:Actor}, CxxString);
Actor.prototype.addTag = procHacker.js("Actor::addTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.hasTag = procHacker.js("Actor::hasTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.removeTag = procHacker.js("Actor::removeTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.getPosition = procHacker.js("Actor::getPos", Vec3, {this:Actor});
Actor.prototype.getRotation = procHacker.js("Actor::getRotation", Vec2, {this:Actor, structureReturn: true});
Actor.prototype.getScoreTag = procHacker.js("Actor::getScoreTag", CxxString, {this:Actor});
Actor.prototype.setScoreTag = procHacker.js("Actor::setScoreTag", void_t, {this:Actor}, CxxString);
Actor.prototype.getRegion = procHacker.js("Actor::getRegionConst", BlockSource, {this:Actor});
Actor.prototype.getUniqueIdPointer = procHacker.js("Actor::getUniqueID", StaticPointer, {this:Actor});
Actor.prototype.getEntityTypeId = makefunc.js([0x558], int32_t, {this:Actor}); // ActorType getEntityTypeId()
Actor.prototype.getRuntimeID = procHacker.js('Actor::getRuntimeID', ActorRuntimeID, {this:Actor, structureReturn: true});
Actor.prototype.getDimension = procHacker.js('Actor::getDimension', Dimension, {this:Actor});
Actor.prototype.getDimensionId = procHacker.js('Actor::getDimensionId', int32_t, {this:Actor, structureReturn: true});
Actor.prototype.getActorIdentifier = procHacker.js('Actor::getActorIdentifier', ActorDefinitionIdentifier, {this:Actor});
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

Actor.prototype.setStatusFlag = procHacker.js("?setStatusFlag@Actor@@QEAA_NW4ActorFlags@@_N@Z", bool_t, {this:Actor}, int32_t, bool_t);
Actor.prototype.getStatusFlag = procHacker.js("Actor::getStatusFlag", bool_t, {this:Actor}, int32_t);

Actor.fromUniqueIdBin = function(bin, getRemovedActor = true) {
    return serverInstance.minecraft.getLevel().fetchEntity(bin, getRemovedActor);
};

Actor.prototype.addEffect = procHacker.js("?addEffect@Actor@@QEAAXAEBVMobEffectInstance@@@Z", void_t, {this:Actor}, MobEffectInstance);
Actor.prototype.removeEffect = procHacker.js("?removeEffect@Actor@@QEAAXH@Z", void_t, {this:Actor}, int32_t);
(Actor.prototype as any)._hasEffect = procHacker.js("Actor::hasEffect", bool_t, {this:Actor}, MobEffect);
(Actor.prototype as any)._getEffect = procHacker.js("Actor::getEffect", MobEffectInstance, {this:Actor}, MobEffect);

OwnerStorageEntity.prototype._getStackRef = procHacker.js('OwnerStorageEntity::_getStackRef', EntityContext, {this:OwnerStorageEntity});
Actor.tryGetFromEntity = procHacker.js('Actor::tryGetFromEntity', Actor, null, EntityContext);

const ActorDefinitionIdentifier$ActorDefinitionIdentifier = procHacker.js("??0ActorDefinitionIdentifier@@QEAA@W4ActorType@@@Z", void_t, null, ActorDefinitionIdentifier, int32_t);
ActorDefinitionIdentifier.create = function(type:number):ActorDefinitionIdentifier {
    const identifier = ActorDefinitionIdentifier.construct();
    ActorDefinitionIdentifier$ActorDefinitionIdentifier(identifier, type);
    return identifier;
};

ActorDamageSource.prototype.getDamagingEntityUniqueID = procHacker.js("ActorDamageSource::getDamagingEntityUniqueID", ActorUniqueID, {this:ActorDamageSource, structureReturn:true});

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
    abilities:[Abilities, 0x928],
    respawnPosition:[BlockPos, 0x1D9C],
    respawnDimension:[uint8_t, 0x76A],
    deviceId:[CxxString, 0x20A0],
});
(Player.prototype as any)._setName = procHacker.js("Player::setName", void_t, {this: Player}, CxxString);
const PlayerListPacket$emplace = procHacker.js("PlayerListPacket::emplace", void_t, null, PlayerListPacket, PlayerListEntry);
Player.prototype.setName = function(name:string):void {
    (this as any)._setName(name);
    const entry = PlayerListEntry.create(this);
    const pk = PlayerListPacket.create();
    PlayerListPacket$emplace(pk, entry);
    for (const player of serverInstance.getPlayers()) {
        player.sendNetworkPacket(pk);
    }
    entry.destruct();
    pk.dispose();
};
Player.prototype.addItem = procHacker.js("Player::add", bool_t, {this:Player}, ItemStack);
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
Player.prototype.getCertificate = procHacker.js("Player::getCertificate", Certificate, {this:Player});

ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, 0xa78],
});
(ServerPlayer.prototype as any)._sendInventory = procHacker.js("ServerPlayer::sendInventory", void_t, {this:ServerPlayer}, bool_t);
ServerPlayer.prototype.knockback = procHacker.js("ServerPlayer::knockback", void_t, {this: ServerPlayer}, Actor, int32_t, float32_t, float32_t, float32_t, float32_t, float32_t);
ServerPlayer.prototype.nextContainerCounter = procHacker.js("ServerPlayer::_nextContainerCounter", int8_t, {this: ServerPlayer});
ServerPlayer.prototype.openInventory = procHacker.js("ServerPlayer::openInventory", void_t, {this: ServerPlayer});
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", void_t, {this: ServerPlayer}, VoidPointer);
ServerPlayer.prototype.getNetworkIdentifier = function () {
    return this.networkIdentifier;
};

const PlayerListEntry$PlayerListEntry = procHacker.js("??0PlayerListEntry@@QEAA@AEBVPlayer@@@Z", PlayerListEntry, null, PlayerListEntry, Player);
PlayerListEntry.create = function(player:Player):PlayerListEntry {
    const entry = PlayerListEntry.construct();
    return PlayerListEntry$PlayerListEntry(entry, player);
};

// networkidentifier.ts
NetworkIdentifier.prototype.getActor = function():ServerPlayer|null {
    return ServerNetworkHandler$_getServerPlayer(serverInstance.minecraft.getServerNetworkHandler(), this, 0);
};
NetworkIdentifier.prototype.equals = procHacker.js("NetworkIdentifier::operator==", bool_t, {this:NetworkIdentifier}, NetworkIdentifier);

const NetworkIdentifier_getHash = procHacker.js('NetworkIdentifier::getHash', bin64_t, null, NetworkIdentifier);
NetworkIdentifier.prototype.hash = function() {
    const hash = NetworkIdentifier_getHash(this);
    return bin.int32(hash) ^ bin.int32_high(hash);
};

NetworkHandler.Connection.abstract({
    networkIdentifier:[NetworkIdentifier, 0],
});
NetworkHandler.abstract({
    vftable: VoidPointer,
    instance: [RakNetInstance.ref(), 0x58]
});

// NetworkHandler::Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni)
NetworkHandler.prototype.getConnectionFromId = procHacker.js(`NetworkHandler::_getConnectionFromId`, NetworkHandler.Connection, {this:NetworkHandler});

// void NetworkHandler::send(const NetworkIdentifier& ni, Packet* packet, unsigned char u)
NetworkHandler.prototype.send = procHacker.js('NetworkHandler::send', void_t, {this:NetworkHandler}, NetworkIdentifier, Packet, int32_t);

// void NetworkHandler::_sendInternal(const NetworkIdentifier& ni, Packet* packet, std::string& data)
NetworkHandler.prototype.sendInternal = procHacker.js('NetworkHandler::_sendInternal', void_t, {this:NetworkHandler}, NetworkIdentifier, Packet, CxxStringWrapper);

BatchedNetworkPeer.prototype.sendPacket = procHacker.js('BatchedNetworkPeer::sendPacket', void_t, {this:BatchedNetworkPeer}, CxxString, int32_t, int32_t, int32_t, int32_t);

RakNetInstance.prototype.getPort = procHacker.js("RakNetInstance::getPort", uint16_t, {this:RakNetInstance});

RakNet.RakPeer.prototype.GetAveragePing = procHacker.js("?GetAveragePing@RakPeer@RakNet@@UEAAHUAddressOrGUID@2@@Z", int32_t, { this: RakNet.RakPeer }, RakNet.AddressOrGUID);
RakNet.RakPeer.prototype.GetLastPing = procHacker.js("?GetLastPing@RakPeer@RakNet@@UEBAHUAddressOrGUID@2@@Z", int32_t, { this: RakNet.RakPeer }, RakNet.AddressOrGUID);
RakNet.RakPeer.prototype.GetLowestPing = procHacker.js("?GetLowestPing@RakPeer@RakNet@@UEBAHUAddressOrGUID@2@@Z", int32_t, { this: RakNet.RakPeer }, RakNet.AddressOrGUID);

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
(ServerNetworkHandler.prototype as any)._disconnectClient = procHacker.js("ServerNetworkHandler::disconnectClient", void_t, {this: ServerNetworkHandler}, NetworkIdentifier, int32_t, CxxString, bool_t);
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
Item.prototype.getCommandNames = procHacker.js("Item::getCommandNames", CxxVector.make(CxxStringWith8Bytes), {this:Item, structureReturn: true});
Item.prototype.getCommandNames2 = procHacker.js("Item::getCommandNames", CxxVector.make(CommandName), {this:Item, structureReturn: true});
Item.prototype.getCreativeCategory = procHacker.js("Item::getCreativeCategory", int32_t, {this:Item});

(ItemStack.prototype as any)._getArmorValue = procHacker.js('ArmorItem::getArmorValue', int32_t, {this: ItemStack});
ItemStack.prototype.setAuxValue = procHacker.js('ItemStackBase::setAuxValue', void_t, {this: ItemStack}, int16_t);
ItemStack.prototype.getAuxValue = procHacker.js('ItemStackBase::getAuxValue', int16_t, {this: ItemStack});
ItemStack.prototype.toString = procHacker.js('ItemStackBase::toString', CxxString, {this: ItemStack, structureReturn: true});
ItemStack.prototype.toDebugString = procHacker.js('ItemStackBase::toDebugString', CxxString, {this: ItemStack, structureReturn: true});
ItemStack.prototype.getMaxStackSize = procHacker.js('ItemStackBase::getMaxStackSize', int32_t, {this: ItemStack});
(ItemStack.prototype as any)._cloneItem = procHacker.js('ItemStack::clone', void_t, {this: ItemStack}, ItemStack);
ItemStack.prototype.getId = procHacker.js("ItemStackBase::getId", int16_t, {this:ItemStack});
ItemStack.prototype.getRawNameId = procHacker.js("ItemStackBase::getRawNameId", CxxString, {this:ItemStack, structureReturn: true});
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
ItemStack.prototype.setItem = procHacker.js("ItemStackBase::_setItem", bool_t, {this:ItemStack}, int32_t);
ItemStack.prototype.startCoolDown = procHacker.js("ItemStackBase::startCoolDown", void_t, {this:ItemStack}, ServerPlayer);
ItemStack.prototype.load = procHacker.js("ItemStackBase::load", void_t, {this:ItemStack}, CompoundTag);
ItemStack.prototype.sameItem = procHacker.js("?sameItem@ItemStackBase@@QEBA_NAEBV1@@Z", bool_t, {this:ItemStack}, ItemStack);
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
ItemStack.prototype.constructItemEnchantsFromUserData = procHacker.js("ItemStackBase::constructItemEnchantsFromUserData", ItemEnchants, {this:ItemStack, structureReturn: true});
const CommandUtils$createItemStack = procHacker.js("CommandUtils::createItemStack", ItemStack, null, ItemStack, CxxString, int32_t, int32_t);
ItemStack.create = function(itemName: CxxString, amount: int32_t = 1, data: int32_t = 0):ItemStack {
    const itemStack = ItemStack.construct();
    CommandUtils$createItemStack(itemStack, itemName, amount, data);
    return itemStack;
};
ItemStack.fromDescriptor = procHacker.js("ItemStack::fromDescriptor", ItemStack, {structureReturn:true}, NetworkItemStackDescriptor, BlockPalette, bool_t);

PlayerInventory.prototype.getSlotWithItem = procHacker.js('PlayerInventory::getSlotWithItem', int32_t, {this: PlayerInventory}, ItemStack, bool_t, bool_t);
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
BlockLegacy.prototype.getCommandNames = procHacker.js("BlockLegacy::getCommandNames", CxxVector.make(CxxStringWith8Bytes), {this:Item, structureReturn: true});
BlockLegacy.prototype.getCommandNames2 = procHacker.js("BlockLegacy::getCommandNames", CxxVector.make(CommandName), {this:Item, structureReturn: true});
BlockLegacy.prototype.getCreativeCategory = procHacker.js("BlockLegacy::getCreativeCategory", int32_t, {this:Block});
BlockLegacy.prototype.setDestroyTime = procHacker.js("BlockLegacy::setDestroyTime", void_t, {this:Block}, float32_t);
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
Block.prototype.getDescriptionId = procHacker.js("Block::getDescriptionId", CxxString, {this:Block, structureReturn:true});
Block.prototype.getRuntimeId = procHacker.js('Block::getRuntimeId', int32_t.ref(), {this:Block});
(BlockSource.prototype as any)._setBlock = procHacker.js("?setBlock@BlockSource@@QEAA_NHHHAEBVBlock@@H@Z", bool_t, {this:BlockSource}, int32_t, int32_t, int32_t, Block, int32_t);
BlockSource.prototype.getBlock = procHacker.js("BlockSource::getBlock", Block, {this:BlockSource}, BlockPos);
const UpdateBlockPacket$UpdateBlockPacket = procHacker.js("??0UpdateBlockPacket@@QEAA@AEBVBlockPos@@IIE@Z", void_t, null, UpdateBlockPacket, BlockPos, uint32_t, uint32_t, uint8_t);
BlockSource.prototype.setBlock = function(blockPos:BlockPos, block:Block):boolean {
    const retval = (this as any)._setBlock(blockPos.x, blockPos.y, blockPos.z, block, 0);
    const pk = UpdateBlockPacket.create();
    UpdateBlockPacket$UpdateBlockPacket(pk, blockPos, 0, block.getRuntimeId(), 3);
    for (const player of serverInstance.getPlayers()) {
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

const Abilities$getAbilityName = procHacker.js("Abilities::getAbilityName", StaticPointer, null, uint16_t);
Abilities.getAbilityName = function(abilityIndex:uint16_t):string {
    const name = Abilities$getAbilityName(abilityIndex);
    return name.getString();
};
const Abilities$nameToAbilityIndex = procHacker.js("Abilities::nameToAbilityIndex", int16_t, null, CxxString); // Will return -1 if not found, so int16 instead of uint16
Abilities.nameToAbilityIndex = function(name:string):int16_t {
    return Abilities$nameToAbilityIndex(name.toLowerCase());
};

Ability.abstract({
    type: int32_t,
    value: Ability.Value,
    options: int32_t,
});
Ability.prototype.getBool = procHacker.js("Ability::getBool", bool_t, {this:Ability});
Ability.prototype.getFloat = procHacker.js("Ability::getFloat", float32_t, {this:Ability});
Ability.prototype.setBool = procHacker.js("Ability::setBool", void_t, {this:Ability}, bool_t);

// gamerules.ts
const GameRules$getRule = procHacker.js("GameRules::getRule", GameRule.ref(), {this:GameRules}, Wrapper.make(int32_t));
GameRules.prototype.getRule = function(id:GameRuleId):GameRule {
    const wrapper = Wrapper.make(int32_t).construct();
    wrapper.value = id;
    const retval = GameRules$getRule.call(this, wrapper);
    wrapper.destruct();
    return retval;
};
const GameRules$hasRule = procHacker.js("GameRules::hasRule", bool_t, {this:GameRules}, Wrapper.make(int32_t));
GameRules.prototype.hasRule = function(id:GameRuleId):bool_t {
    const wrapper = Wrapper.make(int32_t).construct();
    wrapper.value = id;
    const retval = GameRules$hasRule.call(this, wrapper);
    wrapper.destruct();
    return retval;
};

const GameRules$$nameToGameRuleIndex = procHacker.js("GameRules::nameToGameRuleIndex", Wrapper.make(int32_t), null, GameRules, Wrapper.make(int32_t), CxxString); // Will return -1 if not found, so int32 instead of uint32
GameRules.nameToGameRuleIndex = function(name:string):int32_t {
    const wrapper = Wrapper.make(int32_t).construct();
    const retval = GameRules$$nameToGameRuleIndex(serverInstance.minecraft.getLevel().getGameRules(), wrapper, name).value;
    wrapper.destruct();
    return retval;
};

GameRule.abstract({
    shouldSave: bool_t,
    type: uint8_t,
    value: [GameRule.Value, 0x04],
});
GameRule.prototype.getBool = procHacker.js("GameRule::getBool", bool_t, {this:GameRule});
GameRule.prototype.getInt = procHacker.js("GameRule::getInt", int32_t, {this:GameRule});
GameRule.prototype.getFloat = procHacker.js("GameRule::getFloat", float32_t, {this:GameRule});

// scoreboard.ts
Scoreboard.prototype.clearDisplayObjective = procHacker.js("ServerScoreboard::clearDisplayObjective", Objective, {this:Scoreboard}, CxxString);
Scoreboard.prototype.setDisplayObjective = procHacker.js("ServerScoreboard::setDisplayObjective", DisplayObjective, {this:Scoreboard}, CxxString, Objective, uint8_t);
Scoreboard.prototype.addObjective = procHacker.js("Scoreboard::addObjective", Objective, {this:Scoreboard}, CxxString, CxxString, ObjectiveCriteria);
Scoreboard.prototype.getCriteria = procHacker.js("Scoreboard::getCriteria", ObjectiveCriteria, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getDisplayObjective = procHacker.js("Scoreboard::getDisplayObjective", DisplayObjective, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getObjective = procHacker.js("Scoreboard::getObjective", Objective, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getObjectiveNames = procHacker.js("Scoreboard::getObjectiveNames", CxxVectorToArray.make(CxxString), {this:Scoreboard, structureReturn: true});
Scoreboard.prototype.getObjectives = procHacker.js("Scoreboard::getObjectives", CxxVectorToArray.make(Objective.ref()), {this:Scoreboard, structureReturn: true});
Scoreboard.prototype.getActorScoreboardId = procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVActor@@@Z", ScoreboardId, {this:Scoreboard}, Actor);
Scoreboard.prototype.getFakePlayerScoreboardId = procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", ScoreboardId, {this:Scoreboard}, CxxString);
Scoreboard.prototype.getPlayerScoreboardId = procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVPlayer@@@Z", ScoreboardId, {this:Scoreboard}, Player);
Scoreboard.prototype.getScoreboardIdentityRef = procHacker.js("Scoreboard::getScoreboardIdentityRef", ScoreboardIdentityRef.ref(), {this:Scoreboard}, ScoreboardId);
(Scoreboard.prototype as any)._getScoreboardIdentityRefs = procHacker.js("Scoreboard::getScoreboardIdentityRefs", CxxVector.make(ScoreboardIdentityRef), {this:Scoreboard}, CxxVector.make(ScoreboardIdentityRef));
(Scoreboard.prototype as any)._getTrackedIds = procHacker.js("Scoreboard::getTrackedIds", CxxVector.make(ScoreboardId), {this:Scoreboard}, CxxVector.make(ScoreboardId));
Scoreboard.prototype.removeObjective = procHacker.js("Scoreboard::removeObjective", bool_t, {this:Scoreboard}, Objective);
Scoreboard.prototype.resetPlayerScore = procHacker.js("?resetPlayerScore@Scoreboard@@QEAAXAEBUScoreboardId@@AEAVObjective@@@Z", void_t, {this:Scoreboard}, ScoreboardId, Objective);
Scoreboard.prototype.sync = procHacker.js("ServerScoreboard::onScoreChanged", void_t, {this:Scoreboard}, ScoreboardId, Objective);

Objective.prototype.getPlayers = procHacker.js("Objective::getPlayers", CxxVectorToArray.make(ScoreboardId), {this:Objective, structureReturn: true});
Objective.prototype.getPlayerScore = procHacker.js("Objective::getPlayerScore", ScoreInfo, {this:Objective, structureReturn: true}, ScoreboardId);

IdentityDefinition.prototype.getEntityId = procHacker.js("IdentityDefinition::getEntityId", ActorUniqueID.ref(), {this:IdentityDefinition});
IdentityDefinition.prototype.getPlayerId = procHacker.js("IdentityDefinition::getPlayerId", ActorUniqueID.ref(), {this:IdentityDefinition});
IdentityDefinition.prototype.getFakePlayerName = procHacker.js("IdentityDefinition::getFakePlayerName", CxxString, {this:IdentityDefinition});
IdentityDefinition.prototype.getIdentityType = procHacker.js("IdentityDefinition::getIdentityType", uint8_t, {this:IdentityDefinition});

(ScoreboardIdentityRef.prototype as any)._modifyScoreInObjective = procHacker.js("ScoreboardIdentityRef::modifyScoreInObjective", bool_t, {this:ScoreboardIdentityRef}, StaticPointer, Objective, int32_t, uint8_t);

// effects.ts
MobEffect.create = procHacker.js("MobEffect::getById", MobEffect, null, int32_t);
(MobEffectInstance.prototype as any)._create = procHacker.js("??0MobEffectInstance@@QEAA@IHH_N00@Z", void_t, {this:MobEffectInstance}, uint32_t, int32_t, int32_t, bool_t, bool_t, bool_t);

// enchants.ts
EnchantUtils.applyEnchant = procHacker.js("?applyEnchant@EnchantUtils@@SA_NAEAVItemStackBase@@W4Type@Enchant@@H_N@Z", bool_t, null, ItemStack, int16_t, int32_t, bool_t);
EnchantUtils.getEnchantLevel = procHacker.js("EnchantUtils::getEnchantLevel", int32_t, null, uint8_t, ItemStack);
EnchantUtils.hasCurse = procHacker.js("EnchantUtils::hasCurse", bool_t, null, ItemStack);
EnchantUtils.hasEnchant = procHacker.js("EnchantUtils::hasEnchant", bool_t, null, int16_t, ItemStack);

// components.ts
OnHitSubcomponent.prototype.readfromJSON = makefunc.js([0x08], void_t, {this:OnHitSubcomponent}, JsonValue);
OnHitSubcomponent.prototype.writetoJSON = makefunc.js([0x10], void_t, {this:OnHitSubcomponent}, JsonValue);
(OnHitSubcomponent.prototype as any)._getName = makefunc.js([0x20], StaticPointer, {this:OnHitSubcomponent});
