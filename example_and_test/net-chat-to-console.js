"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Chat Listening
const packetids_1 = require("bdsx/bds/packetids");
const common_1 = require("bdsx/common");
const event_1 = require("bdsx/event");
event_1.events.packetBefore(packetids_1.MinecraftPacketIds.Text).on(ev => {
    
    console.log(`[Chat] ${ev.message}`) // logging chat to console
});
