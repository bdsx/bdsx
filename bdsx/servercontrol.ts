
import child_process = require('child_process');
import { proc } from './bds/proc';
import { serverInstance } from './bds/server';
import { RawTypeId } from './common';
import { bedrock_server_exe, makefunc, VoidPointer } from './core';

export namespace serverControl
{
    const stopfunc = makefunc.js(proc['DedicatedServer::stop'], RawTypeId.Void, null, false, VoidPointer);

    /**
     * stop the BDS
     * It will stop next tick
     */
    export function stop():void
    {
        const server = serverInstance.server;
        stopfunc(server.add(8));
        throw Error('need to implement');
    }

    /**
     * shutdown server and restart
     */
    export function restart(force?:boolean):void
    {
        const argsLine = bedrock_server_exe.argsLine;
		if (force)
		{
            child_process.spawn(argsLine);
            bedrock_server_exe.forceKill(-1);
        }
        else
        {
            child_process.spawn(argsLine);
            stop();
        }
    }
}
