import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";

events.packetRaw(MinecraftPacketIds.ClientCacheBlobStatus).on((ptr, size, netId) => {
    if(ptr.readVarUint() > 0xff || ptr.readVarUint() > 0xff) {
        console.log("DOS detected from " + netId);
        netId.getActor()?.sendMessage("DOS (ClientCacheBlobStatus) detected");
        return CANCEL;
    }
});
