
/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare global
{
    interface IItemStack {
        /**
         * The type of the object
         */
        readonly __type__: "item_stack";
    
        /**
         * The identifier of the item stack
         */
        readonly __identifier__: string;
    
        /**
         * The identifier of the item
         */
        readonly item: string;
    
        /**
         * The number of items in the stack
         */
        readonly count: number;
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
    type ITickingArea = IEntityTickingArea | ILevelTickingArea;
    
    interface IEntityTickingArea {
        /**
         * The type of the object
         */
        readonly __type__: "entity_ticking_area";
    
        /**
         * The unique identifier of the ticking area
         */
        readonly entity_ticking_area_id: Int64;
    }
    
    interface ILevelTickingArea {
        /**
         * The type of the object
         */
        readonly __type__: "level_ticking_area";
    
        /**
         * The uuid of the ticking area
         */
        readonly level_ticking_area_id: string;
    }
    interface IQuery {
        /**
         * The type of the object
         */
        readonly __type__: "query";
    
        /**
         * READ ONLY. This is the unique identifier of the query
         */
        readonly query_id: number;
    }
    interface IBlock {
        /**
         * The type of the object
         */
        readonly __type__: "block";
    
        /**
         * The identifier of the block
         */
        readonly __identifier__: string;
    
        /**
         * This is the ticking area object that was used to get this block
         */
        readonly ticking_area: ITickingArea;
    
        /**
         * This is the position of the block. It also functions as part of its unique identifier
         */
        readonly block_position: VectorXYZ;
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
    
    interface IEntity
    {
        __unique_id__:Int64;
            
        /**
         * READ ONLY. The type of the entity
         */
        readonly __type__: "entity" | "item_entity";
    
        /**
         * The identifier of the entity, e.g., "minecraft:sheep", or "minecraft:pumpkin_seeds"
         */
        readonly __identifier__: string;
    
        /**
         * READ ONLY. This is the unique identifier of the query
         */
        readonly id: number;
    }
}

export {};
