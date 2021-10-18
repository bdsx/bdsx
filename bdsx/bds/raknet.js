"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RakNet = void 0;
const tslib_1 = require("tslib");
const common_1 = require("../common");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const minecraft = require("../minecraft");
const portDelineator = '|'.charCodeAt(0);
/** @deprecated */
var RakNet;
(function (RakNet) {
    /** @deprecated */
    let SystemAddress = class SystemAddress extends nativeclass_1.NativeClass {
        // void SystemAddress::ToString(bool writePort, char *dest, char portDelineator) const
        ToString(writePort, dest, portDelineator) {
            (0, common_1.abstract)();
        }
        toString() {
            const dest = Buffer.alloc(128);
            this.ToString(true, dest, portDelineator);
            const len = dest.indexOf(0);
            if (len === -1)
                throw Error('SystemAddress.ToString failed, null character not found');
            return dest.subarray(0, len).toString();
        }
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(nativetype_1.uint16_t, 130)
    ], SystemAddress.prototype, "systemIndex", void 0);
    SystemAddress = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)(136)
    ], SystemAddress);
    RakNet.SystemAddress = SystemAddress;
    /** @deprecated */
    RakNet.RakPeer = minecraft.RakNet.RakPeer;
    /** @deprecated */
    RakNet.RakNetGUID = minecraft.RakNet.RakNetGUID;
    /** @deprecated */
    RakNet.UNASSIGNED_RAKNET_GUID = new RakNet.RakNetGUID(true);
    RakNet.UNASSIGNED_RAKNET_GUID.g = nativetype_1.bin64_t.minus_one;
    RakNet.UNASSIGNED_RAKNET_GUID.systemIndex = -1;
    /** @deprecated */
    let AddressOrGUID = class AddressOrGUID extends nativeclass_1.NativeClass {
        GetSystemIndex() {
            const rakNetGuid = this.rakNetGuid;
            if (rakNetGuid.g !== RakNet.UNASSIGNED_RAKNET_GUID.g) {
                return rakNetGuid.systemIndex;
            }
            else {
                return this.systemAddress.systemIndex;
            }
        }
    };
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(RakNet.RakNetGUID)
    ], AddressOrGUID.prototype, "rakNetGuid", void 0);
    (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeField)(SystemAddress)
    ], AddressOrGUID.prototype, "systemAddress", void 0);
    AddressOrGUID = (0, tslib_1.__decorate)([
        (0, nativeclass_1.nativeClass)()
    ], AddressOrGUID);
    RakNet.AddressOrGUID = AddressOrGUID;
})(RakNet = exports.RakNet || (exports.RakNet = {}));
//# sourceMappingURL=raknet.js.map