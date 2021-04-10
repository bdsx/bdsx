import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(2768, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\ue915\u0008\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u57ff\uff70\uc857\u8b48\u7847\u8348\u01e0\u0574\u73e8\uffff\uffff\u1515\u0009\u4800\uec83\u8548\u0fc9\u0e8f\u0000\u4800\u0d8d\u07c1\u0000\u68e8\uffff\uebff\u491a\uc889\u8d48\uca15\u0007\u4800\u4c8d\u2024\u15ff\u086e\u0000\u8d48\u244c\u4820\uc289\u57e8\uffff\u48ff\uc189\u9de8\uffff\u48ff\uec83\u4968\uc989\u8949\u48d0\u158d\u07b1\u0000\u8d48\u244c\uff20\u3d15\u0008\u4800\u4c8d\u2024\u8948\ue8c2\uff26\uffff\u8948\u48c1\uc483\ue968\uff68\uffff\u8348\u48ec\u8148\u03f9\u0100\u0f00\u3384\u0000\u4800\u4c89\u2824\u8b48\u7847\u8348\u01e0\u840f\u0046\u0000\u8d48\u244c\uff20\u0d15\u0008\u8500\u75c0\u0f52\u44b6\u2024\uc085\u4974\u57ff\ue8c8\ufeb0\uffff\u15ff\u07b2\u0000\u3948\u3b05\u0008\u7400\ub90a\u0001\ue000\uafe8\u0004\u4800\u158d\u075a\u0000\u15ff\u0852\u0000\u8d48\u244c\uff20\u1f15\u0008\u7500\uff0e\uc857\u8b48\u244c\uff20\u1715\u0008\u4c00\u448b\u2824\u8d48\u4315\u0007\u4800\u4c8d\u2024\u15ff\u0788\u0000\u8d48\u244c\u4820\uc289\u71e8\ufffe\u48ff\uc189\ub7e8\ufffe\u48ff\uec83\u4c28\u4c89\u4824\u894c\u2444\u4840\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u0778\u0000\uc085\u850f\u0041\u0000\u448b\u1024\u8348\u01e8\u3e74\u8348\u02e8\u3175\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\u5315\u0007\u8500\u75c0\u4c18\u448b\u4824\u8b48\u244c\u4818\u548b\u2024\u54ff\u4024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28c4\uc031\u48c3\uec83\u4838\u5489\u4824\u8948\u244c\u4840\u548d\u1024\u15ff\u0708\u0000\uc085\u850f\u0032\u0000\u448b\u1024\u8348\u01e8\u840f\u002b\u0000\u8348\u04e8\u840f\u0028\u0000\u8348\u05e8\u840f\u0034\u0000\u8348\u01e8\u840f\u004d\u0000\u8348\u01e8\u7274\u8b48\u244c\uff38\u4817\uc483\u3138\uc3c0\u8b48\u244c\uff40\ud857\u8548\u74c0\u48e5\u408b\u4810\uc483\uc338\u8d4c\u2444\u4818\u548d\u1024\u8b48\u244c\uff40\ua515\u0006\u8500\u75c0\u48c3\u448b\u1024\u8348\u38c4\u4cc3\u4c8d\u3024\u894c\u244c\u4d20\uc889\u8d48\u2454\u4828\u4c8b\u4024\u15ff\u0682\u0000\uc085\u9875\u8b48\u2444\u4828\uc483\uc338\u8d4c\u2444\u4818\u548d\u1024\u8b48\u244c\uff40\u6715\u0006\u8500\u0fc0\u7185\uffff\u48ff\u448b\u1024\u8348\u38c4\u48c3\uec83\u4828\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u061c\u0000\uc085\u850f\u003e\u0000\u448b\u1024\u8348\u01e8\u840f\u0029\u0000\u8348\u02e8\u2a75\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\uf315\u0005\u8500\u75c0\u4811\u448b\u1824\u8348\u28c4\u48c3\uc483\u3128\uc3c0\u8b48\u244c\uff38\u4817\uec83\u4828\u5489\u3824\u8d48\u2454\u4110\ud0ff\uc085\u0a75\u8b48\u2444\u4810\uc483\uc328\u8b48\u244c\uff38\u4817\uec83\u4828\u5489\u3824\u8948\u0fca\u02b7\u8348\u02c2\uc085\uf575\u2948\u48ca\ueac1\u4c02\u448d\u1824\u57ff\u8528\u74c0\u480a\u448b\u1824\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8548\u75d2\u4808\u058b\u0592\u0000\u48c3\uec83\u4838\u5489\u4824\u8d4c\u244c\u4920\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u0570\u0000\u8948\uff02\u5f15\u0005\u8500\u75c0\u4820\u4c8b\u2024\u57ff\u48d8\uc085\u1374\u8b48\u244c\u4848\u4889\u4810\u448b\u2024\u8348\u38c4\u89c3\ue8c1\ufcc0\uffff\u8348\u38ec\u8948\u2454\u4948\ud189\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\u1d05\u0005\u4800\u0289\u8b48\u1b05\u0005\u4800\u4289\uff08\u0115\u0005\u8500\u75c0\u4819\u448b\u4824\u8b48\uff08\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\uc189\u69e8\ufffc\u48ff\uec83\u4828\u5489\u3824\u8d4c\u2444\u4820\u548d\u1824\u15ff\u04a4\u0000\uc085\u5975\u8b4c\u2444\u4d20\uc085\u4a74\u8b48\u244c\u4d18\u448d\u0048\u0f48\u01bf\u8348\u02c1\u394c\u74c1\u4833\ubf0f\u4811\ue2c1\u4810\ud009\u8348\u02c1\u394c\u74c1\u481f\ubf0f\u4811\ue2c1\u4820\ud009\u8348\u02c1\u394c\u74c1\u480b\ubf0f\u4811\ue2c1\u4830\ud009\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u03de\u0000\u4c89\u0824\u8948\u2454\u4c10\u4489\u1824\u894c\u244c\u5320\u8348\u20ec\u8d4c\u244c\u4940\ud089\ud231\ud189\u15ff\u03e4\u0000\u8548\u0fc0\u6488\u0000\u4800\uc389\u8d48\u1150\u8d48\uad0d\uffff\uffff\ua715\u0003\u4800\u4c8b\u3024\u8948\u2048\u8948\u2858\u8d4c\u244c\u4c40\u448b\u3824\u8d48\u0153\u8d48\u3048\u8948\uffc3\u9f15\u0003\uff00\u6115\u0003\u4800\ud989\u0539\u03e8\u0000\u850f\u0007\u0000\u65e8\uffff\uebff\uff06\u6515\u0003\u4800\uc483\u5b20\u48c3\uc2c7\u0020\u0000\u8d48\u490d\uffff\uffff\u4315\u0003\u4800\u548b\u3024\u8948\u2050\uc748\u2840\u000f\u0000\u8d48\ufd0d\u0002\u4800\u118b\u8948\u3050\u8b48\u0851\u8948\u3850\ubdeb\u8b48\u8101\u0338\u0000\u7480\uff06\u9925\u0003\uc300\u8148\u88ec\u0005\u4800\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\u7b15\u0003\u4c00\u048d\u9025\u0000\u3100\u48d2\u4c8d\u2024\u15ff\u036e\u0000\u8d48\u244c\uff08\u5315\u0003\ub900\u000d\uc000\ub4eb\u8948\u750d\u0003\uc300\uc3cc\u8348\u28ec\u894c\uffc1\u6d15\u0003\u4800\uc483\uc328\u8b48\u690d\u0003\uff00\u6b25\u0003\u4800\uec83\u4828\u0d8b\u0368\u0000\u15ff\u036a\u0000\u8b48\u7b0d\u0003\uff00\u6d15\u0003\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u0342\u0000\u8d48\uc80d\uffff\uffff\u0d15\u0003\u4800\u0d8b\u034e\u0000\uc748\uffc2\uffff\uffff\u4915\u0003\u4800\uc483\uff28\u4725\u0003\u4800\uec83\u8b28\u4d0d\u0003\u4800\u158b\u033e\u0000\u3145\uffc0\u4515\u0003\u4800\uc483\u4828\u0d8b\u0342\u0000\u25ff\u02c4\u0000\u8b48\u244c\u4828\uec83\uff28\u3515\u0003\u4800\uc483\uff28\u3325\u0003\u5100\u15ff\u01d4\u0000\u4859\u0539\u025c\u0000\u0675\u25ff\u0324\u0000\u48c3\uec83\uff08\u2115\u0003\u4800\uc483\u4808\uc189\uc148\u20e9\uc831\u48c3\uec83\u4828\ue989\u8944\u4dfa\uf089\u15ff\u0308\u0000\u8348\u28c4\u48c3\u548d\u7824\u8348\u28ec\u8b48\u4c01\u858d\u00a0\u0000\u50ff\u4820\uc189\u8948\u4dea\uf889\u15ff\u02e6\u0000\u8348\u28c4\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u02c6\u0000\u8348\u28ec\u8b48\u4c01\u4d8d\u4958\uf089\u894c\ufff2\u0850\u8948\u4ce9\ufa89\u15ff\u02ae\u0000\u8348\u28c4\u4dc3\uf889\u8948\u4cda\uf189\u8348\u28ec\u15ff\u029e\u0000\u8348\u28c4\u8b49\u4907\u968d\u0220\u0000\u894c\ufff9\u1860\u53c3\u4856\uec83\u4818\ucb89\u8b48\u810d\u0002\u4800\u148d\u2825\u0000\uff00\u7b15\u0002\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u028a\u0000\u8b48\u6b0d\u0002\u4800\uc289\uc749\u0ac0\u0000\uff00\u6315\u0002\u4800\uf189\u15ff\u0262\u0000\ub8eb\u8348\u18c4\u5b5e\u49c3\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6874\u7369\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6425\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6320\u756f\u746e\u2820\u7865\u6570\u7463\u6465\u253d\u2c64\u6120\u7463\u6175\u3d6c\u6425\u0029\u534a\u4320\u6e6f\u6574\u7478\u6e20\u746f\u6620\u756f\u646e\u000a\u734a\u7245\u6f72\u4372\u646f\u3a65\u3020\u2578\u0078\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d\u0000\u0000\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2312);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2312);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2320);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2320);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2328);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2328);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2336);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2336);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2344);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2344);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2352);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2352);
    },
    get malloc():VoidPointer{
        return buffer.getPointer(2360);
    },
    set malloc(n:VoidPointer){
        buffer.setPointer(n, 2360);
    },
    get vsnprintf():VoidPointer{
        return buffer.getPointer(2368);
    },
    set vsnprintf(n:VoidPointer){
        buffer.setPointer(n, 2368);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(2376);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 2376);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(2384);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 2384);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(2392);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 2392);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(2400);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 2400);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(2408);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 2408);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(2416);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 2416);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(2424);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 2424);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(2432);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 2432);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(2440);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 2440);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(2448);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 2448);
    },
    get nodeThreadId():number{
        return buffer.getInt32(2456);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 2456);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(2464);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 2464);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(2472);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 2472);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(2480);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 2480);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(2488);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 2488);
    },
    get memset():VoidPointer{
        return buffer.getPointer(2496);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 2496);
    },
    get printf():VoidPointer{
        return buffer.getPointer(2504);
    },
    set printf(n:VoidPointer){
        buffer.setPointer(n, 2504);
    },
    get Sleep():VoidPointer{
        return buffer.getPointer(2512);
    },
    set Sleep(n:VoidPointer){
        buffer.setPointer(n, 2512);
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
        return buffer.add(1560);
    },
    get str_js2np():NativePointer{
        return buffer.add(445);
    },
    get buffer_to_pointer():NativePointer{
        return buffer.add(567);
    },
    get utf16_js2np():NativePointer{
        return buffer.add(803);
    },
    get str_np2js():NativePointer{
        return buffer.add(905);
    },
    get utf16_np2js():NativePointer{
        return buffer.add(943);
    },
    get pointer_np2js_nullable():NativePointer{
        return buffer.add(1002);
    },
    get pointer_np2js():NativePointer{
        return buffer.add(1015);
    },
    get pointer_js_new():NativePointer{
        return buffer.add(1100);
    },
    get bin64():NativePointer{
        return buffer.add(1187);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(2520);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2520);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1312);
    },
    get logHook():NativePointer{
        return buffer.add(1330);
    },
    get runtime_error():NativePointer{
        return buffer.add(1542);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1629);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(2528);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get ServerInstance_ctor_hook():NativePointer{
        return buffer.add(1636);
    },
    get debugBreak():NativePointer{
        return buffer.add(1644);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2536);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2536);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1646);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2544);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get MultiThreadQueueTryDequeue():VoidPointer{
        return buffer.getPointer(2552);
    },
    set MultiThreadQueueTryDequeue(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get ConsoleInputReader_getLine_hook():NativePointer{
        return buffer.add(1664);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2568);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2568);
    },
    get free():VoidPointer{
        return buffer.getPointer(2576);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2576);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2584);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2584);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2592);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2592);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2600);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2600);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2608);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2608);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1712);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2616);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2616);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2624);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2624);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2632);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2632);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2640);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2640);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1769);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2648);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2648);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2656);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2656);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1812);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2664);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2664);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1837);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2672);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2672);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1861);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2680);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2680);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1885);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2688);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2688);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(1909);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2696);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2696);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(1951);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2704);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2704);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(1986);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2712);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2712);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2023);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(2720);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(2728);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(2736);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(2744);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(2752);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 2752);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(2760);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 2760);
    },
    get getline():NativePointer{
        return buffer.add(2063);
    },
};
