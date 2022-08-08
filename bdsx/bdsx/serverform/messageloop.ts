import { VoidPointer } from "../core";
import { NativeModule } from "../dll";
import { bool_t, int32_t } from "../nativetype";
import { HWND, MSG } from "../windows_h";

let timer:NodeJS.Timeout|null = null;
let counter = 0;
const msg = new MSG(true);
const MAX_MSG_PER_MS = 64;

export namespace messageLoop {
    export function ref():void  {
        if (timer === null) {
            timer = setInterval(()=>{
                for (let i=0;i<MAX_MSG_PER_MS;i++) {
                    if (!PeekMessage(msg, null, 0, 0, PM_REMOVE)) break;
                    TranslateMessage(msg);
                    DispatchMessage(msg);
                }
            }, 1);
        }
        counter++;
    }
    export function unref():void  {
        if (timer === null) return;
        counter--;
        if (counter === 0) {
            clearInterval(timer);
            timer = null;
        }
    }
    export const user32 = NativeModule.load('user32.dll');
}

/*
 * PeekMessage() Options
 */
const PM_NOREMOVE =         0x0000;
const PM_REMOVE =           0x0001;
const PM_NOYIELD =          0x0002;

const PeekMessage = messageLoop.user32.getFunction('PeekMessageW', bool_t, null, MSG, HWND, int32_t, int32_t, int32_t);
const DispatchMessage = messageLoop.user32.getFunction('DispatchMessageW', VoidPointer, null, MSG);
const TranslateMessage = messageLoop.user32.getFunction('TranslateMessage', bool_t, null, MSG);
