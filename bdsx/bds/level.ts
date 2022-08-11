import { abstract } from "../common";
import type { VoidPointer } from "../core";
import { CxxVector, CxxVectorLike } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import type { Actor, ActorDefinitionIdentifier, ActorRuntimeID, ActorUniqueID, DimensionId, EntityRefTraits, ItemActor, WeakEntityRef } from "./actor";
import type { BlockLegacy, BlockSource } from "./block";
import type { BlockPos, Vec3 } from "./blockpos";
import type { Dimension } from "./dimension";
import type { GameRules } from "./gamerules";
import type { ItemStack } from "./inventory";
import type { Player, ServerPlayer } from "./player";
import type { Scoreboard } from "./scoreboard";
import { StructureManager } from "./structure";

export enum Difficulty {
    Peaceful,
    Easy,
    Normal,
    Hard,
}

export class Level extends NativeClass {
    vftable:VoidPointer;
    /** @deprecated Use `this.getPlayers()` instead */
    get players():CxxVectorLike<ServerPlayer> {
        const players = new CxxVectorLike(this.getPlayers());
        Object.defineProperty(this, 'players', {
            get(){
                players.setFromArray(this.getPlayers());
                return players;
            },
        });
        return players;
    }

    /**
     * Returns an array of all online players in the level
     */
    getPlayers():ServerPlayer[] {
        abstract();
    }
    getUsers():CxxVector<EntityRefTraits> {
        abstract();
    }
    getActiveUsers():CxxVector<WeakEntityRef> {
        abstract();
    }
    protected _getEntities():CxxVector<EntityRefTraits> {
        abstract();
    }
    getEntities():Actor[] {
        abstract();
    }
    getRuntimeEntity(runtimeId: ActorRuntimeID, getRemoved: boolean = false): Actor | null {
        abstract();
    }
    getRuntimePlayer(runtimeId: ActorRuntimeID): Player | null {
        abstract();
    }
    createDimension(id:DimensionId):Dimension {
        abstract();
    }
    /**
     * Destroys a block at the given position
     *
     * @returns {boolean} Whether the block was destroyed successfully
     */
    destroyBlock(blockSource:BlockSource, blockPos:BlockPos, dropResources:boolean):boolean {
        abstract();
    }
    /**
     * Gets an entity with the given unique id
     */
    fetchEntity(actorUniqueId:ActorUniqueID, getRemoved:boolean):Actor | null {
        abstract();
    }
    /**
     * Returns the number of current online players
     */
    getActivePlayerCount():number {
        abstract();
    }
    /**
     * Returns the ActorFactory instance
     */
    getActorFactory():ActorFactory {
        abstract();
    }
    /**
     * Returns the AdventureSettings instance
     */
    getAdventureSettings():AdventureSettings {
        abstract();
    }
    /**
     * Returns the BlockPalette instance
     */
    getBlockPalette():BlockPalette {
        abstract();
    }
    /**
     * Returns the Dimension instance
     */
    getDimension(dimension:DimensionId):Dimension|null {
        abstract();
    }
    /**
     * Returns the LevelData instance
     */
    getLevelData():LevelData {
        abstract();
    }
    /**
     * Returns the GameRules instance
     * @deprecated use bedrockServer.gameRules
     */
    getGameRules():GameRules {
        abstract();
    }
    /**
     * Returns the Scoreboard instance
     */
    getScoreboard():Scoreboard {
        abstract();
    }
    /**
     * Returns the level's random seed
     */
    getSeed():number {
        abstract();
    }
    protected _getStructureManager(structureManager:StructureManager):StructureManager {
        abstract();
    }
    /** Constructs a StructureManager instance, you need to destruct it later */
    getStructureManager():StructureManager {
        return this._getStructureManager(StructureManager.construct());
    }
    /**
     * Returns the Spawner instance
     */
    getSpawner():Spawner {
        abstract();
    }
    /**
     * Returns the TagRegistry instance
     */
    getTagRegistry():TagRegistry {
        abstract();
    }
    /**
     * Returns the level's time
     */
    getTime():number {
        abstract();
    }
    /**
     * Returns the level's current tick
     */
    getCurrentTick():number {
        abstract();
    }
    /**
     * Returns whether the level has allow-cheats turned on
     */
    hasCommandsEnabled():boolean {
        abstract();
    }
    /**
     * Changes the allow-cheats state of the level
     */
    setCommandsEnabled(value:boolean):void {
        abstract();
    }
    setShouldSendSleepMessage(value:boolean):void {
        abstract();
    }
    /**
     * Changes the level's time
     */
    setTime(time: number):void {
        abstract();
    }
    /**
     * Syncs the level's game rules with all clients
     */
    syncGameRules():void {
        abstract();
    }
    /**
     * Spawn a particle effect at the given position
     *
     * @param effectName accepts format like "minecraft:arrow_spell_emitter"
     *
     * @see https://www.digminecraft.com/lists/particle_list_pe.php
     * */
    spawnParticleEffect(effectName:string, spawnLocation:Vec3, dimension:Dimension):void {
        abstract();
    }
    /**
     * Returns a random Player
     */
    getRandomPlayer(): Player {
        abstract();
    }
    /**
     * Updates the level's weather
     */
    updateWeather(rainLevel: number, rainTime: number, lightningLevel: number, lightningTime: number): void {
        abstract();
    }

    setDefaultSpawn(pos:BlockPos):void {
        abstract();
    }

    getDefaultSpawn():BlockPos {
        abstract();
    }

    explode(region: BlockSource, source: Actor | null, pos: Vec3, explosionRadius: number, fire: boolean, breaksBlocks: boolean, maxResistance: number, allowUnderwater: boolean): void {
        abstract();
    }
    getPlayerByXuid(xuid:string): Player | null {
        abstract();
    }
    getDifficulty(): Difficulty {
        abstract();
    }
    setDifficulty(difficulty:Difficulty): void {
        abstract();
    }
    getNewUniqueID(): ActorUniqueID {
        abstract();
    }
}

export class ServerLevel extends Level {
}

export class LevelData extends NativeClass {
    getGameDifficulty():Difficulty {
        abstract();
    }
    setGameDifficulty(value:Difficulty):void {
        abstract();
    }
}

export class ActorFactory extends NativeClass {
}
export class BlockPalette extends NativeClass {
    /** @param name only accepts format like "minecraft:wool" */
    getBlockLegacy(name:BlockId):BlockLegacy;
    getBlockLegacy(name:string):BlockLegacy;
    getBlockLegacy(name:BlockId|string):BlockLegacy {
        abstract();
    }
}

export class AdventureSettings extends NativeClass {
}

export class TagRegistry extends NativeClass {
}

export class Spawner extends NativeClass {
    spawnItem(region:BlockSource, itemStack:ItemStack, pos:Vec3, throwTime:number):ItemActor {
        abstract();
    }
    spawnMob(region:BlockSource, id:ActorDefinitionIdentifier, pos:Vec3, naturalSpawn = false, surface = true, fromSpawner = false):Actor {
        abstract();
    }
}

export enum LevelEvent {
    SoundClick = 0x3E8,
    SoundClickFail = 0x3E9,
    SoundLaunch = 0x3EA,
    SoundOpenDoor = 0x3EB,
    SoundFizz = 0x3EC,
    SoundFuse = 0x3ED,
    SoundPlayRecording = 0x3EE,
    SoundGhastWarning = 0x3EF,
    SoundGhastFireball = 0x3F0,
    SoundBlazeFireball = 0x3F1,
    SoundZombieWoodenDoor = 0x3F2,
    SoundZombieDoorCrash = 0x3F4,
    SoundZombieInfected = 0x3F8,
    SoundZombieConverted = 0x3F9,
    SoundEndermanTeleport = 0x3FA,
    SoundAnvilBroken = 0x3FC,
    SoundAnvilUsed = 0x3FD,
    SoundAnvilLand = 0x3FE,
    SoundInfinityArrowPickup = 0x406,
    SoundTeleportEnderPearl = 0x408,
    SoundAddItem = 0x410,
    SoundItemFrameBreak = 0x411,
    SoundItemFramePlace = 0x412,
    SoundItemFrameRemoveItem = 0x413,
    SoundItemFrameRotateItem = 0x414,
    SoundExperienceOrbPickup = 0x41B,
    SoundTotemUsed = 0x41C,
    SoundArmorStandBreak = 0x424,
    SoundArmorStandHit = 0x425,
    SoundArmorStandLand = 0x426,
    SoundArmorStandPlace = 0x427,
    ParticlesShoot = 0x7D0,
    ParticlesDestroyBlock = 0x7D1,
    ParticlesPotionSplash = 0x7D2,
    ParticlesEyeOfEnderDeath = 0x7D3,
    ParticlesMobBlockSpawn = 0x7D4,
    ParticleCropGrowth = 0x7D5,
    ParticleSoundGuardianGhost = 0x7D6,
    ParticleDeathSmoke = 0x7D7,
    ParticleDenyBlock = 0x7D8,
    ParticleGenericSpawn = 0x7D9,
    ParticlesDragonEgg = 0x7DA,
    ParticlesCropEaten = 0x7DB,
    ParticlesCrit = 0x7DC,
    ParticlesTeleport = 0x7DD,
    ParticlesCrackBlock = 0x7DE,
    ParticlesBubble = 0x7DF,
    ParticlesEvaporate = 0x7E0,
    ParticlesDestroyArmorStand = 0x7E1,
    ParticlesBreakingEgg = 0x7E2,
    ParticleDestroyEgg = 0x7E3,
    ParticlesEvaporateWater = 0x7E4,
    ParticlesDestroyBlockNoSound = 0x7E5,
    ParticlesKnockbackRoar = 0x7E6,
    ParticlesTeleportTrail = 0x7E7,
    ParticlesPointCloud = 0x7E8,
    ParticlesExplosion = 0x7E9,
    ParticlesBlockExplosion = 0x7EA,
    StartRaining = 0xB9,
    StartThunderstorm = 0xBA,
    StopRaining = 0xBB,
    StopThunderstorm = 0xBC,
    GlobalPause = 0xBD,
    SimTimeStep = 0xBE,
    SimTimeScale = 0xBF,
    ActivateBlock = 0xDAC,
    CauldronExplode = 0xDAD,
    CauldronDyeArmor = 0xDAE,
    CauldronCleanArmor = 0xDAF,
    CauldronFillPotion = 0xDB0,
    CauldronTakePotion = 0xDB1,
    CauldronFillWater = 0xDB2,
    CauldronTakeWater = 0xDB3,
    CauldronAddDye = 0xDB4,
    CauldronCleanBanner = 0xDB5,
    CauldronFlush = 0xDB6,
    AgentSpawnEffect = 0xDB7,
    CauldronFillLava = 0xDB8,
    CauldronTakeLava = 0xDB9,
    StartBlockCracking = 0xE10,
    StopBlockCracking = 0xE11,
    UpdateBlockCracking = 0xE12,
    AllPlayersSleeping = 0x2648,
    JumpPrevented = 0x2652,
    ParticleLegacyEvent = 0x4000,
}

export enum BedSleepingResult {
    OK_2 = 0 ,
    NOT_POSSIBLE_HERE = 1,
    NOT_POSSIBLE_NOW = 2,
    TOO_FAR_AWAY = 3,
    OTHER_PROBLEM = 4,
    NOT_SAFE = 5,
}
