import { ExtendedStreamReadResult } from "../minecraft";
import { int32_t } from "../nativetype";

declare module "../minecraft" {

    interface ExtendedStreamReadResult {
        streamReadResult:StreamReadResult;
    }

}

ExtendedStreamReadResult.abstract({
    streamReadResult:int32_t,
});

