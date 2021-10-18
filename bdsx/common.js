"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notImplemented = exports.unreachable = exports.abstract = exports.emptyFunc = exports.Encoding = exports.CANCEL = void 0;
const colors = require("colors");
if (global.bdsx != null) {
    console.error(colors.red('[BDSX] multiple imported'));
    console.error(colors.red('First Import: ' + global.bdsx));
    console.error(colors.red('Dupplicated: ' + __dirname));
}
global.bdsx = __dirname;
require("./polyfill");
exports.CANCEL = { toString() { return 'CANCEL'; } };
var Encoding;
(function (Encoding) {
    Encoding[Encoding["Utf16"] = -2] = "Utf16";
    Encoding[Encoding["Buffer"] = -1] = "Buffer";
    Encoding[Encoding["Utf8"] = 0] = "Utf8";
    Encoding[Encoding["None"] = 1] = "None";
    Encoding[Encoding["Ansi"] = 2] = "Ansi";
})(Encoding = exports.Encoding || (exports.Encoding = {}));
function emptyFunc() {
    // empty
}
exports.emptyFunc = emptyFunc;
function abstract() {
    throw Error('abstract');
}
exports.abstract = abstract;
function unreachable() {
    throw Error('unreachable');
}
exports.unreachable = unreachable;
function notImplemented() {
    throw Error('not implemented');
}
exports.notImplemented = notImplemented;
//# sourceMappingURL=common.js.map