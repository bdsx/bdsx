import { LoopbackPacketSender } from "bdsx/bds/loopbacksender";
import { makefunc } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { Dimension } from "./dimension";
import { ServerPlayer } from "./player";
import { proc } from "./proc";
import { CxxVector } from "bdsx/cxxvector";
import { abstract, RawTypeId } from "bdsx/common";

export class Level extends NativeClass
{
	players:CxxVector<ServerPlayer>;

    createDimension(id:DimensionId):Dimension
    {
        abstract();
    }
    fetchEntity(id:ActorUniqueID, unknown:boolean):Actor
    {
        abstract();
    }
}
export class ServerLevel extends Level
{
    packetSender:LoopbackPacketSender;
    actors:CxxVector<Actor>;
}