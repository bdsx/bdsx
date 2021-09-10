import { abstract } from "../common";
import { MantleClass, nativeClass, NativeClass, nativeField } from "../nativeclass";
import { CxxString, int32_t, Type, uint32_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { NetworkIdentifier } from "./networkidentifier";
import { MinecraftPacketIds } from "./packetids";
import { procHacker } from "./proc";
import { BinaryStream } from "./stream";
import minecraft = require('../minecraft');

/** @deprecated */
export const PacketReadResult = uint32_t.extends({
    PacketReadNoError: 0,
    PacketReadError: 1,
});
/** @deprecated */
export type PacketReadResult = uint32_t;


/** @deprecated */
export const StreamReadResult = int32_t.extends({
    Disconnect: 0,
    Pass: 1,
    Warning: 2, // disconnect at 3 times
    Ignore: 0x7f,
});
/** @deprecated */
export type StreamReadResult = int32_t;

/** @deprecated */
@nativeClass(null)
export class ExtendedStreamReadResult extends NativeClass {
    @nativeField(StreamReadResult)
	streamReadResult:StreamReadResult;
    @nativeField(int32_t)
	dummy:int32_t;
	// array?
}

const sharedptr_of_packet = Symbol('sharedptr');

/** @deprecated */
@nativeClass(0x30)
export class Packet extends MantleClass {
    static ID:number;
    [sharedptr_of_packet]?:SharedPtr<any>|null;

    getId():MinecraftPacketIds {
        abstract();
    }
    getName():CxxString {
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

    /**
     * same with target.send
     */
    sendTo(target:NetworkIdentifier, unknownarg?:number):void {
        abstract();
    }
    dispose():void {
        this[sharedptr_of_packet]!.dispose();
        this[sharedptr_of_packet] = null;
    }

    static create<T extends Packet>(this:Type<T>&{ID:number}):T {
        const id = this.ID;
        if (id === undefined) throw Error('Packet class is abstract, please use named class instead (ex. LoginPacket)');
        const cls = SharedPtr.make(this);
        const sharedptr = new cls(true);
        createPacketRaw(sharedptr, id);

        const packet = sharedptr.p as T;
        if (packet === null) throw Error(`${this.name} is not created`);
        packet[sharedptr_of_packet] = sharedptr;
        return packet;
    }
}


/** @deprecated */
export const PacketSharedPtr = SharedPtr.make(Packet);
/** @deprecated */
export type PacketSharedPtr = SharedPtr<Packet>;

/** @deprecated */
export const createPacketRaw = procHacker.js("MinecraftPackets::createPacket", PacketSharedPtr, null, PacketSharedPtr, int32_t);
