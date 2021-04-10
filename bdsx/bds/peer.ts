import { abstract } from "bdsx/common";
import { VoidPointer } from "bdsx/core";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { SharedPtr } from "bdsx/sharedpointer";
import { CxxString } from "../nativetype";
import { RakNet } from "./raknet";
import { BinaryStream } from "./stream";

@nativeClass(null)
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

@nativeClass(null)
export class EncryptedNetworkPeer extends NativeClass {
    @nativeField(SharedPtr.make(RaknetNetworkPeer))
    peer:SharedPtr<RaknetNetworkPeer>;
}

@nativeClass(null)
export class CompressedNetworkPeer extends NativeClass {
    @nativeField(EncryptedNetworkPeer.ref(), 0x48)
    peer:EncryptedNetworkPeer;
}

@nativeClass(null)
export class BatchedNetworkPeer extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(CompressedNetworkPeer.ref())
    peer:CompressedNetworkPeer;
    @nativeField(BinaryStream)
    stream:BinaryStream;

    sendPacket(data:CxxString, reliability:number, n:number, n2:number, compressibility:number):void {
        abstract();
    }
}
