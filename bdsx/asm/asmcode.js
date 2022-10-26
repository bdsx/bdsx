const { cgate, runtimeError } = require('../core');
const { asm } = require('../assembler');
require('../codealloc');
const buffer = cgate.allocExecutableMemory(3396, 8);
buffer.setBin('\u8348\u28ec\u8948\u2454\u4c38\u4489\u4024\u8d4c\u244c\u4820\u548d\u3024\u8b48\u6105\u000a\u4900\uc0c7\u0001\u0000\u8948\uff02\u4115\u000a\u8500\u75c0\u481e\u548b\u4024\u8b48\u244c\u4820\u0a89\u15ff\u0a72\u0000\u8b48\u244c\u4838\u4889\u3110\u48c0\uc483\uc328\u55cc\u4853\ue589\u8348\u28ec\u894c\u31c3\u48c0\u558d\u4828\u0289\u8b48\u084b\u15ff\u0a2a\u0000\u2b48\u2865\u8d4c\u3845\u8948\u48e2\u0d8b\u0a38\u0000\u73e8\uffff\u85ff\u0fc0\u9c85\u0000\u4800\u4b8b\u4c18\u4d8d\u4c28\u058b\u0a0c\u0000\u8d48\u3055\u894c\u3045\uc749\u02c0\u0000\u4800\uec83\uff20\ueb15\u0009\u8500\u75c0\u4870\u4b8b\uff10\ued15\u0009\u4800\uc483\u4820\u0c8b\u4824\u548b\u0824\u8b4c\u2444\u4c10\u4c8b\u1824\u0ff2\u0410\uf224\u100f\u244c\uf208\u100f\u2454\uf210\u100f\u245c\uff18\u1050\u8948\u1845\u0ff2\u4511\u4820\u4b8b\u4c20\u4d8d\u4828\u558d\u4930\uc0c7\u0002\u0000\u8348\u20ec\u15ff\u0986\u0000\u8548\u75c0\u480a\u458b\u4828\uec89\u5d5b\u48c3\u058b\u0978\u0000\u8948\u5bec\uc35d\u8148\ua8ec\u0000\u4c00\u9c89\ua024\u0000\u4800\u4c89\u4824\u8948\u2454\u4c50\u4489\u5824\u894c\u244c\uf260\u110f\u2444\uf268\u110f\u244c\uf270\u110f\u2454\uf278\u110f\u249c\u0080\u0000\u894c\u2454\u4c30\u448d\u4024\u8d48\u2454\u4848\u0d8b\u092e\u0000\u69e8\ufffe\u85ff\u75c0\u4845\u4c8b\u3024\u8d4c\u244c\u4928\uc0c7\u0002\u0000\u8b48\ucd05\u0008\u4800\u548d\u3824\u8948\u2444\uff38\ue515\u0008\u8500\u75c0\u4819\u848b\u9024\u0000\uf200\u100f\u2484\u0098\u0000\u8148\ua8c4\u0000\uc300\u8b48\u244c\u4848\u548b\u5024\u8b4c\u2444\u4c58\u4c8b\u6024\u0ff2\u4410\u6824\u0ff2\u4c10\u7024\u0ff2\u5410\u7824\u0ff2\u9c10\u8024\u0000\u4800\uc481\u00a8\u0000\u64ff\uf824\u4853\uec83\u4820\u598b\u4c20\u438d\u4840\u538d\u4848\u0d8b\u088e\u0000\uc9e8\ufffd\u85ff\u75c0\u4838\u4b8b\u4c30\u4b8d\u4928\uc0c7\u0002\u0000\u8b48\u2f05\u0008\u4800\u538d\u4838\u4389\uff38\u4915\u0008\u8500\u75c0\u4810\u4b8b\uff20\u9315\u0008\u4800\uc483\u5b20\u48c3\uc483\u5b20\u85e9\u0000\u4800\uec81\u00a8\u0000\u033d\u0100\u7500\u3177\u31c9\u45d2\uc031\u3145\uffc9\u5515\u0008\u4800\u4489\u2024\u8d48\u730d\uffff\u48ff\uc2c7\u0008\u0000\u15ff\u0824\u0000\u8948\u2444\u4818\uc189\u15ff\u081e\u0000\u8b48\u2444\u4818\ue289\u8b48\u244c\u4820\u5089\uba20\uffff\uffff\u15ff\u082a\u0000\u8b48\u244c\uff20\u0f15\u0008\u4800\u848b\u9024\u0000\uf200\u100f\u2484\u0098\u0000\u8148\ua8c4\u0000\uc300\uc189\uc981\u0000\ue000\u1fe9\u0001\uc300\u8348\u18ec\u8d48\u244c\uff10\u5915\u0007\u8500\u75c0\u480b\u4c8b\u1024\u15ff\u07ba\u0000\uc031\u8348\u18c4\u4cc3\u418b\u4828\u518d\u4830\u498b\uff20\u1925\u0007\uc300\u4853\uec83\u8920\u244c\u4830\u5489\u3824\u894c\u2444\u4c40\u4c89\u4824\u8d4c\u244c\u4940\ud089\ud231\ud189\u15ff\u06f6\u0000\u8548\u0fc0\u6088\u0000\u4800\uc389\u8d48\u1150\u8d48\uac0d\uffff\uffff\u4915\u0007\u4800\u4c8b\u3024\u8948\u2048\u8948\u2858\u8d4c\u244c\u4c40\u448b\u3824\u8d48\u0153\u8d48\u3048\u8948\uffc3\ub115\u0006\uff00\u9b15\u0006\u4800\ud989\u053b\u06c2\u0000\u850f\u0007\u0000\u64e8\uffff\uebff\uff43\u0715\u0007\ueb00\u483b\uc2c7\u0020\u0000\u8d48\u4c0d\uffff\uffff\ue915\u0006\u4800\u548b\u3024\u8948\u2050\uc748\u2840\u000f\u0000\u8d48\ude0d\u0003\u4800\u118b\u8948\u3050\u8b48\u0851\u8948\u3850\u8348\u20c4\uc35b\u8b48\u8101\u0338\u0000\u7480\uff06\u6325\u0006\uc300\u8148\u88ec\u0005\u4800\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\u4515\u0006\u4c00\u048d\u9425\u0000\u4800\u4a8d\u3104\uffd2\u6115\u0006\u4800\u4c8d\u0824\u15ff\u061e\u0000\u8148\u88c4\u0005\uc300\u8948\u8f0d\u0006\uc300\uc3cc\u8948\uc3c8\u8348\u28ec\u8948\uffc1\u8315\u0006\u4800\ud889\u8348\u28c4\u48c3\u0d8b\u067c\u0000\u25ff\u067e\u0000\u48c3\uec83\uff28\u8315\u0006\u4800\u0d8b\u0674\u0000\u15ff\u0686\u0000\u15ff\u0678\u0000\u8b48\u890d\u0006\uff00\u2b15\u0006\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u0648\u0000\u8d48\ubc0d\uffff\uffff\udb15\u0005\u4800\u0d8b\u065c\u0000\uc748\uffc2\uffff\uffff\uff15\u0005\u4800\uc483\uff28\u4d25\u0006\u4800\uec83\u8b28\u530d\u0006\u4800\u158b\u0644\u0000\u3145\uffc0\u4b15\u0006\u4800\uc483\u4828\u0d8b\u0648\u0000\u25ff\u0592\u0000\u8348\u28ec\u15ff\u0640\u0000\u8348\u28c4\u25ff\u063e\u0000\u8348\u08ec\u15ff\u04fc\u0000\u8348\u08c4\u3b48\u2105\u0005\u7500\uff06\u2925\u0006\uc300\u8d48\u3905\u0006\u4200\u048a\u8438\u74c0\u480f\ue989\u8944\u4df2\ue889\u25ff\u0612\u0000\u8944\u48f2\u4d8d\uff78\u0d25\u0006\u4800\uec83\uff28\u0b15\u0007\u4800\uc483\u8528\u74c0\u481c\u0d8d\u05fc\u0000\u0f42\u0cb6\u8531\u74c9\u480c\ue989\u894c\ufff2\uef25\u0006\uc300\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\ud325\u0006\u4800\uec83\u4c28\uea89\u8b48\u784d\u15ff\u06d2\u0000\u8d4c\uab15\u0005\u4300\u048a\u4832\uc483\u8428\u74c0\u480d\u4d8b\u4c78\uea89\u25ff\u06aa\u0000\u48c3\uec83\u4948\u008b\u50ff\u4c08\u158d\u0580\u0000\u8a42\u1004\uc084\u840f\u0032\u0000\u8948\u244c\u4820\u5489\u2824\u894c\u2444\u4c30\u4c89\u3824\u15ff\u068a\u0000\u8b48\u244c\u4820\u548b\u2824\u8b4c\u2444\u4c30\u4c8b\u3824\uc085\u0a75\u8348\u48c4\u25ff\u0660\u0000\u8348\u48c4\u48c3\uec83\u4928\u078b\u50ff\u4c08\u158d\u0522\u0000\u8a42\u1004\uc084\u1b74\u894d\u48f8\uda89\u15ff\u063e\u0000\uc085\u0b74\u8348\u28c4\uff59\u3725\u0006\u4800\uc483\u4d28\uf685\u0775\uff59\u2f25\u0006\u4100\ub60f\ua086\u0000\uc300\u8348\u48ec\u8b49\uff00\u0850\u8d4c\ud515\u0004\u4200\u048a\u8410\u0fc0\u3284\u0000\u4800\u4c89\u2024\u8948\u2454\u4c28\u4489\u3024\u894c\u244c\uff38\uf715\u0005\u4800\u4c8b\u2024\u8b48\u2454\u4c28\u448b\u3024\u8b4c\u244c\u8538\u75c0\u480a\uc483\uff48\udd25\u0005\u4800\uc483\uc348\u5653\u8348\u18ec\u8948\u48cb\u0d8b\u05d0\u0000\u8d48\u2514\u0028\u0000\u15ff\u0392\u0000\u8948\u4058\u8948\u48c6\u4e8d\uff20\uc915\u0005\u4800\u0d8b\u05b2\u0000\u8948\u49c2\uc0c7\u000a\u0000\u15ff\u05aa\u0000\u8948\ufff1\u6915\u0003\ueb00\u48b8\uc483\u5e18\uc35b\u8348\u38ec\uc031\u8949\u8ad0\u4802\uc283\u8501\u75c0\u4cf6\uc229\u8348\u01ea\u8948\u2454\u4c10\u4489\u1824\u8d48\u2454\uff10\u7915\u0005\u4800\uc483\uc338\u8348\u28ec\u15ff\u029a\u0000\u053b\u057c\u0000\u1575\u8b48\ub30d\u0003\uff00\ufd15\u0002\u3100\uffc9\u5d15\u0005\u4800\uc483\uff28\u4b25\u0005\u5b00\u6f66\u6d72\u7461\u6620\u6961\u656c\u5d64\u0000\u0000\u0001\u0000\u0001\u0000\u0501\u0503\u0305\u3002\u5001\u0000\u0701\u0002\u0107\u0015\u0501\u0002\u3205\u3001\u0701\u0002\u0107\u0015\u0001\u0000\u0401\u0001\u2204\u0000\u0001\u0000\u0501\u0002\u3205\u3001\u0001\u0000\u0701\u0002\u0107\u00b1\u0001\u0000\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0601\u0003\u2206\u6002\u3001\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u4204\u0000\u0000\u0000\u0056\u0000\u07f8\u0000\u0056\u0000\u0057\u0000\u07fc\u0000\u0057\u0000\u013e\u0000\u0800\u0000\u013e\u0000\u021a\u0000\u080c\u0000\u021a\u0000\u027d\u0000\u0814\u0000\u027d\u0000\u0302\u0000\u081c\u0000\u0302\u0000\u0310\u0000\u0824\u0000\u0310\u0000\u0335\u0000\u0828\u0000\u0335\u0000\u0348\u0000\u0830\u0000\u0348\u0000\u041c\u0000\u0834\u0000\u041c\u0000\u042e\u0000\u083c\u0000\u042e\u0000\u047a\u0000\u0840\u0000\u047a\u0000\u0482\u0000\u0848\u0000\u0482\u0000\u0484\u0000\u084c\u0000\u0484\u0000\u0488\u0000\u0850\u0000\u0488\u0000\u049d\u0000\u0854\u0000\u049d\u0000\u04ab\u0000\u085c\u0000\u04ab\u0000\u04da\u0000\u0860\u0000\u04da\u0000\u0513\u0000\u0868\u0000\u0513\u0000\u053e\u0000\u0870\u0000\u053e\u0000\u0552\u0000\u0878\u0000\u0552\u0000\u0570\u0000\u0880\u0000\u0570\u0000\u059b\u0000\u0888\u0000\u059b\u0000\u05ca\u0000\u088c\u0000\u05ca\u0000\u05ed\u0000\u0894\u0000\u05ed\u0000\u061f\u0000\u0898\u0000\u061f\u0000\u067d\u0000\u08a0\u0000\u067d\u0000\u06ca\u0000\u08a8\u0000\u06ca\u0000\u0728\u0000\u08b0\u0000\u0728\u0000\u0780\u0000\u08b8\u0000\u0780\u0000\u07b4\u0000\u08c4\u0000\u07b4\u0000\u07f5\u0000\u08cc\u0000\u0000\u0000');
exports.asmcode = {
    get GetCurrentThreadId(){
        return buffer.getPointer(2648);
    },
    set GetCurrentThreadId(n){
        buffer.setPointer(n, 2648);
    },
    get addressof_GetCurrentThreadId(){
        return buffer.add(2648);
    },
    get bedrockLogNp(){
        return buffer.getPointer(2656);
    },
    set bedrockLogNp(n){
        buffer.setPointer(n, 2656);
    },
    get addressof_bedrockLogNp(){
        return buffer.add(2656);
    },
    get vsnprintf(){
        return buffer.getPointer(2664);
    },
    set vsnprintf(n){
        buffer.setPointer(n, 2664);
    },
    get addressof_vsnprintf(){
        return buffer.add(2664);
    },
    get JsConstructObject(){
        return buffer.getPointer(2672);
    },
    set JsConstructObject(n){
        buffer.setPointer(n, 2672);
    },
    get addressof_JsConstructObject(){
        return buffer.add(2672);
    },
    get JsGetAndClearException(){
        return buffer.getPointer(2680);
    },
    set JsGetAndClearException(n){
        buffer.setPointer(n, 2680);
    },
    get addressof_JsGetAndClearException(){
        return buffer.add(2680);
    },
    get js_null(){
        return buffer.getPointer(2688);
    },
    set js_null(n){
        buffer.setPointer(n, 2688);
    },
    get addressof_js_null(){
        return buffer.add(2688);
    },
    get nodeThreadId(){
        return buffer.getInt32(2696);
    },
    set nodeThreadId(n){
        buffer.setInt32(n, 2696);
    },
    get addressof_nodeThreadId(){
        return buffer.add(2696);
    },
    get runtimeErrorRaise(){
        return buffer.getPointer(2704);
    },
    set runtimeErrorRaise(n){
        buffer.setPointer(n, 2704);
    },
    get addressof_runtimeErrorRaise(){
        return buffer.add(2704);
    },
    get RtlCaptureContext(){
        return buffer.getPointer(2712);
    },
    set RtlCaptureContext(n){
        buffer.setPointer(n, 2712);
    },
    get addressof_RtlCaptureContext(){
        return buffer.add(2712);
    },
    get JsNumberToInt(){
        return buffer.getPointer(2720);
    },
    set JsNumberToInt(n){
        buffer.setPointer(n, 2720);
    },
    get addressof_JsNumberToInt(){
        return buffer.add(2720);
    },
    get JsCallFunction(){
        return buffer.getPointer(2728);
    },
    set JsCallFunction(n){
        buffer.setPointer(n, 2728);
    },
    get addressof_JsCallFunction(){
        return buffer.add(2728);
    },
    get js_undefined(){
        return buffer.getPointer(2736);
    },
    set js_undefined(n){
        buffer.setPointer(n, 2736);
    },
    get addressof_js_undefined(){
        return buffer.add(2736);
    },
    get pointer_js2class(){
        return buffer.getPointer(2744);
    },
    set pointer_js2class(n){
        buffer.setPointer(n, 2744);
    },
    get addressof_pointer_js2class(){
        return buffer.add(2744);
    },
    get NativePointer(){
        return buffer.getPointer(2752);
    },
    set NativePointer(n){
        buffer.setPointer(n, 2752);
    },
    get addressof_NativePointer(){
        return buffer.add(2752);
    },
    get memset(){
        return buffer.getPointer(2760);
    },
    set memset(n){
        buffer.setPointer(n, 2760);
    },
    get addressof_memset(){
        return buffer.add(2760);
    },
    get uv_async_call(){
        return buffer.getPointer(2768);
    },
    set uv_async_call(n){
        buffer.setPointer(n, 2768);
    },
    get addressof_uv_async_call(){
        return buffer.add(2768);
    },
    get uv_async_alloc(){
        return buffer.getPointer(2776);
    },
    set uv_async_alloc(n){
        buffer.setPointer(n, 2776);
    },
    get addressof_uv_async_alloc(){
        return buffer.add(2776);
    },
    get uv_async_post(){
        return buffer.getPointer(2784);
    },
    set uv_async_post(n){
        buffer.setPointer(n, 2784);
    },
    get addressof_uv_async_post(){
        return buffer.add(2784);
    },
    get pointer_np2js(){
        return buffer.add(0);
    },
    get breakBeforeCallNativeFunction(){
        return buffer.add(86);
    },
    get callNativeFunction(){
        return buffer.add(87);
    },
    get callJsFunction(){
        return buffer.add(318);
    },
    get jshook_fireError(){
        return buffer.getPointer(2792);
    },
    set jshook_fireError(n){
        buffer.setPointer(n, 2792);
    },
    get addressof_jshook_fireError(){
        return buffer.add(2792);
    },
    get CreateEventW(){
        return buffer.getPointer(2800);
    },
    set CreateEventW(n){
        buffer.setPointer(n, 2800);
    },
    get addressof_CreateEventW(){
        return buffer.add(2800);
    },
    get CloseHandle(){
        return buffer.getPointer(2808);
    },
    set CloseHandle(n){
        buffer.setPointer(n, 2808);
    },
    get addressof_CloseHandle(){
        return buffer.add(2808);
    },
    get SetEvent(){
        return buffer.getPointer(2816);
    },
    set SetEvent(n){
        buffer.setPointer(n, 2816);
    },
    get addressof_SetEvent(){
        return buffer.add(2816);
    },
    get WaitForSingleObject(){
        return buffer.getPointer(2824);
    },
    set WaitForSingleObject(n){
        buffer.setPointer(n, 2824);
    },
    get addressof_WaitForSingleObject(){
        return buffer.add(2824);
    },
    get jsend_crash(){
        return buffer.add(770);
    },
    get jsend_crossthread(){
        return buffer.add(637);
    },
    get raise_runtime_error(){
        return buffer.add(1070);
    },
    get jsend_returnZero(){
        return buffer.add(784);
    },
    get logHookAsyncCb(){
        return buffer.add(821);
    },
    get logHook(){
        return buffer.add(840);
    },
    get runtime_error(){
        return buffer.add(1052);
    },
    get serverInstance(){
        return buffer.getPointer(2832);
    },
    set serverInstance(n){
        buffer.setPointer(n, 2832);
    },
    get addressof_serverInstance(){
        return buffer.add(2832);
    },
    get ServerInstance_ctor_hook(){
        return buffer.add(1146);
    },
    get debugBreak(){
        return buffer.add(1154);
    },
    get returnRcx(){
        return buffer.add(1156);
    },
    get CommandOutputSenderHookCallback(){
        return buffer.getPointer(2840);
    },
    set CommandOutputSenderHookCallback(n){
        buffer.setPointer(n, 2840);
    },
    get addressof_CommandOutputSenderHookCallback(){
        return buffer.add(2840);
    },
    get CommandOutputSenderHook(){
        return buffer.add(1160);
    },
    get commandQueue(){
        return buffer.getPointer(2848);
    },
    set commandQueue(n){
        buffer.setPointer(n, 2848);
    },
    get addressof_commandQueue(){
        return buffer.add(2848);
    },
    get MultiThreadQueueTryDequeue(){
        return buffer.getPointer(2856);
    },
    set MultiThreadQueueTryDequeue(n){
        buffer.setPointer(n, 2856);
    },
    get addressof_MultiThreadQueueTryDequeue(){
        return buffer.add(2856);
    },
    get ConsoleInputReader_getLine_hook(){
        return buffer.add(1181);
    },
    get gameThreadStart(){
        return buffer.getPointer(2872);
    },
    set gameThreadStart(n){
        buffer.setPointer(n, 2872);
    },
    get addressof_gameThreadStart(){
        return buffer.add(2872);
    },
    get gameThreadFinish(){
        return buffer.getPointer(2880);
    },
    set gameThreadFinish(n){
        buffer.setPointer(n, 2880);
    },
    get addressof_gameThreadFinish(){
        return buffer.add(2880);
    },
    get gameThreadInner(){
        return buffer.getPointer(2888);
    },
    set gameThreadInner(n){
        buffer.setPointer(n, 2888);
    },
    get addressof_gameThreadInner(){
        return buffer.add(2888);
    },
    get free(){
        return buffer.getPointer(2896);
    },
    set free(n){
        buffer.setPointer(n, 2896);
    },
    get addressof_free(){
        return buffer.add(2896);
    },
    get evWaitGameThreadEnd(){
        return buffer.getPointer(2904);
    },
    set evWaitGameThreadEnd(n){
        buffer.setPointer(n, 2904);
    },
    get addressof_evWaitGameThreadEnd(){
        return buffer.add(2904);
    },
    get _Cnd_do_broadcast_at_thread_exit(){
        return buffer.getPointer(2912);
    },
    set _Cnd_do_broadcast_at_thread_exit(n){
        buffer.setPointer(n, 2912);
    },
    get addressof__Cnd_do_broadcast_at_thread_exit(){
        return buffer.add(2912);
    },
    get gameThreadHook(){
        return buffer.add(1242);
    },
    get bedrock_server_exe_args(){
        return buffer.getPointer(2920);
    },
    set bedrock_server_exe_args(n){
        buffer.setPointer(n, 2920);
    },
    get addressof_bedrock_server_exe_args(){
        return buffer.add(2920);
    },
    get bedrock_server_exe_argc(){
        return buffer.getInt32(2928);
    },
    set bedrock_server_exe_argc(n){
        buffer.setInt32(n, 2928);
    },
    get addressof_bedrock_server_exe_argc(){
        return buffer.add(2928);
    },
    get bedrock_server_exe_main(){
        return buffer.getPointer(2936);
    },
    set bedrock_server_exe_main(n){
        buffer.setPointer(n, 2936);
    },
    get addressof_bedrock_server_exe_main(){
        return buffer.add(2936);
    },
    get finishCallback(){
        return buffer.getPointer(2944);
    },
    set finishCallback(n){
        buffer.setPointer(n, 2944);
    },
    get addressof_finishCallback(){
        return buffer.add(2944);
    },
    get wrapped_main(){
        return buffer.add(1299);
    },
    get cgateNodeLoop(){
        return buffer.getPointer(2952);
    },
    set cgateNodeLoop(n){
        buffer.setPointer(n, 2952);
    },
    get addressof_cgateNodeLoop(){
        return buffer.add(2952);
    },
    get updateEvTargetFire(){
        return buffer.getPointer(2960);
    },
    set updateEvTargetFire(n){
        buffer.setPointer(n, 2960);
    },
    get addressof_updateEvTargetFire(){
        return buffer.add(2960);
    },
    get updateWithSleep(){
        return buffer.add(1342);
    },
    get removeActor(){
        return buffer.getPointer(2968);
    },
    set removeActor(n){
        buffer.setPointer(n, 2968);
    },
    get addressof_removeActor(){
        return buffer.add(2968);
    },
    get actorDestructorHook(){
        return buffer.add(1362);
    },
    get onPacketRaw(){
        return buffer.getPointer(2976);
    },
    set onPacketRaw(n){
        buffer.setPointer(n, 2976);
    },
    get addressof_onPacketRaw(){
        return buffer.add(2976);
    },
    get createPacketRaw(){
        return buffer.getPointer(2984);
    },
    set createPacketRaw(n){
        buffer.setPointer(n, 2984);
    },
    get addressof_createPacketRaw(){
        return buffer.add(2984);
    },
    getEnabledPacket(idx){
        return buffer.getUint8(2992+idx);
    },
    setEnabledPacket(n, idx){
        buffer.setUint8(n, 2992+idx);
    },
    get addressof_enabledPacket(){
        return buffer.add(2992);
    },
    get packetRawHook(){
        return buffer.add(1392);
    },
    get packetBeforeOriginal(){
        return buffer.getPointer(3248);
    },
    set packetBeforeOriginal(n){
        buffer.setPointer(n, 3248);
    },
    get addressof_packetBeforeOriginal(){
        return buffer.add(3248);
    },
    get onPacketBefore(){
        return buffer.getPointer(3256);
    },
    set onPacketBefore(n){
        buffer.setPointer(n, 3256);
    },
    get addressof_onPacketBefore(){
        return buffer.add(3256);
    },
    get packetBeforeHook(){
        return buffer.add(1435);
    },
    get PacketViolationHandlerHandleViolationAfter(){
        return buffer.getPointer(3264);
    },
    set PacketViolationHandlerHandleViolationAfter(n){
        buffer.setPointer(n, 3264);
    },
    get addressof_PacketViolationHandlerHandleViolationAfter(){
        return buffer.add(3264);
    },
    get packetBeforeCancelHandling(){
        return buffer.add(1482);
    },
    get onPacketAfter(){
        return buffer.getPointer(3272);
    },
    set onPacketAfter(n){
        buffer.setPointer(n, 3272);
    },
    get addressof_onPacketAfter(){
        return buffer.add(3272);
    },
    get handlePacket(){
        return buffer.getPointer(3280);
    },
    set handlePacket(n){
        buffer.setPointer(n, 3280);
    },
    get addressof_handlePacket(){
        return buffer.add(3280);
    },
    get packetAfterHook(){
        return buffer.add(1517);
    },
    get sendOriginal(){
        return buffer.getPointer(3288);
    },
    set sendOriginal(n){
        buffer.setPointer(n, 3288);
    },
    get addressof_sendOriginal(){
        return buffer.add(3288);
    },
    get onPacketSend(){
        return buffer.getPointer(3296);
    },
    set onPacketSend(n){
        buffer.setPointer(n, 3296);
    },
    get addressof_onPacketSend(){
        return buffer.add(3296);
    },
    get packetSendHook(){
        return buffer.add(1567);
    },
    get packetSendAllCancelPoint(){
        return buffer.getPointer(3304);
    },
    set packetSendAllCancelPoint(n){
        buffer.setPointer(n, 3304);
    },
    get addressof_packetSendAllCancelPoint(){
        return buffer.add(3304);
    },
    get packetSendAllJumpPoint(){
        return buffer.getPointer(3312);
    },
    set packetSendAllJumpPoint(n){
        buffer.setPointer(n, 3312);
    },
    get addressof_packetSendAllJumpPoint(){
        return buffer.add(3312);
    },
    get packetSendAllHook(){
        return buffer.add(1661);
    },
    get onPacketSendInternal(){
        return buffer.getPointer(3320);
    },
    set onPacketSendInternal(n){
        buffer.setPointer(n, 3320);
    },
    get addressof_onPacketSendInternal(){
        return buffer.add(3320);
    },
    get sendInternalOriginal(){
        return buffer.getPointer(3328);
    },
    set sendInternalOriginal(n){
        buffer.setPointer(n, 3328);
    },
    get addressof_sendInternalOriginal(){
        return buffer.add(3328);
    },
    get packetSendInternalHook(){
        return buffer.add(1738);
    },
    get getLineProcessTask(){
        return buffer.getPointer(3336);
    },
    set getLineProcessTask(n){
        buffer.setPointer(n, 3336);
    },
    get addressof_getLineProcessTask(){
        return buffer.add(3336);
    },
    get std_cin(){
        return buffer.getPointer(3344);
    },
    set std_cin(n){
        buffer.setPointer(n, 3344);
    },
    get addressof_std_cin(){
        return buffer.add(3344);
    },
    get std_getline(){
        return buffer.getPointer(3352);
    },
    set std_getline(n){
        buffer.setPointer(n, 3352);
    },
    get addressof_std_getline(){
        return buffer.add(3352);
    },
    get std_string_ctor(){
        return buffer.getPointer(3360);
    },
    set std_string_ctor(n){
        buffer.setPointer(n, 3360);
    },
    get addressof_std_string_ctor(){
        return buffer.add(3360);
    },
    get getline(){
        return buffer.add(1832);
    },
    get Core_String_toWide_string_span(){
        return buffer.getPointer(3368);
    },
    set Core_String_toWide_string_span(n){
        buffer.setPointer(n, 3368);
    },
    get addressof_Core_String_toWide_string_span(){
        return buffer.add(3368);
    },
    get Core_String_toWide_charptr(){
        return buffer.add(1920);
    },
    get terminate(){
        return buffer.getPointer(3376);
    },
    set terminate(n){
        buffer.setPointer(n, 3376);
    },
    get addressof_terminate(){
        return buffer.add(3376);
    },
    get ExitThread(){
        return buffer.getPointer(3384);
    },
    set ExitThread(n){
        buffer.setPointer(n, 3384);
    },
    get addressof_ExitThread(){
        return buffer.add(3384);
    },
    get bdsMainThreadId(){
        return buffer.getInt32(3392);
    },
    set bdsMainThreadId(n){
        buffer.setInt32(n, 3392);
    },
    get addressof_bdsMainThreadId(){
        return buffer.add(3392);
    },
    get terminateHook(){
        return buffer.add(1972);
    },
};
runtimeError.addFunctionTable(buffer.add(2260), 32, buffer);
asm.setFunctionNames(buffer, {"pointer_np2js":0,"breakBeforeCallNativeFunction":86,"callNativeFunction":87,"callJsFunction":318,"crosscall_on_gamethread":538,"jsend_crash":770,"jsend_crossthread":637,"raise_runtime_error":1070,"jsend_returnZero":784,"logHookAsyncCb":821,"logHook":840,"runtime_error":1052,"ServerInstance_ctor_hook":1146,"debugBreak":1154,"returnRcx":1156,"CommandOutputSenderHook":1160,"ConsoleInputReader_getLine_hook":1181,"gameThreadEntry":1195,"gameThreadHook":1242,"wrapped_main":1299,"updateWithSleep":1342,"actorDestructorHook":1362,"packetRawHook":1392,"packetBeforeHook":1435,"packetBeforeCancelHandling":1482,"packetAfterHook":1517,"packetSendHook":1567,"packetSendAllHook":1661,"packetSendInternalHook":1738,"getline":1832,"Core_String_toWide_charptr":1920,"terminateHook":1972});
