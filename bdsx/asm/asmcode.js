const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(3248, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\uf905\u0009\u4900\uc0c7\u0001\u0000\u8948\uff02\ud915\u0009\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u0a0a\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\uebcc\u5500\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u09c0\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u09ce\u0000\u71e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u09a6\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\u8515\u0009\u8500\u75c0\u484a\u4b8b\uff18\u8715\u0009\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\u7f05\u0009\uf200\u110f\u7f05\u0009\u4800\uec89\u8348\u28c4\u5d5b\u8b48\u2f05\u0009\uc300\u8148\u98ec\u0000\u4c00\u9c89\u9024\u0000\u4800\u4c89\u4824\u8948\u2454\u4c50\u4489\u5824\u894c\u244c\uf260\u110f\u2444\uf268\u110f\u244c\uf270\u110f\u2454\uf278\u110f\u249c\u0080\u0000\u894c\u2454\u4c30\u448d\u4024\u8d48\u2454\u4848\u0d8b\u08ea\u0000\u8de8\ufffe\u85ff\u75c0\u4843\u4c8b\u3024\u8d4c\u244c\u4928\uc0c7\u0002\u0000\u8b48\u8905\u0008\u4800\u548d\u3824\u8948\u2444\uff38\ua115\u0008\u8500\u75c0\u4817\u058b\u08d6\u0000\u0ff2\u0510\u08d6\u0000\u8148\u98c4\u0000\uc300\u8b48\u244c\u4848\u548b\u5024\u8b4c\u2444\u4c58\u4c8b\u6024\u0ff2\u4410\u6824\u0ff2\u4c10\u7024\u0ff2\u5410\u7824\u0ff2\u9c10\u8024\u0000\u4800\uc481\u0098\u0000\u64ff\uf824\u4853\uec83\u4820\u598b\u4c20\u438d\u4840\u538d\u4848\u0d8b\u084c\u0000\uefe8\ufffd\u85ff\u75c0\u4850\u4b8b\u4c30\u4b8d\u4928\uc0c7\u0002\u0000\u8b48\ued05\u0007\u4800\u538d\u4838\u4389\uff38\u0715\u0008\u8500\u75c0\u4828\u058b\u083c\u0000\u0ff2\u0510\u083c\u0000\u8b48\u204b\u8948\u2843\u0ff2\u4311\uff30\u4915\u0008\u4800\uc483\u5b20\u48c3\uc483\u5b20\u7feb\u8148\u98ec\u0000\u3d00\u0003\u0001\u7175\uc931\ud231\u3145\u45c0\uc931\u15ff\u080e\u0000\u8948\u2444\u4820\u0d8d\uff5e\uffff\uc748\u08c2\u0000\uff00\ucd15\u0007\u4800\u4489\u1824\u8948\uffc1\uc715\u0007\u4800\u448b\u1824\u8948\u48e2\u4c8b\u2024\u8948\u2050\uffba\uffff\uffff\ue315\u0007\u4800\u4c8b\u2024\u15ff\u07c8\u0000\u8b48\u2444\uf228\u100f\u2444\u4830\uc481\u0098\u0000\u89c3\u81c1\u00c9\u0000\ue9e0\u011f\u0000\u48c3\uec83\u4818\u4c8d\u1024\u15ff\u0708\u0000\uc085\u0b75\u8b48\u244c\uff10\u7915\u0007\u3100\u48c0\uc483\uc318\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u06c8\u0000\u53c3\u8348\u20ec\u4c89\u3024\u8948\u2454\u4c38\u4489\u4024\u894c\u244c\u4c48\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\ua515\u0006\u4800\uc085\u880f\u0060\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffac\uffff\u15ff\u06f8\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u0660\u0000\u15ff\u064a\u0000\u8948\u3bd9\u7105\u0006\u0f00\u0785\u0000\ue800\uff64\uffff\u43eb\u15ff\u06b6\u0000\u3beb\uc748\u20c2\u0000\u4800\u0d8d\uff4c\uffff\u15ff\u0698\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u03b1\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\u4838\uc483\u5b20\u48c3\u018b\u3881\u0003\u8000\u0674\u25ff\u0612\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u05f4\u0000\u8d4c\u2504\u0094\u0000\u8d48\u044a\ud231\u15ff\u0610\u0000\u8d48\u244c\uff08\ucd15\u0005\u4800\uc481\u0588\u0000\u48c3\u0d89\u064e\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u0646\u0000\u8348\u28c4\u48c3\u0d8b\u0642\u0000\u25ff\u0644\u0000\u48c3\uec83\u4828\u0d8b\u0640\u0000\u15ff\u0642\u0000\u8b48\u4b0d\u0006\uff00\ufd15\u0005\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u061a\u0000\u8d48\uc80d\uffff\uffff\u9d15\u0005\u4800\u0d8b\u061e\u0000\uc748\uffc2\uffff\uffff\ud115\u0005\u4800\uc483\uff28\u0f25\u0006\u4800\uec83\u8b28\u150d\u0006\u4800\u158b\u0606\u0000\u3145\uffc0\u0d15\u0006\u4800\uc483\u4828\u0d8b\u060a\u0000\u25ff\u0554\u0000\u8348\u28ec\u8b48\u244c\uff50\ufd15\u0005\u4800\uc483\uff28\ufb25\u0005\u4800\uec83\uff08\ub915\u0004\u4800\uc483\u4808\u053b\u04de\u0000\u0675\u25ff\u05e6\u0000\u89c3\u48f2\u058d\u05f4\u0000\u048a\u8410\u74c0\u480c\ue989\u894d\ufff0\ud125\u0005\u4800\u8d8d\u00b8\u0000\u25ff\u05cc\u0000\u8348\u28ec\u8b48\u4c01\u858d\u0100\u0000\u8d48\ue055\u50ff\u4820\u0d8d\u05b8\u0000\u0c8a\u4831\uc483\u8428\u74c9\u480f\uc189\u8948\u41ea\uf089\u25ff\u069e\u0000\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u0682\u0000\u8348\u28ec\u8b48\u4c01\u8d8d\u00b8\u0000\u8949\u4cf0\uf289\u50ff\u4808\u858b\u00b8\u0000\u8b48\uff00\u0850\u8d4c\u4f15\u0005\u4100\u048a\u4802\uc483\u8428\u74c0\u4809\ue989\u25ff\u064a\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u0528\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u0622\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u05f8\u0000\u8348\u48c4\u48c3\uec83\u4928\u078b\u50ff\u4c08\u158d\u04ca\u0000\u8a42\u1004\uc084\u2174\u894d\u48f8\uda89\u894c\ufff1\ud315\u0005\u3100\u85c0\u74c0\u480c\u058b\u05ce\u0000\u8948\u2444\u4828\uc483\u4928\u078b\u8d49\u4896\u0002\u4c00\uf989\u60ff\u4818\uec83\u4948\u008b\u50ff\u4c08\u158d\u047c\u0000\u8a42\u1004\uc084\u3274\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u058a\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u0570\u0000\u8348\u48c4\u53c3\u4856\uec83\u4818\ucb89\u8b48\u630d\u0005\u4800\u148d\u2825\u0000\uff00\u3d15\u0003\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u055c\u0000\u8b48\u450d\u0005\u4800\uc289\uc749\u0ac0\u0000\uff00\u3d15\u0005\u4800\uf189\u15ff\u0314\u0000\ub8eb\u8348\u18c4\u5b5e\u48c3\uec83\u3138\u49c0\ud089\u028a\u8348\u01c2\uc085\uf675\u294c\u48c2\uea83\u4801\u5489\u1024\u894c\u2444\u4818\u548d\u1024\u15ff\u050c\u0000\u8348\u38c4\u5bc3\u6f66\u6d72\u7461\u6620\u6961\u656c\u5d64\u0000\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0013\u0501\u0002\u3205\u3001\u0701\u0002\u0107\u0013\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0401\u0001\u6204\u0000\u0000\u0000\u0056\u0000\u07b4\u0000\u0056\u0000\u0059\u0000\u07b8\u0000\u0059\u0000\u011a\u0000\u07bc\u0000\u011a\u0000\u01f4\u0000\u07c8\u0000\u01f4\u0000\u026c\u0000\u07d0\u0000\u026c\u0000\u02eb\u0000\u07d8\u0000\u02eb\u0000\u02f9\u0000\u07e0\u0000\u02f9\u0000\u031e\u0000\u07e4\u0000\u031e\u0000\u0331\u0000\u07ec\u0000\u0331\u0000\u0405\u0000\u07f0\u0000\u0405\u0000\u0417\u0000\u07f8\u0000\u0417\u0000\u0463\u0000\u07fc\u0000\u0463\u0000\u046b\u0000\u0804\u0000\u046b\u0000\u046d\u0000\u0808\u0000\u046d\u0000\u047f\u0000\u080c\u0000\u047f\u0000\u048d\u0000\u0814\u0000\u048d\u0000\u04b0\u0000\u0818\u0000\u04b0\u0000\u04e9\u0000\u0820\u0000\u04e9\u0000\u0514\u0000\u0828\u0000\u0514\u0000\u052d\u0000\u0830\u0000\u052d\u0000\u054b\u0000\u0838\u0000\u054b\u0000\u0574\u0000\u0840\u0000\u0574\u0000\u05ab\u0000\u0844\u0000\u05ab\u0000\u05ce\u0000\u084c\u0000\u05ce\u0000\u060f\u0000\u0850\u0000\u060f\u0000\u066d\u0000\u0858\u0000\u066d\u0000\u06bb\u0000\u0860\u0000\u06bb\u0000\u0715\u0000\u0868\u0000\u0715\u0000\u076d\u0000\u0870\u0000\u076d\u0000\u07b1\u0000\u087c\u0000\u0000\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2544);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2544);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2544);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2552);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2552);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2552);
    },
    get vsnprintf(){
        return buffer.getPointer(2560);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2560);
    },
    get addressof_vsnprintf(){
        return buffer.add(2560);
    },
    get JsConstructObject(){
        return buffer.getPointer(2568);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2568);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2568);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2576);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2576);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2576);
    },
    get js_null(){
        return buffer.getPointer(2584);
    },
    set js_null(n){
        buffer.setPointer(n, 2584);
    },
    get addressof_js_null(){
        return buffer.add(2584);
    },
    get nodeThreadId(){
        return buffer.getInt32(2592);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2592);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2592);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2600);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2600);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2600);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2608);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2608);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2608);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2616);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2616);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2616);
    },
    get JsCallFunction(){
        return buffer.getPointer(2624);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2624);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2624);
    },
    get js_undefined(){
        return buffer.getPointer(2632);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2632);
    },
    get addressof_js_undefined(){
        return buffer.add(2632);
    },
    get pointer_js2class(){
        return buffer.getPointer(2640);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2640);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2640);
    },
    get NativePointer(){
        return buffer.getPointer(2648);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2648);
    },
    get addressof_NativePointer(){
        return buffer.add(2648);
    },
    get memset(){
        return buffer.getPointer(2656);
    },
    set memset(n){
        buffer.setPointer(n, 2656);
    },
    get addressof_memset(){
        return buffer.add(2656);
    },
    get uv_async_call(){
        return buffer.getPointer(2664);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2664);
    },
    get addressof_uv_async_call(){
        return buffer.add(2664);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2672);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2672);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2672);
    },
    get uv_async_post(){
        return buffer.getPointer(2680);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2680);
    },
    get addressof_uv_async_post(){
        return buffer.add(2680);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2688);
    },
    set raxValue(n){
        buffer.setPointer(n, 2688);
    },
    get addressof_raxValue(){
        return buffer.add(2688);
    },
    get xmm0Value(){
        return buffer.getPointer(2696);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2696);
    },
    get addressof_xmm0Value(){
        return buffer.add(2696);
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
        return buffer.getPointer(2704);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2704);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2704);
    },
    get CreateEventW(){
        return buffer.getPointer(2712);
    },
    set CreateEventW(n){
        buffer.setPointer(n, 2712);
    },
    get addressof_CreateEventW(){
        return buffer.add(2712);
    },
    get CloseHandle(){
        return buffer.getPointer(2720);
    },
    set CloseHandle(n){
        buffer.setPointer(n, 2720);
    },
    get addressof_CloseHandle(){
        return buffer.add(2720);
    },
    get SetEvent(){
        return buffer.getPointer(2728);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2728);
    },
    get addressof_SetEvent(){
        return buffer.add(2728);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2736);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2736);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2736);
    },
    get jsend_crash(){
        return buffer.add(747);
    },
    get jsend_crossthread(){
        return buffer.add(620);
    },
    get raise_runtime_error(){
        return buffer.add(1047);
    },
    get jsend_returnZero(){
        return buffer.add(761);
    },
    get logHookAsyncCb(){
        return buffer.add(798);
    },
    get logHook(){
        return buffer.add(817);
    },
    get runtime_error(){
        return buffer.add(1029);
    },
    get serverInstance(){
        return buffer.getPointer(2744);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2744);
    },
    get addressof_serverInstance(){
        return buffer.add(2744);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(1123);
    },
    get debugBreak(){
        return buffer.add(1131);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2752);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2752);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2752);
    },
    get CommandOutputSenderHook(){
        return buffer.add(1133);
    },
    get commandQueue(){
        return buffer.getPointer(2760);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_commandQueue(){
        return buffer.add(2760);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2768);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2768);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(1151);
    },
    get gameThreadInner(){
        return buffer.getPointer(2784);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2784);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2784);
    },
    get free(){
        return buffer.getPointer(2792);
    },
    set free(n){
        buffer.setPointer(n, 2792);
    },
    get addressof_free(){
        return buffer.add(2792);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2800);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2800);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2808);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2808);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2808);
    },
    get gameThreadHook(){
        return buffer.add(1200);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2816);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2816);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2824);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2824);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2824);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2832);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2832);
    },
    get finishCallback(){
        return buffer.getPointer(2840);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2840);
    },
    get addressof_finishCallback(){
        return buffer.add(2840);
    },
    get wrapped_main(){
        return buffer.add(1257);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2848);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2848);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2856);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2856);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2856);
    },
    get updateWithSleep(){
        return buffer.add(1300);
    },
    get removeActor(){
        return buffer.getPointer(2864);
    },
    set removeActor(n){
        buffer.setPointer(n, 2864);
    },
    get addressof_removeActor(){
        return buffer.add(2864);
    },
    get actorDestructorHook(){
        return buffer.add(1325);
    },
    get onPacketRaw(){
        return buffer.getPointer(2872);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2872);
    },
    get createPacketRaw(){
        return buffer.getPointer(2880);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2880);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2888+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2888+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2888);
    },
    get packetRawHook(){
        return buffer.add(1355);
    },
    get onPacketBefore(){
        return buffer.getPointer(3144);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 3144);
    },
    get addressof_onPacketBefore(){
        return buffer.add(3144);
    },
    get packetBeforeHook(){
        return buffer.add(1396);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(3152);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 3152);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(3152);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1451);
    },
    get onPacketAfter(){
        return buffer.getPointer(3160);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 3160);
    },
    get addressof_onPacketAfter(){
        return buffer.add(3160);
    },
    get packetAfterHook(){
        return buffer.add(1486);
    },
    get sendOriginal(){
        return buffer.getPointer(3168);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 3168);
    },
    get addressof_sendOriginal(){
        return buffer.add(3168);
    },
    get onPacketSend(){
        return buffer.getPointer(3176);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 3176);
    },
    get addressof_onPacketSend(){
        return buffer.add(3176);
    },
    get packetSendHook(){
        return buffer.add(1551);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(3184);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 3184);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(3184);
    },
    get packetSendAllHook(){
        return buffer.add(1645);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(3192);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 3192);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(3192);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(3200);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 3200);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(3200);
    },
    get packetSendInternalHook(){
        return buffer.add(1723);
    },
    get getLineProcessTask(){
        return buffer.getPointer(3208);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 3208);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(3208);
    },
    get std_cin(){
        return buffer.getPointer(3216);
    },
    set std_cin(n){
        buffer.setPointer(n, 3216);
    },
    get addressof_std_cin(){
        return buffer.add(3216);
    },
    get std_getline(){
        return buffer.getPointer(3224);
    },
    set std_getline(n){
        buffer.setPointer(n, 3224);
    },
    get addressof_std_getline(){
        return buffer.add(3224);
    },
    get std_string_ctor(){
        return buffer.getPointer(3232);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 3232);
    },
    get addressof_std_string_ctor(){
        return buffer.add(3232);
    },
    get getline(){
        return buffer.add(1813);
    },
    get Core_String_toWide_string_span(){
        return buffer.getPointer(3240);
    },
    set Core_String_toWide_string_span(n){
        buffer.setPointer(n, 3240);
    },
    get addressof_Core_String_toWide_string_span(){
        return buffer.add(3240);
    },
    get Core_String_toWide_charptr(){
        return buffer.add(1901);
    },
};
runtimeError.addFunctionTable(buffer.add(2180), 30, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":89,"callJsFunction":282,"crosscall_on_gamethread":500,"jsend_crash":747,"jsend_crossthread":620,"raise_runtime_error":1047,"jsend_returnZero":761,"logHookAsyncCb":798,"logHook":817,"runtime_error":1029,"ServerInstance_ctor_hook":1123,"debugBreak":1131,"CommandOutputSenderHook":1133,"ConsoleInputReader_getLine_hook":1151,"gameThreadEntry":1165,"gameThreadHook":1200,"wrapped_main":1257,"updateWithSleep":1300,"actorDestructorHook":1325,"packetRawHook":1355,"packetBeforeHook":1396,"packetBeforeCancelHandling":1451,"packetAfterHook":1486,"packetSendHook":1551,"packetSendAllHook":1645,"packetSendInternalHook":1723,"getline":1813,"Core_String_toWide_charptr":1901});
