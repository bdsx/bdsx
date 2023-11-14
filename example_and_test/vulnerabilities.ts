import { NetworkConnection, NetworkSystem } from "bdsx/bds/networkidentifier";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { events } from "bdsx/event";
import { int32_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { procHacker } from "bdsx/prochacker";

// https://github.com/nt1dr/CVE-2021-45383 (Removed)

events.packetRaw(MinecraftPacketIds.ClientCacheBlobStatus).on((ptr, size, netId) => {
    if (ptr.readVarUint() >= 0xfff || ptr.readVarUint() >= 0xfff) {
        console.log("DOS detected from " + netId);
        netId.getActor()?.sendMessage("DOS (ClientCacheBlobStatus) detected");
        return CANCEL;
    }
});

events.packetBefore(MinecraftPacketIds.Disconnect).on((ptr, ni) => {
    if (ni.getActor() == null) return CANCEL;
});

// https://github.com/LuckyDogDog/CVE-2022-23884

// WARN - this hooking code is pretty heavy because it hooks entire packets.
// const Warns: Record<string, number> = {};
// const receivePacket = procHacker.hooking(
//     // XXX: hooking point removed
//     "?receivePacket@NetworkConnection@@QEAA?AW4DataStatus@NetworkPeer@@AEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEAVNetworkSystem@@AEBV?$shared_ptr@V?$time_point@Usteady_clock@chrono@std@@V?$duration@_JU?$ratio@$00$0DLJKMKAA@@std@@@23@@chrono@std@@@5@@Z",
//     int32_t, // DataStatus
//     null,
//     NetworkConnection,
//     CxxStringWrapper,
//     NetworkSystem,
//     VoidPointer, // std::shared_ptr<std::chrono::time_point>
// )((conn, data, networkSystem, time_point) => {
//     const address = conn.networkIdentifier.getAddress();
//     const id = data.valueptr.getUint8();
//     if (Warns[address] > 1 || id === MinecraftPacketIds.PurchaseReceipt) {
//         conn.disconnect();
//         return 1;
//     }
//     if (id === 0) {
//         Warns[address] = Warns[address] ? Warns[address] + 1 : 1;
//     }
//     return receivePacket(conn, data, networkSystem, time_point);
// });
// events.networkDisconnected.on(ni => {
//     Warns[ni.getAddress()] = 0;
// });
