// import { abstract } from "../common";
// import { nativeClass, NativeClass, nativeField } from "../nativeclass";
// import { bool_t, int32_t, NativeType, uint32_t, void_t } from "../nativetype";
// import { procHacker } from "./proc";

import { abstract } from "../common";
import { nativeClass, NativeClass } from "../nativeclass";
import { bool_t, int32_t, NativeType, uint32_t, void_t } from "../nativetype";
import { procHacker } from "./proc";

// TODO: implement for hasEffect and getEffect
// export class MobEffect extends NativeClass {
//     getId(): number {
//         abstract();
//     }
// }

@nativeClass(28)
export class MobEffectInstance extends NativeClass {
    create(type: number, lengthInTicks: number, amplifier: number, unknownBool: boolean, showParticles: boolean, unknownBool2: boolean): void {
        abstract();
    }
}

MobEffectInstance.prototype.create = procHacker.js("??0MobEffectInstance@@QEAA@IHH_N00@Z", void_t, {this:MobEffectInstance}, uint32_t, int32_t, int32_t, bool_t, bool_t, bool_t);
