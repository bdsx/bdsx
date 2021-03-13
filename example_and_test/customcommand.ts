
// Custom Command
import { command, bedrockServer } from "bdsx";
// this hooks all commands, but it cannot be executed by command blocks
command.hook.on((command, originName, ctx)=>{
    if (!ctx.origin.isServerCommandOrigin()) { // no console
        console.log(`${originName}> ${command}`);
    }

    if (command.startsWith('/tp ')) {
        return 0x10000; // MCRESULT_CommandNotFound
    } else if (command === '/close') {
        bedrockServer.stop(); // same with the stop command
        return 1; // MCRESULT_Success
    }
    if (command.startsWith('/>')) {
        try {
            console.log(eval(command.substr(2)));
            // run javacript
        } catch (err) {
            console.error(err.stack);
        }
        return 1; // MCRESULT_Success
    }
});
