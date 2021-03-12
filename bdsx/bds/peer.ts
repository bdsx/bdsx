import { VoidPointer } from "bdsx/core";
import { SharedPtr } from "bdsx/sharedpointer";
import { defineNative, NativeClass, nativeField } from "bdsx/nativeclass";
import { RakNet } from "./raknet";
import { BinaryStream } from "./stream";
import { abstract } from "bdsx/common";
import { CxxStringWrapper } from "bdsx/pointer";

@defineNative(null)
export class RaknetNetworkPeer extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(VoidPointer)
    u1:VoidPointer; // null
    @nativeField(VoidPointer)
    u2:VoidPointer; // null
    @nativeField(RakNet.RakPeer.ref())
    peer:RakNet.RakPeer;
    @nativeField(RakNet.AddressOrGUID)
    addr:RakNet.AddressOrGUID;
}

@defineNative(null)
export class EncryptedNetworkPeer extends NativeClass {
    @nativeField(SharedPtr.make(RaknetNetworkPeer))
    peer:SharedPtr<RaknetNetworkPeer>;
}

@defineNative(null)
export class CompressedNetworkPeer extends NativeClass {
    @nativeField(EncryptedNetworkPeer.ref(), 0x48)
    peer:EncryptedNetworkPeer;
}

@defineNative(null)
export class BatchedNetworkPeer extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(CompressedNetworkPeer.ref())
    peer:CompressedNetworkPeer;
    @nativeField(BinaryStream)
    stream:BinaryStream;

    sendPacket(data:CxxStringWrapper, reliability:number, n:number, n2:number, compressibility:number):void {
        abstract();
    }
}
