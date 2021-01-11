
import native = require('./native');

class SqlError extends Error
{
    constructor(message:string, public readonly errno:number)
    {
        super(message);
    }
}
declare global
{
    // Redeclaration for under es2015
    interface Promise<T>
    {
        finally(onfinally?: (() => void) | undefined | null): Promise<T>
    }
}

if (!Promise.prototype.finally)
{
	Promise.prototype.finally = function<T>(this:Promise<T>, onfinally?: (() => void) | undefined | null) {
        async function voiding(value:any):Promise<any> {
            if (!onfinally) return;
            onfinally();
            return value;
        }
		return this.then(voiding, voiding);
    };
}

/**
 * @deprecated use node.js instead
 */
export class MariaDBTransaction
{
    constructor(private readonly db:native.MariaDB)
    {
    }


    query(query:string):Promise<number>
    {
        return new Promise((resolve, reject)=>{
            this.db.query(query, (error:string, fieldCount:number)=>{
                if (error) reject(Error(error));
                else resolve(fieldCount);
            });
        });
    }

    fetch():Promise<(string|null)[]|null>
    {
        return new Promise(resolve=>{
            this.db.fetch((row:(string|null)[]|null)=>{
                resolve(row);
            });
        });
    }

}

/**
 * @deprecated use node.js instead
 */
export class MariaDB
{
    private worker:Promise<any>;
    private acEnabled:boolean = true;
    private readonly db:native.MariaDB;
    private readonly tran:MariaDBTransaction;

    constructor(host?:string, username?:string, password?:string, db?:string, port?:number)
    {
        var resolve:()=>void;
        var reject:(err:Error)=>void;
        this.worker = new Promise<void>((_resolve, _reject)=>{
            resolve = _resolve;
            reject = _reject;
        });
        this.db = new native.MariaDB((error, errno)=>{
            if (error)
            {
                reject(new SqlError(error, errno!));
            }
            else
            {
                resolve();
            }
        }, host, username, password, db, port);
        this.tran = new MariaDBTransaction(this.db);
    }

    get [Symbol.toStringTag]():string
    {
        return 'MariaDB';
    }

    private _autocommit(enabled:boolean)
    {
        if (this.acEnabled === enabled) return;
        this.acEnabled = enabled;
        this.db.autocommit(enabled);
    }

    transaction<T>(func:(tran:MariaDBTransaction)=>Promise<T>):Promise<T>
    {
        const ret = this.worker.then(()=>{
            this._autocommit(false);
        }).then(()=>func(this.tran));
        this.worker = ret.then(()=>{
            this.db.commit();
        }, ()=>{
            this.db.rollback();
        });
        return ret;
    }

    query(query:string, suppressError?:boolean):void
    {
        this.worker.then(()=>{
            this._autocommit(true);
            this.db.query(query, !suppressError);
        });
    }
    execute(query:string):Promise<(string|null)[][]>
    {
        return this.transaction(async()=>{
            this.db.query(query);
            const out:(string|null)[][] = [];

            let res:(string|null)[]|null;
            while (res = await this.tran.fetch())
            {
                out.push(res);
            }
            this.db.closeResult();
            return out;
        });
    }
}
