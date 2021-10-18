"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedrockServer = void 0;
const asmcode = require("./asm/asmcode");
const assembler_1 = require("./assembler");
const commandorigin_1 = require("./bds/commandorigin");
const proc_1 = require("./bds/proc");
const capi_1 = require("./capi");
const command_1 = require("./command");
const common_1 = require("./common");
const core_1 = require("./core");
const dll_1 = require("./dll");
const event_1 = require("./event");
const getline_1 = require("./getline");
const makefunc_1 = require("./makefunc");
const nativetype_1 = require("./nativetype");
const pointer_1 = require("./pointer");
const source_map_support_1 = require("./source-map-support");
const unlocker_1 = require("./unlocker");
const util_1 = require("./util");
const colors = require("colors");
const bd_server = require("./bds/server");
require("./minecraft_impl");
const mcglobal_1 = require("./mcglobal");
class Liner {
    constructor() {
        this.remaining = '';
    }
    write(str) {
        const lastidx = str.lastIndexOf('\n');
        if (lastidx === -1) {
            this.remaining += str;
            return null;
        }
        else {
            const out = this.remaining + str.substr(0, lastidx);
            this.remaining = str.substr(lastidx + 1);
            return out;
        }
    }
}
let launched = false;
const loadingIsFired = util_1.DeferPromise.make();
const openIsFired = util_1.DeferPromise.make();
const bedrockLogLiner = new Liner;
const cmdOutputLiner = new Liner;
const commandQueue = new core_1.MultiThreadQueue(nativetype_1.CxxString[nativetype_1.NativeType.size]);
const commandQueueBuffer = new pointer_1.CxxStringWrapper(true);
function patchForStdio() {
    // hook bedrock log
    asmcode.bedrockLogNp = makefunc_1.makefunc.np((severity, msgptr, size) => {
        // void(*callback)(int severity, const char* msg, size_t size)
        let line = bedrockLogLiner.write(msgptr.getString(size, 0, common_1.Encoding.Utf8));
        if (line === null)
            return;
        let color;
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
        if (event_1.events.serverLog.fire(line, color) === common_1.CANCEL)
            return;
        line = color(line);
        console.log(line);
    }, nativetype_1.void_t, { onError: asmcode.jsend_returnZero }, nativetype_1.int32_t, core_1.StaticPointer, nativetype_1.int64_as_float_t);
    //  asmcode.bedrockLogNp = asmcode.jsend_returnZero;
    proc_1.procHacker.write('BedrockLogOut', 0, (0, assembler_1.asm)().jmp64(asmcode.logHook, assembler_1.Register.rax));
    asmcode.CommandOutputSenderHookCallback = makefunc_1.makefunc.np((bytes, ptr) => {
        // void(*callback)(const char* log, size_t size)
        const line = cmdOutputLiner.write(ptr.getString(bytes));
        if (line === null)
            return;
        if (event_1.events.commandOutput.fire(line) !== common_1.CANCEL) {
            console.log(line);
        }
    }, nativetype_1.void_t, { onError: asmcode.jsend_returnZero }, nativetype_1.int64_as_float_t, core_1.StaticPointer);
    proc_1.procHacker.patching('hook-command-output', 'CommandOutputSender::send', 0x217, asmcode.CommandOutputSenderHook, assembler_1.Register.rax, true, [
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x48, 0x8D, 0x15, 0xFF, 0xFF, 0xFF, 0xFF,
        0x48, 0x8B, 0xC8,
        0xFF, 0x15, 0xFF, 0xFF, 0xFF, 0xFF, // call qword ptr ds:[<&??5?$basic_istream@DU?$char_traits@D@std@@@std@@QEAAAEAV01@P6AAEAV01@AEAV01@@Z@Z>]
    ], [1, 5, 8, 12, 17, 21]);
    // hook stdin
    asmcode.commandQueue = commandQueue;
    asmcode.MultiThreadQueueTryDequeue = core_1.MultiThreadQueue.tryDequeue;
    proc_1.procHacker.patching('hook-stdin-command', 'ConsoleInputReader::getLine', 0, asmcode.ConsoleInputReader_getLine_hook, assembler_1.Register.rax, false, [
        0xE9, 0x3B, 0xF6, 0xFF, 0xFF,
        0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC, 0xCC // int3 ...
    ], [3, 7, 21, 25, 38, 42]);
    // remove original stdin thread
    const justReturn = (0, assembler_1.asm)().ret().buffer();
    proc_1.procHacker.write('ConsoleInputReader::ConsoleInputReader', 0, justReturn);
    proc_1.procHacker.write('ConsoleInputReader::~ConsoleInputReader', 0, justReturn);
    proc_1.procHacker.write('ConsoleInputReader::unblockReading', 0, justReturn);
}
function _launch(asyncResolve) {
    core_1.ipfilter.init(ip => {
        console.error(`[BDSX] traffic exceeded threshold for IP: ${ip}`);
    });
    core_1.jshook.init();
    asmcode.evWaitGameThreadEnd = dll_1.dll.kernel32.CreateEventW(null, 0, 0, null);
    core_1.uv_async.open();
    // uv async callback, when BDS closed perfectly
    function finishCallback() {
        core_1.uv_async.close();
        threadHandle.close();
        event_1.events.serverClose.fire();
        event_1.events.serverClose.clear();
        (0, util_1._tickCallback)();
    }
    // // call game thread entry
    asmcode.gameThreadInner = proc_1.proc['<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()'];
    asmcode.free = dll_1.dll.ucrtbase.free.pointer;
    asmcode.SetEvent = dll_1.dll.kernel32.SetEvent.pointer;
    // hook game thread
    asmcode.WaitForSingleObject = dll_1.dll.kernel32.WaitForSingleObject.pointer;
    asmcode._Cnd_do_broadcast_at_thread_exit = dll_1.dll.msvcp140._Cnd_do_broadcast_at_thread_exit;
    proc_1.procHacker.patching('hook-game-thread', 'std::thread::_Invoke<std::tuple<<lambda_8914ed82e3ef519cb2a85824fbe333d8> >,0>', 6, asmcode.gameThreadHook, // original depended
    assembler_1.Register.rax, true, [
        0x48, 0x8B, 0xD9,
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF, // call <bedrock_server._Cnd_do_broadcast_at_thread_exit>
    ], [4, 8, 9, 13]);
    // get server instance
    proc_1.procHacker.hookingRawWithCallOriginal('ServerInstance::ServerInstance', asmcode.ServerInstance_ctor_hook, [assembler_1.Register.rcx, assembler_1.Register.rdx, assembler_1.Register.r8], []);
    // it removes errors when run commands on shutdown.
    proc_1.procHacker.nopping('skip-command-list-destruction', 'ScriptEngine::~ScriptEngine', 0x7d, [
        0x48, 0x8D, 0x4B, 0x78,
        0xE8, 0x6A, 0xF5, 0xFF, 0xFF // call <bedrock_server.public: __cdecl std::deque<struct ScriptCommand,class std::allocator<struct ScriptCommand> >::~deque<struct ScriptCommand,class std::allocator<struct ScriptCommand> >(void) __ptr64>
    ], [5, 9]);
    // enable script
    proc_1.procHacker.nopping('force-enable-script', 'MinecraftServerScriptEngine::onServerThreadStarted', 0x38, [
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x84, 0xC0,
        0x0F, 0x84, 0xFF, 0xFF, 0xFF, 0xFF,
        0x48, 0x8B, 0x13,
        0x48, 0x8B, 0xCB,
        0xFF, 0x92, 0x88, 0x04, 0x00, 0x00,
        0x48, 0x8B, 0xC8,
        0xE8, 0xff, 0xff, 0xff, 0xff,
        0x48, 0x8B, 0xC8,
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x84, 0xC0,
        0x0F, 0x84, 0x06, 0x01, 0x00, 0x00, //je bedrock_server.7FF7C1CE94EF
    ], [1, 5, 9, 13, 16, 20, 29, 33, 37, 41]);
    patchForStdio();
    // seh wrapped main
    asmcode.bedrock_server_exe_args = core_1.bedrock_server_exe.args;
    asmcode.bedrock_server_exe_argc = core_1.bedrock_server_exe.argc;
    asmcode.bedrock_server_exe_main = core_1.bedrock_server_exe.main;
    asmcode.finishCallback = makefunc_1.makefunc.np(finishCallback, nativetype_1.void_t, null);
    {
        // restore main
        const unlock = new unlocker_1.MemoryUnlocker(core_1.bedrock_server_exe.main, 12);
        core_1.bedrock_server_exe.main.add().copyFrom(core_1.bedrock_server_exe.mainOriginal12Bytes, 12);
        unlock.done();
    }
    // call main as a new thread
    // main will create a game thread.
    // and bdsx will hijack the game thread and run it on the node thread.
    const [threadHandle] = capi_1.capi.createThread(asmcode.wrapped_main, null);
    require('./bds/implements');
    require('./event_impl');
    loadingIsFired.resolve();
    event_1.events.serverLoading.fire();
    event_1.events.serverLoading.clear();
    // skip to create the console of BDS
    proc_1.procHacker.write('ScriptApi::ScriptFramework::registerConsole', 0, (0, assembler_1.asm)().mov_r_c(assembler_1.Register.rax, 1).ret());
    // hook on update
    asmcode.cgateNodeLoop = core_1.cgate.nodeLoop;
    asmcode.updateEvTargetFire = makefunc_1.makefunc.np(() => event_1.events.serverUpdate.fire(), nativetype_1.void_t, null);
    proc_1.procHacker.patching('update-hook', '<lambda_8914ed82e3ef519cb2a85824fbe333d8>::operator()', 0x5f3, asmcode.updateWithSleep, assembler_1.Register.rcx, true, [
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x48, 0x8B, 0xD8,
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x48, 0x99,
        0x48, 0xF7, 0xFB,
        0x48, 0x69, 0xC8, 0x00, 0xCA, 0x9A, 0x3B,
        0x48, 0x69, 0xC2, 0x00, 0xCA, 0x9A, 0x3B,
        0x48, 0x99,
        0x48, 0xF7, 0xFB,
        0x48, 0x03, 0xC8,
        0x48, 0x8B, 0x44, 0x24, 0x20,
        0x48, 0x2B, 0xC1,
        0x48, 0x3D, 0x88, 0x13, 0x00, 0x00,
        0x7C, 0x0B,
        0x48, 0x8D, 0x4C, 0x24, 0x20,
        0xE8, 0xFF, 0xFF, 0xFF, 0xFF,
        0x90, // nop
    ], [1, 5, 9, 13, 62, 66]);
    // hook on script starting
    proc_1.procHacker.hookingRawWithCallOriginal('ScriptEngine::startScriptLoading', makefunc_1.makefunc.np((scriptEngine) => {
        try {
            core_1.cgate.nodeLoopOnce();
            mcglobal_1.mcglobal.init();
            openIsFired.resolve();
            event_1.events.serverOpen.fire();
            event_1.events.serverOpen.clear(); // it will never fire, clear it
            asyncResolve();
            (0, util_1._tickCallback)();
            proc_1.procHacker.js('ScriptEngine::_processSystemInitialize', nativetype_1.void_t, null, core_1.VoidPointer)(scriptEngine);
            (0, util_1._tickCallback)();
            core_1.cgate.nodeLoopOnce();
        }
        catch (err) {
            event_1.events.errorFire(err);
            (0, source_map_support_1.remapAndPrintError)(err);
        }
    }, nativetype_1.void_t, null, core_1.VoidPointer), [assembler_1.Register.rcx], []);
    proc_1.procHacker.hookingRawWithCallOriginal('ScriptEngine::shutdown', makefunc_1.makefunc.np(() => {
        try {
            event_1.events.serverStop.fire();
        }
        catch (err) {
            (0, source_map_support_1.remapAndPrintError)(err);
        }
    }, nativetype_1.void_t), [assembler_1.Register.rcx], []);
    // keep ScriptEngine variables. idk why it needs.
    proc_1.procHacker.write('MinecraftServerScriptEngine::onServerUpdateEnd', 0, (0, assembler_1.asm)().ret());
}
const stopfunc = proc_1.procHacker.js('DedicatedServer::stop', nativetype_1.void_t, null, core_1.VoidPointer);
const deleteServerCommandOrigin = makefunc_1.makefunc.js([0, 0], nativetype_1.void_t, { this: commandorigin_1.ServerCommandOrigin }, nativetype_1.int32_t);
commandorigin_1.ServerCommandOrigin[nativetype_1.NativeType.dtor] = () => deleteServerCommandOrigin.call(this, 1);
function sessionIdGrabber(text) {
    const tmp = text.match(/\[\d{4}-\d\d-\d\d \d\d:\d\d:\d\d INFO\] Session ID (.*)$/);
    if (tmp) {
        bedrockServer.sessionId = tmp[1];
        event_1.events.serverLog.remove(sessionIdGrabber);
    }
}
event_1.events.serverLog.on(sessionIdGrabber);
var bedrockServer;
(function (bedrockServer) {
    function withLoading() {
        return loadingIsFired;
    }
    bedrockServer.withLoading = withLoading;
    function afterOpen() {
        return openIsFired;
    }
    bedrockServer.afterOpen = afterOpen;
    function isLaunched() {
        return launched;
    }
    bedrockServer.isLaunched = isLaunched;
    /**
     * stop the BDS
     * It will stop next tick
     */
    function stop() {
        const server = bd_server.serverInstance.server;
        stopfunc(server.add(8));
    }
    bedrockServer.stop = stop;
    function forceKill(exitCode) {
        core_1.bedrock_server_exe.forceKill(exitCode);
    }
    bedrockServer.forceKill = forceKill;
    function launch() {
        return new Promise((resolve, reject) => {
            if (launched) {
                reject((0, source_map_support_1.remapError)(Error('Cannot launch BDS again')));
                return;
            }
            launched = true;
            _launch(resolve);
        });
    }
    bedrockServer.launch = launch;
    /**
     * pass to stdin
     * recommend using command.execute instead
     * It exists in anticipation of other unexpected effects.
     */
    function executeCommandOnConsole(command) {
        commandQueueBuffer.construct();
        commandQueueBuffer.value = command;
        commandQueue.enqueue(commandQueueBuffer); // assumes the string is moved, and does not have the buffer anymore.
    }
    bedrockServer.executeCommandOnConsole = executeCommandOnConsole;
    /**
     * @deprecated use 'command.execute' in 'bdsx/command'
     */
    function executeCommand(commandstr, mute, permissionLevel, dimension) {
        return command_1.command.execute(commandstr, mute, permissionLevel, dimension);
    }
    bedrockServer.executeCommand = executeCommand;
    let stdInHandler = null;
    class DefaultStdInHandler {
        constructor() {
            this.online = executeCommandOnConsole;
            this.getline = new getline_1.GetLine(line => this.online(line));
            this.onclose = () => {
                this.close();
            };
            event_1.events.serverClose.on(this.onclose);
        }
        static install() {
            if (stdInHandler !== null)
                throw (0, source_map_support_1.remapError)(Error('Already opened'));
            return stdInHandler = new DefaultStdInHandler;
        }
        close() {
            if (stdInHandler === null)
                return;
            console.assert(stdInHandler !== null);
            stdInHandler = null;
            this.getline.close();
        }
    }
    bedrockServer.DefaultStdInHandler = DefaultStdInHandler;
})(bedrockServer = exports.bedrockServer || (exports.bedrockServer = {}));
//# sourceMappingURL=launcher.js.map