import { MantleClass } from "../nativeclass";
import { CxxString } from "../nativetype";
import { SharedPtr as BdsxSharedPtr } from "../sharedpointer";
import './extendedstreamreadresult';
import './networkhandler';
declare const sharedptr_of_packet: unique symbol;
declare module "../minecraft" {
    interface Packet extends MantleClass {
        [sharedptr_of_packet]?: BdsxSharedPtr<any> | null;
        getId(): MinecraftPacketIds;
        getName(): CxxString;
        write(stream: BinaryStream): void;
        read(stream: BinaryStream): StreamReadResult;
        readExtended(readOnlyBinaryStream: ReadOnlyBinaryStream): ExtendedStreamReadResult;
        /**
         * same with target.send
         */
        sendTo(target: NetworkIdentifier, unknownarg?: number): void;
        dispose(): void;
    }
    namespace Packet {
        const ID: number;
        function create<T extends Packet>(this: {
            new (alloc?: boolean): T;
            ID: MinecraftPacketIds;
            ref(): any;
        }): T;
    }
}
export {};
