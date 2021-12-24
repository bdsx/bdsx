const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(2856, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\u8905\u0008\u4900\uc0c7\u0001\u0000\u8948\uff02\u6915\u0008\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u089a\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\uebcc\u5500\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u0850\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u085e\u0000\u71e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u0836\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\u1515\u0008\u8500\u75c0\u484a\u4b8b\uff18\u1715\u0008\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\u0f05\u0008\uf200\u110f\u0f05\u0008\u4800\uec89\u8348\u28c4\u5d5b\u8b48\ubf05\u0007\uc300\u8148\u88ec\u0000\u4c00\u9c89\u8024\u0000\u4800\u4c89\u3824\u8948\u2454\u4c40\u4489\u4824\u894c\u244c\uf250\u110f\u2444\uf258\u110f\u244c\uf260\u110f\u2454\uf268\u110f\u245c\u4c70\u5489\u2024\u8d4c\u2444\u4830\u548d\u3824\u8b48\u7d0d\u0007\ue800\ufe90\uffff\uc085\u4375\u8b48\u244c\u4c20\u4c8d\u2024\uc749\u02c0\u0000\u4800\u058b\u071c\u0000\u8d48\u2454\u4828\u4489\u2824\u15ff\u0734\u0000\uc085\u1775\u8b48\u6905\u0007\uf200\u100f\u6905\u0007\u4800\uc481\u0088\u0000\u48c3\u4c8b\u3824\u8b48\u2454\u4c40\u448b\u4824\u8b4c\u244c\uf250\u100f\u2444\uf258\u100f\u244c\uf260\u100f\u2454\uf268\u100f\u245c\u4870\uc481\u0088\u0000\u64ff\uf824\uc189\uc981\u0000\ue000\u1fe9\u0001\uc300\u8348\u18ec\u8d48\u244c\uff10\u9515\u0006\u8500\u75c0\u480b\u4c8b\u1024\u15ff\u0706\u0000\uc031\u8348\u18c4\u4cc3\u418b\u4828\u518d\u4830\u498b\uff20\u5525\u0006\uc300\u4853\uec83\u8920\u244c\u4830\u5489\u3824\u894c\u2444\u4c40\u4c89\u4824\u8d4c\u244c\u4940\ud089\ud231\ud189\u15ff\u0632\u0000\u8548\u0fc0\u6088\u0000\u4800\uc389\u8d48\u1150\u8d48\uac0d\uffff\uffff\u8515\u0006\u4800\u4c8b\u3024\u8948\u2048\u8948\u2858\u8d4c\u244c\u4c40\u448b\u3824\u8d48\u0153\u8d48\u3048\u8948\uffc3\ued15\u0005\uff00\ud715\u0005\u4800\ud989\u053b\u05fe\u0000\u850f\u0007\u0000\u64e8\uffff\uebff\uff43\u4315\u0006\ueb00\u483b\uc2c7\u0020\u0000\u8d48\u4c0d\uffff\uffff\u2515\u0006\u4800\u548b\u3024\u8948\u2050\uc748\u2840\u000f\u0000\u8d48\u7e0d\u0003\u4800\u118b\u8948\u3050\u8b48\u0851\u8948\u3850\u8348\u20c4\uc35b\u8b48\u8101\u0338\u0000\u7480\uff06\u9f25\u0005\uc300\u8148\u88ec\u0005\u4800\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\u8115\u0005\u4c00\u048d\u9025\u0000\u3100\u48d2\u4c8d\u2024\u15ff\u059c\u0000\u8d48\u244c\uff08\u5915\u0005\u4800\uc481\u0588\u0000\u48c3\u0d89\u05ba\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u05b2\u0000\u8348\u28c4\u48c3\u0d8b\u05ae\u0000\u25ff\u05b0\u0000\u48c3\uec83\u4828\u0d8b\u05ac\u0000\u15ff\u05ae\u0000\u8b48\ubf0d\u0005\uff00\ub115\u0005\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u0586\u0000\u8d48\uc80d\uffff\uffff\u2915\u0005\u4800\u0d8b\u0592\u0000\uc748\uffc2\uffff\uffff\u8d15\u0005\u4800\uc483\uff28\u8b25\u0005\u4800\uec83\u8b28\u910d\u0005\u4800\u158b\u0582\u0000\u3145\uffc0\u8915\u0005\u4800\uc483\u4828\u0d8b\u0586\u0000\u25ff\u04e0\u0000\u8348\u28ec\u8b48\u244c\uff50\u7915\u0005\u4800\uc483\uff28\u7725\u0005\u4800\uec83\uff08\u4515\u0004\u4800\uc483\u4808\u053b\u046a\u0000\u0675\u25ff\u0562\u0000\u89c3\u48f2\u058d\u0570\u0000\u048a\u8410\u74c0\u480c\ue989\u894d\ufff0\u4d25\u0005\u4800\u8d8d\u00b8\u0000\u25ff\u0548\u0000\u8348\u28ec\u8b48\u4c01\u858d\u0100\u0000\u8d48\ue055\u50ff\u4820\u0d8d\u0534\u0000\u0c8a\u4831\uc483\u8428\u74c9\u480f\uc189\u8948\u41ea\uf089\u25ff\u061a\u0000\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u05fe\u0000\u8348\u28ec\u8b48\u4c01\u8d8d\u00b8\u0000\u8949\u4cf0\uf289\u50ff\u4808\u858b\u00b8\u0000\u8b48\uff00\u0850\u8d4c\ucb15\u0004\u4100\u048a\u4802\uc483\u8428\u74c0\u4809\ue989\u25ff\u05c6\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u04a4\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u059e\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u0574\u0000\u8348\u48c4\u48c3\uec83\u4928\u078b\u50ff\u4c08\u158d\u0446\u0000\u8a42\u1004\uc084\u2174\u894d\u48f8\uda89\u894c\ufff1\u4f15\u0005\u3100\u85c0\u74c0\u480c\u058b\u054a\u0000\u8948\u2444\u4828\uc483\u4928\u078b\u8d49\u4896\u0002\u4c00\uf989\u60ff\u4818\uec83\u4948\u008b\u50ff\u4c08\u158d\u03f8\u0000\u8a42\u1004\uc084\u3274\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u0506\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u04ec\u0000\u8348\u48c4\u53c3\u4856\uec83\u4818\ucb89\u8b48\udf0d\u0004\u4800\u148d\u2825\u0000\uff00\uc915\u0002\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u04d8\u0000\u8b48\uc10d\u0004\u4800\uc289\uc749\u0ac0\u0000\uff00\ub915\u0004\u4800\uf189\u15ff\u02a0\u0000\ub8eb\u8348\u18c4\u5b5e\u5bc3\u6f66\u6d72\u7461\u6620\u6961\u656c\u5d64\u0000\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0011\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0000\u0000\u0056\u0000\u0684\u0000\u0056\u0000\u0059\u0000\u0688\u0000\u0059\u0000\u011a\u0000\u068c\u0000\u011a\u0000\u01ee\u0000\u0698\u0000\u01ee\u0000\u01fc\u0000\u06a0\u0000\u01fc\u0000\u0221\u0000\u06a4\u0000\u0221\u0000\u0234\u0000\u06ac\u0000\u0234\u0000\u0308\u0000\u06b0\u0000\u0308\u0000\u031a\u0000\u06b8\u0000\u031a\u0000\u0367\u0000\u06bc\u0000\u0367\u0000\u036f\u0000\u06c4\u0000\u036f\u0000\u0371\u0000\u06c8\u0000\u0371\u0000\u0383\u0000\u06cc\u0000\u0383\u0000\u0391\u0000\u06d4\u0000\u0391\u0000\u03b4\u0000\u06d8\u0000\u03b4\u0000\u03ed\u0000\u06e0\u0000\u03ed\u0000\u0418\u0000\u06e8\u0000\u0418\u0000\u0431\u0000\u06f0\u0000\u0431\u0000\u044f\u0000\u06f8\u0000\u044f\u0000\u0478\u0000\u0700\u0000\u0478\u0000\u04af\u0000\u0704\u0000\u04af\u0000\u04d2\u0000\u070c\u0000\u04d2\u0000\u0513\u0000\u0710\u0000\u0513\u0000\u0571\u0000\u0718\u0000\u0571\u0000\u05bf\u0000\u0720\u0000\u05bf\u0000\u0619\u0000\u0728\u0000\u0619\u0000\u0681\u0000\u0730\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2176);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2176);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2176);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2184);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2184);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2184);
    },
    get vsnprintf(){
        return buffer.getPointer(2192);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2192);
    },
    get addressof_vsnprintf(){
        return buffer.add(2192);
    },
    get JsConstructObject(){
        return buffer.getPointer(2200);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2200);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2200);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2208);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2208);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2208);
    },
    get js_null(){
        return buffer.getPointer(2216);
    },
    set js_null(n){
        buffer.setPointer(n, 2216);
    },
    get addressof_js_null(){
        return buffer.add(2216);
    },
    get nodeThreadId(){
        return buffer.getInt32(2224);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2224);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2224);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2232);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2232);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2232);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2240);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2240);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2240);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2248);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2248);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2248);
    },
    get JsCallFunction(){
        return buffer.getPointer(2256);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2256);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2256);
    },
    get js_undefined(){
        return buffer.getPointer(2264);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2264);
    },
    get addressof_js_undefined(){
        return buffer.add(2264);
    },
    get pointer_js2class(){
        return buffer.getPointer(2272);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2272);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2272);
    },
    get NativePointer(){
        return buffer.getPointer(2280);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2280);
    },
    get addressof_NativePointer(){
        return buffer.add(2280);
    },
    get memset(){
        return buffer.getPointer(2288);
    },
    set memset(n){
        buffer.setPointer(n, 2288);
    },
    get addressof_memset(){
        return buffer.add(2288);
    },
    get uv_async_call(){
        return buffer.getPointer(2296);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2296);
    },
    get addressof_uv_async_call(){
        return buffer.add(2296);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2304);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2304);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2304);
    },
    get uv_async_post(){
        return buffer.getPointer(2312);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2312);
    },
    get addressof_uv_async_post(){
        return buffer.add(2312);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2320);
    },
    set raxValue(n){
        buffer.setPointer(n, 2320);
    },
    get addressof_raxValue(){
        return buffer.add(2320);
    },
    get xmm0Value(){
        return buffer.getPointer(2328);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2328);
    },
    get addressof_xmm0Value(){
        return buffer.add(2328);
    },
    get breakBeforeCallNativeFunction(){
        return buffer.add(86);
    },
    get callNativeFunction(){
        return buffer.add(89);
    },
    get callJsFunction(){
        return buffer.add(282);
    },
    get jshook_fireError(){
        return buffer.getPointer(2336);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2336);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2336);
    },
    get jsend_crash(){
        return buffer.add(494);
    },
    get raise_runtime_error(){
        return buffer.add(794);
    },
    get jsend_returnZero(){
        return buffer.add(508);
    },
    get logHookAsyncCb(){
        return buffer.add(545);
    },
    get logHook(){
        return buffer.add(564);
    },
    get runtime_error(){
        return buffer.add(776);
    },
    get serverInstance(){
        return buffer.getPointer(2344);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2344);
    },
    get addressof_serverInstance(){
        return buffer.add(2344);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(871);
    },
    get debugBreak(){
        return buffer.add(879);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2352);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2352);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2352);
    },
    get CommandOutputSenderHook(){
        return buffer.add(881);
    },
    get commandQueue(){
        return buffer.getPointer(2360);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2360);
    },
    get addressof_commandQueue(){
        return buffer.add(2360);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2368);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2368);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2368);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(899);
    },
    get gameThreadInner(){
        return buffer.getPointer(2384);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2384);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2384);
    },
    get free(){
        return buffer.getPointer(2392);
    },
    set free(n){
        buffer.setPointer(n, 2392);
    },
    get addressof_free(){
        return buffer.add(2392);
    },
    get SetEvent(){
        return buffer.getPointer(2400);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2400);
    },
    get addressof_SetEvent(){
        return buffer.add(2400);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2408);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2408);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2408);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2416);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2416);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2416);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2424);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2424);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2424);
    },
    get gameThreadHook(){
        return buffer.add(948);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2432);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2432);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2432);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2440);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2440);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2440);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2448);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2448);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2448);
    },
    get finishCallback(){
        return buffer.getPointer(2456);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2456);
    },
    get addressof_finishCallback(){
        return buffer.add(2456);
    },
    get wrapped_main(){
        return buffer.add(1005);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2464);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2464);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2464);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2472);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2472);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2472);
    },
    get updateWithSleep(){
        return buffer.add(1048);
    },
    get removeActor(){
        return buffer.getPointer(2480);
    },
    set removeActor(n){
        buffer.setPointer(n, 2480);
    },
    get addressof_removeActor(){
        return buffer.add(2480);
    },
    get actorDestructorHook(){
        return buffer.add(1073);
    },
    get onPacketRaw(){
        return buffer.getPointer(2488);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2488);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2488);
    },
    get createPacketRaw(){
        return buffer.getPointer(2496);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2496);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2496);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2504+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2504+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2504);
    },
    get packetRawHook(){
        return buffer.add(1103);
    },
    get onPacketBefore(){
        return buffer.getPointer(2760);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_onPacketBefore(){
        return buffer.add(2760);
    },
    get packetBeforeHook(){
        return buffer.add(1144);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(2768);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(2768);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1199);
    },
    get onPacketAfter(){
        return buffer.getPointer(2776);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 2776);
    },
    get addressof_onPacketAfter(){
        return buffer.add(2776);
    },
    get packetAfterHook(){
        return buffer.add(1234);
    },
    get sendOriginal(){
        return buffer.getPointer(2784);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 2784);
    },
    get addressof_sendOriginal(){
        return buffer.add(2784);
    },
    get onPacketSend(){
        return buffer.getPointer(2792);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 2792);
    },
    get addressof_onPacketSend(){
        return buffer.add(2792);
    },
    get packetSendHook(){
        return buffer.add(1299);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(2800);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(2800);
    },
    get packetSendAllHook(){
        return buffer.add(1393);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(2808);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 2808);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(2808);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(2816);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(2816);
    },
    get packetSendInternalHook(){
        return buffer.add(1471);
    },
    get getLineProcessTask(){
        return buffer.getPointer(2824);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 2824);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(2824);
    },
    get std_cin(){
        return buffer.getPointer(2832);
    },
    set std_cin(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_std_cin(){
        return buffer.add(2832);
    },
    get std_getline(){
        return buffer.getPointer(2840);
    },
    set std_getline(n){
        buffer.setPointer(n, 2840);
    },
    get addressof_std_getline(){
        return buffer.add(2840);
    },
    get std_string_ctor(){
        return buffer.getPointer(2848);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_std_string_ctor(){
        return buffer.add(2848);
    },
    get getline(){
        return buffer.add(1561);
    },
};
runtimeError.addFunctionTable(buffer.add(1852), 27, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":89,"callJsFunction":282,"jsend_crash":494,"raise_runtime_error":794,"jsend_returnZero":508,"logHookAsyncCb":545,"logHook":564,"runtime_error":776,"ServerInstance_ctor_hook":871,"debugBreak":879,"CommandOutputSenderHook":881,"ConsoleInputReader_getLine_hook":899,"gameThreadEntry":913,"gameThreadHook":948,"wrapped_main":1005,"updateWithSleep":1048,"actorDestructorHook":1073,"packetRawHook":1103,"packetBeforeHook":1144,"packetBeforeCancelHandling":1199,"packetAfterHook":1234,"packetSendHook":1299,"packetSendAllHook":1393,"packetSendInternalHook":1471,"getline":1561});
