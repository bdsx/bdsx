import { abstract } from "../common";
import type { VoidPointer } from "../core";
import { CxxVector, CxxVectorLike } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import type { Actor, ActorUniqueID, DimensionId, EntityRefTraits } from "./actor";
import type { BlockSource } from "./block";
import type { BlockPos } from "./blockpos";
import type { Dimension } from "./dimension";
import type { GameRules } from "./gamerules";
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
