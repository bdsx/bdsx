import { abstract } from "bdsx/common";
import { NativeClass } from "bdsx/nativeclass";
import { CxxString, int32_t, uint8_t } from "bdsx/nativetype";
import { CxxVector } from "../cxxvector";
import { CompoundTag } from "./nbt";
import type { Player, ServerPlayer } from "./player";

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
    Armor = 120,
    /**
     * @deprecated
     */
    Hotbar = 122,
    /**
     * @deprecated
     */
    FixedInventory = 123,
    /**
     * @deprecated
     */
    UI = 124
}

export enum ArmorSlot {
    Head,
    Chest,
    Legs,
    Feet
}

export enum CreativeItemCategory {
    Construction = 1,
    Nature = 2,
    Items = 4,
    Uncategorized = 5,
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


export class ItemStackBase extends NativeClass {
    amount:uint8_t;
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
    sameItem(item:ItemStackBase):boolean {
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

export class ItemStack extends ItemStackBase {
    /**
     * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted
     */
    static create(itemName: CxxString, amount: int32_t = 1, data: int32_t = 0): ItemStack {
        abstract();
    }
}

export class PlayerInventory extends NativeClass {
    addItem(itemStack:ItemStackBase, v:boolean):boolean {
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
    getItem(slot:number, containerId:ContainerId):ItemStackBase {
        abstract();
    }
    getSelectedItem():ItemStackBase {
        abstract();
    }
    getSelectedSlot():number {
        return this.getInt8(0x10);
    }
    getSlotWithItem(itemStack:ItemStackBase, v2:boolean, v3:boolean):number {
        abstract();
    }
    getSlots():CxxVector<ItemStackBase> {
        abstract();
    }
    selectSlot(slot:number, containerId:ContainerId):void {
        abstract();
    }
    setItem(slot:number, itemStack:ItemStackBase, containerId:ContainerId, v:boolean):void {
        abstract();
    }
    setSelectedItem(itemStack:ItemStackBase):void {
        abstract();
    }
    swapSlots(primarySlot:number, secondarySlot:number):void {
        abstract();
    }
}
