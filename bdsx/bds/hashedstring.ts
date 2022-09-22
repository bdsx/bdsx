import { VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { CxxString, NativeType, void_t } from "../nativetype";
import { procHacker } from "../prochacker";

@nativeClass()
export class HashedString extends NativeClass {
    @nativeField(VoidPointer)
    hash:VoidPointer|null;
    @nativeField(CxxString)
    str:CxxString;
    @nativeField(HashedString.ref())
    recentCompared:HashedString|null;

    [NativeType.ctor]():void {
        this.hash = null;
        this.recentCompared = null;
    }

    set(str:string):void {
        this.str = str;
        this.hash = computeHash(this.add(str_offset));
    }
    static constructWith(str: string): HashedString {
        const hStr = new HashedString(true);
        HashedString$HashedString(hStr, str);
        return hStr;
    }
}
const HashedString$HashedString = procHacker.js("??0HashedString@@QEAA@AEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z", void_t, null, HashedString, CxxString);
const str_offset = HashedString.offsetOf('str');
const computeHash = procHacker.js('?computeHash@HashedString@@SA_KAEBV?$basic_string@DU?$char_traits@D@std@@V?$allocator@D@2@@std@@@Z', VoidPointer, null, VoidPointer);

export const HashedStringToString = new NativeType<string>(HashedString.symbol, 'HashedStringToString',
    HashedString[NativeType.size], HashedString[NativeType.align],
    v=>typeof v === 'string', undefined,
    (ptr, offset)=>ptr.addAs(HashedString, offset).str,
    (ptr, value, offset)=>ptr.addAs(HashedString, offset).set(value),
    undefined,
    undefined,
    HashedString[NativeType.ctor].bind(HashedString),
    HashedString[NativeType.dtor].bind(HashedString),
    HashedString[NativeType.ctor_copy].bind(HashedString),
    HashedString[NativeType.ctor_move].bind(HashedString),
);
HashedStringToString[makefunc.paramHasSpace] = true;
export type HashedStringToString = string;
