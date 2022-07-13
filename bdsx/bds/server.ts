import { LoopbackPacketSender } from "../bds/loopbacksender";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { events } from "../event";
import { AbstractClass, nativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, uint16_t } from "../nativetype";
import { CxxSharedPtr } from "../sharedpointer";
import type { DimensionId } from "./actor";
import { Bedrock } from "./bedrock";
import type { MinecraftCommands } from "./command";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import type { ServerPlayer } from "./player";

export class MinecraftEventing extends AbstractClass {}
export class ResourcePackManager extends AbstractClass {}
export class Whitelist extends AbstractClass {}
export class PrivateKeyManager extends AbstractClass {}
export class ServerMetrics extends AbstractClass {}
export class ServerMetricsImpl extends ServerMetrics {}
export class EntityRegistryOwned extends AbstractClass {}

export class VanillaServerGameplayEventListener extends AbstractClass {}
/** @deprecated typo, use {@link VanillaServerGameplayEventListener} instead. */
export type VanilaServerGameplayEventListener = VanillaServerGameplayEventListener;
/** @deprecated typo, use {@link VanillaServerGameplayEventListener} instead. */
export const VanilaServerGameplayEventListener = VanillaServerGameplayEventListener;

/**
 * @deprecated
 * unknown instance
 */
export class Minecraft$Something {
    network:NetworkHandler;
    level:ServerLevel;
    shandler:ServerNetworkHandler;
}

export class VanillaGameModuleServer extends AbstractClass {
    listener: VanillaServerGameplayEventListener;
}
/** @deprecated typo, use {@link VanillaGameModuleServer} */
export type VanilaGameModuleServer = VanillaGameModuleServer;
/** @deprecated typo, use {@link VanillaGameModuleServer} */
export const VanilaGameModuleServer = VanillaGameModuleServer;

export class Minecraft extends AbstractClass {
    vftable:VoidPointer;
    offset_20:VoidPointer;
    vanillaGameModuleServer:CxxSharedPtr<VanillaGameModuleServer>; // VanilaGameModuleServer
    /** @deprecated Use `Minecraft::getCommands` instead */
    get commands():MinecraftCommands {
        return this.getCommands();
    }
    /** @deprecated */
    get something():Minecraft$Something {
        return new Minecraft$Something;
    }
    /** @deprecated Use `Minecraft::getNetworkHandler` instead */
    get network():NetworkHandler {
        return this.getNetworkHandler();
    }
    /** @deprecated Unused */
    LoopbackPacketSender:LoopbackPacketSender;

    server:DedicatedServer;

    /**
     * @deprecated use bedrockServer.level
     */
    getLevel():Level {
        abstract();
    }
    /**
     * @deprecated use bedrockServer.networkHandler
     */
    getNetworkHandler():NetworkHandler {
        abstract();
    }
    /**
     * @deprecated use bedrockServer.serverNetworkHandler
     */
    getServerNetworkHandler():ServerNetworkHandler {
        abstract();
    }
    /**
     * @deprecated use bedrockServer.minecraftCommands
     */
    getCommands():MinecraftCommands {
        abstract();
    }

    /**
     * @deprecated it's a kind of global variable. it will generate a JS instance per access.
     */
    getNonOwnerPointerServerNetworkHandler(): Bedrock.NonOwnerPointer<ServerNetworkHandler>{
        abstract();
    }
}

export class DedicatedServer extends AbstractClass {
}

export class ScriptFramework extends AbstractClass {
    vftable:VoidPointer;
}

@nativeClass(0x70)
export class SemVersion extends AbstractClass {
    @nativeField(uint16_t)
    major:uint16_t;
    @nativeField(uint16_t)
    minor:uint16_t;
    @nativeField(uint16_t)
    patch:uint16_t;
    @nativeField(CxxString, 0x08)
    preRelease:CxxString;
    @nativeField(CxxString)
    buildMeta:CxxString;
    @nativeField(CxxString)
    fullVersionString:CxxString;
    @nativeField(bool_t)
    validVersion:bool_t;
    @nativeField(bool_t)
    anyVersion:bool_t;
}

export class BaseGameVersion extends SemVersion {
}

export class MinecraftServerScriptEngine extends ScriptFramework {
}

export class ServerInstance extends AbstractClass {
    vftable:VoidPointer;
    /** @deprecated use bedrockServer.dedicatedServer */
    server:DedicatedServer;
    /** @deprecated use bedrockServer.minecraft */
    minecraft:Minecraft;
    /** @deprecated use bedrockServer.networkHandler */
    networkHandler:NetworkHandler;

    protected _disconnectAllClients(message:CxxString):void {
        abstract();
    }

    createDimension(id:DimensionId):Dimension {
        abstract();
    }
    /**
     * Returns the number of current online players
     */
    getActivePlayerCount():number {
        abstract();
    }
    /**
     * Disconnects all clients with the given message
     */
    disconnectAllClients(message:string="disconnectionScreen.disconnected"):void {
        this._disconnectAllClients(message);
    }
    /**
     * Disconnects a specific client with the given message
     */
    disconnectClient(client:NetworkIdentifier, message:string="disconnectionScreen.disconnected", skipMessage:boolean=false):void {
        abstract();
    }
    /**
     * Returns the server's message-of-the-day
     */
    getMotd():string {
        abstract();
    }
    /**
     * Changes the server's message-of-the-day
     */
    setMotd(motd:string):void {
        abstract();
    }
    /**
     * Returns the server's maximum player capacity
     */
    getMaxPlayers():number {
        abstract();
    }
    /**
     * Changes the server's maximum player capacity
     */
    setMaxPlayers(count:number):void {
        abstract();
    }
    /**
     * Returns an array of all online players
     */
    getPlayers():ServerPlayer[] {
        abstract();
    }
    /**
     * Resends all clients the updated command list
     */
    updateCommandList(): void {
        abstract();
    }
    /**
     * Returns the server's current network protocol version
     */
    getNetworkProtocolVersion():number {
        abstract();
    }
    /**
     * Returns the server's current game version
     */
    getGameVersion():SemVersion {
        abstract();
    }
    /**
     * Creates a promise that resolves on the next tick
     */
    nextTick():Promise<void> {
        return new Promise(resolve=>{
            const listener = (): void => {
                resolve();
                events.levelTick.remove(listener);
            };
            events.levelTick.on(listener);
        });
    }
}

/** @deprecated use bedrockServer.serverInstance */
export let serverInstance:ServerInstance;
