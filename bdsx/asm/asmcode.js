const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(2936, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\ud105\u0008\u4900\uc0c7\u0001\u0000\u8948\uff02\ub115\u0008\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u08e2\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\uebcc\u5500\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u0898\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u08a6\u0000\u71e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u087e\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\u5d15\u0008\u8500\u75c0\u484a\u4b8b\uff18\u5f15\u0008\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\u5705\u0008\uf200\u110f\u5705\u0008\u4800\uec89\u8348\u28c4\u5d5b\u8b48\u0705\u0008\uc300\u8148\u88ec\u0000\u4c00\u9c89\u8024\u0000\u4800\u4c89\u3824\u8948\u2454\u4c40\u4489\u4824\u894c\u244c\uf250\u110f\u2444\uf258\u110f\u244c\uf260\u110f\u2454\uf268\u110f\u245c\u4c70\u5489\u2024\u8d4c\u2444\u4830\u548d\u3824\u8b48\uc50d\u0007\ue800\ufe90\uffff\uc085\u4375\u8b48\u244c\u4c20\u4c8d\u2024\uc749\u02c0\u0000\u4800\u058b\u0764\u0000\u8d48\u2454\u4828\u4489\u2824\u15ff\u077c\u0000\uc085\u1775\u8b48\ub105\u0007\uf200\u100f\ub105\u0007\u4800\uc481\u0088\u0000\u48c3\u4c8b\u3824\u8b48\u2454\u4c40\u448b\u4824\u8b4c\u244c\uf250\u100f\u2444\uf258\u100f\u244c\uf260\u100f\u2454\uf268\u100f\u245c\u4870\uc481\u0088\u0000\u64ff\uf824\uc189\uc981\u0000\ue000\u1fe9\u0001\uc300\u8348\u18ec\u8d48\u244c\uff10\udd15\u0006\u8500\u75c0\u480b\u4c8b\u1024\u15ff\u074e\u0000\uc031\u8348\u18c4\u4cc3\u418b\u4828\u518d\u4830\u498b\uff20\u9d25\u0006\uc300\u4853\uec83\u8920\u244c\u4830\u5489\u3824\u894c\u2444\u4c40\u4c89\u4824\u8d4c\u244c\u4940\ud089\ud231\ud189\u15ff\u067a\u0000\u8548\u0fc0\u6088\u0000\u4800\uc389\u8d48\u1150\u8d48\uac0d\uffff\uffff\ucd15\u0006\u4800\u4c8b\u3024\u8948\u2048\u8948\u2858\u8d4c\u244c\u4c40\u448b\u3824\u8d48\u0153\u8d48\u3048\u8948\uffc3\u3515\u0006\uff00\u1f15\u0006\u4800\ud989\u053b\u0646\u0000\u850f\u0007\u0000\u64e8\uffff\uebff\uff43\u8b15\u0006\ueb00\u483b\uc2c7\u0020\u0000\u8d48\u4c0d\uffff\uffff\u6d15\u0006\u4800\u548b\u3024\u8948\u2050\uc748\u2840\u000f\u0000\u8d48\ub20d\u0003\u4800\u118b\u8948\u3050\u8b48\u0851\u8948\u3850\u8348\u20c4\uc35b\u8b48\u8101\u0338\u0000\u7480\uff06\ue725\u0005\uc300\u8148\u88ec\u0005\u4800\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\uc915\u0005\u4c00\u048d\u9025\u0000\u3100\u48d2\u4c8d\u2024\u15ff\u05e4\u0000\u8d48\u244c\uff08\ua115\u0005\u4800\uc481\u0588\u0000\u48c3\u0d89\u0602\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u05fa\u0000\u8348\u28c4\u48c3\u0d8b\u05f6\u0000\u25ff\u05f8\u0000\u48c3\uec83\u4828\u0d8b\u05f4\u0000\u15ff\u05f6\u0000\u8b48\u070d\u0006\uff00\uf915\u0005\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u05ce\u0000\u8d48\uc80d\uffff\uffff\u7115\u0005\u4800\u0d8b\u05da\u0000\uc748\uffc2\uffff\uffff\ud515\u0005\u4800\uc483\uff28\ud325\u0005\u4800\uec83\u8b28\ud90d\u0005\u4800\u158b\u05ca\u0000\u3145\uffc0\ud115\u0005\u4800\uc483\u4828\u0d8b\u05ce\u0000\u25ff\u0528\u0000\u8348\u28ec\u8b48\u244c\uff50\uc115\u0005\u4800\uc483\uff28\ubf25\u0005\u4800\uec83\uff08\u8d15\u0004\u4800\uc483\u4808\u053b\u04b2\u0000\u0675\u25ff\u05aa\u0000\u89c3\u48f2\u058d\u05b8\u0000\u048a\u8410\u74c0\u480c\ue989\u894d\ufff0\u9525\u0005\u4800\u8d8d\u00b8\u0000\u25ff\u0590\u0000\u8348\u28ec\u8b48\u4c01\u858d\u0100\u0000\u8d48\ue055\u50ff\u4820\u0d8d\u057c\u0000\u0c8a\u4831\uc483\u8428\u74c9\u480f\uc189\u8948\u41ea\uf089\u25ff\u0662\u0000\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u0646\u0000\u8348\u28ec\u8b48\u4c01\u8d8d\u00b8\u0000\u8949\u4cf0\uf289\u50ff\u4808\u858b\u00b8\u0000\u8b48\uff00\u0850\u8d4c\u1315\u0005\u4100\u048a\u4802\uc483\u8428\u74c0\u4809\ue989\u25ff\u060e\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u04ec\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u05e6\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u05bc\u0000\u8348\u48c4\u48c3\uec83\u4928\u078b\u50ff\u4c08\u158d\u048e\u0000\u8a42\u1004\uc084\u2174\u894d\u48f8\uda89\u894c\ufff1\u9715\u0005\u3100\u85c0\u74c0\u480c\u058b\u0592\u0000\u8948\u2444\u4828\uc483\u4928\u078b\u8d49\u4896\u0002\u4c00\uf989\u60ff\u4818\uec83\u4948\u008b\u50ff\u4c08\u158d\u0440\u0000\u8a42\u1004\uc084\u3274\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u054e\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u0534\u0000\u8348\u48c4\u53c3\u4856\uec83\u4818\ucb89\u8b48\u270d\u0005\u4800\u148d\u2825\u0000\uff00\u1115\u0003\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u0520\u0000\u8b48\u090d\u0005\u4800\uc289\uc749\u0ac0\u0000\uff00\u0115\u0005\u4800\uf189\u15ff\u02e8\u0000\ub8eb\u8348\u18c4\u5b5e\u48c3\uec83\u3138\u49c0\ud089\u028a\u8348\u01c2\uc085\uf675\u294c\u48c2\uea83\u4801\u5489\u1024\u894c\u2444\u4818\u548d\u1024\u15ff\u04d0\u0000\u8348\u38c4\u5bc3\u6f66\u6d72\u7461\u6620\u6961\u656c\u5d64\u0000\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0011\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0401\u0001\u6204\u0000\u0000\u0000\u0056\u0000\u06b8\u0000\u0056\u0000\u0059\u0000\u06bc\u0000\u0059\u0000\u011a\u0000\u06c0\u0000\u011a\u0000\u01ee\u0000\u06cc\u0000\u01ee\u0000\u01fc\u0000\u06d4\u0000\u01fc\u0000\u0221\u0000\u06d8\u0000\u0221\u0000\u0234\u0000\u06e0\u0000\u0234\u0000\u0308\u0000\u06e4\u0000\u0308\u0000\u031a\u0000\u06ec\u0000\u031a\u0000\u0367\u0000\u06f0\u0000\u0367\u0000\u036f\u0000\u06f8\u0000\u036f\u0000\u0371\u0000\u06fc\u0000\u0371\u0000\u0383\u0000\u0700\u0000\u0383\u0000\u0391\u0000\u0708\u0000\u0391\u0000\u03b4\u0000\u070c\u0000\u03b4\u0000\u03ed\u0000\u0714\u0000\u03ed\u0000\u0418\u0000\u071c\u0000\u0418\u0000\u0431\u0000\u0724\u0000\u0431\u0000\u044f\u0000\u072c\u0000\u044f\u0000\u0478\u0000\u0734\u0000\u0478\u0000\u04af\u0000\u0738\u0000\u04af\u0000\u04d2\u0000\u0740\u0000\u04d2\u0000\u0513\u0000\u0744\u0000\u0513\u0000\u0571\u0000\u074c\u0000\u0571\u0000\u05bf\u0000\u0754\u0000\u05bf\u0000\u0619\u0000\u075c\u0000\u0619\u0000\u0671\u0000\u0764\u0000\u0671\u0000\u06b5\u0000\u0770\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2248);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2248);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2248);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2256);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2256);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2256);
    },
    get vsnprintf(){
        return buffer.getPointer(2264);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2264);
    },
    get addressof_vsnprintf(){
        return buffer.add(2264);
    },
    get JsConstructObject(){
        return buffer.getPointer(2272);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2272);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2272);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2280);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2280);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2280);
    },
    get js_null(){
        return buffer.getPointer(2288);
    },
    set js_null(n){
        buffer.setPointer(n, 2288);
    },
    get addressof_js_null(){
        return buffer.add(2288);
    },
    get nodeThreadId(){
        return buffer.getInt32(2296);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2296);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2296);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2304);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2304);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2304);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2312);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2312);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2312);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2320);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2320);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2320);
    },
    get JsCallFunction(){
        return buffer.getPointer(2328);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2328);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2328);
    },
    get js_undefined(){
        return buffer.getPointer(2336);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2336);
    },
    get addressof_js_undefined(){
        return buffer.add(2336);
    },
    get pointer_js2class(){
        return buffer.getPointer(2344);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2344);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2344);
    },
    get NativePointer(){
        return buffer.getPointer(2352);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2352);
    },
    get addressof_NativePointer(){
        return buffer.add(2352);
    },
    get memset(){
        return buffer.getPointer(2360);
    },
    set memset(n){
        buffer.setPointer(n, 2360);
    },
    get addressof_memset(){
        return buffer.add(2360);
    },
    get uv_async_call(){
        return buffer.getPointer(2368);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2368);
    },
    get addressof_uv_async_call(){
        return buffer.add(2368);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2376);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2376);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2376);
    },
    get uv_async_post(){
        return buffer.getPointer(2384);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2384);
    },
    get addressof_uv_async_post(){
        return buffer.add(2384);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2392);
    },
    set raxValue(n){
        buffer.setPointer(n, 2392);
    },
    get addressof_raxValue(){
        return buffer.add(2392);
    },
    get xmm0Value(){
        return buffer.getPointer(2400);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2400);
    },
    get addressof_xmm0Value(){
        return buffer.add(2400);
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
        return buffer.getPointer(2408);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2408);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2408);
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
        return buffer.getPointer(2416);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2416);
    },
    get addressof_serverInstance(){
        return buffer.add(2416);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(871);
    },
    get debugBreak(){
        return buffer.add(879);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2424);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2424);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2424);
    },
    get CommandOutputSenderHook(){
        return buffer.add(881);
    },
    get commandQueue(){
        return buffer.getPointer(2432);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2432);
    },
    get addressof_commandQueue(){
        return buffer.add(2432);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2440);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2440);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2440);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(899);
    },
    get gameThreadInner(){
        return buffer.getPointer(2456);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2456);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2456);
    },
    get free(){
        return buffer.getPointer(2464);
    },
    set free(n){
        buffer.setPointer(n, 2464);
    },
    get addressof_free(){
        return buffer.add(2464);
    },
    get SetEvent(){
        return buffer.getPointer(2472);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2472);
    },
    get addressof_SetEvent(){
        return buffer.add(2472);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2480);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2480);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2480);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2488);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2488);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2488);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2496);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2496);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2496);
    },
    get gameThreadHook(){
        return buffer.add(948);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2504);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2504);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2504);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2512);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2512);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2512);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2520);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2520);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2520);
    },
    get finishCallback(){
        return buffer.getPointer(2528);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2528);
    },
    get addressof_finishCallback(){
        return buffer.add(2528);
    },
    get wrapped_main(){
        return buffer.add(1005);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2536);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2536);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2536);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2544);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2544);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2544);
    },
    get updateWithSleep(){
        return buffer.add(1048);
    },
    get removeActor(){
        return buffer.getPointer(2552);
    },
    set removeActor(n){
        buffer.setPointer(n, 2552);
    },
    get addressof_removeActor(){
        return buffer.add(2552);
    },
    get actorDestructorHook(){
        return buffer.add(1073);
    },
    get onPacketRaw(){
        return buffer.getPointer(2560);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2560);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2560);
    },
    get createPacketRaw(){
        return buffer.getPointer(2568);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2568);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2568);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2576+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2576+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2576);
    },
    get packetRawHook(){
        return buffer.add(1103);
    },
    get onPacketBefore(){
        return buffer.getPointer(2832);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_onPacketBefore(){
        return buffer.add(2832);
    },
    get packetBeforeHook(){
        return buffer.add(1144);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(2840);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 2840);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(2840);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1199);
    },
    get onPacketAfter(){
        return buffer.getPointer(2848);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_onPacketAfter(){
        return buffer.add(2848);
    },
    get packetAfterHook(){
        return buffer.add(1234);
    },
    get sendOriginal(){
        return buffer.getPointer(2856);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 2856);
    },
    get addressof_sendOriginal(){
        return buffer.add(2856);
    },
    get onPacketSend(){
        return buffer.getPointer(2864);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 2864);
    },
    get addressof_onPacketSend(){
        return buffer.add(2864);
    },
    get packetSendHook(){
        return buffer.add(1299);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(2872);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(2872);
    },
    get packetSendAllHook(){
        return buffer.add(1393);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(2880);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(2880);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(2888);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 2888);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(2888);
    },
    get packetSendInternalHook(){
        return buffer.add(1471);
    },
    get getLineProcessTask(){
        return buffer.getPointer(2896);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 2896);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(2896);
    },
    get std_cin(){
        return buffer.getPointer(2904);
    },
    set std_cin(n){
        buffer.setPointer(n, 2904);
    },
    get addressof_std_cin(){
        return buffer.add(2904);
    },
    get std_getline(){
        return buffer.getPointer(2912);
    },
    set std_getline(n){
        buffer.setPointer(n, 2912);
    },
    get addressof_std_getline(){
        return buffer.add(2912);
    },
    get std_string_ctor(){
        return buffer.getPointer(2920);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 2920);
    },
    get addressof_std_string_ctor(){
        return buffer.add(2920);
    },
    get getline(){
        return buffer.add(1561);
    },
    get Core_String_toWide_string_span(){
        return buffer.getPointer(2928);
    },
    set Core_String_toWide_string_span(n){
        buffer.setPointer(n, 2928);
    },
    get addressof_Core_String_toWide_string_span(){
        return buffer.add(2928);
    },
    get Core_String_toWide_charptr(){
        return buffer.add(1649);
    },
};
runtimeError.addFunctionTable(buffer.add(1912), 28, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":89,"callJsFunction":282,"jsend_crash":494,"raise_runtime_error":794,"jsend_returnZero":508,"logHookAsyncCb":545,"logHook":564,"runtime_error":776,"ServerInstance_ctor_hook":871,"debugBreak":879,"CommandOutputSenderHook":881,"ConsoleInputReader_getLine_hook":899,"gameThreadEntry":913,"gameThreadHook":948,"wrapped_main":1005,"updateWithSleep":1048,"actorDestructorHook":1073,"packetRawHook":1103,"packetBeforeHook":1144,"packetBeforeCancelHandling":1199,"packetAfterHook":1234,"packetSendHook":1299,"packetSendAllHook":1393,"packetSendInternalHook":1471,"getline":1561,"Core_String_toWide_charptr":1649});
