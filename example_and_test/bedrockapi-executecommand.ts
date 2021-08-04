import { bedrockServer } from "bdsx/launcher";
import { events } from "bdsx/event";
import { system } from "./bedrockapi-system";
import { ServerNotStartedError } from "bdsx/common";

// with bedrock API
system.executeCommand('list', result => {
    console.log(`max players: ${result.data.maxPlayerCount}`);
});

// with bdsx API
// it executes the command on the console
bedrockServer.executeCommand('list');

const titleInterval = setInterval(() => {
    try {
        bedrockServer.executeCommand(`title @a actionbar §2Remove the import line in index.ts to disable the examples`);
    } catch (e) {
        if(!(e instanceof ServerNotStartedError)) throw e;
    }
}, 1000);

events.serverClose.on(() => clearInterval(titleInterval));
