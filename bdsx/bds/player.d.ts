import { AttributeInstance, BlockPos, Vec3 } from "../minecraft";
import { NativeClass } from "../nativeclass";
import { float32_t, int32_t } from "../nativetype";
import { Abilities } from "./abilities";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { AttributeId } from "./attribute";
import { Certificate } from "./connreq";
import { ContainerId, Item, ItemStack, PlayerInventory } from "./inventory";
import type { NetworkIdentifier } from "./networkidentifier";
import type { Packet } from "./packet";
import { SerializedSkin } from "./skin";
import minecraft = require('../minecraft');
/** @deprecated import it from bdsx/minecraft */
export declare class Player extends Actor {
    abilities: Abilities;
    respawnPosition: BlockPos;
    respawnDimension: DimensionId;
    deviceId: string;
    protected _setName(name: string): void;
    addItem(itemStack: ItemStack): boolean;
    changeDimension(dimensionId: number, respawn: boolean): void;
    setName(name: string): void;
    teleportTo(position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, sourceActorId: ActorUniqueID): void;
    getGameType(): GameType;
    getInventory(): PlayerInventory;
    getMainhandSlot(): ItemStack;
    getOffhandSlot(): ItemStack;
    getPermissionLevel(): PlayerPermission;
    getSkin(): SerializedSkin;
    startCooldown(item: Item): void;
    setGameType(gameType: GameType): void;
    setSize(width: number, height: number): void;
    setSleeping(value: boolean): void;
    isSleeping(): boolean;
    isJumping(): boolean;
    syncAbilties(): void;
    getCertificate(): Certificate;
}
/** @deprecated import it from bdsx/minecraft */
export declare class ServerPlayer extends Player {
    networkIdentifier: NetworkIdentifier;
    protected _sendInventory(shouldSelectSlot: boolean): void;
    knockback(source: Actor, damage: int32_t, xd: float32_t, zd: float32_t, power: float32_t, height: float32_t, heightCap: float32_t): void;
    nextContainerCounter(): ContainerId;
    openInventory(): void;
    sendNetworkPacket(packet: Packet): void;
    sendInventory(shouldSelectSlot?: boolean): void;
    setAttribute(id: AttributeId, value: number): AttributeInstance | null;
    sendChat(message: string, author: string): void;
    sendWhisper(message: string, author: string): void;
    sendMessage(message: string): void;
    sendJukeboxPopup(message: string, params?: string[]): void;
    sendPopup(message: string, params?: string[]): void;
    sendTip(message: string, params?: string[]): void;
    sendTranslatedMessage(message: string, params?: string[]): void;
    setBossBar(title: string, percent: number): void;
    resetTitleDuration(): void;
    /** Set duration of title animation in ticks, will not affect action bar */
    setTitleDuration(fadeInTime: number, stayTime: number, fadeOutTime: number): void;
    sendTitle(title: string, subtitle?: string): void;
    /** Will not display if there is no title being displayed */
    sendSubtitle(subtitle: string): void;
    /** Will not affect action bar */
    clearTitle(): void;
    sendActionbar(actionbar: string): void;
    removeBossBar(): void;
    /** @param lines Example: ["my score is 0", ["my score is 3", 3], "my score is 2 as my index is 2"] */
    setFakeScoreboard(title: string, lines: Array<string | [string, number]>, name?: string): string;
    removeFakeScoreboard(): void;
    transferServer(address: string, port?: number): void;
}
export declare class PlayerListEntry extends NativeClass {
    static create(player: Player): PlayerListEntry;
}
/** @deprecated */
export declare const GameType: typeof minecraft.GameType;
/** @deprecated */
export declare type GameType = minecraft.GameType;
export declare enum PlayerPermission {
    VISITOR = 0,
    MEMBER = 1,
    OPERATOR = 2,
    CUSTOM = 3
}
