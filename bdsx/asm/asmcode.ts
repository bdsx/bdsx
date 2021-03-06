import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(3000, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\ub115\u0009\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u57ff\uff70\uc857\u8b48\u7847\u8348\u01e0\u0574\u73e8\uffff\uffff\udd15\u0009\u4800\uec83\u8548\u0fc9\u0e8f\u0000\u4800\u0d8d\u08ae\u0000\u68e8\uffff\uebff\u491a\uc889\u8d48\ub715\u0008\u4800\u4c8d\u2024\u15ff\u0946\u0000\u8d48\u244c\u4820\uc289\u57e8\uffff\u48ff\uc189\u9de8\uffff\u48ff\uec83\u4968\uc989\u8949\u48d0\u158d\u089e\u0000\u8d48\u244c\uff20\u1515\u0009\u4800\u4c8d\u2024\u8948\ue8c2\uff26\uffff\u8948\u48c1\uc483\ue968\uff68\uffff\u8348\u48ec\u8148\u03f9\u0100\u0f00\u3384\u0000\u4800\u4c89\u2824\u8b48\u7847\u8348\u01e0\u840f\u0046\u0000\u8d48\u244c\uff20\ud515\u0008\u8500\u75c0\u0f52\u44b6\u2024\uc085\u4974\u57ff\ue8c8\ufeb0\uffff\u15ff\u088a\u0000\u3948\u0305\u0009\u7400\ub90a\u0001\ue000\u0ae8\u0005\u4800\u158d\u0847\u0000\u15ff\u091a\u0000\u8d48\u244c\uff20\ue715\u0008\u7500\uff0e\uc857\u8b48\u244c\uff20\udf15\u0008\u4c00\u448b\u2824\u8d48\u3015\u0008\u4800\u4c8d\u2024\u15ff\u0860\u0000\u8d48\u244c\u4820\uc289\u71e8\ufffe\u48ff\uc189\ub7e8\ufffe\u48ff\uec83\u4c28\u4489\u4024\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u4515\u0008\u8500\u0fc0\u3c85\u0000\u8b00\u2444\u4810\ue883\u7401\u4839\ue883\u7502\u4c2c\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u0820\u0000\uc085\u1375\u8b48\u244c\u4818\u548b\u2024\u54ff\u4024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28c4\uc031\u48c3\uec83\u4838\u5489\u4824\u8948\u244c\u4840\u548d\u1024\u15ff\u07da\u0000\uc085\u850f\u0032\u0000\u448b\u1024\u8348\u01e8\u840f\u002b\u0000\u8348\u04e8\u840f\u0028\u0000\u8348\u05e8\u840f\u0034\u0000\u8348\u01e8\u840f\u004d\u0000\u8348\u01e8\u7274\u8b48\u244c\uff38\u4817\uc483\u3138\uc3c0\u8b48\u244c\uff40\ud857\u8548\u74c0\u48e5\u408b\u4810\uc483\uc338\u8d4c\u2444\u4818\u548d\u1024\u8b48\u244c\uff40\u7715\u0007\u8500\u75c0\u48c3\u448b\u1024\u8348\u38c4\u4cc3\u4c8d\u3024\u894c\u244c\u4d20\uc889\u8d48\u2454\u4828\u4c8b\u4024\u15ff\u0754\u0000\uc085\u9875\u8b48\u2444\u4828\uc483\uc338\u8d4c\u2444\u4818\u548d\u1024\u8b48\u244c\uff40\u3915\u0007\u8500\u0fc0\u7185\uffff\u48ff\u448b\u1024\u8348\u38c4\u48c3\uec83\u4828\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u06ee\u0000\uc085\u850f\u003e\u0000\u448b\u1024\u8348\u01e8\u840f\u0029\u0000\u8348\u02e8\u2a75\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\uc515\u0006\u8500\u75c0\u4811\u448b\u1824\u8348\u28c4\u48c3\uc483\u3128\uc3c0\u8b48\u244c\uff38\u4817\uec83\u4828\u5489\u3824\u8d48\u2454\u4110\ud0ff\uc085\u0a75\u8b48\u2444\u4810\uc483\uc328\u8b48\u244c\uff38\u4817\uec83\u4828\u5489\u3824\u8948\u0fca\u02b7\u8348\u02c2\uc085\uf575\u2948\u48ca\ueac1\u4c02\u448d\u1824\u57ff\u8528\u74c0\u480a\u448b\u1824\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8548\u75d2\u4808\u058b\u0664\u0000\u48c3\uec83\u4838\u5489\u4824\u8d4c\u244c\u4920\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u0642\u0000\u8948\uff02\u3115\u0006\u8500\u75c0\u4820\u4c8b\u2024\u57ff\u48d8\uc085\u1374\u8b48\u244c\u4848\u4889\u4810\u448b\u2024\u8348\u38c4\u48c3\uc189\uc9e8\ufffc\u48ff\uec83\u4838\u5489\u4824\u8949\u49d1\uc0c7\u0002\u0000\u8d48\u2454\u4828\u058b\u05ee\u0000\u8948\u4802\u058b\u05ec\u0000\u8948\u0842\u15ff\u05d2\u0000\uc085\u1975\u8b48\u2444\u4848\u088b\u57ff\u48d8\uc085\u0974\u8b48\u1040\u8348\u38c4\u48c3\uc189\u71e8\ufffc\u48ff\uec83\u4828\u5489\u3824\u8d4c\u2444\u4820\u548d\u1824\u15ff\u0574\u0000\uc085\u5975\u8b4c\u2444\u4d20\uc085\u4a74\u8b48\u244c\u4d18\u448d\u0048\u0f48\u01bf\u8348\u02c1\u394c\u74c1\u4833\ubf0f\u4811\ue2c1\u4810\ud009\u8348\u02c1\u394c\u74c1\u481f\ubf0f\u4811\ue2c1\u4820\ud009\u8348\u02c1\u394c\u74c1\u480b\ubf0f\u4811\ue2c1\u4830\ud009\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u38ec\u8948\u2454\u4830\u058b\u0528\u0000\u8948\u2444\u4c28\u4c8d\u2024\uc749\u02c0\u0000\u4800\u548d\u2824\u57ff\u8560\u75c0\u4816\u4c8b\u2024\u57ff\u48d8\uc085\u0974\u8b48\u1040\u8348\u38c4\u89c3\ue8c1\ufbaa\uffff\u8548\u75c9\u4808\u058b\u04e2\u0000\u48c3\uec83\u4838\u4c89\u5024\u8948\u2454\u4c48\uc189\u8d4c\u244c\u4930\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u04b8\u0000\u8948\uff02\ua715\u0004\u8500\u75c0\u483d\u4c8b\u3024\u57ff\u48d8\uc085\u3074\u8b48\u244c\u4850\u4889\u4c10\u4c8d\u2024\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\u244c\uff48\u6057\uc085\u0a75\u8b48\u2444\u4820\uc483\uc338\uc189\u23e8\ufffb\u4cff\u418b\u4828\u518d\u4830\u498b\uff20\ued25\u0003\uff00\udf15\u0003\u3900\u5905\u0004\u7500\u4811\u548d\u5824\u8948\u49f9\ud889\u25ff\u03ce\u0000\u8348\u28ec\u8d48\u1153\u8d48\uc00d\uffff\uffff\uc915\u0003\u4800\u7889\u4c20\u438d\u4c01\u4089\u4828\u488d\u4830\u948d\u8024\u0000\u4800\u4489\u2024\u15ff\u039e\u0000\u8b48\u244c\u4820\uc483\uff28\u9f25\u0003\u4800\u018b\u3881\u0003\u8000\u0674\u25ff\u0406\u0000\u48c3\ua48d\u7824\ufffa\u48ff\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\ue715\u0003\u4c00\u048d\u9025\u0000\u4800\ud231\u8d48\u244c\uff20\ud915\u0003\u4800\u4c8d\u0824\u15ff\u03be\u0000\u0db9\u0000\uebc0\u48b2\u0d89\u03d8\u0000\uccc3\u48c3\ue189\u8348\u28ec\u15ff\u03d0\u0000\u8348\u28c4\u8548\u74c0\u5907\u25ff\u03c8\u0000\u8948\ub075\u8b48\u4806\u488b\u4820\u018b\u48c3\uec83\u4c28\uc189\u15ff\u03b4\u0000\u8348\u28c4\u48c3\u548d\u3024\u8348\u28ec\u8b48\ua70d\u0003\uff00\ua915\u0003\u4800\uc483\uc328\u8348\u28ec\u8b48\ua10d\u0003\uff00\ua315\u0003\u4800\u0d8b\u03b4\u0000\u15ff\u03a6\u0000\u8348\u28c4\u48c3\uec83\u4828\u1d89\u037e\u0000\u15ff\u03a0\u0000\u8d48\uc50d\uffff\uffff\u3315\u0003\u4800\u0d8b\u0384\u0000\uc748\uffc2\uffff\uffff\u8715\u0003\uff00\u8915\u0003\u4800\uc483\uc328\u8348\u28ec\u0d8b\u038a\u0000\u8b48\u7b15\u0003\u4500\uc031\u15ff\u0382\u0000\u8348\u28c4\u8b48\u7f0d\u0003\uff00\ue925\u0002\u4800\uec83\u4828\ud989\u15ff\u0374\u0000\u8348\u28c4\u25ff\u0372\u0000\u51c3\u15ff\u0212\u0000\u4859\u0539\u028a\u0000\u0675\u25ff\u0362\u0000\u48c3\uec83\uff08\u5f15\u0003\u4800\uc483\u4808\uc189\uc148\u20e9\uc831\u48c3\uec83\u4828\ue989\u894c\u4dfa\ue889\u15ff\u0346\u0000\u8348\u28c4\u48c3\uec83\u4828\u018b\u8d4c\ue085\u0001\u4800\u558d\uff70\u2850\u8948\u48c1\uea89\u894d\ufff8\u2515\u0003\u4800\uc483\uc328\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\u0525\u0003\u4800\uec83\u4828\u018b\u8d4c\u488d\u0001\u4900\uf089\u894c\uffea\u0850\u8948\u4ce9\ufa89\u15ff\u02ea\u0000\u8348\u28c4\u48c3\ucb89\u0f41\ue9b6\u894c\u49c7\ud689\u8348\u28ec\u15ff\u02d6\u0000\u8348\u28c4\u8b48\u6883\u0002\u4900\uf889\u4dc3\uf089\u8948\u4cf2\uf989\u8348\u28ec\u15ff\u02b4\u0000\u8348\u28c4\u8b49\u4906\u978d\u0208\u0000\u894c\ufff1\u1860\u4dc3\uce89\u894c\u48c7\ud589\u8948\u48ce\uec83\uff28\u9115\u0002\u4800\uc483\u8528\u74c0\u480c\uf189\u8948\uffea\u8525\u0002\uc300\u5653\u8348\u18ec\u8948\u48cb\u0d8b\u027c\u0000\u8d48\u2514\u0028\u0000\u15ff\u0276\u0000\u8948\u4058\u8948\u48c6\u4e8d\uff20\u8515\u0002\u4800\u0d8b\u0266\u0000\u8948\u49c2\uc0c7\u000a\u0000\u15ff\u025e\u0000\u8948\ufff1\u5d15\u0002\ueb00\u48b8\uc483\u5e18\uc35b\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u7420\u6968\u0073\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u2520\u0064\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u6f63\u6e75\u2074\u6528\u7078\u6365\u6574\u3d64\u6425\u202c\u6361\u7574\u6c61\u253d\u2964\u4a00\u2053\u6f43\u746e\u7865\u2074\u6f6e\u2074\u6f66\u6e75\u0a64\u4a00\u4573\u7272\u726f\u6f43\u6564\u203a\u7830\u7825\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2528);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2536);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2536);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2544);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2552);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2560);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2560);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2568);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2568);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(2576);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 2576);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(2584);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 2584);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(2592);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 2592);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(2600);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 2600);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(2608);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 2608);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(2616);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 2616);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(2624);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 2624);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(2632);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 2632);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(2640);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 2640);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(2648);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 2648);
    },
    get nodeThreadId():number{
        return buffer.getInt32(2656);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 2656);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(2664);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 2664);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(2672);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 2672);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(2680);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 2680);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(2688);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 2688);
    },
    get memset():VoidPointer{
        return buffer.getPointer(2696);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 2696);
    },
    get printf():VoidPointer{
        return buffer.getPointer(2704);
    },
    set printf(n:VoidPointer){
        buffer.setPointer(n, 2704);
    },
    get makefunc_getout():NativePointer{
        return buffer.add(0);
    },
    get strlen():NativePointer{
        return buffer.add(19);
    },
    get makeError():NativePointer{
        return buffer.add(38);
    },
    get getout_jserror():NativePointer{
        return buffer.add(116);
    },
    get getout_invalid_parameter():NativePointer{
        return buffer.add(147);
    },
    get getout_invalid_parameter_count():NativePointer{
        return buffer.add(215);
    },
    get getout():NativePointer{
        return buffer.add(268);
    },
    get raise_runtime_error():NativePointer{
        return buffer.add(1651);
    },
    get str_js2np():NativePointer{
        return buffer.add(445);
    },
    get buffer_to_pointer():NativePointer{
        return buffer.add(557);
    },
    get utf16_js2np():NativePointer{
        return buffer.add(793);
    },
    get str_np2js():NativePointer{
        return buffer.add(895);
    },
    get utf16_np2js():NativePointer{
        return buffer.add(933);
    },
    get pointer_np2js_nullable():NativePointer{
        return buffer.add(992);
    },
    get pointer_np2js():NativePointer{
        return buffer.add(1005);
    },
    get pointer_js_new():NativePointer{
        return buffer.add(1091);
    },
    get bin64():NativePointer{
        return buffer.add(1179);
    },
    get wrapper_js2np():NativePointer{
        return buffer.add(1304);
    },
    get wrapper_np2js_nullable():NativePointer{
        return buffer.add(1378);
    },
    get wrapper_np2js():NativePointer{
        return buffer.add(1391);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(2712);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2712);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1513);
    },
    get logHook():NativePointer{
        return buffer.add(1531);
    },
    get runtime_error():NativePointer{
        return buffer.add(1633);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1722);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(2720);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get ServerInstance_startServerThread_hook():NativePointer{
        return buffer.add(1729);
    },
    get debugBreak():NativePointer{
        return buffer.add(1737);
    },
    get commandHookCallback():VoidPointer{
        return buffer.getPointer(2728);
    },
    set commandHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get MinecraftCommandsExecuteCommandAfter():VoidPointer{
        return buffer.getPointer(2736);
    },
    set MinecraftCommandsExecuteCommandAfter(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get commandHook():NativePointer{
        return buffer.add(1739);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2744);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1783);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2752);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2752);
    },
    get MultiThreadQueueDequeue():VoidPointer{
        return buffer.getPointer(2760);
    },
    set MultiThreadQueueDequeue(n:VoidPointer){
        buffer.setPointer(n, 2760);
    },
    get stdin_launchpad_hook():NativePointer{
        return buffer.add(1801);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2776);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2776);
    },
    get free():VoidPointer{
        return buffer.getPointer(2784);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2784);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2792);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2792);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2800);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2800);
    },
    get _Pad_Release():VoidPointer{
        return buffer.getPointer(2808);
    },
    set _Pad_Release(n:VoidPointer){
        buffer.setPointer(n, 2808);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2816);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2816);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2824);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2824);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1863);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2832);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2832);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2840);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2840);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2848);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2848);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2856);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2856);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1924);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2864);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2864);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2872);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2872);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1967);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2880);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2880);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1991);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2888);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2888);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(2015);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2896);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2896);
    },
    get packetRawHook():NativePointer{
        return buffer.add(2039);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2904);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2904);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2063);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2912);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2912);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2104);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2920);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2920);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2139);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2928);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2928);
    },
    get packetSendHook():NativePointer{
        return buffer.add(2179);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2217);
    },
    get onPacketSendRaw():VoidPointer{
        return buffer.getPointer(2936);
    },
    set onPacketSendRaw(n:VoidPointer){
        buffer.setPointer(n, 2936);
    },
    get NetworkHandlerGetConnectionFromId():VoidPointer{
        return buffer.getPointer(2944);
    },
    set NetworkHandlerGetConnectionFromId(n:VoidPointer){
        buffer.setPointer(n, 2944);
    },
    get packetSendInternalHook():NativePointer{
        return buffer.add(2257);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(2952);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 2952);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(2960);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 2960);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(2968);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 2968);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(2976);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 2976);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(2984);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 2984);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(2992);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 2992);
    },
    get getline():NativePointer{
        return buffer.add(2300);
    },
};
