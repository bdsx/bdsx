"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerPermission = exports.GameType = exports.PlayerListEntry = exports.ServerPlayer = exports.Player = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const actor_1 = require("./actor");
const packets_1 = require("./packets");
const scoreboard_1 = require("./scoreboard");
const minecraft = require("../minecraft");
/** @deprecated import it from bdsx/minecraft */
class Player extends actor_1.Actor {
    _setName(name) {
        (0, common_1.abstract)();
    }
    addItem(itemStack) {
        (0, common_1.abstract)();
    }
    changeDimension(dimensionId, respawn) {
        (0, common_1.abstract)();
    }
    setName(name) {
        (0, common_1.abstract)();
    }
    teleportTo(position, shouldStopRiding, cause, sourceEntityType, sourceActorId) {
        (0, common_1.abstract)();
    }
    getGameType() {
        (0, common_1.abstract)();
    }
    getInventory() {
        (0, common_1.abstract)();
    }
    getMainhandSlot() {
        (0, common_1.abstract)();
    }
    getOffhandSlot() {
        (0, common_1.abstract)();
    }
    getPermissionLevel() {
        (0, common_1.abstract)();
    }
    getSkin() {
        (0, common_1.abstract)();
    }
    startCooldown(item) {
        (0, common_1.abstract)();
    }
    setGameType(gameType) {
        (0, common_1.abstract)();
    }
    setSize(width, height) {
        (0, common_1.abstract)();
    }
    setSleeping(value) {
        (0, common_1.abstract)();
    }
    isSleeping() {
        (0, common_1.abstract)();
    }
    isJumping() {
        (0, common_1.abstract)();
    }
    syncAbilties() {
        (0, common_1.abstract)();
    }
    getCertificate() {
        (0, common_1.abstract)();
    }
}
exports.Player = Player;
/** @deprecated import it from bdsx/minecraft */
class ServerPlayer extends Player {
    _sendInventory(shouldSelectSlot) {
        (0, common_1.abstract)();
    }
    knockback(source, damage, xd, zd, power, height, heightCap) {
        (0, common_1.abstract)();
    }
    nextContainerCounter() {
        (0, common_1.abstract)();
    }
    openInventory() {
        (0, common_1.abstract)();
    }
    sendNetworkPacket(packet) {
        (0, common_1.abstract)();
    }
    sendInventory(shouldSelectSlot = false) {
        setTimeout(() => {
            this._sendInventory(shouldSelectSlot);
        }, 50);
    }
    setAttribute(id, value) {
        (0, common_1.abstract)();
    }
    sendChat(message, author) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.Chat;
        pk.name = author;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }
    sendWhisper(message, author) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.Chat;
        pk.name = author;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }
    sendMessage(message) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.Raw;
        pk.message = message;
        this.sendNetworkPacket(pk);
    }
    sendJukeboxPopup(message, params = []) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.JukeboxPopup;
        pk.message = message;
        for (const param of params) {
            pk.params.push(param);
        }
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }
    sendPopup(message, params = []) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.Popup;
        pk.message = message;
        for (const param of params) {
            pk.params.push(param);
        }
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }
    sendTip(message, params = []) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.Tip;
        pk.message = message;
        for (const param of params) {
            pk.params.push(param);
        }
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }
    sendTranslatedMessage(message, params = []) {
        const pk = packets_1.TextPacket.create();
        pk.type = packets_1.TextPacket.Types.Translate;
        pk.message = message;
        pk.params.push(...params);
        pk.needsTranslation = true;
        this.sendNetworkPacket(pk);
    }
    setBossBar(title, percent) {
        this.removeBossBar();
        const pk = packets_1.BossEventPacket.create();
        pk.entityUniqueId = this.getUniqueIdBin();
        pk.playerUniqueId = this.getUniqueIdBin();
        pk.type = packets_1.BossEventPacket.Types.Show;
        pk.title = title;
        pk.healthPercent = percent;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    resetTitleDuration() {
        const pk = packets_1.SetTitlePacket.create();
        pk.type = packets_1.SetTitlePacket.Types.Reset;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    /** Set duration of title animation in ticks, will not affect action bar */
    setTitleDuration(fadeInTime, stayTime, fadeOutTime) {
        const pk = packets_1.SetTitlePacket.create();
        pk.type = packets_1.SetTitlePacket.Types.AnimationTimes;
        pk.fadeInTime = fadeInTime;
        pk.stayTime = stayTime;
        pk.fadeOutTime = fadeOutTime;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    sendTitle(title, subtitle) {
        const pk = packets_1.SetTitlePacket.create();
        pk.type = packets_1.SetTitlePacket.Types.Title;
        pk.text = title;
        this.sendNetworkPacket(pk);
        pk.dispose();
        if (subtitle)
            this.sendSubtitle(subtitle);
    }
    /** Will not display if there is no title being displayed */
    sendSubtitle(subtitle) {
        const pk = packets_1.SetTitlePacket.create();
        pk.type = packets_1.SetTitlePacket.Types.Subtitle;
        pk.text = subtitle;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    /** Will not affect action bar */
    clearTitle() {
        const pk = packets_1.SetTitlePacket.create();
        pk.type = packets_1.SetTitlePacket.Types.Clear;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    sendActionbar(actionbar) {
        const pk = packets_1.SetTitlePacket.create();
        pk.type = packets_1.SetTitlePacket.Types.Actionbar;
        pk.text = actionbar;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    removeBossBar() {
        const pk = packets_1.BossEventPacket.create();
        pk.entityUniqueId = this.getUniqueIdBin();
        pk.playerUniqueId = this.getUniqueIdBin();
        pk.type = packets_1.BossEventPacket.Types.Hide;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    /** @param lines Example: ["my score is 0", ["my score is 3", 3], "my score is 2 as my index is 2"] */
    setFakeScoreboard(title, lines, name = `tmp-${new Date().getTime()}`) {
        this.removeFakeScoreboard();
        {
            const pk = packets_1.SetDisplayObjectivePacket.create();
            pk.displaySlot = scoreboard_1.DisplaySlot.Sidebar;
            pk.objectiveName = name;
            pk.displayName = title;
            pk.criteriaName = "dummy";
            this.sendNetworkPacket(pk);
            pk.dispose();
        }
        {
            const pk = packets_1.SetScorePacket.create();
            pk.type = packets_1.SetScorePacket.Type.CHANGE;
            const entries = [];
            for (const [i, line] of lines.entries()) {
                const entry = packets_1.ScorePacketInfo.construct();
                entry.objectiveName = name;
                entry.scoreboardId.idAsNumber = i + 1;
                entry.type = packets_1.ScorePacketInfo.Type.FAKE_PLAYER;
                if (typeof line === "string") {
                    entry.score = i + 1;
                    entry.customName = line;
                }
                else {
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
    removeFakeScoreboard() {
        const pk = packets_1.SetDisplayObjectivePacket.create();
        pk.displaySlot = scoreboard_1.DisplaySlot.Sidebar;
        pk.objectiveName = "";
        pk.displayName = "";
        pk.criteriaName = "dummy";
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
    transferServer(address, port = 19132) {
        const pk = packets_1.TransferPacket.create();
        pk.address = address;
        pk.port = port;
        this.sendNetworkPacket(pk);
        pk.dispose();
    }
}
exports.ServerPlayer = ServerPlayer;
let PlayerListEntry = class PlayerListEntry extends nativeclass_1.NativeClass {
    static create(player) {
        (0, common_1.abstract)();
    }
};
PlayerListEntry = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x282)
], PlayerListEntry);
exports.PlayerListEntry = PlayerListEntry;
/** @deprecated */
exports.GameType = minecraft.GameType;
var PlayerPermission;
(function (PlayerPermission) {
    PlayerPermission[PlayerPermission["VISITOR"] = 0] = "VISITOR";
    PlayerPermission[PlayerPermission["MEMBER"] = 1] = "MEMBER";
    PlayerPermission[PlayerPermission["OPERATOR"] = 2] = "OPERATOR";
    PlayerPermission[PlayerPermission["CUSTOM"] = 3] = "CUSTOM";
})(PlayerPermission = exports.PlayerPermission || (exports.PlayerPermission = {}));
//# sourceMappingURL=player.js.map