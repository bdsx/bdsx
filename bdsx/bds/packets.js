"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerOpenPacket = exports.RespawnPacket = exports.AnimatePacket = exports.SetSpawnPositionPacket = exports.SetHealthPacket = exports.SetActorLinkPacket = exports.SetActorMotionPacket = exports.SetActorDataPacket = exports.HurtArmorPacket = exports.EntityFallPacket = exports.PlayerActionPacket = exports.ActorPickRequestPacket = exports.BlockPickRequestPacket = exports.InteractPacket = exports.MobArmorEquipmentPacket = exports.MobEquipmentPacket = exports.InventoryTransactionPacket = exports.UpdateAttributesPacket = exports.AttributeData = exports.MobEffectPacket = exports.ActorEventPacket = exports.BlockEventPacket = exports.LevelEventPacket = exports.LevelSoundEventPacketV1 = exports.TickSyncPacket = exports.AddPaintingPacket = exports.UpdateBlockPacket = exports.RiderJumpPacket = exports.MovePlayerPacket = exports.MoveActorAbsolutePacket = exports.TakeItemActorPacket = exports.AddItemActorPacket = exports.RemoveActorPacket = exports.AddActorPacket = exports.AddPlayerPacket = exports.StartGamePacket = exports.LevelSettings = exports.SetTimePacket = exports.TextPacket = exports.ResourcePackClientResponsePacket = exports.ResourcePackResponse = exports.ResourcePackStacksPacket = exports.ResourcePackStackPacket = exports.ResourcePacksInfoPacket = exports.PackType = exports.DisconnectPacket = exports.ClientToServerHandshakePacket = exports.ServerToClientHandshakePacket = exports.PlayStatusPacket = exports.LoginPacket = void 0;
exports.NpcRequestPacket = exports.BookEditPacket = exports.SetLastHurtByPacket = exports.WSConnectPacket = exports.SubClientLoginPacket = exports.PlayerSkinPacket = exports.PurchaseReceiptPacket = exports.ShowStoreOfferPacket = exports.StructureBlockUpdatePacket = exports.AddBehaviorTreePacket = exports.SetTitlePacket = exports.StopSoundPacket = exports.PlaySoundPacket = exports.TransferPacket = exports.ResourcePackChunkRequestPacket = exports.ResourcePackChunkDataPacket = exports.ResourcePackDataInfoPacket = exports.CommandOutputPacket = exports.CommandBlockUpdatePacket = exports.CommandRequestPacket = exports.AvailableCommandsPacket = exports.ShowCreditsPacket = exports.BossEventPacket = exports.CameraPacket = exports.GameRulesChangedPacket = exports.ItemFrameDropItemPacket = exports.ChunkRadiusUpdatedPacket = exports.RequestChunkRadiusPacket = exports.MapInfoRequestPacket = exports.MapItemDataPacket = exports.SpawnExperienceOrbPacket = exports.TelemetryEventPacket = exports.SimpleEventPacket = exports.PlayerListPacket = exports.SetPlayerGameTypePacket = exports.ChangeDimensionPacket = exports.SetDifficultyPacket = exports.SetCommandsEnabledPacket = exports.LevelChunkPacket = exports.PlayerInputPacket = exports.BlockActorDataPacket = exports.AdventureSettingsPacket = exports.GuiDataPickItemPacket = exports.CraftingEventPacket = exports.CraftingDataPacket = exports.ContainerSetDataPacket = exports.InventorySlotPacket = exports.InventoryContentPacket = exports.PlayerHotbarPacket = exports.ContainerClosePacket = void 0;
exports.PlayerArmorDamagePacket = exports.ItemStackResponse = exports.ItemStackRequest = exports.PlayerEnchantOptionsPacket = exports.CreativeContentPacket = exports.PlayerAuthInputPacket = exports.NetworkSettingsPacket = exports.CompletedUsingItemPacket = exports.AnvilDamagePacket = exports.SettingsCommandPacket = exports.MultiplayerSettingsPacket = exports.EmotePacket = exports.EducationSettingsPacket = exports.ClientCacheMissResponsePacket = exports.ClientCacheBlobStatusPacket = exports.StructureTemplateDataExportPacket = exports.StructureTemplateDataRequestPacket = exports.MapCreateLockedCopy = exports.OnScreenTextureAnimationPacket = exports.ClientCacheStatusPacket = exports.RemoveEntityPacket = exports.LecternUpdatePacket = exports.LevelEventGenericPacket = exports.LevelSoundEventPacket = exports.BiomeDefinitionList = exports.NetworkChunkPublisherUpdatePacket = exports.LevelSoundEventPacketV2 = exports.AvailableActorIdentifiersPacket = exports.SpawnParticleEffect = exports.SpawnParticleEffectPacket = exports.ScriptCustomEventPacket = exports.NetworkStackLatencyPacket = exports.UpdateSoftEnumPacket = exports.SetLocalPlayerAsInitializedPacket = exports.SetScoreboardIdentityPacket = exports.MoveActorDeltaPacket = exports.UpdateBlockPacketSynced = exports.LabTablePacket = exports.SetScorePacket = exports.ScorePacketInfo = exports.SetDisplayObjectivePacket = exports.RemoveObjectivePacket = exports.SetDefaultGameTypePacket = exports.ShowProfilePacket = exports.ServerSettingsResponsePacket = exports.ServerSettingsRequestPacket = exports.ModalFormResponsePacket = exports.ShowModalFormPacket = exports.ModalFormRequestPacket = exports.PhotoTransferPacket = void 0;
exports.PacketIdToType = exports.NpcDialoguePacket = exports.SimulationTypePacket = exports.RemoveVolumeEntityPacket = exports.AddVolumeEntityPacket = exports.SyncActorPropertyPacket = exports.ClientboundDebugRendererPacket = exports.FilterTextPacket = exports.ItemComponentPacket = exports.CorrectPlayerMovePredictionPacket = exports.PlayerFogPacket = exports.CameraShakePacket = exports.AnimateEntityPacket = exports.MotionPredictionHintsPacket = exports.PacketViolationWarningPacket = exports.DebugInfoPacket = exports.PositionTrackingDBClientRequest = exports.PositionTrackingDBClientRequestPacket = exports.PositionTrackingDBServerBroadcast = exports.PositionTrackingDBServerBroadcastPacket = exports.EmoteListPacket = exports.UpdatePlayerGameTypePacket = exports.CodeBuilderPacket = void 0;
const tslib_1 = require("tslib");
const cxxvector_1 = require("../cxxvector");
const mce_1 = require("../mce");
const nativeclass_1 = require("../nativeclass");
const nativetype_1 = require("../nativetype");
const actor_1 = require("./actor");
const blockpos_1 = require("./blockpos");
const connreq_1 = require("./connreq");
const hashedstring_1 = require("./hashedstring");
const inventory_1 = require("./inventory");
const packet_1 = require("./packet");
const scoreboard_1 = require("./scoreboard");
const minecraft = require("../minecraft");
/** @deprecated */
let LoginPacket = class LoginPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x30)
], LoginPacket.prototype, "protocol", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(connreq_1.ConnectionRequest.ref(), 0x38)
], LoginPacket.prototype, "connreq", void 0);
LoginPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LoginPacket);
exports.LoginPacket = LoginPacket;
/** @deprecated */
let PlayStatusPacket = class PlayStatusPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], PlayStatusPacket.prototype, "status", void 0);
PlayStatusPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayStatusPacket);
exports.PlayStatusPacket = PlayStatusPacket;
/** @deprecated */
let ServerToClientHandshakePacket = class ServerToClientHandshakePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ServerToClientHandshakePacket.prototype, "jwt", void 0);
ServerToClientHandshakePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ServerToClientHandshakePacket);
exports.ServerToClientHandshakePacket = ServerToClientHandshakePacket;
/** @deprecated */
let ClientToServerHandshakePacket = class ClientToServerHandshakePacket extends packet_1.Packet {
};
ClientToServerHandshakePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ClientToServerHandshakePacket);
exports.ClientToServerHandshakePacket = ClientToServerHandshakePacket;
/** @deprecated */
let DisconnectPacket = class DisconnectPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], DisconnectPacket.prototype, "skipMessage", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x38)
], DisconnectPacket.prototype, "message", void 0);
DisconnectPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], DisconnectPacket);
exports.DisconnectPacket = DisconnectPacket;
/** @deprecated */
exports.PackType = minecraft.PackType;
// @nativeClass(0x88)
// export class PackIdVersion extends NativeClass {
//     @nativeField(mce.UUID)
//     uuid:mce.UUID
//     @nativeField(SemVersion, 0x10)
//     version:SemVersion
//     @nativeField(uint8_t)
//     packType:PackType
// }
// @nativeClass(0xA8)
// export class PackInstanceId extends NativeClass {
//     @nativeField(PackIdVersion)
//     packId:PackIdVersion;
//     @nativeField(CxxString)
//     subpackName:CxxString;
// }
// @nativeClass(0x18)
// export class ContentIdentity extends NativeClass {
//     @nativeField(mce.UUID)
//     uuid:mce.UUID
//     @nativeField(bool_t, 0x10)
//     valid:bool_t
// }
// @nativeClass(0xF0)
// export class ResourcePackInfoData extends NativeClass {
//     @nativeField(PackIdVersion)
//     packId:PackIdVersion;
//     @nativeField(bin64_t)
//     packSize:bin64_t;
//     @nativeField(CxxString)
//     contentKey:CxxString;
//     @nativeField(CxxString)
//     subpackName:CxxString;
//     @nativeField(ContentIdentity)
//     contentIdentity:ContentIdentity;
//     @nativeField(bool_t)
//     hasScripts:bool_t;
//     @nativeField(bool_t)
//     hasExceptions:bool_t;
// }
// @nativeClass(null)
// export class ResourcePacksInfoData extends NativeClass {
//     @nativeField(bool_t)
//     texturePackRequired:bool_t;
//     @nativeField(bool_t)
//     hasScripts:bool_t;
//     @nativeField(bool_t)
//     hasExceptions:bool_t;
//     @nativeField(CxxVector.make(ResourcePackInfoData), 0x08)
//     addOnPacks:CxxVector<ResourcePackInfoData>;
//     @nativeField(CxxVector.make(ResourcePackInfoData), 0x20)
//     texturePacks:CxxVector<ResourcePackInfoData>;
// }
/** @deprecated */
let ResourcePacksInfoPacket = class ResourcePacksInfoPacket extends packet_1.Packet {
};
ResourcePacksInfoPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ResourcePacksInfoPacket);
exports.ResourcePacksInfoPacket = ResourcePacksInfoPacket;
/** @deprecated */
let ResourcePackStackPacket = class ResourcePackStackPacket extends packet_1.Packet {
};
ResourcePackStackPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ResourcePackStackPacket);
exports.ResourcePackStackPacket = ResourcePackStackPacket;
/** @deprecated Use ResourcePackStackPacket, follow the real class name */
exports.ResourcePackStacksPacket = ResourcePackStackPacket;
/** @deprecated */
exports.ResourcePackResponse = minecraft.ResourcePackResponse;
/** @deprecated */
let ResourcePackClientResponsePacket = class ResourcePackClientResponsePacket extends packet_1.Packet {
};
ResourcePackClientResponsePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ResourcePackClientResponsePacket);
exports.ResourcePackClientResponsePacket = ResourcePackClientResponsePacket;
/** @deprecated */
let TextPacket = class TextPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], TextPacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], TextPacket.prototype, "name", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], TextPacket.prototype, "message", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(nativetype_1.CxxString))
], TextPacket.prototype, "params", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t, 0x90)
], TextPacket.prototype, "needsTranslation", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x98)
], TextPacket.prototype, "xboxUserId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], TextPacket.prototype, "platformChatId", void 0);
TextPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], TextPacket);
exports.TextPacket = TextPacket;
/** @deprecated */
(function (TextPacket) {
    /** @deprecated */
    TextPacket.Types = minecraft.TextPacket.Types;
})(TextPacket = exports.TextPacket || (exports.TextPacket = {}));
exports.TextPacket = TextPacket;
/** @deprecated */
let SetTimePacket = class SetTimePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SetTimePacket.prototype, "time", void 0);
SetTimePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetTimePacket);
exports.SetTimePacket = SetTimePacket;
/** @deprecated */
let LevelSettings = class LevelSettings extends nativeclass_1.MantleClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], LevelSettings.prototype, "seed", void 0);
LevelSettings = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelSettings);
exports.LevelSettings = LevelSettings;
/** @deprecated */
let StartGamePacket = class StartGamePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(LevelSettings)
], StartGamePacket.prototype, "settings", void 0);
StartGamePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], StartGamePacket);
exports.StartGamePacket = StartGamePacket;
/** @deprecated */
let AddPlayerPacket = class AddPlayerPacket extends packet_1.Packet {
};
AddPlayerPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AddPlayerPacket);
exports.AddPlayerPacket = AddPlayerPacket;
/** @deprecated */
let AddActorPacket = class AddActorPacket extends packet_1.Packet {
};
AddActorPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AddActorPacket);
exports.AddActorPacket = AddActorPacket;
/** @deprecated */
let RemoveActorPacket = class RemoveActorPacket extends packet_1.Packet {
};
RemoveActorPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RemoveActorPacket);
exports.RemoveActorPacket = RemoveActorPacket;
/** @deprecated */
let AddItemActorPacket = class AddItemActorPacket extends packet_1.Packet {
};
AddItemActorPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AddItemActorPacket);
exports.AddItemActorPacket = AddItemActorPacket;
/** @deprecated */
let TakeItemActorPacket = class TakeItemActorPacket extends packet_1.Packet {
};
TakeItemActorPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], TakeItemActorPacket);
exports.TakeItemActorPacket = TakeItemActorPacket;
/** @deprecated */
let MoveActorAbsolutePacket = class MoveActorAbsolutePacket extends packet_1.Packet {
};
MoveActorAbsolutePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MoveActorAbsolutePacket);
exports.MoveActorAbsolutePacket = MoveActorAbsolutePacket;
/** @deprecated */
let MovePlayerPacket = class MovePlayerPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], MovePlayerPacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], MovePlayerPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], MovePlayerPacket.prototype, "pitch", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], MovePlayerPacket.prototype, "yaw", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], MovePlayerPacket.prototype, "headYaw", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], MovePlayerPacket.prototype, "mode", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], MovePlayerPacket.prototype, "onGround", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], MovePlayerPacket.prototype, "ridingActorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MovePlayerPacket.prototype, "teleportCause", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], MovePlayerPacket.prototype, "teleportItem", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], MovePlayerPacket.prototype, "tick", void 0);
MovePlayerPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MovePlayerPacket);
exports.MovePlayerPacket = MovePlayerPacket;
/** @deprecated */
(function (MovePlayerPacket) {
    MovePlayerPacket.Modes = minecraft.MovePlayerPacket.Modes;
})(MovePlayerPacket = exports.MovePlayerPacket || (exports.MovePlayerPacket = {}));
exports.MovePlayerPacket = MovePlayerPacket;
/** @deprecated */
let RiderJumpPacket = class RiderJumpPacket extends packet_1.Packet {
};
RiderJumpPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RiderJumpPacket);
exports.RiderJumpPacket = RiderJumpPacket;
/** @deprecated */
let UpdateBlockPacket = class UpdateBlockPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.BlockPos)
], UpdateBlockPacket.prototype, "blockPos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], UpdateBlockPacket.prototype, "blockRuntimeId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], UpdateBlockPacket.prototype, "flags", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], UpdateBlockPacket.prototype, "dataLayerId", void 0);
UpdateBlockPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], UpdateBlockPacket);
exports.UpdateBlockPacket = UpdateBlockPacket;
(function (UpdateBlockPacket) {
    /** @deprecated */
    UpdateBlockPacket.Flags = minecraft.UpdateBlockPacket.Flags;
    /** @deprecated */
    UpdateBlockPacket.DataLayerIds = minecraft.UpdateBlockPacket.DataLayerIds;
})(UpdateBlockPacket = exports.UpdateBlockPacket || (exports.UpdateBlockPacket = {}));
exports.UpdateBlockPacket = UpdateBlockPacket;
/** @deprecated */
let AddPaintingPacket = class AddPaintingPacket extends packet_1.Packet {
};
AddPaintingPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AddPaintingPacket);
exports.AddPaintingPacket = AddPaintingPacket;
/** @deprecated */
let TickSyncPacket = class TickSyncPacket extends packet_1.Packet {
};
TickSyncPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], TickSyncPacket);
exports.TickSyncPacket = TickSyncPacket;
/** @deprecated */
let LevelSoundEventPacketV1 = class LevelSoundEventPacketV1 extends packet_1.Packet {
};
LevelSoundEventPacketV1 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelSoundEventPacketV1);
exports.LevelSoundEventPacketV1 = LevelSoundEventPacketV1;
/** @deprecated */
let LevelEventPacket = class LevelEventPacket extends packet_1.Packet {
};
LevelEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelEventPacket);
exports.LevelEventPacket = LevelEventPacket;
/** @deprecated */
let BlockEventPacket = class BlockEventPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.BlockPos)
], BlockEventPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], BlockEventPacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], BlockEventPacket.prototype, "data", void 0);
BlockEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BlockEventPacket);
exports.BlockEventPacket = BlockEventPacket;
/** @deprecated */
let ActorEventPacket = class ActorEventPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], ActorEventPacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], ActorEventPacket.prototype, "event", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ActorEventPacket.prototype, "data", void 0);
ActorEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ActorEventPacket);
exports.ActorEventPacket = ActorEventPacket;
/** @deprecated */
(function (ActorEventPacket) {
    /** @deprecated */
    ActorEventPacket.Events = minecraft.ActorEventPacket.Events;
})(ActorEventPacket = exports.ActorEventPacket || (exports.ActorEventPacket = {}));
exports.ActorEventPacket = ActorEventPacket;
/** @deprecated */
let MobEffectPacket = class MobEffectPacket extends packet_1.Packet {
};
MobEffectPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MobEffectPacket);
exports.MobEffectPacket = MobEffectPacket;
/** @deprecated */
let AttributeData = class AttributeData extends nativeclass_1.NativeClass {
    [nativetype_1.NativeType.ctor]() {
        this.min = 0;
        this.max = 0;
        this.current = 0;
        this.default = 0;
    }
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], AttributeData.prototype, "current", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], AttributeData.prototype, "min", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], AttributeData.prototype, "max", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], AttributeData.prototype, "default", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(hashedstring_1.HashedString)
], AttributeData.prototype, "name", void 0);
AttributeData = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x40)
], AttributeData);
exports.AttributeData = AttributeData;
/** @deprecated */
let UpdateAttributesPacket = class UpdateAttributesPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], UpdateAttributesPacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(AttributeData))
], UpdateAttributesPacket.prototype, "attributes", void 0);
UpdateAttributesPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], UpdateAttributesPacket);
exports.UpdateAttributesPacket = UpdateAttributesPacket;
/** @deprecated */
let InventoryTransactionPacket = class InventoryTransactionPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], InventoryTransactionPacket.prototype, "legacyRequestId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(inventory_1.ComplexInventoryTransaction.ref(), 0x50)
], InventoryTransactionPacket.prototype, "transaction", void 0);
InventoryTransactionPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], InventoryTransactionPacket);
exports.InventoryTransactionPacket = InventoryTransactionPacket;
/** @deprecated */
let MobEquipmentPacket = class MobEquipmentPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], MobEquipmentPacket.prototype, "runtimeId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(inventory_1.NetworkItemStackDescriptor)
], MobEquipmentPacket.prototype, "item", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t, 0xC1)
], MobEquipmentPacket.prototype, "slot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], MobEquipmentPacket.prototype, "selectedSlot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], MobEquipmentPacket.prototype, "containerId", void 0);
MobEquipmentPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MobEquipmentPacket);
exports.MobEquipmentPacket = MobEquipmentPacket;
/** @deprecated */
let MobArmorEquipmentPacket = class MobArmorEquipmentPacket extends packet_1.Packet {
};
MobArmorEquipmentPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MobArmorEquipmentPacket);
exports.MobArmorEquipmentPacket = MobArmorEquipmentPacket;
/** @deprecated */
let InteractPacket = class InteractPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], InteractPacket.prototype, "action", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], InteractPacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], InteractPacket.prototype, "pos", void 0);
InteractPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], InteractPacket);
exports.InteractPacket = InteractPacket;
(function (InteractPacket) {
    /** @deprecated */
    InteractPacket.Actions = minecraft.InteractPacket.Actions;
})(InteractPacket = exports.InteractPacket || (exports.InteractPacket = {}));
exports.InteractPacket = InteractPacket;
/** @deprecated */
let BlockPickRequestPacket = class BlockPickRequestPacket extends packet_1.Packet {
};
BlockPickRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BlockPickRequestPacket);
exports.BlockPickRequestPacket = BlockPickRequestPacket;
/** @deprecated */
let ActorPickRequestPacket = class ActorPickRequestPacket extends packet_1.Packet {
};
ActorPickRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ActorPickRequestPacket);
exports.ActorPickRequestPacket = ActorPickRequestPacket;
/** @deprecated */
let PlayerActionPacket = class PlayerActionPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.BlockPos)
], PlayerActionPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], PlayerActionPacket.prototype, "face", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], PlayerActionPacket.prototype, "action", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], PlayerActionPacket.prototype, "actorId", void 0);
PlayerActionPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerActionPacket);
exports.PlayerActionPacket = PlayerActionPacket;
/** @deprecated */
(function (PlayerActionPacket) {
    /** @deprecated */
    PlayerActionPacket.Actions = minecraft.PlayerActionPacket.Actions;
})(PlayerActionPacket = exports.PlayerActionPacket || (exports.PlayerActionPacket = {}));
exports.PlayerActionPacket = PlayerActionPacket;
/** @deprecated */
let EntityFallPacket = class EntityFallPacket extends packet_1.Packet {
};
EntityFallPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], EntityFallPacket);
exports.EntityFallPacket = EntityFallPacket;
/** @deprecated */
let HurtArmorPacket = class HurtArmorPacket extends packet_1.Packet {
};
HurtArmorPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], HurtArmorPacket);
exports.HurtArmorPacket = HurtArmorPacket;
/** @deprecated */
let SetActorDataPacket = class SetActorDataPacket extends packet_1.Packet {
};
SetActorDataPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetActorDataPacket);
exports.SetActorDataPacket = SetActorDataPacket;
/** @deprecated */
let SetActorMotionPacket = class SetActorMotionPacket extends packet_1.Packet {
};
SetActorMotionPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetActorMotionPacket);
exports.SetActorMotionPacket = SetActorMotionPacket;
/** @deprecated */
let SetActorLinkPacket = class SetActorLinkPacket extends packet_1.Packet {
};
SetActorLinkPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetActorLinkPacket);
exports.SetActorLinkPacket = SetActorLinkPacket;
/** @deprecated */
let SetHealthPacket = class SetHealthPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], SetHealthPacket.prototype, "health", void 0);
SetHealthPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetHealthPacket);
exports.SetHealthPacket = SetHealthPacket;
/** @deprecated */
let SetSpawnPositionPacket = class SetSpawnPositionPacket extends packet_1.Packet {
};
SetSpawnPositionPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetSpawnPositionPacket);
exports.SetSpawnPositionPacket = SetSpawnPositionPacket;
/** @deprecated */
let AnimatePacket = class AnimatePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], AnimatePacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], AnimatePacket.prototype, "action", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], AnimatePacket.prototype, "rowingTime", void 0);
AnimatePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AnimatePacket);
exports.AnimatePacket = AnimatePacket;
/** @deprecated */
(function (AnimatePacket) {
    /** @deprecated */
    AnimatePacket.Actions = minecraft.AnimatePacket.Actions;
})(AnimatePacket = exports.AnimatePacket || (exports.AnimatePacket = {}));
exports.AnimatePacket = AnimatePacket;
/** @deprecated */
let RespawnPacket = class RespawnPacket extends packet_1.Packet {
};
RespawnPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RespawnPacket);
exports.RespawnPacket = RespawnPacket;
/** @deprecated */
let ContainerOpenPacket = class ContainerOpenPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t, { ghost: true })
], ContainerOpenPacket.prototype, "windowId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], ContainerOpenPacket.prototype, "containerId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int8_t)
], ContainerOpenPacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.BlockPos)
], ContainerOpenPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], ContainerOpenPacket.prototype, "entityUniqueId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int64_as_float_t, { ghost: true })
], ContainerOpenPacket.prototype, "entityUniqueIdAsNumber", void 0);
ContainerOpenPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ContainerOpenPacket);
exports.ContainerOpenPacket = ContainerOpenPacket;
/** @deprecated */
let ContainerClosePacket = class ContainerClosePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t, { ghost: true })
], ContainerClosePacket.prototype, "windowId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], ContainerClosePacket.prototype, "containerId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], ContainerClosePacket.prototype, "server", void 0);
ContainerClosePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ContainerClosePacket);
exports.ContainerClosePacket = ContainerClosePacket;
/** @deprecated */
let PlayerHotbarPacket = class PlayerHotbarPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], PlayerHotbarPacket.prototype, "selectedSlot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], PlayerHotbarPacket.prototype, "selectHotbarSlot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t, { ghost: true })
], PlayerHotbarPacket.prototype, "windowId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], PlayerHotbarPacket.prototype, "containerId", void 0);
PlayerHotbarPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerHotbarPacket);
exports.PlayerHotbarPacket = PlayerHotbarPacket;
/** @deprecated */
let InventoryContentPacket = class InventoryContentPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], InventoryContentPacket.prototype, "containerId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(inventory_1.NetworkItemStackDescriptor), 56)
], InventoryContentPacket.prototype, "slots", void 0);
InventoryContentPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], InventoryContentPacket);
exports.InventoryContentPacket = InventoryContentPacket;
/** @deprecated */
let InventorySlotPacket = class InventorySlotPacket extends packet_1.Packet {
};
InventorySlotPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], InventorySlotPacket);
exports.InventorySlotPacket = InventorySlotPacket;
/** @deprecated */
let ContainerSetDataPacket = class ContainerSetDataPacket extends packet_1.Packet {
};
ContainerSetDataPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ContainerSetDataPacket);
exports.ContainerSetDataPacket = ContainerSetDataPacket;
/** @deprecated */
let CraftingDataPacket = class CraftingDataPacket extends packet_1.Packet {
};
CraftingDataPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CraftingDataPacket);
exports.CraftingDataPacket = CraftingDataPacket;
/** @deprecated */
let CraftingEventPacket = class CraftingEventPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], CraftingEventPacket.prototype, "containerId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x34)
], CraftingEventPacket.prototype, "containerType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(mce_1.mce.UUID)
], CraftingEventPacket.prototype, "recipeId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(inventory_1.NetworkItemStackDescriptor))
], CraftingEventPacket.prototype, "inputItems", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(inventory_1.NetworkItemStackDescriptor))
], CraftingEventPacket.prototype, "outputItems", void 0);
CraftingEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CraftingEventPacket);
exports.CraftingEventPacket = CraftingEventPacket;
/** @deprecated */
let GuiDataPickItemPacket = class GuiDataPickItemPacket extends packet_1.Packet {
};
GuiDataPickItemPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], GuiDataPickItemPacket);
exports.GuiDataPickItemPacket = GuiDataPickItemPacket;
/** @deprecated */
let AdventureSettingsPacket = class AdventureSettingsPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], AdventureSettingsPacket.prototype, "flag1", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], AdventureSettingsPacket.prototype, "commandPermission", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t, 0x38)
], AdventureSettingsPacket.prototype, "flag2", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], AdventureSettingsPacket.prototype, "playerPermission", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorUniqueID)
], AdventureSettingsPacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t, 0x4C)
], AdventureSettingsPacket.prototype, "customFlag", void 0);
AdventureSettingsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AdventureSettingsPacket);
exports.AdventureSettingsPacket = AdventureSettingsPacket;
/** @deprecated */
let BlockActorDataPacket = class BlockActorDataPacket extends packet_1.Packet {
};
BlockActorDataPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BlockActorDataPacket);
exports.BlockActorDataPacket = BlockActorDataPacket;
/** @deprecated */
let PlayerInputPacket = class PlayerInputPacket extends packet_1.Packet {
};
PlayerInputPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerInputPacket);
exports.PlayerInputPacket = PlayerInputPacket;
/** @deprecated */
let LevelChunkPacket = class LevelChunkPacket extends packet_1.Packet {
};
LevelChunkPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelChunkPacket);
exports.LevelChunkPacket = LevelChunkPacket;
/** @deprecated */
let SetCommandsEnabledPacket = class SetCommandsEnabledPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], SetCommandsEnabledPacket.prototype, "commandsEnabled", void 0);
SetCommandsEnabledPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetCommandsEnabledPacket);
exports.SetCommandsEnabledPacket = SetCommandsEnabledPacket;
/** @deprecated */
let SetDifficultyPacket = class SetDifficultyPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], SetDifficultyPacket.prototype, "difficulty", void 0);
SetDifficultyPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetDifficultyPacket);
exports.SetDifficultyPacket = SetDifficultyPacket;
/** @deprecated */
let ChangeDimensionPacket = class ChangeDimensionPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ChangeDimensionPacket.prototype, "dimensionId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], ChangeDimensionPacket.prototype, "x", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], ChangeDimensionPacket.prototype, "y", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], ChangeDimensionPacket.prototype, "z", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], ChangeDimensionPacket.prototype, "respawn", void 0);
ChangeDimensionPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ChangeDimensionPacket);
exports.ChangeDimensionPacket = ChangeDimensionPacket;
/** @deprecated */
let SetPlayerGameTypePacket = class SetPlayerGameTypePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SetPlayerGameTypePacket.prototype, "playerGameType", void 0);
SetPlayerGameTypePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetPlayerGameTypePacket);
exports.SetPlayerGameTypePacket = SetPlayerGameTypePacket;
/** @deprecated */
let PlayerListPacket = class PlayerListPacket extends packet_1.Packet {
};
PlayerListPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerListPacket);
exports.PlayerListPacket = PlayerListPacket;
/** @deprecated */
let SimpleEventPacket = class SimpleEventPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t)
], SimpleEventPacket.prototype, "subtype", void 0);
SimpleEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SimpleEventPacket);
exports.SimpleEventPacket = SimpleEventPacket;
/** @deprecated */
let TelemetryEventPacket = class TelemetryEventPacket extends packet_1.Packet {
};
TelemetryEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], TelemetryEventPacket);
exports.TelemetryEventPacket = TelemetryEventPacket;
/** @deprecated */
let SpawnExperienceOrbPacket = class SpawnExperienceOrbPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], SpawnExperienceOrbPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SpawnExperienceOrbPacket.prototype, "amount", void 0);
SpawnExperienceOrbPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SpawnExperienceOrbPacket);
exports.SpawnExperienceOrbPacket = SpawnExperienceOrbPacket;
/** @deprecated */
let MapItemDataPacket = class MapItemDataPacket extends packet_1.Packet {
};
MapItemDataPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MapItemDataPacket);
exports.MapItemDataPacket = MapItemDataPacket;
/** @deprecated */
let MapInfoRequestPacket = class MapInfoRequestPacket extends packet_1.Packet {
};
MapInfoRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MapInfoRequestPacket);
exports.MapInfoRequestPacket = MapInfoRequestPacket;
/** @deprecated */
let RequestChunkRadiusPacket = class RequestChunkRadiusPacket extends packet_1.Packet {
};
RequestChunkRadiusPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RequestChunkRadiusPacket);
exports.RequestChunkRadiusPacket = RequestChunkRadiusPacket;
/** @deprecated */
let ChunkRadiusUpdatedPacket = class ChunkRadiusUpdatedPacket extends packet_1.Packet {
};
ChunkRadiusUpdatedPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ChunkRadiusUpdatedPacket);
exports.ChunkRadiusUpdatedPacket = ChunkRadiusUpdatedPacket;
/** @deprecated */
let ItemFrameDropItemPacket = class ItemFrameDropItemPacket extends packet_1.Packet {
};
ItemFrameDropItemPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemFrameDropItemPacket);
exports.ItemFrameDropItemPacket = ItemFrameDropItemPacket;
/** @deprecated */
let GameRulesChangedPacket = class GameRulesChangedPacket extends packet_1.Packet {
};
GameRulesChangedPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], GameRulesChangedPacket);
exports.GameRulesChangedPacket = GameRulesChangedPacket;
/** @deprecated */
let CameraPacket = class CameraPacket extends packet_1.Packet {
};
CameraPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CameraPacket);
exports.CameraPacket = CameraPacket;
/** @deprecated */
let BossEventPacket = class BossEventPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t, { ghost: true })
], BossEventPacket.prototype, "unknown", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], BossEventPacket.prototype, "flagDarken", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], BossEventPacket.prototype, "flagFog", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], BossEventPacket.prototype, "entityUniqueId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], BossEventPacket.prototype, "playerUniqueId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], BossEventPacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString, 0x50)
], BossEventPacket.prototype, "title", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], BossEventPacket.prototype, "healthPercent", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], BossEventPacket.prototype, "color", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], BossEventPacket.prototype, "overlay", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], BossEventPacket.prototype, "darkenScreen", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], BossEventPacket.prototype, "createWorldFog", void 0);
BossEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BossEventPacket);
exports.BossEventPacket = BossEventPacket;
(function (BossEventPacket) {
    /** @deprecated */
    BossEventPacket.Types = minecraft.BossEventPacket.Types;
    /** @deprecated */
    BossEventPacket.Colors = minecraft.BossEventPacket.Colors;
    /** @deprecated */
    BossEventPacket.Overlay = minecraft.BossEventPacket.Overlay;
})(BossEventPacket = exports.BossEventPacket || (exports.BossEventPacket = {}));
exports.BossEventPacket = BossEventPacket;
/** @deprecated */
let ShowCreditsPacket = class ShowCreditsPacket extends packet_1.Packet {
};
ShowCreditsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ShowCreditsPacket);
exports.ShowCreditsPacket = ShowCreditsPacket;
let AvailableCommandsParamData = class AvailableCommandsParamData extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], AvailableCommandsParamData.prototype, "paramName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], AvailableCommandsParamData.prototype, "paramType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], AvailableCommandsParamData.prototype, "isOptional", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], AvailableCommandsParamData.prototype, "flags", void 0);
AvailableCommandsParamData = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], AvailableCommandsParamData);
let AvailableCommandsOverloadData = class AvailableCommandsOverloadData extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(AvailableCommandsParamData))
], AvailableCommandsOverloadData.prototype, "parameters", void 0);
AvailableCommandsOverloadData = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], AvailableCommandsOverloadData);
let AvailableCommandsCommandData = class AvailableCommandsCommandData extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], AvailableCommandsCommandData.prototype, "name", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], AvailableCommandsCommandData.prototype, "description", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t) // 40
], AvailableCommandsCommandData.prototype, "flags", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t) // 42
], AvailableCommandsCommandData.prototype, "permission", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(cxxvector_1.CxxVector.make(nativetype_1.CxxStringWith8Bytes)), { ghost: true })
], AvailableCommandsCommandData.prototype, "parameters", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(AvailableCommandsOverloadData))
], AvailableCommandsCommandData.prototype, "overloads", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t) // 60
], AvailableCommandsCommandData.prototype, "aliases", void 0);
AvailableCommandsCommandData = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x68)
], AvailableCommandsCommandData);
let AvailableCommandsEnumData = class AvailableCommandsEnumData extends nativeclass_1.NativeClass {
};
AvailableCommandsEnumData = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(0x38)
], AvailableCommandsEnumData);
/** @deprecated */
let AvailableCommandsPacket = class AvailableCommandsPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(nativetype_1.CxxString))
], AvailableCommandsPacket.prototype, "enumValues", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(nativetype_1.CxxString))
], AvailableCommandsPacket.prototype, "postfixes", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(AvailableCommandsEnumData))
], AvailableCommandsPacket.prototype, "enums", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(AvailableCommandsCommandData))
], AvailableCommandsPacket.prototype, "commands", void 0);
AvailableCommandsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AvailableCommandsPacket);
exports.AvailableCommandsPacket = AvailableCommandsPacket;
/** @deprecated */
(function (AvailableCommandsPacket) {
    AvailableCommandsPacket.CommandData = AvailableCommandsCommandData;
    AvailableCommandsPacket.EnumData = AvailableCommandsEnumData;
})(AvailableCommandsPacket = exports.AvailableCommandsPacket || (exports.AvailableCommandsPacket = {}));
exports.AvailableCommandsPacket = AvailableCommandsPacket;
/** @deprecated */
let CommandRequestPacket = class CommandRequestPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], CommandRequestPacket.prototype, "command", void 0);
CommandRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CommandRequestPacket);
exports.CommandRequestPacket = CommandRequestPacket;
/** @deprecated */
let CommandBlockUpdatePacket = class CommandBlockUpdatePacket extends packet_1.Packet {
};
CommandBlockUpdatePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CommandBlockUpdatePacket);
exports.CommandBlockUpdatePacket = CommandBlockUpdatePacket;
/** @deprecated */
let CommandOutputPacket = class CommandOutputPacket extends packet_1.Packet {
};
CommandOutputPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CommandOutputPacket);
exports.CommandOutputPacket = CommandOutputPacket;
/** @deprecated */
let ResourcePackDataInfoPacket = class ResourcePackDataInfoPacket extends packet_1.Packet {
};
ResourcePackDataInfoPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ResourcePackDataInfoPacket);
exports.ResourcePackDataInfoPacket = ResourcePackDataInfoPacket;
/** @deprecated */
let ResourcePackChunkDataPacket = class ResourcePackChunkDataPacket extends packet_1.Packet {
};
ResourcePackChunkDataPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ResourcePackChunkDataPacket);
exports.ResourcePackChunkDataPacket = ResourcePackChunkDataPacket;
/** @deprecated */
let ResourcePackChunkRequestPacket = class ResourcePackChunkRequestPacket extends packet_1.Packet {
};
ResourcePackChunkRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ResourcePackChunkRequestPacket);
exports.ResourcePackChunkRequestPacket = ResourcePackChunkRequestPacket;
/** @deprecated */
let TransferPacket = class TransferPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], TransferPacket.prototype, "address", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint16_t)
], TransferPacket.prototype, "port", void 0);
TransferPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], TransferPacket);
exports.TransferPacket = TransferPacket;
/** @deprecated */
let PlaySoundPacket = class PlaySoundPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], PlaySoundPacket.prototype, "soundName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.BlockPos)
], PlaySoundPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlaySoundPacket.prototype, "volume", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlaySoundPacket.prototype, "pitch", void 0);
PlaySoundPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlaySoundPacket);
exports.PlaySoundPacket = PlaySoundPacket;
/** @deprecated */
let StopSoundPacket = class StopSoundPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], StopSoundPacket.prototype, "soundName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], StopSoundPacket.prototype, "stopAll", void 0);
StopSoundPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], StopSoundPacket);
exports.StopSoundPacket = StopSoundPacket;
/** @deprecated */
let SetTitlePacket = class SetTitlePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SetTitlePacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SetTitlePacket.prototype, "text", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SetTitlePacket.prototype, "fadeInTime", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SetTitlePacket.prototype, "stayTime", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], SetTitlePacket.prototype, "fadeOutTime", void 0);
SetTitlePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetTitlePacket);
exports.SetTitlePacket = SetTitlePacket;
(function (SetTitlePacket) {
    /** @deprecated */
    SetTitlePacket.Types = minecraft.SetTitlePacket.Types;
})(SetTitlePacket = exports.SetTitlePacket || (exports.SetTitlePacket = {}));
exports.SetTitlePacket = SetTitlePacket;
/** @deprecated */
let AddBehaviorTreePacket = class AddBehaviorTreePacket extends packet_1.Packet {
};
AddBehaviorTreePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AddBehaviorTreePacket);
exports.AddBehaviorTreePacket = AddBehaviorTreePacket;
/** @deprecated */
let StructureBlockUpdatePacket = class StructureBlockUpdatePacket extends packet_1.Packet {
};
StructureBlockUpdatePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], StructureBlockUpdatePacket);
exports.StructureBlockUpdatePacket = StructureBlockUpdatePacket;
/** @deprecated */
let ShowStoreOfferPacket = class ShowStoreOfferPacket extends packet_1.Packet {
};
ShowStoreOfferPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ShowStoreOfferPacket);
exports.ShowStoreOfferPacket = ShowStoreOfferPacket;
/** @deprecated */
let PurchaseReceiptPacket = class PurchaseReceiptPacket extends packet_1.Packet {
};
PurchaseReceiptPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PurchaseReceiptPacket);
exports.PurchaseReceiptPacket = PurchaseReceiptPacket;
/** @deprecated */
let PlayerSkinPacket = class PlayerSkinPacket extends packet_1.Packet {
};
PlayerSkinPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerSkinPacket);
exports.PlayerSkinPacket = PlayerSkinPacket;
/** @deprecated */
let SubClientLoginPacket = class SubClientLoginPacket extends packet_1.Packet {
};
SubClientLoginPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SubClientLoginPacket);
exports.SubClientLoginPacket = SubClientLoginPacket;
/** @deprecated */
let WSConnectPacket = class WSConnectPacket extends packet_1.Packet {
};
WSConnectPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], WSConnectPacket);
exports.WSConnectPacket = WSConnectPacket;
/** @deprecated */
let SetLastHurtByPacket = class SetLastHurtByPacket extends packet_1.Packet {
};
SetLastHurtByPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetLastHurtByPacket);
exports.SetLastHurtByPacket = SetLastHurtByPacket;
/** @deprecated */
let BookEditPacket = class BookEditPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], BookEditPacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0x34) // It is int32 but is uint8 after serialization
], BookEditPacket.prototype, "inventorySlot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t) // It is int32 but is uint8 after serialization
], BookEditPacket.prototype, "pageNumber", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], BookEditPacket.prototype, "secondaryPageNumber", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], BookEditPacket.prototype, "text", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], BookEditPacket.prototype, "author", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], BookEditPacket.prototype, "xuid", void 0);
BookEditPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BookEditPacket);
exports.BookEditPacket = BookEditPacket;
/** @deprecated */
(function (BookEditPacket) {
    /** @deprecated */
    BookEditPacket.Types = minecraft.BookEditPacket.Types;
})(BookEditPacket = exports.BookEditPacket || (exports.BookEditPacket = {}));
exports.BookEditPacket = BookEditPacket;
/** @deprecated */
let NpcRequestPacket = class NpcRequestPacket extends packet_1.Packet {
};
NpcRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], NpcRequestPacket);
exports.NpcRequestPacket = NpcRequestPacket;
/** @deprecated */
let PhotoTransferPacket = class PhotoTransferPacket extends packet_1.Packet {
};
PhotoTransferPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PhotoTransferPacket);
exports.PhotoTransferPacket = PhotoTransferPacket;
/** @deprecated */
let ModalFormRequestPacket = class ModalFormRequestPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ModalFormRequestPacket.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ModalFormRequestPacket.prototype, "content", void 0);
ModalFormRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ModalFormRequestPacket);
exports.ModalFormRequestPacket = ModalFormRequestPacket;
/** @deprecated use ModalFormRequestPacket, follow the real class name */
exports.ShowModalFormPacket = ModalFormRequestPacket;
/** @deprecated */
let ModalFormResponsePacket = class ModalFormResponsePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ModalFormResponsePacket.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ModalFormResponsePacket.prototype, "response", void 0);
ModalFormResponsePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ModalFormResponsePacket);
exports.ModalFormResponsePacket = ModalFormResponsePacket;
/** @deprecated */
let ServerSettingsRequestPacket = class ServerSettingsRequestPacket extends packet_1.Packet {
};
ServerSettingsRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ServerSettingsRequestPacket);
exports.ServerSettingsRequestPacket = ServerSettingsRequestPacket;
/** @deprecated */
let ServerSettingsResponsePacket = class ServerSettingsResponsePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], ServerSettingsResponsePacket.prototype, "id", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ServerSettingsResponsePacket.prototype, "content", void 0);
ServerSettingsResponsePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ServerSettingsResponsePacket);
exports.ServerSettingsResponsePacket = ServerSettingsResponsePacket;
/** @deprecated */
let ShowProfilePacket = class ShowProfilePacket extends packet_1.Packet {
};
ShowProfilePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ShowProfilePacket);
exports.ShowProfilePacket = ShowProfilePacket;
/** @deprecated */
let SetDefaultGameTypePacket = class SetDefaultGameTypePacket extends packet_1.Packet {
};
SetDefaultGameTypePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetDefaultGameTypePacket);
exports.SetDefaultGameTypePacket = SetDefaultGameTypePacket;
/** @deprecated */
let RemoveObjectivePacket = class RemoveObjectivePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], RemoveObjectivePacket.prototype, "objectiveName", void 0);
RemoveObjectivePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RemoveObjectivePacket);
exports.RemoveObjectivePacket = RemoveObjectivePacket;
/** @deprecated */
let SetDisplayObjectivePacket = class SetDisplayObjectivePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SetDisplayObjectivePacket.prototype, "displaySlot", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SetDisplayObjectivePacket.prototype, "objectiveName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SetDisplayObjectivePacket.prototype, "displayName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SetDisplayObjectivePacket.prototype, "criteriaName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], SetDisplayObjectivePacket.prototype, "sortOrder", void 0);
SetDisplayObjectivePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetDisplayObjectivePacket);
exports.SetDisplayObjectivePacket = SetDisplayObjectivePacket;
/** @deprecated */
let ScorePacketInfo = class ScorePacketInfo extends nativeclass_1.NativeClass {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(scoreboard_1.ScoreboardId)
], ScorePacketInfo.prototype, "scoreboardId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ScorePacketInfo.prototype, "objectiveName", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], ScorePacketInfo.prototype, "score", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], ScorePacketInfo.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], ScorePacketInfo.prototype, "playerEntityUniqueId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], ScorePacketInfo.prototype, "entityUniqueId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], ScorePacketInfo.prototype, "customName", void 0);
ScorePacketInfo = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)()
], ScorePacketInfo);
exports.ScorePacketInfo = ScorePacketInfo;
(function (ScorePacketInfo) {
    /** @deprecated */
    ScorePacketInfo.Type = minecraft.ScorePacketInfo.Type;
})(ScorePacketInfo = exports.ScorePacketInfo || (exports.ScorePacketInfo = {}));
exports.ScorePacketInfo = ScorePacketInfo;
/** @deprecated */
let SetScorePacket = class SetScorePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], SetScorePacket.prototype, "type", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(cxxvector_1.CxxVector.make(ScorePacketInfo))
], SetScorePacket.prototype, "entries", void 0);
SetScorePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetScorePacket);
exports.SetScorePacket = SetScorePacket;
(function (SetScorePacket) {
    /** @deprecated */
    SetScorePacket.Type = minecraft.SetScorePacket.Type;
})(SetScorePacket = exports.SetScorePacket || (exports.SetScorePacket = {}));
exports.SetScorePacket = SetScorePacket;
/** @deprecated */
let LabTablePacket = class LabTablePacket extends packet_1.Packet {
};
LabTablePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LabTablePacket);
exports.LabTablePacket = LabTablePacket;
/** @deprecated */
let UpdateBlockPacketSynced = class UpdateBlockPacketSynced extends packet_1.Packet {
};
UpdateBlockPacketSynced = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], UpdateBlockPacketSynced);
exports.UpdateBlockPacketSynced = UpdateBlockPacketSynced;
/** @deprecated */
let MoveActorDeltaPacket = class MoveActorDeltaPacket extends packet_1.Packet {
};
MoveActorDeltaPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MoveActorDeltaPacket);
exports.MoveActorDeltaPacket = MoveActorDeltaPacket;
/** @deprecated */
let SetScoreboardIdentityPacket = class SetScoreboardIdentityPacket extends packet_1.Packet {
};
SetScoreboardIdentityPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetScoreboardIdentityPacket);
exports.SetScoreboardIdentityPacket = SetScoreboardIdentityPacket;
/** @deprecated */
let SetLocalPlayerAsInitializedPacket = class SetLocalPlayerAsInitializedPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorRuntimeID)
], SetLocalPlayerAsInitializedPacket.prototype, "actorId", void 0);
SetLocalPlayerAsInitializedPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SetLocalPlayerAsInitializedPacket);
exports.SetLocalPlayerAsInitializedPacket = SetLocalPlayerAsInitializedPacket;
/** @deprecated */
let UpdateSoftEnumPacket = class UpdateSoftEnumPacket extends packet_1.Packet {
};
UpdateSoftEnumPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], UpdateSoftEnumPacket);
exports.UpdateSoftEnumPacket = UpdateSoftEnumPacket;
/** @deprecated */
let NetworkStackLatencyPacket = class NetworkStackLatencyPacket extends packet_1.Packet {
};
NetworkStackLatencyPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], NetworkStackLatencyPacket);
exports.NetworkStackLatencyPacket = NetworkStackLatencyPacket;
/** @deprecated */
let ScriptCustomEventPacket = class ScriptCustomEventPacket extends packet_1.Packet {
};
ScriptCustomEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ScriptCustomEventPacket);
exports.ScriptCustomEventPacket = ScriptCustomEventPacket;
/** @deprecated */
let SpawnParticleEffectPacket = class SpawnParticleEffectPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], SpawnParticleEffectPacket.prototype, "dimensionId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorUniqueID)
], SpawnParticleEffectPacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], SpawnParticleEffectPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], SpawnParticleEffectPacket.prototype, "particleName", void 0);
SpawnParticleEffectPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SpawnParticleEffectPacket);
exports.SpawnParticleEffectPacket = SpawnParticleEffectPacket;
/** @deprecated use SpawnParticleEffectPacket, follow real class name */
exports.SpawnParticleEffect = SpawnParticleEffectPacket;
/** @deprecated */
let AvailableActorIdentifiersPacket = class AvailableActorIdentifiersPacket extends packet_1.Packet {
};
AvailableActorIdentifiersPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AvailableActorIdentifiersPacket);
exports.AvailableActorIdentifiersPacket = AvailableActorIdentifiersPacket;
/** @deprecated */
let LevelSoundEventPacketV2 = class LevelSoundEventPacketV2 extends packet_1.Packet {
};
LevelSoundEventPacketV2 = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelSoundEventPacketV2);
exports.LevelSoundEventPacketV2 = LevelSoundEventPacketV2;
/** @deprecated */
let NetworkChunkPublisherUpdatePacket = class NetworkChunkPublisherUpdatePacket extends packet_1.Packet {
};
NetworkChunkPublisherUpdatePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], NetworkChunkPublisherUpdatePacket);
exports.NetworkChunkPublisherUpdatePacket = NetworkChunkPublisherUpdatePacket;
/** @deprecated */
let BiomeDefinitionList = class BiomeDefinitionList extends packet_1.Packet {
};
BiomeDefinitionList = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], BiomeDefinitionList);
exports.BiomeDefinitionList = BiomeDefinitionList;
/** @deprecated */
let LevelSoundEventPacket = class LevelSoundEventPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], LevelSoundEventPacket.prototype, "sound", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], LevelSoundEventPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], LevelSoundEventPacket.prototype, "extraData", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.CxxString)
], LevelSoundEventPacket.prototype, "entityType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], LevelSoundEventPacket.prototype, "isBabyMob", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bool_t)
], LevelSoundEventPacket.prototype, "disableRelativeVolume", void 0);
LevelSoundEventPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelSoundEventPacket);
exports.LevelSoundEventPacket = LevelSoundEventPacket;
/** @deprecated */
let LevelEventGenericPacket = class LevelEventGenericPacket extends packet_1.Packet {
};
LevelEventGenericPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LevelEventGenericPacket);
exports.LevelEventGenericPacket = LevelEventGenericPacket;
/** @deprecated */
let LecternUpdatePacket = class LecternUpdatePacket extends packet_1.Packet {
};
LecternUpdatePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], LecternUpdatePacket);
exports.LecternUpdatePacket = LecternUpdatePacket;
/** @deprecated */
let RemoveEntityPacket = class RemoveEntityPacket extends packet_1.Packet {
};
RemoveEntityPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RemoveEntityPacket);
exports.RemoveEntityPacket = RemoveEntityPacket;
/** @deprecated */
let ClientCacheStatusPacket = class ClientCacheStatusPacket extends packet_1.Packet {
};
ClientCacheStatusPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ClientCacheStatusPacket);
exports.ClientCacheStatusPacket = ClientCacheStatusPacket;
/** @deprecated */
let OnScreenTextureAnimationPacket = class OnScreenTextureAnimationPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], OnScreenTextureAnimationPacket.prototype, "animationType", void 0);
OnScreenTextureAnimationPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], OnScreenTextureAnimationPacket);
exports.OnScreenTextureAnimationPacket = OnScreenTextureAnimationPacket;
/** @deprecated */
let MapCreateLockedCopy = class MapCreateLockedCopy extends packet_1.Packet {
};
MapCreateLockedCopy = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MapCreateLockedCopy);
exports.MapCreateLockedCopy = MapCreateLockedCopy;
/** @deprecated */
let StructureTemplateDataRequestPacket = class StructureTemplateDataRequestPacket extends packet_1.Packet {
};
StructureTemplateDataRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], StructureTemplateDataRequestPacket);
exports.StructureTemplateDataRequestPacket = StructureTemplateDataRequestPacket;
/** @deprecated */
let StructureTemplateDataExportPacket = class StructureTemplateDataExportPacket extends packet_1.Packet {
};
StructureTemplateDataExportPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], StructureTemplateDataExportPacket);
exports.StructureTemplateDataExportPacket = StructureTemplateDataExportPacket;
/** @deprecated */
let ClientCacheBlobStatusPacket = class ClientCacheBlobStatusPacket extends packet_1.Packet {
};
ClientCacheBlobStatusPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ClientCacheBlobStatusPacket);
exports.ClientCacheBlobStatusPacket = ClientCacheBlobStatusPacket;
/** @deprecated */
let ClientCacheMissResponsePacket = class ClientCacheMissResponsePacket extends packet_1.Packet {
};
ClientCacheMissResponsePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ClientCacheMissResponsePacket);
exports.ClientCacheMissResponsePacket = ClientCacheMissResponsePacket;
/** @deprecated */
let EducationSettingsPacket = class EducationSettingsPacket extends packet_1.Packet {
};
EducationSettingsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], EducationSettingsPacket);
exports.EducationSettingsPacket = EducationSettingsPacket;
/** @deprecated */
let EmotePacket = class EmotePacket extends packet_1.Packet {
};
EmotePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], EmotePacket);
exports.EmotePacket = EmotePacket;
/** @deprecated */
let MultiplayerSettingsPacket = class MultiplayerSettingsPacket extends packet_1.Packet {
};
MultiplayerSettingsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MultiplayerSettingsPacket);
exports.MultiplayerSettingsPacket = MultiplayerSettingsPacket;
/** @deprecated */
let SettingsCommandPacket = class SettingsCommandPacket extends packet_1.Packet {
};
SettingsCommandPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SettingsCommandPacket);
exports.SettingsCommandPacket = SettingsCommandPacket;
/** @deprecated */
let AnvilDamagePacket = class AnvilDamagePacket extends packet_1.Packet {
};
AnvilDamagePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AnvilDamagePacket);
exports.AnvilDamagePacket = AnvilDamagePacket;
/** @deprecated */
let CompletedUsingItemPacket = class CompletedUsingItemPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int16_t)
], CompletedUsingItemPacket.prototype, "itemId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], CompletedUsingItemPacket.prototype, "action", void 0);
CompletedUsingItemPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CompletedUsingItemPacket);
exports.CompletedUsingItemPacket = CompletedUsingItemPacket;
(function (CompletedUsingItemPacket) {
    /** @deprecated */
    CompletedUsingItemPacket.Actions = minecraft.CompletedUsingItemPacket.Actions;
})(CompletedUsingItemPacket = exports.CompletedUsingItemPacket || (exports.CompletedUsingItemPacket = {}));
exports.CompletedUsingItemPacket = CompletedUsingItemPacket;
/** @deprecated */
let NetworkSettingsPacket = class NetworkSettingsPacket extends packet_1.Packet {
};
NetworkSettingsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], NetworkSettingsPacket);
exports.NetworkSettingsPacket = NetworkSettingsPacket;
/** @deprecated */
let PlayerAuthInputPacket = class PlayerAuthInputPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlayerAuthInputPacket.prototype, "pitch", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlayerAuthInputPacket.prototype, "yaw", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], PlayerAuthInputPacket.prototype, "pos", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlayerAuthInputPacket.prototype, "moveX", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlayerAuthInputPacket.prototype, "moveZ", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], PlayerAuthInputPacket.prototype, "heaYaw", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], PlayerAuthInputPacket.prototype, "inputFlags", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], PlayerAuthInputPacket.prototype, "inputMode", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint32_t)
], PlayerAuthInputPacket.prototype, "playMode", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], PlayerAuthInputPacket.prototype, "vrGazeDirection", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.bin64_t)
], PlayerAuthInputPacket.prototype, "tick", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(blockpos_1.Vec3)
], PlayerAuthInputPacket.prototype, "delta", void 0);
PlayerAuthInputPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerAuthInputPacket);
exports.PlayerAuthInputPacket = PlayerAuthInputPacket;
/** @deprecated */
let CreativeContentPacket = class CreativeContentPacket extends packet_1.Packet {
};
CreativeContentPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CreativeContentPacket);
exports.CreativeContentPacket = CreativeContentPacket;
/** @deprecated */
let PlayerEnchantOptionsPacket = class PlayerEnchantOptionsPacket extends packet_1.Packet {
};
PlayerEnchantOptionsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerEnchantOptionsPacket);
exports.PlayerEnchantOptionsPacket = PlayerEnchantOptionsPacket;
/** @deprecated */
let ItemStackRequest = class ItemStackRequest extends packet_1.Packet {
};
ItemStackRequest = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemStackRequest);
exports.ItemStackRequest = ItemStackRequest;
/** @deprecated */
let ItemStackResponse = class ItemStackResponse extends packet_1.Packet {
};
ItemStackResponse = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemStackResponse);
exports.ItemStackResponse = ItemStackResponse;
/** @deprecated */
let PlayerArmorDamagePacket = class PlayerArmorDamagePacket extends packet_1.Packet {
};
PlayerArmorDamagePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerArmorDamagePacket);
exports.PlayerArmorDamagePacket = PlayerArmorDamagePacket;
/** @deprecated */
let CodeBuilderPacket = class CodeBuilderPacket extends packet_1.Packet {
};
CodeBuilderPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CodeBuilderPacket);
exports.CodeBuilderPacket = CodeBuilderPacket;
/** @deprecated */
let UpdatePlayerGameTypePacket = class UpdatePlayerGameTypePacket extends packet_1.Packet {
};
UpdatePlayerGameTypePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], UpdatePlayerGameTypePacket);
exports.UpdatePlayerGameTypePacket = UpdatePlayerGameTypePacket;
/** @deprecated */
let EmoteListPacket = class EmoteListPacket extends packet_1.Packet {
};
EmoteListPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], EmoteListPacket);
exports.EmoteListPacket = EmoteListPacket;
/** @deprecated */
let PositionTrackingDBServerBroadcastPacket = class PositionTrackingDBServerBroadcastPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], PositionTrackingDBServerBroadcastPacket.prototype, "action", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], PositionTrackingDBServerBroadcastPacket.prototype, "trackingId", void 0);
PositionTrackingDBServerBroadcastPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PositionTrackingDBServerBroadcastPacket);
exports.PositionTrackingDBServerBroadcastPacket = PositionTrackingDBServerBroadcastPacket;
(function (PositionTrackingDBServerBroadcastPacket) {
    /** @deprecated */
    PositionTrackingDBServerBroadcastPacket.Actions = minecraft.PositionTrackingDBServerBroadcastPacket.Actions;
})(PositionTrackingDBServerBroadcastPacket = exports.PositionTrackingDBServerBroadcastPacket || (exports.PositionTrackingDBServerBroadcastPacket = {}));
exports.PositionTrackingDBServerBroadcastPacket = PositionTrackingDBServerBroadcastPacket;
/** @deprecated use PositionTrackingDBServerBroadcastPacket, follow the real class name */
exports.PositionTrackingDBServerBroadcast = PositionTrackingDBServerBroadcastPacket;
/** @deprecated */
let PositionTrackingDBClientRequestPacket = class PositionTrackingDBClientRequestPacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], PositionTrackingDBClientRequestPacket.prototype, "action", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], PositionTrackingDBClientRequestPacket.prototype, "trackingId", void 0);
PositionTrackingDBClientRequestPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PositionTrackingDBClientRequestPacket);
exports.PositionTrackingDBClientRequestPacket = PositionTrackingDBClientRequestPacket;
(function (PositionTrackingDBClientRequestPacket) {
    /** @deprecated */
    PositionTrackingDBClientRequestPacket.Actions = minecraft.PositionTrackingDBClientRequestPacket.Actions;
})(PositionTrackingDBClientRequestPacket = exports.PositionTrackingDBClientRequestPacket || (exports.PositionTrackingDBClientRequestPacket = {}));
exports.PositionTrackingDBClientRequestPacket = PositionTrackingDBClientRequestPacket;
/** @deprecated Use PositionTrackingDBClientRequestPacket, follow the real class name */
exports.PositionTrackingDBClientRequest = PositionTrackingDBClientRequestPacket;
/** @deprecated */
let DebugInfoPacket = class DebugInfoPacket extends packet_1.Packet {
};
DebugInfoPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], DebugInfoPacket);
exports.DebugInfoPacket = DebugInfoPacket;
/** @deprecated */
let PacketViolationWarningPacket = class PacketViolationWarningPacket extends packet_1.Packet {
};
PacketViolationWarningPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PacketViolationWarningPacket);
exports.PacketViolationWarningPacket = PacketViolationWarningPacket;
/** @deprecated */
let MotionPredictionHintsPacket = class MotionPredictionHintsPacket extends packet_1.Packet {
};
MotionPredictionHintsPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], MotionPredictionHintsPacket);
exports.MotionPredictionHintsPacket = MotionPredictionHintsPacket;
/** @deprecated */
let AnimateEntityPacket = class AnimateEntityPacket extends packet_1.Packet {
};
AnimateEntityPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AnimateEntityPacket);
exports.AnimateEntityPacket = AnimateEntityPacket;
/** @deprecated */
let CameraShakePacket = class CameraShakePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], CameraShakePacket.prototype, "intensity", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.float32_t)
], CameraShakePacket.prototype, "duration", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], CameraShakePacket.prototype, "shakeType", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.uint8_t)
], CameraShakePacket.prototype, "shakeAction", void 0);
CameraShakePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CameraShakePacket);
exports.CameraShakePacket = CameraShakePacket;
(function (CameraShakePacket) {
    /** @deprecated */
    CameraShakePacket.ShakeType = minecraft.CameraShakePacket.ShakeType;
    /** @deprecated */
    CameraShakePacket.ShakeAction = minecraft.CameraShakePacket.ShakeAction;
})(CameraShakePacket = exports.CameraShakePacket || (exports.CameraShakePacket = {}));
exports.CameraShakePacket = CameraShakePacket;
/** @deprecated */
let PlayerFogPacket = class PlayerFogPacket extends packet_1.Packet {
};
PlayerFogPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], PlayerFogPacket);
exports.PlayerFogPacket = PlayerFogPacket;
/** @deprecated */
let CorrectPlayerMovePredictionPacket = class CorrectPlayerMovePredictionPacket extends packet_1.Packet {
};
CorrectPlayerMovePredictionPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], CorrectPlayerMovePredictionPacket);
exports.CorrectPlayerMovePredictionPacket = CorrectPlayerMovePredictionPacket;
/** @deprecated */
let ItemComponentPacket = class ItemComponentPacket extends packet_1.Packet {
};
ItemComponentPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ItemComponentPacket);
exports.ItemComponentPacket = ItemComponentPacket;
/** @deprecated */
let FilterTextPacket = class FilterTextPacket extends packet_1.Packet {
};
FilterTextPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], FilterTextPacket);
exports.FilterTextPacket = FilterTextPacket;
/** @deprecated */
let ClientboundDebugRendererPacket = class ClientboundDebugRendererPacket extends packet_1.Packet {
};
ClientboundDebugRendererPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], ClientboundDebugRendererPacket);
exports.ClientboundDebugRendererPacket = ClientboundDebugRendererPacket;
/** @deprecated */
let SyncActorPropertyPacket = class SyncActorPropertyPacket extends packet_1.Packet {
};
SyncActorPropertyPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SyncActorPropertyPacket);
exports.SyncActorPropertyPacket = SyncActorPropertyPacket;
/** @deprecated */
let AddVolumeEntityPacket = class AddVolumeEntityPacket extends packet_1.Packet {
};
AddVolumeEntityPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], AddVolumeEntityPacket);
exports.AddVolumeEntityPacket = AddVolumeEntityPacket;
/** @deprecated */
let RemoveVolumeEntityPacket = class RemoveVolumeEntityPacket extends packet_1.Packet {
};
RemoveVolumeEntityPacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], RemoveVolumeEntityPacket);
exports.RemoveVolumeEntityPacket = RemoveVolumeEntityPacket;
/** @deprecated */
let SimulationTypePacket = class SimulationTypePacket extends packet_1.Packet {
};
SimulationTypePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], SimulationTypePacket);
exports.SimulationTypePacket = SimulationTypePacket;
/** @deprecated */
let NpcDialoguePacket = class NpcDialoguePacket extends packet_1.Packet {
};
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(actor_1.ActorUniqueID)
], NpcDialoguePacket.prototype, "actorId", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t)
], NpcDialoguePacket.prototype, "action", void 0);
(0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeField)(nativetype_1.int64_as_float_t, 0x30)
], NpcDialoguePacket.prototype, "actorIdAsNumber", void 0);
NpcDialoguePacket = (0, tslib_1.__decorate)([
    (0, nativeclass_1.nativeClass)(null)
], NpcDialoguePacket);
exports.NpcDialoguePacket = NpcDialoguePacket;
/** @deprecated */
(function (NpcDialoguePacket) {
    /** @deprecated */
    NpcDialoguePacket.Actions = minecraft.NpcDialoguePacket.Actions;
})(NpcDialoguePacket = exports.NpcDialoguePacket || (exports.NpcDialoguePacket = {}));
exports.NpcDialoguePacket = NpcDialoguePacket;
/** @deprecated */
exports.PacketIdToType = {
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
    0x0d: AddActorPacket,
    0x0e: RemoveActorPacket,
    0x0f: AddItemActorPacket,
    0x11: TakeItemActorPacket,
    0x12: MoveActorAbsolutePacket,
    0x13: MovePlayerPacket,
    0x14: RiderJumpPacket,
    0x15: UpdateBlockPacket,
    0x16: AddPaintingPacket,
    0x17: TickSyncPacket,
    0x18: LevelSoundEventPacketV1,
    0x19: LevelEventPacket,
    0x1a: BlockEventPacket,
    0x1b: ActorEventPacket,
    0x1c: MobEffectPacket,
    0x1d: UpdateAttributesPacket,
    0x1e: InventoryTransactionPacket,
    0x1f: MobEquipmentPacket,
    0x20: MobArmorEquipmentPacket,
    0x21: InteractPacket,
    0x22: BlockPickRequestPacket,
    0x23: ActorPickRequestPacket,
    0x24: PlayerActionPacket,
    0x26: HurtArmorPacket,
    0x27: SetActorDataPacket,
    0x28: SetActorMotionPacket,
    0x29: SetActorLinkPacket,
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
    0x38: BlockActorDataPacket,
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
    0x43: MapItemDataPacket,
    0x44: MapInfoRequestPacket,
    0x45: RequestChunkRadiusPacket,
    0x46: ChunkRadiusUpdatedPacket,
    0x47: ItemFrameDropItemPacket,
    0x48: GameRulesChangedPacket,
    0x49: CameraPacket,
    0x4a: BossEventPacket,
    0x4b: ShowCreditsPacket,
    0x4c: AvailableCommandsPacket,
    0x4d: CommandRequestPacket,
    0x4e: CommandBlockUpdatePacket,
    0x4f: CommandOutputPacket,
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
    0x5f: WSConnectPacket,
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
    0x6e: UpdateBlockPacketSynced,
    0x6f: MoveActorDeltaPacket,
    0x70: SetScoreboardIdentityPacket,
    0x71: SetLocalPlayerAsInitializedPacket,
    0x72: UpdateSoftEnumPacket,
    0x73: NetworkStackLatencyPacket,
    0x75: ScriptCustomEventPacket,
    0x76: SpawnParticleEffectPacket,
    0x77: AvailableActorIdentifiersPacket,
    0x78: LevelSoundEventPacketV2,
    0x79: NetworkChunkPublisherUpdatePacket,
    0x7a: BiomeDefinitionList,
    0x7b: LevelSoundEventPacket,
    0x7c: LevelEventGenericPacket,
    0x7d: LecternUpdatePacket,
    0x80: RemoveEntityPacket,
    0x81: ClientCacheStatusPacket,
    0x82: OnScreenTextureAnimationPacket,
    0x83: MapCreateLockedCopy,
    0x84: StructureTemplateDataRequestPacket,
    0x85: StructureTemplateDataExportPacket,
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
    0x93: ItemStackRequest,
    0x94: ItemStackResponse,
    0x95: PlayerArmorDamagePacket,
    0x96: CodeBuilderPacket,
    0x97: UpdatePlayerGameTypePacket,
    0x98: EmoteListPacket,
    0x99: PositionTrackingDBServerBroadcastPacket,
    0x9a: PositionTrackingDBClientRequestPacket,
    0x9b: DebugInfoPacket,
    0x9c: PacketViolationWarningPacket,
    0x9d: MotionPredictionHintsPacket,
    0x9e: AnimateEntityPacket,
    0x9f: CameraShakePacket,
    0xa0: PlayerFogPacket,
    0xa1: CorrectPlayerMovePredictionPacket,
    0xa2: ItemComponentPacket,
    0xa3: FilterTextPacket,
    0xa4: ClientboundDebugRendererPacket,
    0xa5: SyncActorPropertyPacket,
    0xa6: AddVolumeEntityPacket,
    0xa7: RemoveVolumeEntityPacket,
    0xa8: SimulationTypePacket,
    0xa9: NpcDialoguePacket,
};
exports.PacketIdToType.__proto__ = null;
for (const packetId in exports.PacketIdToType) {
    exports.PacketIdToType[packetId].ID = +packetId;
}
//# sourceMappingURL=packets.js.map