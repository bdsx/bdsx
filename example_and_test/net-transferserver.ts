
// Transfer Server
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { TransferPacket } from "bdsx/bds/packets";

export function transferServer(networkIdentifier:NetworkIdentifier, address:string, port:number):void {
    const transferPacket = TransferPacket.create();
    transferPacket.address = address;
    transferPacket.port = port;
    transferPacket.sendTo(networkIdentifier);
    transferPacket.dispose();
}
