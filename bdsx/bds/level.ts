import { LoopbackPacketSender } from "bdsx/bds/loopbacksender";
import { abstract } from "bdsx/common";
import { CxxVector } from "bdsx/cxxvector";
import { NativeClass } from "bdsx/nativeclass";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { Dimension } from "./dimension";
import { ServerPlayer } from "./player";

export class Level extends NativeClass {
    players:CxxVector<ServerPlayer>;

    createDimension(id:DimensionId):Dimension {
        abstract();
    }
    fetchEntity(id:ActorUniqueID, unknown:boolean):Actor|null {
        abstract();
    }
    getActivePlayerCount():number {
        abstract();
    }
}
export class ServerLevel extends Level {
    packetSender:LoopbackPacketSender;
    actors:CxxVector<Actor>;
}
