import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(2928, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\u6915\u0009\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u57ff\uff70\uc857\u8b48\u7847\u8348\u01e0\u0574\u73e8\uffff\uffff\u9515\u0009\u4800\uec83\u8548\u0fc9\u0e8f\u0000\u4800\u0d8d\u0876\u0000\u68e8\uffff\uebff\u491a\uc889\u8d48\u7f15\u0008\u4800\u4c8d\u2024\u15ff\u08fe\u0000\u8d48\u244c\u4820\uc289\u57e8\uffff\u48ff\uc189\u9de8\uffff\u48ff\uec83\u4968\uc989\u8949\u48d0\u158d\u0866\u0000\u8d48\u244c\uff20\ucd15\u0008\u4800\u4c8d\u2024\u8948\ue8c2\uff26\uffff\u8948\u48c1\uc483\ue968\uff68\uffff\u8348\u48ec\u8948\u244c\u4828\u478b\u4878\ue083\u0f01\u2084\u0000\u4800\u4c8d\u2024\u15ff\u089a\u0000\uc085\u2c75\ub60f\u2444\u8520\u74c0\uff23\uc857\ubde8\ufffe\u48ff\u4c8d\u2024\u15ff\u08d2\u0000\u0e75\u57ff\u48c8\u4c8b\u2024\u15ff\u08ca\u0000\u8b4c\u2444\u4828\u158d\u0815\u0000\u8d48\u244c\uff20\u4b15\u0008\u4800\u4c8d\u2024\u8948\ue8c2\ufea4\uffff\u8948\ue8c1\ufeea\uffff\u8348\u28ec\u894c\u2444\u4840\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u0830\u0000\uc085\u850f\u003c\u0000\u448b\u1024\u8348\u01e8\u3974\u8348\u02e8\u2c75\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\u0b15\u0008\u8500\u75c0\u4813\u4c8b\u1824\u8b48\u2454\uff20\u2454\u4840\uc483\uc328\u8b48\u244c\uff38\u4817\uc483\u3128\uc3c0\u8348\u38ec\u8948\u2454\u4848\u4c89\u4024\u8d48\u2454\uff10\uc515\u0007\u8500\u0fc0\u3285\u0000\u8b00\u2444\u4810\ue883\u0f01\u2b84\u0000\u4800\ue883\u0f04\u2884\u0000\u4800\ue883\u0f05\u3484\u0000\u4800\ue883\u0f01\u4d84\u0000\u4800\ue883\u7401\u4872\u4c8b\u3824\u17ff\u8348\u38c4\uc031\u48c3\u4c8b\u4024\u57ff\u48d8\uc085\ue574\u8b48\u1040\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u0762\u0000\uc085\uc375\u8b48\u2444\u4810\uc483\uc338\u8d4c\u244c\u4c30\u4c89\u2024\u894d\u48c8\u548d\u2824\u8b48\u244c\uff40\u3f15\u0007\u8500\u75c0\u4898\u448b\u2824\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u0724\u0000\uc085\u850f\uff71\uffff\u8b48\u2444\u4810\uc483\uc338\u8348\u28ec\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\ud915\u0006\u8500\u0fc0\u3e85\u0000\u8b00\u2444\u4810\ue883\u0f01\u2984\u0000\u4800\ue883\u7502\u4c2a\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u06b0\u0000\uc085\u1175\u8b48\u2444\u4818\uc483\uc328\u8348\u28c4\uc031\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\u548d\u1024\uff41\u85d0\u75c0\u480a\u448b\u1024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\uca89\ub70f\u4802\uc283\u8502\u75c0\u48f5\uca29\uc148\u02ea\u8d4c\u2444\uff18\u2857\uc085\u0a74\u8b48\u2444\u4818\uc483\uc328\u8b48\u244c\uff38\u4817\ud285\u0875\u8b48\u4f05\u0006\uc300\u8348\u38ec\u8948\u2454\u4c48\u4c8d\u2024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\u2d05\u0006\u4800\u0289\u15ff\u061c\u0000\uc085\u2075\u8b48\u244c\uff20\ud857\u8548\u74c0\u4813\u4c8b\u4824\u8948\u1048\u8b48\u2444\u4820\uc483\uc338\u8948\ue8c1\ufcfc\uffff\u8348\u38ec\u8948\u2454\u4948\ud189\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\ud905\u0005\u4800\u0289\u8b48\ud705\u0005\u4800\u4289\uff08\ubd15\u0005\u8500\u75c0\u4819\u448b\u4824\u8b48\uff08\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\u8948\ue8c1\ufca4\uffff\u8348\u28ec\u8948\u2454\u4c38\u448d\u2024\u8d48\u2454\uff18\u5f15\u0005\u8500\u75c0\u4c59\u448b\u2024\u854d\u74c0\u484a\u4c8b\u1824\u8d4d\u4844\u4800\ubf0f\u4801\uc183\u4c02\uc139\u3374\u0f48\u11bf\uc148\u10e2\u0948\u48d0\uc183\u4c02\uc139\u1f74\u0f48\u11bf\uc148\u20e2\u0948\u48d0\uc183\u4c02\uc139\u0b74\u0f48\u11bf\uc148\u30e2\u0948\u48d0\uc483\uc328\u8b48\u244c\uff38\u4817\uec83\u4838\u5489\u3024\u8b48\u1305\u0005\u4800\u4489\u2824\u8d4c\u244c\u4920\uc0c7\u0002\u0000\u8d48\u2454\uff28\u6057\uc085\u1675\u8b48\u244c\uff20\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\uc189\udde8\ufffb\u48ff\uc985\u0875\u8b48\ucd05\u0004\uc300\u8348\u38ec\u8948\u244c\u4850\u5489\u4824\u894c\u4cc1\u4c8d\u3024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\ua305\u0004\u4800\u0289\u15ff\u0492\u0000\uc085\u3d75\u8b48\u244c\uff30\ud857\u8548\u74c0\u4830\u4c8b\u5024\u8948\u1048\u8d4c\u244c\u4920\uc0c7\u0002\u0000\u8d48\u2454\u4828\u4c8b\u4824\u57ff\u8560\u75c0\u480a\u448b\u2024\u8348\u38c4\u89c3\ue8c1\ufb56\uffff\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u03d8\u0000\u15ff\u03ca\u0000\u0539\u0444\u0000\u1175\u8d48\u2454\u4858\uf989\u8949\uffd8\ub925\u0003\u4800\uec83\u4828\u538d\u4811\u0d8d\uffc0\uffff\u15ff\u03b4\u0000\u8948\u2078\u8d4c\u0143\u894c\u2840\u8d48\u3048\u8d48\u2494\u0080\u0000\u8948\u2444\uff20\u8915\u0003\u4800\u4c8b\u2024\u8348\u28c4\u25ff\u038a\u0000\u8b48\u8101\u0338\u0000\u7480\uff06\uf125\u0003\uc300\u8d48\u2464\u48e9\u548d\u1024\u8d48\u988a\u0000\uc700\u0d02\u0000\u48c0\u1489\u4824\u4c89\u0824\u15ff\u03d2\u0000\uc749\u98c0\u0000\u4800\ud231\u8d48\u244c\uff10\uc515\u0003\u4800\ue189\u25ff\u03ac\u0000\u8948\uc50d\u0003\uc300\uc3cc\u8948\u48e1\uec83\uff28\ubd15\u0003\u4800\uc483\u4828\uc085\u0774\uff59\ub525\u0003\u4800\u7589\u48b0\u068b\u8b48\u2048\u8b48\uc301\u8348\u28ec\u894c\uffc1\ua115\u0003\u4800\uc483\uc328\u8d48\u2454\u4830\uec83\u4828\u0d8b\u0394\u0000\u15ff\u0396\u0000\u8348\u28c4\u48c3\uec83\u4828\u0d8b\u038e\u0000\u15ff\u0390\u0000\u8b48\ua10d\u0003\uff00\u9315\u0003\u4800\uc483\uc328\u8348\u28ec\u8948\u6b1d\u0003\uff00\u8d15\u0003\u4800\u0d8d\uffc5\uffff\u15ff\u0320\u0000\u8b48\u710d\u0003\u4800\uc2c7\uffff\uffff\u15ff\u0374\u0000\u15ff\u0376\u0000\u8348\u28c4\u48c3\uec83\uff28\u6f15\u0003\u8b00\u790d\u0003\u4800\u158b\u036a\u0000\u3145\uffc0\u7115\u0003\u4800\uc483\u4828\u0d8b\u036e\u0000\u25ff\u02d0\u0000\u8348\u28ec\u8948\uffd9\u6315\u0003\u4800\uc483\uff28\u6125\u0003\uc300\uff51\u0115\u0002\u5900\u3948\u7905\u0002\u7500\uff06\u5125\u0003\uc300\u8348\u08ec\u15ff\u034e\u0000\u8348\u08c4\u8948\u48c1\ue9c1\u3120\uc3c8\u8348\u28ec\u8948\u4ce9\ufa89\u894d\uffe8\u3515\u0003\u4800\uc483\uc328\u8348\u28ec\u8b48\u4c01\u858d\u01e0\u0000\u8d48\u7055\u50ff\u4828\uc189\u8948\u4dea\uf889\u15ff\u0314\u0000\u8348\u28c4\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u02f4\u0000\u8348\u28ec\u8b48\u4c01\u8d8d\u0148\u0000\u8949\u4cf0\uea89\u50ff\u4808\ue989\u894c\ufffa\ud915\u0002\u4800\uc483\uc328\u8948\u41cb\ub60f\u4ce9\uc789\u8949\u48d6\uec83\uff28\uc515\u0002\u4800\uc483\u4828\u838b\u0268\u0000\u8949\uc3f8\u894d\u48f0\uf289\u894c\u48f9\uec83\uff28\ua315\u0002\u4800\uc483\u4928\u068b\u8d49\u0897\u0002\u4c00\uf189\u60ff\uc318\u894d\u4cce\uc789\u8948\u48d5\uce89\u8348\u28ec\u15ff\u0280\u0000\u8348\u28c4\uc085\u0c74\u8948\u48f1\uea89\u25ff\u0274\u0000\u53c3\u4856\uec83\u4818\ucb89\u8b48\u6b0d\u0002\u4800\uc2c7\u0028\u0000\u15ff\u0266\u0000\u8948\u4058\u8948\u48c6\u4e8d\uff20\u7515\u0002\u4800\u0d8b\u0256\u0000\u8948\u49c2\uc0c7\u000a\u0000\u15ff\u024e\u0000\u8948\ufff1\u4d15\u0002\ueb00\u48b9\uc483\u5e18\uc35b\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u7420\u6968\u0073\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u2520\u0064\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u6f63\u6e75\u2074\u6528\u7078\u6365\u6574\u3d64\u6425\u202c\u6361\u7574\u6c61\u253d\u2964\u4a00\u4573\u7272\u726f\u6f43\u6564\u203a\u7830\u7825\u0000\u0000\u0000\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2456);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2456);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2464);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2464);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2472);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2472);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2480);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2480);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2488);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2488);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2496);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2496);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(2504);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 2504);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(2512);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 2512);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(2520);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 2520);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(2528);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(2536);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 2536);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(2544);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(2552);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(2560);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 2560);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(2568);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 2568);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(2576);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 2576);
    },
    get nodeThreadId():number{
        return buffer.getInt32(2584);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 2584);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(2592);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 2592);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(2600);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 2600);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(2608);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 2608);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(2616);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 2616);
    },
    get memset():VoidPointer{
        return buffer.getPointer(2624);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 2624);
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
    get str_js2np():NativePointer{
        return buffer.add(394);
    },
    get buffer_to_pointer():NativePointer{
        return buffer.add(506);
    },
    get utf16_js2np():NativePointer{
        return buffer.add(742);
    },
    get str_np2js():NativePointer{
        return buffer.add(844);
    },
    get utf16_np2js():NativePointer{
        return buffer.add(882);
    },
    get pointer_np2js_nullable():NativePointer{
        return buffer.add(941);
    },
    get pointer_np2js():NativePointer{
        return buffer.add(954);
    },
    get pointer_js_new():NativePointer{
        return buffer.add(1040);
    },
    get bin64():NativePointer{
        return buffer.add(1128);
    },
    get wrapper_js2np():NativePointer{
        return buffer.add(1253);
    },
    get wrapper_np2js_nullable():NativePointer{
        return buffer.add(1327);
    },
    get wrapper_np2js():NativePointer{
        return buffer.add(1340);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(2632);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2632);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1462);
    },
    get logHook():NativePointer{
        return buffer.add(1480);
    },
    get runtime_error():NativePointer{
        return buffer.add(1582);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1600);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(2640);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2640);
    },
    get ServerInstance_startServerThread_hook():NativePointer{
        return buffer.add(1668);
    },
    get debugBreak():NativePointer{
        return buffer.add(1676);
    },
    get commandHookCallback():VoidPointer{
        return buffer.getPointer(2648);
    },
    set commandHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2648);
    },
    get MinecraftCommandsExecuteCommandAfter():VoidPointer{
        return buffer.getPointer(2656);
    },
    set MinecraftCommandsExecuteCommandAfter(n:VoidPointer){
        buffer.setPointer(n, 2656);
    },
    get commandHook():NativePointer{
        return buffer.add(1678);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2664);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2664);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1722);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2672);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2672);
    },
    get MultiThreadQueueDequeue():VoidPointer{
        return buffer.getPointer(2680);
    },
    set MultiThreadQueueDequeue(n:VoidPointer){
        buffer.setPointer(n, 2680);
    },
    get stdin_launchpad_hook():NativePointer{
        return buffer.add(1740);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2696);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2696);
    },
    get free():VoidPointer{
        return buffer.getPointer(2704);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2704);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2712);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2712);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2720);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get _Pad_Release():VoidPointer{
        return buffer.getPointer(2728);
    },
    set _Pad_Release(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2736);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2744);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1802);
    },
    get runtimeErrorBeginHandler():VoidPointer{
        return buffer.getPointer(2752);
    },
    set runtimeErrorBeginHandler(n:VoidPointer){
        buffer.setPointer(n, 2752);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2760);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2760);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2768);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2768);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2776);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2776);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2784);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2784);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1863);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2792);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2792);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2800);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2800);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1912);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2808);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2808);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1936);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2816);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2816);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1960);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2824);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2824);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1984);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2832);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2832);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2008);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2840);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2840);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2049);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2848);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2848);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2084);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2856);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2856);
    },
    get packetSendHook():NativePointer{
        return buffer.add(2124);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2162);
    },
    get onPacketSendRaw():VoidPointer{
        return buffer.getPointer(2864);
    },
    set onPacketSendRaw(n:VoidPointer){
        buffer.setPointer(n, 2864);
    },
    get NetworkHandlerGetConnectionFromId():VoidPointer{
        return buffer.getPointer(2872);
    },
    set NetworkHandlerGetConnectionFromId(n:VoidPointer){
        buffer.setPointer(n, 2872);
    },
    get packetSendInternalHook():NativePointer{
        return buffer.add(2202);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(2880);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 2880);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(2888);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 2888);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(2896);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 2896);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(2904);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 2904);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(2912);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 2912);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(2920);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 2920);
    },
    get getline():NativePointer{
        return buffer.add(2245);
    },
};
