/**
 * Generated with bdsx/bds-scripting/parser.ts
 * docfix.json overrides it.
 * Please DO NOT modify this directly.
 */
declare global {

interface IEntity {
    /**
     * This is the identifier for the object in the format namespace:name. For example, if the type is entity and the object is representing a vanilla cow, the identifier would be minecraft:cow
     */
    readonly __identifier__:EntityId;
    /**
     * This defines the type of object.
     */
    readonly __type__:"entity"|"item_entity";
    /**
     * Positive Integer.
     * This is the unique identifier of the entity.
     */
    readonly id:number;
    __unique_id__:Int64;
}

interface ILevel {
    /**
     * This defines the type of object.
     */
    readonly __type__:"level";
    /**
     * Positive Integer.
     * This is the unique identifier of the level.
     */
    readonly level_id:number;
}

interface IQuery {
    /**
     * This defines the type of object.
     */
    readonly __type__:"query";
    /**
     * Positive Integer.
     * This is the unique identifier of the query.
     */
    readonly query_id:number;
}

interface IItemStack {
    /**
     * This is the identifier for the object in the format namespace:name. For example, if the type is entity and the object is representing a vanilla cow, the identifier would be minecraft:cow
     */
    readonly __identifier__:ItemId;
    /**
     * This defines the type of object.
     */
    readonly __type__:"item_stack";
    /**
     * This is the number of items in the stack.
     */
    readonly count:number;
    /**
     * This is the identifier of the item.
     */
    readonly item:string;
    name:ItemId;
}

interface IBlock {
    /**
     * This is the identifier for the object in the format namespace:name. For example, if the type is block and the object is representing a block of bedrock, the identifier would be minecraft:bedrock
     */
    readonly __identifier__:BlockId;
    /**
     * This defines the type of object.
     */
    readonly __type__:"block";
    /**
     * This is the position of the block and it functions as part of its unique identifier.
     */
    readonly block_position:VectorXYZ;
    /**
     * JavaScript Object.
     * This is the ticking area object that was used to get this block.
     */
    readonly ticking_area:ITickingArea;
}

type ITickingArea = IEntityTickingArea | ILevelTickingArea;

interface IEntityTickingArea {
    /**
     * This defines the type of object.
     */
    readonly __type__:"entity_ticking_area";
    /**
     * Positive Integer.
     * This is the unique identifier of the ticking area.
     */
    readonly entity_ticking_area_id:Int64;
}

interface ILevelTickingArea {
    /**
     * This defines the type of object.
     */
    readonly __type__:"level_ticking_area";
    /**
     * This is the unique identifier of the ticking area.
     */
    readonly level_ticking_area_id:string;
}

/**
 * Not documented
 */
type ITickingAreasComponent = any;

interface IWeatherComponent {
    /**
     * This is the world option that determines if the vanilla weather cycle will be used
     */
    do_weather_cycle:boolean;
    /**
     * A value between 0 and 1 that determines how much lightning and thunder there is
     */
    lightning_level:number;
    /**
     * Integer.
     * How long, in ticks, it will lightning and thunder for
     */
    lightning_time:number;
    /**
     * A value between 0 and 1 that determains how heavy the rainfall is
     */
    rain_level:number;
    /**
     * Integer.
     * How long, in ticks, it will rain for
     */
    rain_time:number;
}

type IArmorContainerComponent = IItemStack[];

interface IAttackComponent {
    /**
     * Range of the random amount of damage the melee attack deals. A negative value can heal the entity instead of hurting it
     */
    damage:{
        /**
         * The maximum amount of damage the entity will deal
         * @default 0.0
         */
        range_max:number,
        /**
         * The minimum amount of damage the entity will deal
         * @default 0.0
         */
        range_min:number
    };
}

/**
 * Not documented
 */
type IContainerComponent = any;

interface ICollisionBoxComponent {
    /**
     * Height of the collision box in blocks. A negative value will be assumed to be 0.
     * @default 1.0
     */
    height:number;
    /**
     * Width and Depth of the collision box in blocks. A negative value will be assumed to be 0.
     * @default 1.0
     */
    width:number;
}

interface IDamageSensorComponent {
    /**
     * List of triggers with the events to call when taking specific kinds of damage.
     */
    triggers:{
        /**
         * Type of damage that triggers the events.
         * @default none
         */
        cause?:MinecraftDamageSource,
        /**
         * A modifier that adds to/removes from the base damage from the damage cause. It does not reduce damage to less than 0.
         * @default 0.0
         */
        damage_modifier?:number,
        /**
         * A multiplier that modifies the base damage from the damage cause. If deals_damage is true the multiplier can only reduce the damage the entity will take to a minimum of 1.
         * @default 1.0
         */
        damage_multiplier?:number,
        /**
         * If true, the damage dealt to the entity will take away health from it, set to false to make the entity ignore that damage.
         * @default true
         */
        deals_damage?:boolean,
        /**
         * Specifies filters for entity definitions and events.
         */
        on_damage:MinecraftTrigger[],
        /**
         * Defines what sound to play, if any, when the on_damage filters are met.
         */
        on_damage_sound_event:string
    }[];
}

interface IEquipmentComponent {
    /**
     * A list of slots with the chance to drop an equipped item from that slot.
     */
    slot_drop_chance:{
        /**
         * The chance that the item in this slot will be dropped
         */
        drop_chance:number,
        /**
         * The slot number
         */
        slot:number
    }[];
    /**
     * The file path to the equipment table, relative to the behavior pack's root.
     */
    table:string;
}

interface IEquippableComponent {
    /**
     * The list of items that can go in this slot.
     */
    accepted_items:string[];
    /**
     * Text to be displayed when the entity can be equipped with this item when playing with Touch-screen controls.
     */
    interact_text:string;
    /**
     * Identifier of the item that can be equipped for this slot.
     */
    item:string;
    /**
     * Event to trigger when this entity is equipped with this item.
     */
    on_equip:MinecraftTrigger | string;
    /**
     * Event to trigger when this item is removed from this entity.
     */
    on_unequip:MinecraftTrigger | string;
    /**
     * Integer.
     * The slot number of this slot.
     * @default 0
     */
    slot:number;
    slots:{
        /**
         * The list of items that can go in this slot.
         */
        accepted_items:string[],
        /**
         * Text to be displayed when the entity can be equipped with this item when playing with Touch-screen controls.
         */
        interact_text:string,
        /**
         * Identifier of the item that can be equipped for this slot.
         */
        item:string,
        /**
         * Event to trigger when this entity is equipped with this item.
         */
        on_equip:MinecraftTrigger | string,
        /**
         * Event to trigger when this item is removed from this entity.
         */
        on_unequip:MinecraftTrigger | string,
        /**
         * Integer.
         * The slot number of this slot.
         * @default 0
         */
        slot?:number
    }[];
}

interface IExplodeComponent {
    /**
     * If true, the explosion will destroy blocks in the explosion radius.
     * @default true
     */
    breaks_blocks:boolean;
    /**
     * If true, blocks in the explosion radius will be set on fire.
     * @default false
     */
    causes_fire:boolean;
    /**
     * If true, whether the explosion breaks blocks is affected by the mob griefing game rule.
     * @default false
     */
    destroy_affected_by_griefing:boolean;
    /**
     * If true, whether the explosion causes fire is affected by the mob griefing game rule.
     * @default false
     */
    fire_affected_by_griefing:boolean;
    /**
     * The range for the random amount of time the fuse will be lit before exploding, a negative value means the explosion will be immediate.
     * @default [0.0, 0.0]
     */
    fuse_length:[number, number];
    /**
     * If true, the fuse is already lit when this component is added to the entity.
     * @default false
     */
    fuse_lit:boolean;
    /**
     * A blocks explosion resistance will be capped at this value when an explosion occurs.
     * @default 3.40282e+38
     */
    max_resistance:number;
    /**
     * The radius of the explosion in blocks and the amount of damage the explosion deals.
     * @default 3
     */
    power:number;
}

type IHandContainerComponent = IItemStack[];

interface IHealableComponent {
    /**
     * The filter group that defines the conditions for using this item to heal the entity.
     */
    filters:MinecraftFilter;
    /**
     * Determines if item can be used regardless of entity being at full health.
     * @default false
     */
    force_use:boolean;
    /**
     * The array of items that can be used to heal this entity.
     */
    items:{
        /**
         * Integer.
         * The amount of health this entity gains when fed this item.
         * @default 1
         */
        heal_amount?:number,
        /**
         * Item identifier that can be used to heal this entity.
         */
        item:string,
        effects:{
            amplifier:number,
            chance:number,
            duration:number,
            name:string
        }[],
        filters?:MinecraftFilter
    }[];
}

interface IHealthComponent {
    /**
     * Integer.
     * The maximum health the entity can heal
     * @default 10
     */
    max:number;
    /**
     * Integer.
     * Current health of the entity
     * @default 1
     */
    value:number;
}

type IHotbarContainerComponent = IItemStack[];

interface IInteractComponent {
    /**
     * Loot table with items to add to the player's inventory upon successful interaction
     */
    add_items:{
        /**
         * File path, relative to the behavior pack's path, to the loot table file
         */
        table:string
    };
    /**
     * Time in seconds before this entity can be interacted with again
     * @default 0.0
     */
    cooldown:number;
    /**
     * Integer.
     * The amount of damage the item will take when used to interact with this entity. A value of 0 means the item won't lose durability
     * @default 0
     */
    hurt_item:number;
    /**
     * Text to show when the player is able to interact in this way with this entity when playing with Touch-screen controls
     */
    interact_text:string;
    /**
     * An event identifier to fire when the interaction occurs
     */
    on_interact:MinecraftTrigger | string;
    /**
     * Particle effect that will be triggered at the start of the interaction
     */
    particle_on_start:{
        /**
         * Whether or not the particle will appear closer to who performed the interaction
         * @default false
         */
        particle_offset_towards_interactor:boolean,
        /**
         * The type of particle that will be spawned
         */
        particle_type:string,
        /**
         * Will offset the particle this amount in the y direction
         * @default 0.0
         */
        particle_y_offset:number
    };
    /**
     * An array of sound identifiers to play when the interaction occurs
     */
    play_sounds:string[];
    /**
     * An array of entity identifiers to spawn when the interaction occurs
     */
    spawn_entities:string[];
    /**
     * Loot table with items to drop on the ground upon successful interaction
     */
    spawn_items:{
        /**
         * File path, relative to the behavior pack's path, to the loot table file
         */
        table:string
    };
    /**
     * If true, the player will do the 'swing' animation when interacting with this entity
     * @default false
     */
    swing:boolean;
    /**
     * The item used will transform to this item upon successful interaction. Format: itemName:auxValue
     */
    transform_to_item:string;
    /**
     * If true, the interaction will use an item
     * @default false
     */
    use_item:boolean;
}

interface IInventoryComponent {
    /**
     * Integer.
     * Number of slots that this entity can gain per extra strength
     * @default 0
     */
    additional_slots_per_strength:number;
    /**
     * If true, the contents of this inventory can be removed by a hopper
     * @default false
     */
    can_be_siphoned_from:boolean;
    /**
     * Type of container this entity has. Can be horse, minecart_chest, minecart_hopper, inventory, container or hopper
     * @default none
     */
    container_type:string;
    /**
     * Integer.
     * Number of slots the container has
     * @default 5
     */
    inventory_size:number;
    /**
     * If true, only the entity can access the inventory
     * @default false
     */
    private:boolean;
    /**
     * If true, the entity's inventory can only be accessed by its owner or itself
     * @default false
     */
    restrict_to_owner:boolean;
}

type IInventoryContainerComponent = IItemStack[];

interface ILookatComponent {
    /**
     * If true, invulnerable entities (e.g. Players in creative mode) are considered valid targets.
     * @default false
     */
    allow_invulnerable:boolean;
    /**
     * Defines the entities that can trigger this component.
     */
    filters:MinecraftFilter;
    /**
     * The range for the random amount of time during which the entity is 'cooling down' and won't get angered or look for a target.
     * @default [0, 0]
     */
    look_cooldown:[number, number];
    /**
     * The event identifier to run when the entities specified in filters look at this entity.
     */
    look_event:string;
    /**
     * Maximum distance this entity will look for another entity looking at it.
     * @default 10
     */
    search_radius:number;
    /**
     * If true, this entity will set the attack target as the entity that looked at it.
     * @default true
     */
    set_target:boolean;
}

interface INameableComponent {
    /**
     * If true, this entity can be renamed with name tags
     * @default true
     */
    allow_name_tag_renaming:boolean;
    /**
     * If true, the name will always be shown
     * @default false
     */
    always_show:boolean;
    /**
     * Trigger to run when the entity gets named
     */
    default_trigger:MinecraftTrigger | string;
    /**
     * The current name of the entity, empty if the entity hasn't been named yet, making this non-empty will apply the name to the entity
     */
    name:string;
    /**
     * Describes the special names for this entity and the events to call when the entity acquires those names
     */
    name_actions:{
        /**
         * List of special names that will cause the events defined in 'on_named' to fire
         */
        name_filter:string[],
        /**
         * Event to be called when this entity acquires the name specified in 'name_filter'
         */
        on_named:MinecraftTrigger | string
    }[];
}

interface IPositionComponent {
    /**
     * Position along the X-Axis (east-west) of the entity
     * @default 0.0
     */
    x:number;
    /**
     * Position along the Y-Axis (height) of the entity
     * @default 0.0
     */
    y:number;
    /**
     * Position along the Z-Axis (north-south) of the entity
     * @default 0.0
     */
    z:number;
}

interface IRotationComponent {
    /**
     * Controls the head rotation looking up and down
     * @default 0.0
     */
    x:number;
    /**
     * Controls the body rotation parallel to the floor
     * @default 0.0
     */
    y:number;
}

interface IShooterComponent {
    /**
     * Integer.
     * ID of the Potion effect to be applied on hit
     * @default -1
     */
    auxVal:number;
    /**
     * Entity identifier to use as projectile for the ranged attack. The entity must have the projectile component to be able to be shot as a projectile
     */
    def:string;
}

interface ISpawnEntityComponent {
    /**
     * If present, the specified entity will only spawn if the filter evaluates to true.
     */
    filters:MinecraftFilter;
    /**
     * Integer.
     * Maximum amount of time to randomly wait in seconds before another entity is spawned.
     * @default 600
     */
    max_wait_time:number;
    /**
     * Integer.
     * Minimum amount of time to randomly wait in seconds before another entity is spawned.
     * @default 300
     */
    min_wait_time:number;
    /**
     * Integer.
     * The number of entities of this type to spawn each time that this triggers.
     * @default 1
     */
    num_to_spawn:number;
    /**
     * If true, this the spawned entity will be leashed to the parent.
     * @default false
     */
    should_leash:boolean;
    /**
     * If true, this component will only ever spawn the specified entity once.
     * @default false
     */
    single_use:boolean;
    /**
     * Identifier of the entity to spawn, leave empty to spawn the item defined above instead.
     */
    spawn_entity:string;
    /**
     * Event to call when the entity is spawned.
     * @default minecraft:entity_born
     */
    spawn_event:string;
    /**
     * Item identifier of the item to spawn.
     * @default egg
     */
    spawn_item:string;
    /**
     * Method to use to spawn the entity.
     * @default born
     */
    spawn_method:string;
    /**
     * Identifier of the sound effect to play when the entity is spawned.
     * @default plop
     */
    spawn_sound:string;
}

/**
 * Not documented
 */
type ITagComponent = any;

interface ITeleportComponent {
    /**
     * Modifies the chance that the entity will teleport if the entity is in darkness
     * @default 0.01
     */
    dark_teleport_chance:number;
    /**
     * Modifies the chance that the entity will teleport if the entity is in daylight
     * @default 0.01
     */
    light_teleport_chance:number;
    /**
     * Maximum amount of time in seconds between random teleports
     * @default 20
     */
    max_random_teleport_time:number;
    /**
     * Minimum amount of time in seconds between random teleports
     * @default 0
     */
    min_random_teleport_time:number;
    /**
     * Entity will teleport to a random position within the area defined by this cube
     * @default [32, 16, 32]
     */
    random_teleport_cube:VectorArray;
    /**
     * If true, the entity will teleport randomly
     * @default true
     */
    random_teleports:boolean;
    /**
     * Maximum distance the entity will teleport when chasing a target
     * @default 16
     */
    target_distance:number;
    /**
     * The chance that the entity will teleport between 0.0 and 1.0. 1.0 means 100%
     * @default 1
     */
    target_teleport_chance:number;
}

interface ITickingAreaDescriptionComponent {
    /**
     * Is the area a circle. If false the area is a square.
     */
    is_circle:boolean;
    /**
     * (if area is a square) The edge of the area.
     */
    max:VectorArray;
    /**
     * The name of the area.
     */
    name:string;
    /**
     * The origin position of the area.
     */
    origin:VectorArray;
    /**
     * (if area is a circle) The radius of the area.
     */
    radius:VectorArray;
}

interface ITickWorldComponent {
    /**
     * distance_to_players
     */
    distance_to_players:number;
    /**
     * Whether or not this ticking area will despawn when a player is out of range
     */
    never_despawn:boolean;
    /**
     * Integer.
     * The radius in chunks of the ticking area
     */
    radius:number;
    /**
     * The ticking area entity that is attached to this entity
     */
    ticking_area:IEntityTickingArea;
}

interface ITransformationComponent {
    /**
     * List of components to add to the entity after the transformation
     */
    add:{
        /**
         * Names of component groups to add
         */
        component_groups:any[]
    };
    /**
     * Sound to play when the transformation starts
     */
    begin_transform_sound:string;
    /**
     * Defines the properties of the delay for the transformation
     */
    delay:{
        /**
         * Chance that the entity will look for nearby blocks that can speed up the transformation. Value must be between 0.0 and 1.0
         * @default 0.0
         */
        block_assist_chance:number,
        /**
         * Chance that, once a block is found, will help speed up the transformation
         * @default 0.0
         */
        block_chance:number,
        /**
         * Integer.
         * Maximum number of blocks the entity will look for to aid in the transformation. If not defined or set to 0, it will be set to the block radius
         * @default 0
         */
        block_max:number,
        /**
         * Integer.
         * Distance in Blocks that the entity will search for blocks that can help the transformation
         * @default 0
         */
        block_radius:number,
        /**
         * List of blocks that can help the transformation of this entity
         */
        block_types:any[],
        /**
         * If this entity is owned by another entity, it should remain owned after transformation
         */
        keep_owner:boolean,
        /**
         * Time in seconds before the entity transforms
         * @default 0.0
         */
        value:number
    };
    /**
     * Cause the entity to drop all equipment upon transformation
     */
    drop_equipment:boolean;
    /**
     * Entity Definition that this entity will transform into
     */
    into:string;
    /**
     * Sound to play when the entity is done transforming
     */
    transformation_sound:string;
}

interface IEntityAttackEventData {
    /**
     * The entity that attacked
     */
    entity:IEntity;
    /**
     * The entity that was targeted in the attack
     */
    target:IEntity;
}

interface IPlayerAttackedEntityEventData {
    /**
     * The entity that was attacked by the player
     */
    attacked_entity:IEntity;
    /**
     * The player that attacked an entity
     */
    player:IEntity;
}

interface IEntityAcquiredItemEventData {
    /**
     * Integer.
     * The total number of items acquired by the entity during this event
     */
    acquired_amount:number;
    /**
     * The way the entity acquired the item
     */
    acquisition_method:string;
    /**
     * The entity who acquired the item
     */
    entity:IEntity;
    /**
     * The item that was acquired
     */
    item_stack:IItemStack;
    /**
     * If it exists, the entity that affected the item before it was acquired. Example: A player completes a trade with a villager. The `entity` property would be the player and the `secondary_entity` would be the villager
     */
    secondary_entity:IEntity;
}

interface IEntityCarriedItemChangedEventData {
    /**
     * The item that is now in the entities hands
     */
    carried_item:IItemStack;
    /**
     * The entity that changed what they were carrying
     */
    entity:IEntity;
    /**
     * Defines which hand the item was equipped to. Either main or offhand.
     */
    hand:string;
    /**
     * The item that was previously in the entities hands
     */
    previous_carried_item:IItemStack;
}

interface IEntityCreatedEventData {
    /**
     * The entity that was just created
     */
    entity:IEntity;
}

interface IEntityDefinitionEventEventData {
    /**
     * The entity that was affected
     */
    entity:IEntity;
    /**
     * The event that was triggered
     */
    event:string;
}

interface IEntityDeathEventData {
    /**
     * JavaScript Object.
     * The position of the block that killed the entity
     */
    block_position:VectorXYZ;
    /**
     * The cause of the entity's death
     */
    cause:MinecraftDamageSource;
    /**
     * The entity that died
     */
    entity:IEntity;
    /**
     * The entity that killed the entity
     */
    killer:IEntity;
    /**
     * The type of the projectile that killed the entity
     */
    projectile_type:string;
}

interface IEntityDroppedItemEventData {
    /**
     * The entity who dropped the item
     */
    entity:IEntity;
    /**
     * The item that was dropped
     */
    item_stack:IItemStack;
}

interface IEntityEquippedArmorEventData {
    /**
     * The entity who is equipping the armor
     */
    entity:IEntity;
    /**
     * The armor that is being equipped
     */
    item_stack:IItemStack;
    /**
     * Defines which slot the item was equipped to.
     */
    slot:string;
}

interface IEntityHurtEventData {
    /**
     * Integer.
     * The amount the damage was reduced by by the entity's absorption effect
     */
    absorbed_damage:number;
    /**
     * Present only when damaged by an entity or projectile. The entity that attacked and caused the damage
     */
    attacker:IEntity;
    /**
     * Present only when damaged by a block. This is the position of the block that hit the entity
     */
    block_position:VectorArray;
    /**
     * The way the entity took damage. Refer to the Damage Source documentation for a complete list of sources
     */
    cause:MinecraftDamageSource;
    /**
     * Integer.
     * The amount of damage the entity took after immunity and armor are taken into account
     */
    damage:number;
    /**
     * The entity that took damage
     */
    entity:IEntity;
    /**
     * Present only when damaged by a projectile. This is the identifier of the projectile that hit the entity
     */
    projectile_type:string;
}

interface IEntityMoveEventData {
    /**
     * The entity that moved
     */
    entity:IEntity;
}

interface IEntitySneakEventData {
    /**
     * The entity that changed their sneaking state
     */
    entity:IEntity;
    /**
     * If true, the entity just started sneaking. If false, the entity just stopped sneaking
     */
    sneaking:boolean;
}

interface IEntityStartRidingEventData {
    /**
     * The rider
     */
    entity:IEntity;
    /**
     * The entity being ridden
     */
    ride:IEntity;
}

interface IEntityStopRidingEventData {
    /**
     * The entity that was riding another entity
     */
    entity:IEntity;
    /**
     * If true, the rider stopped riding because they are now dead
     */
    entity_is_being_destroyed:boolean;
    /**
     * If true, the rider stopped riding by their own decision
     */
    exit_from_rider:boolean;
    /**
     * If true, the rider stopped riding because they are now riding a different entity
     */
    switching_rides:boolean;
}

interface IEntityTickEventData {
    /**
     * The entity that was ticked
     */
    entity:IEntity;
}

interface IEntityUseItemEventData {
    /**
     * The entity who is using the item
     */
    entity:IEntity;
    /**
     * The item that is being used
     */
    item_stack:IItemStack;
    /**
     * The way the entity used the item
     */
    use_method:string;
}

interface IBlockDestructionStartedEventData {
    /**
     * JavaScript Object.
     * The position of the block that is being destroyed
     */
    block_position:VectorXYZ;
    /**
     * The player that started destoying the block
     */
    player:IEntity;
}

interface IBlockDestructionStoppedEventData {
    /**
     * JavaScript Object.
     * The position of the block that was being destroyed
     */
    block_position:VectorXYZ;
    /**
     * How far along the destruction was before it was stopped (0 - 1 range)
     */
    destruction_progress:number;
    /**
     * The player that stopped destoying the block
     */
    player:IEntity;
}

interface IBlockExplodedEventData {
    /**
     * The identifier of the block that was destroyed
     */
    block_identifier:string;
    /**
     * JavaScript Object.
     * The position of the block that was destroyed by the explosion
     */
    block_position:VectorXYZ;
    /**
     * The cause of the block's destruction
     */
    cause:MinecraftDamageSource;
    /**
     * The entity that exploded
     */
    entity:IEntity;
}

interface IBlockInteractedWithEventData {
    /**
     * JavaScript Object.
     * The position of the block that is being interacted with
     */
    block_position:VectorXYZ;
    /**
     * The player that interacted with the block
     */
    player:IEntity;
}

interface IPistonMovedBlockEventData {
    /**
     * JavaScript Object.
     * The position of the block that was moved
     */
    block_position:VectorXYZ;
    /**
     * The action the piston took, "extended" or "retracted"
     */
    piston_action:string;
    /**
     * JavaScript Object.
     * The position of the piston that moved the block
     */
    piston_position:VectorXYZ;
}

interface IPlayerDestroyedBlockEventData {
    /**
     * The identifier of the block that was destroyed
     */
    block_identifier:string;
    /**
     * JavaScript Object.
     * The position of the block that was destroyed
     */
    block_position:VectorXYZ;
    /**
     * The player that destroyed the block
     */
    player:IEntity;
}

interface IPlayerPlacedBlockEventData {
    /**
     * JavaScript Object.
     * The position of the block that was placed
     */
    block_position:VectorXYZ;
    /**
     * The player that placed the block
     */
    player:IEntity;
}

interface IPlaySoundEventData {
    /**
     * The pitch of the sound effect. A value of 1.0 will play the sound effect with regular pitch
     * @default 1.0
     */
    pitch:number;
    /**
     * The position in the world we want to play the sound at
     * @default [0, 0, 0]
     */
    position:VectorArray;
    /**
     * The identifier of the sound you want to play. Only sounds defined in the applied resource packs can be played
     */
    sound:string;
    /**
     * The volume of the sound effect. A value of 1.0 will play the sound effect at the volume it was recorded at
     * @default 1.0
     */
    volume:number;
}

interface IProjectileHitEventData {
    /**
     * The entity that was hit by the projectile, if any
     */
    entity:IEntity;
    /**
     * The entity that fired the projectile
     */
    owner:IEntity;
    /**
     * The position of the collision
     */
    position:VectorArray;
    /**
     * The projectile in question
     */
    projectile:IEntity;
}

interface IWeatherChangedEventData {
    /**
     * The name of the dimension where the weather change happened
     */
    dimension:string;
    /**
     * Tells if the new weather has lightning
     */
    lightning:boolean;
    /**
     * Tells if the new weather has rain
     */
    raining:boolean;
}

interface IEntityDefinitionEventParameters {
    /**
     * The entity object you want to attach the effect to
     */
    entity:IEntity;
    /**
     * The identifier of the event to trigger on that entity. Both built-in (minecraft:) and custom events are supported
     */
    event:string;
}

interface IDisplayChatEventParameters {
    /**
     * The chat message that will be displayed
     */
    message:string;
}

interface IExecuteCommandParameters {
    /**
     * The command that will be run
     */
    command:string;
}

interface IPlaySoundParameters {
    /**
     * The pitch of the sound effect. A value of 1.0 will play the sound effect with regular pitch
     * @default 1.0
     */
    pitch:number;
    /**
     * The position in the world we want to play the sound at
     * @default [0, 0, 0]
     */
    position:VectorArray;
    /**
     * The identifier of the sound you want to play. Only sounds defined in the applied resource packs can be played
     */
    sound:string;
    /**
     * The volume of the sound effect. A value of 1.0 will play the sound effect at the volume it was recorded at
     * @default 1.0
     */
    volume:number;
}

interface ISpawnParticleAttachedEntityParameters {
    /**
     * The identifier of the particle effect you want to attach to the entity. This is the same identifier you gave the effect in its JSON file
     */
    effect:MinecraftParticleEffect;
    /**
     * The entity object you want to attach the effect to
     */
    entity:IEntity;
    /**
     * The offset from the entity's "center" where you want to spawn the effect
     * @default [0, 0, 0]
     */
    offset:VectorArray;
}

interface ISpawnParticleInWorldParameters {
    /**
     * The dimension in which you want to spawn the effect. Can be "overworld", "nether", or "the end"
     * @default overworld
     */
    dimension:string;
    /**
     * The identifier of the particle effect you want to attach to spawn. This is the same name you gave the effect in its JSON file
     */
    effect:MinecraftParticleEffect;
    /**
     * The position in the world where you want to spawn the effect
     * @default [0, 0, 0]
     */
    position:VectorArray;
}

interface IScriptLoggerConfigParameters {
    /**
     * Set to true to log any scripting errors that occur on the server
     * @default false
     */
    log_errors:boolean;
    /**
     * Set to true to log any general scripting information that occurs on the server. This includes any logging done with server.log()
     * @default false
     */
    log_information:boolean;
    /**
     * Set to true to log any scripting warnings that occur on the server
     * @default false
     */
    log_warnings:boolean;
}

interface MinecraftComponentNameMap {
    "minecraft:weather":IComponent<IWeatherComponent>;
    "minecraft:attack":IComponent<IAttackComponent>;
    "minecraft:collision_box":IComponent<ICollisionBoxComponent>;
    "minecraft:damage_sensor":IComponent<IDamageSensorComponent>;
    "minecraft:equipment":IComponent<IEquipmentComponent>;
    "minecraft:equippable":IComponent<IEquippableComponent>;
    "minecraft:explode":IComponent<IExplodeComponent>;
    "minecraft:healable":IComponent<IHealableComponent>;
    "minecraft:health":IComponent<IHealthComponent>;
    "minecraft:interact":IComponent<IInteractComponent>;
    "minecraft:inventory":IComponent<IInventoryComponent>;
    "minecraft:lookat":IComponent<ILookatComponent>;
    "minecraft:nameable":IComponent<INameableComponent>;
    "minecraft:position":IComponent<IPositionComponent>;
    "minecraft:rotation":IComponent<IRotationComponent>;
    "minecraft:shooter":IComponent<IShooterComponent>;
    "minecraft:spawn_entity":IComponent<ISpawnEntityComponent>;
    "minecraft:teleport":IComponent<ITeleportComponent>;
    "minecraft:ticking_area_description":IComponent<ITickingAreaDescriptionComponent>;
    "minecraft:tick_world":IComponent<ITickWorldComponent>;
    "minecraft:transformation":IComponent<ITransformationComponent>;
}

interface MinecraftServerEventNameMap {
    "minecraft:entity_definition_event":IEventData<IEntityDefinitionEventParameters>;
    "minecraft:display_chat_event":IEventData<IDisplayChatEventParameters>;
    "minecraft:execute_command":IEventData<IExecuteCommandParameters>;
    "minecraft:play_sound":IEventData<IPlaySoundParameters>;
    "minecraft:spawn_particle_attached_entity":IEventData<ISpawnParticleAttachedEntityParameters>;
    "minecraft:spawn_particle_in_world":IEventData<ISpawnParticleInWorldParameters>;
    "minecraft:script_logger_config":IEventData<IScriptLoggerConfigParameters>;
}

interface MinecraftClientEventNameMap {
    "minecraft:entity_attack":IEventData<IEntityAttackEventData>;
    "minecraft:player_attacked_entity":IEventData<IPlayerAttackedEntityEventData>;
    "minecraft:entity_acquired_item":IEventData<IEntityAcquiredItemEventData>;
    "minecraft:entity_carried_item_changed":IEventData<IEntityCarriedItemChangedEventData>;
    "minecraft:entity_created":IEventData<IEntityCreatedEventData>;
    "minecraft:entity_definition_event":IEventData<IEntityDefinitionEventEventData>;
    "minecraft:entity_death":IEventData<IEntityDeathEventData>;
    "minecraft:entity_dropped_item":IEventData<IEntityDroppedItemEventData>;
    "minecraft:entity_equipped_armor":IEventData<IEntityEquippedArmorEventData>;
    "minecraft:entity_hurt":IEventData<IEntityHurtEventData>;
    "minecraft:entity_move":IEventData<IEntityMoveEventData>;
    "minecraft:entity_sneak":IEventData<IEntitySneakEventData>;
    "minecraft:entity_start_riding":IEventData<IEntityStartRidingEventData>;
    "minecraft:entity_stop_riding":IEventData<IEntityStopRidingEventData>;
    "minecraft:entity_tick":IEventData<IEntityTickEventData>;
    "minecraft:entity_use_item":IEventData<IEntityUseItemEventData>;
    "minecraft:block_destruction_started":IEventData<IBlockDestructionStartedEventData>;
    "minecraft:block_destruction_stopped":IEventData<IBlockDestructionStoppedEventData>;
    "minecraft:block_exploded":IEventData<IBlockExplodedEventData>;
    "minecraft:block_interacted_with":IEventData<IBlockInteractedWithEventData>;
    "minecraft:piston_moved_block":IEventData<IPistonMovedBlockEventData>;
    "minecraft:player_destroyed_block":IEventData<IPlayerDestroyedBlockEventData>;
    "minecraft:player_placed_block":IEventData<IPlayerPlacedBlockEventData>;
    "minecraft:play_sound":IEventData<IPlaySoundEventData>;
    "minecraft:projectile_hit":IEventData<IProjectileHitEventData>;
    "minecraft:weather_changed":IEventData<IWeatherChangedEventData>;
}

interface IVanillaServerSystem {
    /**
     * NOTE: Entities are created first on the server, with the client notified of new entities afterwards. Be aware that if you send the result object to the client right away, the created entity might not exist on the client yet.
     * @return An object representing the newly created entity
     */
    createEntity():IEntity;
    /**
     * NOTE: Entities are created first on the server, with the client notified of new entities afterwards. Be aware that if you send the result object to the client right away, the created entity might not exist on the client yet.
     * @param type Specifies the type of the entity that is being created by the template. Valid inputs are `entity` and `item_entity`
     * @param templateIdentifier This can be any of the entity identifiers from the applied Behavior Packs. For example specifying minecraft:cow here will make the provided entity a cow as defined in JSON
     * @return An object representing the newly created entity
     */
    createEntity(type:string, templateIdentifier:string):IEntity;
    /**
     * @param entityObject The object that was retrieved from a call to createEntity() or retrieved from an entity event
     * @return The entity was successfully destroyed
     */
    destroyEntity(entityObject:IEntity):boolean;
    /**
     * @param entityObject The object that was retrieved from a call to createEntity() or retrieved from an entity event
     * @return The entity is in the Script Engine's database of entities
     */
    isValidEntity(entityObject:IEntity):boolean;
    /**
     * @param componentIdentifier The identifier of the custom component. It is required to use a namespace so you can uniquely refer to it later without overlapping a name with a built-in component: for example 'myPack:myCustomComponent'
     * @param componentData JavaScript Object.
     *    A JavaScript Object that defines the name of the fields and the data each field holds inside the component.
     * @return The component was successfully registered
     */
    registerComponent(componentIdentifier:string, componentData:any):boolean;
    /**
     * @param eventIdentifier This is the identifier of the custom event we are registering. The namespace is required and can't be set to minecraft.
     * @param eventData JavaScript Object.
     *    The JavaScript object with the correct fields and default values for the event
     * @return Successfully registered the event data
     */
    registerEventData(eventIdentifier:string, eventData:any):boolean;
    /**
     * Allows you to register a query. A query will contain all entities that meet the filter requirement.No filters are added by default when you register a query so it will capture all entities.
     * @return An object containing the ID of the query
     */
    registerQuery():IQuery;
    /**
     * Allows you to register a query that will only show entities that have the given component and define which fields of that component will be used as a filter when getting the entities from the query. You can either provide just the component identifier, or the component identifier and the name of 3 properties on that component to be tested (If you do specify property names, you must specify 3).
     * @param component This is the identifier of the component that will be used to filter entities when
     * @param componentField1 This is the name of the first field of the component that we want to filter entities by. By default this is set to x.
     *    @default "x"
     * @param componentField2 This is the name of the second field of the component that we want to filter entities by. By default this is set to y.
     *    @default "y"
     * @param componentField3 This is the name of the third field of the component that we want to filter entities by. By default this is set to z.
     *    @default "z"
     * @return An object containing the ID of the query
     */
    registerQuery(component:string, componentField1?:string, componentField2?:string, componentField3?:string):IQuery;
    /**
     * Allows you to add filters to your query. The query will only contain entities that have all the components specified.By default no filters are added. This will allow queries to capture all entities.
     * @param query The object containing the ID of the query that you want to apply the filter to
     * @param componentIdentifier This is the identifier of the component that will be added to the filter list. Only entities that have that component will be listed in the query
     */
    addFilterToQuery(query:IQuery, componentIdentifier:string):void;
    /**
     * Allows you to fetch the entities captured by a query.
     * @param query This is the query you registered earlier using registerQuery()
     * @return An array of EntityObjects representing the entities found within the query
     */
    getEntitiesFromQuery(query:IQuery):IEntity[];
    /**
     * Allows you to fetch the entities captured by a query that was created with a component filter built-in. The only entities that will be returned are those entities that have the component that was defined when the query was registered and that have a value in the three fields on that component that were defined in the query within the values specified in the call to getEntitiesFromQuery.
     * @param query This is the query you created earlier using registerQuery(...)
     * @param componentField1_Min The minimum value that the first component field needs to be on an entity for that entity to be included in the query
     * @param componentField2_Min The minimum value that the second component field needs to be on an entity for that entity to be included in the query
     * @param componentField3_Min The minimum value that the third component field needs to be on an entity for that entity to be included in the query
     * @param componentField1_Max The maximum value that the first component field needs to be on an entity for that entity to be included in the query
     * @param componentField2_Max The maximum value that the second component field needs to be on an entity for that entity to be included in the query
     * @param componentField3_Max The maximum value that the third component field needs to be on an entity for that entity to be included in the query
     * @return An array of EntityObjects representing the entities found within the query
     */
    getEntitiesFromQuery(query:IQuery, componentField1_Min:number, componentField2_Min:number, componentField3_Min:number, componentField1_Max:number, componentField2_Max:number, componentField3_Max:number):IEntity[];
    /**
     * Allows you to get a block from the world when provided an x, y, and z position. The block must be within a ticking area.
     * @param tickingArea The ticking area the block is in
     * @param x Integer.
     *    The x position of the block you want
     * @param y Integer.
     *    The y position of the block you want
     * @param z Integer.
     *    The z position of the block you want
     * @return object
     */
    getBlock(tickingArea:ITickingArea, x:number, y:number, z:number):IBlock|null;
    /**
     * Allows you to get a block from the world when provided a JavaScript object containing a position. The block must be within a ticking area.
     * @param tickingArea The ticking area the block is in
     * @param positionObject A JavaScript object with the x, y, and z position of the block you want
     * @return An object containing the block
     */
    getBlock(tickingArea:ITickingArea, positionObject:VectorXYZ):IBlock|null;
    /**
     * Allows you to get an array of blocks from the world when provided a minimum and maximum x, y, and z position. The blocks must be within a ticking area. This call can be slow if given a lot of blocks, and should be used infrequently.
     * @param tickingArea The ticking area the blocks are in
     * @param xMin Integer.
     *    The minimum x position of the blocks you want
     * @param yMin Integer.
     *    The minimum y position of the blocks you want
     * @param zMin Integer.
     *    The minimum z position of the blocks you want
     * @param xMax Integer.
     *    The maximum x position of the blocks you want
     * @param yMax Integer.
     *    The maximum y position of the blocks you want
     * @param zMax Integer.
     *    The maximum z position of the blocks you want
     * @return array
     */
    getBlocks(tickingArea:ITickingArea, xMin:number, yMin:number, zMin:number, xMax:number, yMax:number, zMax:number):IBlock[][][]|null;
    /**
     * Allows you to get an array of blocks from the world when provided a minimum and maximum position. The blocks must be within a ticking area. This call can be slow if given a lot of blocks, and should be used infrequently.
     * @param tickingArea The ticking area the blocks are in
     * @param minimumPositionObject A JavaScript object with the minimum x, y, and z position of the blocks you want
     * @param maximumPositionObject A JavaScript object with the maximum x, y, and z position of the blocks you want
     * @return A 3D array of block objects. Indexs are the blocks positions relative to the min position given
     */
    getBlocks(tickingArea:ITickingArea, minimumPositionObject:VectorXYZ, maximumPositionObject:VectorXYZ):IBlock[][][]|null;
}

}
export {};
