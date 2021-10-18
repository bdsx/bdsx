import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { SharedPtr } from "../sharedpointer";
import { CxxString } from "../nativetype";
import { RakNet } from "./raknet";
import { BinaryStream } from "./stream";
export declare class RaknetNetworkPeer extends NativeClass {
    vftable: VoidPointer;
    u1: VoidPointer;
    u2: VoidPointer;
    peer: RakNet.RakPeer;
    addr: RakNet.AddressOrGUID;
}
export declare class EncryptedNetworkPeer extends NativeClass {
    peer: SharedPtr<RaknetNetworkPeer>;
}
export declare class CompressedNetworkPeer extends NativeClass {
    peer: EncryptedNetworkPeer;
}
export declare class BatchedNetworkPeer extends NativeClass {
    vftable: VoidPointer;
    peer: CompressedNetworkPeer;
    stream: BinaryStream;
    sendPacket(data: CxxString, reliability: number, n: number, n2: number, compressibility: number): void;
}
