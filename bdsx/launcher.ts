import * as colors from 'colors';
import * as readline from 'readline';
import { createAbstractObject } from "./abstractobject";
import { installMinecraftAddons } from './addoninstaller';
import { asmcode } from "./asm/asmcode";
import { asm, Register } from "./assembler";
import { Bedrock } from './bds/bedrock';
import type { CommandOutputSender, CommandPermissionLevel, CommandRegistry, MinecraftCommands } from "./bds/command";
import { Dimension } from "./bds/dimension";
import { GameRules } from './bds/gamerules';
import { ServerLevel } from "./bds/level";
import * as nimodule from './bds/networkidentifier';
import { RakNet } from './bds/raknet';
import * as bd_server from './bds/server';
import { proc } from './bds/symbols';
import type { CommandResult, CommandResultType } from './commandresult';
import { CANCEL, Encoding } from "./common";
import { Config } from "./config";
import { bedrock_server_exe, cgate, ipfilter, MultiThreadQueue, NativePointer, StaticPointer, uv_async, VoidPointer } from "./core";
import { decay } from "./decay";
import { dll } from "./dll";
import { events } from "./event";
import { GetLine } from "./getline";
import { makefunc } from "./makefunc";
import { bool_t, CxxString, int32_t, int64_as_float_t, NativeType, void_t } from "./nativetype";
import { loadAllPlugins } from './plugins';
import { CxxStringWrapper } from "./pointer";
import { procHacker } from './prochacker';
import { remapError } from "./source-map-support";
import { MemoryUnlocker } from "./unlocker";
import { _tickCallback } from "./util";

declare module 'colors' {

    export const brightRed:Color;
    export const brightGreen:Color;
    export const brightYellow:Color;
    export const brightBlue:Color;
    export const brightMagenta:Color;
    export const brightCyan:Color;
    export const brightWhite:Color;

}

class Liner {
    private remaining = '';
    write(str:string):string|null {
        const lastidx = str.lastIndexOf('\n');
        if (lastidx === -1) {
            this.remaining += str;
            return null;
        } else {
            const out = this.remaining + str.substr(0, lastidx);
            this.remaining = str.substr(lastidx + 1);
            return out;
        }
    }
}

(global as any).server = createAbstractObject('Bedrock scripting API is removed');

let launched = false;
let closed = false;
let loadingIsFired = false;
let openIsFired = false;

const bedrockLogLiner = new Liner;

const commandQueue = new MultiThreadQueue(CxxString[NativeType.size]);
const commandQueueBuffer = new CxxStringWrapper(true);

function patchForStdio():void {
    // hook bedrock log
    asmcode.bedrockLogNp = makefunc.np((severity, msgptr, size)=>{
        // void(*callback)(int severity, const char* msg, size_t size)
        let line = bedrockLogLiner.write(msgptr.getString(size, 0, Encoding.Utf8));
        if (line === null) return;

        let color:colors.Color;
        switch (severity) {
        case 1:
            color = colors.white;
            break;
        case 2:
            color = colors.brightWhite;
            break;
        case 4:
            color = colors.brightYellow;
            break;
        default:
            color = colors.brightRed;
            break;
        }
        if (events.serverLog.fire(line, color) === CANCEL) return;
        line = color(line);
        console.log(line);
    }, void_t, {onError:asmcode.jsend_returnZero, name:'bedrockLogNp'}, int32_t, StaticPointer, int64_as_float_t);
    procHacker.write('?BedrockLogOut@@YAXIPEBDZZ', 0, asm().jmp64(asmcode.logHook, Register.rax));

    asmcode.CommandOutputSenderHookCallback = makefunc.np(line=>{
        // void(*callback)(std::string* line)
        const lines = line.split('\n');
        if (lines[lines.length-1].length === 0) lines.pop();

        for (const line of lines) {
            if (events.commandOutput.fire(line) !== CANCEL) {
                console.log(line);
            }
        }
    }, void_t, {onError: asmcode.jsend_returnZero, name:`CommandOutputSenderHookCallback`}, CxxString);
    procHacker.patching('hook-command-output', '?send@CommandOutputSender@@UEAAXAEBVCommandOrigin@@AEBVCommandOutput@@@Z', 0x58, asmcode.CommandOutputSenderHook, Register.rdx, true, [
        0x4C, 0x8B, 0x40, 0x10,       // mov r8,qword ptr ds:[rax+10]
        0x48, 0x83, 0x78, 0x18, 0x10, // cmp qword ptr ds:[rax+18],10
        0x72, 0x03,                   // jb bedrock_server.7FF7440A79A6
        0x48, 0x8B, 0x00,             // mov rax,qword ptr ds:[rax]
        0x48, 0x8B, 0xD0,             // mov rdx,rax
        0x48, 0x8B, 0xCB,             // mov rcx,rbx
        0xE8, null, null, null, null, // call <bedrock_server.class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64 __cdecl std::_Insert_string<char,struct std::char_traits<char>,unsigned __int64>(class std::basic
    ]);

    // hook stdin
    asmcode.commandQueue = commandQueue;
    asmcode.MultiThreadQueueTryDequeue = MultiThreadQueue.tryDequeue;
    procHacker.patching('hook-stdin-command', '?getLine@ConsoleInputReader@@QEAA_NAEAV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', 0, asmcode.ConsoleInputReader_getLine_hook, Register.rax, false, [
        0xE9, null, null, null, null,  // jmp SPSCQueue::tryDequeue
        0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, // int3 ...
    ]);

    // remove original stdin thread
    const justReturn = asm().ret().buffer();
    procHacker.write('??0ConsoleInputReader@@QEAA@XZ', 0, justReturn);
    procHacker.write('??1ConsoleInputReader@@QEAA@XZ', 0, justReturn);
    procHacker.write('?unblockReading@ConsoleInputReader@@QEAAXXZ', 0, justReturn);
}

function _launch(asyncResolve:()=>void):void {
    // check memory corruption for debug core
    if (cgate.memcheck != null) {
        const memcheck = setInterval(()=>{
            cgate.memcheck!();
        }, 500);
        events.serverClose.on(()=>{
            clearInterval(memcheck);
        });
    }

    ipfilter.init(ip=>{
        console.error(`[BDSX] traffic exceeded threshold for IP: ${ip}`);
    });

    asmcode.evWaitGameThreadEnd = dll.kernel32.CreateEventW(null, 0, 0, null);

    uv_async.open();

    // uv async callback, when BDS closed perfectly (end of the main function)
    function finishCallback():void {
        closed = true; // for if BDS failed to execute the game thread.

        uv_async.close();
        threadHandle.close();
        events.serverClose.fire();
        events.serverClose.clear();
        _tickCallback();
    }

    // replace unicode encoder
    if (Config.REPLACE_UNICODE_ENCODER) {
        asmcode.Core_String_toWide_string_span = cgate.toWide;
        procHacker.write('?toWide@String@Core@@SA?AV?$basic_string@_WU?$char_traits@_W@std@@V?$allocator@_W@2@@std@@PEBD@Z', 0,
            asm().jmp64(asmcode.Core_String_toWide_charptr, Register.rax));
        procHacker.write('?toWide@String@Core@@SA?AV?$basic_string@_WU?$char_traits@_W@std@@V?$allocator@_W@2@@std@@V?$basic_string_span@$$CBD$0?0@gsl@@@Z', 0,
            asm().jmp64(cgate.toWide, Register.rax));
    }

    // events
    asmcode.SetEvent = dll.kernel32.SetEvent.pointer;
    asmcode.CloseHandle = dll.kernel32.CloseHandle.pointer;
    asmcode.CreateEventW = dll.kernel32.CreateEventW.pointer;
    asmcode.WaitForSingleObject = dll.kernel32.WaitForSingleObject.pointer;

    // call game thread entry
    asmcode.gameThreadStart = makefunc.np(()=>{
        // empty
    }, void_t);
    asmcode.gameThreadFinish = makefunc.np(()=>{
        closed = true;
        decay(bedrockServer.serverInstance);
        decay(bedrockServer.networkHandler);
        decay(bedrockServer.minecraft);
        decay(bedrockServer.dedicatedServer);
        decay(bedrockServer.level);
        decay(bedrockServer.serverNetworkHandler);
        decay(bedrockServer.minecraftCommands);
        decay(bedrockServer.commandRegistry);
        decay(bedrockServer.gameRules);
        decay(bedrockServer.rakPeer);
        decay(bedrockServer.commandOutputSender);
        bedrockServer.nonOwnerPointerServerNetworkHandler.dispose();
        decay(bedrockServer.nonOwnerPointerServerNetworkHandler);
    }, void_t);
    asmcode.gameThreadInner = proc['<lambda_09545ac3fb7d475932bfc25c15253480>::operator()']; // caller of ServerInstance::_update
    asmcode.free = dll.ucrtbase.free.pointer;

    // hook game thread
    asmcode._Cnd_do_broadcast_at_thread_exit = dll.msvcp140._Cnd_do_broadcast_at_thread_exit;

    procHacker.patching(
        'hook-game-thread',
        'std::thread::_Invoke<std::tuple<<lambda_09545ac3fb7d475932bfc25c15253480> >,0>', // caller of ServerInstance::_update
        6,
        asmcode.gameThreadHook, // original depended
        Register.rax,
        true, [
            0x48, 0x8B, 0xD9, // mov rbx,rcx
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call <bedrock_server.<lambda_58543e61c869eb14b8c48d51d3fe120b>::operator()>
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call <bedrock_server._Cnd_do_broadcast_at_thread_exit>
        ],
        [4, 8, 9, 13],
    );

    // get server instance
    procHacker.hookingRawWithCallOriginal('??0ServerInstance@@QEAA@AEAVIMinecraftApp@@AEBV?$not_null@V?$NonOwnerPointer@VServerInstanceEventCoordinator@@@Bedrock@@@gsl@@@Z', asmcode.ServerInstance_ctor_hook, [Register.rcx, Register.rdx, Register.r8], []);

    patchForStdio();

    // seh wrapped main
    bedrock_server_exe.args.as(NativePointer).setPointer(null, 8); // remove options
    asmcode.bedrock_server_exe_args = bedrock_server_exe.args;
    asmcode.bedrock_server_exe_argc = 1; // bedrock_server_exe.argc;
    asmcode.bedrock_server_exe_main = bedrock_server_exe.main;
    asmcode.finishCallback = makefunc.np(finishCallback, void_t);

    {
        // restore main
        const unlock = new MemoryUnlocker(bedrock_server_exe.main, 12);
        bedrock_server_exe.main.add().copyFrom(bedrock_server_exe.mainOriginal12Bytes, 12);
        unlock.done();
    }

    // call main as a new thread
    // main will create a game thread.
    // and bdsx will hijack the game thread and run it on the node thread.
    const threadHandle = dll.kernel32.CreateThread(null, 0, asmcode.wrapped_main, null, 0, asmcode.addressof_bdsMainThreadId);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./bds/implements');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('./event_impl');

    loadingIsFired = true;
    events.serverLoading.promiseFire();
    events.serverLoading.clear();

    // hook on update
    asmcode.cgateNodeLoop = cgate.nodeLoop;
    asmcode.updateEvTargetFire = makefunc.np(()=>{
        events.serverUpdate.fire();
        _tickCallback();
    }, void_t, {name: 'events.serverUpdate.fire'});

    procHacker.patching('update-hook',
        '<lambda_09545ac3fb7d475932bfc25c15253480>::operator()', // caller of ServerInstance::_update
        0x871, asmcode.updateWithSleep, Register.rax, true, [
            0x48, 0x2B, 0xC8,                         // sub rcx,rax
            0x48, 0x81, 0xF9, 0x88, 0x13, 0x00, 0x00, // cmp rcx,1388
            0x7C, 0x0B,                               // jl bedrock_server.7FF743BA7B50
            0x48, 0x8D, 0x4C, 0x24, 0x20,             // lea rcx,qword ptr ss:[rsp+20]
            0xE8, null, null, null, null,             // call <bedrock_server.void __cdecl std::this_thread::sleep_until<struct std::chrono::steady_clock,class std::chrono::duration<__int64,struct std::ratio<1,1000000000> > >(class std::chrono::ti
            0x90,                                     // nop
        ]);

    // hook on script starting
    procHacker.hookingRawWithCallOriginal('?sendServerThreadStarted@ServerInstanceEventCoordinator@@QEAAXAEAVServerInstance@@@Z',
        makefunc.np(()=>{
            try {
                _tickCallback();
                cgate.nodeLoopOnce();

                const serverInstance = asmcode.serverInstance.as(bd_server.ServerInstance);
                const networkHandler = serverInstance.networkHandler;
                const minecraft = serverInstance.minecraft;
                const dedicatedServer = serverInstance.server;
                const level = minecraft.getLevel().as(ServerLevel);
                const nonOwnerPointerServerNetworkHandler = minecraft.getNonOwnerPointerServerNetworkHandler();
                const minecraftCommands = minecraft.getCommands();
                const commandRegistry = minecraftCommands.getRegistry();
                const gameRules = level.getGameRules();
                const rakPeer = networkHandler.instance.peer;
                const commandOutputSender = minecraftCommands.sender;
                const serverNetworkHandler = nonOwnerPointerServerNetworkHandler.get();

                Object.defineProperties(bedrockServer, {
                    serverInstance: {value: serverInstance},
                    networkHandler: {value: networkHandler},
                    minecraft: {value: minecraft},
                    dedicatedServer: {value: dedicatedServer},
                    level: {value: level},
                    serverNetworkHandler: {value: serverNetworkHandler},
                    nonOwnerPointerServerNetworkHandler: {value: nonOwnerPointerServerNetworkHandler},
                    minecraftCommands: {value: minecraftCommands},
                    commandRegistry: {value: commandRegistry},
                    gameRules: {value: gameRules},
                    rakPeer: {value: rakPeer},
                    commandOutputSender: {value: commandOutputSender},
                });

                Object.defineProperty(bd_server, 'serverInstance', { value:serverInstance });
                Object.defineProperty(nimodule, 'networkHandler', { value:networkHandler });

                openIsFired = true;
                events.serverOpen.fire();
                events.serverOpen.clear(); // it will never fire, clear it
                asyncResolve();

                _tickCallback();
                cgate.nodeLoopOnce();
            } catch (err) {
                events.errorFire(err);
            }
        }, void_t, {name: 'hook of ScriptEngine::startScriptLoading'}, VoidPointer),
        [Register.rcx, Register.rdx], []);

    procHacker.hookingRawWithCallOriginal('?startLeaveGame@Minecraft@@QEAAX_N@Z',
        makefunc.np((mc, b)=>{
            events.serverLeave.fire();
        }, void_t, {name: 'hook of Minecraft::startLeaveGame'}, bd_server.Minecraft, bool_t), [Register.rcx, Register.rdx], []);
    procHacker.hookingRawWithCallOriginal('?sendEvent@ServerInstanceEventCoordinator@@QEAAXAEBV?$EventRef@U?$ServerInstanceGameplayEvent@X@@@@@Z',
        makefunc.np(()=>{
            events.serverStop.fire();
            _tickCallback();
        }, void_t, {name: 'hook of shutdown'}), [Register.rcx, Register.rdx], []);

    // graceful kill for Network port occupied
    // BDS crashes at terminating on `Network port occupied`. it kills the crashing thread and keeps the node thread.
    // and BDSX finishes at the end of the node thread.
    asmcode.terminate = dll.ucrtbase.module.getProcAddress('terminate');
    asmcode.ExitThread = dll.kernel32.module.getProcAddress('ExitThread');
    procHacker.hookingRawWithoutOriginal('?terminate@details@gsl@@YAXXZ', asmcode.terminateHook);

    /**
     * send stdin to bedrockServer.executeCommandOnConsole
     * without this, you need to control stdin manually
     */
    bedrockServer.DefaultStdInHandler.install();
}

const stopfunc = procHacker.js('?stop@DedicatedServer@@UEAA_NXZ', void_t, null, VoidPointer);

function sessionIdGrabber(text: string): void {
    const tmp = text.match(/\[\d{4}-\d\d-\d\d \d\d:\d\d:\d\d:\d{3} INFO\] Session ID (.*)$/);
    if(tmp) {
        bedrockServer.sessionId = tmp[1];
        events.serverLog.remove(sessionIdGrabber);
    }
}
events.serverLog.on(sessionIdGrabber);

export namespace bedrockServer {
    export let sessionId: string;

    const abstractobject = createAbstractObject('bedrock_server is not launched yet');
    // eslint-disable-next-line prefer-const
    export let serverInstance:bd_server.ServerInstance = abstractobject;
    // eslint-disable-next-line prefer-const
    export let networkHandler:nimodule.NetworkHandler = abstractobject;
    // eslint-disable-next-line prefer-const
    export let minecraft:bd_server.Minecraft = abstractobject;
    // eslint-disable-next-line prefer-const
    export let level:ServerLevel = abstractobject;
    // eslint-disable-next-line prefer-const
    export let serverNetworkHandler:nimodule.ServerNetworkHandler = abstractobject;
    // eslint-disable-next-line prefer-const
    export let dedicatedServer:bd_server.DedicatedServer = abstractobject;
    // eslint-disable-next-line prefer-const
    export let minecraftCommands:MinecraftCommands = abstractobject;
    // eslint-disable-next-line prefer-const
    export let commandRegistry:CommandRegistry = abstractobject;
    // eslint-disable-next-line prefer-const
    export let gameRules:GameRules = abstractobject;
    // eslint-disable-next-line prefer-const
    export let rakPeer:RakNet.RakPeer = abstractobject;
    // eslint-disable-next-line prefer-const
    export let commandOutputSender:CommandOutputSender = abstractobject;
    // eslint-disable-next-line prefer-const
    export let nonOwnerPointerServerNetworkHandler:Bedrock.NonOwnerPointer<nimodule.ServerNetworkHandler> = abstractobject;

    Object.defineProperty(bd_server, 'serverInstance', {value: abstractobject, writable: true});
    Object.defineProperty(nimodule, 'networkHandler', {value: abstractobject, writable: true});

    export function withLoading():Promise<void> {
        return new Promise(resolve=>{
            if (loadingIsFired) {
                resolve();
            } else {
                events.serverLoading.on(resolve);
            }
        });
    }
    export function afterOpen():Promise<void> {
        return new Promise(resolve=>{
            if (openIsFired) {
                resolve();
            } else {
                events.serverOpen.on(resolve);
            }
        });
    }

    export function isLaunched():boolean {
        return launched;
    }

    export function isClosed():boolean {
        return closed;
    }

    /**
     * stop the BDS
     * It will stop next tick
     */
    export function stop():void {
        stopfunc(bedrockServer.dedicatedServer.add(8));
    }

    export function forceKill(exitCode:number):never {
        bedrock_server_exe.forceKill(exitCode);
    }

    export async function launch():Promise<void> {
        if (launched) {
            throw remapError(Error('Cannot launch BDS again'));
        }
        launched = true;

        await Promise.all([
            loadAllPlugins(),
            installMinecraftAddons(),
        ]);

        await new Promise<void>(_launch);
    }

    /**
     * pass to stdin
     */
    export function executeCommandOnConsole(command:string):void {
        commandQueueBuffer.construct();
        commandQueueBuffer.value = command;
        commandQueue.enqueue(commandQueueBuffer); // assumes the string is moved, and does not have the buffer anymore.
    }

    export declare function executeCommand(command:`testfor ${string}`, mute?:CommandResultType, permissionLevel?:CommandPermissionLevel, dimension?:Dimension|null):CommandResult<CommandResult.TestFor>;

    export declare function executeCommand(command:`testforblock ${string}`, mute?:CommandResultType, permissionLevel?:CommandPermissionLevel, dimension?:Dimension|null):CommandResult<CommandResult.TestForBlock>;

    export declare function executeCommand(command:`testforblocks ${string}`, mute?:CommandResultType, permissionLevel?:CommandPermissionLevel, dimension?:Dimension|null):CommandResult<CommandResult.TestForBlocks>;

    export declare function executeCommand(command:'list', mute?:CommandResultType, permissionLevel?:CommandPermissionLevel, dimension?:Dimension|null):CommandResult<CommandResult.List>;

    /**
     * it does the same thing with executeCommandOnConsole
     * but call the internal function directly
     * @param mute suppress outputs if true, returns data if null
     */
    export declare function executeCommand(command:string, mute?:CommandResultType, permissionLevel?:CommandPermissionLevel|null, dimension?:Dimension|null):CommandResult<CommandResult.Any>;

    let stdInHandler:DefaultStdInHandler|null = null;

    export abstract class DefaultStdInHandler {
        protected online:(line:string)=>void = executeCommandOnConsole;
        protected readonly onclose = ():void=>{
            this.close();
        };

        protected constructor() {
            // empty
        }

        abstract close():void;

        static install():DefaultStdInHandler {
            if (Config.USE_NATIVE_STDIN_HANDLER) {
                return NativeStdInHandler.install();
            } else {
                return NodeStdInHandler.install();
            }
        }
    }

    /**
     * this handler has bugs on Linux+Wine
     */
    export class NodeStdInHandler extends DefaultStdInHandler {
        private readonly rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        constructor() {
            super();

            this.rl.on('line', line=>this.online(line));
            events.serverClose.on(this.onclose);
        }

        close():void {
            if (stdInHandler === null) return;
            console.assert(stdInHandler !== null);
            stdInHandler = null;
            this.rl.close();
            this.rl.removeAllListeners();
            events.serverClose.remove(this.onclose);
        }

        static install():NodeStdInHandler {
            if (stdInHandler !== null) throw remapError(Error('Already opened'));
            return stdInHandler = new NodeStdInHandler;
        }
    }

    export class NativeStdInHandler extends DefaultStdInHandler {
        private readonly getline = new GetLine(line=>this.online(line));
        constructor() {
            super();
            events.serverClose.on(this.onclose);
        }

        close():void {
            if (stdInHandler === null) return;
            console.assert(stdInHandler !== null);
            stdInHandler = null;
            this.getline.close();
        }

        static install():NativeStdInHandler {
            if (stdInHandler !== null) throw remapError(Error('Already opened'));
            return stdInHandler = new NativeStdInHandler;
        }
    }
}
