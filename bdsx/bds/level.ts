import { LoopbackPacketSender } from "bdsx/loopbacksender";
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
Level.prototype.createDimension = makefunc.js(proc["Level::createDimension"], Dimension, {this:Level}, RawTypeId.Int32);
Level.prototype.fetchEntity = makefunc.js(proc["Level::fetchEntity"], Actor, {this:Level, nullableReturn: true}, RawTypeId.Bin64, RawTypeId.Boolean);



Level.abstract({players:[CxxVector.make(ServerPlayer.ref()), 0x58]});

export class ServerLevel extends Level
{
    packetSender:LoopbackPacketSender;
    actors:CxxVector<Actor>;
}
ServerLevel.abstract({
    packetSender:[LoopbackPacketSender.ref(), 0x830],
    actors:[CxxVector.make(Actor.ref()), 0x1590],
});
