import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector, CxxVectorLike } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { Actor, ActorUniqueID, DimensionId, EntityRefTraits } from "./actor";
import { BlockSource } from "./block";
import { BlockPos } from "./blockpos";
import { Dimension } from "./dimension";
import { GameRules } from "./gamerules";
import { ServerPlayer } from "./player";
import { Scoreboard } from "./scoreboard";
import { StructureManager } from "./structure";

export enum Difficulty {
    Peaceful,
    Easy,
    Normal,
    Hard,
}

export class Level extends NativeClass {
    vftable:VoidPointer;
    /** @deprecated use getPlayers() */
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

    getPlayers():ServerPlayer[] {
        abstract();
    }
    getUsers():CxxVector<EntityRefTraits> {
        abstract();
    }
    createDimension(id:DimensionId):Dimension {
        abstract();
    }
    destroyBlock(blockSource:BlockSource, blockPos:BlockPos, dropResources:boolean):boolean {
        abstract();
    }
    fetchEntity(id:ActorUniqueID, fetchRemovedActor:boolean):Actor|null {
        abstract();
    }
    getActivePlayerCount():number {
        abstract();
    }
    getActorFactory():ActorFactory {
        abstract();
    }
    getAdventureSettings():AdventureSettings {
        abstract();
    }
    getBlockPalette():BlockPalette {
        abstract();
    }
    getDimension(dimension:DimensionId):Dimension|null {
        abstract();
    }
    getLevelData():LevelData {
        abstract();
    }
    getGameRules():GameRules {
        abstract();
    }
    getScoreboard():Scoreboard {
        abstract();
    }
    getSeed():number {
        abstract();
    }
    protected _getStructureManager(structureManager:StructureManager):StructureManager {
        abstract();
    }
    getStructureManager():StructureManager {
        return this._getStructureManager(StructureManager.construct());
    }
    getTagRegistry():TagRegistry {
        abstract();
    }
    hasCommandsEnabled():boolean {
        abstract();
    }
    setCommandsEnabled(value:boolean):void {
        abstract();
    }
    setShouldSendSleepMessage(value:boolean):void {
        abstract();
    }
    syncGameRules():void {
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
}

export class AdventureSettings extends NativeClass {
}

export class TagRegistry extends NativeClass {
}
