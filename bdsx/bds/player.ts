import { abstract } from "../common";
import { AttributeInstance, BlockPos, Vec3 } from "../minecraft";
import { nativeClass, NativeClass } from "../nativeclass";
import { float32_t, int32_t } from "../nativetype";
import { Abilities } from "./abilities";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { AttributeId } from "./attribute";
import { Certificate } from "./connreq";
import { ContainerId, Item, ItemStack, PlayerInventory } from "./inventory";
import type { NetworkIdentifier } from "./networkidentifier";
import type { Packet } from "./packet";
import { BossEventPacket, ScorePacketInfo, SetDisplayObjectivePacket, SetScorePacket, SetTitlePacket, TextPacket, TransferPacket } from "./packets";
import { DisplaySlot } from "./scoreboard";
import { SerializedSkin } from "./skin";
import minecraft = require('../minecraft');

/** @deprecated import it from bdsx/minecraft */
export class Player extends Actor {
    abilities: Abilities;
    respawnPosition: BlockPos;
    respawnDimension: DimensionId;
    deviceId: string;

    protected _setName(name: string): void {
        abstract();
    }

    addItem(itemStack: ItemStack): boolean {
        abstract();
    }

    changeDimension(dimensionId: number, respawn: boolean): void {
        abstract();
    }

    setName(name: string): void {
        abstract();
    }

    teleportTo(position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, sourceActorId: ActorUniqueID): void {
        abstract();
    }

    getGameType(): GameType {
        abstract();
    }

    getInventory(): PlayerInventory {
        abstract();
    }

    getMainhandSlot(): ItemStack {
        abstract();
    }

    getOffhandSlot(): ItemStack {
        abstract();
    }

    getPermissionLevel(): PlayerPermission {
        abstract();
    }

    getSkin(): SerializedSkin {
        abstract();
    }

    startCooldown(item: Item): void {
        abstract();
    }

    setGameType(gameType: GameType): void {
        abstract();
    }

    setSize(width: number, height: number): void {
        abstract();
    }

    setSleeping(value: boolean): void {
        abstract();
    }

    isSleeping(): boolean {
        abstract();
    }

    isJumping(): boolean {
        abstract();
    }

    syncAbilties(): void {
        abstract();
    }

    getCertificate(): Certificate {
        abstract();
    }
}

/** @deprecated import it from bdsx/minecraft */
export class ServerPlayer extends Player {
    networkIdentifier: NetworkIdentifier;

    protected _sendInventory(shouldSelectSlot: boolean): void {
        abstract();
    }

    knockback(source: Actor, damage: int32_t, xd: float32_t, zd: float32_t, power: float32_t, height: float32_t, heightCap: float32_t): void {
        abstract();
    }

    nextContainerCounter(): ContainerId {
        abstract();
    }

    openInventory(): void {
        abstract();
    }

    sendNetworkPacket(packet: Packet): void {
        abstract();
    }

    sendInventory(shouldSelectSlot: boolean = false): void {
        setTimeout(() => {
            this._sendInventory(shouldSelectSlot);
        }, 50);
    }

    setAttribute(id: AttributeId, value: number): AttributeInstance | null {
        abstract();
    }

    sendChat(message: string, author: string): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Chat;
        pk.name = author;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }

    sendWhisper(message: string, author: string): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Chat;
        pk.name = author;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }

    sendMessage(message: string): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Raw;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }

    sendJukeboxPopup(message: string, params: string[] = []): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.JukeboxPopup;
        pk.message = message;
        for (const param of params) {
            pk.params.push(param);
        }
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }

    sendPopup(message: string, params: string[] = []): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Popup;
        pk.message = message;
        for (const param of params) {
            pk.params.push(param);
        }
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }

    sendTip(message: string, params: string[] = []): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Tip;
        pk.message = message;
        for (const param of params) {
            pk.params.push(param);
        }
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }

    sendTranslatedMessage(message: string, params: string[] = []): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Translate;
        pk.message = message;
        pk.params.push(...params);
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }

    setBossBar(title: string, percent: number): void {
        this.removeBossBar();
        const pk = BossEventPacket.create();
        pk.entityUniqueId = this.getUniqueIdBin();
        pk.playerUniqueId = this.getUniqueIdBin();
        pk.type = BossEventPacket.Types.Show;
        pk.title = title;
        pk.healthPercent = percent;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    resetTitleDuration(): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Reset;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /** Set duration of title animation in ticks, will not affect action bar */
    setTitleDuration(fadeInTime: number, stayTime: number, fadeOutTime: number): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.AnimationTimes;
        pk.fadeInTime = fadeInTime;
        pk.stayTime = stayTime;
        pk.fadeOutTime = fadeOutTime;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    sendTitle(title: string, subtitle?: string): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Title;
        pk.text = title;
        this.sendNetworkPacket(pk);
        pk.dispose();
        if (subtitle) this.sendSubtitle(subtitle);
    }

    /** Will not display if there is no title being displayed */
    sendSubtitle(subtitle: string): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Subtitle;
        pk.text = subtitle;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /** Will not affect action bar */
    clearTitle(): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Clear;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    sendActionbar(actionbar: string): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Actionbar;
        pk.text = actionbar;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    removeBossBar(): void {
        const pk = BossEventPacket.create();
        pk.entityUniqueId = this.getUniqueIdBin();
        pk.playerUniqueId = this.getUniqueIdBin();
        pk.type = BossEventPacket.Types.Hide;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /** @param lines Example: ["my score is 0", ["my score is 3", 3], "my score is 2 as my index is 2"] */
    setFakeScoreboard(title: string, lines: Array<string | [string, number]>, name: string = `tmp-${new Date().getTime()}`): string {
        this.removeFakeScoreboard();
        {
            const pk = SetDisplayObjectivePacket.create();
            pk.displaySlot = DisplaySlot.Sidebar;
            pk.objectiveName = name;
            pk.displayName = title;
            pk.criteriaName = "dummy";
            this.sendNetworkPacket(pk);
            pk.dispose();
        }
        {
            const pk = SetScorePacket.create();
            pk.type = SetScorePacket.Type.CHANGE;
            const entries: Array<ScorePacketInfo> = [];
            for (const [i, line] of lines.entries()) {
                const entry = ScorePacketInfo.construct();
                entry.objectiveName = name;
                entry.scoreboardId.idAsNumber = i + 1;
                entry.type = ScorePacketInfo.Type.FAKE_PLAYER;
                if (typeof line === "string") {
                    entry.score = i + 1;
                    entry.customName = line;
                } else {
                    entry.score = line[1];
                    entry.customName = line[0];
                }
                pk.entries.push(entry);
                entries.push(entry);
            }
            this.sendNetworkPacket(pk);
            pk.dispose();
            for (const entry of entries) {
                entry.destruct();
            }
        }
        return name;
    }

    removeFakeScoreboard(): void {
        const pk = SetDisplayObjectivePacket.create();
        pk.displaySlot = DisplaySlot.Sidebar;
        pk.objectiveName = "";
        pk.displayName = "";
        pk.criteriaName = "dummy";
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    transferServer(address: string, port: number = 19132): void {
        const pk = TransferPacket.create();
        pk.address = address;
        pk.port = port;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
}

@nativeClass(0x282)
export class PlayerListEntry extends NativeClass {
    static create(player: Player): PlayerListEntry {
        abstract();
    }
}

/** @deprecated */
export const GameType = minecraft.GameType;
/** @deprecated */
export type GameType = minecraft.GameType;

export enum PlayerPermission {
    VISITOR,
    MEMBER,
    OPERATOR,
    CUSTOM
}
