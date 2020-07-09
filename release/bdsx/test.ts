import { netevent, PacketId, NetworkIdentifier, fs, command, serverControl, Actor, MariaDB } from "bdsx";
import { close } from "bdsx/netevent";

(async()=>{

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
    try
    {
        await fs.writeFile(__dirname+'/test.txt', 'test');
        console.assert(await fs.readFile(__dirname+'./test.txt') === 'test', 'file reading failed');
        console.assert(fs.deleteFileSync(__dirname+'./test.txt'), 'file deleting failed');
    }
    catch (err)
    {
        console.error('File IO test failed: '+err.message);
        console.error('Is permission granted?');
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