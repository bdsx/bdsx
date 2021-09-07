import { Packet } from "./minecraft";

export const PacketIdToType = Packet.idMap;
export type PacketIdToType = {[key in keyof typeof PacketIdToType]:InstanceType<typeof PacketIdToType[key]>};

(PacketIdToType as any).__proto__ = null;
