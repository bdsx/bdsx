
import native = require('./native');
import Super = native.MariaDB;

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
    
export class MariaDB extends native.MariaDB implements Promise<void>
{
    private worker:Promise<any>;

    constructor(host?:string, username?:string, password?:string, db?:string, port?:number)
    {
        super((error, errno)=>{
            if (error)
            {
                reject(new SqlError(error, errno!));
            }
            else
            {
                resolve();
            }
        }, host, username, password, db, port);
        var resolve:()=>void;
        var reject:(err:Error)=>void;
        this.worker = new Promise((_resolve, _reject)=>{
            resolve = _resolve;
            reject = _reject;
        });
    }

    get [Symbol.toStringTag]():string
    {
        return 'MariaDB';
    }

    then<TResult1 = void, TResult2 = never>(onfulfilled?: ((value:void) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>
    {
        return this.worker.then(onfulfilled, onrejected);
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<void | TResult>
    {
        return this.worker.catch(onrejected);
    }
    
    finally(onfinally?: (() => void) | undefined | null): Promise<void>
    {
        return this.worker.finally(onfinally);
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

    execute(query:string):Promise<string[][]>
    {
        return this.transaction(async()=>{
            Super.prototype.query.call(this, query);
            const out:string[][] = [];

            let res:string[]|null;
            while (res = await this.fetch())
            {
                out.push(res);
            }
            this.closeResult();
            return out;
        });
    }

    query(query:string):Promise<number>
    {
        return new Promise((resolve, reject)=>{
            Super.prototype.query.call(this, query, (error:string, fieldCount:number)=>{
                if (error) reject(Error(error));
                else resolve(fieldCount);
            });
        });
    }

    fetch():Promise<string[]|null>
    {
        return new Promise(resolve=>{
            Super.prototype.fetch.call(this, (row:string[]|null)=>{
                resolve(row);
            });
        });
    }
}
