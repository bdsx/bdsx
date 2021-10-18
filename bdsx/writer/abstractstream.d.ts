export declare abstract class AbstractWriter {
    abstract put(v: number): void;
    abstract putRepeat(v: number, count: number): void;
    abstract write(values: Uint8Array): void;
    writeNullTerminatedString(text: string): void;
    writeVarString(text: string): void;
    writeVarUint(n: number): void;
    writeVarInt(n: number): void;
    writeUint8(n: number): void;
    writeInt8(n: number): void;
    writeUint16(n: number): void;
    writeInt16(n: number): void;
    writeUint32(n: number): void;
    writeInt32(n: number): void;
    writeUint64WithFloat(n: number): void;
    writeInt64WithFloat(n: number): void;
    writeBin(bin: string): void;
    writeFloat32(n: number): void;
    writeFloat64(n: number): void;
    writeBoolean(n: boolean): void;
}
export declare abstract class AbstractReader {
    abstract get(): number;
    abstract read(values: Uint8Array, offset: number, length: number): number;
    readVarUint(): number;
    readNullTerminatedString(): string;
}
