
// Network Hooking: disconnected
import { NetworkIdentifier } from "bdsx";
import { connectionList } from "./net-login";

NetworkIdentifier.close.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});
