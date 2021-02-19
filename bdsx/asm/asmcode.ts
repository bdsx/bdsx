
import { asm } from 'bdsx/assembler';
import { StaticPointer } from 'bdsx/core';
import { makefuncDefines } from 'bdsx/makefunc_defines';
import "../codealloc";
import path = require('path');
import { remapError } from 'bdsx/source-map-support';


let res:Record<string, StaticPointer>;
try {
    res = asm.loadFromFile(path.join(__dirname, '../bdsx/asm/asmcode.asm'), makefuncDefines, true).allocs();
    
} catch (err) {
    console.error(remapError(err).stack);
    process.exit(-1);
} 
export = res as {
    logHookAsyncCb:StaticPointer,
    logHook:StaticPointer,
    getout:StaticPointer,
    getout_invalid_parameter:StaticPointer,
    getout_invalid_parameter_count:StaticPointer,
    str_js2np:StaticPointer,
    str_np2js:StaticPointer,
    utf16_js2np:StaticPointer,
    buffer_to_pointer:StaticPointer,
    utf16_np2js:StaticPointer,
    bin64:StaticPointer,
    pointer_np2js:StaticPointer,
    pointer_np2js_nullable:StaticPointer,
    pointer_js_new:StaticPointer,
    GetCurrentThreadId:StaticPointer,
    bedrockLogNp:StaticPointer,
    memcpy:StaticPointer,
    asyncAlloc:StaticPointer,
    asyncPost:StaticPointer,
    sprintf:StaticPointer,
    JsHasException:StaticPointer,
    JsCreateError:StaticPointer,
    JsGetValueType:StaticPointer,
    JsStringToPointer:StaticPointer,
    JsGetArrayBufferStorage:StaticPointer,
    JsGetTypedArrayStorage:StaticPointer,
    JsGetDataViewStorage:StaticPointer,
    JsConstructObject:StaticPointer,
    js_undefined:StaticPointer,
    js_null:StaticPointer,
    js_true:StaticPointer,
    nodeThreadId:StaticPointer,
    JsGetAndClearException:StaticPointer,
    runtimeErrorFire:StaticPointer,
};