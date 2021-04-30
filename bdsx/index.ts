
declare global {
    let bdsx:boolean|undefined;
    namespace NodeJS {
        interface Global {
            bdsx?:boolean;
        }
    }
}
if (global.bdsx !== undefined) {
    throw Error('bdsx is imported twice');
}
global.bdsx = true;

import type {} from './externs';
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
import common = require('./common');
import makefunc = require('./makefunc');
import { NativeModule } from './dll';
import { legacy } from './legacy';
import { nethook } from './nethook';
import { serverControl } from './servercontrol';
import { SharedPtr } from './sharedpointer';
import { hex } from './util';
import { bedrockServer } from './launcher';

import makefuncModule = require('./makefunc');
import core = require("./core");
import netevent = require('./netevent');
import chat = require('./chat');
import nativetype = require('./nativetype');
import native = require('./native');

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
import { command } from './command';

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
    type TypesFromParamIds_js2np<T extends ParamType[]> = makefuncModule.TypesFromParamIds_js2np<T>;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type TypesFromParamIds_np2js<T extends ParamType[]> = makefuncModule.TypesFromParamIds_np2js<T>;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type MakeFuncOptions<THIS extends { new(): VoidPointer|void; }> = makefuncModule.MakeFuncOptions<THIS>;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type FunctionFromTypes_np<
        OPTS extends MakeFuncOptions<any>|null,
        PARAMS extends ParamType[],
        RETURN extends ReturnType> =
        makefuncModule.FunctionFromTypes_np<OPTS, PARAMS, RETURN>;

    /**
     * @deprecated use 'bdsx/makefunc'
     */
    type FunctionFromTypes_js<
        PTR extends VoidPointer|[number, number?],
        OPTS extends MakeFuncOptions<any>|null,
        PARAMS extends ParamType[],
        RETURN extends ReturnType> =
        makefuncModule.FunctionFromTypes_js<PTR, OPTS, PARAMS, RETURN>;
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
