
// Custom Command
import { command, serverControl } from "bdsx";
// this hooks all commands, but it cannot be executed by command blocks
command.hook.on((command, originName)=>{
    if (command.startsWith('/tp '))
    {
        return -1; // block command
    }
    else if (command === '/close')
    {
        serverControl.stop(); // same with the stop command
        return 0;
    }
    if (command.startsWith('/>'))
    {
        try
        {
            console.log(eval(command.substr(2)));
            // run javacript
        }
        catch (err)
        {
            console.error(err.stack);
        }
        return 0;
    }
});
