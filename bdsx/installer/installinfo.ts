import * as fs from 'fs';
import { sep } from "path";
import { fsutil } from "../fsutil";

export class InstallInfo {
    public path:string;
    bdsVersion?:string|null;
    bdsxCoreVersion?:string|null;
    pdbcacheVersion?:string|null;
    files?:string[];

    constructor(bdsPath:string) {
        this.path = `${bdsPath}${sep}installinfo.json`;
    }

    toJSON():unknown {
        return {
            bdsVersion: this.bdsVersion,
            bdsxCoreVersion: this.bdsxCoreVersion,
            pdbcacheVersion: this.pdbcacheVersion,
            files: this.files,
        };
    }

    private _fromJSON(data:any):void {
        if (data == null) {
            delete this.bdsVersion;
            delete this.bdsxCoreVersion;
            delete this.pdbcacheVersion;
            delete this.files;
        } else {
            this.bdsVersion = data.bdsVersion;
            this.bdsxCoreVersion = data.bdsxCoreVersion;
            this.pdbcacheVersion = data.pdbcacheVersion;
            this.files = data.files;
        }
    }

    async load():Promise<void> {
        try {
            const file = await fsutil.readFile(this.path);
            const installInfo = JSON.parse(file);
            this._fromJSON(installInfo);
        } catch (err) {
            this._fromJSON(null);
            if (err.code !== 'ENOENT') throw err;
        }
    }

    save():Promise<void> {
        return fsutil.writeJson(this.path, this.toJSON());
    }

    loadSync():void {
        try {
            const file = fs.readFileSync(this.path, 'utf8');
            const installInfo = JSON.parse(file);
            this._fromJSON(installInfo);
        } catch (err) {
            this._fromJSON(null);
            if (err.code !== 'ENOENT') throw err;
        }
    }

    saveSync():void {
        fsutil.writeJsonSync(this.path, this.toJSON());
    }
}
