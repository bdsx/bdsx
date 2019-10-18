

import "@mcbe/dummy-console";
import chakraX = require("./chakraX");

import NativeFile = chakraX.NativeFile;
import consoleX = chakraX.console;

export {chakraX, NativeFile};

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
