import { bin } from "bdsx/bin";
import { abstract } from "bdsx/common";
import { NativePointer, StaticPointer, VoidPointer } from "bdsx/core";
import { makefunc } from "bdsx/makefunc";
import { NativeClass } from "bdsx/nativeclass";
import { bin64_t } from "bdsx/nativetype";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { BlockSource } from "./block";
import { Vec3 } from "./blockpos";
import type { CommandPermissionLevel } from "./command";
import { Dimension } from "./dimension";
import { ArmorSlot, ItemStack } from "./inventory";
import { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";
import type { ServerPlayer } from "./player";

export const ActorUniqueID = bin64_t.extends();
export type ActorUniqueID = bin64_t;

export enum DimensionId { // int32_t
    Overworld = 0,
    Nether = 1,
    TheEnd = 2
}

export class ActorRuntimeID extends VoidPointer {
}

export enum ActorType {
    Item = 0x40,
    Player = 0x13f,
}

export class Actor extends NativeClass {
    vftable:VoidPointer;
    identifier:EntityId;
    attributes:BaseAttributeMap;
    runtimeId:ActorRuntimeID;
    dimension:Dimension;

    protected _sendAttributePacket(id:AttributeId, value:number, attr:AttributeInstance):void {
        abstract();
    }
    sendPacket(packet:Packet):void {
        if (!this.isPlayer()) throw Error("this is not ServerPlayer");
        this.sendNetworkPacket(packet);
    }
    /**
     * @deprecated use getDimensionId(), follow the original function name
     */
    getDimension():DimensionId {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
    /**
     * @deprecated use actor.identifier
     */
    getIdentifier():string {
        return this.identifier;
    }
    isPlayer():this is ServerPlayer {
        abstract();
    }
    getName():string {
        abstract();
    }
    setName(name:string):void {
        abstract();
    }
    getNetworkIdentifier():NetworkIdentifier {
        throw Error(`this is not player`);
    }
    getPosition():Vec3 {
        abstract();
    }
    getRegion():BlockSource {
        abstract();
    }
    getUniqueIdLow():number {
        return this.getUniqueIdPointer().getInt32(0);
    }
    getUniqueIdHigh():number {
        return this.getUniqueIdPointer().getInt32(4);
    }
    getUniqueIdBin():bin64_t {
        return this.getUniqueIdPointer().getBin64();
    }
    /**
     * it returns address of the unique id field
     */
    getUniqueIdPointer():StaticPointer {
        abstract();
    }
    getTypeId():ActorType {
        abstract();
    }
    getCommandPermissionLevel():CommandPermissionLevel {
        abstract();
    }
    getAttribute(id:AttributeId):number {
        const attr = this.attributes.getMutableInstance(id);
        if (attr === null) return 0;
        return attr.currentValue;
    }
    setAttribute(id:AttributeId, value:number):void {
        if (id < 1) return;
        if (id > 15) return;

        const attr = this.attributes.getMutableInstance(id);
        if (attr === null) throw Error(`${this.identifier} has not ${AttributeId[id] || `Attribute${id}`}`);
        attr.currentValue = value;
        if (this.isPlayer()) {
            this._sendAttributePacket(id, value, attr);
        }
    }
    /**
     * @deprecated use actor.runtimeId
     */
    getRuntimeId():NativePointer {
        return this.runtimeId.add();
    }
    /**
     * @deprecated Need more implement
     */
    getEntity():IEntity {
        let entity:IEntity = (this as any).entity;
        if (entity) return entity;
        entity = {
            __unique_id__:{
                "64bit_low": this.getUniqueIdLow(),
                "64bit_high": this.getUniqueIdHigh()
            },
            __identifier__:this.identifier,
            __type__:(this.getTypeId() & 0xff) === 0x40 ? 'item_entity' : 'entity',
            id:0, // bool ScriptApi::WORKAROUNDS::helpRegisterActor(entt::Registry<unsigned int>* registry? ,Actor* actor,unsigned int* id_out);
        };
        return (this as any).entity = entity;
    }
    addTag(tag:string):boolean {
        abstract();
    }
    hasTag(tag:string):boolean {
        abstract();
    }
    removeTag(tag:string):boolean {
        abstract();
    }
    teleport(pos:Vec3, dimensionId:DimensionId=DimensionId.Overworld):void {
        abstract();
    }
    getArmor(slot:ArmorSlot):ItemStack {
        abstract();
    }
    setSneaking(bool:boolean):void {
        abstract();
    }
    getHealth():number {
        abstract();
    }
    getMaxHealth():number {
        abstract();
    }
    static fromUniqueIdBin(bin:bin64_t):Actor|null {
        abstract();
    }
    static fromUniqueId(lowbits:number, highbits:number):Actor|null {
        return Actor.fromUniqueIdBin(bin.make64(lowbits, highbits));
    }
    static fromEntity(entity:IEntity):Actor|null {
        const u = entity.__unique_id__;
        return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"]);
    }
    static [makefunc.np2js](ptr:Actor|null):Actor|null {
        return Actor._singletoning(ptr);
    }
    static all():IterableIterator<Actor> {
        abstract();
    }
    private static _singletoning(ptr:Actor|null):Actor|null {
        abstract();
    }
}
