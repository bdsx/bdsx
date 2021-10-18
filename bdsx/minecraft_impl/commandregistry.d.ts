import { HasTypeId } from "../bds/typeid";
import { VoidPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { bin64_t, CxxString, int32_t } from "../nativetype";
declare module "../minecraft" {
    interface CommandRegistry extends HasTypeId {
        registerCommand(command: string, description: string, level: CommandPermissionLevel, cheatFlag: CommandFlag, usageFlag: CommandFlag): void;
        registerAlias(command: string, alias: string): void;
        findCommand(command: string): CommandRegistry.Signature | null;
    }
    namespace CommandRegistry {
        interface Overload {
            commandVersion: bin64_t;
            allocator: VoidPointer;
            parameters: CxxVector<CommandParameterData>;
            commandVersionOffset: int32_t;
        }
        interface Symbol {
            data: int32_t;
        }
        interface Signature {
            command: CxxString;
            description: CxxString;
            overloads: CxxVector<Overload>;
            permissionLevel: CommandPermissionLevel;
            commandSymbol: CommandRegistry.Symbol;
            commandAliasEnum: CommandRegistry.Symbol;
            flags: int32_t;
        }
    }
}
