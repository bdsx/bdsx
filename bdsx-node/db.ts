
import native = require('./native');
import Super = native.MariaDB;

export class MariaDB extends native.MariaDB
{
    private worker:Promise<any> = Promise.resolve();

    constructor(host?:string, username?:string, password?:string, db?:string, port?:number)
    {
        super(host, username, password, db, port);
    }

    transaction<T>(func:()=>Promise<T>):Promise<T>
    {
        const ret = this.worker.then(()=>{
            this.ready();
        }).then(func);
        this.worker = ret.then(()=>{
            this.commit();
        }, ()=>{
            this.rollback();
        });
        return ret;
    }

    execute(query:string):Promise<string[][]|null>
    {
        return this.transaction(async()=>{
            Super.prototype.query.apply(this, query);
            const out:string[][] = [];

            let res:string[]|null;
            while (res = await this.fetch())
            {
                out.push(res);
            }
            this.closeResult();
            return res;
        });
    }

    query(query:string):Promise<number>
    {
        return new Promise((resolve, reject)=>{
            Super.prototype.query.apply(this, (error:string, fieldCount:number)=>{
                if (error) reject(Error(error));
                else resolve(fieldCount);
            });
        });
    }

    fetch():Promise<string[]|null>
    {
        return new Promise(resolve=>{
            Super.prototype.fetch.apply(this, (row:string[]|null)=>{
                resolve(row);
            });
        });
    }
}
