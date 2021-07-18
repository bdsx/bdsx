import path = require('path');
import fs = require('fs');
import { fsutil } from "./fsutil";

/**
 * not using
 */
interface ServerProperties {
    'server-name':string;
    'gamemode': 'survival'|'creative'|'adventure';
    'force-gamemode': boolean;
    'difficulty': 'peaceful'|'easy'|'normal'|'hard';
    'allow-cheats': boolean;
    'max-players': number;
    'online-mode': boolean;
    'white-list': boolean;
    'server-port': number;
    'server-portv6': number;
    'view-distance': number;
    'tick-distance': number;
    'player-idle-timeout': number;
    'max-threads': number;
    'level-name': string;
    'level-seed': number|null;
    'default-player-permission-level': 'visitor'|'member'|'operator';
    'texturepack-required': boolean;
    'content-log-file-enabled': boolean;
    'compression-threshold': 1;
    'server-authoritative-movement': 'client-auth'|'server-auth'|'server-auth-with-rewind';
    'player-movement-score-threshold': number;
    'player-movement-distance-threshold': number;
    'player-movement-duration-threshold-in-ms': number;
    'correct-player-movement': boolean;
    'server-authoritative-block-breaking': boolean;
}

type StringProperties = {[key in keyof ServerProperties]?:string};
export const serverProperties:StringProperties = {};

try {
    const bdsPath = fsutil.projectPath+path.sep+'bedrock_server';
    const propertyFile = bdsPath+path.sep+'server.properties';
    const properties = fs.readFileSync(propertyFile, 'utf8');
    const matcher = /^\s*([^=#]+)\s*=\s*(.*)\s*$/mg;
    for (;;) {
        const matched = matcher.exec(properties);
        if (matched === null) break;
        serverProperties[matched[1] as keyof ServerProperties] = matched[2];
    }
} catch (err) {
    if (err.code !== 'ENOENT') {
        throw err;
    }
}
