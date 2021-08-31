import { bedrockServer } from "bdsx/launcher";
import { events } from "bdsx/event";
import { system } from "./bedrockapi-system";

// with bedrock API
system.executeCommand('list', result => {
    console.log(`max players: ${result.data.maxPlayerCount}`);
});

// with bdsx API
// it executes the command on the console
bedrockServer.executeCommand('list');

const titleInterval = setInterval(() => {
    bedrockServer.executeCommand(`title @a actionbar §2Remove the import line in index.ts to disable the examples`);
}, 1000);

events.serverStop.on(() => clearInterval(titleInterval));
