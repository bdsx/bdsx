import { Command, CommandCheatFlag, CommandOutput, CommandPermissionLevel, CommandRegistry, CommandUsageFlag, CommandVisibilityFlag, MCRESULT } from './bds/command';
import { CommandOrigin } from './bds/commandorigin';
import type { Dimension as Dimension } from './bds/dimension';
import { NativeType, Type } from './nativetype';
export declare class CustomCommand extends Command {
    self_vftable: Command.VFTable;
    [NativeType.ctor](): void;
    execute(origin: CommandOrigin, output: CommandOutput): void;
}
export declare class CustomCommandFactory {
    readonly registry: CommandRegistry;
    readonly name: string;
    constructor(registry: CommandRegistry, name: string);
    overload<PARAMS extends Record<string, Type<any> | [Type<any>, boolean]>>(callback: (params: {
        [key in keyof PARAMS]: PARAMS[key] extends [Type<infer F>, infer V] ? (V extends true ? F | undefined : F) : (PARAMS[key] extends {
            prototype: infer F;
        } ? F : PARAMS[key] extends Type<infer F> ? F : never);
    }, origin: CommandOrigin, output: CommandOutput) => void, parameters: PARAMS): this;
    alias(alias: string): this;
}
/**
 * @deprecated use bdsx.commands
 */
export declare namespace command {
    /**
     * @deprecated use bdsx.commands
     */
    function register(name: string, description: string, perm?: CommandPermissionLevel, flags1?: CommandCheatFlag | CommandVisibilityFlag, flags2?: CommandUsageFlag | CommandVisibilityFlag): CustomCommandFactory;
    /**
     * it does the same thing with bedrockServer.executeCommandOnConsole
     * but call the internal function directly
     * @deprecated use bdsx.commands
     */
    function execute(command: string, mute?: boolean, permissionLevel?: number, dimension?: Dimension | null): MCRESULT;
}
