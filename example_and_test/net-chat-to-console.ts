// Chat Listening
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { system } from "./bedrockapi-system";

events.packetBefore(MinecraftPacketIds.Text).on(ev => {
    console.log(`[Chat] ${ev.message}`) //logging to console
	
});
