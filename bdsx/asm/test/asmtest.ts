
import fs = require('fs');
import path = require('path');

import { install } from '../../source-map-support';

import { asm } from "../../assembler";
import '../../codealloc';
import { chakraUtil } from '../../core';
import { Tester } from '../../tester';
install();


Tester.test({
    asmtest() {
        const filepath = path.join(__dirname, 'asmtest.asm');
        const code = asm().compile(fs.readFileSync(filepath, 'utf8'), null, filepath);
        const codebuf = code.allocs();
        this.assert(codebuf.retvalue != null, 'retvalue not found');
        this.assert(codebuf.retvalue2 != null, 'retvalue not found');
        codebuf.retvalue.setPointer(chakraUtil.asJsValueRef(123));
        codebuf.retvalue2.setPointer(chakraUtil.asJsValueRef(456));
        codebuf.testfn2.setPointer(codebuf.testfn);

        const testfn = chakraUtil.JsCreateFunction(codebuf.test, null);
        const result = testfn();
        this.assert(result === 123, 'unexpected result');
    }
});
