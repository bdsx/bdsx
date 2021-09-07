import { bin } from "../bin";
import { abstract } from "../common";
import { AllocatedPointer, StaticPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, int32_t, int64_as_float_t, uint32_t, uint8_t } from "../nativetype";
import { Actor, ActorUniqueID } from "./actor";
import type { Player } from "./player";
import minecraft = require('../minecraft');
import enums = require('../enums');

/** @deprecated */
export class Scoreboard extends NativeClass {
    sync(id:ScoreboardId, objective:Objective):void {
        abstract();
    }

    addObjective(name:string, displayName:string, criteria:ObjectiveCriteria):Objective {
        abstract();
    }

    /**
     *  @param name currently only 'dummy'
     */
    getCriteria(name:string):ObjectiveCriteria|null {
        abstract();
    }

    getDisplayObjective(displaySlot:DisplaySlot):DisplayObjective|null {
        abstract();
    }

    getObjectiveNames():string[] {
        abstract();
    }

    getObjective(name:string):Objective|null {
        abstract();
    }

    getObjectives():Objective[] {
        abstract();
    }

    getActorScoreboardId(actor:Actor):ScoreboardId {
        abstract();
    }

    getFakePlayerScoreboardId(name:string):ScoreboardId {
        abstract();
    }

    getPlayerScoreboardId(player:Player):ScoreboardId {
        abstract();
    }

    getScoreboardIdentityRef(id:ScoreboardId):ScoreboardIdentityRef {
        abstract();
    }

    protected _getScoreboardIdentityRefs(retstr:CxxVector<ScoreboardIdentityRef>):CxxVector<ScoreboardIdentityRef> {
        abstract();
    }

    getScoreboardIdentityRefs():ScoreboardIdentityRef[] {
        const arr =  this._getScoreboardIdentityRefs(CxxVector.make(ScoreboardIdentityRef).construct());
        const retval = arr.toArray();
        arr.destruct();
        return retval;
    }

    protected _getTrackedIds(retstr:CxxVector<ScoreboardId>):CxxVector<ScoreboardId> {
        abstract();
    }

    getTrackedIds():ScoreboardId[] {
        const arr =  this._getTrackedIds(CxxVector.make(ScoreboardId).construct());
        const retval = arr.toArray();
        arr.destruct();
        return retval;
    }

    removeObjective(objective:Objective):boolean {
        abstract();
    }

    clearDisplayObjective(displaySlot:string):Objective|null {
        abstract();
    }

    setDisplayObjective(displaySlot:DisplaySlot, objective:Objective, order:ObjectiveSortOrder):DisplayObjective|null {
        abstract();
    }

    getPlayerScore(id:ScoreboardId, objective:Objective):number|null {
        const score = objective.getPlayerScore(id);
        if (score.valid) {
            const retval = score.value;
            score.destruct();
            return retval;
        }
        score.destruct();
        return null;
    }

    resetPlayerScore(id:ScoreboardId, objective:Objective):void {
        abstract();
    }

    setPlayerScore(id:ScoreboardId, objective:Objective, value:number):number {
        const retval = this.getScoreboardIdentityRef(id).modifyScoreInObjective(objective, value, PlayerScoreSetFunction.Set);
        this.sync(id, objective);
        return retval;
    }

    addPlayerScore(id:ScoreboardId, objective:Objective, value:number):number {
        const retval = this.getScoreboardIdentityRef(id).modifyScoreInObjective(objective, value, PlayerScoreSetFunction.Add);
        this.sync(id, objective);
        return retval;
    }

    removePlayerScore(id:ScoreboardId, objective:Objective, value:number):number {
        const retval = this.getScoreboardIdentityRef(id).modifyScoreInObjective(objective, value, PlayerScoreSetFunction.Subtract);
        this.sync(id, objective);
        return retval;
    }
}

/** @deprecated */
export const ObjectiveCriteria = minecraft.ObjectiveCriteria;
/** @deprecated */
export type ObjectiveCriteria = minecraft.ObjectiveCriteria;

/** @deprecated */
@nativeClass(null)
export class Objective extends NativeClass {
    @nativeField(CxxString, 0x40)
    name:CxxString;
    @nativeField(CxxString)
    displayName:CxxString;
    @nativeField(ObjectiveCriteria.ref())
    criteria:ObjectiveCriteria;

    getPlayers():ScoreboardId[] {
        abstract();
    }

    getPlayerScore(id:ScoreboardId):ScoreInfo {
        abstract();
    }
}

@nativeClass(null)
export class DisplayObjective extends NativeClass {
    @nativeField(Objective.ref())
    objective:Objective|null;
    @nativeField(uint8_t)
    order:ObjectiveSortOrder;
}

/** @deprecated */
@nativeClass(null)
export class IdentityDefinition extends NativeClass {
    getEntityId():ActorUniqueID {
        abstract();
    }

    getPlayerId():ActorUniqueID {
        abstract();
    }

    getFakePlayerName():string {
        abstract();
    }

    getIdentityType():IdentityDefinition.Type {
        abstract();
    }

    getName():string|null {
        switch (this.getIdentityType()) {
        case IdentityDefinition.Type.Entity: {
            // BDSX reads int64 as uint64, so we have to manually handle it since ActorUniqueID is signed and negative
            const a = bin.sub(bin.make64(4294967295, 4294967295), this.getEntityId());
            const b = bin.add(a, bin.make64(1, 0));
            return "-" + bin.toString(b);
        }
        case IdentityDefinition.Type.Player: {
            const actor = Actor.fromUniqueIdBin(this.getPlayerId());
            if (actor) {
                return actor.getName();
            } else {
                // Player Offline
                return null;
            }
        }
        case IdentityDefinition.Type.FakePlayer:
            return this.getFakePlayerName();
        default:
            return null;
        }
    }
}

/** @deprecated */
export namespace IdentityDefinition {
    /** @deprecated */
    export const Type = minecraft.IdentityDefinition.Type;
    /** @deprecated */
    export type Type = minecraft.IdentityDefinition.Type;
}

/** @deprecated */
@nativeClass()
export class ScoreboardId extends NativeClass {
    @nativeField(bin64_t)
    id:bin64_t;
    @nativeField(int64_as_float_t, 0)
    idAsNumber:int64_as_float_t;
    @nativeField(IdentityDefinition.ref())
    identityDef:IdentityDefinition;
}

@nativeClass()
export class ScoreInfo extends NativeClass {
    @nativeField(Objective.ref())
    objective:Objective|null;
    @nativeField(bool_t)
    valid:bool_t;
    @nativeField(int32_t, 0x0C)
    value:int32_t;
}

/** @deprecated */
@nativeClass()
export class ScoreboardIdentityRef extends NativeClass {
    @nativeField(uint32_t)
    objectiveReferences:uint32_t;
    @nativeField(ScoreboardId, 0x08)
    scoreboardId:ScoreboardId;

    protected _modifyScoreInObjective(result:StaticPointer, objective:Objective, score:number, action:PlayerScoreSetFunction):boolean {
        abstract();
    }

    modifyScoreInObjective(objective:Objective, score:number, action:PlayerScoreSetFunction):number {
        const result = new AllocatedPointer(4);
        this._modifyScoreInObjective(result, objective, score, action);
        const retval = result.getInt32();
        return retval;
    }
}

/** @deprecated  */
export const DisplaySlot = enums.DisplaySlot;
/** @deprecated  */
export type DisplaySlot = enums.DisplaySlot;

/** @deprecated */
export const ObjectiveSortOrder = minecraft.ObjectiveSortOrder;
/** @deprecated */
export type ObjectiveSortOrder = minecraft.ObjectiveSortOrder;
/** @deprecated */
export const PlayerScoreSetFunction = minecraft.PlayerScoreSetFunction;
/** @deprecated */
export type PlayerScoreSetFunction = minecraft.PlayerScoreSetFunction;

export enum ScoreCommandOperator {
    Equals = 1,
    PlusEquals,
    MinusEquals,
    TimesEquals,
    DivideEquals,
    ModEquals,
    MinEquals,
    MaxEquals,
    Swap,
}
