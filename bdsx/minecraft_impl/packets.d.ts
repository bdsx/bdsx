import { CxxVector } from "../cxxvector";
import { ContainerId, DisplaySlot } from "../enums";
import { NativeClass } from "../nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, int64_as_float_t, NativeType, uint16_t, uint32_t, uint8_t } from "../nativetype";
declare module "../minecraft" {
    interface LoginPacket {
        protocol: int32_t;
        /**
         * it can be null if the wrong client version
         */
        connreq: ConnectionRequest | null;
    }
    interface PlayStatusPacket {
        status: int32_t;
    }
    interface ServerToClientHandshakePacket {
        jwt: CxxString;
    }
    interface ClientToServerHandshakePacket {
    }
    interface DisconnectPacket {
        skipMessage: bool_t;
        message: CxxString;
    }
    interface ResourcePacksInfoPacket {
    }
    interface ResourcePackStackPacket {
    }
    interface ResourcePackClientResponsePacket {
    }
    interface TextPacket {
        type: uint8_t;
        name: CxxString;
        message: CxxString;
        params: CxxVector<CxxString>;
        needsTranslation: bool_t;
        xboxUserId: CxxString;
        platformChatId: CxxString;
    }
    interface SetTimePacket {
        time: int32_t;
    }
    interface LevelSettings extends NativeClass {
        seed: int32_t;
    }
    interface StartGamePacket {
        settings: LevelSettings;
    }
    interface AddPlayerPacket {
    }
    interface AddActorPacket {
    }
    interface RemoveActorPacket {
    }
    interface AddItemActorPacket {
    }
    interface TakeItemActorPacket {
    }
    interface MoveActorAbsolutePacket {
    }
    interface MovePlayerPacket {
        actorId: ActorRuntimeID;
        pos: Vec3;
        pitch: float32_t;
        yaw: float32_t;
        headYaw: float32_t;
        mode: uint8_t;
        onGround: bool_t;
        ridingActorId: ActorRuntimeID;
        teleportCause: int32_t;
        teleportItem: int32_t;
        tick: bin64_t;
    }
    interface RiderJumpPacket {
    }
    interface UpdateBlockPacket {
        blockPos: BlockPos;
        blockRuntimeId: uint32_t;
        flags: uint8_t;
        dataLayerId: uint32_t;
    }
    interface AddPaintingPacket {
    }
    interface TickSyncPacket {
    }
    interface LevelSoundEventPacketV1 {
    }
    interface LevelEventPacket {
    }
    interface BlockEventPacket {
        pos: BlockPos;
        type: int32_t;
        data: int32_t;
    }
    interface ActorEventPacket {
        actorId: ActorRuntimeID;
        event: uint8_t;
        data: int32_t;
    }
    interface MobEffectPacket {
    }
    interface UpdateAttributesPacket {
        actorId: ActorRuntimeID;
        attributes: CxxVector<UpdateAttributesPacket.AttributeData>;
    }
    namespace UpdateAttributesPacket {
        interface AttributeData extends NativeClass {
            current: float32_t;
            min: float32_t;
            max: float32_t;
            default: float32_t;
            name: HashedString;
            [NativeType.ctor](): void;
        }
    }
    interface InventoryTransactionPacket {
        legacyRequestId: uint32_t;
        transaction: ComplexInventoryTransaction;
    }
    interface MobEquipmentPacket {
    }
    interface MobArmorEquipmentPacket {
    }
    interface InteractPacket {
        action: uint8_t;
        actorId: ActorRuntimeID;
        pos: Vec3;
    }
    interface BlockPickRequestPacket {
    }
    interface ActorPickRequestPacket {
    }
    interface PlayerActionPacket {
        pos: BlockPos;
        face: int32_t;
        action: PlayerActionPacket.Actions;
        actorId: ActorRuntimeID;
    }
    interface EntityFallPacket {
    }
    interface HurtArmorPacket {
    }
    interface SetActorDataPacket {
    }
    interface SetActorMotionPacket {
    }
    interface SetActorLinkPacket {
    }
    interface SetHealthPacket {
        health: uint8_t;
    }
    interface SetSpawnPositionPacket {
    }
    interface AnimatePacket {
        actorId: ActorRuntimeID;
        action: int32_t;
        rowingTime: float32_t;
    }
    interface RespawnPacket {
    }
    interface ContainerOpenPacket {
        containerId: ContainerID;
        /** @deprecated */
        windowId: uint8_t;
        type: ContainerType;
        pos: BlockPos;
        entityUniqueId: bin64_t;
        entityUniqueIdAsNumber: int64_as_float_t;
    }
    interface ContainerClosePacket {
        containerId: ContainerId;
        /** @deprecated */
        windowId: uint8_t;
        server: bool_t;
    }
    interface PlayerHotbarPacket {
        selectedSlot: uint32_t;
        selectHotbarSlot: bool_t;
        windowId: uint8_t;
    }
    interface InventoryContentPacket {
        containerId: ContainerId;
        slots: CxxVector<ItemStack>;
    }
    interface InventorySlotPacket {
    }
    interface ContainerSetDataPacket {
    }
    interface CraftingDataPacket {
    }
    interface CraftingEventPacket {
    }
    interface GuiDataPickItemPacket {
    }
    interface AdventureSettingsPacket {
        flag1: uint32_t;
        commandPermission: uint32_t;
        flag2: uint32_t;
        playerPermission: uint32_t;
        actorId: ActorUniqueID;
        customFlag: uint32_t;
    }
    interface BlockActorDataPacket {
    }
    interface PlayerInputPacket {
    }
    interface LevelChunkPacket {
    }
    interface SetCommandsEnabledPacket {
    }
    interface SetDifficultyPacket {
    }
    interface ChangeDimensionPacket {
        dimensionId: uint32_t;
        x: float32_t;
        y: float32_t;
        z: float32_t;
        respawn: bool_t;
    }
    interface SetPlayerGameTypePacket {
    }
    interface PlayerListPacket {
    }
    interface SimpleEventPacket {
    }
    interface EventPacket {
    }
    interface SpawnExperienceOrbPacket {
        pos: Vec3;
        amount: int32_t;
    }
    interface ClientboundMapItemDataPacket {
    }
    interface MapInfoRequestPacket {
    }
    interface RequestChunkRadiusPacket {
    }
    interface ChunkRadiusUpdatedPacket {
    }
    interface ItemFrameDropItemPacket {
    }
    interface GameRulesChangedPacket {
    }
    interface CameraPacket {
    }
    interface BossEventPacket {
        /** @deprecated */
        unknown: bin64_t;
        /** Always 1 */
        flagDarken: int32_t;
        /** Always 2 */
        flagFog: int32_t;
        /** Unique ID of the boss */
        entityUniqueId: bin64_t;
        playerUniqueId: bin64_t;
        type: uint32_t;
        title: CxxString;
        healthPercent: float32_t;
        color: BossEventPacket.Colors;
        overlay: BossEventPacket.Overlay;
        darkenScreen: bool_t;
        createWorldFog: bool_t;
    }
    interface ShowCreditsPacket {
    }
    interface AvailableCommandsParamData extends NativeClass {
        paramName: CxxString;
        paramType: int32_t;
        isOptional: bool_t;
        flags: uint8_t;
    }
    interface AvailableCommandsOverloadData extends NativeClass {
        parameters: CxxVector<AvailableCommandsParamData>;
    }
    interface AvailableCommandsCommandData extends NativeClass {
        name: CxxString;
        description: CxxString;
        flags: uint16_t;
        permission: uint8_t;
        /** @deprecated use overloads */
        parameters: CxxVector<CxxVector<CxxString>>;
        overloads: CxxVector<AvailableCommandsOverloadData>;
        aliases: int32_t;
    }
    interface AvailableCommandsEnumData extends NativeClass {
    }
    interface AvailableCommandsPacket {
        enumValues: CxxVector<CxxString>;
        postfixes: CxxVector<CxxString>;
        enums: CxxVector<AvailableCommandsEnumData>;
        commands: CxxVector<AvailableCommandsCommandData>;
    }
    interface CommandRequestPacket {
        command: CxxString;
    }
    interface CommandBlockUpdatePacket {
    }
    interface CommandOutputPacket {
    }
    interface ResourcePackDataInfoPacket {
    }
    interface ResourcePackChunkDataPacket {
    }
    interface ResourcePackChunkRequestPacket {
    }
    interface TransferPacket {
        address: CxxString;
        port: uint16_t;
    }
    interface PlaySoundPacket {
        soundName: CxxString;
        pos: BlockPos;
        volume: float32_t;
        pitch: float32_t;
    }
    interface StopSoundPacket {
        soundName: CxxString;
        stopAll: bool_t;
    }
    interface SetTitlePacket {
        type: int32_t;
        text: CxxString;
        fadeInTime: int32_t;
        stayTime: int32_t;
        fadeOutTime: int32_t;
    }
    interface AddBehaviorTreePacket {
    }
    interface StructureBlockUpdatePacket {
    }
    interface ShowStoreOfferPacket {
    }
    interface PurchaseReceiptPacket {
    }
    interface PlayerSkinPacket {
    }
    interface SubClientLoginPacket {
    }
    interface AutomationClientConnectPacket {
    }
    interface SetLastHurtByPacket {
    }
    interface BookEditPacket {
        type: uint8_t;
        inventorySlot: uint8_t;
        pageNumber: uint8_t;
        secondaryPageNumber: uint8_t;
        text: CxxString;
        author: CxxString;
        xuid: CxxString;
    }
    interface NpcRequestPacket {
    }
    interface PhotoTransferPacket {
    }
    interface ModalFormRequestPacket {
        id: uint32_t;
        content: CxxString;
    }
    interface ModalFormResponsePacket {
        id: uint32_t;
        response: CxxString;
    }
    interface ServerSettingsRequestPacket {
    }
    interface ServerSettingsResponsePacket {
        id: uint32_t;
        content: CxxString;
    }
    interface ShowProfilePacket {
    }
    interface SetDefaultGameTypePacket {
    }
    interface RemoveObjectivePacket {
        objectiveName: CxxString;
    }
    interface SetDisplayObjectivePacket {
        displaySlot: 'list' | 'sidebar' | 'belowname' | '' | DisplaySlot;
        objectiveName: CxxString;
        displayName: CxxString;
        criteriaName: 'dummy' | '';
        sortOrder: ObjectiveSortOrder;
    }
    interface ScorePacketInfo extends NativeClass {
        scoreboardId: ScoreboardId;
        objectiveName: CxxString;
        score: int32_t;
        type: ScorePacketInfo.Type;
        playerEntityUniqueId: bin64_t;
        entityUniqueId: bin64_t;
        customName: CxxString;
    }
    interface SetScorePacket {
        type: uint8_t;
        entries: CxxVector<ScorePacketInfo>;
    }
    interface LabTablePacket {
    }
    interface UpdateBlockSyncedPacket {
    }
    interface MoveActorDeltaPacket {
    }
    interface SetScoreboardIdentityPacket {
    }
    interface SetLocalPlayerAsInitializedPacket {
        actorId: ActorRuntimeID;
    }
    interface UpdateSoftEnumPacket {
    }
    interface NetworkStackLatencyPacket {
    }
    interface ScriptCustomEventPacket {
    }
    interface SpawnParticleEffectPacket {
        dimensionId: uint8_t;
        actorId: ActorUniqueID;
        pos: Vec3;
        particleName: CxxString;
    }
    interface AvailableActorIdentifiersPacket {
    }
    interface LevelSoundEventPacketV2 {
    }
    interface NetworkChunkPublisherUpdatePacket {
    }
    interface BiomeDefinitionListPacket {
    }
    interface LevelSoundEventPacket {
        sound: uint32_t;
        pos: Vec3;
        extraData: int32_t;
        entityType: CxxString;
        isBabyMob: bool_t;
        disableRelativeVolume: bool_t;
    }
    interface LevelEventGenericPacket {
    }
    interface LecternUpdatePacket {
    }
    interface RemoveEntityPacket {
    }
    interface ClientCacheStatusPacket {
    }
    interface OnScreenTextureAnimationPacket {
        animationType: int32_t;
    }
    interface MapCreateLockedCopyPacket {
    }
    interface StructureTemplateDataRequestPacket {
    }
    interface StructureTemplateDataResponsePacket {
    }
    interface ClientCacheBlobStatusPacket {
    }
    interface ClientCacheMissResponsePacket {
    }
    interface EducationSettingsPacket {
    }
    interface EmotePacket {
    }
    interface MultiplayerSettingsPacket {
    }
    interface SettingsCommandPacket {
    }
    interface AnvilDamagePacket {
    }
    interface CompletedUsingItemPacket {
        itemId: int16_t;
        action: CompletedUsingItemPacket.Actions;
    }
    interface NetworkSettingsPacket {
    }
    interface PlayerAuthInputPacket {
        pitch: float32_t;
        yaw: float32_t;
        pos: Vec3;
        moveX: float32_t;
        moveZ: float32_t;
        heaYaw: float32_t;
        inputFlags: bin64_t;
        inputMode: uint32_t;
        playMode: uint32_t;
        vrGazeDirection: Vec3;
        tick: bin64_t;
        delta: Vec3;
    }
    interface CreativeContentPacket {
    }
    interface PlayerEnchantOptionsPacket {
    }
    interface ItemStackRequestPacket {
    }
    interface ItemStackResponsePacket {
    }
    interface PlayerArmorDamagePacket {
    }
    interface CodeBuilderPacket {
    }
    interface UpdatePlayerGameTypePacket {
    }
    interface EmoteListPacket {
    }
    interface PositionTrackingDBServerBroadcastPacket {
        action: PositionTrackingDBServerBroadcastPacket.Actions;
        trackingId: int32_t;
    }
    interface PositionTrackingDBClientRequestPacket {
        action: PositionTrackingDBClientRequestPacket.Actions;
        trackingId: int32_t;
    }
    interface DebugInfoPacket {
    }
    interface PacketViolationWarningPacket {
    }
    interface MotionPredictionHintsPacket {
    }
    interface AnimateEntityPacket {
    }
    interface CameraShakePacket {
        intensity: float32_t;
        duration: float32_t;
        shakeType: uint8_t;
        shakeAction: uint8_t;
    }
    interface PlayerFogPacket {
    }
    interface CorrectPlayerMovePredictionPacket {
    }
    interface ItemComponentPacket {
    }
    interface FilterTextPacket {
    }
    interface ClientboundDebugRendererPacket {
    }
    interface SyncActorPropertyPacket {
    }
    interface AddVolumeEntityPacket {
    }
    interface RemoveVolumeEntityPacket {
    }
    interface SimulationTypePacket {
    }
    interface NpcDialoguePacket {
        /** ActorUniqueID of the Npc */
        actorId: ActorUniqueID;
        action: NpcDialoguePacket.Actions;
        /** Always empty */
        actorIdAsNumber: int64_as_float_t;
    }
    namespace Packet {
        type idMap = {
            [key in keyof typeof Packet.idMap]: InstanceType<(typeof Packet.idMap)[key]>;
        };
    }
}
