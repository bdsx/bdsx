import { createAbstractObject } from "../abstractobject";
import { VoidPointer } from "../core";
import { DedicatedServer, Minecraft, NetworkHandler, ServerInstance } from "../minecraft";
import minecraft = require("../minecraft");

declare module "../minecraft" {
    interface ServerInstance {
        vftable:VoidPointer;
        server:DedicatedServer;
        minecraft:Minecraft;
        networkHandler:NetworkHandler;
    }

    let serverInstance:ServerInstance;
}

ServerInstance.abstract({
    vftable:VoidPointer,
    server:[DedicatedServer.ref(), 0x98],
    minecraft:[Minecraft.ref(), 0xa0],
    networkHandler:[NetworkHandler.ref(), 0xa8],
});

createAbstractObject.setAbstractProperty(minecraft, 'serverInstance');
