
/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare global {
    interface MinecraftComponentNameMap {
        /**
         * This component contains all the blockstates on a block object. Blockstates control all different aspects of blocks from their orientation to the type of wood they are. Blockstates are represented by numbers, bools, or strings. Please see the Blockstates Documentation to see the valid values for each state. This component allows for the getting and setting of these states.
         */
        "minecraft:blockstate":IComponent<IBlockStateComponent>;
        /**
         * This component represents the contents of an entity's hands. The component contains an array of ItemStack JS API Objects representing each slot in the hand container. NOTE: Currently items and containers are read-only. Slot 0 is main-hand Slot 1 is off-hand.
         */
        "minecraft:hand_container":IComponent<IItemStack[]>;
    }
    type MinecraftComponentName = keyof MinecraftComponentNameMap;

    type MinecraftComponentTypeMap = {
        [key in keyof MinecraftComponentNameMap]: key extends "minecraft:blockstate" ? IBlock : IEntity;
    };

    interface IComponent<T> {
        /**
         * The type of the object
         */
        readonly __type__:"component";

        /**
         * The identifier of the component, e.g., "minecraft:position", or "minecraft:nameable"
         */
        readonly __identifier__:string;

        data:T;
    }

    interface IEventData<T> {
        /**
         * The type of the object
         */
        readonly __type__: 'event_data';

        /**
         * The identifier of the event
         */
        readonly __identifier__: string;

        data: T;
    }

    /**
     * not documented
     */
    interface IBlockstateComponent {
        age_bit:any;
        age:any;
        attached_bit:any;
        portal_axis:any;
        bite_counter:any;
        brewing_stand_slot_a_bit:any;
        brewing_stand_slot_b_bit:any;
        brewing_stand_slot_c_bit:any;
        button_pressed_bit:any;
        conditional_bit:any;
        covered_bit:any;
        damage:any;
        disarmed_bit:any;
        door_hinge_bit:any;
        upper_block_bit:any;
        direction:any;
        end_portal_eye_bit:any;
        explode_bit:any;
        facing_direction:any;
        fill_level:any;
        growth:any;
        head_piece_bit:any;
        height:any;
        infiniburn_bit:any;
        in_wall_bit:any;
        liquid_depth:any;
        moisturized_amount:any;
        no_drop_bit:any;
        kelp_age:any;
        occupied_bit:any;
        open_bit:any;
        output_subtract_bit:any;
        output_lit_bit:any;
        persistent_bit:any;
        powered_bit:any;
        rail_data_bit:any;
        rail_direction:any;
        redstone_signal:any;
        repeater_delay:any;
        suspended_bit:any;
        toggle_bit:any;
        top_slot_bit:any;
        triggered_bit:any;
        update_bit:any;
        upside_down_bit:any;
        bine_direction_bits:any;
        allow_underwater_bit:any;
        color_bit:any;
        dead_bit:any;
        cluster_count:any;
        item_frame_map_bit:any;
        sapling_type:any;
        torch_facing_direction:any;
        drag_down:any;
        turtle_egg_count:any;
        cracked_state:any;
        ground_sign_direction:any;
        weirdo_direction:any;
        coral_direction:any;
        color:any;
        bamboo_stalk_thickness:any;
        bamboo_leaf_size:any;
        stability:any;
        stability_check:any;
        wood_type:any;
        stone_type:any;
        dirt_type:any;
        sand_type:any;
        old_log_type:any;
        new_log_type:any;
        chisel_type:any;
        deprecated:any;
        old_leaf_type:any;
        new_leaf_type:any;
        sponge_type:any;
        sand_stone_type:any;
        tall_grass_type:any;
        flower_type:any;
        stone_slab_type:any;
        stone_slab_type_2:any;
        stone_slab_type_3:any;
        stone_slab_type_4:any;
        monster_egg_stone_type:any;
        stone_brick_type:any;
        huge_mushroom_bits:any;
        wall_block_type:any;
        prismarine_block_type:any;
        double_plant_type:any;
        chemistry_table_type:any;
        sea_grass_type:any;
        coral_color:string;
        cauldron_linquid:any;
        haning:any;
        stripped_bit:any;
        coral_hang_type_bit:any;
        attachment:any;
        structure_void_type:any;
        structure_block_type:any;
        extinguished:any;
        composter_fill_level:any;
        coral_fan_direction:any;
        lever_direction:any;
        pillar_axis:any;
        block_light_level:any;
        honey_level:any;
        weeping_vines_age:any;
        wall_post_bit:any;
        wall_connection_type_north:any;
        wall_connection_type_east:any;
        wall_connection_type_south:any;
        wall_connection_type_west:any;
        rotation:any;
        twisting_vines_age:any;
        respawn_anchor_charge:any;
        [key:string]:any;
    }

    type VectorArray = [number, number, number];

    interface VectorXYZ {
        x: number;
        y: number;
        z: number;
    }

    interface Range {
        range_min: number;
        range_max: number;
    }

    interface Int64 {
        "64bit_low": number;
        "64bit_high": number;
    }

    interface MinecraftTrigger {
        event: string;
        filters: MinecraftFilter;
        target: string;
    }

    interface MinecraftFilter {
        all_of?: MinecraftFilter[];
        any_of?: MinecraftFilter[];

        test?: string;
        subject?: "other" | "parent" | "player" | "self" | "target";
        operator?: "!=" | "<" | "<=" | "<>" | "=" | "==" | ">" | ">=" | "equals" | "not";
        domain?: string;
        value?: any;
    }

    type MinecraftDimension = 'overworld' | 'nether' | 'the end';
    type ILookAtComponent = ILookatComponent;
    type IDisplayChatParameters = IDisplayChatEventParameters;
    type IBlockStateComponent = IBlockstateComponent;

    type MinecraftServerEventName = keyof MinecraftServerEventNameMap;
    type MinecraftClientEventName = keyof MinecraftClientEventNameMap;

    interface IExecuteCommandCallback {
        command: string;
        data: {
            statusMessage: string;
            statusCode: number;
            [key:string]:any;
        }
    }
    interface IExecuteCommandListCallback {
        command: 'list';
        data: {
            currentPlayerCount:number;
            maxPlayerCount:number;
            players:string;
            statusMessage: string;
            statusCode: number;
        }
    }
    interface IExecuteCommandTestForCallback {
        command: 'testfor';
        data: {
            victim:string[];
            statusMessage: string;
            statusCode: number;
        }
    }
    interface IExecuteCommandTestForBlockCallback {
        command: 'testforblock';
        data: {
            matches: boolean,
            position: VectorXYZ,
            statusMessage: string;
            statusCode: number;
        }
    }
    interface IExecuteCommandTestForBlocksCallback {
        command: 'testforblocks';
        data: {
            compareCount: number;
            matches: boolean,
            statusMessage: string;
            statusCode: number;
        }
    }
}

export {};
