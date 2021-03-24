
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

export function emptyFunc():void{
	// empty
}

export function abstract():never {
    throw Error('abstract');
}

export const SYMOPT_CASE_INSENSITIVE          = 0x00000001;
export const SYMOPT_UNDNAME                   = 0x00000002;
export const SYMOPT_DEFERRED_LOADS            = 0x00000004;
export const SYMOPT_NO_CPP                    = 0x00000008;
export const SYMOPT_LOAD_LINES                = 0x00000010;
export const SYMOPT_OMAP_FIND_NEAREST         = 0x00000020;
export const SYMOPT_LOAD_ANYTHING             = 0x00000040;
export const SYMOPT_IGNORE_CVREC              = 0x00000080;
export const SYMOPT_NO_UNQUALIFIED_LOADS      = 0x00000100;
export const SYMOPT_FAIL_CRITICAL_ERRORS      = 0x00000200;
export const SYMOPT_EXACT_SYMBOLS             = 0x00000400;
export const SYMOPT_ALLOW_ABSOLUTE_SYMBOLS    = 0x00000800;
export const SYMOPT_IGNORE_NT_SYMPATH         = 0x00001000;
export const SYMOPT_INCLUDE_32BIT_MODULES     = 0x00002000;
export const SYMOPT_PUBLICS_ONLY              = 0x00004000;
export const SYMOPT_NO_PUBLICS                = 0x00008000;
export const SYMOPT_AUTO_PUBLICS              = 0x00010000;
export const SYMOPT_NO_IMAGE_SEARCH           = 0x00020000;
export const SYMOPT_SECURE                    = 0x00040000;
export const SYMOPT_NO_PROMPTS                = 0x00080000;
export const SYMOPT_OVERWRITE                 = 0x00100000;
export const SYMOPT_IGNORE_IMAGEDIR           = 0x00200000;
export const SYMOPT_FLAT_DIRECTORY            = 0x00400000;
export const SYMOPT_FAVOR_COMPRESSED          = 0x00800000;
export const SYMOPT_ALLOW_ZERO_ADDRESS        = 0x01000000;
export const SYMOPT_DISABLE_SYMSRV_AUTODETECT = 0x02000000;
export const SYMOPT_READONLY_CACHE            = 0x04000000;
export const SYMOPT_SYMPATH_LAST              = 0x08000000;
export const SYMOPT_DISABLE_FAST_SYMBOLS      = 0x10000000;
export const SYMOPT_DISABLE_SYMSRV_TIMEOUT    = 0x20000000;
export const SYMOPT_DISABLE_SRVSTAR_ON_STARTUP = 0x40000000;
export const SYMOPT_DEBUG                     = 0x80000000;

export const UNDNAME_COMPLETE                 = 0x0000;  // Enable full undecoration
export const UNDNAME_NO_LEADING_UNDERSCORES   = 0x0001;  // Remove leading underscores from MS extended keywords
export const UNDNAME_NO_MS_KEYWORDS           = 0x0002;  // Disable expansion of MS extended keywords
export const UNDNAME_NO_FUNCTION_RETURNS      = 0x0004;  // Disable expansion of return type for primary declaration
export const UNDNAME_NO_ALLOCATION_MODEL      = 0x0008;  // Disable expansion of the declaration model
export const UNDNAME_NO_ALLOCATION_LANGUAGE   = 0x0010;  // Disable expansion of the declaration language specifier
export const UNDNAME_NO_MS_THISTYPE           = 0x0020;  // NYI Disable expansion of MS keywords on the 'this' type for primary declaration
export const UNDNAME_NO_CV_THISTYPE           = 0x0040;  // NYI Disable expansion of CV modifiers on the 'this' type for primary declaration
export const UNDNAME_NO_THISTYPE              = 0x0060;  // Disable all modifiers on the 'this' type
export const UNDNAME_NO_ACCESS_SPECIFIERS     = 0x0080;  // Disable expansion of access specifiers for members
export const UNDNAME_NO_THROW_SIGNATURES      = 0x0100;  // Disable expansion of 'throw-signatures' for functions and pointers to functions
export const UNDNAME_NO_MEMBER_TYPE           = 0x0200;  // Disable expansion of 'static' or 'virtual'ness of members
export const UNDNAME_NO_RETURN_UDT_MODEL      = 0x0400;  // Disable expansion of MS model for UDT returns
export const UNDNAME_32_BIT_DECODE            = 0x0800;  // Undecorate 32-bit decorated names
export const UNDNAME_NAME_ONLY                = 0x1000;  // Crack only the name for primary declaration;
                                                                                                   //  return just [scope::]name.  Does expand template params
export const UNDNAME_NO_ARGUMENTS             = 0x2000;  // Don't undecorate arguments to function
export const UNDNAME_NO_SPECIAL_SYMS          = 0x4000;  // Don't undecorate special names (v-table, vcall, vector xxx, metatype, etc)
