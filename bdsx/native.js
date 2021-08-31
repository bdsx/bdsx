//@ts-check
/**
 * @deprecated
 */
"use strict";

const { notImplemented } = require("./common");
const core = require("./core");
const { Actor } = require("./bds/actor");
const { NetworkIdentifier } = require("./bds/networkidentifier");
const { capi } = require("./capi");
const { NativeModule } = require("./dll");
const { legacy, SharedPointer } = require("./legacy");
const { nethook } = require("./nethook");
const { serverControl } = require("./servercontrol");

function defaultErrorMethod(err) {
    console.error(err);
}

function setOnErrorListener(cb) {
    if (cb) {
        core.jshook.setOnError(err => {
            if (cb(err) !== false) {
                console.error(err.stack || (err + ''));
            }
        });
    }
    else {
        core.jshook.setOnError(defaultErrorMethod);
    }
}
exports.setOnErrorListener = setOnErrorListener;
exports.setOnRuntimeErrorListener = legacy.setOnRuntimeErrorListener;

function setOnCommandListener(cb) {
    notImplemented();
}
exports.setOnCommandListener = setOnCommandListener;
exports.ipfilter = core.ipfilter;
exports.serverControl = serverControl;
exports.nethook = nethook;
exports.NetworkIdentifier = NetworkIdentifier;
exports.StaticPointer = core.StaticPointer;
exports.NativePointer = core.NativePointer;
exports.Actor = Actor;
exports.SharedPointer = SharedPointer;
exports.NativeModule = NativeModule;
exports.std$_Allocate$16 = capi.malloc;
exports.malloc = capi.malloc;
exports.free = capi.free;
function loadPdb() {
    return core.pdb.getAll();
}
exports.loadPdb = loadPdb;
