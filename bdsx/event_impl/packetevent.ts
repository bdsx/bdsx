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
    @nativeField(int32_t, 0xb0)
    packetId: MinecraftPacketIds;
    // NetworkSystem::_sortAndPacketizeEvents before MinecraftPackets::createPacket
    @nativeField(CxxSharedPtr.make(Packet), 0xc0)
    packet: CxxSharedPtr<Packet>; // NetworkSystem::_sortAndPacketizeEvents before MinecraftPackets::createPacket
    @nativeField(ReadOnlyBinaryStream, 0x110)
    stream: ReadOnlyBinaryStream; // after NetworkConnection::receivePacket
}

asmcode.createPacketRaw = proc["?createPacket@MinecraftPackets@@SA?AV?$shared_ptr@VPacket@@@std@@W4MinecraftPacketIds@@@Z"];
function onPacketRaw(rbp: OnPacketRBP, conn: NetworkConnection): PacketSharedPtr | null {
    const packetId = rbp.packetId;
    try {
        const target = events.packetRaw(packetId);
        if (target === null || target.isEmpty()) throw Error("no listener but onPacketRaw fired.");
        const ni = conn.networkIdentifier;
        nethook.lastSender = ni;
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
    } catch (err) {
        remapAndPrintError(err);
    }
    return createPacketRaw(rbp.packet, packetId);
}
const packetizeSymbol =
    "?_sortAndPacketizeEvents@NetworkSystem@@AEAA_NAEAVNetworkConnection@@V?$time_point@Usteady_clock@chrono@std@@V?$duration@_JU?$ratio@$00$0DLJKMKAA@@std@@@23@@chrono@std@@@Z";
const packetBeforeSkipAddress = proc[packetizeSymbol].add(0x7bc); // after of packetAfter
function onPacketBefore(rbp: OnPacketRBP, returnAddressInStack: StaticPointer, packetId: MinecraftPacketIds, conn: NetworkConnection): void {
    try {
        const target = events.packetBefore(packetId);
        if (target === null || target.isEmpty()) throw Error("no listener but onPacketBefore fired.");

        const ni = conn.networkIdentifier;
        const TypedPacket = PacketIdToType[packetId] || Packet;
        const packet = rbp.packet.p!;
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
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketAfter(packet: Packet, ni: NetworkIdentifier, packetId: MinecraftPacketIds): void {
    try {
        const target = events.packetAfter(packetId);
        if (target === null || target.isEmpty()) throw Error("no listener but onPacketAfter fired.");
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
    } catch (err) {
        remapAndPrintError(err);
    }
}
function onPacketSend(packetId: MinecraftPacketIds, ni: NetworkIdentifier, packet: Packet): number {
    try {
        const target = events.packetSend(packetId);
        if (target === null || target.isEmpty()) throw Error("no listener but onPacketSend fired.");
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
    } catch (err) {
        remapAndPrintError(err);
    }
    return 0;
}
function onPacketSendInternal(handler: NetworkSystem, ni: NetworkIdentifier, packet: Packet, data: CxxStringWrapper): number {
    try {
        const packetId = packet.getId();
        const target = events.packetSendRaw(packetId);
        if (target === null || target.isEmpty()) throw Error("no listener but onPacketSend fired.");
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
    } catch (err) {
        remapAndPrintError(err);
    }
    return 0;
}

bedrockServer.withLoading().then(() => {
    const packetHandleSymbol = "?handle@Packet@@QEAAXAEBVNetworkIdentifier@@AEAVNetEventCallback@@AEAV?$shared_ptr@VPacket@@@std@@@Z";
    const sendToClientsSymbol =
        "?sendToClients@LoopbackPacketSender@@UEAAXAEBV?$vector@UNetworkIdentifierWithSubId@@V?$allocator@UNetworkIdentifierWithSubId@@@std@@@std@@AEBVPacket@@@Z";

    // hook raw
    asmcode.onPacketRaw = makefunc.np(onPacketRaw, PacketSharedPtr, null, OnPacketRBP, NetworkConnection);
    procHacker.patching(
        "hook-packet-raw",
        packetizeSymbol,
        0x2e2,
        asmcode.packetRawHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            0x8B, 0x95, 0xb0, 0x00, 0x00, 0x00,        // mov edx,dword ptr ss:[rbp+b0]
            0x48, 0x8D, 0x8D, 0xc0, 0x00, 0x00, 0x00,  // lea rcx,qword ptr ss:[rbp+c0]
            0xE8, null, null, null, null,              // call <bedrock_server.public: static class std::shared_ptr<class Packet> __cdecl MinecraftPackets::cr
            0x90,                                      // nop
        ],
    );

    // hook before
    asmcode.onPacketBefore = makefunc.np(onPacketBefore, void_t, { name: "onPacketBefore" }, OnPacketRBP, StaticPointer, int32_t, NetworkConnection);

    asmcode.packetBeforeOriginal = proc["<lambda_41073b6dae650857de18b10278b5571c>::operator()"];
    procHacker.patching(
        "hook-packet-before",
        packetizeSymbol,
        0x382,
        asmcode.packetBeforeHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            0x48, 0x8D, 0x95, 0x50, 0x01, 0x00, 0x00,  // lea rdx,qword ptr ss:[rbp+150]
            0x48, 0x8D, 0x4D, 0xf0,                    // lea rcx,qword ptr ss:[rbp-10]
            0xE8, null, null, null, null,              // call <bedrock_server.<lambda_41073b6dae650857de18b10278b5571c>::operator()>
            0x90,                                      // nop
        ],
    );

    // hook after
    asmcode.onPacketAfter = makefunc.np(onPacketAfter, void_t, null, Packet, NetworkIdentifier, int32_t);
    asmcode.handlePacket = proc[packetHandleSymbol];
    asmcode.__guard_dispatch_icall_fptr = proc["__guard_dispatch_icall_fptr"].getPointer();

    procHacker.patching(
        "hook-packet-after",
        packetizeSymbol,
        0x760,
        asmcode.packetAfterHook, // original code depended
        Register.rdx,
        true,
        // prettier-ignore
        [
            0x4D, 0x8B, 0xC6,                          // mov r8,r14
            0x49, 0x8B, 0xD7,                          // mov rdx,r15
            0x48, 0x8B, 0x40, 0x08,                    // mov rax,qword ptr ds:[rax+8]
            0xFF, 0x15, null, null, null, null,        // call qword ptr ds:[<__guard_dispatch_icall_fptr>]
        ],
    );

    // hook send
    asmcode.onPacketSend = makefunc.np(onPacketSend, int32_t, null, int32_t, NetworkIdentifier, Packet);
    asmcode.sendOriginal = procHacker.hookingRaw("?send@NetworkSystem@@QEAAXAEBVNetworkIdentifier@@AEBVPacket@@W4SubClientId@@@Z", asmcode.packetSendHook);

    asmcode.packetSendAllCancelPoint = proc[sendToClientsSymbol].add(0xd6); // jump to after NetworkSystem::_sendInternal

    // hook send all
    procHacker.patching(
        "hook-packet-send-all",
        sendToClientsSymbol,
        0xa9,
        asmcode.packetSendAllHook, // original code depended
        Register.rax,
        true,
        // prettier-ignore
        [
            0x49, 0x8B, 0x07,                           // mov rax,qword ptr ds:[r15]
            0x48, 0x8D, 0x95, 0x00, 0x02, 0x00, 0x00,   // lea rdx,qword ptr ds:[rbp+200]
            0x49, 0x8B, 0xCF,                           // mov rcx,r15
            0x48, 0x8B, 0x40, 0x18,                     // mov rax,qword ptr ds:[rax+18]
            0xFF, 0x15, null, null, null, null,         // call qword ptr ds:[<__guard_dispatch_icall_fptr>]
            // CAUTION: jump target after this
        ],
    );

    // hook send raw
    asmcode.onPacketSendInternal = makefunc.np(onPacketSendInternal, int32_t, null, NetworkSystem, NetworkIdentifier, Packet, CxxStringWrapper);
    asmcode.sendInternalOriginal = procHacker.hookingRaw(
        "?_sendInternal@NetworkSystem@@AEAAXAEBVNetworkIdentifier@@AEBVPacket@@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z",
        asmcode.packetSendInternalHook,
    );
});
