import { networkHandler, NetworkIdentifier } from "./bds/networkidentifier";
import { createPacketRaw, Packet, PacketSharedPtr } from "./bds/packet";
import { CxxStringWrapper } from "./pointer";
import { AbstractWriter } from "./writer/abstractstream";

export class RawPacket extends AbstractWriter {
    private readonly data = new CxxStringWrapper(true);
    private readonly sharedptr = new PacketSharedPtr(true);
    private packet:Packet|null = null;
    private packetId = 0;

    constructor(packetId?:number){
        super();
        this.data.construct();

        if (packetId != null) {
            this.reset(packetId);
        }
    }

    getId():number {
        return this.packetId;
    }

    put(v:number):void {
        const str = this.data;
        const i = str.length;
        str.resize(i+1);
        str.valueptr.setUint8(v, i);
    }
    putRepeat(v:number, count:number):void {
        const str = this.data;
        const i = str.length;
        str.resize(i + count);
        str.valueptr.fill(v, count, i);
    }
    write(n:Uint8Array):void {
        const str = this.data;
        const i = str.length;
        str.resize(i+n.length);
        str.valueptr.setBuffer(n, i);
    }

    dispose():void {
        this.data.destruct();
        if (this.packet !== null) {
            this.packet = null;
            this.sharedptr.dispose();
        }
    }

    reset(packetId:number, unknownarg:number = 0):void {
        this.packetId = packetId;

        if (this.packet !== null) {
            this.packet = null;
            this.sharedptr.dispose();
        }

        createPacketRaw(this.sharedptr, packetId);
        this.packet = this.sharedptr.p!;
        this.data.resize(0);

        const unknown = this.packet.getUint8(0x10) & 3;
        const unknown2 = unknownarg & 3;
        this.writeVarUint((packetId & 0x3ff) | (unknown2 << 10) | (unknown << 12));
    }

    sendTo(target:NetworkIdentifier):void {
        if (this.packet === null) throw Error('packetId is not defined. Please set it on constructor');
        networkHandler.sendInternal(target, this.packet, this.data);
    }
}
