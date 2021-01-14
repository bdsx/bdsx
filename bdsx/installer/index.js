//@ts-check
"use strict";

// compile and run ts

const ts = require('typescript');
const fs = require('fs');
const path = require('path');

/**
 * @param {string} fileName 
 */
function comileAndRun(fileName)
{
  const mpath = fileName.substr(0, fileName.lastIndexOf('.'));
  const jsfile = mpath+'.js';
  try
  {
    const src = fs.statSync(fileName);
    const dest = fs.statSync(jsfile);
    if (dest.mtimeMs > src.mtimeMs)
    {
      return require(mpath);
    }
  }
  catch (err)
  {
  }

  const source = fs.readFileSync(fileName, 'utf-8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2015,
      lib: ['ES2015'],
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      alwaysStrict: true,
      downlevelIteration: true,
      sourceMap: true
    },
      fileName: path.basename(fileName)
    });
    
  fs.writeFileSync(jsfile, output.outputText, 'utf-8');
  if (output.sourceMapText) fs.writeFileSync(jsfile+'.map', output.sourceMapText, 'utf-8');
  return require(mpath);
}

try
{
  comileAndRun(path.join(__dirname, 'installer.ts'));
}
catch (err)
{
  console.error(err.stack);
}
  
