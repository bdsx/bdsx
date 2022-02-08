import { ServerNetworkHandler, NetworkIdentifier } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { pdb, VoidPointer } from "bdsx/core";
import { events } from "bdsx/event";
import { void_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";

// CVE-2021-45383
events.packetRaw(MinecraftPacketIds.ClientCacheBlobStatus).on((ptr, size, netId) => {
    if(ptr.readVarUint() > 0xff || ptr.readVarUint() > 0xff) {
        console.log("DOS detected from " + netId);
        netId.getActor()?.sendMessage("DOS (ClientCacheBlobStatus) detected");
        return CANCEL;
    }
});

// CVE-2021-45384
const procHacker = ProcHacker.load("../pdbcache_by_example.ini", ["?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVDisconnectPacket@@@Z"]);
pdb.close();

const original = procHacker.hooking("?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVDisconnectPacket@@@Z", void_t, null, ServerNetworkHandler, NetworkIdentifier, VoidPointer)(function(networkHandler, netId, pkt) {
    if(!networkHandler._getServerPlayer(netId, 0)) return;
    return original(networkHandler, netId, pkt);
});
