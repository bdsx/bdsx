
import * as colors from 'colors';
import { Command, CommandCheatFlag, CommandContext, CommandEnum, CommandIndexEnum, CommandMappedValue, CommandOutput, CommandParameterData, CommandParameterDataType, CommandParameterOption, CommandPermissionLevel, CommandRawEnum, CommandRegistry, CommandSoftEnum, CommandStringEnum, CommandUsageFlag, CommandVisibilityFlag, MCRESULT, MinecraftCommands } from './bds/command';
import { CommandOrigin } from './bds/commandorigin';
import { capi } from './capi';
import { CommandParameterType } from './commandparam';
import { emptyFunc } from './common';
import { decay } from './decay';
import { events } from './event';
import { bedrockServer } from './launcher';
import { makefunc } from './makefunc';
import { nativeClass, nativeField } from './nativeclass';
import { bool_t, int32_t, NativeType, Type, void_t } from './nativetype';
import { procHacker } from './prochacker';
import { CxxSharedPtr } from './sharedpointer';

let executeCommandOriginal:(cmd:MinecraftCommands, res:MCRESULT, ctxptr:CxxSharedPtr<CommandContext>, b:bool_t)=>MCRESULT;
function executeCommand(cmd:MinecraftCommands, res:MCRESULT, ctxptr:CxxSharedPtr<CommandContext>, b:bool_t):MCRESULT {
    try {
        const ctx = ctxptr.p!;
        const name = ctx.origin.getName();
        const resv = events.command.fire(ctxptr.p!.command, name, ctx);
        switch (typeof resv) {
        case 'number':
            res.result = resv;
            return res;
        default:
            return executeCommandOriginal(cmd, res, ctxptr, b);
        }
    } catch (err) {
        events.errorFire(err);
        res.result = -1;
        return res;
    }
}

MinecraftCommands.prototype.executeCommand = function(ctx, b) {
    const res = new MCRESULT(true);
    return executeCommand(this, res, ctx, b);
};

@nativeClass()
export class CustomCommand extends Command {
    @nativeField(Command.VFTable)
    self_vftable:Command.VFTable;

    [NativeType.ctor]():void {
        this.self_vftable.destructor = customCommandDtor;
        this.self_vftable.execute = null;
        this.vftable = this.self_vftable;
    }

    execute(origin:CommandOrigin, output:CommandOutput):void {
        // empty
    }
}
CustomCommand.prototype[NativeType.dtor] = emptyFunc; // remove the inherited destructor

export interface CommandFieldOptions {
    optional?:boolean;
    /** @deprecated Use {@link postfix} instead */
    description?:string;
    postfix?:string;
    name?:string;
    options?:CommandParameterOption;
}
type GetTypeFromParam<T> =
    T extends CommandMappedValue<any, infer V> ? V :
    T extends CommandParameterType<infer V> ? V :
    never;

type IfOptional<OPTS extends boolean|CommandFieldOptions, TRUE, FALSE> = (OPTS extends true ? TRUE : OPTS extends {optional:true} ? TRUE : FALSE);

type OptionalCheck<T, OPTS extends boolean|CommandFieldOptions> = IfOptional<OPTS, GetTypeFromParam<T>|undefined, GetTypeFromParam<T>>;

export class CustomCommandFactory {

    constructor(
        public readonly registry:CommandRegistry,
        public readonly name:string) {
    }
    overload<PARAMS extends Record<string, CommandParameterType<any>|[CommandParameterType<any>, CommandFieldOptions|boolean]>>(
        callback:(params:{
            [key in keyof PARAMS]:
                PARAMS[key] extends [infer T, infer OPTS] ? OptionalCheck<T, OPTS> :
                PARAMS[key] extends CommandParameterType<any> ? GetTypeFromParam<PARAMS[key]> :
                never
            }, origin:CommandOrigin, output:CommandOutput)=>void,
        parameters:PARAMS):this {

        interface ParamInfo {
            key:keyof CustomCommandImpl;
            optkey:keyof CustomCommandImpl|null;
            postfix?:string;
            name:string;
            options:CommandParameterOption;
        }
        const paramInfos:ParamInfo[] = [];
        class CustomCommandImpl extends CustomCommand {
            [NativeType.ctor]():void {
                this.self_vftable.execute = customCommandExecute;
            }
            execute(origin:CommandOrigin, output:CommandOutput):void {
                try {
                    const nobj:Record<keyof CustomCommandImpl, any> = {} as any;
                    for (const {key, optkey} of paramInfos) {
                        if (optkey == null || this[optkey]) {
                            const type = fields[key.toString()];
                            if (type instanceof CommandMappedValue) {
                                nobj[key] = type.mapValue(this[key] as any);
                            } else {
                                nobj[key] = this[key];
                            }
                        }
                    }
                    callback(nobj as any, origin, output);
                } catch (err) {
                    events.errorFire(err);
                }
            }
        }

        const fields:Record<string, Type<any>> = {};
        for (const [key, type_] of Object.entries(parameters)) {
            let type = type_;
            let optional = false;
            const info:ParamInfo = {
                key: key as keyof CustomCommandImpl,
                name: key,
                optkey: null,
                options: CommandParameterOption.None,
            };

            if (type instanceof Array) {
                const opts = type[1];
                if (typeof opts === 'boolean') {
                    optional = opts;
                } else {
                    optional = !!opts.optional;
                    info.postfix = opts.postfix ?? opts.description;
                    if (opts.options != null) info.options = opts.options;
                    if (opts.name != null) info.name = opts.name;
                }
                type = type[0];
            }
            if (key in fields) throw Error(`${key}: field name duplicated`);
            if (!CommandRegistry.hasParser(type)) throw Error(`CommandFactory.overload does not support ${type.name}, Please check bdsx/bds/commandparsertypes.ts`);
            fields[key] = type;

            if (optional) {
                const optkey = key+'__set';
                if (optkey in fields) throw Error(`${optkey}: field name duplicated`);
                fields[optkey] = bool_t;
                info.optkey = optkey as keyof CustomCommandImpl;
            }
            paramInfos.push(info);
        }

        CustomCommandImpl.define(fields);

        const params:CommandParameterData[] = [];
        for (const {key, optkey, postfix, name, options} of paramInfos) {
            const type = fields[key as string];
            const dataType = type instanceof CommandEnum ? CommandParameterDataType.ENUM :
                type instanceof CommandSoftEnum ? CommandParameterDataType.SOFT_ENUM :
                    CommandParameterDataType.NORMAL;
            if (optkey != null) params.push(CustomCommandImpl.optional(key, optkey as any, postfix, dataType, name, options));
            else params.push(CustomCommandImpl.mandatory(key, null, postfix, dataType, name, options));
        }

        const customCommandExecute = makefunc.np(function(this:CustomCommandImpl, origin:CommandOrigin, output:CommandOutput){
            this.execute(origin, output);
            decay(this);
            decay(origin);
            decay(output);
        }, void_t, {this:CustomCommandImpl, name: `${this.name} command::execute`}, CommandOrigin, CommandOutput);

        this.registry.registerOverload(this.name, CustomCommandImpl, params);
        return this;
    }

    alias(alias:string):this {
        this.registry.registerAlias(this.name, alias);
        return this;
    }
}

export class CustomCommandFactoryWithSignature extends CustomCommandFactory {
    constructor(
        registry:CommandRegistry, name:string,
        public signature:CommandRegistry.Signature) {
        super(registry, name);
    }
}

const commandEnumStored = Symbol('commandEnum');
function _enum<VALUES extends Record<string, string|number>>(name:string, values:VALUES):CommandEnum<VALUES[keyof VALUES]>;
function _enum<STR extends string, VALUES extends STR[]>(name:string, values:VALUES):CommandEnum<VALUES[number]>;
function _enum<VALUES extends string[]>(name:string, ...values:VALUES):CommandEnum<VALUES[number]>;
function _enum(name:string, ...values:(string|Record<string, number|string>|string[])[]):CommandEnum<any> {
    const first = values[0];
    if (typeof first === 'object') {
        if (first instanceof Array) {
            return new CommandStringEnum(name, ...first);
        } else {
            const cmdenum:CommandIndexEnum<any>|undefined = (first as any)[commandEnumStored];
            if (cmdenum != null) {
                if (cmdenum.name !== name) {
                    console.error(colors.yellow(`the enum name is different but it would not be applied. (${cmdenum.name} => ${name})`));
                }
                return cmdenum;
            }
            return (first as any)[commandEnumStored] = new CommandIndexEnum(name, first); // store and reuse
        }
    } else {
        return new CommandStringEnum(name, ...(values as string[]));
    }
}

function softEnum(name:string, ...values:string[]):CommandSoftEnum;
function softEnum(name:string, values:string[]):CommandSoftEnum;
function softEnum(name:string, ...values:(string|string[])[]):CommandSoftEnum {
    const softenum = CommandSoftEnum.getInstance(name);
    if (values.length !== 0) {
        const first = values[0];
        softenum.addValues(Array.isArray(first) ? first : values as string[]);
    }
    return softenum;
}

export const command ={
    find(name:string):CustomCommandFactoryWithSignature {
        const registry = bedrockServer.commandRegistry;
        const cmd = registry.findCommand(name);
        if (cmd === null) throw Error(`${name}: command not found`);
        return new CustomCommandFactoryWithSignature(registry, name, cmd);
    },
    register(name:string,
        description:string,
        perm:CommandPermissionLevel = CommandPermissionLevel.Normal,
        flags1:CommandCheatFlag|CommandVisibilityFlag = CommandCheatFlag.NotCheat,
        flags2:CommandUsageFlag|CommandVisibilityFlag = CommandUsageFlag._Unknown):CustomCommandFactory {
        const registry = bedrockServer.commandRegistry;
        const cmd = registry.findCommand(name);
        if (cmd !== null) throw Error(`${name}: command already registered`);
        registry.registerCommand(name, description, perm, flags1, flags2);
        return new CustomCommandFactory(registry, name);
    },
    softEnum,
    enum:_enum,
    /**
     * built-in enum system
     */
    rawEnum(name:string):CommandRawEnum {
        return CommandRawEnum.getInstance(name);
    },
};

const customCommandDtor = makefunc.np(function(delIt){
    this[NativeType.dtor]();
    if (delIt & 1) {
        capi.free(this);
    }
}, void_t, {this:CustomCommand, name:'CustomCommand::destructor', crossThread: true}, int32_t);

bedrockServer.withLoading().then(()=>{
    executeCommandOriginal = procHacker.hooking('?executeCommand@MinecraftCommands@@QEBA?AUMCRESULT@@V?$shared_ptr@VCommandContext@@@std@@_N@Z', MCRESULT, null,
        MinecraftCommands, MCRESULT, CxxSharedPtr.make(CommandContext), bool_t)(executeCommand);
});
