import { NetworkIdentifier } from 'bdsx/bds/networkidentifier';
import { ipfilter } from 'bdsx/core';
import { storageManager } from 'bdsx/storage';

/**
 * ipfilter blocks at the earliest phase of the program.
 * It will never show the messages to the users
 */

let banListStorage:[string, number][]|null = null;

export function banIp(ni:NetworkIdentifier):void {
    if (banListStorage === null) throw Error('the storage is not loaded');
    const ip = ni.toString();
    ipfilter.add(ip, 60*60); // add to the filter, 1 hour.

    // ipfilter does not keep it permanently. need to store it somewhere.
    banListStorage.push([ip, ipfilter.getTime(ip)]);
}

// if the traffic is larger than 1 MiB, it blocks the user until 1 hour
ipfilter.setTrafficLimit(1024*1024*1024); // 1 MiB
ipfilter.setTrafficLimitPeriod(60*60); // 1 Hour

// load from the storage
(async()=>{
    const storage = await storageManager.get('ipban');
    if (storage.data == null) {
        storage.init([]);
    }
    banListStorage = storage.data;

    for (const [name, period] of storage.data) {
        ipfilter.addAt(name, period); // restore from the storage
    }
})();

