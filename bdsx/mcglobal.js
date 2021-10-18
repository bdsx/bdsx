"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcglobal = void 0;
const abstractobject_1 = require("./abstractobject");
const minecraft_1 = require("./minecraft");
const asmcode = require("./asm/asmcode");
var mcglobal;
(function (mcglobal) {
    function init() {
        const serverInstance = asmcode.serverInstance.as(minecraft_1.ServerInstance);
        Object.defineProperty(mcglobal, 'serverInstance', serverInstance);
        Object.defineProperty(mcglobal, 'networkHandler', serverInstance.networkHandler);
        const mc = serverInstance.minecraft;
        Object.defineProperty(mcglobal, 'minecraft', mc);
        Object.defineProperty(mcglobal, 'level', mc.getLevel().as(minecraft_1.ServerLevel));
        const commands = mc.getCommands();
        Object.defineProperty(mcglobal, 'commands', commands);
        Object.defineProperty(mcglobal, 'commandRegistry', commands.getRegistry());
    }
    mcglobal.init = init;
})(mcglobal = exports.mcglobal || (exports.mcglobal = {}));
abstractobject_1.createAbstractObject.setAbstractProperties(mcglobal, 'serverInstance', 'minecraft', 'level', 'commands', 'networkHandler', 'commandRegistry');
//# sourceMappingURL=mcglobal.js.map