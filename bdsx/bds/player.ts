import { abstract } from "../common";
import { nativeClass, NativeClass } from "../nativeclass";
import { float32_t, int32_t } from "../nativetype";
import type { Abilities } from "./abilities";
import { Actor, ActorUniqueID, DimensionId } from "./actor";
import { AttributeId, AttributeInstance } from "./attribute";
import { Block } from "./block";
import type { BlockPos, Vec3 } from "./blockpos";
import { Certificate } from "./connreq";
import { ArmorSlot, ContainerId, Item, ItemStack, PlayerInventory, PlayerUIContainer } from "./inventory";
import type { NetworkIdentifier } from "./networkidentifier";
import type { Packet } from "./packet";
import { BossEventPacket, ScorePacketInfo, SetDisplayObjectivePacket, SetScorePacket, SetTitlePacket, TextPacket, TransferPacket } from "./packets";
import { DisplaySlot } from "./scoreboard";
import { serverInstance } from "./server";
import type { SerializedSkin } from "./skin";

export class Player extends Actor {
    abilities: Abilities;
    playerUIContainer: PlayerUIContainer;
    /** @deprecated Use `this.getSpawnDimension()` instead */
    get respawnDimension(): DimensionId {
        return this.getSpawnDimension();
    }
    /** @deprecated Use `this.getSpawnPosition()` instead */
    get respawnPosition(): BlockPos {
        return this.getSpawnPosition();
    }
    deviceId: string;

    protected _setName(name: string): void {
        abstract();
    }

    /**
     * Adds an item to the player's inventory
     * @remarks Player inventory will not be updated. Use ServerPlayer.sendInventory() to update it.
     *
     * @param itemStack - Item to add
     * @returns {boolean} Whether the item has been added successfully (Full inventory can be a cause of failure)
     */
    addItem(itemStack: ItemStack): boolean {
        abstract();
    }

    /**
     * Teleports the player to another dimension
     *
     * @param dimensionId - The dimension ID
     * @param respawn - Indicates whether the dimension change is based on a respawn (player died in dimension)
     *
     * @see DimensionId
     */
    changeDimension(dimensionId: DimensionId, respawn: boolean): void {
        abstract();
    }

    /**
     * Changes the player's name
     *
     * @param name - New name
     */
    setName(name: string): void {
        abstract();
    }

    /**
     * Teleports the player to a specified position
     * @remarks This function is used when entities teleport players (e.g: ender pearls). Use Actor.teleport() if you want to teleport the player.
     *
     * @param position - Position to teleport the player to
     * @param shouldStopRiding - Defines whether the player should stop riding an entity when teleported
     * @param cause - Cause of teleportation
     * @param sourceEntityType - Entity type that caused the teleportation
     * @param sourceActorId - ActorUniqueID of the source entity
     *
     * @privateRemarks causes of teleportation are currently unknown.
     */
    teleportTo(position: Vec3, shouldStopRiding: boolean, cause: number, sourceEntityType: number, sourceActorId: ActorUniqueID): void {
        abstract();
    }

    /**
     * Returns the player's gamemode
     */
    getGameType(): GameType {
        abstract();
    }

    /**
     * Returns the player's inventory proxy
     */
    getInventory(): PlayerInventory {
        abstract();
    }

    /**
     * Returns the item currently held by the player
     */
    getMainhandSlot(): ItemStack {
        abstract();
    }

    /**
     * Returns the item currently in the player's offhand slot
     */
    getOffhandSlot(): ItemStack {
        abstract();
    }

    /**
     * Returns the player's permission level
     * @see PlayerPermission
     */
    getPermissionLevel(): PlayerPermission {
        abstract();
    }

    /**
     * Returns the player's skin
     */
    getSkin(): SerializedSkin {
        abstract();
    }

    /**
     * Triggers an item cooldown (e.g: Ender pearl)
     * @remarks This function seems to crash the server. use ItemStack.startCoolDown() instead.
     *
     * @param item - Item to start the cooldown on
     */
    startCooldown(item: Item): void {
        abstract();
    }

    /**
     * Changes the player's gamemode
     *
     * @param gameType - Gamemode to switch to
     */
    setGameType(gameType: GameType): void {
        abstract();
    }

    /**
     * Changes the player's size
     * @remarks This function does not update the player's skin size.
     *
     * @param width - New width
     * @param height - New height
     */
    setSize(width: number, height: number): void {
        abstract();
    }

    /**
     * Sets the player's sleeping status
     */
    setSleeping(value: boolean): void {
        abstract();
    }

    /**
     * Returns the player's sleeping status
     */
    isSleeping(): boolean {
        abstract();
    }

    /**
     * Returns whether the player is currently jumping
     */
    isJumping(): boolean {
        abstract();
    }

    /**
     * Syncs the player's abilities with the client
     */
    syncAbilties(): void {
        abstract();
    }

    /**
     * Sets the player's respawn position
     *
     * @param pos - Respawn position
     * @param dimension - Dimension
     */
    setRespawnPosition(pos: BlockPos, dimension: DimensionId):void {
        abstract();
    }

    /**
     * Sets the player's bed respawn position
     * @param pos - Position of the bed
     */
    setBedRespawnPosition(pos: BlockPos): void {
        abstract();
    }

    /**
     * Returns the Dimension ID of the player's respawn point
     * @remarks Currently, it's always the Overworld
     */
    getSpawnDimension(): DimensionId {
        abstract();
    }

    /**
     * Returns the position of the player's respawn point
     */
    getSpawnPosition(): BlockPos {
        abstract();
    }

    /**
     *Clears the player's respawn position
     */
    clearRespawnPosition(): void {
        abstract();
    }

    /**
     * Returns if the player has respawn position
     */
    hasRespawnPosition(): boolean {
        abstract();
    }

    /**
     * Returns the player's certificate
     */
    getCertificate(): Certificate {
        abstract();
    }

    /**
     * Returns the multiplier for the player block destroy time, with every factor accounnted, except for if the tool is correct, the faster the higher
     */
    getDestroySpeed(block: Block): number {
        abstract();
    }

    /**
     * Returns if the tool is correct to break a block
     */
    canDestroy(block: Block): boolean {
        abstract();
    }

    /**
     * Returns the player's XP points
     */
    getExperience(): number {
        return Math.round(this.getExperienceProgress() * this.getXpNeededForNextLevel());
    }

    /**
     * Returns the player's progression to the next level, between 0.0 and 1.0
     */
    getExperienceProgress(): number {
        return this.getAttribute(AttributeId.PlayerExperience);
    }

    /**
     * Returns the player's XP level
     */
    getExperienceLevel(): number {
        return this.getAttribute(AttributeId.PlayerLevel);
    }

    /**
     * Sets the player's XP points
     *
     * @param xp - between 1 and the maximum XP points for the level
     */
    setExperience(xp: number): void {
        this.setAttribute(AttributeId.PlayerExperience, xp / this.getXpNeededForNextLevel() > 1 ? 1 : xp / this.getXpNeededForNextLevel());
    }

    /**
     * Sets the player's progression to the next XP level
     *
     * @param progress - between 0.0 and 1.0
     */
    setExperienceProgress(progress: number): void {
        this.setAttribute(AttributeId.PlayerExperience, progress > 1 ? 1 : progress);
    }

    /**
     * Sets the player's XP level
     *
     * @param level - between 0 and 24791
     */
    setExperienceLevel(level: number): void {
        this.setAttribute(AttributeId.PlayerLevel, level > 24791 ? 24791 : level < 0 ? 0 : level);
    }

    /**
     * Adds XP points to the player, recalculating their level & progress
     *
     * @param xp - XP to add
     */
    addExperience(xp: number): void {
        abstract();
    }

    /**
     * Adds progress to the player's XP level
     *
     * @param progress - between 0.0 and 1.0
     */
    addExperienceProgress(progress: number): void {
        if (-progress > this.getExperienceProgress()) this.setExperienceProgress(0);
        else this.setAttribute(AttributeId.PlayerExperience, this.getExperienceProgress() + progress > 1 ? 1 : this.getExperienceProgress() + progress);
    }

    /**
     * Adds XP levels to the player
     *
     * @param levels - levels to add
     */
    addExperienceLevels(levels: number): void {
        abstract();
    }

    /**
     * Subtracts XP points from the player
     *
     * @param xp - between 1 and the current XP points for the level
     */
    subtractExperience(xp: number): void {
        this.addExperience(-xp);
    }

    /**
     * Subtracts progress from the player's XP level
     *
     * @param progress - between 0.0 and the current XP progress
     */
    subtractExperienceProgress(progress: number): void {
        this.addExperienceProgress(progress > this.getExperienceProgress() ? -this.getExperienceProgress() : -progress);
    }

    /**
     * Subtracts XP levels from the player
     *
     * @param levels - between 1 and the player's XP level
     */
    subtractExperienceLevels(levels: number): void {
        this.addExperienceLevels(levels > this.getExperienceLevel() ? -this.getExperienceLevel() : -levels);
    }

    /**
     * Returns the total XP needed for the next level
     */
    getXpNeededForNextLevel(): number {
        abstract();
    }

    /**
     * Returns the remaining XP needed for the next level
     */
    getRemainingXpForNextLevel(): number {
        return this.getXpNeededForNextLevel() - this.getExperience();
    }
}

export class ServerPlayer extends Player {
    /** @deprecated Use `this.getNetworkIdentifier()` instead */
    get networkIdentifier(): NetworkIdentifier {
        return this.getNetworkIdentifier();
    }

    protected _sendInventory(shouldSelectSlot: boolean): void {
        abstract();
    }

    /**
     * Applies knockback to the player
     */
    knockback(source: Actor, damage: int32_t, xd: float32_t, zd: float32_t, power: float32_t, height: float32_t, heightCap: float32_t): void {
        abstract();
    }

    /**
     * Returns the player's NetworkIdentifier
     */
    getNetworkIdentifier():NetworkIdentifier {
        abstract();
    }

    /**
     * Returns the player's next ContainerId
     * @remarks Values range from 1 to 99
     */
    nextContainerCounter(): ContainerId {
        abstract();
    }

    /**
     * Opens the player's inventory
     */
    openInventory(): void {
        abstract();
    }

    /**
     * Sends a packet to the player
     *
     * @param packet - Packet to send
     */
    sendNetworkPacket(packet: Packet): void {
        abstract();
    }

    /**
     * Updates the player's inventory
     * @remarks The shouldSelectSlot parameter seems to be pointless
     *
     * @param shouldSelectSlot - Defines whether the player should select the currently selected slot (?)
     */
    sendInventory(shouldSelectSlot: boolean = false): void {
        serverInstance.nextTick().then(() => this._sendInventory(shouldSelectSlot));
    }

    /**
     * Updates a player's attribute
     *
     * @param id - Attribute ID to update
     * @param value - New value of the attribute
     */
    setAttribute(id: AttributeId, value: number): AttributeInstance | null {
        abstract();
    }

    /**
     * Sets the player's armor
     *
     * @param slot - Armor slot
     * @param itemStack - Armor item to set
     */
    setArmor(slot: ArmorSlot, itemStack:ItemStack): void {
        abstract();
    }

    /**
     * Sends a chat-like message to the player
     * @remarks The message will have this format : <author> message
     *
     * @param message - Message to send
     * @param author - Message author (will be put inside the <>)
     */
    sendChat(message: string, author: string): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Chat;
        pk.name = author;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }

    /**
     * Sends a whisper-like message to the player
     * @remarks The message will have this format : <author> message (same as ServerPlayer.sendChat())
     *
     * @param message - Message to send
     * @param author - Message author (will be put inside the <>)
     */
    sendWhisper(message: string, author: string): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Chat;
        pk.name = author;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }

    /**
     * Sends a raw message to the player
     *
     * @param message - Message to send
     */
    sendMessage(message: string): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Raw;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }

    /**
     * Sends a jukebox-like popup to the player
     * @remarks Does not have a background like other popups.
     *
     * @param message - Popup text
     * @param params - Translation keys to use
     */
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

    /**
     * Sends a popup to the player
     *
     * @param message - Popup text
     * @param params - Translation keys to use
     */
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

    /**
     * Sends a tip-like popup to the player
     * @remarks Smaller than a Popup, positioned lower than an Actionbar
     *
     * @param message - Tip text
     * @param params - Translation keys to use
     */
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

    /**
     * Sends a translated message to the player
     *
     * @param message - Message to send
     * @param params - Translation keys
     */
    sendTranslatedMessage(message: string, params: string[] = []): void {
        const pk = TextPacket.create();
        pk.type = TextPacket.Types.Translate;
        pk.message = message;
        pk.params.push(...params);
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }

    /**
     * Displays a bossbar to the player
     * @remarks Bossbar percentage doesn't seem to function.
     *
     * @param title - Text above the bossbar
     * @param percent - Bossbar filling percentage
     * @param color - Bossbar color
     */
    setBossBar(title: string, percent: number, color?: BossEventPacket.Colors): void {
        this.removeBossBar();
        const pk = BossEventPacket.create();
        pk.entityUniqueId = this.getUniqueIdBin();
        pk.playerUniqueId = this.getUniqueIdBin();
        pk.type = BossEventPacket.Types.Show;
        pk.title = title;
        pk.healthPercent = percent;
        if(color) pk.color = color;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Resets title duration
     */
    resetTitleDuration(): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Reset;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Sets the title animation duration (in ticks)
     * @remarks Will not affect actionbar and other popups.
     *
     * @param fadeInTime - fade-in duration (in ticks)
     * @param stayTime - stay time duration (in ticks)
     * @param fadeOutTime - fade-out duration (in ticks)
     */
    setTitleDuration(fadeInTime: number, stayTime: number, fadeOutTime: number): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.AnimationTimes;
        pk.fadeInTime = fadeInTime;
        pk.stayTime = stayTime;
        pk.fadeOutTime = fadeOutTime;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Sends a title to the player
     *
     * @param title - Title text
     * @param subtitle - Subtitle text
     */
    sendTitle(title: string, subtitle?: string): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Title;
        pk.text = title;
        this.sendNetworkPacket(pk);
        pk.dispose();
        if (subtitle) this.sendSubtitle(subtitle);
    }

    /**
     * Sends a subtitle to the player
     * @remarks Will not display if there is no title being displayed
     *
     * @param subtitle - subtitle text
     */
    sendSubtitle(subtitle: string): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Subtitle;
        pk.text = subtitle;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Clears player's title and subtitle
     * @remarks Will not affect actionbar and other popups
     */
    clearTitle(): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Clear;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Sends an actionbar-like popup to the player
     * @remarks Smaller than a Popup, positioned higher than a Tip
     *
     * @param actionbar - Actionbar text
     */
    sendActionbar(actionbar: string): void {
        const pk = SetTitlePacket.create();
        pk.type = SetTitlePacket.Types.Actionbar;
        pk.text = actionbar;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Removes the bossbar
     */
    removeBossBar(): void {
        const pk = BossEventPacket.create();
        pk.entityUniqueId = this.getUniqueIdBin();
        pk.playerUniqueId = this.getUniqueIdBin();
        pk.type = BossEventPacket.Types.Hide;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Displays a scoreboard with custom text & scores
     *
     * @param title - Scoreboard title
     * @param lines - Scoreboard lines
     * @param name - Scoreboard name
     *
     * @example setFakeScoreboard("test", ["my score is 0", ["my score is 3", 3], "my score is 2 as my index is 2"])
     */
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

    /**
     * Removes scoreboard
     */
    removeFakeScoreboard(): void {
        const pk = SetDisplayObjectivePacket.create();
        pk.displaySlot = DisplaySlot.Sidebar;
        pk.objectiveName = "";
        pk.displayName = "";
        pk.criteriaName = "dummy";
        this.sendNetworkPacket(pk);
        pk.dispose();
    }

    /**
     * Transfers the player to another server
     *
     * @param address - Server address
     * @param port - Server port
     */
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
    static constructWith(player: Player): PlayerListEntry {
        abstract();
    }
    /** @deprecated */
    static create(player: Player): PlayerListEntry {
        return PlayerListEntry.constructWith(player);
    }
}

/**
 * Lists possible player gamemodes
 */
export enum GameType {
    Survival,
    Creative,
    Adventure,
    SurvivalSpectator,
    CreativeSpectator,
    Default
}

/**
 * Lists possible player permission levels
 */
export enum PlayerPermission {
    VISITOR,
    MEMBER,
    OPERATOR,
    CUSTOM
}
