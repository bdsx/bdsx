import { NativeClass } from "bdsx/nativeclass";
import { Actor } from "./actor";

export class GameMode extends NativeClass {
    actor:Actor;
}

export class SurvivalMode extends GameMode {
}
