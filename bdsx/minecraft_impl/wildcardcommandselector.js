"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const complextype_1 = require("../complextype");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const util_1 = require("../util");
minecraft_1.WildcardCommandSelector.setExtends(minecraft_1.CommandSelectorBase);
(0, util_1.inheritMultiple)(minecraft_1.WildcardCommandSelector, complextype_1.NativeTemplateClass);
minecraft_1.WildcardCommandSelector.make(minecraft_1.Actor).prototype[nativetype_1.NativeType.ctor] = function () {
    minecraft_1.CommandSelectorBase.prototype.constructWith.call(this, false);
};
//# sourceMappingURL=wildcardcommandselector.js.map