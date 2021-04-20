
import { CapsuledEvent, EventEx } from 'krevent';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { TextPacket } from './bds/packets';
import { CANCEL } from './common';
import { events } from './event';

interface ChatEvent
{
    readonly name:string;
    readonly message:string;
    readonly networkIdentifier:NetworkIdentifier;

    /**
     * @deprecated not working ?
     */
    setName(name:string):void;
    setMessage(message:string):void;
}

class ChatEventImpl implements ChatEvent {
    public isModified = false;

    constructor(
        public name:string,
        public message:string,
        public networkIdentifier:NetworkIdentifier
    ) {
    }

    setName(name:string):void {
        this.isModified = true;
        this.name = name;
    }

    setMessage(message:string):void {
        this.isModified = true;
        this.message = message;
    }
}
type ChatListener = (ev:ChatEvent)=>CANCEL|void;

class ChatManager extends EventEx<ChatListener> {
    private readonly chatlistener = (ptr:TextPacket, networkIdentifier:NetworkIdentifier, packetId:MinecraftPacketIds):CANCEL|void=>{
        const name = ptr.name;
        const message = ptr.message;
        const ev = new ChatEventImpl(name, message, networkIdentifier);
        if (this.fire(ev) === CANCEL) return CANCEL;
        if (ev.isModified) {
            ptr.name = ev.name;
            ptr.message = ev.message;
        }
    };

    onStarted():void {
        events.packetBefore(MinecraftPacketIds.Text).on(this.chatlistener);
    }
    onCleared():void {
        events.packetBefore(MinecraftPacketIds.Text).remove(this.chatlistener);
    }

    /** @deprecated use nethook.before(MinecraftPacketIds.Text).on */
    on(listener: ChatListener): void {
        super.on(listener);
    }
}

/** @deprecated use nethook.before(MinecraftPacketIds.Text).on */
export = new ChatManager() as CapsuledEvent<ChatListener>;
