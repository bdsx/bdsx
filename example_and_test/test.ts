
import { netevent, PacketId, NetworkIdentifier, command, serverControl, Actor, chat, bin, NativePointer, CANCEL } from "bdsx";
import { capi } from "bdsx/capi";
import { HashSet } from "bdsx/hashset";
import { bin64_t } from "bdsx/nativetype";
import { close } from "bdsx/netevent";
import { PseudoRandom } from "bdsx/pseudorandom";
import { remapError, remapStack, remapStackLine } from "bdsx/source-map-support";
import fs = require('fs');
import colors = require('colors');
import { dll } from "bdsx/dll";

class Tester
{
    subject = '';
    errored = false;
    constructor()
    {
    }

    log(message:string):void
    {
        console.log(`[test/${this.subject}] ${message}`);
    }
    
    error(message:string, stackidx = 2):void
    {
        console.error(colors.red(`[test/${this.subject}] failed. ${message}`));
        const stack = Error().stack!;
        console.error(colors.red(remapStackLine(stack.split('\n')[stackidx]).stackLine));
        this.errored = true;
    }

    fail():void
    {
        this.error('failed', 3);
    }

    assert(cond:boolean, message:string):void
    {
        if (!cond) this.error(message, 3);
    }

    async module(
        moduleName:string, 
        cb:(module:any)=>Promise<void>,
        ...skipprefix:string[]):Promise<void>
    {
        this.subject = moduleName;
        try
        {
            await cb(require(moduleName));
        }
        catch (err)
        {
            if (err && err.message)
            {
                const msg = err.message+'';
                for (const [prefix, cb] of skipprefix)
                {
                    if (msg.startsWith(prefix))
                    {
                        this.log('skipped');
                        return;
                    }
                }
                if (msg.startsWith('Cannot find module'))
                {
                    this.log('skipped');
                }
                else
                {
                    console.error(colors.red(`[test/${moduleName}] failed`));
                    console.error(colors.red(remapStack(err.stack) || msg));
                    this.errored = true;
                }
            }
            else
            {
                console.error(colors.red(`[test/${moduleName}] failed`));
                console.error(err);
                this.errored = true;
            }
        }
    }
    
    async process(tests:Record<string, (this:Tester)=>Promise<void>|void>):Promise<void>
    {
        await new Promise(resolve=>setTimeout(resolve, 10)); // run after examples
    
        console.log(`[test] node: ${process.versions.node}`);
        console.log('[test] engine: '+process.jsEngine+'@'+process.versions[process.jsEngine!]);
        console.log('[test] begin');
    
        let passed = 0;
        let testnum = 1;
        const testlist = Object.entries(tests);        
        for (const [subject, test] of testlist)
        {
            try
            {
                console.log(`[test] (${testnum++}/${testlist.length}) ${subject}`);
                this.subject = subject;
                this.errored = false;
                await test.call(this);
                if (!this.errored) passed++;
            }
            catch (err)
            {
                console.error(remapError(err));
            }
        }
        if (passed !== testlist.length)
        {
            console.error(colors.red(`[test] FAILED (${passed}/${testlist.length})`));
        }
        else
        {
            console.log(`[test] PASSED (${passed}/${testlist.length})`);
        }
    }
}

let nextTickPassed = false;
const test = new Tester;
test.process({
    async nexttick() {
        nextTickPassed = await Promise.race([
            new Promise<boolean>(resolve=>process.nextTick(()=>resolve(true))),
            new Promise<boolean>(resolve=>setTimeout(()=>{ 
                if (nextTickPassed) return;
                this.fail();
                resolve(false);
            }, 1000))
        ]);
    },

    // jslib
    bin(){
        this.assert(bin.make64(1, 0) === bin64_t.one, '[test] bin.make64(1, 0) failed');
        this.assert(bin.make64(0, 0) === bin64_t.zero, '[test] bin.make64(0, 0) failed');
        this.assert(bin.make64(-1, -1) === bin64_t.minus_one, '[test] bin.make64(-1, -1) failed');
        const small = bin.make64(0x100, 0);
        this.assert(small === '\u0100\0\0\0', '[test] bin.make64(0x100, 0) failed');
        const big = bin.make64(0x10002, 0);
        this.assert(big === '\u0002\u0001\0\0', '[test] bin.make64(0x10002, 0) failed');
        this.assert(bin.sub(big, small) === '\uff02\0\0\0', '[test] bin.sub() failed');
        const big2 = bin.add(big, bin.add(big, small));
        this.assert(big2 === '\u0104\u0002\0\0', '[test] bin.add() failed');
        const bigbig = bin.add(bin.add(bin.muln(big2, 0x100000000), small), bin64_t.one);
        this.assert(bigbig === '\u0101\u0000\u0104\u0002', '[test] bin.muln() failed');
        const dived = bin.divn(bigbig, 2);
        this.assert(dived[0] === '\u0080\u0000\u0082\u0001', '[test] bin.divn() failed');
        this.assert(dived[1] === 1, '[test] bin.divn() failed');
        this.assert(bin.toString(dived[0],16) === '1008200000080', '[test] bin.toString() failed');
        
        const ptr = capi.malloc(10);
        try
        {
            const bignum = bin.make(123456789012345, 4);
            new NativePointer(ptr).writeVarBin(bignum);
            console.assert(new NativePointer(ptr).readVarBin() === bignum, '[test] writevarbin / readvarbin failed');
        }
        finally
        {
            capi.free(ptr);
        }
    },
    hashset(){
        class HashItem
        {
            constructor(public readonly value:number)
            {
            }
        
            hash():number
            {
                return this.value;
            }
        
            equals(other:HashItem):boolean
            {
                return this.value === other.value;
            }
        }

        const TEST_COUNT = 200;

        const values:number[] = [];
        const n = new PseudoRandom(12345);
        const hashset = new HashSet<HashItem>();
        let count = 0;
        for (const v of hashset.entires())
        {
            count ++;
        }
        if (count !== 0) this.error(`empty hashset is not empty`);
        for (let i=0;i<TEST_COUNT;)
        {
            const v = n.rand() % 100;
            values.push(v);
            hashset.add(new HashItem(v));
            
            i++;
        }
        
        for (const v of values)
        {
            if (!hashset.has(new HashItem(v)))
            {
                this.error(`hashset.has failed, item not found ${v}`);
                continue;
            }
            if (!hashset.delete(new HashItem(v)))
            {
                this.error(`hashset.delete failed ${v}`);
                continue;
            }
        }
        if (hashset.size !== 0)
        {
            this.error(`cleared hashset is not cleared: ${hashset.size}`);
        }
        for (let i=0;i<200;i++)
        {
            const v = n.rand() % 100;
            if (hashset.has(new HashItem(v)))
            {
                this.error('hashset.has failed, found on empty');
            }
        }      
        
    },

    // nativelib
    memset():void
    {
        const dest = new Uint8Array(12);
        const ptr = new NativePointer;
        ptr.setAddressFromBuffer(dest);
        dll.vcruntime140.memset(ptr, 1, 12);
        for (const v of dest)
        {
            this.assert(v === 1, 'wrong value: '+v);
        }
    },

    // hooking lib
    nethook(){
        let idcheck = 0;
        let sendpacket = 0;
        for (let i=0;i<255;i++)
        {
            netevent.raw(i).on((ptr, size, ni, packetId)=>{
                idcheck = packetId;
                this.assert(packetId === ptr.readUint8(), '[test] different packetId in buffer');
            });
            netevent.after(i).on((ptr, ni, packetId)=>{
                this.assert(packetId === idcheck, '[test] different packetId');
            });
            netevent.before(i).on((ptr, ni, packetId)=>{
                this.assert(packetId === idcheck, '[test] different packetId');
            });
            netevent.send(i).on((ptr, ni, packetId)=>{
                this.assert(packetId === idcheck, '[test] different packetId');
                sendpacket++;
            });
        }
        
    
        const conns = new Set<NetworkIdentifier>();
        netevent.after(PacketId.Login).on((ptr, ni)=>{
            this.assert(!conns.has(ni), '[test] logined without connected');
            conns.add(ni);
            setTimeout(()=>{
                if (sendpacket === 0)
                {
                    this.error('[test] no send packet');
                }
            }, 1000);
        });
        close.on(ni=>{
            console.assert(conns.delete(ni), '[test] disconnected without connected');
        });
    },
    commandHook(){
        command.hook.on((cmd, origin)=>{
            console.log({cmd, origin});
            if (cmd === '/test')
            {
                console.log('> tested');
                return 0;
            }
        });
        command.net.on((ev)=>{
            console.log('[test] cmd/net: '+ev.command);
        });
    },

    // modules
    mariadb(){
        return this.module('mariadb', async(db)=>{ // needs mariadb@2.3.x
            const pool = db.createPool({user:'test', password:'1234', database: 'test', acquireTimeout: 1000, connectTimeout: 1000});
            try
            {
                const conn = await pool.getConnection();
                try
                {
                    await conn.query('create table test(a int)');
                    await conn.query('insert into test values(1)');
                    const v = await conn.query('select * from test');
                    await conn.query('drop table test');
                    console.assert(v[0].a === 1, '[test] mariadb: select 1 failed');
                }
                finally
                {
                    conn.end();
                }
            }
            finally
            {
                pool.end();
            }
        }, '(conn=-1, no: 45012, SQLState: 08S01) Connection timeout: failed to create socket after ');
    },
    
    discord_js(){
        return this.module('discord.js', async (Discord)=>{ // needs discord.js@11.x
            const client = new Discord.Client();
            let token:string;
            try
            {
                token = await new Promise((resolve, reject)=>
                    fs.readFile(__dirname+'\\discord.bot.token.txt', 'utf-8', (err, data)=>err ? reject(err) : resolve(data)));
            }
            catch (err)
            {
                this.log('no token for testing, skipped');
                return;
            }
            await new Promise<void>((resolve, reject)=>{
                client.on('ready', () => {
                    if (client.user.tag === '루아ai#8755') resolve();
                    else reject(Error('who are you?'));
                    client.destroy();
                });
                client.login(token);
            });
        });
    },
});

let connectedNi:NetworkIdentifier;

chat.on(ev=>{
    if (ev.message == "test")
    {
        console.assert(connectedNi === ev.networkIdentifier, 'the network identifier does not matched');
        console.log('> tested and stopping...');
        setTimeout(()=>serverControl.stop(), 5000);
        return CANCEL;
    }
});

netevent.raw(PacketId.Login).on((ptr, size, ni)=>{
    connectedNi = ni;
});

const system = server.registerSystem(0, 0);
system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated, ev => {
    try
    {
        const uniqueId = ev.data.entity.__unique_id__;
        const actor2 = Actor.fromUniqueId(uniqueId["64bit_low"], uniqueId["64bit_high"]);
        const actor = Actor.fromEntity(ev.data.entity);
        console.assert(actor === actor2, 'Actor.fromEntity is not matched');
    
        if (actor !== null)
        {
            const actualId = actor.getUniqueIdLow()+':'+actor.getUniqueIdHigh();
            const expectedId = uniqueId["64bit_low"]+':'+uniqueId["64bit_high"];
            console.assert(actualId === expectedId, 
                `Actor uniqueId is not matched (actual=${actualId}, expected=${expectedId})`);
            
            if (ev.__identifier__ === 'minecraft:player')
            {
                console.assert(actor.getTypeId() == 0x13f, 'player type is not matched');
                console.assert(actor.isPlayer(), 'a player is not the player');
                console.assert(connectedNi === actor.getNetworkIdentifier(), 'the network identifier does not matched');
            }
            else
            {
                console.assert(!actor.isPlayer(), `a not player is the player(identifier:${ev.__identifier__})`);
            }
        }
    }
    catch (err)
    {
        console.error(err.stack);
    }
});

