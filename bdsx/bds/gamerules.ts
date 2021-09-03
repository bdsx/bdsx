import { abstract } from "../common";
import { NativeClass } from "../nativeclass";
import { bool_t } from "../nativetype";
import minecraft = require('../minecraft');

export enum GameRuleId {
    CommandBlockOutput,
    DoDaylightCycle,
    DoEntityDrops,
    DoFireTick,
    DoMobLoot,
    DoMobSpawning,
    DoTileDrops,
    DoWeatherCycle,
    DrowningDamage,
    FallDamage,
    FireDamage,
    KeepInventory,
    MobGriefing,
    Pvp,
    ShowCoordinates,
    NaturalRegeneration,
    TntExplodes,
    SendCommandFeedback,
    MaxCommandChainLength,
    DoInsomnia,
    CommandBlocksEnabled,
    RandomTickSpeed,
    DoImmediateRespawn,
    ShowDeathMessages,
    FunctionCommandLimit,
    SpawnRadius,
    ShowTags,
    FreezeDamage,
}

export class GameRules extends NativeClass {
    getRule(id:GameRuleId):GameRule {
        abstract();
    }
    hasRule(id:GameRuleId):boolean {
        abstract();
    }
    setRule(id:GameRuleId, value:boolean|number, type?:GameRule.Type):void {
        this.getRule(id).setValue(value, type);
    }

    static nameToGameRuleIndex(name:string):number {
        abstract();
    }
}

export class GameRule extends NativeClass {
    shouldSave:bool_t;
    type:GameRule.Type;
    value:GameRule.Value;

    getBool():boolean {
        abstract();
    }
    getInt():number {
        abstract();
    }
    getFloat():number {
        abstract();
    }
    setBool(value:boolean):void {
        this.type = GameRule.Type.Bool;
        this.value.boolVal = value;
    }
    setInt(value:number):void {
        this.type = GameRule.Type.Int;
        this.value.intVal = value;
    }
    setFloat(value:number):void {
        this.type = GameRule.Type.Float;
        this.value.floatVal = value;
    }
    getValue():boolean|number|undefined {
        switch (this.type) {
        case GameRule.Type.Invalid:
            return undefined;
        case GameRule.Type.Bool:
            return this.getBool();
        case GameRule.Type.Int:
            return this.getInt();
        case GameRule.Type.Float:
            return this.getFloat();
        }
    }
    setValue(value:boolean|number, type?:GameRule.Type):void {
        switch (type) {
        case GameRule.Type.Bool:
            this.setBool(value as boolean);
            break;
        case GameRule.Type.Int:
            this.setInt(value as number);
            break;
        case GameRule.Type.Float:
            this.setFloat(value as number);
            break;
        default:
            switch (typeof value) {
            case "boolean":
                this.setBool(value);
                break;
            case "number":
                if (Number.isInteger(value)) {
                    this.setInt(value);
                } else {
                    this.setFloat(value);
                }
                break;
            }
        }
    }
}

export namespace GameRule {
    /** @deprecated */
    export const Type = minecraft.GameRule.Type;
    /** @deprecated */
    export type Type = minecraft.GameRule.Type;
    /** @deprecated */
    export const Value = minecraft.GameRule.Value;
    /** @deprecated */
    export type Value = minecraft.GameRule.Value;
}
