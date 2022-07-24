
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Config } from './config';
import { cgate, VoidPointer } from './core';
import { dll } from "./dll";
import { dllraw } from './dllraw';
import { fsutil } from './fsutil';
import { makefunc } from './makefunc';
import { nativeClass, NativeClass, nativeField, NativeStruct } from "./nativeclass";
import { bool_t, int32_t, NativeType, uint16_t } from './nativetype';
import { Wrapper } from './pointer';

function initWineExec():(commandLine:string, cwd?:string)=>void {
    @nativeClass()
    class STARTUPINFO extends NativeStruct {
        @nativeField(int32_t)
        cb:int32_t;
        @nativeField(VoidPointer)
        lpReserved:VoidPointer;
        @nativeField(VoidPointer)
        lpDesktop:VoidPointer;
        @nativeField(VoidPointer)
        lpTitle:VoidPointer;
        @nativeField(int32_t)
        dwX:int32_t;
        @nativeField(int32_t)
        dwY:int32_t;
        @nativeField(int32_t)
        dwXSize:int32_t;
        @nativeField(int32_t)
        dwYSize:int32_t;
        @nativeField(int32_t)
        dwXCountChars:int32_t;
        @nativeField(int32_t)
        dwYCountChars:int32_t;
        @nativeField(int32_t)
        dwFillAttribute:int32_t;
        @nativeField(int32_t)
        dwFlags:int32_t;
        @nativeField(uint16_t)
        wShowWindow:uint16_t;
        @nativeField(uint16_t)
        cbReserved2:uint16_t;
        @nativeField(VoidPointer)
        lpReserved2:VoidPointer;
        @nativeField(VoidPointer)
        hStdInput:VoidPointer;
        @nativeField(VoidPointer)
        hStdOutput:VoidPointer;
        @nativeField(VoidPointer)
        hStdError:VoidPointer;

        clear():void {
            this.fill(0, STARTUPINFO[NativeType.size]);
            this.cb = PROCESS_INFORMATION[NativeType.size];
        }
    }

    @nativeClass()
    class PROCESS_INFORMATION extends NativeStruct {
        @nativeField(VoidPointer)
        hProcess:VoidPointer;
        @nativeField(VoidPointer)
        hThread:VoidPointer;
        @nativeField(int32_t)
        dwProcessId:int32_t;
        @nativeField(int32_t)
        dwThreadId:int32_t;

        clear():void {
            this.fill(0, PROCESS_INFORMATION[NativeType.size]);
        }
    }

    const CreateProcess = makefunc.js(cgate.GetProcAddress(dllraw.kernel32.module, 'CreateProcessW'),
        bool_t,
        null,
        makefunc.Utf16,
        makefunc.Utf16,
        VoidPointer,
        VoidPointer,
        bool_t,
        int32_t,
        VoidPointer,
        makefunc.Utf16,
        STARTUPINFO,
        PROCESS_INFORMATION);

    const Int32Wrapper = Wrapper.make(int32_t);

    const GetExitCodeProcess = makefunc.js(cgate.GetProcAddress(dllraw.kernel32.module, 'GetExitCodeProcess'),
        bool_t,
        null,
        VoidPointer,
        Int32Wrapper,
    );

    /**
     * call kernel32.dll!CreateProcess
     * @param cwd default is the project root.
     */
    function createSync(exePath:string, parameters:string, cwd:string = fsutil.projectPath):number {
        const INFINITE = -1;
        const si = new STARTUPINFO(true);
        const pi = new PROCESS_INFORMATION(true);
        si.clear();
        pi.clear();
        const res = CreateProcess(exePath, parameters, null, null, false, 0, null, cwd, si, pi);
        if (!res) {
            throw Error(`CreateProcess failed with ${dll.kernel32.GetLastError()} error`);
        }
        dll.kernel32.WaitForSingleObject(pi.hProcess, INFINITE);
        const out = new Int32Wrapper(true);
        GetExitCodeProcess(pi.hProcess, out);
        dll.kernel32.CloseHandle(pi.hProcess);
        dll.kernel32.CloseHandle(pi.hThread);
        return out.value;
    }

    return (commandLine:string, cwd?:string)=>{
        // XXX: wine bdsx cannot access process.env.compsec
        createSync('C:\\windows\\system32\\cmd.exe', `/c /bin/sh -c "${commandLine}"`, cwd);
    };
}

export namespace wineCompatible {
    /**
     * it uses /bin/sh if it's on Wine.
     * use child_process.execSync on Windows.
     * @param cwd default is the project root.
     */
    export declare function execSync(commandLine:string, cwd?:string):void;
    /**
     * bdsx cannot detect broken symlinks on Wine.
     * use shell for deleting them.
     * use fs methods on Windows.
     */
    export declare function removeRecursiveSync(path:string):void;
}

if (Config.WINE) {
    wineCompatible.execSync = initWineExec();
    wineCompatible.removeRecursiveSync = function(filepath:string) {
        if (!filepath.startsWith('Z:')) throw Error(`${filepath}: no linux path`);
        wineCompatible.execSync('rm -rf '+filepath.substr(2).replace(/\\/g, '/'), process.cwd());
    };
} else {
    wineCompatible.execSync = (commandLine:string, cwd?:string)=>{
        child_process.execSync(commandLine, {stdio:'inherit', cwd:cwd != null ? cwd : fsutil.projectPath});
    };
    wineCompatible.removeRecursiveSync = function(filepath:string) {
        const s = fs.statSync(filepath);
        if (s.isDirectory()) {
            const files = fs.readdirSync(filepath);
            for (const file of files) {
                wineCompatible.removeRecursiveSync(path.join(filepath, file));
            }
            fs.rmdirSync(filepath);
        } else {
            fs.unlinkSync(filepath);
        }
    };
}
