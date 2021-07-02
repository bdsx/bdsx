import { cgate, VoidPointer, NativePointer } from 'bdsx/core';
const buffer = cgate.allocExecutableMemory(3560, 8);
buffer.setBin('\u8b48\u7867\u8348\ufee4\u5d59\u485e\u4f89\u5f78\uc031\u48c3\u418d\u48ff\uc083\u0f01\u10b6\u8548\u75d2\u48f4\uc829\u48c3\uec81\u0088\u0000\u8d4c\u1104\u8d4c\u244c\u0f20\u01b6\u4166\u0189\u8348\u01c1\u8349\u02c1\u394c\u75c1\u48ec\u4c8d\u2024\u8d4c\u2444\uff18\u2857\u8b48\u244c\u4818\u548d\u1024\u15ff\u0c00\u0000\u8b48\u2444\u4810\uc481\u0088\u0000\u48c3\uec83\u4828\u4c89\u2024\u57ff\u48c8\u478b\u4878\ue083\u7401\u480d\u4c8b\u2024\u57ff\ue870\uff68\uffff\u8b48\u244c\uff20\u1d15\u000c\u4800\uc483\uc328\u8348\u48ec\uc985\u8f0f\u000e\u0000\u8d48\u070d\u0008\ue800\uff53\uffff\u1aeb\u8949\u48c8\u158d\u0810\u0000\u8d48\u244c\uff20\u7115\u000b\u4800\u4c8d\u2024\u8948\ue8c2\uff43\uffff\u8948\ue8c1\uff89\uffff\u8348\u48c4\u48c3\uec83\u4968\uc989\u8949\u48d0\u158d\u07f2\u0000\u8d48\u244c\uff20\u3b15\u000b\u4800\u4c8d\u2024\u8948\ue8c2\uff0d\uffff\u8948\ue8c1\uff53\uffff\u8348\u68c4\u48c3\uec83\u4848\uf981\u0003\u0001\u840f\u0033\u0000\u8948\u244c\u4828\u478b\u4878\ue083\u0f01\u4684\u0000\u4800\u4c8d\u2024\u15ff\u0b0a\u0000\uc085\u5475\ub60f\u2444\u8520\u74c0\uff4b\uc857\u95e8\ufffe\uffff\uaf15\u000a\u4800\u0539\u0b38\u0000\u0a74\u01b9\u0000\ue8e0\u04e3\u0000\u8d48\u9a15\u0007\uff00\u4f15\u000b\u4800\u4c8d\u2024\u15ff\u0b1c\u0000\uc085\u0e75\u57ff\u48c8\u4c8b\u2024\u15ff\u0b12\u0000\u8b4c\u2444\u4828\u158d\u0781\u0000\u8d48\u244c\uff20\u8315\u000a\u4800\u4c8d\u2024\u8948\ue8c2\ufe55\uffff\u8948\ue8c1\ufe9b\uffff\u8348\u48c4\u48c3\uec83\u4c28\u4c89\u4824\u894c\u2444\u4840\u5489\u3824\u8948\u244c\u4830\u548d\u1024\u15ff\u0a6e\u0000\uc085\u850f\u004a\u0000\u448b\u1024\u8348\u01e8\u840f\u0043\u0000\u8348\u02e8\u850f\u0032\u0000\u8d4c\u2444\u4820\u548d\u1824\u8b48\u244c\uff30\u4115\u000a\u8500\u0fc0\u1585\u0000\u4c00\u448b\u4824\u8b48\u244c\u4818\u548b\u2024\u54ff\u4024\u07eb\u8b48\u244c\uff38\u4817\uc483\uc328\u8348\u38ec\u8948\u2454\u4848\u4c89\u4024\u8d48\u2454\uff10\uf715\u0009\u8500\u0fc0\u3685\u0000\u8b00\u2444\u4810\ue883\u0f01\u2f84\u0000\u4800\ue883\u0f04\u2984\u0000\u4800\ue883\u0f05\u3284\u0000\u4800\ue883\u0f01\u4884\u0000\u4800\ue883\u0f01\u6684\u0000\u4800\u4c8b\u3824\u17ff\uc031\u7deb\u8b48\u244c\uff40\ud857\u8548\u74c0\u48e8\u408b\ueb10\u4c6a\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u0996\u0000\uc085\uc975\u8b48\u2444\ueb10\u4c4a\u4c8d\u3024\u894c\u244c\u4d20\uc889\u8d48\u2454\u4828\u4c8b\u4024\u15ff\u0976\u0000\uc085\ua175\u8b48\u2444\ueb28\u4c22\u448d\u1824\u8d48\u2454\u4810\u4c8b\u4024\u15ff\u095e\u0000\uc085\u850f\uff7d\uffff\u8b48\u2444\u4810\uc483\uc338\u8348\u28ec\u8948\u2454\u4838\u4c89\u3024\u8d48\u2454\uff10\u1315\u0009\u8500\u0fc0\u4085\u0000\u8b00\u2444\u4810\ue883\u0f01\u2e84\u0000\u4800\ue883\u0f02\u2885\u0000\u4c00\u448d\u2024\u8d48\u2454\u4818\u4c8b\u3024\u15ff\u08e6\u0000\uc085\u850f\u000b\u0000\u8b48\u2444\ueb18\u310b\uebc0\u4807\u4c8b\u3824\u17ff\u8348\u28c4\u48c3\uec83\u4828\u5489\u3824\u8d48\u2454\u4110\uff41\u85d0\u0fc0\u0785\u0000\u4800\u448b\u1024\u07eb\u8b48\u244c\uff38\u4817\uc483\uc328\u8348\u28ec\u8948\u2454\u4838\uca89\ub70f\u4802\uc283\u8502\u75c0\u48f5\uca29\uc148\u02ea\u8d4c\u2444\uff18\u2857\uc085\u840f\u0007\u0000\u8b48\u2444\ueb18\u4807\u4c8b\u3824\u17ff\u8348\u28c4\u48c3\ud285\u0875\u8b48\u7505\u0008\uc300\u8348\u38ec\u8948\u2454\u4c48\u4c8d\u2024\uc749\u01c0\u0000\u4800\u548d\u2824\u8b48\u5305\u0008\u4800\u0289\u15ff\u0842\u0000\uc085\u850f\u0021\u0000\u8b48\u244c\uff20\ud857\u8548\u0fc0\u1084\u0000\u4800\u4c8b\u4824\u8948\u1048\u8b48\u2444\ueb20\u8907\ue8c1\ufca1\uffff\u8348\u38c4\u48c3\uec83\u4838\u5489\u4824\u8949\u49d1\uc0c7\u0002\u0000\u8d48\u2454\u4828\u058b\u07f6\u0000\u8948\u4802\u058b\u07f4\u0000\u8948\u0842\u15ff\u07da\u0000\uc085\u850f\u001a\u0000\u8b48\u2444\u4848\u088b\u57ff\u48d8\uc085\u840f\u0006\u0000\u8b48\u1040\u07eb\uc189\u40e8\ufffc\u48ff\uc483\uc338\u8348\u28ec\u8948\u2454\u4c38\u448d\u2024\u8d48\u2454\uff18\u7315\u0007\u8500\u0fc0\u5585\u0000\u4c00\u448b\u2024\u854d\u74c0\u4852\u4c8b\u1824\u8d4d\u4804\u0f48\u01bf\u8348\u02c1\u394c\u74c1\u483c\ubf0f\u4811\ue2c1\u4810\ud009\u8348\u02c1\u394c\u74c1\u4828\ubf0f\u4811\ue2c1\u4820\ud009\u8348\u02c1\u394c\u74c1\u4814\ubf0f\u4811\ue2c1\u4830\ud009\u07eb\u8b48\u244c\uff38\u4817\uc483\uc328\u8b4c\u2841\u8d48\u3051\u8b48\u2049\u25ff\u06a8\u0000\u53c3\u8348\u20ec\u4c89\u3024\u8948\u2454\u4c38\u4489\u4024\u894c\u244c\u4c48\u4c8d\u4024\u8949\u31d0\u89d2\uffd1\uad15\u0006\u4800\uc085\u880f\u0060\u0000\u8948\u48c3\u508d\u4811\u0d8d\uffac\uffff\u15ff\u0670\u0000\u8b48\u244c\u4830\u4889\u4820\u5889\u4c28\u4c8d\u4024\u8b4c\u2444\u4838\u538d\u4801\u488d\u4830\uc389\u15ff\u0668\u0000\u15ff\u062a\u0000\u8948\u39d9\ub105\u0006\u0f00\u0785\u0000\ue800\uff64\uffff\u43eb\u15ff\u062e\u0000\u3beb\uc748\u20c2\u0000\u4800\u0d8d\uff4c\uffff\u15ff\u0610\u0000\u8b48\u2454\u4830\u5089\u4820\u40c7\u0f28\u0000\u4800\u0d8d\u030d\u0000\u8b48\u4811\u5089\u4830\u518b\u4808\u5089\u4838\uc483\u5b20\u48c3\u018b\u3881\u0003\u8000\u0674\u25ff\u0662\u0000\u48c3\uec81\u0588\u0000\u8d48\u2454\u8918\u480a\u8a8d\u0098\u0000\u8948\u2454\u4808\u4c89\u1024\u15ff\u0644\u0000\u8d4c\u2504\u0090\u0000\ud231\u8d48\u244c\uff20\u3715\u0006\u4800\u4c8d\u0824\u15ff\u061c\u0000\u8148\u88c4\u0005\uc300\u0db9\u0000\uebc0\uc3ac\u8948\u350d\u0006\uc300\uc3cc\u8348\u28ec\u894c\uffc1\u2d15\u0006\u4800\uc483\uc328\u8b48\u290d\u0006\uff00\u2b25\u0006\uc300\u8348\u28ec\u8b48\u270d\u0006\uff00\u2915\u0006\u4800\u0d8b\u063a\u0000\u15ff\u062c\u0000\u8348\u28c4\u48c3\uec83\u4828\ucb89\u8948\u010d\u0006\u4800\u0d8d\uffc8\uffff\u15ff\u05cc\u0000\u8b48\u0d0d\u0006\u4800\uc2c7\uffff\uffff\u15ff\u0608\u0000\u8348\u28c4\u25ff\u0606\u0000\u8348\u28ec\u0d8b\u060c\u0000\u8b48\ufd15\u0005\u4500\uc031\u15ff\u0604\u0000\u8348\u28c4\u8b48\u010d\u0006\uff00\u8325\u0005\u4800\uec83\u4828\u4c8b\u5024\u15ff\u05f4\u0000\u8348\u28c4\u25ff\u05f2\u0000\u8348\u08ec\u15ff\u0490\u0000\u8348\u08c4\u3948\u1505\u0005\u7500\uff06\udd25\u0005\uc300\u8348\u08ec\u15ff\u05da\u0000\u8948\u48c1\ue9c1\u3120\u48c8\uc483\uc308\u8348\u28ec\u8948\u89e9\u4df2\uf089\u15ff\u05c2\u0000\u8348\u28c4\u48c3\uec83\u4828\u018b\u8d4c\uc085\u0000\u4800\u558d\uffa0\u2050\u8948\u48c1\uea89\u8941\ufff0\ua115\u0005\u4800\uc483\uc328\u8349\u7ff8\u0975\u8b48\u2444\uc628\u0000\u48c3\u5c89\u1024\u5655\u4157\u4154\u4155\uff56\u8125\u0005\u4800\uec83\u4828\u018b\u8d4c\u784d\u8949\u4cf0\uf289\u50ff\u4808\ue989\uf289\u15ff\u056a\u0000\u8348\u28c4\u48c3\uec83\u4d28\uf889\u8948\u4cda\uf189\u15ff\u055a\u0000\u8b49\u4907\u968d\u0220\u0000\u894c\u48f9\uc483\uff28\u1860\u5653\u8348\u18ec\u8948\u48cb\u0d8b\u053e\u0000\u8d48\u2514\u0028\u0000\u15ff\u0538\u0000\u8948\u4058\u8948\u48c6\u4e8d\uff20\u4715\u0005\u4800\u0d8b\u0528\u0000\u8948\u49c2\uc0c7\u000a\u0000\u15ff\u0520\u0000\u8948\ufff1\u1f15\u0005\ueb00\u48b8\uc483\u5e18\uc35b\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u7420\u6968\u0073\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u7461\u2520\u0064\u6e49\u6176\u696c\u2064\u6170\u6172\u656d\u6574\u2072\u6f63\u6e75\u2074\u6528\u7078\u6365\u6574\u3d64\u6425\u202c\u6361\u7574\u6c61\u253d\u2964\u4a00\u2053\u6f43\u746e\u7865\u2074\u6f6e\u2074\u6f66\u6e75\u0a64\u4a00\u4573\u7272\u726f\u6f43\u6564\u203a\u7830\u7825\u5b00\u6f66\u6d72\u7461\u6620\u6961\u656c\u5d64\u0100\u0000\u0100\u0000\u0100\u0207\u0700\u1101\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0082\u0100\u0104\u0400\u00c2\u0100\u0104\u0400\u0082\u0100\u0207\u0700\ub101\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0062\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0000\u0100\u0104\u0400\u0062\u0100\u0104\u0400\u0062\u0100\u0104\u0400\u0042\u0100\u0000\u0100\u0205\u0100\u0530\u0132\u0000\u0100\u0000\u0100\u0000\u0100\u0000\u0100\u0104\u0400\u0042\u0100\u0000\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0002\u0100\u0104\u0400\u0002\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0000\u0100\u0104\u0400\u0042\u0100\u0104\u0400\u0042\u0100\u0306\u0100\u0230\u0660\u0022\u0000\u0000\u1300\u0000\u5d00\u0009\u1300\u0000\u2700\u0000\u6100\u0009\u2700\u0000\u7500\u0000\u6500\u0009\u7500\u0000\ua800\u0000\u6d00\u0009\ua800\u0000\uf100\u0000\u7500\u0009\uf100\u0000\u2700\u0001\u7d00\u0009\u2700\u0001\u6700\u0006\u8500\u0009\u6700\u0006\udf00\u0001\u8d00\u0009\udf00\u0001\u6000\u0002\u9500\u0009\u6000\u0002\u4400\u0003\u9d00\u0009\u4400\u0003\ub100\u0003\ua500\u0009\ub100\u0003\ude00\u0003\uad00\u0009\ude00\u0003\u1f00\u0004\ub500\u0009\u1f00\u0004\u2c00\u0004\ubd00\u0009\u2c00\u0004\u8b00\u0004\uc100\u0009\u8b00\u0004\uec00\u0004\uc900\u0009\uec00\u0004\u6e00\u0005\ud100\u0009\u6e00\u0005\u8100\u0005\ud900\u0009\u8100\u0005\u5500\u0006\udd00\u0009\u5500\u0006\ub400\u0006\ue500\u0009\ub400\u0006\ubc00\u0006\ue900\u0009\ubc00\u0006\uc400\u0006\ued00\u0009\uc400\u0006\uc600\u0006\uf100\u0009\uc600\u0006\ud800\u0006\uf500\u0009\ud800\u0006\ue600\u0006\ufd00\u0009\ue600\u0006\u0900\u0007\u0100\u000a\u0900\u0007\u4200\u0007\u0900\u000a\u4200\u0007\u6d00\u0007\u1100\u000a\u6d00\u0007\u8600\u0007\u1900\u000a\u8600\u0007\ua400\u0007\u2100\u000a\ua400\u0007\ubc00\u0007\u2900\u000a\ubc00\u0007\ud300\u0007\u3100\u000a\ud300\u0007\ufc00\u0007\u3900\u000a\ufc00\u0007\u1f00\u0008\u4100\u000a\u1f00\u0008\u4300\u0008\u4500\u000a\u4300\u0008\u6a00\u0008\u4d00\u000a\u6a00\u0008\u5d00\u0009\u5500\u000a\u0000\u0000');
export const asmcode = {
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
        return buffer.add(1639);
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
        return buffer.add(990);
    },
    get pointer_np2js_nullable():NativePointer{
        return buffer.add(1055);
    },
    get pointer_np2js():NativePointer{
        return buffer.add(1068);
    },
    get pointer_js_new():NativePointer{
        return buffer.add(1163);
    },
    get bin64():NativePointer{
        return buffer.add(1260);
    },
    get uv_async_call():VoidPointer{
        return buffer.getPointer(3312);
    },
    set uv_async_call(n:VoidPointer){
        buffer.setPointer(n, 3312);
    },
    get logHookAsyncCb():NativePointer{
        return buffer.add(1390);
    },
    get logHook():NativePointer{
        return buffer.add(1409);
    },
    get runtime_error():NativePointer{
        return buffer.add(1621);
    },
    get handle_invalid_parameter():NativePointer{
        return buffer.add(1716);
    },
    get serverInstance():VoidPointer{
        return buffer.getPointer(3320);
    },
    set serverInstance(n:VoidPointer){
        buffer.setPointer(n, 3320);
    },
    get ServerInstance_ctor_hook():NativePointer{
        return buffer.add(1724);
    },
    get debugBreak():NativePointer{
        return buffer.add(1732);
    },
    get CommandOutputSenderHookCallback():VoidPointer{
        return buffer.getPointer(3328);
    },
    set CommandOutputSenderHookCallback(n:VoidPointer){
        buffer.setPointer(n, 3328);
    },
    get CommandOutputSenderHook():NativePointer{
        return buffer.add(1734);
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
        return buffer.add(1752);
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
        return buffer.add(1801);
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
        return buffer.add(1858);
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
        return buffer.add(1901);
    },
    get removeActor():VoidPointer{
        return buffer.getPointer(3456);
    },
    set removeActor(n:VoidPointer){
        buffer.setPointer(n, 3456);
    },
    get actorDestructorHook():NativePointer{
        return buffer.add(1926);
    },
    get NetworkIdentifierGetHash():VoidPointer{
        return buffer.getPointer(3464);
    },
    set NetworkIdentifierGetHash(n:VoidPointer){
        buffer.setPointer(n, 3464);
    },
    get networkIdentifierHash():NativePointer{
        return buffer.add(1956);
    },
    get onPacketRaw():VoidPointer{
        return buffer.getPointer(3472);
    },
    set onPacketRaw(n:VoidPointer){
        buffer.setPointer(n, 3472);
    },
    get packetRawHook():NativePointer{
        return buffer.add(1980);
    },
    get onPacketBefore():VoidPointer{
        return buffer.getPointer(3480);
    },
    set onPacketBefore(n:VoidPointer){
        buffer.setPointer(n, 3480);
    },
    get packetBeforeHook():NativePointer{
        return buffer.add(2003);
    },
    get PacketViolationHandlerHandleViolationAfter():VoidPointer{
        return buffer.getPointer(3488);
    },
    set PacketViolationHandlerHandleViolationAfter(n:VoidPointer){
        buffer.setPointer(n, 3488);
    },
    get packetBeforeCancelHandling():NativePointer{
        return buffer.add(2044);
    },
    get onPacketAfter():VoidPointer{
        return buffer.getPointer(3496);
    },
    set onPacketAfter(n:VoidPointer){
        buffer.setPointer(n, 3496);
    },
    get packetAfterHook():NativePointer{
        return buffer.add(2079);
    },
    get onPacketSend():VoidPointer{
        return buffer.getPointer(3504);
    },
    set onPacketSend(n:VoidPointer){
        buffer.setPointer(n, 3504);
    },
    get packetSendAllHook():NativePointer{
        return buffer.add(2115);
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
        return buffer.add(2154);
    },
};
