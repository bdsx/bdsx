import { netevent, PacketId, NetworkIdentifier, fs, command, serverControl, Actor, MariaDB } from "bdsx";
import { close } from "bdsx/netevent";

(async()=>{
    console.log('running user: '+ require("os").userInfo().username);

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
        console.error(`${fileiopath}: File reading failed: ${err.message}`);
    }
    try
    {
        console.assert(fs.deleteFileSync(fileiopath), 'file deleting failed');
    }
    catch (err)
    {
        console.error(`${fileiopath}: File deleting failed: ${err.message}`);
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
        const mariadb = new MariaDB('localhost', 'test', '1234');
        const v = await mariadb.execute('select 1');
        console.assert(v[0][0] === '1', 'mariadb: select 1 failed');
    }
    catch (err)
    {
        console.log(`MariaDB test failed: ${err.message}`);
    }
    
})().catch(console.error);

const system = server.registerSystem(0, 0);
system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated, ev => {
    const uniqueId = ev.data.entity.__unique_id__;
    const actor2 = Actor.fromUniqueId(uniqueId["64bit_low"], uniqueId["64bit_high"]);
    const actor = Actor.fromEntity(ev.data.entity);
    console.assert(actor === actor2, 'Actor.fromEntity is not matched');
    console.assert(actor.getUniqueIdLow() === uniqueId["64bit_low"] && actor.getUniqueIdHigh() === uniqueId["64bit_high"], 'Actor uniqueId is not matched');
    if (ev.__identifier__ === 'minecraft:player')
    {
        console.assert(actor.getTypeId() == 0x13f, 'player type is not matched');
    }
});