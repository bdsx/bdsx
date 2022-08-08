import { AnyFunction } from "./common";

export class FunctionGen {
    private readonly importNames:string[] = [];
    private readonly imports:unknown[] = [];
    private out = '';

    import(name:string, value:unknown):void {
        this.importNames.push(name);
        this.imports.push(value);
    }

    writeln(line:string):void {
        this.out += line;
        this.out += '\n';
    }

    generate(...parameters:string[]):AnyFunction {
        return (new Function('$imp', `"use strict";
const [${this.importNames.join(',')}]=$imp;
return function(${parameters.join(',')}){
${this.out}};
`))(this.imports);
    }
}
