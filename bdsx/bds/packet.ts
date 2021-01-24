import { abstract, RawTypeId } from "bdsx/common";
import { int32_t, NativeType, uint32_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { MantleClass, NativeClass } from "bdsx/nativeclass";
import { MinecraftPacketIds } from "./packetids";
import { BinaryStream } from "./stream";
import { SharedPointer, SharedPtr } from "bdsx/sharedpointer";
import { cgate, makefunc } from "bdsx/core";
import { proc } from "./proc";
import { NetworkIdentifier } from "./networkidentifier";

// export interface PacketType<T> extends StructureType<T>
// {
//     readonly ID:number;
// }

export const PacketReadResult = uint32_t.extends({
	PacketReadNoError: 0,
	PacketReadError: 1,
});
export type PacketReadResult = uint32_t;


export const StreamReadResult = int32_t.extends({
	Disconnect: 0,
	Pass: 1,
	Warning: 2, // disconnect at 3 times
	Ignore: 0x7f,
});
export type StreamReadResult = int32_t;

export class ExtendedStreamReadResult extends NativeClass
{
	streamReadResult:StreamReadResult;
	dummy:int32_t;
	// array?
};
ExtendedStreamReadResult.abstract({
	streamReadResult:StreamReadResult,
	dummy:int32_t,
	// array?
});

const sharedptr_of_packet = Symbol('sharedptr');

export class Packet extends MantleClass
{
    static ID:number;
    [sharedptr_of_packet]?:SharedPtr<any>|null;

    /**
     * @deprecated use packet.destruct();
     */
    destructor():void {
        abstract();
    }
    getId():MinecraftPacketIds {
        abstract();
    }
    getName(name:CxxStringWrapper):void {
        abstract();
    }
    write(stream:BinaryStream):void {
        abstract();
    }
    read(stream:BinaryStream):PacketReadResult {
        abstract();
    }
    readExtended(read:ExtendedStreamReadResult, stream:BinaryStream):ExtendedStreamReadResult {
        abstract();
    }
    sendTo(target:NetworkIdentifier, unknownarg:number)
    {
        abstract();
    }
    dispose():void
    {
        this[sharedptr_of_packet]!.dispose();
        this[sharedptr_of_packet] = null;
    }

    static create<T extends Packet>(this:{new():T, ID:number, ref():any}):T
    {
        const id = this.ID;
        if (id === undefined) throw Error('Packet class is abstract, please use named class instead (ex. LoginPacket)');
        const cls = SharedPtr.make(this);
        const sharedptr = new cls(true);
        sharedptr[NativeType.ctor]();
        
        createPacketRaw(sharedptr, id);
        
        const packet = sharedptr.p as T;
        packet[sharedptr_of_packet] = sharedptr;
        return packet;
    }
}

export const PacketSharedPtr = SharedPtr.make(Packet);
export type PacketSharedPtr = SharedPtr<Packet>;

/**
 * @deprecated use *Packet.create() instead
 */
export function createPacket(packetId:MinecraftPacketIds):SharedPointer
{
    const p = new PacketSharedPtr(true);
    createPacketRaw(p, packetId);
    return new SharedPointer(p);
}

export const createPacketRaw = makefunc.js(proc["MinecraftPackets::createPacket"], PacketSharedPtr, null, PacketSharedPtr, RawTypeId.Int32);
