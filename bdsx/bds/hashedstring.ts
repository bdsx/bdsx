import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { CxxString, NativeType } from "../nativetype";
import { procHacker } from "./proc";

@nativeClass()
export class HashedString extends NativeClass {
    @nativeField(VoidPointer)
    hash:VoidPointer|null;
    @nativeField(CxxString)
    str:CxxString;

    [NativeType.ctor]():void {
        this.hash = null;
    }

    set(str:string):void {
        this.str = str;
        this.hash = computeHash(this.add(str_offset));
    }
}
const str_offset = HashedString.offsetOf('str');
const computeHash = procHacker.js('?computeHash@HashedString@@SA_KAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', VoidPointer, null, VoidPointer);
