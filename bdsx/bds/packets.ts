import { CxxVector } from "../cxxvector";
import { mce } from "../mce";
import { MantleClass, nativeClass, NativeClass, nativeField } from "../nativeclass";
import { bin64_t, bool_t, CxxString, CxxStringWith8Bytes, float32_t, int16_t, int32_t, int64_as_float_t, int8_t, NativeType, uint16_t, uint32_t, uint8_t } from "../nativetype";
import { ActorRuntimeID, ActorUniqueID } from "./actor";
import { BlockPos, Vec3 } from "./blockpos";
import { ConnectionRequest } from "./connreq";
import { HashedString } from "./hashedstring";
import { ComplexInventoryTransaction, ContainerId, ContainerType, NetworkItemStackDescriptor } from "./inventory";
import { CompoundTag } from "./nbt";
import { Packet } from "./packet";
import type { GameType } from "./player";
import { DisplaySlot, ObjectiveSortOrder, ScoreboardId } from "./scoreboard";

@nativeClass(null)
export class LoginPacket extends Packet {
    @nativeField(int32_t, 0x30)
	protocol:int32_t;
    /**
     * it can be null if the wrong client version
     */
    @nativeField(ConnectionRequest.ref(), 0x38)
	connreq:ConnectionRequest|null;
}

@nativeClass(null)
export class PlayStatusPacket extends Packet {
    @nativeField(int32_t)
    status:int32_t;
}

@nativeClass(null)
export class ServerToClientHandshakePacket extends Packet {
    @nativeField(CxxString)
    jwt:CxxString;
}

@nativeClass(null)
export class ClientToServerHandshakePacket extends Packet {
    // no data
}

@nativeClass(null)
export class DisconnectPacket extends Packet {
    @nativeField(bool_t)
    skipMessage:bool_t;
    @nativeField(CxxString, 0x38)
    message:CxxString;
}

export enum PackType {
    Invalid,
    Addon,
    Cached,
    CopyProtected,
    Behavior,
    PersonaPiece,
    Resources,
    Skins,
    WorldTemplate,
    Count,
}

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

@nativeClass(null)
export class ResourcePacksInfoPacket extends Packet {
    // @nativeField(ResourcePacksInfoData)
    // data:ResourcePacksInfoData;
}

@nativeClass(null)
export class ResourcePackStackPacket extends Packet {
    // @nativeField(CxxVector.make(PackInstanceId))
    // addOnPacks:CxxVector<PackInstanceId>;
    // @nativeField(CxxVector.make(PackInstanceId))
    // texturePacks:CxxVector<PackInstanceId>;
    // @nativeField(BaseGameVersion)
    // baseGameVersion:BaseGameVersion;
    // @nativeField(bool_t)
    // texturePackRequired:bool_t;
    // @nativeField(bool_t)
    // experimental:bool_t;
}

/** @deprecated Use ResourcePackStackPacket, follow the real class name */
export const ResourcePackStacksPacket = ResourcePackStackPacket;
/** @deprecated use ResourcePackStackPacket, follow the real class name */
export type ResourcePackStacksPacket = ResourcePackStackPacket;


export enum ResourcePackResponse {
    Cancel = 1,
    Downloading,
    DownloadingFinished,
    ResourcePackStackFinished,
}

@nativeClass(null)
export class ResourcePackClientResponsePacket extends Packet {
    // @nativeField(uint8_t, 0x40)
    // response: ResourcePackResponse;
}

@nativeClass(null)
export class TextPacket extends Packet {
    @nativeField(uint8_t)
    type:uint8_t;
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(CxxString)
    message:CxxString;
    @nativeField(CxxVector.make(CxxString))
    params:CxxVector<CxxString>;
    @nativeField(bool_t, 0x90)
    needsTranslation:bool_t;
    @nativeField(CxxString, 0x98)
    xboxUserId:CxxString;
    @nativeField(CxxString)
    platformChatId:CxxString;
}
export namespace TextPacket {
    export enum Types {
        Raw,
        Chat,
        Translate,
        /** @deprecated **/
        Translated = 2,
        Popup,
        JukeboxPopup,
        Tip,
        SystemMessage,
        /** @deprecated **/
        Sytem = 6,
        Whisper,
        // /say command
        Announcement,
        TextObject,
        /** @deprecated **/
        ObjectWhisper = 9
    }
}

@nativeClass(null)
export class SetTimePacket extends Packet {
    @nativeField(int32_t)
    time:int32_t;
}

@nativeClass(null)
export class LevelSettings extends MantleClass {
    @nativeField(int32_t)
    seed:int32_t;
}

@nativeClass(null)
export class StartGamePacket extends Packet {
    @nativeField(LevelSettings)
    settings:LevelSettings;
}
@nativeClass(null)
export class AddPlayerPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AddActorPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class RemoveActorPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AddItemActorPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class TakeItemActorPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class MoveActorAbsolutePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class MovePlayerPacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId: ActorRuntimeID;
    @nativeField(Vec3)
    pos: Vec3;
    @nativeField(float32_t)
    pitch: float32_t;
    @nativeField(float32_t)
    yaw: float32_t;
    @nativeField(float32_t)
    headYaw: float32_t;
    @nativeField(uint8_t)
    mode: uint8_t;
    @nativeField(bool_t)
    onGround: bool_t;
    @nativeField(ActorRuntimeID)
    ridingActorId: ActorRuntimeID;
    @nativeField(int32_t)
    teleportCause: int32_t;
    @nativeField(int32_t)
    teleportItem: int32_t;
    @nativeField(bin64_t)
    tick: bin64_t;
}
export namespace MovePlayerPacket {
    export enum Modes {
        Normal,
        Reset,
        Teleport,
        Pitch,
    }
}

@nativeClass(null)
export class RiderJumpPacket extends Packet {
    // unknown
}

@nativeClass(null)
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
export namespace UpdateBlockPacket {
    export enum Flags {
        None,
        Neighbors,
        Network,
        All,
        NoGraphic,
        Priority = 8,
        AllPriority = 11,
    }
    export enum DataLayerIds {
        Normal,
        Liquid,
    }
}

@nativeClass(null)
export class AddPaintingPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class TickSyncPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class LevelSoundEventPacketV1 extends Packet {
    // unknown
}

@nativeClass(null)
export class LevelEventPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class BlockEventPacket extends Packet {
    @nativeField(BlockPos)
    pos:BlockPos;
    @nativeField(int32_t)
    type:int32_t;
    @nativeField(int32_t)
    data:int32_t;
}

@nativeClass(null)
export class ActorEventPacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId: ActorRuntimeID;
    @nativeField(uint8_t)
    event: uint8_t;
    @nativeField(int32_t)
    data: int32_t;
}
export namespace ActorEventPacket {
    export enum Events {
        Jump = 1,
        HurtAnimation,
        DeathAnimation,
        ArmSwing,
        StopAttack,
        TameFail,
        TameSuccess,
        ShakeWet,
        UseItem,
        EatGrassAnimation,
        FishHookBubble,
        FishHookPosition,
        FishHookHook,
        FishHookTease,
        SquidInkCloud,
        ZombieVillagerCure,
        AmbientSound,
        Respawn,
        IronGolemOfferFlower,
        IronGolemWithdrawFlower,
        LoveParticles,
        VillagerAngry,
        VillagerHappy,
        WitchSpellParticles,
        FireworkParticles,
        InLoveParticles,
        SilverfishSpawnAnimation,
        GuardianAttack,
        WitchDrinkPotion,
        WitchThrowPotion,
        MinecartTntPrimeFuse,
        CreeperPrimeFuse,
        AirSupplyExpired,
        PlayerAddXpLevels,
        ElderGuardianCurse,
        AgentArmSwing,
        EnderDragonDeath,
        DustParticles,
        ArrowShake,
        EatingItem = 57,
        BabyAnimalFeed = 60,
        DeathSmokeCloud,
        CompleteTrade,
        RemoveLeash,
        ConsumeTotem = 65,
        PlayerCheckTreasureHunterAchievement,
        EntitySpawn,
        DragonPuke,
        ItemEntityMerge,
        StartSwim,
        BalloonPop,
        TreasureHunt,
        AgentSummon,
        ChargedCrossbow,
        Fall,
    }
}

@nativeClass(null)
export class MobEffectPacket extends Packet {
    // unknown
}

@nativeClass(0x40)
export class AttributeData extends NativeClass {
    @nativeField(float32_t)
    current:number;
    @nativeField(float32_t)
    min:number;
    @nativeField(float32_t)
    max:number;
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

@nativeClass(null)
export class UpdateAttributesPacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId:ActorRuntimeID;
    @nativeField(CxxVector.make<AttributeData>(AttributeData))
    attributes:CxxVector<AttributeData>;
}

@nativeClass(null)
export class InventoryTransactionPacket extends Packet {
    @nativeField(uint32_t)
    legacyRequestId: uint32_t;
    @nativeField(ComplexInventoryTransaction.ref(), 0x50)
    transaction: ComplexInventoryTransaction;
}

@nativeClass(null)
export class MobEquipmentPacket extends Packet {
    @nativeField(ActorRuntimeID)
    runtimeId:ActorRuntimeID;
    @nativeField(NetworkItemStackDescriptor)
    item:NetworkItemStackDescriptor;
    @nativeField(uint8_t, 0xC1)
    slot:uint8_t;
    @nativeField(uint8_t)
    selectedSlot:uint8_t;
    @nativeField(uint8_t)
    containerId:ContainerId;
}

@nativeClass(null)
export class MobArmorEquipmentPacket extends Packet {
    // I need some tests, I do not know when this packet is sent
    // @nativeField(NetworkItemStackDescriptor)
    // head:NetworkItemStackDescriptor;
    // @nativeField(NetworkItemStackDescriptor, {ghost: true})
    // chest:NetworkItemStackDescriptor;
    // @nativeField(NetworkItemStackDescriptor)
    // torso:NetworkItemStackDescriptor; // Found 'torso' instead of 'chest' in IDA
    // @nativeField(NetworkItemStackDescriptor)
    // legs:NetworkItemStackDescriptor;
    // @nativeField(NetworkItemStackDescriptor)
    // feet:NetworkItemStackDescriptor;
    // @nativeField(ActorRuntimeID)
    // runtimeId:ActorRuntimeID;
}

@nativeClass(null)
export class InteractPacket extends Packet {
    @nativeField(uint8_t)
    action:uint8_t;
    @nativeField(ActorRuntimeID)
    actorId:ActorRuntimeID;
    @nativeField(Vec3)
    pos:Vec3;
}
export namespace InteractPacket {
    export enum Actions {
        LeaveVehicle = 3,
        Mouseover,
        OpenNPC,
        OpenInventory,
    }
}

@nativeClass(null)
export class BlockPickRequestPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ActorPickRequestPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PlayerActionPacket extends Packet {
    @nativeField(BlockPos)
    pos: BlockPos;
    @nativeField(int32_t)
    face: int32_t;
    @nativeField(int32_t)
    action: PlayerActionPacket.Actions;
    @nativeField(ActorRuntimeID)
    actorId: ActorRuntimeID;
}
export namespace PlayerActionPacket {
    export enum Actions {
        /** @deprecated */
        StartBreak,
        /** @deprecated */
        AbortBreak,
        /** @deprecated */
        StopBreak,
        GetUpdatedBlock,
        /** @deprecated */
        DropItem,
        StartSleeping,
        StopSleeping,
        Respawn,
        /** @deprecated */
        Jump,
        /** @deprecated */
        StartSprint,
        /** @deprecated */
        StopSprint,
        /** @deprecated */
        StartSneak,
        /** @deprecated */
        StopSneak,
        CreativePlayerDestroyBlock,
        DimensionChangeAck,
        /** @deprecated */
        StartGlide,
        /** @deprecated */
        StopGlide,
        /** @deprecated */
        BuildDenied,
        CrackBreak,
        /** @deprecated */
        ChangeSkin,
        /** @deprecated */
        SetEnchantmentSeed,
        /** @deprecated */
        StartSwimming,
        /** @deprecated */
        StopSwimming,
        StartSpinAttack,
        StopSpinAttack,
        InteractBlock,
        PredictDestroyBlock,
        ContinueDestroyBlock,
    }
}

@nativeClass(null)
export class EntityFallPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class HurtArmorPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetActorDataPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetActorMotionPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetActorLinkPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetHealthPacket extends Packet {
    @nativeField(uint8_t)
    health:uint8_t;
}

@nativeClass(null)
export class SetSpawnPositionPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AnimatePacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId:ActorRuntimeID;
    @nativeField(int32_t)
    action:int32_t;
    @nativeField(float32_t)
    rowingTime:float32_t;
}
export namespace AnimatePacket {
    export enum Actions {
        SwingArm = 1,
        WakeUp = 3,
        CriticalHit,
        MagicCriticalHit,
        RowRight = 128,
        RowLeft,
    }
}

@nativeClass(null)
export class RespawnPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ContainerOpenPacket extends Packet {
    /** @deprecated */
    @nativeField(uint8_t, {ghost: true})
    windowId:uint8_t;
    @nativeField(uint8_t)
    containerId:ContainerId;
    @nativeField(int8_t)
    type:ContainerType;
    @nativeField(BlockPos)
    pos:BlockPos;
    @nativeField(bin64_t)
    entityUniqueId:bin64_t;
    @nativeField(int64_as_float_t, {ghost: true})
    entityUniqueIdAsNumber:int64_as_float_t;
}

@nativeClass(null)
export class ContainerClosePacket extends Packet {
    /** @deprecated */
    @nativeField(uint8_t, {ghost: true})
    windowId:uint8_t;
    @nativeField(uint8_t)
    containerId:ContainerId;
    @nativeField(bool_t)
    server:bool_t;
}

@nativeClass(null)
export class PlayerHotbarPacket extends Packet {
    @nativeField(uint32_t)
    selectedSlot:uint32_t;
    @nativeField(bool_t)
    selectHotbarSlot:bool_t;
    /** @deprecated */
    @nativeField(uint8_t, {ghost: true})
    windowId:uint8_t;
    @nativeField(uint8_t)
    containerId:ContainerId;
}

@nativeClass(null)
export class InventoryContentPacket extends Packet {
    @nativeField(uint8_t)
    containerId:ContainerId;
    @nativeField(CxxVector.make(NetworkItemStackDescriptor), 56)
    slots:CxxVector<NetworkItemStackDescriptor>;
}

@nativeClass(null)
export class InventorySlotPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ContainerSetDataPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CraftingDataPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CraftingEventPacket extends Packet {
    @nativeField(uint8_t)
    containerId:ContainerId;
    @nativeField(int32_t, 0x34)
    containerType:ContainerType;
    @nativeField(mce.UUID)
    recipeId:mce.UUID;
    @nativeField(CxxVector.make(NetworkItemStackDescriptor))
    inputItems:CxxVector<NetworkItemStackDescriptor>;
    @nativeField(CxxVector.make(NetworkItemStackDescriptor))
    outputItems:CxxVector<NetworkItemStackDescriptor>;
}

@nativeClass(null)
export class GuiDataPickItemPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AdventureSettingsPacket extends Packet {
    @nativeField(uint32_t)
    flag1: uint32_t;
    @nativeField(uint32_t)
    commandPermission: uint32_t;
    @nativeField(uint32_t, 0x38)
    flag2: uint32_t;
    @nativeField(uint32_t)
    playerPermission: uint32_t;
    @nativeField(ActorUniqueID)
    actorId: ActorUniqueID;
    @nativeField(uint32_t, 0x4C)
    customFlag: uint32_t;
}

@nativeClass(null)
export class BlockActorDataPacket extends Packet {
    @nativeField(BlockPos)
    pos: BlockPos;
    @nativeField(CompoundTag, 0x40)
    data: CompoundTag;
}

@nativeClass(null)
export class PlayerInputPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class LevelChunkPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetCommandsEnabledPacket extends Packet {
    @nativeField(bool_t)
    commandsEnabled:bool_t;
}

@nativeClass(null)
export class SetDifficultyPacket extends Packet {
    @nativeField(uint32_t)
    difficulty:uint32_t;
}

@nativeClass(null)
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

@nativeClass(null)
export class SetPlayerGameTypePacket extends Packet {
    @nativeField(int32_t)
    playerGameType:GameType;
}

@nativeClass(null)
export class PlayerListPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SimpleEventPacket extends Packet {
    @nativeField(uint16_t)
    subtype:uint16_t;
}

@nativeClass(null)
export class TelemetryEventPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SpawnExperienceOrbPacket extends Packet {
    @nativeField(Vec3)
    pos:Vec3;
    @nativeField(int32_t)
    amount:int32_t;
}

@nativeClass(null)
export class MapItemDataPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class MapInfoRequestPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class RequestChunkRadiusPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ChunkRadiusUpdatedPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ItemFrameDropItemPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class GameRulesChangedPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CameraPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class BossEventPacket extends Packet {
    /** @deprecated */
    @nativeField(bin64_t, {ghost: true})
    unknown:bin64_t;
    /** Always 1 */
    @nativeField(int32_t)
    flagDarken:int32_t;
    /** Always 2 */
    @nativeField(int32_t)
    flagFog:int32_t;
    /** Unique ID of the boss */
    @nativeField(bin64_t)
    entityUniqueId:bin64_t;
    @nativeField(bin64_t)
    playerUniqueId:bin64_t;
    @nativeField(uint32_t)
    type:uint32_t;
    @nativeField(CxxString, 0x50)
    title:CxxString;
    @nativeField(float32_t)
    healthPercent:float32_t;
    @nativeField(uint32_t)
    color:BossEventPacket.Colors;
    @nativeField(uint32_t)
    overlay:BossEventPacket.Overlay;
    @nativeField(bool_t)
    darkenScreen:bool_t;
    @nativeField(bool_t)
    createWorldFog:bool_t;
}
export namespace BossEventPacket {
    export enum Types {
        Show,
        RegisterPlayer,
        Hide,
        UnregisterPlayer,
        HealthPercent,
        Title,
        Properties,
        Style,
    }

    export enum Colors {
        Pink,
        Blue,
        Red,
        Green,
        Yellow,
        Purple,
        White,
    }

    export enum Overlay {
        Progress,
        Notched6,
        Notched10,
        Notched12,
        Notched20,
    }
}

@nativeClass(null)
export class ShowCreditsPacket extends Packet {
    // unknown
}

@nativeClass()
class AvailableCommandsParamData extends NativeClass {
    @nativeField(CxxString)
    paramName:CxxString;
    @nativeField(int32_t)
    paramType:int32_t;
    @nativeField(bool_t)
    isOptional:bool_t;
    @nativeField(uint8_t)
    flags:uint8_t;
}

@nativeClass()
class AvailableCommandsOverloadData extends NativeClass {
    @nativeField(CxxVector.make(AvailableCommandsParamData))
    parameters:CxxVector<AvailableCommandsParamData>;
}

@nativeClass(0x68)
class AvailableCommandsCommandData extends NativeClass {
    @nativeField(CxxString)
    name:CxxString;
    @nativeField(CxxString)
    description:CxxString;
    @nativeField(uint16_t) // 40
    flags:uint16_t;
    @nativeField(uint8_t) // 42
    permission:uint8_t;
    /** @deprecated use overloads */
    @nativeField(CxxVector.make(CxxVector.make(CxxStringWith8Bytes)), {ghost: true})
    parameters:CxxVector<CxxVector<CxxString>>;
    @nativeField(CxxVector.make(AvailableCommandsOverloadData))
    overloads:CxxVector<AvailableCommandsOverloadData>;
    @nativeField(int32_t) // 60
    aliases:int32_t;
}

@nativeClass(0x38)
class AvailableCommandsEnumData extends NativeClass{
}

@nativeClass(null)
export class AvailableCommandsPacket extends Packet {
    @nativeField(CxxVector.make(CxxString))
    enumValues:CxxVector<CxxString>;
    @nativeField(CxxVector.make(CxxString))
    postfixes:CxxVector<CxxString>;
    @nativeField(CxxVector.make(AvailableCommandsEnumData))
    enums:CxxVector<AvailableCommandsEnumData>;
    @nativeField(CxxVector.make(AvailableCommandsCommandData))
    commands:CxxVector<AvailableCommandsCommandData>;
}
export namespace AvailableCommandsPacket {
    export type CommandData = AvailableCommandsCommandData;
    export const CommandData = AvailableCommandsCommandData;
    export type EnumData = AvailableCommandsEnumData;
    export const EnumData = AvailableCommandsEnumData;
}

@nativeClass(null)
export class CommandRequestPacket extends Packet {
    @nativeField(CxxString)
    command:CxxString;
}


@nativeClass(null)
export class CommandBlockUpdatePacket extends Packet {
    // unknown
}


@nativeClass(null)
export class CommandOutputPacket extends Packet {
    // unknown
}


@nativeClass(null)
export class ResourcePackDataInfoPacket extends Packet {
    // unknown
}


@nativeClass(null)
export class ResourcePackChunkDataPacket extends Packet {
    // unknown
}


@nativeClass(null)
export class ResourcePackChunkRequestPacket extends Packet {
    // unknown
}


@nativeClass(null)
export class TransferPacket extends Packet {
    @nativeField(CxxString)
    address:CxxString;
    @nativeField(uint16_t)
    port:uint16_t;
}

@nativeClass(null)
export class PlaySoundPacket extends Packet {
    @nativeField(CxxString)
    soundName:CxxString;
    @nativeField(BlockPos)
    pos:BlockPos;
    @nativeField(float32_t)
    volume:float32_t;
    @nativeField(float32_t)
    pitch:float32_t;
}

@nativeClass(null)
export class StopSoundPacket extends Packet {
    @nativeField(CxxString)
    soundName:CxxString;
    @nativeField(bool_t)
    stopAll:bool_t;
}

@nativeClass(null)
export class SetTitlePacket extends Packet {
    @nativeField(int32_t)
    type:int32_t;
    @nativeField(CxxString)
    text:CxxString;
    @nativeField(int32_t)
    fadeInTime:int32_t;
    @nativeField(int32_t)
    stayTime:int32_t;
    @nativeField(int32_t)
    fadeOutTime:int32_t;
}
export namespace SetTitlePacket {
    export enum Types {
        Clear,
        Reset,
        Title,
        Subtitle,
        Actionbar,
        AnimationTimes,
    }
}

@nativeClass(null)
export class AddBehaviorTreePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class StructureBlockUpdatePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ShowStoreOfferPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PurchaseReceiptPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PlayerSkinPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SubClientLoginPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class WSConnectPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetLastHurtByPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class BookEditPacket extends Packet {
    @nativeField(uint8_t)
    type:uint8_t;
    @nativeField(int32_t, 0x34) // It is int32 but is uint8 after serialization
    inventorySlot:int32_t;
    @nativeField(int32_t) // It is int32 but is uint8 after serialization
    pageNumber:int32_t;
    @nativeField(int32_t)
    secondaryPageNumber:int32_t; // It is int32 but is uint8 after serialization
    @nativeField(CxxString)
    text:CxxString;
    @nativeField(CxxString)
    author:CxxString;
    @nativeField(CxxString)
    xuid:CxxString;
}
export namespace BookEditPacket {
    export enum Types {
        ReplacePage,
        AddPage,
        DeletePage,
        SwapPages,
        SignBook,
    }
}

@nativeClass(null)
export class NpcRequestPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PhotoTransferPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ModalFormRequestPacket extends Packet {
    @nativeField(uint32_t)
    id:uint32_t;
    @nativeField(CxxString)
    content:CxxString;
}

/** @deprecated use ModalFormRequestPacket, follow the real class name */
export const ShowModalFormPacket = ModalFormRequestPacket;
/** @deprecated use ModalFormRequestPacket, follow the real class name */
export type ShowModalFormPacket = ModalFormRequestPacket;

@nativeClass(null)
export class ModalFormResponsePacket extends Packet {
    @nativeField(uint32_t)
    id:uint32_t;
    @nativeField(CxxString)
    response:CxxString;
}

@nativeClass(null)
export class ServerSettingsRequestPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ServerSettingsResponsePacket extends Packet {
    @nativeField(uint32_t)
    id:uint32_t;
    @nativeField(CxxString)
    content:CxxString;
}

@nativeClass(null)
export class ShowProfilePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetDefaultGameTypePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class RemoveObjectivePacket extends Packet {
    @nativeField(CxxString)
    objectiveName:CxxString;
}

@nativeClass(null)
export class SetDisplayObjectivePacket extends Packet {
    @nativeField(CxxString)
    displaySlot:'list'|'sidebar'|'belowname'|''|DisplaySlot;
    @nativeField(CxxString)
    objectiveName:CxxString;
    @nativeField(CxxString)
    displayName:CxxString;
    @nativeField(CxxString)
    criteriaName:'dummy'|'';
    @nativeField(uint8_t)
    sortOrder:ObjectiveSortOrder;
}

@nativeClass()
export class ScorePacketInfo extends NativeClass {
    @nativeField(ScoreboardId)
    scoreboardId:ScoreboardId;
    @nativeField(CxxString)
    objectiveName:CxxString;

    @nativeField(int32_t)
    score:int32_t;
    @nativeField(uint8_t)
    type:ScorePacketInfo.Type;
    @nativeField(bin64_t)
    playerEntityUniqueId:bin64_t;
    @nativeField(bin64_t)
    entityUniqueId:bin64_t;
    @nativeField(CxxString)
    customName:CxxString;
}

export namespace ScorePacketInfo {
    export enum Type {
        PLAYER = 1,
        ENTITY = 2,
        FAKE_PLAYER = 3,
    }
}

@nativeClass(null)
export class SetScorePacket extends Packet {
    @nativeField(uint8_t)
    type:uint8_t;

    @nativeField(CxxVector.make(ScorePacketInfo))
    entries:CxxVector<ScorePacketInfo>;
}

export namespace SetScorePacket {
    export enum Type {
        CHANGE = 0,
        REMOVE = 1,
    }
}

@nativeClass(null)
export class LabTablePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class UpdateBlockPacketSynced extends Packet {
    // unknown
}

@nativeClass(null)
export class MoveActorDeltaPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetScoreboardIdentityPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SetLocalPlayerAsInitializedPacket extends Packet {
    @nativeField(ActorRuntimeID)
    actorId: ActorRuntimeID;
}

@nativeClass(null)
export class UpdateSoftEnumPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class NetworkStackLatencyPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ScriptCustomEventPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SpawnParticleEffectPacket extends Packet {
    @nativeField(uint8_t)
    dimensionId: uint8_t;
    @nativeField(ActorUniqueID)
    actorId: ActorUniqueID;
    @nativeField(Vec3)
    pos: Vec3;
    @nativeField(CxxString)
    particleName: CxxString;
}

/** @deprecated use SpawnParticleEffectPacket, follow real class name */
export const SpawnParticleEffect = SpawnParticleEffectPacket;
/** @deprecated use SpawnParticleEffectPacket, follow real class name */
export type SpawnParticleEffect = SpawnParticleEffectPacket;

@nativeClass(null)
export class AvailableActorIdentifiersPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class LevelSoundEventPacketV2 extends Packet {
    // unknown
}

@nativeClass(null)
export class NetworkChunkPublisherUpdatePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class BiomeDefinitionList extends Packet {
    // unknown
}

@nativeClass(null)
export class LevelSoundEventPacket extends Packet {
    @nativeField(uint32_t)
    sound: uint32_t;
    @nativeField(Vec3)
    pos: Vec3;
    @nativeField(int32_t)
    extraData: int32_t;
    @nativeField(CxxString)
    entityType: CxxString;
    @nativeField(bool_t)
    isBabyMob: bool_t;
    @nativeField(bool_t)
    disableRelativeVolume: bool_t;
}

@nativeClass(null)
export class LevelEventGenericPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class LecternUpdatePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class RemoveEntityPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ClientCacheStatusPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class OnScreenTextureAnimationPacket extends Packet {
    @nativeField(int32_t)
    animationType: int32_t;
}

@nativeClass(null)
export class MapCreateLockedCopy extends Packet {
    // unknown
}

@nativeClass(null)
export class StructureTemplateDataRequestPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class StructureTemplateDataExportPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ClientCacheBlobStatusPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ClientCacheMissResponsePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class EducationSettingsPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class EmotePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class MultiplayerSettingsPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SettingsCommandPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AnvilDamagePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CompletedUsingItemPacket extends Packet {
    @nativeField(int16_t)
    itemId: int16_t;
    @nativeField(int32_t)
    action: CompletedUsingItemPacket.Actions;
}

export namespace CompletedUsingItemPacket {
    export enum Actions {
        EquipArmor,
        Eat,
        Attack,
        Consume,
        Throw,
        Shoot,
        Place,
        FillBottle,
        FillBucket,
        PourBucket,
        UseTool,
        Interact,
        Retrieved,
        Dyed,
        Traded,
    }
}

@nativeClass(null)
export class NetworkSettingsPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PlayerAuthInputPacket extends Packet {
    @nativeField(float32_t)
    pitch: float32_t;
    @nativeField(float32_t)
    yaw: float32_t;
    @nativeField(Vec3)
    pos: Vec3;
    @nativeField(float32_t)
    moveX: float32_t;
    @nativeField(float32_t)
    moveZ: float32_t;
    @nativeField(float32_t)
    heaYaw: float32_t;
    @nativeField(bin64_t)
    inputFlags: bin64_t;
    @nativeField(uint32_t)
    inputMode: uint32_t;
    @nativeField(uint32_t)
    playMode: uint32_t;
    @nativeField(Vec3)
    vrGazeDirection: Vec3;
    @nativeField(bin64_t)
    tick: bin64_t;
    @nativeField(Vec3)
    delta: Vec3;
}

@nativeClass(null)
export class CreativeContentPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PlayerEnchantOptionsPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ItemStackRequest extends Packet {
    // unknown
}

@nativeClass(null)
export class ItemStackResponse extends Packet {
    // unknown
}

@nativeClass(null)
export class PlayerArmorDamagePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CodeBuilderPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class UpdatePlayerGameTypePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class EmoteListPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PositionTrackingDBServerBroadcastPacket extends Packet {
    @nativeField(uint8_t)
    action: PositionTrackingDBServerBroadcastPacket.Actions;
    @nativeField(int32_t)
    trackingId: int32_t;
    // TODO: little endian encoded NBT compound tag
}

export namespace PositionTrackingDBServerBroadcastPacket {
    export enum Actions {
        Update,
        Destroy,
        NotFound,
    }
}

/** @deprecated use PositionTrackingDBServerBroadcastPacket, follow the real class name */
export const PositionTrackingDBServerBroadcast = PositionTrackingDBServerBroadcastPacket;
/** @deprecated use PositionTrackingDBServerBroadcastPacket, follow the real class name */
export type PositionTrackingDBServerBroadcast = PositionTrackingDBServerBroadcastPacket;

@nativeClass(null)
export class PositionTrackingDBClientRequestPacket extends Packet {
    @nativeField(uint8_t)
    action: PositionTrackingDBClientRequestPacket.Actions;
    @nativeField(int32_t)
    trackingId: int32_t;
}

export namespace PositionTrackingDBClientRequestPacket {
    export enum Actions {
        Query,
    }
}

/** @deprecated Use PositionTrackingDBClientRequestPacket, follow the real class name */
export const PositionTrackingDBClientRequest = PositionTrackingDBClientRequestPacket;
/** @deprecated Use PositionTrackingDBClientRequestPacket, follow the real class name */
export type PositionTrackingDBClientRequest = PositionTrackingDBClientRequestPacket;

@nativeClass(null)
export class DebugInfoPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class PacketViolationWarningPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class MotionPredictionHintsPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AnimateEntityPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CameraShakePacket extends Packet {
    @nativeField(float32_t)
    intensity:float32_t;
    @nativeField(float32_t)
    duration:float32_t;
    @nativeField(uint8_t)
    shakeType:uint8_t;
    @nativeField(uint8_t)
    shakeAction:uint8_t;
}
export namespace CameraShakePacket {
    export enum ShakeType {
        Positional,
        Rotational,
    }
    export enum ShakeAction {
        Add,
        Stop,
    }
}

@nativeClass(null)
export class PlayerFogPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class CorrectPlayerMovePredictionPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ItemComponentPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class FilterTextPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class ClientboundDebugRendererPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SyncActorPropertyPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class AddVolumeEntityPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class RemoveVolumeEntityPacket extends Packet {
    // unknown
}

@nativeClass(null)
export class SimulationTypePacket extends Packet {
    // unknown
}

@nativeClass(null)
export class NpcDialoguePacket extends Packet {
    /** ActorUniqueID of the Npc */
    @nativeField(ActorUniqueID)
    actorId:ActorUniqueID;
    @nativeField(int32_t)
    action:NpcDialoguePacket.Actions;
    /** Always empty */
    // @nativeField(CxxString, 0x40)
    // dialogue:CxxString;
    // @nativeField(CxxString)
    // sceneName:CxxString;
    // @nativeField(CxxString)
    // npcName:CxxString;
    // @nativeField(CxxString)
    // actionJson:CxxString;

    @nativeField(int64_as_float_t, 0x30)
    actorIdAsNumber:int64_as_float_t;
}
export namespace NpcDialoguePacket {
    export enum Actions {
        Open,
        Close,
    }
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
(PacketIdToType as any).__proto__ = null;
export type PacketIdToType = {[key in keyof typeof PacketIdToType]:InstanceType<typeof PacketIdToType[key]>};

for (const packetId in PacketIdToType) {
    PacketIdToType[packetId as unknown as keyof PacketIdToType].ID = +packetId;
}
