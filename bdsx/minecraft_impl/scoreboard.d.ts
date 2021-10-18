import { DisplaySlot } from "../enums";
declare module "../minecraft" {
    interface Scoreboard {
        sync(id: ScoreboardId, objective: Objective): void;
        addObjective(name: string, displayName: string, criteria: ObjectiveCriteria): Objective;
        /**
         *  @param name currently only 'dummy'
         */
        getCriteria(name: string): ObjectiveCriteria | null;
        getDisplayObjective(displaySlot: DisplaySlot): DisplayObjective | null;
        getObjective(name: string): Objective | null;
        /**
         * @deprecated use getScoreboardId, follow original name
         */
        getActorScoreboardId(actor: Actor): ScoreboardId;
        /**
         * @deprecated use getScoreboardId, follow original name
         */
        getFakePlayerScoreboardId(name: string): ScoreboardId;
        /**
         * @deprecated use getScoreboardId, follow original name
         */
        getPlayerScoreboardId(player: Player): ScoreboardId;
        removeObjective(objective: Objective): boolean;
        clearDisplayObjective(displaySlot: string): Objective | null;
        setDisplayObjective(displaySlot: DisplaySlot, objective: Objective, order: ObjectiveSortOrder): DisplayObjective | null;
        resetPlayerScore(id: ScoreboardId, objective: Objective): void;
        getPlayerScore(id: ScoreboardId, objective: Objective): number | null;
        setPlayerScore(id: ScoreboardId, objective: Objective, value: number): number | null;
        addPlayerScore(id: ScoreboardId, objective: Objective, value: number): number | null;
        removePlayerScore(id: ScoreboardId, objective: Objective, value: number): number | null;
    }
}
