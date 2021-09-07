/* eslint-disable @typescript-eslint/no-empty-interface */
import { ContainerId } from "../bds/inventory";
import { DisplaySlot } from "../bds/scoreboard";
import { CxxVector } from "../cxxvector";
import { HashedString, UpdateAttributesPacket } from "../minecraft";
import { NativeClass } from "../nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, int64_as_float_t, NativeType, uint16_t, uint32_t, uint8_t } from "../nativetype";

declare module "../minecraft" {
    interface LoginPacket {
        protocol:int32_t;
        /**
         * it can be null if the wrong client version
         */
        connreq:ConnectionRequest|null;
    }

    interface PlayStatusPacket {
        status:int32_t;
    }

    interface ServerToClientHandshakePacket {
        jwt:CxxString;
    }

    interface ClientToServerHandshakePacket {
        // no data
    }

    interface DisconnectPacket {
        skipMessage:bool_t;
        message:CxxString;
    }

    interface ResourcePacksInfoPacket {
        // data:ResourcePacksInfoData;
    }

    interface ResourcePackStackPacket {
        // addOnPacks:CxxVector<PackInstanceId>;
        // texturePacks:CxxVector<PackInstanceId>;
        // baseGameVersion:BaseGameVersion;
        // texturePackRequired:bool_t;
        // experimental:bool_t;
    }

    interface ResourcePackClientResponsePacket {
        // response: ResourcePackResponse;
    }

    interface TextPacket {
        type:uint8_t;
        name:CxxString;
        message:CxxString;
        params:CxxVector<CxxString>;
        needsTranslation:bool_t;
        xboxUserId:CxxString;
        platformChatId:CxxString;
    }

    interface SetTimePacket {
        time:int32_t;
    }

    interface LevelSettings extends NativeClass {
        seed:int32_t;
    }

    interface StartGamePacket {
        settings:LevelSettings;
    }

    interface AddPlayerPacket {
        // unknown
    }

    interface AddActorPacket {
        // unknown
    }

    interface RemoveActorPacket {
        // unknown
    }

    interface AddItemActorPacket {
        // unknown
    }

    interface TakeItemActorPacket {
        // unknown
    }

    interface MoveActorAbsolutePacket {
        // unknown
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
        // unknown
    }

    interface UpdateBlockPacket {
        blockPos: BlockPos;
        blockRuntimeId: uint32_t;
        flags: uint8_t;
        dataLayerId: uint32_t;
    }

    interface AddPaintingPacket {
        // unknown
    }

    interface TickSyncPacket {
        // unknown
    }

    interface LevelSoundEventPacketV1 {
        // unknown
    }

    interface LevelEventPacket {
        // unknown
    }

    interface BlockEventPacket {
        pos:BlockPos;
        type:int32_t;
        data:int32_t;
    }

    interface ActorEventPacket {
        actorId: ActorRuntimeID;
        event: uint8_t;
        data: int32_t;
    }

    interface MobEffectPacket {
        // unknown
    }

    interface UpdateAttributesPacket {
        actorId:ActorRuntimeID;
        attributes:CxxVector<UpdateAttributesPacket.AttributeData>;
    }

    namespace UpdateAttributesPacket {
        interface AttributeData extends NativeClass {
            current:float32_t;
            min:float32_t;
            max:float32_t;
            default:float32_t;
            name:HashedString;

            [NativeType.ctor]():void;
        }
    }

    interface InventoryTransactionPacket {
        legacyRequestId: uint32_t;
        transaction: ComplexInventoryTransaction;
    }

    interface MobEquipmentPacket {
        // unknown
    }

    interface MobArmorEquipmentPacket {
        // unknown
    }

    interface InteractPacket {
        action:uint8_t;
        actorId:ActorRuntimeID;
        pos:Vec3;
    }

    interface BlockPickRequestPacket {
        // unknown
    }

    interface ActorPickRequestPacket {
        // unknown
    }

    interface PlayerActionPacket {
        pos: BlockPos;
        face: int32_t;
        action: PlayerActionPacket.Actions;
        actorId: ActorRuntimeID;
    }

    interface EntityFallPacket {
        // unknown
    }

    interface HurtArmorPacket {
        // unknown
    }

    interface SetActorDataPacket {
        // unknown
    }

    interface SetActorMotionPacket {
        // unknown
    }

    interface SetActorLinkPacket {
        // unknown
    }

    interface SetHealthPacket {
        health:uint8_t;
    }

    interface SetSpawnPositionPacket {
        // unknown
    }

    interface AnimatePacket {
        actorId:ActorRuntimeID;
        action:int32_t;
        rowingTime:float32_t;
    }

    interface RespawnPacket {
        // unknown
    }

    interface ContainerOpenPacket {
        containerId:ContainerID;
        /** @deprecated */
        windowId:uint8_t;
        type:ContainerType;
        pos:BlockPos;
        entityUniqueId:bin64_t;
        entityUniqueIdAsNumber:int64_as_float_t;
    }

    interface ContainerClosePacket {
        containerId:ContainerId;
        /** @deprecated */
        windowId:uint8_t;
        server:bool_t;
    }

    interface PlayerHotbarPacket {
        selectedSlot:uint32_t;
        selectHotbarSlot:bool_t;
        windowId:uint8_t;
    }

    interface InventoryContentPacket {
        containerId:ContainerId;
        slots:CxxVector<ItemStack>;
    }

    interface InventorySlotPacket {
        // unknown
    }

    interface ContainerSetDataPacket {
        // unknown
    }

    interface CraftingDataPacket {
        // unknown
    }

    interface CraftingEventPacket {
        // unknown
    }

    interface GuiDataPickItemPacket {
        // unknown
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
        // unknown
    }

    interface PlayerInputPacket {
        // unknown
    }

    interface LevelChunkPacket {
        // unknown
    }

    interface SetCommandsEnabledPacket {
        // unknown
    }

    interface SetDifficultyPacket {
        // unknown
    }

    interface ChangeDimensionPacket {
        dimensionId:uint32_t;
        x:float32_t;
        y:float32_t;
        z:float32_t;
        respawn:bool_t;
    }

    interface SetPlayerGameTypePacket {
        // unknown
    }

    interface PlayerListPacket {
        // unknown
    }

    interface SimpleEventPacket {
        // unknown
    }

    interface EventPacket {
        // unknown
    }

    interface SpawnExperienceOrbPacket {
        pos:Vec3;
        amount:int32_t;
    }

    interface ClientboundMapItemDataPacket {
        // unknown
    }

    interface MapInfoRequestPacket {
        // unknown
    }

    interface RequestChunkRadiusPacket {
        // unknown
    }

    interface ChunkRadiusUpdatedPacket {
        // unknown
    }

    interface ItemFrameDropItemPacket {
        // unknown
    }

    interface GameRulesChangedPacket {
        // unknown
    }

    interface CameraPacket {
        // unknown
    }

    interface BossEventPacket {
        /** @deprecated */
        unknown:bin64_t;
        /** Always 1 */
        flagDarken:int32_t;
        /** Always 2 */
        flagFog:int32_t;
        /** Unique ID of the boss */
        entityUniqueId:bin64_t;
        playerUniqueId:bin64_t;
        type:uint32_t;
        title:CxxString;
        healthPercent:float32_t;
        color:BossEventPacket.Colors;
        overlay:BossEventPacket.Overlay;
        darkenScreen:bool_t;
        createWorldFog:bool_t;
    }

    interface ShowCreditsPacket {
        // unknown
    }

    interface AvailableCommandsParamData extends NativeClass {
        paramName:CxxString;
        paramType:int32_t;
        isOptional:bool_t;
        flags:uint8_t;
    }

    interface AvailableCommandsOverloadData extends NativeClass {
        parameters:CxxVector<AvailableCommandsParamData>;
    }

    interface AvailableCommandsCommandData extends NativeClass {
        name:CxxString;
        description:CxxString;
        flags:uint16_t;
        permission:uint8_t;
        /** @deprecated use overloads */
        parameters:CxxVector<CxxVector<CxxString>>;
        overloads:CxxVector<AvailableCommandsOverloadData>;
        aliases:int32_t;
    }

    interface AvailableCommandsEnumData extends NativeClass{
    }

    interface AvailableCommandsPacket {
        enumValues:CxxVector<CxxString>;
        postfixes:CxxVector<CxxString>;
        enums:CxxVector<AvailableCommandsEnumData>;
        commands:CxxVector<AvailableCommandsCommandData>;
    }

    interface CommandRequestPacket {
        command:CxxString;
    }


    interface CommandBlockUpdatePacket {
        // unknown
    }


    interface CommandOutputPacket {
        // unknown
    }


    interface ResourcePackDataInfoPacket {
        // unknown
    }


    interface ResourcePackChunkDataPacket {
        // unknown
    }


    interface ResourcePackChunkRequestPacket {
        // unknown
    }


    interface TransferPacket {
        address:CxxString;
        port:uint16_t;
    }

    interface PlaySoundPacket {
        soundName:CxxString;
        pos:BlockPos;
        volume:float32_t;
        pitch:float32_t;
    }

    interface StopSoundPacket {
        soundName:CxxString;
        stopAll:bool_t;
    }

    interface SetTitlePacket {
        type:int32_t;
        text:CxxString;
        fadeInTime:int32_t;
        stayTime:int32_t;
        fadeOutTime:int32_t;
    }

    interface AddBehaviorTreePacket {
        // unknown
    }

    interface StructureBlockUpdatePacket {
        // unknown
    }

    interface ShowStoreOfferPacket {
        // unknown
    }

    interface PurchaseReceiptPacket {
        // unknown
    }

    interface PlayerSkinPacket {
        // unknown
    }

    interface SubClientLoginPacket {
        // unknown
    }

    interface AutomationClientConnectPacket {
        // unknown
    }

    interface SetLastHurtByPacket {
        // unknown
    }

    interface BookEditPacket {
        // it seems fields have weird empty spaces.
        // I'm not sure how it implemented actually.
        type:uint8_t;
        inventorySlot:uint8_t;
        pageNumber:uint8_t;
        secondaryPageNumber:uint8_t;
        text:CxxString;
        author:CxxString;
        xuid:CxxString;
    }

    interface NpcRequestPacket {
        // unknown
    }

    interface PhotoTransferPacket {
        // unknown
    }

    interface ModalFormRequestPacket {
        id:uint32_t;
        content:CxxString;
    }

    interface ModalFormResponsePacket {
        id:uint32_t;
        response:CxxString;
    }

    interface ServerSettingsRequestPacket {
        // unknown
    }

    interface ServerSettingsResponsePacket {
        id:uint32_t;
        content:CxxString;
    }

    interface ShowProfilePacket {
        // unknown
    }

    interface SetDefaultGameTypePacket {
        // unknown
    }

    interface RemoveObjectivePacket {
        objectiveName:CxxString;
    }

    interface SetDisplayObjectivePacket {
        displaySlot:'list'|'sidebar'|'belowname'|''|DisplaySlot;
        objectiveName:CxxString;
        displayName:CxxString;
        criteriaName:'dummy'|'';
        sortOrder:ObjectiveSortOrder;
    }

    interface ScorePacketInfo extends NativeClass {
        scoreboardId:ScoreboardId;
        objectiveName:CxxString;

        score:int32_t;
        type:ScorePacketInfo.Type;
        playerEntityUniqueId:bin64_t;
        entityUniqueId:bin64_t;
        customName:CxxString;
    }

    interface SetScorePacket {
        type:uint8_t;

        entries:CxxVector<ScorePacketInfo>;
    }

    interface LabTablePacket {
        // unknown
    }

    interface UpdateBlockSyncedPacket {
        // unknown
    }

    interface MoveActorDeltaPacket {
        // unknown
    }

    interface SetScoreboardIdentityPacket {
        // unknown
    }

    interface SetLocalPlayerAsInitializedPacket {
        actorId: ActorRuntimeID;
    }

    interface UpdateSoftEnumPacket {
        // unknown
    }

    interface NetworkStackLatencyPacket {
        // unknown
    }

    interface ScriptCustomEventPacket {
        // unknown
    }

    interface SpawnParticleEffectPacket {
        dimensionId: uint8_t;
        actorId: ActorUniqueID;
        pos: Vec3;
        particleName: CxxString;
    }

    interface AvailableActorIdentifiersPacket {
        // unknown
    }

    interface LevelSoundEventPacketV2 {
        // unknown
    }

    interface NetworkChunkPublisherUpdatePacket {
        // unknown
    }

    interface BiomeDefinitionListPacket {
        // unknown
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
        // unknown
    }

    interface LecternUpdatePacket {
        // unknown
    }

    interface RemoveEntityPacket {
        // unknown
    }

    interface ClientCacheStatusPacket {
        // unknown
    }

    interface OnScreenTextureAnimationPacket {
        animationType: int32_t;
    }

    interface MapCreateLockedCopyPacket {
        // unknown
    }

    interface StructureTemplateDataRequestPacket {
        // unknown
    }

    interface StructureTemplateDataResponsePacket {
        // unknown
    }

    interface ClientCacheBlobStatusPacket {
        // unknown
    }

    interface ClientCacheMissResponsePacket {
        // unknown
    }

    interface EducationSettingsPacket {
        // unknown
    }

    interface EmotePacket {
        // unknown
    }

    interface MultiplayerSettingsPacket {
        // unknown
    }

    interface SettingsCommandPacket {
        // unknown
    }

    interface AnvilDamagePacket {
        // unknown
    }

    interface CompletedUsingItemPacket {
        itemId: int16_t;
        action: CompletedUsingItemPacket.Actions;
    }

    interface NetworkSettingsPacket {
        // unknown
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
        // unknown
    }

    interface PlayerEnchantOptionsPacket {
        // unknown
    }

    interface ItemStackRequestPacket {
        // unknown
    }

    interface ItemStackResponsePacket {
        // unknown
    }

    interface PlayerArmorDamagePacket {
        // unknown
    }

    interface CodeBuilderPacket {
        // unknown
    }

    interface UpdatePlayerGameTypePacket {
        // unknown
    }

    interface EmoteListPacket {
        // unknown
    }

    interface PositionTrackingDBServerBroadcastPacket {
        action: PositionTrackingDBServerBroadcastPacket.Actions;
        trackingId: int32_t;
        // TODO: little endian encoded NBT compound tag
    }

    interface PositionTrackingDBClientRequestPacket {
        action: PositionTrackingDBClientRequestPacket.Actions;
        trackingId: int32_t;
    }

    interface DebugInfoPacket {
        // unknown
    }

    interface PacketViolationWarningPacket {
        // unknown
    }

    interface MotionPredictionHintsPacket {
        // unknown
    }

    interface AnimateEntityPacket {
        // unknown
    }

    interface CameraShakePacket {
        intensity:float32_t;
        duration:float32_t;
        shakeType:uint8_t;
        shakeAction:uint8_t;
    }

    interface PlayerFogPacket {
        // unknown
    }

    interface CorrectPlayerMovePredictionPacket {
        // unknown
    }

    interface ItemComponentPacket {
        // unknown
    }

    interface FilterTextPacket {
        // unknown
    }

    interface ClientboundDebugRendererPacket {
        // unknown
    }

    interface SyncActorPropertyPacket {
        // unknown
    }

    interface AddVolumeEntityPacket {
        // unknown
    }

    interface RemoveVolumeEntityPacket {
        // unknown
    }

    interface SimulationTypePacket {
        // unknown
    }

    interface NpcDialoguePacket {
        /** ActorUniqueID of the Npc */
        actorId:ActorUniqueID;
        action:NpcDialoguePacket.Actions;
        /** Always empty */
        // dialogue:CxxString;
        // sceneName:CxxString;
        // npcName:CxxString;
        // actionJson:CxxString;

        actorIdAsNumber:int64_as_float_t;
    }

    namespace Packet {
        type idMap = {[key in keyof typeof Packet.idMap]:InstanceType<(typeof Packet.idMap)[key]>};
    }
}

UpdateAttributesPacket.AttributeData.define({
    current:float32_t,
    min:float32_t,
    max:float32_t,
    default:float32_t,
    name:HashedString,
}, 0x40);

UpdateAttributesPacket.AttributeData[NativeType.ctor] = function(this:UpdateAttributesPacket.AttributeData) {
    this.min = 0;
    this.max = 0;
    this.current = 0;
    this.default = 0;
};
