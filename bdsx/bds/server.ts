import { createAbstractObject } from "../abstractobject";
import { LoopbackPacketSender } from "../bds/loopbacksender";
import { abstract } from "../common";
import { VoidPointer } from "../core";
import { NativeClass } from "../nativeclass";
import { CxxString } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { DimensionId } from "./actor";
import type { MinecraftCommands } from "./command";
import { Dimension } from "./dimension";
import { Level, ServerLevel } from "./level";
import { NetworkHandler, NetworkIdentifier, ServerNetworkHandler } from "./networkidentifier";

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
    disconnectClient(client:NetworkIdentifier, message:string="disconnectionScreen.disconnected"):void {
        return this.minecraft.getServerNetworkHandler().disconnectClient(client, message);
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
}

// eslint-disable-next-line prefer-const
export let serverInstance:ServerInstance = createAbstractObject('bedrock_server is not launched yet');
