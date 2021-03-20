
import Event, { CapsuledEvent, EventEx } from 'krevent';
import { Command, CommandContext, CommandFlag, CommandOutput, CommandParameterData, CommandPermissionLevel, CommandRegistry, MCRESULT, MinecraftCommands } from './bds/command';
import { CommandOrigin } from './bds/commandorigin';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { CommandRequestPacket } from './bds/packets';
import { procHacker } from './bds/proc';
import { serverInstance } from './bds/server';
import { CANCEL } from './common';
import { makefunc, RawTypeId } from './makefunc';
import { nativeClass, nativeField } from './nativeclass';
import { bool_t, NativeType, Type } from './nativetype';
import { nethook } from './nethook';
import { SharedPtr } from './sharedpointer';
import { _tickCallback } from './util';

export function hookingForCommand(): void {
    const executeCommandOriginal = procHacker.hooking('MinecraftCommands::executeCommand', MCRESULT, null,
        MinecraftCommands, MCRESULT, SharedPtr.make(CommandContext), RawTypeId.Boolean)(
        (cmd, res, ctxptr, b)=>{
            const ctx = ctxptr.p!;
            const name = ctx.origin.getName();
            const resv = hookev.fire(ctxptr.p!.command, name, ctx);
            switch (typeof resv) {
            case 'number':
                res.result = resv;
                _tickCallback();
                return res;
            default:
                _tickCallback();
                return executeCommandOriginal(cmd, res, ctxptr, b);
            }
        });
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
type HookCommandListener = (command: string, originName: string, ctx: CommandContext) => void | number;

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
        nethook.before(MinecraftPacketIds.CommandRequest).on(this.listener);
    }
    onCleared(): void {
        nethook.before(MinecraftPacketIds.CommandRequest).remove(this.listener);
    }
}

const hookev = new Event<HookCommandListener>();

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

    execute():void {
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

    override<KEY extends string, ITEM extends [KEY, Type<any>, KEY?], PARAMS extends ITEM[]>(callback:(command:ParamsToObject<PARAMS>)=>void, ...parameters:PARAMS):this {
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
            execute():void {
                callback(this as any);
            }
        }
        CustomCommandImpl.define(fields);

        const customCommandExecute = makefunc.np(function(this:CustomCommandImpl){
            this.execute();
        }, RawTypeId.Void, {this:CustomCommandImpl}, RawTypeId.Int32, CommandOrigin, CommandOutput);

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

    alias(alias:string):this {
        this.registry.registerAlias(this.name, alias);
        return this;
    }
}

export namespace command {

    export const hook = hookev as CapsuledEvent<HookCommandListener>;

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
 * @deprecated use command.hook
 */
export const hook = hookev as CapsuledEvent<HookCommandListener>;

const customCommandDtor = makefunc.np(function(){
    this[NativeType.dtor]();
}, RawTypeId.Void, {this:CustomCommand}, RawTypeId.Int32);

