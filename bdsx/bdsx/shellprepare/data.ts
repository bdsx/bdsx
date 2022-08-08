
import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../config';

export const shellPrepareData = {
    path:path.join(Config.BDS_PATH, 'bdsx_shell_data.ini'),
    load():Record<string, string> {
        const data:Record<string, string> = Object.create(null);
        try {
            const lines = fs.readFileSync(shellPrepareData.path, 'utf8');
            let matched:RegExpExecArray|null;
            const matcher = /^[ \t]*([^\s=]+)[ \t]*=[ \t]*([^\s]+)[ \t]*$/gm;
            while ((matched = matcher.exec(lines)) !== null) {
                data[matched[1]] = matched[2];
            }
        } catch(err) {
        }
        return data;
    },
    save(data:Record<string, string>):void{
        let out = '';
        for (const name in data) {
            out += name;
            out += '=';
            out += data[name];
            out += '\n';
        }
        fs.writeFileSync(shellPrepareData.path, out, 'utf8');
    },
    clear():void {
        try { fs.unlinkSync(shellPrepareData.path); } catch (err) {}
    },
};
