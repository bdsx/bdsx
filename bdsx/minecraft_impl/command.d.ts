import { CommandVFTable } from "../bds/command";
import { VoidPointer } from "../core";
import { KeysFilter, NativeClass } from "../nativeclass";
import { bool_t, int16_t, int32_t, Type } from "../nativetype";
declare module "../minecraft" {
    namespace Command {
        class VFTable extends NativeClass {
            destructor: VoidPointer;
            execute: VoidPointer | null;
        }
        function mandatory<CMD extends Command, KEY extends keyof CMD, KEY_ISSET extends KeysFilter<CMD, bool_t> | null>(this: {
            new (): CMD;
        }, key: KEY, keyForIsSet: KEY_ISSET, desc?: string | null, type?: CommandParameterDataType, name?: string): CommandParameterData;
        function optional<CMD extends Command, KEY extends keyof CMD, KEY_ISSET extends KeysFilter<CMD, bool_t> | null>(this: {
            new (): CMD;
        }, key: KEY, keyForIsSet: KEY_ISSET, desc?: string | null, type?: CommandParameterDataType, name?: string): CommandParameterData;
        function manual(name: string, paramType: Type<any>, offset: number, flag_offset?: number, optional?: boolean, desc?: string | null, type?: CommandParameterDataType): CommandParameterData;
    }
    interface Command {
        vftable: CommandVFTable;
        u1: int32_t;
        u2: VoidPointer | null;
        u3: int32_t;
        u4: int16_t;
    }
}
