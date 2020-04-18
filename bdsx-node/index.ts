/// <reference types="minecraft-scripting-types-server" />

import "@mcbe/dummy-console";
import native = require("./native");
import fs = require("./fs");
import PacketId = require('./packetId');
import netevent = require('./netevent');
import chat = require('./chat');
import command = require('./command');
import nativetype = require('./nativetype');
import packettype = require('./packettype');
import { CANCEL } from './common';
import NetworkIdentifier = native.NetworkIdentifier;
import StaticPointer = native.StaticPointer;
import NativePointer = native.NativePointer;
import Actor = native.Actor;
import consoleX = native.console;
import nethook = native.nethook;
import serverControl = native.serverControl;
import setOnErrorListener = native.setOnErrorListener;
import setOnRuntimeErrorListener = native.setOnRuntimeErrorListener;
import NativeModule = native.NativeModule;
import fsx = native.fs;
import File = fs.File;
import Watcher = fsx.Watcher;
import createPacket = nethook.createPacket;
import sendPacket = nethook.sendPacket;
import execSync = native.execSync;
import ipfilter = native.ipfilter;
import moduleRoot = native.moduleRoot;

import shellVoid = native.shell;
import { MariaDB } from "./db";

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

declare module "./native"
{
    interface NativePointer
    {
        readHex(size:number):string;
        analyze():void;
        
        /**
         * @deprecated It's replaced to readString(,Encoding.)
         */
        readUtf16():string;
    }

    namespace Actor
    {
        function fromEntity(entity:IEntity):Actor;
    }

    interface Actor
    {
        getEntity():IEntity;
    }
}

Actor.fromEntity = function(entity){
    const u = entity.__unique_id__;
    return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"]);
};
Actor.prototype.getEntity = function(){
    let entity:IEntity = (this as any).entity;
    if (entity) return entity;
    entity = {
        __unique_id__:{
            "64bit_low": this.getUniqueIdLow(),
            "64bit_high": this.getUniqueIdHigh()
        },
        __identifier__:this.getIdentifier(),
        __type__:(this.getTypeId() & 0xff) === 0x40 ? 'item_entity' : 'entity',
        id:0, // bool ScriptApi::WORKAROUNDS::helpRegisterActor(entt::Registry<unsigned int>* registry? ,Actor* actor,unsigned int* id_out);
    };
    return (this as any).entity = entity;
};

NetworkIdentifier.prototype.toString = NetworkIdentifier.prototype.getAddress;

NativePointer.prototype.readHex = function(size:number, nextLinePer:number = 16){
    let out = '';
    for (let i=0;i<size;)
    {
        const num = this.readUint8();
        const hex = num.toString(16);
        if (hex.length == 1) out += '0';
        out += hex;
        out += ' ';

        i++;

        if (i % nextLinePer === 0) out += '\n';
    }
    return out.substr(0, out.length-1);
};

let analyzeMap:Map<string, string>|undefined;

export function loadMap():void
{
    if (analyzeMap) return;
    analyzeMap = new Map<string, string>();
    const pdb = native.loadPdb();
    for (const name in pdb)
    {
        analyzeMap.set(pdb[name].toString(), name);
    }
}

NativePointer.prototype.analyze = function(){
    loadMap();
    console.log(`[analyze: ${this}]`);
    try
    {
        for (let i=0;i<32;i++)
        {
            let offset = (i*8).toString(16);
            offset = '0'.repeat(Math.max(3-offset.length, 0)) + offset;
            
            const addr = this.readPointer();
            const addrstr = addr.toString();
            
            const addrname = analyzeMap!.get(addrstr);
            if (addrname)
            {
                console.log(`${offset}: ${addrname}(${addrstr})`);
                continue;
            }

            try
            {
                const addr2 = addr.getPointer();
                const addr2str = addr2.toString();
                const addr2name = analyzeMap!.get(addr2str);
                if (addr2name)
                {
                    console.log(`${offset}: ${addrstr}: ${addr2name}(${addr2str})`);
                }
                else
                {
                    console.log(`${offset}: ${addrstr}: ${addr2str}`);
                }
            }
            catch (err)
            {
                let nums:number[] = [];
                for (let i=0;i<addrstr.length; i+= 2)
                {
                    nums.push(parseInt(addrstr.substr(i, 2), 16));
                }
                if (nums.every(n=>n<0x7f))
                {
                    const text = String.fromCharCode(...nums.map(n=>n<0x20 ? 0x20 : n));
                    console.log(`${offset}: ${addrstr} ${text}`);
                }
                else
                {
                    console.log(`${offset}: ${addrstr}`);
                }
            }
        }
    }
    catch(err)
    {
        console.log('[VA]');
    }
};

export { 
    fs, 
    fsx,
    File,
    File as NativeFile,
    NetworkIdentifier,
    Actor,
    Actor as Entity,
    Watcher,
    StaticPointer,
    NativePointer, 
    consoleX, 
    nethook, 
    setOnErrorListener,
    setOnRuntimeErrorListener,
    PacketId,
    netevent,
    chat,
    command,
    serverControl,
    CANCEL,
    createPacket,
    sendPacket,
    nativetype,
    packettype,
    NativeModule,
    execSync,
    ipfilter,
    shellVoid,
    MariaDB,
    moduleRoot,
};


export function wget(url:string):Promise<string>
{
    return new Promise(resolve=>{
        native.wget(url, text=>{
            resolve(text);
        });
    });
}

export function exec(command:string, cwd?:string):Promise<string>
{
    return new Promise(resolve=>{
        native.exec(command, cwd, resolve);
    });
}

export function execVoid(command:string, cwd?:string):void
{
    native.exec(command, cwd);
}

console.log = (msg:any, ...params:any[])=>{
    if (params.length !== 0)
    {
        params.unshift(msg);
        consoleX.log(params.join(' '));
    }
    else
    {
        consoleX.log(msg+'');
    }
};
console.error = (msg:any, ...params:any[])=>{
    const old = consoleX.getTextAttribute();
    consoleX.setTextAttribute(consoleX.FOREGROUND_RED);
    if (params.length !== 0)
    {
        params.unshift(msg);
        consoleX.log(params.join(' '));
    }
    else
    {
        consoleX.log(msg+'');
    }
    consoleX.setTextAttribute(old);
};
console.assert = (value:any, msg:any, ...params:any[])=>{
    if (value) return;
    params.unshift(msg);
    msg = params.join(' ');
    console.error(msg);
    debugger;
    throw Error(msg);
};
