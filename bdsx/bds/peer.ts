import { VoidPointer } from "bdsx/core";
import { SharedPtr } from "bdsx/sharedpointer";
import { NativeClass } from "bdsx/nativeclass";
import { RakNet } from "./raknet";
import { BinaryStream } from "./stream";
import { abstract } from "bdsx/common";
import { CxxStringStructure } from "bdsx/pointer";


export class RaknetNetworkPeer extends NativeClass
{
	vftable:VoidPointer;
	u1:VoidPointer; // null
	u2:VoidPointer; // null
	peer:RakNet.RakPeer;
    addr:RakNet.AddressOrGUID;
}
RaknetNetworkPeer.abstract({
    vftable:VoidPointer,
    u1:VoidPointer,
    u2:VoidPointer,
    peer:RakNet.RakPeer.ref(),
    addr:RakNet.AddressOrGUID
});

export class EncryptedNetworkPeer extends NativeClass
{
    peer:SharedPtr<RaknetNetworkPeer>;
}
EncryptedNetworkPeer.abstract({
    peer:SharedPtr,
});

export class CompressedNetworkPeer extends NativeClass
{
	peer:EncryptedNetworkPeer;
}
CompressedNetworkPeer.abstract({
    peer:[EncryptedNetworkPeer.ref(), 0x48]
});

export class BatchedNetworkPeer extends NativeClass
{
	vftable:VoidPointer;
	peer:CompressedNetworkPeer;
	stream:BinaryStream;

	sendPacket(data:CxxStringStructure, reliability:number, n:number, n2:number, compressibility:number):void
	{
		abstract();
	}
}
BatchedNetworkPeer.abstract({
	vftable:VoidPointer,
	peer:CompressedNetworkPeer.ref(),
	stream:BinaryStream,
});
