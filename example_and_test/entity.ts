import { Actor, ActorDefinitionIdentifier } from "bdsx/bds/actor";
import { command } from "bdsx/command";

/**
 * Entity for spawning an entity
 */
command.register("summon-entity", "summon an entity on current position").overload(
    (params, origin, output) => {
        const caller = origin.getEntity();
        if (!caller?.isPlayer()) return;
        const level = caller.getLevel();
        const identifier = ActorDefinitionIdentifier.constructWith(params.type as string);
        const entity = Actor.summonAt(caller.getRegion(), caller.getFeetPos(), identifier, level.getNewUniqueID());
        identifier.destruct();
        if (entity === null) {
            output.error("Can't spawn the entity");
            return;
        }
        output.success("Summoned an entity: §e" + params.type);
    },
    {
        type: command.rawEnum("EntityType"),
    },
);
