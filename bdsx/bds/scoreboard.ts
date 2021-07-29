import { abstract } from "../common";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, int32_t, int64_as_float_t, uint32_t, uint8_t } from "../nativetype";
import { Actor } from "./actor";
import type { Player } from "./player";

export class Scoreboard extends NativeClass {
    // protected _modifyPlayerScore(success:boolean, id:ScoreboardId, objective:Objective, value:number, action:PlayerScoreSetFunction):number {
    //     abstract();
    // }

    // sync(id:ScoreboardId, objective:Objective):void {
    //     abstract();
    // }

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

    removeObjective(objective:Objective):boolean {
        abstract();
    }

    clearDisplayObjective(displaySlot:string):Objective|null {
        abstract();
    }

    setDisplayObjective(displaySlot:DisplaySlot, objective:Objective, order:ObjectiveSortOrder):DisplayObjective|null {
        abstract();
    }
    resetPlayerScore(id:ScoreboardId, objective:Objective):void {
        abstract();
    }
    // setPlayerScore(id:ScoreboardId, objective:Objective, value:number):number {
    //     return this._modifyPlayerScore(false, id, objective, value, PlayerScoreSetFunction.Set);
    // }
    // addPlayerScore(id:ScoreboardId, objective:Objective, value:number):number {
    //     return this._modifyPlayerScore(false, id, objective, value, PlayerScoreSetFunction.Add);
    // }
    // removePlayerScore(id:ScoreboardId, objective:Objective, value:number):number {
    //     return this._modifyPlayerScore(false, id, objective, value, PlayerScoreSetFunction.Subtract);
    // }
}

@nativeClass(null)
export class ObjectiveCriteria extends NativeClass {
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(bool_t)
    readOnly:bool_t;
    @nativeField(uint8_t)
    renderType:uint8_t;
}

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

@nativeClass()
export class ScoreboardId extends NativeClass {
    @nativeField(bin64_t)
    id:bin64_t;
    @nativeField(int64_as_float_t, 0)
    idAsNumber:int64_as_float_t;
    @nativeField(bin64_t)
    identityDef:bin64_t;
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


@nativeClass()
export class ScoreboardIdentityRef extends NativeClass {
    @nativeField(uint32_t)
    objectiveReferences:uint32_t;
    @nativeField(ScoreboardId.ref(), 0x08)
    scoreboardId:ScoreboardId;

    // modifyScoreInObjective(result:number, objective:Objective, score:number, action:PlayerScoreSetFunction):boolean {
    //     abstract();
    // }
}

export enum DisplaySlot {
    BelowName = "belowname",
    List = "list",
    Sidebar = "sidebar",
}

export enum ObjectiveSortOrder {
    Ascending,
    Descending,
}

export enum PlayerScoreSetFunction {
    Set,
    Add,
    Subtract,
}

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
