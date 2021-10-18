"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minecraft_1 = require("../minecraft");
minecraft_1.Item.prototype.getCommandName = function () {
    const names = this.getCommandNames();
    const name = names[0];
    if (name == null)
        throw Error(`item has not any names`);
    return name.name;
};
//# sourceMappingURL=item.js.map