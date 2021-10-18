"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateName = void 0;
function templateName(name, ...templateParams) {
    let idx = templateParams.length;
    if (idx === 0)
        return name + '<>';
    idx--;
    if (templateParams[idx].endsWith('>'))
        templateParams[idx] += ' ';
    return name + '<' + templateParams.join(',') + '>';
}
exports.templateName = templateName;
//# sourceMappingURL=templatename.js.map