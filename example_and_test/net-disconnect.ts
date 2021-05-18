
// Network Hooking: disconnected
import { events } from "bdsx/event";
import { connectionList } from "./net-login";

events.networkDisconnected.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});
