
/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare global
{
    interface MinecraftComponentNameMap {
        /**
         * This component contains all the blockstates on a block object. Blockstates control all different aspects of blocks from their orientation to the type of wood they are. Blockstates are represented by numbers, bools, or strings. Please see the Blockstates Documentation to see the valid values for each state. This component allows for the getting and setting of these states.
         */
        "minecraft:blockstate":IComponent<IBlockStateComponent>
    }
    type MinecraftComponentName = keyof MinecraftComponentNameMap;

    type MinecraftComponentTypeMap = {
        [key in string]: key extends "minecraft:blockstate" ? IBlock : IEntity;
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
        coral_color?:string;
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
        }
    }
    
    interface IServer {
        registerSystem(majorVersion: number, minorVersion: number): IVanillaServerSystem;
        log(message: string): void;
    }
    
    /**
     * a utility interface that defines a system that is not being actively extended
     */
    interface IVanillaServerSystem {
        /**
         * This is the first method that gets called immediately after the system is registered. It will run as soon as the script loads at world start.
         * You can use this to set up the environment for your script: register custom components and events, sign up event listeners, etc. This will run BEFORE the world is ready and the player has been added to it, so you shouldn't try to spawn any entities here!
         */
        initialize?(this: IVanillaServerSystem): void;
    
        /**
         * This method gets called once every game tick. The server aims to be 200 times per second, while client aims to be 60, 
         * but neither one is guaranteed and can vary with performance. This is a good place to get, check, and react to component changes.
         */
        update?(this: IVanillaServerSystem): void;
    
        /**
         * This method gets called when the Minecraft Script Engine is shutting down. For the client this is when they leave the world; for the server this is after the last player has exited the world.
         */
        shutdown?(this: IVanillaServerSystem): void;
    
        /**
         * Allows you to register a query that will only show entities that have the given component and define which fields of that component will be used as a filter when getting the entities from the query.
         * 
         * This is the identifier of the component that will be used to filter entities when
         * @param componentField1 This is the name of the first field of the component that we want to filter entities by. By default this is set to x. If the component you used doesn't have the field you defined here, the field will be ignored
         * @param componentField2 This is the name of the second field of the component that we want to filter entities by. By default this is set to y. If the component you used doesn't have the field you defined here, the field will be ignored
         * @param componentField3 This is the name of the third field of the component that we want to filter entities by. By default this is set to z. If the component you used doesn't have the field you defined here, the field will be ignored
         */
        registerQuery(component: MinecraftComponentName, componentField1?: string, componentField2?: string, componentField3?: string): IQuery;
        
        /**
         * Allows you to execute a Slash Command on the server. The command will be queried and executed at the end of the current frame. All data output from the command will be compiled on a JavaScript Object and sent to the Callback object specified in the second parameter.
         * @param command The slash command to run
         * @param callback The JavaScript object that will be called after the command executes
         * 
         */
        executeCommand(command: string, callback: (callback: IExecuteCommandCallback) => void): void;
        
        /**
         * Removes the specified component from the given entity. If the entity has the component, it will be removed. Currently this only works with custom components and can't be used to remove components defined for an entity in JSON.
         * @param entityObject The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
         * @param componentIdentifier The identifier of the component to remove from the entity. This is either the identifier of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
         * @return true The component was successfully removed from the entity
         * @return null The entity did not have the component or something went wrong when removing the component
         */
        destroyComponent<NAME extends MinecraftComponentName>(entityObject: MinecraftComponentTypeMap[NAME], componentIdentifier: NAME): true|null;
        destroyComponent(entityObject: IEntity|IBlock, componentIdentifier: string): true|null;
    
        /**
         * Checks if the given entity has the specified component.
         * @param entityObject The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
         * @param componentIdentifier The identifier of the component to check on the entity. This is either the identifier of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
         * @return true The EntityObject has the component
         * @return false The EntityObject doesn't have the component
         * @return null An unknown component was passed in or something else went wrong when checking if the EntityObject had the component
         */
        hasComponent<NAME extends MinecraftComponentName>(entityObject: MinecraftComponentTypeMap[NAME], componentIdentifier: NAME): boolean|null;
        hasComponent(entityObject: IEntity|IBlock, componentIdentifier: string): boolean|null;
        
        /**
         * Creates a component of the specified name and adds it to the entity. This should only be used with custom components which need 
         * to be registered first. If the entity already has the component, this will retrieve the component already there instead.
         * @param entity The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
         * @param componentName The name of the component to add to the entity. This is either the name of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
         * @returns An object with all the fields as defined in the component, or null if something went wrong when creating the component
         */
        createComponent<NAME extends MinecraftComponentName>(entity: MinecraftComponentTypeMap[NAME], componentName: NAME): MinecraftComponentNameMap[NAME] | null;
        createComponent(entity: IEntity|IBlock, componentName: string): IComponent<any> | null;
    
        /**
         * Looks for the specified component in the entity. If it exists, retrieves the data from the component and returns it.
         * @param entity The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
         * @param componentIdentifier The name of the component to retrieve from the entity. This is either the name of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
         * @returns An object containing the data of the component as described in the component itself, or null if the entity did not have the component or something went wrong when getting the component
         */
        getComponent<NAME extends MinecraftComponentName>(entity: MinecraftComponentTypeMap[NAME], componentName: NAME): MinecraftComponentNameMap[NAME] | null;
        getComponent(entity: IEntity|IBlock, componentName: string): IComponent<any> | null;
    
        /**
         * Creates a component of the specified name and adds it to the entity. This should only be used with custom components which need 
         * to be registered first. If the entity already has the component, this will retrieve the component already there instead.
         * @param entity The EntityObject that was retrieved from a call to createEntity() or retrieved from an event
         * @param componentName The name of the component to add to the entity. This is either the name of a built-in component (check the Script Components section) or a custom component created with a call to registerComponent()
         * @returns An object with all the fields as defined in the component, or null if something went wrong when creating the component
         */
        applyComponentChanges<NAME extends MinecraftComponentName>(entity: MinecraftComponentTypeMap[NAME], componentName: NAME): boolean;
        applyComponentChanges(entity: IEntity|IBlock, componentName: string): boolean;
    
        ////////////////////////////////////////////////
        // Entities
        ////////////////////////////////////////////////

        /**
         * Creates an object with all the required fields and default data for the specified event. If the event is a custom event, it needs to have been previously registered.
         * 
         * @param eventIdentifier This is the identifier of the custom event we are registering. The namespace is required and can't be set to minecraft. 
         */
        createEventData<EVENT extends MinecraftServerEventName>(eventIdentifier:EVENT):MinecraftServerEventNameMap[EVENT]|null;
        createEventData(eventIdentifier:string):IEventData<any>|null;
    
        /**
         * 
         * @param eventIdentifier Allows you to trigger an event with the desired data from script. 
         * Anything that signed up to listen for the event will be notified and the given data delivered to them.
         * @param eventData The data for the event. You can create a new JavaScript Object with the parameters you want to pass in to the listener and the engine will take care of delivering the data to them
         */
        broadcastEvent<EVENT extends MinecraftServerEventName>(eventIdentifier:EVENT, eventData: MinecraftServerEventNameMap[EVENT]): boolean | null;
        broadcastEvent(eventIdentifier:string, eventData: IEventData<any>): boolean | null;
        
        /**
         * Allows you to register a JavaScript object that gets called whenever the specified event is broadcast. The event can either be a built-in event or an event specified in script.
         * @param eventIdentifier This is the name of the event to which we want to react. Can be the identifier of a built-in event or a custom one from script
         * @param eventData The name of the JavaScript object that will get called whenever the event is broadcast
         */
        listenForEvent<EVENT extends MinecraftClientEventName>(eventIdentifier:EVENT, listener: (ev:MinecraftClientEventNameMap[EVENT])=>void): boolean | null;
        listenForEvent(eventIdentifier:string, listener: (ev:IEventData<any>)=>void): boolean | null;
    }

    const server: IServer;
}

export {};
