import { bedrockServer } from "bdsx";
import { system } from "./bedrockapi-system";

// with bedrock API
system.executeCommand('list', result => {
    console.log(`max players: ${result.data.maxPlayerCount}`);
});

// with bdsx API
bedrockServer.executeCommand('list');
