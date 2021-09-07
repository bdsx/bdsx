import { asmcode } from "../asm/asmcode";
import { DimensionId } from "../bds/actor";
import { AttributeId } from "../bds/attribute";
import { MobEffectIds } from "../bds/effects";
import { bin } from "../bin";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { dnf } from "../dnf";
import { hook } from "../hook";
import { makefunc } from "../makefunc";
import { Actor, ActorUniqueID, AttributeInstance, Item, ItemActor, Level, MobEffect, MobEffectInstance, Packet, RelativeFloat, serverInstance, ServerPlayer, TeleportCommand, Vec3 } from "../minecraft";
import { bin64_t, CxxString, NativeType, void_t } from "../nativetype";
import { minecraftTsReady } from "./ready";

type EntityStringId = EntityId;

declare module "../minecraft" {
    interface Actor {
        vftable:VoidPointer;
        identifier:EntityStringId;
        sendPacket(packet:Packet):void;
        isPlayer():this is ServerPlayer;
        isItem():this is Item;
        /**
         * it's same with this.identifier
         */
        getIdentifier():EntityStringId;
        getName():string;
        setName(name:string):void;
        getNetworkIdentifier():NetworkIdentifier;
        getPosition():Vec3;
        getUniqueIdLow():number;
        getUniqueIdHigh():number;
        getUniqueIdBin():bin64_t;
        /**
         * it returns address of the unique id field
         */
        getUniqueIdPointer():StaticPointer;
        getEntityTypeId():ActorType;
        getCommandPermissionLevel():CommandPermissionLevel;
        getAttribute(id:AttributeId):number;
        setAttribute(id:AttributeId, value:number):AttributeInstance|null;
        /**
         * @deprecated Need more implement
         */
        getEntity():IEntity;
        removeEffect(id: MobEffectIds):void;
        teleport(pos:Vec3, dimensionId?:DimensionId):void;

        hasEffect(id: MobEffectIds):boolean;
        getEffect(id: MobEffectIds):MobEffectInstance|null;
    }

    namespace Actor {
        function fromUniqueIdBin(bin:bin64_t, getRemovedActor?:boolean):Actor|null;
        function fromUniqueId(lowbits:number, highbits:number, getRemovedActor?:boolean):Actor|null;
        function fromEntity(entity:IEntity, getRemovedActor?:boolean):Actor|null;
        function all():IterableIterator<Actor>;
    }
}

Actor.abstract({
    vftable: VoidPointer,
    identifier: [CxxString as NativeType<EntityId>, 0x458], // minecraft:player
});

Actor.prototype.sendPacket = function(packet:Packet) {
    if (!this.isPlayer()) throw Error("this is not ServerPlayer");
    this.sendNetworkPacket(packet);
};
Actor.prototype.isItem = function() {
    return this instanceof Item;
};
Actor.prototype.getIdentifier = function() {
    return this.identifier;
};
Actor.prototype.getNetworkIdentifier = function() {
    throw Error(`this is not player`);
};
Actor.prototype.getPosition = Actor.prototype.getPos;
Actor.prototype.getUniqueIdLow = function():number {
    return this.getUniqueIdPointer().getInt32(0);
};
Actor.prototype.getUniqueIdHigh = function():number {
    return this.getUniqueIdPointer().getInt32(4);
};
Actor.prototype.getUniqueIdBin = function():bin64_t {
    return this.getUniqueIdPointer().getBin64();
};
Actor.prototype.getUniqueIdPointer = function():StaticPointer {
    abstract();
};
Actor.prototype.setAttribute = function(id:AttributeId, value:number):AttributeInstance|null {
    if (id < 1) return null;
    if (id > 15) return null;

    const attr = this.getAttributes().getMutableInstance(id);
    if (attr === null) throw Error(`${this.identifier} has not ${AttributeId[id] || `Attribute${id}`}`);
    attr.currentValue = value;
    return attr;
};
Actor.prototype.getEntity = function():IEntity {
    let entity:IEntity = (this as any).entity;
    if (entity != null) return entity;
    entity = {
        __unique_id__:{
            "64bit_low": this.getUniqueIdLow(),
            "64bit_high": this.getUniqueIdHigh()
        },
        __identifier__:this.identifier,
        __type__:(this.getEntityTypeId() & 0xff) === 0x40 ? 'item_entity' : 'entity',
        id:0, // bool ScriptApi::WORKAROUNDS::helpRegisterActor(entt::Registry<unsigned int>* registry? ,Actor* actor,unsigned int* id_out);
    };
    return (this as any).entity = entity;
};
Actor.prototype.teleport = function(pos:Vec3, dimensionId:DimensionId=DimensionId.Overworld) {
    const cmd = TeleportCommand.computeTarget(this, pos, new Vec3(true), dimensionId, RelativeFloat.create(0, false), RelativeFloat.create(0, false), 0);
    TeleportCommand.applyTarget(this, cmd);
};

dnf.overload([Actor, 'hasEffect'], function(id:MobEffectIds):boolean{
    const effect = MobEffect.create(id);
    const retval = this.hasEffect(effect);
    effect.destruct();
    return retval;
});
dnf.overload([Actor, 'getEffect'], function(id:MobEffectIds):MobEffectInstance|null{
    const effect = MobEffect.create(id);
    const retval = this.getEffect(effect);
    effect.destruct();
    return retval;
});

const actorMaps = new Map<string, Actor>();
const ServerPlayer_vftable = ServerPlayer.__vftable;
const ItemActor_vftable = ItemActor.__vftable;

function _singletoning(ptr:StaticPointer|null):Actor|null {
    if (ptr === null) return null;
    const binptr = ptr.getAddressBin();
    let actor = actorMaps.get(binptr);
    if (actor != null) return actor;
    if (ptr.getPointer().equals(ServerPlayer_vftable)) {
        actor = ptr.as(ServerPlayer);
    } else if (ptr.getPointer().equals(ItemActor_vftable)) {
        actor = ptr.as(ItemActor);
    } else {
        actor = ptr.as(Actor);
    }
    actorMaps.set(binptr, actor);
    return actor;
}

Actor.all = function():IterableIterator<Actor> {
    return actorMaps.values();
};

Actor.fromUniqueId = function(lowbits:number, highbits:number, getRemovedActor:boolean = true):Actor|null {
    return Actor.fromUniqueIdBin(bin.make64(lowbits, highbits), getRemovedActor);
};
Actor.fromEntity = function(entity:IEntity, getRemovedActor:boolean = true):Actor|null {
    const u = entity.__unique_id__;
    return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"], getRemovedActor);
};
Actor.fromUniqueIdBin = function(bin, getRemovedActor = true) {
    return serverInstance.minecraft.getLevel().fetchEntity(ActorUniqueID.createFromBin(bin), getRemovedActor);
};

Actor[NativeType.getter] = function(ptr:StaticPointer, offset?:number):Actor {
    return _singletoning(ptr.add(offset, offset! >> 31))!;
};
Actor[makefunc.getFromParam] = function(stackptr:StaticPointer, offset?:number):Actor|null {
    return _singletoning(stackptr.getNullablePointer(offset));
};

function _removeActor(actor:Actor):void {
    actorMaps.delete(actor.getAddressBin());
}

minecraftTsReady.promise.then(()=>{
    const Level$removeEntityReferences = hook(Level, 'removeEntityReferences').call(function(actor, b){
        _removeActor(actor);
        return Level$removeEntityReferences.call(this, actor, b);
    });

    asmcode.removeActor = makefunc.np(_removeActor, void_t, null, Actor);
    hook(Actor, NativeType.dtor).raw(asmcode.actorDestructorHook, {callOriginal: true});
});
