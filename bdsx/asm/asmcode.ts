import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(2968, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\ub115\u0009\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u57ff\uff70\uc857\u8b48\u7847\u8348\u01e0\u0574\u73e8\uffff\uffff\udd15\u0009\u4800\uec83\u8548\u0fc9\u0e8f\u0000\u4800\u0d8d\u088b\u0000\u68e8\uffff\uebff\u491a\uc889\u8d48\u9415\u0008\u4800\u4c8d\u2024\u15ff\u0936\u0000\u8d48\u244c\u4820\uc289\u57e8\uffff\u48ff\uc189\u9de8\uffff\u48ff\uec83\u4968\uc989\u8949\u48d0\u158d\u087b\u0000\u8d48\u244c\uff20\u0515\u0009\u4800\u4c8d\u2024\u8948\ue8c2\uff26\uffff\u8948\u48c1\uc483\ue968\uff68\uffff\u8348\u48ec\u8148\u03f9\u0100\u0f00\u3384\u0000\u4800\u4c89\u2824\u8b48\u7847\u8348\u01e0\u840f\u0046\u0000\u8d48\u244c\uff20\ud515\u0008\u8500\u75c0\u0f52\u44b6\u2024\uc085\u4974\u57ff\ue8c8\ufeb0\uffff\u15ff\u087a\u0000\u3948\u0305\u0009\u7400\ub90a\u0001\ue000\u76e8\u0005\u4800\u158d\u0824\u0000\u15ff\u091a\u0000\u8d48\u244c\uff20\ue715\u0008\u7500\uff0e\uc857\u8b48\u244c\uff20\udf15\u0008\u4c00\u448b\u2824\u8d48\u0d15\u0008\u4800\u4c8d\u2024\u15ff\u0850\u0000\u8d48\u244c\u4820\uc289\u71e8\ufffe\u48ff\uc189\ub7e8\ufffe\u48ff\uec83\u4c28\u4489\u4024\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u4515\u0008\u8500\u0fc0\u3c85\u0000\u8b00\u2444\u4810\ue883\u7401\u4839\ue883\u7502\u4c2c\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u0820\u0000\uc085\u1375\u8b48\u244c\u4818\u548b\u2024\u54ff\u4024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28c4\uc031\u48c3\uec83\u4838\u5489\u4824\u8948\u244c\u4840\u548d\u1024\u15ff\u07da\u0000\uc085\u850f\u0032\u0000\u448b\u1024\u8348\u01e8\u840f\u002b\u0000\u8348\u04e8\u840f\u0028\u0000\u8348\u05e8\u840f\u0034\u0000\u8348\u01e8\u840f\u004d\u0000\u8348\u01e8\u7274\u8b48\u244c\uff38\u4817\uc483\u3138\uc3c0\u8b48\u244c\uff40\ud857\u8548\u74c0\u48e5\u408b\u4810\uc483\uc338\u8d4c\u2444\u4818\u548d\u1024\u8b48\u244c\uff40\u7715\u0007\u8500\u75c0\u48c3\u448b\u1024\u8348\u38c4\u4cc3\u4c8d\u3024\u894c\u244c\u4d20\uc889\u8d48\u2454\u4828\u4c8b\u4024\u15ff\u0754\u0000\uc085\u9875\u8b48\u2444\u4828\uc483\uc338\u8d4c\u2444\u4818\u548d\u1024\u8b48\u244c\uff40\u3915\u0007\u8500\u0fc0\u7185\uffff\u48ff\u448b\u1024\u8348\u38c4\u48c3\uec83\u4828\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u06ee\u0000\uc085\u850f\u003e\u0000\u448b\u1024\u8348\u01e8\u840f\u0029\u0000\u8348\u02e8\u2a75\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\uc515\u0006\u8500\u75c0\u4811\u448b\u1824\u8348\u28c4\u48c3\uc483\u3128\uc3c0\u8b48\u244c\uff38\u4817\uec83\u4828\u5489\u3824\u8d48\u2454\u4110\ud0ff\uc085\u0a75\u8b48\u2444\u4810\uc483\uc328\u8b48\u244c\uff38\u4817\uec83\u4828\u5489\u3824\u8948\u0fca\u02b7\u8348\u02c2\uc085\uf575\u2948\u48ca\ueac1\u4c02\u448d\u1824\u57ff\u8528\u74c0\u480a\u448b\u1824\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8548\u75d2\u4808\u058b\u0664\u0000\u48c3\uec83\u4838\u5489\u4824\u8d4c\u244c\u4920\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u0642\u0000\u8948\uff02\u3115\u0006\u8500\u75c0\u4820\u4c8b\u2024\u57ff\u48d8\uc085\u1374\u8b48\u244c\u4848\u4889\u4810\u448b\u2024\u8348\u38c4\u89c3\ue8c1\ufcca\uffff\u8348\u38ec\u8948\u2454\u4948\ud189\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\uef05\u0005\u4800\u0289\u8b48\ued05\u0005\u4800\u4289\uff08\ud315\u0005\u8500\u75c0\u4819\u448b\u4824\u8b48\uff08\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\uc189\u73e8\ufffc\u48ff\uec83\u4828\u5489\u3824\u8d4c\u2444\u4820\u548d\u1824\u15ff\u0576\u0000\uc085\u5975\u8b4c\u2444\u4d20\uc085\u4a74\u8b48\u244c\u4d18\u448d\u0048\u0f48\u01bf\u8348\u02c1\u394c\u74c1\u4833\ubf0f\u4811\ue2c1\u4810\ud009\u8348\u02c1\u394c\u74c1\u481f\ubf0f\u4811\ue2c1\u4820\ud009\u8348\u02c1\u394c\u74c1\u480b\ubf0f\u4811\ue2c1\u4830\ud009\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u38ec\u8948\u2454\u4830\u058b\u052a\u0000\u8948\u2444\u4c28\u4c8d\u2024\uc749\u02c0\u0000\u4800\u548d\u2824\u57ff\u8560\u75c0\u4816\u4c8b\u2024\u57ff\u48d8\uc085\u0974\u8b48\u1040\u8348\u38c4\u89c3\ue8c1\ufbac\uffff\u8548\u75c9\u4808\u058b\u04e4\u0000\u48c3\uec83\u4838\u4c89\u5024\u8948\u2454\u4c48\uc189\u8d4c\u244c\u4930\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u04ba\u0000\u8948\uff02\ua915\u0004\u8500\u75c0\u483d\u4c8b\u3024\u57ff\u48d8\uc085\u3074\u8b48\u244c\u4850\u4889\u4c10\u4c8d\u2024\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\u244c\uff48\u6057\uc085\u0a75\u8b48\u2444\u4820\uc483\uc338\uc189\u25e8\ufffb\u4cff\u418b\u4828\u518d\u4830\u498b\uff20\udf25\u0003\u8900\u244c\u4808\u5489\u1024\u894c\u2444\u4c18\u4c89\u2024\u4853\uec83\u4c20\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\ue515\u0003\u4800\uc085\u880f\u0064\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffad\uffff\u15ff\u03a8\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u03a0\u0000\u15ff\u0362\u0000\u8948\u39d9\ue905\u0003\u0f00\u0785\u0000\ue800\uff65\uffff\u06eb\u15ff\u0366\u0000\u8348\u20c4\uc35b\uc748\u20c2\u0000\u4800\u0d8d\uff49\uffff\u15ff\u0344\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u0300\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\ueb38\u48bd\u018b\u3881\u0003\u8000\u0674\u25ff\u039a\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u037c\u0000\u8d4c\u2504\u0090\u0000\ud231\u8d48\u244c\uff20\u6f15\u0003\u4800\u4c8d\u0824\u15ff\u0354\u0000\u0db9\u0000\uebc0\u48b4\u0d89\u0376\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u036e\u0000\u8348\u28c4\u48c3\u0d8b\u036a\u0000\u25ff\u036c\u0000\u8348\u28ec\u8b48\u690d\u0003\uff00\u6b15\u0003\u4800\u0d8b\u037c\u0000\u15ff\u036e\u0000\u8348\u28c4\u48c3\uec83\u4828\ucb89\u8948\u430d\u0003\u4800\u0d8d\uffc8\uffff\u15ff\u030e\u0000\u8b48\u4f0d\u0003\u4800\uc2c7\uffff\uffff\u15ff\u034a\u0000\u8348\u28c4\u25ff\u0348\u0000\u8348\u28ec\u0d8b\u034e\u0000\u8b48\u3f15\u0003\u4500\uc031\u15ff\u0346\u0000\u8348\u28c4\u8b48\u430d\u0003\uff00\uc525\u0002\u4800\u4c8b\u2024\u8348\u28ec\u8948\uffd9\u3315\u0003\u4800\uc483\uff28\u3125\u0003\u5100\u15ff\u01d2\u0000\u4859\u0539\u025a\u0000\u0675\u25ff\u0322\u0000\u48c3\uec83\uff08\u1f15\u0003\u4800\uc483\u4808\uc189\uc148\u20e9\uc831\u48c3\uec83\u4828\ue989\u8944\u4dfa\uf089\u15ff\u0306\u0000\u8348\u28c4\u48c3\u548d\u7824\u8348\u28ec\u8b48\u4c01\u858d\u00a0\u0000\u50ff\u4820\uc189\u8948\u4dea\uf889\u15ff\u02e4\u0000\u8348\u28c4\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u02c4\u0000\u8348\u28ec\u8b48\u4c01\u4d8d\u4958\uf089\u894c\ufff2\u0850\u8948\u4ce9\ufa89\u15ff\u02ac\u0000\u8348\u28c4\u4dc3\uf889\u8948\u4cda\uf189\u8348\u28ec\u15ff\u029c\u0000\u8348\u28c4\u8b49\u4907\u968d\u0220\u0000\u894c\ufff9\u1860\u53c3\u4856\uec83\u4818\ucb89\u8b48\u7f0d\u0002\u4800\u148d\u2825\u0000\uff00\u7915\u0002\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u0288\u0000\u8b48\u690d\u0002\u4800\uc289\uc749\u0ac0\u0000\uff00\u6115\u0002\u4800\uf189\u15ff\u0260\u0000\ub8eb\u8348\u18c4\u5b5e\u49c3\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6874\u7369\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6425\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6320\u756f\u746e\u2820\u7865\u6570\u7463\u6465\u253d\u2c64\u6120\u7463\u6175\u3d6c\u6425\u0029\u534a\u4320\u6e6f\u6574\u7478\u6e20\u746f\u6620\u756f\u646e\u000a\u734a\u7245\u6f72\u4372\u646f\u3a65\u3020\u2578\u0078\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d\u0000\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2512);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2512);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2520);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2520);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2528);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2536);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2536);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2544);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2552);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get malloc():VoidPointer{
        return buffer.getPointer(2560);
    },
    set malloc(n:VoidPointer){
        buffer.setPointer(n, 2560);
    },
    get vsnprintf():VoidPointer{
        return buffer.getPointer(2568);
    },
    set vsnprintf(n:VoidPointer){
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
    get Sleep():VoidPointer{
        return buffer.getPointer(2712);
    },
    set Sleep(n:VoidPointer){
        buffer.setPointer(n, 2712);
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
        return buffer.add(1759);
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
        return buffer.add(1090);
    },
    get bin64():NativePointer{
        return buffer.add(1177);
    },
    get wrapper_js2np():NativePointer{
        return buffer.add(1302);
    },
    get wrapper_np2js_nullable():NativePointer{
        return buffer.add(1376);
    },
    get wrapper_np2js():NativePointer{
        return buffer.add(1389);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(2720);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1511);
    },
    get logHook():NativePointer{
        return buffer.add(1529);
    },
    get runtime_error():NativePointer{
        return buffer.add(1741);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1828);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(2728);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get ServerInstance_ctor_hook():NativePointer{
        return buffer.add(1835);
    },
    get debugBreak():NativePointer{
        return buffer.add(1843);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2736);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1845);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2744);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get MultiThreadQueueTryDequeue():VoidPointer{
        return buffer.getPointer(2752);
    },
    set MultiThreadQueueTryDequeue(n:VoidPointer){
        buffer.setPointer(n, 2752);
    },
    get ConsoleInputReader_getLine_hook():NativePointer{
        return buffer.add(1863);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2768);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2768);
    },
    get free():VoidPointer{
        return buffer.getPointer(2776);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2776);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2784);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2784);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2792);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2792);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2800);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2800);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2808);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2808);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1911);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2816);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2816);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2824);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2824);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2832);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2832);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2840);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2840);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1968);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2848);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2848);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2856);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2856);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(2011);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2864);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2864);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(2039);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2872);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2872);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(2063);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2880);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2880);
    },
    get packetRawHook():NativePointer{
        return buffer.add(2087);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2888);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2888);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2111);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2896);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2896);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2153);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2904);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2904);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2188);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2912);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2912);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2225);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(2920);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 2920);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(2928);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 2928);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(2936);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 2936);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(2944);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 2944);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(2952);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 2952);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(2960);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 2960);
    },
    get getline():NativePointer{
        return buffer.add(2265);
    },
};
