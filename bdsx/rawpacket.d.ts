import type { NetworkIdentifier as NetworkIdentifierOld } from "./bds/networkidentifier";
import { NetworkIdentifier } from "./minecraft";
import { AbstractWriter } from "./writer/abstractstream";
export declare class RawPacket extends AbstractWriter {
    private readonly data;
    private readonly sharedptr;
    private packet;
    private packetId;
    constructor(packetId?: number);
    getId(): number;
    put(v: number): void;
    putRepeat(v: number, count: number): void;
    write(n: Uint8Array): void;
    dispose(): void;
    reset(packetId: number, unknownarg?: number): void;
    sendTo(target: NetworkIdentifier | NetworkIdentifierOld): void;
}
