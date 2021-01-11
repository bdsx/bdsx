import { RawTypeId } from "bdsx/common";
import { makefunc, VoidPointer } from "bdsx/core";
import { Actor } from "./actor";
import { NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { proc } from "./proc";

export class Player extends Actor
{
}

export class ServerPlayer extends Player
{
	networkIdentifier:NetworkIdentifier;
	// OFFSETFIELD(NetworkIdentifier, networkIdentifier, 0xB50);

	sendNetworkPacket(packet:VoidPointer):void
	{
		throw 'abstract';
	}
}
ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, Actor.OFFSET_OF_NI]
});
ServerPlayer.prototype.sendNetworkPacket = makefunc.js(proc["ServerPlayer::sendNetworkPacket"], RawTypeId.Void, ServerPlayer, false, VoidPointer);
