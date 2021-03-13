import { abstract } from "bdsx/common";
import { NativeClass } from "bdsx/nativeclass";
import { uint8_t } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";

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

export class ItemStack extends NativeClass {
    amount:uint8_t;
    protected _getId():number {
        abstract();
    }
    protected _getItem():Item {
        abstract();
    }
    protected _setCustomName(name:CxxStringWrapper):void {
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
    getId():number {
        const id = this._getId();
        if (id > 32767) {
            return 255 + (65536 - id); // TODO: Fix this when there is a wrapper for Short
        }
        return id;
    }
    getItem():Item|null {
        if (this.isNull()) {
            return null;
        }
        return this._getItem();
    }
    getName():string {
        return "minecraft:" + this.getItem()?.getCommandName() ?? "air";
    }
    hasCustomName():boolean {
        abstract();
    }
    setAmount(amount:number):void {
        this.amount = amount;
    }
    setCustomName(name:string):void {
        const _name = new CxxStringWrapper(true);
        _name.construct();
        _name.value = name;
        this._setCustomName(_name);
        _name.destruct();
    }
}

export class PlayerInventory extends NativeClass {
    getItem(slot:number, containerId: ContainerId):ItemStack {
        abstract();
    }
}
