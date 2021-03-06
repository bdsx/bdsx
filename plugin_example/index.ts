import { bedrockServer } from "bdsx";


console.log('[ExamplePlugin] allocated');
// before BDS launching

bedrockServer.open.on(()=>{
    console.log('[ExamplePlugin] launched');
    // after BDS launched
});

bedrockServer.close.on(()=>{
    console.log('[ExamplePlugin] closed');
    // after BDS closed
});
