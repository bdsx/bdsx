
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";

const name = 'BDSX-Example-Server';

let rainbowOffset = 0;
const rainbow = ['§c', '§6', '§e', '§a', '§9', '§b', '§d'];
const interval = setInterval(()=>{
    let i = rainbowOffset;
    rainbowOffset = (rainbowOffset + 1) & rainbow.length;

    const coloredName = name.replace(/./g, v=>rainbow[(i++)%rainbow.length]+v);
    bedrockServer.serverInstance.setMotd(coloredName);
}, 5000);

// without this code, bdsx does not end even after BDS closed
events.serverStop.on(()=>{
    clearInterval(interval);
});
