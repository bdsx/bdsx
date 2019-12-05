import { StructureType, Structure, CxxVectorType, Float32, CxxVector, Type } from "./nativetype";
import { nethook, NativePointer, NetworkIdentifier, StaticPointer, getHashFromCxxString } from "./native";
import PacketId = require("./packetId");

export const HashedString:Type<string>={
    name:'HashedString',
    get(ptr:NativePointer):string
    {
        return ptr.getCxxString(8);
    },
    set(ptr:NativePointer, str:string):void
    {
        ptr.move(8);
        ptr.setCxxString(str);
        const hash = getHashFromCxxString(ptr);
        ptr.move(-8);
        ptr.setPointer(hash);
    },
}

export class UpdateAttributesPacket$AttributeData extends Structure
{
    min = 0;
    max = 0;
    current = 0;
    default = 0;
    hash = new NativePointer;
    name = '';

    static readonly structure = [
        [0, 'current', Float32],
        [4, 'min', Float32],
        [8, 'max', Float32],
        [12, 'default', Float32],
        [16, 'name', HashedString],
    ];
    static readonly size = 0x38;
}

export interface PacketType<T> extends StructureType<T>
{
    readonly ID:number;
}

export const CxxVector$UpdateAttributesPacket$AttributeData = new CxxVectorType(UpdateAttributesPacket$AttributeData);

export class Packet extends Structure
{
    sendTo(ni:NetworkIdentifier):void
    {
        const type:PacketType<this> = this.constructor as any;
        const ptr = nethook.createPacket(type.ID);
        type.set(ptr, this);
        nethook.sendPacket(ni, ptr);
    }
}

export class UpdateAttributesPacket extends Packet
{
    runtimeId:NativePointer;
    attributes:CxxVector<UpdateAttributesPacket$AttributeData>;

    static readonly ID = PacketId.UpdateAttributes;
    static readonly structure = [
        [0x28, 'runtimeId', NativePointer],
        [0x30, 'attributes', UpdateAttributesPacket$AttributeData],
    ];
};
