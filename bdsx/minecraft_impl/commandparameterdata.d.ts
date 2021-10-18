import { VoidPointer } from "../core";
import { bool_t, CxxString, int32_t } from "../nativetype";
declare module "../minecraft" {
    interface CommandParameterData {
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
}
