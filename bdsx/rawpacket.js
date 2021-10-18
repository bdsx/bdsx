"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawPacket = void 0;
const minecraft_1 = require("./minecraft");
const pointer_1 = require("./pointer");
const sharedpointer_1 = require("./sharedpointer");
const abstractstream_1 = require("./writer/abstractstream");
const PacketSharedPtr = sharedpointer_1.SharedPtr.make(minecraft_1.Packet);
class RawPacket extends abstractstream_1.AbstractWriter {
    constructor(packetId) {
        super();
        this.data = new pointer_1.CxxStringWrapper(true);
        this.sharedptr = new PacketSharedPtr(true);
        this.packet = null;
        this.packetId = 0;
        this.data.construct();
        if (packetId != null) {
            this.reset(packetId);
        }
    }
    getId() {
        return this.packetId;
    }
    put(v) {
        const str = this.data;
        const i = str.length;
        str.resize(i + 1);
        str.valueptr.setUint8(v, i);
    }
    putRepeat(v, count) {
        const str = this.data;
        const i = str.length;
        str.resize(i + count);
        str.valueptr.fill(v, count, i);
    }
    write(n) {
        const str = this.data;
        const i = str.length;
        str.resize(i + n.length);
        str.valueptr.setBuffer(n, i);
    }
    dispose() {
        this.data.destruct();
        if (this.packet !== null) {
            this.packet = null;
            this.sharedptr.dispose();
        }
    }
    reset(packetId, unknownarg = 0) {
        this.packetId = packetId;
        if (this.packet !== null) {
            this.packet = null;
            this.sharedptr.dispose();
        }
        minecraft_1.MinecraftPackets.createPacketRaw(this.sharedptr, packetId);
        this.packet = this.sharedptr.p;
        this.data.resize(0);
        const unknown = this.packet.getUint8(0x10) & 3;
        const unknown2 = unknownarg & 3;
        this.writeVarUint((packetId & 0x3ff) | (unknown2 << 10) | (unknown << 12));
    }
    sendTo(target) {
        if (this.packet === null)
            throw Error('packetId is not defined. Please set it on constructor');
        minecraft_1.networkHandler._sendInternal(target, this.packet, this.data);
    }
}
exports.RawPacket = RawPacket;
//# sourceMappingURL=rawpacket.js.map