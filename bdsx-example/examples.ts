/// <reference types="minecraft-scripting-types-server" />

// Console Output
console.log("From Script> Hello, World!");

// Addon Script
import { Actor } from "bdsx";
import { DimensionId, AttributeId } from "bdsx/common";
const system = server.registerSystem(0, 0);
system.listenForEvent(ReceiveFromMinecraftServer.EntityCreated, ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);

    // Get extra informations from entity
    const actor = Actor.fromEntity(ev.data.entity);
    if (actor)
    {
        console.log('entity dimension: ' + DimensionId[actor.getDimension()]);
        const level = actor.getAttribute(AttributeId.PlayerLevel);
        console.log('entity level: ' + level);
        
        if (actor.isPlayer())
        {
            const ni = actor.getNetworkIdentifier();
            console.log('player IP: '+ni.getAddress());
        }
    }
});

// Custom Command
import { command, serverControl } from "bdsx";
// this hooks all commands, but it cannot be executed by command blocks
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
import { chat, CANCEL } from 'bdsx';
chat.on(ev => {
    ev.setMessage(ev.message.toUpperCase() + " YEY!");
});

// Network Hooking: Get login IP and XUID
import { netevent, PacketId, createPacket, sendPacket } from "bdsx";
const connectionList = new Map<NetworkIdentifier, string>();
netevent.after(PacketId.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const [xuid, username] = netevent.readLoginPacket(ptr);
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
    if (username) connectionList.set(networkIdentifier, username);

    // sendPacket
    setTimeout(()=>{
        console.log('packet sended');

        // It uses C++ class packets. and they are not specified everywhere.
        const textPacket = createPacket(PacketId.Text); 
        textPacket.setCxxString('[message packet from bdsx]', 0x50);
        sendPacket(networkIdentifier, textPacket);
        textPacket.dispose(); // need to delete it. or It will make memory lyrics
    }, 10000);
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
    netevent.raw(i).on((ptr, size, networkIdentifier, packetId) => {
        console.assert(size !== 0, 'invalid packet size');
        console.log('RECV '+ PacketId[packetId]+': '+ptr.readHex(Math.min(16, size)));
    });
    netevent.send(i).on((ptr, networkIdentifier, packetId) => {
        console.log('SEND '+ PacketId[packetId]+': '+ptr.readHex(16));
    });
}

// Network Hooking: disconnected
netevent.close.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});

// Call Native Functions
import { bin, NativeModule } from "bdsx";
const kernel32 = new NativeModule("Kernel32.dll");
const user32 = new NativeModule("User32.dll");
const GetConsoleWindow = kernel32.get("GetConsoleWindow")!;
const SetWindowText = user32.get("SetWindowTextW")!;
const wnd = GetConsoleWindow();
SetWindowText(wnd, "BDSX Window!!!");

// Parse raw packet
// referenced from https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/MovePlayerPacket.php
netevent.raw(PacketId.MovePlayer).on((ptr, size, ni)=>{
    console.log(`Packet Id: ${ptr.readUint8()}`);
    
    const runtimeId = ptr.readVarBin();
    const x = ptr.readFloat32();
    const y = ptr.readFloat32();
    const z = ptr.readFloat32();
    const pitch = ptr.readFloat32();
    const yaw = ptr.readFloat32();
    const headYaw = ptr.readFloat32();
    const mode = ptr.readUint8();
    const onGround = ptr.readUint8() !== 0;
    console.log(`move: ${bin.toString(runtimeId, 16)} ${x.toFixed(1)} ${y.toFixed(1)} ${z.toFixed(1)} ${pitch.toFixed(1)} ${yaw.toFixed(1)} ${headYaw.toFixed(1)} ${mode} ${onGround}`);
});
// referenced from https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/CraftingEventPacket.php
netevent.raw(PacketId.CraftingEvent).on((ptr, size, ni)=>{
    console.log(`Packet Id: ${ptr.readUint8()}`);
    
    const windowId = ptr.readUint8();
    const type = ptr.readVarInt();

    const uuid1 = ptr.readUint32();
    const uuid2 = ptr.readUint32();
    const uuid3 = ptr.readUint32();
    const uuid4 = ptr.readUint32();

    console.log(`crafting: ${windowId} ${type} ${uuid1} ${uuid2} ${uuid3} ${uuid4}`);
    const size1 = ptr.readVarUint();
    // need to parse more
});

// Global Error Listener
import { setOnErrorListener, NetworkIdentifier } from "bdsx";
console.log('\nerror handling>');
setOnErrorListener(err => {
    console.log('ERRMSG Example> ' + err.message);
    // return false; // Suppress default error outputs
});
console.log(eval("undefined_identifier")); // Make the error for this example
