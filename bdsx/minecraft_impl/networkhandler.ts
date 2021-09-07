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
    namespace NetworkHandler
    {
        interface Connection {
            networkIdentifier:NetworkIdentifier;
            u1:VoidPointer;
            u2:VoidPointer;
            u3:VoidPointer;
            epeer:SharedPtr<EncryptedNetworkPeer>;
            bpeer:SharedPtr<BatchedNetworkPeer>;
            bpeer2:SharedPtr<BatchedNetworkPeer>;
        }
    }
    let networkHandler:NetworkHandler;
}

NetworkHandler.abstract({
    vftable: VoidPointer,
    instance: [RakNetInstance.ref(), 0x48]
});

createAbstractObject.setAbstractProperty(minecraft, 'networkHandler');
