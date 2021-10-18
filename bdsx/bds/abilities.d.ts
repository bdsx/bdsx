import { NativeClass } from "../nativeclass";
import { bool_t, float32_t } from "../nativetype";
import type { CommandPermissionLevel } from "./command";
import type { PlayerPermission } from "./player";
import minecraft = require('../minecraft');
export declare class Abilities extends NativeClass {
    protected _setAbility(abilityIndex: AbilitiesIndex, value: boolean): void;
    getCommandPermissionLevel(): CommandPermissionLevel;
    getPlayerPermissionLevel(): PlayerPermission;
    setCommandPermissionLevel(commandPermissionLevel: CommandPermissionLevel): void;
    setPlayerPermissionLevel(playerPermissionLevel: PlayerPermission): void;
    getAbility(abilityIndex: AbilitiesIndex): Ability;
    setAbility(abilityIndex: AbilitiesIndex, value: boolean | number): void;
    static getAbilityName(abilityIndex: AbilitiesIndex): string;
    static nameToAbilityIndex(name: string): AbilitiesIndex;
}
/** @deprecated */
export declare const AbilitiesIndex: typeof minecraft.AbilitiesIndex;
/** @deprecated */
export declare type AbilitiesIndex = minecraft.AbilitiesIndex;
export declare class Ability extends NativeClass {
    type: Ability.Type;
    value: Ability.Value;
    options: Ability.Options;
    getBool(): boolean;
    getFloat(): number;
    setBool(value: boolean): void;
    setFloat(value: number): void;
    getValue(): boolean | number | undefined;
    setValue(value: boolean | number): void;
}
export declare namespace Ability {
    /** @deprecated */
    const Type: typeof minecraft.Ability.Type;
    /** @deprecated */
    type Type = minecraft.Ability.Type;
    /** @deprecated */
    const Options: typeof minecraft.Ability.Options;
    /** @deprecated */
    type Options = minecraft.Ability.Options;
    class Value extends NativeClass {
        boolVal: bool_t;
        floatVal: float32_t;
    }
}
