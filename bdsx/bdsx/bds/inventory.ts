import { abstract } from "../common";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { AbstractClass, nativeClass, NativeClass, nativeField, NativeStruct } from "../nativeclass";
import { bin64_t, bool_t, CxxString, CxxStringWith8Bytes, int16_t, int32_t, NativeType, uint32_t, uint8_t } from "../nativetype";
import { Actor, ActorRuntimeID } from "./actor";
import { Block, BlockLegacy } from "./block";
import { BlockPos, Vec3 } from "./blockpos";
import { CommandName } from "./commandname";
import type { ItemEnchants } from "./enchants";
import { HashedString } from "./hashedstring";
import type { ItemComponent } from "./item_component";
import type { BlockPalette } from "./level";
import { CompoundTag, NBT } from "./nbt";
import type { ServerPlayer } from "./player";
import { proc } from "./symbols";

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
    Feet,
}

export enum CreativeItemCategory {
    All,
    Construction,
    Nature,
    Equipment,
    Items,
    Uncategorized,
}

export enum HandSlot {
    Mainhand = 0,
    Offhand = 1,
}

export class Item extends NativeClass {
    /**
     * Returns whether the item is allowed to be used in the offhand slot
     */
    allowOffhand():boolean {
        abstract();
    }
    getCommandName():string {
        const names = this.getCommandNames2();
        const name = names.get(0)?.name;
        names.destruct();
        if (name == null) throw Error(`item has not any names`);
        return name;
    }
    /** @deprecated Use `this.getCommandNames2()` instead */
    getCommandNames():CxxVector<CxxStringWith8Bytes> {
        abstract();
    }
    getCommandNames2():CxxVector<CommandName> {
        abstract();
    }
    /**
     * Returns the category of the item in creative inventory
     */
    getCreativeCategory():number {
        abstract();
    }
    getArmorValue():number{
        abstract();
    }
    getToughnessValue(): int32_t {
        abstract();
    }
    isDamageable():boolean {
        abstract();
    }
    isFood():boolean {
        abstract();
    }
    isArmor():boolean {
        abstract();
    }
    /**
     * Changes whether the item is allowed to be used in the offhand slot
     *
     * @remarks Will not affect client but allows /replaceitem
     */
    setAllowOffhand(value:boolean):void {
        abstract();
    }
    getSerializedName():CxxString {
        abstract();
    }
    getCooldownType(): HashedString {
        abstract();
    }
}

/**
 * @deprecated rough. don't use it yet.
 */
export class ArmorItem extends Item {
}

export class ComponentItem extends Item {
    getComponent(identifier:string):ItemComponent{
        const hashedStr = HashedString.construct();
        hashedStr.set(identifier);

        const component = this._getComponent(hashedStr);
        hashedStr.destruct();

        return component;
    }
    protected _getComponent(identifier:HashedString): ItemComponent{
        abstract();
    }
    buildNetworkTag():CompoundTag {
        abstract();
    }
    initializeFromNetwork(tag:CompoundTag): void {
        abstract();
    }
}

@nativeClass(0x88)
export class ItemStackBase extends NativeClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(Item.ref().ref())
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
    canDestroy: CxxVector<BlockLegacy>;

    protected _getItem():Item {
        abstract();
    }
    protected _setCustomLore(name:CxxVector<string>):void {
        abstract();
    }
    /**
     * just `ItemStackBase::add` in BDS.
     * but it conflicts to {@link VoidPointer.prototype.add}
     */
    addAmount(amount: number): void {
        abstract();
    }
    remove(amount: number): void{
        abstract();
    }
    getArmorValue(): number{
        const item = this.getItem();
        return item !== null ? item.getArmorValue() : 0;
    }
    setAuxValue(value: number): void{
        abstract();
    }
    getAuxValue():number{
        abstract();
    }
    isValidAuxValue(aux: int32_t): boolean {
        abstract();
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
    setNull():void {
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
     * Returns the item's enchantability
     *
     * @see https://minecraft.fandom.com/wiki/Enchanting_mechanics
     */
    getEnchantValue():number {
        abstract();
    }
    isEnchanted():boolean {
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
    getCustomLore(): string[] {
        abstract();
    }
    /**
     * @remarks The value is applied only to Damageable items
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
    sameItem(item:ItemStack):boolean {
        abstract();
    }
    sameItemAndAux(item: ItemStack): boolean {
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

    /**
     * Only custom items return ComponentItem
     */
    getComponentItem():ComponentItem | null {
        abstract();
    }
    getDamageValue():number {
        abstract();
    }
    getAttackDamage():number {
        abstract();
    }
    save():Record<string, any> {
        const tag = this.allocateAndSave();
        const out = tag.value();
        tag.dispose();
        return out;
    }
    load(tag:CompoundTag|NBT.Compound):void {
        abstract();
    }
    allocateAndSave():CompoundTag {
        abstract();
    }
    constructItemEnchantsFromUserData():ItemEnchants {
        abstract();
    }
    saveEnchantsToUserData(itemEnchants:ItemEnchants):void {
        abstract();
    }
    getCategoryName(): string{
        abstract();
    }
    canDestroySpecial(block: Block): boolean{
        abstract();
    }
    /**
     * Hurts the item's durability.
     * Breaks the item if its durability reaches 0 or less.
     * @param count delta damage
     * @param owner owner of the item, if not null, server will send inventory.
     * @returns returns whether hurt successfully or not
     */
    hurtAndBreak(count: number, owner: Actor|null = null): boolean{
        abstract();
    }
}

@nativeClass(0xa0)
export class ItemStack extends ItemStackBase {
    static readonly EMPTY_ITEM: ItemStack = proc["?EMPTY_ITEM@ItemStack@@2V1@B"].as(ItemStack);
    /**
     * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted, even if the name does not exist, it still returns an ItemStack
     */
    static constructWith(itemName:ItemId, amount?:number, data?:number): ItemStack;
    static constructWith(itemName:string, amount?:number, data?:number): ItemStack;
    static constructWith(itemName:ItemId|string, amount:number = 1, data:number = 0):ItemStack {
        abstract();
    }
    /** @deprecated */
    static create(itemName:string, amount:number = 1, data:number = 0):ItemStack {
        return ItemStack.constructWith(itemName, amount, data);
    }
    static fromDescriptor(descriptor:NetworkItemStackDescriptor, palette:BlockPalette, unknown:boolean):ItemStack {
        abstract();
    }
    static fromTag(tag: CompoundTag|NBT.Compound):ItemStack {
        abstract();
    }

    clone():ItemStack;

    /**
     * @deprecated use clone()
     */
    clone(itemStack: ItemStack):void;

    clone(itemStack?: ItemStack):ItemStack|void {
        abstract();
    }
    /**
     * @deprecated use clone()
     */
    cloneItem(): ItemStack {
        const itemStack = ItemStack.constructWith("minecraft:air");
        this.clone(itemStack);
        return itemStack;
    }
    getDestroySpeed(block: Block): number{
        abstract();
    }
}

export class Container extends NativeClass {
    addItem(item:ItemStack):void {
        abstract();
    }
    addItemToFirstEmptySlot(item:ItemStack):boolean {
        abstract();
    }
    getSlots():CxxVector<ItemStack> {
        abstract();
    }
    getItem(slot:number):ItemStack {
        abstract();
    }
    getItemCount(compare:ItemStack):int32_t {
        abstract();
    }
    getContainerType():ContainerType {
        abstract();
    }
    hasRoomForItem(item:ItemStack):boolean {
        abstract();
    }
    isEmpty():boolean {
        abstract();
    }
    removeAllItems():void {
        abstract();
    }
    removeItem(slot:number, count:number):void {
        abstract();
    }
    setCustomName(name:string):void {
        abstract();
    }
}

export class FillingContainer extends Container {
}
export class SimpleContainer extends Container {
}

export class Inventory extends FillingContainer {
    /**
     * Remove the items in the slot
     * @remarks Requires `player.sendInventory()` to update the slot
     * */
    dropSlot(slot:number, onlyClearContainer:boolean, dropAll:boolean, randomly:boolean):void {
        abstract();
    }
}

export class PlayerUIContainer extends SimpleContainer {
}

export enum PlayerUISlot {
    CursorSelected = 0,
    AnvilInput = 1,
    AnvilMaterial = 2,
    StoneCutterInput = 3,
    Trade2Ingredient1 = 4,
    Trade2Ingredient2 = 5,
    TradeIngredient1 = 6,
    TradeIngredient2 = 7,
    MaterialReducerInput = 8,
    LoomInput = 9,
    LoomDye = 10,
    LoomMaterial = 11,
    CartographyInput = 12,
    CartographyAdditional = 13,
    EnchantingInput = 14,
    EnchantingMaterial = 15,
    GrindstoneInput = 16,
    GrindstoneAdditional = 17,
    CompoundCreatorInput1 = 18,
    CompoundCreatorInput2 = 19,
    CompoundCreatorInput3 = 20,
    CompoundCreatorInput4 = 21,
    CompoundCreatorInput5 = 22,
    CompoundCreatorInput6 = 23,
    CompoundCreatorInput7 = 24,
    CompoundCreatorInput8 = 25,
    CompoundCreatorInput9 = 26,
    BeaconPayment = 27,
    Crafting2x2Input1 = 28,
    Crafting2x2Input2 = 29,
    Crafting2x2Input3 = 30,
    Crafting2x2Input4 = 31,
    Crafting3x3Input1 = 32,
    Crafting3x3Input2 = 33,
    Crafting3x3Input3 = 34,
    Crafting3x3Input4 = 35,
    Crafting3x3Input5 = 36,
    Crafting3x3Input6 = 37,
    Crafting3x3Input7 = 38,
    Crafting3x3Input8 = 39,
    Crafting3x3Input9 = 40,
    MaterialReducerOutput1 = 41,
    MaterialReducerOutput2 = 42,
    MaterialReducerOutput3 = 43,
    MaterialReducerOutput4 = 44,
    MaterialReducerOutput5 = 45,
    MaterialReducerOutput6 = 46,
    MaterialReducerOutput7 = 47,
    MaterialReducerOutput8 = 48,
    MaterialReducerOutput9 = 49,
    CreatedItemOutput = 50,
    SmithingTableInput = 51,
    SmithingTableMaterial = 52,
}

@nativeClass(null)
export class PlayerInventory extends AbstractClass {
    @nativeField(Inventory.ref(), 0xC0) // accessed in PlayerInventory::add
    container:Inventory;

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
        return this.getInt8(0x10); // accessed in PlayerInventory::getSelectedSlot `mov eax, [rcx+10h]`
    }
    getSlotWithItem(itemStack:ItemStack, checkAux:boolean, checkData:boolean):number {
        abstract();
    }
    /**
     * @deprecated Use container.getSlots();
     */
    getSlots():CxxVector<ItemStack> {
        return this.container.getSlots();
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
    /**
     * Removes the items from inventory.
     * @param item item for resource to remove
     * @param requireExactAux if true, will only remove the item if it has the exact same aux value
     * @param requireExactData if true, will only remove the item if it has the exact same data value
     * @param maxCount max number of items to remove
     * @returns number of items not removed
     */
    removeResource(item: ItemStack, requireExactAux: boolean = true, requireExactData: boolean = false, maxCount?: int32_t): int32_t {
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
export class InventorySource extends NativeStruct {
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

@nativeClass(0x48)
export class ItemDescriptor extends AbstractClass {
}

export class ItemStackNetIdVariant extends AbstractClass {
}

@nativeClass(0x98)
export class NetworkItemStackDescriptor extends AbstractClass {
    @nativeField(ItemDescriptor)
    readonly descriptor:ItemDescriptor;
    @nativeField(ItemStackNetIdVariant, 0x58) // accessed in NetworkItemStackDescriptor::tryGetServerNetId
    readonly id:ItemStackNetIdVariant;
    /** @deprecated There seems to be no string inside NetworkItemStackDescriptor anymore */
    @nativeField(CxxString, 0x64)
    _unknown:CxxString;

    static constructWith(itemStack:ItemStack):NetworkItemStackDescriptor {
        abstract();
    }

    /**
     * Calls move constructor of NetworkItemStackDescriptor for `this`
     */
    [NativeType.ctor_move](temp: NetworkItemStackDescriptor): void {
        abstract();
    }
}

@nativeClass()
export class InventoryAction extends AbstractClass {
    @nativeField(InventorySource)
    source:InventorySource;
    @nativeField(uint32_t)
    slot:uint32_t;
    @nativeField(NetworkItemStackDescriptor)
    fromDesc:NetworkItemStackDescriptor; // 0x10
    @nativeField(NetworkItemStackDescriptor)
    toDesc:NetworkItemStackDescriptor; // 0xa8
    @nativeField(ItemStack)
    from:ItemStack; // 0x140
    @nativeField(ItemStack)
    to:ItemStack; // 0x1e0
}

@nativeClass(0x18)
export class InventoryTransactionItemGroup extends AbstractClass {
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
export class InventoryTransaction extends AbstractClass {
    // @nativeField(CxxUnorderedMap.make(InventorySource, CxxVector.make(InventoryAction)))
    // actions:CxxUnorderedMap<InventorySource, CxxVector<InventoryAction>>;
    @nativeField(CxxVector.make(InventoryTransactionItemGroup), 0x40) // accessed in InventoryTransaction::~InventoryTransaction when calling std::vector<InventoryTransactionItemGroup>::_Tidy
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
export class ComplexInventoryTransaction extends AbstractClass {
    @nativeField(VoidPointer)
    vftable:VoidPointer;
    @nativeField(uint8_t)
    type:ComplexInventoryTransaction.Type;
    @nativeField(InventoryTransaction)
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
}
ComplexInventoryTransaction.setResolver(ptr=>{
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
});

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
    readonly pos:BlockPos;
    @nativeField(uint32_t)
    targetBlockId:uint32_t;
    @nativeField(int32_t)
    face:int32_t;
    @nativeField(int32_t)
    slot:int32_t;
    @nativeField(NetworkItemStackDescriptor)
    readonly descriptor:NetworkItemStackDescriptor;
    @nativeField(Vec3)
    readonly fromPos:Vec3;
    /**
     * relative clicked coordinate from the block.
     * range: 0 <= x <= 1
     */
    @nativeField(Vec3)
    readonly clickPos:Vec3;
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
    readonly fromPos:Vec3;
    @nativeField(Vec3)
    readonly hitPos:Vec3;
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
    readonly fromPos:Vec3;
}

export namespace ItemReleaseInventoryTransaction {
    export enum ActionType {
        Release,
        Use,
    }
}
