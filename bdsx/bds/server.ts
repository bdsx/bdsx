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
import { proc } from "./symbols";
import minecraft = require('../minecraft');

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
export class Minecraft$Something extends NativeClass {
    /** @deprecated use minecraft.getNetworkHandler() */
    get network():NetworkHandler {
        return serverInstance.minecraft.getNetworkHandler();
    }
    /** @deprecated use minecraft.getLevel() */
    get level():ServerLevel {
        return serverInstance.minecraft.getLevel() as ServerLevel;
    }
    /** @deprecated use minecraft.getServerNetworkHandler() */
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
    /** @deprecated use Minecraft::getCommands */
    get commands():MinecraftCommands {
        return this.getCommands();
    }
    /** @deprecated */
    get something():Minecraft$Something {
        return new Minecraft$Something();
    }
    /** @deprecated use Minecraft::getNetworkHandler */
    get network():NetworkHandler {
        return this.getNetworkHandler();
    }
    /** @deprecated unusing */
    LoopbackPacketSender:LoopbackPacketSender;

    server:DedicatedServer;

    getLevel():Level {
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

    createDimension(id:DimensionId):Dimension {
        return this.minecraft.getLevel().createDimension(id);
    }
    getActivePlayerCount():number {
        return this.minecraft.getLevel().getActivePlayerCount();
    }
    disconnectAllClients(message:string="disconnectionScreen.disconnected"):void {
        this._disconnectAllClients(message);
    }
    disconnectClient(client:NetworkIdentifier, message:string="disconnectionScreen.disconnected", skipMessage:boolean=false):void {
        return this.minecraft.getServerNetworkHandler().disconnectClient(client, message, skipMessage);
    }
    getMotd():string {
        return this.minecraft.getServerNetworkHandler().motd;
    }
    setMotd(motd:string):void {
        return this.minecraft.getServerNetworkHandler().setMotd(motd);
    }
    getMaxPlayers():number {
        return this.minecraft.getServerNetworkHandler().maxPlayers;
    }
    setMaxPlayers(count:number):void {
        this.minecraft.getServerNetworkHandler().setMaxNumPlayers(count);
    }
    updateCommandList():void {
        for (const player of this.minecraft.getLevel().players.toArray()) {
            player.sendNetworkPacket(this.minecraft.commands.getRegistry().serializeAvailableCommands());
        }
    }
    getNetworkProtocolVersion():number {
        return proc["SharedConstants::NetworkProtocolVersion"].getInt32();
    }
    getGameVersion():SemVersion {
        return proc["SharedConstants::CurrentGameSemVersion"].as(SemVersion);
    }
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

/** @deprecated use minecraft.serverInstance */
export declare const serverInstance:ServerInstance;

Object.defineProperty(exports, 'serverInstance', {
    get(){
        const serverInstance = minecraft.serverInstance.as(ServerInstance);
        Object.defineProperty(exports, 'serverInstance', {value:serverInstance});
        return serverInstance;
    },
    configurable: true
});
