"use strict";
var ItemStack_1, InventorySource_1, ComplexInventoryTransaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemReleaseInventoryTransaction = exports.ItemUseOnActorInventoryTransaction = exports.ItemUseInventoryTransaction = exports.ComplexInventoryTransaction = exports.InventoryTransaction = exports.InventoryTransactionItemGroup = exports.InventoryAction = exports.NetworkItemStackDescriptor = exports.ItemStackNetIdVariant = exports.ItemDescriptor = exports.InventorySource = exports.InventorySourceFlags = exports.InventorySourceType = exports.PlayerInventory = exports.ItemStack = exports.ComponentItem = exports.Item = exports.CreativeItemCategory = exports.ArmorSlot = exports.ContainerType = exports.ContainerId = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const makefunc_1 = require("../makefunc");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const actor_1 = require("./actor");
const block_1 = require("./block");
const blockpos_1 = require("./blockpos");
const nbt_1 = require("./nbt");
const minecraft = require("../minecraft");
const enums = require("../enums");
/** @deprecated import it from 'bdsx/enums' */
exports.ContainerId = enums.ContainerId;
/** @deprecated import it from 'bdsx/minecraft' */
exports.ContainerType = minecraft.ContainerType;
/** @deprecated import it from 'bdsx/minecraft' */
exports.ArmorSlot = minecraft.ArmorSlot;
/** @deprecated import it from 'bdsx/minecraft' */
exports.CreativeItemCategory = minecraft.CreativeItemCategory;
class Item extends nativeclass_1.NativeClass {
    allowOffhand() {
        (0, common_1.abstract)();
    }
    getCommandName() {
        const names = this.getCommandNames();
        const name = names.get(0);
        names.destruct();
        if (name === null)
            throw Error(`item has not any names`);
        return name;
    }
    /** @deprecated use getCommandNames2 */
    getCommandNames() {
        (0, common_1.abstract)();
    }
    getCommandNames2() {
        (0, common_1.abstract)();
    }
    getCreativeCategory() {
        (0, common_1.abstract)();
    }
    isDamageable() {
        (0, common_1.abstract)();
    }
    isFood() {
        (0, common_1.abstract)();
    }
    /**
     * Will not affect client but allows /replaceitem
     */
    setAllowOffhand(value) {
        (0, common_1.abstract)();
    }
}
exports.Item = Item;
class ComponentItem extends nativeclass_1.NativeClass {
}
exports.ComponentItem = ComponentItem;
let ItemStack = ItemStack_1 = class ItemStack extends nativeclass_1.NativeClass {
    /**
     * @param itemName Formats like 'minecraft:apple' and 'apple' are both accepted, even if the name does not exist, it still returns an ItemStack
     */
    static create(itemName, amount = 1, data = 0) {
        (0, common_1.abstract)();
    }
    static fromDescriptor(descriptor, palette, unknown) {
        (0, common_1.abstract)();
    }
    _getItem() {
        (0, common_1.abstract)();
    }
    _setCustomLore(name) {
        (0, common_1.abstract)();
    }
    _cloneItem(itemStack) {
        (0, common_1.abstract)();
    }
    _getArmorValue() {
        (0, common_1.abstract)();
    }
    getArmorValue() {
        if (!this.isArmorItem)
            return 0;
        return this._getArmorValue();
    }
    setAuxValue(value) {
        (0, common_1.abstract)();
    }
    getAuxValue() {
        (0, common_1.abstract)();
    }
    cloneItem() {
        const itemStack = ItemStack_1.create('air');
        this._cloneItem(itemStack);
        return itemStack;
    }
    getMaxStackSize() {
        (0, common_1.abstract)();
    }
    toString() {
        (0, common_1.abstract)();
    }
    toDebugString() {
        (0, common_1.abstract)();
    }
    isBlock() {
        (0, common_1.abstract)();
    }
    isNull() {
        (0, common_1.abstract)();
    }
    getAmount() {
        return this.amount;
    }
    setAmount(amount) {
        this.amount = amount;
    }
    getId() {
        (0, common_1.abstract)();
    }
    getItem() {
        if (this.isNull()) {
            return null;
        }
        return this._getItem();
    }
    getName() {
        const item = this.getItem();
        if (item != null) {
            const Name = item.getCommandName();
            if (Name.includes(":"))
                return Name;
            else
                return "minecraft:" + Name;
        }
        return "minecraft:air";
    }
    getRawNameId() {
        (0, common_1.abstract)();
    }
    hasCustomName() {
        (0, common_1.abstract)();
    }
    getCustomName() {
        (0, common_1.abstract)();
    }
    setCustomName(name) {
        (0, common_1.abstract)();
    }
    getUserData() {
        (0, common_1.abstract)();
    }
    /**
     * it returns the enchantability.
     * (See enchantability on https://minecraft.fandom.com/wiki/Enchanting_mechanics)
     */
    getEnchantValue() {
        (0, common_1.abstract)();
    }
    isEnchanted() {
        (0, common_1.abstract)();
    }
    setCustomLore(lores) {
        const CxxVectorString = cxxvector_1.CxxVector.make(nativetype_1.CxxString);
        const cxxvector = CxxVectorString.construct();
        if (typeof lores === "string") {
            cxxvector.push(lores);
        }
        else {
            cxxvector.push(...lores);
        }
        this._setCustomLore(cxxvector);
        cxxvector.destruct();
    }
    /**
     * Value is applied only to Damageable items
     */
    setDamageValue(value) {
        (0, common_1.abstract)();
    }
    setItem(id) {
        (0, common_1.abstract)();
    }
    startCoolDown(player) {
        (0, common_1.abstract)();
    }
    load(compoundTag) {
        (0, common_1.abstract)();
    }
    sameItem(item) {
        (0, common_1.abstract)();
    }
    isStackedByData() {
        (0, common_1.abstract)();
    }
    isStackable() {
        (0, common_1.abstract)();
    }
    isPotionItem() {
        (0, common_1.abstract)();
    }
    isPattern() {
        (0, common_1.abstract)();
    }
    isMusicDiscItem() {
        (0, common_1.abstract)();
    }
    isLiquidClipItem() {
        (0, common_1.abstract)();
    }
    isHorseArmorItem() {
        (0, common_1.abstract)();
    }
    isGlint() {
        (0, common_1.abstract)();
    }
    isFullStack() {
        (0, common_1.abstract)();
    }
    isFireResistant() {
        (0, common_1.abstract)();
    }
    isExplodable() {
        (0, common_1.abstract)();
    }
    isDamaged() {
        (0, common_1.abstract)();
    }
    isDamageableItem() {
        (0, common_1.abstract)();
    }
    isArmorItem() {
        (0, common_1.abstract)();
    }
    isWearableItem() {
        (0, common_1.abstract)();
    }
    getMaxDamage() {
        (0, common_1.abstract)();
    }
    getComponentItem() {
        (0, common_1.abstract)();
    }
    getDamageValue() {
        (0, common_1.abstract)();
    }
    getAttackDamage() {
        (0, common_1.abstract)();
    }
    constructItemEnchantsFromUserData() {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], ItemStack.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(Item.ref())
], ItemStack.prototype, "item", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nbt_1.CompoundTag.ref())
], ItemStack.prototype, "userData", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(block_1.Block.ref())
], ItemStack.prototype, "block", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int16_t)
], ItemStack.prototype, "aux", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], ItemStack.prototype, "amount", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], ItemStack.prototype, "valid", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t, { offset: 0x04, relative: true })
], ItemStack.prototype, "pickupTime", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], ItemStack.prototype, "showPickup", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(block_1.BlockLegacy.ref()), 0x38)
], ItemStack.prototype, "canPlaceOn", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(block_1.BlockLegacy.ref()), 0x58)
], ItemStack.prototype, "canDestroy", void 0);
ItemStack = ItemStack_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x90)
], ItemStack);
exports.ItemStack = ItemStack;
class PlayerInventory extends nativeclass_1.NativeClass {
    addItem(itemStack, linkEmptySlot) {
        (0, common_1.abstract)();
    }
    clearSlot(slot, containerId) {
        (0, common_1.abstract)();
    }
    getContainerSize(containerId) {
        (0, common_1.abstract)();
    }
    getFirstEmptySlot() {
        (0, common_1.abstract)();
    }
    getHotbarSize() {
        (0, common_1.abstract)();
    }
    getItem(slot, containerId) {
        (0, common_1.abstract)();
    }
    getSelectedItem() {
        (0, common_1.abstract)();
    }
    getSelectedSlot() {
        return this.getInt8(0x10);
    }
    getSlotWithItem(itemStack, checkAux, checkData) {
        (0, common_1.abstract)();
    }
    getSlots() {
        (0, common_1.abstract)();
    }
    selectSlot(slot, containerId) {
        (0, common_1.abstract)();
    }
    setItem(slot, itemStack, containerId, linkEmptySlot) {
        (0, common_1.abstract)();
    }
    setSelectedItem(itemStack) {
        (0, common_1.abstract)();
    }
    swapSlots(primarySlot, secondarySlot) {
        (0, common_1.abstract)();
    }
}
exports.PlayerInventory = PlayerInventory;
var InventorySourceType;
(function (InventorySourceType) {
    InventorySourceType[InventorySourceType["InvalidInventory"] = -1] = "InvalidInventory";
    InventorySourceType[InventorySourceType["ContainerInventory"] = 0] = "ContainerInventory";
    InventorySourceType[InventorySourceType["GlobalInventory"] = 1] = "GlobalInventory";
    InventorySourceType[InventorySourceType["WorldInteraction"] = 2] = "WorldInteraction";
    InventorySourceType[InventorySourceType["CreativeInventory"] = 3] = "CreativeInventory";
    InventorySourceType[InventorySourceType["UntrackedInteractionUI"] = 100] = "UntrackedInteractionUI";
    InventorySourceType[InventorySourceType["NonImplementedFeatureTODO"] = 99999] = "NonImplementedFeatureTODO";
})(InventorySourceType = exports.InventorySourceType || (exports.InventorySourceType = {}));
var InventorySourceFlags;
(function (InventorySourceFlags) {
    InventorySourceFlags[InventorySourceFlags["NoFlag"] = 0] = "NoFlag";
    InventorySourceFlags[InventorySourceFlags["WorldInteractionRandom"] = 1] = "WorldInteractionRandom";
})(InventorySourceFlags = exports.InventorySourceFlags || (exports.InventorySourceFlags = {}));
let InventorySource = InventorySource_1 = class InventorySource extends nativeclass_1.NativeClass {
    static create(containerId, type = InventorySourceType.ContainerInventory) {
        const source = new InventorySource_1(true);
        source.type = type;
        source.containerId = containerId;
        source.flags = InventorySourceFlags.NoFlag;
        return source;
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], InventorySource.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], InventorySource.prototype, "containerId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], InventorySource.prototype, "flags", void 0);
InventorySource = InventorySource_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], InventorySource);
exports.InventorySource = InventorySource;
//@nativeClass(0x48)
class ItemDescriptor extends nativeclass_1.NativeClass {
}
exports.ItemDescriptor = ItemDescriptor;
class ItemStackNetIdVariant extends nativeclass_1.NativeClass {
}
exports.ItemStackNetIdVariant = ItemStackNetIdVariant;
let NetworkItemStackDescriptor = class NetworkItemStackDescriptor extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(ItemDescriptor)
], NetworkItemStackDescriptor.prototype, "descriptor", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(ItemStackNetIdVariant, 0x54)
], NetworkItemStackDescriptor.prototype, "id", void 0);
NetworkItemStackDescriptor = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x80)
], NetworkItemStackDescriptor);
exports.NetworkItemStackDescriptor = NetworkItemStackDescriptor;
let InventoryAction = class InventoryAction extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(InventorySource)
], InventoryAction.prototype, "source", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], InventoryAction.prototype, "slot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(NetworkItemStackDescriptor)
], InventoryAction.prototype, "fromDesc", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(NetworkItemStackDescriptor)
], InventoryAction.prototype, "toDesc", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(ItemStack)
], InventoryAction.prototype, "from", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(ItemStack)
], InventoryAction.prototype, "to", void 0);
InventoryAction = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], InventoryAction);
exports.InventoryAction = InventoryAction;
let InventoryTransactionItemGroup = class InventoryTransactionItemGroup extends nativeclass_1.NativeClass {
    /** When the item is dropped this is air, it should be the item when it is picked up */
    getItemStack() {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], InventoryTransactionItemGroup.prototype, "itemId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], InventoryTransactionItemGroup.prototype, "itemAux", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nbt_1.CompoundTag.ref())
], InventoryTransactionItemGroup.prototype, "tag", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], InventoryTransactionItemGroup.prototype, "count", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], InventoryTransactionItemGroup.prototype, "overflow", void 0);
InventoryTransactionItemGroup = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x18)
], InventoryTransactionItemGroup);
exports.InventoryTransactionItemGroup = InventoryTransactionItemGroup;
let InventoryTransaction = class InventoryTransaction extends nativeclass_1.NativeClass {
    /** The packet will be cancelled if this is added wrongly */
    addItemToContent(item, count) {
        (0, common_1.abstract)();
    }
    getActions(source) {
        return this._getActions(source).toArray();
    }
    _getActions(source) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(InventoryTransactionItemGroup), 0x40)
], InventoryTransaction.prototype, "content", void 0);
InventoryTransaction = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x58)
], InventoryTransaction);
exports.InventoryTransaction = InventoryTransaction;
let ComplexInventoryTransaction = ComplexInventoryTransaction_1 = class ComplexInventoryTransaction extends nativeclass_1.NativeClass {
    isItemUseTransaction() {
        return this.type === ComplexInventoryTransaction_1.Type.ItemUseTransaction;
    }
    isItemUseOnEntityTransaction() {
        return this.type === ComplexInventoryTransaction_1.Type.ItemUseOnEntityTransaction;
    }
    isItemReleaseTransaction() {
        return this.type === ComplexInventoryTransaction_1.Type.ItemReleaseTransaction;
    }
    static [nativetype_1.NativeType.getter](ptr, offset) {
        return ComplexInventoryTransaction_1._toVariantType(ptr.add(offset, offset >> 31));
    }
    static [makefunc_1.makefunc.getFromParam](stackptr, offset) {
        return ComplexInventoryTransaction_1._toVariantType(stackptr.getNullablePointer(offset));
    }
    static _toVariantType(ptr) {
        if (ptr === null)
            return null;
        const transaction = ptr.as(ComplexInventoryTransaction_1);
        switch (transaction.type) {
            case ComplexInventoryTransaction_1.Type.ItemUseTransaction:
                return ptr.as(ItemUseInventoryTransaction);
            case ComplexInventoryTransaction_1.Type.ItemUseOnEntityTransaction:
                return ptr.as(ItemUseOnActorInventoryTransaction);
            case ComplexInventoryTransaction_1.Type.ItemReleaseTransaction:
                return ptr.as(ItemReleaseInventoryTransaction);
            default:
                return transaction;
        }
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], ComplexInventoryTransaction.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], ComplexInventoryTransaction.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(InventoryTransaction, 0x10)
], ComplexInventoryTransaction.prototype, "data", void 0);
ComplexInventoryTransaction = ComplexInventoryTransaction_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], ComplexInventoryTransaction);
exports.ComplexInventoryTransaction = ComplexInventoryTransaction;
(function (ComplexInventoryTransaction) {
    ComplexInventoryTransaction.Type = minecraft.ComplexInventoryTransaction.Type;
})(ComplexInventoryTransaction = exports.ComplexInventoryTransaction || (exports.ComplexInventoryTransaction = {}));
exports.ComplexInventoryTransaction = ComplexInventoryTransaction;
let ItemUseInventoryTransaction = class ItemUseInventoryTransaction extends ComplexInventoryTransaction {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ItemUseInventoryTransaction.prototype, "actionType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.BlockPos)
], ItemUseInventoryTransaction.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ItemUseInventoryTransaction.prototype, "targetBlockId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ItemUseInventoryTransaction.prototype, "face", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ItemUseInventoryTransaction.prototype, "slot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(NetworkItemStackDescriptor, { offset: 0x04, relative: true })
], ItemUseInventoryTransaction.prototype, "descriptor", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], ItemUseInventoryTransaction.prototype, "fromPos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], ItemUseInventoryTransaction.prototype, "clickPos", void 0);
ItemUseInventoryTransaction = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemUseInventoryTransaction);
exports.ItemUseInventoryTransaction = ItemUseInventoryTransaction;
(function (ItemUseInventoryTransaction) {
    /** @deprecated */
    ItemUseInventoryTransaction.ActionType = minecraft.ItemUseInventoryTransaction.ActionType;
})(ItemUseInventoryTransaction = exports.ItemUseInventoryTransaction || (exports.ItemUseInventoryTransaction = {}));
exports.ItemUseInventoryTransaction = ItemUseInventoryTransaction;
let ItemUseOnActorInventoryTransaction = class ItemUseOnActorInventoryTransaction extends ComplexInventoryTransaction {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], ItemUseOnActorInventoryTransaction.prototype, "runtimeId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ItemUseOnActorInventoryTransaction.prototype, "actionType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ItemUseOnActorInventoryTransaction.prototype, "slot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(NetworkItemStackDescriptor)
], ItemUseOnActorInventoryTransaction.prototype, "descriptor", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], ItemUseOnActorInventoryTransaction.prototype, "fromPos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], ItemUseOnActorInventoryTransaction.prototype, "hitPos", void 0);
ItemUseOnActorInventoryTransaction = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemUseOnActorInventoryTransaction);
exports.ItemUseOnActorInventoryTransaction = ItemUseOnActorInventoryTransaction;
(function (ItemUseOnActorInventoryTransaction) {
    /** @deprecated */
    ItemUseOnActorInventoryTransaction.ActionType = minecraft.ItemUseOnActorInventoryTransaction.ActionType;
})(ItemUseOnActorInventoryTransaction = exports.ItemUseOnActorInventoryTransaction || (exports.ItemUseOnActorInventoryTransaction = {}));
exports.ItemUseOnActorInventoryTransaction = ItemUseOnActorInventoryTransaction;
let ItemReleaseInventoryTransaction = class ItemReleaseInventoryTransaction extends ComplexInventoryTransaction {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ItemReleaseInventoryTransaction.prototype, "actionType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ItemReleaseInventoryTransaction.prototype, "slot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(NetworkItemStackDescriptor)
], ItemReleaseInventoryTransaction.prototype, "descriptor", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], ItemReleaseInventoryTransaction.prototype, "fromPos", void 0);
ItemReleaseInventoryTransaction = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemReleaseInventoryTransaction);
exports.ItemReleaseInventoryTransaction = ItemReleaseInventoryTransaction;
(function (ItemReleaseInventoryTransaction) {
    /** @deprecated */
    ItemReleaseInventoryTransaction.ActionType = minecraft.ItemReleaseInventoryTransaction.ActionType;
})(ItemReleaseInventoryTransaction = exports.ItemReleaseInventoryTransaction || (exports.ItemReleaseInventoryTransaction = {}));
exports.ItemReleaseInventoryTransaction = ItemReleaseInventoryTransaction;
//# sourceMappingURL=inventory.js.map