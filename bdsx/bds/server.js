"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerInstance = exports.MinecraftServerScriptEngine = exports.BaseGameVersion = exports.SemVersion = exports.ScriptFramework = exports.DedicatedServer = exports.Minecraft = exports.VanilaGameModuleServer = exports.Minecraft$Something = exports.EntityRegistryOwned = exports.VanilaServerGameplayEventListener = exports.ServerMetricsImpl = exports.ServerMetrics = exports.PrivateKeyManager = exports.Whitelist = exports.ResourcePackManager = exports.MinecraftEventing = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const event_1 = require("../event");
const mcglobal_1 = require("../mcglobal");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const symbols_1 = require("./symbols");
class MinecraftEventing extends nativeclass_1.NativeClass {
}
exports.MinecraftEventing = MinecraftEventing;
class ResourcePackManager extends nativeclass_1.NativeClass {
}
exports.ResourcePackManager = ResourcePackManager;
class Whitelist extends nativeclass_1.NativeClass {
}
exports.Whitelist = Whitelist;
class PrivateKeyManager extends nativeclass_1.NativeClass {
}
exports.PrivateKeyManager = PrivateKeyManager;
class ServerMetrics extends nativeclass_1.NativeClass {
}
exports.ServerMetrics = ServerMetrics;
class ServerMetricsImpl extends ServerMetrics {
}
exports.ServerMetricsImpl = ServerMetricsImpl;
class VanilaServerGameplayEventListener extends nativeclass_1.NativeClass {
}
exports.VanilaServerGameplayEventListener = VanilaServerGameplayEventListener;
class EntityRegistryOwned extends nativeclass_1.NativeClass {
}
exports.EntityRegistryOwned = EntityRegistryOwned;
/**
 * @deprecated
 * unknown instance
 */
class Minecraft$Something extends nativeclass_1.NativeClass {
    /** @deprecated use minecraft.getNetworkHandler() */
    get network() {
        return exports.serverInstance.minecraft.getNetworkHandler();
    }
    /** @deprecated use minecraft.getLevel() */
    get level() {
        return exports.serverInstance.minecraft.getLevel();
    }
    /** @deprecated use minecraft.getServerNetworkHandler() */
    get shandler() {
        return exports.serverInstance.minecraft.getServerNetworkHandler();
    }
}
exports.Minecraft$Something = Minecraft$Something;
/** @deprecated */
class VanilaGameModuleServer extends nativeclass_1.NativeClass {
}
exports.VanilaGameModuleServer = VanilaGameModuleServer;
/** @deprecated */
class Minecraft extends nativeclass_1.NativeClass {
    /** @deprecated use Minecraft::getCommands */
    get commands() {
        return this.getCommands();
    }
    /** @deprecated */
    get something() {
        return new Minecraft$Something();
    }
    /** @deprecated use Minecraft::getNetworkHandler */
    get network() {
        return this.getNetworkHandler();
    }
    getLevel() {
        (0, common_1.abstract)();
    }
    getNetworkHandler() {
        (0, common_1.abstract)();
    }
    getServerNetworkHandler() {
        (0, common_1.abstract)();
    }
    getCommands() {
        (0, common_1.abstract)();
    }
}
exports.Minecraft = Minecraft;
class DedicatedServer extends nativeclass_1.NativeClass {
}
exports.DedicatedServer = DedicatedServer;
class ScriptFramework extends nativeclass_1.NativeClass {
}
exports.ScriptFramework = ScriptFramework;
let SemVersion = class SemVersion extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t)
], SemVersion.prototype, "major", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t)
], SemVersion.prototype, "minor", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t)
], SemVersion.prototype, "patch", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x08)
], SemVersion.prototype, "preRelease", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SemVersion.prototype, "buildMeta", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SemVersion.prototype, "fullVersionString", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], SemVersion.prototype, "validVersion", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], SemVersion.prototype, "anyVersion", void 0);
SemVersion = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x70)
], SemVersion);
exports.SemVersion = SemVersion;
class BaseGameVersion extends SemVersion {
}
exports.BaseGameVersion = BaseGameVersion;
class MinecraftServerScriptEngine extends ScriptFramework {
}
exports.MinecraftServerScriptEngine = MinecraftServerScriptEngine;
/**
 * @deprecated
 */
class ServerInstance extends nativeclass_1.NativeClass {
    _disconnectAllClients(message) {
        (0, common_1.abstract)();
    }
    createDimension(id) {
        return this.minecraft.getLevel().createDimension(id);
    }
    getActivePlayerCount() {
        return this.minecraft.getLevel().getActivePlayerCount();
    }
    disconnectAllClients(message = "disconnectionScreen.disconnected") {
        this._disconnectAllClients(message);
    }
    disconnectClient(client, message = "disconnectionScreen.disconnected", skipMessage = false) {
        return this.minecraft.getServerNetworkHandler().disconnectClient(client, message, skipMessage);
    }
    getMotd() {
        return this.minecraft.getServerNetworkHandler().motd;
    }
    setMotd(motd) {
        return this.minecraft.getServerNetworkHandler().setMotd(motd);
    }
    getMaxPlayers() {
        return this.minecraft.getServerNetworkHandler().maxPlayers;
    }
    setMaxPlayers(count) {
        this.minecraft.getServerNetworkHandler().setMaxNumPlayers(count);
    }
    updateCommandList() {
        for (const player of this.minecraft.getLevel().players.toArray()) {
            player.sendNetworkPacket(this.minecraft.commands.getRegistry().serializeAvailableCommands());
        }
    }
    getNetworkProtocolVersion() {
        return symbols_1.proc["SharedConstants::NetworkProtocolVersion"].getInt32();
    }
    getGameVersion() {
        return symbols_1.proc["SharedConstants::CurrentGameSemVersion"].as(SemVersion);
    }
    nextTick() {
        return new Promise(resolve => {
            const listener = () => {
                resolve();
                event_1.events.levelTick.remove(listener);
            };
            event_1.events.levelTick.on(listener);
        });
    }
}
exports.ServerInstance = ServerInstance;
Object.defineProperty(exports, 'serverInstance', {
    get() {
        const serverInstance = mcglobal_1.mcglobal.serverInstance.as(ServerInstance);
        Object.defineProperty(exports, 'serverInstance', { value: serverInstance });
        return serverInstance;
    },
    configurable: true
});
//# sourceMappingURL=server.js.map