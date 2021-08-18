
import colors = require('colors');

if ((global as any).bdsx != null) {
    console.error(colors.red('[BDSX] multiple imported'));
    console.error(colors.red('First Import: '+(global as any).bdsx));
    console.error(colors.red('Dupplicated: '+__dirname));
}
(global as any).bdsx = __dirname;

import type {} from './externs';
import './polyfill';

export interface CANCEL {
    __CANCEL_OBJECT__?:void;
    toString():'CANCEL';
}

export const CANCEL:CANCEL = {toString(){ return 'CANCEL'; }};

export enum AttributeName {
	ZombieSpawnReinforcementsChange="minecraft:zombie.spawn.reinforcements",
	PlayerHunger="minecraft:player.hunger",
	PlayerSaturation="minecraft:player.saturation",
	PlayerExhaustion="minecraft:player.exhaustion",
	PlayerLevel="minecraft:player.level",
	PlayerExperience="minecraft:player.experience",
	Health="minecraft:health",
	FollowRange="minecraft:follow_range",
	KnockbackResistance="minecraft:knockback_registance",
	MovementSpeed="minecraft:movement",
	UnderwaterMovementSpeed="minecraft:underwater_movement",
	AttackDamage="minecraft:attack_damage",
	Absorption="minecraft:absorption",
	Luck="minecraft:luck",
	JumpStrength="minecraft:horse.jump_strength",
}

// https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/types/DeviceOS.php
export enum DeviceOS {
	UNKNOWN = -1,
	ANDROID = 1,
	IOS = 2,
	OSX = 3,
	AMAZON = 4,
	GEAR_VR = 5,
	HOLOLENS = 6,
	WINDOWS_10 = 7,
	WIN32 = 8,
	DEDICATED = 9,
	TVOS = 10,
	PLAYSTATION = 11,
	NINTENDO = 12,
	XBOX = 13,
	WINDOWS_PHONE = 14,
}

export enum Encoding {
	Utf16=-2,
	Buffer=-1,
	Utf8=0,
	None,
	Ansi
}

export type TypeFromEncoding<T extends Encoding> = T extends Encoding.Buffer ? Uint8Array : string;

export type TypedArrayBuffer = Uint8Array | Uint16Array | Uint32Array |
	Uint8ClampedArray | Int8Array | Int16Array | Int32Array |
	Float32Array | Float64Array;
export type Bufferable = TypedArrayBuffer | ArrayBuffer | DataView;

export type AnyFunction = (this:any, ...args:any[])=>any;

export function emptyFunc():void{
	// empty
}

export function abstract():never {
    throw Error('abstract');
}
