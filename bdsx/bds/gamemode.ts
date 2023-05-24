import { NativeClass } from "../nativeclass";
import type { Player } from "./player";

export class GameMode extends NativeClass {
    actor: Player;
}

export class SurvivalMode extends GameMode {}
