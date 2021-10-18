import { bool_t, Type } from "../nativetype";
declare module '../minecraft' {
    interface Mob extends Actor {
        /** @deprecated is Actor constructor */
        constructWith(iLevel: ILevel): void;
        /** @deprecated is Actor constructor */
        constructWith(actorDefinitionGroup: ActorDefinitionGroup | null, actorDefinitionIdentifier: ActorDefinitionIdentifier): void;
        hasComponent(T0: Type<ProjectileComponent>): () => bool_t;
    }
}
