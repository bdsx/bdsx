
import { Command, CommandCheatFlag, CommandContext, CommandEnum, CommandIndexEnum, CommandOutput, CommandParameterData, CommandParameterDataType, CommandPermissionLevel, CommandRegistry, CommandStringEnum, CommandUsageFlag, CommandVisibilityFlag, MCRESULT, MinecraftCommands } from './bds/command';
import { CommandOrigin } from './bds/commandorigin';
import { procHacker } from './bds/proc';
import { serverInstance } from './bds/server';
import { decay } from './decay';
import { events } from './event';
import { bedrockServer } from './launcher';
import { makefunc } from './makefunc';
import { nativeClass, nativeField } from './nativeclass';
import { bool_t, int32_t, NativeType, Type, void_t } from './nativetype';
import { SharedPtr } from './sharedpointer';
import { _tickCallback } from './util';
import colors = require('colors');

let executeCommandOriginal:(cmd:MinecraftCommands, res:MCRESULT, ctxptr:SharedPtr<CommandContext>, b:bool_t)=>MCRESULT;
function executeCommand(cmd:MinecraftCommands, res:MCRESULT, ctxptr:SharedPtr<CommandContext>, b:bool_t):MCRESULT {
    try {
        const ctx = ctxptr.p!;
        const name = ctx.origin.getName();
        const resv = events.command.fire(ctxptr.p!.command, name, ctx);
        switch (typeof resv) {
        case 'number':
            res.result = resv;
            _tickCallback();
            return res;
        default:
            _tickCallback();
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

interface CommandFieldOptions {
    optional?:boolean;
    description?:string;
    name?:string;
}
type GetTypeFromParam<T> =
    T extends CommandEnum<infer KEYS> ? KEYS :
    T extends Type<infer F> ? F :
    never;

type OptionalCheck<T, OPTS extends boolean|CommandFieldOptions> =
    (OPTS extends true ? true : OPTS extends {optional:true} ? true : false) extends true ?
    GetTypeFromParam<T> :
    GetTypeFromParam<T>|undefined;

export class CustomCommandFactory {

    constructor(
        public readonly registry:CommandRegistry,
        public readonly name:string) {
    }
    overload<PARAMS extends Record<string, Type<any>|[Type<any>, CommandFieldOptions|boolean]>>(
        callback:(params:{
            [key in keyof PARAMS]:
                PARAMS[key] extends [infer T, infer OPTS] ? OptionalCheck<T, OPTS> :
                PARAMS[key] extends Type<any> ? GetTypeFromParam<PARAMS[key]> :
                never
            }, origin:CommandOrigin, output:CommandOutput)=>void,
        parameters:PARAMS):this {

        interface ParamInfo {
            key:keyof CustomCommandImpl;
            optkey:keyof CustomCommandImpl|null;
            description?:string;
            name:string;
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
                            if (type instanceof CommandEnum) {
                                // match the case
                                nobj[key] = type.mapper.get((this[key] as any as string).toLowerCase());
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

        (parameters as any).__proto__ = null;
        const fields:Record<string, Type<any>> = Object.create(null);
        for (const key in parameters) {
            let optional = false;
            let type:Type<any>|[Type<any>, CommandFieldOptions|boolean] = parameters[key];
            const info:ParamInfo = {
                key: key as keyof CustomCommandImpl,
                name: key,
                optkey: null,
            };

            if (type instanceof Array) {
                const opts = type[1];
                if (typeof opts === 'boolean') {
                    optional = opts;
                } else {
                    optional = !!opts.optional;
                    info.description = opts.description;
                    if (opts.name != null) info.name = opts.name;
                }
                type = type[0];
            }
            if (key in fields) throw Error(`${key}: field name duplicated`);
            if (!CommandRegistry.hasParser(type)) throw Error(`CommandFactory.overload does not support ${type.name}`);
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
        for (const {key, optkey, description, name} of paramInfos) {
            const type = fields[key as string];
            const dataType = type instanceof CommandEnum ?
                CommandParameterDataType.ENUM :
                CommandParameterDataType.NORMAL;
            if (optkey != null) params.push(CustomCommandImpl.optional(key, optkey as any, description, dataType, name));
            else params.push(CustomCommandImpl.mandatory(key, null, description, dataType, name));
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

const commandEnumStored = Symbol('commandEnum');
function _enum<VALUES extends Record<string, string|number>>(name:string, values:VALUES):CommandEnum<VALUES[keyof VALUES]>;
function _enum<VALUES extends string[]>(name:string, ...values:VALUES):CommandEnum<VALUES[number]>;
function _enum(name:string, ...values:(string|Record<string, number|string>)[]):CommandEnum<any> {
    const first = values[0];
    if (typeof first === 'object') {
        const cmdenum:CommandIndexEnum<any>|undefined = (first as any)[commandEnumStored];
        if (cmdenum != null) {
            if (cmdenum.name !== name) {
                console.error(colors.yellow(`the enum name is different but it would not be applied. (${cmdenum.name} => ${name})`));
            }
            return cmdenum;
        }
        return (first as any)[commandEnumStored] = new CommandIndexEnum(name, first); // store and reuse
    } else {
        return new CommandStringEnum(name, ...(values as string[]));
    }
}

export const command ={
    register(name:string,
        description:string,
        perm:CommandPermissionLevel = CommandPermissionLevel.Normal,
        flags1:CommandCheatFlag|CommandVisibilityFlag = CommandCheatFlag.NotCheat,
        flags2:CommandUsageFlag|CommandVisibilityFlag = CommandUsageFlag._Unknown):CustomCommandFactory {
        const registry = serverInstance.minecraft.getCommands().getRegistry();
        const cmd = registry.findCommand(name);
        if (cmd !== null) throw Error(`${name}: command already registered`);
        registry.registerCommand(name, description, perm, flags1, flags2);
        return new CustomCommandFactory(registry, name);
    },
    enum:_enum,
};

const customCommandDtor = makefunc.np(function(){
    this[NativeType.dtor]();
}, void_t, {this:CustomCommand, name:'CustomCommand::destructor'}, int32_t);


bedrockServer.withLoading().then(()=>{
    executeCommandOriginal = procHacker.hooking('MinecraftCommands::executeCommand', MCRESULT, null,
        MinecraftCommands, MCRESULT, SharedPtr.make(CommandContext), bool_t)(executeCommand);
});
