/**
 * Generated with bdsx/asm/compile.ts.
 * Please DO NOT modify this directly.
 */
const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(2296, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\u7905\u0007\u4900\uc0c7\u0001\u0000\u8948\uff02\u5915\u0007\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u078a\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\uebcc\u5500\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u0740\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u074e\u0000\u71e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u0726\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\u0515\u0007\u8500\u75c0\u484a\u4b8b\uff18\u0715\u0007\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\uff05\u0006\uf200\u110f\uff05\u0006\u4800\uec89\u8348\u28c4\u5d5b\u8b48\uaf05\u0006\uc300\u8148\u88ec\u0000\u4c00\u9c89\u8024\u0000\u4800\u4c89\u3824\u8948\u2454\u4c40\u4489\u4824\u894c\u244c\uf250\u110f\u2444\uf258\u110f\u244c\uf260\u110f\u2454\uf268\u110f\u245c\u4c70\u5489\u2024\u8d4c\u2444\u4830\u548d\u3824\u8b48\u6d0d\u0006\ue800\ufe90\uffff\uc085\u4375\u8b48\u244c\u4c20\u4c8d\u2024\uc749\u02c0\u0000\u4800\u058b\u060c\u0000\u8d48\u2454\u4828\u4489\u2824\u15ff\u0624\u0000\uc085\u1775\u8b48\u5905\u0006\uf200\u100f\u5905\u0006\u4800\uc481\u0088\u0000\u48c3\u4c8b\u3824\u8b48\u2454\u4c40\u448b\u4824\u8b4c\u244c\uf250\u100f\u2444\uf258\u100f\u244c\uf260\u100f\u2454\uf268\u100f\u245c\u4870\uc481\u0088\u0000\u64ff\uf824\uc189\uc981\u0000\ue000\u1fe9\u0001\uc300\u8348\u18ec\u8d48\u244c\uff10\u8515\u0005\u8500\u75c0\u480b\u4c8b\u1024\u15ff\u05f6\u0000\uc031\u8348\u18c4\u4cc3\u418b\u4828\u518d\u4830\u498b\uff20\u4525\u0005\uc300\u4853\uec83\u8920\u244c\u4830\u5489\u3824\u894c\u2444\u4c40\u4c89\u4824\u8d4c\u244c\u4940\ud089\ud231\ud189\u15ff\u0522\u0000\u8548\u0fc0\u6088\u0000\u4800\uc389\u8d48\u1150\u8d48\uac0d\uffff\uffff\u7515\u0005\u4800\u4c8b\u3024\u8948\u2048\u8948\u2858\u8d4c\u244c\u4c40\u448b\u3824\u8d48\u0153\u8d48\u3048\u8948\uffc3\udd15\u0004\uff00\uc715\u0004\u4800\ud989\u053b\u04ee\u0000\u850f\u0007\u0000\u64e8\uffff\uebff\uff43\u3315\u0005\ueb00\u483b\uc2c7\u0020\u0000\u8d48\u4c0d\uffff\uffff\u1515\u0005\u4800\u548b\u3024\u8948\u2050\uc748\u2840\u000f\u0000\u8d48\u7a0d\u0002\u4800\u118b\u8948\u3050\u8b48\u0851\u8948\u3850\u8348\u20c4\uc35b\u8b48\u8101\u0338\u0000\u7480\uff06\u8f25\u0004\uc300\u8148\u88ec\u0005\u4800\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\u7115\u0004\u4c00\u048d\u9025\u0000\u3100\u48d2\u4c8d\u2024\u15ff\u048c\u0000\u8d48\u244c\uff08\u4915\u0004\u4800\uc481\u0588\u0000\u48c3\u0d89\u04aa\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u04a2\u0000\u8348\u28c4\u48c3\u0d8b\u049e\u0000\u25ff\u04a0\u0000\u48c3\uec83\u4828\u0d8b\u049c\u0000\u15ff\u049e\u0000\u8b48\uaf0d\u0004\uff00\ua115\u0004\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u0476\u0000\u8d48\uc80d\uffff\uffff\u1915\u0004\u4800\u0d8b\u0482\u0000\uc748\uffc2\uffff\uffff\u7d15\u0004\u4800\uc483\uff28\u7b25\u0004\u4800\uec83\u8b28\u810d\u0004\u4800\u158b\u0472\u0000\u3145\uffc0\u7915\u0004\u4800\uc483\u4828\u0d8b\u0476\u0000\u25ff\u03d0\u0000\u8348\u28ec\u8b48\u244c\uff50\u6915\u0004\u4800\uc483\uff28\u6725\u0004\u4800\uec83\uff08\u3515\u0003\u4800\uc483\u4808\u053b\u035a\u0000\u0675\u25ff\u0452\u0000\u48c3\uec83\uff08\u4f15\u0004\u4800\uc189\uc148\u20e9\uc831\u8348\u08c4\u48c3\uec83\u4828\ue989\uf289\u894d\ufff0\u3715\u0004\u4800\uc483\uc328\u8348\u28ec\u8b48\u4c01\u858d\u00c0\u0000\u8d48\ua055\u50ff\u4820\uc189\u8948\u41ea\uf089\u15ff\u0416\u0000\u8348\u28c4\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u03f6\u0000\u8348\u28ec\u8b48\u4c01\u4d8d\u4978\uf089\u894c\ufff2\u0850\u8948\u89e9\ufff2\udf15\u0003\u4800\uc483\uc328\u8348\u28ec\u894d\u48f8\uda89\u894c\ufff1\ucf15\u0003\u4800\uc483\u4928\u078b\u8d49\u2096\u0002\u4c00\uf989\u60ff\u5318\u4856\uec83\u4818\ucb89\u8b48\ub30d\u0003\u4800\u148d\u2825\u0000\uff00\ubd15\u0002\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u03ac\u0000\u8b48\u950d\u0003\u4800\uc289\uc749\u0ac0\u0000\uff00\u8d15\u0003\u4800\uf189\u15ff\u0294\u0000\ub8eb\u8348\u18c4\u5b5e\u5bc3\u6f66\u6d72\u7461\u6620\u6961\u656c\u5d64\u0000\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0011\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0401\u0001\u0204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0000\u0000\u0056\u0000\u0580\u0000\u0056\u0000\u0059\u0000\u0584\u0000\u0059\u0000\u011a\u0000\u0588\u0000\u011a\u0000\u01ee\u0000\u0594\u0000\u01ee\u0000\u01fc\u0000\u059c\u0000\u01fc\u0000\u0221\u0000\u05a0\u0000\u0221\u0000\u0234\u0000\u05a8\u0000\u0234\u0000\u0308\u0000\u05ac\u0000\u0308\u0000\u031a\u0000\u05b4\u0000\u031a\u0000\u0367\u0000\u05b8\u0000\u0367\u0000\u036f\u0000\u05c0\u0000\u036f\u0000\u0371\u0000\u05c4\u0000\u0371\u0000\u0383\u0000\u05c8\u0000\u0383\u0000\u0391\u0000\u05d0\u0000\u0391\u0000\u03b4\u0000\u05d4\u0000\u03b4\u0000\u03ed\u0000\u05dc\u0000\u03ed\u0000\u0418\u0000\u05e4\u0000\u0418\u0000\u0431\u0000\u05ec\u0000\u0431\u0000\u044f\u0000\u05f4\u0000\u044f\u0000\u0467\u0000\u05fc\u0000\u0467\u0000\u047e\u0000\u0604\u0000\u047e\u0000\u04a7\u0000\u060c\u0000\u04a7\u0000\u04ca\u0000\u0614\u0000\u04ca\u0000\u04ee\u0000\u0618\u0000\u04ee\u0000\u0515\u0000\u0620\u0000\u0515\u0000\u057d\u0000\u0628\u0000\u0000\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(1904);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 1904);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(1904);
    },
    get bedrockLogNp(){
        return buffer.getPointer(1912);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 1912);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(1912);
    },
    get vsnprintf(){
        return buffer.getPointer(1920);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 1920);
    },
    get addressof_vsnprintf(){
        return buffer.add(1920);
    },
    get JsConstructObject(){
        return buffer.getPointer(1928);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 1928);
    },
    get addressof_JsConstructObject(){
        return buffer.add(1928);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(1936);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 1936);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(1936);
    },
    get js_null(){
        return buffer.getPointer(1944);
    },
    set js_null(n){
        buffer.setPointer(n, 1944);
    },
    get addressof_js_null(){
        return buffer.add(1944);
    },
    get nodeThreadId(){
        return buffer.getInt32(1952);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 1952);
    },
    get addressof_nodeThreadId(){
        return buffer.add(1952);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(1960);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 1960);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(1960);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(1968);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 1968);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(1968);
    },
    get JsNumberToInt(){
        return buffer.getPointer(1976);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 1976);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(1976);
    },
    get JsCallFunction(){
        return buffer.getPointer(1984);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 1984);
    },
    get addressof_JsCallFunction(){
        return buffer.add(1984);
    },
    get js_undefined(){
        return buffer.getPointer(1992);
    },
    set js_undefined(n){
        buffer.setPointer(n, 1992);
    },
    get addressof_js_undefined(){
        return buffer.add(1992);
    },
    get pointer_js2class(){
        return buffer.getPointer(2000);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2000);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2000);
    },
    get NativePointer(){
        return buffer.getPointer(2008);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2008);
    },
    get addressof_NativePointer(){
        return buffer.add(2008);
    },
    get memset(){
        return buffer.getPointer(2016);
    },
    set memset(n){
        buffer.setPointer(n, 2016);
    },
    get addressof_memset(){
        return buffer.add(2016);
    },
    get uv_async_call(){
        return buffer.getPointer(2024);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2024);
    },
    get addressof_uv_async_call(){
        return buffer.add(2024);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2032);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2032);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2032);
    },
    get uv_async_post(){
        return buffer.getPointer(2040);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2040);
    },
    get addressof_uv_async_post(){
        return buffer.add(2040);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2048);
    },
    set raxValue(n){
        buffer.setPointer(n, 2048);
    },
    get addressof_raxValue(){
        return buffer.add(2048);
    },
    get xmm0Value(){
        return buffer.getPointer(2056);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2056);
    },
    get addressof_xmm0Value(){
        return buffer.add(2056);
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
        return buffer.getPointer(2064);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2064);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2064);
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
        return buffer.getPointer(2072);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2072);
    },
    get addressof_serverInstance(){
        return buffer.add(2072);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(871);
    },
    get debugBreak(){
        return buffer.add(879);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2080);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2080);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2080);
    },
    get CommandOutputSenderHook(){
        return buffer.add(881);
    },
    get commandQueue(){
        return buffer.getPointer(2088);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2088);
    },
    get addressof_commandQueue(){
        return buffer.add(2088);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2096);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2096);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2096);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(899);
    },
    get gameThreadInner(){
        return buffer.getPointer(2112);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2112);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2112);
    },
    get free(){
        return buffer.getPointer(2120);
    },
    set free(n){
        buffer.setPointer(n, 2120);
    },
    get addressof_free(){
        return buffer.add(2120);
    },
    get SetEvent(){
        return buffer.getPointer(2128);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2128);
    },
    get addressof_SetEvent(){
        return buffer.add(2128);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2136);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2136);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2136);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2144);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2144);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2144);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2152);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2152);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2152);
    },
    get gameThreadHook(){
        return buffer.add(948);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2160);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2160);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2160);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2168);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2168);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2168);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2176);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2176);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2176);
    },
    get finishCallback(){
        return buffer.getPointer(2184);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2184);
    },
    get addressof_finishCallback(){
        return buffer.add(2184);
    },
    get wrapped_main(){
        return buffer.add(1005);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2192);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2192);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2192);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2200);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2200);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2200);
    },
    get updateWithSleep(){
        return buffer.add(1048);
    },
    get removeActor(){
        return buffer.getPointer(2208);
    },
    set removeActor(n){
        buffer.setPointer(n, 2208);
    },
    get addressof_removeActor(){
        return buffer.add(2208);
    },
    get actorDestructorHook(){
        return buffer.add(1073);
    },
    get NetworkIdentifierGetHash(){
        return buffer.getPointer(2216);
    },
    set NetworkIdentifierGetHash(n){
        buffer.setPointer(n, 2216);
    },
    get addressof_NetworkIdentifierGetHash(){
        return buffer.add(2216);
    },
    get networkIdentifierHash(){
        return buffer.add(1103);
    },
    get onPacketRaw(){
        return buffer.getPointer(2224);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2224);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2224);
    },
    get packetRawHook(){
        return buffer.add(1127);
    },
    get onPacketBefore(){
        return buffer.getPointer(2232);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 2232);
    },
    get addressof_onPacketBefore(){
        return buffer.add(2232);
    },
    get packetBeforeHook(){
        return buffer.add(1150);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(2240);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 2240);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(2240);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1191);
    },
    get onPacketAfter(){
        return buffer.getPointer(2248);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 2248);
    },
    get addressof_onPacketAfter(){
        return buffer.add(2248);
    },
    get packetAfterHook(){
        return buffer.add(1226);
    },
    get onPacketSend(){
        return buffer.getPointer(2256);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 2256);
    },
    get addressof_onPacketSend(){
        return buffer.add(2256);
    },
    get packetSendAllHook(){
        return buffer.add(1262);
    },
    get getLineProcessTask(){
        return buffer.getPointer(2264);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 2264);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(2264);
    },
    get std_cin(){
        return buffer.getPointer(2272);
    },
    set std_cin(n){
        buffer.setPointer(n, 2272);
    },
    get addressof_std_cin(){
        return buffer.add(2272);
    },
    get std_getline(){
        return buffer.getPointer(2280);
    },
    set std_getline(n){
        buffer.setPointer(n, 2280);
    },
    get addressof_std_getline(){
        return buffer.add(2280);
    },
    get std_string_ctor(){
        return buffer.getPointer(2288);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 2288);
    },
    get addressof_std_string_ctor(){
        return buffer.add(2288);
    },
    get getline(){
        return buffer.add(1301);
    },
};
runtimeError.addFunctionTable(buffer.add(1588), 26, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":89,"callJsFunction":282,"jsend_crash":494,"raise_runtime_error":794,"jsend_returnZero":508,"logHookAsyncCb":545,"logHook":564,"runtime_error":776,"ServerInstance_ctor_hook":871,"debugBreak":879,"CommandOutputSenderHook":881,"ConsoleInputReader_getLine_hook":899,"gameThreadEntry":913,"gameThreadHook":948,"wrapped_main":1005,"updateWithSleep":1048,"actorDestructorHook":1073,"networkIdentifierHash":1103,"packetRawHook":1127,"packetBeforeHook":1150,"packetBeforeCancelHandling":1191,"packetAfterHook":1226,"packetSendAllHook":1262,"getline":1301});
