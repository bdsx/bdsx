/**
 * @deprecated redirection for old bdsx
 */

import core = require('./core');
import { Actor as ActorOrigin } from './bds/actor';
import { NetworkIdentifier as NetworkIdentifierOrigin } from './bds/networkidentifier';
import { capi } from './capi';
import { CxxVector } from './cxxvector';
import { NativeModule as NativeModuleOrigin } from './dll';
import { legacy } from './legacy';
import { nethook as nethookOrigin } from './nethook';
import { serverControl as serverControlOrigin } from './servercontrol';
import { SharedPointer as SharedPointerOrigin } from './sharedpointer';

function defaultErrorMethod(err:Error):void {
    console.error(err);
}

/**
 * Catch global errors
 * default error printing is disabled if cb returns false
 * @deprecated use bedrockServer.error.on
 */
export function setOnErrorListener(cb: ((err: Error) => void | boolean)|null): void {
    if (cb) {
        core.jshook.setOnError(err=>{
            if (cb(err) !== false) {
                console.error(err.stack || (err+''));
            }
        });
    } else {
        core.jshook.setOnError(defaultErrorMethod);
    }
}


/**
 * @deprecated use bedrockServer.close.on
 */
export const setOnRuntimeErrorListener = legacy.setOnRuntimeErrorListener;

/**
 * @deprecated
 */
export function setOnCommandListener(cb: ((command:string, originName:string)=>void | number)|null):void {
    throw Error('not implemented');
}

/**
 * @deprecated use bdsx.ipfilter
 */
export const ipfilter = core.ipfilter;

/**
 * @deprecated use bdsx.serverControl
 */
export const serverControl = serverControlOrigin;

/**
 * @deprecated use bdsx.nethook
*/
export const nethook = nethookOrigin;

/**
 * @deprecated use bdsx.NetworkIdentifier
*/
export const NetworkIdentifier = NetworkIdentifierOrigin;
/**
 * @deprecated use bdsx.NetworkIdentifier
*/
export type NetworkIdentifier = NetworkIdentifierOrigin;

/**
 * @deprecated use bdsx.StaticPointer
*/
export const StaticPointer = core.StaticPointer;
export type StaticPointer = core.StaticPointer;

/**
 * @deprecated use bdsx.NativePointer
*/
export const NativePointer = core.NativePointer;
export type NativePointer = core.NativePointer;

/**
 * @deprecated use bdsx.Actor
*/
export const Actor = ActorOrigin;
export type Actor = ActorOrigin;

/**
 * @deprecated use bdsx.SharedPtr
 */
export const SharedPointer = SharedPointerOrigin;
export type SharedPointer = SharedPointerOrigin;

/**
 * @deprecated use bdsx.NativeModule
 */
export const NativeModule = NativeModuleOrigin;
export type NativeModule = NativeModuleOrigin;

/**
 * the alloc function for std::vector
 * @deprecated why are you using it?, use capi.malloc
 */
export const std$_Allocate$16 = CxxVector._alloc16;

/**
 * memory allocate by native c
 * @deprecated use capi.malloc
 */
export const malloc = capi.malloc;
/**
 * memory release by native c
 * @deprecated use capi.free
 */
export const free = capi.free;

/**
 * @deprecated use analyzer.loadMap
 */
export function loadPdb():{[key:string]:NativePointer} {
    return core.pdb.getAll();
}
