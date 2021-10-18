declare module "../minecraft" {
    interface ItemActor extends Actor {
        /** @deprecated is Actor constructor */
        constructWith(iLevel: ILevel): void;
        /** @deprecated is Actor constructor */
        constructWith(actorDefinitionGroup: ActorDefinitionGroup | null, actorDefinitionIdentifier: ActorDefinitionIdentifier): void;
    }
}
export {};
