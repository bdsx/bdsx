import { netevent, PacketId, NetworkIdentifier, fs, command, serverControl, Actor, MariaDB, chat, CANCEL, bin, native } from "bdsx";
import { close } from "bdsx/netevent";

async function testWithModule<T>(
    name:string, 
    module:Promise<T>, 
    cb:(module:T)=>Promise<void>,
    ...skipprefix:string[]):Promise<void>
{
    try
    {
        await cb(await module);
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
                    console.log(`${name}: skipped`);
                    return;
                }
            }
            if (err && msg.startsWith('Cannot find module'))
            {
                console.log(`${name}: skipped`);
            }
            else
            {
                console.error(`${name}: failed`);
                console.error(err.stack || msg);
            }
        }
        else
        {
            console.error(`${name}: failed`);
            console.error(err);
        }
    }
}

(async()=>{
    console.log('JS Engine: '+process['jsEngine']);
    for (const p in process.versions)
    {
        console.log(`${p}: ${process.versions[p]}`);
    }

    console.log('testing...');

    const nextTickPassed = await Promise.race([
        new Promise<boolean>(resolve=>process.nextTick(()=>resolve(true))),
        new Promise<boolean>(resolve=>setTimeout(()=>{ 
            console.error(Error('nexttick failed // I will fix it later').stack);
            resolve(false);
        }, 1000))
    ]);

    let idcheck = 0;
    for (let i=0;i<255;i++)
    {
        netevent.raw(i).on((ptr, size, ni, packetId)=>{
            idcheck = packetId;
        });
        netevent.after(i).on((ptr, ni, packetId)=>{
            console.assert(packetId === idcheck, 'different packetId');
        });
        netevent.before(i).on((ptr, ni, packetId)=>{
            console.assert(packetId === idcheck, 'different packetId');
        });
    }
    
    const conns = new Set<NetworkIdentifier>();
    netevent.after(PacketId.Login).on((ptr, ni)=>{
        console.assert(!conns.has(ni), 'logined without connected');
        conns.add(ni);
    });
    close.on(ni=>{
        console.assert(conns.delete(ni), 'disconnected without connected');
    });

    // bin
    {
        console.assert(bin.fromNumber(1) === bin.ONE, 'bin.fromNumber(1) failed');
        console.assert(bin.fromNumber(0) === bin.ZERO, 'bin.fromNumber(0) failed');
        console.assert(bin.fromNumber(-1) === bin.ZERO, 'bin.fromNumber(-1) failed');
        const small = bin.fromNumber(0x100);
        console.assert(small === '\u0100', 'bin.fromNumber(0x100) failed');
        const big = bin.fromNumber(0x10002);
        console.assert(big === '\u0002\u0001', 'bin.fromNumber(0x10002) failed');
        console.assert(bin.sub(big, small) === '\uff02', 'bin.sub() failed');
        const big2 = bin.add(big, bin.add(big, small));
        console.assert(big2 === '\u0104\u0002', 'bin.add() failed');
        const bigbig = bin.add(bin.add(bin.muln(big2, 0x100000000), small), bin.ONE);
        console.assert(bigbig === '\u0101\u0000\u0104\u0002', 'bin.muln() failed');
        const dived = bin.divn(bigbig, 2);
        console.assert(dived[0] === '\u0080\u0000\u0082\u0001', 'bin.divn() failed');
        console.assert(dived[1] === 1, 'bin.divn() failed');
        console.assert(bin.toString(dived[0],16) === '1008200000080', 'bin.toString() failed');
    }

    // deprecated!! but for testing

    const fileiopath = __dirname+'\\test.txt';
    try
    {
        await fs.writeFile(fileiopath, 'test');
    }
    catch (err)
    {
        console.error(`${fileiopath}: File writing failed: ${err.message}`);
        console.error('Is permission granted?');
    }
    try
    {
        console.assert(await fs.readFile(fileiopath) === 'test', 'file reading failed');
    }
    catch (err)
    {
        console.error(`${fileiopath}: File reading failed`);
        console.error(err.stack);
    }
    try
    {
        console.assert(fs.deleteFileSync(fileiopath), 'file deleting failed');
    }
    catch (err)
    {
        console.error(`${fileiopath}: File deleting failed`);
        console.error(err.stack);
    }
	
	
	command.hook.on((cmd, origin)=>{
        console.log({cmd, origin});
        if (cmd === 'test')
        {
            serverControl.stop();
        }
	});

	command.net.on((ev)=>{
	    console.log('net: '+ev.command);
    });
    
    try
    {
        const mariadb = new MariaDB('localhost', 'test', '1234', 'test');
        await mariadb.execute('create table test(a int)');
        await mariadb.execute('insert into test values(1)');
        const v = await mariadb.execute('select * from test');
        await mariadb.execute('drop table test');
        console.assert(v[0][0] === '1', 'mariadb: select 1 failed');
    }
    catch (err)
    {
        const msg = (err.message)+'';
        if (msg.startsWith("Can't connect to MySQL server on ") || 
            msg.startsWith('Access denied for user '))
        {
            console.log("bdsx's mariadb: skipped");
        }
        else
        {
            console.error(`bdsx's mariadb: failed`);
            console.error(err.stack);
        }
    }

    // npm module check
    if (nextTickPassed)
    {
        await testWithModule("npm's mariadb", import('mariadb'), async(db)=>{
            const pool = db.createPool({user:'test', password:'1234', database: 'test', acquireTimeout: 1000, connectTimeout: 1000});
            const conn = await pool.getConnection();
            await conn.query('create table test(a int)');
            await conn.query('insert into test values(1)');
            const v = await conn.query('select * from test');
            await conn.query('drop table test');
            console.assert(v[0][0] === '1', 'mariadb: select 1 failed');
        }, '(conn=-1, no: 45012, SQLState: 08S01) Connection timeout: failed to create socket after ');
    }
    
    await testWithModule('discord.js', import('discord.js'), async(DiscordJS)=>{
        // empty
    });


    try
    {

        const ptr = native.malloc(10);
        try
        {
            const bignum = bin.fromNumber(123456789012345);
            ptr.clone().writeVarBin(bignum);
            console.assert(ptr.clone().readVarBin() === bignum, 'writevarbin / readvarbin failed');
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
    console.log('test: done.');
    
})().catch(console.error);


let connectedNi:NetworkIdentifier;

chat.on(ev=>{
    if (ev.message == "test")
    {
        console.assert(connectedNi === ev.networkIdentifier, 'the network identifier does not matched');
        console.log('tested');
        return CANCEL;
    }
});
command.hook.on((command)=>{
    console.log(command);
    if (command === '/test')
    {
        console.log('tested');
        return 0;
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
                console.assert(!actor.isPlayer(), 'a not player is the player');
            }
        }
    }
    catch (err)
    {
        console.error(err.stack);
    }
});


