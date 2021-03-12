import { CxxVector } from "bdsx/cxxvector";
import { defineNative, MantleClass, NativeClass, nativeField } from "bdsx/nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int32_t, int8_t, NativeType, uint16_t, uint32_t, uint8_t } from "bdsx/nativetype";
import { ActorRuntimeID } from "./actor";
import { BlockPos } from "./blockpos";
import { ConnectionRequest } from "./connreq";
import { HashedString } from "./hashedstring";
import { Packet } from "./packet";


/** @deprecated use BlockPos instead */
export const NetworkBlockPosition = BlockPos;
/** @deprecated use BlockPos instead */
export type NetworkBlockPosition = BlockPos;

@defineNative(null)
export class LoginPacket extends Packet {
    @nativeField(uint32_t)
	u5:uint32_t; //0x184
    @nativeField(ConnectionRequest.ref())
	connreq:ConnectionRequest;
}

@defineNative(null)
export class PlayStatusPacket extends Packet {
    @nativeField(int32_t)
    status:int32_t;
}

@defineNative(null)
export class ServerToClientHandshakePacket extends Packet {
    // unknown
}

@defineNative(null)
export class ClientToServerHandshakePacket extends Packet {
    // unknown
}

@defineNative(null)
export class DisconnectPacket extends Packet {
    @nativeField(CxxString, 0x30)
    message:CxxString;
}

@defineNative(null)
export class ResourcePacksInfoPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ResourcePackStackPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ResourcePackClientResponsePacket extends Packet {
    // unknown
}

@defineNative(null)
export class TextPacket extends Packet {
    @nativeField(uint8_t)
    type:uint8_t;
    @nativeField(uint8_t)
    needsTranslation:uint8_t;
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(CxxString)
    message:CxxString;
}

@defineNative(null)
export class SetTimePacket extends Packet {
    // unknown
}

@defineNative(null)
export class LevelSettings extends MantleClass {
    @nativeField(int32_t) 
    seed:int32_t;
}

@defineNative(null)
export class StartGamePacket extends Packet {
    @nativeField(LevelSettings)
    settings:LevelSettings;
}
@defineNative(null)
export class AddPlayerPacket extends Packet {
    // unknown
}

@defineNative(null)
export class AddEntityPacket extends Packet {
    // unknown
}

@defineNative(null)
export class RemoveEntity_Packet extends Packet {
    // unknown
}

@defineNative(null)
export class AddItemEntityPacket extends Packet {
    // unknown
}

@defineNative(null)
export class TakeItemEntityPacket extends Packet {
    // unknown
}

@defineNative(null)
export class MoveEntityPacket extends Packet {
    // unknown
}

@defineNative(null)
export class MovePlayerPacket extends Packet {
    // unknown
}

@defineNative(null)
export class RiderJumpPacket extends Packet {
    // unknown
}

@defineNative(null)
export class UpdateBlockPacket extends Packet {
    @nativeField(BlockPos) 
    blockPos: BlockPos;
    @nativeField(uint32_t) 
    blockRuntimeId: uint32_t;
    @nativeField(uint8_t) 
    flags: uint8_t;
    @nativeField(uint32_t) 
    dataLayerId: uint32_t;
}

@defineNative(null)
export class AddPaintingPacket extends Packet {
    // unknown
}

@defineNative(null)
export class TickSyncPacket extends Packet {
    // unknown
}

@defineNative(null)
export class LevelSoundEventOldPacket extends Packet {
    // unknown
}

@defineNative(null)
export class LevelEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class BlockEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class EntityEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class MobEffectPacket extends Packet {
    // unknown
}

@defineNative()
export class AttributeData extends NativeClass {
    @nativeField(float32_t)
    min:number;
    @nativeField(float32_t)
    max:number;
    @nativeField(float32_t)
    current:number;
    @nativeField(float32_t)
    default:number;
    @nativeField(HashedString)
    name:HashedString;

    [NativeType.ctor]():void {
        this.min = 0;
        this.max = 0;
        this.current = 0;
        this.default = 0;
    }
}

@defineNative(null)
export class UpdateAttributesPacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId:ActorRuntimeID;
    @nativeField(CxxVector.make<AttributeData>(AttributeData))
    attributes:CxxVector<AttributeData>;
}

@defineNative(null)
export class InventoryTransactionPacket extends Packet {
    // ComplexInventoryTransaction* transaction;
    // unknown
}

@defineNative(null)
export class MobEquipmentPacket extends Packet {
    // unknown
}

@defineNative(null)
export class MobArmorEquipmentPacket extends Packet {
    // unknown
}

@defineNative(null)
export class InteractPacket extends Packet {
    // unknown
}

@defineNative(null)
export class BlockPickRequestPacket extends Packet {
    // unknown
}

@defineNative(null)
export class EntityPickRequestPacket extends Packet {
    // unknown
}

@defineNative(null)
export class PlayerActionPacket extends Packet {
    // unknown
}

@defineNative(null)
export class EntityFallPacket extends Packet {
    // unknown
}

@defineNative(null)
export class HurtArmorPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetEntityDataPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetEntityMotionPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetEntityLinkPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetHealthPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetSpawnPositionPacket extends Packet {
    // unknown
}

@defineNative(null)
export class AnimatePacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId:ActorRuntimeID;
    @nativeField(uint8_t, 0x30)
    action:uint8_t;
    @nativeField(float32_t)
    unknown:float32_t;
}

@defineNative(null)
export class RespawnPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ContainerOpenPacket extends Packet {
    @nativeField(uint8_t)
    windowId:uint8_t;
    @nativeField(int8_t)
    type:int8_t;
    @nativeField(BlockPos)
    pos:BlockPos;
    @nativeField(bin64_t)
    entityUniqueId:bin64_t;
}

@defineNative(null)
export class ContainerClosePacket extends Packet {
    // unknown
}

@defineNative(null)
export class PlayerHotbarPacket extends Packet {
    @nativeField(uint8_t)
    selectedSlot:uint8_t;
    @nativeField(bool_t, 0x2c)
    selectHotbarSlot:bool_t;
    @nativeField(uint8_t, 0x2d)
    windowId:uint8_t;
}

@defineNative(null)
export class InventoryContentPacket extends Packet {
    // unknown
}

@defineNative(null)
export class InventorySlotPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ContainerSetDataPacket extends Packet {
    // unknown
}

@defineNative(null)
export class CraftingDataPacket extends Packet {
    // unknown
}

@defineNative(null)
export class CraftingEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class GuiDataPickItemPacket extends Packet {
    // unknown
}

@defineNative(null)
export class AdventureSettingsPacket extends Packet {
    // unknown
}

@defineNative(null)
export class BlockEntityDataPacket extends Packet {
    // unknown
}

@defineNative(null)
export class PlayerInputPacket extends Packet {
    // unknown
}

@defineNative(null)
export class LevelChunkPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetCommandsEnabledPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetDifficultyPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ChangeDimensionPacket extends Packet {
    @nativeField(uint32_t)
    dimensionId:uint32_t;
    @nativeField(float32_t)
    x:float32_t;
    @nativeField(float32_t)
    y:float32_t;
    @nativeField(float32_t)
    z:float32_t;
    @nativeField(bool_t)
    respawn:bool_t;
}

@defineNative(null)
export class SetPlayerGameTypePacket extends Packet {
    // unknown
}

@defineNative(null)
export class PlayerListPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SimpleEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class TelemetryEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SpawnExperienceOrbPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ClientboundMapItemDataPacket extends Packet {
    // unknown
}

@defineNative(null)
export class MapInfoRequestPacket extends Packet {
    // unknown
}

@defineNative(null)
export class RequestChunkRadiusPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ChunkRadiusUpdatePacket extends Packet {
    // unknown
}

@defineNative(null)
export class ItemFrameDropItemPacket extends Packet {
    // unknown
}

@defineNative(null)
export class GameRulesChangedPacket extends Packet {
    // unknown
}

@defineNative(null)
export class CameraPacket extends Packet {
    // unknown
}

@defineNative(null)
export class BossEventPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ShowCreditsPacket extends Packet {
    // unknown
}

@defineNative(null)
export class AvailableCommandsPacket extends Packet {
    // unknown
}

@defineNative(null)
export class CommandRequestPacket extends Packet {
    @nativeField(CxxString)
    command:CxxString;
}


@defineNative(null)
export class CommandBlockUpdatePacket extends Packet {
    // unknown
}


@defineNative(null)
export class CommandOutputPacket extends Packet {
    // unknown
}


@defineNative(null)
export class UpdateTradePacket extends Packet {
    // unknown
}


@defineNative(null)
export class UpdateEquipmentPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ResourcePackDataInfoPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ResourcePackChunkDataPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ResourcePackChunkRequestPacket extends Packet {
    // unknown
}


@defineNative(null)
export class TransferPacket extends Packet {
    @nativeField(CxxString)
    address:CxxString;
    @nativeField(uint16_t)
    port:uint16_t;
}

@defineNative(null)
export class PlaySoundPacket extends Packet {
    // unknown
}

@defineNative(null)
export class StopSoundPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetTitlePacket extends Packet {
    // unknown
}

@defineNative(null)
export class AddBehaviorTreePacket extends Packet {
    // unknown
}

@defineNative(null)
export class StructureBlockUpdatePacket extends Packet {
    // unknown
}

@defineNative(null)
export class ShowStoreOfferPacket extends Packet {
    // unknown
}

@defineNative(null)
export class PurchaseReceiptPacket extends Packet {
    // unknown
}

@defineNative(null)
export class PlayerSkinPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SubClientLoginPacket extends Packet {
    // unknown
}

@defineNative(null)
export class InitiateWebSocketConnectionPacket extends Packet {
    // unknown
}

@defineNative(null)
export class SetLastHurtByPacket extends Packet {
    // unknown
}

@defineNative(null)
export class BookEditPacket extends Packet {
    // unknown
}

@defineNative(null)
export class NpcRequestPacket extends Packet {
    // unknown
}

@defineNative(null)
export class PhotoTransferPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ModalFormRequestPacket extends Packet {
    @nativeField(uint32_t)
    id:uint32_t;
    @nativeField(CxxString)
    content:CxxString;
}

@defineNative(null)
export class ModalFormResponsePacket extends Packet {
    // unknown
}

@defineNative(null)
export class ServerSettingsRequestPacket extends Packet {
    // unknown
}

@defineNative(null)
export class ServerSettingsResponsePacket extends Packet {
    @nativeField(uint32_t)
    id:uint32_t;
    @nativeField(CxxString)
    content:CxxString;
}

@defineNative(null)
export class ShowProfilePacket extends Packet {
    // unknown
}


@defineNative(null)
export class SetDefaultGameTypePacket extends Packet {
    // unknown
}


@defineNative(null)
export class RemoveObjectivePacket extends Packet {
    // unknown
}


@defineNative(null)
export class SetDisplayObjectivePacket extends Packet {
    @nativeField(CxxString)
    displaySlot:CxxString;
    @nativeField(CxxString)
    objectiveName:CxxString;
    @nativeField(CxxString)
    displayName:CxxString;
    @nativeField(CxxString)
    criteriaName:CxxString;
    @nativeField(int32_t)
    sortOrder:int32_t;
}

@defineNative(null)
export class SetScorePacket extends Packet {
    // unknown
}


@defineNative(null)
export class LabTablePacket extends Packet {
    // unknown
}


@defineNative(null)
export class UpdateBlockSyncedPacket extends Packet {
    // unknown
}


@defineNative(null)
export class MoveEntityDeltaPacket extends Packet {
    // unknown
}


@defineNative(null)
export class SetScoreboardIdentityPacket extends Packet {
    // unknown
}


@defineNative(null)
export class SetLocalPlayerAsInitializedPacket extends Packet {
    // unknown
}


@defineNative(null)
export class UpdateSoftEnumPacket extends Packet {
    // unknown
}


@defineNative(null)
export class NetworkStackLatencyPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ScriptCustomEventPacket extends Packet {
    // unknown
}


@defineNative(null)
export class SpawnParticleEffectPacket extends Packet {
    // unknown
}


@defineNative(null)
export class AvailableEntityIdentifiersPacket extends Packet {
    // unknown
}


@defineNative(null)
export class LevelSoundEventV2Packet extends Packet {
    // unknown
}


@defineNative(null)
export class NetworkChunkPublisherUpdatePacket extends Packet {
    // unknown
}


@defineNative(null)
export class BiomeDefinitionListPacket extends Packet {
    // unknown
}


@defineNative(null)
export class LevelSoundEventPacket extends Packet {
    // unknown
}


@defineNative(null)
export class LevelEventGenericPacket extends Packet {
    // unknown
}


@defineNative(null)
export class LecternUpdatePacket extends Packet {
    // unknown
}


@defineNative(null)
export class VideoStreamConnectPacket extends Packet {
    // unknown
}


@defineNative(null)
export class RemoveEntityPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ClientCacheStatusPacket extends Packet {
    // unknown
}


@defineNative(null)
export class OnScreenTextureAnimationPacket extends Packet {
    // unknown
}


@defineNative(null)
export class MapCreateLockedCopyPacket extends Packet {
    // unknown
}


@defineNative(null)
export class StructureTemplateDataExportRequestPacket extends Packet {
    // unknown
}


@defineNative(null)
export class StructureTemplateDataExportResponsePacket extends Packet {
    // unknown
}


@defineNative(null)
export class UpdateBlockPropertiesPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ClientCacheBlobStatusPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ClientCacheMissResponsePacket extends Packet {
    // unknown
}


@defineNative(null)
export class EducationSettingsPacket extends Packet {
    // unknown
}


@defineNative(null)
export class EmotePacket extends Packet {
    // unknown
}


@defineNative(null)
export class MultiplayerSettingsPacket extends Packet {
    // unknown
}


@defineNative(null)
export class SettingsCommandPacket extends Packet {
    // unknown
}


@defineNative(null)
export class AnvilDamagePacket extends Packet {
    // unknown
}


@defineNative(null)
export class CompletedUsingItemPacket extends Packet {
    // unknown
}


@defineNative(null)
export class NetworkSettingsPacket extends Packet {
    // unknown
}


@defineNative(null)
export class PlayerAuthInputPacket extends Packet {
    // unknown
}


@defineNative(null)
export class CreativeContentPacket extends Packet {
    // unknown
}


@defineNative(null)
export class PlayerEnchantOptionsPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ItemStackRequestPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ItemStackResponsePacket extends Packet {
    // unknown
}


@defineNative(null)
export class PlayerArmorDamagePacket extends Packet {
    // unknown
}


@defineNative(null)
export class CodeBuilderPacket extends Packet {
    // unknown
}


@defineNative(null)
export class UpdatePlayerGameTypePacket extends Packet {
    // unknown
}


@defineNative(null)
export class EmoteListPacketPacket extends Packet {
    // unknown
}


@defineNative(null)
export class PositionTrackingDBServerBroadcastPacket extends Packet {
    // unknown
}


@defineNative(null)
export class PositionTrackingDBClientRequestPacket extends Packet {
    // unknown
}


@defineNative(null)
export class DebugInfoPacket extends Packet {
    // unknown
}


@defineNative(null)
export class PacketViolationWarningPacket extends Packet {
    // unknown
}


@defineNative(null)
export class MotionPredictionHintsPacket extends Packet {
    // unknown
}


@defineNative(null)
export class AnimateEntityPacket extends Packet {
    // unknown
}


@defineNative(null)
export class CameraShakePacket extends Packet {
    // unknown
}


@defineNative(null)
export class PlayerFogPacket extends Packet {
    // unknown
}


@defineNative(null)
export class CorrectPlayerMovePredictionPacketPacket extends Packet {
    // unknown
}


@defineNative(null)
export class ItemComponentPacket extends Packet {
    // unknown
}


@defineNative(null)
export class FilterTextPacketPacket extends Packet {
    // unknown
}


@defineNative(null)
export class AlexEntityAnimationPacket extends Packet {
    // unknown
}

export const PacketIdToType = {
    0x01: LoginPacket,
    0x02: PlayStatusPacket,
    0x03: ServerToClientHandshakePacket,
    0x04: ClientToServerHandshakePacket,
    0x05: DisconnectPacket,
    0x06: ResourcePacksInfoPacket,
    0x07: ResourcePackStackPacket,
    0x08: ResourcePackClientResponsePacket,
    0x09: TextPacket,
    0x0a: SetTimePacket,
    0x0b: StartGamePacket,
    0x0c: AddPlayerPacket,
    0x0d: AddEntityPacket,
    0x0e: RemoveEntity_Packet,
    0x0f: AddItemEntityPacket,
    0x11: TakeItemEntityPacket,
    0x12: MoveEntityPacket,
    0x13: MovePlayerPacket,
    0x14: RiderJumpPacket,
    0x15: UpdateBlockPacket,
    0x16: AddPaintingPacket,
    0x17: TickSyncPacket,
    0x18: LevelSoundEventOldPacket,
    0x19: LevelEventPacket,
    0x1a: BlockEventPacket,
    0x1b: EntityEventPacket,
    0x1c: MobEffectPacket,
    0x1d: UpdateAttributesPacket,
    0x1e: InventoryTransactionPacket,
    0x1f: MobEquipmentPacket,
    0x20: MobArmorEquipmentPacket,
    0x21: InteractPacket,
    0x22: BlockPickRequestPacket,
    0x23: EntityPickRequestPacket,
    0x24: PlayerActionPacket,
    0x26: HurtArmorPacket,
    0x27: SetEntityDataPacket,
    0x28: SetEntityMotionPacket,
    0x29: SetEntityLinkPacket,
    0x2a: SetHealthPacket,
    0x2b: SetSpawnPositionPacket,
    0x2c: AnimatePacket,
    0x2d: RespawnPacket,
    0x2e: ContainerOpenPacket,
    0x2f: ContainerClosePacket,
    0x30: PlayerHotbarPacket,
    0x31: InventoryContentPacket,
    0x32: InventorySlotPacket,
    0x33: ContainerSetDataPacket,
    0x34: CraftingDataPacket,
    0x35: CraftingEventPacket,
    0x36: GuiDataPickItemPacket,
    0x37: AdventureSettingsPacket,
    0x38: BlockEntityDataPacket,
    0x39: PlayerInputPacket,
    0x3a: LevelChunkPacket,
    0x3b: SetCommandsEnabledPacket,
    0x3c: SetDifficultyPacket,
    0x3d: ChangeDimensionPacket,
    0x3e: SetPlayerGameTypePacket,
    0x3f: PlayerListPacket,
    0x40: SimpleEventPacket,
    0x41: TelemetryEventPacket,
    0x42: SpawnExperienceOrbPacket,
    0x43: ClientboundMapItemDataPacket,
    0x44: MapInfoRequestPacket,
    0x45: RequestChunkRadiusPacket,
    0x46: ChunkRadiusUpdatePacket,
    0x47: ItemFrameDropItemPacket,
    0x48: GameRulesChangedPacket,
    0x49: CameraPacket,
    0x4a: BossEventPacket,
    0x4b: ShowCreditsPacket,
    0x4c: AvailableCommandsPacket,
    0x4d: CommandRequestPacket,
    0x4e: CommandBlockUpdatePacket,
    0x4f: CommandOutputPacket,
    0x50: UpdateTradePacket,
    0x51: UpdateEquipmentPacket,
    0x52: ResourcePackDataInfoPacket,
    0x53: ResourcePackChunkDataPacket,
    0x54: ResourcePackChunkRequestPacket,
    0x55: TransferPacket,
    0x56: PlaySoundPacket,
    0x57: StopSoundPacket,
    0x58: SetTitlePacket,
    0x59: AddBehaviorTreePacket,
    0x5a: StructureBlockUpdatePacket,
    0x5b: ShowStoreOfferPacket,
    0x5c: PurchaseReceiptPacket,
    0x5d: PlayerSkinPacket,
    0x5e: SubClientLoginPacket,
    0x5f: InitiateWebSocketConnectionPacket,
    0x60: SetLastHurtByPacket,
    0x61: BookEditPacket,
    0x62: NpcRequestPacket,
    0x63: PhotoTransferPacket,
    0x64: ModalFormRequestPacket,
    0x65: ModalFormResponsePacket,
    0x66: ServerSettingsRequestPacket,
    0x67: ServerSettingsResponsePacket,
    0x68: ShowProfilePacket,
    0x69: SetDefaultGameTypePacket,
    0x6a: RemoveObjectivePacket,
    0x6b: SetDisplayObjectivePacket,
    0x6c: SetScorePacket,
    0x6d: LabTablePacket,
    0x6e: UpdateBlockSyncedPacket,
    0x6f: MoveEntityDeltaPacket,
    0x70: SetScoreboardIdentityPacket,
    0x71: SetLocalPlayerAsInitializedPacket,
    0x72: UpdateSoftEnumPacket,
    0x73: NetworkStackLatencyPacket,
    0x75: ScriptCustomEventPacket,
    0x76: SpawnParticleEffectPacket,
    0x77: AvailableEntityIdentifiersPacket,
    0x78: LevelSoundEventV2Packet,
    0x79: NetworkChunkPublisherUpdatePacket,
    0x7a: BiomeDefinitionListPacket,
    0x7b: LevelSoundEventPacket,
    0x7c: LevelEventGenericPacket,
    0x7d: LecternUpdatePacket,
    0x7e: VideoStreamConnectPacket,
    0x80: RemoveEntityPacket,
    0x81: ClientCacheStatusPacket,
    0x82: OnScreenTextureAnimationPacket,
    0x83: MapCreateLockedCopyPacket,
    0x84: StructureTemplateDataExportRequestPacket,
    0x85: StructureTemplateDataExportResponsePacket,
    0x86: UpdateBlockPropertiesPacket,
    0x87: ClientCacheBlobStatusPacket,
    0x88: ClientCacheMissResponsePacket,
    0x89: EducationSettingsPacket,
    0x8a: EmotePacket,
    0x8b: MultiplayerSettingsPacket,
    0x8c: SettingsCommandPacket,
    0x8d: AnvilDamagePacket,
    0x8e: CompletedUsingItemPacket,
    0x8f: NetworkSettingsPacket,
    0x90: PlayerAuthInputPacket,
    0x91: CreativeContentPacket,
    0x92: PlayerEnchantOptionsPacket,
    0x93: ItemStackRequestPacket,
    0x94: ItemStackResponsePacket,
    0x95: PlayerArmorDamagePacket,
    0x96: CodeBuilderPacket,
    0x97: UpdatePlayerGameTypePacket,
    0x98: EmoteListPacketPacket,
    0x99: PositionTrackingDBServerBroadcastPacket,
    0x9a: PositionTrackingDBClientRequestPacket,
    0x9b: DebugInfoPacket,
    0x9c: PacketViolationWarningPacket,
    0x9d: MotionPredictionHintsPacket,
    0x9e: AnimateEntityPacket,
    0x9f: CameraShakePacket,
    0xa0: PlayerFogPacket,
    0xa1: CorrectPlayerMovePredictionPacketPacket,
    0xa2: ItemComponentPacket,
    0xa3: FilterTextPacketPacket,
    0xe0: AlexEntityAnimationPacket,
};
export type PacketIdToType = {[key in keyof typeof PacketIdToType]:InstanceType<typeof PacketIdToType[key]>};

for (const packetId in PacketIdToType) {
    PacketIdToType[packetId as unknown as keyof PacketIdToType].ID = +packetId;
}
