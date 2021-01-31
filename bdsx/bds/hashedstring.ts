import { bin } from "bdsx/bin";
import { bin64_t, CxxString, NativeType } from "bdsx/nativetype";
import { NativeClass } from "bdsx/nativeclass";

const hashStart = bin.make64(0x84222325, 0xCBF29CE4);
const hashMul = bin.make64(0x100, 0x000001B3);

export class HashedString extends NativeClass {
    hash:bin64_t;
    str:CxxString;

    [NativeType.ctor]():void {
        this.hash = bin64_t.zero;
    }
    
    set(str:string):void {
        this.str = str;
        this.hash = HashedString.getHash(str);
    }

    static getHash(text:string):bin64_t {
        if (text === '') return bin64_t.zero;
        let hash = hashStart;
        for (let i=0;i<text.length;i++) {
            const chr = text.charAt(i);
            if (chr === '\0') break;
            hash = bin.mul(hash, '\u01B3\u0000\u0100');
            hash = (bin.bitxor(bin.mul(hash, hashMul), chr));
        }
        return hash;
    }
}

