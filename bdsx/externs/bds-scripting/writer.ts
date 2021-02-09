
import fs = require('fs');

export class FileWriter {
    private readonly ws:fs.WriteStream;
    private readonly errprom:Promise<void>;
    constructor(path:string) {
        this.ws = fs.createWriteStream(path, 'utf-8');
        this.errprom = new Promise((resolve, reject)=>{
            this.ws.on('error', reject);
        });
    }

    write(data:string):Promise<void> {
        return Promise.race([
            new Promise<void>(resolve=>{
                if (!this.ws.write(data)) {
                    this.ws.once('drain', resolve);
                } else {
                    resolve();
                }
            }), this.errprom]);
    }

    end():Promise<void>{
        return Promise.race([
            new Promise<void>((resolve)=>{
                this.ws.end(resolve);
            }), this.errprom]);
    }
}
