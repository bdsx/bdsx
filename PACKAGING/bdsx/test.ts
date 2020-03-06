import { netevent, PacketId, NetworkIdentifier, File, fs, command } from "bdsx";
import { close } from "bdsx/netevent";

(async()=>{

    const packetOrders = [1, 4, 129, 8, 8, 69, 23, 115];

    let rawi = 0;
    let afteri = 0;
    let beforei = 0;
    for (let i=0;i<255;i++)
    {
        netevent.raw(i).on((ptr, size, ni, packetId)=>{
            if (rawi >= packetOrders.length) return;
            console.assert(packetOrders[rawi++] === packetId, `order unmatch ${PacketId[packetId]}`);
        });
        netevent.after(i).on((ptr, ni, packetId)=>{
            if (afteri >= packetOrders.length) return;
            console.assert(packetOrders[afteri++] === packetId, `order unmatch ${PacketId[packetId]}`);
        });
        netevent.before(i).on((ptr, ni, packetId)=>{
            if (beforei >= packetOrders.length) return;
            console.assert(packetOrders[beforei++] === packetId, `order unmatch ${PacketId[packetId]}`);
        });
    }
    
    let conns = new Set<NetworkIdentifier>();
    netevent.after(PacketId.Login).on((ptr, ni)=>{
        console.assert(!conns.has(ni));
        conns.add(ni);
    });
    close.on(ni=>{
        console.assert(conns.delete(ni));
    });
    
    await fs.writeFile('./test.txt', 'test');
    console.assert(await fs.readFile('./test.txt') === 'test');
	

	command.hook.on((cmd, origin)=>{
	    console.log('cmd: '+cmd);
	});

	command.net.on((ev)=>{
	    console.log('net: '+ev.command);
	});
})();
