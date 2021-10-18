import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { bool_t, CxxString, uint16_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { DimensionId } from "./actor";
import type { MinecraftCommands } from "./command";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { LoopbackPacketSender } from "./loopbacksender";
import { NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
export declare class MinecraftEventing extends NativeClass {
}
export declare class ResourcePackManager extends NativeClass {
}
export declare class Whitelist extends NativeClass {
}
export declare class PrivateKeyManager extends NativeClass {
}
export declare class ServerMetrics extends NativeClass {
}
export declare class ServerMetricsImpl extends ServerMetrics {
}
export declare class VanilaServerGameplayEventListener extends NativeClass {
}
export declare class EntityRegistryOwned extends NativeClass {
}
/**
 * @deprecated
 * unknown instance
 */
export declare class Minecraft$Something extends NativeClass {
    /** @deprecated use minecraft.getNetworkHandler() */
    get network(): NetworkHandler;
    /** @deprecated use minecraft.getLevel() */
    get level(): ServerLevel;
    /** @deprecated use minecraft.getServerNetworkHandler() */
    get shandler(): ServerNetworkHandler;
}
/** @deprecated */
export declare class VanilaGameModuleServer extends NativeClass {
    listener: VanilaServerGameplayEventListener;
}
/** @deprecated */
export declare class Minecraft extends NativeClass {
    vftable: VoidPointer;
    offset_20: VoidPointer;
    vanillaGameModuleServer: SharedPtr<VanilaGameModuleServer>;
    /** @deprecated use Minecraft::getCommands */
    get commands(): MinecraftCommands;
    /** @deprecated */
    get something(): Minecraft$Something;
    /** @deprecated use Minecraft::getNetworkHandler */
    get network(): NetworkHandler;
    /** @deprecated unusing */
    LoopbackPacketSender: LoopbackPacketSender;
    server: DedicatedServer;
    getLevel(): Level;
    getNetworkHandler(): NetworkHandler;
    getServerNetworkHandler(): ServerNetworkHandler;
    getCommands(): MinecraftCommands;
}
export declare class DedicatedServer extends NativeClass {
}
export declare class ScriptFramework extends NativeClass {
    vftable: VoidPointer;
}
export declare class SemVersion extends NativeClass {
    major: uint16_t;
    minor: uint16_t;
    patch: uint16_t;
    preRelease: CxxString;
    buildMeta: CxxString;
    fullVersionString: CxxString;
    validVersion: bool_t;
    anyVersion: bool_t;
}
export declare class BaseGameVersion extends SemVersion {
}
export declare class MinecraftServerScriptEngine extends ScriptFramework {
}
/**
 * @deprecated
 */
export declare class ServerInstance extends NativeClass {
    vftable: VoidPointer;
    server: DedicatedServer;
    minecraft: Minecraft;
    networkHandler: NetworkHandler;
    protected _disconnectAllClients(message: CxxString): void;
    createDimension(id: DimensionId): Dimension;
    getActivePlayerCount(): number;
    disconnectAllClients(message?: string): void;
    disconnectClient(client: NetworkIdentifier, message?: string, skipMessage?: boolean): void;
    getMotd(): string;
    setMotd(motd: string): void;
    getMaxPlayers(): number;
    setMaxPlayers(count: number): void;
    updateCommandList(): void;
    getNetworkProtocolVersion(): number;
    getGameVersion(): SemVersion;
    nextTick(): Promise<void>;
}
/** @deprecated use minecraft.serverInstance */
export declare const serverInstance: ServerInstance;
