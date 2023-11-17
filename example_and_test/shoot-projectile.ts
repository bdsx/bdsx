import { Actor, ActorDefinitionIdentifier, ActorType } from "bdsx/bds/actor";
import { BlockSource } from "bdsx/bds/block";
import { Vec3 } from "bdsx/bds/blockpos";
import { ActorCommandSelector } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";

function summonEntity(owner: Actor, identifier: string, source: BlockSource, pos: Vec3): Actor | null {
    const defId = ActorDefinitionIdentifier.constructWith(ActorType.Mob);
    defId.canonicalName.set(identifier);
    defId.fullName = identifier;
    defId.initEvent = "minecraft:entity_created";
    defId.namespace = identifier.split(":")[0];
    defId.identifier = identifier;

    const entity = Actor.summonAt(source, pos, defId, bedrockServer.level.getNewUniqueID(), owner);
    defId.destruct();

    if (!entity) return null;

    return entity;
}

command.register("shoot-projectile", "shooting projectiles (arrow, trident, snowball...)").overload(
    (p, o, out) => {
        const shooters: Actor[] = [];
        if (p.shooter) {
            shooters.push(...p.shooter.newResults(o));
        } else {
            const entity = o.getEntity();
            if (!entity) return out.error("Shooter must be an entity!");

            shooters.push(entity);
        }

        let success = 0;
        for (const entity of shooters) {
            const entityPos = entity.getPosition();
            const projectile = summonEntity(entity, "minecraft:" + p.projectile, entity.getRegion(), Vec3.create(entityPos.x, entityPos.y, entityPos.z));
            if (!projectile) return out.error("Creating projectile entity is failed!");

            projectile.setOwner(entity.getUniqueIdBin());

            const comp = projectile.tryGetComponent("minecraft:projectile");
            if (comp) {
                comp.shoot(projectile, entity);

                success++;
            }
        }

        out.success(`(${success / shooters.length}) entities successfully shoot ${p.projectile}.`);
    },
    {
        projectile: command.enum("shoot-projectile.projectile", "arrow", "thrown_trident", "snowball", "ender_pearl"),
        shooter: [ActorCommandSelector, true],
    },
);
