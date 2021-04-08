import { abstract } from "bdsx/common";
import { NativeClass } from "bdsx/nativeclass";
import { uint8_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { ServerPlayer } from "..";
import { Vec3 } from "./blockpos";
import { CompoundTag } from "./nbt";

export enum ContainerId {
    Inventory = 0,
    First = 1,
    Last = 100,
    Offhand = 119,
    Armor = 120,
    Hotbar = 122,
    FixedInventory = 123,
    UI = 124
}

export enum CreativeItemCategory {
    Construction = 1,
    Nature = 2,
    Items = 4,
    Uncategorized = 5,
}

export class Item extends NativeClass {
    protected _getCommandName():CxxStringWrapper {
        abstract();
    }
    allowOffhand():boolean {
        abstract();
    }
    getCommandName():string {
        return this._getCommandName().value;
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


export class ItemStack extends NativeClass {
    amount:uint8_t;
    protected _getId():number {
        abstract();
    }
    protected _getItem():Item {
        abstract();
    }
    protected _getCustomName():CxxStringWrapper {
        abstract();
    }
    protected _setCustomName(name:CxxStringWrapper):void {
        abstract();
    }
    protected _setCustomLore(num:number, name:CxxStringWrapper):void {
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
        return this._getId() << 16 >> 16; // TODO: Fix this when there is a wrapper for Short
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
            return "minecraft:" + item.getCommandName();
        }
        return "minecraft:air";
    }
    hasCustomName():boolean {
        abstract();
    }
    getCustomName(): string {
        const name = this._getCustomName();
        const out = name.value;
        name.destruct();
        return out;
    }
    setCustomName(name:string):void {
        const _name = new CxxStringWrapper(true);
        _name.construct();
        _name.value = name;
        this._setCustomName(_name);
        _name.destruct();
    }
    getUserData():CompoundTag {
        abstract();
    }
    getEnchantValue(): number {
        abstract();
    }
    isEnchanted(): boolean {
        abstract();
    }
    // setCustomLore(lore:string, num:number):void {
    //     abstract();
    // }

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
    getItem(slot:number, containerId: ContainerId):ItemStack {
        abstract();
    }
}