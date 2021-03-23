import { abstract } from "bdsx/common";
import { CxxStringWrapper } from "bdsx/pointer";
import { Actor, ActorUniqueID } from "./actor";
import { Vec3 } from "./blockpos";
import { ItemStack, PlayerInventory } from "./inventory";
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
        _name.construct();
        _name.value = name;
        this._setName(_name);
        _name.destruct();
    }

    teleportTo(position:Vec3, checkForBlocks:boolean, c:number, actorType:number, actorId:ActorUniqueID):void {
        abstract();
    }

    getGameType():GameType {
        abstract();
    }

    getInventory():PlayerInventory {
        abstract();
    }

    getMainhandSlot():ItemStack {
        abstract();
    }

    getOffhandSlot():ItemStack {
        abstract();
    }

    getPermissionLevel(): PlayerPermission {
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

export enum GameType {
    Survival,
    Creative,
    Adventure,
    SurvivalSpectator,
    CreativeSpectator,
    Default
}

export enum PlayerPermission {
    VISITOR,
    MEMBER,
    OPERATOR,
    CUSTOM
}
