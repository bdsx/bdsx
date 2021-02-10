
// Transfer Server
import { TransferPacket } from "bdsx/bds/packets";
import { NetworkIdentifier } from "bdsx/native";

export function transferServer(networkIdentifier:NetworkIdentifier, address:string, port:number):void {
    const transferPacket = TransferPacket.create();
    transferPacket.address = address;
    transferPacket.port = port;
    transferPacket.sendTo(networkIdentifier);
    transferPacket.dispose();
}
