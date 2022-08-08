import { events } from "bdsx/event";


console.log('[ExamplePlugin] allocated');
// before BDS launching

events.serverOpen.on(()=>{
    console.log('[ExamplePlugin] launched');
    // after BDS launched
});

events.serverClose.on(()=>{
    console.log('[ExamplePlugin] closed');
    // after BDS closed
});
