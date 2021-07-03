import { abstract } from "../common";
import { NativeClass } from "../nativeclass";
import { CxxString } from "../nativetype";
import type { CommandPermissionLevel } from "./command";
import type { PlayerPermission } from "./player";

export class Abilities extends NativeClass {
    getCommandPermissionLevel():CommandPermissionLevel {
        abstract();
    }
    getPlayerPermissionLevel():PlayerPermission {
        abstract();
    }
    setCommandPermissionLevel(commandPermissionLevel:CommandPermissionLevel):void {
        abstract();
    }
    setPlayerPermissionLevel(playerPermissionLevel:PlayerPermission):void {
        abstract();
    }
    getAbility(abilityIndex:AbilitiesIndex):Ability {
        abstract();
    }
    setAbility(abilityIndex:AbilitiesIndex, value:boolean):void {
        abstract();
    }
}

export enum AbilitiesIndex {
    Build,
    Mine,
    Doorsandswitches,
    Opencontainers,
    Attackplayers,
    Attackmobs,
    Op,
    Teleport,
    Invulnerable,
    Flying,
    Mayfly,
    Instabuild,
    Lightning,
    Flyspeed,
    Walkspeed,
    Mute,
    Worldbuilder,
    Noclip
}

export class Ability extends NativeClass {
    getBool():boolean {
        abstract();
    }
    getFloat():number {
        abstract();
    }
    setBool(value:boolean) {
        abstract();
    }
}
