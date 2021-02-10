
declare global
{
    interface MinecraftParticleEffectMap {
        /**
         * Beacon effects
         */
        "minecraft:mobspellambient": void;
        /**
         * Attacking a villager in a village
         */
        "minecraft:villagerangry": void;
        /**
         * Breaking blocks, sprinting, iron golems walking
         */
        "minecraft:blockbreak": void;
        /**
         * Breaking armor stands, falling
         */
        "minecraft:blockdust": void;
        /**
         * Entities in water, guardian laser beams, fishing
         */
        "minecraft:bubble": void;
        /**
         * After jumping into water while on fire
         */
        "minecraft:evaporation": void;
        /**
         * Critical hits, bows, evoker fangs
         */
        "minecraft:crit": void;
        /**
         * 	An ender dragon's breath and dragon fireballs
         */
        "minecraft:dragonbreath": void;
        /**
         * Dripping lava through blocks
         */
        "minecraft:driplava": void;
        /**
         * 	Dripping water through blocks, wet sponges, leaves when raining
         */
        "minecraft:dripwater": void;
        /**
         * Redstone ore, powered redstone dust, redstone torches, powered redstone repeaters
         */
        "minecraft:reddust": void;
        /**
         * Splash potions, lingering potions, bottles o' enchanting, evokers.
         */
        "minecraft:spell": void;
        /**
         * Elder Gardians
         * note: wiki has a question mark
         */
        "minecraft:mobappearance": void;
        /**
         * From bookshelves near an enchanting table.
         */
        "minecraft:enchantingtable": void;
        /**
         * End rods, shulker bullets.
         */
        "minecraft:endrod": void;
        /**
         * 	Status effects, lingering potions, tipped arrows, trading, withered armor (linger potion particles decrease when the "minimal" particle setting is used) |
         */
        "minecraft:mobspell": void;
        /**
         * Explosions, ghast fireballs, wither skulls, ender dragon death, shearing mooshrooms.
         */
        "minecraft:largeexplode": void;
        /**
         * Floating sand, gravel, concrete powder, and anvils.
         */
        "minecraft:fallingdust": void;
        /**
         * Firework rocket trail and explosion (trail is not shown when the "minimal" particle setting is used), when dolphins track shipwrecks and underwater ruins |
         */
        "minecraft:fireworksspark": void;
        /**
         * Fishing
         */
        "minecraft:waterwake": void;
        /**
         * 	Torches, furnaces, magma cubes, spawners.
         */
        "minecraft:flame": void;
        /**
         * 	Bone mealing a crop, trading with villagers, feeding baby animals, walking or jumping on turtle eggs.
         */
        "minecraft:villagerhappy": void;
        /**
         * Breeding and taming animals.
         */
        "minecraft:heart": void;
        /**
         * Explosions, ender dragon death.
         */
        "minecraft:hugeexplosion": void;
        /**
         * Instant health/damage splash and lingering potions, spectral arrows.
         */
        "minecraft:mobspellinstantaneous": void;
        /**
         * 	Eating, thrown eggs, splash potions, eyes of ender, breaking tools.
         */
        "minecraft:iconcrack": void;
        /**
         * Jumping slimes.
         */
        "minecraft:slime": void;
        /**
         * Thrown snowballs, creating withers, creating iron golems.
         */
        "minecraft:snowballpoof": void;
        /**
         * Fire, minecart with furnace, blazes, water flowing into lava, lava flowing into water.
         */
        "minecraft:largesmoke": void;
        /**
         * Lava
         */
        "minecraft:lava": void;
        /**
         * Burning entities, blazes for example.
         */
        "minecraft:mobflame": void;
        /**
         * Mycelium blocks.
         */
        "minecraft:townaura": void;
        /**
         * Activated Conduits.
         */
        "minecraft:nautilus": void;
        /**
         * Emitted from note blocks and jukeboxes
         */
        "minecraft:note": void;
        /**
         * Explosions, death of mobs, mobs spawned from a spawner, silverfish infesting blocks.
         */
        "minecraft:explode": void;
        /**
         * 	Nether portals, endermen, endermites, ender pearls, eyes of ender, ender chests, dragon eggs, teleporting from eating chorus fruits, end gateway portals.
         */
        "minecraft:portal": void;
        /**
         * Rain
         */
        "minecraft:rainsplash": void;
        /**
         * 	Torches, primed TNT, droppers, dispensers, end portals, brewing stands, spawners, furnaces, ghast fireballs, wither skulls, taming, withers, lava (when raining), placing an eye of ender in an end portal frame, redstone torches burning out.
         */
        "minecraft:smoke": void;
        /**
         * Entities in water, wolves shaking off after swimming, boats.
         */
        "minecraft:watersplash": void;
        /**
         * Produced by squids when attacked
         */
        "minecraft:ink": void;
        /**
         * ?
         */
        "minecraft:terrain": void;
        /**
         * Activated totem of undying.
         */
        "minecraft:totem": void;
        /**
         * ?
         */
        "minecraft:trackingemitter": void;
        /**
         * Witches.
         */
        "minecraft:witchspell": void;
    }

    type MinecraftParticleEffect = keyof MinecraftParticleEffectMap;
}

export {};
