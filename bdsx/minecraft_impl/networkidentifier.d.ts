import { VoidPointer } from "../core";
import { Hashable } from "../hashset";
import './raknet/addressorguid';
declare module "../minecraft" {
    interface NetworkIdentifier extends Hashable {
        address: RakNet.AddressOrGUID;
        assignTo(target: VoidPointer): void;
        equals(other: NetworkIdentifier): boolean;
        hash(): number;
        getActor(): ServerPlayer | null;
        getAddress(): string;
        toString(): string;
    }
    namespace NetworkIdentifier {
        function fromPointer(ptr: VoidPointer): NetworkIdentifier;
        function all(): IterableIterator<NetworkIdentifier>;
        let lastSender: NetworkIdentifier;
    }
}
