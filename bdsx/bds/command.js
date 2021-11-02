"use strict";
var WildcardCommandSelector_1, CommandOutputParameter_1, Command_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = exports.CommandVFTable = exports.Command = exports.CommandParameterData = exports.CommandParameterDataType = exports.MinecraftCommands = exports.CommandOutputSender = exports.CommandOutput = exports.CommandOutputParameter = exports.CommandOutputType = exports.CommandContext = exports.CommandWildcardInt = exports.CommandRawText = exports.CommandPositionFloat = exports.CommandPosition = exports.CommandMessage = exports.CommandItem = exports.CommandFilePath = exports.ActorWildcardCommandSelector = exports.WildcardCommandSelector = exports.CommandSelectorBase = exports.MCRESULT = exports.CommandFlag = exports.CommandVisibilityFlag = exports.CommandUsageFlag = exports.CommandTypeFlag = exports.CommandSyncFlag = exports.CommandExecuteFlag = exports.CommandCheatFlag = exports.CommandPermissionLevel = void 0;
const tslib_1 = require("tslib");
const assembler_1 = require("../assembler");
const bin_1 = require("../bin");
const capi_1 = require("../capi");
const common_1 = require("../common");
const core_1 = require("../core");
const cxxvector_1 = require("../cxxvector");
const makefunc_1 = require("../makefunc");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const sharedpointer_1 = require("../sharedpointer");
const templatename_1 = require("../templatename");
const actor_1 = require("./actor");
const blockpos_1 = require("./blockpos");
const commandorigin_1 = require("./commandorigin");
const connreq_1 = require("./connreq");
const packets_1 = require("./packets");
const proc_1 = require("./proc");
const typeid_1 = require("./typeid");
const dnf_1 = require("../dnf");
const minecraft = require("../minecraft");
const enums = require("../enums");
/** @deprecated */
exports.CommandPermissionLevel = minecraft.CommandPermissionLevel;
/** @deprecated import it from 'bdsx/enums' */
exports.CommandCheatFlag = enums.CommandCheatFlag;
/** @deprecated import it from 'bdsx/enums' */
exports.CommandExecuteFlag = enums.CommandExecuteFlag;
/** @deprecated import it from 'bdsx/enums' */
exports.CommandSyncFlag = enums.CommandSyncFlag;
/** @deprecated import it from 'bdsx/enums' */
exports.CommandTypeFlag = enums.CommandTypeFlag;
/** @deprecated import it from 'bdsx/enums' */
exports.CommandUsageFlag = enums.CommandUsageFlag;
/** @deprecated import it from 'bdsx/enums' */
exports.CommandVisibilityFlag = enums.CommandVisibilityFlag;
/** @deprecated **/
exports.CommandFlag = exports.CommandCheatFlag; // CommandFlag is actually a class
/** @deprecated import it from 'bdsx/minecraft' */
exports.MCRESULT = minecraft.MCRESULT;
/** @deprecated */
let CommandSelectorBase = class CommandSelectorBase extends nativeclass_1.NativeClass {
    _newResults(origin) {
        (0, common_1.abstract)();
    }
    newResults(origin) {
        const list = this._newResults(origin);
        const actors = list.p.toArray();
        list.dispose();
        return actors;
    }
};
CommandSelectorBase = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0xc0)
], CommandSelectorBase);
exports.CommandSelectorBase = CommandSelectorBase;
const CommandSelectorBaseCtor = (0, dnf_1.dnf)(minecraft.CommandSelectorBase, 'constructWith').reform(nativetype_1.void_t, null, CommandSelectorBase, nativetype_1.bool_t);
CommandSelectorBase.prototype[nativetype_1.NativeType.dtor] = minecraft.CommandSelectorBase[nativetype_1.NativeType.dtor];
CommandSelectorBase.prototype._newResults = (0, dnf_1.dnf)(minecraft.CommandSelectorBase, 'newResults').reform(sharedpointer_1.SharedPtr.make(cxxvector_1.CxxVector.make(actor_1.Actor.ref())), { this: CommandSelectorBase, structureReturn: true }, commandorigin_1.CommandOrigin);
let WildcardCommandSelector = WildcardCommandSelector_1 = class WildcardCommandSelector extends CommandSelectorBase {
    static make(type) {
        class WildcardCommandSelectorImpl extends WildcardCommandSelector_1 {
        }
        Object.defineProperty(WildcardCommandSelectorImpl, 'name', { value: (0, templatename_1.templateName)('WildcardCommandSelector', type.name) });
        WildcardCommandSelectorImpl.define({});
        return WildcardCommandSelectorImpl;
    }
};
WildcardCommandSelector = WildcardCommandSelector_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], WildcardCommandSelector);
exports.WildcardCommandSelector = WildcardCommandSelector;
/** @deprecated use WildcardCommandSelector.make(Actor) from bdsx/minecraft */
exports.ActorWildcardCommandSelector = WildcardCommandSelector.make(actor_1.Actor);
exports.ActorWildcardCommandSelector.prototype[nativetype_1.NativeType.ctor] = function () {
    CommandSelectorBaseCtor(this, false);
};
let CommandFilePath = class CommandFilePath extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], CommandFilePath.prototype, "text", void 0);
CommandFilePath = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandFilePath);
exports.CommandFilePath = CommandFilePath;
let CommandIntegerRange = class CommandIntegerRange extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandIntegerRange.prototype, "min", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandIntegerRange.prototype, "max", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandIntegerRange.prototype, "inverted", void 0);
CommandIntegerRange = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandIntegerRange);
let CommandItem = class CommandItem extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandItem.prototype, "version", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandItem.prototype, "id", void 0);
CommandItem = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandItem);
exports.CommandItem = CommandItem;
class CommandMessage extends nativeclass_1.NativeClass {
}
exports.CommandMessage = CommandMessage;
(function (CommandMessage) {
    let MessageComponent = class MessageComponent extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
    ], MessageComponent.prototype, "string", void 0);
    MessageComponent = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)(0x28)
    ], MessageComponent);
    CommandMessage.MessageComponent = MessageComponent;
})(CommandMessage = exports.CommandMessage || (exports.CommandMessage = {}));
CommandMessage.abstract({
    data: cxxvector_1.CxxVector.make(CommandMessage.MessageComponent),
}, 0x18);
let CommandPosition = class CommandPosition extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], CommandPosition.prototype, "x", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], CommandPosition.prototype, "y", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], CommandPosition.prototype, "z", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandPosition.prototype, "isXRelative", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandPosition.prototype, "isYRelative", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandPosition.prototype, "isZRelative", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandPosition.prototype, "local", void 0);
CommandPosition = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandPosition);
exports.CommandPosition = CommandPosition;
class CommandPositionFloat extends CommandPosition {
}
exports.CommandPositionFloat = CommandPositionFloat;
/** @deprecated import it from bdsx/minecraft */
let CommandRawText = class CommandRawText extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], CommandRawText.prototype, "text", void 0);
CommandRawText = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandRawText);
exports.CommandRawText = CommandRawText;
let CommandWildcardInt = class CommandWildcardInt extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandWildcardInt.prototype, "isWildcard", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x04)
], CommandWildcardInt.prototype, "value", void 0);
CommandWildcardInt = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandWildcardInt);
exports.CommandWildcardInt = CommandWildcardInt;
/** @deprecated */
let CommandContext = class CommandContext extends nativeclass_1.NativeClass {
    constructWith(str, v, i) {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], CommandContext.prototype, "command", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(commandorigin_1.CommandOrigin.ref())
], CommandContext.prototype, "origin", void 0);
CommandContext = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x30)
], CommandContext);
exports.CommandContext = CommandContext;
CommandContext.prototype.constructWith = minecraft.CommandContext.prototype.constructWith;
var CommandOutputType;
(function (CommandOutputType) {
    CommandOutputType[CommandOutputType["None"] = 0] = "None";
    CommandOutputType[CommandOutputType["LastOutput"] = 1] = "LastOutput";
    CommandOutputType[CommandOutputType["Silent"] = 2] = "Silent";
    CommandOutputType[CommandOutputType["Type3"] = 3] = "Type3";
    CommandOutputType[CommandOutputType["ScriptEngine"] = 4] = "ScriptEngine";
})(CommandOutputType = exports.CommandOutputType || (exports.CommandOutputType = {}));
/** @deprecated import it from 'bdsx/minecraft'  */
let CommandOutputParameter = CommandOutputParameter_1 = class CommandOutputParameter extends nativeclass_1.NativeClass {
    static create(input, count) {
        const out = CommandOutputParameter_1.construct();
        switch (typeof input) {
            case 'string':
                out.string = input;
                out.count = count !== null && count !== void 0 ? count : 0;
                break;
            case 'boolean':
                out.string = input.toString();
                out.count = 0;
                break;
            case 'number':
                if (Number.isInteger(input)) {
                    out.string = input.toString();
                }
                else {
                    out.string = input.toFixed(2).toString();
                }
                out.count = 0;
                break;
            case 'object':
                if (input instanceof actor_1.Actor) {
                    out.string = input.getName();
                    out.count = 1;
                }
                else if (input instanceof blockpos_1.BlockPos || input instanceof blockpos_1.Vec3) {
                    out.string = `${input.x}, ${input.y}, ${input.z}`;
                    out.count = count !== null && count !== void 0 ? count : 0;
                }
                else if (Array.isArray(input)) {
                    if (input.length > 0) {
                        if (input[0] instanceof actor_1.Actor) {
                            out.string = input.map(e => e.getName()).join(', ');
                            out.count = input.length;
                        }
                    }
                }
                break;
            default:
                out.string = '';
                out.count = -1;
        }
        return out;
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], CommandOutputParameter.prototype, "string", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandOutputParameter.prototype, "count", void 0);
CommandOutputParameter = CommandOutputParameter_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x28)
], CommandOutputParameter);
exports.CommandOutputParameter = CommandOutputParameter;
/** @deprecated import it from 'bdsx/minecraft'  */
let CommandOutput = class CommandOutput extends nativeclass_1.NativeClass {
    getType() {
        (0, common_1.abstract)();
    }
    constructAs(type) {
        (0, common_1.abstract)();
    }
    _successNoMessage() {
        (0, common_1.abstract)();
    }
    _success(message, params) {
        (0, common_1.abstract)();
    }
    success(message, params = []) {
        if (message === undefined) {
            this._successNoMessage();
        }
        else {
            const _params = (cxxvector_1.CxxVector.make(CommandOutputParameter)).construct();
            if (params.length > 0) {
                if (params[0] instanceof CommandOutputParameter) {
                    for (const param of params) {
                        _params.push(param);
                        param.destruct();
                    }
                }
                else {
                    for (const param of params) {
                        const _param = CommandOutputParameter.create(param);
                        _params.push(_param);
                        _param.destruct();
                    }
                }
            }
            this._success(message, _params);
            _params.destruct();
        }
    }
    _error(message, params) {
        (0, common_1.abstract)();
    }
    error(message, params = []) {
        const _params = (cxxvector_1.CxxVector.make(CommandOutputParameter)).construct();
        if (params.length > 0) {
            if (params[0] instanceof CommandOutputParameter) {
                for (const param of params) {
                    _params.push(param);
                    param.destruct();
                }
            }
            else {
                for (const param of params) {
                    const _param = CommandOutputParameter.create(param);
                    _params.push(_param);
                    _param.destruct();
                }
            }
        }
        this._error(message, _params);
        _params.destruct();
    }
};
CommandOutput = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x30)
], CommandOutput);
exports.CommandOutput = CommandOutput;
/** @deprecated import it from 'bdsx/minecraft'  */
let CommandOutputSender = class CommandOutputSender extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], CommandOutputSender.prototype, "vftable", void 0);
CommandOutputSender = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CommandOutputSender);
exports.CommandOutputSender = CommandOutputSender;
/** @deprecated import it from 'bdsx/minecraft'  */
let MinecraftCommands = class MinecraftCommands extends nativeclass_1.NativeClass {
    handleOutput(origin, output) {
        (0, common_1.abstract)();
    }
    executeCommand(ctx, suppressOutput) {
        (0, common_1.abstract)();
    }
    getRegistry() {
        (0, common_1.abstract)();
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], MinecraftCommands.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(CommandOutputSender.ref())
], MinecraftCommands.prototype, "sender", void 0);
MinecraftCommands = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MinecraftCommands);
exports.MinecraftCommands = MinecraftCommands;
var CommandParameterDataType;
(function (CommandParameterDataType) {
    CommandParameterDataType[CommandParameterDataType["NORMAL"] = 0] = "NORMAL";
    CommandParameterDataType[CommandParameterDataType["ENUM"] = 1] = "ENUM";
    CommandParameterDataType[CommandParameterDataType["SOFT_ENUM"] = 2] = "SOFT_ENUM";
    CommandParameterDataType[CommandParameterDataType["POSTFIX"] = 3] = "POSTFIX";
})(CommandParameterDataType = exports.CommandParameterDataType || (exports.CommandParameterDataType = {}));
/** @deprecated import it from 'bdsx/minecraft'  */
let CommandParameterData = class CommandParameterData extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(typeid_1.typeid_t)
], CommandParameterData.prototype, "tid", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], CommandParameterData.prototype, "parser", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], CommandParameterData.prototype, "name", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], CommandParameterData.prototype, "desc", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandParameterData.prototype, "unk56", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandParameterData.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandParameterData.prototype, "offset", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CommandParameterData.prototype, "flag_offset", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandParameterData.prototype, "optional", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], CommandParameterData.prototype, "pad73", void 0);
CommandParameterData = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CommandParameterData);
exports.CommandParameterData = CommandParameterData;
/** @deprecated import it from 'bdsx/minecraft'  */
let Command = Command_1 = class Command extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        this.vftable = null;
        this.u3 = -1;
        this.u1 = 0;
        this.u2 = null;
        this.u4 = 5;
    }
    static mandatory(key, keyForIsSet, desc, type = CommandParameterDataType.NORMAL, name = key) {
        const cmdclass = this;
        const paramType = cmdclass.typeOf(key);
        const offset = cmdclass.offsetOf(key);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet) : -1;
        return Command_1.manual(name, paramType, offset, flag_offset, false, desc, type);
    }
    static optional(key, keyForIsSet, desc, type = CommandParameterDataType.NORMAL, name = key) {
        const cmdclass = this;
        const paramType = cmdclass.typeOf(key);
        const offset = cmdclass.offsetOf(key);
        const flag_offset = keyForIsSet !== null ? cmdclass.offsetOf(keyForIsSet) : -1;
        return Command_1.manual(name, paramType, offset, flag_offset, true, desc, type);
    }
    static manual(name, paramType, offset, flag_offset = -1, optional = false, desc, type = CommandParameterDataType.NORMAL) {
        const param = CommandParameterData.construct();
        param.tid.id = (0, typeid_1.type_id)(CommandRegistry, paramType).id;
        param.parser = CommandRegistry.getParser(paramType);
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
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(minecraft.Command.VFTable.ref())
], Command.prototype, "vftable", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], Command.prototype, "u1", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(core_1.VoidPointer)
], Command.prototype, "u2", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], Command.prototype, "u3", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int16_t)
], Command.prototype, "u4", void 0);
Command = Command_1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], Command);
exports.Command = Command;
(function (Command) {
    /** @deprecated import it from 'bdsx/minecraft'  */
    Command.VFTable = minecraft.Command.VFTable;
})(Command = exports.Command || (exports.Command = {}));
exports.Command = Command;
/** @deprecated use Command.VFTable in 'bdsx/minecraft'  */
exports.CommandVFTable = Command.VFTable;
/** @deprecated */
class CommandRegistry extends typeid_1.HasTypeId {
    registerCommand(command, description, level, flag1, flag2) {
        (0, common_1.abstract)();
    }
    registerAlias(command, alias) {
        (0, common_1.abstract)();
    }
    /**
     * CAUTION: this method will destruct all parameters in params
     */
    registerOverload(name, commandClass, params) {
        const cls = commandClass;
        const size = cls[nativetype_1.NativeType.size];
        if (!size)
            throw Error(`${cls.name}: size is not defined`);
        const allocator = makefunc_1.makefunc.np((returnval) => {
            const ptr = capi_1.capi.malloc(size);
            const cmd = ptr.as(cls);
            cmd.construct();
            returnval.setPointer(cmd);
            return returnval;
        }, core_1.StaticPointer, null, core_1.StaticPointer);
        const sig = this.findCommand(name);
        if (sig === null)
            throw Error(`${name}: command not found`);
        const overload = CommandRegistry.Overload.construct();
        overload.commandVersion = bin_1.bin.make64(1, 0x7fffffff);
        overload.allocator = allocator;
        overload.parameters.setFromArray(params);
        overload.u6 = -1;
        sig.overloads.push(overload);
        this.registerOverloadInternal(sig, sig.overloads.back());
        overload.destruct();
        for (const param of params) {
            param.destruct();
        }
    }
    registerOverloadInternal(signature, overload) {
        (0, common_1.abstract)();
    }
    findCommand(command) {
        (0, common_1.abstract)();
    }
    _serializeAvailableCommands(pk) {
        (0, common_1.abstract)();
    }
    serializeAvailableCommands() {
        const pk = packets_1.AvailableCommandsPacket.create();
        this._serializeAvailableCommands(pk);
        return pk;
    }
    static getParser(type) {
        const parser = (0, dnf_1.dnf)(minecraft.CommandRegistry.prototype.parse).getByTemplates(null, type);
        if (parser == null)
            throw Error(`${type.name} parser not found`);
        return (0, dnf_1.dnf)(parser).getAddress();
    }
}
exports.CommandRegistry = CommandRegistry;
/** @deprecated */
(function (CommandRegistry) {
    let Overload = class Overload extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
    ], Overload.prototype, "commandVersion", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(core_1.VoidPointer)
    ], Overload.prototype, "allocator", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(CommandParameterData))
    ], Overload.prototype, "parameters", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
    ], Overload.prototype, "commandVersionOffset", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x28)
    ], Overload.prototype, "u6", void 0);
    Overload = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)(0x30)
    ], Overload);
    CommandRegistry.Overload = Overload;
    let Symbol = class Symbol extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
    ], Symbol.prototype, "value", void 0);
    Symbol = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)()
    ], Symbol);
    CommandRegistry.Symbol = Symbol;
    let Signature = class Signature extends nativeclass_1.NativeClass {
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
    ], Signature.prototype, "command", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
    ], Signature.prototype, "description", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(CommandRegistry.Overload))
    ], Signature.prototype, "overloads", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
    ], Signature.prototype, "permissionLevel", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(CommandRegistry.Symbol)
    ], Signature.prototype, "commandSymbol", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(CommandRegistry.Symbol)
    ], Signature.prototype, "commandAliasEnum", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
    ], Signature.prototype, "flags", void 0);
    Signature = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)(null)
    ], Signature);
    CommandRegistry.Signature = Signature;
    let ParseToken = class ParseToken extends nativeclass_1.NativeClass {
    };
    ParseToken = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)(null)
    ], ParseToken);
    CommandRegistry.ParseToken = ParseToken;
})(CommandRegistry = exports.CommandRegistry || (exports.CommandRegistry = {}));
const types = [
    nativetype_1.int32_t,
    nativetype_1.float32_t,
    nativetype_1.bool_t,
    nativetype_1.CxxString,
    exports.ActorWildcardCommandSelector,
    blockpos_1.RelativeFloat,
    CommandFilePath,
    // CommandIntegerRange,
    CommandItem,
    CommandMessage,
    CommandPosition,
    CommandPositionFloat,
    CommandRawText,
    CommandWildcardInt,
    connreq_1.JsonValue
];
typeid_1.type_id.pdbimport(CommandRegistry, types);
// loadParserFromPdb(types);
CommandOutput.prototype.getType = proc_1.procHacker.js('CommandOutput::getType', nativetype_1.int32_t, { this: CommandOutput });
CommandOutput.prototype.constructAs = proc_1.procHacker.js('??0CommandOutput@@QEAA@W4CommandOutputType@@@Z', nativetype_1.void_t, { this: CommandOutput }, nativetype_1.int32_t);
CommandOutput.prototype._successNoMessage = proc_1.procHacker.js('?success@CommandOutput@@QEAAXXZ', nativetype_1.void_t, { this: CommandOutput });
CommandOutput.prototype._success = proc_1.procHacker.js('?success@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z', nativetype_1.void_t, { this: CommandOutput }, nativetype_1.CxxString, cxxvector_1.CxxVector.make(CommandOutputParameter));
CommandOutput.prototype._error = proc_1.procHacker.js('?error@CommandOutput@@QEAAXAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@AEBV?$vector@VCommandOutputParameter@@V?$allocator@VCommandOutputParameter@@@std@@@3@@Z', nativetype_1.void_t, { this: CommandOutput }, nativetype_1.CxxString, cxxvector_1.CxxVector.make(CommandOutputParameter));
MinecraftCommands.prototype.handleOutput = proc_1.procHacker.js('MinecraftCommands::handleOutput', nativetype_1.void_t, { this: MinecraftCommands }, commandorigin_1.CommandOrigin, CommandOutput);
// MinecraftCommands.prototype.executeCommand is defined at bdsx/command.ts
MinecraftCommands.prototype.getRegistry = proc_1.procHacker.js('MinecraftCommands::getRegistry', CommandRegistry, { this: MinecraftCommands });
CommandRegistry.prototype.registerOverloadInternal = proc_1.procHacker.js('CommandRegistry::registerOverloadInternal', nativetype_1.void_t, { this: CommandRegistry }, CommandRegistry.Signature, CommandRegistry.Overload);
CommandRegistry.prototype.registerCommand = proc_1.procHacker.js("CommandRegistry::registerCommand", nativetype_1.void_t, { this: CommandRegistry }, nativetype_1.CxxString, makefunc_1.makefunc.Utf8, nativetype_1.int32_t, nativetype_1.int32_t, nativetype_1.int32_t);
CommandRegistry.prototype.registerAlias = proc_1.procHacker.js("CommandRegistry::registerAlias", nativetype_1.void_t, { this: CommandRegistry }, nativetype_1.CxxString, nativetype_1.CxxString);
CommandRegistry.prototype.findCommand = proc_1.procHacker.js("CommandRegistry::findCommand", CommandRegistry.Signature, { this: CommandRegistry }, nativetype_1.CxxString);
CommandRegistry.prototype._serializeAvailableCommands = proc_1.procHacker.js("CommandRegistry::serializeAvailableCommands", packets_1.AvailableCommandsPacket, { this: CommandRegistry }, packets_1.AvailableCommandsPacket);
'CommandRegistry::parse<AutomaticID<Dimension,int> >';
'CommandRegistry::parse<Block const * __ptr64>';
'CommandRegistry::parse<CommandFilePath>';
'CommandRegistry::parse<CommandIntegerRange>'; // Not supported yet(?) there is no type id for it
'CommandRegistry::parse<CommandItem>';
'CommandRegistry::parse<CommandMessage>';
'CommandRegistry::parse<CommandPosition>';
'CommandRegistry::parse<CommandPositionFloat>';
'CommandRegistry::parse<CommandRawText>';
'CommandRegistry::parse<CommandSelector<Actor> >';
'CommandRegistry::parse<CommandSelector<Player> >';
'CommandRegistry::parse<CommandWildcardInt>';
'CommandRegistry::parse<Json::Value>';
'CommandRegistry::parse<MobEffect const * __ptr64>';
'CommandRegistry::parse<std::basic_string<char,struct std::char_traits<char>,class std::allocator<char> > >';
'CommandRegistry::parse<std::unique_ptr<Command,struct std::default_delete<Command> > >';
'CommandRegistry::parse<AgentCommand::Mode>';
'CommandRegistry::parse<AgentCommands::CollectCommand::CollectionSpecification>';
'CommandRegistry::parse<AgentCommands::Direction>';
'CommandRegistry::parse<AnimationMode>';
'CommandRegistry::parse<AreaType>';
'CommandRegistry::parse<BlockSlot>';
'CommandRegistry::parse<CodeBuilderCommand::Action>';
'CommandRegistry::parse<CommandOperator>';
'CommandRegistry::parse<Enchant::Type>';
'CommandRegistry::parse<EquipmentSlot>';
'CommandRegistry::parse<GameType>';
'CommandRegistry::parse<Mirror>';
'CommandRegistry::parse<ObjectiveSortOrder>';
'CommandRegistry::parse<Rotation>';
'CommandRegistry::parse<ActorDefinitionIdentifier const * __ptr64>';
//# sourceMappingURL=command.js.map