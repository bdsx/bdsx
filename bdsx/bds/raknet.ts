import { makefunc_vf } from "bdsx/capi";
import { RawTypeId } from "bdsx/common";
import { makefunc, VoidPointer } from "bdsx/core";
import { bin64_t, uint16_t } from "bdsx/nativetype";
import { NativeClass } from "bdsx/nativeclass";
import { proc } from "./proc";

const portDelineator = '|'.charCodeAt(0);

export namespace RakNet
{
    export class SystemAddress extends NativeClass
    {
        systemIndex:uint16_t;
        
        // void SystemAddress::ToString(bool writePort, char *dest, char portDelineator) const
        ToString(writePort:boolean, dest:Uint8Array, portDelineator:number):void
        {
            throw 'abstract';
        }

        toString():string
        {
            const dest = Buffer.alloc(128);
            this.ToString(true, dest, portDelineator);
            let len = dest.indexOf(0);
            if (len === -1) throw Error('SystemAddress.ToString failed, null character not found');
            return dest.subarray(0, len).toString();
        }
    }
    SystemAddress.define<SystemAddress>({
        systemIndex:[uint16_t, 130]
    }, 136);
    SystemAddress.prototype.ToString = makefunc.js(proc["RakNet::SystemAddress::ToString"], RawTypeId.Void, SystemAddress, false, RawTypeId.Boolean, RawTypeId.Buffer, RawTypeId.Int32);


    export class RakNetGUID extends NativeClass
    {
        g:bin64_t;
        systemIndex:uint16_t = -1;

        constructor(g:bin64_t = bin64_t.minus_one)
        {
            super(true);
            this.g = g;
        }
    }
    RakNetGUID.define({
        g:bin64_t,
        systemIndex:uint16_t
    }, 16);

    export class RakPeer extends NativeClass
    {
        GetSystemAddressFromIndex(idx:number):SystemAddress
        {
            throw 'abstract';
        }
    }
    RakPeer.abstract({});
    RakPeer.prototype.GetSystemAddressFromIndex = makefunc_vf(0, 0xf0, SystemAddress, true, RawTypeId.Int32);

    export const UNASSIGNED_RAKNET_GUID = new RakNetGUID;
    
    export class AddressOrGUID extends NativeClass
    {
        rakNetGuid:RakNetGUID;
        systemAddress:SystemAddress;
        
        GetSystemIndex():uint16_t
        {
            const rakNetGuid = this.rakNetGuid;
            if (rakNetGuid !== UNASSIGNED_RAKNET_GUID)
            {
                return rakNetGuid.systemIndex;
            }
            else
            {
                return this.systemAddress.systemIndex;
            }
        }
    }
    AddressOrGUID.define({
        rakNetGuid:RakNetGUID,
        systemAddress:SystemAddress,
    });

}
