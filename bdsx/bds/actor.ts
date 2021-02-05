import { abstract } from "bdsx/common";
import { makefunc, NativePointer, StaticPointer, VoidPointer } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { bin64_t, NativeType } from "bdsx/nativetype";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Dimension } from "./dimension";
import { NetworkIdentifier } from "./networkidentifier";

export const ActorUniqueID = bin64_t.extends();
export type ActorUniqueID = bin64_t;

export enum DimensionId // int32_t
{
    Overworld = 0,
    Nether = 1,
    TheEnd = 2
}


export class ActorRuntimeID extends VoidPointer {
}

export enum ActorType 
{
    Player = 0x13f,
}

export class Actor extends NativeClass {
    vftable:VoidPointer;
    identifier:string;
    attributes:BaseAttributeMap;
    runtimeId:ActorRuntimeID;
    dimension:Dimension;
    
    protected _sendNetworkPacket(packet:VoidPointer):void {
        abstract();
    }

    protected _sendAttributePacket(id:AttributeId, value:number, attr:AttributeInstance):void {
        abstract();
    }

    sendPacket(packet:StaticPointer):void {
        if (!this.isPlayer()) throw Error("this is not ServerPlayer");
        this._sendNetworkPacket(packet);
    }

//     static fromPointer(ptr:StaticPointer):Actor;
//     static fromUniqueId(_64bit_low:number, _64bit_high:number):Actor|null;

    getDimensionId(out:Int32Array):void {
        abstract();
    }
    
    getDimension():DimensionId {
        const out = new Int32Array(1);
        this.getDimensionId(out);
        return out[0];
    }

    /**
     * @deprecated use actor.identifier
     */
    getIdentifier():string {
        return this.identifier;
    }

    isPlayer():boolean {
        abstract();
    }
    getNetworkIdentifier():NetworkIdentifier {
        throw Error(`this is not player`);
    }
        
    getUniqueIdLow():number {
        return this.getUniqueIdPointer().getInt32(0);
    }
    getUniqueIdHigh():number {
        return this.getUniqueIdPointer().getInt32(4);
    }

    getUniqueIdPointer():StaticPointer {
        abstract();
    }

    getTypeId():ActorType {
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
        if (attr === null) throw Error(`${this.identifier} has not ${AttributeId[id] || 'Attribute'+id}`);
        attr.currentValue = value;
        if (this.isPlayer()) {
            this._sendAttributePacket(id, value, attr);
        }
    }
    
    /**
     * @deprecated use actor.runtimeId
     */
    getRuntimeId():NativePointer {
        return new NativePointer(this.runtimeId);
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

// float NativeActor::getAttribute(int attribute) noexcept
// {
//     if (attribute < 1) return 0;
//     if ((uint)attribute > countof(attribNames)) return 0;
//     AttributeInstance* attr = ptr()->getAttribute((AttributeId)attribute);
//     if (!attr) return 0;
//     return attr->currentValue();
// }

// kr::JsValue NativeActor::fromPointer(StaticPointer* ptr) throws(JsException)
// {
//     if (ptr == nullptr) throw JsException(u"1st argument must be *Pointer");
//     Actor* actor = (Actor*)ptr->getAddressRaw();
//     return fromRaw(actor);
// }
// JsValue NativeActor::fromUniqueIdBin(Text16 bin) throws(JsException)
// {
//     ActorUniqueID id = bin.readas<ActorUniqueID>();
//     return fromRaw(g_server->minecraft()->something->level->fetchEntity(id));
// }

    static fromUniqueId(lowbits:number, highbits:number):Actor|null {
        abstract();
    }
    static fromEntity(entity:IEntity):Actor|null {
        const u = entity.__unique_id__;
        return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"]);
    }
    static [makefunc.np2js](ptr:StaticPointer):Actor {
        return Actor._singletoning(ptr);
    }
    static all():IterableIterator<Actor> {
        abstract();
    }

    private static _singletoning(ptr:StaticPointer):Actor {
        abstract();
    }
}

