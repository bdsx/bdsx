import { fsutil } from "../fsutil";
import * as path from 'path';

export namespace key {
    export async function getGithubToken():Promise<string|undefined> {
        let data:any;
        try {
            data = await fsutil.readFile(path.join(fsutil.projectPath, '.key/github.json'), 'utf8');
        } catch (err) {
            return undefined;
        }
        if (data == null) throw Error('token not found');
        const token = data.token;
        if (typeof token !== 'string') throw Error('token not found');
        return token;
    }
}
