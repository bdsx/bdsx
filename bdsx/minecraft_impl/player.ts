import { DimensionId } from "../enums";
import { Actor, Player } from "../minecraft";

declare module "../minecraft" {
    interface Player extends Actor {
        abilities:Abilities;
        respawnPosition:BlockPos;
        respawnDimension:DimensionId;
        deviceId:string;

        /** @deprecated is Actor constructor */
        constructWith(iLevel:ILevel):void;
        /** @deprecated is Actor constructor */
        constructWith(actorDefinitionGroup:ActorDefinitionGroup|null, actorDefinitionIdentifier:ActorDefinitionIdentifier):void;

        teleportTo(position:Vec3, shouldStopRiding:boolean, cause:number, sourceEntityType:number):void;
        getPlayerGameType():GameType;
    }
}

(Player as any).__proto__ = Actor;
(Player as any).prototype.__proto__ = Actor.prototype;
