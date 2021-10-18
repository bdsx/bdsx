import { StaticPointer, VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { makefunc } from "../makefunc";
import { NativeClass } from "../nativeclass";
import { bin64_t, bool_t, CxxStringWith8Bytes, int16_t, int32_t, NativeType, uint32_t, uint8_t } from "../nativetype";
import { ActorRuntimeID } from "./actor";
import { Block, BlockLegacy } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import { CommandName } from "./commandname";
import type { ItemEnchants } from "./enchants";
import type { BlockPalette } from "./level";
import { CompoundTag } from "./nbt";
import type { ServerPlayer } from "./player";
import minecraft = require('../minecraft');
import enums = require('../enums');
/** @deprecated import it from 'bdsx/enums' */
export declare const ContainerId: typeof enums.ContainerId;
/** @deprecated import it from 'bdsx/enums' */
export declare type ContainerId = enums.ContainerId;
/** @deprecated import it from 'bdsx/minecraft' */
export declare const ContainerType: typeof minecraft.ContainerType;
/** @deprecated import it from 'bdsx/minecraft' */
export declare type ContainerType = minecraft.ContainerType;
/** @deprecated import it from 'bdsx/minecraft' */
export declare const ArmorSlot: typeof minecraft.ArmorSlot;
/** @deprecated import it from 'bdsx/minecraft' */
export declare type ArmorSlot = minecraft.ArmorSlot;
/** @deprecated import it from 'bdsx/minecraft' */
export declare const CreativeItemCategory: typeof minecraft.CreativeItemCategory;
/** @deprecated import it from 'bdsx/minecraft' */
export declare type CreativeItemCategory = minecraft.CreativeItemCategory;
export declare class Item extends NativeClass {
    allowOffhand(): boolean;
    getCommandName(): string;
    /** @deprecated use getCommandNames2 */
    getCommandNames(): CxxVector<CxxStringWith8Bytes>;
    getCommandNames2(): CxxVector<CommandName>;
    getCreativeCategory(): number;
    isDamageable(): boolean;
    isFood(): boolean;
    /**
     * Will not affect client but allows /replaceitem
     */
    setAllowOffhand(value: boolean): void;
}
export declare class ComponentItem extends NativeClass {
}
export declare class ItemStack extends NativeClass {
    vftable: VoidPointer;
    item: Item;
    userData: CompoundTag;
    block: Block;
    aux: int16_t;
    amount: uint8_t;
    valid: bool_t;
    pickupTime: bin64_t;
    showPickup: bool_t;
    canPlaceOn: CxxVector<BlockLegacy>;
    canDestroy: CxxVector<BlockLegacy>;
    /**
     * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted, even if the name does not exist, it still returns an ItemStack
     */
    static create(itemName: string, amount?: number, data?: number): ItemStack;
    static fromDescriptor(descriptor: NetworkItemStackDescriptor, palette: BlockPalette, unknown: boolean): ItemStack;
    protected _getItem(): Item;
    protected _setCustomLore(name: CxxVector<string>): void;
    protected _cloneItem(itemStack: ItemStack): void;
    protected _getArmorValue(): number;
    getArmorValue(): number;
    setAuxValue(value: number): void;
    getAuxValue(): number;
    cloneItem(): ItemStack;
    getMaxStackSize(): number;
    toString(): string;
    toDebugString(): string;
    isBlock(): boolean;
    isNull(): boolean;
    getAmount(): number;
    setAmount(amount: number): void;
    getId(): number;
    getItem(): Item | null;
    getName(): string;
    getRawNameId(): string;
    hasCustomName(): boolean;
    getCustomName(): string;
    setCustomName(name: string): void;
    getUserData(): CompoundTag;
    /**
     * it returns the enchantability.
     * (See enchantability on https://minecraft.fandom.com/wiki/Enchanting_mechanics)
     */
    getEnchantValue(): number;
    isEnchanted(): boolean;
    setCustomLore(lores: string[] | string): void;
    /**
     * Value is applied only to Damageable items
     */
    setDamageValue(value: number): void;
    setItem(id: number): boolean;
    startCoolDown(player: ServerPlayer): void;
    load(compoundTag: CompoundTag): void;
    sameItem(item: ItemStack): boolean;
    isStackedByData(): boolean;
    isStackable(): boolean;
    isPotionItem(): boolean;
    isPattern(): boolean;
    isMusicDiscItem(): boolean;
    isLiquidClipItem(): boolean;
    isHorseArmorItem(): boolean;
    isGlint(): boolean;
    isFullStack(): boolean;
    isFireResistant(): boolean;
    isExplodable(): boolean;
    isDamaged(): boolean;
    isDamageableItem(): boolean;
    isArmorItem(): boolean;
    isWearableItem(): boolean;
    getMaxDamage(): number;
    getComponentItem(): ComponentItem;
    getDamageValue(): number;
    getAttackDamage(): number;
    constructItemEnchantsFromUserData(): ItemEnchants;
}
export declare class PlayerInventory extends NativeClass {
    addItem(itemStack: ItemStack, linkEmptySlot: boolean): boolean;
    clearSlot(slot: number, containerId: ContainerId): void;
    getContainerSize(containerId: ContainerId): number;
    getFirstEmptySlot(): number;
    getHotbarSize(): number;
    getItem(slot: number, containerId: ContainerId): ItemStack;
    getSelectedItem(): ItemStack;
    getSelectedSlot(): number;
    getSlotWithItem(itemStack: ItemStack, checkAux: boolean, checkData: boolean): number;
    getSlots(): CxxVector<ItemStack>;
    selectSlot(slot: number, containerId: ContainerId): void;
    setItem(slot: number, itemStack: ItemStack, containerId: ContainerId, linkEmptySlot: boolean): void;
    setSelectedItem(itemStack: ItemStack): void;
    swapSlots(primarySlot: number, secondarySlot: number): void;
}
export declare enum InventorySourceType {
    InvalidInventory = -1,
    ContainerInventory = 0,
    GlobalInventory = 1,
    WorldInteraction = 2,
    CreativeInventory = 3,
    UntrackedInteractionUI = 100,
    NonImplementedFeatureTODO = 99999
}
export declare enum InventorySourceFlags {
    NoFlag = 0,
    WorldInteractionRandom = 1
}
export declare class InventorySource extends NativeClass {
    type: InventorySourceType;
    containerId: ContainerId;
    flags: InventorySourceFlags;
    static create(containerId: ContainerId, type?: InventorySourceType): InventorySource;
}
export declare class ItemDescriptor extends NativeClass {
}
export declare class ItemStackNetIdVariant extends NativeClass {
}
export declare class NetworkItemStackDescriptor extends NativeClass {
    descriptor: ItemDescriptor;
    id: ItemStackNetIdVariant;
}
export declare class InventoryAction extends NativeClass {
    source: InventorySource;
    slot: uint32_t;
    fromDesc: NetworkItemStackDescriptor;
    toDesc: NetworkItemStackDescriptor;
    from: ItemStack;
    to: ItemStack;
}
export declare class InventoryTransactionItemGroup extends NativeClass {
    itemId: int32_t;
    itemAux: int32_t;
    tag: CompoundTag;
    count: int32_t;
    overflow: bool_t;
    /** When the item is dropped this is air, it should be the item when it is picked up */
    getItemStack(): ItemStack;
}
export declare class InventoryTransaction extends NativeClass {
    content: CxxVector<InventoryTransactionItemGroup>;
    /** The packet will be cancelled if this is added wrongly */
    addItemToContent(item: ItemStack, count: number): void;
    getActions(source: InventorySource): InventoryAction[];
    protected _getActions(source: InventorySource): CxxVector<InventoryAction>;
}
export declare class ComplexInventoryTransaction extends NativeClass {
    vftable: VoidPointer;
    type: ComplexInventoryTransaction.Type;
    data: InventoryTransaction;
    isItemUseTransaction(): this is ItemUseInventoryTransaction;
    isItemUseOnEntityTransaction(): this is ItemUseOnActorInventoryTransaction;
    isItemReleaseTransaction(): this is ItemReleaseInventoryTransaction;
    static [NativeType.getter](ptr: StaticPointer, offset?: number): ComplexInventoryTransaction;
    static [makefunc.getFromParam](stackptr: StaticPointer, offset?: number): ComplexInventoryTransaction | null;
    private static _toVariantType;
}
export declare namespace ComplexInventoryTransaction {
    const Type: typeof minecraft.ComplexInventoryTransaction.Type;
    type Type = minecraft.ComplexInventoryTransaction.Type;
}
export declare class ItemUseInventoryTransaction extends ComplexInventoryTransaction {
    actionType: ItemUseInventoryTransaction.ActionType;
    pos: BlockPos;
    targetBlockId: uint32_t;
    face: int32_t;
    slot: int32_t;
    descriptor: NetworkItemStackDescriptor;
    fromPos: Vec3;
    clickPos: Vec3;
}
export declare namespace ItemUseInventoryTransaction {
    /** @deprecated */
    const ActionType: typeof minecraft.ItemUseInventoryTransaction.ActionType;
    /** @deprecated */
    type ActionType = minecraft.ItemUseInventoryTransaction.ActionType;
}
export declare class ItemUseOnActorInventoryTransaction extends ComplexInventoryTransaction {
    runtimeId: ActorRuntimeID;
    actionType: ItemUseOnActorInventoryTransaction.ActionType;
    slot: int32_t;
    descriptor: NetworkItemStackDescriptor;
    fromPos: Vec3;
    hitPos: Vec3;
}
export declare namespace ItemUseOnActorInventoryTransaction {
    /** @deprecated */
    const ActionType: typeof minecraft.ItemUseOnActorInventoryTransaction.ActionType;
    /** @deprecated */
    type ActionType = minecraft.ItemUseOnActorInventoryTransaction.ActionType;
}
export declare class ItemReleaseInventoryTransaction extends ComplexInventoryTransaction {
    actionType: ItemReleaseInventoryTransaction.ActionType;
    slot: int32_t;
    descriptor: NetworkItemStackDescriptor;
    fromPos: Vec3;
}
export declare namespace ItemReleaseInventoryTransaction {
    /** @deprecated */
    const ActionType: typeof minecraft.ItemReleaseInventoryTransaction.ActionType;
    /** @deprecated */
    type ActionType = minecraft.ItemReleaseInventoryTransaction.ActionType;
}
