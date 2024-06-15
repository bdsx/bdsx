import { abstract } from "../common";
import type { VoidPointer } from "../core";
import { CxxVector, CxxVectorLike } from "../cxxvector";
import { NativeClass, nativeClass } from "../nativeclass";
import { float32_t, int32_t, uint32_t } from "../nativetype";
import type { Actor, ActorDefinitionIdentifier, ActorRuntimeID, ActorUniqueID, DimensionId, EntityContext, ItemActor, WeakEntityRef } from "./actor";
import { Block, BlockLegacy, BlockSource } from "./block";
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
    getUsers(): CxxVector<EntityContext> {
        abstract();
    }
    getActiveUsers(): CxxVector<WeakEntityRef> {
        abstract();
    }
    protected _getEntities(): CxxVector<EntityContext> {
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

@nativeClass(null)
export class LevelData extends NativeClass {
    getGameDifficulty(): Difficulty {
        abstract();
    }
    setGameDifficulty(value: Difficulty): void {
        abstract();
    }

    getRainLevel(): float32_t {
        abstract();
    }

    setRainLevel(value: float32_t): void {
        abstract();
    }

    getRainTime(): int32_t {
        abstract();
    }

    setRainTime(value: int32_t): void {
        abstract();
    }

    getLightningLevel(): float32_t {
        abstract();
    }

    setLightningLevel(value: float32_t): void {
        abstract();
    }

    getLightningTime(): int32_t {
        abstract();
    }

    setLightningTime(value: int32_t): void {
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

    /**
     * Returns minecraft:air if it doesn't exist.
     */
    getBlock(runtimeId: uint32_t): Block {
        abstract();
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
    Undefined = 0,

    SoundClick = 1000,
    SoundClickFail = 1001,
    SoundLaunch = 1002,
    SoundOpenDoor = 1003,
    SoundFizz = 1004,
    SoundFuse = 1005,
    SoundPlayRecording = 1006,
    SoundGhastWarning = 1007,
    SoundGhastFireball = 1008,
    SoundBlazeFireball = 1009,
    SoundZombieWoodenDoor = 1010,
    SoundZombieDoorCrash = 1012,
    SoundZombieInfected = 1016,
    SoundZombieConverted = 1017,
    SoundEndermanTeleport = 1018,
    SoundAnvilBroken = 1020,
    SoundAnvilUsed = 1021,
    SoundAnvilLand = 1022,
    SoundInfinityArrowPickup = 1030,
    SoundTeleportEnderPearl = 1032,
    SoundAddItem = 1040,
    SoundItemFrameBreak = 1041,
    SoundItemFramePlace = 1042,
    SoundItemFrameRemoveItem = 1043,
    SoundItemFrameRotateItem = 1044,
    SoundExperienceOrbPickup = 1051,
    SoundTotemUsed = 1052,
    SoundArmorStandBreak = 1060,
    SoundArmorStandHit = 1061,
    SoundArmorStandLand = 1062,
    SoundArmorStandPlace = 1063,
    SoundPointedDripstoneLand = 1064,
    SoundDyeUsed = 1065,
    SoundInkSacUsed = 1066,
    SoundAmethystResonate = 1067,
    QueueCustomMusic = 1900,
    PlayCustomMusic = 1901,
    StopCustomMusic = 1902,
    SetMusicVolume = 1903,
    ParticlesShoot = 2000,
    ParticlesDestroyBlock = 2001,
    ParticlesPotionSplash = 2002,
    ParticlesEyeOfEnderDeath = 2003,
    ParticlesMobBlockSpawn = 2004,
    ParticleCropGrowth = 2005,
    ParticleSoundGuardianGhost = 2006,
    ParticleDeathSmoke = 2007,
    ParticleDenyBlock = 2008,
    ParticleGenericSpawn = 2009,
    ParticlesDragonEgg = 2010,
    ParticlesCropEaten = 2011,
    ParticlesCrit = 2012,
    ParticlesTeleport = 2013,
    ParticlesCrackBlock = 2014,
    ParticlesBubble = 2015,
    ParticlesEvaporate = 2016,
    ParticlesDestroyArmorStand = 2017,
    ParticlesBreakingEgg = 2018,
    ParticleDestroyEgg = 2019,
    ParticlesEvaporateWater = 2020,
    ParticlesDestroyBlockNoSound = 2021,
    ParticlesKnockbackRoar = 2022,
    ParticlesTeleportTrail = 2023,
    ParticlesPointCloud = 2024,
    ParticlesExplosion = 2025,
    ParticlesBlockExplosion = 2026,
    ParticlesVibrationSignal = 2027,
    ParticlesDripstoneDrip = 2028,
    ParticlesFizzEffect = 2029,
    WaxOn = 2030,
    WaxOff = 2031,
    Scrape = 2032,
    ParticlesElectricSpark = 2033,
    ParticleTurtleEgg = 2034,
    ParticlesSculkShriek = 2035,
    SculkCatalystBloom = 2036,
    SculkCharge = 2037,
    SculkChargePop = 2038,
    SonicExplosion = 2039,
    DustPlume = 2040,
    StartRaining = 3001,
    StartThunderstorm = 3002,
    StopRaining = 3003,
    StopThunderstorm = 3004,
    GlobalPause = 3005,
    SimTimeStep = 3006,
    SimTimeScale = 3007,
    ActivateBlock = 3500,
    CauldronExplode = 3501,
    CauldronDyeArmor = 3502,
    CauldronCleanArmor = 3503,
    CauldronFillPotion = 3504,
    CauldronTakePotion = 3505,
    CauldronFillWater = 3506,
    CauldronTakeWater = 3507,
    CauldronAddDye = 3508,
    CauldronCleanBanner = 3509,
    CauldronFlush = 3510,
    AgentSpawnEffect = 3511,
    CauldronFillLava = 3512,
    CauldronTakeLava = 3513,
    CauldronFillPowderSnow = 3514,
    CauldronTakePowderSnow = 3515,
    StartBlockCracking = 3600,
    StopBlockCracking = 3601,
    UpdateBlockCracking = 3602,
    ParticlesCrackBlockDown = 3603,
    ParticlesCrackBlockUp = 3604,
    ParticlesCrackBlockNorth = 3605,
    ParticlesCrackBlockSouth = 3606,
    ParticlesCrackBlockWest = 3607,
    ParticlesCrackBlockEast = 3608,
    ParticlesShootWhiteSmoke = 3609,
    ParticlesBreezeWindExplosion = 3610,
    ParticlesTrialSpawnerDetection = 3611,
    ParticlesTrialSpawnerSpawning = 3612,
    ParticlesTrialSpawnerEjecting = 3613,
    ParticlesWindExplosion = 3614,
    ParticlesTrialSpawnerDetectionCharged = 3615,
    ParticlesTrialSpawnerBecomeCharged = 3616,
    AllPlayersSleeping = 3617,
    deprecated = 3618,
    SleepingPlayers = 9801,
    JumpPrevented = 9810,
    AnimationVaultActivate = 9811,
    AnimationVaultDeactivate = 9812,
    AnimationVaultEjectItem = 9813,
    AnimationSpawnCobweb = 9814,
    ParticleSmashAttackGroundDust = 9815,
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
