
/**
 * @deprecated bdsx/index.ts will be deleted
 */

import { analyzer } from './analyzer';
import { Actor, DimensionId } from './bds/actor';
import { AttributeId } from './bds/attribute';
import './bds/enumfiller';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { ServerPlayer } from './bds/player';
import { serverInstance } from './bds/server';
import { bin } from "./bin";
import { capi } from './capi';
import { command } from './command';
import { NativeModule } from './dll';
import type { } from './externs';
import { bedrockServer } from './launcher';
import { legacy } from './legacy';
import { nethook } from './nethook';
import './polyfill';
import { serverControl } from './servercontrol';
import { SharedPtr } from './sharedpointer';
import { hex } from './util';

import common = require('./common');
import makefunc = require('./makefunc');

import makefuncModule = require('./makefunc');
import core = require("./core");
import netevent = require('./netevent');
import chat = require('./chat');
import nativetype = require('./nativetype');
import native = require('./native');
import colors = require('colors');

export import VoidPointer = core.VoidPointer;
export import StaticPointer = core.StaticPointer;
export import NativePointer = core.NativePointer;
export import ipfilter = core.ipfilter;
export import jshook = core.jshook;
export import createPacket = nethook.createPacket;
export import sendPacket = nethook.sendPacket;
export import CANCEL = common.CANCEL;
export import RawTypeId = makefunc.RawTypeId;

/** @deprecated use MinecraftPacketIds, matching to the original name  */
export import PacketId = MinecraftPacketIds;

declare module './common' {
    /**
     * @deprecated use RawTypeId in makefunc
     */
    export type RawTypeId = makefunc.RawTypeId;
    /**
     * @deprecated use RawTypeId in makefunc
     */
    export let RawTypeId:typeof makefunc.RawTypeId;
}
common.RawTypeId = makefunc.RawTypeId;

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
    /**
     * @deprecated use 'bdsx/makefunc'
     */
    let makefunc:typeof makefuncModule.makefunc;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type ParamType = makefuncModule.ParamType;

    /**
     * @deprecated use ParamType in 'bdsx/makefunc'
     */
    type ReturnType = makefuncModule.ParamType;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type MakeFuncOptions<THIS> = any;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type FunctionFromTypes_np<OPTS,PARAMS,RETURN> = any;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type FunctionFromTypes_js<PTR, OPTS, PARAMS, RETURN> = any;
}
NativePointer.prototype.readHex = function(size:number, nextLinePer:number = 16) {
    return hex(this.readBuffer(size), nextLinePer);
};
NativePointer.prototype.analyze = function() {
    return analyzer.analyze(this);
};
core.makefunc = makefuncModule.makefunc;
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
    NetworkIdentifier,
    Actor,
    ServerPlayer,
    MinecraftPacketIds,
    nethook,
    command,
    serverControl,
    chat,
    netevent,
    native,
    serverInstance,
    nativetype,
    NativeModule,
    bin,
    DimensionId,
    AttributeId,
    SharedPtr,
    capi,
    analyzer,
    bedrockServer
};


console.trace(colors.red(`[BDSX] bdsx/index.ts will be deleted. please import directly`));
