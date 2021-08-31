import { Actor, ItemActor } from "../minecraft";

declare module "../minecraft" {
    interface ItemActor extends Actor {
        /** @deprecated is Actor constructor */
        constructWith(iLevel:ILevel):void;
        /** @deprecated is Actor constructor */
        constructWith(actorDefinitionGroup:ActorDefinitionGroup|null, actorDefinitionIdentifier:ActorDefinitionIdentifier):void;
    }
}

(ItemActor as any).__proto__ = Actor;
(ItemActor as any).prototype.__proto__ = Actor.prototype;
