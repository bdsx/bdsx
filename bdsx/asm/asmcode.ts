import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(2792, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u8148\u88ec\u0000\u4c00\u048d\u4c11\u4c8d\u2024\ub60f\u6601\u8941\u4801\uc183\u4901\uc183\u4c02\uc139\uec75\u8d48\u244c\u4c20\u448d\u1824\u57ff\u4828\u4c8b\u1824\u8d48\u2454\uff10\u1115\u0009\u4800\u448b\u1024\u8148\u88c4\u0000\uc300\u8348\u28ec\u57ff\uff70\uc857\u8b48\u7847\u8348\u01e0\u0574\u73e8\uffff\uffff\u3d15\u0009\u4800\uec83\u8548\u0fc9\u0e8f\u0000\u4800\u0d8d\u0820\u0000\u68e8\uffff\uebff\u491a\uc889\u8d48\u2915\u0008\u4800\u4c8d\u2024\u15ff\u08a6\u0000\u8d48\u244c\u4820\uc289\u57e8\uffff\u48ff\uc189\u9de8\uffff\u48ff\uec83\u4968\uc989\u8949\u48d0\u158d\u0810\u0000\u8d48\u244c\uff20\u7515\u0008\u4800\u4c8d\u2024\u8948\ue8c2\uff26\uffff\u8948\u48c1\uc483\ue968\uff68\uffff\u8348\u48ec\u8948\u244c\u4828\u478b\u4878\ue083\u0f01\u2084\u0000\u4800\u4c8d\u2024\u15ff\u0842\u0000\uc085\u2c75\ub60f\u2444\u8520\u74c0\uff23\uc857\ubde8\ufffe\u48ff\u4c8d\u2024\u15ff\u087a\u0000\u0e75\u57ff\u48c8\u4c8b\u2024\u15ff\u0872\u0000\u8b4c\u2444\u4828\u158d\u07bf\u0000\u8d48\u244c\uff20\uf315\u0007\u4800\u4c8d\u2024\u8948\ue8c2\ufea4\uffff\u8948\ue8c1\ufeea\uffff\u8348\u28ec\u894c\u2444\u4840\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u07d8\u0000\uc085\u850f\u003c\u0000\u448b\u1024\u8348\u01e8\u3974\u8348\u02e8\u2c75\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\ub315\u0007\u8500\u75c0\u4813\u4c8b\u1824\u8b48\u2454\uff20\u2454\u4840\uc483\uc328\u8b48\u244c\uff38\u4817\uc483\u3128\uc3c0\u8348\u38ec\u8948\u2454\u4848\u4c89\u4024\u8d48\u2454\uff10\u6d15\u0007\u8500\u0fc0\u3285\u0000\u8b00\u2444\u4810\ue883\u0f01\u2b84\u0000\u4800\ue883\u0f04\u2884\u0000\u4800\ue883\u0f05\u3484\u0000\u4800\ue883\u0f01\u4d84\u0000\u4800\ue883\u7401\u4872\u4c8b\u3824\u17ff\u8348\u38c4\uc031\u48c3\u4c8b\u4024\u57ff\u48d8\uc085\ue574\u8b48\u1040\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u070a\u0000\uc085\uc375\u8b48\u2444\u4810\uc483\uc338\u8d4c\u244c\u4c30\u4c89\u2024\u894d\u48c8\u548d\u2824\u8b48\u244c\uff40\ue715\u0006\u8500\u75c0\u4898\u448b\u2824\u8348\u38c4\u4cc3\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u06cc\u0000\uc085\u850f\uff71\uffff\u8b48\u2444\u4810\uc483\uc338\u8348\u28ec\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u8115\u0006\u8500\u0fc0\u3e85\u0000\u8b00\u2444\u4810\ue883\u0f01\u2984\u0000\u4800\ue883\u7502\u4c2a\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u0658\u0000\uc085\u1175\u8b48\u2444\u4818\uc483\uc328\u8348\u28c4\uc031\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\u548d\u1024\uff41\u85d0\u75c0\u480a\u448b\u1024\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u28ec\u8948\u2454\u4838\uca89\ub70f\u4802\uc283\u8502\u75c0\u48f5\uca29\uc148\u02ea\u8d4c\u2444\uff18\u2857\uc085\u0a74\u8b48\u2444\u4818\uc483\uc328\u8b48\u244c\uff38\u4817\ud285\u0875\u8b48\uf705\u0005\uc300\u8348\u38ec\u8948\u2454\u4c48\u4c8d\u2024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\ud505\u0005\u4800\u0289\u15ff\u05c4\u0000\uc085\u2075\u8b48\u244c\uff20\ud857\u8548\u74c0\u4813\u4c8b\u4824\u8948\u1048\u8b48\u2444\u4820\uc483\uc338\u8948\ue8c1\ufcfc\uffff\u8348\u38ec\u8948\u2454\u4948\ud189\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\u8105\u0005\u4800\u0289\u8b48\u7f05\u0005\u4800\u4289\uff08\u6515\u0005\u8500\u75c0\u4819\u448b\u4824\u8b48\uff08\ud857\u8548\u74c0\u4809\u408b\u4810\uc483\uc338\u8948\ue8c1\ufca4\uffff\u8348\u28ec\u8948\u2454\u4c38\u448d\u2024\u8d48\u2454\uff18\u0715\u0005\u8500\u75c0\u315a\u4cc0\u448b\u2024\u854d\u74c0\u4849\u4c8b\u1824\u8d4e\u0104\u0f48\u01bf\u8348\u02c1\u394c\u74c1\u4833\ubf0f\u4811\ue2c1\u4810\ud009\u8348\u02c1\u394c\u74c1\u481f\ubf0f\u4811\ue2c1\u4820\ud009\u8348\u02c1\u394c\u74c1\u480b\ubf0f\u4811\ue2c1\u4830\ud009\u8348\u28c4\u48c3\u4c8b\u3824\u17ff\u8348\u38ec\u8948\u2454\u4830\u058b\u04ba\u0000\u8948\u2444\u4c28\u4c8d\u2024\uc749\u02c0\u0000\u4800\u548d\u2824\u57ff\u8560\u75c0\u4816\u4c8b\u2024\u57ff\u48d8\uc085\u0974\u8b48\u1040\u8348\u38c4\u89c3\ue8c1\ufbdc\uffff\u8548\u75c9\u4808\u058b\u0474\u0000\u48c3\uec83\u4838\u4c89\u5024\u8948\u2454\u4c48\uc189\u8d4c\u244c\u4930\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u044a\u0000\u8948\uff02\u3915\u0004\u8500\u75c0\u483d\u4c8b\u3024\u57ff\u48d8\uc085\u3074\u8b48\u244c\u4850\u4889\u4c10\u4c8d\u2024\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\u244c\uff48\u6057\uc085\u0a75\u8b48\u2444\u4820\uc483\uc338\uc189\u55e8\ufffb\u4cff\u418b\u4828\u518d\u4830\u498b\uff20\u7f25\u0003\uff00\u7115\u0003\u3900\ueb05\u0003\u7500\u4811\u548d\u5824\u8948\u49f9\ud889\u25ff\u0360\u0000\u8348\u28ec\u8d48\u1153\u8d48\uc00d\uffff\uffff\u5b15\u0003\u4800\u7889\u4c20\u438d\u4c01\u4089\u4828\u488d\u4830\u948d\u8024\u0000\u4800\u4489\u2024\u15ff\u0330\u0000\u8b48\u244c\u4820\uc483\uff28\u3125\u0003\u4800\u018b\u3881\u0003\u8000\u0674\u25ff\u0398\u0000\u48c3\u648d\ue924\u8d48\u2454\u4810\u8a8d\u0098\u0000\u02c7\u000d\uc000\u8948\u2414\u8948\u244c\uff08\u7915\u0003\u4900\uc0c7\u0098\u0000\u3148\u48d2\u4c8d\u1024\u15ff\u036c\u0000\u8948\uffe1\u5325\u0003\u4800\u0d89\u036c\u0000\uccc3\u48c3\ue189\u8348\u28ec\u15ff\u0364\u0000\u8348\u28c4\u8548\u74c0\u5907\u25ff\u035c\u0000\u8948\ub075\u8b48\u4806\u488b\u4820\u018b\u48c3\uec83\u4c28\uc189\u15ff\u0348\u0000\u8348\u28c4\u48c3\u548d\u3024\u8348\u28ec\u8b48\u3b0d\u0003\uff00\u3d15\u0003\u4800\uc483\uc328\u8348\u28ec\u8b48\u350d\u0003\uff00\u3715\u0003\u4800\u0d8b\u0348\u0000\u15ff\u033a\u0000\u8348\u28c4\u48c3\uec83\u4828\u1d89\u0312\u0000\u15ff\u0334\u0000\u8d48\uc50d\uffff\uffff\uc715\u0002\u4800\u0d8b\u0318\u0000\uc748\uffc2\uffff\uffff\u1b15\u0003\uff00\u1d15\u0003\u4800\uc483\uc328\u8348\u28ec\u15ff\u0316\u0000\u0d8b\u0320\u0000\u8b48\u1115\u0003\u4500\uc031\u15ff\u0318\u0000\u8348\u28c4\u8b48\u150d\u0003\uff00\u7725\u0002\u4800\uec83\u4828\ud989\u15ff\u030a\u0000\u8348\u28c4\u25ff\u0308\u0000\u51c3\u15ff\u01a8\u0000\u4859\u0539\u0220\u0000\u0675\u25ff\u02f8\u0000\u48c3\uec83\uff08\uf515\u0002\u4800\uc483\u4808\uc189\uc148\u20e9\uc831\u48c3\uec83\u4828\ue989\u894c\u4dfa\ue889\u15ff\u02dc\u0000\u8348\u28c4\u48c3\uec83\u4828\u018b\u8d4c\ue085\u0001\u4800\u558d\uff70\u2850\u8948\u48c1\uea89\u894d\ufff8\ubb15\u0002\u4800\uc483\uc328\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\u9b25\u0002\u4800\uec83\u4828\u018b\u8d4c\u488d\u0001\u4900\uf089\u894c\uffea\u0850\u8948\u4ce9\ufa89\u15ff\u0280\u0000\u8348\u28c4\u48c3\ucb89\u0f41\ue9b6\u894c\u49c7\ud689\u8348\u28ec\u15ff\u026c\u0000\u8348\u28c4\u8b48\u6883\u0002\u4900\uf889\u4dc3\uf089\u8948\u4cf2\uf989\u8348\u28ec\u15ff\u024a\u0000\u8348\u28c4\u8b49\u4906\u978d\u0208\u0000\u894c\ufff1\u1860\u4dc3\uce89\u894c\u48c7\ud589\u8948\u48ce\uec83\uff28\u2715\u0002\u4800\uc483\u8528\u74c0\u480c\uf189\u8948\uffea\u1b25\u0002\uc300\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u7420\u6968\u0073\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u2520\u0064\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u6f63\u6e75\u2074\u6528\u7078\u6365\u6574\u3d64\u6425\u202c\u6361\u7574\u6c61\u253d\u2964\u4a00\u4573\u7272\u726f\u6f43\u6564\u203a\u7830\u7825\u0000\u0000\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(2368);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 2368);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(2376);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 2376);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(2384);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 2384);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(2392);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 2392);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(2400);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 2400);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(2408);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 2408);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(2416);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 2416);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(2424);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 2424);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(2432);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 2432);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(2440);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 2440);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(2448);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 2448);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(2456);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 2456);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(2464);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 2464);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(2472);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 2472);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(2480);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 2480);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(2488);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 2488);
    },
    get nodeThreadId():number{
        return buffer.getInt32(2496);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 2496);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(2504);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 2504);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(2512);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 2512);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(2520);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 2520);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(2528);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 2528);
    },
    get memset():VoidPointer{
        return buffer.getPointer(2536);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 2536);
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
        return buffer.add(1254);
    },
    get wrapper_np2js_nullable():NativePointer{
        return buffer.add(1328);
    },
    get wrapper_np2js():NativePointer{
        return buffer.add(1341);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(2544);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 2544);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1463);
    },
    get logHook():NativePointer{
        return buffer.add(1481);
    },
    get runtime_error():NativePointer{
        return buffer.add(1583);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1601);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(2552);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 2552);
    },
    get ServerInstance_startServerThread_hook():NativePointer{
        return buffer.add(1669);
    },
    get debugBreak():NativePointer{
        return buffer.add(1677);
    },
    get commandHookCallback():VoidPointer{
        return buffer.getPointer(2560);
    },
    set commandHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2560);
    },
    get MinecraftCommandsExecuteCommandAfter():VoidPointer{
        return buffer.getPointer(2568);
    },
    set MinecraftCommandsExecuteCommandAfter(n:VoidPointer){
        buffer.setPointer(n, 2568);
    },
    get commandHook():NativePointer{
        return buffer.add(1679);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(2576);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 2576);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1723);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(2584);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 2584);
    },
    get MultiThreadQueueDequeue():VoidPointer{
        return buffer.getPointer(2592);
    },
    set MultiThreadQueueDequeue(n:VoidPointer){
        buffer.setPointer(n, 2592);
    },
    get stdin_launchpad_hook():NativePointer{
        return buffer.add(1741);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(2608);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 2608);
    },
    get free():VoidPointer{
        return buffer.getPointer(2616);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 2616);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(2624);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 2624);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(2632);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 2632);
    },
    get _Pad_Release():VoidPointer{
        return buffer.getPointer(2640);
    },
    set _Pad_Release(n:VoidPointer){
        buffer.setPointer(n, 2640);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(2648);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 2648);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(2656);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 2656);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1803);
    },
    get runtimeErrorBeginHandler():VoidPointer{
        return buffer.getPointer(2664);
    },
    set runtimeErrorBeginHandler(n:VoidPointer){
        buffer.setPointer(n, 2664);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(2672);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 2672);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(2680);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 2680);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(2688);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 2688);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(2696);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 2696);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1864);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(2704);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 2704);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(2712);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 2712);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1913);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(2720);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 2720);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1937);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(2728);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 2728);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1961);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(2736);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 2736);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1985);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(2744);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 2744);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2009);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(2752);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 2752);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2050);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(2760);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 2760);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2085);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(2768);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 2768);
    },
    get packetSendHook():NativePointer{
        return buffer.add(2125);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2163);
    },
    get onPacketSendRaw():VoidPointer{
        return buffer.getPointer(2776);
    },
    set onPacketSendRaw(n:VoidPointer){
        buffer.setPointer(n, 2776);
    },
    get NetworkHandlerGetConnectionFromId():VoidPointer{
        return buffer.getPointer(2784);
    },
    set NetworkHandlerGetConnectionFromId(n:VoidPointer){
        buffer.setPointer(n, 2784);
    },
    get packetSendInternalHook():NativePointer{
        return buffer.add(2203);
    },
};
