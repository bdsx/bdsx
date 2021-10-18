/**
 * not using
 */
interface ServerProperties {
    'server-name': string;
    'gamemode': 'survival' | 'creative' | 'adventure';
    'force-gamemode': boolean;
    'difficulty': 'peaceful' | 'easy' | 'normal' | 'hard';
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
    'level-seed': number | null;
    'default-player-permission-level': 'visitor' | 'member' | 'operator';
    'texturepack-required': boolean;
    'content-log-file-enabled': boolean;
    'compression-threshold': 1;
    'server-authoritative-movement': 'client-auth' | 'server-auth' | 'server-auth-with-rewind';
    'player-movement-score-threshold': number;
    'player-movement-distance-threshold': number;
    'player-movement-duration-threshold-in-ms': number;
    'correct-player-movement': boolean;
    'server-authoritative-block-breaking': boolean;
}
declare type StringProperties = {
    [key in keyof ServerProperties]?: string;
};
export declare const serverProperties: StringProperties;
export {};
