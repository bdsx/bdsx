
import { EventEx, CapsuledEvent } from 'krevent';
import netevent = require('./netevent');
import { NativePointer, NetworkIdentifier } from './native';
import PacketId = require('./packetId');
import { CANCEL } from './common';


interface ChatEvent
{
    readonly name:string;
    readonly message:string;
    readonly networkIdentifier:NetworkIdentifier;

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
    private readonly chatlistener = (ptr:NativePointer, networkIdentifier:NetworkIdentifier, packetId:PacketId)=>{
        const name = ptr.getCxxString(0x30);
        const message = ptr.getCxxString(0x50);
        const ev = new ChatEventImpl(name, message, networkIdentifier);
        if (this.fire(ev) === CANCEL) return CANCEL;
        if (ev.isModified)
        {
            ptr.setCxxString(ev.name, 0x30);
            ptr.setCxxString(ev.message, 0x50);
        }
    };

    onStarted():void
    {
        netevent.before(PacketId.Text).on(this.chatlistener);
    }
    onCleared():void
    {
        netevent.before(PacketId.Text).remove(this.chatlistener);
    }
}

export = new ChatManager() as CapsuledEvent<ChatListener>;
