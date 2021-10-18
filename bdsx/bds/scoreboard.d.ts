import { StaticPointer } from "../core";
import { CxxVector } from "../cxxvector";
import { NativeClass } from "../nativeclass";
import { bin64_t, bool_t, CxxString, int32_t, int64_as_float_t, uint32_t } from "../nativetype";
import { Actor, ActorUniqueID } from "./actor";
import type { Player } from "./player";
import minecraft = require('../minecraft');
import enums = require('../enums');
/** @deprecated */
export declare class Scoreboard extends NativeClass {
    sync(id: ScoreboardId, objective: Objective): void;
    addObjective(name: string, displayName: string, criteria: ObjectiveCriteria): Objective;
    /**
     *  @param name currently only 'dummy'
     */
    getCriteria(name: string): ObjectiveCriteria | null;
    getDisplayObjective(displaySlot: DisplaySlot): DisplayObjective | null;
    getObjectiveNames(): string[];
    getObjective(name: string): Objective | null;
    getObjectives(): Objective[];
    getActorScoreboardId(actor: Actor): ScoreboardId;
    getFakePlayerScoreboardId(name: string): ScoreboardId;
    getPlayerScoreboardId(player: Player): ScoreboardId;
    getScoreboardIdentityRef(id: ScoreboardId): ScoreboardIdentityRef;
    protected _getScoreboardIdentityRefs(retstr: CxxVector<ScoreboardIdentityRef>): CxxVector<ScoreboardIdentityRef>;
    getScoreboardIdentityRefs(): ScoreboardIdentityRef[];
    protected _getTrackedIds(retstr: CxxVector<ScoreboardId>): CxxVector<ScoreboardId>;
    getTrackedIds(): ScoreboardId[];
    removeObjective(objective: Objective): boolean;
    clearDisplayObjective(displaySlot: string): Objective | null;
    setDisplayObjective(displaySlot: DisplaySlot, objective: Objective, order: ObjectiveSortOrder): DisplayObjective | null;
    getPlayerScore(id: ScoreboardId, objective: Objective): number | null;
    resetPlayerScore(id: ScoreboardId, objective: Objective): void;
    setPlayerScore(id: ScoreboardId, objective: Objective, value: number): number;
    addPlayerScore(id: ScoreboardId, objective: Objective, value: number): number;
    removePlayerScore(id: ScoreboardId, objective: Objective, value: number): number;
}
/** @deprecated */
export declare const ObjectiveCriteria: typeof minecraft.ObjectiveCriteria;
/** @deprecated */
export declare type ObjectiveCriteria = minecraft.ObjectiveCriteria;
/** @deprecated */
export declare class Objective extends NativeClass {
    name: CxxString;
    displayName: CxxString;
    criteria: ObjectiveCriteria;
    getPlayers(): ScoreboardId[];
    getPlayerScore(id: ScoreboardId): ScoreInfo;
}
export declare class DisplayObjective extends NativeClass {
    objective: Objective | null;
    order: ObjectiveSortOrder;
}
/** @deprecated */
export declare class IdentityDefinition extends NativeClass {
    getEntityId(): ActorUniqueID;
    getPlayerId(): ActorUniqueID;
    getFakePlayerName(): string;
    getIdentityType(): IdentityDefinition.Type;
    getName(): string | null;
}
/** @deprecated */
export declare namespace IdentityDefinition {
    /** @deprecated */
    const Type: typeof minecraft.IdentityDefinition.Type;
    /** @deprecated */
    type Type = minecraft.IdentityDefinition.Type;
}
/** @deprecated */
export declare class ScoreboardId extends NativeClass {
    id: bin64_t;
    idAsNumber: int64_as_float_t;
    identityDef: IdentityDefinition;
}
export declare class ScoreInfo extends NativeClass {
    objective: Objective | null;
    valid: bool_t;
    value: int32_t;
}
/** @deprecated */
export declare class ScoreboardIdentityRef extends NativeClass {
    objectiveReferences: uint32_t;
    scoreboardId: ScoreboardId;
    protected _modifyScoreInObjective(result: StaticPointer, objective: Objective, score: number, action: PlayerScoreSetFunction): boolean;
    modifyScoreInObjective(objective: Objective, score: number, action: PlayerScoreSetFunction): number;
}
/** @deprecated  */
export declare const DisplaySlot: typeof enums.DisplaySlot;
/** @deprecated  */
export declare type DisplaySlot = enums.DisplaySlot;
/** @deprecated */
export declare const ObjectiveSortOrder: typeof minecraft.ObjectiveSortOrder;
/** @deprecated */
export declare type ObjectiveSortOrder = minecraft.ObjectiveSortOrder;
/** @deprecated */
export declare const PlayerScoreSetFunction: typeof minecraft.PlayerScoreSetFunction;
/** @deprecated */
export declare type PlayerScoreSetFunction = minecraft.PlayerScoreSetFunction;
export declare enum ScoreCommandOperator {
    Equals = 1,
    PlusEquals = 2,
    MinusEquals = 3,
    TimesEquals = 4,
    DivideEquals = 5,
    ModEquals = 6,
    MinEquals = 7,
    MaxEquals = 8,
    Swap = 9
}
