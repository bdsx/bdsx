
import fs = require('fs');
import path = require('path');
import { inspect } from 'util';
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
        this.appending += message.map(x => inspect(x)).join(' ');
        if (!this.flushing) {
            this.flushing = true;
            this._flush();
        }
    }
}
