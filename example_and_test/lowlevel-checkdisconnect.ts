import { NetworkIdentifier, ServerNetworkHandler } from "bdsx/bds/networkidentifier";
import { pdb, VoidPointer } from "bdsx/core";
import { void_t } from "bdsx/nativetype";
import { ProcHacker } from "bdsx/prochacker";

const procHacker = ProcHacker.load("../pdbcache_by_example.ini", ["?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVDisconnectPacket@@@Z"]);
pdb.close();

const original = procHacker.hooking("?handle@ServerNetworkHandler@@UEAAXAEBVNetworkIdentifier@@AEBVDisconnectPacket@@@Z", void_t, null, ServerNetworkHandler, NetworkIdentifier, VoidPointer)(function(networkHandler, netId, pkt) {
    if(!networkHandler._getServerPlayer(netId, 0)) return;
    return original(networkHandler, netId, pkt);
});
