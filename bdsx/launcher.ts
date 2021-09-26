import { asmcode } from "./asm/asmcode";
import { asm, Register } from "./assembler";
import { CommandContext, MCRESULT } from "./bds/command";
import { CommandOrigin, ServerCommandOrigin } from "./bds/commandorigin";
import { Dimension } from "./bds/dimension";
import { ServerLevel } from "./bds/level";
import { proc, procHacker } from "./bds/proc";
import { capi } from "./capi";
import { CANCEL, Encoding } from "./common";
import { bedrock_server_exe, cgate, ipfilter, jshook, MultiThreadQueue, StaticPointer, uv_async, VoidPointer } from "./core";
import { dll } from "./dll";
import { events } from "./event";
import { GetLine } from "./getline";
import { makefunc } from "./makefunc";
import { CxxString, int32_t, int64_as_float_t, NativeType, void_t } from "./nativetype";
import { CxxStringWrapper, Wrapper } from "./pointer";
import { SharedPtr } from "./sharedpointer";
import { remapAndPrintError, remapError } from "./source-map-support";
import { MemoryUnlocker } from "./unlocker";
import { _tickCallback } from "./util";

import readline = require("readline");
import colors = require('colors');
import bd_server = require("./bds/server");
import nimodule = require("./bds/networkidentifier");
import { createAbstractObject } from "./abstractobject";

declare module 'colors'
{

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

(global as any).server = createAbstractObject('BDS is not launched yet. `server` is available after the launch');

let launched = false;
let loadingIsFired = false;
let openIsFired = false;

const bedrockLogLiner = new Liner;
const cmdOutputLiner = new Liner;

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
    }, void_t, {onError:asmcode.jsend_returnZero}, int32_t, StaticPointer, int64_as_float_t);
    procHacker.write('BedrockLogOut', 0, asm().jmp64(asmcode.logHook, Register.rax));

    asmcode.CommandOutputSenderHookCallback = makefunc.np((bytes, ptr)=>{
        // void(*callback)(const char* log, size_t size)
        const line = cmdOutputLiner.write(ptr.getString(bytes));
        if (line === null) return;
        if (events.commandOutput.fire(line) !== CANCEL) {
            console.log(line);
        }
    }, void_t, {onError: asmcode.jsend_returnZero}, int64_as_float_t, StaticPointer);
    procHacker.patching('hook-command-output', 'CommandOutputSender::send', 0x1A9, asmcode.CommandOutputSenderHook, Register.rax, true, [
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,               // call <bedrock_server.class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64 __cdecl std::_Insert_string<char,struct std::char_traits<char>,unsigned __int64>(class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64,char const * __ptr64 const,uns>
        0x48, 0x8D, 0x15, 0xFF, 0xFF, 0xFF, 0xFF,   // lea rdx,qword ptr ds:[<class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64 __cdecl std::flush<char,struct std::char_traits<char> >(class std::basic_ostream<char,struct std::char_traits<char> > & __ptr64)>]
        0x48, 0x8B, 0xC8,                           // mov rcx,rax
        0xFF, 0x15, 0xFF, 0xFF, 0xFF, 0xFF,         // call qword ptr ds:[<&??5?$basic_istream@DU?$char_traits@D@std@@@std@@QEAAAEAV01@P6AAEAV01@AEAV01@@Z@Z>]
    ], [1, 5,  8, 12,  17, 21]);


    // hook stdin
    asmcode.commandQueue = commandQueue;
    asmcode.MultiThreadQueueTryDequeue = MultiThreadQueue.tryDequeue;
    procHacker.patching('hook-stdin-command', 'ConsoleInputReader::getLine', 0, asmcode.ConsoleInputReader_getLine_hook, Register.rax, false, [
        0xE9, 0x3B, 0xF6, 0xFF, 0xFF,  // jmp SPSCQueue::tryDequeue
        0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC // int3 ...
    ], [3, 7, 21, 25, 38, 42]);

    // remove original stdin thread
    const justReturn = asm().ret().buffer();
    procHacker.write('ConsoleInputReader::ConsoleInputReader', 0, justReturn);
    procHacker.write('ConsoleInputReader::~ConsoleInputReader', 0, justReturn);
    procHacker.write('ConsoleInputReader::unblockReading', 0, justReturn);
}

function _launch(asyncResolve:()=>void):void {
    ipfilter.init(ip=>{
        console.error(`[BDSX] traffic exceeded threshold for IP: ${ip}`);
    });
    jshook.init();

    asmcode.evWaitGameThreadEnd = dll.kernel32.CreateEventW(null, 0, 0, null);

    uv_async.open();

    // uv async callback, when BDS closed perfectly
    function finishCallback():void {
        uv_async.close();
        threadHandle.close();
        events.serverClose.fire();
        events.serverClose.clear();
        _tickCallback();
    }

    // // call game thread entry
    asmcode.gameThreadInner = proc['<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()'];
    asmcode.free = dll.ucrtbase.free.pointer;
    asmcode.SetEvent = dll.kernel32.SetEvent.pointer;

    // hook game thread
    asmcode.WaitForSingleObject = dll.kernel32.WaitForSingleObject.pointer;
    asmcode._Cnd_do_broadcast_at_thread_exit = dll.msvcp140._Cnd_do_broadcast_at_thread_exit;

    procHacker.patching(
        'hook-game-thread',
        'std::thread::_Invoke<std::tuple<<lambda_8914ed82e3ef519cb2a85824fbe333d8> >,0>',
        6,
        asmcode.gameThreadHook, // original depended
        Register.rax,
        true, [
            0x48, 0x8B, 0xD9, // mov rbx,rcx
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call <bedrock_server.<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()>
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call <bedrock_server._Cnd_do_broadcast_at_thread_exit>
        ],
        [4, 8, 9, 13]
    );

    // get server instance
    procHacker.hookingRawWithCallOriginal('ServerInstance::ServerInstance', asmcode.ServerInstance_ctor_hook, [Register.rcx, Register.rdx, Register.r8], []);

    // it removes errors when run commands on shutdown.
    procHacker.nopping('skip-command-list-destruction', 'ScriptEngine::~ScriptEngine', 0x7d, [
        0x48, 0x8D, 0x4B, 0x78,      // lea rcx,qword ptr ds:[rbx+78]
        0xE8, 0x6A, 0xF5, 0xFF, 0xFF // call <bedrock_server.public: __cdecl std::deque<struct ScriptCommand,class std::allocator<struct ScriptCommand> >::~deque<struct ScriptCommand,class std::allocator<struct ScriptCommand> >(void) __ptr64>
    ], [5, 9]);

    // enable script
    procHacker.nopping('force-enable-script', 'MinecraftServerScriptEngine::onServerThreadStarted', 0x38, [
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,       // call <bedrock_server.public: static bool __cdecl ScriptEngine::isScriptingEnabled(void)>
        0x84, 0xC0,                         // test al,al
        0x0F, 0x84, 0xFF, 0xFF, 0xFF, 0xFF, // je bedrock_server.7FF7345226F3
        0x48, 0x8B, 0x13,                   // mov rdx,qword ptr ds:[rbx]                                                                                                                                                                                                                                                                          | rdx:&"졧\\직\x7F", rbx:L"뛠펇ǳ"
        0x48, 0x8B, 0xCB,                   // mov rcx,rbx                                                                                                                                                                                                                                                                                         | rbx:L"뛠펇ǳ"
        0xFF, 0x92, 0x90, 0x04, 0x00, 0x00, // call qword ptr ds:[rdx+490]
        0x48, 0x8B, 0xC8,                   // mov rcx,rax
        0xE8, 0xff, 0xff, 0xff, 0xff,       // call <bedrock_server.public: class Experiments & __ptr64 __cdecl LevelData::getExperiments(void) __ptr64>
        0x48, 0x8B, 0xC8,                   // mov rcx,rax
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,       // call <bedrock_server.public: bool __cdecl Experiments::Scripting(void)const __ptr64>
        0x84, 0xC0,                         // test al,al
        0x0F, 0x84, 0x06, 0x01, 0x00, 0x00, // je bedrock_server.7FF658BDDB5F
    ], [1, 5, 9, 13, 16, 20, 29, 33, 37, 41]);

    patchForStdio();

    // seh wrapped main
    asmcode.bedrock_server_exe_args = bedrock_server_exe.args;
    asmcode.bedrock_server_exe_argc = bedrock_server_exe.argc;
    asmcode.bedrock_server_exe_main = bedrock_server_exe.main;
    asmcode.finishCallback = makefunc.np(finishCallback, void_t, null);

    {
        // restore main
        const unlock = new MemoryUnlocker(bedrock_server_exe.main, 12);
        bedrock_server_exe.main.add().copyFrom(bedrock_server_exe.mainOriginal12Bytes, 12);
        unlock.done();
    }

    // call main as a new thread
    // main will create a game thread.
    // and bdsx will hijack the game thread and run it on the node thread.
    const [threadHandle] = capi.createThread(asmcode.wrapped_main, null);

    require('./bds/implements');
    require('./event_impl');

    loadingIsFired = true;
    events.serverLoading.fire();
    events.serverLoading.clear();

    // skip to create the console of BDS
    procHacker.write('ScriptApi::ScriptFramework::registerConsole', 0, asm().mov_r_c(Register.rax, 1).ret());

    // hook on update
    asmcode.cgateNodeLoop = cgate.nodeLoop;
    asmcode.updateEvTargetFire = makefunc.np(()=>events.serverUpdate.fire(), void_t, null);

    procHacker.patching('update-hook', '<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()', 0x5fb,
        asmcode.updateWithSleep, Register.rcx, true, [
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,  // call <bedrock_server._Query_perf_frequency>
            0x48, 0x8B, 0xD8,  // mov rbx,rax
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,  // call <bedrock_server._Query_perf_counter>
            0x48, 0x99,  // cqo
            0x48, 0xF7, 0xFB,  // idiv rbx
            0x48, 0x69, 0xC8, 0x00, 0xCA, 0x9A, 0x3B,  // imul rcx,rax,3B9ACA00
            0x48, 0x69, 0xC2, 0x00, 0xCA, 0x9A, 0x3B,  // imul rax,rdx,3B9ACA00
            0x48, 0x99,  // cqo
            0x48, 0xF7, 0xFB,  // idiv rbx
            0x48, 0x03, 0xC1,  // add rax,rcx
            0x48, 0x8B, 0x4c, 0x24, 0x20,  // mov rax,qword ptr ss:[rsp+20]
            0x48, 0x2B, 0xC8,  // sub rcx,rax
            0x48, 0x81, 0xF9, 0x88, 0x13, 0x00, 0x00,  // cmp rax,1388
            0x7C, 0x0B,  // jl bedrock_server.7FF733FDEE76
            0x48, 0x8D, 0x4C, 0x24, 0x20,  // lea rcx,qword ptr ss:[rsp+20]
            0xE8, 0xFF, 0xFF, 0xFF, 0xFF,  // call <bedrock_server.void __cdecl std::this_thread::sleep_until<struct std::chrono::steady_clock,class std::chrono::duration<__int64,struct std::ratio<1,1000000000> > >(class std::chrono::time_point<struct std::chrono::steady_clock,class std::chrono::duration<__int64,struct s>
            0x90,  // nop
        ], [1, 5, 9, 13, 63, 67]);

    // hook on script starting
    procHacker.hookingRawWithCallOriginal('ScriptEngine::startScriptLoading',
        makefunc.np((scriptEngine:VoidPointer)=>{
            try {
                cgate.nodeLoopOnce();

                bd_server.serverInstance = asmcode.serverInstance.as(bd_server.ServerInstance);
                nimodule.networkHandler = bd_server.serverInstance.networkHandler;
                openIsFired = true;
                events.serverOpen.fire();
                events.serverOpen.clear(); // it will never fire, clear it
                asyncResolve();
                _tickCallback();

                procHacker.js('ScriptEngine::_processSystemInitialize', void_t, null, VoidPointer)(scriptEngine);
                _tickCallback();
                cgate.nodeLoopOnce();
            } catch (err) {
                events.errorFire(err);
                remapAndPrintError(err);
            }
        }, void_t, null, VoidPointer),
        [Register.rcx], []);

    procHacker.hookingRawWithCallOriginal('ScriptEngine::shutdown',
        makefunc.np(()=>{
            try {
                events.serverStop.fire();
            } catch (err) {
                remapAndPrintError(err);
            }
        }, void_t), [Register.rcx], []);

    // keep ScriptEngine variables. idk why it needs.
    procHacker.write('MinecraftServerScriptEngine::onServerUpdateEnd', 0, asm().ret());
}

const stopfunc = procHacker.js('DedicatedServer::stop', void_t, null, VoidPointer);

const commandVersion = proc['CommandVersion::CurrentVersion'].getInt32();
const commandContextRefCounterVftable = proc["std::_Ref_count_obj2<CommandContext>::`vftable'"];
const CommandOriginWrapper = Wrapper.make(CommandOrigin.ref());
const commandContextConstructor = procHacker.js('CommandContext::CommandContext', void_t, null,
    CommandContext, CxxString, CommandOriginWrapper, int32_t);
const CommandContextSharedPtr = SharedPtr.make(CommandContext);
function createCommandContext(command:CxxString, commandOrigin:Wrapper<CommandOrigin>):SharedPtr<CommandContext> {
    const sharedptr = new CommandContextSharedPtr(true);
    sharedptr.create(commandContextRefCounterVftable);
    commandContextConstructor(sharedptr.p, command, commandOrigin, commandVersion);
    return sharedptr;
}

const serverCommandOriginConstructor = procHacker.js('ServerCommandOrigin::ServerCommandOrigin', void_t, null,
    ServerCommandOrigin, CxxString, ServerLevel, int32_t, Dimension);

function createServerCommandOrigin(name:CxxString, level:ServerLevel, permissionLevel:number, dimension:Dimension|null):Wrapper<CommandOrigin> {
    const wrapper = new CommandOriginWrapper(true);
    const origin = capi.malloc(ServerCommandOrigin[NativeType.size]).as(ServerCommandOrigin);
    wrapper.value = origin;
    serverCommandOriginConstructor(origin, name, level, permissionLevel, dimension);
    return wrapper;
}

const deleteServerCommandOrigin = makefunc.js([0, 0], void_t, {this:ServerCommandOrigin}, int32_t);
ServerCommandOrigin[NativeType.dtor] = ()=>deleteServerCommandOrigin.call(this, 1);

function sessionIdGrabber(text: string): void {
    const tmp = text.match(/\[\d{4}-\d\d-\d\d \d\d:\d\d:\d\d INFO\] Session ID (.*)$/);
    if(tmp) {
        bedrockServer.sessionId = tmp[1];
        events.serverLog.remove(sessionIdGrabber);
    }
}
events.serverLog.on(sessionIdGrabber);

export namespace bedrockServer
{
    export let sessionId: string;

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

    /**
     * stop the BDS
     * It will stop next tick
     */
    export function stop():void {
        const server = bd_server.serverInstance.server;
        stopfunc(server.add(8));
    }

    export function forceKill(exitCode:number):never {
        bedrock_server_exe.forceKill(exitCode);
    }

    export function launch():Promise<void> {
        return new Promise((resolve, reject)=>{
            if (launched) {
                reject(remapError(Error('Cannot launch BDS again')));
                return;
            }
            launched = true;
            _launch(resolve);
        });
    }

    /**
     * pass to stdin
     */
    export function executeCommandOnConsole(command:string):void {
        commandQueueBuffer.construct();
        commandQueueBuffer.value = command;
        commandQueue.enqueue(commandQueueBuffer); // assumes the string is moved, and does not have the buffer anymore.
    }

    /**
     * it does the same thing with executeCommandOnConsole
     * but call the internal function directly
     */
    export function executeCommand(command:string, mute:boolean=true, permissionLevel:number=4, dimension:Dimension|null = null):MCRESULT {
        const origin = createServerCommandOrigin('Server',
            bd_server.serverInstance.minecraft.getLevel() as ServerLevel, // I'm not sure it's always ServerLevel
            permissionLevel,
            dimension);

        const ctx = createCommandContext(command, origin);
        const res = bd_server.serverInstance.minecraft.getCommands().executeCommand(ctx, mute);

        ctx.destruct();
        origin.destruct();

        return res;
    }

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
            if (stdInHandler !== null) throw remapError(Error('Already opened'));
            return stdInHandler = new DefaultStdInHandlerGetLine;
        }
    }

    /**
     * this handler has bugs on Linux+Wine
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class DefaultStdInHandlerJs extends DefaultStdInHandler {
        private readonly rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
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
    }

    class DefaultStdInHandlerGetLine extends DefaultStdInHandler {
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
    }
}
