import { abstract } from "bdsx/common";
import { bin64_t, uint16_t } from "bdsx/nativetype";
import { NativeClass } from "bdsx/nativeclass";
import { VoidPointer } from "bdsx/core";

const portDelineator = '|'.charCodeAt(0);

export namespace RakNet
{
    export class SystemAddress extends NativeClass {
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

    export class RakNetGUID extends NativeClass {
        g:bin64_t;
        systemIndex:uint16_t = -1;

        constructor(g:bin64_t = bin64_t.minus_one) {
            super(true);
            this.g = g;
        }
    }

    export class RakPeer extends NativeClass {
        vftable:VoidPointer;
        
        GetSystemAddressFromIndex(idx:number):SystemAddress {
            abstract();
        }
    }

    export const UNASSIGNED_RAKNET_GUID = new RakNetGUID;
    
    export class AddressOrGUID extends NativeClass {
        rakNetGuid:RakNetGUID;
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
