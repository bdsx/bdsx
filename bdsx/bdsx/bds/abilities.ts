import { abstract } from "../common";
import { AbstractClass, nativeClass, NativeClass, nativeField, NativeStruct } from "../nativeclass";
import { bool_t, float32_t } from "../nativetype";
import type { CommandPermissionLevel } from "./command";
import type { PlayerPermission } from "./player";

@nativeClass(0x140)
export class Abilities extends AbstractClass {
    getAbility(abilityIndex:AbilitiesIndex):Ability {
        abstract();
    }
    setAbility(abilityIndex:AbilitiesIndex, value:boolean|number):void {
        abstract();
    }
    isFlying(): boolean {
        abstract();
    }

    getFloat(abilityIndex:AbilitiesIndex): number {
        abstract();
    }
    getBool(abilityIndex:AbilitiesIndex): boolean {
        abstract();
    }
    static getAbilityName(abilityIndex:AbilitiesIndex):string {
        abstract();
    }
    static nameToAbilityIndex(name:string):AbilitiesIndex {
        abstract();
    }
}

export enum AbilitiesLayer {
    // TODO: fill
}

@nativeClass(null)
export class LayeredAbilities extends AbstractClass {
    getLayer(layer:AbilitiesLayer):Abilities {
        abstract();
    }
    protected _setAbility(abilityIndex:AbilitiesIndex, value:boolean):void {
        abstract();
    }
    /**
     * Returns the command permission level of the ability owner
     */
    getCommandPermissions():CommandPermissionLevel {
        abstract();
    }
    /**
     * Returns the player permission level of the ability owner
     */
    getPlayerPermissions():PlayerPermission {
        abstract();
    }
    /**
     * Changes the command permission level of the ability owner
     */
    setCommandPermissions(commandPermissionLevel:CommandPermissionLevel):void {
        abstract();
    }
    /**
     * Changes the player permission level of the ability owner
     */
    setPlayerPermissions(playerPermissionLevel:PlayerPermission):void {
        abstract();
    }
    /**
     * Returns the command permission level of the ability owner
     * @deprecated use getCommandPermissions, use the native function name
     */
    getCommandPermissionLevel():CommandPermissionLevel {
        abstract();
    }
    /**
     * Returns the player permission level of the ability owner
     * @deprecated use getPlayerPermissions, use the native function name
     */
    getPlayerPermissionLevel():PlayerPermission {
        abstract();
    }
    /**
     * Changes the command permission level of the ability owner
     * @deprecated use setCommandPermissions, use the native function name
     */
    setCommandPermissionLevel(commandPermissionLevel:CommandPermissionLevel):void {
        abstract();
    }
    /**
     * Changes the player permission level of the ability owner
     * @deprecated use setPlayerPermissions, use the native function name
     */
    setPlayerPermissionLevel(playerPermissionLevel:PlayerPermission):void {
        abstract();
    }
    getAbility(abilityIndex:AbilitiesIndex):Ability;
    getAbility(abilityLayer:AbilitiesLayer, abilityIndex:AbilitiesIndex):Ability;
    getAbility(abilityLayer:AbilitiesLayer|AbilitiesIndex, abilityIndex?:AbilitiesIndex):Ability {
        abstract();
    }

    setAbility(abilityIndex:AbilitiesIndex, value:boolean|number):void {
        abstract();
    }

    isFlying(): boolean {
        abstract();
    }
    getFloat(abilityIndex:AbilitiesIndex): number {
        abstract();
    }
    getBool(abilityIndex:AbilitiesIndex): boolean {
        abstract();
    }
}

export enum AbilitiesIndex {
    Build,
    Mine,
    DoorsAndSwitches,
    OpenContainers,
    AttackPlayers,
    AttackMobs,
    OperatorCommands,
    Teleport,
    /** Both are 8 */
    ExposedAbilityCount,

    Invulnerable = 8,
    Flying,
    MayFly,
    Instabuild,
    Lightning,
    FlySpeed,
    WalkSpeed,
    Muted,
    WorldBuilder,
    NoClip,
    AbilityCount,
}

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
    export enum Type {
        Invalid,
        Unset,
        Bool,
        Float,
    }

    export enum Options {
        None,
        NoSave,
        CommandExposed = 2,
        PermissionsInterfaceExposed = 4,
        WorldbuilderOverrides = 8,

        NoSaveCommandExposed = 3,
        NoSavePermissionsInterfaceExposed = 5,
        CommandExposedPermissionsInterfaceExposed = 6,
        NoSaveCommandExposedPermissionsInterfaceExposed = 7,
        NoSaveWorldbuilderOverrides = 9,
        CommandExposedWorldbuilderOverrides = 10,
        NoSaveCommandExposedWorldbuilderOverrides = 11,
        PermissionsInterfaceExposedWorldbuilderOverrides = 12,
        NoSavePermissionsInterfaceExposedWorldbuilderOverrides = 13,
        CommandExposedPermissionsInterfaceExposedWorldbuilderOverrides = 14,
        All = 15,
    }

    @nativeClass()
    export class Value extends NativeStruct {
        @nativeField(bool_t, {ghost:true})
        boolVal:bool_t;
        @nativeField(float32_t)
        floatVal:float32_t;
    }
}
