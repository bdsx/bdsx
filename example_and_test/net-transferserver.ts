
// Transfer Server
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { TransferPacket } from "bdsx/bds/packets";
import { command } from "bdsx/command";
import { CxxString, int32_t } from "bdsx/nativetype";

command.register('transferserver', "Transfer servers").overload((params, origin, output) => {
    const actor = origin.getEntity();
    if (actor?.isPlayer()) actor.transferServer(params.address, params.port);
}, {
    address: CxxString,
    port: int32_t,
});

export function transferServer(networkIdentifier:NetworkIdentifier, address:string, port:number):void {
    const transferPacket = TransferPacket.allocate();
    transferPacket.address = address;
    transferPacket.port = port;
    transferPacket.sendTo(networkIdentifier);
    transferPacket.dispose();
}
