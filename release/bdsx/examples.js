"use strict";
/// <reference types="minecraft-scripting-types-server" />
Object.defineProperty(exports, "__esModule", { value: true });
// Console Output
console.log("From Script> Hello, World!");
// Addon Script
const bdsx_1 = require("bdsx");
const system = server.registerSystem(0, 0);
system.listenForEvent("minecraft:entity_created" /* EntityCreated */, ev => {
    console.log('entity created: ' + ev.data.entity.__identifier__);
    // Get extra informations from entity
    const actor = bdsx_1.Actor.fromEntity(ev.data.entity);
    if (actor)
        console.log('entity dimension: ' + common_1.DimensionId[actor.getDimension()]);
    const level = actor.getAttribute(common_1.AttributeId.PlayerLevel);
    console.log('entity level: ' + level);
});
// Custom Command
const bdsx_2 = require("bdsx");
// this hooks all commands, even It will can run by command blocks
bdsx_2.command.hook.on((command, originName) => {
    if (command === '/close') {
        bdsx_2.serverControl.stop(); // same with the stop command
        return 0;
    }
    if (command.startsWith('/>')) {
        try {
            console.log(eval(command.substr(2)));
            // run javacript
        }
        catch (err) {
            console.error(err.stack);
        }
        return 0;
    }
});
// Chat Listening
const bdsx_3 = require("bdsx");
bdsx_3.chat.on(ev => {
    ev.setMessage(ev.message.toUpperCase() + " YEY!");
});
// Network Hooking: Get login IP and XUID
const bdsx_4 = require("bdsx");
const connectionList = new Map();
bdsx_4.netevent.after(bdsx_4.PacketId.Login).on((ptr, networkIdentifier, packetId) => {
    const ip = networkIdentifier.getAddress();
    const [xuid, username] = bdsx_4.netevent.readLoginPacket(ptr);
    console.log(`${username}> IP=${ip}, XUID=${xuid}`);
    if (username)
        connectionList.set(networkIdentifier, username);
});
// Network Hooking: Print all packets
const tooLoudFilter = new Set([
    bdsx_4.PacketId.UpdateBlock,
    bdsx_4.PacketId.ClientCacheBlobStatus,
    bdsx_4.PacketId.NetworkStackLatencyPacket,
    bdsx_4.PacketId.LevelChunk,
    bdsx_4.PacketId.ClientCacheMissResponse,
    bdsx_4.PacketId.MoveEntityDelta,
    bdsx_4.PacketId.SetEntityMotion,
    bdsx_4.PacketId.SetEntityData,
    bdsx_4.PacketId.NetworkChunkPublisherUpdate,
]);
for (let i = 2; i <= 136; i++) {
    if (tooLoudFilter.has(i))
        continue;
    bdsx_4.netevent.after(i).on((ptr, networkIdentifier, packetId) => {
        console.log('RECV ' + bdsx_4.PacketId[packetId] + ': ' + ptr.readHex(16));
    });
    bdsx_4.netevent.send(i).on((ptr, networkIdentifier, packetId) => {
        console.log('SEND ' + bdsx_4.PacketId[packetId] + ': ' + ptr.readHex(16));
    });
}
// Network Hooking: disconnected
bdsx_4.netevent.close.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected(${networkIdentifier})`);
});
// Call Native Functions
const native_1 = require("bdsx/native");
const kernel32 = new native_1.NativeModule("Kernel32.dll");
const user32 = new native_1.NativeModule("User32.dll");
const GetConsoleWindow = kernel32.get("GetConsoleWindow");
const SetWindowText = user32.get("SetWindowTextW");
const wnd = GetConsoleWindow();
SetWindowText(wnd, "BDSX Window!!!");
// Global Error Listener
const bdsx_5 = require("bdsx");
const common_1 = require("bdsx/common");
console.log('\nerror handling>');
bdsx_5.setOnErrorListener(err => {
    console.log('ERRMSG Example> ' + err.message);
    // return false; // Suppress default error outputs
});
console.log(eval("undefined_identifier")); // Make the error for this example
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXBsZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJleGFtcGxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMERBQTBEOztBQUUxRCxpQkFBaUI7QUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0FBRTFDLGVBQWU7QUFDZiwrQkFBNkI7QUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0MsTUFBTSxDQUFDLGNBQWMsaURBQTJDLEVBQUUsQ0FBQyxFQUFFO0lBQ2pFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFaEUscUNBQXFDO0lBQ3JDLE1BQU0sS0FBSyxHQUFHLFlBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMvQyxJQUFJLEtBQUs7UUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixHQUFHLG9CQUFXLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDLG9CQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUMsQ0FBQztBQUVILGlCQUFpQjtBQUNqQiwrQkFBOEM7QUFDOUMsa0VBQWtFO0FBQ2xFLGNBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBQyxFQUFFO0lBQ25DLElBQUksT0FBTyxLQUFLLFFBQVEsRUFDeEI7UUFDSSxvQkFBYSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsNkJBQTZCO1FBQ25ELE9B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