import { abstract } from "bdsx/common";
import { Actor } from "./actor";
import { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";

export class Player extends Actor {
}

export class ServerPlayer extends Player {
    networkIdentifier:NetworkIdentifier;

    sendNetworkPacket(packet:Packet):void {
        abstract();
    }
}
