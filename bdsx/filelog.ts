
import fs = require('fs');
import path = require('path');
import { anyToString } from './util';

export class FileLog {

    private readonly path:string;
    private appending = '';
    private flushing = false;

    constructor(filepath:string) {
        this.path = path.resolve(filepath);
    }

    private _flush():void {
        fs.appendFile(this.path, this.appending, ()=>{
            if (this.appending !== '') {
                this._flush();
            } else {
                this.flushing = false;
            }
        });
        this.appending = '';
    }

    log(...message:any[]):void {
        this.appending += message.map(anyToString).join(' ');
        if (!this.flushing) {
            this.flushing = true;
            this._flush();
        }
    }
}
