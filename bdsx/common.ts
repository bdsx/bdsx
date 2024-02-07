import * as colors from "colors";

if ((global as any).bdsx != null) {
    console.error(colors.red("[BDSX] multiple imported"));
    console.error(colors.red("First Import: " + (global as any).bdsx));
    console.error(colors.red("Duplicated: " + __dirname));
}
(global as any).bdsx = __dirname;

import type {} from "./externs";
import "./polyfill";

export const CANCEL = Symbol("CANCEL");
export type CANCEL = typeof CANCEL;

/**
 * Discovered by checking locator on a map
 */
export namespace Direction {
    export enum Type {
        South = 0,
        West = 1,
        North = 2,
        East = 3,
    }
}

export enum AttributeName {
    /** @deprecated deleted */
    ZombieSpawnReinforcementsChange = "minecraft:zombie.spawn.reinforcements",
    PlayerHunger = "minecraft:player.hunger",
    PlayerSaturation = "minecraft:player.saturation",
    PlayerExhaustion = "minecraft:player.exhaustion",
    PlayerLevel = "minecraft:player.level",
    PlayerExperience = "minecraft:player.experience",
    Health = "minecraft:health",
    FollowRange = "minecraft:follow_range",
    KnockbackResistance = "minecraft:knockback_resistance",
    MovementSpeed = "minecraft:movement",
    UnderwaterMovementSpeed = "minecraft:underwater_movement",
    LavaMovementSpeed = "minecraft:lava_movement",
    AttackDamage = "minecraft:attack_damage",
    Absorption = "minecraft:absorption",
    Luck = "minecraft:luck",
    JumpStrength = "minecraft:horse.jump_strength",
}

// https://github.com/pmmp/BedrockProtocol/blob/master/src/types/DeviceOS.php
export enum BuildPlatform {
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
/** @deprecated use {@link BuildPlatform}, matching to official name */
export type DeviceOS = BuildPlatform;
/** @deprecated use {@link BuildPlatform}, matching to official name */
export const DeviceOS = BuildPlatform;

export enum Encoding {
    Utf16 = -2,
    Buffer = -1,
    Utf8 = 0,
    None,
    Ansi,
}

export type TypeFromEncoding<T extends Encoding> = T extends Encoding.Buffer ? Uint8Array : string;

export type TypedArrayBuffer = Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;
export interface TypedArrayBufferConstructor<T extends TypedArrayBuffer> {
    new (count?: number): T;
    readonly BYTES_PER_ELEMENT: number;
}
export type Bufferable = TypedArrayBuffer | ArrayBuffer | DataView;

export type AnyFunction = (this: any, ...args: any[]) => any;

export interface VectorXYZ {
    x: number;
    y: number;
    z: number;
}

export interface VectorXY {
    x: number;
    y: number;
}

export interface VectorXZ {
    x: number;
    z: number;
}

export function emptyFunc(): void {
    // empty
}

export function returnTrue(): true {
    return true;
}

export function returnFalse(): false {
    return false;
}

export function abstract(): never {
    throw Error("abstract");
}
