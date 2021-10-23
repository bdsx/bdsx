/**
 * This example is just skip half of movement packets.
 *
 * CAUTION: this example is only works for two players. need to implement it more
 */

import { CANCEL } from "bdsx/common";
import { MinecraftPacketIds, NetworkIdentifier } from "bdsx/minecraft";
import { bdsx } from "bdsx/v3";


interface Counter {
    counter:number;
}
const map = new WeakMap<NetworkIdentifier, Counter>();
bdsx.events.packetSendRaw(MinecraftPacketIds.MovePlayer).on((packet, size, ni)=>{
    let field = map.get(ni);
    if (field == null) map.set(ni, field = {counter: 0});

    field.counter++;
    if (field.counter >= 2) {
        field.counter = 0;
        return CANCEL;
    }
});
