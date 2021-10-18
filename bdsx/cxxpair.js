"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CxxPair = void 0;
const common_1 = require("./common");
const keycombine_1 = require("./keycombine");
const nativeclass_1 = require("./nativeclass");
const singleton_1 = require("./singleton");
const templatename_1 = require("./templatename");
const util_1 = require("./util");
function setFirstWithClass(v) {
    const cls = this.first;
    cls.destruct();
    cls.construct(v);
}
function setSecondWithClass(v) {
    const cls = this.second;
    cls.destruct();
    cls.construct(v);
}
function setFirstWithPrimitive(v) {
    this.first = v;
}
function setSecondWithPrimitive(v) {
    this.second = v;
}
/**
 * std::pair
 */
class CxxPair extends nativeclass_1.NativeClass {
    static make(firstType, secondType) {
        const key = (0, keycombine_1.combineObjectKey)(firstType, secondType);
        return singleton_1.Singleton.newInstance(CxxPair, key, () => {
            class CxxPairImpl extends CxxPair {
                setFirst(first) {
                    (0, common_1.abstract)();
                }
                setSecond(second) {
                    (0, common_1.abstract)();
                }
            }
            CxxPairImpl.firstType = firstType;
            CxxPairImpl.secondType = secondType;
            CxxPairImpl.prototype.setFirst = (0, util_1.isBaseOf)(firstType, nativeclass_1.NativeClass) ? setFirstWithClass : setFirstWithPrimitive;
            CxxPairImpl.prototype.setSecond = (0, util_1.isBaseOf)(secondType, nativeclass_1.NativeClass) ? setSecondWithClass : setSecondWithPrimitive;
            Object.defineProperty(CxxPairImpl, 'name', { value: getPairName(firstType, secondType) });
            CxxPairImpl.prototype.firstType = firstType;
            CxxPairImpl.prototype.secondType = secondType;
            CxxPairImpl.define({ first: firstType, second: secondType });
            return CxxPairImpl;
        });
    }
}
exports.CxxPair = CxxPair;
function getPairName(type1, type2) {
    return (0, templatename_1.templateName)('std::pair', type1.name, type2.name);
}
//# sourceMappingURL=cxxpair.js.map