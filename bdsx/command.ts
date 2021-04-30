
import { CapsuledEvent, EventEx } from 'krevent';
import { Command, CommandContext, CommandFlag, CommandOutput, CommandParameterData, CommandPermissionLevel, CommandRegistry, MCRESULT, MinecraftCommands } from './bds/command';
import { CommandOrigin } from './bds/commandorigin';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { CommandRequestPacket } from './bds/packets';
import { procHacker } from './bds/proc';
import { serverInstance } from './bds/server';
import { CANCEL } from './common';
import { events } from './event';
import { bedrockServer } from './launcher';
import { makefunc } from './makefunc';
import { nativeClass, nativeField } from './nativeclass';
import { bool_t, int32_t, NativeType, Type, void_t } from './nativetype';
import { SharedPtr } from './sharedpointer';
import { _tickCallback } from './util';


let executeCommandOriginal:(cmd:MinecraftCommands, res:MCRESULT, ctxptr:SharedPtr<CommandContext>, b:bool_t)=>MCRESULT;
function executeCommand(cmd:MinecraftCommands, res:MCRESULT, ctxptr:SharedPtr<CommandContext>, b:bool_t):MCRESULT {
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
}

MinecraftCommands.prototype.executeCommand = function(ctx, b) {
    const res = new MCRESULT(true);
    return executeCommand(this, res, ctx, b);
};

/**
 * @deprecated why are you using it?
 */
export function hookingForCommand(): void {
    // it will be called with the event callback
}

interface CommandEvent {
    readonly command: string;
    readonly networkIdentifier: NetworkIdentifier;

    setCommand(command: string): void;
}

class CommandEventImpl implements CommandEvent {
    public isModified = false;

    constructor(
        public command: string,
        public networkIdentifier: NetworkIdentifier
    ) {
    }

    setCommand(command: string): void {
        this.isModified = true;
        this.command = command;
    }
}
type UserCommandListener = (ev: CommandEvent) => void | CANCEL;

class UserCommandEvents extends EventEx<UserCommandListener> {
    private readonly listener = (ptr: CommandRequestPacket, networkIdentifier: NetworkIdentifier, packetId: MinecraftPacketIds):void|CANCEL => {
        const command = ptr.command;
        const ev = new CommandEventImpl(command, networkIdentifier);
        if (this.fire(ev) === CANCEL) return CANCEL;
        if (ev.isModified) {
            ptr.command = ev.command;
        }
    };

    onStarted(): void {
        events.packetBefore(MinecraftPacketIds.CommandRequest).on(this.listener);
    }
    onCleared(): void {
        events.packetBefore(MinecraftPacketIds.CommandRequest).remove(this.listener);
    }
}

/** @deprecated use nethook.before(MinecraftPacketIds.CommandRequest).on */
export const net = new UserCommandEvents() as CapsuledEvent<UserCommandListener>;

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

type ParamToObject<PARAM> = PARAM extends [string, Type<infer T>, string] ?
{[key in PARAM[0]|PARAM[2]]:key extends PARAM[0] ? T : bool_t} :
    PARAM extends [string, Type<infer T>] ?
    {[key in PARAM[0]]:T} :
    never;
type CombineUnion<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? {[key in keyof I]:I[key]} : never;
type ParamsToObjects<PARAMS extends [string, Type<any>, string?][]> = {[key in keyof PARAMS]:PARAMS[key] extends [string, Type<any>, string?] ? ParamToObject<PARAMS[key]> : never};
type ParamsToObject<PARAMS extends [string, Type<any>, string?][]> = CombineUnion<ParamsToObjects<PARAMS>[number]>;

export class CustomCommandFactory {

    constructor(
        public readonly registry:CommandRegistry,
        public readonly name:string) {
    }

    /**
     * @deprecated use overload, naming mistake
     */
    override<KEY extends string, ITEM extends [KEY, Type<any>, KEY?], PARAMS extends ITEM[]>(callback:(command:ParamsToObject<PARAMS>, origin:CommandOrigin, output:CommandOutput)=>void, ...parameters:PARAMS):this {
        const fields:Record<string, Type<any>> = {};
        for (const [name, type, optkey] of parameters) {
            if (name in fields) throw Error(`${name}: field name dupplicated`);
            fields[name] = type;
            if (optkey !== undefined) {
                if (optkey in fields) throw Error(`${optkey}: field name dupplicated`);
                fields[optkey] = bool_t;
            }
        }
        class CustomCommandImpl extends CustomCommand {
            [NativeType.ctor]():void {
                this.self_vftable.execute = customCommandExecute;
            }
            execute(origin:CommandOrigin, output:CommandOutput):void {
                callback(this as any, origin, output);
            }
        }
        CustomCommandImpl.define(fields);

        const customCommandExecute = makefunc.np(function(this:CustomCommandImpl, origin:CommandOrigin, output:CommandOutput){
            this.execute(origin, output);
        }, void_t, {this:CustomCommandImpl}, CommandOrigin, CommandOutput);

        const params:CommandParameterData[] = [];
        for (const [name, type, optkey] of parameters) {
            if (optkey !== undefined) {
                params.push(CustomCommandImpl.optional(name as keyof CustomCommandImpl, optkey as keyof CustomCommandImpl));
            } else {
                params.push(CustomCommandImpl.mandatory(name as keyof CustomCommandImpl, null));
            }
        }

        this.registry.registerOverload(this.name, CustomCommandImpl, params);
        return this;
    }

    overload<PARAMS extends Record<string, Type<any>|[Type<any>, boolean]>>(
        callback:(params:{
            [key in keyof PARAMS]:PARAMS[key] extends [Type<infer F>, infer V] ?
                (V extends true ? F|undefined : F) :
                (PARAMS[key] extends {prototype:infer F} ? F : PARAMS[key] extends Type<infer F> ? F : never)
            }, origin:CommandOrigin, output:CommandOutput)=>void,
        parameters:PARAMS):this {

        const paramNames:[keyof CustomCommandImpl, (keyof CustomCommandImpl)?][] = [];
        class CustomCommandImpl extends CustomCommand {
            [NativeType.ctor]():void {
                this.self_vftable.execute = customCommandExecute;
            }
            execute(origin:CommandOrigin, output:CommandOutput):void {
                try {
                    const nobj:Record<keyof CustomCommandImpl, any> = {} as any;
                    for (const [name, optkey] of paramNames) {
                        if (optkey === undefined || this[optkey]) {
                            nobj[name] = this[name];
                        }
                    }
                    callback(nobj as any, origin, output);
                } catch (err) {
                    events.errorFire(err);
                }
            }
        }

        const fields:Record<string, Type<any>> = {};
        for (const name in parameters) {
            let optional = false;
            let type:Type<any>|[Type<any>,boolean] = parameters[name];
            if (type instanceof Array) {
                optional = type[1];
                type = type[0];
            }
            if (name in fields) throw Error(`${name}: field name dupplicated`);
            fields[name] = type;
            if (optional) {
                const optkey = name+'__set';
                if (optkey in fields) throw Error(`${optkey}: field name dupplicated`);
                fields[optkey] = bool_t;
                paramNames.push([name as keyof CustomCommandImpl, optkey as keyof CustomCommandImpl]);
            } else {
                paramNames.push([name as keyof CustomCommandImpl]);
            }
        }

        const params:CommandParameterData[] = [];
        CustomCommandImpl.define(fields);
        for (const [name, optkey] of paramNames) {
            if (optkey !== undefined) params.push(CustomCommandImpl.optional(name, optkey));
            else params.push(CustomCommandImpl.mandatory(name, null));
        }

        const customCommandExecute = makefunc.np(function(this:CustomCommandImpl, origin:CommandOrigin, output:CommandOutput){
            this.execute(origin, output);
        }, void_t, {this:CustomCommandImpl}, CommandOrigin, CommandOutput);

        this.registry.registerOverload(this.name, CustomCommandImpl, params);
        return this;
    }

    alias(alias:string):this {
        this.registry.registerAlias(this.name, alias);
        return this;
    }
}

export namespace command {

    /**
     * @deprecated use events.command
     */
    export const hook = events.command;

    export function register(name:string,
        description:string,
        perm:CommandPermissionLevel = CommandPermissionLevel.Normal,
        flags1:CommandFlag = 0x40, // register to list?
        flags2:CommandFlag = CommandFlag.None):CustomCommandFactory {
        const registry = serverInstance.minecraft.commands.getRegistry();
        const cmd = registry.findCommand(name);
        if (cmd !== null) throw Error(`${name}: command already registered`);
        registry.registerCommand(name, description, perm, flags1, flags2);
        return new CustomCommandFactory(registry, name);
    }
}

/**
 * @deprecated use events.command
 */
export const hook = events.command;

const customCommandDtor = makefunc.np(function(){
    this[NativeType.dtor]();
}, void_t, {this:CustomCommand}, int32_t);


bedrockServer.withLoading().then(()=>{
    executeCommandOriginal = procHacker.hooking('MinecraftCommands::executeCommand', MCRESULT, null,
        MinecraftCommands, MCRESULT, SharedPtr.make(CommandContext), bool_t)(executeCommand);
});
