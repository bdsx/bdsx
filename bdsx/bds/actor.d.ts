import { StaticPointer, VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { NativeClass } from "../nativeclass";
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
import minecraft = require('../minecraft');
/** @deprecated */
export declare const ActorUniqueID: NativeType<string, string>;
/** @deprecated */
export declare type ActorUniqueID = bin64_t;
/** @deprecated import it from bdsx/enums */
export declare const DimensionId: typeof minecraft.DimensionId;
/** @deprecated import it from bdsx/enums */
export declare type DimensionId = minecraft.DimensionId;
export declare class ActorRuntimeID extends VoidPointer {
}
/** @deprecated */
export declare const ActorType: typeof minecraft.ActorType;
/** @deprecated */
export declare type ActorType = minecraft.ActorType;
export declare class ActorDefinitionIdentifier extends NativeClass {
    namespace: CxxString;
    identifier: CxxString;
    initEvent: CxxString;
    fullName: CxxString;
    canonicalName: HashedString;
    static create(type: ActorType): ActorDefinitionIdentifier;
}
export declare class ActorDamageSource extends NativeClass {
    cause: int32_t;
    /** @deprecated Has to be confirmed working */
    getDamagingEntityUniqueID(): ActorUniqueID;
}
/** @deprecated */
export declare const ActorDamageCause: typeof minecraft.ActorDamageCause;
/** @deprecated */
export declare type ActorDamageCause = minecraft.ActorDamageCause;
/** @deprecated */
export declare const ActorFlags: typeof minecraft.ActorFlags;
/** @deprecated */
export declare type ActorFlags = minecraft.ActorFlags;
/** @deprecated import it from bdsx/minecraft */
export declare class Actor extends NativeClass {
    vftable: VoidPointer;
    identifier: EntityId;
    /** @example Actor.summonAt(player.getRegion(), player.getPosition(), ActorDefinitionIdentifier.create(ActorType.Pig), -1, player) */
    static summonAt(region: BlockSource, pos: Vec3, type: ActorDefinitionIdentifier, id: ActorUniqueID, summoner?: Actor): Actor;
    static summonAt(region: BlockSource, pos: Vec3, type: ActorDefinitionIdentifier, id: int64_as_float_t, summoner?: Actor): Actor;
    sendPacket(packet: Packet): void;
    protected _getArmorValue(): number;
    getArmorValue(): number;
    getDimension(): Dimension;
    getDimensionId(): DimensionId;
    /**
     * it's same with this.identifier
     */
    getIdentifier(): string;
    isPlayer(): this is ServerPlayer;
    isItem(): this is ItemActor;
    getAttributes(): BaseAttributeMap;
    getName(): string;
    setName(name: string): void;
    setScoreTag(text: string): void;
    getScoreTag(): string;
    getNetworkIdentifier(): NetworkIdentifier;
    getPosition(): Vec3;
    getRotation(): Vec2;
    getRegion(): BlockSource;
    getUniqueIdLow(): number;
    getUniqueIdHigh(): number;
    getUniqueIdBin(): bin64_t;
    /**
     * it returns address of the unique id field
     */
    getUniqueIdPointer(): StaticPointer;
    getEntityTypeId(): ActorType;
    getCommandPermissionLevel(): CommandPermissionLevel;
    getAttribute(id: AttributeId): number;
    setAttribute(id: AttributeId, value: number): AttributeInstance | null;
    getRuntimeID(): ActorRuntimeID;
    /**
     * @deprecated Need more implement
     */
    getEntity(): IEntity;
    addEffect(effect: MobEffectInstance): void;
    removeEffect(id: MobEffectIds): void;
    protected _hasEffect(mobEffect: MobEffect): boolean;
    hasEffect(id: MobEffectIds): boolean;
    protected _getEffect(mobEffect: MobEffect): MobEffectInstance | null;
    getEffect(id: MobEffectIds): MobEffectInstance | null;
    addTag(tag: string): boolean;
    hasTag(tag: string): boolean;
    removeTag(tag: string): boolean;
    teleport(pos: Vec3, dimensionId?: DimensionId): void;
    getArmor(slot: ArmorSlot): ItemStack;
    setSneaking(value: boolean): void;
    getHealth(): number;
    getMaxHealth(): number;
    /**
     * Most of the time it will be reset by ticking
     * @returns changed
     */
    setStatusFlag(flag: ActorFlags, value: boolean): boolean;
    getStatusFlag(flag: ActorFlags): boolean;
    static fromUniqueIdBin(bin: bin64_t, getRemovedActor?: boolean): Actor | null;
    static fromUniqueId(lowbits: number, highbits: number, getRemovedActor?: boolean): Actor | null;
    static fromEntity(entity: IEntity, getRemovedActor?: boolean): Actor | null;
    static fromNewActor(newActor: minecraft.Actor & {
        [legacyLink]?: Actor;
    }): Actor;
    static [NativeType.getter](ptr: StaticPointer, offset?: number): Actor;
    static [makefunc.getFromParam](stackptr: StaticPointer, offset?: number): Actor | null;
    static all(): IterableIterator<Actor>;
    private static _singletoning;
    _toJsonOnce(allocator: () => Record<string, any>): Record<string, any>;
}
declare const legacyLink: unique symbol;
export declare class ItemActor extends Actor {
    itemStack: ItemStack;
}
export {};
