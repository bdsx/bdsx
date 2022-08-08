import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { CxxString, uint8_t } from "../nativetype";

@nativeClass()
export class CommandName extends NativeClass {
    @nativeField(CxxString)
    name:string;
    @nativeField(uint8_t)
    unknown:uint8_t;
}
