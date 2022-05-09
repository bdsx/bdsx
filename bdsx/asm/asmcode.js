const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(3308, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\u0905\u000a\u4900\uc0c7\u0001\u0000\u8948\uff02\ue915\u0009\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u0a1a\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\u55cc\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u09d2\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u09e0\u0000\u73e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u09b8\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\u9715\u0009\u8500\u75c0\u484a\u4b8b\uff18\u9915\u0009\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\u9105\u0009\uf200\u110f\u9105\u0009\u4800\uec89\u8348\u28c4\u5d5b\u8b48\u4105\u0009\uc300\u8148\u98ec\u0000\u4c00\u9c89\u9024\u0000\u4800\u4c89\u4824\u8948\u2454\u4c50\u4489\u5824\u894c\u244c\uf260\u110f\u2444\uf268\u110f\u244c\uf270\u110f\u2454\uf278\u110f\u249c\u0080\u0000\u894c\u2454\u4c30\u448d\u4024\u8d48\u2454\u4848\u0d8b\u08fc\u0000\u8fe8\ufffe\u85ff\u75c0\u4843\u4c8b\u3024\u8d4c\u244c\u4928\uc0c7\u0002\u0000\u8b48\u9b05\u0008\u4800\u548d\u3824\u8948\u2444\uff38\ub315\u0008\u8500\u75c0\u4817\u058b\u08e8\u0000\u0ff2\u0510\u08e8\u0000\u8148\u98c4\u0000\uc300\u8b48\u244c\u4848\u548b\u5024\u8b4c\u2444\u4c58\u4c8b\u6024\u0ff2\u4410\u6824\u0ff2\u4c10\u7024\u0ff2\u5410\u7824\u0ff2\u9c10\u8024\u0000\u4800\uc481\u0098\u0000\u64ff\uf824\u4853\uec83\u4820\u598b\u4c20\u438d\u4840\u538d\u4848\u0d8b\u085e\u0000\uf1e8\ufffd\u85ff\u75c0\u4850\u4b8b\u4c30\u4b8d\u4928\uc0c7\u0002\u0000\u8b48\uff05\u0007\u4800\u538d\u4838\u4389\uff38\u1915\u0008\u8500\u75c0\u4828\u058b\u084e\u0000\u0ff2\u0510\u084e\u0000\u8b48\u204b\u8948\u2843\u0ff2\u4311\uff30\u5b15\u0008\u4800\uc483\u5b20\u48c3\uc483\u5b20\u7feb\u8148\u98ec\u0000\u3d00\u0003\u0001\u7175\uc931\ud231\u3145\u45c0\uc931\u15ff\u0820\u0000\u8948\u2444\u4820\u0d8d\uff5e\uffff\uc748\u08c2\u0000\uff00\udf15\u0007\u4800\u4489\u1824\u8948\uffc1\ud915\u0007\u4800\u448b\u1824\u8948\u48e2\u4c8b\u2024\u8948\u2050\uffba\uffff\uffff\uf515\u0007\u4800\u4c8b\u2024\u15ff\u07da\u0000\u8b48\u2444\uf228\u100f\u2444\u4830\uc481\u0098\u0000\u89c3\u81c1\u00c9\u0000\ue9e0\u011f\u0000\u48c3\uec83\u4818\u4c8d\u1024\u15ff\u071a\u0000\uc085\u0b75\u8b48\u244c\uff10\u8b15\u0007\u3100\u48c0\uc483\uc318\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u06da\u0000\u53c3\u8348\u20ec\u4c89\u3024\u8948\u2454\u4c38\u4489\u4024\u894c\u244c\u4c48\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\ub715\u0006\u4800\uc085\u880f\u0060\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffac\uffff\u15ff\u070a\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u0672\u0000\u15ff\u065c\u0000\u8948\u3bd9\u8305\u0006\u0f00\u0785\u0000\ue800\uff64\uffff\u43eb\u15ff\u06c8\u0000\u3beb\uc748\u20c2\u0000\u4800\u0d8d\uff4c\uffff\u15ff\u06aa\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u03c4\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\u4838\uc483\u5b20\u48c3\u018b\u3881\u0003\u8000\u0674\u25ff\u0624\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u0606\u0000\u8d4c\u2504\u0094\u0000\u8d48\u044a\ud231\u15ff\u0622\u0000\u8d48\u244c\uff08\udf15\u0005\u4800\uc481\u0588\u0000\u48c3\u0d89\u0660\u0000\uccc3\u48c3\uec83\u4828\u4c89\u3024\u894c\uffc1\u5315\u0006\u4800\u4c8b\u3024\u8348\u28c4\u48c3\u0d8b\u064a\u0000\u25ff\u064c\u0000\u48c3\uec83\uff28\u5115\u0006\u4800\u0d8b\u0642\u0000\u15ff\u0654\u0000\u15ff\u0646\u0000\u8b48\u570d\u0006\uff00\uf915\u0005\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u0616\u0000\u8d48\ubc0d\uffff\uffff\u9915\u0005\u4800\u0d8b\u062a\u0000\uc748\uffc2\uffff\uffff\ucd15\u0005\u4800\uc483\uff28\u1b25\u0006\u4800\uec83\u8b28\u210d\u0006\u4800\u158b\u0612\u0000\u3145\uffc0\u1915\u0006\u4800\uc483\u4828\u0d8b\u0616\u0000\u25ff\u0550\u0000\u8348\u28ec\u8b48\u244c\uff50\u0915\u0006\u4800\uc483\uff28\u0725\u0006\u4800\uec83\uff08\ub515\u0004\u4800\uc483\u4808\u053b\u04da\u0000\u0675\u25ff\u05f2\u0000\u89c3\u48f2\u058d\u0600\u0000\u048a\u8410\u74c0\u480c\ue989\u894d\ufff0\udd25\u0005\u4800\u8d8d\u0088\u0000\u25ff\u05d8\u0000\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\ubd25\u0006\u4800\uec83\u4828\u8d8b\u0088\u0000\u15ff\u06bc\u0000\u8b48\u888d\u0000\u4800\u018b\u50ff\u4c08\u158d\u0598\u0000\u8a41\u0204\u8348\u28c4\uc084\u1074\u8b48\u888d\u0000\u4c00\uf289\u25ff\u0684\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u056a\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u0664\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u063a\u0000\u8348\u48c4\u48c3\uec83\u4928\u068b\u50ff\u4c08\u158d\u050c\u0000\u8a42\u1004\uc084\u1b74\u894d\u48f0\uda89\u15ff\u0618\u0000\uc085\u0b74\u8348\u28c4\uff59\u1125\u0006\u4800\uc483\u4828\ued85\u0775\uff59\u0925\u0006\u0f00\u85b6\u00a0\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u04c0\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u05d2\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u05b8\u0000\u8348\u48c4\u53c3\u4856\uec83\u4818\ucb89\u8b48\uab0d\u0005\u4800\u148d\u2825\u0000\uff00\u6d15\u0003\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u05a4\u0000\u8b48\u8d0d\u0005\u4800\uc289\uc749\u0ac0\u0000\uff00\u8515\u0005\u4800\uf189\u15ff\u0344\u0000\ub8eb\u8348\u18c4\u5b5e\u48c3\uec83\u3138\u49c0\ud089\u028a\u8348\u01c2\uc085\uf675\u294c\u48c2\uea83\u4801\u5489\u1024\u894c\u2444\u4818\u548d\u1024\u15ff\u0554\u0000\u8348\u38c4\u48c3\uec83\uff28\u7515\u0002\u3b00\u5705\u0005\u7500\u4815\u0d8b\u039e\u0000\u15ff\u02d8\u0000\uc931\u15ff\u0538\u0000\u8348\u28c4\u25ff\u0526\u0000\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0013\u0501\u0002\u3205\u3001\u0701\u0002\u0107\u0013\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u4204\u0000\u0000\u0000\u0056\u0000\u07c4\u0000\u0056\u0000\u0057\u0000\u07c8\u0000\u0057\u0000\u0118\u0000\u07cc\u0000\u0118\u0000\u01f2\u0000\u07d8\u0000\u01f2\u0000\u026a\u0000\u07e0\u0000\u026a\u0000\u02e9\u0000\u07e8\u0000\u02e9\u0000\u02f7\u0000\u07f0\u0000\u02f7\u0000\u031c\u0000\u07f4\u0000\u031c\u0000\u032f\u0000\u07fc\u0000\u032f\u0000\u0403\u0000\u0800\u0000\u0403\u0000\u0415\u0000\u0808\u0000\u0415\u0000\u0461\u0000\u080c\u0000\u0461\u0000\u0469\u0000\u0814\u0000\u0469\u0000\u046b\u0000\u0818\u0000\u046b\u0000\u0487\u0000\u081c\u0000\u0487\u0000\u0495\u0000\u0824\u0000\u0495\u0000\u04c4\u0000\u0828\u0000\u04c4\u0000\u04fd\u0000\u0830\u0000\u04fd\u0000\u0528\u0000\u0838\u0000\u0528\u0000\u0541\u0000\u0840\u0000\u0541\u0000\u055f\u0000\u0848\u0000\u055f\u0000\u0588\u0000\u0850\u0000\u0588\u0000\u05ab\u0000\u0854\u0000\u05ab\u0000\u05ed\u0000\u0858\u0000\u05ed\u0000\u064b\u0000\u0860\u0000\u064b\u0000\u0697\u0000\u0868\u0000\u0697\u0000\u06f5\u0000\u0870\u0000\u06f5\u0000\u074d\u0000\u0878\u0000\u074d\u0000\u0781\u0000\u0884\u0000\u0781\u0000\u07c2\u0000\u088c\u0000\u0000\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2560);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2560);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2560);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2568);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2568);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2568);
    },
    get vsnprintf(){
        return buffer.getPointer(2576);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2576);
    },
    get addressof_vsnprintf(){
        return buffer.add(2576);
    },
    get JsConstructObject(){
        return buffer.getPointer(2584);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2584);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2584);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2592);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2592);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2592);
    },
    get js_null(){
        return buffer.getPointer(2600);
    },
    set js_null(n){
        buffer.setPointer(n, 2600);
    },
    get addressof_js_null(){
        return buffer.add(2600);
    },
    get nodeThreadId(){
        return buffer.getInt32(2608);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2608);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2608);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2616);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2616);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2616);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2624);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2624);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2624);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2632);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2632);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2632);
    },
    get JsCallFunction(){
        return buffer.getPointer(2640);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2640);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2640);
    },
    get js_undefined(){
        return buffer.getPointer(2648);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2648);
    },
    get addressof_js_undefined(){
        return buffer.add(2648);
    },
    get pointer_js2class(){
        return buffer.getPointer(2656);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2656);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2656);
    },
    get NativePointer(){
        return buffer.getPointer(2664);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2664);
    },
    get addressof_NativePointer(){
        return buffer.add(2664);
    },
    get memset(){
        return buffer.getPointer(2672);
    },
    set memset(n){
        buffer.setPointer(n, 2672);
    },
    get addressof_memset(){
        return buffer.add(2672);
    },
    get uv_async_call(){
        return buffer.getPointer(2680);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2680);
    },
    get addressof_uv_async_call(){
        return buffer.add(2680);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2688);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2688);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2688);
    },
    get uv_async_post(){
        return buffer.getPointer(2696);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2696);
    },
    get addressof_uv_async_post(){
        return buffer.add(2696);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2704);
    },
    set raxValue(n){
        buffer.setPointer(n, 2704);
    },
    get addressof_raxValue(){
        return buffer.add(2704);
    },
    get xmm0Value(){
        return buffer.getPointer(2712);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2712);
    },
    get addressof_xmm0Value(){
        return buffer.add(2712);
    },
    get breakBeforeCallNativeFunction(){
        return buffer.add(86);
    },
    get callNativeFunction(){
        return buffer.add(87);
    },
    get callJsFunction(){
        return buffer.add(280);
    },
    get jshook_fireError(){
        return buffer.getPointer(2720);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2720);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2720);
    },
    get CreateEventW(){
        return buffer.getPointer(2728);
    },
    set CreateEventW(n){
        buffer.setPointer(n, 2728);
    },
    get addressof_CreateEventW(){
        return buffer.add(2728);
    },
    get CloseHandle(){
        return buffer.getPointer(2736);
    },
    set CloseHandle(n){
        buffer.setPointer(n, 2736);
    },
    get addressof_CloseHandle(){
        return buffer.add(2736);
    },
    get SetEvent(){
        return buffer.getPointer(2744);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2744);
    },
    get addressof_SetEvent(){
        return buffer.add(2744);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2752);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2752);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2752);
    },
    get jsend_crash(){
        return buffer.add(745);
    },
    get jsend_crossthread(){
        return buffer.add(618);
    },
    get raise_runtime_error(){
        return buffer.add(1045);
    },
    get jsend_returnZero(){
        return buffer.add(759);
    },
    get logHookAsyncCb(){
        return buffer.add(796);
    },
    get logHook(){
        return buffer.add(815);
    },
    get runtime_error(){
        return buffer.add(1027);
    },
    get serverInstance(){
        return buffer.getPointer(2760);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_serverInstance(){
        return buffer.add(2760);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(1121);
    },
    get debugBreak(){
        return buffer.add(1129);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2768);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2768);
    },
    get CommandOutputSenderHook(){
        return buffer.add(1131);
    },
    get commandQueue(){
        return buffer.getPointer(2776);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2776);
    },
    get addressof_commandQueue(){
        return buffer.add(2776);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2784);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2784);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2784);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(1159);
    },
    get gameThreadStart(){
        return buffer.getPointer(2800);
    },
    set gameThreadStart(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_gameThreadStart(){
        return buffer.add(2800);
    },
    get gameThreadFinish(){
        return buffer.getPointer(2808);
    },
    set gameThreadFinish(n){
        buffer.setPointer(n, 2808);
    },
    get addressof_gameThreadFinish(){
        return buffer.add(2808);
    },
    get gameThreadInner(){
        return buffer.getPointer(2816);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2816);
    },
    get free(){
        return buffer.getPointer(2824);
    },
    set free(n){
        buffer.setPointer(n, 2824);
    },
    get addressof_free(){
        return buffer.add(2824);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2832);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2832);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2840);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2840);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2840);
    },
    get gameThreadHook(){
        return buffer.add(1220);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2848);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2848);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2856);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2856);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2856);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2864);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2864);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2864);
    },
    get finishCallback(){
        return buffer.getPointer(2872);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_finishCallback(){
        return buffer.add(2872);
    },
    get wrapped_main(){
        return buffer.add(1277);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2880);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2880);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2888);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2888);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2888);
    },
    get updateWithSleep(){
        return buffer.add(1320);
    },
    get removeActor(){
        return buffer.getPointer(2896);
    },
    set removeActor(n){
        buffer.setPointer(n, 2896);
    },
    get addressof_removeActor(){
        return buffer.add(2896);
    },
    get actorDestructorHook(){
        return buffer.add(1345);
    },
    get onPacketRaw(){
        return buffer.getPointer(2904);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2904);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2904);
    },
    get createPacketRaw(){
        return buffer.getPointer(2912);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2912);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2912);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2920+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2920+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2920);
    },
    get packetRawHook(){
        return buffer.add(1375);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(3176);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 3176);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(3176);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1416);
    },
    get onPacketAfter(){
        return buffer.getPointer(3184);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 3184);
    },
    get addressof_onPacketAfter(){
        return buffer.add(3184);
    },
    get handlePacket(){
        return buffer.getPointer(3192);
    },
    set handlePacket(n){
        buffer.setPointer(n, 3192);
    },
    get addressof_handlePacket(){
        return buffer.add(3192);
    },
    get packetAfterHook(){
        return buffer.add(1451);
    },
    get sendOriginal(){
        return buffer.getPointer(3200);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 3200);
    },
    get addressof_sendOriginal(){
        return buffer.add(3200);
    },
    get onPacketSend(){
        return buffer.getPointer(3208);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 3208);
    },
    get addressof_onPacketSend(){
        return buffer.add(3208);
    },
    get packetSendHook(){
        return buffer.add(1517);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(3216);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 3216);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(3216);
    },
    get packetSendAllJumpPoint(){
        return buffer.getPointer(3224);
    },
    set packetSendAllJumpPoint(n){
        buffer.setPointer(n, 3224);
    },
    get addressof_packetSendAllJumpPoint(){
        return buffer.add(3224);
    },
    get packetSendAllHook(){
        return buffer.add(1611);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(3232);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 3232);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(3232);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(3240);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 3240);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(3240);
    },
    get packetSendInternalHook(){
        return buffer.add(1687);
    },
    get getLineProcessTask(){
        return buffer.getPointer(3248);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 3248);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(3248);
    },
    get std_cin(){
        return buffer.getPointer(3256);
    },
    set std_cin(n){
        buffer.setPointer(n, 3256);
    },
    get addressof_std_cin(){
        return buffer.add(3256);
    },
    get std_getline(){
        return buffer.getPointer(3264);
    },
    set std_getline(n){
        buffer.setPointer(n, 3264);
    },
    get addressof_std_getline(){
        return buffer.add(3264);
    },
    get std_string_ctor(){
        return buffer.getPointer(3272);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 3272);
    },
    get addressof_std_string_ctor(){
        return buffer.add(3272);
    },
    get getline(){
        return buffer.add(1781);
    },
    get Core_String_toWide_string_span(){
        return buffer.getPointer(3280);
    },
    set Core_String_toWide_string_span(n){
        buffer.setPointer(n, 3280);
    },
    get addressof_Core_String_toWide_string_span(){
        return buffer.add(3280);
    },
    get Core_String_toWide_charptr(){
        return buffer.add(1869);
    },
    get terminate(){
        return buffer.getPointer(3288);
    },
    set terminate(n){
        buffer.setPointer(n, 3288);
    },
    get addressof_terminate(){
        return buffer.add(3288);
    },
    get ExitThread(){
        return buffer.getPointer(3296);
    },
    set ExitThread(n){
        buffer.setPointer(n, 3296);
    },
    get addressof_ExitThread(){
        return buffer.add(3296);
    },
    get bdsMainThreadId(){
        return buffer.getInt32(3304);
    },
    set bdsMainThreadId(n){
        buffer.setInt32(n, 3304);
    },
    get addressof_bdsMainThreadId(){
        return buffer.add(3304);
    },
    get terminateHook(){
        return buffer.add(1921);
    },
};
runtimeError.addFunctionTable(buffer.add(2196), 30, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":87,"callJsFunction":280,"crosscall_on_gamethread":498,"jsend_crash":745,"jsend_crossthread":618,"raise_runtime_error":1045,"jsend_returnZero":759,"logHookAsyncCb":796,"logHook":815,"runtime_error":1027,"ServerInstance_ctor_hook":1121,"debugBreak":1129,"CommandOutputSenderHook":1131,"ConsoleInputReader_getLine_hook":1159,"gameThreadEntry":1173,"gameThreadHook":1220,"wrapped_main":1277,"updateWithSleep":1320,"actorDestructorHook":1345,"packetRawHook":1375,"packetBeforeCancelHandling":1416,"packetAfterHook":1451,"packetSendHook":1517,"packetSendAllHook":1611,"packetSendInternalHook":1687,"getline":1781,"Core_String_toWide_charptr":1869,"terminateHook":1921});
