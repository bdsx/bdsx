import { CxxVector } from "bdsx/cxxvector";
import { MantleClass, NativeClass } from "bdsx/nativeclass";
import { bin64_t, bool_t, CxxString, float32_t, int32_t, int8_t, NativeType, uint16_t, uint32_t, uint8_t } from "bdsx/nativetype";
import { ActorRuntimeID } from "./actor";
import { BlockPos, Vec3 } from "./blockpos";
import { ConnectionRequest } from "./connreq";
import { HashedString } from "./hashedstring";
import { Packet } from "./packet";

/** @deprecated use BlockPos instead */
export const NetworkBlockPosition = BlockPos;
/** @deprecated use BlockPos instead */
export type NetworkBlockPosition = BlockPos;

export class LoginPacket extends Packet {
    u5:uint32_t; //0x184
    connreq:ConnectionRequest;
}
LoginPacket.abstract({
    u5:uint32_t,
    connreq:[ConnectionRequest.ref(), 0x30],
});

// struct InventoryTransactionPacket : Packet
// {
// 	ComplexInventoryTransaction* transaction;
// };

export class PlayStatusPacket extends Packet {
    status:int32_t;
}
PlayStatusPacket.abstract({
    status:[int32_t, 0x28]
});

export class ServerToClientHandshakePacket extends Packet {
    // unknown
}

export class ClientToServerHandshakePacket extends Packet {
    // unknown
}

export class DisconnectPacket extends Packet {
    message:CxxString;
}
DisconnectPacket.abstract({
    message:[CxxString, 0x30]
});

export class ResourcePacksInfoPacket extends Packet {
    // unknown
}

export class ResourcePackStackPacket extends Packet {
    // unknown
}

export class ResourcePackClientResponsePacket extends Packet {
    // unknown
}

export class TextPacket extends Packet {
    type:uint8_t;
    needsTranslation:uint8_t;
    name:string;
    message:string;
}
TextPacket.abstract({
    type: [uint8_t, 0x28],
    needsTranslation: [uint8_t, 0x29],
    name: [CxxString, 0x30],
    message: [CxxString, 0x50],
});

export class SetTimePacket extends Packet {
    // unknown
}

export class LevelSettings extends MantleClass {
    seed:int32_t;
}
LevelSettings.define({
    seed:int32_t,
});

export class StartGamePacket extends Packet {
    settings:LevelSettings;
}
StartGamePacket.define({
    settings:LevelSettings,
});

export class AddPlayerPacket extends Packet {
    // unknown
}

export class AddEntityPacket extends Packet {
    // unknown
}

export class RemoveEntity_Packet extends Packet {
    // unknown
}

export class AddItemEntityPacket extends Packet {
    // unknown
}

export class TakeItemEntityPacket extends Packet {
    // unknown
}

export class MoveEntityPacket extends Packet {
    // unknown
}

export class MovePlayerPacket extends Packet {
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
MovePlayerPacket.abstract({
    actorId: [ActorRuntimeID, 0x28],
    pos: [Vec3, 0x30],
    pitch: [float32_t, 0x3C],
    yaw: [float32_t, 0x40],
    headYaw: [float32_t, 0x44],
    mode: [uint8_t, 0x48],
    onGround: [bool_t, 0x49],
    ridingActorId: [ActorRuntimeID, 0x50],
    teleportCause: [int32_t, 0x58],
    teleportItem: [int32_t, 0x5C],
    tick: [bin64_t, 0x60]
});

export class RiderJumpPacket extends Packet {
    // unknown
}

export class UpdateBlockPacket extends Packet {
    blockPos: BlockPos;
    blockRuntimeId: uint32_t;
    flags: uint8_t;
    dataLayerId: uint32_t;
}

UpdateBlockPacket.abstract({
    blockPos: [BlockPos, 0x28],
    blockRuntimeId: [uint32_t, 0x3c],
    flags: [uint8_t, 0x38],
    dataLayerId: [uint32_t, 0x34]
});

export class AddPaintingPacket extends Packet {
    // unknown
}

export class TickSyncPacket extends Packet {
    // unknown
}

export class LevelSoundEventOldPacket extends Packet {
    // unknown
}

export class LevelEventPacket extends Packet {
    // unknown
}

export class BlockEventPacket extends Packet {
    // unknown
}

export class EntityEventPacket extends Packet {
    actorId: ActorRuntimeID;
    event: uint8_t;
    data: int32_t;
}
EntityEventPacket.define({
    actorId: [ActorRuntimeID, 0x28],
    event: [uint8_t, 0x30],
    data: [int32_t, 0x34]
});

export class MobEffectPacket extends Packet {
    // unknown
}

export class AttributeData extends NativeClass {
    min:number;
    max:number;
    current:number;
    default:number;
    name:HashedString;

    [NativeType.ctor]():void {
        this.min = 0;
        this.max = 0;
        this.current = 0;
        this.default = 0;
    }
}
AttributeData.define({
    current: [float32_t, 0],
    min: [float32_t, 4],
    max: [float32_t, 8],
    default: [float32_t, 12],
    name: [HashedString, 16],
}, 0x40);

export class UpdateAttributesPacket extends Packet {
    actorId:ActorRuntimeID;
    attributes:CxxVector<AttributeData>;
}
UpdateAttributesPacket.define({
    actorId: [ActorRuntimeID, 0x28],
    attributes: [CxxVector.make(AttributeData), 0x30],
});

export class InventoryTransactionPacket extends Packet {
    // unknown
}

export class MobEquipmentPacket extends Packet {
    // unknown
}

export class MobArmorEquipmentPacket extends Packet {
    // unknown
}

export class InteractPacket extends Packet {
    // unknown
}

export class BlockPickRequestPacket extends Packet {
    // unknown
}

export class EntityPickRequestPacket extends Packet {
    // unknown
}

export class PlayerActionPacket extends Packet {
    // unknown
}

export class EntityFallPacket extends Packet {
    // unknown
}

export class HurtArmorPacket extends Packet {
    // unknown
}

export class SetEntityDataPacket extends Packet {
    // unknown
}

export class SetEntityMotionPacket extends Packet {
    // unknown
}

export class SetEntityLinkPacket extends Packet {
    // unknown
}

export class SetHealthPacket extends Packet {
    // unknown
}

export class SetSpawnPositionPacket extends Packet {
    // unknown
}

export class AnimatePacket extends Packet {
    action:uint8_t;
    actorId:ActorRuntimeID;
    unknown:float32_t;
}
AnimatePacket.abstract({
    action:[uint8_t, 0x30],
    actorId:[ActorRuntimeID, 0x28],
    unknown:[float32_t, 0x34]
});

export class RespawnPacket extends Packet {
    // unknown
}



export class ContainerOpenPacket extends Packet {
    windowId:uint8_t;
    type:int8_t;
    pos:BlockPos;
    entityUniqueId:bin64_t;
}
ContainerOpenPacket.abstract({
    windowId:[uint8_t, 0x28],
    type:[int8_t, 0x29],
    pos:[BlockPos, 0x2C],
    entityUniqueId:[bin64_t, 0x38],
});

export class ContainerClosePacket extends Packet {
    // unknown
}

export class PlayerHotbarPacket extends Packet {
    selectedSlot:uint8_t;
    windowId:uint8_t;
    selectHotbarSlot:boolean;
}
PlayerHotbarPacket.abstract({
    selectedSlot:[uint8_t, 0x28],
    windowId:[uint8_t, 0x2D],
    selectHotbarSlot:[bool_t, 0x2C],
});

export class InventoryContentPacket extends Packet {
    // unknown
}

export class InventorySlotPacket extends Packet {
    // unknown
}

export class ContainerSetDataPacket extends Packet {
    // unknown
}

export class CraftingDataPacket extends Packet {
    // unknown
}

export class CraftingEventPacket extends Packet {
    // unknown
}

export class GuiDataPickItemPacket extends Packet {
    // unknown
}

export class AdventureSettingsPacket extends Packet {
    // unknown
}

export class BlockEntityDataPacket extends Packet {
    // unknown
}

export class PlayerInputPacket extends Packet {
    // unknown
}

export class LevelChunkPacket extends Packet {
    // unknown
}

export class SetCommandsEnabledPacket extends Packet {
    // unknown
}

export class SetDifficultyPacket extends Packet {
    // unknown
}

export class ChangeDimensionPacket extends Packet {
    dimensionId:uint32_t;
    x:float32_t;
    y:float32_t;
    z:float32_t;
    respawn:bool_t;
}
ChangeDimensionPacket.abstract({
    dimensionId:uint32_t,
    x:float32_t,
    y:float32_t,
    z:float32_t,
    respawn:bool_t
});

export class SetPlayerGameTypePacket extends Packet {
    // unknown
}

export class PlayerListPacket extends Packet {
    // unknown
}

export class SimpleEventPacket extends Packet {
    // unknown
}

export class TelemetryEventPacket extends Packet {
    // unknown
}

export class SpawnExperienceOrbPacket extends Packet {
    // unknown
}

export class ClientboundMapItemDataPacket extends Packet {
    // unknown
}

export class MapInfoRequestPacket extends Packet {
    // unknown
}

export class RequestChunkRadiusPacket extends Packet {
    // unknown
}

export class ChunkRadiusUpdatePacket extends Packet {
    // unknown
}

export class ItemFrameDropItemPacket extends Packet {
    // unknown
}

export class GameRulesChangedPacket extends Packet {
    // unknown
}

export class CameraPacket extends Packet {
    // unknown
}

export class BossEventPacket extends Packet {
    // unknown
}

export class ShowCreditsPacket extends Packet {
    // unknown
}

export class AvailableCommandsPacket extends Packet {
    // unknown
}

export class CommandRequestPacket extends Packet {
    command:CxxString;
}
CommandRequestPacket.abstract({
    command:[CxxString, 0x28]
});


export class CommandBlockUpdatePacket extends Packet {
    // unknown
}

export class CommandOutputPacket extends Packet {
    // unknown
}

export class UpdateTradePacket extends Packet {
    // unknown
}

export class UpdateEquipmentPacket extends Packet {
    // unknown
}

export class ResourcePackDataInfoPacket extends Packet {
    // unknown
}

export class ResourcePackChunkDataPacket extends Packet {
    // unknown
}

export class ResourcePackChunkRequestPacket extends Packet {
    // unknown
}

export class TransferPacket extends Packet {
    address:CxxString;
    port:uint16_t;
}
TransferPacket.abstract({
    address:[CxxString, 0x28],
    port:[uint16_t, 0x48]
});

export class PlaySoundPacket extends Packet {
    soundName:CxxString;
    pos:BlockPos;
    volume:float32_t;
    pitch:float32_t;
}
PlaySoundPacket.abstract({
    soundName:[CxxString, 0x30],
    pos:[BlockPos, 0x40],
    volume:[float32_t, 0x4C],
    pitch:[float32_t, 0x50],
});

export class StopSoundPacket extends Packet {
    // unknown
}

export class SetTitlePacket extends Packet {
    // unknown
}

export class AddBehaviorTreePacket extends Packet {
    // unknown
}

export class StructureBlockUpdatePacket extends Packet {
    // unknown
}

export class ShowStoreOfferPacket extends Packet {
    // unknown
}

export class PurchaseReceiptPacket extends Packet {
    // unknown
}

export class PlayerSkinPacket extends Packet {
    // unknown
}

export class SubClientLoginPacket extends Packet {
    // unknown
}

export class InitiateWebSocketConnectionPacket extends Packet {
    // unknown
}

export class SetLastHurtByPacket extends Packet {
    // unknown
}

export class BookEditPacket extends Packet {
    // unknown
}

export class NpcRequestPacket extends Packet {
    // unknown
}

export class PhotoTransferPacket extends Packet {
    // unknown
}

export class ModalFormRequestPacket extends Packet {
    id:uint32_t;
    content:CxxString;
}
ModalFormRequestPacket.abstract({
    id: [uint32_t, 0x28],
    content: [CxxString, 0x30],
});

export class ModalFormResponsePacket extends Packet {
    // unknown
}

export class ServerSettingsRequestPacket extends Packet {
    // unknown
}

export class ServerSettingsResponsePacket extends Packet {
    id:uint32_t;
    content:CxxString;
}
ServerSettingsResponsePacket.abstract({
    id: [uint32_t, 0x28],
    content: [CxxString, 0x30],
});

export class ShowProfilePacket extends Packet {
    // unknown
}

export class SetDefaultGameTypePacket extends Packet {
    // unknown
}

export class RemoveObjectivePacket extends Packet {
    // unknown
}

export class SetDisplayObjectivePacket extends Packet {
    displaySlot:CxxString;
    objectiveName:CxxString;
    displayName:CxxString;
    criteriaName:CxxString;
    sortOrder:int32_t;
}
SetDisplayObjectivePacket.abstract({
    displaySlot:[CxxString, 0x28],
    objectiveName:[CxxString, 0x48],
    displayName:[CxxString, 0x68],
    criteriaName:[CxxString, 0x88],
    sortOrder:[int32_t, 0xA8],
});

export class SetScorePacket extends Packet {
    // unknown
}

export class LabTablePacket extends Packet {
    // unknown
}

export class UpdateBlockSyncedPacket extends Packet {
    // unknown
}

export class MoveEntityDeltaPacket extends Packet {
    // unknown
}

export class SetScoreboardIdentityPacket extends Packet {
    // unknown
}

export class SetLocalPlayerAsInitializedPacket extends Packet {
    // unknown
}

export class UpdateSoftEnumPacket extends Packet {
    // unknown
}

export class NetworkStackLatencyPacket extends Packet {
    // unknown
}

export class ScriptCustomEventPacket extends Packet {
    // unknown
}

export class SpawnParticleEffectPacket extends Packet {
    // unknown
}

export class AvailableEntityIdentifiersPacket extends Packet {
    // unknown
}

export class LevelSoundEventV2Packet extends Packet {
    // unknown
}

export class NetworkChunkPublisherUpdatePacket extends Packet {
    // unknown
}

export class BiomeDefinitionListPacket extends Packet {
    // unknown
}

export class LevelSoundEventPacket extends Packet {
    // unknown
}

export class LevelEventGenericPacket extends Packet {
    // unknown
}

export class LecternUpdatePacket extends Packet {
    // unknown
}

export class VideoStreamConnectPacket extends Packet {
    // unknown
}

export class RemoveEntityPacket extends Packet {
    // unknown
}

export class ClientCacheStatusPacket extends Packet {
    // unknown
}

export class OnScreenTextureAnimationPacket extends Packet {
    // unknown
}

export class MapCreateLockedCopyPacket extends Packet {
    // unknown
}

export class StructureTemplateDataExportRequestPacket extends Packet {
    // unknown
}

export class StructureTemplateDataExportResponsePacket extends Packet {
    // unknown
}

export class UpdateBlockPropertiesPacket extends Packet {
    // unknown
}

export class ClientCacheBlobStatusPacket extends Packet {
    // unknown
}

export class ClientCacheMissResponsePacket extends Packet {
    // unknown
}

export class EducationSettingsPacket extends Packet {
    // unknown
}

export class EmotePacket extends Packet {
    // unknown
}

export class MultiplayerSettingsPacket extends Packet {
    // unknown
}

export class SettingsCommandPacket extends Packet {
    // unknown
}

export class AnvilDamagePacket extends Packet {
    // unknown
}

export class CompletedUsingItemPacket extends Packet {
    // unknown
}

export class NetworkSettingsPacket extends Packet {
    // unknown
}

export class PlayerAuthInputPacket extends Packet {
    pos: Vec3;
}
PlayerAuthInputPacket.abstract({
    pos: [Vec3, 0x30]
});

export class CreativeContentPacket extends Packet {
    // unknown
}

export class PlayerEnchantOptionsPacket extends Packet {
    // unknown
}

export class ItemStackRequestPacket extends Packet {
    // unknown
}

export class ItemStackResponsePacket extends Packet {
    // unknown
}

export class PlayerArmorDamagePacket extends Packet {
    // unknown
}

export class CodeBuilderPacket extends Packet {
    // unknown
}

export class UpdatePlayerGameTypePacket extends Packet {
    // unknown
}

export class EmoteListPacketPacket extends Packet {
    // unknown
}

export class PositionTrackingDBServerBroadcastPacket extends Packet {
    // unknown
}

export class PositionTrackingDBClientRequestPacket extends Packet {
    // unknown
}

export class DebugInfoPacket extends Packet {
    // unknown
}

export class PacketViolationWarningPacket extends Packet {
    // unknown
}

export class MotionPredictionHintsPacket extends Packet {
    // unknown
}

export class AnimateEntityPacket extends Packet {
    // unknown
}

export class CameraShakePacket extends Packet {
    // unknown
}

export class PlayerFogPacket extends Packet {
    // unknown
}

export class CorrectPlayerMovePredictionPacketPacket extends Packet {
    // unknown
}

export class ItemComponentPacket extends Packet {
    // unknown
}

export class FilterTextPacketPacket extends Packet {
    // unknown
}

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