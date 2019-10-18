
import fs = require('fs');

class Properties
{
}

export function loadProperties(path:string):{[key:string]:string}
{
    const out:{[key:string]:string} = {};
    const prop = fs.readFileSync(path, 'utf-8');

    for (let line of prop.split(/\r?\n/g))
    {
        line = line.split('#', 1)[0].trim();
        if (!line) continue;

        const start = line.indexOf('=');
        if (start === -1) continue;
        const name = line.substr(0, start).trimRight();
        const value = line.substr(start + 1).trimLeft();
        out[name] = value;
    }
    return out;
}
export function saveProperties(path:string, values:{[key:string]:string}):void
{
    let out = '';
    for (const p in values)
    {
        const v = values[p];
        out += p;
    }
    fs.writeFileSync(path, '', 'utf-8');
}