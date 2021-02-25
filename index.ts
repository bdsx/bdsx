
// Please start your own codes from here!

import { command } from "./bdsx";

// import './example_and_test'; // remove this if it's not necessary for you


const system = server.registerSystem(0, 0);

command.hook.on((command, originName)=>{
    return 0;

});

system.executeCommand('test', ()=>{});


