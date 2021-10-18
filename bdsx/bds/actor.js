"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemActor = exports.Actor = exports.ActorFlags = exports.ActorDamageCause = exports.ActorDamageSource = exports.ActorDefinitionIdentifier = exports.ActorType = exports.ActorRuntimeID = exports.DimensionId = exports.ActorUniqueID = void 0;
const tslib_1 = require("tslib");
const bin_1 = require("../bin");
const circulardetector_1 = require("../circulardetector");
const common_1 = require("../common");
const core_1 = require("../core");
const makefunc_1 = require("../makefunc");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const attribute_1 = require("./attribute");
const effects_1 = require("./effects");
const hashedstring_1 = require("./hashedstring");
const minecraft = require("../minecraft");
/** @deprecated */
exports.ActorUniqueID = nativetype_1.bin64_t.extends();
/** @deprecated import it from bdsx/enums */
exports.DimensionId = minecraft.DimensionId;
class ActorRuntimeID extends core_1.VoidPointer {
}
exports.ActorRuntimeID = ActorRuntimeID;
/** @deprecated */
exports.ActorType = minecraft.ActorType;
let ActorDefinitionIdentifier = class ActorDefinitionIdentifier extends nativeclass_1.NativeClass {
    static create(type) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ActorDefinitionIdentifier.prototype, "namespace", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ActorDefinitionIdentifier.prototype, "identifier", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ActorDefinitionIdentifier.prototype, "initEvent", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ActorDefinitionIdentifier.prototype, "fullName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(hashedstring_1.HashedString)
], ActorDefinitionIdentifier.prototype, "canonicalName", void 0);
ActorDefinitionIdentifier = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0xA9)
], ActorDefinitionIdentifier);
exports.ActorDefinitionIdentifier = ActorDefinitionIdentifier;
let ActorDamageSource = class ActorDamageSource extends nativeclass_1.NativeClass {
    /** @deprecated Has to be confirmed working */
    getDamagingEntityUniqueID() {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x08)
], ActorDamageSource.prototype, "cause", void 0);
ActorDamageSource = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x10)
], ActorDamageSource);
exports.ActorDamageSource = ActorDamageSource;
/** @deprecated */
exports.ActorDamageCause = minecraft.ActorDamageCause;
/** @deprecated */
exports.ActorFlags = minecraft.ActorFlags;
/** @deprecated import it from bdsx/minecraft */
class Actor extends nativeclass_1.NativeClass {
    static summonAt(region, pos, type, id, summoner) {
        (0, common_1.abstract)();
    }
    sendPacket(packet) {
        if (!this.isPlayer())
            throw Error("this is not ServerPlayer");
        this.sendNetworkPacket(packet);
    }
    _getArmorValue() {
        (0, common_1.abstract)();
    }
    getArmorValue() {
        if (this.isItem())
            return 0;
        return this._getArmorValue();
    }
    getDimension() {
        (0, common_1.abstract)();
    }
    getDimensionId() {
        (0, common_1.abstract)();
    }
    /**
     * it's same with this.identifier
     */
    getIdentifier() {
        return this.identifier;
    }
    isPlayer() {
        (0, common_1.abstract)();
    }
    isItem() {
        (0, common_1.abstract)();
    }
    getAttributes() {
        (0, common_1.abstract)();
    }
    getName() {
        (0, common_1.abstract)();
    }
    setName(name) {
        (0, common_1.abstract)();
    }
    setScoreTag(text) {
        (0, common_1.abstract)();
    }
    getScoreTag() {
        (0, common_1.abstract)();
    }
    getNetworkIdentifier() {
        throw Error(`this is not player`);
    }
    getPosition() {
        (0, common_1.abstract)();
    }
    getRotation() {
        (0, common_1.abstract)();
    }
    getRegion() {
        (0, common_1.abstract)();
    }
    getUniqueIdLow() {
        return this.getUniqueIdPointer().getInt32(0);
    }
    getUniqueIdHigh() {
        return this.getUniqueIdPointer().getInt32(4);
    }
    getUniqueIdBin() {
        return this.getUniqueIdPointer().getBin64();
    }
    /**
     * it returns address of the unique id field
     */
    getUniqueIdPointer() {
        (0, common_1.abstract)();
    }
    getEntityTypeId() {
        (0, common_1.abstract)();
    }
    getCommandPermissionLevel() {
        (0, common_1.abstract)();
    }
    getAttribute(id) {
        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null)
            return 0;
        return attr.currentValue;
    }
    setAttribute(id, value) {
        if (id < 1)
            return null;
        if (id > 15)
            return null;
        const attr = this.getAttributes().getMutableInstance(id);
        if (attr === null)
            throw Error(`${this.identifier} has not ${attribute_1.AttributeId[id] || `Attribute${id}`}`);
        attr.currentValue = value;
        return attr;
    }
    getRuntimeID() {
        (0, common_1.abstract)();
    }
    /**
     * @deprecated Need more implement
     */
    getEntity() {
        let entity = this.entity;
        if (entity != null)
            return entity;
        entity = {
            __unique_id__: {
                "64bit_low": this.getUniqueIdLow(),
                "64bit_high": this.getUniqueIdHigh()
            },
            __identifier__: this.identifier,
            __type__: (this.getEntityTypeId() & 0xff) === 0x40 ? 'item_entity' : 'entity',
            id: 0, // bool ScriptApi::WORKAROUNDS::helpRegisterActor(entt::Registry<unsigned int>* registry? ,Actor* actor,unsigned int* id_out);
        };
        return this.entity = entity;
    }
    addEffect(effect) {
        (0, common_1.abstract)();
    }
    removeEffect(id) {
        (0, common_1.abstract)();
    }
    _hasEffect(mobEffect) {
        (0, common_1.abstract)();
    }
    hasEffect(id) {
        const effect = effects_1.MobEffect.create(id);
        const retval = this._hasEffect(effect);
        effect.destruct();
        return retval;
    }
    _getEffect(mobEffect) {
        (0, common_1.abstract)();
    }
    getEffect(id) {
        const effect = effects_1.MobEffect.create(id);
        const retval = this._getEffect(effect);
        effect.destruct();
        return retval;
    }
    addTag(tag) {
        (0, common_1.abstract)();
    }
    hasTag(tag) {
        (0, common_1.abstract)();
    }
    removeTag(tag) {
        (0, common_1.abstract)();
    }
    teleport(pos, dimensionId = exports.DimensionId.Overworld) {
        (0, common_1.abstract)();
    }
    getArmor(slot) {
        (0, common_1.abstract)();
    }
    setSneaking(value) {
        (0, common_1.abstract)();
    }
    getHealth() {
        (0, common_1.abstract)();
    }
    getMaxHealth() {
        (0, common_1.abstract)();
    }
    /**
     * Most of the time it will be reset by ticking
     * @returns changed
     */
    setStatusFlag(flag, value) {
        (0, common_1.abstract)();
    }
    getStatusFlag(flag) {
        (0, common_1.abstract)();
    }
    static fromUniqueIdBin(bin, getRemovedActor = true) {
        (0, common_1.abstract)();
    }
    static fromUniqueId(lowbits, highbits, getRemovedActor = true) {
        return Actor.fromUniqueIdBin(bin_1.bin.make64(lowbits, highbits), getRemovedActor);
    }
    static fromEntity(entity, getRemovedActor = true) {
        const u = entity.__unique_id__;
        return Actor.fromUniqueId(u["64bit_low"], u["64bit_high"], getRemovedActor);
    }
    static fromNewActor(newActor) {
        const actor = newActor[legacyLink];
        if (actor != null)
            return actor;
        return newActor[legacyLink] = newActor.as(Actor);
    }
    static [nativetype_1.NativeType.getter](ptr, offset) {
        return Actor._singletoning(ptr.add(offset, offset >> 31));
    }
    static [makefunc_1.makefunc.getFromParam](stackptr, offset) {
        return Actor._singletoning(stackptr.getNullablePointer(offset));
    }
    static all() {
        (0, common_1.abstract)();
    }
    static _singletoning(ptr) {
        (0, common_1.abstract)();
    }
    _toJsonOnce(allocator) {
        return circulardetector_1.CircularDetector.check(this, allocator, obj => {
            obj.name = this.getName();
            obj.pos = this.getPosition();
            obj.type = this.getEntityTypeId();
        });
    }
}
exports.Actor = Actor;
const legacyLink = Symbol('legacy-actor');
class ItemActor extends Actor {
}
exports.ItemActor = ItemActor;
//# sourceMappingURL=actor.js.map