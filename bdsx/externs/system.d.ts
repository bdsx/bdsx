/// <reference path="./common.d.ts" />
/// <reference path="./event_server.d.ts" />
/// <reference path="./event_client.d.ts" />
/// <reference path="./component.d.ts" />

/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare const server: IServer;

interface IExecuteCommandCallback {
    command: string;
    data: {
        statucMessage: string;
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
    registerQuery(component?: MinecraftComponentName | string, componentField1?: string, componentField2?: string, componentField3?: string): IQuery | null;

    
    ////////////////////////////////////////////////
    // Blocks
    ////////////////////////////////////////////////
    /**
     * Allows you to get a block from the world when provided an x, y, and z position. The block must be within a ticking area.
     * @param tickingArea The ticking area the block is in
     * @param x The x position of the block you want
     * @param y The y position of the block you want
     * @param z The z position of the block you want
     * @return object An object containing the block
     * @return null Something went wrong when retrieving the block
     */
    getBlock(tickingArea: ITickingArea, x: number, y: number, z: number): IBlock | null;
    /**
     * Allows you to get a block from the world when provided a JavaScript object containing a position. The block must be within a ticking area.
     * @param tickingArea The ticking area the block is in
     * @param positionObject A JavaScript object with the x, y, and z position of the block you want
     * @return object An object containing the block
     * @return null Something went wrong when retrieving the block
     */
    getBlock(tickingArea: ITickingArea, positionObject: VectorXYZ): IBlock | null;
    /**
     * Allows you to get an array of blocks from the world when provided a minimum and maximum x, y, and z position. The blocks must be within a ticking area.
     * @param tickingArea The ticking area the blocks are in
     * @param xMin The minimum x position of the blocks you want
     * @param yMin The minimum y position of the blocks you want
     * @param zMin The minimum z position of the blocks you want
     * @param xMax The maximum x position of the blocks you want
     * @param yMax The maximum y position of the blocks you want
     * @param zMax The maximum z position of the blocks you want
     * @return undefined A 3D array of block objects. Indexs are the blocks positions relative to the min position given
     * @return null Something went wrong when retrieving the blocks
     */
    getBlocks(tickingArea: ITickingArea, xMin: number, yMin: number, zMin: number, xMax: number, yMax: number, zMax: number): IBlock[][] | null;
    /**
     * Allows you to get an array of blocks from the world when provided a minimum and maximum position. The blocks must be within a ticking area.
     * @param tickingArea The ticking area the blocks are in
     * @param minimumPositionObject A JavaScript object with the minimum x, y, and z position of the blocks you want
     * @param maximumPositionObject A JavaScript object with the maximum x, y, and z position of the blocks you want
     * @return undefined A 3D array of block objects. Indexs are the blocks positions relative to the min position given
     * @return null Something went wrong when retrieving the blocks
     */
    getBlocks(tickingArea: ITickingArea, minimumPositionObject: VectorXYZ, maximumPositionObject: VectorXYZ): IBlock[][] | null;
    
    ////////////////////////////////////////////////
    // Commands
    ////////////////////////////////////////////////
    /**
     * Allows you to execute a Slash Command on the server. The command will be queried and executed at the end of the current frame. All data output from the command will be compiled on a JavaScript Object and sent to the Callback object specified in the second parameter.
     * @param command The slash command to run
     * @param callback The JavaScript object that will be called after the command executes
     * 
     */
    executeCommand(command: string, callback: (callback: IExecuteCommandCallback) => void): void;
    
    ////////////////////////////////////////////////
    // Components
    ////////////////////////////////////////////////
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

    ////////////////////////////////////////////////
    // Entities
    ////////////////////////////////////////////////
    /**
     * Creates an empty entity with no components and does not place it in the world. The empty entity will be of type custom and have a blank identifier. This is NOT a valid entity that exists in the world, just an empty one that only scripts know about.
     * 
    NOTE: Entities are created first on the server, with the client notified of new entities afterwards. Be aware that if you send the result object to the client right away, the created entity might not exist on the client yet.
     * 
     * @return object An object representing the newly created entity
     * @return null Something went wrong when creating the entity
     */
    createEntity(): IEntity | null;
    /**
     * Creates an entity and applies the specified template as defined in JSON. This allows you to quickly create an entity from the applied Behavior Packs as the base for an entity created in scripting. The entity will be spawned into the world with all the components, component groups, and event triggers that are defined in the JSON file of the identifier specified. Only works on scripts registered on the server.NOTE: Entities are created first on the server, with the client notified of new entities afterwards. Be aware that if you send the result object to the client right away, the created entity might not exist on the client yet.
     * @param type Specifies the type of the entity that is being created by the template. Valid inputs are `entity` and `item_entity`
     * @param templateIdentifier This can be any of the entity identifiers from the applied Behavior Packs. For example specifying minecraft:cow here will make the provided entity a cow as defined in JSON
     * @return object An object representing the newly created entity
     * @return null Something went wrong when creating the entity
     */
    createEntity(type: string, templateIdentifier: string): IEntity | null;
    /**
     * Destroys an entity identified by the EntityObject. If the entity exists in the world this will remove it from the world and destroy it. This also makes the EntityObject no longer valid - you should only destroy an entity after you are done with it and no longer need to reference it again. This does NOT kill the entity. There won't be an event for its death: it will be removed.
     * @param entityObject The object that was retrieved from a call to createEntity() or retrieved from an entity event
     * @return true The entity was successfully destroyed
     * @return null Something went wrong when destroying the entity
     */
    destroyEntity(entityObject: IEntity): true | null;
    /**
     * Checks if the given EntityObject corresponds to a valid entity.
     * @param entityObject The object that was retrieved from a call to createEntity() or retrieved from an entity event
     * @return true The entity is in the Script Engine's database of entities
     * @return false The entity is not in the Script Engine's database of entities
     * @return null Something went wrong when validating the entity
     */
    isValidEntity(entityObject: IEntity): true | false | null;
    
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

    /**
     * Registers the Event to the script engine. This allows you to create Event Data by calling createEventData and have it initialized with the correct default data and fields. Only custom events need to be registered.
     * 
     * @param eventIdentifier This is the identifier of the custom event we are registering. The namespace is required and can't be set to minecraft.
     * @param eventData The JavaScript object with the correct fields and default values for the event
     */
    registerEventData<TEventDataType = any>(eventIdentifier: string, eventData: TEventDataType): true | null;
}
