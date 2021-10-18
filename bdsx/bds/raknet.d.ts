import { NativeClass } from "../nativeclass";
import { uint16_t } from "../nativetype";
import minecraft = require('../minecraft');
/** @deprecated */
export declare namespace RakNet {
    /** @deprecated */
    class SystemAddress extends NativeClass {
        systemIndex: uint16_t;
        ToString(writePort: boolean, dest: Uint8Array, portDelineator: number): void;
        toString(): string;
    }
    /** @deprecated */
    const RakPeer: typeof minecraft.RakNet.RakPeer;
    /** @deprecated */
    type RakPeer = minecraft.RakNet.RakPeer;
    /** @deprecated */
    const RakNetGUID: typeof minecraft.RakNet.RakNetGUID;
    /** @deprecated */
    type RakNetGUID = minecraft.RakNet.RakNetGUID;
    /** @deprecated */
    const UNASSIGNED_RAKNET_GUID: minecraft.RakNet.RakNetGUID;
    /** @deprecated */
    class AddressOrGUID extends NativeClass {
        rakNetGuid: RakNetGUID;
        systemAddress: SystemAddress;
        GetSystemIndex(): uint16_t;
    }
}
