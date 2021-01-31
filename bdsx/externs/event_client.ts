import "./component";

/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare global
{
    interface MinecraftClientEventNameMap
    {
        /**
         * This event is triggered whenever a player starts to destroy a block.
         */
        'minecraft:block_destruction_started': IEventData<IBlockDestructionStartedEventData>;
        /**
         * This event is triggered whenever a player stops destroying a block.
         */
        'minecraft:block_destruction_stopped': IEventData<IBlockDestructionStoppedEventData>;
        /**
         * This event is triggered whenever a player interacts with a block.
         */
        'minecraft:block_interacted_with': IEventData<IBlockInteractedWithEventData>;
        /**
         * This event is triggered whenever an entity acquires an item.
         */
        'minecraft:entity_acquired_item': IEventData<IEntityAcquiredItemEventData>;
        /**
         * This event is triggered whenever an entity changes the item carried in their hand.
         */
        'minecraft:entity_carried_item_changed': IEventData<IEntityCarriedItemChangedEventData>;
        /**
         * This event is triggered whenever an entity is added to the world.
         */
        'minecraft:entity_created': IEventData<IEntityCreatedEventData>;
        /**
         * This event is triggered whenever an entity dies. This won't be triggered when an entity is removed (such as when using destroyEntity).
         */
        'minecraft:entity_death': IEventData<IEntityDeathEventData>;
        /**
         * This event is triggered whenever an entity drops an item.
         */
        'minecraft:entity_dropped_item': IEventData<IEntityDroppedItemEventData>;
        /**
         * This event is triggered whenever an entity equips an item in their armor slots.
         */
        'minecraft:entity_equipped_armor': IEventData<IEntityEquippedArmorEventData>;
        /**
         * This event is triggered whenever an entity becomes a rider on another entity.
         */
        'minecraft:entity_start_riding': IEventData<IEntityStartRidingEventData>;
        /**
         * This event is triggered whenever an entity stops riding another entity.
         */
        'minecraft:entity_stop_riding': IEventData<IEntityStopRidingEventData>;
        /**
         * This event is triggered whenever an entity is ticked. This event will not fire when a player is ticked.
         */
        'minecraft:entity_tick': IEventData<IEntityTickEventData>;
        /**
         * This event is triggered whenever an entity uses an item.
         */
        'minecraft:entity_use_item': IEventData<IEntityUseItemEventData>;
        /**
         * This event is triggered whenever a piston moves a block.
         */
        'minecraft:piston_moved_block': IEventData<IPistonMovedBlockEventData>;
        /**
         * This event is used to play a sound effect. Currently, sounds can only be played at a fixed position in the world. Global sounds and sounds played by an entity will be supported in a later update.
         */
        'minecraft:play_sound': IEventData<IPlaySoundEventData>;
        /**
         * This event is triggered whenever a player attacks an entity.
         */
        'minecraft:player_attacked_entity': IEventData<IPlayerAttackedEntityEventData>;
        /**
         * This event is triggered whenever a player destroys a block.
         */
        'minecraft:player_destroyed_block': IEventData<IPlayerDestroyedBlockEventData>;
        /**
         * This event is triggered whenever a player places a block.
         */
        'minecraft:player_placed_block': IEventData<IPlayerPlacedBlockEventData>;
        /**
         * This event is triggered whenever the weather changes. It contains information about the weather it is changing to.
         */
        'minecraft:weather_changed': IEventData<IWeatherChangedEventData>;
    }
    type MinecraftClientEventName = keyof MinecraftClientEventNameMap;
    
    
    /**
     * This event is triggered whenever a player starts to destroy a block.
     */
    interface IBlockDestructionStartedEventData {
        /**
         * The position of the block that is being destroyed
         */
        block_position: VectorXYZ;
        /**
         * The player that started destoying the block
         */
        player: IEntity;
    }
    
    /**
     * This event is triggered whenever a player stops destroying a block.
     */
    interface IBlockDestructionStoppedEventData {
        /**
         * The position of the block that was being destroyed
         */
        block_position: VectorXYZ;
        /**
         * How far along the destruction was before it was stopped (0 - 1 range)
         */
        destruction_progress: number;
        /**
         * The player that stopped destoying the block
         */
        player: IEntity;
    }
    
    /**
     * This event is triggered whenever a player interacts with a block.
     */
    interface IBlockInteractedWithEventData {
        /**
         * The position of the block that is being interacted with
         */
        block_position: VectorXYZ;
        /**
         * The player that interacted with the block
         */
        player: IEntity;
    }
    
    /**
     * This event is triggered whenever an entity acquires an item.
     */
    interface IEntityAcquiredItemEventData {
        /**
         * The total number of items acquired by the entity during this event
         */
        acquired_amount: number;
        /**
         * The way the entity acquired the item
         */
        acquisition_method: string;
        /**
         * The entity who acquired the item
         */
        entity: IEntity;
        /**
         * The item that was acquired
         */
        item_stack: IItemStack;
        /**
         * If it exists, the entity that affected the item before it was acquired. Example: A player completes a trade with a villager. The `entity` property would be the player and the `secondary_entity` would be the villager
         */
        secondary_entity: IEntity;
    }
    
    /**
     * This event is triggered whenever an entity changes the item carried in their hand.
     */
    interface IEntityCarriedItemChangedEventData {
        /**
         * The item that is now in the entities hands
         */
        carried_item: IItemStack;
        /**
         * The entity that changed what they were carrying
         */
        entity: IEntity;
        /**
         * The item that was previously in the entities hands
         */
        previous_carried_item: IItemStack;
    }
    
    /**
     * This event is triggered whenever an entity is added to the world.
     */
    interface IEntityCreatedEventData {
        /**
         * The entity that was just created
         */
        entity: IEntity;
    }
    
    /**
     * This event is triggered whenever an entity dies. This won't be triggered when an entity is removed (such as when using destroyEntity).
     */
    interface IEntityDeathEventData {
        /**
         * The entity that died
         */
        entity: IEntity;
    }
    
    /**
     * This event is triggered whenever an entity drops an item.
     */
    interface IEntityDroppedItemEventData {
        /**
         * The entity who dropped the item
         */
        entity: IEntity;
        /**
         * The item that was dropped
         */
        item_stack: IItemStack;
    }
    
    /**
     * This event is triggered whenever an entity equips an item in their armor slots.
     */
    interface IEntityEquippedArmorEventData {
        /**
         * The entity who is equipping the armor
         */
        entity: IEntity;
        /**
         * The armor that is being equipped
         */
        item_stack: IItemStack;
    }
    
    /**
     * This event is triggered whenever an entity becomes a rider on another entity.
     */
    interface IEntityStartRidingEventData {
        /**
         * The rider
         */
        entity: IEntity;
        /**
         * The entity being ridden
         */
        ride: IEntity;
    }
    
    /**
     * This event is triggered whenever an entity stops riding another entity.
     */
    interface IEntityStopRidingEventData {
        /**
         * The entity that was riding another entity
         */
        entity: IEntity;
        /**
         * If true, the rider stopped riding because they are now dead
         */
        entity_is_being_destroyed: boolean;
        /**
         * If true, the rider stopped riding by their own decision
         */
        exit_from_rider: boolean;
        /**
         * If true, the rider stopped riding because they are now riding a different entity
         */
        switching_rides: boolean;
    }
    
    /**
     * This event is triggered whenever an entity is ticked. This event will not fire when a player is ticked.
     */
    interface IEntityTickEventData {
        /**
         * The entity that was ticked
         */
        entity: IEntity;
    }
    
    /**
     * This event is triggered whenever an entity uses an item.
     */
    interface IEntityUseItemEventData {
        /**
         * The entity who is using the item
         */
        entity: IEntity;
        /**
         * The item that is being used
         */
        item_stack: IItemStack;
        /**
         * The way the entity used the item
         */
        use_method: string;
    }
    
    /**
     * This event is triggered whenever a piston moves a block.
     */
    interface IPistonMovedBlockEventData {
        /**
         * The position of the block that was moved
         */
        block_position: VectorXYZ;
        /**
         * The action the piston took, 'extended' or 'retracted'
         */
        piston_action: string;
        /**
         * The position of the piston that moved the block
         */
        piston_position: VectorXYZ;
    }
    
    /**
     * This event is used to play a sound effect. Currently, sounds can only be played at a fixed position in the world. Global sounds and sounds played by an entity will be supported in a later update.
     */
    interface IPlaySoundEventData {
        /**
         * The pitch of the sound effect. A value of 1.0 will play the sound effect with regular pitch
         * @default 1.0
         */
        pitch: number;
        /**
         * The position in the world we want to play the sound at
         * @default [0, 0, 0]
         */
        position: VectorArray;
        /**
         * The identifier of the sound you want to play. Only sounds defined in the applied resource packs can be played
         */
        sound: string;
        /**
         * The volume of the sound effect. A value of 1.0 will play the sound effect at the volume it was recorded at
         * @default 1.0
         */
        volume: number;
    }
    
    /**
     * This event is triggered whenever a player attacks an entity.
     */
    interface IPlayerAttackedEntityEventData {
        /**
         * The entity that was attacked by the player
         */
        attacked_entity: IEntity;
        /**
         * The player that attacked an entity
         */
        player: IEntity;
    }
    
    /**
     * This event is triggered whenever a player destroys a block.
     */
    interface IPlayerDestroyedBlockEventData {
        /**
         * The identifier of the block that was destroyed
         */
        block_identifier: string;
        /**
         * The position of the block that was destroyed
         */
        block_position: VectorXYZ;
        /**
         * The player that destroyed the block
         */
        player: IEntity;
    }
    
    /**
     * This event is triggered whenever a player places a block.
     */
    interface IPlayerPlacedBlockEventData {
        /**
         * The position of the block that was placed
         */
        block_position: VectorXYZ;
        /**
         * The player that placed the block
         */
        player: IEntity;
    }
    
    /**
     * This event is triggered whenever the weather changes. It contains information about the weather it is changing to.
     */
    interface IWeatherChangedEventData {
        /**
         * The name of the dimension where the weather change happened
         */
        dimension: MinecraftDimension|string;
        /**
         * Tells if the new weather has lightning
         */
        lightning: boolean;
        /**
         * Tells if the new weather has rain
         */
        raining: boolean;
    }
    
    type MinecraftDimension = 'overworld' | 'nether' | 'the end';
}