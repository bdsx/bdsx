import { asm, Register } from "bdsx/assembler";
import { bin } from "bdsx/bin";
import { capi } from "bdsx/capi";
import { abstract, RawTypeId } from "bdsx/common";
import { makefunc, NativePointer, StaticPointer, VoidPointer } from "bdsx/core";
import { dll } from "bdsx/dll";
import { NativeClass } from "bdsx/nativeclass";
import { bin64_t, NativeType } from "bdsx/nativetype";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { Level } from "./level";
import { NetworkIdentifier } from "./networkidentifier";
import { proc, procHacker } from "./proc";

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
		abstract();
	}

	protected _sendAttributePacket(id:AttributeId, value:number, attr:AttributeInstance):void
	{
		abstract();
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
        abstract();
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
		abstract();
	}

	getTypeId():ActorType
	{
		abstract();
	}
	
	getAttribute(id:AttributeId):number
	{
		const attr = this.attributes.getMutableInstance(id);
		if (attr === null) return 0;
		return attr.currentValue;
	}

	setAttribute(id:AttributeId, value:number):void
	{
		if (id < 1) return;
		if (id > 15) return;
	
		const attr = this.attributes.getMutableInstance(id);
		if (attr === null) throw Error(`${this.identifier} has not ${AttributeId[id] || 'Attribute'+id}`);
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

	/**
	 * @deprecated Need more implement
	 */
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
		abstract();
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

function _removeActor(actor:Actor)
{
	actorMaps.delete(actor.getAddressBin());
}

export function hookingForActor():void
{
	procHacker.hooking('Level::removeEntityReferences',
		makefunc.np((level:Level, actor:Actor, b:boolean)=>{
			_removeActor(actor);
		}, RawTypeId.Void, null, Level, Actor, RawTypeId.Boolean)
	);
	procHacker.hooking('Actor::~Actor',
		asm()
		.push_r(Register.rcx)
		.call64(dll.kernel32.GetCurrentThreadId.pointer, Register.rax)
		.pop_r(Register.rcx)
		.cmp_r_c(Register.rax, capi.nodeThreadId)
		.jne(12)
		.jmp64(makefunc.np(_removeActor, RawTypeId.Void, null, Actor), Register.rax)
		.ret()
		.alloc()
	);
}

