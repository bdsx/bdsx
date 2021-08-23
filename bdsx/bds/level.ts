import { LoopbackPacketSender } from "../bds/loopbacksender";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { BlockSource } from "./block";
import { BlockPos } from "./blockpos";
import { Dimension } from "./dimension";
import { ServerPlayer } from "./player";
import { Scoreboard } from "./scoreboard";

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
    getScoreboard():Scoreboard {
        abstract();
    }
    getSeed():number {
        abstract();
    }
    getTagRegistry():TagRegistry {
        abstract();
    }
    setCommandsEnabled(value:boolean):void {
        abstract();
    }
    setShouldSendSleepMessage(value:boolean):void {
        abstract();
    }
}

export class ServerLevel extends Level {
    /** @deprecated unusing */
    packetSender:LoopbackPacketSender;
    actors:CxxVector<Actor>;
}

export class ActorFactory extends NativeClass {
}

export class BlockPalette extends NativeClass {
}

export class AdventureSettings extends NativeClass {
}

export class TagRegistry extends NativeClass {
}
