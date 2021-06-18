import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(3560, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u48c3\uec81\u0088\u0000\u8d4c\u1104\u8d4c\u244c\u0f20\u01b6\u4166\u0189\u8348\u01c1\u8349\u02c1\u394c\u75c1\u48ec\u4c8d\u2024\u8d4c\u2444\uff18\u2857\u8b48\u244c\u4818\u548d\u1024\u15ff\u0c00\u0000\u8b48\u2444\u4810\uc481\u0088\u0000\u48c3\uec83\u4828\u4c89\u2024\u57ff\u48c8\u478b\u4878\ue083\u7401\u480d\u4c8b\u2024\u57ff\ue870\uff68\uffff\u8b48\u244c\uff20\u1d15\u000c\u4800\uc483\uc328\u8348\u48ec\uc985\u8f0f\u000e\u0000\u8d48\u060d\u0008\ue800\uff53\uffff\u1aeb\u8949\u48c8\u158d\u080f\u0000\u8d48\u244c\uff20\u7115\u000b\u4800\u4c8d\u2024\u8948\ue8c2\uff43\uffff\u8948\ue8c1\uff89\uffff\u8348\u48c4\u48c3\uec83\u4968\uc989\u8949\u48d0\u158d\u07f1\u0000\u8d48\u244c\uff20\u3b15\u000b\u4800\u4c8d\u2024\u8948\ue8c2\uff0d\uffff\u8948\ue8c1\uff53\uffff\u8348\u68c4\u48c3\uec83\u4848\uf981\u0003\u0001\u840f\u0033\u0000\u8948\u244c\u4828\u478b\u4878\ue083\u0f01\u4684\u0000\u4800\u4c8d\u2024\u15ff\u0b0a\u0000\uc085\u5475\ub60f\u2444\u8520\u74c0\uff4b\uc857\u95e8\ufffe\uffff\uaf15\u000a\u4800\u0539\u0b38\u0000\u0a74\u01b9\u0000\ue8e0\u04e2\u0000\u8d48\u9915\u0007\uff00\u4f15\u000b\u4800\u4c8d\u2024\u15ff\u0b1c\u0000\uc085\u0e75\u57ff\u48c8\u4c8b\u2024\u15ff\u0b12\u0000\u8b4c\u2444\u4828\u158d\u0780\u0000\u8d48\u244c\uff20\u8315\u000a\u4800\u4c8d\u2024\u8948\ue8c2\ufe55\uffff\u8948\ue8c1\ufe9b\uffff\u8348\u48c4\u48c3\uec83\u4c28\u4c89\u4824\u894c\u2444\u4840\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u0a6e\u0000\uc085\u850f\u004a\u0000\u448b\u1024\u8348\u01e8\u840f\u0043\u0000\u8348\u02e8\u850f\u0032\u0000\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\u4115\u000a\u8500\u0fc0\u1585\u0000\u4c00\u448b\u4824\u8b48\u244c\u4818\u548b\u2024\u54ff\u4024\u07eb\u8b48\u244c\uff38\u4817\uc483\uc328\u8348\u38ec\u8948\u2454\u4848\u4c89\u4024\u8d48\u2454\uff10\uf715\u0009\u8500\u0fc0\u3685\u0000\u8b00\u2444\u4810\ue883\u0f01\u2f84\u0000\u4800\ue883\u0f04\u2984\u0000\u4800\ue883\u0f05\u3284\u0000\u4800\ue883\u0f01\u4884\u0000\u4800\ue883\u0f01\u6684\u0000\u4800\u4c8b\u3824\u17ff\uc031\u7deb\u8b48\u244c\uff40\ud857\u8548\u74c0\u48e8\u408b\ueb10\u4c6a\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u0996\u0000\uc085\uc975\u8b48\u2444\ueb10\u4c4a\u4c8d\u3024\u894c\u244c\u4d20\uc889\u8d48\u2454\u4828\u4c8b\u4024\u15ff\u0976\u0000\uc085\ua175\u8b48\u2444\ueb28\u4c22\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u095e\u0000\uc085\u850f\uff7d\uffff\u8b48\u2444\u4810\uc483\uc338\u8348\u28ec\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u1315\u0009\u8500\u0fc0\u4085\u0000\u8b00\u2444\u4810\ue883\u0f01\u2e84\u0000\u4800\ue883\u0f02\u2885\u0000\u4c00\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u08e6\u0000\uc085\u850f\u000b\u0000\u8b48\u2444\ueb18\u310b\uebc0\u4807\u4c8b\u3824\u17ff\u8348\u28c4\u48c3\uec83\u4828\u5489\u3824\u8d48\u2454\u4110\ud0ff\uc085\u850f\u0007\u0000\u8b48\u2444\ueb10\u4807\u4c8b\u3824\u17ff\u8348\u28c4\u48c3\uec83\u4828\u5489\u3824\u8948\u0fca\u02b7\u8348\u02c2\uc085\uf575\u2948\u48ca\ueac1\u4c02\u448d\u1824\u57ff\u8528\u0fc0\u0784\u0000\u4800\u448b\u1824\u07eb\u8b48\u244c\uff38\u4817\uc483\uc328\u8548\u75d2\u4808\u058b\u0876\u0000\u48c3\uec83\u4838\u5489\u4824\u8d4c\u244c\u4920\uc0c7\u0001\u0000\u8d48\u2454\u4828\u058b\u0854\u0000\u8948\uff02\u4315\u0008\u8500\u0fc0\u2185\u0000\u4800\u4c8b\u2024\u57ff\u48d8\uc085\u840f\u0010\u0000\u8b48\u244c\u4848\u4889\u4810\u448b\u2024\u07eb\uc189\ua2e8\ufffc\u48ff\uc483\uc338\u8348\u38ec\u8948\u2454\u4948\ud189\uc749\u02c0\u0000\u4800\u548d\u2824\u8b48\uf705\u0007\u4800\u0289\u8b48\uf505\u0007\u4800\u4289\uff08\udb15\u0007\u8500\u0fc0\u1a85\u0000\u4800\u448b\u4824\u8b48\uff08\ud857\u8548\u0fc0\u0684\u0000\u4800\u408b\ueb10\u8907\ue8c1\ufc41\uffff\u8348\u38c4\u48c3\uec83\u4828\u5489\u3824\u8d4c\u2444\u4820\u548d\u1824\u15ff\u0774\u0000\uc085\u850f\u0055\u0000\u8b4c\u2444\u4d20\uc085\u5274\u8b48\u244c\u4d18\u048d\u4848\ubf0f\u4801\uc183\u4c02\uc139\u3c74\u0f48\u11bf\uc148\u10e2\u0948\u48d0\uc183\u4c02\uc139\u2874\u0f48\u11bf\uc148\u20e2\u0948\u48d0\uc183\u4c02\uc139\u1474\u0f48\u11bf\uc148\u30e2\u0948\uebd0\u4807\u4c8b\u3824\u17ff\u8348\u28c4\u4cc3\u418b\u4828\u518d\u4830\u498b\uff20\ua925\u0006\uc300\u4853\uec83\u8920\u244c\u4830\u5489\u3824\u894c\u2444\u4c40\u4c89\u4824\u8d4c\u244c\u4940\ud089\ud231\ud189\u15ff\u06ae\u0000\u8548\u0fc0\u6088\u0000\u4800\uc389\u8d48\u1150\u8d48\uac0d\uffff\uffff\u7115\u0006\u4800\u4c8b\u3024\u8948\u2048\u8948\u2858\u8d4c\u244c\u4c40\u448b\u3824\u8d48\u0153\u8d48\u3048\u8948\uffc3\u6915\u0006\uff00\u2b15\u0006\u4800\ud989\u0539\u06b2\u0000\u850f\u0007\u0000\u64e8\uffff\uebff\uff43\u2f15\u0006\ueb00\u483b\uc2c7\u0020\u0000\u8d48\u4c0d\uffff\uffff\u1115\u0006\u4800\u548b\u3024\u8948\u2050\uc748\u2840\u000f\u0000\u8d48\u0d0d\u0003\u4800\u118b\u8948\u3050\u8b48\u0851\u8948\u3850\u8348\u20c4\uc35b\u8b48\u8101\u0338\u0000\u7480\uff06\u6325\u0006\uc300\u8148\u88ec\u0005\u4800\u548d\u1824\u0a89\u8d48\u988a\u0000\u4800\u5489\u0824\u8948\u244c\uff10\u4515\u0006\u4c00\u048d\u9025\u0000\u3100\u48d2\u4c8d\u2024\u15ff\u0638\u0000\u8d48\u244c\uff08\u1d15\u0006\u4800\uc481\u0588\u0000\ub9c3\u000d\uc000\uaceb\u48c3\u0d89\u0636\u0000\uccc3\u48c3\uec83\u4c28\uc189\u15ff\u062e\u0000\u8348\u28c4\u48c3\u0d8b\u062a\u0000\u25ff\u062c\u0000\u48c3\uec83\u4828\u0d8b\u0628\u0000\u15ff\u062a\u0000\u8b48\u3b0d\u0006\uff00\u2d15\u0006\u4800\uc483\uc328\u8348\u28ec\u8948\u48cb\u0d89\u0602\u0000\u8d48\uc80d\uffff\uffff\ucd15\u0005\u4800\u0d8b\u060e\u0000\uc748\uffc2\uffff\uffff\u0915\u0006\u4800\uc483\uff28\u0725\u0006\u4800\uec83\u8b28\u0d0d\u0006\u4800\u158b\u05fe\u0000\u3145\uffc0\u0515\u0006\u4800\uc483\u4828\u0d8b\u0602\u0000\u25ff\u0584\u0000\u8348\u28ec\u8b48\u244c\uff50\uf515\u0005\u4800\uc483\uff28\uf325\u0005\u4800\uec83\uff08\u9115\u0004\u4800\uc483\u4808\u0539\u0516\u0000\u0675\u25ff\u05de\u0000\u48c3\uec83\uff08\udb15\u0005\u4800\uc189\uc148\u20e9\uc831\u8348\u08c4\u48c3\uec83\u4828\ue989\uf289\u894d\ufff0\uc315\u0005\u4800\uc483\uc328\u8348\u28ec\u8b48\u4c01\u858d\u00c0\u0000\u8d48\ua055\u50ff\u4820\uc189\u8948\u41ea\uf089\u15ff\u05a2\u0000\u8348\u28c4\u49c3\uf883\u757f\u4809\u448b\u2824\u00c6\uc300\u8948\u245c\u5510\u5756\u5441\u5541\u5641\u25ff\u0582\u0000\u8348\u28ec\u8b48\u4c01\u4d8d\u4978\uf089\u894c\ufff2\u0850\u8948\u89e9\ufff2\u6b15\u0005\u4800\uc483\uc328\u8348\u28ec\u894d\u48f8\uda89\u894c\ufff1\u5b15\u0005\u4900\u078b\u8d49\u3096\u0002\u4c00\uf989\u8348\u28c4\u60ff\u5318\u4856\uec83\u4818\ucb89\u8b48\u3f0d\u0005\u4800\u148d\u2825\u0000\uff00\u3915\u0005\u4800\u5889\u4840\uc689\u8d48\u204e\u15ff\u0548\u0000\u8b48\u290d\u0005\u4800\uc289\uc749\u0ac0\u0000\uff00\u2115\u0005\u4800\uf189\u15ff\u0520\u0000\ub8eb\u8348\u18c4\u5b5e\u49c3\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6874\u7369\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6120\u2074\u6425\u4900\u766e\u6c61\u6469\u7020\u7261\u6d61\u7465\u7265\u6320\u756f\u746e\u2820\u7865\u6570\u7463\u6465\u253d\u2c64\u6120\u7463\u6175\u3d6c\u6425\u0029\u534a\u4320\u6e6f\u6574\u7478\u6e20\u746f\u6620\u756f\u646e\u000a\u734a\u7245\u6f72\u4372\u646f\u3a65\u3020\u2578\u0078\u665b\u726f\u616d\u2074\u6166\u6c69\u6465\u005d\u0001\u0000\u0001\u0000\u0701\u0002\u0107\u0011\u0401\u0001\u4204\u0000\u0401\u0001\u8204\u0000\u0401\u0001\uc204\u0000\u0401\u0001\u8204\u0000\u0701\u0002\u0107\u00b1\u0401\u0001\u4204\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u6204\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0501\u0002\u3001\u3205\u0001\u0000\u0001\u0000\u0001\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u0204\u0000\u0401\u0001\u0204\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0001\u0000\u0401\u0001\u4204\u0000\u0401\u0001\u4204\u0000\u0601\u0003\u3001\u6002\u2206\u0000\u0000\u0000\u0013\u0000\u095c\u0000\u0013\u0000\u0027\u0000\u0960\u0000\u0027\u0000\u0075\u0000\u0964\u0000\u0075\u0000\u00a8\u0000\u096c\u0000\u00a8\u0000\u00f1\u0000\u0974\u0000\u00f1\u0000\u0127\u0000\u097c\u0000\u0127\u0000\u0666\u0000\u0984\u0000\u0666\u0000\u01df\u0000\u098c\u0000\u01df\u0000\u0260\u0000\u0994\u0000\u0260\u0000\u0344\u0000\u099c\u0000\u0344\u0000\u03b1\u0000\u09a4\u0000\u03b1\u0000\u03dd\u0000\u09ac\u0000\u03dd\u0000\u041e\u0000\u09b4\u0000\u041e\u0000\u042b\u0000\u09bc\u0000\u042b\u0000\u048a\u0000\u09c0\u0000\u048a\u0000\u04eb\u0000\u09c8\u0000\u04eb\u0000\u056d\u0000\u09d0\u0000\u056d\u0000\u0580\u0000\u09d8\u0000\u0580\u0000\u0654\u0000\u09dc\u0000\u0654\u0000\u06b3\u0000\u09e4\u0000\u06b3\u0000\u06bb\u0000\u09e8\u0000\u06bb\u0000\u06c3\u0000\u09ec\u0000\u06c3\u0000\u06c5\u0000\u09f0\u0000\u06c5\u0000\u06d7\u0000\u09f4\u0000\u06d7\u0000\u06e5\u0000\u09fc\u0000\u06e5\u0000\u0708\u0000\u0a00\u0000\u0708\u0000\u0741\u0000\u0a08\u0000\u0741\u0000\u076c\u0000\u0a10\u0000\u076c\u0000\u0785\u0000\u0a18\u0000\u0785\u0000\u07a3\u0000\u0a20\u0000\u07a3\u0000\u07bb\u0000\u0a28\u0000\u07bb\u0000\u07d2\u0000\u0a30\u0000\u07d2\u0000\u07fb\u0000\u0a38\u0000\u07fb\u0000\u081e\u0000\u0a40\u0000\u081e\u0000\u0842\u0000\u0a44\u0000\u0842\u0000\u0869\u0000\u0a4c\u0000\u0869\u0000\u095c\u0000\u0a54\u0000\u0000\u0000');
export = {
    get GetCurrentThreadId():VoidPointer{
        return buffer.getPointer(3104);
    },
    set GetCurrentThreadId(n:VoidPointer){
        buffer.setPointer(n, 3104);
    },
    get bedrockLogNp():VoidPointer{
        return buffer.getPointer(3112);
    },
    set bedrockLogNp(n:VoidPointer){
        buffer.setPointer(n, 3112);
    },
    get memcpy():VoidPointer{
        return buffer.getPointer(3120);
    },
    set memcpy(n:VoidPointer){
        buffer.setPointer(n, 3120);
    },
    get asyncAlloc():VoidPointer{
        return buffer.getPointer(3128);
    },
    set asyncAlloc(n:VoidPointer){
        buffer.setPointer(n, 3128);
    },
    get asyncPost():VoidPointer{
        return buffer.getPointer(3136);
    },
    set asyncPost(n:VoidPointer){
        buffer.setPointer(n, 3136);
    },
    get sprintf():VoidPointer{
        return buffer.getPointer(3144);
    },
    set sprintf(n:VoidPointer){
        buffer.setPointer(n, 3144);
    },
    get malloc():VoidPointer{
        return buffer.getPointer(3152);
    },
    set malloc(n:VoidPointer){
        buffer.setPointer(n, 3152);
    },
    get vsnprintf():VoidPointer{
        return buffer.getPointer(3160);
    },
    set vsnprintf(n:VoidPointer){
        buffer.setPointer(n, 3160);
    },
    get JsHasException():VoidPointer{
        return buffer.getPointer(3168);
    },
    set JsHasException(n:VoidPointer){
        buffer.setPointer(n, 3168);
    },
    get JsCreateTypeError():VoidPointer{
        return buffer.getPointer(3176);
    },
    set JsCreateTypeError(n:VoidPointer){
        buffer.setPointer(n, 3176);
    },
    get JsGetValueType():VoidPointer{
        return buffer.getPointer(3184);
    },
    set JsGetValueType(n:VoidPointer){
        buffer.setPointer(n, 3184);
    },
    get JsStringToPointer():VoidPointer{
        return buffer.getPointer(3192);
    },
    set JsStringToPointer(n:VoidPointer){
        buffer.setPointer(n, 3192);
    },
    get JsGetArrayBufferStorage():VoidPointer{
        return buffer.getPointer(3200);
    },
    set JsGetArrayBufferStorage(n:VoidPointer){
        buffer.setPointer(n, 3200);
    },
    get JsGetTypedArrayStorage():VoidPointer{
        return buffer.getPointer(3208);
    },
    set JsGetTypedArrayStorage(n:VoidPointer){
        buffer.setPointer(n, 3208);
    },
    get JsGetDataViewStorage():VoidPointer{
        return buffer.getPointer(3216);
    },
    set JsGetDataViewStorage(n:VoidPointer){
        buffer.setPointer(n, 3216);
    },
    get JsConstructObject():VoidPointer{
        return buffer.getPointer(3224);
    },
    set JsConstructObject(n:VoidPointer){
        buffer.setPointer(n, 3224);
    },
    get js_null():VoidPointer{
        return buffer.getPointer(3232);
    },
    set js_null(n:VoidPointer){
        buffer.setPointer(n, 3232);
    },
    get js_true():VoidPointer{
        return buffer.getPointer(3240);
    },
    set js_true(n:VoidPointer){
        buffer.setPointer(n, 3240);
    },
    get nodeThreadId():number{
        return buffer.getInt32(3248);
    },
    set nodeThreadId(n:number){
        buffer.setInt32(n, 3248);
    },
    get JsGetAndClearException():VoidPointer{
        return buffer.getPointer(3256);
    },
    set JsGetAndClearException(n:VoidPointer){
        buffer.setPointer(n, 3256);
    },
    get runtimeErrorFire():VoidPointer{
        return buffer.getPointer(3264);
    },
    set runtimeErrorFire(n:VoidPointer){
        buffer.setPointer(n, 3264);
    },
    get runtimeErrorRaise():VoidPointer{
        return buffer.getPointer(3272);
    },
    set runtimeErrorRaise(n:VoidPointer){
        buffer.setPointer(n, 3272);
    },
    get RtlCaptureContext():VoidPointer{
        return buffer.getPointer(3280);
    },
    set RtlCaptureContext(n:VoidPointer){
        buffer.setPointer(n, 3280);
    },
    get memset():VoidPointer{
        return buffer.getPointer(3288);
    },
    set memset(n:VoidPointer){
        buffer.setPointer(n, 3288);
    },
    get printf():VoidPointer{
        return buffer.getPointer(3296);
    },
    set printf(n:VoidPointer){
        buffer.setPointer(n, 3296);
    },
    get Sleep():VoidPointer{
        return buffer.getPointer(3304);
    },
    set Sleep(n:VoidPointer){
        buffer.setPointer(n, 3304);
    },
    get makefunc_getout():NativePointer{
        return buffer.add(0);
    },
    get strlen():NativePointer{
        return buffer.add(19);
    },
    get makeError():NativePointer{
        return buffer.add(39);
    },
    get getout_jserror():NativePointer{
        return buffer.add(117);
    },
    get getout_invalid_parameter():NativePointer{
        return buffer.add(168);
    },
    get getout_invalid_parameter_count():NativePointer{
        return buffer.add(241);
    },
    get getout():NativePointer{
        return buffer.add(295);
    },
    get raise_runtime_error():NativePointer{
        return buffer.add(1638);
    },
    get str_js2np():NativePointer{
        return buffer.add(479);
    },
    get buffer_to_pointer():NativePointer{
        return buffer.add(608);
    },
    get utf16_js2np():NativePointer{
        return buffer.add(836);
    },
    get str_np2js():NativePointer{
        return buffer.add(945);
    },
    get utf16_np2js():NativePointer{
        return buffer.add(989);
    },
    get pointer_np2js_nullable():NativePointer{
        return buffer.add(1054);
    },
    get pointer_np2js():NativePointer{
        return buffer.add(1067);
    },
    get pointer_js_new():NativePointer{
        return buffer.add(1162);
    },
    get bin64():NativePointer{
        return buffer.add(1259);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(3312);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 3312);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1389);
    },
    get logHook():NativePointer{
        return buffer.add(1408);
    },
    get runtime_error():NativePointer{
        return buffer.add(1620);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1715);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(3320);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 3320);
    },
    get ServerInstance_ctor_hook():NativePointer{
        return buffer.add(1723);
    },
    get debugBreak():NativePointer{
        return buffer.add(1731);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(3328);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 3328);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1733);
    },
    get commandQueue():VoidPointer{
        return buffer.getPointer(3336);
    },
    set commandQueue(n:VoidPointer){
        buffer.setPointer(n, 3336);
    },
    get MultiThreadQueueTryDequeue():VoidPointer{
        return buffer.getPointer(3344);
    },
    set MultiThreadQueueTryDequeue(n:VoidPointer){
        buffer.setPointer(n, 3344);
    },
    get ConsoleInputReader_getLine_hook():NativePointer{
        return buffer.add(1751);
    },
    get gameThreadInner():VoidPointer{
        return buffer.getPointer(3360);
    },
    set gameThreadInner(n:VoidPointer){
        buffer.setPointer(n, 3360);
    },
    get free():VoidPointer{
        return buffer.getPointer(3368);
    },
    set free(n:VoidPointer){
        buffer.setPointer(n, 3368);
    },
    get SetEvent():VoidPointer{
        return buffer.getPointer(3376);
    },
    set SetEvent(n:VoidPointer){
        buffer.setPointer(n, 3376);
    },
    get evWaitGameThreadEnd():VoidPointer{
        return buffer.getPointer(3384);
    },
    set evWaitGameThreadEnd(n:VoidPointer){
        buffer.setPointer(n, 3384);
    },
    get WaitForSingleObject():VoidPointer{
        return buffer.getPointer(3392);
    },
    set WaitForSingleObject(n:VoidPointer){
        buffer.setPointer(n, 3392);
    },
    get _Cnd_do_broadcast_at_thread_exit():VoidPointer{
        return buffer.getPointer(3400);
    },
    set _Cnd_do_broadcast_at_thread_exit(n:VoidPointer){
        buffer.setPointer(n, 3400);
    },
    get gameThreadHook():NativePointer{
        return buffer.add(1800);
    },
    get bedrock_server_exe_args():VoidPointer{
        return buffer.getPointer(3408);
    },
    set bedrock_server_exe_args(n:VoidPointer){
        buffer.setPointer(n, 3408);
    },
    get bedrock_server_exe_argc():number{
        return buffer.getInt32(3416);
    },
    set bedrock_server_exe_argc(n:number){
        buffer.setInt32(n, 3416);
    },
    get bedrock_server_exe_main():VoidPointer{
        return buffer.getPointer(3424);
    },
    set bedrock_server_exe_main(n:VoidPointer){
        buffer.setPointer(n, 3424);
    },
    get finishCallback():VoidPointer{
        return buffer.getPointer(3432);
    },
    set finishCallback(n:VoidPointer){
        buffer.setPointer(n, 3432);
    },
    get wrapped_main():NativePointer{
        return buffer.add(1857);
    },
    get cgateNodeLoop():VoidPointer{
        return buffer.getPointer(3440);
    },
    set cgateNodeLoop(n:VoidPointer){
        buffer.setPointer(n, 3440);
    },
    get updateEvTargetFire():VoidPointer{
        return buffer.getPointer(3448);
    },
    set updateEvTargetFire(n:VoidPointer){
        buffer.setPointer(n, 3448);
    },
    get updateWithSleep():NativePointer{
        return buffer.add(1900);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(3456);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 3456);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1925);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(3464);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 3464);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1955);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(3472);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 3472);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1979);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(3480);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 3480);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2002);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(3488);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 3488);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2043);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(3496);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 3496);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2078);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(3504);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 3504);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2114);
    },
    get getLineProcessTask():VoidPointer{
        return buffer.getPointer(3512);
    },
    set getLineProcessTask(n:VoidPointer){
        buffer.setPointer(n, 3512);
    },
    get uv_async_alloc():VoidPointer{
        return buffer.getPointer(3520);
    },
    set uv_async_alloc(n:VoidPointer){
        buffer.setPointer(n, 3520);
    },
    get std_cin():VoidPointer{
        return buffer.getPointer(3528);
    },
    set std_cin(n:VoidPointer){
        buffer.setPointer(n, 3528);
    },
    get std_getline():VoidPointer{
        return buffer.getPointer(3536);
    },
    set std_getline(n:VoidPointer){
        buffer.setPointer(n, 3536);
    },
    get uv_async_post():VoidPointer{
        return buffer.getPointer(3544);
    },
    set uv_async_post(n:VoidPointer){
        buffer.setPointer(n, 3544);
    },
    get std_string_ctor():VoidPointer{
        return buffer.getPointer(3552);
    },
    set std_string_ctor(n:VoidPointer){
        buffer.setPointer(n, 3552);
    },
    get getline():NativePointer{
        return buffer.add(2153);
    },
};
