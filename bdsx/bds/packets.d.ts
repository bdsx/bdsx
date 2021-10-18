import { CxxVector } from "../cxxvector";
import { mce } from "../mce";
import { MantleClass, NativeClass } from "../nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int16_t, int32_t, int64_as_float_t, NativeType, uint16_t, uint32_t, uint8_t } from "../nativetype";
import { ActorRuntimeID, ActorUniqueID } from "./actor";
import { BlockPos, Vec3 } from "./blockpos";
import { ConnectionRequest } from "./connreq";
import { HashedString } from "./hashedstring";
import { ComplexInventoryTransaction, ContainerId, ContainerType, NetworkItemStackDescriptor } from "./inventory";
import { Packet } from "./packet";
import type { GameType } from "./player";
import { DisplaySlot, ObjectiveSortOrder, ScoreboardId } from "./scoreboard";
import minecraft = require('../minecraft');
/** @deprecated */
export declare class LoginPacket extends Packet {
    protocol: int32_t;
    /**
     * it can be null if the wrong client version
     */
    connreq: ConnectionRequest | null;
}
/** @deprecated */
export declare class PlayStatusPacket extends Packet {
    status: int32_t;
}
/** @deprecated */
export declare class ServerToClientHandshakePacket extends Packet {
    jwt: CxxString;
}
/** @deprecated */
export declare class ClientToServerHandshakePacket extends Packet {
}
/** @deprecated */
export declare class DisconnectPacket extends Packet {
    skipMessage: bool_t;
    message: CxxString;
}
/** @deprecated */
export declare const PackType: typeof minecraft.PackType;
/** @deprecated */
export declare type PackType = minecraft.PackType;
/** @deprecated */
export declare class ResourcePacksInfoPacket extends Packet {
}
/** @deprecated */
export declare class ResourcePackStackPacket extends Packet {
}
/** @deprecated Use ResourcePackStackPacket, follow the real class name */
export declare const ResourcePackStacksPacket: typeof ResourcePackStackPacket;
/** @deprecated use ResourcePackStackPacket, follow the real class name */
export declare type ResourcePackStacksPacket = ResourcePackStackPacket;
/** @deprecated */
export declare const ResourcePackResponse: typeof minecraft.ResourcePackResponse;
/** @deprecated */
export declare type ResourcePackResponse = minecraft.ResourcePackResponse;
/** @deprecated */
export declare class ResourcePackClientResponsePacket extends Packet {
}
/** @deprecated */
export declare class TextPacket extends Packet {
    type: uint8_t;
    name: CxxString;
    message: CxxString;
    params: CxxVector<CxxString>;
    needsTranslation: bool_t;
    xboxUserId: CxxString;
    platformChatId: CxxString;
}
/** @deprecated */
export declare namespace TextPacket {
    /** @deprecated */
    const Types: typeof minecraft.TextPacket.Types;
    /** @deprecated */
    type Types = minecraft.TextPacket.Types;
}
/** @deprecated */
export declare class SetTimePacket extends Packet {
    time: int32_t;
}
/** @deprecated */
export declare class LevelSettings extends MantleClass {
    seed: int32_t;
}
/** @deprecated */
export declare class StartGamePacket extends Packet {
    settings: LevelSettings;
}
/** @deprecated */
export declare class AddPlayerPacket extends Packet {
}
/** @deprecated */
export declare class AddActorPacket extends Packet {
}
/** @deprecated */
export declare class RemoveActorPacket extends Packet {
}
/** @deprecated */
export declare class AddItemActorPacket extends Packet {
}
/** @deprecated */
export declare class TakeItemActorPacket extends Packet {
}
/** @deprecated */
export declare class MoveActorAbsolutePacket extends Packet {
}
/** @deprecated */
export declare class MovePlayerPacket extends Packet {
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
/** @deprecated */
export declare namespace MovePlayerPacket {
    const Modes: typeof minecraft.MovePlayerPacket.Modes;
    type Modes = minecraft.MovePlayerPacket.Modes;
}
/** @deprecated */
export declare class RiderJumpPacket extends Packet {
}
/** @deprecated */
export declare class UpdateBlockPacket extends Packet {
    blockPos: BlockPos;
    blockRuntimeId: uint32_t;
    flags: uint8_t;
    dataLayerId: uint32_t;
}
export declare namespace UpdateBlockPacket {
    /** @deprecated */
    const Flags: typeof minecraft.UpdateBlockPacket.Flags;
    /** @deprecated */
    type Flags = minecraft.UpdateBlockPacket.Flags;
    /** @deprecated */
    const DataLayerIds: typeof minecraft.UpdateBlockPacket.DataLayerIds;
    /** @deprecated */
    type DataLayerIds = minecraft.UpdateBlockPacket.DataLayerIds;
}
/** @deprecated */
export declare class AddPaintingPacket extends Packet {
}
/** @deprecated */
export declare class TickSyncPacket extends Packet {
}
/** @deprecated */
export declare class LevelSoundEventPacketV1 extends Packet {
}
/** @deprecated */
export declare class LevelEventPacket extends Packet {
}
/** @deprecated */
export declare class BlockEventPacket extends Packet {
    pos: BlockPos;
    type: int32_t;
    data: int32_t;
}
/** @deprecated */
export declare class ActorEventPacket extends Packet {
    actorId: ActorRuntimeID;
    event: uint8_t;
    data: int32_t;
}
/** @deprecated */
export declare namespace ActorEventPacket {
    /** @deprecated */
    const Events: typeof minecraft.ActorEventPacket.Events;
    /** @deprecated */
    type Events = minecraft.ActorEventPacket.Events;
}
/** @deprecated */
export declare class MobEffectPacket extends Packet {
}
/** @deprecated */
export declare class AttributeData extends NativeClass {
    current: number;
    min: number;
    max: number;
    default: number;
    name: HashedString;
    [NativeType.ctor](): void;
}
/** @deprecated */
export declare class UpdateAttributesPacket extends Packet {
    actorId: ActorRuntimeID;
    attributes: CxxVector<AttributeData>;
}
/** @deprecated */
export declare class InventoryTransactionPacket extends Packet {
    legacyRequestId: uint32_t;
    transaction: ComplexInventoryTransaction;
}
/** @deprecated */
export declare class MobEquipmentPacket extends Packet {
    runtimeId: ActorRuntimeID;
    item: NetworkItemStackDescriptor;
    slot: uint8_t;
    selectedSlot: uint8_t;
    containerId: ContainerId;
}
/** @deprecated */
export declare class MobArmorEquipmentPacket extends Packet {
}
/** @deprecated */
export declare class InteractPacket extends Packet {
    action: uint8_t;
    actorId: ActorRuntimeID;
    pos: Vec3;
}
export declare namespace InteractPacket {
    /** @deprecated */
    const Actions: typeof minecraft.InteractPacket.Actions;
    /** @deprecated */
    type Actions = minecraft.InteractPacket.Actions;
}
/** @deprecated */
export declare class BlockPickRequestPacket extends Packet {
}
/** @deprecated */
export declare class ActorPickRequestPacket extends Packet {
}
/** @deprecated */
export declare class PlayerActionPacket extends Packet {
    pos: BlockPos;
    face: int32_t;
    action: PlayerActionPacket.Actions;
    actorId: ActorRuntimeID;
}
/** @deprecated */
export declare namespace PlayerActionPacket {
    /** @deprecated */
    const Actions: typeof minecraft.PlayerActionPacket.Actions;
    /** @deprecated */
    type Actions = minecraft.PlayerActionPacket.Actions;
}
/** @deprecated */
export declare class EntityFallPacket extends Packet {
}
/** @deprecated */
export declare class HurtArmorPacket extends Packet {
}
/** @deprecated */
export declare class SetActorDataPacket extends Packet {
}
/** @deprecated */
export declare class SetActorMotionPacket extends Packet {
}
/** @deprecated */
export declare class SetActorLinkPacket extends Packet {
}
/** @deprecated */
export declare class SetHealthPacket extends Packet {
    health: uint8_t;
}
/** @deprecated */
export declare class SetSpawnPositionPacket extends Packet {
}
/** @deprecated */
export declare class AnimatePacket extends Packet {
    actorId: ActorRuntimeID;
    action: int32_t;
    rowingTime: float32_t;
}
/** @deprecated */
export declare namespace AnimatePacket {
    /** @deprecated */
    const Actions: typeof minecraft.AnimatePacket.Actions;
    /** @deprecated */
    type Actions = minecraft.AnimatePacket.Actions;
}
/** @deprecated */
export declare class RespawnPacket extends Packet {
}
/** @deprecated */
export declare class ContainerOpenPacket extends Packet {
    /** @deprecated */
    windowId: uint8_t;
    containerId: ContainerId;
    type: ContainerType;
    pos: BlockPos;
    entityUniqueId: bin64_t;
    entityUniqueIdAsNumber: int64_as_float_t;
}
/** @deprecated */
export declare class ContainerClosePacket extends Packet {
    /** @deprecated */
    windowId: uint8_t;
    containerId: ContainerId;
    server: bool_t;
}
/** @deprecated */
export declare class PlayerHotbarPacket extends Packet {
    selectedSlot: uint32_t;
    selectHotbarSlot: bool_t;
    /** @deprecated */
    windowId: uint8_t;
    containerId: ContainerId;
}
/** @deprecated */
export declare class InventoryContentPacket extends Packet {
    containerId: ContainerId;
    slots: CxxVector<NetworkItemStackDescriptor>;
}
/** @deprecated */
export declare class InventorySlotPacket extends Packet {
}
/** @deprecated */
export declare class ContainerSetDataPacket extends Packet {
}
/** @deprecated */
export declare class CraftingDataPacket extends Packet {
}
/** @deprecated */
export declare class CraftingEventPacket extends Packet {
    containerId: ContainerId;
    containerType: ContainerType;
    recipeId: mce.UUID;
    inputItems: CxxVector<NetworkItemStackDescriptor>;
    outputItems: CxxVector<NetworkItemStackDescriptor>;
}
/** @deprecated */
export declare class GuiDataPickItemPacket extends Packet {
}
/** @deprecated */
export declare class AdventureSettingsPacket extends Packet {
    flag1: uint32_t;
    commandPermission: uint32_t;
    flag2: uint32_t;
    playerPermission: uint32_t;
    actorId: ActorUniqueID;
    customFlag: uint32_t;
}
/** @deprecated */
export declare class BlockActorDataPacket extends Packet {
}
/** @deprecated */
export declare class PlayerInputPacket extends Packet {
}
/** @deprecated */
export declare class LevelChunkPacket extends Packet {
}
/** @deprecated */
export declare class SetCommandsEnabledPacket extends Packet {
    commandsEnabled: bool_t;
}
/** @deprecated */
export declare class SetDifficultyPacket extends Packet {
    difficulty: uint32_t;
}
/** @deprecated */
export declare class ChangeDimensionPacket extends Packet {
    dimensionId: uint32_t;
    x: float32_t;
    y: float32_t;
    z: float32_t;
    respawn: bool_t;
}
/** @deprecated */
export declare class SetPlayerGameTypePacket extends Packet {
    playerGameType: GameType;
}
/** @deprecated */
export declare class PlayerListPacket extends Packet {
}
/** @deprecated */
export declare class SimpleEventPacket extends Packet {
    subtype: uint16_t;
}
/** @deprecated */
export declare class TelemetryEventPacket extends Packet {
}
/** @deprecated */
export declare class SpawnExperienceOrbPacket extends Packet {
    pos: Vec3;
    amount: int32_t;
}
/** @deprecated */
export declare class MapItemDataPacket extends Packet {
}
/** @deprecated */
export declare class MapInfoRequestPacket extends Packet {
}
/** @deprecated */
export declare class RequestChunkRadiusPacket extends Packet {
}
/** @deprecated */
export declare class ChunkRadiusUpdatedPacket extends Packet {
}
/** @deprecated */
export declare class ItemFrameDropItemPacket extends Packet {
}
/** @deprecated */
export declare class GameRulesChangedPacket extends Packet {
}
/** @deprecated */
export declare class CameraPacket extends Packet {
}
/** @deprecated */
export declare class BossEventPacket extends Packet {
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
export declare namespace BossEventPacket {
    /** @deprecated */
    const Types: typeof minecraft.BossEventPacket.Types;
    /** @deprecated */
    type Types = minecraft.BossEventPacket.Types;
    /** @deprecated */
    const Colors: typeof minecraft.BossEventPacket.Colors;
    /** @deprecated */
    type Colors = minecraft.BossEventPacket.Colors;
    /** @deprecated */
    const Overlay: typeof minecraft.BossEventPacket.Overlay;
    /** @deprecated */
    type Overlay = minecraft.BossEventPacket.Overlay;
}
/** @deprecated */
export declare class ShowCreditsPacket extends Packet {
}
declare class AvailableCommandsParamData extends NativeClass {
    paramName: CxxString;
    paramType: int32_t;
    isOptional: bool_t;
    flags: uint8_t;
}
declare class AvailableCommandsOverloadData extends NativeClass {
    parameters: CxxVector<AvailableCommandsParamData>;
}
declare class AvailableCommandsCommandData extends NativeClass {
    name: CxxString;
    description: CxxString;
    flags: uint16_t;
    permission: uint8_t;
    /** @deprecated use overloads */
    parameters: CxxVector<CxxVector<CxxString>>;
    overloads: CxxVector<AvailableCommandsOverloadData>;
    aliases: int32_t;
}
declare class AvailableCommandsEnumData extends NativeClass {
}
/** @deprecated */
export declare class AvailableCommandsPacket extends Packet {
    enumValues: CxxVector<CxxString>;
    postfixes: CxxVector<CxxString>;
    enums: CxxVector<AvailableCommandsEnumData>;
    commands: CxxVector<AvailableCommandsCommandData>;
}
/** @deprecated */
export declare namespace AvailableCommandsPacket {
    type CommandData = AvailableCommandsCommandData;
    const CommandData: typeof AvailableCommandsCommandData;
    type EnumData = AvailableCommandsEnumData;
    const EnumData: typeof AvailableCommandsEnumData;
}
/** @deprecated */
export declare class CommandRequestPacket extends Packet {
    command: CxxString;
}
/** @deprecated */
export declare class CommandBlockUpdatePacket extends Packet {
}
/** @deprecated */
export declare class CommandOutputPacket extends Packet {
}
/** @deprecated */
export declare class ResourcePackDataInfoPacket extends Packet {
}
/** @deprecated */
export declare class ResourcePackChunkDataPacket extends Packet {
}
/** @deprecated */
export declare class ResourcePackChunkRequestPacket extends Packet {
}
/** @deprecated */
export declare class TransferPacket extends Packet {
    address: CxxString;
    port: uint16_t;
}
/** @deprecated */
export declare class PlaySoundPacket extends Packet {
    soundName: CxxString;
    pos: BlockPos;
    volume: float32_t;
    pitch: float32_t;
}
/** @deprecated */
export declare class StopSoundPacket extends Packet {
    soundName: CxxString;
    stopAll: bool_t;
}
/** @deprecated */
export declare class SetTitlePacket extends Packet {
    type: int32_t;
    text: CxxString;
    fadeInTime: int32_t;
    stayTime: int32_t;
    fadeOutTime: int32_t;
}
export declare namespace SetTitlePacket {
    /** @deprecated */
    const Types: typeof minecraft.SetTitlePacket.Types;
    /** @deprecated */
    type Types = minecraft.SetTitlePacket.Types;
}
/** @deprecated */
export declare class AddBehaviorTreePacket extends Packet {
}
/** @deprecated */
export declare class StructureBlockUpdatePacket extends Packet {
}
/** @deprecated */
export declare class ShowStoreOfferPacket extends Packet {
}
/** @deprecated */
export declare class PurchaseReceiptPacket extends Packet {
}
/** @deprecated */
export declare class PlayerSkinPacket extends Packet {
}
/** @deprecated */
export declare class SubClientLoginPacket extends Packet {
}
/** @deprecated */
export declare class WSConnectPacket extends Packet {
}
/** @deprecated */
export declare class SetLastHurtByPacket extends Packet {
}
/** @deprecated */
export declare class BookEditPacket extends Packet {
    type: uint8_t;
    inventorySlot: int32_t;
    pageNumber: int32_t;
    secondaryPageNumber: int32_t;
    text: CxxString;
    author: CxxString;
    xuid: CxxString;
}
/** @deprecated */
export declare namespace BookEditPacket {
    /** @deprecated */
    const Types: typeof minecraft.BookEditPacket.Types;
    /** @deprecated */
    type Types = minecraft.BookEditPacket.Types;
}
/** @deprecated */
export declare class NpcRequestPacket extends Packet {
}
/** @deprecated */
export declare class PhotoTransferPacket extends Packet {
}
/** @deprecated */
export declare class ModalFormRequestPacket extends Packet {
    id: uint32_t;
    content: CxxString;
}
/** @deprecated use ModalFormRequestPacket, follow the real class name */
export declare const ShowModalFormPacket: typeof ModalFormRequestPacket;
/** @deprecated use ModalFormRequestPacket, follow the real class name */
export declare type ShowModalFormPacket = ModalFormRequestPacket;
/** @deprecated */
export declare class ModalFormResponsePacket extends Packet {
    id: uint32_t;
    response: CxxString;
}
/** @deprecated */
export declare class ServerSettingsRequestPacket extends Packet {
}
/** @deprecated */
export declare class ServerSettingsResponsePacket extends Packet {
    id: uint32_t;
    content: CxxString;
}
/** @deprecated */
export declare class ShowProfilePacket extends Packet {
}
/** @deprecated */
export declare class SetDefaultGameTypePacket extends Packet {
}
/** @deprecated */
export declare class RemoveObjectivePacket extends Packet {
    objectiveName: CxxString;
}
/** @deprecated */
export declare class SetDisplayObjectivePacket extends Packet {
    displaySlot: 'list' | 'sidebar' | 'belowname' | '' | DisplaySlot;
    objectiveName: CxxString;
    displayName: CxxString;
    criteriaName: 'dummy' | '';
    sortOrder: ObjectiveSortOrder;
}
/** @deprecated */
export declare class ScorePacketInfo extends NativeClass {
    scoreboardId: ScoreboardId;
    objectiveName: CxxString;
    score: int32_t;
    type: ScorePacketInfo.Type;
    playerEntityUniqueId: bin64_t;
    entityUniqueId: bin64_t;
    customName: CxxString;
}
export declare namespace ScorePacketInfo {
    /** @deprecated */
    const Type: typeof minecraft.ScorePacketInfo.Type;
    /** @deprecated */
    type Type = minecraft.ScorePacketInfo.Type;
}
/** @deprecated */
export declare class SetScorePacket extends Packet {
    type: uint8_t;
    entries: CxxVector<ScorePacketInfo>;
}
export declare namespace SetScorePacket {
    /** @deprecated */
    const Type: typeof minecraft.SetScorePacket.Type;
    /** @deprecated */
    type Type = minecraft.SetScorePacket.Type;
}
/** @deprecated */
export declare class LabTablePacket extends Packet {
}
/** @deprecated */
export declare class UpdateBlockPacketSynced extends Packet {
}
/** @deprecated */
export declare class MoveActorDeltaPacket extends Packet {
}
/** @deprecated */
export declare class SetScoreboardIdentityPacket extends Packet {
}
/** @deprecated */
export declare class SetLocalPlayerAsInitializedPacket extends Packet {
    actorId: ActorRuntimeID;
}
/** @deprecated */
export declare class UpdateSoftEnumPacket extends Packet {
}
/** @deprecated */
export declare class NetworkStackLatencyPacket extends Packet {
}
/** @deprecated */
export declare class ScriptCustomEventPacket extends Packet {
}
/** @deprecated */
export declare class SpawnParticleEffectPacket extends Packet {
    dimensionId: uint8_t;
    actorId: ActorUniqueID;
    pos: Vec3;
    particleName: CxxString;
}
/** @deprecated use SpawnParticleEffectPacket, follow real class name */
export declare const SpawnParticleEffect: typeof SpawnParticleEffectPacket;
/** @deprecated use SpawnParticleEffectPacket, follow real class name */
export declare type SpawnParticleEffect = SpawnParticleEffectPacket;
/** @deprecated */
export declare class AvailableActorIdentifiersPacket extends Packet {
}
/** @deprecated */
export declare class LevelSoundEventPacketV2 extends Packet {
}
/** @deprecated */
export declare class NetworkChunkPublisherUpdatePacket extends Packet {
}
/** @deprecated */
export declare class BiomeDefinitionList extends Packet {
}
/** @deprecated */
export declare class LevelSoundEventPacket extends Packet {
    sound: uint32_t;
    pos: Vec3;
    extraData: int32_t;
    entityType: CxxString;
    isBabyMob: bool_t;
    disableRelativeVolume: bool_t;
}
/** @deprecated */
export declare class LevelEventGenericPacket extends Packet {
}
/** @deprecated */
export declare class LecternUpdatePacket extends Packet {
}
/** @deprecated */
export declare class RemoveEntityPacket extends Packet {
}
/** @deprecated */
export declare class ClientCacheStatusPacket extends Packet {
}
/** @deprecated */
export declare class OnScreenTextureAnimationPacket extends Packet {
    animationType: int32_t;
}
/** @deprecated */
export declare class MapCreateLockedCopy extends Packet {
}
/** @deprecated */
export declare class StructureTemplateDataRequestPacket extends Packet {
}
/** @deprecated */
export declare class StructureTemplateDataExportPacket extends Packet {
}
/** @deprecated */
export declare class ClientCacheBlobStatusPacket extends Packet {
}
/** @deprecated */
export declare class ClientCacheMissResponsePacket extends Packet {
}
/** @deprecated */
export declare class EducationSettingsPacket extends Packet {
}
/** @deprecated */
export declare class EmotePacket extends Packet {
}
/** @deprecated */
export declare class MultiplayerSettingsPacket extends Packet {
}
/** @deprecated */
export declare class SettingsCommandPacket extends Packet {
}
/** @deprecated */
export declare class AnvilDamagePacket extends Packet {
}
/** @deprecated */
export declare class CompletedUsingItemPacket extends Packet {
    itemId: int16_t;
    action: CompletedUsingItemPacket.Actions;
}
export declare namespace CompletedUsingItemPacket {
    /** @deprecated */
    const Actions: typeof minecraft.CompletedUsingItemPacket.Actions;
    /** @deprecated */
    type Actions = minecraft.CompletedUsingItemPacket.Actions;
}
/** @deprecated */
export declare class NetworkSettingsPacket extends Packet {
}
/** @deprecated */
export declare class PlayerAuthInputPacket extends Packet {
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
/** @deprecated */
export declare class CreativeContentPacket extends Packet {
}
/** @deprecated */
export declare class PlayerEnchantOptionsPacket extends Packet {
}
/** @deprecated */
export declare class ItemStackRequest extends Packet {
}
/** @deprecated */
export declare class ItemStackResponse extends Packet {
}
/** @deprecated */
export declare class PlayerArmorDamagePacket extends Packet {
}
/** @deprecated */
export declare class CodeBuilderPacket extends Packet {
}
/** @deprecated */
export declare class UpdatePlayerGameTypePacket extends Packet {
}
/** @deprecated */
export declare class EmoteListPacket extends Packet {
}
/** @deprecated */
export declare class PositionTrackingDBServerBroadcastPacket extends Packet {
    action: PositionTrackingDBServerBroadcastPacket.Actions;
    trackingId: int32_t;
}
export declare namespace PositionTrackingDBServerBroadcastPacket {
    /** @deprecated */
    const Actions: typeof minecraft.PositionTrackingDBServerBroadcastPacket.Actions;
    /** @deprecated */
    type Actions = minecraft.PositionTrackingDBServerBroadcastPacket.Actions;
}
/** @deprecated use PositionTrackingDBServerBroadcastPacket, follow the real class name */
export declare const PositionTrackingDBServerBroadcast: typeof PositionTrackingDBServerBroadcastPacket;
/** @deprecated use PositionTrackingDBServerBroadcastPacket, follow the real class name */
export declare type PositionTrackingDBServerBroadcast = PositionTrackingDBServerBroadcastPacket;
/** @deprecated */
export declare class PositionTrackingDBClientRequestPacket extends Packet {
    action: PositionTrackingDBClientRequestPacket.Actions;
    trackingId: int32_t;
}
export declare namespace PositionTrackingDBClientRequestPacket {
    /** @deprecated */
    const Actions: typeof minecraft.PositionTrackingDBClientRequestPacket.Actions;
    /** @deprecated */
    type Actions = minecraft.PositionTrackingDBClientRequestPacket.Actions;
}
/** @deprecated Use PositionTrackingDBClientRequestPacket, follow the real class name */
export declare const PositionTrackingDBClientRequest: typeof PositionTrackingDBClientRequestPacket;
/** @deprecated Use PositionTrackingDBClientRequestPacket, follow the real class name */
export declare type PositionTrackingDBClientRequest = PositionTrackingDBClientRequestPacket;
/** @deprecated */
export declare class DebugInfoPacket extends Packet {
}
/** @deprecated */
export declare class PacketViolationWarningPacket extends Packet {
}
/** @deprecated */
export declare class MotionPredictionHintsPacket extends Packet {
}
/** @deprecated */
export declare class AnimateEntityPacket extends Packet {
}
/** @deprecated */
export declare class CameraShakePacket extends Packet {
    intensity: float32_t;
    duration: float32_t;
    shakeType: uint8_t;
    shakeAction: uint8_t;
}
export declare namespace CameraShakePacket {
    /** @deprecated */
    const ShakeType: typeof minecraft.CameraShakePacket.ShakeType;
    /** @deprecated */
    type ShakeType = minecraft.CameraShakePacket.ShakeType;
    /** @deprecated */
    const ShakeAction: typeof minecraft.CameraShakePacket.ShakeAction;
    /** @deprecated */
    type ShakeAction = minecraft.CameraShakePacket.ShakeAction;
}
/** @deprecated */
export declare class PlayerFogPacket extends Packet {
}
/** @deprecated */
export declare class CorrectPlayerMovePredictionPacket extends Packet {
}
/** @deprecated */
export declare class ItemComponentPacket extends Packet {
}
/** @deprecated */
export declare class FilterTextPacket extends Packet {
}
/** @deprecated */
export declare class ClientboundDebugRendererPacket extends Packet {
}
/** @deprecated */
export declare class SyncActorPropertyPacket extends Packet {
}
/** @deprecated */
export declare class AddVolumeEntityPacket extends Packet {
}
/** @deprecated */
export declare class RemoveVolumeEntityPacket extends Packet {
}
/** @deprecated */
export declare class SimulationTypePacket extends Packet {
}
/** @deprecated */
export declare class NpcDialoguePacket extends Packet {
    /** ActorUniqueID of the Npc */
    actorId: ActorUniqueID;
    action: NpcDialoguePacket.Actions;
    /** Always empty */
    actorIdAsNumber: int64_as_float_t;
}
/** @deprecated */
export declare namespace NpcDialoguePacket {
    /** @deprecated */
    const Actions: typeof minecraft.NpcDialoguePacket.Actions;
    /** @deprecated */
    type Actions = minecraft.NpcDialoguePacket.Actions;
}
/** @deprecated */
export declare const PacketIdToType: {
    1: typeof LoginPacket;
    2: typeof PlayStatusPacket;
    3: typeof ServerToClientHandshakePacket;
    4: typeof ClientToServerHandshakePacket;
    5: typeof DisconnectPacket;
    6: typeof ResourcePacksInfoPacket;
    7: typeof ResourcePackStackPacket;
    8: typeof ResourcePackClientResponsePacket;
    9: typeof TextPacket;
    10: typeof SetTimePacket;
    11: typeof StartGamePacket;
    12: typeof AddPlayerPacket;
    13: typeof AddActorPacket;
    14: typeof RemoveActorPacket;
    15: typeof AddItemActorPacket;
    17: typeof TakeItemActorPacket;
    18: typeof MoveActorAbsolutePacket;
    19: typeof MovePlayerPacket;
    20: typeof RiderJumpPacket;
    21: typeof UpdateBlockPacket;
    22: typeof AddPaintingPacket;
    23: typeof TickSyncPacket;
    24: typeof LevelSoundEventPacketV1;
    25: typeof LevelEventPacket;
    26: typeof BlockEventPacket;
    27: typeof ActorEventPacket;
    28: typeof MobEffectPacket;
    29: typeof UpdateAttributesPacket;
    30: typeof InventoryTransactionPacket;
    31: typeof MobEquipmentPacket;
    32: typeof MobArmorEquipmentPacket;
    33: typeof InteractPacket;
    34: typeof BlockPickRequestPacket;
    35: typeof ActorPickRequestPacket;
    36: typeof PlayerActionPacket;
    38: typeof HurtArmorPacket;
    39: typeof SetActorDataPacket;
    40: typeof SetActorMotionPacket;
    41: typeof SetActorLinkPacket;
    42: typeof SetHealthPacket;
    43: typeof SetSpawnPositionPacket;
    44: typeof AnimatePacket;
    45: typeof RespawnPacket;
    46: typeof ContainerOpenPacket;
    47: typeof ContainerClosePacket;
    48: typeof PlayerHotbarPacket;
    49: typeof InventoryContentPacket;
    50: typeof InventorySlotPacket;
    51: typeof ContainerSetDataPacket;
    52: typeof CraftingDataPacket;
    53: typeof CraftingEventPacket;
    54: typeof GuiDataPickItemPacket;
    55: typeof AdventureSettingsPacket;
    56: typeof BlockActorDataPacket;
    57: typeof PlayerInputPacket;
    58: typeof LevelChunkPacket;
    59: typeof SetCommandsEnabledPacket;
    60: typeof SetDifficultyPacket;
    61: typeof ChangeDimensionPacket;
    62: typeof SetPlayerGameTypePacket;
    63: typeof PlayerListPacket;
    64: typeof SimpleEventPacket;
    65: typeof TelemetryEventPacket;
    66: typeof SpawnExperienceOrbPacket;
    67: typeof MapItemDataPacket;
    68: typeof MapInfoRequestPacket;
    69: typeof RequestChunkRadiusPacket;
    70: typeof ChunkRadiusUpdatedPacket;
    71: typeof ItemFrameDropItemPacket;
    72: typeof GameRulesChangedPacket;
    73: typeof CameraPacket;
    74: typeof BossEventPacket;
    75: typeof ShowCreditsPacket;
    76: typeof AvailableCommandsPacket;
    77: typeof CommandRequestPacket;
    78: typeof CommandBlockUpdatePacket;
    79: typeof CommandOutputPacket;
    82: typeof ResourcePackDataInfoPacket;
    83: typeof ResourcePackChunkDataPacket;
    84: typeof ResourcePackChunkRequestPacket;
    85: typeof TransferPacket;
    86: typeof PlaySoundPacket;
    87: typeof StopSoundPacket;
    88: typeof SetTitlePacket;
    89: typeof AddBehaviorTreePacket;
    90: typeof StructureBlockUpdatePacket;
    91: typeof ShowStoreOfferPacket;
    92: typeof PurchaseReceiptPacket;
    93: typeof PlayerSkinPacket;
    94: typeof SubClientLoginPacket;
    95: typeof WSConnectPacket;
    96: typeof SetLastHurtByPacket;
    97: typeof BookEditPacket;
    98: typeof NpcRequestPacket;
    99: typeof PhotoTransferPacket;
    100: typeof ModalFormRequestPacket;
    101: typeof ModalFormResponsePacket;
    102: typeof ServerSettingsRequestPacket;
    103: typeof ServerSettingsResponsePacket;
    104: typeof ShowProfilePacket;
    105: typeof SetDefaultGameTypePacket;
    106: typeof RemoveObjectivePacket;
    107: typeof SetDisplayObjectivePacket;
    108: typeof SetScorePacket;
    109: typeof LabTablePacket;
    110: typeof UpdateBlockPacketSynced;
    111: typeof MoveActorDeltaPacket;
    112: typeof SetScoreboardIdentityPacket;
    113: typeof SetLocalPlayerAsInitializedPacket;
    114: typeof UpdateSoftEnumPacket;
    115: typeof NetworkStackLatencyPacket;
    117: typeof ScriptCustomEventPacket;
    118: typeof SpawnParticleEffectPacket;
    119: typeof AvailableActorIdentifiersPacket;
    120: typeof LevelSoundEventPacketV2;
    121: typeof NetworkChunkPublisherUpdatePacket;
    122: typeof BiomeDefinitionList;
    123: typeof LevelSoundEventPacket;
    124: typeof LevelEventGenericPacket;
    125: typeof LecternUpdatePacket;
    128: typeof RemoveEntityPacket;
    129: typeof ClientCacheStatusPacket;
    130: typeof OnScreenTextureAnimationPacket;
    131: typeof MapCreateLockedCopy;
    132: typeof StructureTemplateDataRequestPacket;
    133: typeof StructureTemplateDataExportPacket;
    135: typeof ClientCacheBlobStatusPacket;
    136: typeof ClientCacheMissResponsePacket;
    137: typeof EducationSettingsPacket;
    138: typeof EmotePacket;
    139: typeof MultiplayerSettingsPacket;
    140: typeof SettingsCommandPacket;
    141: typeof AnvilDamagePacket;
    142: typeof CompletedUsingItemPacket;
    143: typeof NetworkSettingsPacket;
    144: typeof PlayerAuthInputPacket;
    145: typeof CreativeContentPacket;
    146: typeof PlayerEnchantOptionsPacket;
    147: typeof ItemStackRequest;
    148: typeof ItemStackResponse;
    149: typeof PlayerArmorDamagePacket;
    150: typeof CodeBuilderPacket;
    151: typeof UpdatePlayerGameTypePacket;
    152: typeof EmoteListPacket;
    153: typeof PositionTrackingDBServerBroadcastPacket;
    154: typeof PositionTrackingDBClientRequestPacket;
    155: typeof DebugInfoPacket;
    156: typeof PacketViolationWarningPacket;
    157: typeof MotionPredictionHintsPacket;
    158: typeof AnimateEntityPacket;
    159: typeof CameraShakePacket;
    160: typeof PlayerFogPacket;
    161: typeof CorrectPlayerMovePredictionPacket;
    162: typeof ItemComponentPacket;
    163: typeof FilterTextPacket;
    164: typeof ClientboundDebugRendererPacket;
    165: typeof SyncActorPropertyPacket;
    166: typeof AddVolumeEntityPacket;
    167: typeof RemoveVolumeEntityPacket;
    168: typeof SimulationTypePacket;
    169: typeof NpcDialoguePacket;
};
/** @deprecated */
export declare type PacketIdToType = {
    [key in keyof typeof PacketIdToType]: InstanceType<typeof PacketIdToType[key]>;
};
export {};
