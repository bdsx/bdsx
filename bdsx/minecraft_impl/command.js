"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assembler_1 = require("../assembler");
const command_1 = require("../bds/command");
const core_1 = require("../core");
const dnf_1 = require("../dnf");
const minecraft_1 = require("../minecraft");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
minecraft_1.Command.VFTable.define({
    destructor: core_1.VoidPointer,
    execute: core_1.VoidPointer,
});
minecraft_1.Command.define({
    vftable: command_1.CommandVFTable.ref(),
    u1: nativetype_1.int32_t,
    u2: core_1.VoidPointer,
    u3: nativetype_1.int32_t,
    u4: nativetype_1.int16_t, // 0x1c
});
minecraft_1.Command.mandatory = function (key, keyForIsSet, desc, type = minecraft_1.CommandParameterDataType.NORMAL, name = key) {
    const cmdclass = this;
    const paramType = cmdclass.typeOf(key);
    const offset = cmdclass.offsetOf(key);
    const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet) : -1;
    return minecraft_1.Command.manual(name, paramType, offset, flag_offset, false, desc, type);
};
minecraft_1.Command.optional = function (key, keyForIsSet, desc, type = minecraft_1.CommandParameterDataType.NORMAL, name = key) {
    const cmdclass = this;
    const paramType = cmdclass.typeOf(key);
    const offset = cmdclass.offsetOf(key);
    const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet) : -1;
    return minecraft_1.Command.manual(name, paramType, offset, flag_offset, true, desc, type);
};
minecraft_1.Command.manual = function (name, paramType, offset, flag_offset = -1, optional = false, desc, type = minecraft_1.CommandParameterDataType.NORMAL) {
    const param = minecraft_1.CommandParameterData.construct();
    const getTypeId = (0, dnf_1.dnf)(minecraft_1.type_id).getByTemplates(null, minecraft_1.CommandRegistry, paramType);
    if (getTypeId === null)
        throw Error(`${paramType.name} type_id not found`);
    param.tid.id = getTypeId().id;
    const parser = (0, dnf_1.dnf)(minecraft_1.CommandRegistry, 'parse').getByTemplates(paramType);
    if (parser === null)
        throw Error(`${paramType.name} parser not found`);
    param.parser = dnf_1.dnf.getAddressOf(parser);
    param.name = name;
    param.type = type;
    if (desc != null) {
        const ptr = new core_1.NativePointer;
        ptr.setAddressFromBuffer(assembler_1.asm.const_str(desc));
        param.desc = ptr;
    }
    else {
        param.desc = null;
    }
    param.unk56 = -1;
    param.offset = offset;
    param.flag_offset = flag_offset;
    param.optional = optional;
    param.pad73 = false;
    return param;
};
//# sourceMappingURL=command.js.map