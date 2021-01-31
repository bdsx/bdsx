
declare global
{
    type MinecraftParticleEffect =
    /**
     * Beacon effects
     */
    "minecraft:mobspellambient" |
    /**
     * Attacking a villager in a village
     */
    "minecraft:villagerangry" |
    /**
     * Breaking blocks, sprinting, iron golems walking
     */
    "minecraft:blockbreak" |
    /**
     * Breaking armor stands, falling
     */
    "minecraft:blockdust" |
    /**
     * Entities in water, guardian laser beams, fishing
     */
    "minecraft:bubble" |
    /**
     * After jumping into water while on fire
     */
    "minecraft:evaporation" |
    /**
     * Critical hits, bows, evoker fangs
     */
    "minecraft:crit" |
    /**
     * 	An ender dragon's breath and dragon fireballs
     */
    "minecraft:dragonbreath" |
    /**
     * Dripping lava through blocks
     */
    "minecraft:driplava" |
    /**
     * 	Dripping water through blocks, wet sponges, leaves when raining
     */
    "minecraft:dripwater" |
    /**
     * Redstone ore, powered redstone dust, redstone torches, powered redstone repeaters
     */
    "minecraft:reddust" |
    /**
     * Splash potions, lingering potions, bottles o' enchanting, evokers.
     */
    "minecraft:spell" |
    /**
     * Elder Gardians
     * note: wiki has a question mark
     */
    "minecraft:mobappearance" |
    /**
     * From bookshelves near an enchanting table.
     */
    "minecraft:enchantingtable" |
    /**
     * End rods, shulker bullets.
     */
    "minecraft:endrod" |
    /**
     * 	Status effects, lingering potions, tipped arrows, trading, withered armor (linger potion particles decrease when the "minimal" particle setting is used) |
     */
    "minecraft:mobspell" |
    /**
     * Explosions, ghast fireballs, wither skulls, ender dragon death, shearing mooshrooms.
     */
    "minecraft:largeexplode" |
    /**
     * Floating sand, gravel, concrete powder, and anvils.
     */
    "minecraft:fallingdust" |
    /**
     * Firework rocket trail and explosion (trail is not shown when the "minimal" particle setting is used), when dolphins track shipwrecks and underwater ruins |
     */
    "minecraft:fireworksspark" |
    /**
     * Fishing
     */
    "minecraft:waterwake" |
    /**
     * 	Torches, furnaces, magma cubes, spawners.
     */
    "minecraft:flame" |
    /**
     * 	Bone mealing a crop, trading with villagers, feeding baby animals, walking or jumping on turtle eggs.
     */
    "minecraft:villagerhappy" |
    /**
     * Breeding and taming animals.
     */
    "minecraft:heart" |
    /**
     * Explosions, ender dragon death.
     */
    "minecraft:hugeexplosion" |
    /**
     * Instant health/damage splash and lingering potions, spectral arrows.
     */
    "minecraft:mobspellinstantaneous" |
    /**
     * 	Eating, thrown eggs, splash potions, eyes of ender, breaking tools.
     */
    "minecraft:iconcrack" |
    /**
     * Jumping slimes.
     */
    "minecraft:slime" |
    /**
     * Thrown snowballs, creating withers, creating iron golems.
     */
    "minecraft:snowballpoof" |
    /**
     * Fire, minecart with furnace, blazes, water flowing into lava, lava flowing into water.
     */
    "minecraft:largesmoke" |
    /**
     * Lava
     */
    "minecraft:lava" |
    /**
     * Burning entities, blazes for example.
     */
    "minecraft:mobflame" |
    /**
     * Mycelium blocks.
     */
    "minecraft:townaura" |
    /**
     * Activated Conduits.
     */
    "minecraft:nautilus" |
    /**
     * Emitted from note blocks and jukeboxes
     */
    "minecraft:note" |
    /**
     * Explosions, death of mobs, mobs spawned from a spawner, silverfish infesting blocks.
     */
    "minecraft:explode" |
    /**
     * 	Nether portals, endermen, endermites, ender pearls, eyes of ender, ender chests, dragon eggs, teleporting from eating chorus fruits, end gateway portals.
     */
    "minecraft:portal" |
    /**
     * Rain
     */
    "minecraft:rainsplash" |
    /**
     * 	Torches, primed TNT, droppers, dispensers, end portals, brewing stands, spawners, furnaces, ghast fireballs, wither skulls, taming, withers, lava (when raining), placing an eye of ender in an end portal frame, redstone torches burning out.
     */
    "minecraft:smoke" |
    /**
     * Entities in water, wolves shaking off after swimming, boats.
     */
    "minecraft:watersplash" |
    /**
     * Produced by squids when attacked
     */
    "minecraft:ink" |
    /**
     * ?
     */
    "minecraft:terrain" |
    /**
     * Activated totem of undying.
     */
    "minecraft:totem" |
    /**
     * ?
     */
    "minecraft:trackingemitter" |
    /**
     * Witches.
     */
    "minecraft:witchspell";
}

export {};
