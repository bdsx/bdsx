import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { KeysFilter, NativeClass, NativeClassType } from "../nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, NativeType, Type } from "../nativetype";
import { SharedPtr } from "../sharedpointer";
import { Actor } from "./actor";
import { BlockPos, Vec3 } from "./blockpos";
import { CommandOrigin } from "./commandorigin";
import { AvailableCommandsPacket } from "./packets";
import { HasTypeId, typeid_t } from "./typeid";
import minecraft = require('../minecraft');
import enums = require('../enums');
/** @deprecated */
export declare const CommandPermissionLevel: typeof minecraft.CommandPermissionLevel;
/** @deprecated */
export declare type CommandPermissionLevel = minecraft.CommandPermissionLevel;
/** @deprecated import it from 'bdsx/enums' */
export declare const CommandCheatFlag: typeof enums.CommandCheatFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare type CommandCheatFlag = enums.CommandCheatFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare const CommandExecuteFlag: typeof enums.CommandExecuteFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare type CommandExecuteFlag = enums.CommandExecuteFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare const CommandSyncFlag: typeof enums.CommandSyncFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare type CommandSyncFlag = enums.CommandSyncFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare const CommandTypeFlag: typeof enums.CommandTypeFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare type CommandTypeFlag = enums.CommandTypeFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare const CommandUsageFlag: typeof enums.CommandUsageFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare type CommandUsageFlag = enums.CommandUsageFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare const CommandVisibilityFlag: typeof enums.CommandVisibilityFlag;
/** @deprecated import it from 'bdsx/enums' */
export declare type CommandVisibilityFlag = enums.CommandVisibilityFlag;
/** @deprecated **/
export declare const CommandFlag: typeof enums.CommandCheatFlag;
/** @deprecated import it from 'bdsx/minecraft' */
export declare const MCRESULT: typeof minecraft.MCRESULT;
/** @deprecated import it from 'bdsx/minecraft' */
export declare type MCRESULT = minecraft.MCRESULT;
/** @deprecated */
export declare class CommandSelectorBase extends NativeClass {
    private _newResults;
    newResults(origin: CommandOrigin): Actor[];
}
export declare class WildcardCommandSelector<T> extends CommandSelectorBase {
    static make<T>(type: Type<T>): NativeClassType<WildcardCommandSelector<T>>;
}
/** @deprecated use WildcardCommandSelector.make(Actor) from bdsx/minecraft */
export declare const ActorWildcardCommandSelector: NativeClassType<WildcardCommandSelector<Actor>>;
export declare class CommandFilePath extends NativeClass {
    text: CxxString;
}
export declare class CommandItem extends NativeClass {
    version: int32_t;
    id: int32_t;
}
export declare class CommandMessage extends NativeClass {
    data: CxxVector<CommandMessage.MessageComponent>;
}
export declare namespace CommandMessage {
    class MessageComponent extends NativeClass {
        string: CxxString;
    }
}
export declare class CommandPosition extends NativeClass {
    x: float32_t;
    y: float32_t;
    z: float32_t;
    isXRelative: bool_t;
    isYRelative: bool_t;
    isZRelative: bool_t;
    local: bool_t;
}
export declare class CommandPositionFloat extends CommandPosition {
}
/** @deprecated import it from bdsx/minecraft */
export declare class CommandRawText extends NativeClass {
    text: CxxString;
}
export declare class CommandWildcardInt extends NativeClass {
    isWildcard: bool_t;
    value: int32_t;
}
/** @deprecated */
export declare class CommandContext extends NativeClass {
    command: CxxString;
    origin: CommandOrigin;
    constructWith(str: CxxString, v: CommandOrigin, i: int32_t): void;
}
export declare enum CommandOutputType {
    None = 0,
    LastOutput = 1,
    Silent = 2,
    Type3 = 3,
    ScriptEngine = 4
}
declare type CommandOutputParameterType = string | boolean | number | Actor | BlockPos | Vec3 | Actor[];
/** @deprecated import it from 'bdsx/minecraft'  */
export declare class CommandOutputParameter extends NativeClass {
    string: CxxString;
    count: int32_t;
    static create(input: CommandOutputParameterType, count?: number): CommandOutputParameter;
}
/** @deprecated import it from 'bdsx/minecraft'  */
export declare class CommandOutput extends NativeClass {
    getType(): CommandOutputType;
    constructAs(type: CommandOutputType): void;
    protected _successNoMessage(): void;
    protected _success(message: string, params: CxxVector<CommandOutputParameter>): void;
    success(message?: string, params?: CommandOutputParameterType[] | CommandOutputParameter[]): void;
    protected _error(message: string, params: CxxVector<CommandOutputParameter>): void;
    error(message: string, params?: CommandOutputParameterType[] | CommandOutputParameter[]): void;
}
/** @deprecated import it from 'bdsx/minecraft'  */
export declare class CommandOutputSender extends NativeClass {
    vftable: VoidPointer;
}
/** @deprecated import it from 'bdsx/minecraft'  */
export declare class MinecraftCommands extends NativeClass {
    vftable: VoidPointer;
    sender: CommandOutputSender;
    handleOutput(origin: CommandOrigin, output: CommandOutput): void;
    executeCommand(ctx: SharedPtr<CommandContext>, suppressOutput: boolean): MCRESULT;
    getRegistry(): CommandRegistry;
}
export declare enum CommandParameterDataType {
    NORMAL = 0,
    ENUM = 1,
    SOFT_ENUM = 2,
    POSTFIX = 3
}
/** @deprecated import it from 'bdsx/minecraft'  */
export declare class CommandParameterData extends NativeClass {
    tid: typeid_t<CommandRegistry>;
    parser: VoidPointer;
    name: CxxString;
    desc: VoidPointer | null;
    unk56: int32_t;
    type: CommandParameterDataType;
    offset: int32_t;
    flag_offset: int32_t;
    optional: bool_t;
    pad73: bool_t;
}
/** @deprecated import it from 'bdsx/minecraft'  */
export declare class Command extends NativeClass {
    vftable: minecraft.Command.VFTable;
    u1: int32_t;
    u2: VoidPointer | null;
    u3: int32_t;
    u4: int16_t;
    [NativeType.ctor](): void;
    static mandatory<CMD extends Command, KEY extends keyof CMD, KEY_ISSET extends KeysFilter<CMD, bool_t> | null>(this: {
        new (): CMD;
    }, key: KEY, keyForIsSet: KEY_ISSET, desc?: string | null, type?: CommandParameterDataType, name?: string): CommandParameterData;
    static optional<CMD extends Command, KEY extends keyof CMD, KEY_ISSET extends KeysFilter<CMD, bool_t> | null>(this: {
        new (): CMD;
    }, key: KEY, keyForIsSet: KEY_ISSET, desc?: string | null, type?: CommandParameterDataType, name?: string): CommandParameterData;
    static manual(name: string, paramType: Type<any>, offset: number, flag_offset?: number, optional?: boolean, desc?: string | null, type?: CommandParameterDataType): CommandParameterData;
}
export declare namespace Command {
    /** @deprecated import it from 'bdsx/minecraft'  */
    const VFTable: typeof minecraft.Command.VFTable;
    /** @deprecated import it from 'bdsx/minecraft'  */
    type VFTable = minecraft.Command.VFTable;
}
/** @deprecated use Command.VFTable in 'bdsx/minecraft'  */
export declare const CommandVFTable: typeof minecraft.Command.VFTable;
/** @deprecated use Command.VFTable in 'bdsx/minecraft'  */
export declare type CommandVFTable = Command.VFTable;
/** @deprecated */
export declare class CommandRegistry extends HasTypeId {
    registerCommand(command: string, description: string, level: CommandPermissionLevel, flag1: CommandCheatFlag | CommandVisibilityFlag, flag2: CommandUsageFlag | CommandVisibilityFlag): void;
    registerAlias(command: string, alias: string): void;
    /**
     * CAUTION: this method will destruct all parameters in params
     */
    registerOverload(name: string, commandClass: {
        new (): Command;
    }, params: CommandParameterData[]): void;
    registerOverloadInternal(signature: CommandRegistry.Signature, overload: CommandRegistry.Overload): void;
    findCommand(command: string): CommandRegistry.Signature | null;
    protected _serializeAvailableCommands(pk: AvailableCommandsPacket): AvailableCommandsPacket;
    serializeAvailableCommands(): AvailableCommandsPacket;
    static getParser<T>(type: Type<T>): VoidPointer;
}
/** @deprecated */
export declare namespace CommandRegistry {
    class Overload extends NativeClass {
        commandVersion: bin64_t;
        allocator: VoidPointer;
        parameters: CxxVector<CommandParameterData>;
        commandVersionOffset: int32_t;
        /** @deprecated */
        u6: int32_t;
    }
    class Symbol extends NativeClass {
        value: int32_t;
    }
    class Signature extends NativeClass {
        command: CxxString;
        description: CxxString;
        overloads: CxxVector<Overload>;
        permissionLevel: CommandPermissionLevel;
        commandSymbol: CommandRegistry.Symbol;
        commandAliasEnum: CommandRegistry.Symbol;
        flags: CommandCheatFlag | CommandExecuteFlag | CommandSyncFlag | CommandTypeFlag | CommandUsageFlag | CommandVisibilityFlag;
    }
    class ParseToken extends NativeClass {
    }
}
export {};
