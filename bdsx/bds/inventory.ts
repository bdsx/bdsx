import { abstract } from "bdsx/common";
import { NativeClass } from "bdsx/nativeclass";
import { CxxString, uint8_t } from "bdsx/nativetype";
import { CxxVector } from "../cxxvector";
import { Block, BlockLegacy } from "./block";
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

    // TODO:
    // private: static class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> CompoundItem::_getName(enum  CompoundType)
    // private: void CompoundItem::_registerSpecialCompound(class ItemInstance const &, enum  CompoundType)
    // private: void CompoundItem::_registerSpecialCompounds(void)
    // public: virtual class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> CompoundItem::buildDescriptionId(class ItemDescriptor const &, class CompoundTag const *)
    // static enum  CompoundType CompoundItem::getCompoundType(class ItemDescriptor const &)
    // public: virtual struct TextureUVCoordinateSet const & CompoundItem::getIcon(class ItemStackBase const &, int, bool)
    // public: static class RecipeIngredient CompoundItem::getIngredientForCompound(enum  CompoundType)
    // public: static class ItemInstance CompoundItem::getItemForCompound(enum  CompoundType, int)
    // public: static bool CompoundItem::isCompoundItem(class ItemStackBase const &)
}

// export class ItemStack extends NativeClass {

//     TODO:
//     public: ItemStack::ItemStack(void)
//     public: ItemStack::ItemStack(class gsl::basic_string_span<char const, -1>, int, int, class CompoundTag const *)
//     ItemStack::ItemStack(class ItemStack const &)
//     ItemStack::ItemStack(class BlockLegacy const &, int)
//     ItemStack::ItemStack(class Block const &, int, class CompoundTag const *)
//     public: virtual ItemStack::~ItemStack(void)
//     public: bool ItemStack::useOn(class Actor &, int, int, int, unsigned char, float, float, float)
//     public: void ItemStack::useAsFuel(void)
//     public: virtual class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> ItemStack::toString(void)
//     public: virtual class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> ItemStack::toDebugString(void)
//     public: virtual void ItemStack::setNull(void)
//     public: void ItemStack::serverInitNetId(void)
//     public: bool ItemStack::sameItemAndAuxAndBlockData(class ItemStack const &)
//     public: virtual void ItemStack::reinit(class gsl::basic_string_span<char const, -1>, int, int)
//     public: virtual void ItemStack::reinit(class Item const &, int, int)
//     public: virtual void ItemStack::reinit(class BlockLegacy const &, int)
//     public: class ItemStack & ItemStack::operator=(class ItemStack const &)
//     public: bool ItemStack::matchesNetIdVariant(class ItemStack const &)
//     public: bool ItemStack::matchesAndNetIdVariantMatches(class ItemStack const &)
//     public: class ItemStack ItemStack::getStrippedNetworkItem(void)
//     public: static class ItemStack ItemStack::fromTag(class CompoundTag const &, class Level &)
//     public: static class ItemStack ItemStack::fromTag(class CompoundTag const &)
//     public: void ItemStack::clientInitRequestId(class TypedClientNetId<struct ItemStackRequestIdTag, int, 0> const &)
//     public: void ItemStack::_assignNetIdVariant(class ItemStack const &)
//     public: void ItemStack::__autoclassinit2(unsigned __int64)
// }


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
            return "minecraft:" + item.getCommandName();
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
        const cxxvector = new CxxVectorString(true);
        cxxvector.construct();
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
    sameItem(id:number, data:number):boolean {
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

    getDescriptionId():string{
        abstract();
    }

    _setItem(int:number, bool:boolean):boolean{
        abstract();
    }

    set(id:number):void{
        abstract();
    }

    // ItemStackBase(v:void|Item|ItemStackBase|BlockLegacy|Block):this{
    //     abstract();
    // }

    init(int1:number, int2:number, int3:number, compoundTag:CompoundTag):void{
        abstract();
    }

    initItem(v:Item, int1:number, int2:number, compoundTag:CompoundTag):void{
        abstract();
    }

    initLegacy(v:BlockLegacy, int:number):void{
        abstract();
    }

    resetHoverName():void{
        abstract();
    }

    //  TODO:
    // 'public: class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> ItemStackBase::getRawNameId(void)',
    // 'protected: class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> ItemStackBase::_getHoverFormattingPrefix(void)',
    // 'public: int ItemStackBase::getBaseRepairCost(void)',
    // 'public: void ItemStackBase::setRepairCost(int)',
    // 'public: bool ItemStackBase::hasSameUserData(class ItemStackBase const &)',
    // 'public: bool ItemStackBase::hasSameAuxValue(class ItemStackBase const &)',
    // 'public: void ItemStackBase::setUserData(class std::unique_ptr<class CompoundTag, struct std::default_delete<class CompoundTag>>)',
    // 'public: class std::unique_ptr<class CompoundTag, struct std::default_delete<class CompoundTag>> ItemStackBase::getNetworkUserData(void)',
    // 'public: void ItemStackBase::addCustomUserData(class BlockActor &, class BlockSource &)',
    // 'public: enum  ArmorSlot ItemStackBase::getArmorSlot(void)const',
    // 'public: virtual ItemStackBase::~ItemStackBase(void)',
    // 'public: bool ItemStackBase::updateComponent(class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> const &, class Json::Value const &)',
    // 'public: virtual class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> ItemStackBase::toString(void)',
    // 'public: virtual class std::basic_string<char, struct std::char_traits<char>, class std::allocator<char>> ItemStackBase::toDebugString(void)',
    // 'public: virtual void ItemStackBase::setNull(void)',
    // 'public: void ItemStackBase::setChargedItem(class ItemInstance const &, bool)',
    // 'public: void ItemStackBase::serializeComponents(class IDataOutput &)',
    // 'public: void ItemStackBase::saveEnchantsToUserData(class ItemEnchants const &)',
    // 'public: class std::unique_ptr<class CompoundTag, struct std::default_delete<class CompoundTag>> ItemStackBase::save(void)',
    // 'public: bool ItemStackBase::sameItemAndAux(class ItemStackBase const &)',
    // 'protected: class ItemStackBase & ItemStackBase::operator=(class ItemStackBase const &)',
    // 'public: bool ItemStackBase::operator!=(class ItemStackBase const &)',
    // 'public: bool ItemStackBase::matchesItem(class ItemStackBase const &)',
    // 'public: bool ItemStackBase::matchesEitherWearableCase(class CompoundTag const *)',
    // 'public: bool ItemStackBase::matches(class ItemStackBase const &)',
    // 'public: bool ItemStackBase::isOneOfInstances(class std::vector<class HashedString, class std::allocator<class HashedString>>, bool)',
}

export const ItemStack = ItemStackBase;

export class PlayerInventory extends NativeClass {
    addItem(ItemStackBase:ItemStackBase, v:boolean):boolean {
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
    getSlotWithItem(ItemStackBase:ItemStackBase, v2:boolean, v3:boolean):number {
        abstract();
    }
    getSlots():CxxVector<ItemStackBase> {
        abstract();
    }
    selectSlot(slot:number, containerId:ContainerId):void {
        abstract();
    }
    setItem(slot:number, ItemStackBase:ItemStackBase, containerId:ContainerId, v:boolean):void {
        abstract();
    }
    setSelectedItem(ItemStackBase:ItemStackBase):void {
        abstract();
    }
    swapSlots(primarySlot:number, secondarySlot:number):void {
        abstract();
    }
}
