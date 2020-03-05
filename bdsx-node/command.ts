
import { EventEx, CapsuledEvent } from 'krevent';
import netevent = require('./netevent');
import { NativePointer, setOnCommandListener, NetworkIdentifier } from './native';
import PacketId = require('./packetId');
import { CANCEL, Encoding } from './common';


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
    )
    {
    }

    setCommand(command: string): void {
        this.isModified = true;
        this.command = command;
    }
}
type UserCommandListener = (ev: CommandEvent) => void|CANCEL;
type HookCommandListener = (command:string, originName:string) => void|number;

class UserCommandEvents extends EventEx<UserCommandListener>
{
    private readonly listener = (ptr: NativePointer, networkIdentifier: NetworkIdentifier, packetId: PacketId) => {
        ptr.move(0x28);
        const command = ptr.readCxxString(Encoding.Ansi);
        const ev = new CommandEventImpl(command, networkIdentifier);
        if (this.fire(ev) === CANCEL) return CANCEL;
        if (ev.isModified) {
            ptr.move(-0x20);
            ptr.writeCxxString(ev.command, Encoding.Ansi);
        }
    };

    onStarted(): void {
        netevent.before(PacketId.CommandRequest).on(this.listener);
    }
    onCleared(): void {
        netevent.before(PacketId.CommandRequest).remove(this.listener);
    }
}

class HookCommandEvents extends EventEx<HookCommandListener>
{
    private readonly listener = (command:string, originName:string) => {
        return this.fire(command, originName);
    };

    onStarted(): void {
        setOnCommandListener(this.listener);
    }
    onCleared(): void {
        setOnCommandListener(null);
    }
}

export const net = new UserCommandEvents() as CapsuledEvent<UserCommandListener>;
export const hook = new HookCommandEvents() as CapsuledEvent<HookCommandListener>;
