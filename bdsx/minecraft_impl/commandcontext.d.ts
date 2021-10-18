import { CxxString } from "../nativetype";
declare module "../minecraft" {
    interface CommandContext {
        command: CxxString;
        origin: CommandOrigin;
    }
}
