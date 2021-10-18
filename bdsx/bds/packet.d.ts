import { MantleClass, NativeClass } from "../nativeclass";
import { CxxString, int32_t, Type, uint32_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { NetworkIdentifier } from "./networkidentifier";
import { MinecraftPacketIds } from "./packetids";
import { BinaryStream } from "./stream";
/** @deprecated */
export declare const PacketReadResult: import("../nativetype").NativeType<number, number> & {
    PacketReadNoError: number;
    PacketReadError: number;
};
/** @deprecated */
export declare type PacketReadResult = uint32_t;
/** @deprecated */
export declare const StreamReadResult: import("../nativetype").NativeType<number, number> & {
    Disconnect: number;
    Pass: number;
    Warning: number;
    Ignore: number;
};
/** @deprecated */
export declare type StreamReadResult = int32_t;
/** @deprecated */
export declare class ExtendedStreamReadResult extends NativeClass {
    streamReadResult: StreamReadResult;
    dummy: int32_t;
}
declare const sharedptr_of_packet: unique symbol;
/** @deprecated */
export declare class Packet extends MantleClass {
    static ID: number;
    [sharedptr_of_packet]?: SharedPtr<any> | null;
    getId(): MinecraftPacketIds;
    getName(): CxxString;
    write(stream: BinaryStream): void;
    read(stream: BinaryStream): PacketReadResult;
    readExtended(read: ExtendedStreamReadResult, stream: BinaryStream): ExtendedStreamReadResult;
    /**
     * same with target.send
     */
    sendTo(target: NetworkIdentifier, unknownarg?: number): void;
    dispose(): void;
    static create<T extends Packet>(this: Type<T> & {
        ID: number;
    }): T;
}
/** @deprecated */
export declare const PacketSharedPtr: import("../nativeclass").NativeClassType<SharedPtr<Packet>>;
/** @deprecated */
export declare type PacketSharedPtr = SharedPtr<Packet>;
/** @deprecated */
export declare const createPacketRaw: import("../makefunc").FunctionFromTypes_js<import("../core").NativePointer, null, [import("../nativeclass").NativeClassType<SharedPtr<Packet>>, import("../nativetype").NativeType<number, number>], import("../nativeclass").NativeClassType<SharedPtr<Packet>>>;
export {};
