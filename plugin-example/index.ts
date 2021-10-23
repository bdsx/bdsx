import { bdsx } from "bdsx/v3";

console.log('[ExamplePlugin] allocated');
// before BDS launching

bdsx.events.serverOpen.on(()=>{
    console.log('[ExamplePlugin] launched');
    // after BDS launched
});

bdsx.events.serverClose.on(()=>{
    console.log('[ExamplePlugin] closed');
    // after BDS closed
});
