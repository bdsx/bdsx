import { CommandRegistry, Minecraft, MinecraftCommands, NetworkHandler, ServerInstance, ServerLevel } from "./minecraft";
export declare namespace mcglobal {
    const serverInstance: ServerInstance;
    const minecraft: Minecraft;
    const level: ServerLevel;
    const commands: MinecraftCommands;
    const networkHandler: NetworkHandler;
    const commandRegistry: CommandRegistry;
    function init(): void;
}
