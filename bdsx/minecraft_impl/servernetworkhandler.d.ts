import { VoidPointer } from "../core";
import { CxxString, int32_t } from "../nativetype";
declare module "../minecraft" {
    interface ServerNetworkHandler {
        vftable: VoidPointer;
        readonly motd: CxxString;
        readonly maxPlayers: int32_t;
        disconnectClient(client: NetworkIdentifier): void;
        /**
         * @alias allowIncomingConnections
         */
        setMotd(motd: string): void;
        allowIncomingConnections(motd: string, b: boolean): void;
    }
}
