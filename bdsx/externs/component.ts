import "./common";

/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare global
{
    interface MinecraftComponentNameMap {
        /**
         * This component represents the armor contents of an entity. The component contains an array of ItemStack JS API Objects representing each slot in the armor container. NOTE: Currently items and containers are read-only. Slots are ordered from head to feet.
         */
        'minecraft:armor_container': IComponent<IArmorContainerComponent>;
        /**
         * This component controls the Attack Damage attribute from the entity. It allows you to change the current minimum and maximum values. Once the changes are applied, the current attack of the entity will be reset to the minimum specified. With the minimum and maximum changed to the values specified. Any buffs or debuffs will be left intact.
         */
        'minecraft:attack': IComponent<IAttackComponent>;
        /**
         * Controls the collision box of the entity. When changes to the component are applied the entity's collision box is immediately updated to reflect the new dimensions. WARNING: If the change of the collision box dimensions would cause the entity to be inside a block, the entity might become stuck there and start suffocating.
         */
        'minecraft:collision_box': IComponent<ICollisionBoxComponent>;
        /**
         * Defines an array of damages and how the entity reacts to them - including whether the entity ignores that damage or not. Currently Minecraft triggers can't be properly serialized so any existing triggers will be completely replaced when applyComponentChanges().
         */
        'minecraft:damage_sensor': IComponent<IDamageSensorComponent>;
        /**
         * Defines the loot table the entity uses to defines its equipment. Once the changes are applied, the equipment is re-rolled and a new set of equipment is chosen for the entity.
         */
        'minecraft:equipment': IComponent<IEquipmentComponent>;
        /**
         * Defines how many and what items the entity can be equipped with.
         */
        'minecraft:equippable': IComponent<IEquippableComponent>;
        /**
         * Controls the entity's explosion, timer until the explosion, and whether the timer is counting down or not.
         */
        'minecraft:explode': IComponent<IExplodeComponent>;
        /**
         * This component represents the contents of an entity's hands. The component contains an array of ItemStack JS API Objects representing each slot in the hand container. NOTE: Currently items and containers are read-only. Slot 0 is main-hand Slot 1 is off-hand.
         */
        'minecraft:hand_container': IComponent<IHandContainerComponent>;
        /**
         * Defines how the entity can be healed by the player. This doesn't control how much health the entity can have; you must use the Health component for that instead.
         */
        'minecraft:healable': IComponent<IHealableComponent>;
        /**
         * Defines the current and maximum possible health of the entity. Upon applying the component back to the entity the health will change. If it reaches 0 or below the entity will die.
         */
        'minecraft:health': IComponent<IHealthComponent>;
        /**
         * This component represents the hotbar contents of a player. The component contains an array of ItemStack JS API Objects representing each slot in the hotbar. NOTE: Currently items and containers are read-only. Slots are ordered left to right.
         */
        'minecraft:hotbar_container': IComponent<IHotbarContainerComponent>;
        /**
         * Defines the ways the player can interact with the entity to which this component is applied.
         */
        'minecraft:interact': IComponent<IInteractComponent>;
        /**
         * Defines the entity's inventory (size, restrictions, etc.). Currently this does not allow changing the entity's inventory contents.
         */
        'minecraft:inventory': IComponent<IInventoryComponent>;
        /**
         * This component represents the inventory contents of an entity. The component contains an array of ItemStack JS API Objects representing each slot in the inventory. NOTE: Currently items and containers are read-only.Slot 0-8 is the hotbar, 9-16 is the top row of the player's inventory, 17-24 is the middle row, 25-32 is the bottom row
         */
        'minecraft:inventory_container': IComponent<IInventoryContainerComponent>;
        /**
         * Makes the entity look at another entity. Once applied, if an entity of the specified type is nearby and can be targeted the entity will turn towards it.
         */
        'minecraft:lookat': IComponent<ILookAtComponent>;
        /**
         * Nameable component describes an entity's ability to be named using a nametag and whether the name shows up or not once applied. Additionally, scripting allows setting the name of the entity directly with the property 'name'.
         */
        'minecraft:nameable': IComponent<INameableComponent>;
        /**
         * This component allows you to control an entity's current position in the world. Once applied the entity will be teleported to the new position specified.
         */
        'minecraft:position': IComponent<IPositionComponent>;
        /**
         * This component allows you to control an entity's current rotation in the world as well as the entity's head rotation. Once applied, the entity will be rotated as specified.
         */
        'minecraft:rotation': IComponent<IRotationComponent>;
        /**
         * Defines the entity's ranged attacks. This doesn't allow the entity to use a ranged attack: it only defines what kind of projectile it shoots.
         */
        'minecraft:shooter': IComponent<IShooterComponent>;
        /**
         * Controls the entity's ability to spawn an entity or an item. This is similar to the chicken's ability to lay eggs after a set amount of time.
         */
        'minecraft:spawn_entity': IComponent<ISpawnEntityComponent>;
        /**
         * This controls the entity's ability to teleport itself (similar to the Enderman). If you wish to teleport the entity once use the Position component instead.
         */
        'minecraft:teleport': IComponent<ITeleportComponent>;
        /**
         * The tick world component is a read-only component that allows users to access the ticking areas on entities as well as the ticking area's data.
         */
        'minecraft:tick_world': IComponent<ITickWorldComponent>;
        /**
         * This component contains all the blockstates on a block object. Blockstates control all different aspects of blocks from their orientation to the type of wood they are. Blockstates are represented by numbers, bools, or strings. Please see the Blockstates Documentation to see the valid values for each state. This component allows for the getting and setting of these states.
         */
        'minecraft:blockstate': IComponent<IBlockStateComponent>
    }
    type MinecraftComponentName = keyof MinecraftComponentNameMap;

    interface MinecraftComponentTypeMap {
        'minecraft:armor_container':IEntity;
        'minecraft:attack':IEntity;
        'minecraft:collision_box':IEntity;
        'minecraft:damage_sensor':IEntity;
        'minecraft:equipment':IEntity;
        'minecraft:equippable':IEntity;
        'minecraft:explode':IEntity;
        'minecraft:hand_container':IEntity;
        'minecraft:healable':IEntity;
        'minecraft:health':IEntity;
        'minecraft:hotbar_container':IEntity;
        'minecraft:interact':IEntity;
        'minecraft:inventory':IEntity;
        'minecraft:inventory_container':IEntity;
        'minecraft:lookat':IEntity;
        'minecraft:nameable':IEntity;
        'minecraft:position':IEntity;
        'minecraft:rotation':IEntity;
        'minecraft:shooter':IEntity;
        'minecraft:spawn_entity':IEntity;
        'minecraft:teleport':IEntity;
        'minecraft:tick_world':IEntity;
        'minecraft:blockstate':IBlock;
        [key:string]:IEntity|IBlock;
    }

    interface IComponent<T> {
        /**
         * The type of the object
         */
        readonly __type__: "component";

        /**
         * The identifier of the component, e.g., "minecraft:position", or "minecraft:nameable"
         */
        readonly __identifier__: string;

        data: T;
    }

    //////////////////////////////////////////////////////////////
    // This file is generated from the Minecraft documentation. //
    // DO NOT EDIT THIS FILE! YOUR CHANGES WILL BE OVERWRITTEN! //
    //////////////////////////////////////////////////////////////

    /**
     * This component represents the armor contents of an entity. The component contains an array of ItemStack JS API Objects representing each slot in the armor container. NOTE: Currently items and containers are read-only. Slots are ordered from head to feet.
     */
    type IArmorContainerComponent = IItemStack[];

    /**
     * This component controls the Attack Damage attribute from the entity. It allows you to change the current minimum and maximum values. Once the changes are applied, the current attack of the entity will be reset to the minimum specified. With the minimum and maximum changed to the values specified. Any buffs or debuffs will be left intact.
     */
    interface IAttackComponent {
        /**
         * Range of the random amount of damage the melee attack deals. A negative value can heal the entity instead of hurting it
         */
        damage: {
            /**
             * The maximum amount of damage the entity will deal
             * @default 0.0
             */
            range_max: number;
            /**
             * The minimum amount of damage the entity will deal
             * @default 0.0
             */
            range_min: number;
        };
    }

    /**
     * Controls the collision box of the entity. When changes to the component are applied the entity's collision box is immediately updated to reflect the new dimensions. WARNING: If the change of the collision box dimensions would cause the entity to be inside a block, the entity might become stuck there and start suffocating.
     */
    interface ICollisionBoxComponent {
        /**
         * Height of the collision box in blocks. A negative value will be assumed to be 0
         * @default 1.0
         */
        height: number;
        /**
         * Width and Depth of the collision box in blocks. A negative value will be assumed to be 0
         * @default 1.0
         */
        width: number;
    }

    /**
     * Defines an array of damages and how the entity reacts to them - including whether the entity ignores that damage or not. Currently Minecraft triggers can't be properly serialized so any existing triggers will be completely replaced when applyComponentChanges().
     */
    interface IDamageSensorComponent {
        /**
         * Type of damage that triggers this set of events
         */
        cause: string;
        /**
         * If true, the damage dealt to the entity will take away health from it, set to false to make the entity ignore that damage
         * @default true
         */
        deals_damage: boolean;
        /**
         * List of triggers with the events to call when taking this specific kind of damage, allows specifying filters for entity definitions and events
         */
        on_damage: MinecraftTrigger[];
    }

    /**
     * Defines the loot table the entity uses to defines its equipment. Once the changes are applied, the equipment is re-rolled and a new set of equipment is chosen for the entity.
     */
    interface IEquipmentComponent {
        /**
         * A list of slots with the chance to drop an equipped item from that slot
         */
        slot_drop_chance: {
            /**
             * The chance that the item in this slot will be dropped
             */
            drop_chance: number;
            /**
             * The slot number
             */
            slot: number;
        }[];
        /**
         * The file path to the equipment table, relative to the behavior pack's root
         */
        table: string;
    }

    /**
     * Defines how many and what items the entity can be equipped with.
     */
    interface IEquippableComponent {
        /**
         * FIXME - UNDOCUMENTED - NO DESCRIPTION FROM MOJANG
         */
        slots: {
            /**
             * The list of items that can go in this slot
             */
            accepted_items: string[];
            /**
             * Text to be displayed when the entity can be equipped with this item when playing with Touch-screen controls
             */
            interact_text: string;
            /**
             * Event to trigger when this entity is equipped with this item
             */
            on_equip: MinecraftTrigger | string;
            /**
             * Event to trigger when this item is removed from this entity
             */
            on_unequip: MinecraftTrigger | string;
            /**
             * The slot number of this slot
             */
            slot: number;
        }[];
    }

    /**
     * Controls the entity's explosion, timer until the explosion, and whether the timer is counting down or not.
     */
    interface IExplodeComponent {
        /**
         * If true, the explosion will destroy blocks in the explosion radius
         * @default true
         */
        breaks_blocks: boolean;
        /**
         * If true, blocks in the explosion radius will be set on fire
         * @default false
         */
        causesFire: boolean;
        /**
         * If true, whether the explosion breaks blocks is affected by the mob griefing game rule
         * @default false
         */
        destroyAffectedByGriefing: boolean;
        /**
         * If true, whether the explosion causes fire is affected by the mob griefing game rule
         * @default false
         */
        fireAffectedByGriefing: boolean;
        /**
         * The range for the random amount of time the fuse will be lit before exploding, a negative value means the explosion will be immediate
         * @default [0.0, 0.0]
         */
        fuseLength: Range;
        /**
         * If true, the fuse is already lit when this component is added to the entity
         * @default false
         */
        fuseLit: boolean;
        /**
         * A blocks explosion resistance will be capped at this value when an explosion occurs
         * @default Infinite
         */
        maxResistance: number;
        /**
         * The radius of the explosion in blocks and the amount of damage the explosion deals
         * @default 3.0
         */
        power: number;
    }

    /**
     * This component represents the contents of an entity's hands. The component contains an array of ItemStack JS API Objects representing each slot in the hand container. NOTE: Currently items and containers are read-only. Slot 0 is main-hand Slot 1 is off-hand.
     */
    type IHandContainerComponent = IItemStack[];

    /**
     * Defines how the entity can be healed by the player. This doesn't control how much health the entity can have; you must use the Health component for that instead.
     */
    interface IHealableComponent {
        /**
         * The filter group that defines the conditions for this trigger
         */
        filters?: MinecraftFilter;
        /**
         * Determines if item can be used regardless of entity being at full health
         * @default false
         */
        force_use: boolean;
        /**
         * The array of items that can be used to heal this entity
         */
        items: {
            /**
             * FIXME - UNDOCUMENTED - NO DESCRIPTION FROM MOJANG
             */
            effects: {
                /**
                 * FIXME - UNDOCUMENTED - NO DESCRIPTION FROM MOJANG
                 */
                amplifier: number;
                /**
                 * FIXME - UNDOCUMENTED - NO DESCRIPTION FROM MOJANG
                 */
                chance: number;
                /**
                 * FIXME - UNDOCUMENTED - NO DESCRIPTION FROM MOJANG
                 */
                duration: number;
                /**
                 * FIXME - UNDOCUMENTED - NO DESCRIPTION FROM MOJANG
                 */
                name: string;
            }[];
            /**
             * The filter group that defines the conditions for using this item to heal the entity
             */
            filters?: MinecraftFilter;
            /**
             * The amount of health this entity gains when fed this item
             * @default 1
             */
            heal_amount: number;
            /**
             * Item identifier that can be used to heal this entity
             */
            item: string;
        }[];
    }

    /**
     * Defines the current and maximum possible health of the entity. Upon applying the component back to the entity the health will change. If it reaches 0 or below the entity will die.
     */
    interface IHealthComponent {
        /**
         * The maximum health the entity can heal
         * @default 10
         */
        max: number;
        /**
         * Current health of the entity
         * @default 1
         */
        value: number;
    }

    /**
     * This component represents the hotbar contents of a player. The component contains an array of ItemStack JS API Objects representing each slot in the hotbar. NOTE: Currently items and containers are read-only. Slots are ordered left to right.
     */
    type IHotbarContainerComponent = IItemStack[];

    /**
     * Defines the ways the player can interact with the entity to which this component is applied.
     */
    interface IInteractComponent {
        /**
         * Loot table with items to add to the player's inventory upon successful interaction
         */
        add_items: {
            /**
             * File path, relative to the behavior pack's path, to the loot table file
             */
            table: string;
        };
        /**
         * Time in seconds before this entity can be interacted with again
         * @default 0.0
         */
        cooldown: number;
        /**
         * The amount of damage the item will take when used to interact with this entity. A value of 0 means the item won't lose durability
         * @default 0
         */
        hurt_item: number;
        /**
         * Text to show when the player is able to interact in this way with this entity when playing with Touch-screen controls
         */
        interact_text: string;
        /**
         * An event identifier to fire when the interaction occurs
         */
        on_interact: MinecraftTrigger | string;
        /**
         * Particle effect that will be triggered at the start of the interaction
         */
        particle_on_start: {
            /**
             * Whether or not the particle will appear closer to who performed the interaction
             * @default false
             */
            particle_offset_towards_interactor: boolean;
            /**
             * The type of particle that will be spawned
             */
            particle_type: string;
            /**
             * Will offset the particle this amount in the y direction
             * @default 0.0
             */
            particle_y_offset: number;
        };
        /**
         * An array of sound identifiers to play when the interaction occurs
         */
        play_sounds: string[];
        /**
         * An array of entity identifiers to spawn when the interaction occurs
         */
        spawn_entities: string[];
        /**
         * Loot table with items to drop on the ground upon successful interaction
         */
        spawn_items: {
            /**
             * File path, relative to the behavior pack's path, to the loot table file
             */
            table: string;
        };
        /**
         * If true, the player will do the 'swing' animation when interacting with this entity
         * @default false
         */
        swing: boolean;
        /**
         * The item used will transform to this item upon successful interaction. Format: itemName:auxValue
         */
        transform_to_item?: string;
        /**
         * If true, the interaction will use an item
         * @default false
         */
        use_item: boolean;
    }

    /**
     * Defines the entity's inventory (size, restrictions, etc.). Currently this does not allow changing the entity's inventory contents.
     */
    interface IInventoryComponent {
        /**
         * Number of slots that this entity can gain per extra strength
         * @default 0
         */
        additional_slots_per_strength: number;
        /**
         * If true, the contents of this inventory can be removed by a hopper
         * @default false
         */
        can_be_siphoned_from: boolean;
        /**
         * Type of container this entity has. Can be horse, minecart_chest, minecart_hopper, inventory, container or hopper
         * @default none
         */
        container_type: string;
        /**
         * Number of slots the container has
         * @default 5
         */
        inventory_size: number;
        /**
         * If true, only the entity can access the inventory
         * @default false
         */
        private: boolean;
        /**
         * If true, the entity's inventory can only be accessed by its owner or itself
         * @default false
         */
        restrict_to_owner: boolean;
    }

    /**
     * This component represents the inventory contents of an entity. The component contains an array of ItemStack JS API Objects representing each slot in the inventory. NOTE: Currently items and containers are read-only.Slot 0-8 is the hotbar, 9-16 is the top row of the player's inventory, 17-24 is the middle row, 25-32 is the bottom row
     */
    type IInventoryContainerComponent = IItemStack[];

    /**
     * Makes the entity look at another entity. Once applied, if an entity of the specified type is nearby and can be targeted the entity will turn towards it.
     */
    interface ILookAtComponent {
        /**
         * Defines the entities that can trigger this component
         * @default player
         */
        filters?: MinecraftFilter;
        /**
         * The range for the random amount of time during which the entity is 'cooling down' and won't get angered or look for a target
         * @default [0.0, 0.0]
         */
        look_cooldown: Range;
        /**
         * The event identifier to run when the entities specified in filters look at this entity
         */
        look_event: MinecraftTrigger | string;
        /**
         * If true, invulnerable entities (e.g. Players in creative mode) are considered valid targets
         * @default false
         */
        mAllowInvulnerable: boolean;
        /**
         * Maximum distance this entity will look for another entity looking at it
         * @default 10.0
         */
        searchRadius: number;
        /**
         * If true, this entity will set the attack target as the entity that looked at it
         * @default true
         */
        setTarget: boolean;
    }

    /**
     * Nameable component describes an entity's ability to be named using a nametag and whether the name shows up or not once applied. Additionally, scripting allows setting the name of the entity directly with the property 'name'.
     */
    interface INameableComponent {
        /**
         * If true, this entity can be renamed with name tags
         * @default true
         */
        allowNameTagRenaming: boolean;
        /**
         * If true, the name will always be shown
         * @default false
         */
        alwaysShow: boolean;
        /**
         * Trigger to run when the entity gets named
         */
        default_trigger: MinecraftTrigger | string;
        /**
         * The current name of the entity, empty if the entity hasn't been named yet, making this non-empty will apply the name to the entity
         */
        name: string;
        /**
         * Describes the special names for this entity and the events to call when the entity acquires those names
         */
        name_actions: {
            /**
             * List of special names that will cause the events defined in 'on_named' to fire
             */
            name_filter: string[];
            /**
             * Event to be called when this entity acquires the name specified in 'name_filter'
             */
            on_named: MinecraftTrigger | string;
        }[];
    }

    /**
     * This component allows you to control an entity's current position in the world. Once applied the entity will be teleported to the new position specified.
     */
    interface IPositionComponent {
        /**
         * Position along the X-Axis (east-west) of the entity
         * @default 0.0
         */
        x: number;
        /**
         * Position along the Y-Axis (height) of the entity
         * @default 0.0
         */
        y: number;
        /**
         * Position along the Z-Axis (north-south) of the entity
         * @default 0.0
         */
        z: number;
    }

    /**
     * This component allows you to control an entity's current rotation in the world as well as the entity's head rotation. Once applied, the entity will be rotated as specified.
     */
    interface IRotationComponent {
        /**
         * Controls the head rotation looking up and down
         * @default 0.0
         */
        x: number;
        /**
         * Controls the body rotation parallel to the floor
         * @default 0.0
         */
        y: number;
    }

    /**
     * Defines the entity's ranged attacks. This doesn't allow the entity to use a ranged attack: it only defines what kind of projectile it shoots.
     */
    interface IShooterComponent {
        /**
         * ID of the Potion effect to be applied on hit
         * @default -1
         */
        auxVal: number;
        /**
         * Entity identifier to use as projectile for the ranged attack. The entity must have the projectile component to be able to be shot as a projectile
         */
        def: string;
    }

    /**
     * Controls the entity's ability to spawn an entity or an item. This is similar to the chicken's ability to lay eggs after a set amount of time.
     */
    interface ISpawnEntityComponent {
        /**
         * If present, the specified entity will only spawn if the filter evaluates to true
         */
        filters?: MinecraftFilter;
        /**
         * Maximum amount of time to randomly wait in seconds before another entity is spawned
         * @default 600
         */
        max_wait_time: number;
        /**
         * Minimum amount of time to randomly wait in seconds before another entity is spawned
         * @default 300
         */
        min_wait_time: number;
        /**
         * The number of entities of this type to spawn each time that this triggers
         * @default 1
         */
        num_to_spawn: number;
        /**
         * If true, this the spawned entity will be leashed to the parent
         * @default false
         */
        should_leash: boolean;
        /**
         * If true, this component will only ever spawn the specified entity once
         * @default false
         */
        single_use: boolean;
        /**
         * Identifier of the entity to spawn, leave empty to spawn the item defined above instead
         */
        spawn_entity: string;
        /**
         * Event to call when the entity is spawned
         * @default minecraft:entity_born
         */
        spawn_event: string;
        /**
         * Item identifier of the item to spawn
         * @default egg
         */
        spawn_item: string;
        /**
         * Method to use to spawn the entity
         * @default born
         */
        spawn_method: string;
        /**
         * Identifier of the sound effect to play when the entity is spawned
         * @default plop
         */
        spawn_sound: string;
    }

    /**
     * This controls the entity's ability to teleport itself (similar to the Enderman). If you wish to teleport the entity once use the Position component instead.
     */
    interface ITeleportComponent {
        /**
         * Modifies the chance that the entity will teleport if the entity is in darkness
         * @default 0.01
         */
        darkTeleportChance: number;
        /**
         * Modifies the chance that the entity will teleport if the entity is in daylight
         * @default 0.01
         */
        lightTeleportChance: number;
        /**
         * Maximum amount of time in seconds between random teleports
         * @default 20.0
         */
        maxRandomTeleportTime: number;
        /**
         * Minimum amount of time in seconds between random teleports
         * @default 0.0
         */
        minRandomTeleportTime: number;
        /**
         * Entity will teleport to a random position within the area defined by this cube
         * @default [32.0, 16.0, 32.0]
         */
        randomTeleportCube: VectorArray;
        /**
         * If true, the entity will teleport randomly
         * @default true
         */
        randomTeleports: boolean;
        /**
         * The chance that the entity will teleport between 0.0 and 1.0. 1.0 means 100%
         * @default 1.0
         */
        target_teleport_chance: number;
        /**
         * Maximum distance the entity will teleport when chasing a target
         * @default 16.0
         */
        targetDistance: number;
    }

    /**
     * The tick world component is a read-only component that allows users to access the ticking areas on entities as well as the ticking area's data.
     */
    interface ITickWorldComponent {
        /**
         * distance_to_players
         */
        distance_to_players: number;
        /**
         * Whether or not this ticking area will despawn when a player is out of range
         */
        never_despawn: boolean;
        /**
         * The radius in chunks of the ticking area
         */
        radius: number;
        /**
         * The ticking area entity that is attached to this entity
         */
        ticking_area: IEntityTickingArea;
    }

    interface IBlockStateComponent {
        coral_color?:string;
        [key:string]:any;
        // Where is the document about it?
    }
}