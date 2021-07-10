import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, int16_t, int32_t, uint16_t, uint32_t, uint8_t } from "../nativetype";
import { CompoundTag } from "./nbt";
import type { ServerPlayer } from "./player";

export enum ContainerId {
    Inventory = 0,
    /**
     * @deprecated
     */
    First = 1,
    /**
     * @deprecated
     */
    Last = 100,
    /**
     * @deprecated
     */
    Offhand = 119,
    /**
     * @deprecated
     */
    Armor,
    /**
     * @deprecated
     */
    Creative,
    /**
     * @deprecated
     */
    Hotbar,
    /**
     * @deprecated
     */
    FixedInventory,
    /**
     * @deprecated
     */
    UI
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
    getCommandNames():CxxVector<string> {
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
    @nativeField(uint8_t, 0x22)
    amount:uint8_t;
    @nativeField(uint16_t, 0x28)
    pickupTime:uint16_t;
    /**
     * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted
     */
    static create(itemName:string, amount:number = 1, data:number = 0): ItemStack {
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
        if (item) {
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
        } else lores.forEach((v)=>{
            cxxvector.push(v);
        });
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

    static create(containerId:ContainerId):InventorySource {
        const source = new InventorySource(true);
        source.type = InventorySourceType.ContainerInventory;
        source.containerId = containerId;
        source.flags = InventorySourceFlags.NoFlag;
        return source;
    }
}

@nativeClass(0x121)
export class InventoryAction extends NativeClass {
    @nativeField(InventorySource)
    source:InventorySource;
    @nativeField(uint32_t, 0xC)
    slot:uint32_t;
    @nativeField(ItemStack, 0x10)
    from:ItemStack;
    @nativeField(ItemStack, 0x98)
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
