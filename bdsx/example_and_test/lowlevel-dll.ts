
// Call Native Functions
import { VoidPointer } from "bdsx/core";
import { NativeModule } from "bdsx/dll";
import { makefunc } from "bdsx/makefunc";
import { void_t } from "bdsx/nativetype";

const kernel32 = NativeModule.load('Kernel32.dll');
const user32 = NativeModule.load('User32.dll');
const GetConsoleWindow = kernel32.getFunction('GetConsoleWindow', VoidPointer);
const SetWindowText = user32.getFunction('SetWindowTextW', void_t, null, VoidPointer, makefunc.Utf16);
const wnd = GetConsoleWindow();
SetWindowText(wnd, 'BDSX Window!!!');
