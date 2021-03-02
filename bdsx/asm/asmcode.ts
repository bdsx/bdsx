import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(2912, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\u6115\u0009\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u57ff\uff70\uc857\u8b48\u7847\u8348\u01e0\u0574\u73e8\uffff\uffff\u8d15\u0009\u4800\uec83\u8548\u0fc9\u0e8f\u0000\u4800\u0d8d\u0871\u0000\u68e8\uffff\uebff\u491a\uc889\u8d48\u7a15\u0008\u4800\u4c8d\u2024\u15ff\u08f6\u0000\u8d48\u244c\u4820\uc289\u57e8\uffff\u48ff\uc189\u9de8\uffff\u48ff\uec83\u4968\uc989\u8949\u48d0\u158d\u0861\u0000\u8d48\u244c\uff20\uc515\u0008\u4800\u4c8d\u2024\u8948\ue8c2\uff26\uffff\u8948\u48c1\uc483\ue968\uff68\uffff\u8348\u48ec\u8948\u244c\u4828\u478b\u4878\ue083\u0f01\u2084\u0000\u4800\u4c8d\u2024\u15ff\u0892\u0000\uc085\u2c75\ub60f\u2444\u8520\u74c0\uff23\uc857\ubde8\ufffe\u48ff\u4c8d\u2024\u15ff\u08ca\u0000\u0e75\u57ff\u48c8\u4c8b\u2024\u15ff\u08c2\u0000\u8b4c\u2444\u4828\u158d\u0810\u0000\u8d48\u244c\uff20\u4315\u0008\u4800\u4c8d\u2024\u8948\ue8c2\ufea4\uffff\u8948\ue8c1\ufeea\uffff\u8348\u28ec\u894c\u2444\u4840\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u0828\u0000\uc085\u850f\u003c\u0000\u448b\u1024\u8348\u01e8\u3974\u8348\u02e8\u2c75\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\u0315\u0008\u8500\u75c0\u4813\u4c8b\u1824\u8b48\u2454\uff20\u2454\u4840\uc483\uc328\u8b48\u244c\uff38\u4817\uc483\u3128\uc3c0\u8348\u38ec\u8948\u2454\u4848\u4c89\u4024\u8d48\u2454\uff10\ubd15\u0007\u8500\u0fc0\u3285\u0000\u8b00\u2444\u4810\ue883\u0f01\u2b84\u0000\u4800\ue883\u0f04\u2884\u0000\u4800\ue883\u0f05\u3484\u0000\u4800\ue883\u0f01\u4d84\u0000\u4800\ue883\u7401\u4872\u4c8b\u3824\u17ff\u8348\u38c4\uc031\u48c3\u4c8b\u4024\u57ff\u48d8\uc085\ue574\u8b48\u1040\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u075a\u0000\uc085\uc375\u8b48\u2444\u4810\uc483\uc338\u8d4c\u244c\u4c30\u4c89\u2024\u894d\u48c8\u548d\u2824\u8b48\u244c\uff40\u3715\u0007\u8500\u75c0\u4898\u448b\u2824\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u071c\u0000\uc085\u850f\uff71\uffff\u8b48\u2444\u4810\uc483\uc338\u8348\u28ec\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\ud115\u0006\u8500\u0fc0\u3e85\u0000\u8b00\u2444\u4810\ue883\u0f01\u2984\u0000\u4800\ue883\u7502\u4c2a\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u06a8\u0000\uc085\u1175\u8b48\u2444\u4818\uc483\uc328\u8348\u28c4\uc031\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\u548d\u1024\uff41\u85d0\u75c0\u480a\u448b\u1024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\uca89\ub70f\u4802\uc283\u8502\u75c0\u48f5\uca29\uc148\u02ea\u8d4c\u2444\uff18\u2857\uc085\u0a74\u8b48\u2444\u4818\uc483\uc328\u8b48\u244c\uff38\u4817\ud285\u0875\u8b48\u4705\u0006\uc300\u8348\u38ec\u8948\u2454\u4c48\u4c8d\u2024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\u2505\u0006\u4800\u0289\u15ff\u0614\u0000\uc085\u2075\u8b48\u244c\uff20\ud857\u8548\u74c0\u4813\u4c8b\u4824\u8948\u1048\u8b48\u2444\u4820\uc483\uc338\u8948\ue8c1\ufcfc\uffff\u8348\u38ec\u8948\u2454\u4948\ud189\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\ud105\u0005\u4800\u0289\u8b48\ucf05\u0005\u4800\u4289\uff08\ub515\u0005\u8500\u75c0\u4819\u448b\u4824\u8b48\uff08\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\u8948\ue8c1\ufca4\uffff\u8348\u28ec\u8948\u2454\u4c38\u448d\u2024\u8d48\u2454\uff18\u5715\u0005\u8500\u75c0\u4c59\u448b\u2024\u854d\u74c0\u484a\u4c8b\u1824\u8d4d\u4844\u4800\ubf0f\u4801\uc183\u4c02\uc139\u3374\u0f48\u11bf\uc148\u10e2\u0948\u48d0\uc183\u4c02\uc139\u1f74\u0f48\u11bf\uc148\u20e2\u0948\u48d0\uc183\u4c02\uc139\u0b74\u0f48\u11bf\uc148\u30e2\u0948\u48d0\uc483\uc328\u8b48\u244c\uff38\u4817\uec83\u4838\u5489\u3024\u8b48\u0b05\u0005\u4800\u4489\u2824\u8d4c\u244c\u4920\uc0c7\u0002\u0000\u8d48\u2454\uff28\u6057\uc085\u1675\u8b48\u244c\uff20\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\uc189\udde8\ufffb\u48ff\uc985\u0875\u8b48\uc505\u0004\uc300\u8348\u38ec\u8948\u244c\u4850\u5489\u4824\u894c\u4cc1\u4c8d\u3024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\u9b05\u0004\u4800\u0289\u15ff\u048a\u0000\uc085\u3d75\u8b48\u244c\uff30\ud857\u8548\u74c0\u4830\u4c8b\u5024\u8948\u1048\u8d4c\u244c\u4920\uc0c7\u0002\u0000\u8d48\u2454\u4828\u4c8b\u4824\u57ff\u8560\u75c0\u480a\u448b\u2024\u8348\u38c4\u89c3\ue8c1\ufb56\uffff\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u03d0\u0000\u15ff\u03c2\u0000\u0539\u043c\u0000\u1175\u8d48\u2454\u4858\uf989\u8949\uffd8\ub125\u0003\u4800\uec83\u4828\u538d\u4811\u0d8d\uffc0\uffff\u15ff\u03ac\u0000\u8948\u2078\u8d4c\u0143\u894c\u2840\u8d48\u3048\u8d48\u2494\u0080\u0000\u8948\u2444\uff20\u8115\u0003\u4800\u4c8b\u2024\u8348\u28c4\u25ff\u0382\u0000\u8b48\u8101\u0338\u0000\u7480\uff06\ue925\u0003\uc300\u8d48\u2464\u48e9\u548d\u1024\u8d48\u988a\u0000\uc700\u0d02\u0000\u48c0\u1489\u4824\u4c89\u0824\u15ff\u03ca\u0000\uc749\u98c0\u0000\u4800\ud231\u8d48\u244c\uff10\ubd15\u0003\u4800\ue189\u25ff\u03a4\u0000\u8948\ubd0d\u0003\uc300\uc3cc\u8948\u48e1\uec83\uff28\ub515\u0003\u4800\uc483\u4828\uc085\u0774\uff59\uad25\u0003\u4800\u7589\u48b0\u068b\u8b48\u2048\u8b48\uc301\u8348\u28ec\u894c\uffc1\u9915\u0003\u4800\uc483\uc328\u8d48\u2454\u4830\uec83\u4828\u0d8b\u038c\u0000\u15ff\u038e\u0000\u8348\u28c4\u48c3\uec83\u4828\u0d8b\u0386\u0000\u15ff\u0388\u0000\u8b48\u990d\u0003\uff00\u8b15\u0003\u4800\uc483\uc328\u8348\u28ec\u8948\u631d\u0003\uff00\u8515\u0003\u4800\u0d8d\uffc5\uffff\u15ff\u0318\u0000\u8b48\u690d\u0003\u4800\uc2c7\uffff\uffff\u15ff\u036c\u0000\u15ff\u036e\u0000\u8348\u28c4\u48c3\uec83\u8b28\u6f0d\u0003\u4800\u158b\u0360\u0000\u3145\uffc0\u6715\u0003\u4800\uc483\u4828\u0d8b\u0364\u0000\u25ff\u02ce\u0000\u8348\u28ec\u8948\uffd9\u5915\u0003\u4800\uc483\uff28\u5725\u0003\uc300\uff51\uff15\u0001\u5900\u3948\u7705\u0002\u7500\uff06\u4725\u0003\uc300\u8348\u08ec\u15ff\u0344\u0000\u8348\u08c4\u8948\u48c1\ue9c1\u3120\uc3c8\u8348\u28ec\u8948\u4ce9\ufa89\u894d\uffe8\u2b15\u0003\u4800\uc483\uc328\u8348\u28ec\u8b48\u4c01\u858d\u01e0\u0000\u8d48\u7055\u50ff\u4828\uc189\u8948\u4dea\uf889\u15ff\u030a\u0000\u8348\u28c4\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u02ea\u0000\u8348\u28ec\u8b48\u4c01\u8d8d\u0148\u0000\u8949\u4cf0\uea89\u50ff\u4808\ue989\u894c\ufffa\ucf15\u0002\u4800\uc483\uc328\u8948\u41cb\ub60f\u4ce9\uc789\u8949\u48d6\uec83\uff28\ubb15\u0002\u4800\uc483\u4828\u838b\u0268\u0000\u8949\uc3f8\u894d\u48f0\uf289\u894c\u48f9\uec83\uff28\u9915\u0002\u4800\uc483\u4928\u068b\u8d49\u0897\u0002\u4c00\uf189\u60ff\uc318\u894d\u4cce\uc789\u8948\u48d5\uce89\u8348\u28ec\u15ff\u0276\u0000\u8348\u28c4\uc085\u0c74\u8948\u48f1\uea89\u25ff\u026a\u0000\u53c3\u4856\uec83\u4818\ucb89\u8b48\u610d\u0002\u4800\u148d\u2825\u0000\uff00\u5b15\u0002\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u026a\u0000\u8b48\u4b0d\u0002\u4800\uc289\uc749\u0ac0\u0000\uff00\u4315\u0002\u4800\uf189\u15ff\u0242\u0000\ub8eb\u8348\u18c4\u5b5e\u49c3\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6874\u7369\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6425\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6320\u756f\u746e\u2820\u7865\u6570\u7463\u6465\u253d\u2c64\u6120\u7463\u6175\u3d6c\u6425\u0029\u734a\u7245\u6f72\u4372\u646f\u3a65\u3020\u2578\u0078\u0000\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2448);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2448);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2456);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2456);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2464);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2464);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2472);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2472);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2480);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2480);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2488);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2488);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(2496);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 2496);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(2504);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 2504);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(2512);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 2512);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(2520);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 2520);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(2528);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(2536);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 2536);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(2544);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(2552);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(2560);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 2560);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(2568);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 2568);
    },
    get nodeThreadId():number{
        return buffer.getInt32(2576);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 2576);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(2584);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 2584);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(2592);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 2592);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(2600);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 2600);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(2608);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 2608);
    },
    get memset():VoidPointer{
        return buffer.getPointer(2616);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 2616);
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
        return buffer.getPointer(2624);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2624);
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
        return buffer.getPointer(2632);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2632);
    },
    get ServerInstance_startServerThread_hook():NativePointer{
        return buffer.add(1668);
    },
    get debugBreak():NativePointer{
        return buffer.add(1676);
    },
    get commandHookCallback():VoidPointer{
        return buffer.getPointer(2640);
    },
    set commandHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2640);
    },
    get MinecraftCommandsExecuteCommandAfter():VoidPointer{
        return buffer.getPointer(2648);
    },
    set MinecraftCommandsExecuteCommandAfter(n:VoidPointer){
        buffer.setPointer(n, 2648);
    },
    get commandHook():NativePointer{
        return buffer.add(1678);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2656);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2656);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1722);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2664);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2664);
    },
    get MultiThreadQueueDequeue():VoidPointer{
        return buffer.getPointer(2672);
    },
    set MultiThreadQueueDequeue(n:VoidPointer){
        buffer.setPointer(n, 2672);
    },
    get stdin_launchpad_hook():NativePointer{
        return buffer.add(1740);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2688);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2688);
    },
    get free():VoidPointer{
        return buffer.getPointer(2696);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2696);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2704);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2704);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2712);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2712);
    },
    get _Pad_Release():VoidPointer{
        return buffer.getPointer(2720);
    },
    set _Pad_Release(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2728);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2736);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1802);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2744);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2752);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2752);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2760);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2760);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2768);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2768);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1863);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2776);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2776);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2784);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2784);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1906);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2792);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2792);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1930);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2800);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2800);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1954);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2808);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2808);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1978);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2816);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2816);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2002);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2824);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2824);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2043);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2832);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2832);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2078);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2840);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2840);
    },
    get packetSendHook():NativePointer{
        return buffer.add(2118);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2156);
    },
    get onPacketSendRaw():VoidPointer{
        return buffer.getPointer(2848);
    },
    set onPacketSendRaw(n:VoidPointer){
        buffer.setPointer(n, 2848);
    },
    get NetworkHandlerGetConnectionFromId():VoidPointer{
        return buffer.getPointer(2856);
    },
    set NetworkHandlerGetConnectionFromId(n:VoidPointer){
        buffer.setPointer(n, 2856);
    },
    get packetSendInternalHook():NativePointer{
        return buffer.add(2196);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(2864);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 2864);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(2872);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 2872);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(2880);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 2880);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(2888);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 2888);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(2896);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 2896);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(2904);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 2904);
    },
    get getline():NativePointer{
        return buffer.add(2239);
    },
};
