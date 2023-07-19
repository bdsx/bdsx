import { asmcode } from "../asm/asmcode";
import { Register } from "../assembler";
import { Bedrock } from "../bds/bedrock";
import { NetworkConnection, NetworkIdentifier, NetworkSystem } from "../bds/networkidentifier";
import { Packet, PacketSharedPtr, createPacketRaw } from "../bds/packet";
import { MinecraftPacketIds } from "../bds/packetids";
import { PacketIdToType } from "../bds/packets";
import { proc } from "../bds/symbols";
import { CANCEL, abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { decay } from "../decay";
import { events } from "../event";
import { bedrockServer } from "../launcher";
import { makefunc } from "../makefunc";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { int32_t, int64_as_float_t, void_t } from "../nativetype";
import { nethook } from "../nethook";
import { CxxStringWrapper } from "../pointer";
import { procHacker } from "../prochacker";
import { CxxSharedPtr } from "../sharedpointer";
import { remapAndPrintError } from "../source-map-support";

@nativeClass(null)
class ReadOnlyBinaryStream extends AbstractClass {
    @nativeField(CxxStringWrapper.ref(), 0x38)
    data: CxxStringWrapper;

    read(dest: VoidPointer, size: number): Bedrock.VoidErrorCodeResult {
        abstract();
    }
}

ReadOnlyBinaryStream.prototype.read = procHacker.jsv(
    "??_7ReadOnlyBinaryStream@@6B@",
    "?read@ReadOnlyBinaryStream@@EEAA?AV?$Result@XVerror_code@std@@@Bedrock@@PEAX_K@Z",
    Bedrock.VoidErrorCodeResult,
    { this: ReadOnlyBinaryStream },
    VoidPointer,
    int64_as_float_t,
);

@nativeClass(null)
class OnPacketRBP extends AbstractClass {
    // NetworkSystem::_sortAndPacketizeEvents before MinecraftPackets::createPacket
    @nativeField(int32_t, 0xd0)
    packetId: MinecraftPacketIds;
    // NetworkSystem::_sortAndPacketizeEvents before MinecraftPackets::createPacket
    @nativeField(CxxSharedPtr.make(Packet), 0xe0)
    packet: CxxSharedPtr<Packet>; // NetworkSystem::_sortAndPacketizeEvents before MinecraftPackets::createPacket
    @nativeField(ReadOnlyBinaryStream, 0x140)
    stream: ReadOnlyBinaryStream; // after NetworkConnection::receivePacket
}

asmcode.createPacketRaw = proc["?createPacket@MinecraftPackets@@SA?AV?$shared_ptr@VPacket@@@std@@W4MinecraftPacketIds@@@Z"];
function onPacketRaw(rbp: OnPacketRBP, conn: NetworkConnection): PacketSharedPtr | null {
    const packetId = rbp.packetId;
    try {
        const target = events.packetRaw(packetId);
        const ni = conn.networkIdentifier;
        nethook.lastSender = ni;
        if (target !== null && !target.isEmpty()) {
            const s = rbp.stream;
            const data = s.data;
            const rawpacketptr = data.valueptr;

            for (const listener of target.allListeners()) {
                const ptr = rawpacketptr.add();
                try {
                    if (listener(ptr, data.length, ni, packetId) === CANCEL) {
                        return null;
                    }
                } catch (err) {
                    events.errorFire(err);
                } finally {
                    decay(ptr);
                }
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return createPacketRaw(rbp.packet, packetId);
}
const packetizeSymbol =
    "?_sortAndPacketizeEvents@NetworkSystem@@AEAA_NAEAVNetworkConnection@@V?$time_point@Usteady_clock@chrono@std@@V?$duration@_JU?$ratio@$00$0DLJKMKAA@@std@@@23@@chrono@std@@@Z";
const packetBeforeSkipAddress = proc[packetizeSymbol].add(0xb81);
function onPacketBefore(rbp: OnPacketRBP, returnAddressInStack: StaticPointer): void {
    try {
        const packet = rbp.packet.p!;
        const packetId = packet.getId();
        const target = events.packetBefore(packetId);
        if (target !== null && !target.isEmpty()) {
            const ni = nethook.lastSender;
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            returnAddressInStack.setPointer(packetBeforeSkipAddress);
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(typedPacket);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketAfter(packet: Packet, ni: NetworkIdentifier): void {
    try {
        const packetId = packet.getId();
        const target = events.packetAfter(packetId);
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            break;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(typedPacket);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketSend(_: void, ni: NetworkIdentifier, packet: Packet): number {
    try {
        const packetId = packet.getId();
        const target = events.packetSend(packetId);
        if (target !== null && !target.isEmpty()) {
            const TypedPacket = PacketIdToType[packetId] || Packet;
            const typedPacket = packet.as(TypedPacket);
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(typedPacket, ni, packetId) === CANCEL) {
                            return 1;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(typedPacket);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return 0;
}
function onPacketSendInternal(handler: NetworkSystem, ni: NetworkIdentifier, packet: Packet, data: CxxStringWrapper): number {
    try {
        const packetId = packet.getId();
        const target = events.packetSendRaw(packetId);
        if (target !== null && !target.isEmpty()) {
            const dataptr = data.valueptr;
            try {
                for (const listener of target.allListeners()) {
                    try {
                        if (listener(dataptr, data.length, ni, packetId) === CANCEL) {
                            return 1;
                        }
                    } catch (err) {
                        events.errorFire(err);
                    }
                }
            } finally {
                decay(dataptr);
            }
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return 0;
}

bedrockServer.withLoading().then(() => {
    const packetHandleSymbol = "?handle@Packet@@QEAAXAEBVNetworkIdentifier@@AEAVNetEventCallback@@AEAV?$shared_ptr@VPacket@@@std@@@Z";
    const sendToMultipleSymbol =
        "?sendToMultiple@NetworkSystem@@QEAAXAEBV?$vector@UNetworkIdentifierWithSubId@@V?$allocator@UNetworkIdentifierWithSubId@@@std@@@std@@AEBVPacket@@@Z";

    // hook raw
    asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, NetworkConnection);
    procHacker.patching(
        "hook-packet-raw",
        packetizeSymbol,
        0x2d7,
        asmcode.packetRawHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            0x8B, 0x95, 0xD0, 0x00, 0x00, 0x00,        // mov edx,dword ptr ss:[rbp+D0]
            0x48, 0x8D, 0x8D, 0xE0, 0x00, 0x00, 0x00,  // lea rcx,qword ptr ss:[rbp+E0]
            0xE8, 0x97, 0xB5, 0xFD, 0xFF,              // call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::cr
            0x90,                                      // nop
        ],
    );

    // hook before
    asmcode.onPacketBefore = makefunc.np(onPacketBefore, void_t, { name: "onPacketBefore" }, OnPacketRBP, StaticPointer);

    asmcode.packetBeforeOriginal = proc["<lambda_c83367d0c95377dd35c344f9645f0e54>::operator()"];
    procHacker.patching(
        "hook-packet-before",
        packetizeSymbol,
        0x377,
        asmcode.packetBeforeHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            0x48, 0x8D, 0x95, 0x90, 0x01, 0x00, 0x00,  // lea rdx,qword ptr ss:[rbp+190]
            0x48, 0x8D, 0x4D, 0xE8,                    // lea rcx,qword ptr ss:[rbp-18]
            0xE8, 0x19, 0xF0, 0xFF, 0xFF,              // call <bedrock_server.<lambda_c83367d0c95377dd35c344f9645f0e54>::operator()>
            0x90,                                      // nop
        ],
    );

    // hook after
    asmcode.onPacketAfter = makefunc.np(onPacketAfter, void_t, null, Packet, NetworkIdentifier);
    asmcode.handlePacket = proc[packetHandleSymbol];
    procHacker.patching(
        "hook-packet-after",
        packetizeSymbol,
        0x64f,
        asmcode.packetAfterHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            0x4D, 0x8B, 0xC6,                          // mov r8,r14
            0x49, 0x8B, 0xD5,                          // mov rdx,r13
            0x48, 0x8B, 0x8D, 0xE0, 0x00, 0x00, 0x00,  // mov rcx,qword ptr ss:[rbp+E0]
            0xE8, null, null, null, null,              // call <bedrock_server.public: void __cdecl Packet::handle(class NetworkIdentifier const &, class NetEventCallback &, class std::shared_ptr<class Packet> &)>
        ],
    );

    // hook send
    asmcode.onPacketSend = makefunc.np(onPacketSend, int32_t, null, void_t, NetworkIdentifier, Packet);
    asmcode.sendOriginal = procHacker.hookingRaw("?send@NetworkSystem@@QEAAXAEBVNetworkIdentifier@@AEBVPacket@@W4SubClientId@@@Z", asmcode.packetSendHook);

    // hook send all
    const sendToMultiple = proc[sendToMultipleSymbol];
    asmcode.packetSendAllCancelPoint = sendToMultiple.add(0x148);
    asmcode.packetSendAllJumpPoint = sendToMultiple.add(0x4c);
    procHacker.patching(
        "hook-packet-send-all",
        sendToMultipleSymbol,
        0x37,
        asmcode.packetSendAllHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            // loop begin point
            0x4d, 0x85, 0xf6, // test r14,r14
            0x74, 0x10, // je bedrock_server.7FF79D03C94C
            0x41, 0x0f, 0xb6,
            0x86, 0xa0, 0x00, 0x00, 0x00, // movzx eax,byte ptr ds:[r14+A0]
        ],
    );

    // hook send raw
    asmcode.onPacketSendInternal = makefunc.np(onPacketSendInternal, int32_t, null, NetworkSystem, NetworkIdentifier, Packet, CxxStringWrapper);
    asmcode.sendInternalOriginal = procHacker.hookingRaw(
        "?_sendInternal@NetworkSystem@@AEAAXAEBVNetworkIdentifier@@AEBVPacket@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
        asmcode.packetSendInternalHook,
    );
});
