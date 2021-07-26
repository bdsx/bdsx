import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, CxxStringWith8Bytes, int16_t, int32_t, uint32_t, uint8_t } from "../nativetype";
import { Block, BlockLegacy } from "./block";
import { CommandName } from "./commandname";
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
    UI
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

@nativeClass(0x89)
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
    @nativeField(bin64_t, 0x28)
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
    protected _getItem():Item {
        abstract();
    }
    protected _setCustomLore(name:CxxVector<string>):void {
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
    setUserData(tag:CompoundTag):void {
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
        const cxxvector = (CxxVector.make(CxxString)).construct();
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
}

export class PlayerInventory extends NativeClass {
    addItem(itemStack:ItemStack, v:boolean):boolean {
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
    getSlotWithItem(itemStack:ItemStack, v2:boolean, v3:boolean):number {
        abstract();
    }
    getSlots():CxxVector<ItemStack> {
        abstract();
    }
    selectSlot(slot:number, containerId:ContainerId):void {
        abstract();
    }
    setItem(slot:number, itemStack:ItemStack, containerId:ContainerId, v:boolean):void {
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

@nativeClass()
export class InventoryAction extends NativeClass {
    @nativeField(InventorySource)
    source:InventorySource;
    @nativeField(uint32_t, 0x0C)
    slot:uint32_t;
    @nativeField(ItemStack, 272)
    from:ItemStack;
    @nativeField(ItemStack, 416)
    to:ItemStack;
}

@nativeClass(0x15)
export class InventoryTransactionItemGroup extends NativeClass {
    @nativeField(int16_t)
    itemId:int16_t;
    @nativeField(int16_t, 0x04)
    itemAux:int16_t;
    @nativeField(CompoundTag.ref(), 0x08)
    tag:CompoundTag;
    @nativeField(int32_t, 0x10)
    count:int32_t;
    @nativeField(bool_t)
    overflow:bool_t;

    /** When the item is dropped this is air, it should be the item when it is picked up */
    getItemStack():ItemStack {
        abstract();
    }
}

@nativeClass()
export class InventoryTransaction extends NativeClass {
    // Hope we have CxxUnorderMap class one day
    //@nativeField(CxxUnorderMap.make(InventorySource.ref(), CxxVector.make(InventoryTransactionItemGroup.ref())))
    //actions:CxxUnorderMap<InventorySource, CxxVector<InventoryAction>>;
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
    @nativeField(uint8_t, 0x08)
    type:uint8_t;
    @nativeField(InventoryTransaction, 0x10)
    data:InventoryTransaction;
}
