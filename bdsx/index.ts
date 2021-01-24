/// <reference path="./externs/index.d.ts" />
import './polyfill';
import './bds/enumfiller';

import { analyzer } from './analyzer';
import { Actor, DimensionId } from './bds/actor';
import { AttributeId } from './bds/attribute';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { ServerPlayer } from './bds/player';
import { serverInstance } from './bds/server';
import { bin } from "./bin";
import { capi } from './capi';
import { CANCEL, RawTypeId } from './common';
import { NativeModule } from './dll';
import { legacy } from './legacy';
import { nethook } from './nethook';
import { serverControl } from './servercontrol';
import { SharedPtr } from './sharedpointer';
import { hex } from './util';

import core = require("./core");
import netevent = require('./netevent');
import chat = require('./chat');
import command = require('./command');
import nativetype = require('./nativetype');
import native = require('./native');

import './bds/implements';

import VoidPointer = core.VoidPointer;
import StaticPointer = core.StaticPointer;
import NativePointer = core.NativePointer;
import ipfilter = core.ipfilter;
import jshook = core.jshook;
import createPacket = nethook.createPacket;
import sendPacket = nethook.sendPacket;
import PacketId = MinecraftPacketIds;


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


