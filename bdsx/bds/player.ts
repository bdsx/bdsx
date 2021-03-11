import { abstract } from "bdsx/common";
import { NativeType } from "bdsx/nativetype";
import { CxxStringWrapper } from "bdsx/pointer";
import { Actor, ActorUniqueID } from "./actor";
import { Vec3 } from "./blockpos";
import { PlayerInventory } from "./inventory";
import { NetworkIdentifier } from "./networkidentifier";
import { Packet } from "./packet";

export class Player extends Actor {
    protected _setName(name: CxxStringWrapper):void {
        abstract();
    }
    changeDimension(dimensionId:number, respawn:boolean):void {
        abstract();
    }
    setName(name:string):void {
        const _name = new CxxStringWrapper(true);
        _name[NativeType.ctor]();
        _name.value = name;
        this._setName(_name);
        _name[NativeType.dtor]();
    }
    teleportTo(position:Vec3, checkForBlocks:boolean, c:number, actorType:number, actorId:ActorUniqueID):void {
        abstract();
    }
    getInventory():PlayerInventory {
        abstract();
    }
}

export class ServerPlayer extends Player {
    networkIdentifier:NetworkIdentifier;

    protected _sendInventory():void {
        abstract();
    }
    
    openInventory():void {
        abstract();
    }
    
    sendNetworkPacket(packet:Packet):void {
        abstract();
    }
    
    sendInventory():void {
        setTimeout(() => {
            this._sendInventory();
        }, 50);
    }
}
