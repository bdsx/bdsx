import { abstract } from "../common";
import { VoidPointer } from "../core";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { CxxString } from "../nativetype";
import { CxxSharedPtr } from "../sharedpointer";
import { RakNet } from "./raknet";
import { BinaryStream } from "./stream";

@nativeClass(null)
export class RaknetNetworkPeer extends AbstractClass {
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
export class EncryptedNetworkPeer extends AbstractClass {
    @nativeField(CxxSharedPtr.make(RaknetNetworkPeer))
    peer:CxxSharedPtr<RaknetNetworkPeer>;
}

@nativeClass(null)
export class CompressedNetworkPeer extends AbstractClass {
    @nativeField(EncryptedNetworkPeer.ref(), 0x48)
    peer:EncryptedNetworkPeer;
}

@nativeClass(null)
export class BatchedNetworkPeer extends AbstractClass {
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
