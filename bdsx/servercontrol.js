"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverControl = void 0;
const launcher_1 = require("./launcher");
exports.serverControl = {
    stop() {
        launcher_1.bedrockServer.stop();
    }
};
//# sourceMappingURL=servercontrol.js.map