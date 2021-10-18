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
/** @deprecated */
export declare const CommandPermissionLevel: typeof minecraft.CommandPermissionLevel;
/** @deprecated */
export declare type CommandPermissionLevel = minecraft.CommandPermissionLevel;
export declare enum CommandCheatFlag {
    Cheat = 0,
    NotCheat = 64,
    /** @deprecated */
    NoCheat = 64,
    None = 0
}
export declare enum CommandExecuteFlag {
    Allowed = 0,
    Disallowed = 16
}
export declare enum CommandSyncFlag {
    Synced = 0,
    Local = 8
}
export declare enum CommandTypeFlag {
    None = 0,
    Message = 32
}
export declare enum CommandUsageFlag {
    Normal = 0,
    Test = 1,
    /** @deprecated Use CommandVisibilityFlag */
    Hidden = 2,
    _Unknown = 128
}
/** Putting in flag1 or flag2 are both ok, you can also combine with other flags like CommandCheatFlag.NoCheat | CommandVisibilityFlag.HiddenFromCommandBlockOrigin but combining is actually not quite useful */
export declare enum CommandVisibilityFlag {
    Visible = 0,
    /** Bug: Besides from being hidden from command blocks, players cannot see it also well, but they are still able to execute */
    HiddenFromCommandBlockOrigin = 2,
    HiddenFromPlayerOrigin = 4,
    /** Still visible to console */
    Hidden = 6
}
/** @deprecated **/
export declare const CommandFlag: typeof CommandCheatFlag;
/** @deprecated */
export declare const MCRESULT: typeof minecraft.MCRESULT;
/** @deprecated */
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
export declare class CommandOutputParameter extends NativeClass {
    string: CxxString;
    count: int32_t;
    static create(input: CommandOutputParameterType, count?: number): CommandOutputParameter;
}
export declare class CommandOutput extends NativeClass {
    getType(): CommandOutputType;
    constructAs(type: CommandOutputType): void;
    protected _successNoMessage(): void;
    protected _success(message: string, params: CxxVector<CommandOutputParameter>): void;
    success(message?: string, params?: CommandOutputParameterType[] | CommandOutputParameter[]): void;
    protected _error(message: string, params: CxxVector<CommandOutputParameter>): void;
    error(message: string, params?: CommandOutputParameterType[] | CommandOutputParameter[]): void;
}
export declare class CommandOutputSender extends NativeClass {
    vftable: VoidPointer;
}
/** @deprecated */
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
export declare class CommandVFTable extends NativeClass {
    destructor: VoidPointer;
    execute: VoidPointer | null;
}
export declare class Command extends NativeClass {
    vftable: CommandVFTable;
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
    const VFTable: typeof CommandVFTable;
    type VFTable = CommandVFTable;
}
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
