import { abstract } from "../common";
import { NativeClass } from "../nativeclass";
import { int32_t } from "../nativetype";
import { CommandPermissionLevel } from "./command";
import { PlayerPermission } from "./player";

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