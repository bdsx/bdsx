import { system } from "./bedrockapi-system";

system.executeCommand('list', result => {
    console.log(`max player: ${result.data.maxPlayerCount}`);
});
