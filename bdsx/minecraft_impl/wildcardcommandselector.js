"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
minecraft_1.WildcardCommandSelector.setExtends(minecraft_1.CommandSelectorBase);
minecraft_1.WildcardCommandSelector.make(minecraft_1.Actor).prototype[nativetype_1.NativeType.ctor] = function () {
    minecraft_1.CommandSelectorBase.prototype.constructWith.call(this, false);
};
//# sourceMappingURL=wildcardcommandselector.js.map