
import { EventEx, CapsuledEvent } from 'krevent';
import netevent = require('./netevent');
import { NativePointer } from './core';
import { CANCEL } from './common';
import { NetworkIdentifier } from './bds/networkidentifier';
import { MinecraftPacketIds } from './bds/packetids';
import { TextPacket } from './bds/packets';


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

class ChatEventImpl implements ChatEvent
{
    public isModified = false;

    constructor(
        public name:string, 
        public message:string,
        public networkIdentifier:NetworkIdentifier
    )
    {
    }

    setName(name:string):void
    {
        this.isModified = true;
        this.name = name;
    }

    setMessage(message:string):void
    {
        this.isModified = true;
        this.message = message;
    }
}
type ChatListener = (ev:ChatEvent)=>CANCEL|void;

class ChatManager extends EventEx<ChatListener>
{
    private readonly chatlistener = (ptr:TextPacket, networkIdentifier:NetworkIdentifier, packetId:MinecraftPacketIds)=>{
        const name = ptr.name;
        const message = ptr.message;
        const ev = new ChatEventImpl(name, message, networkIdentifier);
        if (this.fire(ev) === CANCEL) return CANCEL;
        if (ev.isModified)
        {
            ptr.name = ev.name;
            ptr.message = ev.message;
        }
    };

    onStarted():void
    {
        netevent.before(MinecraftPacketIds.Text).on(this.chatlistener);
    }
    onCleared():void
    {
        netevent.before(MinecraftPacketIds.Text).remove(this.chatlistener);
    }
}

export = new ChatManager() as CapsuledEvent<ChatListener>;
