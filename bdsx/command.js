"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command = exports.CustomCommandFactory = exports.CustomCommand = void 0;
const tslib_1 = require("tslib");
const command_1 = require("./bds/command");
const commandorigin_1 = require("./bds/commandorigin");
const server_1 = require("./bds/server");
const capi_1 = require("./capi");
const event_1 = require("./event");
const makefunc_1 = require("./makefunc");
const nativeclass_1 = require("./nativeclass");
const nativetype_1 = require("./nativetype");
const sharedpointer_1 = require("./sharedpointer");
const minecraft = require("./minecraft");
var CommandVersion = minecraft.CommandVersion;
// registerer
let CustomCommand = class CustomCommand extends command_1.Command {
    [nativetype_1.NativeType.ctor]() {
        this.self_vftable.destructor = customCommandDtor;
        this.self_vftable.execute = null;
        this.vftable = this.self_vftable;
    }
    execute(origin, output) {
        // empty
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(command_1.Command.VFTable)
], CustomCommand.prototype, "self_vftable", void 0);
CustomCommand = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], CustomCommand);
exports.CustomCommand = CustomCommand;
class CustomCommandFactory {
    constructor(registry, name) {
        this.registry = registry;
        this.name = name;
    }
    overload(callback, parameters) {
        const paramNames = [];
        class CustomCommandImpl extends CustomCommand {
            [nativetype_1.NativeType.ctor]() {
                this.self_vftable.execute = customCommandExecute;
            }
            execute(origin, output) {
                try {
                    const nobj = {};
                    for (const [name, optkey] of paramNames) {
                        if (optkey == null || this[optkey]) {
                            nobj[name] = this[name];
                        }
                    }
                    callback(nobj, origin, output);
                }
                catch (err) {
                    event_1.events.errorFire(err);
                }
            }
        }
        parameters.__proto__ = null;
        const fields = Object.create(null);
        for (const name in parameters) {
            let optional = false;
            let type = parameters[name];
            if (type instanceof Array) {
                optional = type[1];
                type = type[0];
            }
            if (name in fields)
                throw Error(`${name}: field name duplicated`);
            fields[name] = type;
            if (optional) {
                const optkey = name + '__set';
                if (optkey in fields)
                    throw Error(`${optkey}: field name duplicated`);
                fields[optkey] = nativetype_1.bool_t;
                paramNames.push([name, optkey]);
            }
            else {
                paramNames.push([name]);
            }
        }
        const params = [];
        CustomCommandImpl.define(fields);
        for (const [name, optkey] of paramNames) {
            if (optkey != null)
                params.push(CustomCommandImpl.optional(name, optkey));
            else
                params.push(CustomCommandImpl.mandatory(name, null));
        }
        const customCommandExecute = makefunc_1.makefunc.np(function (origin, output) {
            this.execute(origin, output);
        }, nativetype_1.void_t, { this: CustomCommandImpl }, commandorigin_1.CommandOrigin, command_1.CommandOutput);
        this.registry.registerOverload(this.name, CustomCommandImpl, params);
        return this;
    }
    alias(alias) {
        this.registry.registerAlias(this.name, alias);
        return this;
    }
}
exports.CustomCommandFactory = CustomCommandFactory;
// executer
const commandVersion = CommandVersion.CurrentVersion;
const commandContextRefCounterVftable = minecraft.std._Ref_count_obj2.make(minecraft.CommandContext).addressof_vftable;
const CommandContextSharedPtr = sharedpointer_1.SharedPtr.make(command_1.CommandContext);
function createCommandContext(command, commandOrigin) {
    const sharedptr = new CommandContextSharedPtr(true);
    sharedptr.create(commandContextRefCounterVftable);
    sharedptr.p.constructWith(command, commandOrigin, commandVersion);
    return sharedptr;
}
function createServerCommandOrigin(name, level, permissionLevel, dimension) {
    const origin = capi_1.capi.malloc(commandorigin_1.ServerCommandOrigin[nativetype_1.NativeType.size]).as(commandorigin_1.ServerCommandOrigin);
    origin.constructWith(name, level, permissionLevel, dimension);
    return origin;
}
// namespace
/**
 * @deprecated use bdsx.commands
 */
var command;
(function (command_2) {
    /**
     * @deprecated use bdsx.commands
     */
    function register(name, description, perm = command_1.CommandPermissionLevel.Normal, flags1 = command_1.CommandCheatFlag.NotCheat, flags2 = command_1.CommandUsageFlag._Unknown) {
        const registry = server_1.serverInstance.minecraft.getCommands().getRegistry();
        const cmd = registry.findCommand(name);
        if (cmd !== null)
            throw Error(`${name}: command already registered`);
        registry.registerCommand(name, description, perm, flags1, flags2);
        return new CustomCommandFactory(registry, name);
    }
    command_2.register = register;
    /**
     * it does the same thing with bedrockServer.executeCommandOnConsole
     * but call the internal function directly
     * @deprecated use bdsx.commands
     */
    function execute(command, mute = true, permissionLevel = 4, dimension = null) {
        const origin = createServerCommandOrigin('Server', server_1.serverInstance.minecraft.getLevel(), // I'm not sure it's always ServerLevel
        permissionLevel, dimension);
        const ctx = createCommandContext(command, origin);
        const res = server_1.serverInstance.minecraft.getCommands().executeCommand(ctx, mute);
        ctx.destruct();
        origin.destruct();
        return res;
    }
    command_2.execute = execute;
})(command = exports.command || (exports.command = {}));
const customCommandDtor = makefunc_1.makefunc.np(function () {
    this[nativetype_1.NativeType.dtor]();
}, nativetype_1.void_t, { this: CustomCommand }, nativetype_1.int32_t);
//# sourceMappingURL=command.js.map