import { NativeClass, nativeClass, nativeField } from "../nativeclass";
import { CxxString, bool_t, uint8_t } from "../nativetype";

// Inside CommandSelectorBase::~CommandSelectorBase, InvertableFilter<std::string> was replaced by CommandName, meaning they have the same use.
@nativeClass()
export class CommandName extends NativeClass {
    @nativeField(CxxString)
    name: string;

    /** @deprecated */
    @nativeField(uint8_t, { ghost: true })
    unknown: uint8_t;

    @nativeField(bool_t)
    inverted: boolean;
}
