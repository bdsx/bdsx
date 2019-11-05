/// <reference types="minecraft-scripting-types-server" />


// Console Output
console.log("From Script> Hello, World!");


// Addon Script
const system = server.registerSystem(0, 0);
system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated, ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);
});


// File IO
import { fs } from "bdsx";
console.log("Current Working Directory: " + fs.cwd());
fs.writeFile("output.txt", "This file is writed by script!");


// File IO: Append
import { NativeFile } from "bdsx";
const file = new NativeFile("output2.txt", NativeFile.WRITE, NativeFile.OPEN_ALWAYS);
file.writeUtf8(-1, `${new Date}> Server Started\n`, () => { });
file.close();


// Network Hooking: Get login IP and XUID
import { nethook, PacketId } from "bdsx";
const connectionList = new Map<string, string>();
nethook.setOnPacketAfterListener(PacketId.Login, (ptr, networkIdentifier, packetId, loginInfo) => {
    // networkIdentifier has non-printable character, It will breaks standard output
    console.log(`${loginInfo.id}> IP=${loginInfo.ip}, XUID=${loginInfo.xuid}`);
    connectionList.set(networkIdentifier, loginInfo.id);
})


// Network Hooking: Print all packets
for (let i = 2; i <= 136; i++) {
    if (i === PacketId.ClientCacheBlobStatus) continue; // too loud
    if (i === PacketId.NetworkStackLatencyPacket) continue; // too loud
    nethook.setOnPacketReadListener(i, (ptr, networkIdentifier, packetId) => {
        console.log(PacketId[packetId]);
    });
}


// Network Hooking: disconnected
nethook.setOnConnectionClosedListener(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});


// Global error listener
import { setOnErrorListener } from "bdsx";
setOnErrorListener(err => {
    console.log('ERRMSG Example> '+ err.message);
    // return false; // Suppress default error output
});
console.log(eval("undefined_identifier")); // Error example
