import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { BlockPos, ChunkPos, Vec2, Vec3 } from "../bds/blockpos";
import { bin } from "../bin";
import { AttributeName } from "../common";
import { AllocatedPointer, StaticPointer, VoidPointer } from "../core";
import { CxxVector, CxxVectorToArray } from "../cxxvector";
import { decay } from "../decay";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { NativeClass, nativeClass, NativeClassType, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, CxxStringWith8Bytes, float32_t, GslStringSpan, int16_t, int32_t, int64_as_float_t, int8_t, NativeType, uint16_t, uint32_t, uint8_t, void_t } from "../nativetype";
import { CxxStringWrapper, Wrapper } from "../pointer";
import { SharedPtr } from "../sharedpointer";
import { getEnumKeys } from "../util";
import { Abilities, Ability } from "./abilities";
import { Actor, ActorDamageCause, ActorDamageSource, ActorDefinitionIdentifier, ActorRuntimeID, ActorUniqueID, DimensionId, EntityContext, EntityContextBase, EntityRefTraits, ItemActor, OwnerStorageEntity } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Biome } from "./biome";
import { Block, BlockActor, BlockLegacy, BlockSource } from "./block";
import { ChunkSource, LevelChunk } from "./chunk";
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
import { ArmorItem, ComponentItem, Container, Inventory, InventoryAction, InventorySource, InventoryTransaction, InventoryTransactionItemGroup, Item, ItemDescriptor, ItemStack, NetworkItemStackDescriptor, PlayerInventory, PlayerUIContainer } from "./inventory";
import { ActorFactory, AdventureSettings, BlockPalette, Level, LevelData, ServerLevel, Spawner, TagRegistry } from "./level";
import { ByteArrayTag, ByteTag, CompoundTag, CompoundTagVariant, DoubleTag, EndTag, FloatTag, Int64Tag, IntArrayTag, IntTag, ListTag, NBT, ShortTag, StringTag, Tag, TagMemoryChunk, TagPointer } from "./nbt";
import { networkHandler, NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { ExtendedStreamReadResult, Packet } from "./packet";
import { AdventureSettingsPacket, AttributeData, GameRulesChangedPacket, PlayerListPacket, SetTimePacket, UpdateAttributesPacket, UpdateBlockPacket } from "./packets";
import { BatchedNetworkPeer } from "./peer";
import { Player, PlayerListEntry, ServerPlayer } from "./player";
import { proc, procHacker } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";
import { DisplayObjective, IdentityDefinition, Objective, ObjectiveCriteria, Scoreboard, ScoreboardId, ScoreboardIdentityRef, ScoreInfo } from "./scoreboard";
import { DedicatedServer, Minecraft, ScriptFramework, serverInstance, ServerInstance, VanilaGameModuleServer, VanilaServerGameplayEventListener } from "./server";
import { SerializedSkin } from "./skin";
import { BinaryStream } from "./stream";
import { StructureManager, StructureSettings, StructureTemplate, StructureTemplateData } from "./structure";

// avoiding circular dependency

// utils
namespace CommandUtils {
    export const createItemStack = procHacker.js("CommandUtils::createItemStack", ItemStack, null, ItemStack, CxxString, int32_t, int32_t);
    export const spawnEntityAt = procHacker.js("CommandUtils::spawnEntityAt", Actor, null, BlockSource, Vec3, ActorDefinitionIdentifier, StaticPointer, VoidPointer);
}

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
(Level.prototype as any)._getStructureManager = procHacker.js("Level::getStructureManager", StructureManager, {this:Level}, StructureManager);
Level.prototype.getSpawner = procHacker.js("Level::getSpawner", Spawner, {this:Level});
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
Level.prototype.spawnParticleEffect = procHacker.js("?spawnParticleEffect@Level@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVVec3@@PEAVDimension@@@Z", void_t, {this:Level}, CxxString, Vec3, Dimension);
const level$setTime = procHacker.js("Level::setTime", void_t, {this:Level}, int64_as_float_t);
Level.prototype.setTime = function(time: number):void {
    level$setTime.call(this, time);
    const packet = SetTimePacket.create();
    packet.time = time;
    for (const player of serverInstance.getPlayers()) {
        player.sendNetworkPacket(packet);
    }
    packet.dispose();
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
(Level.prototype as any)._getEntities = procHacker.js('Level::getEntities', CxxVector.make(EntityRefTraits), {this:Level});
Level.prototype.getEntities = function() {
    const out:Actor[] = [];
    for (const refTraits of (this as any)._getEntities()) {
        const entity = Actor.tryGetFromEntity(refTraits.context._getStackRef());
        if (!(entity instanceof Actor)) continue;
        out.push(entity);
    }
    return out;
};

Level.prototype.getRuntimeEntity = procHacker.js("Level::getRuntimeEntity", Actor, {this:Level}, ActorRuntimeID, bool_t);
Level.prototype.getRuntimePlayer = procHacker.js("Level::getRuntimePlayer", Player, {this:Level}, ActorRuntimeID);

Level.prototype.getTime = procHacker.js("Level::getTime", int64_as_float_t, {this:Level});
Level.prototype.getCurrentTick = procHacker.js("Level::getCurrentTick", int64_as_float_t.ref(), {this:Level});// You can run the server for 1.4202551784875594e+22 years till it exceeds the max safe integer
Level.prototype.getRandomPlayer = procHacker.js("Level::getRandomPlayer", Player, {this:Level});

Level.prototype.updateWeather = procHacker.js("Level::updateWeather", void_t, {this:Level}, float32_t, int32_t, float32_t, int32_t);

Level.abstract({
    vftable: VoidPointer,
});

ServerLevel.abstract({});

LevelData.prototype.getGameDifficulty = procHacker.js("LevelData::getGameDifficulty", uint32_t, {this:LevelData});
LevelData.prototype.setGameDifficulty = procHacker.js("LevelData::setGameDifficulty", void_t, {this:LevelData}, uint32_t);

BlockPalette.prototype.getBlockLegacy = procHacker.js("BlockPalette::getBlockLegacy", BlockLegacy, {this:BlockPalette}, CxxString);

const Spawner$spawnItem = procHacker.js("Spawner::spawnItem", ItemActor, null, Spawner, BlockSource, ItemStack, VoidPointer, Vec3, int32_t);
Spawner.prototype.spawnItem = function(region:BlockSource, itemStack:ItemStack, pos:Vec3, throwTime:number):ItemActor {
    return Spawner$spawnItem(this, region, itemStack, new VoidPointer(), pos, throwTime);
};
const Spawner$spawnMob = procHacker.js("Spawner::spawnMob", Actor, null, Spawner, BlockSource, ActorDefinitionIdentifier, VoidPointer, Vec3, bool_t, bool_t, bool_t);
Spawner.prototype.spawnMob = function(region:BlockSource, id:ActorDefinitionIdentifier, pos:Vec3, naturalSpawn = false, surface = true, fromSpawner = false):Actor {
    return Spawner$spawnMob(this, region, id, new VoidPointer(), pos, naturalSpawn, surface, fromSpawner);
};

// actor.ts
const actorMaps = new Map<string, Actor>();
const ServerPlayer$vftable = proc["ServerPlayer::`vftable'"];
const ItemActor$vftable = proc["ItemActor::`vftable'"];
Actor.abstract({
    vftable: VoidPointer,
    ctxbase: EntityContextBase,
});

Actor.prototype.isPlayer = function() {
    return this instanceof ServerPlayer;
};
Actor.prototype.isItem = function() {
    return this instanceof ItemActor;
};
Actor.prototype.isSneaking = procHacker.js("Actor::isSneaking", bool_t, {this:Actor}, void_t);

Actor.setResolver(ptr=>{
    if (ptr === null) return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMaps.get(binptr);
    if (actor != null) return actor;
    if (ptr.getPointer().equals(ServerPlayer$vftable)) {
        actor = ptr.as(ServerPlayer);
    } else if (ptr.getPointer().equals(ItemActor$vftable)) {
        actor = ptr.as(ItemActor);
    } else {
        actor = ptr.as(Actor);
    }
    actorMaps.set(binptr, actor);
    return actor;
});
Actor.all = function():IterableIterator<Actor> {
    return actorMaps.values();
};

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
    return CommandUtils.spawnEntityAt(region, pos, type, ptr, summoner ?? new VoidPointer());
};
(Actor.prototype as any)._getArmorValue = procHacker.js("Mob::getArmorValue", int32_t, {this:Actor});
Actor.prototype.getAttributes = procHacker.js('Actor::getAttributes', BaseAttributeMap.ref(), {this:Actor, structureReturn: true});
Actor.prototype.getName = procHacker.js("Actor::getNameTag", CxxString, {this:Actor});
Actor.prototype.setNameTag = procHacker.js("Actor::setNameTag", void_t, {this:Actor}, CxxString);
Actor.prototype.setNameTagVisible = procHacker.js("Actor::setNameTagVisible", void_t, {this:Actor}, bool_t);
Actor.prototype.addTag = procHacker.js("Actor::addTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.hasTag = procHacker.js("Actor::hasTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.despawn = procHacker.js("Actor::despawn", void_t, {this:Actor});
Actor.prototype.removeTag = procHacker.js("Actor::removeTag", bool_t, {this:Actor}, CxxString);
Actor.prototype.getPosition = procHacker.js("Actor::getPos", Vec3, {this:Actor});
Actor.prototype.getRotation = procHacker.js("Actor::getRotation", Vec2, {this:Actor, structureReturn: true});
Actor.prototype.getScoreTag = procHacker.js("Actor::getScoreTag", CxxString, {this:Actor});
Actor.prototype.setScoreTag = procHacker.js("Actor::setScoreTag", void_t, {this:Actor}, CxxString);
Actor.prototype.getRegion = procHacker.js("Actor::getRegionConst", BlockSource, {this:Actor});
Actor.prototype.getUniqueIdPointer = procHacker.js("Actor::getUniqueID", StaticPointer, {this:Actor});
Actor.prototype.getEntityTypeId = makefunc.js([0x550], int32_t, {this:Actor}); // ActorType getEntityTypeId()
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
const Actor$save = procHacker.js("Actor::save", bool_t, {this:Actor}, CompoundTag);
Actor.prototype.save = function(tag?:CompoundTag):any {
    if (tag != null) {
        return Actor$save.call(this, tag);
    } else {
        tag = CompoundTag.allocate();
        Actor$save.call(this, tag);
        const nbt = tag.value();
        tag.dispose();
        return nbt;
    }
};

@nativeClass()
class DefaultDataLoaderHelper extends NativeClass {
    static readonly vftable = proc["DefaultDataLoadHelper::`vftable'"];
    @nativeField(VoidPointer)
    vftable:VoidPointer;

    [NativeType.ctor]():void {
        this.vftable = DefaultDataLoaderHelper.vftable;
    }

    static create():DefaultDataLoaderHelper {
        const v = new DefaultDataLoaderHelper(true);
        v.vftable = DefaultDataLoaderHelper.vftable;
        return v;
    }
}
const Actor$readAdditionalSaveData = makefunc.js([0x828], void_t, {this:Actor}, CompoundTag, DefaultDataLoaderHelper);
Actor.prototype.readAdditionalSaveData = function(tag:CompoundTag|NBT.Compound):void {
    if (tag instanceof Tag) {
        Actor$readAdditionalSaveData.call(this, tag, DefaultDataLoaderHelper.create());
    } else {
        tag = NBT.allocate(tag) as CompoundTag;
        Actor$readAdditionalSaveData.call(this, tag, DefaultDataLoaderHelper.create());
        tag.dispose();
    }
};

const Actor$load = procHacker.js('Actor::load', void_t, {this:Actor}, CompoundTag, DefaultDataLoaderHelper);
Actor.prototype.load = function(tag:CompoundTag|NBT.Compound):void {
    if (tag instanceof Tag) {
        Actor$load.call(this, tag, DefaultDataLoaderHelper.create());
    } else {
        tag = NBT.allocate(tag) as CompoundTag;
        Actor$load.call(this, tag, DefaultDataLoaderHelper.create());
        tag.dispose();
    }
};

(Actor.prototype as any).hurt_ = procHacker.js("Actor::hurt", bool_t, {this:Actor}, ActorDamageSource, int32_t, bool_t, bool_t);

Actor.prototype.setStatusFlag = procHacker.js("?setStatusFlag@Actor@@QEAA_NW4ActorFlags@@_N@Z", bool_t, {this:Actor}, int32_t, bool_t);
Actor.prototype.getStatusFlag = procHacker.js("?getStatusFlag@Actor@@QEBA_NW4ActorFlags@@@Z", bool_t, {this:Actor}, int32_t);

Actor.prototype.getLevel = procHacker.js("Actor::getLevel", Level, {this:Actor});

Actor.prototype.isRiding = procHacker.js("?isRiding@Actor@@QEBA_NXZ", bool_t, {this:Actor});
// Actor.prototype.isRidingEntity = procHacker.js("?isRiding@Actor@@QEBA_NPEAV1@@Z", bool_t, {this:Actor}, Actor);

Actor.fromUniqueIdBin = function(bin, getRemovedActor = true) {
    return serverInstance.minecraft.getLevel().fetchEntity(bin, getRemovedActor);
};

Actor.prototype.addEffect = procHacker.js("?addEffect@Actor@@QEAAXAEBVMobEffectInstance@@@Z", void_t, {this:Actor}, MobEffectInstance);
Actor.prototype.removeEffect = procHacker.js("?removeEffect@Actor@@QEAAXH@Z", void_t, {this:Actor}, int32_t);
(Actor.prototype as any)._hasEffect = procHacker.js("Actor::hasEffect", bool_t, {this:Actor}, MobEffect);
(Actor.prototype as any)._getEffect = procHacker.js("Actor::getEffect", MobEffectInstance, {this:Actor}, MobEffect);

OwnerStorageEntity.prototype._getStackRef = procHacker.js('OwnerStorageEntity::_getStackRef', EntityContext, {this:OwnerStorageEntity});
Actor.tryGetFromEntity = procHacker.js('Actor::tryGetFromEntity', Actor, null, EntityContext);

const ActorDefinitionIdentifier$ActorDefinitionIdentifier$ActorType = procHacker.js("??0ActorDefinitionIdentifier@@QEAA@W4ActorType@@@Z", void_t, null, ActorDefinitionIdentifier, int32_t);
const ActorDefinitionIdentifier$ActorDefinitionIdentifier$CxxString = procHacker.js("??0ActorDefinitionIdentifier@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", void_t, null, ActorDefinitionIdentifier, CxxString);
ActorDefinitionIdentifier.constructWith = function(type:string|number):ActorDefinitionIdentifier {
    const identifier = ActorDefinitionIdentifier.construct();
    if (typeof type === "number") {
        ActorDefinitionIdentifier$ActorDefinitionIdentifier$ActorType(identifier, type);
    } else {
        ActorDefinitionIdentifier$ActorDefinitionIdentifier$CxxString(identifier, type);
    }
    return identifier;
};

const ActorDamageSource$ActorDamageSource = procHacker.js("ActorDamageSource::ActorDamageSource", void_t, null, ActorDamageSource, int32_t);
ActorDamageSource.constructWith = function (cause: ActorDamageCause): ActorDamageSource {
    const source = ActorDamageSource.construct();
    ActorDamageSource$ActorDamageSource(source, cause);
    return source;
};

ActorDamageSource.prototype.getDamagingEntityUniqueID = makefunc.js([0x40], ActorUniqueID, {this:ActorDamageSource, structureReturn:true});
ActorDamageSource.prototype.setCause = procHacker.js("ActorDamageSource::setCause", void_t, { this: ActorDamageSource }, int32_t);

ItemActor.abstract({
    itemStack: [ItemStack, 1864], // accessed in ItemActor::isFireImmune
});

const attribNames = getEnumKeys(AttributeId).map(str=>AttributeName[str]);

ServerPlayer.prototype.setAttribute = function(id:AttributeId, value:number):AttributeInstance|null {
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
    this.sendNetworkPacket(packet);
    packet.dispose();
    return attr;
};

function _removeActor(actor:Actor):void {
    actorMaps.delete(actor.getAddressBin());
    decay(actor);
}

procHacker.hookingRawWithCallOriginal(
    'Level::removeEntityReferences',
    makefunc.np((level, actor, b)=>{
        _removeActor(actor);
    }, void_t, {name: 'hook of Level::removeEntityReferences'}, Level, Actor, bool_t),
    [Register.rcx, Register.rdx, Register.r8], [],
);

asmcode.removeActor = makefunc.np(_removeActor, void_t, null, Actor);
procHacker.hookingRawWithCallOriginal('Actor::~Actor', asmcode.actorDestructorHook, [Register.rcx], []);

// player.ts
Player.abstract({
    abilities:[Abilities, 0x900], // accessed in AbilityCommand::execute when calling Abilities::setAbility
    playerUIContainer:[PlayerUIContainer, 0x1120], // accessed in Player::readAdditionalSaveData when calling PlayerUIContainer::load
    deviceId:[CxxString, 0x2088], // accessed in AddPlayerPacket::AddPlayerPacket (the string assignment between Abilities::Abilities and Player::getPlatform)
});
(Player.prototype as any)._setName = procHacker.js("Player::setName", void_t, {this: Player}, CxxString);
const PlayerListPacket$emplace = procHacker.js("PlayerListPacket::emplace", void_t, null, PlayerListPacket, PlayerListEntry);
Player.prototype.setName = function(name:string):void {
    (this as any)._setName(name);
    const entry = PlayerListEntry.constructWith(this);
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
Player.prototype.syncAbilities = function() {
    const pk = AdventureSettingsPacket.create();
    AdventureSettingsPacket$AdventureSettingsPacket(pk, serverInstance.minecraft.getLevel().getAdventureSettings(), this.abilities, this.getUniqueIdBin(), false);
    this.sendPacket(pk);
    pk.dispose();
};

Player.prototype.clearRespawnPosition = procHacker.js('Player::clearRespawnPosition', void_t, {this:Player});
Player.prototype.hasRespawnPosition = procHacker.js('Player::hasRespawnPosition', bool_t, {this:Player});
Player.prototype.setRespawnPosition = procHacker.js('Player::setRespawnPosition', void_t, {this:Player}, BlockPos, int32_t);
Player.prototype.setBedRespawnPosition = procHacker.js('Player::setBedRespawnPosition', void_t, {this:Player}, BlockPos);
Player.prototype.getSpawnDimension = procHacker.js('Player::getSpawnDimension', int32_t, {this:Player, structureReturn: true});
Player.prototype.getSpawnPosition = procHacker.js('Player::getSpawnPosition', BlockPos, {this:Player});

@nativeClass(null)
class EntityIdentifierComponent extends NativeClass {
    @nativeField(NetworkIdentifier)
    networkIdentifier:NetworkIdentifier;
    @nativeField(Certificate.ref(), 0xb8) // accessed in ServerNetworkHandler::_displayGameMessage
    certifiate:Certificate;
}

EntityContextBase.prototype.isValid = procHacker.js('EntityContextBase::isValid', bool_t, {this:EntityContextBase});
EntityContextBase.prototype._enttRegistry = procHacker.js('EntityContextBase::_enttRegistry', VoidPointer, {this:EntityContextBase});

const Registry_getEntityIdentifierComponent = procHacker.js('??$try_get@VUserEntityIdentifierComponent@@@?$basic_registry@VEntityId@@@entt@@QEBA?A_PVEntityId@@@Z', EntityIdentifierComponent, null, VoidPointer, int32_t.ref());

Player.prototype.getCertificate = function() {
    // part of ServerNetworkHandler::_displayGameMessage
    const base = this.ctxbase;
    if (!base.isValid()) throw Error(`is not valid`);
    const registry = base._enttRegistry();
    return Registry_getEntityIdentifierComponent(registry, base.entityId).certifiate;
};
Player.prototype.getDestroySpeed = procHacker.js('Player::getDestroySpeed', float32_t, {this:Player}, Block.ref());
Player.prototype.canDestroy = procHacker.js('Player::canDestroy', bool_t, {this:Player}, Block.ref());
Player.prototype.addExperience = procHacker.js('Player::addExperience', void_t, {this:Player}, int32_t);
Player.prototype.addExperienceLevels = procHacker.js('Player::addLevels', void_t, {this:Player}, int32_t);
Player.prototype.getXpNeededForNextLevel = procHacker.js('Player::getXpNeededForNextLevel', int32_t, {this:Player});

ServerPlayer.abstract({});
(ServerPlayer.prototype as any)._sendInventory = procHacker.js("ServerPlayer::sendInventory", void_t, {this:ServerPlayer}, bool_t);
ServerPlayer.prototype.knockback = procHacker.js("ServerPlayer::knockback", void_t, {this: ServerPlayer}, Actor, int32_t, float32_t, float32_t, float32_t, float32_t, float32_t);
ServerPlayer.prototype.nextContainerCounter = procHacker.js("ServerPlayer::_nextContainerCounter", int8_t, {this: ServerPlayer});
ServerPlayer.prototype.openInventory = procHacker.js("ServerPlayer::openInventory", void_t, {this: ServerPlayer});
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("ServerPlayer::sendNetworkPacket", void_t, {this: ServerPlayer}, VoidPointer);
ServerPlayer.prototype.getNetworkIdentifier = function () {
    // part of ServerPlayer::sendNetworkPacket
    const base = this.ctxbase;
    if (!base.isValid()) throw Error(`is not valid`);
    const registry = base._enttRegistry();
    const res = Registry_getEntityIdentifierComponent(registry, base.entityId);
    return res.networkIdentifier;
};
ServerPlayer.prototype.setArmor = procHacker.js("ServerPlayer::setArmor", void_t, {this: ServerPlayer}, uint32_t, ItemStack);

const PlayerListEntry$PlayerListEntry = procHacker.js("??0PlayerListEntry@@QEAA@AEBVPlayer@@@Z", PlayerListEntry, null, PlayerListEntry, Player);
PlayerListEntry.constructWith = function(player:Player):PlayerListEntry {
    const entry = new PlayerListEntry(true);
    return PlayerListEntry$PlayerListEntry(entry, player);
};
PlayerListEntry.prototype[NativeType.dtor] = procHacker.js('PlayerListEntry::~PlayerListEntry', void_t, {this:PlayerListEntry});

// networkidentifier.ts
NetworkIdentifier.prototype.getActor = function():ServerPlayer|null {
    return serverInstance.minecraft.getServerNetworkHandler()._getServerPlayer(this, 0);
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
    instance: [RakNetInstance.ref(), 0x58],
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

ServerNetworkHandler.prototype._getServerPlayer = procHacker.js("ServerNetworkHandler::_getServerPlayer", ServerPlayer, {this:ServerNetworkHandler}, NetworkIdentifier, int32_t);
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
    listener:[VanilaServerGameplayEventListener.ref(), 0x8],
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
    actor: [Actor.ref(), 8],
});

// inventory.ts
Item.prototype.allowOffhand = procHacker.js("Item::allowOffhand", bool_t, {this:Item});
Item.prototype.isDamageable = procHacker.js("Item::isDamageable", bool_t, {this:Item});
Item.prototype.isFood = procHacker.js("Item::isFood", bool_t, {this:Item});
Item.prototype.setAllowOffhand = procHacker.js("Item::setAllowOffhand", void_t, {this:Item}, bool_t);
Item.prototype.getCommandNames = procHacker.js("Item::getCommandNames", CxxVector.make(CxxStringWith8Bytes), {this:Item, structureReturn: true});
Item.prototype.getCommandNames2 = procHacker.js("Item::getCommandNames", CxxVector.make(CommandName), {this:Item, structureReturn: true});
Item.prototype.getCreativeCategory = procHacker.js("Item::getCreativeCategory", int32_t, {this:Item});
Item.prototype.isArmor = makefunc.js([0x40], bool_t, {this:Item});
Item.prototype.getArmorValue = makefunc.js([0xc0], int32_t, {this:Item});

ArmorItem.prototype.getArmorValue = makefunc.js([0x1d0], int32_t, {this:ArmorItem});

const ItemStackVectorDeletingDestructor = makefunc.js([0], void_t, {this:ItemStack}, int32_t);
ItemStack.prototype[NativeType.dtor] = function(){
    ItemStackVectorDeletingDestructor.call(this, 0);
};
ItemStack.prototype.remove = procHacker.js("ItemStackBase::remove", void_t, { this: ItemStack }, int32_t);
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
ItemStack.prototype.allocateAndSave = procHacker.js("ItemStackBase::save", CompoundTag.ref(), {this:ItemStack, structureReturn: true});
const ItemStack$load = procHacker.js("?fromTag@ItemStack@@SA?AV1@AEBVCompoundTag@@@Z", void_t, null, ItemStack, CompoundTag);
ItemStack.prototype.load = function(tag) {
    if (tag instanceof Tag) {
        ItemStack$load(this, tag);
    } else {
        const allocated = NBT.allocate(tag);
        const res = ItemStack$load(this, allocated as CompoundTag);
        allocated.dispose();
    }
};
ItemStack.prototype.constructItemEnchantsFromUserData = procHacker.js("ItemStackBase::constructItemEnchantsFromUserData", ItemEnchants, {this:ItemStack, structureReturn: true});
ItemStack.prototype.saveEnchantsToUserData = procHacker.js("ItemStackBase::saveEnchantsToUserData", void_t, {this:ItemStack}, ItemEnchants);
ItemStack.constructWith = function(itemName: CxxString, amount: int32_t = 1, data: int32_t = 0):ItemStack {
    const itemStack = ItemStack.construct();
    CommandUtils.createItemStack(itemStack, itemName, amount, data);
    return itemStack;
};
ItemStack.fromDescriptor = procHacker.js("ItemStack::fromDescriptor", ItemStack, {structureReturn:true}, NetworkItemStackDescriptor, BlockPalette, bool_t);
NetworkItemStackDescriptor.constructWith = procHacker.js("??0NetworkItemStackDescriptor@@QEAA@AEBVItemStack@@@Z", NetworkItemStackDescriptor, {structureReturn:true}, ItemStack);

Container.prototype.getSlots = procHacker.js("Container::getSlots", CxxVector.make(ItemStack.ref()), {this:Container, structureReturn:true});
Container.prototype.getItemCount = procHacker.js("Container::getItemCount", int32_t, {this:Container}, ItemStack);
Container.prototype.getContainerType = procHacker.js("Container::getContainerType", uint8_t, {this:Container});
Container.prototype.setCustomName = procHacker.js("Container::setCustomName", void_t, {this:Container}, CxxString);

Inventory.prototype.dropSlot = procHacker.js("Inventory::dropSlot", void_t, {this:Inventory}, int32_t, bool_t, bool_t, bool_t);

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

ItemDescriptor.prototype[NativeType.ctor] = procHacker.js('??0ItemDescriptor@@QEAA@XZ', void_t, {this:ItemDescriptor});
ItemDescriptor.prototype[NativeType.dtor] = procHacker.js('ItemDescriptor::~ItemDescriptor', void_t, {this:ItemDescriptor});
ItemDescriptor.prototype[NativeType.ctor_copy] = procHacker.js('??0ItemDescriptor@@QEAA@AEBV0@@Z', void_t, {this:ItemDescriptor}, ItemDescriptor);
NetworkItemStackDescriptor.prototype[NativeType.dtor] = procHacker.js('NetworkItemStackDescriptor::~NetworkItemStackDescriptor', void_t, {this:NetworkItemStackDescriptor});
NetworkItemStackDescriptor.prototype[NativeType.ctor_copy] = procHacker.js('??0NetworkItemStackDescriptor@@QEAA@AEBVItemStackDescriptor@@@Z', void_t, {this:NetworkItemStackDescriptor}, NetworkItemStackDescriptor);

InventoryTransaction.prototype.addItemToContent = procHacker.js("InventoryTransaction::addItemToContent", void_t, {this:InventoryTransaction}, ItemStack, int32_t);
(InventoryTransaction.prototype as any)._getActions = procHacker.js("InventoryTransaction::getActions", CxxVector.make(InventoryAction), {this:InventoryTransaction}, InventorySource);
InventoryTransactionItemGroup.prototype.getItemStack = procHacker.js("InventoryTransactionItemGroup::getItemInstance", ItemStack, {this:InventoryTransaction, structureReturn:true});

// block.ts
BlockLegacy.prototype.getCommandNames = procHacker.js("BlockLegacy::getCommandNames", CxxVector.make(CxxStringWith8Bytes), {this:Item, structureReturn: true});
BlockLegacy.prototype.getCommandNames2 = procHacker.js("BlockLegacy::getCommandNames", CxxVector.make(CommandName), {this:Item, structureReturn: true});
BlockLegacy.prototype.getCreativeCategory = procHacker.js("BlockLegacy::getCreativeCategory", int32_t, {this:Block});
BlockLegacy.prototype.setDestroyTime = procHacker.js("BlockLegacy::setDestroyTime", void_t, {this:Block}, float32_t);
BlockLegacy.prototype.getRenderBlock = procHacker.js("BlockLegacy::getRenderBlock", Block, {this:BlockLegacy});
(Block.prototype as any)._getName = procHacker.js("Block::getName", HashedString, {this:Block});
Block.constructWith = function(blockName:string, data:number = 0):Block|null {
    const itemStack = ItemStack.constructWith(blockName, 1, data);
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
BlockSource.prototype.getBlock = procHacker.js("?getBlock@BlockSource@@UEBAAEBVBlock@@AEBVBlockPos@@@Z", Block, {this:BlockSource}, BlockPos);
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
BlockSource.prototype.getBlockEntity = procHacker.js("?getBlockEntity@BlockSource@@QEAAPEAVBlockActor@@AEBVBlockPos@@@Z", BlockActor, {this:BlockSource}, BlockPos);
const BlockActor$load = makefunc.js([0x8], void_t, {this:BlockActor}, Level, CompoundTag, DefaultDataLoaderHelper);
const BlockActor$save = makefunc.js([0x10], bool_t, {this:BlockActor}, CompoundTag);
BlockActor.prototype.save = function(tag?:CompoundTag):any {
    if (tag != null) {
        return BlockActor$save.call(this, tag);
    }
    tag = CompoundTag.allocate();
    if (!BlockActor$save.call(this, tag)) return null;
    const res = tag.value();
    tag.dispose();
    return res;
};
BlockActor.prototype.load = function(tag) {
    const level = serverInstance.minecraft.getLevel();
    if (tag instanceof Tag) {
        BlockActor$load.call(this, level, tag, DefaultDataLoaderHelper.create());
    } else {
        const allocated = NBT.allocate(tag);
        BlockActor$load.call(this, level, allocated as CompoundTag, DefaultDataLoaderHelper.create());
        allocated.dispose();
    }
};
BlockSource.prototype.getChunk = procHacker.js("BlockSource::getChunk", LevelChunk, {this:BlockSource}, ChunkPos);
BlockSource.prototype.getChunkAt = procHacker.js("BlockSource::getChunkAt", LevelChunk, {this:BlockSource}, BlockPos);
BlockSource.prototype.getChunkSource = procHacker.js("BlockSource::getChunkSource", ChunkSource, {this:BlockSource});

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
MobEffectInstance.prototype.allocateAndSave = procHacker.js("MobEffectInstance::save", CompoundTag.ref(), {this:MobEffectInstance, structureReturn: true});
const MobEffectInstance$load = procHacker.js("MobEffectInstance::load", void_t, null, MobEffectInstance, CompoundTag);
MobEffectInstance.prototype.load = function(tag) {
    if (tag instanceof Tag) {
        MobEffectInstance$load(this, tag);
    } else {
        const allocated = NBT.allocate(tag);
        MobEffectInstance$load(this, allocated as CompoundTag);
        allocated.dispose();
    }
};
MobEffectInstance.load = function(tag) {
    const inst = new MobEffectInstance(true);
    inst.load(tag);
    return inst;
};

// enchants.ts
EnchantUtils.applyEnchant = procHacker.js("?applyEnchant@EnchantUtils@@SA_NAEAVItemStackBase@@W4Type@Enchant@@H_N@Z", bool_t, null, ItemStack, int16_t, int32_t, bool_t);
EnchantUtils.getEnchantLevel = procHacker.js("EnchantUtils::getEnchantLevel", int32_t, null, uint8_t, ItemStack);
EnchantUtils.hasCurse = procHacker.js("EnchantUtils::hasCurse", bool_t, null, ItemStack);
EnchantUtils.hasEnchant = procHacker.js("EnchantUtils::hasEnchant", bool_t, null, int16_t, ItemStack);

// nbt.ts
const tagTypes:NativeClassType<Tag>[] = [
    EndTag,
    ByteTag,
    ShortTag,
    IntTag,
    Int64Tag,
    FloatTag,
    DoubleTag,
    ByteArrayTag,
    StringTag,
    ListTag,
    CompoundTag,
    IntArrayTag,
];
Tag.setResolver(ptr=>{
    if (ptr === null) return null;
    const typeId = Tag.prototype.getId.call(ptr);
    const type = tagTypes[typeId];
    if (type == null) {
        throw Error(`Invalid Tag.getId(): ${typeId}`);
    }
    return ptr.as(type);
});

Tag.prototype.toString = makefunc.js([0x20], CxxString, {this:Tag, structureReturn: true});
Tag.prototype.getId = makefunc.js([0x28], uint8_t, {this:Tag});
Tag.prototype.equals = makefunc.js([0x30], bool_t, {this:Tag}, Tag);

const EndTag$vftable = proc["EndTag::`vftable'"];
const ByteTag$vftable = proc["ByteTag::`vftable'"];
const ShortTag$vftable = proc["ShortTag::`vftable'"];
const IntTag$vftable = proc["IntTag::`vftable'"];
const Int64Tag$vftable = proc["Int64Tag::`vftable'"];
const FloatTag$vftable = proc["FloatTag::`vftable'"];
const DoubleTag$vftable = proc["DoubleTag::`vftable'"];
const ByteArrayTag$vftable = proc["ByteArrayTag::`vftable'"];
const StringTag$vftable = proc["StringTag::`vftable'"];

EndTag.prototype[NativeType.ctor] = function() {
    this.vftable = EndTag$vftable;
};
ByteTag.prototype[NativeType.ctor] = function() {
    this.vftable = ByteTag$vftable;
};
ShortTag.prototype[NativeType.ctor] = function() {
    this.vftable = ShortTag$vftable;
};
IntTag.prototype[NativeType.ctor] = function() {
    this.vftable = IntTag$vftable;
};
Int64Tag.prototype[NativeType.ctor] = function() {
    this.vftable = Int64Tag$vftable;
};
FloatTag.prototype[NativeType.ctor] = function() {
    this.vftable = FloatTag$vftable;
};
DoubleTag.prototype[NativeType.ctor] = function() {
    this.vftable = DoubleTag$vftable;
};
ByteArrayTag.prototype[NativeType.ctor] = function() {
    this.vftable = ByteArrayTag$vftable;
    this.data.construct();
};
const ByteArrayTag$ByteArrayTag = procHacker.js("??0ByteArrayTag@@QEAA@UTagMemoryChunk@@@Z", void_t, null, ByteArrayTag, TagMemoryChunk);
ByteArrayTag.prototype.constructWith = function(data:Uint8Array):void {
    const chunk = TagMemoryChunk.construct();
    chunk.set(data);
    ByteArrayTag$ByteArrayTag(this, chunk); // it will destruct the chunk.
};
const StringTagDataOffset = StringTag.offsetOf('data');
StringTag.prototype[NativeType.ctor] = function() {
    this.vftable = StringTag$vftable;
    CxxString[NativeType.ctor](this.add(StringTagDataOffset));
};
ListTag.prototype[NativeType.ctor] = procHacker.js("??0ListTag@@QEAA@XZ", void_t, {this:ListTag});
ListTag.prototype[NativeType.dtor] = procHacker.js("ListTag::~ListTag", void_t, {this:ListTag});
const ListTag$add = procHacker.js("ListTag::add", void_t, null, ListTag, TagPointer);
ListTag.prototype.pushAllocated = function(tag:Tag):void_t {
    ListTag$add(this, TagPointer.create(tag));
};
ListTag.prototype.size = procHacker.js("ListTag::size", int64_as_float_t, {this:ListTag});

CompoundTag.prototype[NativeType.ctor] = procHacker.js("??0CompoundTag@@QEAA@XZ", void_t, {this:CompoundTag});
CompoundTag.prototype[NativeType.dtor] = procHacker.js("CompoundTag::~CompoundTag", void_t, {this:CompoundTag});
CompoundTag.prototype.get = procHacker.js('CompoundTag::get', Tag, {this:CompoundTag}, GslStringSpan) as any;
const CompoundTag$put = procHacker.js('?put@CompoundTag@@QEAAPEAVTag@@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@4@@Z', void_t, null, CompoundTag, CxxStringWrapper, TagPointer);
CompoundTag.prototype.setAllocated = function(key, value) {
    CompoundTag$put(this,
        CxxStringWrapper.constructWith(key),
        TagPointer.create(value)); // `key` and `value` will be moved into the CompoundTag. no need to destruct them
};
CompoundTag.prototype.delete = procHacker.js('CompoundTag::remove', bool_t, {this:CompoundTag}, GslStringSpan);
CompoundTag.prototype.has = procHacker.js('CompoundTag::contains', bool_t, {this:CompoundTag}, GslStringSpan);
CompoundTag.prototype.clear = procHacker.js('CompoundTag::clear', void_t, {this:CompoundTag});
IntArrayTag.prototype[NativeType.ctor] = procHacker.js("??0IntArrayTag@@QEAA@XZ", void_t, {this:IntArrayTag});

CompoundTagVariant.prototype[NativeType.ctor] = function():void {
    // init as a EndTag

    const ptr = this as any as StaticPointer;
    ptr.setPointer(EndTag$vftable, 0); // set the value as a EndTag
    ptr.setUint8(0, 0x28); // the type index of the std::variant<...>, 0 is the EndTag
};
CompoundTagVariant.prototype[NativeType.dtor] = procHacker.js('CompoundTagVariant::~CompoundTagVariant', void_t, {this:CompoundTagVariant});
CompoundTagVariant.prototype.emplace = procHacker.js('CompoundTagVariant::emplace', Tag, {this:CompoundTagVariant});

// structure.ts
StructureSettings.prototype[NativeType.ctor] = procHacker.js("StructureSettings::StructureSettings", StructureSettings, {this:StructureSettings});
StructureSettings.constructWith = function(size:BlockPos, ignoreEntities:boolean = false, ignoreBlocks:boolean = false):StructureSettings {
    const settings = StructureSettings.construct();
    settings.setStructureSize(size);
    settings.setStructureOffset(BlockPos.create(0, 0, 0));
    settings.setIgnoreEntities(ignoreEntities);
    settings.setIgnoreBlocks(ignoreBlocks);
    return settings;
};
StructureSettings.prototype[NativeType.dtor] = procHacker.js("StructureSettings::~StructureSettings", StructureSettings, {this:StructureSettings});
StructureSettings.prototype.getIgnoreBlocks = procHacker.js("StructureSettings::getIgnoreBlocks", bool_t, {this:StructureSettings});
StructureSettings.prototype.getIgnoreEntities = procHacker.js("StructureSettings::getIgnoreEntities", bool_t, {this:StructureSettings});
StructureSettings.prototype.isAnimated = procHacker.js("StructureSettings::isAnimated", bool_t, {this:StructureSettings});
StructureSettings.prototype.getStructureOffset = procHacker.js("StructureSettings::getStructureOffset", BlockPos, {this:StructureSettings});
StructureSettings.prototype.getStructureSize = procHacker.js("StructureSettings::getStructureSize", BlockPos, {this:StructureSettings});
StructureSettings.prototype.getPivot = procHacker.js("StructureSettings::getPivot", Vec3, {this:StructureSettings});
StructureSettings.prototype.getAnimationMode = procHacker.js("StructureSettings::getAnimationMode", uint8_t, {this:StructureSettings});
StructureSettings.prototype.getMirror = procHacker.js("StructureSettings::getMirror", uint32_t, {this:StructureSettings});
StructureSettings.prototype.getRotation = procHacker.js("StructureSettings::getRotation", uint32_t, {this:StructureSettings});
StructureSettings.prototype.getAnimationSeconds = procHacker.js("StructureSettings::getAnimationSeconds", float32_t, {this:StructureSettings});
StructureSettings.prototype.getIntegrityValue = procHacker.js("StructureSettings::getIntegrityValue", float32_t, {this:StructureSettings});
StructureSettings.prototype.getAnimationTicks = procHacker.js("StructureSettings::getAnimationTicks", uint32_t, {this:StructureSettings});
StructureSettings.prototype.getIntegritySeed = procHacker.js("StructureSettings::getIntegritySeed", float32_t, {this:StructureSettings});
StructureSettings.prototype.setAnimationMode = procHacker.js("StructureSettings::setAnimationMode", void_t, {this:StructureSettings}, uint8_t);
StructureSettings.prototype.setAnimationSeconds = procHacker.js("StructureSettings::setAnimationSeconds", void_t, {this:StructureSettings}, float32_t);
StructureSettings.prototype.setIgnoreBlocks = procHacker.js("StructureSettings::setIgnoreBlocks", void_t, {this:StructureSettings}, bool_t);
StructureSettings.prototype.setIgnoreEntities = procHacker.js("StructureSettings::setIgnoreEntities", void_t, {this:StructureSettings}, bool_t);
StructureSettings.prototype.setIgnoreJigsawBlocks = procHacker.js("StructureSettings::setIgnoreJigsawBlocks", void_t, {this:StructureSettings}, bool_t);
StructureSettings.prototype.setIntegritySeed = procHacker.js("StructureSettings::setIntegritySeed", void_t, {this:StructureSettings}, float32_t);
StructureSettings.prototype.setIntegrityValue = procHacker.js("StructureSettings::setIntegrityValue", void_t, {this:StructureSettings}, float32_t);
StructureSettings.prototype.setMirror = procHacker.js("StructureSettings::setMirror", void_t, {this:StructureSettings}, uint8_t);
StructureSettings.prototype.setPaletteName = procHacker.js("StructureSettings::setPaletteName", void_t, {this:StructureSettings}, CxxString);
StructureSettings.prototype.setPivot = procHacker.js("StructureSettings::setPivot", void_t, {this:StructureSettings}, Vec3);
StructureSettings.prototype.setReloadActorEquipment = procHacker.js("StructureSettings::setReloadActorEquipment", void_t, {this:StructureSettings}, bool_t);
StructureSettings.prototype.setRotation = procHacker.js("StructureSettings::setRotation", void_t, {this:StructureSettings}, uint8_t);
StructureSettings.prototype.setStructureOffset = procHacker.js("StructureSettings::setStructureOffset", void_t, {this:StructureSettings}, BlockPos);
StructureSettings.prototype.setStructureSize = procHacker.js("StructureSettings::setStructureSize", void_t, {this:StructureSettings}, BlockPos);
StructureTemplateData.prototype.allocateAndSave = procHacker.js("StructureTemplateData::save", CompoundTag.ref(), {this:StructureTemplate, structureReturn: true});
const StructureTemplateData$load = procHacker.js("StructureTemplateData::load", bool_t, null, StructureTemplateData, CompoundTag);
StructureTemplateData.prototype.load = function(tag) {
    if (tag instanceof Tag) {
        return StructureTemplateData$load(this, tag);
    } else {
        const allocated = NBT.allocate(tag);
        const res = StructureTemplateData$load(this, allocated as CompoundTag);
        allocated.dispose();
        return res;
    }
};
StructureTemplate.prototype.fillFromWorld = procHacker.js("StructureTemplate::fillFromWorld", void_t, {this:StructureTemplate}, BlockSource, BlockPos, StructureSettings);
StructureTemplate.prototype.placeInWorld = procHacker.js("StructureTemplate::placeInWorld", void_t, {this:StructureTemplate}, BlockSource, BlockPalette, BlockPos, StructureSettings);
StructureTemplate.prototype.getBlockAtPos = procHacker.js("StructureTemplate::getBlockAtPos", Block, {this:StructureTemplate}, BlockPos);
StructureTemplate.prototype.getSize = procHacker.js("StructureTemplate::getSize", BlockPos, {this:StructureTemplate});
StructureManager.prototype[NativeType.ctor] = procHacker.js("StructureManager::StructureManager", StructureManager, {this:StructureManager});
StructureManager.prototype.getOrCreate = procHacker.js("StructureManager::getOrCreate", StructureTemplate, {this:StructureManager}, CxxString);
// components.ts
OnHitSubcomponent.prototype.readfromJSON = makefunc.js([0x08], void_t, {this:OnHitSubcomponent}, JsonValue);
OnHitSubcomponent.prototype.writetoJSON = makefunc.js([0x10], void_t, {this:OnHitSubcomponent}, JsonValue);
(OnHitSubcomponent.prototype as any)._getName = makefunc.js([0x20], StaticPointer, {this:OnHitSubcomponent});

// chunk.ts
LevelChunk.prototype.getBiome = procHacker.js("LevelChunk::getBiome", Biome, {this:LevelChunk});
LevelChunk.prototype.getLevel = procHacker.js("LevelChunk::getLevel", Level, {this:LevelChunk});
LevelChunk.prototype.getPosition = procHacker.js("LevelChunk::getPosition", ChunkPos, {this:LevelChunk});
LevelChunk.prototype.getMin = procHacker.js("LevelChunk::getMin", BlockPos, {this:LevelChunk});
LevelChunk.prototype.getMax = procHacker.js("LevelChunk::getMax", BlockPos, {this:LevelChunk});
LevelChunk.prototype.isFullyLoaded = procHacker.js("LevelChunk::isFullyLoaded", bool_t, {this:LevelChunk});
LevelChunk.prototype.toWorldPos = procHacker.js("LevelChunk::toWorldPos", BlockPos, {this:LevelChunk, structureReturn:true}, ChunkPos);
ChunkSource.prototype.getLevel = procHacker.js("ChunkSource::getLevel", Level, {this:ChunkSource});
ChunkSource.prototype.getLevel = procHacker.js("ChunkSource::getLevel", Level, {this:ChunkSource});

// biome.ts
Biome.prototype.getBiomeType = procHacker.js("Biome::getBiomeType", uint32_t, {this:Biome});
