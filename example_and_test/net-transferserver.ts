
// Transfer Server

import { NetworkIdentifier, TransferPacket } from "bdsx/minecraft";

export function transferServer(networkIdentifier:NetworkIdentifier, address:string, port:number):void {
    const transferPacket = TransferPacket.create();
    transferPacket.address = address;
    transferPacket.port = port;
    transferPacket.sendTo(networkIdentifier);
    transferPacket.dispose();
}
