import { SharedPtr as BdsxSharedPtr } from "../sharedpointer";
declare module "../minecraft" {
    namespace MinecraftPackets {
        /**
         * receive the parameter instead of structureReturn:true
         */
        function createPacketRaw(out: BdsxSharedPtr<Packet>, packetId: MinecraftPacketIds): void;
    }
}
