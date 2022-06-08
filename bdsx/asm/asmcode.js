const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(3372, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\u3905\u000a\u4900\uc0c7\u0001\u0000\u8948\uff02\u1915\u000a\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u0a4a\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\u55cc\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u0a02\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u0a10\u0000\u73e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u09e8\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\uc715\u0009\u8500\u75c0\u484a\u4b8b\uff18\uc915\u0009\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\uc105\u0009\uf200\u110f\uc105\u0009\u4800\uec89\u8348\u28c4\u5d5b\u8b48\u7105\u0009\uc300\u8148\u98ec\u0000\u4c00\u9c89\u9024\u0000\u4800\u4c89\u4824\u8948\u2454\u4c50\u4489\u5824\u894c\u244c\uf260\u110f\u2444\uf268\u110f\u244c\uf270\u110f\u2454\uf278\u110f\u249c\u0080\u0000\u894c\u2454\u4c30\u448d\u4024\u8d48\u2454\u4848\u0d8b\u092c\u0000\u8fe8\ufffe\u85ff\u75c0\u4843\u4c8b\u3024\u8d4c\u244c\u4928\uc0c7\u0002\u0000\u8b48\ucb05\u0008\u4800\u548d\u3824\u8948\u2444\uff38\ue315\u0008\u8500\u75c0\u4817\u058b\u0918\u0000\u0ff2\u0510\u0918\u0000\u8148\u98c4\u0000\uc300\u8b48\u244c\u4848\u548b\u5024\u8b4c\u2444\u4c58\u4c8b\u6024\u0ff2\u4410\u6824\u0ff2\u4c10\u7024\u0ff2\u5410\u7824\u0ff2\u9c10\u8024\u0000\u4800\uc481\u0098\u0000\u64ff\uf824\u4853\uec83\u4820\u598b\u4c20\u438d\u4840\u538d\u4848\u0d8b\u088e\u0000\uf1e8\ufffd\u85ff\u75c0\u4850\u4b8b\u4c30\u4b8d\u4928\uc0c7\u0002\u0000\u8b48\u2f05\u0008\u4800\u538d\u4838\u4389\uff38\u4915\u0008\u8500\u75c0\u4828\u058b\u087e\u0000\u0ff2\u0510\u087e\u0000\u8b48\u204b\u8948\u2843\u0ff2\u4311\uff30\u8b15\u0008\u4800\uc483\u5b20\u48c3\uc483\u5b20\u7feb\u8148\u98ec\u0000\u3d00\u0003\u0001\u7175\uc931\ud231\u3145\u45c0\uc931\u15ff\u0850\u0000\u8948\u2444\u4820\u0d8d\uff5e\uffff\uc748\u08c2\u0000\uff00\u0f15\u0008\u4800\u4489\u1824\u8948\uffc1\u0915\u0008\u4800\u448b\u1824\u8948\u48e2\u4c8b\u2024\u8948\u2050\uffba\uffff\uffff\u2515\u0008\u4800\u4c8b\u2024\u15ff\u080a\u0000\u8b48\u2444\uf228\u100f\u2444\u4830\uc481\u0098\u0000\u89c3\u81c1\u00c9\u0000\ue9e0\u011f\u0000\u48c3\uec83\u4818\u4c8d\u1024\u15ff\u074a\u0000\uc085\u0b75\u8b48\u244c\uff10\ubb15\u0007\u3100\u48c0\uc483\uc318\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u070a\u0000\u53c3\u8348\u20ec\u4c89\u3024\u8948\u2454\u4c38\u4489\u4024\u894c\u244c\u4c48\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\ue715\u0006\u4800\uc085\u880f\u0060\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffac\uffff\u15ff\u073a\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u06a2\u0000\u15ff\u068c\u0000\u8948\u3bd9\ub305\u0006\u0f00\u0785\u0000\ue800\uff64\uffff\u43eb\u15ff\u06f8\u0000\u3beb\uc748\u20c2\u0000\u4800\u0d8d\uff4c\uffff\u15ff\u06da\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u03e0\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\u4838\uc483\u5b20\u48c3\u018b\u3881\u0003\u8000\u0674\u25ff\u0654\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u0636\u0000\u8d4c\u2504\u0094\u0000\u8d48\u044a\ud231\u15ff\u0652\u0000\u8d48\u244c\uff08\u0f15\u0006\u4800\uc481\u0588\u0000\u48c3\u0d89\u0690\u0000\uccc3\u48c3\uec83\u4828\uc189\u15ff\u0688\u0000\u8948\u48d8\uc483\uc328\u8b48\u810d\u0006\uff00\u8325\u0006\uc300\u8348\u28ec\u15ff\u0688\u0000\u8b48\u790d\u0006\uff00\u8b15\u0006\uff00\u7d15\u0006\u4800\u0d8b\u068e\u0000\u15ff\u0630\u0000\u8348\u28c4\u48c3\uec83\u4828\ucb89\u8948\u4d0d\u0006\u4800\u0d8d\uffbc\uffff\u15ff\u05d0\u0000\u8b48\u610d\u0006\u4800\uc2c7\uffff\uffff\u15ff\u0604\u0000\u8348\u28c4\u25ff\u0652\u0000\u8348\u28ec\u0d8b\u0658\u0000\u8b48\u4915\u0006\u4500\uc031\u15ff\u0650\u0000\u8348\u28c4\u8b48\u4d0d\u0006\uff00\u8725\u0005\u4800\uec83\uff28\u4515\u0006\u4800\uc483\uff28\u4325\u0006\u4800\uec83\uff08\uf115\u0004\u4800\uc483\u4808\u053b\u0516\u0000\u0675\u25ff\u062e\u0000\u48c3\u058d\u063e\u0000\u8a42\u3804\uc084\u0f74\u8948\u44e9\ufa89\u894d\uffe8\u1725\u0006\u4400\ufa89\u8d48\u908d\u0000\uff00\u0f25\u0006\u4800\uec83\uff28\u0d15\u0007\u4800\uc483\u8528\u74c0\u481c\u0d8d\u05fe\u0000\u0f42\u0cb6\u8539\u74c9\u480c\ue989\u894c\ufffa\uf125\u0006\uc300\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\ud525\u0006\u4800\uec83\u4828\u8d8b\u0090\u0000\u15ff\u06d4\u0000\u8d4c\uad15\u0005\u4300\u048a\u483a\uc483\u8428\u74c0\u4810\u8d8b\u0090\u0000\u894c\uffea\ua925\u0006\uc300\u8348\u48ec\u8b49\uff00\u0850\u8d4c\u7f15\u0005\u4200\u048a\u8410\u0fc0\u3284\u0000\u4800\u4c89\u2024\u8948\u2454\u4c28\u4489\u3024\u894c\u244c\uff38\u8915\u0006\u4800\u4c8b\u2024\u8b48\u2454\u4c28\u448b\u3024\u8b4c\u244c\u8538\u75c0\u480a\uc483\uff48\u5f25\u0006\u4800\uc483\uc348\u8348\u28ec\u8b49\uff07\u0850\u8d4c\u2115\u0005\u4200\u048a\u8410\u74c0\u4d1b\uf889\u8948\uffda\u3d15\u0006\u8500\u74c0\u480b\uc483\u5928\u25ff\u0636\u0000\u8348\u28c4\u854d\u75f6\u5907\u25ff\u062e\u0000\u0f41\u86b6\u00a0\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u04d4\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u05f6\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u05dc\u0000\u8348\u48c4\u53c3\u4856\uec83\u4818\ucb89\u8b48\ucf0d\u0005\u4800\u148d\u2825\u0000\uff00\u8115\u0003\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u05c8\u0000\u8b48\ub10d\u0005\u4800\uc289\uc749\u0ac0\u0000\uff00\ua915\u0005\u4800\uf189\u15ff\u0358\u0000\ub8eb\u8348\u18c4\u5b5e\u48c3\uec83\u3138\u49c0\ud089\u028a\u8348\u01c2\uc085\uf675\u294c\u48c2\uea83\u4801\u5489\u1024\u894c\u2444\u4818\u548d\u1024\u15ff\u0578\u0000\u8348\u38c4\u48c3\uec83\uff28\u8915\u0002\u3b00\u7b05\u0005\u7500\u4815\u0d8b\u03b2\u0000\u15ff\u02ec\u0000\uc931\u15ff\u055c\u0000\u8348\u28c4\u25ff\u054a\u0000\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0013\u0501\u0002\u3205\u3001\u0701\u0002\u0107\u0013\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u4204\u0000\u0000\u0000\u0056\u0000\u07e0\u0000\u0056\u0000\u0057\u0000\u07e4\u0000\u0057\u0000\u0118\u0000\u07e8\u0000\u0118\u0000\u01f2\u0000\u07f4\u0000\u01f2\u0000\u026a\u0000\u07fc\u0000\u026a\u0000\u02e9\u0000\u0804\u0000\u02e9\u0000\u02f7\u0000\u080c\u0000\u02f7\u0000\u031c\u0000\u0810\u0000\u031c\u0000\u032f\u0000\u0818\u0000\u032f\u0000\u0403\u0000\u081c\u0000\u0403\u0000\u0415\u0000\u0824\u0000\u0415\u0000\u0461\u0000\u0828\u0000\u0461\u0000\u0469\u0000\u0830\u0000\u0469\u0000\u046b\u0000\u0834\u0000\u046b\u0000\u0480\u0000\u0838\u0000\u0480\u0000\u048e\u0000\u0840\u0000\u048e\u0000\u04bd\u0000\u0844\u0000\u04bd\u0000\u04f6\u0000\u084c\u0000\u04f6\u0000\u0521\u0000\u0854\u0000\u0521\u0000\u0535\u0000\u085c\u0000\u0535\u0000\u0553\u0000\u0864\u0000\u0553\u0000\u0581\u0000\u086c\u0000\u0581\u0000\u05b0\u0000\u0870\u0000\u05b0\u0000\u05d3\u0000\u0878\u0000\u05d3\u0000\u0608\u0000\u087c\u0000\u0608\u0000\u0666\u0000\u0884\u0000\u0666\u0000\u06b3\u0000\u088c\u0000\u06b3\u0000\u0711\u0000\u0894\u0000\u0711\u0000\u0769\u0000\u089c\u0000\u0769\u0000\u079d\u0000\u08a8\u0000\u079d\u0000\u07de\u0000\u08b0\u0000\u0000\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2608);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2608);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2608);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2616);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2616);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2616);
    },
    get vsnprintf(){
        return buffer.getPointer(2624);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2624);
    },
    get addressof_vsnprintf(){
        return buffer.add(2624);
    },
    get JsConstructObject(){
        return buffer.getPointer(2632);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2632);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2632);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2640);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2640);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2640);
    },
    get js_null(){
        return buffer.getPointer(2648);
    },
    set js_null(n){
        buffer.setPointer(n, 2648);
    },
    get addressof_js_null(){
        return buffer.add(2648);
    },
    get nodeThreadId(){
        return buffer.getInt32(2656);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2656);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2656);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2664);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2664);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2664);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2672);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2672);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2672);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2680);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2680);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2680);
    },
    get JsCallFunction(){
        return buffer.getPointer(2688);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2688);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2688);
    },
    get js_undefined(){
        return buffer.getPointer(2696);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2696);
    },
    get addressof_js_undefined(){
        return buffer.add(2696);
    },
    get pointer_js2class(){
        return buffer.getPointer(2704);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2704);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2704);
    },
    get NativePointer(){
        return buffer.getPointer(2712);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2712);
    },
    get addressof_NativePointer(){
        return buffer.add(2712);
    },
    get memset(){
        return buffer.getPointer(2720);
    },
    set memset(n){
        buffer.setPointer(n, 2720);
    },
    get addressof_memset(){
        return buffer.add(2720);
    },
    get uv_async_call(){
        return buffer.getPointer(2728);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2728);
    },
    get addressof_uv_async_call(){
        return buffer.add(2728);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2736);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2736);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2736);
    },
    get uv_async_post(){
        return buffer.getPointer(2744);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2744);
    },
    get addressof_uv_async_post(){
        return buffer.add(2744);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2752);
    },
    set raxValue(n){
        buffer.setPointer(n, 2752);
    },
    get addressof_raxValue(){
        return buffer.add(2752);
    },
    get xmm0Value(){
        return buffer.getPointer(2760);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_xmm0Value(){
        return buffer.add(2760);
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
        return buffer.getPointer(2768);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2768);
    },
    get CreateEventW(){
        return buffer.getPointer(2776);
    },
    set CreateEventW(n){
        buffer.setPointer(n, 2776);
    },
    get addressof_CreateEventW(){
        return buffer.add(2776);
    },
    get CloseHandle(){
        return buffer.getPointer(2784);
    },
    set CloseHandle(n){
        buffer.setPointer(n, 2784);
    },
    get addressof_CloseHandle(){
        return buffer.add(2784);
    },
    get SetEvent(){
        return buffer.getPointer(2792);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2792);
    },
    get addressof_SetEvent(){
        return buffer.add(2792);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2800);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2800);
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
        return buffer.getPointer(2808);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2808);
    },
    get addressof_serverInstance(){
        return buffer.add(2808);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(1121);
    },
    get debugBreak(){
        return buffer.add(1129);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2816);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2816);
    },
    get CommandOutputSenderHook(){
        return buffer.add(1131);
    },
    get commandQueue(){
        return buffer.getPointer(2824);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2824);
    },
    get addressof_commandQueue(){
        return buffer.add(2824);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2832);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2832);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(1152);
    },
    get gameThreadStart(){
        return buffer.getPointer(2848);
    },
    set gameThreadStart(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_gameThreadStart(){
        return buffer.add(2848);
    },
    get gameThreadFinish(){
        return buffer.getPointer(2856);
    },
    set gameThreadFinish(n){
        buffer.setPointer(n, 2856);
    },
    get addressof_gameThreadFinish(){
        return buffer.add(2856);
    },
    get gameThreadInner(){
        return buffer.getPointer(2864);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2864);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2864);
    },
    get free(){
        return buffer.getPointer(2872);
    },
    set free(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_free(){
        return buffer.add(2872);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2880);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2880);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2888);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2888);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2888);
    },
    get gameThreadHook(){
        return buffer.add(1213);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2896);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2896);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2896);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2904);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2904);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2904);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2912);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2912);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2912);
    },
    get finishCallback(){
        return buffer.getPointer(2920);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2920);
    },
    get addressof_finishCallback(){
        return buffer.add(2920);
    },
    get wrapped_main(){
        return buffer.add(1270);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2928);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2928);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2928);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2936);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2936);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2936);
    },
    get updateWithSleep(){
        return buffer.add(1313);
    },
    get removeActor(){
        return buffer.getPointer(2944);
    },
    set removeActor(n){
        buffer.setPointer(n, 2944);
    },
    get addressof_removeActor(){
        return buffer.add(2944);
    },
    get actorDestructorHook(){
        return buffer.add(1333);
    },
    get onPacketRaw(){
        return buffer.getPointer(2952);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2952);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2952);
    },
    get createPacketRaw(){
        return buffer.getPointer(2960);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2960);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2960);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2968+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2968+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2968);
    },
    get packetRawHook(){
        return buffer.add(1363);
    },
    get packetBeforeOriginal(){
        return buffer.getPointer(3224);
    },
    set packetBeforeOriginal(n){
        buffer.setPointer(n, 3224);
    },
    get addressof_packetBeforeOriginal(){
        return buffer.add(3224);
    },
    get onPacketBefore(){
        return buffer.getPointer(3232);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 3232);
    },
    get addressof_onPacketBefore(){
        return buffer.add(3232);
    },
    get packetBeforeHook(){
        return buffer.add(1409);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(3240);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 3240);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(3240);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1456);
    },
    get onPacketAfter(){
        return buffer.getPointer(3248);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 3248);
    },
    get addressof_onPacketAfter(){
        return buffer.add(3248);
    },
    get handlePacket(){
        return buffer.getPointer(3256);
    },
    set handlePacket(n){
        buffer.setPointer(n, 3256);
    },
    get addressof_handlePacket(){
        return buffer.add(3256);
    },
    get packetAfterHook(){
        return buffer.add(1491);
    },
    get sendOriginal(){
        return buffer.getPointer(3264);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 3264);
    },
    get addressof_sendOriginal(){
        return buffer.add(3264);
    },
    get onPacketSend(){
        return buffer.getPointer(3272);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 3272);
    },
    get addressof_onPacketSend(){
        return buffer.add(3272);
    },
    get packetSendHook(){
        return buffer.add(1544);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(3280);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 3280);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(3280);
    },
    get packetSendAllJumpPoint(){
        return buffer.getPointer(3288);
    },
    set packetSendAllJumpPoint(n){
        buffer.setPointer(n, 3288);
    },
    get addressof_packetSendAllJumpPoint(){
        return buffer.add(3288);
    },
    get packetSendAllHook(){
        return buffer.add(1638);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(3296);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 3296);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(3296);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(3304);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 3304);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(3304);
    },
    get packetSendInternalHook(){
        return buffer.add(1715);
    },
    get getLineProcessTask(){
        return buffer.getPointer(3312);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 3312);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(3312);
    },
    get std_cin(){
        return buffer.getPointer(3320);
    },
    set std_cin(n){
        buffer.setPointer(n, 3320);
    },
    get addressof_std_cin(){
        return buffer.add(3320);
    },
    get std_getline(){
        return buffer.getPointer(3328);
    },
    set std_getline(n){
        buffer.setPointer(n, 3328);
    },
    get addressof_std_getline(){
        return buffer.add(3328);
    },
    get std_string_ctor(){
        return buffer.getPointer(3336);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 3336);
    },
    get addressof_std_string_ctor(){
        return buffer.add(3336);
    },
    get getline(){
        return buffer.add(1809);
    },
    get Core_String_toWide_string_span(){
        return buffer.getPointer(3344);
    },
    set Core_String_toWide_string_span(n){
        buffer.setPointer(n, 3344);
    },
    get addressof_Core_String_toWide_string_span(){
        return buffer.add(3344);
    },
    get Core_String_toWide_charptr(){
        return buffer.add(1897);
    },
    get terminate(){
        return buffer.getPointer(3352);
    },
    set terminate(n){
        buffer.setPointer(n, 3352);
    },
    get addressof_terminate(){
        return buffer.add(3352);
    },
    get ExitThread(){
        return buffer.getPointer(3360);
    },
    set ExitThread(n){
        buffer.setPointer(n, 3360);
    },
    get addressof_ExitThread(){
        return buffer.add(3360);
    },
    get bdsMainThreadId(){
        return buffer.getInt32(3368);
    },
    set bdsMainThreadId(n){
        buffer.setInt32(n, 3368);
    },
    get addressof_bdsMainThreadId(){
        return buffer.add(3368);
    },
    get terminateHook(){
        return buffer.add(1949);
    },
};
runtimeError.addFunctionTable(buffer.add(2232), 31, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":87,"callJsFunction":280,"crosscall_on_gamethread":498,"jsend_crash":745,"jsend_crossthread":618,"raise_runtime_error":1045,"jsend_returnZero":759,"logHookAsyncCb":796,"logHook":815,"runtime_error":1027,"ServerInstance_ctor_hook":1121,"debugBreak":1129,"CommandOutputSenderHook":1131,"ConsoleInputReader_getLine_hook":1152,"gameThreadEntry":1166,"gameThreadHook":1213,"wrapped_main":1270,"updateWithSleep":1313,"actorDestructorHook":1333,"packetRawHook":1363,"packetBeforeHook":1409,"packetBeforeCancelHandling":1456,"packetAfterHook":1491,"packetSendHook":1544,"packetSendAllHook":1638,"packetSendInternalHook":1715,"getline":1809,"Core_String_toWide_charptr":1897,"terminateHook":1949});
