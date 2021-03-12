import { abstract } from "bdsx/common";
import { bin64_t, uint16_t } from "bdsx/nativetype";
import { nativeClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { VoidPointer } from "bdsx/core";

const portDelineator = '|'.charCodeAt(0);

export namespace RakNet
{
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

    @nativeClass()
    export class RakNetGUID extends NativeClass {
        @nativeField(bin64_t)
        g:bin64_t;
        @nativeField(uint16_t)
        systemIndex:uint16_t;
    }

    @nativeClass()
    export class RakPeer extends NativeClass {
        @nativeField(VoidPointer)
        vftable:VoidPointer;

        GetSystemAddressFromIndex(idx:number):SystemAddress {
            abstract();
        }
    }

    export const UNASSIGNED_RAKNET_GUID = new RakNetGUID(true);
    UNASSIGNED_RAKNET_GUID.g = bin64_t.minus_one;
    UNASSIGNED_RAKNET_GUID.systemIndex = -1;

    @nativeClass()
    export class AddressOrGUID extends NativeClass {
        @nativeField(RakNetGUID)
        rakNetGuid:RakNetGUID;
        @nativeField(SystemAddress)
        systemAddress:SystemAddress;

        GetSystemIndex():uint16_t {
            const rakNetGuid = this.rakNetGuid;
            if (rakNetGuid !== UNASSIGNED_RAKNET_GUID) {
                return rakNetGuid.systemIndex;
            } else {
                return this.systemAddress.systemIndex;
            }
        }
    }

}
