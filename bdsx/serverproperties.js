"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverProperties = void 0;
const path = require("path");
const fs = require("fs");
const fsutil_1 = require("./fsutil");
exports.serverProperties = {};
try {
    const bdsPath = fsutil_1.fsutil.projectPath + path.sep + 'bedrock_server';
    const propertyFile = bdsPath + path.sep + 'server.properties';
    const properties = fs.readFileSync(propertyFile, 'utf8');
    const matcher = /^\s*([^=#]+)\s*=\s*(.*)\s*$/mg;
    for (;;) {
        const matched = matcher.exec(properties);
        if (matched === null)
            break;
        exports.serverProperties[matched[1]] = matched[2];
    }
}
catch (err) {
    if (err.code !== 'ENOENT') {
        throw err;
    }
}
//# sourceMappingURL=serverproperties.js.map