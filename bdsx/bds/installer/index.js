"use strict";

// compile and run installer/index.ts

const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const fileName = path.join(__dirname, 'install.ts');
const source = fs.readFileSync(fileName, 'utf-8');
const output = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2015,
    lib: ['ES2015'],
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    alwaysStrict: true,
    downlevelIteration: true
  },
    fileName
  });
try
{
  eval(output.outputText);
}
catch (err)
{
  console.error(err.stack);
}
  
