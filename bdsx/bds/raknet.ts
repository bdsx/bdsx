import { abstract } from "../common";
import { VoidPointer } from "../core";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, int32_t, uint16_t, void_t } from "../nativetype";
import { makefunc } from "../makefunc";
import { procHacker } from "./proc";

const portDelineator = '|'.charCodeAt(0);

export namespace RakNet
{
    @nativeClass(0x88)
    export class SystemAddress extends NativeClass {
        @nativeField(uint16_t, 0x80)
        debugPort:uint16_t;
        @nativeField(uint16_t, 0x82)
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

        equals(other:VoidPointer|null):boolean {
            if (other instanceof RakNetGUID) {
                return this.g === other.g;
            }
            return false;
        }
    }

    @nativeClass()
    export class RakPeer extends NativeClass {
        @nativeField(VoidPointer)
        vftable:VoidPointer;

        GetSystemAddressFromIndex(idx:number):SystemAddress {
            abstract();
        }
        GetAveragePing(address:RakNet.AddressOrGUID):number {
            abstract();
        }
        GetLastPing(address:RakNet.AddressOrGUID):number {
            abstract();
        }
        GetLowestPing(address:RakNet.AddressOrGUID):number {
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
            if (rakNetGuid.g !== UNASSIGNED_RAKNET_GUID.g) {
                return rakNetGuid.systemIndex;
            } else {
                return this.systemAddress.systemIndex;
            }
        }
    }

    SystemAddress.prototype.ToString = procHacker.js("?ToString@SystemAddress@RakNet@@QEBAX_NPEADD@Z", void_t, {this: RakNet.SystemAddress}, bool_t, makefunc.Buffer, int32_t);
    RakPeer.prototype.GetSystemAddressFromIndex = makefunc.js([0xf0], RakNet.SystemAddress, {this:RakNet.RakPeer, structureReturn: true}, int32_t);
}
