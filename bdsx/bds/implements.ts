import { asm, Register } from "bdsx/assembler";
import { CommandOrigin, PlayerCommandOrigin, ScriptCommandOrigin } from "bdsx/bds/commandorigin";
import { bin } from "bdsx/bin";
import { BlockPos, Vec3 } from "bdsx/blockpos";
import { RawTypeId } from "bdsx/common";
import { makefunc, VoidPointer } from "bdsx/core";
import { CxxVector } from "bdsx/cxxvector";
import { LoopbackPacketSender } from "bdsx/loopbacksender";
import { mce } from "bdsx/mce";
import { CxxStringPointer } from "bdsx/pointer";
import { SharedPtr } from "bdsx/sharedpointer";
import { bin64_t, CxxString, float32_t, uint16_t, uint32_t } from "../nativetype";
import { Actor, ActorRuntimeID } from "./actor";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Certificate, ConnectionReqeust } from "./connreq";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { networkHandler, NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import { ExtendedStreamReadResult, Packet } from "./packet";
import { AttributeData, UpdateAttributesPacket } from "./packets";
import { BatchedNetworkPeer, EncryptedNetworkPeer } from "./peer";
import { ServerPlayer } from "./player";
import { proc } from "./proc";
import { RakNet } from "./raknet";
import { RakNetInstance } from "./raknetinstance";
import { MCRESULT, serverInstance, VanilaGameModuleServer, VanilaServerGameplayEventListener, CommandContext, ServerCommandOrigin, MinecraftCommands, DedicatedServer, Minecraft$Something, CommandOutputSender, Minecraft, ServerInstance, MinecraftEventing, ResourcePackManager, Whitelist, PrivateKeyManager, ServerMetrics, EntityRegistryOwned } from "./server";
import { BinaryStream } from "./stream";

// avoiding circular dependency

// raknet.ts
RakNet.SystemAddress.define({
    systemIndex:[uint16_t, 130]
}, 136);
RakNet.SystemAddress.prototype.ToString = makefunc.js(proc["RakNet::SystemAddress::ToString"], RawTypeId.Void, {this: RakNet.SystemAddress}, RawTypeId.Boolean, RawTypeId.Buffer, RawTypeId.Int32);

RakNet.RakNetGUID.define({
    g:bin64_t,
    systemIndex:uint16_t
}, 16);
RakNet.RakPeer.abstract({});
RakNet.RakPeer.prototype.GetSystemAddressFromIndex = makefunc.js([0xf0], RakNet.SystemAddress, {this:RakNet.RakPeer, structureReturn: true}, RawTypeId.Int32);
RakNet.AddressOrGUID.define({
    rakNetGuid:RakNet.RakNetGUID,
    systemAddress:RakNet.SystemAddress,
});

// level.ts
Level.prototype.createDimension = makefunc.js(proc["Level::createDimension"], Dimension, {this:Level}, RawTypeId.Int32);
Level.prototype.fetchEntity = makefunc.js(proc["Level::fetchEntity"], Actor, {this:Level, nullableReturn: true}, RawTypeId.Bin64, RawTypeId.Boolean);


Level.abstract({players:[CxxVector.make(ServerPlayer.ref()), 0x58]});

ServerLevel.abstract({
    packetSender:[LoopbackPacketSender.ref(), 0x830],
    actors:[CxxVector.make(Actor.ref()), 0x1590],
});

// commandorigin.ts

ScriptCommandOrigin.abstract({});

CommandOrigin.define({
	vftable:VoidPointer,
	uuid:mce.UUID,
	level:ServerLevel.ref(),
});

// void destructor(CommandOrigin* origin);
CommandOrigin.prototype.destructor = makefunc.js([0x00], RawTypeId.Void, {this: CommandOrigin});

// std::string CommandOrigin::getRequestId();
const getRequestId = makefunc.js([0x08], CxxStringPointer, {this: CommandOrigin, structureReturn: true});
CommandOrigin.prototype.getRequestId = function():string
{
    const p = getRequestId.call(this) as CxxStringPointer;
    const str = p.p;
    p.destruct();
    return str;
};

// std::string CommandOrigin::getName();
const getName = makefunc.js([0x10], CxxStringPointer, {this: CommandOrigin, structureReturn: true});
CommandOrigin.prototype.getName = function():string
{
    const p = getName.call(this) as CxxStringPointer;
    const str = p.p;
    p.destruct();
    return str;
};

// BlockPos CommandOrigin::getBlockPosition();
CommandOrigin.prototype.getBlockPosition = makefunc.js([0x18], BlockPos, {this: CommandOrigin, structureReturn: true});

// Vec3 getWorldPosition(CommandOrigin* origin);
CommandOrigin.prototype.getWorldPosition = makefunc.js([0x20], Vec3, {this: CommandOrigin, structureReturn: true});

// Level* getLevel(CommandOrigin* origin);
CommandOrigin.prototype.getLevel = makefunc.js([0x28], Level, {this: CommandOrigin});

// Dimension* (*getDimension)(CommandOrigin* origin);
CommandOrigin.prototype.getDimension = makefunc.js([0x30], Dimension, {this: CommandOrigin});

// Actor* getEntity(CommandOrigin* origin);
CommandOrigin.prototype.getEntity = makefunc.js([0x30], Actor, {this: CommandOrigin});

// .....

PlayerCommandOrigin.abstract({});

// actor.ts
Actor.abstract({
	vftable: VoidPointer,
	identifier: [CxxString, 0x450], // minecraft:player
	attributes: [BaseAttributeMap.ref(), 0x478],
	runtimeId: [ActorRuntimeID, 0x588],
});
(Actor.prototype as any)._sendNetworkPacket = makefunc.js(proc["ServerPlayer::sendNetworkPacket"], RawTypeId.Void, {this:Actor}, VoidPointer);
Actor.prototype.getUniqueIdBin = makefunc.js(proc["Actor::getUniqueID"], RawTypeId.Bin64, {this:Actor});

Actor.prototype.getTypeId = makefunc.js([0x508], RawTypeId.Int32, {this:Actor}); // ActorType getEntityTypeId()
Actor.prototype.getDimensionId = makefunc.js([0x548], RawTypeId.Void, {this:Actor}, RawTypeId.Buffer); // DimensionId* getDimensionId(DimensionId*)

Actor.fromUniqueId = function(lowbits, highbits) {
    return serverInstance.minecraft.something.level.fetchEntity(bin.make64(lowbits, highbits), true);  
};

const attribNames = [
	"minecraft:zombie.spawn.reinforcements",
	"minecraft:player.hunger",
	"minecraft:player.saturation",
	"minecraft:player.exhaustion",
	"minecraft:player.level",
	"minecraft:player.experience",
	"minecraft:health",
	"minecraft:follow_range",
	"minecraft:knockback_registance",
	"minecraft:movement",
	"minecraft:underwater_movement",
	"minecraft:attack_damage",
	"minecraft:absorption",
	"minecraft:luck",
	"minecraft:horse.jump_strength",
];
(Actor.prototype as any)._sendAttributePacket = function(this:Actor, id:AttributeId, value:number, attr:AttributeInstance):void
{
    const packet = UpdateAttributesPacket.create();
    packet.actorId = this.runtimeId;

    const data = new AttributeData;
    data.name.set(attribNames[id - 1]);
    data.current = value;
    data.min = attr.minValue;
    data.max = attr.maxValue;
    data.default = attr.defaultValue;
    packet.attributes.push(data);
    this._sendNetworkPacket(packet);
    packet.dispose();
}

// player.ts
ServerPlayer.abstract({
    networkIdentifier:[NetworkIdentifier, Actor.OFFSET_OF_NI]
});
ServerPlayer.prototype.sendNetworkPacket = makefunc.js(proc["ServerPlayer::sendNetworkPacket"], RawTypeId.Void, {this: ServerPlayer}, VoidPointer);


// networkidentifier.ts
NetworkIdentifier.define({
    address:RakNet.AddressOrGUID
});
NetworkIdentifier.prototype.getActor = function():Actor|null
{
    return ServerNetworkHandler$_getServerPlayer(serverInstance.minecraft.something.shandler, this, 0);
};
NetworkIdentifier.prototype.equals = makefunc.js(proc["NetworkIdentifier::operator=="], RawTypeId.Boolean, {this:NetworkIdentifier}, NetworkIdentifier);
NetworkIdentifier.prototype.hash = makefunc.js(
	asm()
	.sub_r_c(Register.rsp, 8)
	.call64(proc['NetworkIdentifier::getHash'], Register.rax)
	.add_r_c(Register.rsp, 8)
	.mov_r_c(Register.rcx, Register.rax)
	.shr_r_c(Register.rcx, 32)
	.xor_r_r(Register.rax, Register.rcx)
	.ret()
	.alloc(), RawTypeId.Int32, {this:NetworkIdentifier});
// size_t NetworkIdentifier::getHash() const noexcept
// {
// 	return (this);
// }
NetworkHandler.Connection.abstract({
    networkIdentifier:NetworkIdentifier,
    u1:VoidPointer, // null
    u2:VoidPointer, // null
    u3:VoidPointer, // null
    epeer:SharedPtr.make(EncryptedNetworkPeer),
    bpeer:SharedPtr.make(BatchedNetworkPeer),
    bpeer2:SharedPtr.make(BatchedNetworkPeer),
});
NetworkHandler.abstract({
    instance: [RakNetInstance.ref(), 0x30]
});

// NetworkHandler::Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni)
NetworkHandler.prototype.getConnectionFromId = makefunc.js(proc[`NetworkHandler::_getConnectionFromId`], NetworkHandler.Connection, {this:NetworkHandler});

// void NetworkHandler::send(const NetworkIdentifier& ni, Packet* packet, unsigned char u)
NetworkHandler.prototype.send = makefunc.js(proc['NetworkHandler::send'], RawTypeId.Void, {this:NetworkHandler}, NetworkIdentifier, Packet, RawTypeId.Int32);

// packet.ts
Packet.abstract({}, 0x28);
Packet.prototype.sendTo = function(target:NetworkIdentifier, unknownarg:number):void
{
    networkHandler.send(target, this, unknownarg);
};
Packet.prototype.destructor = makefunc.js([0x0], RawTypeId.Void, {this:Packet});
Packet.prototype.getId = makefunc.js([0x8], RawTypeId.Int32, {this:Packet});
Packet.prototype.getName = makefunc.js([0x10], RawTypeId.Void, {this:Packet}, CxxStringPointer);
Packet.prototype.write = makefunc.js([0x18], RawTypeId.Void, {this:Packet}, BinaryStream);
Packet.prototype.read = makefunc.js([0x20], RawTypeId.Int32, {this:Packet}, BinaryStream);
Packet.prototype.readExtended = makefunc.js([0x28], ExtendedStreamReadResult, {this:Packet}, ExtendedStreamReadResult, BinaryStream);
// Packet.prototype.unknown = makefunc.js([0x30], RawTypeId.Boolean, {this:Packet});


const ServerNetworkHandler$_getServerPlayer = makefunc.js(
    proc["ServerNetworkHandler::_getServerPlayer"], ServerPlayer, null, ServerNetworkHandler, NetworkIdentifier, RawTypeId.Int32);

// connreq.ts
Certificate.prototype.getXuid = function():string
{
	const out = getXuid(this);
	const xuid = out.p;
	out.destruct();
	return xuid;
};
Certificate.prototype.getId = function():string
{
	const out = getIdentityName(this);
	const id = out.p;
	out.destruct();
	return id;
};
Certificate.prototype.getTitleId = function():number
{
	return getTitleId(this);
}
Certificate.prototype.getIdentity = function():mce.UUID
{
	return getIdentity(this).p;
};
const getXuid = makefunc.js(proc["ExtendedCertificate::getXuid"], CxxStringPointer, {structureReturn: true}, Certificate);
const getIdentityName = makefunc.js(proc["ExtendedCertificate::getIdentityName"], CxxStringPointer, {structureReturn: true}, Certificate);
const getTitleId = makefunc.js(proc["ExtendedCertificate::getTitleID"], RawTypeId.Int32, {}, Certificate);
const getIdentity = makefunc.js(proc["ExtendedCertificate::getIdentity"], mce.UUIDPointer, {structureReturn: true}, Certificate);
ConnectionReqeust.abstract({
	u1: VoidPointer,
	cert:Certificate.ref()
});

// attribute.ts
AttributeInstance.abstract({
	vftable:VoidPointer,
	u1:VoidPointer,
	u2:VoidPointer,
	currentValue: [float32_t, 0x84],
	minValue: [float32_t, 0x7C],
	maxValue: [float32_t, 0x80],
	defaultValue: [float32_t, 0x78],
});
BaseAttributeMap.abstract({});

BaseAttributeMap.prototype.getMutableInstance = makefunc.js(proc["BaseAttributeMap::getMutableInstance"], AttributeInstance, {this:BaseAttributeMap, nullableReturn: true}, RawTypeId.Int32);

// server.ts
MCRESULT.define({
	result:uint32_t
});
VanilaGameModuleServer.abstract({
	listener:[VanilaServerGameplayEventListener.ref(), 0x8]
});
CommandContext.abstract({
	command:CxxString,
	origin:ServerCommandOrigin.ref(),
});
DedicatedServer.abstract({});
Minecraft$Something.abstract({
    network:NetworkHandler.ref(),
    level:ServerLevel.ref(),
    shandler:ServerNetworkHandler.ref(),
});
MinecraftCommands.abstract({
	sender:CommandOutputSender.ref(),
	u1:VoidPointer,
	u2:bin64_t,
	minecraft:Minecraft.ref(),
});
Minecraft.abstract({
	vftable:VoidPointer,
	serverInstance:ServerInstance.ref(),
	minecraftEventing:MinecraftEventing.ref(),
	resourcePackManager:ResourcePackManager.ref(),
	offset_20:VoidPointer,
	vanillaGameModuleServer:[SharedPtr, 0x28], // VanilaGameModuleServer
	whitelist:Whitelist.ref(),
	permissionsJsonFileName:CxxString.ref(),
	privateKeyManager:PrivateKeyManager.ref(),
	serverMetrics:[ServerMetrics.ref(), 0x78],
	commands:[MinecraftCommands.ref(), 0xa0],
	something:Minecraft$Something.ref(),
	network:[NetworkHandler.ref(), 0xc0],
	LoopbackPacketSender:LoopbackPacketSender.ref(),
	server:DedicatedServer.ref(),
    entityRegistryOwned:[SharedPtr.make(EntityRegistryOwned), 0xe0],
});
ServerInstance.abstract({
    server:[DedicatedServer.ref(), 0x90],
    minecraft:[Minecraft.ref(), 0x98],
    networkHandler:[NetworkHandler.ref(), 0xa0],
});
MinecraftCommands.prototype._executeCommand = makefunc.js(proc["MinecraftCommands::executeCommand"], MCRESULT, {thisType: MinecraftCommands, structureReturn:true }, SharedPtr.make(CommandContext), RawTypeId.Boolean);
