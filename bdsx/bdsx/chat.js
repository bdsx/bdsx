//@ts-check
"use strict";
const { MinecraftPacketIds } = require("./bds/packetids");
const { CANCEL } = require("./common");
const { events } = require("./event");
const { EventEx } = require("./eventtarget");

class ChatEventImpl {
    constructor(name, message, networkIdentifier) {
        this.name = name;
        this.message = message;
        this.networkIdentifier = networkIdentifier;
        this.isModified = false;
    }
    setName(name) {
        this.isModified = true;
        this.name = name;
    }
    setMessage(message) {
        this.isModified = true;
        this.message = message;
    }
}
class ChatManager extends EventEx {
    constructor() {
        super();
        this.chatlistener = (ptr, networkIdentifier, packetId) => {
            const name = ptr.name;
            const message = ptr.message;
            const ev = new ChatEventImpl(name, message, networkIdentifier);
            if (this.fire(ev) === CANCEL)
                return CANCEL;
            if (ev.isModified) {
                ptr.name = ev.name;
                ptr.message = ev.message;
            }
        };
    }
    onStarted() {
        events.packetBefore(MinecraftPacketIds.Text).on(this.chatlistener);
    }
    onCleared() {
        events.packetBefore(MinecraftPacketIds.Text).remove(this.chatlistener);
    }
    on(listener) {
        super.on(listener);
    }
}
module.exports = new ChatManager();
