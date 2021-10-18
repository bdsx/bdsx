/**
 * Generated with bdsx-dev/src/tools/asm/compile.ts.
 * Please DO NOT modify this directly.
 */
const { cgate, runtimeError } = require('../../core');
const { asm } = require('../../assembler');
require('../../codealloc');
const buffer = cgate.allocExecutableMemory(96, 8);
buffer.setBin('\u8348\u18ec\uc031\u8b48\u3305\u0000\u4800\uc483\uc318\ue9e8\uffff\uffff\u3315\u0000\uc300\u0000\u0001\u0000\u0001\u0000\u0000\u0000\u0012\u0000\u0020\u0000\u0012\u0000\u001e\u0000\u0024\u0000');
module.exports = {
    get retvalue(){
        return buffer.getPointer(64);
    },
    set retvalue(n){
        buffer.setPointer(n, 64);
    },
    get addressof_retvalue(){
        return buffer.add(64);
    },
    get retvalue2(){
        return buffer.getPointer(72);
    },
    set retvalue2(n){
        buffer.setPointer(n, 72);
    },
    get addressof_retvalue2(){
        return buffer.add(72);
    },
    get testfn2(){
        return buffer.getPointer(80);
    },
    set testfn2(n){
        buffer.setPointer(n, 80);
    },
    get addressof_testfn2(){
        return buffer.add(80);
    },
    get test(){
        return buffer.add(18);
    },
};
runtimeError.addFunctionTable(buffer.add(40), 2, buffer);
asm.setFunctionNames(buffer, {"testfn":0,"test":18});
