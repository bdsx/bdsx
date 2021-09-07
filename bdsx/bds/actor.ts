import { bin } from "../bin";
import { CircularDetector } from "../circulardetector";
import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, CxxString, int32_t, int64_as_float_t, NativeType } from "../nativetype";
import { AttributeId, AttributeInstance, BaseAttributeMap } from "./attribute";
import { BlockSource } from "./block";
import { Vec2, Vec3 } from "./blockpos";
import type { CommandPermissionLevel } from "./command";
import { Dimension } from "./dimension";
import { MobEffect, MobEffectIds, MobEffectInstance } from "./effects";
import { HashedString } from "./hashedstring";
import type { ArmorSlot, ItemStack } from "./inventory";
import { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";
import type { ServerPlayer } from "./player";
import enums = require('../enums');
import minecraft = require('../minecraft');

/** @deprecated */
export const ActorUniqueID = bin64_t.extends();
/** @deprecated */
export type ActorUniqueID = bin64_t;

/** @deprecated import it from bdsx/enums */
export const DimensionId = enums.DimensionId;
/** @deprecated import it from bdsx/enums */
export type DimensionId = enums.DimensionId;

export class ActorRuntimeID extends VoidPointer {
}

/** @deprecated */
export const ActorType = minecraft.ActorType;
/** @deprecated */
export type ActorType = minecraft.ActorType;

@nativeClass(0xA9)
export class ActorDefinitionIdentifier extends NativeClass {
    @nativeField(CxxString)
    namespace:CxxString;
    @nativeField(CxxString)
    identifier:CxxString;
    @nativeField(CxxString)
    initEvent:CxxString;
    @nativeField(CxxString)
    fullName:CxxString;
    @nativeField(HashedString)
    canonicalName:HashedString;

    static create(type:ActorType):ActorDefinitionIdentifier {
        abstract();
    }
}

@nativeClass(0x10)
export class ActorDamageSource extends NativeClass{
    @nativeField(int32_t, 0x08)
    cause: int32_t;

    /** @deprecated Has to be confirmed working */
    getDamagingEntityUniqueID():ActorUniqueID {
        abstract();
    }
}

/** @deprecated */
export const ActorDamageCause = minecraft.ActorDamageCause;
/** @deprecated */
export type ActorDamageCause = minecraft.ActorDamageCause;

/** @deprecated */
export const ActorFlags = minecraft.ActorFlags;
/** @deprecated */
export type ActorFlags = minecraft.ActorFlags;

/** @deprecated import it from bdsx/minecraft */
export class Actor extends NativeClass {
    vftable:VoidPointer;
    identifier:EntityId;

    /** @example Actor.summonAt(player.getRegion(), player.getPosition(), ActorDefinitionIdentifier.create(ActorType.Pig), -1, player) */
    static summonAt(region:BlockSource, pos:Vec3, type:ActorDefinitionIdentifier, id:ActorUniqueID, summoner?:Actor):Actor;
    static summonAt(region:BlockSource, pos:Vec3, type:ActorDefinitionIdentifier, id:int64_as_float_t, summoner?:Actor):Actor;
    static summonAt(region:BlockSource, pos:Vec3, type:ActorDefinitionIdentifier, id:ActorUniqueID|int64_as_float_t, summoner?:Actor):Actor {
        abstract();
    }

    sendPacket(packet:Packet):void {
        if (!this.isPlayer()) throw Error("this is not ServerPlayer");
        this.sendNetworkPacket(packet);
    }
    protected _getArmorValue():number{
        abstract();
    }
    getArmorValue(): number{
        if(this.isItem()) return 0;
        return this._getArmorValue();
    }
    getDimension():Dimension {
        abstract();
    }
    getDimensionId():DimensionId {
        abstract();
    }
    /**
     * it's same with this.identifier
     */
    getIdentifier():string {
        return this.identifier;
    }
    isPlayer():this is ServerPlayer {
        abstract();
    }
    isItem():this is ItemActor {
        abstract();
    }
    getAttributes():BaseAttributeMap {
        abstract();
    }
    getName():string {
        abstract();
    }
    setName(name:string):void {
        abstract();
    }
    setScoreTag(text:string):void{
        abstract();
    }
    getScoreTag():string{
        abstract();
    }
    getNetworkIdentifier():NetworkIdentifier {
        throw Error(`this is not player`);
    }
    getPosition():Vec3 {
        abstract();
    }
    getRotation():Vec2 {
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

    getEntityTypeId():ActorType {
        abstract();
    }
    getCommandPermissionLevel():CommandPermissionLevel {
        abstract();
    }
    getAttribute(id:AttributeId):number {
        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null) return 0;
        return attr.currentValue;
    }
    setAttribute(id:AttributeId, value:number):AttributeInstance|null {
        if (id < 1) return null;
        if (id > 15) return null;

        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null) throw Error(`${this.identifier} has not ${AttributeId[id] || `Attribute${id}`}`);
        attr.currentValue = value;
        return attr;
    }
    getRuntimeID():ActorRuntimeID {
        abstract();
    }
    /**
     * @deprecated Need more implement
     */
    getEntity():IEntity {
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
    }
    addEffect(effect: MobEffectInstance): void {
        abstract();
    }
    removeEffect(id: MobEffectIds):void {
        abstract();
    }
    protected _hasEffect(mobEffect: MobEffect):boolean {
        abstract();
    }
    hasEffect(id: MobEffectIds):boolean {
        const effect = MobEffect.create(id);
        const retval = this._hasEffect(effect);
        effect.destruct();
        return retval;
    }
    protected _getEffect(mobEffect: MobEffect):MobEffectInstance | null {
        abstract();
    }
    getEffect(id: MobEffectIds):MobEffectInstance | null {
        const effect = MobEffect.create(id);
        const retval = this._getEffect(effect);
        effect.destruct();
        return retval;
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
    setSneaking(value:boolean):void {
        abstract();
    }
    getHealth():number {
        abstract();
    }
    getMaxHealth():number {
        abstract();
    }
    /**
     * Most of the time it will be reset by ticking
     * @returns changed
     */
    setStatusFlag(flag:ActorFlags, value:boolean):boolean {
        abstract();
    }
    getStatusFlag(flag:ActorFlags):boolean {
        abstract();
    }
    static fromUniqueIdBin(bin:bin64_t, getRemovedActor:boolean = true):Actor|null {
        abstract();
    }
    static fromUniqueId(lowbits:number, highbits:number, getRemovedActor:boolean = true):Actor|null {
        return Actor.fromUniqueIdBin(bin.make64(lowbits, highbits), getRemovedActor);
    }
    static fromEntity(entity:IEntity, getRemovedActor:boolean = true):Actor|null {
        const u = entity.__unique_id__;
        return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"], getRemovedActor);
    }
    static [NativeType.getter](ptr:StaticPointer, offset?:number):Actor {
        return Actor._singletoning(ptr.add(offset, offset! >> 31))!;
    }
    static [makefunc.getFromParam](stackptr:StaticPointer, offset?:number):Actor|null {
        return Actor._singletoning(stackptr.getNullablePointer(offset));
    }
    static all():IterableIterator<Actor> {
        abstract();
    }
    private static _singletoning(ptr:StaticPointer|null):Actor|null {
        abstract();
    }
    _toJsonOnce(allocator:()=>Record<string, any>):Record<string, any> {
        return CircularDetector.check(this, allocator, obj=>{
            obj.name = this.getName();
            obj.pos = this.getPosition();
            obj.type = this.getEntityTypeId();
        });
    }
}

export class ItemActor extends Actor {
    itemStack:ItemStack;
}
