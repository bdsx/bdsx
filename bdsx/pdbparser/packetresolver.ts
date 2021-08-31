import { dll } from "../dll";
import { makefunc } from "../makefunc";
import { int32_t } from "../nativetype";
import { PdbId } from "./symbolparser";

interface PacketClass extends PdbId<PdbId.Class> {
    packetId?:number;
}

export function resolvePacketClasses():void {
    const regexp = /Packet(?:V[0-9]+)?$/;
    const Packet = PdbId.parse('Packet') as PdbId<PdbId.Class>;
    Packet.determine(PdbId.Class);

    const MinecraftPacketIds = PdbId.parse('MinecraftPacketIds');

    for (const item of PdbId.global.children) {
        if (!item.is(PdbId.Class)) continue;
        if (!regexp.test(item.name)) continue;
        const getIdBase = item.getChild('getId');
        if (getIdBase == null) continue;
        if (!getIdBase.is(PdbId.FunctionBase)) continue;
        let getId = getIdBase.data.getFunction([]);
        if (getId == null) continue;
        if (getId.data.returnType !== MinecraftPacketIds) continue;
        if (getId.address === 0) {
            getId = getId.data.makeConst();
            if (getId.address === 0) {
                console.error(`${item}: address not found`);
                continue;
            }
        }
        item.data.super = Packet;
        resolvePacketClasses.list.push(item);
        (item as PacketClass).packetId = makefunc.js(dll.current.add(getId.address), int32_t)();
    }
}
export namespace resolvePacketClasses {
    export function getId(item:PdbId<PdbId.Data>):number|undefined {
        return (item as PacketClass).packetId;
    }
    export const list:PacketClass[] = [];
}
