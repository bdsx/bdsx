import { asmcode } from "../asm/asmcode";
import { asm } from "../assembler";
import { Encoding } from "../common";
import { chakraUtil, VoidPointer } from "../core";
import { dll } from "../dll";
import { makefunc } from "../makefunc";
import { bool_t, int32_t, NativeType } from "../nativetype";
import { remapAndPrintError } from "../source-map-support";
import { ATOM, BS_DEFPUSHBUTTON, COLOR_WINDOW, CREATESTRUCT, CS_HREDRAW, CS_VREDRAW, CW_USEDEFAULT, HWND, IDC_ARROW, WNDCLASSEXW, WS_CAPTION, WS_CHILD, WS_SYSMENU, WS_TABSTOP, WS_VISIBLE } from "../windows_h";
import { messageLoop } from "./messageloop";

const user32 = messageLoop.user32;
const CreateWindowEx = user32.getFunction('CreateWindowExW', HWND, null,
    int32_t, VoidPointer, makefunc.Utf16, int32_t, int32_t, int32_t, int32_t, int32_t, HWND, VoidPointer, VoidPointer, VoidPointer);
const RegisterClass = user32.getFunction('RegisterClassExW', ATOM, null, WNDCLASSEXW);
const LoadCursor = user32.getFunction('LoadCursorW', VoidPointer, null,
    VoidPointer, VoidPointer);
const GetSysColorBrush = user32.getFunction('GetSysColorBrush', VoidPointer, null,
    int32_t);
const DefWindowProc = user32.getFunction('DefWindowProcW', VoidPointer, null,
    HWND, int32_t, VoidPointer, VoidPointer);
const CloseWindow = user32.getFunction('CloseWindow', bool_t, null, HWND);
const GetWindowLongPtr = user32.getFunction('GetWindowLongPtrW', VoidPointer, null, HWND, int32_t);
const SetWindowLongPtr = user32.getFunction('SetWindowLongPtrW', VoidPointer, null, HWND, int32_t, VoidPointer);

const WM_NCCREATE =                     0x0081;
const WM_DESTROY =                      0x0002;
const WM_COMMAND =                      0x0111;

const GWLP_WNDPROC =       (-4);
const GWLP_HINSTANCE =     (-6);
const GWLP_HWNDPARENT =    (-8);
const GWLP_USERDATA =      (-21);
const GWLP_ID =            (-12);

const ITEM_ID_START = 100;

let classRegistered = false;
const CLASS_NAME = 'bdsx_server_ui';
const CLASS_NAME_PTR = asm.const_str(CLASS_NAME, Encoding.Utf16);
const CLASS_BUTTON = asm.const_str('BUTTON', Encoding.Utf16);

const arrowCursor = LoadCursor(null, IDC_ARROW);
const bgBrush = GetSysColorBrush(COLOR_WINDOW);

const fromJsValue = makefunc.js(asmcode.returnRcx, makefunc.JsValueRef, null, VoidPointer);

const wndProc = makefunc.np((window, msg, wParam, lParam)=>{
    try {
        let serverUi:ServerForm;
        if (msg === WM_NCCREATE) {
            const param = lParam.as(CREATESTRUCT).lpCreateParams;
            SetWindowLongPtr(window, GWLP_USERDATA, param);
            serverUi = fromJsValue(param);
        } else {
            const value = GetWindowLongPtr(window, GWLP_USERDATA);
            serverUi = fromJsValue(value);
        }
        if (serverUi instanceof ServerForm) {
            serverUi.onMessage(msg, wParam, lParam);
        }
    } catch (err) {
        remapAndPrintError(err);
    }
    return DefWindowProc(window, msg, wParam, lParam);
}, VoidPointer, null, HWND, int32_t, VoidPointer, VoidPointer);

export class ServerForm {
    private readonly handle:HWND;
    private alive = true;
    private readonly buttonCbs:(()=>void)[] = [];

    constructor(title:string, width:number, height:number) {
        if (!classRegistered) {
            classRegistered = true;
            const cls = new WNDCLASSEXW(true);
            cls.cbSize = WNDCLASSEXW[NativeType.size];
            cls.style = CS_HREDRAW | CS_VREDRAW;
            cls.lpfnWndProc = wndProc;
            cls.cbClsExtra = 0;
            cls.cbWndExtra = 0;
            cls.hInstance = dll.current;
            cls.hIcon = null;
            cls.hCursor = arrowCursor;
            cls.hbrBackground = bgBrush;
            cls.lpszMenuName = null;
            cls.lpszClassName = CLASS_NAME_PTR;
            cls.hIconSm = null;
            RegisterClass(cls);
        }
        messageLoop.ref();
        chakraUtil.JsAddRef(this);
        this.handle = CreateWindowEx(0, CLASS_NAME_PTR, title, WS_VISIBLE | WS_CAPTION | WS_SYSMENU,
            CW_USEDEFAULT, CW_USEDEFAULT, width, height, null, null, dll.current, chakraUtil.asJsValueRef(this));
    }

    button(name:string, x:number, y:number, width:number, height:number, cb:()=>void):void {
        const id = this.buttonCbs.push(cb) - 1;
        CreateWindowEx(0, CLASS_BUTTON, name, WS_VISIBLE | WS_CHILD | WS_TABSTOP | BS_DEFPUSHBUTTON, x, y, width, height,
            this.handle, VoidPointer.fromAddress(ITEM_ID_START+id, 0), dll.current, null);
    }

    onMessage(msg:number, wParam:VoidPointer, lParam:VoidPointer):void {
        switch (msg) {
        case WM_DESTROY:
            if (this.alive) {
                this.alive = false;
                messageLoop.unref();
                chakraUtil.JsRelease(this);
            }
            break;
        case WM_COMMAND: {
            const id = wParam.getAddressLow() & 0xffff;
            if (id >= ITEM_ID_START) {
                const cb = this.buttonCbs[id-ITEM_ID_START];
                if (cb != null) cb();
            }
            break;
        }
        }
    }

    close():void {
        CloseWindow(this.handle);
    }
}
