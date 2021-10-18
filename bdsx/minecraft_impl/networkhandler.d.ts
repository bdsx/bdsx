import { VoidPointer } from "../core";
import { SharedPtr as SharedPtr2 } from "../sharedpointer";
declare module "../minecraft" {
    interface NetworkHandler {
        vftable: VoidPointer;
        instance: RakNetInstance;
        send(ni: NetworkIdentifier, packet: Packet, senderSubClientId: number): void;
    }
    namespace NetworkHandler {
        interface Connection {
            networkIdentifier: NetworkIdentifier;
            u1: VoidPointer;
            u2: VoidPointer;
            u3: VoidPointer;
            epeer: SharedPtr2<EncryptedNetworkPeer>;
            bpeer: SharedPtr2<BatchedNetworkPeer>;
            bpeer2: SharedPtr2<BatchedNetworkPeer>;
        }
    }
}
