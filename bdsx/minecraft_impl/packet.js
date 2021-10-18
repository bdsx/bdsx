"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const makefunc_1 = require("../makefunc");
const mcglobal_1 = require("../mcglobal");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
require("./extendedstreamreadresult");
require("./networkhandler");
const sharedptr_of_packet = Symbol('sharedptr');
minecraft_1.Packet.prototype.dispose = function () {
    this[sharedptr_of_packet].dispose();
    this[sharedptr_of_packet] = null;
};
minecraft_1.Packet.create = function () {
    const id = this.ID;
    if (id === undefined)
        throw Error('Packet class is abstract, please use named class instead (ex. LoginPacket)');
    const sharedptr = minecraft_1.MinecraftPackets.createPacket(id);
    const packet = sharedptr.p;
    if (packet === null)
        throw Error(`${this.name} is not created`);
    packet[sharedptr_of_packet] = sharedptr;
    return packet;
};
minecraft_1.Packet.prototype.sendTo = function (target, unknownarg = 0) {
    mcglobal_1.mcglobal.networkHandler.send(target, this, unknownarg);
};
minecraft_1.Packet.prototype.destruct = makefunc_1.makefunc.js([0x0], nativetype_1.void_t, { this: minecraft_1.Packet });
minecraft_1.Packet.prototype.getId = makefunc_1.makefunc.js([0x8], nativetype_1.int32_t, { this: minecraft_1.Packet });
minecraft_1.Packet.prototype.getName = makefunc_1.makefunc.js([0x10], nativetype_1.CxxString, { this: minecraft_1.Packet, structureReturn: true });
minecraft_1.Packet.prototype.write = makefunc_1.makefunc.js([0x18], nativetype_1.void_t, { this: minecraft_1.Packet }, minecraft_1.BinaryStream);
minecraft_1.Packet.prototype.read = makefunc_1.makefunc.js([0x20], nativetype_1.int32_t, { this: minecraft_1.Packet }, minecraft_1.BinaryStream);
minecraft_1.Packet.prototype.readExtended = makefunc_1.makefunc.js([0x28], minecraft_1.ExtendedStreamReadResult, { this: minecraft_1.Packet, structureReturn: true }, minecraft_1.ReadOnlyBinaryStream);
//# sourceMappingURL=packet.js.map