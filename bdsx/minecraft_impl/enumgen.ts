

import fs = require('fs');
import path = require('path');
import { tsw } from '../pdbparser/tswriter';

const properties = {
    proto:new tsw.NameProperty('__proto__')
};
const names = {
    minecraft: new tsw.Name('minecraft')
};
const js = new tsw.Block;
js.write(new tsw.ImportDirect(names.minecraft, '../minecraft'));
const dts = new tsw.Block;
const mcmodule = new tsw.Module(new tsw.Constant('../minecraft'));
dts.declare(mcmodule);
const enumsDir = path.join(__dirname, 'enums_ini');
const readExp = /^[ \t]*([^\s]*)[ \t]*=[ \t]*([^\s]*)[ \t]*(?:[#;][^\r\n]*)?$/gm;
const firstIsNumber = /^[0-9]/;
for (const filename of fs.readdirSync(enumsDir)) {
    if (!filename.endsWith('.ini')) continue;
    const nsList = filename.split('.');
    nsList.pop();
    const n = nsList.length-1;
    let parent = js;
    for (let i=0;i<n;i++) {
        const ns = new tsw.Namespace(new tsw.Name(nsList[i]));
        parent.write(ns);
        parent = ns.block;
    }

    const items:[string, tsw.Value?][] = [];
    const content = fs.readFileSync(path.join(enumsDir, filename), 'utf8');
    readExp.lastIndex = 0;
    let matched:RegExpExecArray|null;
    while ((matched = readExp.exec(content)) != null) {
        const [line, name, value] = matched;
        try {
            if (value === '') {
                items.push([name]);
            } else if (firstIsNumber.test(value)) {
                items.push([name, new tsw.Constant(+value)]);
            } else {
                items.push([name, new tsw.Constant(JSON.parse(value))]);
            }
        } catch (err) {
            console.error(`${line}: ${err.message}`);
        }
    }

    const tempvar = js.makeTemporalVariableName();
    parent.write(new tsw.Enum(tempvar, items));
    parent.assign(tempvar.member(properties.proto), tsw.Constant.null);
    parent.assign(tsw.dots(names.minecraft, ...nsList), tempvar);

    const enumName = nsList[n];
    mcmodule.block.write(new tsw.Enum(new tsw.Name(enumName), items));
}

try {
    dts.export(new tsw.ObjectUnpack([]));
    dts.save(path.join(__dirname, 'enums.d.ts'));
    js.cloneToJS().save(path.join(__dirname, 'enums.js'));
} catch (err) {
    console.error(err.stack);
}
