//@ts-check
/**
 * @deprecated
 */
"use strict";

const { bedrockServer } = require("./launcher");

exports.serverControl = {
    stop() {
        bedrockServer.stop();
    }
};
