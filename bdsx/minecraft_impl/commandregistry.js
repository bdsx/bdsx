"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeid_1 = require("../bds/typeid");
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const dnf_1 = require("../dnf");
const hook_1 = require("../hook");
const minecraft_1 = require("../minecraft");
const nativetype_1 = require("../nativetype");
const ready_1 = require("./ready");
minecraft_1.CommandRegistry.setExtends(typeid_1.HasTypeId);
minecraft_1.CommandRegistry.abstract({});
minecraft_1.CommandRegistry.Overload.define({
    commandVersion: nativetype_1.bin64_t,
    allocator: core_1.VoidPointer,
    parameters: cxxvector_1.CxxVector.make(minecraft_1.CommandParameterData),
    commandVersionOffset: nativetype_1.int32_t,
});
minecraft_1.CommandRegistry.Symbol.define({
    data: nativetype_1.int32_t
});
minecraft_1.CommandRegistry.Signature.abstract({
    command: nativetype_1.CxxString,
    description: nativetype_1.CxxString,
    overloads: cxxvector_1.CxxVector.make(minecraft_1.CommandRegistry.Overload),
    permissionLevel: nativetype_1.int32_t,
    commandSymbol: minecraft_1.CommandRegistry.Symbol,
    commandAliasEnum: minecraft_1.CommandRegistry.Symbol,
    flags: nativetype_1.int32_t,
});
(0, ready_1.minecraftTsReady)(() => {
    const _serializeAvailableCommands = (0, hook_1.hook)(minecraft_1.CommandRegistry, 'serializeAvailableCommands')
        .reform(nativetype_1.void_t, null, minecraft_1.CommandRegistry, minecraft_1.AvailableCommandsPacket);
    (0, dnf_1.dnf)(minecraft_1.CommandRegistry, 'serializeAvailableCommands').overload(function () {
        const pk = minecraft_1.AvailableCommandsPacket.create();
        _serializeAvailableCommands(this, pk);
        return pk;
    });
});
//# sourceMappingURL=commandregistry.js.map