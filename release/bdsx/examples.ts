/// <reference types="minecraft-scripting-types-server" />

// Console Output
console.log("From Script> Hello, World!");

// Addon Script
import { Actor } from "bdsx";
const system = server.registerSystem(0, 0);
system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated, ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);

    // Get extra informations from entity
    const actor = Actor.fromEntity(ev.data.entity);
    if (actor) console.log('entity dimension: ' + DimensionId[actor.getDimension()]);
    const level = actor.getAttribute(AttributeId.PlayerLevel);
    console.log('entity level: ' + level);
});

// Custom Command
import { command, serverControl } from "bdsx";
// this hooks all commands, even It will can run by command blocks
command.hook.on((command, originName)=>{
    if (command === '/close')
    {
        serverControl.stop(); // same with the stop command
        return 0;
    }
    if (command.startsWith('/>'))
    {
        try
        {
            console.log(eval(command.substr(2)));
            // run javacript
        }
        catch (err)
        {
            console.error(err.stack);
        }
        return 0;
    }
});

// Chat Listening
import { chat } from 'bdsx';
chat.on(ev => {
    ev.setMessage(ev.message.toUpperCase() + " YEY!");
});

// Network Hooking: Get login IP and XUID
import { netevent, PacketId } from "bdsx";
const connectionList = new Map<NetworkIdentifier, string>();
netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const [xuid, username] = netevent.readLoginPacket(ptr);
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
    if (username) connectionList.set(networkIdentifier, username);
});

// Network Hooking: Print all packets
const tooLoudFilter = new Set([
    PacketId.UpdateBlock,
    PacketId.ClientCacheBlobStatus, 
    PacketId.NetworkStackLatencyPacket, 
    PacketId.LevelChunk,
    PacketId.ClientCacheMissResponse,
    PacketId.MoveEntityDelta,
    PacketId.SetEntityMotion,
    PacketId.SetEntityData,
    PacketId.NetworkChunkPublisherUpdate,
]);
for (let i = 2; i <= 136; i++) {
    if (tooLoudFilter.has(i)) continue;
    netevent.after(i).on((ptr, networkIdentifier, packetId) => {
        console.log('RECV '+ PacketId[packetId]+': '+ptr.readHex(16));
    });
    netevent.send(i).on((ptr, networkIdentifier, packetId) => {
        console.log('SEND '+ PacketId[packetId]+': '+ptr.readHex(16));
    });
}

// Network Hooking: disconnected
netevent.close.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected(${networkIdentifier})`);
});

// Call Native Functions
import { NativeModule } from "bdsx/native";
const kernel32 = new NativeModule("Kernel32.dll");
const user32 = new NativeModule("User32.dll");
const GetConsoleWindow = kernel32.get("GetConsoleWindow")!;
const SetWindowText = user32.get("SetWindowTextW")!;
const wnd = GetConsoleWindow();
SetWindowText(wnd, "BDSX Window!!!");

// Global Error Listener
import { setOnErrorListener } from "bdsx";
import { NetworkIdentifier } from "bdsx/native";
import { DimensionId, AttributeId } from "bdsx/common";
console.log('\nerror handling>');
setOnErrorListener(err => {
    console.log('ERRMSG Example> ' + err.message);
    // return false; // Suppress default error outputs
});
console.log(eval("undefined_identifier")); // Make the error for this example
