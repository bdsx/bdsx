import { abstract } from "../common";
import { CxxString, float32_t, int32_t } from "../nativetype";
import { Abilities } from "./abilities";
import { Actor, ActorUniqueID } from "./actor";
import { AttributeId, AttributeInstance } from "./attribute";
import { Vec3 } from "./blockpos";
import { Item, ItemStack, PlayerInventory } from "./inventory";
import type { NetworkIdentifier } from "./networkidentifier";
import type { Packet } from "./packet";

export class Player extends Actor {
    abilities:Abilities;
    deviceId:string;

    changeDimension(dimensionId:number, respawn:boolean):void {
        abstract();
    }

    setName(name:string):void {
        abstract();
    }

    teleportTo(position:Vec3, shouldStopRiding:boolean, cause:number, sourceEntityType:number, sourceActorId:ActorUniqueID):void {
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

    setSize(width:number, height:number):void {
        abstract();
    }

    setSleeping(value:boolean):void {
        abstract();
    }

    isSleeping():boolean {
        abstract();
    }

    isJumping():boolean {
        abstract();
    }

    syncAbilties():void {
        abstract();
    }

}

export class ServerPlayer extends Player {
    networkIdentifier:NetworkIdentifier;

    protected _sendInventory(shouldSelectSlot:boolean):void {
        abstract();
    }

    knockback(source: Actor, damage: int32_t, xd: float32_t, zd: float32_t, power: float32_t, height: float32_t, heightCap: float32_t): void {
        abstract();
    }

    openInventory():void {
        abstract();
    }

    sendNetworkPacket(packet:Packet):void {
        abstract();
    }

    sendInventory(shouldSelectSlot:boolean = false):void {
        setTimeout(() => {
            this._sendInventory(shouldSelectSlot);
        }, 50);
    }

    setAttribute(id:AttributeId, value:number):AttributeInstance|null {
        abstract();
    }

    sendTranslatedMessage(message:CxxString, params:string[] = []):void {
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
