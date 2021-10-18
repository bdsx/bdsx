"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionGen = void 0;
class FunctionGen {
    constructor() {
        this.importNames = [];
        this.imports = [];
        this.out = '';
    }
    import(name, value) {
        this.importNames.push(name);
        this.imports.push(value);
    }
    writeln(line) {
        this.out += line;
        this.out += '\n';
    }
    generate(...parameters) {
        return (new Function('$imp', `"use strict";
const [${this.importNames.join(',')}]=$imp;
return function(${parameters.join(',')}){
${this.out}};
`))(this.imports);
    }
}
exports.FunctionGen = FunctionGen;
//# sourceMappingURL=functiongen.js.map