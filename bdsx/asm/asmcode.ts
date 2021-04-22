import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(2776, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\uf115\u0008\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u8948\u244c\uff20\uc857\u8b48\u7847\u8348\u01e0\u0d74\u8b48\u244c\uff20\u7057\u69e8\uffff\u48ff\u4c8b\u2024\u15ff\u090e\u0000\u8348\u48ec\uc985\u8f0f\u000e\u0000\u8d48\uc00d\u0007\ue800\uff59\uffff\u1aeb\u8949\u48c8\u158d\u07c9\u0000\u8d48\u244c\uff20\u6715\u0008\u4800\u4c8d\u2024\u8948\ue8c2\uff48\uffff\u8948\ue8c1\uff8e\uffff\u8348\u68ec\u8949\u49c9\ud089\u8d48\ub015\u0007\u4800\u4c8d\u2024\u15ff\u0836\u0000\u8d48\u244c\u4820\uc289\u17e8\uffff\u48ff\uc189\u5de8\uffff\u48ff\uec83\u4848\uf981\u0003\u0001\u840f\u0033\u0000\u8948\u244c\u4828\u478b\u4878\ue083\u0f01\u4684\u0000\u4800\u4c8d\u2024\u15ff\u080a\u0000\uc085\u5475\ub60f\u2444\u8520\u74c0\uff4b\uc857\ua5e8\ufffe\uffff\uaf15\u0007\u4800\u0539\u0838\u0000\u0a74\u01b9\u0000\ue8e0\u04b1\u0000\u8d48\u5d15\u0007\uff00\u4f15\u0008\u4800\u4c8d\u2024\u15ff\u081c\u0000\uc085\u0e75\u57ff\u48c8\u4c8b\u2024\u15ff\u0812\u0000\u8b4c\u2444\u4828\u158d\u0744\u0000\u8d48\u244c\uff20\u8315\u0007\u4800\u4c8d\u2024\u8948\ue8c2\ufe64\uffff\u8948\ue8c1\ufeaa\uffff\u8348\u28ec\u894c\u244c\u4c48\u4489\u4024\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u7315\u0007\u8500\u0fc0\u4185\u0000\u8b00\u2444\u4810\ue883\u7401\u483e\ue883\u7502\u4c31\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u074e\u0000\uc085\u1875\u8b4c\u2444\u4848\u4c8b\u1824\u8b48\u2454\uff20\u2454\u4840\uc483\uc328\u8b48\u244c\uff38\u4817\uc483\u3128\uc3c0\u8348\u38ec\u8948\u2454\u4848\u4c89\u4024\u8d48\u2454\uff10\u0315\u0007\u8500\u0fc0\u3285\u0000\u8b00\u2444\u4810\ue883\u0f01\u2b84\u0000\u4800\ue883\u0f04\u2884\u0000\u4800\ue883\u0f05\u3484\u0000\u4800\ue883\u0f01\u4d84\u0000\u4800\ue883\u7401\u4872\u4c8b\u3824\u17ff\u8348\u38c4\uc031\u48c3\u4c8b\u4024\u57ff\u48d8\uc085\ue574\u8b48\u1040\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u06a0\u0000\uc085\uc375\u8b48\u2444\u4810\uc483\uc338\u8d4c\u244c\u4c30\u4c89\u2024\u894d\u48c8\u548d\u2824\u8b48\u244c\uff40\u7d15\u0006\u8500\u75c0\u4898\u448b\u2824\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u0662\u0000\uc085\u850f\uff71\uffff\u8b48\u2444\u4810\uc483\uc338\u8348\u28ec\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u1715\u0006\u8500\u0fc0\u3e85\u0000\u8b00\u2444\u4810\ue883\u0f01\u2984\u0000\u4800\ue883\u7502\u4c2a\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u05ee\u0000\uc085\u1175\u8b48\u2444\u4818\uc483\uc328\u8348\u28c4\uc031\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\u548d\u1024\uff41\u85d0\u75c0\u480a\u448b\u1024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\uca89\ub70f\u4802\uc283\u8502\u75c0\u48f5\uca29\uc148\u02ea\u8d4c\u2444\uff18\u2857\uc085\u0a74\u8b48\u2444\u4818\uc483\uc328\u8b48\u244c\uff38\u4817\ud285\u0875\u8b48\u8d05\u0005\uc300\u8348\u38ec\u8948\u2454\u4c48\u4c8d\u2024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\u6b05\u0005\u4800\u0289\u15ff\u055a\u0000\uc085\u2075\u8b48\u244c\uff20\ud857\u8548\u74c0\u4813\u4c8b\u4824\u8948\u1048\u8b48\u2444\u4820\uc483\uc338\uc189\ubee8\ufffc\u48ff\uec83\u4838\u5489\u4824\u8949\u49d1\uc0c7\u0002\u0000\u8d48\u2454\u4828\u058b\u0518\u0000\u8948\u4802\u058b\u0516\u0000\u8948\u0842\u15ff\u04fc\u0000\uc085\u1975\u8b48\u2444\u4848\u088b\u57ff\u48d8\uc085\u0974\u8b48\u1040\u8348\u38c4\u89c3\ue8c1\ufc67\uffff\u8348\u28ec\u8948\u2454\u4c38\u448d\u2024\u8d48\u2454\uff18\u9f15\u0004\u8500\u75c0\u4c59\u448b\u2024\u854d\u74c0\u484a\u4c8b\u1824\u8d4d\u4844\u4800\ubf0f\u4801\uc183\u4c02\uc139\u3374\u0f48\u11bf\uc148\u10e2\u0948\u48d0\uc183\u4c02\uc139\u1f74\u0f48\u11bf\uc148\u20e2\u0948\u48d0\uc183\u4c02\uc139\u0b74\u0f48\u11bf\uc148\u30e2\u0948\u48d0\uc483\uc328\u8b48\u244c\uff38\u4c17\u418b\u4828\u518d\u4830\u498b\uff20\ud925\u0003\u8900\u244c\u4808\u5489\u1024\u894c\u2444\u4c18\u4c89\u2024\u4853\uec83\u4c20\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\udf15\u0003\u4800\uc085\u880f\u0064\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffad\uffff\u15ff\u03a2\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u039a\u0000\u15ff\u035c\u0000\u8948\u39d9\ue305\u0003\u0f00\u0785\u0000\ue800\uff65\uffff\u06eb\u15ff\u0360\u0000\u8348\u20c4\uc35b\uc748\u20c2\u0000\u4800\u0d8d\uff49\uffff\u15ff\u033e\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u02fe\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\ueb38\u48bd\u018b\u3881\u0003\u8000\u0674\u25ff\u0394\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u0376\u0000\u8d4c\u2504\u0090\u0000\ud231\u8d48\u244c\uff20\u6915\u0003\u4800\u4c8d\u0824\u15ff\u034e\u0000\u0db9\u0000\uebc0\u48b4\u0d89\u0370\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u0368\u0000\u8348\u28c4\u48c3\u0d8b\u0364\u0000\u25ff\u0366\u0000\u8348\u28ec\u8b48\u630d\u0003\uff00\u6515\u0003\u4800\u0d8b\u0376\u0000\u15ff\u0368\u0000\u8348\u28c4\u48c3\uec83\u4828\ucb89\u8948\u3d0d\u0003\u4800\u0d8d\uffc8\uffff\u15ff\u0308\u0000\u8b48\u490d\u0003\u4800\uc2c7\uffff\uffff\u15ff\u0344\u0000\u8348\u28c4\u25ff\u0342\u0000\u8348\u28ec\u0d8b\u0348\u0000\u8b48\u3915\u0003\u4500\uc031\u15ff\u0340\u0000\u8348\u28c4\u8b48\u3d0d\u0003\uff00\ubf25\u0002\u4800\u4c8b\u2824\u8348\u28ec\u15ff\u0330\u0000\u8348\u28c4\u25ff\u032e\u0000\uff51\ucf15\u0001\u5900\u3948\u5705\u0002\u7500\uff06\u1f25\u0003\uc300\u8348\u08ec\u15ff\u031c\u0000\u8348\u08c4\u8948\u48c1\ue9c1\u3120\uc3c8\u8348\u28ec\u8948\u89e9\u4df2\uf089\u15ff\u0304\u0000\u8348\u28c4\u48c3\u948d\u8024\u0000\u4800\uec83\u4828\u018b\u8d4c\ua085\u0000\uff00\u2050\u8948\u48c1\uea89\u8941\ufff0\udf15\u0002\u4800\uc483\uc328\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\ubf25\u0002\u4800\uec83\u4828\u018b\u8d4c\u504d\u8949\u4cf0\uf289\u50ff\u4808\ue989\uf289\u15ff\u02a8\u0000\u8348\u28c4\u4dc3\uf889\u8948\u4cda\uf189\u8348\u28ec\u15ff\u0298\u0000\u8348\u28c4\u8b49\u4907\u968d\u0220\u0000\u894c\ufff9\u1860\u53c3\u4856\uec83\u4818\ucb89\u8b48\u7b0d\u0002\u4800\u148d\u2825\u0000\uff00\u7515\u0002\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u0284\u0000\u8b48\u650d\u0002\u4800\uc289\uc749\u0ac0\u0000\uff00\u5d15\u0002\u4800\uf189\u15ff\u025c\u0000\ub8eb\u8348\u18c4\u5b5e\u49c3\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6874\u7369\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6425\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6320\u756f\u746e\u2820\u7865\u6570\u7463\u6465\u253d\u2c64\u6120\u7463\u6175\u3d6c\u6425\u0029\u534a\u4320\u6e6f\u6574\u7478\u6e20\u746f\u6620\u756f\u646e\u000a\u734a\u7245\u6f72\u4372\u646f\u3a65\u3020\u2578\u0078\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2320);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2320);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2328);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2328);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2336);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2336);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2344);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2344);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2352);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2352);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2360);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2360);
    },
    get malloc():VoidPointer{
        return buffer.getPointer(2368);
    },
    set malloc(n:VoidPointer){
        buffer.setPointer(n, 2368);
    },
    get vsnprintf():VoidPointer{
        return buffer.getPointer(2376);
    },
    set vsnprintf(n:VoidPointer){
        buffer.setPointer(n, 2376);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(2384);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 2384);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(2392);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 2392);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(2400);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 2400);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(2408);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 2408);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(2416);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 2416);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(2424);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 2424);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(2432);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 2432);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(2440);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 2440);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(2448);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 2448);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(2456);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 2456);
    },
    get nodeThreadId():number{
        return buffer.getInt32(2464);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 2464);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(2472);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 2472);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(2480);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 2480);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(2488);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 2488);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(2496);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 2496);
    },
    get memset():VoidPointer{
        return buffer.getPointer(2504);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 2504);
    },
    get printf():VoidPointer{
        return buffer.getPointer(2512);
    },
    set printf(n:VoidPointer){
        buffer.setPointer(n, 2512);
    },
    get Sleep():VoidPointer{
        return buffer.getPointer(2520);
    },
    set Sleep(n:VoidPointer){
        buffer.setPointer(n, 2520);
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
        return buffer.add(162);
    },
    get getout_invalid_parameter_count():NativePointer{
        return buffer.add(230);
    },
    get getout():NativePointer{
        return buffer.add(279);
    },
    get raise_runtime_error():NativePointer{
        return buffer.add(1573);
    },
    get str_js2np():NativePointer{
        return buffer.add(458);
    },
    get buffer_to_pointer():NativePointer{
        return buffer.add(580);
    },
    get utf16_js2np():NativePointer{
        return buffer.add(816);
    },
    get str_np2js():NativePointer{
        return buffer.add(918);
    },
    get utf16_np2js():NativePointer{
        return buffer.add(956);
    },
    get pointer_np2js_nullable():NativePointer{
        return buffer.add(1015);
    },
    get pointer_np2js():NativePointer{
        return buffer.add(1028);
    },
    get pointer_js_new():NativePointer{
        return buffer.add(1113);
    },
    get bin64():NativePointer{
        return buffer.add(1200);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(2528);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1325);
    },
    get logHook():NativePointer{
        return buffer.add(1343);
    },
    get runtime_error():NativePointer{
        return buffer.add(1555);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1642);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(2536);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2536);
    },
    get ServerInstance_ctor_hook():NativePointer{
        return buffer.add(1649);
    },
    get debugBreak():NativePointer{
        return buffer.add(1657);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2544);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1659);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2552);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get MultiThreadQueueTryDequeue():VoidPointer{
        return buffer.getPointer(2560);
    },
    set MultiThreadQueueTryDequeue(n:VoidPointer){
        buffer.setPointer(n, 2560);
    },
    get ConsoleInputReader_getLine_hook():NativePointer{
        return buffer.add(1677);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2576);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2576);
    },
    get free():VoidPointer{
        return buffer.getPointer(2584);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2584);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2592);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2592);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2600);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2600);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2608);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2608);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2616);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2616);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1725);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2624);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2624);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2632);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2632);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2640);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2640);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2648);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2648);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1782);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2656);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2656);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2664);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2664);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1825);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2672);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2672);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1850);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2680);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2680);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1874);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2688);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2688);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1898);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2696);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2696);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(1921);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2704);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2704);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(1966);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2712);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2712);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2001);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2720);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2037);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(2728);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(2736);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(2744);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(2752);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 2752);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(2760);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 2760);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(2768);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 2768);
    },
    get getline():NativePointer{
        return buffer.add(2077);
    },
};
