
import { EventEx, CapsuledEvent } from 'krevent';
import netevent = require('./netevent');
import { NativePointer } from './native';
import PacketId = require('./packetId');


interface ChatEvent
{
    readonly name:string;
    readonly message:string;
    readonly networkIdentifier:string;

    setName(name:string):void;
    setMessage(message:string):void;
}

class ChatEventImpl implements ChatEvent
{
    public isModified = false;

    constructor(
        public name:string, 
        public message:string,
        public networkIdentifier:string
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
type ChatListener = (ev:ChatEvent)=>void;

class ChatManager extends EventEx<ChatListener>
{
    private readonly chatlistener = (ptr:NativePointer, networkIdentifier:string, packetId:PacketId)=>{
        ptr.move(0x30);
        const name = ptr.readCxxString();
        const message = ptr.readCxxString();
        const ev = new ChatEventImpl(name, message, networkIdentifier);
        this.fire(ev);
        if (ev.isModified)
        {
            ptr.move(-0x40);
            ptr.writeCxxString(ev.name);
            ptr.writeCxxString(ev.message);
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
