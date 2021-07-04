import { abstract } from "../common";
import { CxxVector } from "../cxxvector";
import { nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, int32_t, int64_as_float_t } from "../nativetype";
import { Player } from "./player";

export class Scoreboard extends NativeClass {
    protected _getObjectiveNames():CxxVector<CxxString> {
        abstract();
    }

    protected _getObjectives():CxxVector<Objective> {
        abstract();
    }

    addObjective(name:CxxString, displayName:CxxString, criteria:ObjectiveCriteria):Objective {
        abstract();
    }

    /**
     *  @param name currently only 'dummy'
     */
    getCriteria(name:CxxString):ObjectiveCriteria|null {
        abstract();
    }

    getDisplayObjective(displaySlot:DisplaySlot):DisplayObjective|null {
        abstract();
    }

    getObjectiveNames():string[] {
        return this._getObjectiveNames().toArray();
    }

    getObjective(name:CxxString):Objective|null {
        abstract();
    }

    getObjectives():Objective[] {
        return this._getObjectives().toArray();
    }

    removeObjective(objective:Objective):boolean {
        abstract();
    }

    clearDisplayObjective(displaySlot:CxxString):Objective|null {
        abstract();
    }

    setDisplayObjective(displaySlot:DisplaySlot, objective:Objective, order:ObjectiveSortOrder):DisplayObjective|null {
        abstract();
    }
}

@nativeClass(null)
export class Objective extends NativeClass {
    @nativeField(CxxString, 0x40)
    name:CxxString;
    @nativeField(CxxString, 0x60)
    displayName:CxxString;
    protected _getPlayers():CxxVector<ScoreboardId> {
        abstract();
    }

    getPlayers():ScoreboardId[] {
        return this._getPlayers().toArray();
    }

    // getPlayerScore(id:ScoreboardId):ScoreInfo {
    //     abstract();
    // }

    // getPlayerScoreId(player:Player):ScoreboardId {
    //     abstract();
    // }
}

export class DisplayObjective extends NativeClass {
}

export class ObjectiveCriteria extends NativeClass {
}

@nativeClass(null)
export class ScoreboardId extends NativeClass {
    @nativeField(bin64_t)
    id:bin64_t;
    @nativeField(int64_as_float_t, 0)
    idAsNumber:int64_as_float_t;
    @nativeField(bin64_t)
    identityDef:bin64_t;
}

@nativeClass(null)
export class ScoreInfo extends NativeClass {
    @nativeField(Objective.ref())
    objective:Objective;
    @nativeField(bool_t, 0x08)
    valid:bool_t;
    @nativeField(int32_t, 0x0C)
    value:int32_t;
    @nativeField(ScoreboardId.ref(), 0x10)
    id:ScoreboardId;
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
