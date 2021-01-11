import { CommandOrigin } from "bdsx/commandorigin";
import { RawTypeId } from "bdsx/common";
import { LoopbackPacketSender } from "bdsx/loopbacksender";
import { makefunc, VoidPointer } from "bdsx/core";
import { bin64_t, CxxString, uint32_t } from "bdsx/nativetype";
import { SharedPtr } from "bdsx/sharedpointer";
import { NativeClass } from "bdsx/nativeclass";
import { DimensionId } from "./actor";
import { Dimension } from "./dimension";
import { ServerLevel } from "./level";
import { NetworkHandler, ServerNetworkHandler } from "./networkidentifier";
import { proc } from "./proc";

class MinecraftEventing extends NativeClass {}
class ResourcePackManager extends NativeClass {}
class Whitelist extends NativeClass {}
class PrivateKeyManager extends NativeClass {}
class ServerMetrics extends NativeClass {}
class ServerMetricsImpl extends ServerMetrics {}
class VanilaServerGameplayEventListener extends NativeClass {}
class EntityRegistryOwned extends NativeClass {}

export class MCRESULT extends NativeClass
{
	result:uint32_t;
};
MCRESULT.define({
	result:uint32_t
});


export class CommandOutputSender extends NativeClass
{
}

/**
 * unknown instance
 */
class Minecraft$Something extends NativeClass
{
    network:NetworkHandler;
    level:ServerLevel;
    shandler:ServerNetworkHandler;
}

class VanilaGameModuleServer extends NativeClass
{
	listener:VanilaServerGameplayEventListener;
}
VanilaGameModuleServer.abstract({
	listener:[VanilaServerGameplayEventListener.ref(), 0x8]
});

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
CommandContext.abstract({
	command:CxxString,
	origin:ServerCommandOrigin,
});


export class MinecraftCommands extends NativeClass
{
	sender:CommandOutputSender;
	u1:VoidPointer;
	u2:bin64_t; //1
	minecraft:Minecraft;

	_executeCommand(ptr:SharedPtr<CommandContext>, b:boolean):MCRESULT
	{
		throw 'abstract';
	}
	executeCommand(ctx:SharedPtr<CommandContext>, b:boolean):MCRESULT
	{
		return this._executeCommand(ctx, b);
	}
}

MinecraftCommands.prototype._executeCommand = makefunc.js(proc["MinecraftCommands::executeCommand"], MCRESULT, MinecraftCommands, true, SharedPtr.make(CommandContext), RawTypeId.Boolean);


DedicatedServer.abstract({});
Minecraft$Something.abstract({
    network:NetworkHandler.ref(),
    level:ServerLevel.ref(),
    shandler:ServerNetworkHandler.ref(),
});
MinecraftCommands.abstract({
	sender:CommandOutputSender.ref(),
	u1:VoidPointer,
	u2:bin64_t,
	minecraft:Minecraft.ref(),
});
Minecraft.abstract({
	vftable:VoidPointer,
	serverInstance:ServerInstance.ref(),
	minecraftEventing:MinecraftEventing.ref(),
	resourcePackManager:ResourcePackManager.ref(),
	offset_20:VoidPointer,
	vanillaGameModuleServer:[SharedPtr, 0x28], // VanilaGameModuleServer
	whitelist:Whitelist.ref(),
	permissionsJsonFileName:CxxString.ref(),
	privateKeyManager:PrivateKeyManager.ref(),
	serverMetrics:[ServerMetrics.ref(), 0x78],
	commands:[MinecraftCommands.ref(), 0xa0],
	something:Minecraft$Something.ref(),
	network:[NetworkHandler.ref(), 0xc0],
	LoopbackPacketSender:LoopbackPacketSender.ref(),
	server:DedicatedServer.ref(),
    entityRegistryOwned:[SharedPtr.make(EntityRegistryOwned), 0xe0],
});
ServerInstance.abstract({
    server:[DedicatedServer.ref(), 0x90],
    minecraft:[Minecraft.ref(), 0x98],
    networkHandler:[NetworkHandler.ref(), 0xa0],
});


export let serverInstance:ServerInstance;

