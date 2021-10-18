import { VoidPointer } from "../core";
declare module "../minecraft" {
    interface ServerInstance {
        vftable: VoidPointer;
        server: DedicatedServer;
        minecraft: Minecraft;
        networkHandler: NetworkHandler;
        disconnectAllClients(message: string): void;
        disconnectClient(client: NetworkIdentifier): void;
        disconnectClient(client: NetworkIdentifier, message: string, skipMessage: boolean): void;
    }
}
