import { install } from "./source-map-support";
install();

export interface CANCEL{ 
    __CANCEL_OBJECT__?:void;
    toString():'CANCEL';
}

export const CANCEL:CANCEL = {toString(){ return 'CANCEL'; }};

export enum AttributeName
{
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
};

// https://github.com/pmmp/PocketMine-MP/blob/stable/src/pocketmine/network/mcpe/protocol/types/DeviceOS.php
export enum DeviceOS
{
	OS_ANDROID = 1,
	OS_IOS = 2,
	OS_OSX = 3,
	OS_FIREOS = 4,
	OS_GEARVR = 5,
	OS_HOLOLENS = 6,
	OS_WIN10 = 7,
	OS_WIN32 = 8,
	OS_DEDICATED = 9,
	OS_TVOS = 10,
	OS_ORBIS = 11,
	OS_NX = 12,
	OS_UNKNOWN = -1,
}

export enum Encoding
{
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

export enum RawTypeId {
	Int32,
	FloatAsInt64,
	Float,
	StringAnsi,
	StringUtf8,
	StringUtf16,
	Buffer,
	Bin64,
	Boolean,
	JsValueRef,
	Void,
}

export function emptyFunc(){}

export function abstract():never
{
	throw Error('abstract');
}

export const SYMOPT_PUBLICS_ONLY = 0x00004000;
export const SYMOPT_AUTO_PUBLICS = 0x00010000;
export const SYMOPT_UNDNAME = 0x00000002;
