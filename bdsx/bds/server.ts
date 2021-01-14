import { CommandOrigin } from "./commandorigin";
import { abstract } from "bdsx/common";
import { LoopbackPacketSender } from "bdsx/loopbacksender";
import { VoidPointer } from "bdsx/core";
import { bin64_t, CxxString, uint32_t } from "bdsx/nativetype";
import { SharedPtr } from "bdsx/sharedpointer";
import { NativeClass } from "bdsx/nativeclass";
import { DimensionId } from "./actor";
import { Dimension } from "./dimension";
import { ServerLevel } from "./level";
import { NetworkHandler, ServerNetworkHandler } from "./networkidentifier";

export class MinecraftEventing extends NativeClass {}
export class ResourcePackManager extends NativeClass {}
export class Whitelist extends NativeClass {}
export class PrivateKeyManager extends NativeClass {}
export class ServerMetrics extends NativeClass {}
export class ServerMetricsImpl extends ServerMetrics {}
export class VanilaServerGameplayEventListener extends NativeClass {}
export class EntityRegistryOwned extends NativeClass {}

export class MCRESULT extends NativeClass
{
	result:uint32_t;
}


export class CommandOutputSender extends NativeClass
{
}

/**
 * unknown instance
 */
export class Minecraft$Something extends NativeClass
{
    network:NetworkHandler;
    level:ServerLevel;
    shandler:ServerNetworkHandler;
}

export class VanilaGameModuleServer extends NativeClass
{
	listener:VanilaServerGameplayEventListener;
}

export class Minecraft extends NativeClass
{
	vftable:VoidPointer;
	serverInstance:ServerInstance;
	minecraftEventing:MinecraftEventing;
	resourcePackManager:ResourcePackManager;
	offset_20:VoidPointer;
	vanillaGameModuleServer:SharedPtr<VanilaGameModuleServer>; // VanilaGameModuleServer
	whitelist:Whitelist;
	permissionsJsonFileName:CxxString;
	privateKeyManager:PrivateKeyManager;
	serverMetrics:ServerMetrics;
	commands:MinecraftCommands;
	something:Minecraft$Something;
	network:NetworkHandler;
	LoopbackPacketSender:LoopbackPacketSender;
	server:DedicatedServer;
    entityRegistryOwned:SharedPtr<EntityRegistryOwned>;
}

export class DedicatedServer extends NativeClass
{
}

// struct DedicatedServer :ScriptCommandOrigin
// {
// 	struct Something
// 	{
// 		Vector<VoidPointer> vector1;
// 		Vector<VoidPointer> vector2;
// 		VoidPointer u1;
// 		VoidPointer u2;
// 	};
// 	DedicatedServer() = delete;

export class ServerInstance extends NativeClass
{
    server:DedicatedServer;
    minecraft:Minecraft;
    networkHandler:NetworkHandler;

    createDimension(id:DimensionId):Dimension
    {
        return this.minecraft.something.level.createDimension(id);
    }
}

export class ServerCommandOrigin extends CommandOrigin
{
	guid:CxxString;
}


export class CommandContext extends NativeClass
{
	command:CxxString;
	origin:ServerCommandOrigin;
};


export class MinecraftCommands extends NativeClass
{
	sender:CommandOutputSender;
	u1:VoidPointer;
	u2:bin64_t; //1
	minecraft:Minecraft;

	_executeCommand(ptr:SharedPtr<CommandContext>, b:boolean):MCRESULT
	{
		abstract();
	}
	executeCommand(ctx:SharedPtr<CommandContext>, b:boolean):MCRESULT
	{
		return this._executeCommand(ctx, b);
	}
}

export let serverInstance:ServerInstance;

