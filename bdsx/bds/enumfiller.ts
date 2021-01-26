
namespace bedrock_types
{
    export enum MinecraftComponent {
        /**
         * This component represents the armor contents of an entity. The component contains an array of ItemStack JS API Objects representing each slot in the armor container. NOTE: Currently items and containers are read-only. Slots are ordered from head to feet.
         */
        ArmorContainer = "minecraft:armor_container",
        /**
         * This component controls the Attack Damage attribute from the entity. It allows you to change the current minimum and maximum values. Once the changes are applied, the current attack of the entity will be reset to the minimum specified. With the minimum and maximum changed to the values specified. Any buffs or debuffs will be left intact.
         */
        Attack = "minecraft:attack",
        /**
         * Controls the collision box of the entity. When changes to the component are applied the entity's collision box is immediately updated to reflect the new dimensions. WARNING: If the change of the collision box dimensions would cause the entity to be inside a block, the entity might become stuck there and start suffocating.
         */
        CollisionBox = "minecraft:collision_box",
        /**
         * Defines an array of damages and how the entity reacts to them - including whether the entity ignores that damage or not. Currently Minecraft triggers can't be properly serialized so any existing triggers will be completely replaced when applyComponentChanges().
         */
        DamageSensor = "minecraft:damage_sensor",
        /**
         * Defines the loot table the entity uses to defines its equipment. Once the changes are applied, the equipment is re-rolled and a new set of equipment is chosen for the entity.
         */
        Equipment = "minecraft:equipment",
        /**
         * Defines how many and what items the entity can be equipped with.
         */
        Equippable = "minecraft:equippable",
        /**
         * Controls the entity's explosion, timer until the explosion, and whether the timer is counting down or not.
         */
        Explode = "minecraft:explode",
        /**
         * This component represents the contents of an entity's hands. The component contains an array of ItemStack JS API Objects representing each slot in the hand container. NOTE: Currently items and containers are read-only. Slot 0 is main-hand Slot 1 is off-hand.
         */
        HandContainer = "minecraft:hand_container",
        /**
         * Defines how the entity can be healed by the player. This doesn't control how much health the entity can have; you must use the Health component for that instead.
         */
        Healable = "minecraft:healable",
        /**
         * Defines the current and maximum possible health of the entity. Upon applying the component back to the entity the health will change. If it reaches 0 or below the entity will die.
         */
        Health = "minecraft:health",
        /**
         * This component represents the hotbar contents of a player. The component contains an array of ItemStack JS API Objects representing each slot in the hotbar. NOTE: Currently items and containers are read-only. Slots are ordered left to right.
         */
        HotbarContainer = "minecraft:hotbar_container",
        /**
         * Defines the ways the player can interact with the entity to which this component is applied.
         */
        Interact = "minecraft:interact",
        /**
         * Defines the entity's inventory (size, restrictions, etc.). Currently this does not allow changing the entity's inventory contents.
         */
        Inventory = "minecraft:inventory",
        /**
         * This component represents the inventory contents of an entity. The component contains an array of ItemStack JS API Objects representing each slot in the inventory. NOTE: Currently items and containers are read-only.Slot 0-8 is the hotbar, 9-16 is the top row of the player's inventory, 17-24 is the middle row, 25-32 is the bottom row
         */
        InventoryContainer = "minecraft:inventory_container",
        /**
         * Makes the entity look at another entity. Once applied, if an entity of the specified type is nearby and can be targeted the entity will turn towards it.
         */
        LookAt = "minecraft:lookat",
        /**
         * Nameable component describes an entity's ability to be named using a nametag and whether the name shows up or not once applied. Additionally, scripting allows setting the name of the entity directly with the property 'name'.
         */
        Nameable = "minecraft:nameable",
        /**
         * This component allows you to control an entity's current position in the world. Once applied the entity will be teleported to the new position specified.
         */
        Position = "minecraft:position",
        /**
         * This component allows you to control an entity's current rotation in the world as well as the entity's head rotation. Once applied, the entity will be rotated as specified.
         */
        Rotation = "minecraft:rotation",
        /**
         * Defines the entity's ranged attacks. This doesn't allow the entity to use a ranged attack: it only defines what kind of projectile it shoots.
         */
        Shooter = "minecraft:shooter",
        /**
         * Controls the entity's ability to spawn an entity or an item. This is similar to the chicken's ability to lay eggs after a set amount of time.
         */
        SpawnEntity = "minecraft:spawn_entity",
        /**
         * This controls the entity's ability to teleport itself (similar to the Enderman). If you wish to teleport the entity once use the Position component instead.
         */
        Teleport = "minecraft:teleport",
        /**
         * The tick world component is a read-only component that allows users to access the ticking areas on entities as well as the ticking area's data.
         */
        TickWorld = "minecraft:tick_world"
    }
    
    export enum MinecraftDimension {
        Overworld = "overworld",
        Nether = "nether",
        End = "the end"
    }
    
    export enum MinecraftParticleEffect {
        /**
         * Beacon effects
         */
        MobSpellAmbient = "minecraft:mobspellambient",
        /**
         * Attacking a villager in a village
         */
        VillagerAngry = "minecraft:villagerangry",
        /**
         * Breaking blocks, sprinting, iron golems walking
         */
        BlockBreak = "minecraft:blockbreak",
        /**
         * Breaking armor stands, falling
         */
        BlockDust = "minecraft:blockdust",
        /**
         * Entities in water, guardian laser beams, fishing
         */
        Bubble = "minecraft:bubble",
        /**
         * After jumping into water while on fire
         */
        Evaporation = "minecraft:evaporation",
        /**
         * Critical hits, bows, evoker fangs
         */
        CriticalHit = "minecraft:crit",
        /**
         * 	An ender dragon's breath and dragon fireballs
         */
        DragonBreath = "minecraft:dragonbreath",
        /**
         * Dripping lava through blocks
         */
        DripLava = "minecraft:driplava",
        /**
         * 	Dripping water through blocks, wet sponges, leaves when raining
         */
        DripWater = "minecraft:dripwater",
        /**
         * Redstone ore, powered redstone dust, redstone torches, powered redstone repeaters
         */
        RedstoneDust = "minecraft:reddust",
        /**
         * Splash potions, lingering potions, bottles o' enchanting, evokers.
         */
        Spell = "minecraft:spell",
        /**
         * Elder Gardians
         * note: wiki has a question mark
         */
        MobAppearance = "minecraft:mobappearance",
        /**
         * From bookshelves near an enchanting table.
         */
        EnchantingTable = "minecraft:enchantingtable",
        /**
         * End rods, shulker bullets.
         */
        EndRod = "minecraft:endrod",
        /**
         * 	Status effects, lingering potions, tipped arrows, trading, withered armor (linger potion particles decrease when the "minimal" particle setting is used).
         */
        MobSpell = "minecraft:mobspell",
        /**
         * Explosions, ghast fireballs, wither skulls, ender dragon death, shearing mooshrooms.
         */
        LargeExplosion = "minecraft:largeexplode",
        /**
         * Floating sand, gravel, concrete powder, and anvils.
         */
        FallingDust = "minecraft:fallingdust",
        /**
         * Firework rocket trail and explosion (trail is not shown when the "minimal" particle setting is used), when dolphins track shipwrecks and underwater ruins.
         */
        FireworksSpark = "minecraft:fireworksspark",
        /**
         * Fishing
         */
        WaterWake = "minecraft:waterwake",
        /**
         * 	Torches, furnaces, magma cubes, spawners.
         */
        Flame = "minecraft:flame",
        /**
         * 	Bone mealing a crop, trading with villagers, feeding baby animals, walking or jumping on turtle eggs.
         */
        VillagerHappy = "minecraft:villagerhappy",
        /**
         * Breeding and taming animals.
         */
        Heart = "minecraft:heart",
        /**
         * Explosions, ender dragon death.
         */
        HugeExplosion = "minecraft:hugeexplosion",
        /**
         * Instant health/damage splash and lingering potions, spectral arrows.
         */
        MobSpellInstantaneous = "minecraft:mobspellinstantaneous",
        /**
         * 	Eating, thrown eggs, splash potions, eyes of ender, breaking tools.
         */
        IconCrack = "minecraft:iconcrack",
        /**
         * Jumping slimes.
         */
        Slime = "minecraft:slime",
        /**
         * Thrown snowballs, creating withers, creating iron golems.
         */
        SnowballPoof = "minecraft:snowballpoof",
        /**
         * Fire, minecart with furnace, blazes, water flowing into lava, lava flowing into water.
         */
        LargeSmoke = "minecraft:largesmoke",
        /**
         * Lava
         */
        Lava = "minecraft:lava",
        /**
         * Burning entities, blazes for example.
         */
        MobFlame = "minecraft:mobflame",
        /**
         * Mycelium blocks.
         */
        TownAura = "minecraft:townaura",
        /**
         * Activated Conduits.
         */
        Nautilus = "minecraft:nautilus",
        /**
         * Emitted from note blocks and jukeboxes
         */
        Note = "minecraft:note",
        /**
         * Explosions, death of mobs, mobs spawned from a spawner, silverfish infesting blocks.
         */
        Explode = "minecraft:explode",
        /**
         * 	Nether portals, endermen, endermites, ender pearls, eyes of ender, ender chests, dragon eggs, teleporting from eating chorus fruits, end gateway portals.
         */
        Portal = "minecraft:portal",
        /**
         * Rain
         */
        RainSplash = "minecraft:rainsplash",
        /**
         * 	Torches, primed TNT, droppers, dispensers, end portals, brewing stands, spawners, furnaces, ghast fireballs, wither skulls, taming, withers, lava (when raining), placing an eye of ender in an end portal frame, redstone torches burning out.
         */
        Smoke = "minecraft:smoke",
        /**
         * Entities in water, wolves shaking off after swimming, boats.
         */
        WaterSplash = "minecraft:watersplash",
        /**
         * Produced by squids when attacked
         */
        Ink = "minecraft:ink",
        /**
         * ?
         */
        Terrain = "minecraft:terrain",
        /**
         * Activated totem of undying.
         */
        Totem = "minecraft:totem",
        /**
         * ?
         */
        TrackingEmitter = "minecraft:trackingemitter",
        /**
         * Witches.
         */
        WitchSpell = "minecraft:witchspell"
    }
    
    export enum ReceiveFromMinecraftServer {
        /**
         * This event is triggered whenever a player starts to destroy a block.
         */
        BlockDestructionStarted = "minecraft:block_destruction_started",
        /**
         * This event is triggered whenever a player stops destroying a block.
         */
        BlockDestructionStopped = "minecraft:block_destruction_stopped",
        /**
         * This event is triggered whenever a player interacts with a block.
         */
        BlockInteractedWith = "minecraft:block_interacted_with",
        /**
         * This event is triggered whenever an entity acquires an item.
         */
        EntityAcquiredItem = "minecraft:entity_acquired_item",
        /**
         * This event is triggered whenever an entity changes the item carried in their hand.
         */
        EntityCarriedItemChanged = "minecraft:entity_carried_item_changed",
        /**
         * This event is triggered whenever an entity is added to the world.
         */
        EntityCreated = "minecraft:entity_created",
        /**
         * This event is triggered whenever an entity dies. This won't be triggered when an entity is removed (such as when using destroyEntity).
         */
        EntityDeath = "minecraft:entity_death",
        /**
         * This event is triggered whenever an entity drops an item.
         */
        EntityDroppedItem = "minecraft:entity_dropped_item",
        /**
         * This event is triggered whenever an entity equips an item in their armor slots.
         */
        EntityEquippedArmor = "minecraft:entity_equipped_armor",
        /**
         * This event is triggered whenever an entity becomes a rider on another entity.
         */
        EntityStartRiding = "minecraft:entity_start_riding",
        /**
         * This event is triggered whenever an entity stops riding another entity.
         */
        EntityStopRiding = "minecraft:entity_stop_riding",
        /**
         * This event is triggered whenever an entity is ticked. This event will not fire when a player is ticked.
         */
        EntityTick = "minecraft:entity_tick",
        /**
         * This event is triggered whenever an entity uses an item.
         */
        EntityUseItem = "minecraft:entity_use_item",
        /**
         * This event is triggered whenever a piston moves a block.
         */
        PistonMovedBlock = "minecraft:piston_moved_block",
        /**
         * This event is used to play a sound effect. Currently, sounds can only be played at a fixed position in the world. Global sounds and sounds played by an entity will be supported in a later update.
         */
        PlaySound = "minecraft:play_sound",
        /**
         * This event is triggered whenever a player attacks an entity.
         */
        PlayerAttackedEntity = "minecraft:player_attacked_entity",
        /**
         * This event is triggered whenever a player destroys a block.
         */
        PlayerDestroyedBlock = "minecraft:player_destroyed_block",
        /**
         * This event is triggered whenever a player places a block.
         */
        PlayerPlacedBlock = "minecraft:player_placed_block",
        /**
         * This event is triggered whenever the weather changes. It contains information about the weather it is changing to.
         */
        WeatherChanged = "minecraft:weather_changed"
    }
    
    export enum SendToMinecraftServer {
        /**
         * This event is used to send a chat message from the server to the players. The event data is the message being sent as a string. Special formatting is supported the same way it would be if a player was sending the message.
         */
        DisplayChat = "minecraft:display_chat_event",
        /**
         * This event is used to execute a slash command on the server with the World Owner permission level. The event data contains the slash command as a string. The slash command will be processed and will run after the event is sent.
         */
        ExecuteCommand = "minecraft:execute_command",
        /**
         * This event is used to play a sound effect. Currently, sounds can only be played at a fixed position in the world. Global sounds and sounds played by an entity will be supported in a later update.
         */
        PlaySound = "minecraft:play_sound",
        /**
         * This event is used to turn various levels of logging on and off for server scripts. Note that turning logging on/off is not limited to the script that broadcasted the event. It will affect ALL server scripts including those in other Behavior Packs that are applied to the world. See the Debugging section for more information on logging.
         */
        ScriptLoggerConfig = "minecraft:script_logger_config",
        /**
         * This event is used to create a particle effect that will follow an entity around. This particle effect is visible to all players. Any effect defined in a JSON file (both in your resource pack and in Minecraft) can be used here. MoLang variables defined in the JSON of the effect can then be used to control that effect by changing them in the entity to which it is attached.
         */
        SpawnParticleAttachedEntity = "minecraft:spawn_particle_attached_entity",
        /**
         * This event is used to create a static particle effect in the world. This particle effect is visible to all players. Any effect defined in a JSON file (both in your resource pack and in Minecraft) can be used here. Once the effect is spawned you won't be able to control it further.
         */
        SpawnParticleInWorld = "minecraft:spawn_particle_in_world"
    }
}

declare global
{
    /** @deprecated use strings directly */
    type MinecraftComponent = bedrock_types.MinecraftComponent;
    /** @deprecated use strings directly */
    type ReceiveFromMinecraftServer = bedrock_types.ReceiveFromMinecraftServer;
    /** @deprecated use strings directly */
    type SendToMinecraftServer = bedrock_types.SendToMinecraftServer;
    /** @deprecated use strings directly */
    const MinecraftComponent:typeof bedrock_types.MinecraftComponent;
    /** @deprecated use strings directly */
    const MinecraftDimension:typeof bedrock_types.MinecraftDimension;
    /** @deprecated use strings directly */
    const MinecraftParticleEffect:typeof bedrock_types.MinecraftParticleEffect;
    /** @deprecated use strings directly */
    const ReceiveFromMinecraftServer:typeof bedrock_types.ReceiveFromMinecraftServer;
    /** @deprecated use strings directly */
    const SendToMinecraftServer:typeof bedrock_types.SendToMinecraftServer;
}

(global as any).MinecraftComponent = bedrock_types.MinecraftComponent;
(global as any).MinecraftDimension = bedrock_types.MinecraftDimension;
(global as any).MinecraftParticleEffect = bedrock_types.MinecraftParticleEffect;
(global as any).ReceiveFromMinecraftServer = bedrock_types.ReceiveFromMinecraftServer;
(global as any).SendToMinecraftServer = bedrock_types.SendToMinecraftServer;

export {};