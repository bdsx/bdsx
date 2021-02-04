import { VoidPointer } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { CxxString, NativeType } from "bdsx/nativetype";
import { procHacker } from "./proc";

export class HashedString extends NativeClass {
    hash:VoidPointer|null;
    str:CxxString;

    [NativeType.ctor]():void {
        this.hash = null;
    }
    
    set(str:string):void {
        this.str = str;
        this.hash = computeHash(this.add(str_offset));
    }
}
HashedString.define({
    hash:VoidPointer,
    str:CxxString,
});
const str_offset = HashedString.offsetOf('str');
const computeHash = procHacker.js('?computeHash@HashedString@@SA_KAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', VoidPointer, null, VoidPointer);
