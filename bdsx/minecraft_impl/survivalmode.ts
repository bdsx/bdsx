import { GameMode, SurvivalMode } from "../minecraft";

declare module "../minecraft" {
    interface SurvivalMode extends GameMode {
    }
}

(SurvivalMode as any).__proto__ = GameMode;
(SurvivalMode as any).prototype.__proto__ = GameMode.prototype;
