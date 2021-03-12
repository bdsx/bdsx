
import Event, { CapsuledEvent, EventEx } from 'krevent';
import { CommandContext, MCRESULT, MinecraftCommands } from './bds/command';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { CommandRequestPacket } from './bds/packets';
import { procHacker } from './bds/proc';
import { CANCEL } from './common';
import { RawTypeId } from './makefunc';
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

export namespace command {

    export const hook = hookev as CapsuledEvent<HookCommandListener>;
}

/**
 * @deprecated use command.hook
 */
export const hook = hookev as CapsuledEvent<HookCommandListener>;
