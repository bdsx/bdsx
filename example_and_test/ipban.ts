import { NetworkIdentifier } from 'bdsx/bds/networkidentifier';
import { ipfilter } from 'bdsx/core';
import { promises as fs } from 'fs';
import path = require('path');

/**
 * ipfilter blocks at the earliest phase of the program.
 * It will never show the messages to the users
 */

/**
 * load the ban list from the file
 */
async function load():Promise<void> {
    try {
        const entries = JSON.parse(await fs.readFile(path.join(__dirname, '../ipban.json'), 'utf-8'));
        for (const [name, period] of entries) {
            ipfilter.addAt(name, period); // restore from the json file
        }
    } catch (err) {
        if (err.code === 'ENOENT') return; // file not found
        throw err;
    }
}

let saving:Promise<void>|null = null;

/**
 * save the ban list
 */
async function save():Promise<void> {
    while (saving !== null) await saving; // saving, wait it

    let resolver:(()=>void)|null = null;
    saving = new Promise(resolve=>{
        resolver = resolve;
    });
    const all = ipfilter.entries();
    await fs.writeFile('../ipban.json', JSON.stringify(all)); // save to the json file
    saving = null;
    resolver!();
}

export function banIp(ni:NetworkIdentifier):void {
    const ip = ni.toString();
    ipfilter.add(ip, 60*60); // add to the filter, 1 hour.
    save(); // ipfilter does not keep it permanently. need to store it somewhere.
}

// if the traffic is larger than 1 MiB, it blocks the user until 1 hour
ipfilter.setTrafficLimit(1024*1024*1024); // 1 MiB
ipfilter.setTrafficLimitPeriod(60*60); // 1 Hour

load();
