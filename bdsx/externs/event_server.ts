import "./common";

/// Referenced from https://github.com/minecraft-addon-tools/minecraft-scripting-types

declare global
{
    interface MinecraftServerEventNameMap
    {
        /**
         * This event is used to send a chat message from the server to the players. The event data is the message being sent as a string. Special formatting is supported the same way it would be if a player was sending the message.
         */
        'minecraft:display_chat_event':IEventData<IDisplayChatParameters>;
        /**
         * This event is used to execute a slash command on the server with the World Owner permission level. The event data contains the slash command as a string. The slash command will be processed and will run after the event is sent.
         */
        'minecraft:execute_command':IEventData<IExecuteCommandParameters>;
        /**
         * This event is used to play a sound effect. Currently, sounds can only be played at a fixed position in the world. Global sounds and sounds played by an entity will be supported in a later update.
         */
        'minecraft:play_sound':IEventData<IPlaySoundParameters>;
        /**
         * This event is used to turn various levels of logging on and off for server scripts. Note that turning logging on/off is not limited to the script that broadcasted the event. It will affect ALL server scripts including those in other Behavior Packs that are applied to the world. See the Debugging section for more information on logging.
         */
        'minecraft:script_logger_config':IEventData<IScriptLoggerConfigParameters>;
        /**
         * This event is used to create a particle effect that will follow an entity around. This particle effect is visible to all players. Any effect defined in a JSON file (both in your resource pack and in Minecraft) can be used here. MoLang variables defined in the JSON of the effect can then be used to control that effect by changing them in the entity to which it is attached.
         */
        'minecraft:spawn_particle_attached_entity':IEventData<ISpawnParticleAttachedEntityParameters>;
        /**
         * This event is used to create a static particle effect in the world. This particle effect is visible to all players. Any effect defined in a JSON file (both in your resource pack and in Minecraft) can be used here. Once the effect is spawned you won't be able to control it further.
         */
        'minecraft:spawn_particle_in_world':IEventData<ISpawnParticleInWorldParameters>;
    }
    type MinecraftServerEventName = keyof MinecraftServerEventNameMap;
    
    
    /**
     * This event is used to send a chat message from the server to the players. The event data is the message being sent as a string. Special formatting is supported the same way it would be if a player was sending the message.
     */
    interface IDisplayChatParameters {
        /**
         * The chat message that will be displayed
         */
        message: string;
    }
    
    /**
     * This event is used to execute a slash command on the server with the World Owner permission level. The event data contains the slash command as a string. The slash command will be processed and will run after the event is sent.
     */
    interface IExecuteCommandParameters {
        /**
         * The command that will be run
         */
        command: string;
    }
    
    /**
     * This event is used to play a sound effect. Currently, sounds can only be played at a fixed position in the world. Global sounds and sounds played by an entity will be supported in a later update.
     */
    interface IPlaySoundParameters {
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
     * This event is used to turn various levels of logging on and off for server scripts. Note that turning logging on/off is not limited to the script that broadcasted the event. It will affect ALL server scripts including those in other Behavior Packs that are applied to the world. See the Debugging section for more information on logging.
     */
    interface IScriptLoggerConfigParameters {
        /**
         * Set to true to log any scripting errors that occur on the server
         * @default false
         */
        log_errors: boolean;
        /**
         * Set to true to log any general scripting information that occurs on the server. This includes any logging done with server.log()
         * @default false
         */
        log_information: boolean;
        /**
         * Set to true to log any scripting warnings that occur on the server
         * @default false
         */
        log_warnings: boolean;
    }
    
    /**
     * This event is used to create a particle effect that will follow an entity around. This particle effect is visible to all players. Any effect defined in a JSON file (both in your resource pack and in Minecraft) can be used here. MoLang variables defined in the JSON of the effect can then be used to control that effect by changing them in the entity to which it is attached.
     */
    interface ISpawnParticleAttachedEntityParameters {
        /**
         * The identifier of the particle effect you want to attach to the entity. This is the same identifier you gave the effect in its JSON file
         */
        effect: MinecraftParticleEffect|string;
        /**
         * The entity object you want to attach the effect to
         */
        entity: IEntity;
        /**
         * The offset from the entity's "center" where you want to spawn the effect
         * @default [0, 0, 0]
         */
        offset: VectorArray;
    }
    
    /**
     * This event is used to create a static particle effect in the world. This particle effect is visible to all players. Any effect defined in a JSON file (both in your resource pack and in Minecraft) can be used here. Once the effect is spawned you won't be able to control it further.
     */
    interface ISpawnParticleInWorldParameters {
        /**
         * The dimension in which you want to spawn the effect. Can be "overworld", "nether", or "the end"
         * @default overworld
         */
        dimension: string;
        /**
         * The identifier of the particle effect you want to attach to spawn. This is the same name you gave the effect in its JSON file
         */
        effect: MinecraftParticleEffect|string;
        /**
         * The position in the world where you want to spawn the effect
         * @default [0, 0, 0]
         */
        position: VectorArray;
    }    
}