
import "@mcbe/dummy-console";
import native = require("./native");
import fs = require("./fs");
import PacketId = require('./packetId');
import netevent = require('./netevent');
import chat = require('./chat');
import NativeFile = native.NativeFile;
import NativePointer = native.NativePointer;
import consoleX = native.console;
import nethook = native.nethook;
import debug = native.debug;
import setOnErrorListener = native.setOnErrorListener;
import fsx = native.fs;

declare module "./native"
{
    interface NativePointer
    {
        readHex(size:number):string;
    }
}

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

export { 
    fs, 
    fsx, 
    NativeFile,
    NativePointer, 
    consoleX, 
    nethook, 
    debug, 
    setOnErrorListener,
    PacketId,
    netevent,
    chat,
};

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
