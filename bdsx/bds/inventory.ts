import { abstract } from "../common";
import { StaticPointer, VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { makefunc } from "../makefunc";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, CxxStringWith8Bytes, int16_t, int32_t, NativeType, uint32_t, uint8_t } from "../nativetype";
import { ActorRuntimeID } from "./actor";
import { Block, BlockLegacy } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import { CommandName } from "./commandname";
import type { ItemEnchants } from "./enchants";
import type { BlockPalette } from "./level";
import { CompoundTag } from "./nbt";
import type { ServerPlayer } from "./player";

/**
 * Values from 1 to 100 are for a player's container counter.
 */
export enum ContainerId {
    Inventory,
    /** Used as the minimum value of a player's container counter. */
    First,
    /** Used as the maximum value of a player's container counter. */
    Last = 100,
    /** Used in InventoryContentPacket */
    Offhand = 119,
    /** Used in InventoryContentPacket */
    Armor,
    /** Used in InventoryContentPacket */
    Creative,
    /**
     * @deprecated
     */
    Hotbar,
    /**
     * @deprecated
     */
    FixedInventory,
    /** Used in InventoryContentPacket */
    UI,
    None = 0xFF,
}

export enum ContainerType {
    Container,
    Workbench,
    Furnace,
    Enchantment,
    BrewingStand,
    Anvil,
    Dispenser,
    Dropper,
    Hopper,
    Cauldron,
    MinecartChest,
    MinecartHopper,
    Horse,
    Beacon,
    StructureEditor,
    Trade,
    CommandBlock,
    Jukebox,
    Armor,
    Hand,
    CompoundCreator,
    ElementConstructor,
    MaterialReducer,
    LabTable,
    Loom,
    Lectern,
    Grindstone,
    BlastFurnace,
    Smoker,
    Stonecutter,
    Cartography,
    None = 0xF7,
    Inventory = 0xFF,
}

export enum ArmorSlot {
    Head,
    /** IDA said this is called Torso */
    Torso,
    Chest = 1,
    Legs,
    Feet
}

export enum CreativeItemCategory {
    All,
    Construction,
    Nature,
    Equipment,
    Items,
    Uncategorized,
}

export class Item extends NativeClass {
    allowOffhand():boolean {
        abstract();
    }
    getCommandName():string {
        const names = this.getCommandNames();
        const name = names.get(0);
        names.destruct();
        if (name === null) throw Error(`item has not any names`);
        return name;
    }
    /** @deprecated use getCommandNames2 */
    getCommandNames():CxxVector<CxxStringWith8Bytes> {
        abstract();
    }
    getCommandNames2():CxxVector<CommandName> {
        abstract();
    }
    getCreativeCategory():number {
        abstract();
    }
    isDamageable():boolean {
        abstract();
    }
    isFood():boolean {
        abstract();
    }
    /**
     * Will not affect client but allows /replaceitem
     */
    setAllowOffhand(value:boolean):void {
        abstract();
    }
}

export class ComponentItem extends NativeClass {
}

@nativeClass(0x90)
export class ItemStack extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(Item.ref())
    item:Item;
    @nativeField(CompoundTag.ref())
    userData: CompoundTag;
    @nativeField(Block.ref())
    block:Block;
    @nativeField(int16_t)
    aux:int16_t;
    @nativeField(uint8_t)
    amount:uint8_t;
    @nativeField(bool_t)
    valid:bool_t;
    @nativeField(bin64_t, {offset:0x04, relative:true})
    pickupTime:bin64_t;
    @nativeField(bool_t)
    showPickup:bool_t;
    @nativeField(CxxVector.make(BlockLegacy.ref()), 0x38)
    canPlaceOn:CxxVector<BlockLegacy>;
    @nativeField(CxxVector.make(BlockLegacy.ref()), 0x58)
    canDestroy:CxxVector<BlockLegacy>;
    /**
     * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted, even if the name does not exist, it still returns an ItemStack
     */
    static create(itemName:string, amount:number = 1, data:number = 0):ItemStack {
        abstract();
    }
    static fromDescriptor(descriptor:NetworkItemStackDescriptor, palette:BlockPalette, unknown:boolean):ItemStack {
        abstract();
    }
    protected _getItem():Item {
        abstract();
    }
    protected _setCustomLore(name:CxxVector<string>):void {
        abstract();
    }
    protected _cloneItem(itemStack: ItemStack):void {
        abstract();
    }
    protected _getArmorValue(): number{
        abstract();
    }
    getArmorValue(): number{
        if(!this.isArmorItem) return 0;
        return this._getArmorValue();
    }
    setAuxValue(value: number): void{
        abstract();
    }
    getAuxValue():number{
        abstract();
    }
    cloneItem(): ItemStack{
        const itemStack = ItemStack.create('air');
        this._cloneItem(itemStack);
        return itemStack;
    }
    getMaxStackSize(): number{
        abstract();
    }
    toString(): string{
        abstract();
    }
    toDebugString(): string{
        abstract();
    }
    isBlock():boolean {
        abstract();
    }
    isNull():boolean {
        abstract();
    }
    getAmount():number {
        return this.amount;
    }
    setAmount(amount:number):void {
        this.amount = amount;
    }
    getId():number {
        abstract();
    }
    getItem():Item|null {
        if (this.isNull()) {
            return null;
        }
        return this._getItem();
    }
    getName():string {
        const item = this.getItem();
        if (item != null) {
            const Name = item.getCommandName();
            if (Name.includes(":")) return Name;
            else return "minecraft:" + Name;
        }
        return "minecraft:air";
    }
    getRawNameId():string {
        abstract();
    }
    hasCustomName():boolean {
        abstract();
    }
    getCustomName(): string {
        abstract();
    }
    setCustomName(name:string):void {
        abstract();
    }
    getUserData():CompoundTag {
        abstract();
    }
    /**
     * it returns the enchantability.
     * (See enchantability on https://minecraft.fandom.com/wiki/Enchanting_mechanics)
     */
    getEnchantValue(): number {
        abstract();
    }
    isEnchanted(): boolean {
        abstract();
    }
    setCustomLore(lores:string[]|string):void {
        const CxxVectorString = CxxVector.make(CxxString);
        const cxxvector = CxxVectorString.construct();
        if (typeof lores === "string") {
            cxxvector.push(lores);
        } else {
            cxxvector.push(...lores);
        }
        this._setCustomLore(cxxvector);
        cxxvector.destruct();
    }

    /**
     * Value is applied only to Damageable items
     */
    setDamageValue(value:number):void {
        abstract();
    }
    setItem(id:number):boolean {
        abstract();
    }
    startCoolDown(player:ServerPlayer):void {
        abstract();
    }
    load(compoundTag:CompoundTag):void {
        abstract();
    }
    sameItem(item:ItemStack):boolean {
        abstract();
    }
    isStackedByData():boolean {
        abstract();
    }
    isStackable():boolean {
        abstract();
    }
    isPotionItem():boolean {
        abstract();
    }
    isPattern():boolean {
        abstract();
    }
    isMusicDiscItem():boolean {
        abstract();
    }
    isLiquidClipItem():boolean {
        abstract();
    }
    isHorseArmorItem():boolean {
        abstract();
    }
    isGlint():boolean {
        abstract();
    }
    isFullStack():boolean {
        abstract();
    }
    isFireResistant():boolean {
        abstract();
    }
    isExplodable():boolean {
        abstract();
    }
    isDamaged():boolean {
        abstract();
    }
    isDamageableItem():boolean {
        abstract();
    }
    isArmorItem():boolean {
        abstract();
    }
    isWearableItem():boolean {
        abstract();
    }
    getMaxDamage():number {
        abstract();
    }
    getComponentItem():ComponentItem {
        abstract();
    }
    getDamageValue():number {
        abstract();
    }
    getAttackDamage():number {
        abstract();
    }
    constructItemEnchantsFromUserData():ItemEnchants {
        abstract();
    }
}

export class PlayerInventory extends NativeClass {
    addItem(itemStack:ItemStack, linkEmptySlot:boolean):boolean {
        abstract();
    }
    clearSlot(slot:number, containerId:ContainerId):void {
        abstract();
    }
    getContainerSize(containerId:ContainerId):number {
        abstract();
    }
    getFirstEmptySlot():number {
        abstract();
    }
    getHotbarSize():number {
        abstract();
    }
    getItem(slot:number, containerId:ContainerId):ItemStack {
        abstract();
    }
    getSelectedItem():ItemStack {
        abstract();
    }
    getSelectedSlot():number {
        return this.getInt8(0x10);
    }
    getSlotWithItem(itemStack:ItemStack, checkAux:boolean, checkData:boolean):number {
        abstract();
    }
    getSlots():CxxVector<ItemStack> {
        abstract();
    }
    selectSlot(slot:number, containerId:ContainerId):void {
        abstract();
    }
    setItem(slot:number, itemStack:ItemStack, containerId:ContainerId, linkEmptySlot:boolean):void {
        abstract();
    }
    setSelectedItem(itemStack:ItemStack):void {
        abstract();
    }
    swapSlots(primarySlot:number, secondarySlot:number):void {
        abstract();
    }
}

export enum InventorySourceType {
    InvalidInventory = -1,
    ContainerInventory,
    GlobalInventory,
    WorldInteraction,
    CreativeInventory,
    UntrackedInteractionUI = 100,
    NonImplementedFeatureTODO = 99999,
}

export enum InventorySourceFlags {
    NoFlag,
    WorldInteractionRandom,
}

@nativeClass()
export class InventorySource extends NativeClass {
    @nativeField(int32_t)
    type:InventorySourceType;
    @nativeField(int32_t)
    containerId:ContainerId;
    @nativeField(int32_t)
    flags:InventorySourceFlags;

    static create(containerId:ContainerId, type:InventorySourceType = InventorySourceType.ContainerInventory):InventorySource {
        const source = new InventorySource(true);
        source.type = type;
        source.containerId = containerId;
        source.flags = InventorySourceFlags.NoFlag;
        return source;
    }
}

//@nativeClass(0x48)
export class ItemDescriptor extends NativeClass {
}

export class ItemStackNetIdVariant extends NativeClass {
}

@nativeClass(0x80)
export class NetworkItemStackDescriptor extends NativeClass {
    @nativeField(ItemDescriptor)
    descriptor:ItemDescriptor;
    @nativeField(ItemStackNetIdVariant, 0x54)
    id:ItemStackNetIdVariant;
}

@nativeClass()
export class InventoryAction extends NativeClass {
    @nativeField(InventorySource)
    source:InventorySource;
    @nativeField(uint32_t)
    slot:uint32_t;
    @nativeField(NetworkItemStackDescriptor)
    fromDesc:NetworkItemStackDescriptor;
    @nativeField(NetworkItemStackDescriptor)
    toDesc:NetworkItemStackDescriptor;
    @nativeField(ItemStack)
    from:ItemStack;
    @nativeField(ItemStack)
    to:ItemStack;
}

@nativeClass(0x18)
export class InventoryTransactionItemGroup extends NativeClass {
    @nativeField(int32_t)
    itemId:int32_t;
    @nativeField(int32_t)
    itemAux:int32_t;
    @nativeField(CompoundTag.ref())
    tag:CompoundTag;
    @nativeField(int32_t)
    count:int32_t;
    @nativeField(bool_t)
    overflow:bool_t;

    /** When the item is dropped this is air, it should be the item when it is picked up */
    getItemStack():ItemStack {
        abstract();
    }
}

@nativeClass(0x58)
export class InventoryTransaction extends NativeClass {
    // @nativeField(CxxUnorderedMap.make(InventorySource, CxxVector.make(InventoryAction)))
    // actions:CxxUnorderedMap<InventorySource, CxxVector<InventoryAction>>;
    @nativeField(CxxVector.make(InventoryTransactionItemGroup), 0x40)
    content:CxxVector<InventoryTransactionItemGroup>;

    /** The packet will be cancelled if this is added wrongly */
    addItemToContent(item:ItemStack, count:number):void {
        abstract();
    }
    getActions(source:InventorySource):InventoryAction[] {
        return this._getActions(source).toArray();
    }

    protected _getActions(source:InventorySource):CxxVector<InventoryAction> {
        abstract();
    }
}

@nativeClass()
export class ComplexInventoryTransaction extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(uint8_t)
    type:ComplexInventoryTransaction.Type;
    @nativeField(InventoryTransaction, 0x10)
    data:InventoryTransaction;

    isItemUseTransaction():this is ItemUseInventoryTransaction {
        return this.type === ComplexInventoryTransaction.Type.ItemUseTransaction;
    }

    isItemUseOnEntityTransaction():this is ItemUseOnActorInventoryTransaction {
        return this.type === ComplexInventoryTransaction.Type.ItemUseOnEntityTransaction;
    }

    isItemReleaseTransaction():this is ItemReleaseInventoryTransaction {
        return this.type === ComplexInventoryTransaction.Type.ItemReleaseTransaction;
    }

    static [NativeType.getter](ptr:StaticPointer, offset?:number):ComplexInventoryTransaction {
        return ComplexInventoryTransaction._toVariantType(ptr.add(offset, offset! >> 31))!;
    }
    static [makefunc.getFromParam](stackptr:StaticPointer, offset?:number):ComplexInventoryTransaction|null {
        return ComplexInventoryTransaction._toVariantType(stackptr.getNullablePointer(offset));
    }
    private static _toVariantType(ptr:StaticPointer|null):ComplexInventoryTransaction|null {
        if (ptr === null) return null;
        const transaction = ptr.as(ComplexInventoryTransaction);
        switch (transaction.type) {
        case ComplexInventoryTransaction.Type.ItemUseTransaction:
            return ptr.as(ItemUseInventoryTransaction);
        case ComplexInventoryTransaction.Type.ItemUseOnEntityTransaction:
            return ptr.as(ItemUseOnActorInventoryTransaction);
        case ComplexInventoryTransaction.Type.ItemReleaseTransaction:
            return ptr.as(ItemReleaseInventoryTransaction);
        default:
            return transaction;
        }
    }
}

export namespace ComplexInventoryTransaction {
    export enum Type {
        NormalTransaction,
        InventoryMismatch,
        ItemUseTransaction,
        ItemUseOnEntityTransaction,
        ItemReleaseTransaction,
    }
}

@nativeClass(null)
export class ItemUseInventoryTransaction extends ComplexInventoryTransaction {
    @nativeField(uint32_t)
    actionType:ItemUseInventoryTransaction.ActionType;
    @nativeField(BlockPos)
    pos:BlockPos;
    @nativeField(uint32_t)
    targetBlockId:uint32_t;
    @nativeField(int32_t)
    face:int32_t;
    @nativeField(int32_t)
    slot:int32_t;
    @nativeField(NetworkItemStackDescriptor, {offset: 0x04, relative: true})
    descriptor:NetworkItemStackDescriptor;
    @nativeField(Vec3)
    fromPos:Vec3;
    @nativeField(Vec3)
    clickPos:Vec3;
}

export namespace ItemUseInventoryTransaction {
    export enum ActionType {
        Place,
        Use,
        Destroy,
    }
}

@nativeClass(null)
export class ItemUseOnActorInventoryTransaction extends ComplexInventoryTransaction {
    @nativeField(ActorRuntimeID)
    runtimeId:ActorRuntimeID;
    @nativeField(uint32_t)
    actionType:ItemUseOnActorInventoryTransaction.ActionType;
    @nativeField(int32_t)
    slot:int32_t;
    @nativeField(NetworkItemStackDescriptor)
    descriptor:NetworkItemStackDescriptor;
    @nativeField(Vec3)
    fromPos:Vec3;
    @nativeField(Vec3)
    hitPos:Vec3;
}

export namespace ItemUseOnActorInventoryTransaction {
    export enum ActionType {
        Interact,
        Attack,
        ItemInteract,
    }
}

@nativeClass(null)
export class ItemReleaseInventoryTransaction extends ComplexInventoryTransaction {
    @nativeField(uint32_t)
    actionType:ItemReleaseInventoryTransaction.ActionType;
    @nativeField(int32_t)
    slot:int32_t;
    @nativeField(NetworkItemStackDescriptor)
    descriptor:NetworkItemStackDescriptor;
    @nativeField(Vec3)
    fromPos:Vec3;
}

export namespace ItemReleaseInventoryTransaction {
    export enum ActionType {
        Release,
        Use,
    }
}
