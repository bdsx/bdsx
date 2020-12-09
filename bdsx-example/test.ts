
import { netevent, PacketId, NetworkIdentifier, fs, command, serverControl, Actor, MariaDB, chat, CANCEL, bin, native } from "bdsx";
import { close } from "bdsx/netevent";

async function testWithModule(
    moduleName:string, 
    cb:(module:any)=>Promise<void>,
    ...skipprefix:string[]):Promise<void>
{
    console.log(`[test] ${moduleName} module`);
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
                    console.log(`[test] ${moduleName}: skipped`);
                    return;
                }
            }
            if (err && msg.startsWith('Cannot find module'))
            {
                console.log(`[test] ${moduleName}: skipped`);
            }
            else
            {
                console.error(`[test] ${moduleName}: failed`);
                console.error(err.stack || msg);
            }
        }
        else
        {
            console.error(`[test] ${moduleName}: failed`);
            console.error(err);
        }
    }
}

(async()=>{
    await new Promise(resolve=>setTimeout(resolve, 10)); // run after examples
    console.log('[test] JS Engine: '+process['jsEngine']);
    console.log(`[test] node: ${process.versions.node}`);
    console.log(`[test] chakracore: ${process.versions.chakracore}`);
    console.log('[test] begin');

    console.log('[test] nextick');
    let nextTickPassed = false;
    nextTickPassed = await Promise.race([
        new Promise<boolean>(resolve=>process.nextTick(()=>resolve(true))),
        new Promise<boolean>(resolve=>setTimeout(()=>{ 
            if (nextTickPassed) return;
            console.error(Error('[test] nexttick failed // I will fix it later').stack);
            resolve(false);
        }, 1000))
    ]);

    console.log('[test] net hook');
    let idcheck = 0;
    for (let i=0;i<255;i++)
    {
        netevent.raw(i).on((ptr, size, ni, packetId)=>{
            idcheck = packetId;
            console.assert(packetId === ptr.readUint8(), '[test] different packetId in buffer');
        });
        netevent.after(i).on((ptr, ni, packetId)=>{
            console.assert(packetId === idcheck, '[test] different packetId');
        });
        netevent.before(i).on((ptr, ni, packetId)=>{
            console.assert(packetId === idcheck, '[test] different packetId');
        });
    }
    

    const conns = new Set<NetworkIdentifier>();
    netevent.after(PacketId.Login).on((ptr, ni)=>{
        console.assert(!conns.has(ni), '[test] logined without connected');
        conns.add(ni);
    });
    close.on(ni=>{
        console.assert(conns.delete(ni), '[test] disconnected without connected');
    });

    console.log('[test] bin');
    // bin
    {
        console.assert(bin.fromNumber(1) === bin.ONE, '[test] bin.fromNumber(1) failed');
        console.assert(bin.fromNumber(0) === bin.ZERO, '[test] bin.fromNumber(0) failed');
        console.assert(bin.fromNumber(-1) === bin.ZERO, '[test] bin.fromNumber(-1) failed');
        const small = bin.fromNumber(0x100);
        console.assert(small === '\u0100', '[test] bin.fromNumber(0x100) failed');
        const big = bin.fromNumber(0x10002);
        console.assert(big === '\u0002\u0001', '[test] bin.fromNumber(0x10002) failed');
        console.assert(bin.sub(big, small) === '\uff02', '[test] bin.sub() failed');
        const big2 = bin.add(big, bin.add(big, small));
        console.assert(big2 === '\u0104\u0002', '[test] bin.add() failed');
        const bigbig = bin.add(bin.add(bin.muln(big2, 0x100000000), small), bin.ONE);
        console.assert(bigbig === '\u0101\u0000\u0104\u0002', '[test] bin.muln() failed');
        const dived = bin.divn(bigbig, 2);
        console.assert(dived[0] === '\u0080\u0000\u0082\u0001', '[test] bin.divn() failed');
        console.assert(dived[1] === 1, '[test] bin.divn() failed');
        console.assert(bin.toString(dived[0],16) === '1008200000080', '[test] bin.toString() failed');
        
        try
        {
            const ptr = native.malloc(10);
            try
            {
                const bignum = bin.fromNumber(123456789012345);
                ptr.clone().writeVarBin(bignum);
                console.assert(ptr.clone().readVarBin() === bignum, '[test] writevarbin / readvarbin failed');
            }
            finally
            {
                native.free(ptr);
            }
        }
        catch (err)
        {
            console.error(err.stack);
        }
    }

    // deprecated!! but for testing
    console.log('[test] bdsx fs');
    const fileiopath = __dirname+'\\test.txt';
    try
    {
        await fs.writeFile(fileiopath, 'test');
    }
    catch (err)
    {
        console.error(`[test] ${fileiopath}: File writing failed: ${err.message}`);
        console.error('[test] Is permission granted?');
    }
    try
    {
        console.assert(await fs.readFile(fileiopath) === 'test', 'file reading failed');
    }
    catch (err)
    {
        console.error(`[test] ${fileiopath}: File reading failed`);
        console.error(err.stack);
    }
    try
    {
        console.assert(fs.deleteFileSync(fileiopath), '[test] file deleting failed');
    }
    catch (err)
    {
        console.error(`[test] ${fileiopath}: File deleting failed`);
        console.error(err.stack);
    }
	
	console.log('[test] command hook');
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
    
    console.log('[test] bdsx mariadb');
    try
    {
        const mariadb = new MariaDB('localhost', 'test', '1234', 'test');
        await mariadb.execute('create table test(a int)');
        await mariadb.execute('insert into test values(1)');
        const v = await mariadb.execute('select * from test');
        await mariadb.execute('drop table test');
        console.assert(v[0][0] === '1', '[test] bdsx mariadb: select 1 failed');
    }
    catch (err)
    {
        const msg = (err.message)+'';
        if (msg.startsWith("Can't connect to MySQL server on ") || 
            msg.startsWith('Access denied for user '))
        {
            console.log("[test] bdsx mariadb: skipped");
        }
        else
        {
            console.error(`[test] bdsx mariadb: failed`);
            console.error(err.stack);
        }
    }

    // npm module check
    if (nextTickPassed)
    {
        await testWithModule('mariadb', async(db)=>{ // needs mariadb@2.3.x
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
    }
    
    await testWithModule('discord.js', async (Discord)=>{ // needs discord.js@11.x
        const client = new Discord.Client();
        let token:string;
        try
        {
            token = await fs.readFile(__dirname+'\\discord.bot.token.txt');
        }
        catch (err)
        {
            console.log('[test] discord.js: no token for testing, skipped');
            return;
        }
        await new Promise((resolve, reject)=>{
            client.on('ready', () => {
                if (client.user.tag === '루아ai#8755') resolve();
                else reject(Error('[test] who are you?'));
                client.destroy();
            });
            client.login(token);
        });
    });

    // native.forceRuntimeError();
    console.log('[test] done');
    
})().catch(console.error);


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


