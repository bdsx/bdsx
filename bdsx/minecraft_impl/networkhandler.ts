import { createAbstractObject } from "../abstractobject";
import { VoidPointer } from "../core";
import { NetworkHandler, RakNetInstance } from "../minecraft";
import minecraft = require("../minecraft");

declare module "../minecraft" {
    interface NetworkHandler {
        vftable:VoidPointer;
        instance:RakNetInstance;

        send(ni:NetworkIdentifier, packet:Packet, senderSubClientId:number):void;
    }
    let networkHandler:NetworkHandler;
}

NetworkHandler.abstract({
    vftable: VoidPointer,
    instance: [RakNetInstance.ref(), 0x48]
});

minecraft.networkHandler = createAbstractObject.bedrockObject;
