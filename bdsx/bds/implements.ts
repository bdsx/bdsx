import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { bin } from "../bin";
import { capi } from "../capi";
import { commandParser } from "../commandparser";
import { CommandResult, CommandResultType } from "../commandresult";
import { AttributeName, VectorXYZ, abstract } from "../common";
import { AllocatedPointer, StaticPointer, VoidPointer } from "../core";
import { CxxPair } from "../cxxpair";
import { CxxVector, CxxVectorToArray } from "../cxxvector";
import { decay } from "../decay";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { makefunc } from "../makefunc";
import { mce } from "../mce";
import { AbstractClass, NativeClass, NativeClassType, nativeClass, nativeField, vectorDeletingDestructor } from "../nativeclass";
import {
    CxxString,
    CxxStringView,
    CxxStringWith8Bytes,
    NativeType,
    Type,
    bin64_t,
    bool_t,
    float32_t,
    int16_t,
    int32_t,
    int64_as_float_t,
    int8_t,
    uint16_t,
    uint32_t,
    uint8_t,
    void_t,
} from "../nativetype";
import { CxxStringWrapper, Wrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { CxxSharedPtr } from "../sharedpointer";
import { getEnumKeys } from "../util";
import { Abilities, AbilitiesIndex, AbilitiesLayer, Ability, LayeredAbilities } from "./abilities";
import {
    Actor,
    ActorDamageByActorSource,
    ActorDamageByBlockSource,
    ActorDamageByChildActorSource,
    ActorDamageCause,
    ActorDamageSource,
    ActorDataIDs,
    ActorDefinitionIdentifier,
    ActorRuntimeID,
    ActorType,
    ActorUniqueID,
    DimensionId,
    DistanceSortedActor,
    EntityContext,
    ItemActor,
    Mob,
    OwnerStorageEntity,
    SynchedActorDataEntityWrapper,
    WeakEntityRef,
} from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Bedrock } from "./bedrock";
import { Biome } from "./biome";
import { Block, BlockActor, BlockLegacy, BlockSource, BlockUtils, ChestBlockActor, PistonBlockActor } from "./block";
import { BlockPos, ChunkPos, RelativeFloat, Vec2, Vec3 } from "./blockpos";
import { ChunkSource, LevelChunk } from "./chunk";
import { CommandSymbols } from "./cmdsymbolloader";
import * as command from "./command";
import {
    Command,
    CommandContext,
    CommandOutput,
    CommandOutputParameter,
    CommandOutputType,
    CommandPermissionLevel,
    CommandPositionFloat,
    CommandRegistry,
    CommandVersion,
    MCRESULT,
} from "./command";
import { CommandName } from "./commandname";
import { CommandOrigin, ServerCommandOrigin, VirtualCommandOrigin } from "./commandorigin";
import "./commandparsertypes";
import {
    ActorDataFlagComponent,
    CommandBlockComponent,
    ConditionalBandwidthOptimizationComponent,
    ContainerComponent,
    DamageSensorComponent,
    HitResult,
    NameableComponent,
    NavigationComponent,
    NpcComponent,
    OnHitSubcomponent,
    Path,
    PhysicsComponent,
    ProjectileComponent,
    PushableComponent,
    RideableComponent,
    ShooterComponent,
} from "./components";
import { Certificate, ConnectionRequest, JsonValue } from "./connreq";
import { CxxOptional, CxxOptionalToUndefUnion } from "./cxxoptional";
import { Dimension } from "./dimension";
import { MobEffect, MobEffectInstance } from "./effects";
import { EnchantUtils, ItemEnchants } from "./enchants";
import { GameMode } from "./gamemode";
import { GameRule, GameRuleId, GameRules } from "./gamerules";
import { HashedString, HashedStringToString } from "./hashedstring";
import {
    ComponentItem,
    Container,
    EnderChestContainer,
    FillingContainer,
    Inventory,
    InventoryAction,
    InventorySource,
    InventoryTransaction,
    InventoryTransactionItemGroup,
    Item,
    ItemDescriptor,
    ItemStack,
    ItemStackBase,
    NetworkItemStackDescriptor,
    PlayerInventory,
    PlayerUIContainer,
    PlayerUISlot,
    SimpleContainer,
} from "./inventory";
import {
    ArmorItemComponent,
    CooldownItemComponent,
    DiggerItemComponent,
    DisplayNameItemComponent,
    DurabilityItemComponent,
    EntityPlacerItemComponent,
    FoodItemComponent,
    FuelItemComponent,
    IconItemComponent,
    ItemComponent,
    OnUseItemComponent,
    PlanterItemComponent,
    ProjectileItemComponent,
    RecordItemComponent,
    RenderOffsetsItemComponent,
    RepairableItemComponent,
    ShooterItemComponent,
    ThrowableItemComponent,
    WeaponItemComponent,
    WearableItemComponent,
    cereal,
} from "./item_component";
import { ActorFactory, AdventureSettings, BlockPalette, JsonUtil, Level, LevelData, ServerLevel, Spawner, TagRegistry } from "./level";
import {
    ByteArrayTag,
    ByteTag,
    CompoundTag,
    CompoundTagVariant,
    DoubleTag,
    EndTag,
    FloatTag,
    Int64Tag,
    IntArrayTag,
    IntTag,
    ListTag,
    NBT,
    ShortTag,
    StringTag,
    Tag,
    TagPointer,
} from "./nbt";
import { NetworkConnection, NetworkIdentifier, NetworkSystem, ServerNetworkHandler } from "./networkidentifier";
import { Packet } from "./packet";
import {
    AttributeData,
    BlockActorDataPacket,
    GameRulesChangedPacket,
    ItemStackRequestAction,
    ItemStackRequestBatch,
    ItemStackRequestData,
    ItemStackRequestPacket,
    PlayerAuthInputPacket,
    PlayerListEntry,
    PlayerListPacket,
    SetDifficultyPacket,
    SetTimePacket,
    UpdateAbilitiesPacket,
    UpdateAttributesPacket,
} from "./packets";
import { BatchedNetworkPeer } from "./peer";
import { Player, ServerPlayer, SimulatedPlayer } from "./player";
import { RakNet } from "./raknet";
import { RakNetConnector } from "./raknetinstance";
import { DisplayObjective, IdentityDefinition, Objective, ObjectiveCriteria, ScoreInfo, Scoreboard, ScoreboardId, ScoreboardIdentityRef } from "./scoreboard";
import {
    DedicatedServer,
    Minecraft,
    Minecraft$Something,
    ScriptFramework,
    SemVersion,
    ServerInstance,
    VanillaGameModuleServer,
    VanillaServerGameplayEventListener,
} from "./server";
import { WeakPtr } from "./sharedptr";
import { SerializedSkin } from "./skin";
import { BinaryStream } from "./stream";
import { StructureManager, StructureSettings, StructureTemplate, StructureTemplateData } from "./structure";
import { proc } from "./symbols";
import { WeakRefT } from "./weakreft";

// avoiding circular dependency

// Wrappers
const WrappedInt32 = Wrapper.make(int32_t);
// std::vector
const CxxVector$Vec3 = CxxVector.make(Vec3);
const CxxVector$string = CxxVector.make(CxxString);
const CxxVector$ScoreboardIdentityRef = CxxVector.make(ScoreboardIdentityRef);
const CxxVector$ScoreboardId = CxxVector.make(ScoreboardId);
const CxxVector$EntityContext = CxxVector.make(EntityContext);
const CxxVector$CommandName = CxxVector.make(CommandName);
const CxxVector$CxxStringWith8Bytes = CxxVector.make(CxxStringWith8Bytes);
const CxxVector$PlayerRef = CxxVector.make(Player.ref());
const CxxVector$ItemStackRequestActionRef = CxxVector.make(ItemStackRequestAction.ref());

// utils
namespace CommandUtils {
    export const createItemStack = procHacker.js(
        "?createItemStack@CommandUtils@@YA?AVItemStack@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@HH@Z",
        ItemStack,
        { structureReturn: true },
        CxxString,
        int32_t,
        int32_t,
    );
    export const spawnEntityAt = procHacker.js(
        "?spawnEntityAt@CommandUtils@@YAPEAVActor@@AEAVBlockSource@@AEBVVec3@@AEBUActorDefinitionIdentifier@@AEAUActorUniqueID@@PEAV2@@Z",
        Actor,
        null,
        BlockSource,
        Vec3,
        ActorDefinitionIdentifier,
        StaticPointer,
        VoidPointer,
    );
    export const getFeetPos = procHacker.js("?getFeetPos@CommandUtils@@YA?AVVec3@@PEBVActor@@@Z", Vec3, { structureReturn: true }, Actor);
}

namespace OnFireSystem {
    export const setOnFire = procHacker.js("?setOnFire@OnFireSystem@@SAXAEAVActor@@H@Z", void_t, null, Actor, int32_t);
    export const setOnFireNoEffects = procHacker.js("?setOnFireNoEffects@OnFireSystem@@SAXAEAVActor@@H@Z", void_t, null, Actor, int32_t);
}

// level.ts
// assume all Level is always ServerLevel.
const DimensionWeakRef = WeakRefT.make(Dimension);
Level.prototype.getOrCreateDimension = procHacker.js(
    "?getOrCreateDimension@Level@@UEAA?AV?$WeakRef@VDimension@@@@V?$AutomaticID@VDimension@@H@@@Z",
    DimensionWeakRef,
    { this: Level, structureReturn: true },
    int32_t,
);
Level.prototype.createDimension = function (id) {
    const ref = this.getOrCreateDimension(id);
    process.nextTick(() => ref.dispose());
    return ref.p!;
};
Level.prototype.destroyBlock = procHacker.js(
    "?destroyBlock@Level@@UEAA_NAEAVBlockSource@@AEBVBlockPos@@_N@Z",
    bool_t,
    { this: Level },
    BlockSource,
    BlockPos,
    bool_t,
);
Level.prototype.fetchEntity = procHacker.js("?fetchEntity@Level@@UEBAPEAVActor@@UActorUniqueID@@_N@Z", Actor, { this: Level }, bin64_t, bool_t);
Level.prototype.getActivePlayerCount = procHacker.js("?getActivePlayerCount@Level@@UEBAHXZ", int32_t, { this: Level });
Level.prototype.getActorFactory = procHacker.js("?getActorFactory@Level@@UEAAAEAVActorFactory@@XZ", ActorFactory, { this: Level });
Level.prototype.getAdventureSettings = procHacker.js("?getAdventureSettings@Level@@UEAAAEAUAdventureSettings@@XZ", AdventureSettings, { this: Level });
Level.prototype.getBlockPalette = procHacker.js("?getBlockPalette@Level@@UEAAAEAVBlockPalette@@XZ", BlockPalette, { this: Level });
Level.prototype.getDimension = function (id) {
    const ref = this.getDimensionWeakRef(id);
    const p = ref.p;
    if (p !== null) process.nextTick(() => ref.dispose());
    return p;
};
Level.prototype.getDimensionWeakRef = procHacker.js(
    "?getDimension@Level@@UEBA?AV?$WeakRef@VDimension@@@@V?$AutomaticID@VDimension@@H@@@Z",
    DimensionWeakRef,
    { this: Level, structureReturn: true },
    int32_t,
);
Level.prototype.getLevelData = procHacker.js("?getLevelData@Level@@UEAAAEAVLevelData@@XZ", LevelData.ref(), { this: Level });
Level.prototype.getGameRules = function () {
    return bedrockServer.gameRules;
};
Level.prototype.getScoreboard = procHacker.js("?getScoreboard@Level@@UEAAAEAVScoreboard@@XZ", Scoreboard, { this: Level });
Level.prototype.getSeed = procHacker.js("?getSeed@Level@@UEAAIXZ", uint32_t, {
    this: Level,
});

class StructureManagerShim extends StructureManager {
    [NativeType.dtor](): void {
        // empty
    }
}

Level.prototype.getStructureManager = function () {
    return bedrockServer.structureManager.as(StructureManagerShim);
};
Level.prototype.getSpawner = procHacker.js("?getSpawner@Level@@UEBAAEAVSpawner@@XZ", Spawner, { this: Level });
Level.prototype.getTagRegistry = procHacker.js(
    "?getTagRegistry@Level@@UEAAAEAV?$TagRegistry@U?$IDType@ULevelTagIDType@@@@U?$IDType@ULevelTagSetIDType@@@@@@XZ",
    TagRegistry,
    { this: Level },
);
Level.prototype.hasCommandsEnabled = procHacker.js("?hasCommandsEnabled@Level@@UEBA_NXZ", bool_t, { this: Level });
Level.prototype.setCommandsEnabled = procHacker.js("?setCommandsEnabled@ServerLevel@@UEAAX_N@Z", void_t, { this: ServerLevel }, bool_t);
Level.prototype.setShouldSendSleepMessage = procHacker.js("?setShouldSendSleepMessage@ServerLevel@@QEAAX_N@Z", void_t, { this: ServerLevel }, bool_t);
Level.prototype.getPlayerByXuid = procHacker.js(
    "?getPlayerByXuid@Level@@UEBAPEAVPlayer@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    Player,
    { this: Level },
    CxxString,
);

const unique_ptr$GameRulesChangedPacket = Wrapper.make(GameRulesChangedPacket.ref());
const GameRules$createAllGameRulesPacket = procHacker.js(
    "?createAllGameRulesPacket@GameRules@@QEBA?AV?$unique_ptr@VGameRulesChangedPacket@@U?$default_delete@VGameRulesChangedPacket@@@std@@@std@@XZ",
    unique_ptr$GameRulesChangedPacket,
    { this: GameRules },
    unique_ptr$GameRulesChangedPacket,
);
Level.prototype.syncGameRules = function () {
    const wrapper = new unique_ptr$GameRulesChangedPacket(true);
    GameRules$createAllGameRulesPacket.call(bedrockServer.gameRules, wrapper);
    for (const player of bedrockServer.serverInstance.getPlayers()) {
        player.sendNetworkPacket(wrapper.value);
    }
    wrapper.destruct();
};
Level.prototype.spawnParticleEffect = procHacker.js(
    "?spawnParticleEffect@Level@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVVec3@@PEAVDimension@@@Z",
    void_t,
    { this: Level },
    CxxString,
    Vec3,
    Dimension,
);
const level$setTime = procHacker.js("?setTime@Level@@UEAAXH@Z", void_t, { this: Level }, int64_as_float_t);
Level.prototype.setTime = function (time: number): void {
    level$setTime.call(this, time);
    const packet = SetTimePacket.allocate();
    packet.time = time;
    for (const player of bedrockServer.serverInstance.getPlayers()) {
        player.sendNetworkPacket(packet);
    }
    packet.dispose();
};

Level.prototype.getPlayers = function () {
    const out: ServerPlayer[] = [];
    for (const user of this.getUsers()) {
        const entity = Actor.tryGetFromEntity(user);
        if (!(entity instanceof ServerPlayer)) continue;
        out.push(entity);
    }
    return out;
};
Level.prototype.getUsers = procHacker.js(
    "?getUsers@Level@@UEBAAEBV?$vector@V?$OwnerPtr@VEntityContext@@@@V?$allocator@V?$OwnerPtr@VEntityContext@@@@@std@@@std@@XZ",
    CxxVector$EntityContext,
    { this: Level },
);
Level.prototype.getActiveUsers = procHacker.js(
    "?getActiveUsers@Level@@UEBAAEBV?$vector@VWeakEntityRef@@V?$allocator@VWeakEntityRef@@@std@@@std@@XZ",
    CxxVector.make(WeakEntityRef),
    { this: Level },
);
(Level.prototype as any)._getEntities = procHacker.js(
    "?getEntities@Level@@UEBAAEBV?$vector@V?$OwnerPtr@VEntityContext@@@@V?$allocator@V?$OwnerPtr@VEntityContext@@@@@std@@@std@@XZ",
    CxxVector$EntityContext,
    { this: Level },
);
Level.prototype.getEntities = function () {
    const out: Actor[] = [];
    for (const refTraits of (this as any)._getEntities()) {
        const entity = Actor.tryGetFromEntity(refTraits.context._getStackRef());
        if (entity === null) continue;
        out.push(entity);
    }
    return out;
};

const Level$getRuntimeEntity = procHacker.js("?getRuntimeEntity@Level@@UEBAPEAVActor@@VActorRuntimeID@@_N@Z", Actor, null, Level, ActorRuntimeID, bool_t);
Level.prototype.getRuntimeEntity = function (id, getRemoved = false) {
    return Level$getRuntimeEntity(this, id, getRemoved);
};
Level.prototype.getRuntimePlayer = procHacker.js("?getRuntimePlayer@Level@@UEBAPEAVPlayer@@VActorRuntimeID@@@Z", Player, { this: Level }, ActorRuntimeID);
Level.prototype.getTime = procHacker.js("?getTime@Level@@UEBAHXZ", int64_as_float_t, { this: Level });
Level.prototype.getCurrentTick = procHacker.js("?getCurrentTick@Level@@UEBAAEBUTick@@XZ", int64_as_float_t.ref(), { this: Level }); // You can run the server for 1.4202551784875594e+22 years till it exceeds the max safe integer

@nativeClass()
class GamePlayUserManager extends AbstractClass {
    getActiveGameplayUsers(): CxxVector<WeakEntityRef> {
        abstract();
    }
}
GamePlayUserManager.prototype.getActiveGameplayUsers = procHacker.js(
    "?getActiveGameplayUsers@GameplayUserManager@@QEBAAEBV?$vector@VWeakEntityRef@@V?$allocator@VWeakEntityRef@@@std@@@std@@XZ",
    CxxVector.make(WeakEntityRef),
    { this: GamePlayUserManager },
);

Level.prototype.getRandomPlayer = function () {
    const mgr = this.addAs(GamePlayUserManager, 0x2e30);
    const activePlayers = mgr.getActiveGameplayUsers();
    if (activePlayers.empty()) return null;
    const list = CxxVector$PlayerRef.construct(); // rsp+28
    if (!activePlayers.empty()) {
        for (const p of activePlayers) {
            const storage = new StackResultStorageEntity(true); // rsp+40
            storage.constructWith(p);
            const al = storage._hasValue();
            if (al) {
                const entityctx = storage._getStackRef();
                const player = ServerPlayer.tryGetFromEntity(entityctx, true); // rsp+20
                if (player !== null) {
                    list.push(player);
                }
            }
        }
    }
    let out: Player | null;
    if (!list.empty()) {
        out = list.get((Math.random() * list.size()) | 0);
        // const random = this.getRandom();
        // const idx = random[vftable + 8](list.size());
        // out = list.get(idx);
    } else {
        out = null;
    }
    list.destruct();
    return out;
};
Level.prototype.updateWeather = procHacker.js("?updateWeather@Level@@UEAAXMHMH@Z", void_t, { this: Level }, float32_t, int32_t, float32_t, int32_t);
Level.prototype.setDefaultSpawn = procHacker.js("?setDefaultSpawn@Level@@UEAAXAEBVBlockPos@@@Z", void_t, { this: Level }, BlockPos);
Level.prototype.getDefaultSpawn = procHacker.js("?getDefaultSpawn@Level@@UEBAAEBVBlockPos@@XZ", BlockPos, { this: Level });
Level.prototype.explode = procHacker.js(
    "?explode@Level@@UEAA_NAEAVBlockSource@@PEAVActor@@AEBVVec3@@M_N3M3@Z",
    bool_t,
    { this: Level },
    BlockSource,
    VoidPointer,
    Vec3,
    float32_t,
    bool_t,
    bool_t,
    float32_t,
    bool_t,
);
Level.prototype.getDifficulty = procHacker.js("?getDifficulty@Level@@UEBA?AW4Difficulty@@XZ", int32_t, { this: Level });
const Level$setDifficulty = procHacker.js("?setDifficulty@Level@@UEAAXW4Difficulty@@@Z", void_t, { this: Level }, int32_t);
Level.prototype.setDifficulty = function (difficulty) {
    Level$setDifficulty.call(this, difficulty);
    const pkt = SetDifficultyPacket.allocate();
    pkt.difficulty = difficulty;
    for (const player of this.getPlayers()) {
        player.sendNetworkPacket(pkt);
    }
    pkt.dispose();
};
Level.prototype.getNewUniqueID = procHacker.js("?getNewUniqueID@Level@@UEAA?AUActorUniqueID@@XZ", ActorUniqueID, { this: Level, structureReturn: true });
Level.prototype.getNextRuntimeID = procHacker.js("?getNextRuntimeID@Level@@UEAA?AVActorRuntimeID@@XZ", ActorRuntimeID, { this: Level, structureReturn: true });
Level.prototype.sendAllPlayerAbilities = procHacker.js("?sendAllPlayerAbilities@Level@@UEAAXAEBVPlayer@@@Z", void_t, { this: Level }, Player);

Level.abstract({
    vftable: VoidPointer,
});

ServerLevel.abstract({});

LevelData.prototype.getGameDifficulty = procHacker.js("?getGameDifficulty@LevelData@@QEBA?AW4Difficulty@@XZ", uint32_t, { this: LevelData });
LevelData.prototype.setGameDifficulty = procHacker.js("?setGameDifficulty@LevelData@@QEAAXW4Difficulty@@@Z", void_t, { this: LevelData }, uint32_t);

JsonUtil.getBlockLegacy = procHacker.js(
    "?getBlockLegacy@JsonUtil@@YAPEBVBlockLegacy@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    BlockLegacy,
    null,
    CxxString,
);

const Spawner$spawnItem = procHacker.js(
    "?spawnItem@Spawner@@QEAAPEAVItemActor@@AEAVBlockSource@@AEBVItemStack@@PEAVActor@@AEBVVec3@@H@Z",
    ItemActor,
    null,
    Spawner,
    BlockSource,
    ItemStack,
    VoidPointer,
    Vec3,
    int32_t,
);
Spawner.prototype.spawnItem = function (region: BlockSource, itemStack: ItemStack, pos: Vec3, throwTime: number): ItemActor {
    return Spawner$spawnItem(this, region, itemStack, null, pos, throwTime);
};
const Spawner$spawnMob = procHacker.js(
    "?spawnMob@Spawner@@QEAAPEAVMob@@AEAVBlockSource@@AEBUActorDefinitionIdentifier@@PEAVActor@@AEBVVec3@@_N44@Z",
    Actor,
    null,
    Spawner,
    BlockSource,
    ActorDefinitionIdentifier,
    VoidPointer,
    Vec3,
    bool_t,
    bool_t,
    bool_t,
);
Spawner.prototype.spawnMob = function (
    region: BlockSource,
    id: ActorDefinitionIdentifier,
    pos: Vec3,
    naturalSpawn = false,
    surface = true,
    fromSpawner = false,
): Actor {
    return Spawner$spawnMob(this, region, id, null, pos, naturalSpawn, surface, fromSpawner);
};

// dimension.ts
const fetchNearestAttackablePlayer$nonBlockPos = procHacker.js(
    "?fetchNearestAttackablePlayer@Dimension@@QEBAPEAVPlayer@@AEAVActor@@M@Z",
    Player,
    { this: Dimension },
    Actor,
    float32_t,
);
const fetchNearestAttackablePlayer$withBlockPos = procHacker.js(
    "?fetchNearestAttackablePlayer@Dimension@@QEBAPEAVPlayer@@VBlockPos@@MPEAVActor@@@Z",
    Player,
    { this: Dimension },
    BlockPos,
    float32_t,
    Actor,
);
Dimension.prototype.fetchNearestAttackablePlayer = function (actor: Actor, distance: number, blockPos?: BlockPos): Player {
    if (blockPos) {
        return fetchNearestAttackablePlayer$withBlockPos.call(this, blockPos, distance, actor);
    }
    return fetchNearestAttackablePlayer$nonBlockPos.call(this, actor, distance);
};
Dimension.prototype.getSunAngle = procHacker.js("?getSunAngle@Dimension@@QEBAMM@Z", float32_t, { this: Dimension });
Dimension.prototype.getTimeOfDay = procHacker.js("?getTimeOfDay@Dimension@@QEBAMM@Z", float32_t, { this: Dimension });
Dimension.prototype.isDay = procHacker.jsv("??_7OverworldDimension@@6BIDimension@@@", "?isDay@Dimension@@UEBA_NXZ", bool_t, { this: Dimension });
Dimension.prototype.distanceToNearestPlayerSqr2D = procHacker.js("?distanceToNearestPlayerSqr2D@Dimension@@QEAAMVVec3@@@Z", float32_t, { this: Dimension }, Vec3);
Dimension.prototype.transferEntityToUnloadedChunk = procHacker.js(
    "?transferEntityToUnloadedChunk@Dimension@@QEAAXAEAVActor@@PEAVLevelChunk@@@Z",
    void_t,
    { this: Dimension },
    Actor,
    LevelChunk,
);
Dimension.prototype.getSpawnPos = procHacker.jsv("??_7OverworldDimension@@6BIDimension@@@", "?getSpawnPos@Dimension@@UEBA?AVBlockPos@@XZ", BlockPos, {
    this: Dimension,
    structureReturn: true,
});
Dimension.prototype.getPlayers = function () {
    const id = this.getDimensionId();
    const players: Player[] = [];
    const users = bedrockServer.level.getActiveUsers();
    for (const user of users) {
        const player = user.tryUnwrapPlayer();
        if (player === null) continue;
        if (player.getDimensionId() !== id) continue;
        players.push(player);
    }
    return players;
};
Dimension.prototype.fetchNearestPlayerToActor = function (actor, distance) {
    const actorPos = actor.getPosition();
    return this.fetchNearestPlayerToPosition(actorPos.x, actorPos.y, actorPos.z, distance, false);
};
Dimension.prototype.fetchNearestPlayerToPosition = function (x, y, z, distance, findAnyNearPlayer) {
    let found: Player | null = null;
    let nearestDistSq = distance * distance;
    const pos = { x, y, z };
    const users = bedrockServer.level.getActiveUsers();
    for (const user of users) {
        const player = user.tryUnwrapPlayer();
        if (player === null) continue;
        const distSq = player.getPosition().distanceSq(pos);
        if (distSq <= nearestDistSq) {
            if (findAnyNearPlayer) return player;
            found = player;
            nearestDistSq = distSq;
        }
    }
    return found;
};
Dimension.prototype.getMoonBrightness = procHacker.js("?getMoonBrightness@Dimension@@QEBAMXZ", float32_t, { this: Dimension });
Dimension.prototype.getHeight = procHacker.js("?getHeight@Dimension@@QEBAFXZ", int16_t, { this: Dimension });

Dimension.prototype.tryGetClosestPublicRegion = function (chunkpos: ChunkPos) {
    return this.getBlockSource();
};
Dimension.prototype.removeActorByID = procHacker.js("?removeActorByID@Dimension@@QEAAXAEBUActorUniqueID@@@Z", void_t, { this: Dimension }, ActorUniqueID);
Dimension.prototype.getMinHeight = procHacker.js("?getMinHeight@Dimension@@QEBAFXZ", int16_t, { this: Dimension });
Dimension.prototype.getDefaultBiomeString = procHacker.jsv(
    "??_7NetherDimension@@6BIDimension@@@",
    "?getDefaultBiome@NetherDimension@@UEBA?AVHashedString@@XZ",
    HashedStringToString,
    { this: Dimension, structureReturn: true },
);
Dimension.prototype.getMoonPhase = procHacker.js("?getMoonPhase@Dimension@@QEBAHXZ", int32_t, { this: Dimension });

// actor.ts
const actorMaps = new Map<string, Actor>();
const ServerPlayer$vftable = proc["??_7ServerPlayer@@6B@"];
const ItemActor$vftable = proc["??_7ItemActor@@6B@"];
const SimulatedPlayer$vftable = proc["??_7SimulatedPlayer@@6B@"];
const Actor$teleportTo = procHacker.jsv(
    "??_7Actor@@6B@",
    "?teleportTo@Actor@@UEAAXAEBVVec3@@_NHH1@Z",
    void_t,
    { this: Actor },
    Vec3,
    bool_t,
    int32_t,
    int32_t,
    bool_t,
);
Actor.abstract({
    vftable: VoidPointer,
    ctxbase: EntityContext, // accessed in ServerNetworkHandler::_displayGameMessage before calling EntityContextBase::_enttRegistry
});

Actor.prototype.changeDimension = procHacker.jsv(
    "??_7Actor@@6B@",
    "?changeDimension@Actor@@UEAAXV?$AutomaticID@VDimension@@H@@@Z",
    void_t,
    { this: Actor },
    int32_t,
);
Actor.prototype.teleportTo = function (position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, unknown?: ActorUniqueID | bool_t) {
    if (typeof unknown === "string") unknown = false;
    Actor$teleportTo.call(this, position, shouldStopRiding, cause, sourceEntityType, unknown);
};

// `includeSimulatedPlayer` is for deprecated overload
Actor.prototype.isPlayer = function (includeSimulatedPlayer: boolean = false) {
    return this instanceof ServerPlayer;
};
Actor.prototype.isSimulatedPlayer = function () {
    return this instanceof SimulatedPlayer;
};

Actor.setResolver(ptr => {
    if (ptr === null) return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMaps.get(binptr);
    if (actor != null) return actor;
    const vftable = ptr.getPointer();
    if (vftable.equalsptr(SimulatedPlayer$vftable)) {
        actor = ptr.as(SimulatedPlayer);
    } else if (vftable.equalsptr(ServerPlayer$vftable)) {
        actor = ptr.as(ServerPlayer);
    } else if (vftable.equalsptr(ItemActor$vftable)) {
        actor = ptr.as(ItemActor);
    } else if (Actor$hasType.call(ptr, ActorType.Mob)) {
        actor = ptr.as(Mob);
    } else {
        actor = ptr.as(Actor);
    }
    actorMaps.set(binptr, actor);
    return actor;
});
Actor.all = function (): IterableIterator<Actor> {
    return actorMaps.values();
};

Actor.summonAt = function (
    region: BlockSource,
    pos: Vec3,
    type: ActorDefinitionIdentifier | ActorType,
    id: ActorUniqueID | int64_as_float_t | Actor = -1,
    summoner: Actor | null = null,
): Actor {
    const ptr = new AllocatedPointer(8);
    switch (typeof id) {
        case "number":
            ptr.setInt64WithFloat(id);
            break;
        case "string":
            ptr.setBin(id);
            break;
        case "object":
            ptr.setInt64WithFloat(-1);
            summoner = id;
            break;
    }
    if (!(type instanceof ActorDefinitionIdentifier)) {
        type = ActorDefinitionIdentifier.constructWith(type);
        const res = CommandUtils.spawnEntityAt(region, pos, type, ptr, summoner);
        type.destruct();
        return res;
    } else {
        return CommandUtils.spawnEntityAt(region, pos, type, ptr, summoner);
    }
};
Actor.prototype.addItem = procHacker.js("?add@Actor@@UEAA_NAEAVItemStack@@@Z", bool_t, { this: Actor }, ItemStack);
Actor.prototype.getAttributes = procHacker.js("?getAttributes@Actor@@QEAA?AV?$not_null@PEAVBaseAttributeMap@@@gsl@@XZ", BaseAttributeMap.ref(), {
    this: Actor,
    structureReturn: true,
});
Actor.prototype.getNameTag = procHacker.js("?getNameTag@Actor@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, { this: Actor });
Actor.prototype.setNameTag = procHacker.js(
    "?setNameTag@Actor@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: Actor },
    CxxString,
);
Actor.prototype.setNameTagVisible = procHacker.js("?setNameTagVisible@Actor@@QEAAX_N@Z", void_t, { this: Actor }, bool_t);
Actor.prototype.addTag = procHacker.js(
    "?addTag@Actor@@QEAA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    bool_t,
    { this: Actor },
    CxxString,
);
Actor.prototype.hasTag = procHacker.js(
    "?hasTag@Actor@@QEBA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    bool_t,
    { this: Actor },
    CxxString,
);
Actor.prototype.despawn = procHacker.js("?despawn@Actor@@UEAAXXZ", void_t, {
    this: Actor,
});
Actor.prototype.removeTag = procHacker.js(
    "?removeTag@Actor@@QEAA_NAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    bool_t,
    { this: Actor },
    CxxString,
);
Actor.prototype.getPosition = procHacker.js("?getPosition@Actor@@QEBAAEBVVec3@@XZ", Vec3, { this: Actor });
Actor.prototype.getFeetPos = function (): Vec3 {
    return CommandUtils.getFeetPos(this);
};
Actor.prototype.getRotation = procHacker.js("?getRotation@Actor@@QEBAAEBVVec2@@XZ", Vec2, { this: Actor });

const SynchedActorDataEntityWrapper$getString = procHacker.js(
    "?getString@SynchedActorDataEntityWrapper@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@G@Z",
    CxxString,
    null,
    VoidPointer,
    uint16_t,
);
Actor.prototype.getScoreTag = function () {
    // accessed from Actor::setScoreTag
    return SynchedActorDataEntityWrapper$getString(this.getEntityData(), 0x54);
};
Actor.prototype.setScoreTag = procHacker.js(
    "?setScoreTag@Actor@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: Actor },
    CxxString,
);
Actor.prototype.getDimensionBlockSource = Actor.prototype.getRegion = procHacker.js("?getDimensionBlockSource@Actor@@QEBAAEAVBlockSource@@XZ", BlockSource, {
    this: Actor,
});
Actor.prototype.getUniqueIdPointer = procHacker.js("?getOrCreateUniqueID@Actor@@QEBAAEBUActorUniqueID@@XZ", StaticPointer, { this: Actor });
Actor.prototype.getEntityTypeId = procHacker.js("?getEntityTypeId@Actor@@QEBA?AW4ActorType@@XZ", int32_t, { this: Actor }); // ActorType getEntityTypeId()
Actor.prototype.getRuntimeID = procHacker.js("?getRuntimeID@Actor@@QEBA?AVActorRuntimeID@@XZ", ActorRuntimeID, { this: Actor, structureReturn: true });
Actor.prototype.getDimension = procHacker.js("?getDimension@Actor@@QEBAAEAVDimension@@XZ", Dimension, { this: Actor });
Actor.prototype.getDimensionId = procHacker.js("?getDimensionId@Actor@@QEBA?AV?$AutomaticID@VDimension@@H@@XZ", int32_t, { this: Actor, structureReturn: true });
Actor.prototype.getActorIdentifier = procHacker.js("?getActorIdentifier@Actor@@QEBAAEBUActorDefinitionIdentifier@@XZ", ActorDefinitionIdentifier, { this: Actor });
Actor.prototype.getCommandPermissionLevel = procHacker.js("?getCommandPermissionLevel@Actor@@UEBA?AW4CommandPermissionLevel@@XZ", int32_t, { this: Actor });
Actor.prototype.getCarriedItem = procHacker.js("?getCarriedItem@Actor@@UEBAAEBVItemStack@@XZ", ItemStack, { this: Actor });
Actor.prototype.setCarriedItem = procHacker.jsv("??_7Actor@@6B@", "?setCarriedItem@Actor@@UEAAXAEBVItemStack@@@Z", void_t, { this: Actor }, ItemStack); // Actor::setCarriedItem Agent::setCarriedItem Player::setCarriedItem
Actor.prototype.getOffhandSlot = procHacker.js("?getOffhandSlot@Actor@@QEBAAEBVItemStack@@XZ", ItemStack, { this: Actor });
Actor.prototype.setOffhandSlot = procHacker.js("?setOffhandSlot@Actor@@UEAAXAEBVItemStack@@@Z", void_t, { this: Actor }, ItemStack);

@nativeClass()
class TeleportRotationData extends NativeClass {
    @nativeField(RelativeFloat)
    rx: RelativeFloat;
    @nativeField(RelativeFloat)
    ry: RelativeFloat;
    @nativeField(Vec2)
    pos: Vec2;
}

const TeleportCommand$computeTarget = procHacker.js(
    "?computeTarget@TeleportCommand@@SA?AVTeleportTarget@@AEAVActor@@VVec3@@PEAV4@V?$AutomaticID@VDimension@@H@@AEBV?$optional@VRotationData@RotationCommandUtils@@@std@@H@Z",
    void_t,
    null,
    StaticPointer,
    Actor,
    Vec3,
    Vec3,
    int32_t,
    CxxOptionalToUndefUnion.make(TeleportRotationData),
    int32_t,
);
const TeleportCommand$applyTarget = procHacker.js("?applyTarget@TeleportCommand@@SAXAEAVActor@@VTeleportTarget@@_N@Z", void_t, null, Actor, StaticPointer, bool_t);
Actor.prototype.teleport = function (pos: Vec3, dimensionId: DimensionId = DimensionId.Overworld, facePosition: Vec3 | null = null) {
    const target = new AllocatedPointer(0x80);
    const unknownParam = false;
    TeleportCommand$computeTarget(target, this, pos, facePosition, dimensionId, undefined, 0); // it allocates `target`
    TeleportCommand$applyTarget(this, target, unknownParam); // it deletes `target`
};
Actor.prototype.getArmor = procHacker.js("?getArmor@Actor@@QEBAAEBVItemStack@@W4ArmorSlot@@@Z", ItemStack, { this: Actor }, int32_t);

const Actor$hasType = (Actor.prototype.hasType = procHacker.js("?hasType@Actor@@QEBA_NW4ActorType@@@Z", bool_t, { this: Actor }, int32_t));
Actor.prototype.isType = procHacker.js("?isType@Actor@@QEBA_NW4ActorType@@@Z", bool_t, { this: Actor }, int32_t);

Actor.prototype.kill = procHacker.jsv("??_7Actor@@6B@", "?kill@Actor@@UEAAXXZ", void_t, { this: Actor });
Actor.prototype.die = procHacker.jsv("??_7Actor@@6B@", "?die@Actor@@UEAAXAEBVActorDamageSource@@@Z", void_t, { this: Actor }, ActorDamageSource);
Actor.prototype.isSneaking = procHacker.js("?isSneaking@Actor@@QEBA_NXZ", bool_t, { this: Actor }, void_t);
Actor.prototype.isMoving = procHacker.js("?isMoving@Actor@@QEBA_NXZ", bool_t, { this: Actor }, void_t);
Actor.prototype.setSneaking = procHacker.js("?setSneaking@Actor@@UEAAX_N@Z", void_t, { this: Actor }, bool_t);
Actor.prototype.getHealth = procHacker.js("?getHealth@Actor@@QEBAHXZ", int32_t, { this: Actor });
Actor.prototype.getMaxHealth = procHacker.js("?getMaxHealth@Actor@@QEBAHXZ", int32_t, { this: Actor });
Actor.prototype.startRiding = procHacker.jsv("??_7Actor@@6B@", "?startRiding@Actor@@UEAA_NAEAV1@@Z", bool_t, { this: Actor }, Actor);

const Actor$save = procHacker.js("?save@Actor@@UEBA_NAEAVCompoundTag@@@Z", bool_t, { this: Actor }, CompoundTag);
Actor.prototype.save = function (tag?: CompoundTag): any {
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

const Actor$getTags = procHacker.js(
    "?getTags@Actor@@QEBA?BV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ",
    CxxVector$string,
    { this: Actor, structureReturn: true },
);
Actor.prototype.getTags = function () {
    const tags: CxxVector<CxxString> = Actor$getTags.call(this);
    const out = tags.toArray();
    tags.destruct();
    return out;
};

const VirtualCommandOrigin$VirtualCommandOrigin = procHacker.js(
    "??0VirtualCommandOrigin@@QEAA@AEBVCommandOrigin@@AEAVActor@@AEBVCommandPositionFloat@@H@Z",
    void_t,
    null,
    VirtualCommandOrigin,
    CommandOrigin,
    Actor,
    CommandPositionFloat,
    int32_t,
);
Actor.prototype.runCommand = function (
    command: string,
    mute: CommandResultType = true,
    permissionLevel: CommandPermissionLevel = CommandPermissionLevel.Operator,
): CommandResult<CommandResult.Any> {
    const actorPos = CommandUtils.getFeetPos(this);
    const cmdPos = CommandPositionFloat.create(actorPos.x, false, actorPos.y, false, actorPos.z, false, false);

    const serverOrigin = ServerCommandOrigin.constructWith("Server", this.getLevel() as ServerLevel, permissionLevel, this.getDimension());
    const origin = VirtualCommandOrigin.constructWith(serverOrigin, this, cmdPos);
    serverOrigin.destruct(); // serverOrigin will be cloned.

    const result = executeCommandWithOutput(command, origin, mute);
    origin.destruct();
    return result;
};

@nativeClass()
class DefaultDataLoaderHelper extends NativeClass {
    static readonly vftable = proc["??_7DefaultDataLoadHelper@@6B@"];
    @nativeField(VoidPointer)
    vftable: VoidPointer;

    [NativeType.ctor](): void {
        this.vftable = DefaultDataLoaderHelper.vftable;
    }

    static create(): DefaultDataLoaderHelper {
        const v = new DefaultDataLoaderHelper(true);
        v.vftable = DefaultDataLoaderHelper.vftable;
        return v;
    }
}
const Actor$readAdditionalSaveData = procHacker.jsv(
    "??_7Actor@@6B@",
    "?readAdditionalSaveData@Actor@@MEAAXAEBVCompoundTag@@AEAVDataLoadHelper@@@Z",
    void_t,
    { this: Actor },
    CompoundTag,
    DefaultDataLoaderHelper,
);
Actor.prototype.readAdditionalSaveData = function (tag: CompoundTag | NBT.Compound): void {
    if (tag instanceof Tag) {
        Actor$readAdditionalSaveData.call(this, tag, DefaultDataLoaderHelper.create());
    } else {
        tag = NBT.allocate(tag) as CompoundTag;
        Actor$readAdditionalSaveData.call(this, tag, DefaultDataLoaderHelper.create());
        tag.dispose();
    }
};

const Actor$load = procHacker.js("?load@Actor@@UEAA_NAEBVCompoundTag@@AEAVDataLoadHelper@@@Z", void_t, { this: Actor }, CompoundTag, DefaultDataLoaderHelper);
Actor.prototype.load = function (tag: CompoundTag | NBT.Compound): void {
    if (tag instanceof Tag) {
        Actor$load.call(this, tag, DefaultDataLoaderHelper.create());
    } else {
        tag = NBT.allocate(tag) as CompoundTag;
        Actor$load.call(this, tag, DefaultDataLoaderHelper.create());
        tag.dispose();
    }
};

(Actor.prototype as any).hurt_ = procHacker.js(
    "?hurt@Actor@@QEAA_NAEBVActorDamageSource@@M_N1@Z",
    bool_t,
    { this: Actor },
    ActorDamageSource,
    float32_t,
    bool_t,
    bool_t,
);

Actor.prototype.setStatusFlag = procHacker.js("?setStatusFlag@Actor@@UEAAXW4ActorFlags@@_N@Z", void_t, { this: Actor }, int32_t, bool_t);
Actor.prototype.getStatusFlag = procHacker.js("?getStatusFlag@Actor@@UEBA_NW4ActorFlags@@@Z", bool_t, { this: Actor }, int32_t);

Actor.prototype.getLevel = procHacker.js("?getLevel@Actor@@QEAAAEAVLevel@@XZ", Level, { this: Actor });

Actor.prototype.isAlive = procHacker.js("?isAlive@Actor@@UEBA_NXZ", bool_t, {
    this: Actor,
});
Actor.prototype.isInvisible = procHacker.js("?isInvisible@Actor@@UEBA_NXZ", bool_t, { this: Actor });
(Actor.prototype as any)._isRiding = procHacker.js("?isRiding@Actor@@QEBA_NXZ", bool_t, { this: Actor });
(Actor.prototype as any)._isRidingOn = procHacker.js("?isRiding@Actor@@QEBA_NPEAV1@@Z", bool_t, { this: Actor }, Actor);
(Actor.prototype as any)._isPassenger = procHacker.js("?isPassenger@Actor@@QEBA_NAEBV1@@Z", bool_t, { this: Actor }, Actor);
Actor.prototype.setVelocity = procHacker.js("?setVelocity@Actor@@QEAAXAEBVVec3@@@Z", void_t, { this: Actor }, Vec3);
Actor.prototype.isInWater = procHacker.js("?isInWater@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.getArmorContainer = procHacker.js("?getArmorContainer@Actor@@QEAAAEAVSimpleContainer@@XZ", SimpleContainer, { this: Actor });
Actor.prototype.getHandContainer = procHacker.js("?getHandContainer@Actor@@QEAAAEAVSimpleContainer@@XZ", SimpleContainer, { this: Actor });

Actor.fromUniqueIdBin = function (bin, getRemovedActor = true) {
    return bedrockServer.level.fetchEntity(bin, getRemovedActor);
};

Actor.prototype.setHurtTime = procHacker.js("?setHurtTime@Actor@@QEAAXH@Z", void_t, { this: Actor }, int32_t);
Actor.prototype.addEffect = procHacker.js("?addEffect@Actor@@QEAAXAEBVMobEffectInstance@@@Z", void_t, { this: Actor }, MobEffectInstance);
Actor.prototype.removeEffect = procHacker.js("?removeEffect@Actor@@QEAAXH@Z", void_t, { this: Actor }, int32_t);
(Actor.prototype as any)._hasEffect = procHacker.js("?hasEffect@Actor@@QEBA_NAEBVMobEffect@@@Z", bool_t, { this: Actor }, MobEffect);
(Actor.prototype as any)._getEffect = procHacker.js("?getEffect@Actor@@QEBAPEBVMobEffectInstance@@AEBVMobEffect@@@Z", MobEffectInstance, { this: Actor }, MobEffect);
Actor.prototype.removeAllEffects = procHacker.js("?removeAllEffects@Actor@@QEAAXXZ", void_t, { this: Actor });
Actor.prototype.setOnFire = function (seconds: number) {
    OnFireSystem.setOnFire(this, seconds);
};
Actor.prototype.setOnFireNoEffects = function (seconds: number) {
    OnFireSystem.setOnFireNoEffects(this, seconds);
};
Actor.prototype.getEquippedTotem = procHacker.js("?getEquippedTotem@Actor@@UEBAAEBVItemStack@@XZ", ItemStack, { this: Actor });
Actor.prototype.consumeTotem = procHacker.js("?consumeTotem@Actor@@UEAA_NXZ", bool_t, { this: Actor });
Actor.prototype.hasTotemEquipped = procHacker.js("?hasTotemEquipped@Actor@@QEBA_NXZ", bool_t, { this: Actor });
(Actor.prototype as any).hasFamily_ = procHacker.js("?hasFamily@Actor@@QEBA_NAEBVHashedString@@@Z", bool_t, { this: Actor }, HashedString);
Actor.prototype.distanceTo = procHacker.js("?distanceTo@Actor@@QEBAMAEBVVec3@@@Z", float32_t, { this: Actor }, Vec3);
Actor.prototype.getLastHurtByMob = procHacker.js("?getLastHurtByMob@Actor@@QEAAPEAVMob@@XZ", Mob, { this: Actor });
Actor.prototype.getLastHurtCause = procHacker.js("?getLastHurtCause@Actor@@QEBA?AW4ActorDamageCause@@XZ", int32_t, { this: Actor });
Actor.prototype.getLastHurtDamage = procHacker.js("?getLastHurtDamage@Actor@@QEBAMXZ", int32_t, { this: Actor });
Actor.prototype.getLastHurtMob = procHacker.js("?getLastHurtMob@Actor@@QEAAPEAVMob@@XZ", Mob, { this: Actor });
Actor.prototype.wasLastHitByPlayer = procHacker.js("?wasLastHitByPlayer@Actor@@QEAA_NXZ", bool_t, { this: Actor });
Actor.prototype.getSpeedInMetersPerSecond = procHacker.js("?getSpeedInMetersPerSecond@Actor@@QEBAMXZ", float32_t, { this: Actor });
(Actor.prototype as any).fetchNearbyActorsSorted_ = procHacker.js(
    "?fetchNearbyActorsSorted@Actor@@QEAA?AV?$vector@UDistanceSortedActor@@V?$allocator@UDistanceSortedActor@@@std@@@std@@AEBVVec3@@W4ActorType@@@Z",
    CxxVector.make(DistanceSortedActor),
    { this: Actor, structureReturn: true },
    Vec3,
    int32_t,
);
Actor.prototype.isCreative = procHacker.js("?isCreative@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isAdventure = procHacker.js("?isAdventure@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isSurvival = procHacker.js("?isSurvival@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isSpectator = procHacker.js("?isSpectator@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.remove = procHacker.jsv("??_7Actor@@6B@", "?remove@Actor@@UEAAXXZ", void_t, { this: Actor });
Actor.prototype.isAngry = procHacker.js("?isAngry@Actor@@QEBA_NXZ", bool_t, {
    this: Actor,
});
Actor.prototype.getBlockTarget = procHacker.js("?getBlockTarget@Actor@@QEBA?AVBlockPos@@XZ", BlockPos, { this: Actor, structureReturn: true });
Actor.prototype.isAttackableGamemode = procHacker.js("?isAttackableGamemode@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInvulnerableTo = procHacker.jsv(
    "??_7Actor@@6B@",
    "?isInvulnerableTo@Actor@@UEBA_NAEBVActorDamageSource@@@Z",
    bool_t,
    { this: Actor },
    ActorDamageSource,
);
const Actor$canSeeEntity = procHacker.js("?canSee@Actor@@QEBA_NAEBV1@@Z", bool_t, null, Actor, Actor);
const Actor$canSeePos = procHacker.js("?canSee@Actor@@QEBA_NAEBVVec3@@@Z", bool_t, null, Actor, Vec3);
Actor.prototype.canSee = function (target) {
    if (target instanceof Actor) {
        return Actor$canSeeEntity(this, target);
    } else {
        return Actor$canSeePos(this, target);
    }
};
const Actor$isValidTarget = procHacker.jsv("??_7ServerPlayer@@6B@", "?isValidTarget@ServerPlayer@@UEBA_NPEAVActor@@@Z", bool_t, { this: Actor }, Actor);
Actor.prototype.isValidTarget = function (source = null) {
    return Actor$isValidTarget.call(this, source);
};
const Actor$canAttack = procHacker.jsv("??_7Actor@@6B@", "?canAttack@Actor@@UEBA_NPEAV1@_N@Z", bool_t, { this: Actor }, Actor, bool_t);
Actor.prototype.canAttack = function (target, unknown = false) {
    return Actor$canAttack.call(this, target, unknown);
};
Actor.prototype.getLastDeathPos = procHacker.jsv("??_7Actor@@6B@", "?getLastDeathPos@Actor@@UEBA?AV?$optional@VBlockPos@@@std@@XZ", CxxOptional.make(BlockPos), {
    this: Actor,
    structureReturn: true,
});
Actor.prototype.getLastDeathDimension = procHacker.jsv(
    "??_7Actor@@6B@",
    "?getLastDeathDimension@Actor@@UEBA?AV?$optional@V?$AutomaticID@VDimension@@H@@@std@@XZ",
    CxxOptional.make(int32_t),
    { this: Actor, structureReturn: true },
);
(Actor.prototype as any)._getViewVector = procHacker.js("?getViewVector@Actor@@QEBA?AVVec3@@M@Z", Vec3, { this: Actor, structureReturn: true }, float32_t);
Actor.prototype.isImmobile = procHacker.jsv("??_7Actor@@6B@", "?isImmobile@Actor@@UEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isSwimming = procHacker.js("?isSwimming@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.setSize = function (width, height) {
    const entityData = this.getEntityData();
    entityData.setFloat(ActorDataIDs.Width, width);
    entityData.setFloat(ActorDataIDs.Height, height);
};
Actor.prototype.isInsidePortal = procHacker.js("?isInsidePortal@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInWorld = procHacker.js("?isInWorld@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInWaterOrRain = procHacker.js("?isInWaterOrRain@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInThunderstorm = procHacker.js("?isInThunderstorm@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInSnow = procHacker.js("?isInSnow@Actor@@QEBA_NXZ", bool_t, {
    this: Actor,
});
Actor.prototype.isInScaffolding = procHacker.js("?isInScaffolding@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInRain = procHacker.js("?isInRain@Actor@@QEBA_NXZ", bool_t, {
    this: Actor,
});
Actor.prototype.isInPrecipitation = procHacker.js("?isInPrecipitation@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInLove = procHacker.js("?isInLove@Actor@@QEBA_NXZ", bool_t, {
    this: Actor,
});

namespace ActorMobilityUtils {
    export const shouldApplyLava = procHacker.js(
        "?shouldApplyLava@ActorMobilityUtils@@YA_NAEBVIConstBlockSource@@AEBVEntityContext@@@Z",
        bool_t,
        null,
        BlockSource,
        EntityContext,
    );
}
namespace PlayerMovement {
    export const getInputMode = procHacker.js("?getInputMode@PlayerMovement@@YA?AW4InputMode@@AEBVEntityContext@@@Z", int32_t, null, EntityContext);
}

Actor.prototype.isInLava = function () {
    const blockSource = this.getDimensionBlockSource();
    const context = this.addAs(EntityContext, 8);
    return ActorMobilityUtils.shouldApplyLava(blockSource, context);
};
Actor.prototype.isInContactWithWater = procHacker.js("?isInContactWithWater@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isInClouds = procHacker.js("?isInClouds@Actor@@QEBA_NXZ", bool_t, { this: Actor });
Actor.prototype.isBaby = procHacker.js("?isBaby@Actor@@QEBA_NXZ", bool_t, {
    this: Actor,
});
Actor.prototype.getEntityData = procHacker.js("?getEntityData@Actor@@QEBAAEBVSynchedActorDataEntityWrapper@@XZ", SynchedActorDataEntityWrapper, { this: Actor });
Actor.prototype.getOwner = procHacker.js("?getOwner@Actor@@QEBAPEAVMob@@XZ", Mob, { this: Actor });
Actor.prototype.setOwner = procHacker.js("?setOwner@Actor@@UEAAXUActorUniqueID@@@Z", void_t, { this: Actor }, ActorUniqueID);
Actor.prototype.getVariant = procHacker.js("?getVariant@Actor@@QEBAHXZ", int32_t, { this: Actor });
Actor.prototype.setVariant = procHacker.js("?setVariant@Actor@@QEAAXH@Z", void_t, { this: Actor }, int32_t);
Actor.prototype.setTarget = procHacker.jsv("??_7Actor@@6B@", "?setTarget@Actor@@UEAAXPEAV1@@Z", void_t, { this: Actor }, Actor);

const getProjectileComponent = procHacker.js("??$tryGetComponent@VProjectileComponent@@@Actor@@QEAAPEAVProjectileComponent@@XZ", ProjectileComponent, null, Actor);
const getPhysicsComponent = procHacker.js("??$tryGetComponent@VPhysicsComponent@@@Actor@@QEAAPEAVPhysicsComponent@@XZ", PhysicsComponent, null, Actor);
const getDamageSensorComponent = procHacker.js(
    "??$tryGetComponent@VDamageSensorComponent@@@Actor@@QEBAPEBVDamageSensorComponent@@XZ",
    DamageSensorComponent,
    null,
    Actor,
);
const getCommandBlockComponent = procHacker.js(
    "??$tryGetComponent@VCommandBlockComponent@@@Actor@@QEAAPEAVCommandBlockComponent@@XZ",
    CommandBlockComponent,
    null,
    Actor,
);
const getNameableComponent = procHacker.js("??$tryGetComponent@VNameableComponent@@@Actor@@QEAAPEAVNameableComponent@@XZ", NameableComponent, null, Actor);
const getNavigationComponent = procHacker.js("??$tryGetComponent@VNavigationComponent@@@Actor@@QEAAPEAVNavigationComponent@@XZ", NavigationComponent, null, Actor);
const getNpcComponent = procHacker.js("??$tryGetComponent@VNpcComponent@@@Actor@@QEAAPEAVNpcComponent@@XZ", NpcComponent, null, Actor);
const getRideableComponent = procHacker.js("??$tryGetComponent@VRideableComponent@@@Actor@@QEAAPEAVRideableComponent@@XZ", RideableComponent, null, Actor);
const getContainerComponent = procHacker.js("??$tryGetComponent@VContainerComponent@@@Actor@@QEAAPEAVContainerComponent@@XZ", ContainerComponent, null, Actor);
const getPushableComponent = procHacker.js("??$tryGetComponent@VPushableComponent@@@Actor@@QEAAPEAVPushableComponent@@XZ", PushableComponent, null, Actor);
const getShooterComponent = procHacker.js("??$tryGetComponent@VShooterComponent@@@Actor@@QEAAPEAVShooterComponent@@XZ", ShooterComponent, null, Actor);
const getConditionalBandwidthComponent = procHacker.js(
    "??$tryGetComponent@VConditionalBandwidthOptimizationComponent@@@Actor@@QEAAPEAVConditionalBandwidthOptimizationComponent@@XZ",
    ConditionalBandwidthOptimizationComponent,
    null,
    Actor,
);

(Actor.prototype as any)._tryGetComponent = (comp: string) => {
    switch (comp) {
        case "minecraft:projectile":
            return getProjectileComponent(this);
        case "minecraft:physics":
            return getPhysicsComponent(this);
        case "minecraft:damage_sensor":
            return getDamageSensorComponent(this);
        case "minecraft:command_block":
            return getCommandBlockComponent(this);
        case "minecraft:nameable":
            return getNameableComponent(this);
        case "minecraft:navigation":
            return getNavigationComponent(this);
        case "minecraft:npc":
            return getNpcComponent(this);
        case "minecraft:rideable":
            return getRideableComponent(this);
        case "minecraft:container":
            return getContainerComponent(this);
        case "minecraft:pushable":
            return getPushableComponent(this);
        case "minecraft:shooter":
            return getShooterComponent(this);
        case "minecraft:conditional_bandwidth_optimization":
            return getConditionalBandwidthComponent(this);
        default:
            return null;
    }
};

PhysicsComponent.prototype.setHasCollision = procHacker.js(
    "?setHasCollision@PhysicsComponent@@QEAAXAEAVActor@@_N@Z",
    void_t,
    { this: PhysicsComponent },
    Actor,
    bool_t,
);
PhysicsComponent.prototype.setAffectedByGravity = procHacker.js(
    "?setAffectedByGravity@PhysicsComponent@@QEBAXAEAUActorDataFlagComponent@@AEAUActorDataDirtyFlagsComponent@@_N@Z",
    void_t,
    { this: PhysicsComponent },
    ActorDataFlagComponent,
    bool_t,
);

ProjectileComponent.prototype.shoot = procHacker.js("?shoot@ProjectileComponent@@QEAAXAEAVActor@@0@Z", void_t, { this: ProjectileComponent }, Actor, Actor);
ProjectileComponent.prototype.setOwnerId = procHacker.js(
    "?setOwnerId@ProjectileComponent@@QEAAXUActorUniqueID@@@Z",
    void_t,
    { this: ProjectileComponent },
    ActorUniqueID,
);

DamageSensorComponent.prototype.isFatal = procHacker.js("?isFatal@DamageSensorComponent@@QEBA_NXZ", bool_t, { this: DamageSensorComponent });
DamageSensorComponent.prototype.getDamageModifier = procHacker.js("?getDamageModifier@DamageSensorComponent@@QEAAMXZ", float32_t, { this: DamageSensorComponent });

CommandBlockComponent.prototype.addAdditionalSaveData = procHacker.js(
    "?addAdditionalSaveData@CommandBlockComponent@@QEBAXAEAVCompoundTag@@@Z",
    void_t,
    { this: CommandBlockComponent },
    CompoundTag,
);
CommandBlockComponent.prototype.getTicking = procHacker.js("?getTicking@CommandBlockComponent@@QEBA_NXZ", bool_t, { this: CommandBlockComponent });
CommandBlockComponent.prototype.setTicking = procHacker.js("?setTicking@CommandBlockComponent@@QEAAX_N@Z", void_t, { this: CommandBlockComponent }, bool_t);
CommandBlockComponent.prototype.resetCurrentTicking = procHacker.js("?resetCurrentTick@CommandBlockComponent@@QEAAXXZ", void_t, { this: CommandBlockComponent });

NameableComponent.prototype.nameEntity = procHacker.js(
    "?nameEntity@NameableComponent@@QEAAXAEAVActor@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: NameableComponent },
    Actor,
    CxxString,
);
const NavigationComponent$$createPath$$Actor = procHacker.js(
    "?createPath@NavigationComponent@@QEAA?AV?$unique_ptr@VPath@@U?$default_delete@VPath@@@std@@@std@@AEAVMob@@AEAVActor@@@Z",
    Path.ref(),
    null,
    NavigationComponent,
    Actor,
    Actor,
);
const NavigationComponent$$createPath$$Vec3 = procHacker.js(
    "?createPath@NavigationComponent@@QEAA?AV?$unique_ptr@VPath@@U?$default_delete@VPath@@@std@@@std@@AEAVMob@@AEBVVec3@@@Z",
    Path.ref(),
    null,
    NavigationComponent,
    Actor,
    Vec3,
);
(NavigationComponent.prototype as any)._createPath = function (component: NavigationComponent, actor: Actor, target: Actor | Vec3): Path {
    if (target instanceof Actor) {
        return NavigationComponent$$createPath$$Actor(component, actor, target);
    } else {
        return NavigationComponent$$createPath$$Vec3(component, actor, target);
    }
};
NavigationComponent.prototype.setPath = procHacker.js(
    "?setPath@NavigationComponent@@QEAAXV?$unique_ptr@VPath@@U?$default_delete@VPath@@@std@@@std@@@Z",
    void_t,
    { this: NavigationComponent },
    Path.ref(),
);
NavigationComponent.prototype.stop = procHacker.js("?stop@NavigationComponent@@QEAAXAEAVMob@@@Z", void_t, { this: NavigationComponent }, Mob);
NavigationComponent.prototype.getMaxDistance = procHacker.js(
    "?getMaxDistance@NavigationComponent@@QEBAMAEBVActor@@@Z",
    float32_t,
    { this: NavigationComponent },
    Actor,
);
NavigationComponent.prototype.isDone = procHacker.js("?isDone@NavigationComponent@@QEBA_NXZ", bool_t, { this: NavigationComponent });
NavigationComponent.prototype.getSpeed = procHacker.js("?getSpeed@NavigationComponent@@QEBAMXZ", float32_t, { this: NavigationComponent });
NavigationComponent.prototype.getAvoidSun = procHacker.js("?getAvoidSun@NavigationComponent@@QEBA_NXZ", bool_t, { this: NavigationComponent });
NavigationComponent.prototype.getCanFloat = procHacker.js("?getCanFloat@NavigationComponent@@QEBA_NXZ", bool_t, { this: NavigationComponent });
NavigationComponent.prototype.getCanPathOverLava = procHacker.js("?getCanPathOverLava@NavigationComponent@@QEBA_NXZ", bool_t, { this: NavigationComponent });
NavigationComponent.prototype.getLastStuckCheckPosition = procHacker.js("?getLastStuckCheckPosition@NavigationComponent@@QEBA?AVVec3@@XZ", Vec3, {
    this: NavigationComponent,
});
NavigationComponent.prototype.isStuck = procHacker.js("?isStuck@NavigationComponent@@QEBA_NH@Z", bool_t, { this: NavigationComponent }, int32_t);
NavigationComponent.prototype.setCanFloat = procHacker.js("?setCanFloat@NavigationComponent@@QEAAX_N@Z", void_t, { this: NavigationComponent }, bool_t);
NavigationComponent.prototype.setAvoidWater = procHacker.js("?setAvoidWater@NavigationComponent@@QEAAX_N@Z", void_t, { this: NavigationComponent }, bool_t);
NavigationComponent.prototype.setAvoidSun = procHacker.js("?setAvoidSun@NavigationComponent@@QEAAX_N@Z", void_t, { this: NavigationComponent }, bool_t);
NavigationComponent.prototype.setSpeed = procHacker.js("?setSpeed@NavigationComponent@@QEAAXM@Z", void_t, { this: NavigationComponent }, float32_t);

RideableComponent.prototype.areSeatsFull = procHacker.js("?areSeatsFull@RideableComponent@@QEBA_NAEBVActor@@@Z", bool_t, { this: RideableComponent }, Actor);
RideableComponent.prototype.canAddPassenger = procHacker.js(
    "?canAddPassenger@RideableComponent@@QEBA_NAEBVActor@@AEAV2@@Z",
    bool_t,
    { this: RideableComponent },
    Actor,
    Actor,
);
RideableComponent.prototype.pullInEntity = procHacker.js("?pullInEntity@RideableComponent@@QEBA_NAEAVActor@@0@Z", bool_t, { this: RideableComponent }, Actor, Actor);

const ContainerComponent$addItem$ItemActor = procHacker.js("?addItem@ContainerComponent@@QEAA_NAEAVItemActor@@@Z", bool_t, null, ContainerComponent, ItemActor);
const ContainerComponent$addItem$ItemStack = procHacker.js("?addItem@ContainerComponent@@QEAA_NAEAVItemStack@@@Z", bool_t, null, ContainerComponent, ItemStack);
const ContainerComponent$addItem$ItemStack$count = procHacker.js(
    "?addItem@ContainerComponent@@QEAA_NAEAVItemStack@@HH@Z",
    bool_t,
    null,
    ContainerComponent,
    ItemStack,
    int32_t,
    int32_t,
);
(ContainerComponent.prototype as any)._addItem = function (component: ContainerComponent, item: ItemStack | ItemActor, count?: number, data: number = 0): boolean {
    if (item instanceof ItemActor) {
        return ContainerComponent$addItem$ItemActor(component, item);
    } else if (count !== undefined) {
        return ContainerComponent$addItem$ItemStack$count(component, item, count, data);
    } else {
        return ContainerComponent$addItem$ItemStack(component, item);
    }
};
ContainerComponent.prototype.getEmptySlotsCount = procHacker.js("?getEmptySlotsCount@ContainerComponent@@QEBAHXZ", int64_as_float_t, { this: ContainerComponent });
ContainerComponent.prototype.getSlots = procHacker.js(
    "?getSlots@ContainerComponent@@QEBA?BV?$vector@PEBVItemStack@@V?$allocator@PEBVItemStack@@@std@@@std@@XZ",
    CxxVector.make(ItemStack.ref()),
    { this: Container, structureReturn: true },
);
const PushableComponent$pushByActor = procHacker.js("?push@PushableComponent@@QEAAXAEAVActor@@0_N@Z", void_t, null, PushableComponent, Actor, Actor, bool_t);
const PushableComponent$pushByPos = procHacker.js("?push@PushableComponent@@QEAAXAEAVActor@@AEBVVec3@@@Z", void_t, null, PushableComponent, Actor, Vec3);
(PushableComponent.prototype as any)._push = function (entity: Actor, entityOrVec: Actor | Vec3, bool: bool_t) {
    if (bool !== undefined) {
        return PushableComponent$pushByActor(this, entity, entityOrVec as Actor, bool);
    } else {
        return PushableComponent$pushByPos(this, entity, entityOrVec as Vec3);
    }
};
ShooterComponent.prototype.shootProjectile = procHacker.js(
    "?_shootProjectile@ShooterComponent@@AEAAXAEAVActor@@AEBUActorDefinitionIdentifier@@H@Z",
    void_t,
    { this: ShooterComponent },
    Actor,
    ActorDefinitionIdentifier,
    int32_t,
);

Mob.prototype.getArmorValue = procHacker.jsv("??_7Mob@@6B@", "?getArmorValue@Mob@@UEBAHXZ", int32_t, { this: Actor });
Mob.prototype.knockback = procHacker.jsv(
    "??_7Mob@@6B@",
    "?knockback@Mob@@UEAAXPEAVActor@@HMMMMM@Z",
    void_t,
    { this: Mob },
    Actor,
    int32_t,
    float32_t,
    float32_t,
    float32_t,
    float32_t,
    float32_t,
);
Mob.prototype.getSpeed = procHacker.js("?getSpeed@Mob@@UEBAMXZ", float32_t, {
    this: Mob,
});
Mob.prototype.setSpeed = procHacker.js("?setSpeed@Mob@@UEAAXM@Z", void_t, { this: Mob }, float32_t);
Mob.prototype.isSprinting = procHacker.js("?isSprinting@Mob@@QEBA_NXZ", bool_t, { this: Mob });
Mob.prototype.sendArmorSlot = procHacker.js("?sendArmorSlot@Mob@@QEAAXW4ArmorSlot@@@Z", void_t, { this: Mob }, uint32_t);
Mob.prototype.setSprinting = procHacker.js("?setSprinting@Mob@@UEAAX_N@Z", void_t, { this: Mob }, bool_t);
Mob.prototype.isAlive = procHacker.js("?isAlive@Mob@@UEBA_NXZ", bool_t, {
    this: Mob,
});
(Mob.prototype as any)._sendInventory = procHacker.js("?sendInventory@Mob@@UEAAX_N@Z", void_t, { this: Mob }, bool_t);
(Mob.prototype as any).hurtEffects_ = procHacker.jsv(
    "??_7Mob@@6B@",
    "?hurtEffects@Mob@@UEAAXAEBVActorDamageSource@@M_N1@Z",
    bool_t,
    { this: Mob },
    ActorDamageSource,
    int32_t,
    bool_t,
    bool_t,
);
Mob.prototype.getArmorCoverPercentage = procHacker.js("?getArmorCoverPercentage@Mob@@QEBAMXZ", float32_t, { this: Mob });
Mob.prototype.getToughnessValue = function () {
    let toughness = 0;
    const armors = this.getArmorContainer();
    for (const stack of armors.getSlots()) {
        const item = stack.getItem();
        if (item === null) continue;
        toughness += item.getToughnessValue();
    }
    return toughness;
};
Mob.prototype.isBlocking = procHacker.jsv("??_7Mob@@6B@", "?isBlocking@Mob@@UEBA_NXZ", bool_t, { this: Mob });

OwnerStorageEntity.prototype._getStackRef = procHacker.js("?_getStackRef@OwnerStorageEntity@@IEBAAEAVEntityContext@@XZ", EntityContext, {
    this: OwnerStorageEntity,
});
Actor.tryGetFromEntity = procHacker.js("?tryGetFromEntity@Actor@@SAPEAV1@AEAVEntityContext@@_N@Z", Actor, null, EntityContext, bool_t);

SynchedActorDataEntityWrapper.prototype.getFloat = procHacker.js(
    "?getFloat@SynchedActorDataEntityWrapper@@QEBAMG@Z",
    float32_t,
    { this: SynchedActorDataEntityWrapper },
    uint16_t,
);
SynchedActorDataEntityWrapper.prototype.setFloat = procHacker.js(
    "??$set@M@SynchedActorDataEntityWrapper@@QEAAXGAEBM@Z",
    void_t,
    { this: SynchedActorDataEntityWrapper },
    uint16_t,
    float32_t.ref() /** float const & */,
);
SynchedActorDataEntityWrapper.prototype.getInt = procHacker.js(
    "?getInt@SynchedActorDataEntityWrapper@@QEBAHG@Z",
    int32_t,
    { this: SynchedActorDataEntityWrapper },
    uint16_t,
);
SynchedActorDataEntityWrapper.prototype.setInt = procHacker.js(
    "??$set@H@SynchedActorDataEntityWrapper@@QEAAXGAEBH@Z",
    void_t,
    { this: SynchedActorDataEntityWrapper },
    uint16_t,
    int32_t.ref() /** int const & */,
);

@nativeClass(0x20)
class StackResultStorageEntity extends NativeClass {
    constructWith(weakEntityRef: WeakEntityRef): void {
        abstract();
    }
    _hasValue(): boolean {
        abstract();
    }
    _getStackRef(): EntityContext {
        abstract();
    }
}
StackResultStorageEntity.prototype.constructWith = procHacker.js(
    "??0StackResultStorageEntity@@IEAA@AEBVWeakStorageEntity@@@Z",
    void_t,
    { this: StackResultStorageEntity },
    WeakEntityRef,
);
StackResultStorageEntity.prototype._hasValue = procHacker.js("?_hasValue@StackResultStorageEntity@@IEBA_NXZ", bool_t, { this: StackResultStorageEntity });
StackResultStorageEntity.prototype._getStackRef = procHacker.js("?_getStackRef@StackResultStorageEntity@@IEBAAEAVEntityContext@@XZ", EntityContext, {
    this: StackResultStorageEntity,
});

WeakEntityRef.prototype.tryUnwrap = function <T extends typeof Actor>(clazz: T, getRemoved: boolean = false): InstanceType<T> | null {
    const storage = new StackResultStorageEntity(true);
    storage.constructWith(this);
    if (!storage._hasValue()) return null;
    const entity = storage._getStackRef();
    return clazz.tryGetFromEntity(entity, getRemoved) as any;
};
WeakEntityRef.prototype.tryUnwrapPlayer = function (getRemoved = false) {
    return this.tryUnwrap(Player, getRemoved);
};
WeakEntityRef.prototype.tryUnwrapActor = function (getRemoved = false) {
    return this.tryUnwrap(Actor, getRemoved);
};

const ActorDefinitionIdentifier$ActorDefinitionIdentifier$ActorType = procHacker.js(
    "??0ActorDefinitionIdentifier@@QEAA@W4ActorType@@@Z",
    void_t,
    null,
    ActorDefinitionIdentifier,
    int32_t,
);
const ActorDefinitionIdentifier$ActorDefinitionIdentifier$CxxString = procHacker.js(
    "??0ActorDefinitionIdentifier@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    null,
    ActorDefinitionIdentifier,
    CxxString,
);
ActorDefinitionIdentifier.constructWith = function (type: string | number): ActorDefinitionIdentifier {
    const identifier = new ActorDefinitionIdentifier(true);
    if (typeof type === "number") {
        ActorDefinitionIdentifier$ActorDefinitionIdentifier$ActorType(identifier, type);
    } else {
        ActorDefinitionIdentifier$ActorDefinitionIdentifier$CxxString(identifier, type);
    }
    return identifier;
};

const ActorDamageSource$ActorDamageSource = procHacker.js("??0ActorDamageSource@@QEAA@W4ActorDamageCause@@@Z", void_t, null, ActorDamageSource, int32_t);
ActorDamageSource.create = function (cause): ActorDamageSource {
    const source = new ActorDamageSource(true);
    ActorDamageSource$ActorDamageSource(source, cause);
    return source;
};

const ActorDamageByActorSource$vftable = proc["??_7ActorDamageByActorSource@@6B@"];
const ActorDamageByChildActorSource$vftable = proc["??_7ActorDamageByChildActorSource@@6B@"];
const ActorDamageByBlockSource$vftable = proc["??_7ActorDamageByBlockSource@@6B@"];

ActorDamageSource.setResolver(ptr => {
    if (ptr === null) return null;
    const vftable = ptr.getPointer();
    if (vftable.equalsptr(ActorDamageByActorSource$vftable)) {
        return ptr.as(ActorDamageByActorSource);
    }
    if (vftable.equalsptr(ActorDamageByChildActorSource$vftable)) {
        return ptr.as(ActorDamageByChildActorSource);
    }
    if (vftable.equalsptr(ActorDamageByBlockSource$vftable)) {
        return ptr.as(ActorDamageByBlockSource);
    }
    return ptr.as(ActorDamageSource);
});

ActorDamageSource.prototype.getDamagingEntityUniqueID = procHacker.jsv(
    "??_7ActorDamageSource@@6B@",
    "?getDamagingEntityUniqueID@ActorDamageSource@@UEBA?AUActorUniqueID@@XZ",
    ActorUniqueID,
    { this: ActorDamageSource, structureReturn: true },
);
ActorDamageSource.prototype.setCause = procHacker.js("?setCause@ActorDamageSource@@QEAAXW4ActorDamageCause@@@Z", void_t, { this: ActorDamageSource }, int32_t);

ActorDamageByActorSource.prototype[NativeType.dtor] = procHacker.js("??1ActorDamageByActorSource@@UEAA@XZ", void_t, { this: ActorDamageByActorSource });
const ActorDamageByActorSource$ActorDamageByActorSource = procHacker.js(
    "??0ActorDamageByActorSource@@QEAA@AEBVActor@@W4ActorDamageCause@@@Z",
    void_t,
    null,
    ActorDamageByActorSource,
    Actor,
    int32_t,
);
ActorDamageByActorSource.constructWith = function (damagingEntity, cause: ActorDamageCause = ActorDamageCause.EntityAttack): ActorDamageByActorSource {
    const source = new ActorDamageByActorSource(true);
    ActorDamageByActorSource$ActorDamageByActorSource(source, damagingEntity as Actor, cause);
    return source;
};

ActorDamageByChildActorSource.prototype[NativeType.dtor] = procHacker.js("??1ActorDamageByChildActorSource@@UEAA@XZ", VoidPointer, {
    this: ActorDamageByChildActorSource,
});
const ActorDamageByChildActorSource$ActorDamageByChildActorSource = procHacker.js(
    "??0ActorDamageByChildActorSource@@QEAA@AEBVActor@@0W4ActorDamageCause@@@Z",
    ActorDamageByChildActorSource,
    null,
    ActorDamageByChildActorSource,
    Actor,
    Actor,
    int32_t,
);
ActorDamageByChildActorSource.constructWith = function (
    childEntity,
    damagingEntity?: Actor | ActorDamageCause,
    cause: ActorDamageCause = ActorDamageCause.Projectile,
): ActorDamageByChildActorSource {
    const source = new ActorDamageByChildActorSource(true);
    ActorDamageByChildActorSource$ActorDamageByChildActorSource(source, childEntity as Actor, damagingEntity as Actor, cause);
    return source;
};

ItemActor.abstract({
    itemStack: [ItemStack, 0x4c8], // accessed in ItemActor::isFireImmune
});

const attribNames = getEnumKeys(AttributeId).map(str => AttributeName[str]);

ServerPlayer.prototype.setAttribute = function (id: AttributeId, value: number): AttributeInstance | null {
    const attr = Actor.prototype.setAttribute.call(this, id, value);
    if (attr === null) return null;
    const packet = UpdateAttributesPacket.allocate();
    packet.actorId = this.getRuntimeID();
    const data = AttributeData.construct();
    data.name.set(attribNames[id]);
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

function _removeActor(actorptr: VoidPointer): void {
    const addrbin = actorptr.getAddressBin();
    const actor = actorMaps.get(addrbin);
    if (actor != null) {
        actorMaps.delete(addrbin);
        decay(actor);
    }
}

const Actor$tryGetFromEntity_by_EntityContext = procHacker.js("?tryGetFromEntity@Player@@SAPEAV1@AEAVEntityContext@@_N@Z", Player, null, VoidPointer, bool_t);
const Level$levelCleanupQueueEntityRemoval = procHacker.hooking(
    "?levelCleanupQueueEntityRemoval@Level@@UEAAXV?$OwnerPtr@VEntityContext@@@@@Z",
    void_t,
    null,
    Level,
    StaticPointer,
)((level, OwnerPtr$EntityContext) => {
    const actor = Actor$tryGetFromEntity_by_EntityContext(OwnerPtr$EntityContext, true);
    Level$levelCleanupQueueEntityRemoval(level, OwnerPtr$EntityContext);
    if (actor !== null) _removeActor(actor);
});

asmcode.removeActor = makefunc.np(_removeActor, void_t, null, VoidPointer);
procHacker.hookingRawWithCallOriginal("??1Actor@@UEAA@XZ", asmcode.actorDestructorHook, [Register.rcx], []);

// player.ts
Player.abstract({
    enderChestContainer: [EnderChestContainer.ref(), 0xcd8], // accessed in Player::Player+1222 (the line between two if-else statements, the first if statement calls EnderChestContainer::EnderChestContainer)
    playerUIContainer: [PlayerUIContainer, 0xda0], // accessed in Player::readAdditionalSaveData+1256 when calling PlayerUIContainer::load
    deviceId: [CxxString, 0x1d78], // accessed in AddPlayerPacket::AddPlayerPacket(const Player &)+193 (the string assignment between LayeredAbilities::LayeredAbilities and Player::getPlatform)
});
(Player.prototype as any)._setName = procHacker.js(
    "?setName@Player@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: Player },
    CxxString,
);
const PlayerListPacket$emplace = procHacker.js("?emplace@PlayerListPacket@@QEAAX$$QEAVPlayerListEntry@@@Z", void_t, null, PlayerListPacket, PlayerListEntry);
Player.prototype.setName = function (name: string): void {
    (this as any)._setName(name);
    this.updatePlayerList();
};
Player.prototype.updatePlayerList = function () {
    const entry = PlayerListEntry.constructWith(this);
    const pk = PlayerListPacket.allocate();
    PlayerListPacket$emplace(pk, entry);
    for (const player of bedrockServer.serverInstance.getPlayers()) {
        player.sendNetworkPacket(pk);
    }
    entry.destruct();
    pk.dispose();
};

Player.prototype.getGameMode = procHacker.js("?getGameMode@Player@@QEBAAEAVGameMode@@XZ", GameMode, { this: Player });
Player.prototype.getGameType = procHacker.js("?getPlayerGameType@Player@@QEBA?AW4GameType@@XZ", int32_t, { this: Player });
Player.prototype.getInventory = Player.prototype.getSupplies = procHacker.js("?getSupplies@Player@@QEAAAEAVPlayerInventory@@XZ", PlayerInventory, { this: Player });
Player.prototype.getCommandPermissionLevel = procHacker.js("?getCommandPermissionLevel@Player@@UEBA?AW4CommandPermissionLevel@@XZ", int32_t, { this: Actor });
Player.prototype.getPermissionLevel = procHacker.js("?getPlayerPermissionLevel@Player@@QEBA?AW4PlayerPermissionLevel@@XZ", int32_t, { this: Player });
Player.prototype.getSkin = procHacker.js("?getSkin@Player@@QEAAAEAVSerializedSkin@@XZ", SerializedSkin, { this: Player });
Player.prototype.startCooldown = procHacker.js("?startCooldown@Player@@QEAAXPEBVItem@@_N@Z", void_t, { this: Player }, Item);
Player.prototype.getItemCooldownLeft = procHacker.js("?getItemCooldownLeft@Player@@QEBAHAEBVHashedString@@@Z", int32_t, { this: Player }, HashedString);
Player.prototype.setGameType = procHacker.js("?setPlayerGameType@ServerPlayer@@UEAAXW4GameType@@@Z", void_t, { this: Player }, int32_t);
Player.prototype.setPermissions = procHacker.js("?setPermissions@Player@@QEAAXW4CommandPermissionLevel@@@Z", void_t, { this: Player }, int32_t);
Player.prototype.setSleeping = procHacker.js("?setSleeping@Player@@UEAAX_N@Z", void_t, { this: Player }, bool_t);
Player.prototype.isSleeping = procHacker.js("?isSleeping@Player@@UEBA_NXZ", bool_t, { this: Player });
Player.prototype.isJumping = procHacker.js("?isJumping@Actor@@QEBA_NXZ", bool_t, { this: Player });

const UpdateAbilitiesPacket$UpdateAbilitiesPacket = procHacker.js(
    "??0UpdateAbilitiesPacket@@QEAA@UActorUniqueID@@AEBVLayeredAbilities@@@Z",
    UpdateAbilitiesPacket,
    null,
    UpdateAbilitiesPacket,
    ActorUniqueID,
    LayeredAbilities,
);
Player.prototype.syncAbilities = function () {
    const pkt = new UpdateAbilitiesPacket(true);
    UpdateAbilitiesPacket$UpdateAbilitiesPacket(pkt, this.getUniqueIdBin(), this.getAbilities());
    this.sendPacket(pkt);
    pkt.destruct();
};

Player.prototype.clearRespawnPosition = procHacker.js("?clearRespawnPosition@Player@@QEAAXXZ", void_t, { this: Player });
Player.prototype.hasRespawnPosition = procHacker.js("?hasRespawnPosition@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.setRespawnPosition = procHacker.js(
    "?setRespawnPosition@Player@@QEAAXAEBVBlockPos@@V?$AutomaticID@VDimension@@H@@@Z",
    void_t,
    { this: Player },
    BlockPos,
    int32_t,
);
Player.prototype.setBedRespawnPosition = procHacker.js("?setBedRespawnPosition@Player@@QEAAXAEBVBlockPos@@@Z", void_t, { this: Player }, BlockPos);
Player.prototype.getSpawnDimension = procHacker.js("?getSpawnDimension@Player@@QEBA?AV?$AutomaticID@VDimension@@H@@XZ", int32_t, {
    this: Player,
    structureReturn: true,
});
Player.prototype.getSpawnPosition = procHacker.js("?getSpawnPosition@Player@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: Player });
Player.prototype.getCarriedItem = procHacker.js("?getCarriedItem@Player@@UEBAAEBVItemStack@@XZ", ItemStack, { this: Player });
Player.prototype.setOffhandSlot = procHacker.js("?setOffhandSlot@Player@@UEAAXAEBVItemStack@@@Z", void_t, { this: Player }, ItemStack);
Player.prototype.addItem = procHacker.js("?add@Player@@UEAA_NAEAVItemStack@@@Z", bool_t, { this: Player }, ItemStack);
Player.prototype.getEquippedTotem = procHacker.js("?getEquippedTotem@Player@@UEBAAEBVItemStack@@XZ", ItemStack, { this: Player });
Player.prototype.consumeTotem = procHacker.js("?consumeTotem@Player@@UEAA_NXZ", bool_t, { this: Player });
Player.prototype.setSpeed = procHacker.js("?setSpeed@Player@@UEAAXM@Z", void_t, { this: Player }, float32_t);
(Player.prototype as any)._sendInventory = procHacker.js("?sendInventory@Player@@UEAAX_N@Z", void_t, { this: Player }, bool_t);

@nativeClass(null)
class UserEntityIdentifierComponent extends NativeClass {
    @nativeField(NetworkIdentifier)
    networkIdentifier: NetworkIdentifier;
    @nativeField(mce.UUID, 0xa8) // accessed in PlayerListEntry::PlayerListEntry after calling entt::basic_registry<EntityId>::try_get<UserEntityIdentifierComponent>
    uuid: mce.UUID;
    @nativeField(Certificate.ref(), 0xd8) // accessed in ServerNetworkHandler::_displayGameMessage before calling ExtendedCertificate::getXuid
    certificate: Certificate; // it's ExtendedCertificate actually
}

EntityContext.prototype.isValid = procHacker.js("?isValid@EntityContext@@QEBA_NXZ", bool_t, {
    this: EntityContext,
});
EntityContext.prototype._enttRegistry = procHacker.js("?_registry@EntityContext@@QEBAAEAVEntityRegistry@@XZ", VoidPointer, {
    this: EntityContext,
});
EntityContext.prototype._getEntityId = procHacker.js("?_getEntityId@EntityContext@@IEBA?AVEntityId@@XZ", VoidPointer, {
    this: EntityContext,
    structureReturn: true,
});

const TryGetUserEntityIdComponent = procHacker.js(
    "??$tryGetComponent@VUserEntityIdentifierComponent@@@Actor@@QEAAPEAVUserEntityIdentifierComponent@@XZ",
    UserEntityIdentifierComponent,
    null,
    Actor,
);

/**
 * ~1.20.50 implementing part of ServerNetworkHandler::_displayGameMessage
 * 1.20.50~ aspiring from existing, get components manually
 */
Player.prototype.getCertificate = function () {
    // part of ServerNetworkHandler::_displayGameMessage
    return TryGetUserEntityIdComponent(this).certificate;
};
Player.prototype.getDestroySpeed = procHacker.js("?getDestroySpeed@Player@@QEBAMAEBVBlock@@@Z", float32_t, { this: Player }, Block.ref());
Player.prototype.canDestroy = procHacker.js("?canDestroy@Player@@QEBA_NAEBVBlock@@@Z", bool_t, { this: Player }, Block.ref());
Player.prototype.addExperience = procHacker.js("?addExperience@Player@@UEAAXH@Z", void_t, { this: Player }, int32_t);
Player.prototype.addExperienceLevels = procHacker.js("?addLevels@Player@@UEAAXH@Z", void_t, { this: Player }, int32_t);
Player.prototype.resetExperienceLevels = procHacker.js("?resetPlayerLevel@Player@@QEAAXXZ", void_t, { this: Player });
Player.prototype.getXpNeededForNextLevel = procHacker.js("?getXpNeededForNextLevel@Player@@QEBAHXZ", int32_t, { this: Player });
Player.prototype.setCursorSelectedItem = procHacker.js("?setCursorSelectedItem@Player@@QEAAXAEBVItemStack@@@Z", void_t, { this: Player }, ItemStack);
Player.prototype.getCursorSelectedItem = function (): ItemStack {
    return this.getPlayerUIItem(PlayerUISlot.CursorSelected);
};
Player.prototype.getPlayerUIItem = procHacker.js("?getPlayerUIItem@Player@@QEAAAEBVItemStack@@W4PlayerUISlot@@@Z", ItemStack.ref(), { this: Player }, int32_t);
Player.prototype.setPlayerUIItem = procHacker.js(
    "?setPlayerUIItem@Player@@QEAAXW4PlayerUISlot@@AEBVItemStack@@@Z",
    void_t,
    { this: Player },
    int32_t,
    ItemStack.ref(),
);
Player.prototype.getPlatform = procHacker.js("?getPlatform@Player@@QEBA?AW4BuildPlatform@@XZ", int32_t, { this: Player });
Player.prototype.getXuid = procHacker.js("?getXuid@Player@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: Player,
    structureReturn: true,
});
Player.prototype.getUuid = function () {
    return TryGetUserEntityIdComponent(this).uuid;
};
Player.prototype.forceAllowEating = procHacker.js("?forceAllowEating@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.getSpeed = procHacker.js("?getSpeed@Player@@UEBAMXZ", float32_t, { this: Player });
Player.prototype.hasOpenContainer = procHacker.js("?hasOpenContainer@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.isHungry = procHacker.js("?isHungry@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.isHurt = procHacker.js("?isHurt@Player@@QEAA_NXZ", bool_t, {
    this: Player,
});
Player.prototype.isSpawned = procHacker.js("?isSpawned@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.isLoading = procHacker.jsv("??_7ServerPlayer@@6B@", "?isLoading@ServerPlayer@@UEBA_NXZ", bool_t, { this: Player });
Player.prototype.isPlayerInitialized = procHacker.jsv("??_7ServerPlayer@@6B@", "?isPlayerInitialized@ServerPlayer@@UEBA_NXZ", bool_t, { this: Player });
Player.prototype.getDestroyProgress = procHacker.js("?getDestroyProgress@Player@@QEBAMAEBVBlock@@@Z", float32_t, { this: Player }, Block);
Player.prototype.respawn = procHacker.js("?respawn@Player@@UEAAXXZ", void_t, {
    this: Player,
});
Player.prototype.setRespawnReady = procHacker.js("?setRespawnReady@Player@@QEAAXAEBVVec3@@@Z", void_t, { this: Player }, Vec3);
Player.prototype.setSpawnBlockRespawnPosition = procHacker.js(
    "?setSpawnBlockRespawnPosition@Player@@QEAAXAEBVBlockPos@@V?$AutomaticID@VDimension@@H@@@Z",
    void_t,
    { this: Player },
    BlockPos,
    int32_t,
);
Player.prototype.setSelectedSlot = procHacker.js("?setSelectedSlot@Player@@QEAAAEBVItemStack@@H@Z", ItemStack, { this: Player }, int32_t);
Player.prototype.getDirection = procHacker.js("?getDirection@Player@@QEBAHXZ", int32_t, { this: Player });
Player.prototype.isFlying = procHacker.js("?isFlying@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.isHiddenFrom = procHacker.js("?isHiddenFrom@Player@@QEBA_NAEAVMob@@@Z", bool_t, { this: Player }, Mob);
Player.prototype.isInRaid = procHacker.js("?isInRaid@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.isUsingItem = procHacker.js("?isUsingItem@Player@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.hasDimension = procHacker.js("?hasDimension@Actor@@QEBA_NXZ", bool_t, { this: Player });
Player.prototype.getAbilities = procHacker.js("?getAbilities@Player@@QEAAAEAVLayeredAbilities@@XZ", LayeredAbilities, { this: Player });
Player.prototype.getSelectedItem = procHacker.js("?getSelectedItem@Player@@QEBAAEBVItemStack@@XZ", ItemStack, { this: Player });
Player.prototype.getName = procHacker.js("?getName@Player@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, { this: Player });

Player.tryGetFromEntity = procHacker.js("?tryGetFromEntity@Player@@SAPEAV1@AEAVEntityContext@@_N@Z", Player, null, EntityContext, bool_t);

ServerPlayer.prototype.nextContainerCounter = procHacker.js("?_nextContainerCounter@ServerPlayer@@AEAA?AW4ContainerID@@XZ", int8_t, { this: ServerPlayer });
ServerPlayer.prototype.openInventory = procHacker.js("?openInventory@ServerPlayer@@UEAAXXZ", void_t, { this: ServerPlayer });
ServerPlayer.prototype.resendAllChunks = procHacker.js("?resendAllChunks@Player@@QEAAXXZ", void_t, { this: ServerPlayer });
ServerPlayer.prototype.sendNetworkPacket = procHacker.js("?sendNetworkPacket@ServerPlayer@@UEBAXAEAVPacket@@@Z", void_t, { this: ServerPlayer }, Packet);
/**
 * ~1.20.50 implementing part of ServerPlayer::sendNetworkPacket
 * 1.20.50~ aspiring from existing, get components manually
 */
ServerPlayer.prototype.getNetworkIdentifier = function () {
    return TryGetUserEntityIdComponent(this).networkIdentifier;
};
ServerPlayer.prototype.setArmor = procHacker.js("?setArmor@ServerPlayer@@UEAAXW4ArmorSlot@@AEBVItemStack@@@Z", void_t, { this: ServerPlayer }, uint32_t, ItemStack);
ServerPlayer.prototype.sendArmor = procHacker.js("?sendArmor@ServerPlayer@@UEAAXV?$bitset@$03@std@@@Z", void_t, { this: ServerPlayer }, int32_t);
ServerPlayer.prototype.getInputMode = function () {
    return PlayerMovement.getInputMode(this.ctxbase);
};
ServerPlayer.prototype.setOffhandSlot = procHacker.js("?setOffhandSlot@ServerPlayer@@UEAAXAEBVItemStack@@@Z", void_t, { this: ServerPlayer }, ItemStack);
(ServerPlayer.prototype as any)._sendInventory = procHacker.js("?sendInventory@ServerPlayer@@UEAAX_N@Z", void_t, { this: ServerPlayer }, bool_t);
ServerPlayer.tryGetFromEntity = procHacker.js("?tryGetFromEntity@ServerPlayer@@SAPEAV1@AEAVEntityContext@@_N@Z", ServerPlayer, null, EntityContext, bool_t);

const ServerNetworkHandlerNonOwnerPointer = Bedrock.NonOwnerPointer.make(ServerNetworkHandler);
SimulatedPlayer.abstract({});
const SimulatedPlayer$create = procHacker.js(
    "?create@SimulatedPlayer@@SAPEAV1@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVBlockPos@@V?$AutomaticID@VDimension@@H@@V?$not_null@V?$NonOwnerPointer@VServerNetworkHandler@@@Bedrock@@@gsl@@0@Z",
    SimulatedPlayer,
    null,
    CxxString,
    BlockPos,
    int32_t,
    ServerNetworkHandlerNonOwnerPointer,
    CxxString,
);

const shHandler = ServerNetworkHandlerNonOwnerPointer.construct();

SimulatedPlayer.create = function (name: string, blockPos: VectorXYZ, dimensionId: DimensionId) {
    if (!(blockPos instanceof BlockPos)) blockPos = BlockPos.create(blockPos);
    shHandler.assign(bedrockServer.nonOwnerPointerServerNetworkHandler);
    const unknown = "12345678";
    const player = SimulatedPlayer$create(name, blockPos as BlockPos, dimensionId, shHandler, unknown); // it destructs snHandler
    return player;
};
SimulatedPlayer.prototype.simulateDisconnect = procHacker.js("?simulateDisconnect@SimulatedPlayer@@QEAAXXZ", void_t, { this: SimulatedPlayer });
SimulatedPlayer.prototype.simulateAttack = procHacker.js("?simulateAttack@SimulatedPlayer@@QEAA_NPEAVActor@@@Z", bool_t, { this: SimulatedPlayer }, Actor);
const SimulatedPlayer$simulateLookAtEntity = procHacker.js(
    "?simulateLookAt@SimulatedPlayer@@QEAAXAEAVActor@@W4LookDuration@sim@@@Z",
    void_t,
    null,
    SimulatedPlayer,
    Actor,
    uint8_t,
);
const SimulatedPlayer$simulateLookAtBlock = procHacker.js(
    "?simulateLookAt@SimulatedPlayer@@QEAAXAEBVBlockPos@@W4LookDuration@sim@@@Z",
    void_t,
    null,
    SimulatedPlayer,
    BlockPos,
    uint8_t,
);
const SimulatedPlayer$simulateLookAtLocation = procHacker.js("?simulateLookAt@SimulatedPlayer@@QEAAXAEBVVec3@@@Z", void_t, null, SimulatedPlayer, Vec3);
SimulatedPlayer.prototype.simulateLookAt = function (target: BlockPos | Actor | Vec3, duration: uint8_t = 0) {
    if (target instanceof Actor) {
        SimulatedPlayer$simulateLookAtEntity(this, target, duration);
    } else if (target instanceof BlockPos) {
        SimulatedPlayer$simulateLookAtBlock(this, target, duration);
    } else {
        SimulatedPlayer$simulateLookAtLocation(this, target);
    }
};
SimulatedPlayer.tryGetFromEntity = procHacker.js("?tryGetFromEntity@SimulatedPlayer@@SAPEAV1@AEAVEntityContext@@_N@Z", SimulatedPlayer, null, EntityContext, bool_t);

/*
TODO: Implement `ScriptNavigationResult`
const SimulatedPlayer$simulateNavigateToEntity = procHacker.js("?simulateNavigateToEntity@SimulatedPlayer@@QEAA?AUScriptNavigationResult@@AEAVActor@@M@Z",void_t,null,SimulatedPlayer,Actor,float32_t);
const SimulatedPlayer$simulateNavigateToLocation = procHacker.js("?simulateNavigateToLocation@SimulatedPlayer@@QEAA?AUScriptNavigationResult@@AEBVVec3@@M@Z",void_t,null,SimulatedPlayer,Vec3,float32_t);
SimulatedPlayer.prototype.simulateNavigateTo = function(goal:Actor|Vec3, speed:number){
    if(goal instanceof Vec3){
        SimulatedPlayer$simulateNavigateToLocation(this,goal,speed);
    }else{
        SimulatedPlayer$simulateNavigateToEntity(this,goal,speed);
    }
}; */

const SimulatedPlayer$simulateNavigateToLocations = procHacker.js(
    "?simulateNavigateToLocations@SimulatedPlayer@@QEAAX$$QEAV?$vector@VVec3@@V?$allocator@VVec3@@@std@@@std@@M@Z",
    void_t,
    null,
    SimulatedPlayer,
    CxxVector$Vec3,
    float32_t,
);
SimulatedPlayer.prototype.simulateNavigateToLocations = function (_locations, speed) {
    const locations = CxxVector$Vec3.construct();
    locations.reserve(_locations.length);
    for (const location of _locations) {
        locations.push(location);
    }
    SimulatedPlayer$simulateNavigateToLocations(this, locations, speed);
    locations.destruct();
};

SimulatedPlayer.prototype.simulateInteractWithActor = procHacker.js(
    "?simulateInteract@SimulatedPlayer@@QEAA_NAEAVActor@@@Z",
    bool_t,
    { this: SimulatedPlayer },
    Actor,
);
const SimulatedPlayer$simulateInteractWithBlock = procHacker.js(
    "?simulateInteract@SimulatedPlayer@@QEAA_NAEBVBlockPos@@W4ScriptFacing@ScriptModuleMinecraft@@@Z",
    bool_t,
    null,
    SimulatedPlayer,
    BlockPos,
    uint8_t,
);
SimulatedPlayer.prototype.simulateInteractWithBlock = function (blockPos: BlockPos, direction: number = 1) {
    return SimulatedPlayer$simulateInteractWithBlock(this, blockPos, direction);
};
SimulatedPlayer.prototype.simulateJump = procHacker.js("?simulateJump@SimulatedPlayer@@QEAA_NXZ", void_t, { this: SimulatedPlayer });
SimulatedPlayer.prototype.simulateSetBodyRotation = procHacker.js(
    "?simulateSetBodyRotation@SimulatedPlayer@@QEAAXM@Z",
    void_t,
    { this: SimulatedPlayer },
    float32_t,
);
SimulatedPlayer.prototype.simulateSetItem = procHacker.js(
    "?simulateSetItem@SimulatedPlayer@@QEAA_NAEAVItemStack@@_NH@Z",
    bool_t,
    { this: SimulatedPlayer },
    ItemStack,
    bool_t,
    int32_t,
);
const SimulatedPlayer$simulateDestroyBlock = procHacker.js(
    "?simulateDestroyBlock@SimulatedPlayer@@QEAA_NAEBVBlockPos@@W4ScriptFacing@ScriptModuleMinecraft@@@Z",
    bool_t,
    null,
    SimulatedPlayer,
    BlockPos,
    int32_t,
);
SimulatedPlayer.prototype.simulateDestroyBlock = function (pos: BlockPos, direction: number = 1) {
    return SimulatedPlayer$simulateDestroyBlock(this, pos, direction);
};
SimulatedPlayer.prototype.simulateStopDestroyingBlock = procHacker.js("?simulateStopDestroyingBlock@SimulatedPlayer@@QEAAXXZ", void_t, { this: SimulatedPlayer });
SimulatedPlayer.prototype.simulateLocalMove = procHacker.js(
    "?simulateLocalMove@SimulatedPlayer@@QEAAXAEBVVec3@@M@Z",
    void_t,
    { this: SimulatedPlayer },
    Vec3,
    float32_t,
);
SimulatedPlayer.prototype.simulateMoveToLocation = procHacker.js(
    "?simulateMoveToLocation@SimulatedPlayer@@QEAAXAEBVVec3@@M_N@Z",
    void_t,
    { this: SimulatedPlayer },
    Vec3,
    float32_t,
    bool_t,
);
SimulatedPlayer.prototype.simulateStopMoving = procHacker.js("?simulateStopMoving@SimulatedPlayer@@QEAAXXZ", void_t, { this: SimulatedPlayer });
SimulatedPlayer.prototype.simulateUseItem = procHacker.js("?simulateUseItem@SimulatedPlayer@@QEAA_NAEAVItemStack@@@Z", bool_t, { this: SimulatedPlayer }, ItemStack);
SimulatedPlayer.prototype.simulateUseItemInSlot = procHacker.js("?simulateUseItemInSlot@SimulatedPlayer@@QEAA_NH@Z", bool_t, { this: SimulatedPlayer }, int32_t);
const SimulatedPlayer$simulateUseItemOnBlock = procHacker.js(
    "?simulateUseItemOnBlock@SimulatedPlayer@@QEAA_NAEAVItemStack@@AEBVBlockPos@@W4ScriptFacing@ScriptModuleMinecraft@@AEBVVec3@@@Z",
    bool_t,
    null,
    SimulatedPlayer,
    ItemStack,
    BlockPos,
    int32_t,
    Vec3,
);
SimulatedPlayer.prototype.simulateUseItemOnBlock = function (item: ItemStack, pos: BlockPos, direction: number = 1, clickPos: Vec3 = Vec3.create(0, 0, 0)) {
    return SimulatedPlayer$simulateUseItemOnBlock(this, item, pos, direction, clickPos);
};
const SimulatedPlayer$simulateUseItemInSlotOnBlock = procHacker.js(
    "?simulateUseItemInSlotOnBlock@SimulatedPlayer@@QEAA_NHAEBVBlockPos@@W4ScriptFacing@ScriptModuleMinecraft@@AEBVVec3@@@Z",
    bool_t,
    null,
    SimulatedPlayer,
    int32_t,
    BlockPos,
    int32_t,
    Vec3,
);
SimulatedPlayer.prototype.simulateUseItemInSlotOnBlock = function (slot: number, pos: BlockPos, direction: number = 1, clickPos: Vec3 = Vec3.create(0, 0, 0)) {
    return SimulatedPlayer$simulateUseItemInSlotOnBlock(this, slot, pos, direction, clickPos);
};

const PlayerListEntry$PlayerListEntry = procHacker.js("??0PlayerListEntry@@QEAA@AEBVPlayer@@@Z", PlayerListEntry, null, PlayerListEntry, Player);
PlayerListEntry.constructWith = function (player: Player): PlayerListEntry {
    const entry = new PlayerListEntry(true);
    return PlayerListEntry$PlayerListEntry(entry, player);
};
PlayerListEntry.prototype[NativeType.dtor] = procHacker.js("??1PlayerListEntry@@QEAA@XZ", void_t, { this: PlayerListEntry });

ItemStackRequestPacket.prototype.getRequestBatch = procHacker.js(
    "?getRequestBatch@ItemStackRequestPacket@@QEBAAEBVItemStackRequestBatch@@XZ",
    ItemStackRequestBatch,
    { this: ItemStackRequestPacket },
);
/* ItemStackRequestActionTransferBase.prototype.getSrc = procHacker.js(
    "?getSrc@ItemStackRequestActionTransferBase@@QEBAAEBUItemStackRequestSlotInfo@@XZ",
    ItemStackRequestSlotInfo,
    { this: ItemStackRequestActionTransferBase },
);
 */
// networkidentifier.ts
NetworkIdentifier.prototype.getActor = function (): ServerPlayer | null {
    return bedrockServer.serverNetworkHandler._getServerPlayer(this, 0);
};
NetworkIdentifier.prototype.getAddress = function (): string {
    const idx = this.address.GetSystemIndex();
    const rakpeer = bedrockServer.rakPeer;
    return rakpeer.GetSystemAddressFromIndex(idx).toString();
};
const NetworkIdentifier$equalsTypeData = procHacker.js("?equalsTypeData@NetworkIdentifier@@AEBA_NAEBV1@@Z", bool_t, null, NetworkIdentifier, NetworkIdentifier);
NetworkIdentifier.prototype.equals = function (other): boolean {
    if (other.type !== other.type) return false;
    return NetworkIdentifier$equalsTypeData(this, other);
};

const NetworkIdentifier_getHash = procHacker.js("?getHash@NetworkIdentifier@@QEBA_KXZ", bin64_t, null, NetworkIdentifier);
NetworkIdentifier.prototype.hash = function () {
    const hash = NetworkIdentifier_getHash(this);
    return bin.int32(hash) ^ bin.int32_high(hash);
};

NetworkConnection.abstract({
    networkIdentifier: [NetworkIdentifier, 0],
});
Object.defineProperties(NetworkSystem.prototype, {
    instance: {
        get() {
            return bedrockServer.connector;
        },
    },
});

// NetworkSystem::Connection* NetworkSystem::getConnectionFromId(const NetworkIdentifier& ni)
NetworkSystem.prototype.getConnectionFromId = procHacker.js(
    "?_getConnectionFromId@NetworkSystem@@AEBAPEAVNetworkConnection@@AEBVNetworkIdentifier@@@Z",
    NetworkConnection,
    { this: NetworkSystem },
);

// void NetworkSystem::send(const NetworkIdentifier& ni, Packet& packet, unsigned char senderSubClientId)
NetworkSystem.prototype.send = makefunc.js(
    asmcode.packetSendHook, // pass hooked function directly, reduce overhead
    void_t,
    { this: NetworkSystem },
    NetworkIdentifier,
    Packet,
    uint8_t,
);

// void NetworkSystem::_sendInternal(const NetworkIdentifier& ni, Packet* packet, std::string& data)
NetworkSystem.prototype.sendInternal = procHacker.js(
    "?_sendInternal@NetworkSystem@@AEAAXAEBVNetworkIdentifier@@AEBVPacket@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: NetworkSystem },
    NetworkIdentifier,
    Packet,
    CxxStringWrapper,
);

NetworkConnection.prototype.disconnect = function () {
    // NetworkSystem::onConnectionClosed, [rbx] = NetworkSystem*
    (this as any as StaticPointer).setUint8(1, 0x168);
};

const BatchedNetworkPeer$sendPacket = procHacker.js(
    "?sendPacket@BatchedNetworkPeer@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@W4Reliability@NetworkPeer@@W4Compressibility@@@Z",
    void_t,
    { this: BatchedNetworkPeer },
    CxxString,
    int32_t,
    int32_t,
);
BatchedNetworkPeer.prototype.sendPacket = function (data: CxxString, reliability: number, compressibility: number, oldparam?: number, oldparam2?: number) {
    if (oldparam2 !== undefined) {
        compressibility = oldparam2;
    } else if (oldparam !== undefined) {
        compressibility = oldparam;
    }
    BatchedNetworkPeer$sendPacket.call(this, data, reliability, compressibility);
};
Object.defineProperties(RakNetConnector.prototype, {
    peer: {
        get() {
            return bedrockServer.rakPeer;
        },
    },
});
RakNetConnector.prototype.getPort = procHacker.js("?getPort@RakNetConnector@@UEBAGXZ", uint16_t, { this: RakNetConnector });

RakNet.RakPeer.prototype.GetAveragePing = procHacker.js(
    "?GetAveragePing@RakPeer@RakNet@@UEAAHUAddressOrGUID@2@@Z",
    int32_t,
    { this: RakNet.RakPeer },
    RakNet.AddressOrGUID,
);
RakNet.RakPeer.prototype.GetLastPing = procHacker.js(
    "?GetLastPing@RakPeer@RakNet@@UEBAHUAddressOrGUID@2@@Z",
    int32_t,
    { this: RakNet.RakPeer },
    RakNet.AddressOrGUID,
);
RakNet.RakPeer.prototype.GetLowestPing = procHacker.js(
    "?GetLowestPing@RakPeer@RakNet@@UEBAHUAddressOrGUID@2@@Z",
    int32_t,
    { this: RakNet.RakPeer },
    RakNet.AddressOrGUID,
);

// packet.ts
Packet.prototype[NativeType.dtor] = vectorDeletingDestructor;
Packet.prototype.sendTo = function (target: NetworkIdentifier, senderSubClientId: number = 0): void {
    bedrockServer.networkSystem.send(target, this, senderSubClientId);
};
Packet.prototype.getId = procHacker.jsv("??_7SetTitlePacket@@6B@", "?getId@SetTitlePacket@@UEBA?AW4MinecraftPacketIds@@XZ", int32_t, { this: Packet });
Packet.prototype.getName = procHacker.jsv(
    "??_7LoginPacket@@6B@",
    "?getName@LoginPacket@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: Packet, structureReturn: true },
);
Packet.prototype.write = procHacker.jsv("??_7LoginPacket@@6B@", "?write@LoginPacket@@UEBAXAEAVBinaryStream@@@Z", void_t, { this: Packet }, BinaryStream);
Packet.prototype.read = procHacker.jsv(
    "??_7LoginPacket@@6B@",
    "?_read@LoginPacket@@EEAA?AV?$Result@XVerror_code@std@@@Bedrock@@AEAVReadOnlyBinaryStream@@@Z",
    Bedrock.VoidErrorCodeResult,
    { this: Packet },
    BinaryStream,
);

ItemStackRequestData.prototype.getStringsToFilter = function () {
    // assuming it is put before the actions vector, it can be tested by renaming an item with an anvil.
    return this.addAs(CxxVector$string, 0x10);
};
ItemStackRequestData.prototype.getActions = function () {
    // accessed in tryFindAction, to check if the vector is empty
    return this.addAs(CxxVector$ItemStackRequestActionRef, 0x30);
};
ItemStackRequestData.prototype.tryFindAction = procHacker.js(
    "?tryFindAction@ItemStackRequestData@@QEBAPEBVItemStackRequestAction@@W4ItemStackRequestActionType@@@Z",
    ItemStackRequestAction,
    { this: ItemStackRequestData },
    uint8_t,
);

PlayerAuthInputPacket.prototype.getInput = procHacker.js(
    "?getInput@PlayerAuthInputPacket@@QEBA_NW4InputData@1@@Z",
    bool_t,
    { this: PlayerAuthInputPacket },
    int32_t,
);

// networkidentifier.ts
ServerNetworkHandler.prototype._getServerPlayer = procHacker.js(
    "?_getServerPlayer@ServerNetworkHandler@@EEAAPEAVServerPlayer@@AEBVNetworkIdentifier@@W4SubClientId@@@Z",
    ServerPlayer,
    { this: ServerNetworkHandler },
    NetworkIdentifier,
    uint8_t,
);
const ServerNetworkHandler$disconnectClient = procHacker.js(
    "?disconnectClient@ServerNetworkHandler@@QEAAXAEBVNetworkIdentifier@@W4SubClientId@@W4DisconnectFailReason@Connection@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_N@Z",
    void_t,
    null,
    ServerNetworkHandler,
    NetworkIdentifier,
    uint8_t,
    int32_t,
    CxxString,
    bool_t,
);
ServerNetworkHandler.prototype.disconnectClient = function (
    client: NetworkIdentifier,
    message: string = "disconnectionScreen.disconnected",
    skipMessage: boolean = false,
): void {
    ServerNetworkHandler$disconnectClient(this, client, /** subClientId */ 0, /** disconnectFailReason */ 0, message, skipMessage);
};
ServerNetworkHandler.prototype.allowIncomingConnections = procHacker.js(
    "?allowIncomingConnections@ServerNetworkHandler@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@_N@Z",
    void_t,
    { this: ServerNetworkHandler },
    CxxString,
    bool_t,
);
ServerNetworkHandler.prototype.updateServerAnnouncement = procHacker.js("?updateServerAnnouncement@ServerNetworkHandler@@QEAAXXZ", void_t, {
    this: ServerNetworkHandler,
});
ServerNetworkHandler.prototype.setMaxNumPlayers = procHacker.js("?setMaxNumPlayers@ServerNetworkHandler@@QEAAHH@Z", void_t, { this: ServerNetworkHandler }, int32_t);
ServerNetworkHandler.prototype.fetchConnectionRequest = procHacker.js(
    "?fetchConnectionRequest@ServerNetworkHandler@@QEAAAEBVConnectionRequest@@AEBVNetworkIdentifier@@@Z",
    ConnectionRequest,
    { this: ServerNetworkHandler },
    NetworkIdentifier,
);

// connreq.ts
Certificate.prototype.getXuid = function (b): string {
    return ExtendedCertificate.getXuid(this, b!);
};
Certificate.prototype.getIdentityName = function (): string {
    return ExtendedCertificate.getIdentityName(this);
};
Certificate.prototype.getIdentity = function (): mce.UUID {
    return ExtendedCertificate.getIdentity(this).value;
};

ConnectionRequest.prototype.getCertificate = procHacker.js("?getCertificate@ConnectionRequest@@QEBAPEBVCertificate@@XZ", Certificate, { this: ConnectionRequest });

namespace ExtendedCertificate {
    export const getXuid = procHacker.js(
        "?getXuid@ExtendedCertificate@@SA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVCertificate@@_N@Z",
        CxxString,
        { structureReturn: true },
        Certificate,
        bool_t,
    );
    export const getIdentityName = procHacker.js(
        "?getIdentityName@ExtendedCertificate@@SA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVCertificate@@@Z",
        CxxString,
        { structureReturn: true },
        Certificate,
    );
    export const getIdentity = procHacker.js(
        "?getIdentity@ExtendedCertificate@@SA?AVUUID@mce@@AEBVCertificate@@@Z",
        mce.UUIDWrapper,
        { structureReturn: true },
        Certificate,
    );
}

// attribute.ts
AttributeInstance.abstract({
    vftable: VoidPointer,
    u1: VoidPointer,
    u2: VoidPointer,
    currentValue: [float32_t, 0x84],
    minValue: [float32_t, 0x7c],
    maxValue: [float32_t, 0x80],
    defaultValue: [float32_t, 0x78],
});

BaseAttributeMap.prototype.getMutableInstance = procHacker.js(
    "?getMutableInstance@BaseAttributeMap@@QEAAPEAVAttributeInstance@@I@Z",
    AttributeInstance,
    { this: BaseAttributeMap },
    int32_t,
);

// server.ts
VanillaGameModuleServer.abstract({
    listener: [VanillaServerGameplayEventListener.ref(), 0x8],
});
DedicatedServer.abstract({
    vftable: VoidPointer,
});
Minecraft.abstract({
    vftable: VoidPointer,
    vanillaGameModuleServer: [CxxSharedPtr, 0x28], // VanillaGameModuleServer
    server: DedicatedServer.ref(),
});
Minecraft.prototype.getLevel = function () {
    return bedrockServer.level;
};
Minecraft.prototype.getNetworkHandler = function () {
    return bedrockServer.networkSystem;
};
Minecraft.prototype.getNonOwnerPointerServerNetworkHandler = procHacker.js(
    "?getServerNetworkHandler@Minecraft@@QEAA?AV?$NonOwnerPointer@VServerNetworkHandler@@@Bedrock@@XZ",
    Bedrock.NonOwnerPointer.make(ServerNetworkHandler),
    { this: Minecraft, structureReturn: true },
);
Minecraft.prototype.getServerNetworkHandler = function () {
    return bedrockServer.serverNetworkHandler;
};
Minecraft.prototype.getCommands = function () {
    return bedrockServer.minecraftCommands;
};
ScriptFramework.abstract({
    vftable: VoidPointer,
});
ServerInstance.abstract({
    vftable: VoidPointer,
});
Object.defineProperties(ServerInstance.prototype, {
    server: {
        get() {
            return bedrockServer.dedicatedServer;
        },
    },
    minecraft: {
        get() {
            return bedrockServer.minecraft;
        },
    },
    networkSystem: {
        get() {
            return bedrockServer.networkSystem;
        },
    },
});
(ServerInstance.prototype as any)._disconnectAllClients = procHacker.js(
    "?disconnectAllClientsWithMessage@ServerInstance@@QEAAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: ServerInstance },
    CxxString,
);

ServerInstance.prototype.createDimension = function (id: DimensionId): Dimension {
    return bedrockServer.level.createDimension(id);
};
ServerInstance.prototype.getActivePlayerCount = function (): number {
    return bedrockServer.level.getActivePlayerCount();
};
ServerInstance.prototype.disconnectClient = function (
    client: NetworkIdentifier,
    message: string = "disconnectionScreen.disconnected",
    skipMessage: boolean = false,
): void {
    return bedrockServer.serverNetworkHandler.disconnectClient(client, message, skipMessage);
};
ServerInstance.prototype.getMotd = function (): string {
    return bedrockServer.serverNetworkHandler.motd;
};
ServerInstance.prototype.setMotd = function (motd: string): void {
    return bedrockServer.serverNetworkHandler.setMotd(motd);
};
ServerInstance.prototype.getMaxPlayers = function (): number {
    return bedrockServer.serverNetworkHandler.maxPlayers;
};
ServerInstance.prototype.setMaxPlayers = function (count: number): void {
    bedrockServer.serverNetworkHandler.setMaxNumPlayers(count);
};
ServerInstance.prototype.getPlayers = function (): ServerPlayer[] {
    return bedrockServer.level.getPlayers();
};
ServerInstance.prototype.updateCommandList = function (): void {
    const pk = bedrockServer.commandRegistry.serializeAvailableCommands();
    for (const player of this.getPlayers()) {
        player.sendNetworkPacket(pk);
    }
    pk.dispose();
};
const networkProtocolVersion = proc["?NetworkProtocolVersion@SharedConstants@@3HB"].getInt32();
ServerInstance.prototype.getNetworkProtocolVersion = function (): number {
    return networkProtocolVersion;
};
const currentGameSemVersion = proc["?CurrentGameSemVersion@SharedConstants@@3VSemVersion@@B"].as(SemVersion);
ServerInstance.prototype.getGameVersion = function (): SemVersion {
    return currentGameSemVersion;
};

Minecraft$Something.prototype.network = bedrockServer.networkSystem;
Minecraft$Something.prototype.level = bedrockServer.level;
Minecraft$Something.prototype.shandler = bedrockServer.serverNetworkHandler;

// gamemode.ts
GameMode.abstract({
    actor: [Player.ref(), 8],
});

@nativeClass(null)
class RecordItem extends Item {
    @nativeField(VoidPointer)
    vftable: VoidPointer;
}

const RecordItem$vftable = proc["??_7RecordItem@@6B@"];
Item.setResolver(ptr => {
    if (ptr === null) {
        return null;
    }
    const vftable = ptr.getPointer();
    if (vftable.equalsptr(RecordItem$vftable)) {
        return ptr.as(RecordItem);
    } else {
        return ptr.as(Item);
    }
});

Item.prototype.isMusicDisk = function () {
    return this instanceof RecordItem;
};

// inventory.ts
Item.prototype.allowOffhand = function () {
    // manual implement
    // accessed on Item::setAllowOffhand
    return (this as any).getInt8(0x13a) < 0;
};
Item.prototype.isDamageable = procHacker.js("?isDamageable@Item@@UEBA_NXZ", bool_t, { this: Item });
Item.prototype.isFood = procHacker.js("?isFood@Item@@UEBA_NXZ", bool_t, {
    this: Item,
});
Item.prototype.setAllowOffhand = procHacker.js("?setAllowOffhand@Item@@QEAAAEAV1@_N@Z", void_t, { this: Item }, bool_t);
Item.prototype.getSerializedName = procHacker.js("?getSerializedName@Item@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: Item,
    structureReturn: true,
});
Item.prototype.getCommandNames = procHacker.js(
    "?getCommandNames@Item@@QEBA?AV?$vector@UCommandName@@V?$allocator@UCommandName@@@std@@@std@@XZ",
    CxxVector$CxxStringWith8Bytes,
    { this: Item, structureReturn: true },
);
Item.prototype.getCommandNames2 = procHacker.js(
    "?getCommandNames@Item@@QEBA?AV?$vector@UCommandName@@V?$allocator@UCommandName@@@std@@@std@@XZ",
    CxxVector$CommandName,
    { this: Item, structureReturn: true },
);
Item.prototype.getCreativeCategory = procHacker.js("?getCreativeCategory@Item@@QEBA?AW4CreativeItemCategory@@XZ", int32_t, { this: Item });

ItemStack.prototype[NativeType.dtor] = vectorDeletingDestructor;

Item.prototype.isArmor = procHacker.jsv("??_7ArmorItem@@6B@", "?isArmor@ArmorItem@@UEBA_NXZ", bool_t, { this: Item });
Item.prototype.getArmorValue = procHacker.jsv("??_7ArmorItem@@6B@", "?getArmorValue@ArmorItem@@UEBAHXZ", int32_t, { this: Item });
Item.prototype.getToughnessValue = procHacker.jsv("??_7ArmorItem@@6B@", "?getToughnessValue@ArmorItem@@UEBAHXZ", int32_t, { this: Item });
Item.prototype.getCooldownType = procHacker.jsv("??_7Item@@6B@", "?getCooldownType@Item@@UEBAAEBVHashedString@@XZ", HashedString, { this: Item });
Item.prototype.canDestroyInCreative = procHacker.jsv("??_7ComponentItem@@6B@", "?canDestroyInCreative@ComponentItem@@UEBA_NXZ", bool_t, { this: Item });

ItemStackBase.prototype.toString = procHacker.jsv(
    "??_7ItemStackBase@@6B@",
    "?toString@ItemStackBase@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: ItemStackBase, structureReturn: true },
);
ItemStackBase.prototype.toDebugString = procHacker.jsv(
    "??_7ItemStackBase@@6B@",
    "?toDebugString@ItemStackBase@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: ItemStackBase, structureReturn: true },
);

ItemStackBase.prototype.remove = procHacker.js("?remove@ItemStackBase@@QEAAXH@Z", void_t, { this: ItemStackBase }, int32_t);
ItemStackBase.prototype.addAmount = procHacker.js("?add@ItemStackBase@@QEAAXH@Z", void_t, { this: ItemStackBase }, int32_t);
ItemStackBase.prototype.setAuxValue = procHacker.js("?setAuxValue@ItemStackBase@@QEAAXF@Z", void_t, { this: ItemStackBase }, int16_t);
ItemStackBase.prototype.getAuxValue = procHacker.js("?getAuxValue@ItemStackBase@@QEBAFXZ", int16_t, { this: ItemStackBase });
ItemStackBase.prototype.isValidAuxValue = procHacker.js("?isValidAuxValue@ItemStackBase@@QEBA_NH@Z", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.getMaxStackSize = procHacker.js("?getMaxStackSize@ItemStackBase@@QEBAEXZ", int32_t, { this: ItemStackBase });
ItemStackBase.prototype.getId = procHacker.js("?getId@ItemStackBase@@QEBAFXZ", int16_t, { this: ItemStackBase });
ItemStackBase.prototype.getRawNameId = procHacker.js(
    "?getRawNameId@ItemStackBase@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: ItemStackBase, structureReturn: true },
);
ItemStackBase.prototype.getCustomName = procHacker.js("?getName@ItemStackBase@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: ItemStackBase,
    structureReturn: true,
});
ItemStackBase.prototype.setCustomName = procHacker.js(
    "?setCustomName@ItemStackBase@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: ItemStackBase },
    CxxString,
);
ItemStackBase.prototype.getUserData = procHacker.js("?getUserData@ItemStackBase@@QEAAPEAVCompoundTag@@XZ", CompoundTag, { this: ItemStackBase });
ItemStackBase.prototype.hasCustomName = procHacker.js("?hasCustomHoverName@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isBlock = procHacker.js("?isBlock@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isNull = procHacker.js("?isNull@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.setNull = procHacker.js(
    "?setNull@ItemStackBase@@UEAAXV?$optional@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@std@@@Z",
    void_t,
    { this: ItemStackBase },
    CxxOptionalToUndefUnion.make(CxxString),
);
ItemStackBase.prototype.getEnchantValue = procHacker.js("?getEnchantValue@ItemStackBase@@QEBAHXZ", int32_t, { this: ItemStackBase });
ItemStackBase.prototype.isEnchanted = procHacker.js("?isEnchanted@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.setDamageValue = procHacker.js("?setDamageValue@ItemStackBase@@QEAAXF@Z", void_t, { this: ItemStackBase }, int16_t);
ItemStackBase.prototype.setItem = procHacker.js("?_setItem@ItemStackBase@@AEAA_NH_N@Z", bool_t, { this: ItemStackBase }, int32_t);
ItemStackBase.prototype.startCoolDown = procHacker.js("?startCoolDown@ItemStackBase@@QEBAXPEAVPlayer@@@Z", void_t, { this: ItemStackBase }, ServerPlayer);
@nativeClass()
class ComparisonOptions extends NativeClass {
    @nativeField(bool_t)
    b0: bool_t;
    @nativeField(bool_t)
    b1: bool_t;
}
const ItemStackBase$sameItem = procHacker.js("?sameItem@ItemStackBase@@QEBA_NAEBV1@AEBUComparisonOptions@1@@Z", bool_t, { this: ItemStackBase }, ItemStackBase);
ItemStackBase.prototype.sameItem = function (item) {
    const opt = new ComparisonOptions(true);
    opt.b0 = false;
    opt.b1 = false;
    return ItemStackBase$sameItem.call(this, item, opt);
};
ItemStackBase.prototype.sameItemAndAux = procHacker.js("?sameItemAndAux@ItemStackBase@@QEBA_NAEBV1@@Z", bool_t, { this: ItemStackBase }, ItemStackBase);
ItemStackBase.prototype.isStackedByData = procHacker.js("?isStackedByData@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isStackable = procHacker.js("?isStackable@ItemStackBase@@QEBA_NAEBV1@@Z", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isPotionItem = procHacker.js("?isPotionItem@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isPattern = procHacker.js("?isPattern@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isLiquidClipItem = procHacker.js("?isLiquidClipItem@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isHorseArmorItem = procHacker.js("?isHorseArmorItem@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isGlint = procHacker.js("?isGlint@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isFullStack = procHacker.js("?isFullStack@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isFireResistant = procHacker.js("?isFireResistant@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isExplodable = procHacker.js("?isExplodable@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isDamaged = procHacker.js("?isDamaged@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isDamageableItem = procHacker.js("?isDamageableItem@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.isArmorItem = procHacker.js("?isArmorItem@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.getComponentItem = procHacker.js("?getComponentItem@ItemStackBase@@QEBAPEBVComponentItem@@XZ", ComponentItem, { this: ItemStackBase });
ItemStackBase.prototype.getMaxDamage = procHacker.js("?getMaxDamage@ItemStackBase@@QEBAFXZ", int32_t, { this: ItemStackBase });
ItemStackBase.prototype.getDamageValue = procHacker.js("?getDamageValue@ItemStackBase@@QEBAFXZ", int16_t, { this: ItemStackBase });
ItemStackBase.prototype.isWearableItem = procHacker.js("?isWearableItem@ItemStackBase@@QEBA_NXZ", bool_t, { this: ItemStackBase });
ItemStackBase.prototype.getAttackDamage = procHacker.js("?getAttackDamage@ItemStackBase@@QEBAHXZ", int32_t, { this: ItemStackBase });
ItemStackBase.prototype.allocateAndSave = procHacker.js(
    "?save@ItemStackBase@@QEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ",
    CompoundTag.ref(),
    { this: ItemStackBase, structureReturn: true },
);
ItemStackBase.prototype.isMusicDiscItem = function () {
    return this.getItem()?.isMusicDisk() === true;
};

(ItemStackBase.prototype as any)._getItem = procHacker.js("?getItem@ItemStackBase@@QEBAPEBVItem@@XZ", Item, { this: ItemStackBase });
(ItemStackBase.prototype as any)._setCustomLore = procHacker.js(
    "?setCustomLore@ItemStackBase@@QEAAXAEBV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@@Z",
    void_t,
    { this: ItemStackBase },
    CxxVector.make(CxxStringWrapper),
);
const ItemStackBase$getCustomLore = procHacker.js(
    "?getCustomLore@ItemStackBase@@QEBA?AV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ",
    CxxVector$string,
    { this: ItemStackBase, structureReturn: true },
);
ItemStackBase.prototype.getCustomLore = function () {
    const lore: CxxVector<CxxString> = ItemStackBase$getCustomLore.call(this);
    const res = lore.toArray();
    lore.destruct();
    return res;
};

ItemStackBase.prototype.constructItemEnchantsFromUserData = procHacker.js(
    "?constructItemEnchantsFromUserData@ItemStackBase@@QEBA?AVItemEnchants@@XZ",
    ItemEnchants,
    { this: ItemStackBase, structureReturn: true },
);
ItemStackBase.prototype.saveEnchantsToUserData = procHacker.js(
    "?saveEnchantsToUserData@ItemStackBase@@QEAAXAEBVItemEnchants@@@Z",
    void_t,
    { this: ItemStackBase },
    ItemEnchants,
);
// ItemStackBase.prototype.getCategoryName = procHacker.js(
//     "?getCategoryName@ItemStackBase@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
//     CxxString,
//     { this: ItemStackBase, structureReturn: true },
// );
ItemStackBase.prototype.canDestroySpecial = procHacker.js("?canDestroySpecial@ItemStackBase@@QEBA_NAEBVBlock@@@Z", bool_t, { this: ItemStackBase }, Block);
const ItemStackBase$hurtAndBreak = procHacker.js("?hurtAndBreak@ItemStackBase@@QEAA_NHPEAVActor@@@Z", bool_t, { this: ItemStackBase }, int32_t, Actor);
ItemStackBase.prototype.hurtAndBreak = function (count: number, actor: Actor | null = null): boolean {
    return ItemStackBase$hurtAndBreak.call(this, count, actor);
};

const ItemStackBase$load = procHacker.js("?load@ItemStackBase@@QEAAXAEBVCompoundTag@@@Z", void_t, { this: ItemStackBase }, CompoundTag);
ItemStackBase.prototype.load = function (tag) {
    if (tag instanceof Tag) {
        ItemStackBase$load.call(this, tag);
    } else {
        const allocated = NBT.allocate(tag);
        ItemStackBase$load.call(this, allocated as CompoundTag);
        allocated.dispose();
    }
};
const ItemStack$clone = procHacker.js("?clone@ItemStack@@QEBA?AV1@XZ", void_t, null, ItemStack, ItemStack);

ItemStack.prototype.clone = function (target: ItemStack = new ItemStack(true)) {
    ItemStack$clone(this, target);
    return target;
};
ItemStack.prototype.getDestroySpeed = procHacker.js("?getDestroySpeed@ItemStack@@QEBAMAEBVBlock@@@Z", float32_t, { this: ItemStack }, Block);
ItemStack.constructWith = function (itemName: CxxString, amount: int32_t = 1, data: int32_t = 0): ItemStack {
    return CommandUtils.createItemStack(itemName, amount, data);
};
ItemStack.fromDescriptor = procHacker.js(
    "?fromDescriptor@ItemStack@@SA?AV1@AEBVNetworkItemStackDescriptor@@AEAVBlockPalette@@_N@Z",
    ItemStack,
    { structureReturn: true },
    NetworkItemStackDescriptor,
    BlockPalette,
    bool_t,
);
NetworkItemStackDescriptor.constructWith = procHacker.js(
    "??0NetworkItemStackDescriptor@@QEAA@AEBVItemStack@@@Z",
    NetworkItemStackDescriptor,
    { structureReturn: true },
    ItemStack,
);

NetworkItemStackDescriptor.prototype[NativeType.ctor_move] = procHacker.js(
    "??0NetworkItemStackDescriptor@@QEAA@$$QEAV0@@Z",
    void_t,
    { this: NetworkItemStackDescriptor },
    NetworkItemStackDescriptor,
);

const ItemStack$fromTag = procHacker.js("?fromTag@ItemStack@@SA?AV1@AEBVCompoundTag@@@Z", ItemStack, { structureReturn: true }, CompoundTag);
ItemStack.fromTag = function (tag) {
    if (tag instanceof Tag) {
        return ItemStack$fromTag(tag);
    } else {
        const allocated = NBT.allocate(tag);
        const res = ItemStack$fromTag(allocated as CompoundTag);
        allocated.dispose();
        return res;
    }
};

ComponentItem.prototype.buildNetworkTag = procHacker.jsv(
    "??_7ComponentItem@@6B@",
    "?buildNetworkTag@ComponentItem@@UEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ",
    CompoundTag.ref(),
    { this: ComponentItem, structureReturn: true },
);
ComponentItem.prototype.initializeFromNetwork = procHacker.jsv(
    "??_7ComponentItem@@6B@",
    "?initializeFromNetwork@ComponentItem@@UEAAXAEBVCompoundTag@@@Z",
    void_t,
    { this: ComponentItem },
    CompoundTag,
);
(ComponentItem.prototype as any)._getComponent = procHacker.js(
    "?getComponent@ComponentItem@@UEBAPEAVItemComponent@@AEBVHashedString@@@Z",
    ItemComponent,
    { this: ComponentItem },
    HashedString,
);

Container.prototype.addItem = procHacker.js("?addItem@Container@@UEAA_NAEAVItemStack@@@Z", void_t, { this: Container }, ItemStack);
Container.prototype.addItemToFirstEmptySlot = procHacker.js("?addItemToFirstEmptySlot@Container@@UEAA_NAEBVItemStack@@@Z", bool_t, { this: Container }, ItemStack);
Container.prototype.getSlots = procHacker.js(
    "?getSlots@Container@@UEBA?BV?$vector@PEBVItemStack@@V?$allocator@PEBVItemStack@@@std@@@std@@XZ",
    CxxVector.make(ItemStack.ref()),
    { this: Container, structureReturn: true },
);
Container.prototype.getItem = procHacker.jsv(
    "??_7SimpleContainer@@6B@",
    "?getItem@SimpleContainer@@UEBAAEBVItemStack@@H@Z",
    ItemStack,
    { this: Container },
    uint8_t,
);
Container.prototype.getItemCount = procHacker.js("?getItemCount@Container@@UEBAHAEBVItemStack@@@Z", int32_t, { this: Container }, ItemStack);
Container.prototype.getContainerType = procHacker.js("?getContainerType@Container@@QEBA?AW4ContainerType@@XZ", uint8_t, { this: Container });
Container.prototype.hasRoomForItem = procHacker.js("?hasRoomForItem@Container@@UEAA_NAEBVItemStack@@@Z", bool_t, { this: Container }, ItemStack);
Container.prototype.isEmpty = procHacker.js("?isEmpty@Container@@UEBA_NXZ", bool_t, { this: Container });
Container.prototype.removeAllItems = procHacker.js("?removeAllItems@Container@@UEAAXXZ", void_t, { this: Container });
Container.prototype.removeItem = procHacker.js("?removeItem@Container@@UEAAXHH@Z", void_t, { this: Container }, int32_t, int32_t);
Container.prototype.setCustomName = procHacker.js(
    "?setCustomName@Container@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: Container },
    CxxString,
);

FillingContainer.prototype.canAdd = procHacker.jsv(
    "??_7FillingContainer@@6B@",
    "?canAdd@FillingContainer@@UEBA_NAEBVItemStack@@@Z",
    bool_t,
    { this: FillingContainer },
    ItemStack,
);

Inventory.prototype.dropSlot = procHacker.js("?dropSlot@Inventory@@QEAAXH_N00@Z", void_t, { this: Inventory }, int32_t, bool_t, bool_t, bool_t);

PlayerInventory.prototype.getSlotWithItem = procHacker.js(
    "?getSlotWithItem@PlayerInventory@@QEBAHAEBVItemStack@@_N1@Z",
    int32_t,
    { this: PlayerInventory },
    ItemStack,
    bool_t,
    bool_t,
);
PlayerInventory.prototype.addItem = procHacker.js("?add@PlayerInventory@@QEAA_NAEAVItemStack@@_N@Z", bool_t, { this: PlayerInventory }, ItemStack, bool_t);
PlayerInventory.prototype.clearSlot = procHacker.js("?clearSlot@PlayerInventory@@QEAAXHW4ContainerID@@@Z", void_t, { this: PlayerInventory }, int32_t, int32_t);
PlayerInventory.prototype.getContainerSize = procHacker.js("?getContainerSize@PlayerInventory@@QEBAHW4ContainerID@@@Z", int32_t, { this: PlayerInventory }, int32_t);
PlayerInventory.prototype.getFirstEmptySlot = procHacker.js("?getFirstEmptySlot@PlayerInventory@@QEBAHXZ", int32_t, { this: PlayerInventory });
PlayerInventory.prototype.getHotbarSize = procHacker.js("?getHotbarSize@PlayerInventory@@QEBAHXZ", int32_t, { this: PlayerInventory });
PlayerInventory.prototype.getItem = procHacker.js(
    "?getItem@PlayerInventory@@QEBAAEBVItemStack@@HW4ContainerID@@@Z",
    ItemStack,
    { this: PlayerInventory },
    int32_t,
    int32_t,
);
PlayerInventory.prototype.getSelectedItem = procHacker.js("?getSelectedItem@PlayerInventory@@QEAAAEBVItemStack@@XZ", ItemStack, { this: PlayerInventory });
PlayerInventory.prototype.selectSlot = procHacker.js("?selectSlot@PlayerInventory@@QEAA_NHW4ContainerID@@@Z", void_t, { this: PlayerInventory }, int32_t, int32_t);
PlayerInventory.prototype.setItem = procHacker.js(
    "?setItem@PlayerInventory@@QEAAXHAEBVItemStack@@W4ContainerID@@_N@Z",
    void_t,
    { this: PlayerInventory },
    int32_t,
    ItemStack,
    int32_t,
    bool_t,
);
PlayerInventory.prototype.setSelectedItem = procHacker.js("?setSelectedItem@PlayerInventory@@QEAAXAEBVItemStack@@@Z", void_t, { this: PlayerInventory }, ItemStack);
PlayerInventory.prototype.swapSlots = procHacker.js("?swapSlots@PlayerInventory@@QEAAXHH@Z", void_t, { this: PlayerInventory }, int32_t, int32_t);
const FillingContainer$removeResource = procHacker.js(
    "?removeResource@FillingContainer@@QEAAHAEBVItemStack@@_N1H@Z",
    int32_t,
    null,
    FillingContainer,
    ItemStack,
    bool_t,
    bool_t,
    int32_t,
);
PlayerInventory.prototype.removeResource = function (item: ItemStack, requireExactAux: boolean = true, requireExactData: boolean = false, maxCount?: int32_t) {
    const container = this.container;
    maxCount ??= container.getItemCount(item);
    return FillingContainer$removeResource(container, item, requireExactAux, requireExactData, maxCount);
};
PlayerInventory.prototype.canAdd = procHacker.js("?canAdd@PlayerInventory@@QEBA_NAEBVItemStack@@@Z", bool_t, { this: PlayerInventory }, ItemStack);

ItemDescriptor.prototype[NativeType.ctor] = procHacker.js("??0ItemDescriptor@@QEAA@XZ", void_t, { this: ItemDescriptor });
ItemDescriptor.prototype[NativeType.dtor] = procHacker.js("??1ItemDescriptor@@UEAA@XZ", void_t, { this: ItemDescriptor });
ItemDescriptor.prototype[NativeType.ctor_copy] = procHacker.js("??0ItemDescriptor@@QEAA@AEBV0@@Z", void_t, { this: ItemDescriptor }, ItemDescriptor);
NetworkItemStackDescriptor.prototype[NativeType.dtor] = procHacker.js("??1NetworkItemStackDescriptor@@UEAA@XZ", void_t, { this: NetworkItemStackDescriptor });
NetworkItemStackDescriptor.prototype[NativeType.ctor_copy] = procHacker.js(
    "??0NetworkItemStackDescriptor@@QEAA@AEBVItemStackDescriptor@@@Z",
    void_t,
    { this: NetworkItemStackDescriptor },
    NetworkItemStackDescriptor,
);

InventoryTransaction.prototype.addItemToContent = procHacker.js(
    "?addItemToContent@InventoryTransaction@@AEAAXAEBVItemStack@@H@Z",
    void_t,
    { this: InventoryTransaction },
    ItemStack,
    int32_t,
);
(InventoryTransaction.prototype as any)._getActions = procHacker.js(
    "?getActions@InventoryTransaction@@QEBAAEBV?$vector@VInventoryAction@@V?$allocator@VInventoryAction@@@std@@@std@@AEBVInventorySource@@@Z",
    CxxVector.make(InventoryAction),
    { this: InventoryTransaction },
    InventorySource,
);
InventoryTransactionItemGroup.prototype.getItemStack = procHacker.js("?getItemInstance@InventoryTransactionItemGroup@@QEBA?AVItemStack@@XZ", ItemStack, {
    this: InventoryTransaction,
    structureReturn: true,
});

// block.ts
namespace BlockTypeRegistry {
    export const lookupByName = procHacker.js(
        "?lookupByName@BlockTypeRegistry@@SA?AV?$WeakPtr@VBlockLegacy@@@@AEBVHashedString@@_N@Z",
        WeakPtr.make(BlockLegacy),
        { structureReturn: true },
        HashedString,
        bool_t,
    );
}

BlockLegacy.prototype.getCommandNames = procHacker.js(
    "?getCommandNames@BlockLegacy@@QEBA?AV?$vector@UCommandName@@V?$allocator@UCommandName@@@std@@@std@@XZ",
    CxxVector$CxxStringWith8Bytes,
    { this: BlockLegacy, structureReturn: true },
);
BlockLegacy.prototype.getCommandNames2 = procHacker.js(
    "?getCommandNames@BlockLegacy@@QEBA?AV?$vector@UCommandName@@V?$allocator@UCommandName@@@std@@@std@@XZ",
    CxxVector$CommandName,
    { this: BlockLegacy, structureReturn: true },
);
BlockLegacy.prototype.getCreativeCategory = procHacker.js("?getCreativeCategory@BlockLegacy@@QEBA?AW4CreativeItemCategory@@XZ", int32_t, { this: BlockLegacy });
BlockLegacy.prototype.setDestroyTime = procHacker.js("?setDestroyTime@BlockLegacy@@QEAAAEAV1@M@Z", void_t, { this: BlockLegacy }, float32_t);
BlockLegacy.prototype.getBlockEntityType = procHacker.js("?getBlockEntityType@BlockLegacy@@QEBA?AW4BlockActorType@@XZ", int32_t, { this: BlockLegacy });
BlockLegacy.prototype.getBlockItemId = procHacker.js("?getBlockItemId@BlockLegacy@@QEBAFXZ", int16_t, { this: BlockLegacy });
BlockLegacy.prototype.getStateFromLegacyData = procHacker.js(
    "?getStateFromLegacyData@BlockLegacy@@QEBAAEBVBlock@@G@Z",
    Block.ref(),
    { this: BlockLegacy },
    uint16_t,
);

BlockLegacy.prototype.getRenderBlock = procHacker.js("?getRenderBlock@BlockLegacy@@UEBAAEBVBlock@@XZ", Block, { this: BlockLegacy });
BlockLegacy.prototype.getDefaultState = procHacker.js("?getDefaultState@BlockLegacy@@QEBAAEBVBlock@@XZ", Block, { this: BlockLegacy });
BlockLegacy.prototype.tryGetStateFromLegacyData = procHacker.js(
    "?tryGetStateFromLegacyData@BlockLegacy@@QEBAPEBVBlock@@G@Z",
    Block,
    { this: BlockLegacy },
    uint16_t,
);
BlockLegacy.prototype.use = procHacker.jsv(
    "??_7JukeboxBlock@@6B@",
    "?use@JukeboxBlock@@UEBA_NAEAVPlayer@@AEBVBlockPos@@E@Z",
    bool_t,
    { this: BlockLegacy },
    Player,
    BlockPos,
    uint8_t,
);
BlockLegacy.prototype.getSilkTouchedItemInstance = procHacker.jsv(
    "??_7BlockLegacy@@6B@",
    "?getSilkTouchItemInstance@BlockLegacy@@MEBA?AVItemInstance@@AEBVBlock@@@Z",
    ItemStack,
    { this: BlockLegacy, structureReturn: true },
    Block,
);

(Block.prototype as any)._getName = procHacker.js("?getName@Block@@QEBAAEBVHashedString@@XZ", HashedString, { this: Block });
Block.create = function (blockName: string, data: number = 0): Block | null {
    data |= 0;
    if (data < 0 || data > 0x7fff) data = 0;
    const blockNameHashed = HashedString.constructWith(blockName);
    const legacyptr = BlockTypeRegistry.lookupByName(blockNameHashed, false);
    blockNameHashed.destruct();

    const legacy = legacyptr.value();
    legacyptr.dispose(); // it does not delete `legacy` because it's WeakPtr
    if (legacy !== null) {
        if (legacy.getBlockItemId() < 0x100) {
            if (data === 0x7fff) {
                return legacy.getDefaultState();
            } else {
                return legacy.tryGetStateFromLegacyData(data);
            }
        } else {
            return legacy.tryGetStateFromLegacyData(data);
        }
    }
    return null;
};
Block.prototype.getDescriptionId = procHacker.js("?getDescriptionId@Block@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: Block,
    structureReturn: true,
});
Block.prototype.getRuntimeId = procHacker.js("?getRuntimeId@Block@@QEBAAEBIXZ", int32_t.ref(), { this: Block });
Block.prototype.getBlockEntityType = procHacker.js("?getBlockEntityType@Block@@QEBA?AW4BlockActorType@@XZ", int32_t, { this: Block });
Block.prototype.hasBlockEntity = procHacker.js("?hasBlockEntity@Block@@QEBA_NXZ", bool_t, { this: Block });
Block.prototype.use = procHacker.js("?use@Block@@QEBA_NAEAVPlayer@@AEBVBlockPos@@EV?$optional@VVec3@@@std@@@Z", bool_t, { this: Block }, Player, BlockPos, uint8_t);
Block.prototype.getVariant = procHacker.js("?getVariant@Block@@QEBAHXZ", int32_t, { this: Block });
Block.prototype.getSerializationId = procHacker.js("?getSerializationId@Block@@QEBAAEBVCompoundTag@@XZ", CompoundTag.ref(), { this: Block });
Block.prototype.getSilkTouchItemInstance = function () {
    return this.blockLegacy.getSilkTouchedItemInstance(this);
};
Block.prototype.isUnbreakable = procHacker.js("?isUnbreakable@Block@@QEBA_NXZ", bool_t, { this: Block });
Block.prototype.buildDescriptionId = procHacker.js("?buildDescriptionId@Block@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: Block,
    structureReturn: true,
});
Block.prototype.isCropBlock = procHacker.js("?isCropBlock@Block@@QEBA_NXZ", bool_t, { this: Block });
Block.prototype.popResource = procHacker.js(
    "?popResource@Block@@QEBAPEAVItemActor@@AEAVBlockSource@@AEBVBlockPos@@AEBVItemInstance@@@Z",
    ItemActor,
    { this: Block },
    BlockSource,
    BlockPos,
    ItemStack,
);
Block.prototype.canHurtAndBreakItem = procHacker.js("?canHurtAndBreakItem@Block@@QEBA_NXZ", bool_t, { this: Block });
Block.prototype.getThickness = procHacker.js("?getThickness@Block@@QEBAMXZ", float32_t, { this: Block });
Block.prototype.hasComparatorSignal = procHacker.js("?hasComparatorSignal@Block@@QEBA_NXZ", bool_t, { this: Block });
Block.prototype.getTranslucency = procHacker.js("?getTranslucency@Block@@QEBAMXZ", float32_t, { this: Block });
const Block$getExplosionResistance = procHacker.js("?getExplosionResistance@Block@@QEBAMXZ", float32_t, null, Block);
Block.prototype.getExplosionResistance = function (actor: Actor | null = null): number {
    return Block$getExplosionResistance(this);
};
Block.prototype.getComparatorSignal = procHacker.js(
    "?getComparatorSignal@Block@@QEBAHAEAVBlockSource@@AEBVBlockPos@@E@Z",
    int32_t,
    { this: Block },
    BlockSource,
    BlockPos,
    uint8_t,
);
Block.prototype.getDirectSignal = procHacker.js(
    "?getDirectSignal@Block@@QEBAHAEAVBlockSource@@AEBVBlockPos@@H@Z",
    int32_t,
    { this: Block },
    BlockSource,
    BlockPos,
    int32_t,
);
Block.prototype.isSignalSource = procHacker.js("?isSignalSource@Block@@QEBA_NXZ", bool_t, { this: Block });
Block.prototype.getDestroySpeed = procHacker.js("?getDestroySpeed@Block@@QEBAMXZ", float32_t, { this: Block });

// BDS calls BlockSource::setBlock (this, exactly same overload) when player moves to TheEnd Dimension, to secure the obsidian platform.
(BlockSource.prototype as any)._setBlock = procHacker.js(
    "?setBlock@BlockSource@@QEAA_NHHHAEBVBlock@@HPEAVActor@@@Z",
    bool_t,
    { this: BlockSource },
    int32_t,
    int32_t,
    int32_t,
    Block,
    int32_t,
    Actor,
);
BlockSource.prototype.setBlock = function (blockPos: BlockPos, block: Block): boolean {
    if (block == null) throw Error("Block is null");
    return (this as any)._setBlock(blockPos.x, blockPos.y, blockPos.z, block, 3, null);
};

BlockSource.prototype.getBlock = procHacker.js("?getBlock@BlockSource@@UEBAAEBVBlock@@AEBVBlockPos@@@Z", Block, { this: BlockSource }, BlockPos);
BlockSource.prototype.getBlockEntity = procHacker.js(
    "?getBlockEntity@BlockSource@@QEAAPEAVBlockActor@@AEBVBlockPos@@@Z",
    BlockActor,
    { this: BlockSource },
    BlockPos,
);
BlockSource.prototype.removeBlockEntity = procHacker.js(
    "?removeBlockEntity@BlockSource@@QEAA?AV?$shared_ptr@VBlockActor@@@std@@AEBVBlockPos@@@Z",
    void_t,
    { this: BlockSource },
    BlockPos,
);
BlockSource.prototype.getDimension = procHacker.js("?getDimension@BlockSource@@UEAAAEAVDimension@@XZ", Dimension, { this: BlockSource });
BlockSource.prototype.getDimensionId = procHacker.js("?getDimensionId@BlockSource@@UEBA?AV?$AutomaticID@VDimension@@H@@XZ", int32_t, {
    this: BlockSource,
    structureReturn: true,
});
BlockSource.prototype.getBrightness = procHacker.jsv(
    "??_7BlockSource@@6B@",
    "?getBrightness@BlockSource@@UEBAMAEBVBlockPos@@@Z",
    float32_t,
    { this: BlockSource },
    BlockPos,
);

const ChestBlockActor$vftable = proc["??_7ChestBlockActor@@6BRandomizableBlockActorContainerBase@@@"];
BlockActor.setResolver(ptr => {
    if (ptr === null) return null;
    const vftable = ptr.getPointer();
    if (vftable.equalsptr(ChestBlockActor$vftable)) {
        return ptr.as(ChestBlockActor);
    }
    return ptr.as(BlockActor);
});

const BlockActor$load = procHacker.jsv(
    "??_7BlockActor@@6B@",
    "?load@BlockActor@@UEAAXAEAVLevel@@AEBVCompoundTag@@AEAVDataLoadHelper@@@Z",
    void_t,
    { this: BlockActor },
    Level,
    CompoundTag,
    DefaultDataLoaderHelper,
);
const BlockActor$save = procHacker.jsv("??_7BlockActor@@6B@", "?save@BlockActor@@UEBA_NAEAVCompoundTag@@@Z", bool_t, { this: BlockActor }, CompoundTag);

BlockActor.prototype.save = function (tag?: CompoundTag): any {
    if (tag != null) {
        return BlockActor$save.call(this, tag);
    }
    tag = CompoundTag.allocate();
    if (!BlockActor$save.call(this, tag)) return null;
    const res = tag.value();
    tag.dispose();
    return res;
};
BlockActor.prototype.load = function (tag) {
    const level = bedrockServer.level;
    if (tag instanceof Tag) {
        BlockActor$load.call(this, level, tag, DefaultDataLoaderHelper.create());
    } else {
        const allocated = NBT.allocate(tag);
        BlockActor$load.call(this, level, allocated as CompoundTag, DefaultDataLoaderHelper.create());
        allocated.dispose();
    }
};
BlockActor.prototype.setChanged = procHacker.js("?setChanged@BlockActor@@QEAAXXZ", void_t, { this: BlockActor });
BlockActor.prototype.setCustomName = procHacker.js(
    "?setCustomName@BlockActor@@UEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    void_t,
    { this: BlockActor },
    CxxString,
);
BlockActor.prototype.getContainer = procHacker.jsv(
    "??_7ChestBlockActor@@6BRandomizableBlockActorContainerBase@@@",
    "?getContainer@ChestBlockActor@@UEBAPEBVContainer@@XZ",
    Container,
    { this: BlockActor },
);
BlockActor.prototype.getType = procHacker.js("?getType@BlockActor@@QEBAAEBW4BlockActorType@@XZ", int32_t.ref(), { this: BlockActor });
BlockActor.prototype.getPosition = procHacker.js("?getPosition@BlockActor@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: BlockActor });
BlockActor.prototype.getServerUpdatePacket = procHacker.js(
    "?getServerUpdatePacket@BlockActor@@QEAA?AV?$unique_ptr@VBlockActorDataPacket@@U?$default_delete@VBlockActorDataPacket@@@std@@@std@@AEAVBlockSource@@@Z",
    BlockActorDataPacket.ref(),
    { this: BlockActor, structureReturn: true },
    BlockSource,
);
BlockActor.prototype.updateClientSide = function (player: ServerPlayer): void {
    const pk = BlockActorDataPacket.allocate();
    const nbtData = this.allocateAndSave();
    pk.pos.set(this.getPosition());
    pk.data.destruct();
    pk.data[NativeType.ctor_move](nbtData);
    player.sendNetworkPacket(pk);
    nbtData.dispose();
    pk.dispose();
};
BlockActor.prototype.getCustomName = procHacker.js("?getCustomName@BlockActor@@UEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: BlockActor,
});

ChestBlockActor.prototype.isLargeChest = procHacker.js("?isLargeChest@ChestBlockActor@@QEBA_NXZ", bool_t, { this: ChestBlockActor });
ChestBlockActor.prototype.openBy = procHacker.js("?openBy@ChestBlockActor@@QEAAXAEAVPlayer@@@Z", void_t, { this: ChestBlockActor }, Player);
ChestBlockActor.prototype.getPairedChestPosition = procHacker.js("?getPairedChestPosition@ChestBlockActor@@QEAAAEBVBlockPos@@XZ", BlockPos, {
    this: ChestBlockActor,
});

PistonBlockActor.prototype.getPosition = procHacker.js("?getPosition@BlockActor@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: PistonBlockActor });
PistonBlockActor.prototype.getAttachedBlocks = procHacker.js(
    "?getAttachedBlocks@PistonBlockActor@@QEBAAEBV?$vector@VBlockPos@@V?$allocator@VBlockPos@@@std@@@std@@XZ",
    CxxVectorToArray.make(BlockPos),
    { this: PistonBlockActor },
);
PistonBlockActor.prototype.getFacingDir = procHacker.js(
    "?getFacingDir@PistonBlockActor@@QEBAAEBVBlockPos@@AEBVIConstBlockSource@@@Z",
    BlockPos,
    { this: PistonBlockActor },
    BlockSource,
);

BlockSource.prototype.getChunk = procHacker.js("?getChunk@BlockSource@@QEBAPEAVLevelChunk@@AEBVChunkPos@@@Z", LevelChunk, { this: BlockSource }, ChunkPos);
BlockSource.prototype.getChunkAt = procHacker.js("?getChunkAt@BlockSource@@UEBAPEAVLevelChunk@@AEBVBlockPos@@@Z", LevelChunk, { this: BlockSource }, BlockPos);
BlockSource.prototype.getChunkSource = procHacker.js("?getChunkSource@BlockSource@@UEAAAEAVChunkSource@@XZ", ChunkSource, { this: BlockSource });
BlockSource.prototype.checkBlockDestroyPermission = procHacker.js(
    "?checkBlockDestroyPermissions@BlockSource@@QEAA_NAEAVActor@@AEBVBlockPos@@AEBVItemStackBase@@_N@Z",
    bool_t,
    { this: BlockSource },
    Actor,
    BlockPos,
    ItemStackBase,
    bool_t,
);

BlockUtils.isDownwardFlowingLiquid = procHacker.js("?isDownwardFlowingLiquid@BlockUtils@@SA_NAEBVBlock@@@Z", bool_t, null, Block);
BlockUtils.isBeehiveBlock = procHacker.js("?isBeehiveBlock@BlockUtils@@SA_NAEBVBlockLegacy@@@Z", bool_t, null, BlockLegacy);
BlockUtils.isWaterSource = procHacker.js("?isWaterSource@BlockUtils@@SA_NAEBVBlock@@@Z", bool_t, null, Block);
BlockUtils.isFullFlowingLiquid = procHacker.js("?isFullFlowingLiquid@BlockUtils@@SA_NAEBVBlock@@@Z", bool_t, null, Block);
BlockUtils.allowsNetherVegetation = procHacker.js("?allowsNetherVegetation@BlockUtils@@SA_NAEBVBlockLegacy@@@Z", bool_t, null, BlockLegacy);
BlockUtils.isThinFenceOrWallBlock = procHacker.js("?isThinFenceOrWallBlock@BlockUtils@@SA_NAEBVBlock@@@Z", bool_t, null, Block);
BlockUtils.isLiquidSource = procHacker.js("?isLiquidSource@BlockUtils@@SA_NAEBVBlock@@@Z", bool_t, null, Block);
BlockUtils.getLiquidBlockHeight = procHacker.js("?getLiquidBlockHeight@BlockUtils@@SAMAEBVBlock@@AEBVBlockPos@@@Z", float32_t, null, Block, BlockPos);
BlockUtils.canGrowTreeWithBeehive = procHacker.js("?canGrowTreeWithBeehive@BlockUtils@@SA_NAEBVBlock@@@Z", bool_t, null, Block);

// abilties.ts
const Abilities$setAbilityBool = procHacker.js("?setAbility@Abilities@@QEAAXW4AbilitiesIndex@@_N@Z", void_t, { this: Abilities }, uint16_t, bool_t);
Abilities.prototype.setAbility = function (abilityIndex: AbilitiesIndex, value: boolean | number) {
    switch (typeof value) {
        case "boolean":
            Abilities$setAbilityBool.call(abilityIndex, value);
            break;
        case "number":
            this.getAbility(abilityIndex).setFloat(value);
            break;
    }
};
Abilities.prototype.getBool = procHacker.js("?getBool@Abilities@@QEBA_NW4AbilitiesIndex@@@Z", bool_t, { this: Abilities }, uint16_t);
Abilities.prototype.getFloat = procHacker.js("?getFloat@Abilities@@QEBAMW4AbilitiesIndex@@@Z", float32_t, { this: Abilities }, uint16_t);
Abilities.prototype.isFlying = function () {
    return this.getBool(AbilitiesIndex.Flying);
};

LayeredAbilities.prototype.getLayer = procHacker.js(
    "?getLayer@LayeredAbilities@@QEAAAEAVAbilities@@W4AbilitiesLayer@@@Z",
    Abilities,
    { this: LayeredAbilities },
    uint16_t,
);
LayeredAbilities.prototype.getCommandPermissions = procHacker.js("?getCommandPermissions@LayeredAbilities@@QEBA?AW4CommandPermissionLevel@@XZ", int32_t, {
    this: LayeredAbilities,
});
LayeredAbilities.prototype.getPlayerPermissions = procHacker.js("?getPlayerPermissions@LayeredAbilities@@QEBA?AW4PlayerPermissionLevel@@XZ", int32_t, {
    this: LayeredAbilities,
});
LayeredAbilities.prototype.setCommandPermissions = procHacker.js(
    "?setCommandPermissions@LayeredAbilities@@QEAAXW4CommandPermissionLevel@@@Z",
    void_t,
    { this: LayeredAbilities },
    int32_t,
);
LayeredAbilities.prototype.setPlayerPermissions = procHacker.js(
    "?setPlayerPermissions@LayeredAbilities@@QEAAXW4PlayerPermissionLevel@@@Z",
    void_t,
    { this: LayeredAbilities },
    int32_t,
);

LayeredAbilities.prototype.getCommandPermissionLevel = LayeredAbilities.prototype.getCommandPermissions;
LayeredAbilities.prototype.getPlayerPermissionLevel = LayeredAbilities.prototype.getPlayerPermissions;
LayeredAbilities.prototype.setCommandPermissionLevel = LayeredAbilities.prototype.setCommandPermissions;
LayeredAbilities.prototype.setPlayerPermissionLevel = LayeredAbilities.prototype.setPlayerPermissions;

const LayeredAbilities$getAbility = procHacker.js(
    "?getAbility@LayeredAbilities@@QEAAAEAVAbility@@W4AbilitiesLayer@@W4AbilitiesIndex@@@Z",
    Ability,
    { this: LayeredAbilities },
    uint16_t,
    uint16_t,
);
const LayeredAbilities$getAbilityOnlyIndex = procHacker.js(
    "?getAbility@LayeredAbilities@@QEBAAEBVAbility@@W4AbilitiesIndex@@@Z",
    Ability,
    { this: LayeredAbilities },
    uint16_t,
);
LayeredAbilities.prototype.getAbility = function (abilityLayer: AbilitiesLayer | AbilitiesIndex, abilityIndex?: AbilitiesIndex) {
    if (abilityIndex == null) {
        return LayeredAbilities$getAbilityOnlyIndex.call(this, abilityLayer);
    } else {
        return LayeredAbilities$getAbility.call(this, abilityLayer, abilityIndex);
    }
};
const LayeredAbilities$setAbilityFloat = procHacker.js(
    "?setAbility@LayeredAbilities@@QEAAXW4AbilitiesIndex@@M@Z",
    void_t,
    { this: LayeredAbilities },
    uint16_t,
    float32_t,
);
const LayeredAbilities$setAbilityBool = procHacker.js(
    "?setAbility@LayeredAbilities@@QEAAXW4AbilitiesIndex@@_N@Z",
    void_t,
    { this: LayeredAbilities },
    uint16_t,
    bool_t,
);
LayeredAbilities.prototype.setAbility = function (abilityIndex: AbilitiesIndex, value: boolean | number) {
    switch (typeof value) {
        case "boolean":
            LayeredAbilities$setAbilityBool.call(this, abilityIndex, value);
            break;
        case "number":
            LayeredAbilities$setAbilityFloat.call(this, abilityIndex, value);
            break;
    }
};

LayeredAbilities.prototype.getBool = procHacker.js("?getBool@LayeredAbilities@@QEBA_NW4AbilitiesIndex@@@Z", bool_t, { this: LayeredAbilities }, uint16_t);
(LayeredAbilities as any).prototype._getFloatWithLayer = procHacker.js(
    "?getFloatWithLayer@LayeredAbilities@@QEBA?AU?$pair@MW4AbilitiesLayer@@@std@@W4AbilitiesIndex@@@Z",
    CxxPair.make(float32_t, int32_t),
    { this: LayeredAbilities },
    uint16_t,
);
LayeredAbilities.prototype.isFlying = function () {
    return this.getBool(AbilitiesIndex.Flying);
};

const Abilities$getAbilityName = procHacker.js("?getAbilityName@Abilities@@SAPEBDW4AbilitiesIndex@@@Z", StaticPointer, null, uint16_t);
Abilities.getAbilityName = function (abilityIndex: uint16_t): string {
    const name = Abilities$getAbilityName(abilityIndex);
    return name.getString();
};
const Abilities$nameToAbilityIndex = procHacker.js(
    "?nameToAbilityIndex@Abilities@@SA?AW4AbilitiesIndex@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    int16_t,
    null,
    CxxString,
); // Will return -1 if not found, so int16 instead of uint16
Abilities.nameToAbilityIndex = function (name: string): int16_t {
    return Abilities$nameToAbilityIndex(name.toLowerCase());
};

Ability.define({
    type: uint8_t,
    value: Ability.Value,
    options: uint8_t,
});
Ability.prototype.getBool = procHacker.js("?getBool@Ability@@QEBA_NXZ", bool_t, { this: Ability });
Ability.prototype.getFloat = procHacker.js("?getFloat@Ability@@QEBAMXZ", float32_t, { this: Ability });
Ability.prototype.setBool = procHacker.js("?setBool@Ability@@QEAAX_N@Z", void_t, { this: Ability }, bool_t);

// gamerules.ts
const GameRules$getRule = procHacker.js("?getRule@GameRules@@QEBAPEBVGameRule@@UGameRuleId@@@Z", GameRule.ref(), { this: GameRules }, WrappedInt32);
GameRules.prototype.getRule = function (id: GameRuleId): GameRule {
    return GameRules$getRule.call(this, WrappedInt32.create(id));
};
const GameRules$hasRule = procHacker.js("?hasRule@GameRules@@QEBA_NUGameRuleId@@@Z", bool_t, { this: GameRules }, WrappedInt32);
GameRules.prototype.hasRule = function (id: GameRuleId): bool_t {
    return GameRules$hasRule.call(this, WrappedInt32.create(id));
};

GameRules.prototype.nameToGameRuleIndex = procHacker.js(
    "?nameToGameRuleIndex@GameRules@@QEBA?AUGameRuleId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    int32_t,
    { this: GameRules, structureReturn: true },
    CxxString,
); // Will return -1 if not found, so int32 instead of uint32

GameRules.nameToGameRuleIndex = function (name: string): int32_t {
    return bedrockServer.gameRules.nameToGameRuleIndex(name);
};

GameRule.abstract({
    shouldSave: bool_t,
    type: uint8_t,
    value: [GameRule.Value, 0x04],
});
GameRule.prototype.getBool = procHacker.js("?getBool@GameRule@@QEBA_NXZ", bool_t, { this: GameRule });
GameRule.prototype.getInt = procHacker.js("?getInt@GameRule@@QEBAHXZ", int32_t, { this: GameRule });
GameRule.prototype.getFloat = procHacker.js("?getFloat@GameRule@@QEBAMXZ", float32_t, { this: GameRule });

// scoreboard.ts
Scoreboard.prototype.clearDisplayObjective = procHacker.js(
    "?clearDisplayObjective@ServerScoreboard@@UEAAPEAVObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    Objective,
    { this: Scoreboard },
    CxxString,
);
Scoreboard.prototype.setDisplayObjective = procHacker.js(
    "?setDisplayObjective@ServerScoreboard@@UEAAPEBVDisplayObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBVObjective@@W4ObjectiveSortOrder@@@Z",
    DisplayObjective,
    { this: Scoreboard },
    CxxString,
    Objective,
    uint8_t,
);
Scoreboard.prototype.addObjective = procHacker.js(
    "?addObjective@Scoreboard@@QEAAPEAVObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@0AEBVObjectiveCriteria@@@Z",
    Objective,
    { this: Scoreboard },
    CxxString,
    CxxString,
    ObjectiveCriteria,
);
Scoreboard.prototype.createScoreboardId = procHacker.js(
    "?createScoreboardId@ServerScoreboard@@UEAAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    ScoreboardId,
    { this: Scoreboard },
    CxxString,
);
Scoreboard.prototype.getCriteria = procHacker.js(
    "?getCriteria@Scoreboard@@QEBAPEAVObjectiveCriteria@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    ObjectiveCriteria,
    { this: Scoreboard },
    CxxString,
);
Scoreboard.prototype.getDisplayObjective = procHacker.js(
    "?getDisplayObjective@Scoreboard@@QEBAPEBVDisplayObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    DisplayObjective,
    { this: Scoreboard },
    CxxString,
);
Scoreboard.prototype.getObjective = procHacker.js(
    "?getObjective@Scoreboard@@QEBAPEAVObjective@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    Objective,
    { this: Scoreboard },
    CxxString,
);
const Scoreboard$getObjectiveNames = procHacker.js(
    "?getObjectiveNames@Scoreboard@@QEBA?AV?$vector@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$allocator@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@2@@std@@XZ",
    CxxVector$string,
    { this: Scoreboard, structureReturn: true },
);
Scoreboard.prototype.getObjectiveNames = function () {
    const names: CxxVector<CxxString> = Scoreboard$getObjectiveNames.call(this);
    const res = names.toArray();
    names.destruct();
    return res;
};
const Scoreboard$getObjectives = procHacker.js(
    "?getObjectives@Scoreboard@@QEBA?AV?$vector@PEBVObjective@@V?$allocator@PEBVObjective@@@std@@@std@@XZ",
    CxxVector.make(Objective.ref()),
    { this: Scoreboard, structureReturn: true },
);
Scoreboard.prototype.getObjectives = function () {
    const objectives: CxxVector<Objective> = Scoreboard$getObjectives.call(this);
    const res = objectives.toArray();
    objectives.destruct();
    return res;
};
Scoreboard.prototype.getActorScoreboardId = procHacker.js(
    "?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVActor@@@Z",
    ScoreboardId,
    { this: Scoreboard },
    Actor,
);
Scoreboard.prototype.getFakePlayerScoreboardId = procHacker.js(
    "?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    ScoreboardId,
    { this: Scoreboard },
    CxxString,
);
Scoreboard.prototype.getPlayerScoreboardId = procHacker.js(
    "?getScoreboardId@Scoreboard@@QEBAAEBUScoreboardId@@AEBVPlayer@@@Z",
    ScoreboardId,
    { this: Scoreboard },
    Player,
);
Scoreboard.prototype.getScoreboardIdentityRef = procHacker.js(
    "?getScoreboardIdentityRef@Scoreboard@@QEAAPEAVScoreboardIdentityRef@@AEBUScoreboardId@@@Z",
    ScoreboardIdentityRef.ref(),
    { this: Scoreboard },
    ScoreboardId,
);
(Scoreboard.prototype as any)._getScoreboardIdentityRefs = procHacker.js(
    "?getScoreboardIdentityRefs@Scoreboard@@QEBA?AV?$vector@VScoreboardIdentityRef@@V?$allocator@VScoreboardIdentityRef@@@std@@@std@@XZ",
    CxxVector$ScoreboardIdentityRef,
    { this: Scoreboard },
    CxxVector$ScoreboardIdentityRef,
);
(Scoreboard.prototype as any)._getTrackedIds = procHacker.js(
    "?getTrackedIds@Scoreboard@@QEBA?AV?$vector@UScoreboardId@@V?$allocator@UScoreboardId@@@std@@@std@@XZ",
    CxxVector$ScoreboardId,
    { this: Scoreboard },
    CxxVector$ScoreboardId,
);
Scoreboard.prototype.removeObjective = procHacker.js("?removeObjective@Scoreboard@@QEAA_NPEAVObjective@@@Z", bool_t, { this: Scoreboard }, Objective);
Scoreboard.prototype.resetPlayerScore = procHacker.js(
    "?resetPlayerScore@Scoreboard@@QEAA_NAEBUScoreboardId@@AEAVObjective@@@Z",
    bool_t,
    { this: Scoreboard },
    ScoreboardId,
    Objective,
);
Scoreboard.prototype.sync = procHacker.js(
    "?onScoreChanged@ServerScoreboard@@UEAAXAEBUScoreboardId@@AEBVObjective@@@Z",
    void_t,
    { this: Scoreboard },
    ScoreboardId,
    Objective,
);

const Objective$getPlayers = procHacker.js(
    "?getPlayers@Objective@@QEBA?AV?$vector@UScoreboardId@@V?$allocator@UScoreboardId@@@std@@@std@@XZ",
    CxxVector$ScoreboardId,
    { this: Objective, structureReturn: true },
);
Objective.prototype.getPlayers = function () {
    const ids: CxxVector<ScoreboardId> = Objective$getPlayers.call(this);
    const res = ids.toArray();
    ids.destruct();
    return res;
};
Objective.prototype.getPlayerScore = procHacker.js(
    "?getPlayerScore@Objective@@QEBA?AUScoreInfo@@AEBUScoreboardId@@@Z",
    ScoreInfo,
    { this: Objective, structureReturn: true },
    ScoreboardId,
);
Objective.prototype.getName = procHacker.js("?getName@Objective@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: Objective,
});
Objective.prototype.getDisplayName = procHacker.js("?getDisplayName@Objective@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ", CxxString, {
    this: Objective,
});

IdentityDefinition.prototype.isPlayerType = procHacker.js("?getScoreboardId@ScoreboardIdentityRef@@QEBAAEBUScoreboardId@@XZ", bool_t, {
    this: IdentityDefinition,
});
IdentityDefinition.prototype.getEntityId = procHacker.js("?getEntityId@IdentityDefinition@@QEBAAEBUActorUniqueID@@XZ", ActorUniqueID.ref(), {
    this: IdentityDefinition,
});
IdentityDefinition.prototype.getPlayerId = procHacker.js("?getPlayerId@IdentityDefinition@@QEBAAEBUPlayerScoreboardId@@XZ", ActorUniqueID.ref(), {
    this: IdentityDefinition,
});
IdentityDefinition.prototype.getFakePlayerName = procHacker.js(
    "?getFakePlayerName@IdentityDefinition@@QEBAAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: IdentityDefinition },
);
IdentityDefinition.prototype.getIdentityType = procHacker.js("?getIdentityType@IdentityDefinition@@QEBA?AW4Type@1@XZ", uint8_t, { this: IdentityDefinition });

ScoreboardId.prototype.isValid = procHacker.js("?isValid@ScoreboardId@@QEBA_NXZ", bool_t, { this: ScoreboardId });

(ScoreboardIdentityRef.prototype as any)._modifyScoreInObjective = procHacker.js(
    "?modifyScoreInObjective@ScoreboardIdentityRef@@QEAA_NAEAHAEAVObjective@@HW4PlayerScoreSetFunction@@@Z",
    bool_t,
    { this: ScoreboardIdentityRef },
    StaticPointer,
    Objective,
    int32_t,
    uint8_t,
);
ScoreboardIdentityRef.prototype.getIdentityType = procHacker.js("?getIdentityType@ScoreboardIdentityRef@@QEBA?AW4Type@IdentityDefinition@@XZ", uint8_t, {
    this: ScoreboardIdentityRef,
});
ScoreboardIdentityRef.prototype.getEntityId = procHacker.js("?getEntityId@ScoreboardIdentityRef@@QEBAAEBUActorUniqueID@@XZ", ActorUniqueID.ref(), {
    this: ScoreboardIdentityRef,
});
ScoreboardIdentityRef.prototype.getPlayerId = procHacker.js("?getPlayerId@ScoreboardIdentityRef@@QEBAAEBUPlayerScoreboardId@@XZ", ActorUniqueID.ref(), {
    this: ScoreboardIdentityRef,
});
ScoreboardIdentityRef.prototype.getScoreboardId = procHacker.js("?getScoreboardId@ScoreboardIdentityRef@@QEBAAEBUScoreboardId@@XZ", ScoreboardId, {
    this: ScoreboardIdentityRef,
});
ScoreboardIdentityRef.prototype.isPlayerType = function () {
    let iddef = (this as any as StaticPointer).getPointerAs(IdentityDefinition, 0x10);
    if (iddef === null) iddef = IdentityDefinition.Invalid;
    return iddef.isPlayerType();
};

// effects.ts
MobEffect.create = procHacker.js("?getById@MobEffect@@SAPEAV1@I@Z", MobEffect, null, int32_t);
MobEffect.prototype.getId = procHacker.js("?getId@MobEffect@@QEBAIXZ", uint32_t, { this: MobEffect });

(MobEffectInstance.prototype as any)._create = procHacker.js(
    "??0MobEffectInstance@@QEAA@IHH_N00@Z",
    void_t,
    { this: MobEffectInstance },
    uint32_t,
    int32_t,
    int32_t,
    bool_t,
    bool_t,
    bool_t,
);
(MobEffectInstance.prototype as any)._getComponentName = procHacker.js("?getComponentName@MobEffectInstance@@QEBAAEBVHashedString@@XZ", HashedString, {
    this: MobEffectInstance,
});
MobEffectInstance.prototype.getAmplifier = procHacker.js("?getAmplifier@MobEffectInstance@@QEBAHXZ", int32_t, { this: MobEffectInstance });
MobEffectInstance.prototype.allocateAndSave = procHacker.js(
    "?save@MobEffectInstance@@QEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ",
    CompoundTag.ref(),
    { this: MobEffectInstance, structureReturn: true },
);
const MobEffectInstance$load = procHacker.js("?load@MobEffectInstance@@SA?AV1@AEBVCompoundTag@@@Z", void_t, null, MobEffectInstance, CompoundTag);
MobEffectInstance.prototype.load = function (tag) {
    if (tag instanceof Tag) {
        MobEffectInstance$load(this, tag);
    } else {
        const allocated = NBT.allocate(tag);
        MobEffectInstance$load(this, allocated as CompoundTag);
        allocated.dispose();
    }
};
MobEffectInstance.load = function (tag) {
    const inst = new MobEffectInstance(true);
    inst.load(tag);
    return inst;
};

// enchants.ts
EnchantUtils.applyEnchant = procHacker.js(
    "?applyEnchant@EnchantUtils@@SA_NAEAVItemStackBase@@W4Type@Enchant@@H_N@Z",
    bool_t,
    null,
    ItemStack,
    int16_t,
    int32_t,
    bool_t,
);
EnchantUtils.getEnchantLevel = procHacker.js("?getEnchantLevel@EnchantUtils@@SAHW4Type@Enchant@@AEBVItemStackBase@@@Z", int32_t, null, uint8_t, ItemStack);
EnchantUtils.hasCurse = procHacker.js("?hasCurse@EnchantUtils@@SA_NAEBVItemStackBase@@@Z", bool_t, null, ItemStack);
EnchantUtils.hasEnchant = procHacker.js("?hasEnchant@EnchantUtils@@SA_NW4Type@Enchant@@AEBVItemStackBase@@@Z", bool_t, null, int16_t, ItemStack);

// nbt.ts
const tagTypes: NativeClassType<Tag>[] = [
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
Tag.setResolver(ptr => {
    if (ptr === null) return null;
    const typeId = Tag.prototype.getId.call(ptr);
    const type = tagTypes[typeId];
    if (type == null) {
        throw Error(`Invalid Tag.getId(): ${typeId}`);
    }
    return ptr.as(type);
});

Tag.prototype.toString = procHacker.jsv(
    "??_7CompoundTag@@6B@",
    "?toString@CompoundTag@@UEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
    CxxString,
    { this: Tag, structureReturn: true },
);
Tag.prototype.getId = procHacker.jsv("??_7CompoundTag@@6B@", "?getId@CompoundTag@@UEBA?AW4Type@Tag@@XZ", uint8_t, { this: Tag });
Tag.prototype.equals = procHacker.jsv("??_7CompoundTag@@6B@", "?equals@CompoundTag@@UEBA_NAEBVTag@@@Z", bool_t, { this: Tag }, Tag);

const EndTag$vftable = proc["??_7EndTag@@6B@"];
const ByteTag$vftable = proc["??_7ByteTag@@6B@"];
const ShortTag$vftable = proc["??_7ShortTag@@6B@"];
const IntTag$vftable = proc["??_7IntTag@@6B@"];
const Int64Tag$vftable = proc["??_7Int64Tag@@6B@"];
const FloatTag$vftable = proc["??_7FloatTag@@6B@"];
const DoubleTag$vftable = proc["??_7DoubleTag@@6B@"];
const ByteArrayTag$vftable = proc["??_7ByteArrayTag@@6B@"];
const StringTag$vftable = proc["??_7StringTag@@6B@"];

EndTag.prototype[NativeType.ctor] = function () {
    this.vftable = EndTag$vftable;
};
ByteTag.prototype[NativeType.ctor] = function () {
    this.vftable = ByteTag$vftable;
};
ShortTag.prototype[NativeType.ctor] = function () {
    this.vftable = ShortTag$vftable;
};
IntTag.prototype[NativeType.ctor] = function () {
    this.vftable = IntTag$vftable;
};
Int64Tag.prototype[NativeType.ctor] = function () {
    this.vftable = Int64Tag$vftable;
};
FloatTag.prototype[NativeType.ctor] = function () {
    this.vftable = FloatTag$vftable;
};
DoubleTag.prototype[NativeType.ctor] = function () {
    this.vftable = DoubleTag$vftable;
};
ByteArrayTag.prototype[NativeType.ctor] = function () {
    this.vftable = ByteArrayTag$vftable;
    this.data.construct();
};
ByteArrayTag.prototype.constructWith = function (data: Uint8Array): void {
    this.vftable = ByteArrayTag$vftable;
    this.data.construct();
    this.data.set(data);
};
const StringTagDataOffset = StringTag.offsetOf("data");
StringTag.prototype[NativeType.ctor] = function () {
    this.vftable = StringTag$vftable;
    CxxString[NativeType.ctor](this.add(StringTagDataOffset));
};
ListTag.prototype[NativeType.ctor] = procHacker.js("??0ListTag@@QEAA@XZ", void_t, { this: ListTag });
ListTag.prototype[NativeType.dtor] = procHacker.js("??1ListTag@@UEAA@XZ", void_t, { this: ListTag });
const ListTag$add = procHacker.js("?add@ListTag@@QEAAXV?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@std@@@Z", void_t, null, ListTag, TagPointer);
ListTag.prototype.pushAllocated = function (tag: Tag): void_t {
    ListTag$add(this, TagPointer.create(tag));
};
ListTag.prototype.size = procHacker.js("?size@ListTag@@QEBAHXZ", int64_as_float_t, { this: ListTag });

CompoundTag.prototype[NativeType.ctor] = procHacker.js("??0CompoundTag@@QEAA@XZ", void_t, { this: CompoundTag });
CompoundTag.prototype[NativeType.dtor] = procHacker.js("??1CompoundTag@@UEAA@XZ", void_t, { this: CompoundTag });
CompoundTag.prototype[NativeType.ctor_move] = procHacker.js("??0CompoundTag@@QEAA@$$QEAV0@@Z", void_t, { this: CompoundTag }, CompoundTag);
CompoundTag.prototype.get = procHacker.js(
    "?get@CompoundTag@@QEAAPEAVTag@@V?$basic_string_view@DU?$char_traits@D@std@@@std@@@Z",
    Tag,
    { this: CompoundTag },
    CxxStringView,
) as any;
const CompoundTag$put = procHacker.js(
    "?put@CompoundTag@@QEAAPEAVTag@@V?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@V?$unique_ptr@VTag@@U?$default_delete@VTag@@@std@@@4@@Z",
    void_t,
    null,
    CompoundTag,
    CxxStringWrapper,
    TagPointer,
);
CompoundTag.prototype.setAllocated = function (key, value) {
    CompoundTag$put(this, CxxStringWrapper.constructWith(key), TagPointer.create(value)); // `key` and `value` will be moved into the CompoundTag. no need to destruct them
};
CompoundTag.prototype.delete = procHacker.js(
    "?remove@CompoundTag@@QEAA_NV?$basic_string_view@DU?$char_traits@D@std@@@std@@@Z",
    bool_t,
    { this: CompoundTag },
    CxxStringView,
);
CompoundTag.prototype.has = procHacker.js(
    "?contains@CompoundTag@@QEBA_NV?$basic_string_view@DU?$char_traits@D@std@@@std@@@Z",
    bool_t,
    { this: CompoundTag },
    CxxStringView,
);
CompoundTag.prototype.clear = procHacker.js("?clear@CompoundTag@@QEAAXXZ", void_t, { this: CompoundTag });

CompoundTagVariant.prototype[NativeType.ctor] = function (): void {
    // init as a EndTag

    const ptr = this as any as StaticPointer;
    ptr.setPointer(EndTag$vftable, 0); // set the value as a EndTag
    ptr.setUint8(0, 0x28); // the type index of the std::variant<...>, 0 is the EndTag
};
CompoundTagVariant.prototype[NativeType.dtor] = procHacker.js("??1CompoundTagVariant@@QEAA@XZ", void_t, { this: CompoundTagVariant });
CompoundTagVariant.prototype.emplace = procHacker.js("?emplace@CompoundTagVariant@@QEAAAEAVTag@@$$QEAV2@@Z", void_t, { this: CompoundTagVariant }, Tag);

// structure.ts
StructureSettings.prototype[NativeType.ctor] = procHacker.js("??0StructureSettings@@QEAA@XZ", void_t, { this: StructureSettings });
StructureSettings.constructWith = function (size: BlockPos, ignoreEntities: boolean = false, ignoreBlocks: boolean = false): StructureSettings {
    const settings = StructureSettings.construct();
    settings.setStructureSize(size);
    settings.setStructureOffset(BlockPos.create(0, 0, 0));
    settings.setIgnoreEntities(ignoreEntities);
    settings.setIgnoreBlocks(ignoreBlocks);
    return settings;
};
StructureSettings.prototype[NativeType.dtor] = procHacker.js("??1StructureSettings@@QEAA@XZ", void_t, { this: StructureSettings });
// deleted
// StructureSettings.prototype.getIgnoreBlocks = procHacker.js("?getIgnoreBlocks@StructureSettings@@QEBA_NXZ", bool_t, { this: StructureSettings });
// StructureSettings.prototype.getIgnoreEntities = procHacker.js("?getIgnoreEntities@StructureSettings@@QEBA_NXZ", bool_t, { this: StructureSettings });
StructureSettings.prototype.isAnimated = procHacker.js("?isAnimated@StructureSettings@@QEBA_NXZ", bool_t, { this: StructureSettings });
// StructureSettings.prototype.getStructureOffset = procHacker.js("?getStructureOffset@StructureSettings@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: StructureSettings });
// StructureSettings.prototype.getStructureSize = procHacker.js("?getStructureSize@StructureSettings@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: StructureSettings });
// StructureSettings.prototype.getPivot = procHacker.js("?getPivot@StructureSettings@@QEBAAEBVVec3@@XZ", Vec3, { this: StructureSettings });
// StructureSettings.prototype.getAnimationMode = procHacker.js("?getAnimationMode@StructureSettings@@QEBA?AW4AnimationMode@@XZ", uint8_t, { this: StructureSettings });
// StructureSettings.prototype.getMirror = procHacker.js("?getMirror@StructureSettings@@QEBA?AW4Mirror@@XZ", uint32_t, { this: StructureSettings });
// StructureSettings.prototype.getRotation = procHacker.js("?getRotation@StructureSettings@@QEBA?AW4Rotation@@XZ", uint32_t, { this: StructureSettings });
// StructureSettings.prototype.getAnimationSeconds = procHacker.js("?getAnimationSeconds@StructureSettings@@QEBAMXZ", float32_t, { this: StructureSettings });
// StructureSettings.prototype.getIntegrityValue = procHacker.js("?getIntegrityValue@StructureSettings@@QEBAMXZ", float32_t, { this: StructureSettings });
StructureSettings.prototype.getAnimationTicks = procHacker.js("?getAnimationTicks@StructureSettings@@QEBAIXZ", uint32_t, { this: StructureSettings });
// StructureSettings.prototype.getIntegritySeed = procHacker.js("?getIntegritySeed@StructureSettings@@QEBAIXZ", float32_t, { this: StructureSettings });
// StructureSettings.prototype.setAnimationMode = procHacker.js(
//     "?setAnimationMode@StructureSettings@@QEAAXW4AnimationMode@@@Z",
//     void_t,
//     { this: StructureSettings },
//     uint8_t,
// );
// StructureSettings.prototype.setAnimationSeconds = procHacker.js("?setAnimationSeconds@StructureSettings@@QEAAXM@Z", void_t, { this: StructureSettings }, float32_t);
StructureSettings.prototype.setIgnoreBlocks = procHacker.js("?setIgnoreBlocks@StructureSettings@@QEAAX_N@Z", void_t, { this: StructureSettings }, bool_t);
StructureSettings.prototype.setIgnoreEntities = procHacker.js("?setIgnoreEntities@StructureSettings@@QEAAX_N@Z", void_t, { this: StructureSettings }, bool_t);
StructureSettings.prototype.setIgnoreJigsawBlocks = procHacker.js(
    "?setIgnoreJigsawBlocks@StructureSettings@@QEAAX_N@Z",
    void_t,
    { this: StructureSettings },
    bool_t,
);
StructureSettings.prototype.setIntegritySeed = procHacker.js("?setIntegritySeed@StructureSettings@@QEAAXI@Z", void_t, { this: StructureSettings }, float32_t);
// StructureSettings.prototype.setIntegrityValue = procHacker.js("?setIntegrityValue@StructureSettings@@QEAAXM@Z", void_t, { this: StructureSettings }, float32_t);
// StructureSettings.prototype.setMirror = procHacker.js("?setMirror@StructureSettings@@QEAAXW4Mirror@@@Z", void_t, { this: StructureSettings }, uint8_t);
// StructureSettings.prototype.setPaletteName = procHacker.js(
//     "?setPaletteName@StructureSettings@@QEAAXV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
//     void_t,
//     { this: StructureSettings },
//     CxxString,
// );
StructureSettings.prototype.setPivot = procHacker.js("?setPivot@StructureSettings@@QEAAXAEBVVec3@@@Z", void_t, { this: StructureSettings }, Vec3);
StructureSettings.prototype.setReloadActorEquipment = procHacker.js(
    "?setReloadActorEquipment@StructureSettings@@QEAAX_N@Z",
    void_t,
    { this: StructureSettings },
    bool_t,
);
StructureSettings.prototype.setRotation = procHacker.js("?setRotation@StructureSettings@@QEAAXW4Rotation@@@Z", void_t, { this: StructureSettings }, uint8_t);
StructureSettings.prototype.setStructureOffset = procHacker.js(
    "?setStructureOffset@StructureSettings@@QEAAXAEBVBlockPos@@@Z",
    void_t,
    { this: StructureSettings },
    BlockPos,
);
StructureSettings.prototype.setStructureSize = procHacker.js(
    "?setStructureSize@StructureSettings@@QEAAXAEBVBlockPos@@@Z",
    void_t,
    { this: StructureSettings },
    BlockPos,
);
StructureTemplateData.prototype.allocateAndSave = procHacker.js(
    "?save@StructureTemplateData@@QEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ",
    CompoundTag.ref(),
    { this: StructureTemplate, structureReturn: true },
);
const StructureTemplateData$load = procHacker.js("?load@StructureTemplateData@@QEAA_NAEBVCompoundTag@@@Z", bool_t, null, StructureTemplateData, CompoundTag);
StructureTemplateData.prototype.load = function (tag) {
    if (tag instanceof Tag) {
        return StructureTemplateData$load(this, tag);
    } else {
        const allocated = NBT.allocate(tag);
        const res = StructureTemplateData$load(this, allocated as CompoundTag);
        allocated.dispose();
        return res;
    }
};
StructureTemplate.prototype.fillFromWorld = procHacker.js(
    "?fillFromWorld@StructureTemplate@@QEAAXAEAVBlockSource@@AEBVBlockPos@@AEBVStructureSettings@@@Z",
    void_t,
    { this: StructureTemplate },
    BlockSource,
    BlockPos,
    StructureSettings,
);
StructureTemplate.prototype.placeInWorld = procHacker.js(
    "?placeInWorld@StructureTemplate@@QEBAXAEAVBlockSource@@AEBVBlockPalette@@AEBVBlockPos@@AEBVStructureSettings@@PEAVStructureTelemetryServerData@@_N@Z",
    void_t,
    { this: StructureTemplate },
    BlockSource,
    BlockPalette,
    BlockPos,
    StructureSettings,
);
StructureTemplate.prototype.getBlockAtPos = procHacker.js(
    "?getBlockAtPos@StructureTemplate@@QEBAAEBVBlock@@AEBVBlockPos@@@Z",
    Block,
    { this: StructureTemplate },
    BlockPos,
);
StructureTemplate.prototype.getSize = procHacker.js("?getSize@StructureTemplate@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: StructureTemplate });
StructureTemplate.prototype.allocateAndSave = procHacker.js(
    "?save@StructureTemplate@@QEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@XZ",
    CompoundTag.ref(),
    { this: StructureTemplate, structureReturn: true },
);
StructureManager.prototype.getOrCreate = procHacker.js(
    "?getOrCreate@StructureManager@@QEAAAEAVStructureTemplate@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
    StructureTemplate,
    { this: StructureManager },
    CxxString,
);
// components.ts
OnHitSubcomponent.prototype.readfromJSON = procHacker.jsv(
    "??_7FreezeOnHitSubcomponent@@6B@",
    "?readfromJSON@FreezeOnHitSubcomponent@@UEAAXAEAVValue@Json@@AEBVSemVersion@@@Z",
    void_t,
    { this: OnHitSubcomponent },
    JsonValue,
);
OnHitSubcomponent.prototype.writetoJSON = procHacker.jsv(
    "??_7FreezeOnHitSubcomponent@@6B@",
    "?writetoJSON@FreezeOnHitSubcomponent@@UEBAXAEAVValue@Json@@@Z",
    void_t,
    { this: OnHitSubcomponent },
    JsonValue,
);
(OnHitSubcomponent.prototype as any)._getName = procHacker.jsv("??_7FreezeOnHitSubcomponent@@6B@", "?getName@FreezeOnHitSubcomponent@@UEAAPEBDXZ", StaticPointer, {
    this: OnHitSubcomponent,
});

HitResult.prototype.getEntity = procHacker.js("?getEntity@HitResult@@QEBAPEAVActor@@XZ", Actor, { this: HitResult });

// chunk.ts
LevelChunk.prototype.getBiome = procHacker.js("?getBiome@LevelChunk@@QEBAAEAVBiome@@AEBVChunkBlockPos@@@Z", Biome, { this: LevelChunk });
LevelChunk.prototype.getLevel = procHacker.js("?getLevel@LevelChunk@@QEBAAEAVLevel@@XZ", Level, { this: LevelChunk });
LevelChunk.prototype.getPosition = procHacker.js("?getPosition@LevelChunk@@QEBAAEBVChunkPos@@XZ", ChunkPos, { this: LevelChunk });
LevelChunk.prototype.getMin = procHacker.js("?getMin@LevelChunk@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: LevelChunk });
LevelChunk.prototype.getMax = procHacker.js("?getMax@LevelChunk@@QEBAAEBVBlockPos@@XZ", BlockPos, { this: LevelChunk });
LevelChunk.prototype.isFullyLoaded = procHacker.js("?isFullyLoaded@LevelChunk@@QEBA_NXZ", bool_t, { this: LevelChunk });
LevelChunk.prototype.toWorldPos = procHacker.js(
    "?toWorldPos@LevelChunk@@QEBA?AVBlockPos@@AEBVChunkBlockPos@@@Z",
    BlockPos,
    { this: LevelChunk, structureReturn: true },
    ChunkPos,
);
LevelChunk.prototype.getEntity = procHacker.js("?getEntity@LevelChunk@@QEBAPEAVActor@@AEBUActorUniqueID@@@Z", Actor, { this: LevelChunk }, ActorUniqueID.ref());
// std::vector<WeakEntityRef>& LevelChunk::getChunkEntities();
LevelChunk.prototype.getChunkEntities = procHacker.js(
    "?getChunkEntities@LevelChunk@@QEAAAEAV?$vector@VWeakEntityRef@@V?$allocator@VWeakEntityRef@@@std@@@std@@XZ",
    CxxVectorToArray.make(WeakEntityRef),
    { this: LevelChunk },
);

ChunkSource.prototype.getLevel = procHacker.js("?getLevel@ChunkSource@@QEBAAEAVLevel@@XZ", Level, { this: ChunkSource });
ChunkSource.prototype.isChunkKnown = procHacker.jsv(
    "??_7ChunkSource@@6B@",
    "?isChunkKnown@ChunkSource@@UEAA_NAEBVChunkPos@@@Z",
    bool_t,
    { this: ChunkSource },
    ChunkPos,
);
ChunkSource.prototype.isChunkSaved = procHacker.js("?isChunkSaved@ChunkSource@@UEAA_NAEBVChunkPos@@@Z", bool_t, { this: ChunkSource }, ChunkPos);
ChunkSource.prototype.isWithinWorldLimit = procHacker.jsv(
    "??_7WorldLimitChunkSource@@6B@",
    "?isWithinWorldLimit@WorldLimitChunkSource@@UEBA_NAEBVChunkPos@@@Z",
    bool_t,
    { this: ChunkSource },
    ChunkPos,
);
ChunkSource.prototype.isShutdownDone = procHacker.js("?isShutdownDone@ChunkSource@@UEAA_NXZ", bool_t, { this: ChunkSource });

// origin.ts
VirtualCommandOrigin.allocateWith = function (origin: CommandOrigin, actor: Actor, cmdPos: CommandPositionFloat): VirtualCommandOrigin {
    const out = capi.malloc(VirtualCommandOrigin[NativeType.size]).as(VirtualCommandOrigin);
    VirtualCommandOrigin$VirtualCommandOrigin(out, origin, actor, cmdPos, CommandVersion.CurrentVersion);
    return out;
};
VirtualCommandOrigin.constructWith = function (origin: CommandOrigin, actor: Actor, cmdPos: CommandPositionFloat): VirtualCommandOrigin {
    const out = new VirtualCommandOrigin(true);
    VirtualCommandOrigin$VirtualCommandOrigin(out, origin, actor, cmdPos, CommandVersion.CurrentVersion);
    return out;
};

// biome.ts
Biome.prototype.getBiomeType = procHacker.js("?getBiomeType@Biome@@QEBA?AW4VanillaBiomeTypes@@XZ", uint32_t, { this: Biome });

// item_component.ts
const itemComponents = new Map<bin64_t, new () => ItemComponent>([
    [proc["??_7CooldownItemComponent@@6B@"].getAddressBin(), CooldownItemComponent], // CooldownItemComponent$vftable
    [proc["??_7ArmorItemComponent@@6B@"].getAddressBin(), ArmorItemComponent], // ArmorItemComponent$vftable
    [proc["??_7DurabilityItemComponent@@6B@"].getAddressBin(), DurabilityItemComponent], // DurabilityItemComponent$vftable
    [proc["??_7DiggerItemComponent@@6B@"].getAddressBin(), DiggerItemComponent], // DiggerItemComponent$vftable
    [proc["??_7DisplayNameItemComponent@@6B@"].getAddressBin(), DisplayNameItemComponent], // DisplayNameItemComponent$vftable
    // XXX: removed
    // [proc["??_7DyePowderItemComponent@@6B@"].getAddressBin(), DyePowderItemComponent], // DyePowderItemComponent$vftable
    [proc["??_7EntityPlacerItemComponent@@6B@"].getAddressBin(), EntityPlacerItemComponent], // EntityPlacerItemComponent$vftable
    [proc["??_7FoodItemComponent@@6B?$NetworkedItemComponent@VFoodItemComponent@@@@@"].getAddressBin(), FoodItemComponent], // FoodItemComponent$vftable
    [proc["??_7FuelItemComponent@@6B@"].getAddressBin(), FuelItemComponent], // FuelItemComponent$vftable
    [proc["??_7IconItemComponent@@6B@"].getAddressBin(), IconItemComponent], // IconItemComponent$vftable
    // XXX: removed
    // [proc["??_7KnockbackResistanceItemComponent@@6B@"].getAddressBin(), KnockbackResistanceItemComponent], // KnockbackResistanceItemComponent$vftable
    [proc["??_7OnUseItemComponent@@6B@"].getAddressBin(), OnUseItemComponent], // OnUseItemComponent$vftable
    [proc["??_7PlanterItemComponent@@6B@"].getAddressBin(), PlanterItemComponent], // PlanterItemComponent$vftable
    [proc["??_7ProjectileItemComponent@@6B@"].getAddressBin(), ProjectileItemComponent], // ProjectileItemComponent$vftable
    [proc["??_7RecordItemComponent@@6B@"].getAddressBin(), RecordItemComponent], // RecordItemComponent$vftable
    [proc["??_7RenderOffsetsItemComponent@@6B@"].getAddressBin(), RenderOffsetsItemComponent], // RenderOffsetsItemComponent$vftable
    [proc["??_7RepairableItemComponent@@6B@"].getAddressBin(), RepairableItemComponent], // RepairableItemComponent$vftable
    [proc["??_7ShooterItemComponent@@6B@"].getAddressBin(), ShooterItemComponent], // ShooterItemComponent$vftable
    [proc["??_7ThrowableItemComponent@@6B@"].getAddressBin(), ThrowableItemComponent], // ThrowableItemComponent$vftable
    [proc["??_7WeaponItemComponent@@6B@"].getAddressBin(), WeaponItemComponent], // WeaponItemComponent$vftable
    [proc["??_7WearableItemComponent@@6B@"].getAddressBin(), WearableItemComponent], // WearableItemComponent$vftable
]);

ItemComponent.setResolver(ptr => {
    if (ptr === null) return null;
    const vftable = ptr.getBin64();
    const cls = itemComponents.get(vftable);
    return ptr.as(cls || ItemComponent);
});

const ItemComponent$buildNetworkTag = procHacker.jsv(
    "??_7ItemComponent@@6B@",
    "?buildNetworkTag@ItemComponent@@UEBA?AV?$unique_ptr@VCompoundTag@@U?$default_delete@VCompoundTag@@@std@@@std@@AEBUReflectionCtx@cereal@@@Z",
    CompoundTag.ref(),
    { this: ItemComponent, structureReturn: true },
    cereal.ReflectionCtx,
);
ItemComponent.prototype.buildNetworkTag = function (u = new cereal.ReflectionCtx(true)) {
    return ItemComponent$buildNetworkTag.call(this, u);
};
const ItemComponent$initializeFromNetwork = procHacker.jsv(
    "??_7InteractButtonItemComponent@@6B@",
    "?initializeFromNetwork@InteractButtonItemComponent@@UEAA_NAEBVCompoundTag@@AEBUReflectionCtx@cereal@@@Z",
    bool_t,
    { this: ItemComponent },
    CompoundTag,
    cereal.ReflectionCtx,
);
ItemComponent.prototype.initializeFromNetwork = function (tag, u = new cereal.ReflectionCtx(true)) {
    return ItemComponent$initializeFromNetwork.call(this, tag, u);
};

CooldownItemComponent.getIdentifier = procHacker.js("?getIdentifier@CooldownItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
ArmorItemComponent.getIdentifier = procHacker.js("?getIdentifier@ArmorItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
DurabilityItemComponent.getIdentifier = procHacker.js("?getIdentifier@DurabilityItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
DiggerItemComponent.getIdentifier = procHacker.js("?getIdentifier@DiggerItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
DisplayNameItemComponent.getIdentifier = procHacker.js("?getIdentifier@DisplayNameItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
// XXX: removed
// DyePowderItemComponent.getIdentifier = procHacker.js("?getIdentifier@DyePowderItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
EntityPlacerItemComponent.getIdentifier = procHacker.js("?getIdentifier@EntityPlacerItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
FoodItemComponent.getIdentifier = procHacker.js("?getIdentifier@FoodItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
FuelItemComponent.getIdentifier = procHacker.js("?getIdentifier@FuelItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
IconItemComponent.getIdentifier = procHacker.js("?getIdentifier@IconItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
// XXX: removed
// KnockbackResistanceItemComponent.getIdentifier = procHacker.js("?getIdentifier@KnockbackResistanceItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
OnUseItemComponent.getIdentifier = procHacker.js("?getIdentifier@OnUseItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
PlanterItemComponent.getIdentifier = procHacker.js("?getIdentifier@PlanterItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
ProjectileItemComponent.getIdentifier = procHacker.js("?getIdentifier@ProjectileItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
RecordItemComponent.getIdentifier = procHacker.js("?getIdentifier@RecordItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
RenderOffsetsItemComponent.getIdentifier = procHacker.js("?getIdentifier@RenderOffsetsItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
RepairableItemComponent.getIdentifier = procHacker.js("?getIdentifier@RepairableItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
ShooterItemComponent.getIdentifier = procHacker.js("?getIdentifier@ShooterItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
ThrowableItemComponent.getIdentifier = procHacker.js("?getIdentifier@ThrowableItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
WeaponItemComponent.getIdentifier = procHacker.js("?getIdentifier@WeaponItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);
WearableItemComponent.getIdentifier = procHacker.js("?getIdentifier@WearableItemComponent@@SAAEBVHashedString@@XZ", HashedString, null);

// XXX: removed
// DiggerItemComponent.prototype.mineBlock = procHacker.js(
//     "?mineBlock@DiggerItemComponent@@QEAA_NAEAVItemStack@@AEBVBlock@@HHHPEAVActor@@@Z",
//     bool_t,
//     { this: DiggerItemComponent },
//     ItemStack,
//     Block,
//     int32_t,
//     int32_t,
//     int32_t,
//     Actor,
// );
// TODO: removed method, need to implement
// EntityPlacerItemComponent.prototype.positionAndRotateActor = procHacker.js(
//     "?_positionAndRotateActor@EntityPlacerItemComponent@@AEBAXAEAVActor@@VVec3@@EAEBV3@PEBVBlockLegacy@@@Z",
//     void_t,
//     { this: EntityPlacerItemComponent },
//     Actor,
//     Vec3,
//     int8_t,
//     Vec3,
//     BlockLegacy,
// );
EntityPlacerItemComponent.prototype.setActorCustomName = procHacker.js(
    "?_setActorCustomName@EntityPlacerItemComponent@@AEBAXAEAVActor@@AEBVItemStack@@@Z",
    void_t,
    { this: EntityPlacerItemComponent },
    Actor,
    ItemStack,
);
FoodItemComponent.prototype.canAlwaysEat = procHacker.js("?canAlwaysEat@FoodItemComponent@@UEBA_NXZ", bool_t, { this: FoodItemComponent });
FoodItemComponent.prototype.getUsingConvertsToItemDescriptor = procHacker.js(
    "?getUsingConvertsToItemDescriptor@FoodItemComponent@@QEBA?AVItemDescriptor@@XZ",
    ItemDescriptor,
    { this: FoodItemComponent },
);
// XXX: removed
// KnockbackResistanceItemComponent.prototype.getProtectionValue = procHacker.js("?getProtectionValue@KnockbackResistanceItemComponent@@QEBAMXZ", float32_t, {
//     this: KnockbackResistanceItemComponent,
// });
ProjectileItemComponent.prototype.getShootDir = procHacker.js(
    "?getShootDir@ProjectileItemComponent@@QEBA?AVVec3@@AEBVPlayer@@M@Z",
    Vec3,
    { this: ProjectileItemComponent },
    Player,
    float32_t,
);
ProjectileItemComponent.prototype.shootProjectile = procHacker.js(
    "?shootProjectile@ProjectileItemComponent@@QEBAPEAVActor@@AEAVBlockSource@@AEBVVec3@@1MPEAVPlayer@@@Z",
    Actor,
    { this: ProjectileItemComponent },
    BlockSource,
    Vec3,
    Vec3,
    float32_t,
    Player,
);
// TODO: removed, reimplement
// RecordItemComponent.prototype.getAlias = procHacker.js(
//     "?getAlias@RecordItemComponent@@QEBA?AV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@XZ",
//     CxxString,
//     { this: RecordItemComponent },
// );
RepairableItemComponent.prototype.handleItemRepair = procHacker.js(
    "?handleItemRepair@RepairableItemComponent@@QEBA?AURepairItemResult@@AEAVItemStack@@0_N@Z",
    int32_t,
    { this: RepairableItemComponent },
    ItemStackBase,
    ItemStackBase,
);
ThrowableItemComponent.prototype.getLaunchPower = procHacker.js(
    "?_getLaunchPower@ThrowableItemComponent@@AEBAMHHH@Z",
    float32_t,
    { this: ThrowableItemComponent },
    int32_t,
    int32_t,
    int32_t,
);

// command.ts
CommandRegistry.getParser = function <T>(type: Type<T>): VoidPointer {
    return commandParser.get(type);
};

CommandRegistry.hasParser = function <T>(type: Type<T>): boolean {
    return commandParser.has(type);
};

CommandRegistry.loadParser = function (symbols: CommandSymbols): void {
    return commandParser.load(symbols);
};

CommandRegistry.setParser = function (type: Type<any>, parserFnPointer: VoidPointer): void {
    return commandParser.set(type, parserFnPointer);
};

/**
 * @deprecated no need to use
 */
CommandRegistry.setEnumParser = function (parserFnPointer: VoidPointer): void {
    return commandParser.setEnumParser(parserFnPointer);
};
command.MinecraftCommands.prototype.getRegistry = function () {
    return bedrockServer.commandRegistry;
};
Object.defineProperties(command.MinecraftCommands.prototype, {
    sender: {
        get() {
            return bedrockServer.commandOutputSender;
        },
    },
});

// launcher.ts
const CommandOutputParameterVector = CxxVector.make(CommandOutputParameter);
bedrockServer.executeCommand = function (
    command: string,
    mute: CommandResultType = null,
    permissionLevel: CommandPermissionLevel | null = null,
    dimension: Dimension | null = null,
): CommandResult<any> {
    const origin = ServerCommandOrigin.constructWith(
        "Server",
        bedrockServer.level, // assume it's always ServerLevel
        permissionLevel ?? CommandPermissionLevel.Admin,
        dimension,
    );
    const result = executeCommandWithOutput(command, origin, mute);
    origin.destruct();
    return result;
};

function executeCommandWithOutput(command: string, origin: CommandOrigin, mute: CommandResultType = null): CommandResult<CommandResult.Any> {
    // fire `events.command` manually. because it does not pass MinecraftCommands::executeCommand
    const ctx = CommandContext.constructWith(command, origin);
    const resv = events.command.fire(command, origin.getName(), ctx);
    ctx.destruct();
    decay(ctx);
    if (typeof resv === "number") {
        const res = new MCRESULT(true) as CommandResult<CommandResult.Any>;
        res.result = resv;
        return res;
    }

    // modified MinecraftCommands::executeCommand
    const commands = bedrockServer.minecraftCommands;
    const registry = bedrockServer.commandRegistry;

    if (mute === true || mute == null) mute = CommandResultType.Mute;
    else if (mute === false) mute = CommandResultType.Output;

    const outputType =
        mute === CommandResultType.Mute ? CommandOutputType.None : mute === CommandResultType.Output ? CommandOutputType.AllOutput : CommandOutputType.DataSet;
    const output = CommandOutput.constructWith(outputType);
    const cmdparser = CommandRegistry.Parser.constructWith(registry, CommandVersion.CurrentVersion);
    try {
        let cmd: Command | null;
        const res = new MCRESULT(true) as CommandResult<CommandResult.Any>;
        if (cmdparser.parseCommand(command) && (cmd = cmdparser.createCommand(origin)) !== null) {
            cmd.run(origin, output);
            cmd.destruct();

            const successCount = output.getSuccessCount();
            if (successCount > 0) {
                res.result = 1; // MCRESULT_Success
            } else {
                res.result = 0x200; // MCRESULT_ExecutionFail
            }
        } else {
            const outputParams = CommandOutputParameterVector.construct();
            const errorParams: string[] = cmdparser.getErrorParams();
            if (errorParams.length !== 0) {
                outputParams.reserve(errorParams.length);
                for (const err of errorParams) {
                    outputParams.prepare().constructWith(err);
                }
            }
            const message = cmdparser.getErrorMessage();
            output.error(message, outputParams); // outputParams is destructed by output.error
            res.result = 0; // MCRESULT_FailedToParseCommand;
        }

        output.set_int("statusCode", res.getFullCode());
        if ((mute & CommandResultType.Output) !== 0 && !output.empty()) {
            commands.handleOutput(origin, output);
        }
        if ((mute & CommandResultType.Data) !== 0) {
            const json = bedrockServer.commandOutputSender._toJson(output);
            res.data = json.value();
            json.destruct();
        }
        return res;
    } finally {
        output.destruct();
        cmdparser.destruct();
    }
}
