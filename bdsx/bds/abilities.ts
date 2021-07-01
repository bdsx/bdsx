import { abstract } from "../common";
import { NativeClass } from "../nativeclass";
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
}
