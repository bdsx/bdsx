import { abstract } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { Actor } from "./actor";
import { NetworkIdentifier } from "./networkidentifier";

export class Player extends Actor
{
}

export class ServerPlayer extends Player
{
	networkIdentifier:NetworkIdentifier;
	// OFFSETFIELD(NetworkIdentifier, networkIdentifier, 0xB50);

	sendNetworkPacket(packet:VoidPointer):void
	{
		abstract();
	}
}
