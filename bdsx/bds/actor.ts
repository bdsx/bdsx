import { bin } from "bdsx/bin";
import { abstract } from "bdsx/common";
import { NativePointer, StaticPointer, VoidPointer } from "bdsx/core";
import { makefunc } from "bdsx/makefunc";
import { NativeClass } from "bdsx/nativeclass";
import { bin64_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { BlockSource } from "./block";
import { Vec3 } from "./blockpos";
import { Dimension } from "./dimension";
import { NetworkIdentifier } from "./networkidentifier";
import { ServerPlayer } from "./player";

export const ActorUniqueID = bin64_t.extends();
export type ActorUniqueID = bin64_t;

export enum DimensionId { // int32_t
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
    identifier:EntityId;
    attributes:BaseAttributeMap;
    runtimeId:ActorRuntimeID;
    dimension:Dimension;

    protected _getName():CxxStringWrapper {
        abstract();
    }

    protected _addTag(tag:CxxStringWrapper):boolean {
        abstract();
    }

    protected _hasTag(tag:CxxStringWrapper):boolean {
        abstract();
    }

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

    private _getDimensionId(out:Int32Array):void {
        abstract();
    }

    getDimension():DimensionId {
        const out = new Int32Array(1);
        this._getDimensionId(out);
        return out[0];
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
        return this._getName().value;
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
        const _tag = new CxxStringWrapper(true);
        _tag.construct();
        _tag.value = tag;
        const ret = this._addTag(_tag);
        _tag.destruct();
        return ret;
    }
    hasTag(tag:string):boolean {
        const _tag = new CxxStringWrapper(true);
        _tag.construct();
        _tag.value = tag;
        const ret = this._hasTag(_tag);
        _tag.destruct();
        return ret;
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
    static [makefunc.np2js](ptr:StaticPointer):Actor|null {
        return Actor._singletoning(ptr);
    }
    static all():IterableIterator<Actor> {
        abstract();
    }

    private static _singletoning(ptr:StaticPointer):Actor|null {
        abstract();
    }
}

