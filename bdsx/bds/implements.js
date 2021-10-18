"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asmcode = require("../asm/asmcode");
const assembler_1 = require("../assembler");
const blockpos_1 = require("./blockpos");
const loopbacksender_1 = require("./loopbacksender");
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const makefunc_1 = require("../makefunc");
const mce_1 = require("../mce");
const nativetype_1 = require("../nativetype");
const pointer_1 = require("../pointer");
const sharedpointer_1 = require("../sharedpointer");
const abilities_1 = require("./abilities");
const actor_1 = require("./actor");
const attribute_1 = require("./attribute");
const block_1 = require("./block");
const command_1 = require("./command");
const commandname_1 = require("./commandname");
const components_1 = require("./components");
const connreq_1 = require("./connreq");
const dimension_1 = require("./dimension");
const effects_1 = require("./effects");
const enchants_1 = require("./enchants");
const gamemode_1 = require("./gamemode");
const gamerules_1 = require("./gamerules");
const hashedstring_1 = require("./hashedstring");
const inventory_1 = require("./inventory");
const level_1 = require("./level");
const nbt_1 = require("./nbt");
const networkidentifier_1 = require("./networkidentifier");
const packet_1 = require("./packet");
const packets_1 = require("./packets");
const peer_1 = require("./peer");
const player_1 = require("./player");
const proc_1 = require("./proc");
const raknetinstance_1 = require("./raknetinstance");
const scoreboard_1 = require("./scoreboard");
const server_1 = require("./server");
const skin_1 = require("./skin");
const stream_1 = require("./stream");
const mcglobal_1 = require("../mcglobal");
// avoiding circular dependency
// level.ts
level_1.Level.prototype.createDimension = proc_1.procHacker.js("Level::createDimension", dimension_1.Dimension, { this: level_1.Level }, nativetype_1.int32_t);
level_1.Level.prototype.destroyBlock = proc_1.procHacker.js("Level::destroyBlock", nativetype_1.bool_t, { this: level_1.Level }, block_1.BlockSource, blockpos_1.BlockPos, nativetype_1.bool_t);
level_1.Level.prototype.fetchEntity = proc_1.procHacker.js("Level::fetchEntity", actor_1.Actor, { this: level_1.Level }, nativetype_1.bin64_t, nativetype_1.bool_t);
level_1.Level.prototype.getActivePlayerCount = proc_1.procHacker.js("Level::getActivePlayerCount", nativetype_1.int32_t, { this: level_1.Level });
level_1.Level.prototype.getActorFactory = proc_1.procHacker.js("Level::getActorFactory", level_1.ActorFactory, { this: level_1.Level });
level_1.Level.prototype.getAdventureSettings = proc_1.procHacker.js("Level::getAdventureSettings", level_1.AdventureSettings, { this: level_1.Level });
level_1.Level.prototype.getBlockPalette = proc_1.procHacker.js("Level::getBlockPalette", level_1.BlockPalette, { this: level_1.Level });
level_1.Level.prototype.getDimension = proc_1.procHacker.js("Level::getDimension", dimension_1.Dimension, { this: level_1.Level }, nativetype_1.int32_t);
level_1.Level.prototype.getLevelData = proc_1.procHacker.js("Level::getLevelData", level_1.LevelData.ref(), { this: level_1.Level });
level_1.Level.prototype.getGameRules = proc_1.procHacker.js("Level::getGameRules", gamerules_1.GameRules, { this: level_1.Level });
level_1.Level.prototype.getScoreboard = proc_1.procHacker.js("Level::getScoreboard", scoreboard_1.Scoreboard, { this: level_1.Level });
level_1.Level.prototype.getSeed = proc_1.procHacker.js("Level::getSeed", nativetype_1.uint32_t, { this: level_1.Level });
level_1.Level.prototype.getTagRegistry = proc_1.procHacker.js("Level::getTagRegistry", level_1.TagRegistry, { this: level_1.Level });
level_1.Level.prototype.hasCommandsEnabled = proc_1.procHacker.js("Level::hasCommandsEnabled", nativetype_1.bool_t, { this: level_1.Level });
level_1.Level.prototype.setCommandsEnabled = proc_1.procHacker.js("ServerLevel::setCommandsEnabled", nativetype_1.void_t, { this: level_1.ServerLevel }, nativetype_1.bool_t);
level_1.Level.prototype.setShouldSendSleepMessage = proc_1.procHacker.js("ServerLevel::setShouldSendSleepMessage", nativetype_1.void_t, { this: level_1.ServerLevel }, nativetype_1.bool_t);
const GameRules$createAllGameRulesPacket = proc_1.procHacker.js("GameRules::createAllGameRulesPacket", pointer_1.Wrapper.make(packets_1.GameRulesChangedPacket.ref()), { this: gamerules_1.GameRules }, pointer_1.Wrapper.make(packets_1.GameRulesChangedPacket.ref()));
level_1.Level.prototype.syncGameRules = function () {
    const wrapper = pointer_1.Wrapper.make(packets_1.GameRulesChangedPacket.ref()).construct();
    wrapper.value = packets_1.GameRulesChangedPacket.create();
    GameRules$createAllGameRulesPacket.call(this.getGameRules(), wrapper);
    for (const player of server_1.serverInstance.minecraft.getLevel().players) {
        player.sendNetworkPacket(wrapper.value);
    }
    wrapper.destruct();
};
level_1.Level.abstract({
    vftable: core_1.VoidPointer,
    players: [cxxvector_1.CxxVector.make(player_1.ServerPlayer.ref()), 0x58],
});
level_1.ServerLevel.abstract({
    packetSender: [loopbacksender_1.LoopbackPacketSender.ref(), 0x830],
    actors: [cxxvector_1.CxxVector.make(actor_1.Actor.ref()), 0x1590],
});
level_1.LevelData.prototype.getGameDifficulty = proc_1.procHacker.js("LevelData::getGameDifficulty", nativetype_1.uint32_t, { this: level_1.LevelData });
level_1.LevelData.prototype.setGameDifficulty = proc_1.procHacker.js("LevelData::setGameDifficulty", nativetype_1.void_t, { this: level_1.LevelData }, nativetype_1.uint32_t);
// actor.ts
const actorMaps = new Map();
const ServerPlayer_vftable = proc_1.proc["ServerPlayer::`vftable'"];
const ItemActor_vftable = proc_1.proc["ItemActor::`vftable'"];
actor_1.Actor.prototype.isPlayer = function () {
    return this.vftable.equals(ServerPlayer_vftable);
};
actor_1.Actor.prototype.isItem = function () {
    return this.vftable.equals(ItemActor_vftable);
};
actor_1.Actor._singletoning = function (ptr) {
    if (ptr === null)
        return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMaps.get(binptr);
    if (actor)
        return actor;
    if (ptr.getPointer().equals(ServerPlayer_vftable)) {
        actor = ptr.as(player_1.ServerPlayer);
    }
    else if (ptr.getPointer().equals(ItemActor_vftable)) {
        actor = ptr.as(actor_1.ItemActor);
    }
    else {
        actor = ptr.as(actor_1.Actor);
    }
    actorMaps.set(binptr, actor);
    return actor;
};
actor_1.Actor.all = function () {
    return actorMaps.values();
};
actor_1.Actor.abstract({
    vftable: core_1.VoidPointer,
    identifier: [nativetype_1.CxxString, 0x458], // minecraft:player
});
const CommandUtils$spawnEntityAt = proc_1.procHacker.js("CommandUtils::spawnEntityAt", actor_1.Actor, null, block_1.BlockSource, blockpos_1.Vec3, actor_1.ActorDefinitionIdentifier, core_1.StaticPointer, core_1.VoidPointer);
actor_1.Actor.summonAt = function (region, pos, type, id, summoner) {
    const ptr = new core_1.AllocatedPointer(8);
    switch (typeof id) {
        case "number":
            ptr.setInt64WithFloat(id);
            break;
        case "string":
            ptr.setBin(id);
            break;
    }
    return CommandUtils$spawnEntityAt(region, pos, type, ptr, summoner !== null && summoner !== void 0 ? summoner : new core_1.VoidPointer());
};
actor_1.Actor.prototype._getArmorValue = proc_1.procHacker.js("Mob::getArmorValue", nativetype_1.int32_t, { this: actor_1.Actor });
actor_1.Actor.prototype.getAttributes = proc_1.procHacker.js('Actor::getAttributes', attribute_1.BaseAttributeMap.ref(), { this: actor_1.Actor, structureReturn: true });
actor_1.Actor.prototype.getName = proc_1.procHacker.js("Actor::getNameTag", nativetype_1.CxxString, { this: actor_1.Actor });
actor_1.Actor.prototype.setName = proc_1.procHacker.js("Actor::setNameTag", nativetype_1.void_t, { this: actor_1.Actor }, nativetype_1.CxxString);
actor_1.Actor.prototype.addTag = proc_1.procHacker.js("Actor::addTag", nativetype_1.bool_t, { this: actor_1.Actor }, nativetype_1.CxxString);
actor_1.Actor.prototype.hasTag = proc_1.procHacker.js("Actor::hasTag", nativetype_1.bool_t, { this: actor_1.Actor }, nativetype_1.CxxString);
actor_1.Actor.prototype.removeTag = proc_1.procHacker.js("Actor::removeTag", nativetype_1.bool_t, { this: actor_1.Actor }, nativetype_1.CxxString);
actor_1.Actor.prototype.getPosition = proc_1.procHacker.js("Actor::getPos", blockpos_1.Vec3, { this: actor_1.Actor });
actor_1.Actor.prototype.getRotation = proc_1.procHacker.js("Actor::getRotation", blockpos_1.Vec2, { this: actor_1.Actor, structureReturn: true });
actor_1.Actor.prototype.getScoreTag = proc_1.procHacker.js("Actor::getScoreTag", nativetype_1.CxxString, { this: actor_1.Actor });
actor_1.Actor.prototype.setScoreTag = proc_1.procHacker.js("Actor::setScoreTag", nativetype_1.void_t, { this: actor_1.Actor }, nativetype_1.CxxString);
actor_1.Actor.prototype.getRegion = proc_1.procHacker.js("Actor::getRegionConst", block_1.BlockSource, { this: actor_1.Actor });
actor_1.Actor.prototype.getUniqueIdPointer = proc_1.procHacker.js("Actor::getUniqueID", core_1.StaticPointer, { this: actor_1.Actor });
actor_1.Actor.prototype.getEntityTypeId = makefunc_1.makefunc.js([0x520], nativetype_1.int32_t, { this: actor_1.Actor }); // ActorType getEntityTypeId()
actor_1.Actor.prototype.getRuntimeID = proc_1.procHacker.js('Actor::getRuntimeID', actor_1.ActorRuntimeID, { this: actor_1.Actor, structureReturn: true });
actor_1.Actor.prototype.getDimension = proc_1.procHacker.js('Actor::getDimension', dimension_1.Dimension, { this: actor_1.Actor });
actor_1.Actor.prototype.getDimensionId = proc_1.procHacker.js('Actor::getDimensionId', nativetype_1.int32_t, { this: actor_1.Actor, structureReturn: true }); // DimensionId* getDimensionId(DimensionId*)
actor_1.Actor.prototype.getCommandPermissionLevel = proc_1.procHacker.js('Actor::getCommandPermissionLevel', nativetype_1.int32_t, { this: actor_1.Actor });
const TeleportCommand$computeTarget = proc_1.procHacker.js("TeleportCommand::computeTarget", nativetype_1.void_t, null, core_1.StaticPointer, actor_1.Actor, blockpos_1.Vec3, blockpos_1.Vec3, nativetype_1.int32_t);
const TeleportCommand$applyTarget = proc_1.procHacker.js("TeleportCommand::applyTarget", nativetype_1.void_t, null, actor_1.Actor, core_1.StaticPointer);
actor_1.Actor.prototype.teleport = function (pos, dimensionId = actor_1.DimensionId.Overworld) {
    const alloc = new core_1.AllocatedPointer(0x80);
    TeleportCommand$computeTarget(alloc, this, pos, new blockpos_1.Vec3(true), dimensionId);
    TeleportCommand$applyTarget(this, alloc);
};
actor_1.Actor.prototype.getArmor = proc_1.procHacker.js('Actor::getArmor', inventory_1.ItemStack, { this: actor_1.Actor }, nativetype_1.int32_t);
actor_1.Actor.prototype.setSneaking = proc_1.procHacker.js("Actor::setSneaking", nativetype_1.void_t, { this: actor_1.Actor }, nativetype_1.bool_t);
actor_1.Actor.prototype.getHealth = proc_1.procHacker.js("Actor::getHealth", nativetype_1.int32_t, { this: actor_1.Actor });
actor_1.Actor.prototype.getMaxHealth = proc_1.procHacker.js("Actor::getMaxHealth", nativetype_1.int32_t, { this: actor_1.Actor });
actor_1.Actor.prototype.setStatusFlag = proc_1.procHacker.js("?setStatusFlag@Actor@@QEAA_NW4ActorFlags@@_N@Z", nativetype_1.bool_t, { this: actor_1.Actor }, nativetype_1.int32_t, nativetype_1.bool_t);
actor_1.Actor.prototype.getStatusFlag = proc_1.procHacker.js("Actor::getStatusFlag", nativetype_1.bool_t, { this: actor_1.Actor }, nativetype_1.int32_t);
actor_1.Actor.fromUniqueIdBin = function (bin, getRemovedActor = true) {
    return server_1.serverInstance.minecraft.getLevel().fetchEntity(bin, getRemovedActor);
};
actor_1.Actor.prototype.addEffect = proc_1.procHacker.js("?addEffect@Actor@@QEAAXAEBVMobEffectInstance@@@Z", nativetype_1.void_t, { this: actor_1.Actor }, effects_1.MobEffectInstance);
actor_1.Actor.prototype.removeEffect = proc_1.procHacker.js("?removeEffect@Actor@@QEAAXH@Z", nativetype_1.void_t, { this: actor_1.Actor }, nativetype_1.int32_t);
actor_1.Actor.prototype._hasEffect = proc_1.procHacker.js("Actor::hasEffect", nativetype_1.bool_t, { this: actor_1.Actor }, effects_1.MobEffect);
actor_1.Actor.prototype._getEffect = proc_1.procHacker.js("Actor::getEffect", effects_1.MobEffectInstance, { this: actor_1.Actor }, effects_1.MobEffect);
const ActorDefinitionIdentifier$ActorDefinitionIdentifier = proc_1.procHacker.js("??0ActorDefinitionIdentifier@@QEAA@W4ActorType@@@Z", nativetype_1.void_t, null, actor_1.ActorDefinitionIdentifier, nativetype_1.int32_t);
actor_1.ActorDefinitionIdentifier.create = function (type) {
    const identifier = actor_1.ActorDefinitionIdentifier.construct();
    ActorDefinitionIdentifier$ActorDefinitionIdentifier(identifier, type);
    return identifier;
};
actor_1.ActorDamageSource.prototype.getDamagingEntityUniqueID = proc_1.procHacker.js("ActorDamageSource::getDamagingEntityUniqueID", actor_1.ActorUniqueID, { this: actor_1.ActorDamageSource, structureReturn: true });
actor_1.ItemActor.abstract({
    itemStack: [inventory_1.ItemStack, 1824],
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
player_1.ServerPlayer.prototype.setAttribute = function (id, value) {
    const attr = actor_1.Actor.prototype.setAttribute.call(this, id, value);
    if (attr === null)
        return null;
    const packet = packets_1.UpdateAttributesPacket.create();
    packet.actorId = this.getRuntimeID();
    const data = packets_1.AttributeData.construct();
    data.name.set(attribNames[id - 1]);
    data.current = value;
    data.min = attr.minValue;
    data.max = attr.maxValue;
    data.default = attr.defaultValue;
    packet.attributes.push(data);
    data.destruct();
    if (this instanceof player_1.ServerPlayer) {
        this.sendNetworkPacket(packet);
    }
    packet.dispose();
    return attr;
};
function _removeActor(actor) {
    actorMaps.delete(actor.getAddressBin());
}
proc_1.procHacker.hookingRawWithCallOriginal('Level::removeEntityReferences', makefunc_1.makefunc.np((level, actor, b) => {
    _removeActor(actor);
}, nativetype_1.void_t, null, level_1.Level, actor_1.Actor, nativetype_1.bool_t), [assembler_1.Register.rcx, assembler_1.Register.rdx, assembler_1.Register.r8], []);
asmcode.removeActor = makefunc_1.makefunc.np(_removeActor, nativetype_1.void_t, null, actor_1.Actor);
proc_1.procHacker.hookingRawWithCallOriginal('Actor::~Actor', asmcode.actorDestructorHook, [assembler_1.Register.rcx], []);
// player.ts
player_1.Player.abstract({
    abilities: [abilities_1.Abilities, 0x948],
    respawnPosition: [blockpos_1.BlockPos, 0x1D9C],
    respawnDimension: [nativetype_1.uint8_t, 0x76A],
    deviceId: [nativetype_1.CxxString, 0x20A0],
});
player_1.Player.prototype._setName = proc_1.procHacker.js("Player::setName", nativetype_1.void_t, { this: player_1.Player }, nativetype_1.CxxString);
const PlayerListPacket$emplace = proc_1.procHacker.js("PlayerListPacket::emplace", nativetype_1.void_t, null, packets_1.PlayerListPacket, player_1.PlayerListEntry);
player_1.Player.prototype.setName = function (name) {
    this._setName(name);
    const entry = player_1.PlayerListEntry.create(this);
    const pk = packets_1.PlayerListPacket.create();
    PlayerListPacket$emplace(pk, entry);
    for (const player of server_1.serverInstance.minecraft.getLevel().players) {
        player.sendNetworkPacket(pk);
    }
    entry.destruct();
    pk.dispose();
};
player_1.Player.prototype.addItem = proc_1.procHacker.js("Player::add", nativetype_1.bool_t, { this: player_1.Player }, inventory_1.ItemStack);
player_1.Player.prototype.changeDimension = proc_1.procHacker.js("ServerPlayer::changeDimension", nativetype_1.void_t, { this: player_1.Player }, nativetype_1.int32_t, nativetype_1.bool_t);
player_1.Player.prototype.teleportTo = proc_1.procHacker.js("Player::teleportTo", nativetype_1.void_t, { this: player_1.Player }, blockpos_1.Vec3, nativetype_1.bool_t, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.bin64_t);
player_1.Player.prototype.getGameType = proc_1.procHacker.js("Player::getPlayerGameType", nativetype_1.int32_t, { this: player_1.Player });
player_1.Player.prototype.getInventory = proc_1.procHacker.js("Player::getSupplies", inventory_1.PlayerInventory, { this: player_1.Player });
player_1.Player.prototype.getMainhandSlot = proc_1.procHacker.js("Player::getCarriedItem", inventory_1.ItemStack, { this: player_1.Player });
player_1.Player.prototype.getOffhandSlot = proc_1.procHacker.js("Actor::getOffhandSlot", inventory_1.ItemStack, { this: player_1.Player });
player_1.Player.prototype.getCommandPermissionLevel = proc_1.procHacker.js('Player::getCommandPermissionLevel', nativetype_1.int32_t, { this: actor_1.Actor });
player_1.Player.prototype.getPermissionLevel = proc_1.procHacker.js("Player::getPlayerPermissionLevel", nativetype_1.int32_t, { this: player_1.Player });
player_1.Player.prototype.getSkin = proc_1.procHacker.js("Player::getSkin", skin_1.SerializedSkin, { this: player_1.Player });
player_1.Player.prototype.startCooldown = proc_1.procHacker.js("Player::startCooldown", nativetype_1.void_t, { this: player_1.Player }, inventory_1.Item);
player_1.Player.prototype.setGameType = proc_1.procHacker.js("ServerPlayer::setPlayerGameType", nativetype_1.void_t, { this: player_1.Player }, nativetype_1.int32_t);
player_1.Player.prototype.setSize = proc_1.procHacker.js("Player::setSize", nativetype_1.void_t, { this: player_1.Player }, nativetype_1.float32_t, nativetype_1.float32_t);
player_1.Player.prototype.setSleeping = proc_1.procHacker.js("Player::setSleeping", nativetype_1.void_t, { this: player_1.Player }, nativetype_1.bool_t);
player_1.Player.prototype.isSleeping = proc_1.procHacker.js("Player::isSleeping", nativetype_1.bool_t, { this: player_1.Player });
player_1.Player.prototype.isJumping = proc_1.procHacker.js("Player::isJumping", nativetype_1.bool_t, { this: player_1.Player });
const AdventureSettingsPacket$AdventureSettingsPacket = proc_1.procHacker.js("AdventureSettingsPacket::AdventureSettingsPacket", nativetype_1.void_t, null, packets_1.AdventureSettingsPacket, level_1.AdventureSettings, abilities_1.Abilities, actor_1.ActorUniqueID, nativetype_1.bool_t);
player_1.Player.prototype.syncAbilties = function () {
    const pk = packets_1.AdventureSettingsPacket.create();
    AdventureSettingsPacket$AdventureSettingsPacket(pk, server_1.serverInstance.minecraft.getLevel().getAdventureSettings(), this.abilities, this.getUniqueIdBin(), false);
    this.sendPacket(pk);
    pk.dispose();
};
player_1.Player.prototype.getCertificate = proc_1.procHacker.js("Player::getCertificate", connreq_1.Certificate, { this: player_1.Player });
player_1.ServerPlayer.abstract({
    networkIdentifier: [networkidentifier_1.NetworkIdentifier, 0xa98],
});
player_1.ServerPlayer.prototype._sendInventory = proc_1.procHacker.js("ServerPlayer::sendInventory", nativetype_1.void_t, { this: player_1.ServerPlayer }, nativetype_1.bool_t);
player_1.ServerPlayer.prototype.knockback = proc_1.procHacker.js("ServerPlayer::knockback", nativetype_1.void_t, { this: player_1.ServerPlayer }, actor_1.Actor, nativetype_1.int32_t, nativetype_1.float32_t, nativetype_1.float32_t, nativetype_1.float32_t, nativetype_1.float32_t, nativetype_1.float32_t);
player_1.ServerPlayer.prototype.nextContainerCounter = proc_1.procHacker.js("ServerPlayer::_nextContainerCounter", nativetype_1.int8_t, { this: player_1.ServerPlayer });
player_1.ServerPlayer.prototype.openInventory = proc_1.procHacker.js("ServerPlayer::openInventory", nativetype_1.void_t, { this: player_1.ServerPlayer });
player_1.ServerPlayer.prototype.sendNetworkPacket = proc_1.procHacker.js("ServerPlayer::sendNetworkPacket", nativetype_1.void_t, { this: player_1.ServerPlayer }, core_1.VoidPointer);
player_1.ServerPlayer.prototype.getNetworkIdentifier = function () {
    return this.networkIdentifier;
};
const PlayerListEntry$PlayerListEntry = proc_1.procHacker.js("??0PlayerListEntry@@QEAA@AEBVPlayer@@@Z", player_1.PlayerListEntry, null, player_1.PlayerListEntry, player_1.Player);
player_1.PlayerListEntry.create = function (player) {
    const entry = player_1.PlayerListEntry.construct();
    return PlayerListEntry$PlayerListEntry(entry, player);
};
// networkidentifier.ts
networkidentifier_1.NetworkIdentifier.prototype.getActor = function () {
    return ServerNetworkHandler$_getServerPlayer(server_1.serverInstance.minecraft.getServerNetworkHandler(), this, 0);
};
networkidentifier_1.NetworkIdentifier.prototype.equals = proc_1.procHacker.js("NetworkIdentifier::operator==", nativetype_1.bool_t, { this: networkidentifier_1.NetworkIdentifier }, networkidentifier_1.NetworkIdentifier);
asmcode.NetworkIdentifierGetHash = proc_1.proc['NetworkIdentifier::getHash'];
networkidentifier_1.NetworkIdentifier.prototype.hash = makefunc_1.makefunc.js(asmcode.networkIdentifierHash, nativetype_1.int32_t, { this: networkidentifier_1.NetworkIdentifier });
networkidentifier_1.NetworkHandler.Connection.abstract({
    networkIdentifier: networkidentifier_1.NetworkIdentifier,
    u1: core_1.VoidPointer,
    u2: core_1.VoidPointer,
    u3: core_1.VoidPointer,
    epeer: sharedpointer_1.SharedPtr.make(peer_1.EncryptedNetworkPeer),
    bpeer: sharedpointer_1.SharedPtr.make(peer_1.BatchedNetworkPeer),
    bpeer2: sharedpointer_1.SharedPtr.make(peer_1.BatchedNetworkPeer),
});
networkidentifier_1.NetworkHandler.abstract({
    vftable: core_1.VoidPointer,
    instance: [raknetinstance_1.RakNetInstance.ref(), 0x48]
});
// NetworkHandler::Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni)
networkidentifier_1.NetworkHandler.prototype.getConnectionFromId = proc_1.procHacker.js(`NetworkHandler::_getConnectionFromId`, networkidentifier_1.NetworkHandler.Connection, { this: networkidentifier_1.NetworkHandler });
// void NetworkHandler::send(const NetworkIdentifier& ni, Packet* packet, unsigned char u)
networkidentifier_1.NetworkHandler.prototype.send = proc_1.procHacker.js('NetworkHandler::send', nativetype_1.void_t, { this: networkidentifier_1.NetworkHandler }, networkidentifier_1.NetworkIdentifier, packet_1.Packet, nativetype_1.int32_t);
// void NetworkHandler::_sendInternal(const NetworkIdentifier& ni, Packet* packet, std::string& data)
networkidentifier_1.NetworkHandler.prototype.sendInternal = proc_1.procHacker.js('NetworkHandler::_sendInternal', nativetype_1.void_t, { this: networkidentifier_1.NetworkHandler }, networkidentifier_1.NetworkIdentifier, packet_1.Packet, pointer_1.CxxStringWrapper);
peer_1.BatchedNetworkPeer.prototype.sendPacket = proc_1.procHacker.js('BatchedNetworkPeer::sendPacket', nativetype_1.void_t, { this: peer_1.BatchedNetworkPeer }, nativetype_1.CxxString, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.int32_t);
raknetinstance_1.RakNetInstance.prototype.getPort = proc_1.procHacker.js("RakNetInstance::getPort", nativetype_1.uint16_t, { this: raknetinstance_1.RakNetInstance });
// packet.ts
packet_1.Packet.prototype.sendTo = function (target, unknownarg = 0) {
    networkidentifier_1.networkHandler.send(target, this, unknownarg);
};
packet_1.Packet.prototype.destruct = makefunc_1.makefunc.js([0x0], nativetype_1.void_t, { this: packet_1.Packet });
packet_1.Packet.prototype.getId = makefunc_1.makefunc.js([0x8], nativetype_1.int32_t, { this: packet_1.Packet });
packet_1.Packet.prototype.getName = makefunc_1.makefunc.js([0x10], nativetype_1.CxxString, { this: packet_1.Packet, structureReturn: true });
packet_1.Packet.prototype.write = makefunc_1.makefunc.js([0x18], nativetype_1.void_t, { this: packet_1.Packet }, stream_1.BinaryStream);
packet_1.Packet.prototype.read = makefunc_1.makefunc.js([0x20], nativetype_1.int32_t, { this: packet_1.Packet }, stream_1.BinaryStream);
packet_1.Packet.prototype.readExtended = makefunc_1.makefunc.js([0x28], packet_1.ExtendedStreamReadResult, { this: packet_1.Packet }, packet_1.ExtendedStreamReadResult, stream_1.BinaryStream);
const ServerNetworkHandler$_getServerPlayer = proc_1.procHacker.js("ServerNetworkHandler::_getServerPlayer", player_1.ServerPlayer, null, networkidentifier_1.ServerNetworkHandler, networkidentifier_1.NetworkIdentifier, nativetype_1.int32_t);
networkidentifier_1.ServerNetworkHandler.prototype._disconnectClient = proc_1.procHacker.js("ServerNetworkHandler::disconnectClient", nativetype_1.void_t, { this: networkidentifier_1.ServerNetworkHandler }, networkidentifier_1.NetworkIdentifier, nativetype_1.int32_t, nativetype_1.CxxString, nativetype_1.bool_t);
networkidentifier_1.ServerNetworkHandler.prototype.allowIncomingConnections = proc_1.procHacker.js("ServerNetworkHandler::allowIncomingConnections", nativetype_1.void_t, { this: networkidentifier_1.ServerNetworkHandler }, nativetype_1.CxxString, nativetype_1.bool_t);
networkidentifier_1.ServerNetworkHandler.prototype.updateServerAnnouncement = proc_1.procHacker.js("ServerNetworkHandler::updateServerAnnouncement", nativetype_1.void_t, { this: networkidentifier_1.ServerNetworkHandler });
networkidentifier_1.ServerNetworkHandler.prototype.setMaxNumPlayers = proc_1.procHacker.js("ServerNetworkHandler::setMaxNumPlayers", nativetype_1.void_t, { this: networkidentifier_1.ServerNetworkHandler }, nativetype_1.int32_t);
// connreq.ts
connreq_1.Certificate.prototype.getXuid = function () {
    return ExtendedCertificate.getXuid(this);
};
connreq_1.Certificate.prototype.getIdentityName = function () {
    return ExtendedCertificate.getIdentityName(this);
};
connreq_1.Certificate.prototype.getIdentity = function () {
    return ExtendedCertificate.getIdentity(this).value;
};
var ExtendedCertificate;
(function (ExtendedCertificate) {
    ExtendedCertificate.getXuid = proc_1.procHacker.js("ExtendedCertificate::getXuid", nativetype_1.CxxString, { structureReturn: true }, connreq_1.Certificate);
    ExtendedCertificate.getIdentityName = proc_1.procHacker.js("ExtendedCertificate::getIdentityName", nativetype_1.CxxString, { structureReturn: true }, connreq_1.Certificate);
    ExtendedCertificate.getIdentity = proc_1.procHacker.js("ExtendedCertificate::getIdentity", mce_1.mce.UUIDWrapper, { structureReturn: true }, connreq_1.Certificate);
})(ExtendedCertificate || (ExtendedCertificate = {}));
connreq_1.ConnectionRequest.abstract({
    cert: [connreq_1.Certificate.ref(), 0x08],
    something: [connreq_1.Certificate.ref(), 0x10],
});
// server.ts
server_1.VanilaGameModuleServer.abstract({
    listener: [server_1.VanilaServerGameplayEventListener.ref(), 0x8]
});
server_1.DedicatedServer.abstract({});
server_1.Minecraft$Something.abstract({
    level: level_1.ServerLevel.ref(),
});
server_1.Minecraft.abstract({
    vftable: core_1.VoidPointer,
    vanillaGameModuleServer: [sharedpointer_1.SharedPtr, 0x28],
    server: server_1.DedicatedServer.ref(),
});
server_1.Minecraft.prototype.getLevel = proc_1.procHacker.js("Minecraft::getLevel", level_1.Level, { this: server_1.Minecraft });
server_1.Minecraft.prototype.getNetworkHandler = proc_1.procHacker.js("Minecraft::getNetworkHandler", networkidentifier_1.NetworkHandler, { this: server_1.Minecraft });
server_1.Minecraft.prototype.getServerNetworkHandler = proc_1.procHacker.js("Minecraft::getServerNetworkHandler", networkidentifier_1.ServerNetworkHandler, { this: server_1.Minecraft });
server_1.Minecraft.prototype.getCommands = proc_1.procHacker.js("Minecraft::getCommands", command_1.MinecraftCommands, { this: server_1.Minecraft });
server_1.ScriptFramework.abstract({
    vftable: core_1.VoidPointer,
});
server_1.ServerInstance.abstract({
    vftable: core_1.VoidPointer,
    server: [server_1.DedicatedServer.ref(), 0x98],
    minecraft: [server_1.Minecraft.ref(), 0xa0],
    networkHandler: [networkidentifier_1.NetworkHandler.ref(), 0xa8],
});
server_1.ServerInstance.prototype._disconnectAllClients = proc_1.procHacker.js("ServerInstance::disconnectAllClientsWithMessage", nativetype_1.void_t, { this: server_1.ServerInstance }, nativetype_1.CxxString);
// gamemode.ts
gamemode_1.GameMode.define({
    actor: [actor_1.Actor.ref(), 8]
});
// inventory.ts
inventory_1.Item.prototype.allowOffhand = proc_1.procHacker.js("Item::allowOffhand", nativetype_1.bool_t, { this: inventory_1.Item });
inventory_1.Item.prototype.isDamageable = proc_1.procHacker.js("Item::isDamageable", nativetype_1.bool_t, { this: inventory_1.Item });
inventory_1.Item.prototype.isFood = proc_1.procHacker.js("Item::isFood", nativetype_1.bool_t, { this: inventory_1.Item });
inventory_1.Item.prototype.setAllowOffhand = proc_1.procHacker.js("Item::setAllowOffhand", nativetype_1.void_t, { this: inventory_1.Item }, nativetype_1.bool_t);
inventory_1.Item.prototype.getCommandNames = proc_1.procHacker.js("Item::getCommandNames", cxxvector_1.CxxVector.make(nativetype_1.CxxStringWith8Bytes), { this: inventory_1.Item, structureReturn: true });
inventory_1.Item.prototype.getCommandNames2 = proc_1.procHacker.js("Item::getCommandNames", cxxvector_1.CxxVector.make(commandname_1.CommandName), { this: inventory_1.Item, structureReturn: true });
inventory_1.Item.prototype.getCreativeCategory = proc_1.procHacker.js("Item::getCreativeCategory", nativetype_1.int32_t, { this: inventory_1.Item });
inventory_1.ItemStack.prototype._getArmorValue = proc_1.procHacker.js('ArmorItem::getArmorValue', nativetype_1.int32_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.setAuxValue = proc_1.procHacker.js('ItemStackBase::setAuxValue', nativetype_1.void_t, { this: inventory_1.ItemStack }, nativetype_1.int16_t);
inventory_1.ItemStack.prototype.getAuxValue = proc_1.procHacker.js('ItemStackBase::getAuxValue', nativetype_1.int16_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.toString = proc_1.procHacker.js('ItemStackBase::toString', nativetype_1.CxxString, { this: inventory_1.ItemStack, structureReturn: true });
inventory_1.ItemStack.prototype.toDebugString = proc_1.procHacker.js('ItemStackBase::toDebugString', nativetype_1.CxxString, { this: inventory_1.ItemStack, structureReturn: true });
inventory_1.ItemStack.prototype.getMaxStackSize = proc_1.procHacker.js('ItemStackBase::getMaxStackSize', nativetype_1.int32_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype._cloneItem = proc_1.procHacker.js('ItemStack::clone', nativetype_1.void_t, { this: inventory_1.ItemStack }, inventory_1.ItemStack);
inventory_1.ItemStack.prototype.getId = proc_1.procHacker.js("ItemStackBase::getId", nativetype_1.int16_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getRawNameId = proc_1.procHacker.js("ItemStackBase::getRawNameId", nativetype_1.CxxString, { this: inventory_1.ItemStack, structureReturn: true });
inventory_1.ItemStack.prototype._getItem = proc_1.procHacker.js("ItemStackBase::getItem", inventory_1.Item, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getCustomName = proc_1.procHacker.js("ItemStackBase::getName", nativetype_1.CxxString, { this: inventory_1.ItemStack, structureReturn: true });
inventory_1.ItemStack.prototype.setCustomName = proc_1.procHacker.js("ItemStackBase::setCustomName", nativetype_1.void_t, { this: inventory_1.ItemStack }, nativetype_1.CxxString);
inventory_1.ItemStack.prototype._setCustomLore = proc_1.procHacker.js("ItemStackBase::setCustomLore", nativetype_1.void_t, { this: inventory_1.ItemStack }, cxxvector_1.CxxVector.make(pointer_1.CxxStringWrapper));
inventory_1.ItemStack.prototype.getUserData = proc_1.procHacker.js("ItemStackBase::getUserData", nbt_1.CompoundTag, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.hasCustomName = proc_1.procHacker.js("ItemStackBase::hasCustomHoverName", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isBlock = proc_1.procHacker.js("ItemStackBase::isBlock", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isNull = proc_1.procHacker.js("ItemStackBase::isNull", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getEnchantValue = proc_1.procHacker.js("ItemStackBase::getEnchantValue", nativetype_1.int32_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isEnchanted = proc_1.procHacker.js("ItemStackBase::isEnchanted", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.setDamageValue = proc_1.procHacker.js("ItemStackBase::setDamageValue", nativetype_1.void_t, { this: inventory_1.ItemStack }, nativetype_1.int32_t);
inventory_1.ItemStack.prototype.setItem = proc_1.procHacker.js("ItemStackBase::_setItem", nativetype_1.bool_t, { this: inventory_1.ItemStack }, nativetype_1.int32_t);
inventory_1.ItemStack.prototype.startCoolDown = proc_1.procHacker.js("ItemStackBase::startCoolDown", nativetype_1.void_t, { this: inventory_1.ItemStack }, player_1.ServerPlayer);
inventory_1.ItemStack.prototype.load = proc_1.procHacker.js("ItemStackBase::load", nativetype_1.void_t, { this: inventory_1.ItemStack }, nbt_1.CompoundTag);
inventory_1.ItemStack.prototype.sameItem = proc_1.procHacker.js("?sameItem@ItemStackBase@@QEBA_NAEBV1@@Z", nativetype_1.bool_t, { this: inventory_1.ItemStack }, inventory_1.ItemStack);
inventory_1.ItemStack.prototype.isStackedByData = proc_1.procHacker.js("ItemStackBase::isStackedByData", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isStackable = proc_1.procHacker.js("ItemStackBase::isStackable", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isPotionItem = proc_1.procHacker.js("ItemStackBase::isPotionItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isPattern = proc_1.procHacker.js("ItemStackBase::isPattern", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isMusicDiscItem = proc_1.procHacker.js("ItemStackBase::isMusicDiscItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isLiquidClipItem = proc_1.procHacker.js("ItemStackBase::isLiquidClipItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isHorseArmorItem = proc_1.procHacker.js("ItemStackBase::isHorseArmorItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isGlint = proc_1.procHacker.js("ItemStackBase::isGlint", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isFullStack = proc_1.procHacker.js("ItemStackBase::isFullStack", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isFireResistant = proc_1.procHacker.js("ItemStackBase::isFireResistant", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isExplodable = proc_1.procHacker.js("ItemStackBase::isExplodable", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isDamaged = proc_1.procHacker.js("ItemStackBase::isDamaged", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isDamageableItem = proc_1.procHacker.js("ItemStackBase::isDamageableItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isArmorItem = proc_1.procHacker.js("ItemStackBase::isArmorItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getComponentItem = proc_1.procHacker.js("ItemStackBase::getComponentItem", inventory_1.ComponentItem, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getMaxDamage = proc_1.procHacker.js("ItemStackBase::getMaxDamage", nativetype_1.int32_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getDamageValue = proc_1.procHacker.js("ItemStackBase::getDamageValue", nativetype_1.int32_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.isWearableItem = proc_1.procHacker.js("ItemStackBase::isWearableItem", nativetype_1.bool_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.getAttackDamage = proc_1.procHacker.js("ItemStackBase::getAttackDamage", nativetype_1.int32_t, { this: inventory_1.ItemStack });
inventory_1.ItemStack.prototype.constructItemEnchantsFromUserData = proc_1.procHacker.js("ItemStackBase::constructItemEnchantsFromUserData", enchants_1.ItemEnchants, { this: inventory_1.ItemStack, structureReturn: true });
const CommandUtils$createItemStack = proc_1.procHacker.js("CommandUtils::createItemStack", inventory_1.ItemStack, null, inventory_1.ItemStack, nativetype_1.CxxString, nativetype_1.int32_t, nativetype_1.int32_t);
inventory_1.ItemStack.create = function (itemName, amount = 1, data = 0) {
    const itemStack = inventory_1.ItemStack.construct();
    CommandUtils$createItemStack(itemStack, itemName, amount, data);
    return itemStack;
};
inventory_1.ItemStack.fromDescriptor = proc_1.procHacker.js("ItemStack::fromDescriptor", inventory_1.ItemStack, { structureReturn: true }, inventory_1.NetworkItemStackDescriptor, level_1.BlockPalette, nativetype_1.bool_t);
inventory_1.PlayerInventory.prototype.getSlotWithItem = proc_1.procHacker.js('PlayerInventory::getSlotWithItem', nativetype_1.int32_t, { this: inventory_1.PlayerInventory }, inventory_1.ItemStack, nativetype_1.bool_t, nativetype_1.bool_t);
inventory_1.PlayerInventory.prototype.addItem = proc_1.procHacker.js("PlayerInventory::add", nativetype_1.bool_t, { this: inventory_1.PlayerInventory }, inventory_1.ItemStack, nativetype_1.bool_t);
inventory_1.PlayerInventory.prototype.clearSlot = proc_1.procHacker.js("PlayerInventory::clearSlot", nativetype_1.void_t, { this: inventory_1.PlayerInventory }, nativetype_1.int32_t, nativetype_1.int32_t);
inventory_1.PlayerInventory.prototype.getContainerSize = proc_1.procHacker.js("PlayerInventory::getContainerSize", nativetype_1.int32_t, { this: inventory_1.PlayerInventory }, nativetype_1.int32_t);
inventory_1.PlayerInventory.prototype.getFirstEmptySlot = proc_1.procHacker.js("PlayerInventory::getFirstEmptySlot", nativetype_1.int32_t, { this: inventory_1.PlayerInventory });
inventory_1.PlayerInventory.prototype.getHotbarSize = proc_1.procHacker.js("PlayerInventory::getHotbarSize", nativetype_1.int32_t, { this: inventory_1.PlayerInventory });
inventory_1.PlayerInventory.prototype.getItem = proc_1.procHacker.js("PlayerInventory::getItem", inventory_1.ItemStack, { this: inventory_1.PlayerInventory }, nativetype_1.int32_t, nativetype_1.int32_t);
inventory_1.PlayerInventory.prototype.getSelectedItem = proc_1.procHacker.js("PlayerInventory::getSelectedItem", inventory_1.ItemStack, { this: inventory_1.PlayerInventory });
inventory_1.PlayerInventory.prototype.getSlots = proc_1.procHacker.js("PlayerInventory::getSlots", cxxvector_1.CxxVector.make(inventory_1.ItemStack.ref()), { this: inventory_1.PlayerInventory, structureReturn: true });
inventory_1.PlayerInventory.prototype.selectSlot = proc_1.procHacker.js("PlayerInventory::selectSlot", nativetype_1.void_t, { this: inventory_1.PlayerInventory }, nativetype_1.int32_t, nativetype_1.int32_t);
inventory_1.PlayerInventory.prototype.setItem = proc_1.procHacker.js("PlayerInventory::setItem", nativetype_1.void_t, { this: inventory_1.PlayerInventory }, nativetype_1.int32_t, inventory_1.ItemStack, nativetype_1.int32_t, nativetype_1.bool_t);
inventory_1.PlayerInventory.prototype.setSelectedItem = proc_1.procHacker.js("PlayerInventory::setSelectedItem", nativetype_1.void_t, { this: inventory_1.PlayerInventory }, inventory_1.ItemStack);
inventory_1.PlayerInventory.prototype.swapSlots = proc_1.procHacker.js("PlayerInventory::swapSlots", nativetype_1.void_t, { this: inventory_1.PlayerInventory }, nativetype_1.int32_t, nativetype_1.int32_t);
inventory_1.InventoryTransaction.prototype.addItemToContent = proc_1.procHacker.js("InventoryTransaction::addItemToContent", nativetype_1.void_t, { this: inventory_1.InventoryTransaction }, inventory_1.ItemStack, nativetype_1.int32_t);
inventory_1.InventoryTransaction.prototype._getActions = proc_1.procHacker.js("InventoryTransaction::getActions", cxxvector_1.CxxVector.make(inventory_1.InventoryAction), { this: inventory_1.InventoryTransaction }, inventory_1.InventorySource);
inventory_1.InventoryTransactionItemGroup.prototype.getItemStack = proc_1.procHacker.js("InventoryTransactionItemGroup::getItemInstance", inventory_1.ItemStack, { this: inventory_1.InventoryTransaction, structureReturn: true });
// block.ts
block_1.BlockLegacy.prototype.getCommandNames = proc_1.procHacker.js("BlockLegacy::getCommandNames", cxxvector_1.CxxVector.make(nativetype_1.CxxStringWith8Bytes), { this: inventory_1.Item, structureReturn: true });
block_1.BlockLegacy.prototype.getCommandNames2 = proc_1.procHacker.js("BlockLegacy::getCommandNames", cxxvector_1.CxxVector.make(commandname_1.CommandName), { this: inventory_1.Item, structureReturn: true });
block_1.BlockLegacy.prototype.getCreativeCategory = proc_1.procHacker.js("BlockLegacy::getCreativeCategory", nativetype_1.int32_t, { this: block_1.Block });
block_1.BlockLegacy.prototype.setDestroyTime = proc_1.procHacker.js("BlockLegacy::setDestroyTime", nativetype_1.void_t, { this: block_1.Block }, nativetype_1.float32_t);
block_1.Block.prototype._getName = proc_1.procHacker.js("Block::getName", hashedstring_1.HashedString, { this: block_1.Block });
block_1.Block.create = function (blockName, data = 0) {
    const itemStack = inventory_1.ItemStack.create(blockName, 1, data);
    if (itemStack.isBlock()) {
        const block = itemStack.block;
        itemStack.destruct();
        return block;
    }
    itemStack.destruct();
    return null;
};
block_1.Block.prototype.getDescriptionId = proc_1.procHacker.js("Block::getDescriptionId", nativetype_1.CxxString, { this: block_1.Block, structureReturn: true });
block_1.BlockSource.prototype._setBlock = proc_1.procHacker.js("?setBlock@BlockSource@@QEAA_NHHHAEBVBlock@@H@Z", nativetype_1.bool_t, { this: block_1.BlockSource }, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.int32_t, block_1.Block, nativetype_1.int32_t);
block_1.BlockSource.prototype.getBlock = proc_1.procHacker.js("BlockSource::getBlock", block_1.Block, { this: block_1.BlockSource }, blockpos_1.BlockPos);
const UpdateBlockPacket$UpdateBlockPacket = proc_1.procHacker.js("UpdateBlockPacket::UpdateBlockPacket", nativetype_1.void_t, null, packets_1.UpdateBlockPacket, blockpos_1.BlockPos, nativetype_1.uint32_t, block_1.Block, nativetype_1.uint8_t);
block_1.BlockSource.prototype.setBlock = function (blockPos, block) {
    const retval = this._setBlock(blockPos.x, blockPos.y, blockPos.z, block, 0);
    const pk = packets_1.UpdateBlockPacket.create();
    UpdateBlockPacket$UpdateBlockPacket(pk, blockPos, 0, block, 3);
    for (const player of server_1.serverInstance.minecraft.getLevel().players) {
        player.sendNetworkPacket(pk);
    }
    pk.dispose();
    return retval;
};
// abilties.ts
abilities_1.Abilities.prototype.getCommandPermissionLevel = proc_1.procHacker.js("Abilities::getCommandPermissions", nativetype_1.int32_t, { this: abilities_1.Abilities });
abilities_1.Abilities.prototype.getPlayerPermissionLevel = proc_1.procHacker.js("Abilities::getPlayerPermissions", nativetype_1.int32_t, { this: abilities_1.Abilities });
abilities_1.Abilities.prototype.setCommandPermissionLevel = proc_1.procHacker.js("Abilities::setCommandPermissions", nativetype_1.void_t, { this: abilities_1.Abilities }, nativetype_1.int32_t);
abilities_1.Abilities.prototype.setPlayerPermissionLevel = proc_1.procHacker.js("Abilities::setPlayerPermissions", nativetype_1.void_t, { this: abilities_1.Abilities }, nativetype_1.int32_t);
abilities_1.Abilities.prototype.getAbility = proc_1.procHacker.js("Abilities::getAbility", abilities_1.Ability, { this: abilities_1.Abilities }, nativetype_1.uint8_t);
abilities_1.Abilities.prototype._setAbility = proc_1.procHacker.js("Abilities::setAbility", nativetype_1.void_t, { this: abilities_1.Abilities }, nativetype_1.uint8_t, nativetype_1.bool_t);
const Abilities$getAbilityName = proc_1.procHacker.js("Abilities::getAbilityName", core_1.StaticPointer, null, nativetype_1.uint16_t);
abilities_1.Abilities.getAbilityName = function (abilityIndex) {
    const name = Abilities$getAbilityName(abilityIndex);
    return name.getString();
};
const Abilities$nameToAbilityIndex = proc_1.procHacker.js("Abilities::nameToAbilityIndex", nativetype_1.int16_t, null, nativetype_1.CxxString); // Will return -1 if not found, so int16 instead of uint16
abilities_1.Abilities.nameToAbilityIndex = function (name) {
    return Abilities$nameToAbilityIndex(name.toLowerCase());
};
abilities_1.Ability.abstract({
    type: nativetype_1.int32_t,
    value: abilities_1.Ability.Value,
    options: nativetype_1.int32_t,
});
abilities_1.Ability.prototype.getBool = proc_1.procHacker.js("Ability::getBool", nativetype_1.bool_t, { this: abilities_1.Ability });
abilities_1.Ability.prototype.getFloat = proc_1.procHacker.js("Ability::getFloat", nativetype_1.float32_t, { this: abilities_1.Ability });
abilities_1.Ability.prototype.setBool = proc_1.procHacker.js("Ability::setBool", nativetype_1.void_t, { this: abilities_1.Ability }, nativetype_1.bool_t);
// gamerules.ts
const GameRules$getRule = proc_1.procHacker.js("GameRules::getRule", gamerules_1.GameRule.ref(), { this: gamerules_1.GameRules }, pointer_1.Wrapper.make(nativetype_1.int32_t));
gamerules_1.GameRules.prototype.getRule = function (id) {
    const wrapper = pointer_1.Wrapper.make(nativetype_1.int32_t).construct();
    wrapper.value = id;
    const retval = GameRules$getRule.call(this, wrapper);
    wrapper.destruct();
    return retval;
};
const GameRules$hasRule = proc_1.procHacker.js("GameRules::hasRule", nativetype_1.bool_t, { this: gamerules_1.GameRules }, pointer_1.Wrapper.make(nativetype_1.int32_t));
gamerules_1.GameRules.prototype.hasRule = function (id) {
    const wrapper = pointer_1.Wrapper.make(nativetype_1.int32_t).construct();
    wrapper.value = id;
    const retval = GameRules$hasRule.call(this, wrapper);
    wrapper.destruct();
    return retval;
};
const GameRules$$nameToGameRuleIndex = proc_1.procHacker.js("GameRules::nameToGameRuleIndex", pointer_1.Wrapper.make(nativetype_1.int32_t), null, gamerules_1.GameRules, pointer_1.Wrapper.make(nativetype_1.int32_t), nativetype_1.CxxString); // Will return -1 if not found, so int32 instead of uint32
gamerules_1.GameRules.nameToGameRuleIndex = function (name) {
    const rules = mcglobal_1.mcglobal.level.getGameRules();
    const ruleId = rules.nameToGameRuleIndex(name);
    return ruleId.value;
};
gamerules_1.GameRule.abstract({
    shouldSave: nativetype_1.bool_t,
    type: nativetype_1.uint8_t,
    value: [gamerules_1.GameRule.Value, 0x04],
});
gamerules_1.GameRule.prototype.getBool = proc_1.procHacker.js("GameRule::getBool", nativetype_1.bool_t, { this: gamerules_1.GameRule });
gamerules_1.GameRule.prototype.getInt = proc_1.procHacker.js("GameRule::getInt", nativetype_1.int32_t, { this: gamerules_1.GameRule });
gamerules_1.GameRule.prototype.getFloat = proc_1.procHacker.js("GameRule::getFloat", nativetype_1.float32_t, { this: gamerules_1.GameRule });
// scoreboard.ts
scoreboard_1.Scoreboard.prototype.clearDisplayObjective = proc_1.procHacker.js("ServerScoreboard::clearDisplayObjective", scoreboard_1.Objective, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString);
scoreboard_1.Scoreboard.prototype.setDisplayObjective = proc_1.procHacker.js("ServerScoreboard::setDisplayObjective", scoreboard_1.DisplayObjective, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString, scoreboard_1.Objective, nativetype_1.uint8_t);
scoreboard_1.Scoreboard.prototype.addObjective = proc_1.procHacker.js("Scoreboard::addObjective", scoreboard_1.Objective, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString, nativetype_1.CxxString, scoreboard_1.ObjectiveCriteria);
scoreboard_1.Scoreboard.prototype.getCriteria = proc_1.procHacker.js("Scoreboard::getCriteria", scoreboard_1.ObjectiveCriteria, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString);
scoreboard_1.Scoreboard.prototype.getDisplayObjective = proc_1.procHacker.js("Scoreboard::getDisplayObjective", scoreboard_1.DisplayObjective, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString);
scoreboard_1.Scoreboard.prototype.getObjective = proc_1.procHacker.js("Scoreboard::getObjective", scoreboard_1.Objective, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString);
scoreboard_1.Scoreboard.prototype.getObjectiveNames = proc_1.procHacker.js("Scoreboard::getObjectiveNames", cxxvector_1.CxxVectorToArray.make(nativetype_1.CxxString), { this: scoreboard_1.Scoreboard, structureReturn: true });
scoreboard_1.Scoreboard.prototype.getObjectives = proc_1.procHacker.js("Scoreboard::getObjectives", cxxvector_1.CxxVectorToArray.make(scoreboard_1.Objective.ref()), { this: scoreboard_1.Scoreboard, structureReturn: true });
scoreboard_1.Scoreboard.prototype.getActorScoreboardId = proc_1.procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVActor@@@Z", scoreboard_1.ScoreboardId, { this: scoreboard_1.Scoreboard }, actor_1.Actor);
scoreboard_1.Scoreboard.prototype.getFakePlayerScoreboardId = proc_1.procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", scoreboard_1.ScoreboardId, { this: scoreboard_1.Scoreboard }, nativetype_1.CxxString);
scoreboard_1.Scoreboard.prototype.getPlayerScoreboardId = proc_1.procHacker.js("?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVPlayer@@@Z", scoreboard_1.ScoreboardId, { this: scoreboard_1.Scoreboard }, player_1.Player);
scoreboard_1.Scoreboard.prototype.getScoreboardIdentityRef = proc_1.procHacker.js("Scoreboard::getScoreboardIdentityRef", scoreboard_1.ScoreboardIdentityRef.ref(), { this: scoreboard_1.Scoreboard }, scoreboard_1.ScoreboardId);
scoreboard_1.Scoreboard.prototype._getScoreboardIdentityRefs = proc_1.procHacker.js("Scoreboard::getScoreboardIdentityRefs", cxxvector_1.CxxVector.make(scoreboard_1.ScoreboardIdentityRef), { this: scoreboard_1.Scoreboard }, cxxvector_1.CxxVector.make(scoreboard_1.ScoreboardIdentityRef));
scoreboard_1.Scoreboard.prototype._getTrackedIds = proc_1.procHacker.js("Scoreboard::getTrackedIds", cxxvector_1.CxxVector.make(scoreboard_1.ScoreboardId), { this: scoreboard_1.Scoreboard }, cxxvector_1.CxxVector.make(scoreboard_1.ScoreboardId));
scoreboard_1.Scoreboard.prototype.removeObjective = proc_1.procHacker.js("Scoreboard::removeObjective", nativetype_1.bool_t, { this: scoreboard_1.Scoreboard }, scoreboard_1.Objective);
scoreboard_1.Scoreboard.prototype.resetPlayerScore = proc_1.procHacker.js("?resetPlayerScore@Scoreboard@@QEAAXAEBUScoreboardId@@AEAVObjective@@@Z", nativetype_1.void_t, { this: scoreboard_1.Scoreboard }, scoreboard_1.ScoreboardId, scoreboard_1.Objective);
scoreboard_1.Scoreboard.prototype.sync = proc_1.procHacker.js("ServerScoreboard::onScoreChanged", nativetype_1.void_t, { this: scoreboard_1.Scoreboard }, scoreboard_1.ScoreboardId, scoreboard_1.Objective);
scoreboard_1.Objective.prototype.getPlayers = proc_1.procHacker.js("Objective::getPlayers", cxxvector_1.CxxVectorToArray.make(scoreboard_1.ScoreboardId), { this: scoreboard_1.Objective, structureReturn: true });
scoreboard_1.Objective.prototype.getPlayerScore = proc_1.procHacker.js("Objective::getPlayerScore", scoreboard_1.ScoreInfo, { this: scoreboard_1.Objective, structureReturn: true }, scoreboard_1.ScoreboardId);
scoreboard_1.IdentityDefinition.prototype.getEntityId = proc_1.procHacker.js("IdentityDefinition::getEntityId", actor_1.ActorUniqueID.ref(), { this: scoreboard_1.IdentityDefinition });
scoreboard_1.IdentityDefinition.prototype.getPlayerId = proc_1.procHacker.js("IdentityDefinition::getPlayerId", actor_1.ActorUniqueID.ref(), { this: scoreboard_1.IdentityDefinition });
scoreboard_1.IdentityDefinition.prototype.getFakePlayerName = proc_1.procHacker.js("IdentityDefinition::getFakePlayerName", nativetype_1.CxxString, { this: scoreboard_1.IdentityDefinition });
scoreboard_1.IdentityDefinition.prototype.getIdentityType = proc_1.procHacker.js("IdentityDefinition::getIdentityType", nativetype_1.uint8_t, { this: scoreboard_1.IdentityDefinition });
scoreboard_1.ScoreboardIdentityRef.prototype._modifyScoreInObjective = proc_1.procHacker.js("ScoreboardIdentityRef::modifyScoreInObjective", nativetype_1.bool_t, { this: scoreboard_1.ScoreboardIdentityRef }, core_1.StaticPointer, scoreboard_1.Objective, nativetype_1.int32_t, nativetype_1.uint8_t);
// effects.ts
effects_1.MobEffect.create = proc_1.procHacker.js("MobEffect::getById", effects_1.MobEffect, null, nativetype_1.int32_t);
effects_1.MobEffectInstance.prototype._create = proc_1.procHacker.js("??0MobEffectInstance@@QEAA@IHH_N00@Z", nativetype_1.void_t, { this: effects_1.MobEffectInstance }, nativetype_1.uint32_t, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.bool_t, nativetype_1.bool_t, nativetype_1.bool_t);
// enchants.ts
enchants_1.EnchantUtils.applyEnchant = proc_1.procHacker.js("?applyEnchant@EnchantUtils@@SA_NAEAVItemStackBase@@W4Type@Enchant@@H_N@Z", nativetype_1.bool_t, null, inventory_1.ItemStack, nativetype_1.int16_t, nativetype_1.int32_t, nativetype_1.bool_t);
enchants_1.EnchantUtils.getEnchantLevel = proc_1.procHacker.js("EnchantUtils::getEnchantLevel", nativetype_1.int32_t, null, nativetype_1.uint8_t, inventory_1.ItemStack);
enchants_1.EnchantUtils.hasCurse = proc_1.procHacker.js("EnchantUtils::hasCurse", nativetype_1.bool_t, null, inventory_1.ItemStack);
enchants_1.EnchantUtils.hasEnchant = proc_1.procHacker.js("EnchantUtils::hasEnchant", nativetype_1.bool_t, null, nativetype_1.int16_t, inventory_1.ItemStack);
// components.ts
components_1.OnHitSubcomponent.prototype.readfromJSON = makefunc_1.makefunc.js([0x08], nativetype_1.void_t, { this: components_1.OnHitSubcomponent }, connreq_1.JsonValue);
components_1.OnHitSubcomponent.prototype.writetoJSON = makefunc_1.makefunc.js([0x10], nativetype_1.void_t, { this: components_1.OnHitSubcomponent }, connreq_1.JsonValue);
components_1.OnHitSubcomponent.prototype._getName = makefunc_1.makefunc.js([0x20], core_1.StaticPointer, { this: components_1.OnHitSubcomponent });
//# sourceMappingURL=implements.js.map