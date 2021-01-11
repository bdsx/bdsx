import { LoopbackPacketSender } from "bdsx/loopbacksender";
import { makefunc } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { Dimension } from "./dimension";
import { ServerPlayer } from "./player";
import { proc } from "./proc";
import { CxxVector } from "bdsx/cxxvector";
import { RawTypeId } from "bdsx/common";

export class Level extends NativeClass
{
	players:CxxVector<ServerPlayer>;

    createDimension(id:DimensionId):Dimension
    {
        throw 'abstract';
    }
    fetchEntity(id:ActorUniqueID):Actor
    {
        throw 'abstract';
    }
}
Level.prototype.createDimension = makefunc.js(proc["Level::createDimension"], Dimension, Level, false, RawTypeId.Int32);

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

// Actor* Level::fetchEntity(ActorUniqueID id) noexcept
// {
// 	// 3rd bool: return null if not loaded?
// 	return g_mcf.Level$fetchEntity(this, id, true);
// }
