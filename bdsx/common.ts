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