import { abstract } from "bdsx/common";
import { Actor, ActorUniqueID } from "./actor";
import { Vec3 } from "./blockpos";
import { Item, ItemStack, PlayerInventory } from "./inventory";
import type { NetworkIdentifier } from "./networkidentifier";
import type { Packet } from "./packet";

export class Player extends Actor {

    changeDimension(dimensionId:number, respawn:boolean):void {
        abstract();
    }

    setName(name:string):void {
        abstract();
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

    startCooldown(Item:Item):void{
        abstract();
    }

    setSize(v1:number, v2:number):void{
        abstract();
    }

    setSleeping(bool:boolean):void{
        abstract();
    }

    isSleeping():boolean{
        abstract();
    }

    isJumping():boolean{
        abstract();
    }
}

export class ServerPlayer extends Player {
    networkIdentifier:NetworkIdentifier;

    protected _sendInventory(b:boolean):void {
        abstract();
    }

    openInventory():void {
        abstract();
    }

    sendNetworkPacket(packet:Packet):void {
        abstract();
    }

    sendInventory(b:boolean = false):void {
        setTimeout(() => {
            this._sendInventory(b);
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
