import { createAbstractObject } from "../abstractobject";
import { LoopbackPacketSender } from "../bds/loopbacksender";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { events } from "../event";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, CxxString, uint16_t } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { DimensionId } from "./actor";
import type { MinecraftCommands } from "./command";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";
import type { ServerPlayer } from "./player";
import { proc } from "./symbols";

export class MinecraftEventing extends NativeClass {}
export class ResourcePackManager extends NativeClass {}
export class Whitelist extends NativeClass {}
export class PrivateKeyManager extends NativeClass {}
export class ServerMetrics extends NativeClass {}
export class ServerMetricsImpl extends ServerMetrics {}
export class VanilaServerGameplayEventListener extends NativeClass {}
export class EntityRegistryOwned extends NativeClass {}

/**
 * @deprecated
 * unknown instance
 */
export class Minecraft$Something {
    /** @deprecated Use `minecraft.getNetworkHandler()` instead */
    get network():NetworkHandler {
        return serverInstance.minecraft.getNetworkHandler();
    }
    /** @deprecated Use `minecraft.getLevel()` instead */
    get level():ServerLevel {
        return serverInstance.minecraft.getLevel() as ServerLevel;
    }
    /** @deprecated Use `minecraft.getServerNetworkHandler()` instead */
    get shandler():ServerNetworkHandler {
        return serverInstance.minecraft.getServerNetworkHandler();
    }
}

export class VanilaGameModuleServer extends NativeClass {
    listener:VanilaServerGameplayEventListener;
}

export class Minecraft extends NativeClass {
    vftable:VoidPointer;
    offset_20:VoidPointer;
    vanillaGameModuleServer:SharedPtr<VanilaGameModuleServer>; // VanilaGameModuleServer
    /** @deprecated Use `Minecraft::getCommands` instead */
    get commands():MinecraftCommands {
        return this.getCommands();
    }
    /** @deprecated */
    get something():Minecraft$Something {
        return new Minecraft$Something();
    }
    /** @deprecated Use `Minecraft::getNetworkHandler` instead */
    get network():NetworkHandler {
        return this.getNetworkHandler();
    }
    /** @deprecated Unused */
    LoopbackPacketSender:LoopbackPacketSender;

    server:DedicatedServer;

    getLevel():Level|null {
        abstract();
    }
    getNetworkHandler():NetworkHandler {
        abstract();
    }
    getServerNetworkHandler():ServerNetworkHandler {
        abstract();
    }
    getCommands():MinecraftCommands {
        abstract();
    }

}

export class DedicatedServer extends NativeClass {
}

export class ScriptFramework extends NativeClass {
    vftable:VoidPointer;
}

@nativeClass(0x70)
export class SemVersion extends NativeClass {
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

export class ServerInstance extends NativeClass {
    vftable:VoidPointer;
    server:DedicatedServer;
    minecraft:Minecraft;
    networkHandler:NetworkHandler;

    protected _disconnectAllClients(message:CxxString):void {
        abstract();
    }

    createDimension(id:DimensionId):Dimension|null {
        const level = this.minecraft.getLevel();
        if (level === null) return null;
        return level.createDimension(id);
    }
    /**
     * Returns the number of current online players
     */
    getActivePlayerCount():number|null {
        const level = this.minecraft.getLevel();
        if (level === null) return null;
        return level.getActivePlayerCount();
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
        return this.minecraft.getServerNetworkHandler().disconnectClient(client, message, skipMessage);
    }
    /**
     * Returns the server's message-of-the-day
     */
    getMotd():string {
        return this.minecraft.getServerNetworkHandler().motd;
    }
    /**
     * Changes the server's message-of-the-day
     */
    setMotd(motd:string):void {
        return this.minecraft.getServerNetworkHandler().setMotd(motd);
    }
    /**
     * Returns the server's maxiumum player capacity
     */
    getMaxPlayers():number {
        return this.minecraft.getServerNetworkHandler().maxPlayers;
    }
    /**
     * Changes the server's maxiumum player capacity
     */
    setMaxPlayers(count:number):void {
        this.minecraft.getServerNetworkHandler().setMaxNumPlayers(count);
    }
    /**
     * Returns an array of all online players
     */
    getPlayers():ServerPlayer[]|null {
        const level = this.minecraft.getLevel();
        if (level === null) return null;
        return level.getPlayers();
    }
    /**
     * Resends all clients the updated command list
     */
    updateCommandList():void {
        let players = this.getPlayers();
        if (players === null) return;
        for (const player of players) {
            player.sendNetworkPacket(this.minecraft.getCommands().getRegistry().serializeAvailableCommands());
        }
    }
    /**
     * Returns the server's current network protocol version
     */
    getNetworkProtocolVersion():number {
        return proc["SharedConstants::NetworkProtocolVersion"].getInt32();
    }
    /**
     * Returns the server's current game version
     */
    getGameVersion():SemVersion {
        return proc["SharedConstants::CurrentGameSemVersion"].as(SemVersion);
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

// eslint-disable-next-line prefer-const
export let serverInstance:ServerInstance = createAbstractObject('bedrock_server is not launched yet');
