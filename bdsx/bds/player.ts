import { abstract } from "bdsx/common";
import { Abilities } from "./abilities";
import { Actor, ActorUniqueID } from "./actor";
import { AttributeId, AttributeInstance } from "./attribute";
import { Vec3 } from "./blockpos";
import { Item, ItemStack, PlayerInventory } from "./inventory";
import type { NetworkIdentifier } from "./networkidentifier";
import type { Packet } from "./packet";

export class Player extends Actor {
    abilities:Abilities;

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

    startCooldown(item:Item):void{
        abstract();
    }

    setGameType(gameType:GameType):void {
        abstract();
    }

    setSize(width:number, height:number):void{
        abstract();
    }

    setSleeping(value:boolean):void{
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

    setAttribute(id:AttributeId, value:number):AttributeInstance|null {
        abstract();
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
