"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzer = void 0;
const core_1 = require("./core");
let analyzeMap;
let symbols = null;
var analyzer;
(function (analyzer) {
    function loadMap() {
        if (analyzeMap)
            return;
        analyzeMap = new Map();
        if (symbols === null) {
            symbols = core_1.pdb.getAll();
            symbols.__proto__ = null;
        }
        for (const name in symbols) {
            analyzeMap.set(symbols[name] + '', name);
        }
    }
    analyzer.loadMap = loadMap;
    function analyze(ptr, count = 32) {
        const nptr = ptr.add();
        loadMap();
        console.log(`[analyze: ${nptr}]`);
        try {
            for (let i = 0; i < count; i++) {
                let offset = (i * 8).toString(16);
                offset = '0'.repeat(Math.max(3 - offset.length, 0)) + offset;
                const addr = nptr.readPointer();
                const addrstr = addr + '';
                const addrname = analyzeMap.get(addrstr);
                if (addrname != null) {
                    console.log(`${offset}: ${addrname}(${addrstr})`);
                    continue;
                }
                try {
                    const addr2 = addr.getPointer();
                    const addr2str = addr2 + '';
                    const addr2name = analyzeMap.get(addr2str);
                    if (addr2name != null) {
                        console.log(`${offset}: ${addrstr}: ${addr2name}(${addr2str})`);
                    }
                    else {
                        console.log(`${offset}: ${addrstr}: ${addr2str}`);
                    }
                }
                catch (err) {
                    const nums = [];
                    for (let i = 0; i < addrstr.length; i += 2) {
                        nums.push(parseInt(addrstr.substr(i, 2), 16));
                    }
                    if (nums.every(n => n < 0x7f)) {
                        nums.reverse();
                        const text = String.fromCharCode(...nums.map(n => n < 0x20 ? 0x20 : n));
                        console.log(`${offset}: ${addrstr} ${text}`);
                    }
                    else {
                        console.log(`${offset}: ${addrstr}`);
                    }
                }
            }
        }
        catch (err) {
            console.log('[VA]');
        }
    }
    analyzer.analyze = analyze;
})(analyzer = exports.analyzer || (exports.analyzer = {}));
//# sourceMappingURL=analyzer.js.map