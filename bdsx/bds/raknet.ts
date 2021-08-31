import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, uint16_t } from "../nativetype";
import minecraft = require('../minecraft');

const portDelineator = '|'.charCodeAt(0);

/** @deprecated */
export namespace RakNet
{
    /** @deprecated */
    @nativeClass(136)
    export class SystemAddress extends NativeClass {
        @nativeField(uint16_t, 130)
        systemIndex:uint16_t;

        // void SystemAddress::ToString(bool writePort, char *dest, char portDelineator) const
        ToString(writePort:boolean, dest:Uint8Array, portDelineator:number):void {
            abstract();
        }

        toString():string {
            const dest = Buffer.alloc(128);
            this.ToString(true, dest, portDelineator);
            const len = dest.indexOf(0);
            if (len === -1) throw Error('SystemAddress.ToString failed, null character not found');
            return dest.subarray(0, len).toString();
        }
    }

    /** @deprecated */
    export const RakPeer = minecraft.RakNet.RakPeer;
    /** @deprecated */
    export type RakPeer = minecraft.RakNet.RakPeer;

    /** @deprecated */
    export const RakNetGUID = minecraft.RakNet.RakNetGUID;
    /** @deprecated */
    export type RakNetGUID = minecraft.RakNet.RakNetGUID;

    /** @deprecated */
    export const UNASSIGNED_RAKNET_GUID = new RakNetGUID(true);
    UNASSIGNED_RAKNET_GUID.g = bin64_t.minus_one;
    UNASSIGNED_RAKNET_GUID.systemIndex = -1;

    /** @deprecated */
    @nativeClass()
    export class AddressOrGUID extends NativeClass {
        @nativeField(RakNetGUID)
        rakNetGuid:RakNetGUID;
        @nativeField(SystemAddress)
        systemAddress:SystemAddress;

        GetSystemIndex():uint16_t {
            const rakNetGuid = this.rakNetGuid;
            if (rakNetGuid.g !== UNASSIGNED_RAKNET_GUID.g) {
                return rakNetGuid.systemIndex;
            } else {
                return this.systemAddress.systemIndex;
            }
        }
    }
}
