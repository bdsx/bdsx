"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSource = exports.Block = exports.BlockLegacy = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const core_1 = require("../core");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
/** @deprecated import it from bdsx/minecraft */
let BlockLegacy = class BlockLegacy extends nativeclass_1.NativeClass {
    getCommandName() {
        const names = this.getCommandNames2();
        const name = names.get(0).name;
        names.destruct();
        if (name === null)
            throw Error(`block has not any names`);
        return name;
    }
    /**
     * @deprecated use getCommandNames2
     */
    getCommandNames() {
        (0, common_1.abstract)();
    }
    getCommandNames2() {
        (0, common_1.abstract)();
    }
    getCreativeCategory() {
        (0, common_1.abstract)();
    }
    /**
     * Will not affect actual destroy time but will affect the speed of cracks
     */
    setDestroyTime(time) {
        (0, common_1.abstract)();
    }
    getDestroyTime() {
        return this.getFloat32(0x12C);
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], BlockLegacy.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], BlockLegacy.prototype, "descriptionId", void 0);
BlockLegacy = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BlockLegacy);
exports.BlockLegacy = BlockLegacy;
/** @deprecated import it from bdsx/minecraft */
let Block = class Block extends nativeclass_1.NativeClass {
    /**
     * @param blockName Formats like 'minecraft:wool' and 'wool' are both accepted
     */
    static create(blockName, data = 0) {
        (0, common_1.abstract)();
    }
    _getName() {
        (0, common_1.abstract)();
    }
    getName() {
        return this._getName().str;
    }
    getDescriptionId() {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], Block.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t)
], Block.prototype, "data", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(BlockLegacy.ref(), 0x10)
], Block.prototype, "blockLegacy", void 0);
Block = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], Block);
exports.Block = Block;
/** @deprecated import it from bdsx/minecraft */
let BlockSource = class BlockSource extends nativeclass_1.NativeClass {
    _setBlock(x, y, z, block, updateFlags) {
        (0, common_1.abstract)();
    }
    getBlock(blockPos) {
        (0, common_1.abstract)();
    }
    setBlock(blockPos, block) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], BlockSource.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], BlockSource.prototype, "ownerThreadID", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], BlockSource.prototype, "allowUnpopulatedChunks", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], BlockSource.prototype, "publicSource", void 0);
BlockSource = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BlockSource);
exports.BlockSource = BlockSource;
//# sourceMappingURL=block.js.map