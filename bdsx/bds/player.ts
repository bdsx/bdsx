import { abstract } from "bdsx/common";
import { NativeType } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { Actor } from "./actor";
import { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";

export class Player extends Actor {
    protected _setName(name: CxxStringWrapper):void {
        abstract();
    }
    setName(name:string):void {
        let _name = new CxxStringWrapper(true);
        _name[NativeType.ctor]();
        _name.value = name;
        this._setName(_name);
        _name[NativeType.dtor]();
    }
}

export class ServerPlayer extends Player {
    networkIdentifier:NetworkIdentifier;

    openInventory():void {
        abstract();
    }
    
    sendNetworkPacket(packet:Packet):void {
        abstract();
    }
}
