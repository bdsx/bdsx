import { bdsx } from "bdsx/v3";
import { system } from "./bedrockapi-system";

// with bedrock API
system.executeCommand('list', result => {
    console.log(`max players: ${result.data.maxPlayerCount}`);
});

// with bdsx API
// it executes the command on the console
bdsx.command.execute('list');

const titleInterval = setInterval(() => {
    bdsx.command.execute(`title @a actionbar §2Remove the import line in index.ts to disable the examples`);
}, 1000);

bdsx.events.serverStop.on(() => clearInterval(titleInterval));
