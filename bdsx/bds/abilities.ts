import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bool_t, float32_t } from "../nativetype";
import type { CommandPermissionLevel } from "./command";
import type { PlayerPermission } from "./player";
import minecraft = require('../minecraft');

@nativeClass(0x140)
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

    static getAbilityName(abilityIndex:AbilitiesIndex):string {
        abstract();
    }
    static nameToAbilityIndex(name:string):AbilitiesIndex {
        abstract();
    }
}

/** @deprecated */
export const AbilitiesIndex = minecraft.AbilitiesIndex;
/** @deprecated */
export type AbilitiesIndex = minecraft.AbilitiesIndex;

export class Ability extends NativeClass {
    type:Ability.Type;
    value:Ability.Value;
    options:Ability.Options;

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
            return this.getBool();
        case Ability.Type.Float:
            return this.getFloat();
        }
    }
    setValue(value:boolean|number):void {
        switch (typeof value) {
        case "boolean":
            this.setBool(value);
            break;
        case "number":
            this.setFloat(value);
            break;
        }
    }
}

export namespace Ability {
    /** @deprecated */
    export const Type = minecraft.Ability.Type;
    /** @deprecated */
    export type Type = minecraft.Ability.Type;
    /** @deprecated */
    export const Options = minecraft.Ability.Options;
    /** @deprecated */
    export type Options = minecraft.Ability.Options;

    @nativeClass()
    export class Value extends NativeClass {
        @nativeField(bool_t, {ghost:true})
        boolVal:bool_t;
        @nativeField(float32_t)
        floatVal:float32_t;
    }
}
