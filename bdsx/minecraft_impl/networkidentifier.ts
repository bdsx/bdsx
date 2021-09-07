import { StaticPointer, VoidPointer } from "../core";
import { dll } from "../dll";
import { events } from "../events";
import { Hashable, HashSet } from "../hashset";
import { hook } from "../hook";
import { makefunc } from "../makefunc";
import { NetworkHandler, networkHandler, NetworkIdentifier, RakNet } from "../minecraft";
import { NativeClass } from "../nativeclass";
import { NativeType } from "../nativetype";
import { remapAndPrintError } from "../source-map-support";
import { _tickCallback } from "../util";
import './raknet/addressorguid';
import { minecraftTsReady } from "./ready";

const identifiers = new HashSet<NetworkIdentifier>();

declare module "../minecraft" {
    interface NetworkIdentifier extends Hashable {
        address:RakNet.AddressOrGUID;

        assignTo(target:VoidPointer):void;
        equals(other:NetworkIdentifier):boolean;
        hash():number;
        getActor():ServerPlayer|null;
        getAddress():string;
        toString():string;
    }

    namespace NetworkIdentifier {
        function fromPointer(ptr:VoidPointer):NetworkIdentifier;
        function all():IterableIterator<NetworkIdentifier>;
        let lastSender:NetworkIdentifier;
    }

}

NetworkIdentifier.define({
    address:RakNet.AddressOrGUID
});

NetworkIdentifier.prototype.assignTo = function(target:VoidPointer):void {
    dll.vcruntime140.memcpy(target, this, NetworkIdentifier[NativeClass.contentSize]);
};

NetworkIdentifier.prototype.getAddress = function():string {
    const idx = this.address.GetSystemIndex();
    const rakpeer = networkHandler.instance.peer;
    return rakpeer.GetSystemAddressFromIndex(idx).toString();
};

NetworkIdentifier.prototype.toString = function():string {
    return this.getAddress();
};

NetworkIdentifier.fromPointer = function(ptr:VoidPointer):NetworkIdentifier {
    return identifiers.get(ptr.as(NetworkIdentifier))!;
};

NetworkIdentifier[NativeType.getter] = function(ptr:StaticPointer, offset?:number):NetworkIdentifier {
    return _singletoning(ptr.addAs(NetworkIdentifier, offset, offset! >> 31));
};
NetworkIdentifier[makefunc.getFromParam] = function(ptr:StaticPointer, offset?:number):NetworkIdentifier {
    return _singletoning(ptr.getPointerAs(NetworkIdentifier, offset));
};

NetworkIdentifier.all = function():IterableIterator<NetworkIdentifier> {
    return identifiers.values();
};
function _singletoning(ptr:NetworkIdentifier):NetworkIdentifier {
    let ni = identifiers.get(ptr);
    if (ni != null) return ni;
    ni = new NetworkIdentifier(true);
    ptr.assignTo(ni);
    identifiers.add(ni);
    return ni;
}

minecraftTsReady.promise.then(()=>{
    hook(NetworkHandler, 'onConnectionClosed').call(ni=>{
        try {
            events.networkDisconnected.fire(ni);
            _tickCallback();
        } catch (err) {
            remapAndPrintError(err);
        }
        // ni is used after onConnectionClosed. on some message processings.
        // timeout for avoiding the re-allocation
        setTimeout(()=>{
            identifiers.delete(ni);
        }, 3000);
    }, {callOriginal: true});
});
