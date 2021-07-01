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
}

export enum AbilitiesIndex {
    build,
    mine,
    doorsandswitches,
    opencontainers,
    attackplayers,
    attackmobs,
    op,
    teleport,
    invulnerable,
    flying,
    mayfly,
    instabuild,
    lightning,
    flySpeed,
    walkSpeed,
    mute,
    worldbuilder,
    noclip
}

export class Ability extends NativeClass {
    getBool():boolean {
        abstract();
    }
    getFloat():number {
        abstract();
    }
}