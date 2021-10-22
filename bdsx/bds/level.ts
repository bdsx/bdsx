import { abstract } from "../common";
import type { VoidPointer } from "../core";
import { CxxVector, CxxVectorLike } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import type { Actor, ActorDefinitionIdentifier, ActorUniqueID, DimensionId, EntityRefTraits, ItemActor } from "./actor";
import type { BlockLegacy, BlockSource } from "./block";
import type { BlockPos, Vec3 } from "./blockpos";
import type { Dimension } from "./dimension";
import type { GameRules } from "./gamerules";
import type { ItemStack } from "./inventory";
import type { ServerPlayer } from "./player";
import type { Scoreboard } from "./scoreboard";

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
            }
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
    protected _getEntities():CxxVector<EntityRefTraits> {
        abstract();
    }
    getEntities():Actor[] {
        abstract();
    }
    createDimension(id:DimensionId):Dimension {
        abstract();
    }
    /**
     * Destroyes a block at the given position
     *
     * @returns {boolean} Whether the block was destroyed successfully
     */
    destroyBlock(blockSource:BlockSource, blockPos:BlockPos, dropResources:boolean):boolean {
        abstract();
    }
    /**
     * Gets an entity with the given unique id
     */
    fetchEntity(id:ActorUniqueID, fetchRemovedActor:boolean):Actor|null {
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
