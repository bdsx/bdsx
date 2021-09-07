
import { VoidPointer } from "../core";
import { makefunc } from "../makefunc";
import { Json, OnHitSubcomponent } from "../minecraft";
import { void_t } from "../nativetype";

declare module "../minecraft" {
    interface OnHitSubcomponent {
        vftable: VoidPointer;
        readfromJSON(value:Json.Value):void;
        writetoJSON(value:Json.Value):void;
    }
}

OnHitSubcomponent.define({
    vftable:VoidPointer,
});

OnHitSubcomponent.prototype.readfromJSON = makefunc.js([0x08], void_t, {this:OnHitSubcomponent}, Json.Value);
OnHitSubcomponent.prototype.writetoJSON = makefunc.js([0x10], void_t, {this:OnHitSubcomponent}, Json.Value);
OnHitSubcomponent.prototype.getName = makefunc.js([0x20], makefunc.Utf8, {this:OnHitSubcomponent, structureReturn:true});
