import { Objective, ObjectiveCriteria, ScoreboardIdentityRef } from "../bds/scoreboard";
interface IQueryRegenerateEvent {
    motd: string;
    levelname: string;
    currentPlayers: number;
    maxPlayers: number;
    isJoinableThroughServerScreen: boolean;
}
/** @deprecated */
export declare class QueryRegenerateEvent implements IQueryRegenerateEvent {
    motd: string;
    levelname: string;
    currentPlayers: number;
    maxPlayers: number;
    isJoinableThroughServerScreen: boolean;
    constructor(motd: string, levelname: string, currentPlayers: number, maxPlayers: number, isJoinableThroughServerScreen: boolean);
}
interface IScoreResetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
}
/** @deprecated */
export declare class ScoreResetEvent implements IScoreResetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective);
}
interface IScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    score: number;
}
/** @deprecated */
export declare class ScoreSetEvent implements IScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    /** The score to be set */
    score: number;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective, 
    /** The score to be set */
    score: number);
}
/** @deprecated */
export declare class ScoreAddEvent extends ScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    /** The score to be added */
    score: number;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective, 
    /** The score to be added */
    score: number);
}
/** @deprecated */
export declare class ScoreRemoveEvent extends ScoreSetEvent {
    identityRef: ScoreboardIdentityRef;
    objective: Objective;
    /** The score to be removed */
    score: number;
    constructor(identityRef: ScoreboardIdentityRef, objective: Objective, 
    /** The score to be removed */
    score: number);
}
interface IObjectiveCreateEvent {
    name: string;
    displayName: string;
    criteria: ObjectiveCriteria;
}
/** @deprecated */
export declare class ObjectiveCreateEvent implements IObjectiveCreateEvent {
    name: string;
    displayName: string;
    criteria: ObjectiveCriteria;
    constructor(name: string, displayName: string, criteria: ObjectiveCriteria);
}
export {};
