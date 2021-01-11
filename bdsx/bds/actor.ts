import { makefunc, NativePointer, StaticPointer, VoidPointer } from "bdsx/core";
import { bin64_t, CxxString, NativeType } from "bdsx/nativetype";
import { NativeClass } from "bdsx/nativeclass";
import { RawTypeId } from "bdsx/common";
import { makefunc_vf } from "bdsx/capi";
import { bin } from "bdsx/bin";
import { proc } from "./proc";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { NetworkIdentifier } from "./networkidentifier";

export const ActorUniqueID = bin64_t.extends();
export type ActorUniqueID = bin64_t

export enum DimensionId // int32_t
{
	Overworld = 0,
	Nether = 1,
	TheEnd = 2
}


export class ActorRuntimeID extends VoidPointer
{
}


const actorMaps = new Map<string, Actor>();

const ServerPlayer_vftable = proc["ServerPlayer::`vftable'"];

export enum ActorType 
{
	Player = 0x13f,
}

export class Actor extends NativeClass
{
	public static readonly OFFSET_OF_NI = 0x9d0;

	vftable:VoidPointer;
	identifier:string;
	attributes:BaseAttributeMap;
	runtimeId:ActorRuntimeID;
	
	protected _sendNetworkPacket(packet:VoidPointer):void
	{
		throw 'abstract';
	}

	protected _sendAttributePacket(id:AttributeId, value:number, attr:AttributeInstance):void
	{
		throw 'abstract';
	}

	sendPacket(packet:StaticPointer):void
	{
		if (!this.isPlayer()) throw Error("this is not ServerPlayer");
		this._sendNetworkPacket(packet);
	}

//     static fromPointer(ptr:StaticPointer):Actor;
//     static fromUniqueId(_64bit_low:number, _64bit_high:number):Actor|null;

    getDimensionId(out:Int32Array):void
    {
        throw 'abstract';
	}
	
	getDimension():DimensionId
	{
		const out = new Int32Array(1);
		this.getDimensionId(out);
		return out[0];
	}

	/**
	 * @deprecated use actor.identifier
	 */
	getIdentifier():string
	{
		return this.identifier;
	}

	isPlayer():boolean
	{
		return this.vftable.equals(ServerPlayer_vftable);
	}
	getNetworkIdentifier():NetworkIdentifier
	{
		if (!this.isPlayer()) throw Error(`this is not player`);
		return NetworkIdentifier[NativeType.getter](this, Actor.OFFSET_OF_NI);
	}
		
	getUniqueIdLow():number
	{
		return bin.int32(this.getUniqueIdBin());
	}
	getUniqueIdHigh():number
	{
		return bin.int32_high(this.getUniqueIdBin());
	}

	getUniqueIdBin():ActorUniqueID
	{
		throw 'abstract';
	}

	getTypeId():ActorType
	{
		throw 'abstract';
	}
	
	getAttribute(id:AttributeId):AttributeInstance
	{
		return this.attributes.getMutableInstance(id);
	}

	setAttribute(id:AttributeId, value:number):void
	{
		if (id < 1) return;
		if (id > 15) return;
	
		const attr = this.getAttribute(id);
		attr.currentValue = value;
	
		if (this.isPlayer())
		{
			this._sendAttributePacket(id, value, attr);
		}
	}
    
	/**
	 * @deprecated use actor.runtimeId
	 */
	getRuntimeId():NativePointer
	{
		return new NativePointer(this.runtimeId);
	}

	getEntity():IEntity
	{
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
// 	if (attribute < 1) return 0;
// 	if ((uint)attribute > countof(attribNames)) return 0;
// 	AttributeInstance* attr = ptr()->getAttribute((AttributeId)attribute);
// 	if (!attr) return 0;
// 	return attr->currentValue();
// }

// kr::JsValue NativeActor::fromPointer(StaticPointer* ptr) throws(JsException)
// {
// 	if (ptr == nullptr) throw JsException(u"1st argument must be *Pointer");
// 	Actor* actor = (Actor*)ptr->getAddressRaw();
// 	return fromRaw(actor);
// }
// JsValue NativeActor::fromUniqueIdBin(Text16 bin) throws(JsException)
// {
// 	ActorUniqueID id = bin.readas<ActorUniqueID>();
// 	return fromRaw(g_server->minecraft()->something->level->fetchEntity(id));
// }

	static fromUniqueId(lowbits:number, highbits:number):Actor|null
	{
		throw 'abstract';
	}
	static fromEntity(entity:IEntity):Actor|null
	{
		const u = entity.__unique_id__;
		return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"]);
	}
	static [makefunc.np2js](ptr:VoidPointer):Actor
	{
		const binptr = ptr.getAddressBin();
		let actor = actorMaps.get(binptr);
		if (actor) return actor;
		actor = new Actor(ptr);
		actorMaps.set(binptr, actor);
		return actor;
	}

	static all():IterableIterator<Actor>
	{
		return actorMaps.values();
	}

}

(Actor.prototype as any).sendNetworkPacket = makefunc.js(proc["ServerPlayer::sendNetworkPacket"], RawTypeId.Void, Actor, false, VoidPointer);
Actor.prototype.getUniqueIdBin = makefunc.js(proc["Actor::getUniqueID"], RawTypeId.Bin64, Actor, false);

Actor.abstract({
	vftable: VoidPointer,
	identifier: [CxxString, 0x450], // minecraft:player
	attributes: [BaseAttributeMap, 0x478],
	runtimeId: [ActorRuntimeID, 0x588],
});
Actor.prototype.getTypeId = makefunc_vf(0, 0x508, RawTypeId.Int32, false); // ActorType getEntityTypeId()
Actor.prototype.getDimensionId = makefunc_vf(0, 0x548, RawTypeId.Void, false, RawTypeId.Buffer); // DimensionId* getDimensionId(DimensionId*)

function _removeActor(actor:Actor)
{
	actorMaps.delete(actor.getAddressBin());
}

// 		// hookOnActorRelease
// 		MCF_HOOK(Level$removeEntityReferences,
// 			{ 0x48, 0x8B, 0xC4, 0x55, 0x57, 0x41, 0x54, 0x41, 0x56, 0x41, 0x57, 0x48, 0x8B, 0xEC, 0x48, 0x81, 0xEC, 0x80, 0x00, 0x00, 0x00 }
// 		)(Level * level, Actor * actor, bool b) {
// 			_assert((intptr_t)actor > 0);
// 			_removeActor(actor);
// 		};


// 	{
// 		McftRenamer renamer;

// 		// hookOnActorDestructor
// 		MCF_HOOK(Actor$dtor$Actor,
// 			{ 0x40, 0x57, 0x48, 0x83, 0xEC, 0x30, 0x48, 0xC7, 0x44, 0x24, 0x20, 0xFE, 0xFF, 0xFF, 0xFF }
// 		)(Actor* actor) {
// 			_assert((intptr_t)actor > 0);
// 			if (!isContextThread())
// 			{
// #ifndef NDEBUG
// 				CsLock _lock = s_csActorMap;
// 				_assert(!s_actorMap.has(actor));
// #endif
// 				return;
// 			}
// 			_removeActor(actor);
// 		};
//     }
    