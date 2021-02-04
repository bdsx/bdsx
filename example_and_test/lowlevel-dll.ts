
// Call Native Functions
import { NativeModule, RawTypeId, VoidPointer } from "bdsx";

const kernel32 = NativeModule.load('Kernel32.dll');
const user32 = NativeModule.load('User32.dll');
const GetConsoleWindow = kernel32.getFunction('GetConsoleWindow', VoidPointer);
const SetWindowText = user32.getFunction('SetWindowTextW', RawTypeId.Void, null, VoidPointer, RawTypeId.StringUtf16);
const wnd = GetConsoleWindow();
SetWindowText(wnd, 'BDSX Window!!!');
