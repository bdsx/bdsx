import { CommandResultType } from "bdsx/commandresult";
import { bedrockServer } from "bdsx/launcher";

const res = bedrockServer.executeCommand('list', CommandResultType.Data);
console.log(`[example/executecommand.ts] ${res.data.statusMessage.replace(/[\r\n]+/g, ' ')}`);
