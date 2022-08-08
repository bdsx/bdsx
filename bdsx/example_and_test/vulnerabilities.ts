import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";

// https://github.com/nt1dr/CVE-2021-45383

events.packetRaw(MinecraftPacketIds.ClientCacheBlobStatus).on((ptr, size, netId) => {
    if(ptr.readVarUint() >= 0xfff || ptr.readVarUint() >= 0xfff) {
        console.log("DOS detected from " + netId);
        netId.getActor()?.sendMessage("DOS (ClientCacheBlobStatus) detected");
        return CANCEL;
    }
});

events.packetBefore(MinecraftPacketIds.Disconnect).on((ptr, ni)=>{
    if (ni.getActor() == null) return CANCEL;
});
