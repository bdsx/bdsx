import { int32_t } from "../nativetype";
declare module "../minecraft" {
    interface CommandFlag {
        value: int32_t;
    }
    namespace CommandFlag {
        function create(value: number): CommandFlag;
    }
}
