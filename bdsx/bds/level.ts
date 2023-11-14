import { abstract } from "../common";
import type { VoidPointer } from "../core";
import { CxxVector, CxxVectorLike } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import type { Actor, ActorDefinitionIdentifier, ActorRuntimeID, ActorUniqueID, DimensionId, EntityRefTraits, ItemActor, WeakEntityRef } from "./actor";
import { BlockLegacy, BlockSource } from "./block";
import type { BlockPos, Vec3 } from "./blockpos";
import type { Dimension } from "./dimension";
import type { GameRules } from "./gamerules";
import type { ItemStack } from "./inventory";
import type { Player, ServerPlayer } from "./player";
import type { Scoreboard } from "./scoreboard";
import { StructureManager } from "./structure";
import { WeakRefT } from "./weakreft";

export enum Difficulty {
    Peaceful,
    Easy,
    Normal,
    Hard,
}

export class Level extends NativeClass {
    vftable: VoidPointer;
    /** @deprecated Use `this.getPlayers()` instead */
    get players(): CxxVectorLike<ServerPlayer> {
        const players = new CxxVectorLike(this.getPlayers());
        Object.defineProperty(this, "players", {
            get() {
                players.setFromArray(this.getPlayers());
                return players;
            },
        });
        return players;
    }

    /**
     * Returns an array of all online players in the level
     */
    getPlayers(): ServerPlayer[] {
        abstract();
    }
    getUsers(): CxxVector<EntityRefTraits> {
        abstract();
    }
    getActiveUsers(): CxxVector<WeakEntityRef> {
        abstract();
    }
    protected _getEntities(): CxxVector<EntityRefTraits> {
        abstract();
    }
    getEntities(): Actor[] {
        abstract();
    }
    getRuntimeEntity(runtimeId: ActorRuntimeID, getRemoved: boolean = false): Actor | null {
        abstract();
    }
    getRuntimePlayer(runtimeId: ActorRuntimeID): Player | null {
        abstract();
    }
    createDimension(id: DimensionId): Dimension {
        abstract();
    }
    getOrCreateDimension(id: DimensionId): WeakRefT<Dimension> {
        abstract();
    }
    /**
     * Destroys a block at the given position
     *
     * @returns {boolean} Whether the block was destroyed successfully
     */
    destroyBlock(blockSource: BlockSource, blockPos: BlockPos, dropResources: boolean): boolean {
        abstract();
    }
    /**
     * Gets an entity with the given unique id
     */
    fetchEntity(actorUniqueId: ActorUniqueID, getRemoved: boolean): Actor | null {
        abstract();
    }
    /**
     * Returns the number of current online players
     */
    getActivePlayerCount(): number {
        abstract();
    }
    /**
     * Returns the ActorFactory instance
     */
    getActorFactory(): ActorFactory {
        abstract();
    }
    /**
     * Returns the AdventureSettings instance
     */
    getAdventureSettings(): AdventureSettings {
        abstract();
    }
    /**
     * Returns the BlockPalette instance
     */
    getBlockPalette(): BlockPalette {
        abstract();
    }
    /**
     * Returns the Dimension instance
     */
    getDimension(dimension: DimensionId): Dimension | null {
        abstract();
    }
    getDimensionWeakRef(dimension: DimensionId): WeakRefT<Dimension> {
        abstract();
    }
    /**
     * Returns the LevelData instance
     */
    getLevelData(): LevelData {
        abstract();
    }
    /**
     * Returns the GameRules instance
     * @deprecated use bedrockServer.gameRules
     */
    getGameRules(): GameRules {
        abstract();
    }
    /**
     * Returns the Scoreboard instance
     */
    getScoreboard(): Scoreboard {
        abstract();
    }
    /**
     * Returns the level's random seed
     */
    getSeed(): number {
        abstract();
    }
    /**
     * Constructs a StructureManager instance, you need to destruct it later
     * @deprecated use bedrockServer.structureManager
     */
    getStructureManager(): StructureManager {
        abstract();
    }
    /**
     * Returns the Spawner instance
     */
    getSpawner(): Spawner {
        abstract();
    }
    /**
     * Returns the TagRegistry instance
     */
    getTagRegistry(): TagRegistry {
        abstract();
    }
    /**
     * Returns the level's time
     */
    getTime(): number {
        abstract();
    }
    /**
     * Returns the level's current tick
     */
    getCurrentTick(): number {
        abstract();
    }
    /**
     * Returns whether the level has allow-cheats turned on
     */
    hasCommandsEnabled(): boolean {
        abstract();
    }
    /**
     * Changes the allow-cheats state of the level
     */
    setCommandsEnabled(value: boolean): void {
        abstract();
    }
    setShouldSendSleepMessage(value: boolean): void {
        abstract();
    }
    /**
     * Changes the level's time
     */
    setTime(time: number): void {
        abstract();
    }
    /**
     * Syncs the level's game rules with all clients
     */
    syncGameRules(): void {
        abstract();
    }
    /**
     * Spawn a particle effect at the given position
     *
     * @param effectName accepts format like "minecraft:arrow_spell_emitter"
     *
     * @see https://www.digminecraft.com/lists/particle_list_pe.php
     * */
    spawnParticleEffect(effectName: string, spawnLocation: Vec3, dimension: Dimension): void {
        abstract();
    }
    /**
     * Returns a random Player
     */
    getRandomPlayer(): Player | null {
        abstract();
    }
    /**
     * Updates the level's weather
     */
    updateWeather(rainLevel: number, rainTime: number, lightningLevel: number, lightningTime: number): void {
        abstract();
    }

    setDefaultSpawn(pos: BlockPos): void {
        abstract();
    }

    getDefaultSpawn(): BlockPos {
        abstract();
    }

    explode(
        region: BlockSource,
        source: Actor | null,
        pos: Vec3,
        explosionRadius: number,
        fire: boolean,
        breaksBlocks: boolean,
        maxResistance: number,
        allowUnderwater: boolean,
    ): void {
        abstract();
    }
    getPlayerByXuid(xuid: string): Player | null {
        abstract();
    }
    getDifficulty(): Difficulty {
        abstract();
    }
    setDifficulty(difficulty: Difficulty): void {
        abstract();
    }

    getNewUniqueID(): ActorUniqueID {
        abstract();
    }

    getNextRuntimeID(): ActorRuntimeID {
        abstract();
    }

    sendAllPlayerAbilities(player: Player): void {
        abstract();
    }
}

export class ServerLevel extends Level {}

export class LevelData extends NativeClass {
    getGameDifficulty(): Difficulty {
        abstract();
    }
    setGameDifficulty(value: Difficulty): void {
        abstract();
    }
}

export class ActorFactory extends NativeClass {}

export namespace JsonUtil {
    /** @param name only accepts format like "minecraft:wool" */
    export function getBlockLegacy(name: BlockId): BlockLegacy;
    export function getBlockLegacy(name: string): BlockLegacy;
    export function getBlockLegacy(name: BlockId | string): BlockLegacy {
        abstract();
    }
}

export class BlockPalette extends NativeClass {
    /**
     * @deprecated use {@link JsonUtil.getBlockLegacy}
     */
    getBlockLegacy(name: BlockId | string): BlockLegacy {
        return JsonUtil.getBlockLegacy(name);
    }
}

export class AdventureSettings extends NativeClass {}

export class TagRegistry extends NativeClass {}

export class Spawner extends NativeClass {
    spawnItem(region: BlockSource, itemStack: ItemStack, pos: Vec3, throwTime: number): ItemActor {
        abstract();
    }
    spawnMob(region: BlockSource, id: ActorDefinitionIdentifier, pos: Vec3, naturalSpawn = false, surface = true, fromSpawner = false): Actor {
        abstract();
    }
}

export enum LevelEvent {
    SoundClick = 0x3e8,
    SoundClickFail = 0x3e9,
    SoundLaunch = 0x3ea,
    SoundOpenDoor = 0x3eb,
    SoundFizz = 0x3ec,
    SoundFuse = 0x3ed,
    SoundPlayRecording = 0x3ee,
    SoundGhastWarning = 0x3ef,
    SoundGhastFireball = 0x3f0,
    SoundBlazeFireball = 0x3f1,
    SoundZombieWoodenDoor = 0x3f2,
    SoundZombieDoorCrash = 0x3f4,
    SoundZombieInfected = 0x3f8,
    SoundZombieConverted = 0x3f9,
    SoundEndermanTeleport = 0x3fa,
    SoundAnvilBroken = 0x3fc,
    SoundAnvilUsed = 0x3fd,
    SoundAnvilLand = 0x3fe,
    SoundInfinityArrowPickup = 0x406,
    SoundTeleportEnderPearl = 0x408,
    SoundAddItem = 0x410,
    SoundItemFrameBreak = 0x411,
    SoundItemFramePlace = 0x412,
    SoundItemFrameRemoveItem = 0x413,
    SoundItemFrameRotateItem = 0x414,
    SoundExperienceOrbPickup = 0x41b,
    SoundTotemUsed = 0x41c,
    SoundArmorStandBreak = 0x424,
    SoundArmorStandHit = 0x425,
    SoundArmorStandLand = 0x426,
    SoundArmorStandPlace = 0x427,
    ParticlesShoot = 0x7d0,
    ParticlesDestroyBlock = 0x7d1,
    ParticlesPotionSplash = 0x7d2,
    ParticlesEyeOfEnderDeath = 0x7d3,
    ParticlesMobBlockSpawn = 0x7d4,
    ParticleCropGrowth = 0x7d5,
    ParticleSoundGuardianGhost = 0x7d6,
    ParticleDeathSmoke = 0x7d7,
    ParticleDenyBlock = 0x7d8,
    ParticleGenericSpawn = 0x7d9,
    ParticlesDragonEgg = 0x7da,
    ParticlesCropEaten = 0x7db,
    ParticlesCrit = 0x7dc,
    ParticlesTeleport = 0x7dd,
    ParticlesCrackBlock = 0x7de,
    ParticlesBubble = 0x7df,
    ParticlesEvaporate = 0x7e0,
    ParticlesDestroyArmorStand = 0x7e1,
    ParticlesBreakingEgg = 0x7e2,
    ParticleDestroyEgg = 0x7e3,
    ParticlesEvaporateWater = 0x7e4,
    ParticlesDestroyBlockNoSound = 0x7e5,
    ParticlesKnockbackRoar = 0x7e6,
    ParticlesTeleportTrail = 0x7e7,
    ParticlesPointCloud = 0x7e8,
    ParticlesExplosion = 0x7e9,
    ParticlesBlockExplosion = 0x7ea,
    StartRaining = 0xb9,
    StartThunderstorm = 0xba,
    StopRaining = 0xbb,
    StopThunderstorm = 0xbc,
    GlobalPause = 0xbd,
    SimTimeStep = 0xbe,
    SimTimeScale = 0xbf,
    ActivateBlock = 0xdac,
    CauldronExplode = 0xdad,
    CauldronDyeArmor = 0xdae,
    CauldronCleanArmor = 0xdaf,
    CauldronFillPotion = 0xdb0,
    CauldronTakePotion = 0xdb1,
    CauldronFillWater = 0xdb2,
    CauldronTakeWater = 0xdb3,
    CauldronAddDye = 0xdb4,
    CauldronCleanBanner = 0xdb5,
    CauldronFlush = 0xdb6,
    AgentSpawnEffect = 0xdb7,
    CauldronFillLava = 0xdb8,
    CauldronTakeLava = 0xdb9,
    StartBlockCracking = 0xe10,
    StopBlockCracking = 0xe11,
    UpdateBlockCracking = 0xe12,
    AllPlayersSleeping = 0x2648,
    JumpPrevented = 0x2652,
    ParticleLegacyEvent = 0x4000,
}

export enum BedSleepingResult {
    OK_2 = 0,
    NOT_POSSIBLE_HERE = 1,
    NOT_POSSIBLE_NOW = 2,
    TOO_FAR_AWAY = 3,
    OTHER_PROBLEM = 4,
    NOT_SAFE = 5,
}
