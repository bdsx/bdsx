import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { int32_t } from "../nativetype";
import type { CommandPermissionLevel } from "./command";
import type { PlayerPermission } from "./player";

export class Abilities extends NativeClass {
    protected _setAbility(abilityIndex:AbilitiesIndex, value:boolean):void {
        abstract();
    }
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
    setAbility(abilityIndex:AbilitiesIndex, value:boolean|number):void {
        switch (typeof value) {
        case "boolean":
            this._setAbility(abilityIndex, value);
            break;
        case "number":
            this.getAbility(abilityIndex).setFloat(value);
            break;
        }
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

@nativeClass(null)
export class Ability extends NativeClass {
    @nativeField(int32_t)
    type:Ability.Type;

    getBool():boolean {
        abstract();
    }
    getFloat():number {
        abstract();
    }
    setBool(value:boolean):void {
        abstract();
    }
    setFloat(value:number):void {
        this.type = Ability.Type.Float;
        this.setFloat32(value, 0x04);
    }

    getValue():boolean|number|undefined {
        switch (this.type) {
        case Ability.Type.Unset:
            return undefined;
        case Ability.Type.Bool:
            return this.getBoolean(0x04);
        case Ability.Type.Float:
            return this.getFloat32(0x04);
        }
    }
    setValue(value:boolean|number):void {
        switch (typeof value) {
        case "boolean":
            this.type = Ability.Type.Bool;
            this.setBoolean(value, 0x04);
            break;
        case "number":
            this.type = Ability.Type.Float;
            this.setFloat32(value, 0x04);
            break;
        }
    }
}

export namespace Ability {
    export enum Type {
        Unset,
        Bool,
        Float,
    }
}
