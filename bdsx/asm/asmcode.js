const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(3388, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\u4905\u000a\u4900\uc0c7\u0001\u0000\u8948\uff02\u2915\u000a\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u0a5a\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\u55cc\u4853\uec83\u4828\ue589\u894c\u31c3\u48c0\u558d\u4840\u0289\u8b48\u084b\u15ff\u0a12\u0000\u2b48\u4065\u8d4c\u5045\u8948\u48e2\u0d8b\u0a20\u0000\u73e8\uffff\u85ff\u75c0\u4876\u4b8b\u4c10\u4d8d\u4c40\u058b\u09f8\u0000\u8d48\u4855\u894c\u4845\uc749\u02c0\u0000\u4800\uec83\uff20\ud715\u0009\u8500\u75c0\u484a\u4b8b\uff18\ud915\u0009\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\ud105\u0009\uf200\u110f\ud105\u0009\u4800\uec89\u8348\u28c4\u5d5b\u8b48\u8105\u0009\uc300\u8148\u98ec\u0000\u4c00\u9c89\u9024\u0000\u4800\u4c89\u4824\u8948\u2454\u4c50\u4489\u5824\u894c\u244c\uf260\u110f\u2444\uf268\u110f\u244c\uf270\u110f\u2454\uf278\u110f\u249c\u0080\u0000\u894c\u2454\u4c30\u448d\u4024\u8d48\u2454\u4848\u0d8b\u093c\u0000\u8fe8\ufffe\u85ff\u75c0\u4843\u4c8b\u3024\u8d4c\u244c\u4928\uc0c7\u0002\u0000\u8b48\udb05\u0008\u4800\u548d\u3824\u8948\u2444\uff38\uf315\u0008\u8500\u75c0\u4817\u058b\u0928\u0000\u0ff2\u0510\u0928\u0000\u8148\u98c4\u0000\uc300\u8b48\u244c\u4848\u548b\u5024\u8b4c\u2444\u4c58\u4c8b\u6024\u0ff2\u4410\u6824\u0ff2\u4c10\u7024\u0ff2\u5410\u7824\u0ff2\u9c10\u8024\u0000\u4800\uc481\u0098\u0000\u64ff\uf824\u4853\uec83\u4820\u598b\u4c20\u438d\u4840\u538d\u4848\u0d8b\u089e\u0000\uf1e8\ufffd\u85ff\u75c0\u4850\u4b8b\u4c30\u4b8d\u4928\uc0c7\u0002\u0000\u8b48\u3f05\u0008\u4800\u538d\u4838\u4389\uff38\u5915\u0008\u8500\u75c0\u4828\u058b\u088e\u0000\u0ff2\u0510\u088e\u0000\u8b48\u204b\u8948\u2843\u0ff2\u4311\uff30\u9b15\u0008\u4800\uc483\u5b20\u48c3\uc483\u5b20\u7feb\u8148\u98ec\u0000\u3d00\u0003\u0001\u7175\uc931\ud231\u3145\u45c0\uc931\u15ff\u0860\u0000\u8948\u2444\u4820\u0d8d\uff5e\uffff\uc748\u08c2\u0000\uff00\u1f15\u0008\u4800\u4489\u1824\u8948\uffc1\u1915\u0008\u4800\u448b\u1824\u8948\u48e2\u4c8b\u2024\u8948\u2050\uffba\uffff\uffff\u3515\u0008\u4800\u4c8b\u2024\u15ff\u081a\u0000\u8b48\u2444\uf228\u100f\u2444\u4830\uc481\u0098\u0000\u89c3\u81c1\u00c9\u0000\ue9e0\u011f\u0000\u48c3\uec83\u4818\u4c8d\u1024\u15ff\u075a\u0000\uc085\u0b75\u8b48\u244c\uff10\ucb15\u0007\u3100\u48c0\uc483\uc318\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u071a\u0000\u53c3\u8348\u20ec\u4c89\u3024\u8948\u2454\u4c38\u4489\u4024\u894c\u244c\u4c48\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\uf715\u0006\u4800\uc085\u880f\u0060\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffac\uffff\u15ff\u074a\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u06b2\u0000\u15ff\u069c\u0000\u8948\u3bd9\uc305\u0006\u0f00\u0785\u0000\ue800\uff64\uffff\u43eb\u15ff\u0708\u0000\u3beb\uc748\u20c2\u0000\u4800\u0d8d\uff4c\uffff\u15ff\u06ea\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u03e4\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\u4838\uc483\u5b20\u48c3\u018b\u3881\u0003\u8000\u0674\u25ff\u0664\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u0646\u0000\u8d4c\u2504\u0094\u0000\u8d48\u044a\ud231\u15ff\u0662\u0000\u8d48\u244c\uff08\u1f15\u0006\u4800\uc481\u0588\u0000\u48c3\u0d89\u06a0\u0000\uccc3\u48c3\uc889\u48c3\uec83\u4828\uc189\u15ff\u0694\u0000\u8948\u48d8\uc483\uc328\u8b48\u8d0d\u0006\uff00\u8f25\u0006\uc300\u8348\u28ec\u15ff\u0694\u0000\u8b48\u850d\u0006\uff00\u9715\u0006\uff00\u8915\u0006\u4800\u0d8b\u069a\u0000\u15ff\u063c\u0000\u8348\u28c4\u48c3\uec83\u4828\ucb89\u8948\u590d\u0006\u4800\u0d8d\uffbc\uffff\u15ff\u05dc\u0000\u8b48\u6d0d\u0006\u4800\uc2c7\uffff\uffff\u15ff\u0610\u0000\u8348\u28c4\u25ff\u065e\u0000\u8348\u28ec\u0d8b\u0664\u0000\u8b48\u5515\u0006\u4500\uc031\u15ff\u065c\u0000\u8348\u28c4\u8b48\u590d\u0006\uff00\u9325\u0005\u4800\uec83\uff28\u5115\u0006\u4800\uc483\uff28\u4f25\u0006\u4800\uec83\uff08\ufd15\u0004\u4800\uc483\u4808\u053b\u0522\u0000\u0675\u25ff\u063a\u0000\u48c3\u058d\u064a\u0000\u8a42\u3804\uc084\u0f74\u8948\u44e9\ufa89\u894d\uffe8\u2325\u0006\u4400\ufa89\u8d48\u808d\u0000\uff00\u1b25\u0006\u4800\uec83\uff28\u1915\u0007\u4800\uc483\u8528\u74c0\u481c\u0d8d\u060a\u0000\u0f42\u0cb6\u8539\u74c9\u480c\ue989\u894c\ufffa\ufd25\u0006\uc300\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\ue125\u0006\u4800\uec83\u4828\u8d8b\u0080\u0000\u15ff\u06e0\u0000\u8d4c\ub915\u0005\u4300\u048a\u483a\uc483\u8428\u74c0\u4810\u8d8b\u0080\u0000\u894c\uffea\ub525\u0006\uc300\u8348\u48ec\u8b49\uff00\u0850\u8d4c\u8b15\u0005\u4200\u048a\u8410\u0fc0\u3284\u0000\u4800\u4c89\u2024\u8948\u2454\u4c28\u4489\u3024\u894c\u244c\uff38\u9515\u0006\u4800\u4c8b\u2024\u8b48\u2454\u4c28\u448b\u3024\u8b4c\u244c\u8538\u75c0\u480a\uc483\uff48\u6b25\u0006\u4800\uc483\uc348\u8348\u28ec\u8b49\uff07\u0850\u8d4c\u2d15\u0005\u4200\u048a\u8410\u74c0\u4d1b\uf889\u8948\uffda\u4915\u0006\u8500\u74c0\u480b\uc483\u5928\u25ff\u0642\u0000\u8348\u28c4\u854d\u75f6\u5907\u25ff\u063a\u0000\u0f41\u86b6\u00a0\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u04e0\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u0602\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u05e8\u0000\u8348\u48c4\u53c3\u4856\uec83\u4818\ucb89\u8b48\udb0d\u0005\u4800\u148d\u2825\u0000\uff00\u8d15\u0003\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u05d4\u0000\u8b48\ubd0d\u0005\u4800\uc289\uc749\u0ac0\u0000\uff00\ub515\u0005\u4800\uf189\u15ff\u0364\u0000\ub8eb\u8348\u18c4\u5b5e\u48c3\uec83\u3138\u49c0\ud089\u028a\u8348\u01c2\uc085\uf675\u294c\u48c2\uea83\u4801\u5489\u1024\u894c\u2444\u4818\u548d\u1024\u15ff\u0584\u0000\u8348\u38c4\u48c3\uec83\uff28\u9515\u0002\u3b00\u8705\u0005\u7500\u4815\u0d8b\u03be\u0000\u15ff\u02f8\u0000\uc931\u15ff\u0568\u0000\u8348\u28c4\u25ff\u0556\u0000\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d\u0000\u0001\u0000\u0001\u0000\u0901\u0504\u0309\u4206\u3002\u5001\u0701\u0002\u0107\u0013\u0501\u0002\u3205\u3001\u0701\u0002\u0107\u0013\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u4204\u0000\u0000\u0000\u0056\u0000\u07e4\u0000\u0056\u0000\u0057\u0000\u07e8\u0000\u0057\u0000\u0118\u0000\u07ec\u0000\u0118\u0000\u01f2\u0000\u07f8\u0000\u01f2\u0000\u026a\u0000\u0800\u0000\u026a\u0000\u02e9\u0000\u0808\u0000\u02e9\u0000\u02f7\u0000\u0810\u0000\u02f7\u0000\u031c\u0000\u0814\u0000\u031c\u0000\u032f\u0000\u081c\u0000\u032f\u0000\u0403\u0000\u0820\u0000\u0403\u0000\u0415\u0000\u0828\u0000\u0415\u0000\u0461\u0000\u082c\u0000\u0461\u0000\u0469\u0000\u0834\u0000\u0469\u0000\u046b\u0000\u0838\u0000\u046b\u0000\u046f\u0000\u083c\u0000\u046f\u0000\u0484\u0000\u0840\u0000\u0484\u0000\u0492\u0000\u0848\u0000\u0492\u0000\u04c1\u0000\u084c\u0000\u04c1\u0000\u04fa\u0000\u0854\u0000\u04fa\u0000\u0525\u0000\u085c\u0000\u0525\u0000\u0539\u0000\u0864\u0000\u0539\u0000\u0557\u0000\u086c\u0000\u0557\u0000\u0585\u0000\u0874\u0000\u0585\u0000\u05b4\u0000\u0878\u0000\u05b4\u0000\u05d7\u0000\u0880\u0000\u05d7\u0000\u060c\u0000\u0884\u0000\u060c\u0000\u066a\u0000\u088c\u0000\u066a\u0000\u06b7\u0000\u0894\u0000\u06b7\u0000\u0715\u0000\u089c\u0000\u0715\u0000\u076d\u0000\u08a4\u0000\u076d\u0000\u07a1\u0000\u08b0\u0000\u07a1\u0000\u07e2\u0000\u08b8\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2624);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2624);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2624);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2632);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2632);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2632);
    },
    get vsnprintf(){
        return buffer.getPointer(2640);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2640);
    },
    get addressof_vsnprintf(){
        return buffer.add(2640);
    },
    get JsConstructObject(){
        return buffer.getPointer(2648);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2648);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2648);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2656);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2656);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2656);
    },
    get js_null(){
        return buffer.getPointer(2664);
    },
    set js_null(n){
        buffer.setPointer(n, 2664);
    },
    get addressof_js_null(){
        return buffer.add(2664);
    },
    get nodeThreadId(){
        return buffer.getInt32(2672);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2672);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2672);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2680);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2680);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2680);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2688);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2688);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2688);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2696);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2696);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2696);
    },
    get JsCallFunction(){
        return buffer.getPointer(2704);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2704);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2704);
    },
    get js_undefined(){
        return buffer.getPointer(2712);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2712);
    },
    get addressof_js_undefined(){
        return buffer.add(2712);
    },
    get pointer_js2class(){
        return buffer.getPointer(2720);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2720);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2720);
    },
    get NativePointer(){
        return buffer.getPointer(2728);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2728);
    },
    get addressof_NativePointer(){
        return buffer.add(2728);
    },
    get memset(){
        return buffer.getPointer(2736);
    },
    set memset(n){
        buffer.setPointer(n, 2736);
    },
    get addressof_memset(){
        return buffer.add(2736);
    },
    get uv_async_call(){
        return buffer.getPointer(2744);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2744);
    },
    get addressof_uv_async_call(){
        return buffer.add(2744);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2752);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2752);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2752);
    },
    get uv_async_post(){
        return buffer.getPointer(2760);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_uv_async_post(){
        return buffer.add(2760);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get raxValue(){
        return buffer.getPointer(2768);
    },
    set raxValue(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_raxValue(){
        return buffer.add(2768);
    },
    get xmm0Value(){
        return buffer.getPointer(2776);
    },
    set xmm0Value(n){
        buffer.setPointer(n, 2776);
    },
    get addressof_xmm0Value(){
        return buffer.add(2776);
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
        return buffer.getPointer(2784);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2784);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2784);
    },
    get CreateEventW(){
        return buffer.getPointer(2792);
    },
    set CreateEventW(n){
        buffer.setPointer(n, 2792);
    },
    get addressof_CreateEventW(){
        return buffer.add(2792);
    },
    get CloseHandle(){
        return buffer.getPointer(2800);
    },
    set CloseHandle(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_CloseHandle(){
        return buffer.add(2800);
    },
    get SetEvent(){
        return buffer.getPointer(2808);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2808);
    },
    get addressof_SetEvent(){
        return buffer.add(2808);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2816);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2816);
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
        return buffer.getPointer(2824);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2824);
    },
    get addressof_serverInstance(){
        return buffer.add(2824);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(1121);
    },
    get debugBreak(){
        return buffer.add(1129);
    },
    get returnRcx(){
        return buffer.add(1131);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2832);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2832);
    },
    get CommandOutputSenderHook(){
        return buffer.add(1135);
    },
    get commandQueue(){
        return buffer.getPointer(2840);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2840);
    },
    get addressof_commandQueue(){
        return buffer.add(2840);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2848);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2848);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(1156);
    },
    get gameThreadStart(){
        return buffer.getPointer(2864);
    },
    set gameThreadStart(n){
        buffer.setPointer(n, 2864);
    },
    get addressof_gameThreadStart(){
        return buffer.add(2864);
    },
    get gameThreadFinish(){
        return buffer.getPointer(2872);
    },
    set gameThreadFinish(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_gameThreadFinish(){
        return buffer.add(2872);
    },
    get gameThreadInner(){
        return buffer.getPointer(2880);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2880);
    },
    get free(){
        return buffer.getPointer(2888);
    },
    set free(n){
        buffer.setPointer(n, 2888);
    },
    get addressof_free(){
        return buffer.add(2888);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2896);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2896);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2896);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2904);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2904);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2904);
    },
    get gameThreadHook(){
        return buffer.add(1217);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2912);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2912);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2912);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2920);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2920);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2920);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2928);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2928);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2928);
    },
    get finishCallback(){
        return buffer.getPointer(2936);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2936);
    },
    get addressof_finishCallback(){
        return buffer.add(2936);
    },
    get wrapped_main(){
        return buffer.add(1274);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2944);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2944);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2944);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2952);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2952);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2952);
    },
    get updateWithSleep(){
        return buffer.add(1317);
    },
    get removeActor(){
        return buffer.getPointer(2960);
    },
    set removeActor(n){
        buffer.setPointer(n, 2960);
    },
    get addressof_removeActor(){
        return buffer.add(2960);
    },
    get actorDestructorHook(){
        return buffer.add(1337);
    },
    get onPacketRaw(){
        return buffer.getPointer(2968);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2968);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2968);
    },
    get createPacketRaw(){
        return buffer.getPointer(2976);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2976);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2976);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2984+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2984+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2984);
    },
    get packetRawHook(){
        return buffer.add(1367);
    },
    get packetBeforeOriginal(){
        return buffer.getPointer(3240);
    },
    set packetBeforeOriginal(n){
        buffer.setPointer(n, 3240);
    },
    get addressof_packetBeforeOriginal(){
        return buffer.add(3240);
    },
    get onPacketBefore(){
        return buffer.getPointer(3248);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 3248);
    },
    get addressof_onPacketBefore(){
        return buffer.add(3248);
    },
    get packetBeforeHook(){
        return buffer.add(1413);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(3256);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 3256);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(3256);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1460);
    },
    get onPacketAfter(){
        return buffer.getPointer(3264);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 3264);
    },
    get addressof_onPacketAfter(){
        return buffer.add(3264);
    },
    get handlePacket(){
        return buffer.getPointer(3272);
    },
    set handlePacket(n){
        buffer.setPointer(n, 3272);
    },
    get addressof_handlePacket(){
        return buffer.add(3272);
    },
    get packetAfterHook(){
        return buffer.add(1495);
    },
    get sendOriginal(){
        return buffer.getPointer(3280);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 3280);
    },
    get addressof_sendOriginal(){
        return buffer.add(3280);
    },
    get onPacketSend(){
        return buffer.getPointer(3288);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 3288);
    },
    get addressof_onPacketSend(){
        return buffer.add(3288);
    },
    get packetSendHook(){
        return buffer.add(1548);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(3296);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 3296);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(3296);
    },
    get packetSendAllJumpPoint(){
        return buffer.getPointer(3304);
    },
    set packetSendAllJumpPoint(n){
        buffer.setPointer(n, 3304);
    },
    get addressof_packetSendAllJumpPoint(){
        return buffer.add(3304);
    },
    get packetSendAllHook(){
        return buffer.add(1642);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(3312);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 3312);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(3312);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(3320);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 3320);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(3320);
    },
    get packetSendInternalHook(){
        return buffer.add(1719);
    },
    get getLineProcessTask(){
        return buffer.getPointer(3328);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 3328);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(3328);
    },
    get std_cin(){
        return buffer.getPointer(3336);
    },
    set std_cin(n){
        buffer.setPointer(n, 3336);
    },
    get addressof_std_cin(){
        return buffer.add(3336);
    },
    get std_getline(){
        return buffer.getPointer(3344);
    },
    set std_getline(n){
        buffer.setPointer(n, 3344);
    },
    get addressof_std_getline(){
        return buffer.add(3344);
    },
    get std_string_ctor(){
        return buffer.getPointer(3352);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 3352);
    },
    get addressof_std_string_ctor(){
        return buffer.add(3352);
    },
    get getline(){
        return buffer.add(1813);
    },
    get Core_String_toWide_string_span(){
        return buffer.getPointer(3360);
    },
    set Core_String_toWide_string_span(n){
        buffer.setPointer(n, 3360);
    },
    get addressof_Core_String_toWide_string_span(){
        return buffer.add(3360);
    },
    get Core_String_toWide_charptr(){
        return buffer.add(1901);
    },
    get terminate(){
        return buffer.getPointer(3368);
    },
    set terminate(n){
        buffer.setPointer(n, 3368);
    },
    get addressof_terminate(){
        return buffer.add(3368);
    },
    get ExitThread(){
        return buffer.getPointer(3376);
    },
    set ExitThread(n){
        buffer.setPointer(n, 3376);
    },
    get addressof_ExitThread(){
        return buffer.add(3376);
    },
    get bdsMainThreadId(){
        return buffer.getInt32(3384);
    },
    set bdsMainThreadId(n){
        buffer.setInt32(n, 3384);
    },
    get addressof_bdsMainThreadId(){
        return buffer.add(3384);
    },
    get terminateHook(){
        return buffer.add(1953);
    },
};
runtimeError.addFunctionTable(buffer.add(2240), 32, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":87,"callJsFunction":280,"crosscall_on_gamethread":498,"jsend_crash":745,"jsend_crossthread":618,"raise_runtime_error":1045,"jsend_returnZero":759,"logHookAsyncCb":796,"logHook":815,"runtime_error":1027,"ServerInstance_ctor_hook":1121,"debugBreak":1129,"returnRcx":1131,"CommandOutputSenderHook":1135,"ConsoleInputReader_getLine_hook":1156,"gameThreadEntry":1170,"gameThreadHook":1217,"wrapped_main":1274,"updateWithSleep":1317,"actorDestructorHook":1337,"packetRawHook":1367,"packetBeforeHook":1413,"packetBeforeCancelHandling":1460,"packetAfterHook":1495,"packetSendHook":1548,"packetSendAllHook":1642,"packetSendInternalHook":1719,"getline":1813,"Core_String_toWide_charptr":1901,"terminateHook":1953});
