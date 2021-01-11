/// <reference types="minecraft-scripting-types-server" />

import './externs';
import './bds/enumfiller';

import core = require("./core");
import netevent = require('./netevent');
import chat = require('./chat');
import command = require('./command');
import nativetype = require('./nativetype');
import native = require('./native');
import { analyzer } from './analyzer';
import { CANCEL, RawTypeId } from './common';
import { bin } from "./bin";
import { NetworkIdentifier, ServerNetworkHandler } from './bds/networkidentifier';
import { Actor, DimensionId } from './bds/actor';
import { bedrockServer } from './launcher';
import { nethook } from './nethook';
import { MinecraftPacketIds } from './bds/packetids';
import { NativeModule } from './dll';

import VoidPointer = core.VoidPointer;
import StaticPointer = core.StaticPointer;
import NativePointer = core.NativePointer;
import ipfilter = core.ipfilter;
import jshook = core.jshook;
import createPacket = nethook.createPacket;
import sendPacket = nethook.sendPacket;
import PacketId = MinecraftPacketIds;

import { AttributeId, AttributeInstance } from './bds/attribute';
import { hex } from './util';
import { serverControl } from './servercontrol';
import { SharedPtr } from './sharedpointer';
import { capi } from './capi';
import { ServerPlayer } from './bds/player';
import { serverInstance } from './bds/server';
import { AttributeData, UpdateAttributesPacket } from './bds/packets';
import { proc } from './bds/proc';
import { legacy } from './legacy';
import { Packet } from './bds/packet';


declare global
{
    interface IEntity
    {
        __unique_id__:{
            "64bit_low":number;
            "64bit_high":number;
        };
    }

    interface NodeRequireFunction {
        (id: string): any;
    }
    interface NodeRequire extends NodeRequireFunction {
    }
    var require: NodeRequire;    
}

declare module "./core"
{
    interface NativePointer
    {
        /**
         * @deprecated use bdsx/util.hex(ptr.readBuffer(size))
         */
        readHex(size:number, nextLinePer?:number):string;

        /** 
         * @deprecated use analyzer.analyze(ptr)
         */
        analyze():void;
    }
}
NativePointer.prototype.readHex = function(size:number, nextLinePer:number = 16){
    return hex(this.readBuffer(size), nextLinePer);
};
NativePointer.prototype.analyze = function(){
    return analyzer.analyze(this);
};

/////////
// avoiding circular dependency

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

Actor.fromUniqueId = function(lowbits, highbits) {
    return serverInstance.minecraft.something.level.fetchEntity(bin.make64(lowbits, highbits));  
};
NetworkIdentifier.prototype.getActor = function():Actor|null
{
    return ServerNetworkHandler$_getServerPlayer(serverInstance.minecraft.something.shandler, this, 0);
};
Packet.prototype.sendTo = function(target:NetworkIdentifier, unknownarg:number):void
{
    serverInstance.networkHandler.send(target, this, unknownarg);
};

const ServerNetworkHandler$_getServerPlayer = core.makefunc.js(
    proc["ServerNetworkHandler::_getServerPlayer"], ServerPlayer, null, false, ServerNetworkHandler, NetworkIdentifier, RawTypeId.Int32);

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

///////

/** @deprecated use Actor */
export const Entity = Actor;
/** @deprecated use Actor */
export type Entity = Actor;


/**
 * @deprecated use bedrockServer.close.on
 */
export const setOnRuntimeErrorListener = legacy.setOnRuntimeErrorListener;


/**
 * Catch global errors.
 * the default error printing is disabled if cb returns false.
 * @deprecated use bedrockServer.error.on
 */
export const setOnErrorListener = native.setOnErrorListener;

/**
 * @deprecated use analyzer.loadMap
 */
export const loadMap = analyzer.loadMap;

export { 
    PacketId,
    NetworkIdentifier,
    Actor,
    ServerPlayer,
    VoidPointer,
    StaticPointer,
    NativePointer, 
    jshook,
    MinecraftPacketIds,
    nethook, 
    serverControl,
    netevent,
    chat,
    command,
    native,
    serverInstance,
    CANCEL,
    createPacket,
    sendPacket,
    nativetype,
    NativeModule,
    ipfilter,
    bin,
    DimensionId,
    AttributeId,
    SharedPtr,
    capi,
    analyzer,
    RawTypeId,
};


