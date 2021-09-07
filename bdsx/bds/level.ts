import { LoopbackPacketSender } from "../bds/loopbacksender";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { BlockSource } from "./block";
import { BlockPos } from "./blockpos";
import { Dimension } from "./dimension";
import { GameRules } from "./gamerules";
import { ServerPlayer } from "./player";
import { Scoreboard } from "./scoreboard";
import minecraft = require('../minecraft');

export const Difficulty = minecraft.Difficulty;
export type Difficulty = minecraft.Difficulty;

/** @deprecated */
export class Level extends NativeClass {
    vftable:VoidPointer;
    players:CxxVector<ServerPlayer>;

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
    /** @deprecated unusing */
    packetSender:LoopbackPacketSender;
    actors:CxxVector<Actor>;
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
