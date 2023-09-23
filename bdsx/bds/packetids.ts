/**
 * referred from: https://github.com/NiclasOlofsson/MiNET/blob/master/src/MiNET/MiNET/Net/MCPE%20Protocol%20Documentation.md
 */
export enum MinecraftPacketIds { // int32_t
    Login = 0x01,
    PlayStatus = 0x02,
    ServerToClientHandshake = 0x03,
    ClientToServerHandshake = 0x04,
    Disconnect = 0x05,
    ResourcePacksInfo = 0x06,
    /** @deprecated use ResourcePackStack, follow the real class name */
    ResourcePacksStack = 0x07,
    ResourcePackStack = 0x07,
    ResourcePackClientResponse = 0x08,
    Text = 0x09,
    SetTime = 0x0a,
    StartGame = 0x0b,
    AddPlayer = 0x0c,
    AddActor = 0x0d,
    RemoveActor = 0x0e,
    AddItemActor = 0x0f,
    // UNUSED_PLS_USE_ME = 0x10, // DEPRECATED
    TakeItemActor = 0x11,
    MoveActorAbsolute = 0x12,
    MovePlayer = 0x13,
    /** @deprecated use PassengerJump, follow the real class name */
    RiderJump = 0x14,
    PassengerJump = 0x14,
    UpdateBlock = 0x15,
    AddPainting = 0x16,
    TickSync = 0x17,
    LevelSoundEventV1 = 0x18,
    LevelEvent = 0x19,
    BlockEvent = 0x1a,
    /** @deprecated use ActorEvent, matching to official name */
    EntityEvent = 0x1b,
    ActorEvent = 0x1b,
    MobEffect = 0x1c,
    UpdateAttributes = 0x1d,
    InventoryTransaction = 0x1e,
    MobEquipment = 0x1f,
    MobArmorEquipment = 0x20,
    Interact = 0x21,
    BlockPickRequest = 0x22,
    ActorPickRequest = 0x23,
    PlayerAction = 0x24,
    // ActorFall = 0x25, // DEPRECATED
    HurtArmor = 0x26,
    /** @deprecated use SetActorData, matching to official name */
    SetEntityData = 0x27,
    SetActorData = 0x27,
    /** @deprecated use SetActorMotion, matching to official name */
    SetEntityMotion = 0x28,
    SetActorMotion = 0x28,
    SetActorLink = 0x29,
    SetHealth = 0x2a,
    SetSpawnPosition = 0x2b,
    Animate = 0x2c,
    Respawn = 0x2d,
    ContainerOpen = 0x2e,
    ContainerClose = 0x2f,
    PlayerHotbar = 0x30,
    InventoryContent = 0x31,
    InventorySlot = 0x32,
    ContainerSetData = 0x33,
    CraftingData = 0x34,
    CraftingEvent = 0x35,
    GuiDataPickItem = 0x36,
    AdventureSettings = 0x37,
    BlockActorData = 0x38,
    PlayerInput = 0x39,
    LevelChunk = 0x3a,
    SetCommandsEnabled = 0x3b,
    SetDifficulty = 0x3c,
    ChangeDimension = 0x3d,
    SetPlayerGameType = 0x3e,
    PlayerList = 0x3f,
    SimpleEvent = 0x40,
    /** @deprecated use LegacyTelemetryEvent instead, to follow the real class name */
    TelemetryEvent = 0x41,
    /** @deprecated use LegacyTelemetryEvent instead, to follow the real class name */
    Event = 0x41,
    LegacyTelemetryEvent = 0x41,
    SpawnExperienceOrb = 0x42,
    /** @deprecated Use ClientboundMapItemData instead, to match to official class name*/
    MapItemData = 0x43,
    ClientboundMapItemData = 0x43,
    MapInfoRequest = 0x44,
    RequestChunkRadius = 0x45,
    ChunkRadiusUpdated = 0x46,
    ItemFrameDropItem = 0x47,
    GameRulesChanged = 0x48,
    Camera = 0x49,
    BossEvent = 0x4a,
    ShowCredits = 0x4b,
    AvailableCommands = 0x4c,
    CommandRequest = 0x4d,
    CommandBlockUpdate = 0x4e,
    CommandOutput = 0x4f,
    UpdateTrade = 0x50,
    UpdateEquip = 0x51,
    ResourcePackDataInfo = 0x52,
    ResourcePackChunkData = 0x53,
    ResourcePackChunkRequest = 0x54,
    Transfer = 0x55,
    PlaySound = 0x56,
    StopSound = 0x57,
    SetTitle = 0x58,
    AddBehaviorTree = 0x59,
    StructureBlockUpdate = 0x5a,
    ShowStoreOffer = 0x5b,
    PurchaseReceipt = 0x5c,
    PlayerSkin = 0x5d,
    SubClientLogin = 0x5e,
    /** @deprecated use AutomationClientConnect instead, to follow the real class name */
    WSConnect = 0x5f,
    AutomationClientConnect = 0x5f,
    SetLastHurtBy = 0x60,
    BookEdit = 0x61,
    NpcRequest = 0x62,
    PhotoTransfer = 0x63,
    /** @deprecated use ModalFormRequest, follow the real class name */
    ShowModalForm = 0x64,
    ModalFormRequest = 0x64,
    ModalFormResponse = 0x65,
    ServerSettingsRequest = 0x66,
    ServerSettingsResponse = 0x67,
    ShowProfile = 0x68,
    SetDefaultGameType = 0x69,
    RemoveObjective = 0x6a,
    SetDisplayObjective = 0x6b,
    SetScore = 0x6c,
    LabTable = 0x6d,
    UpdateBlockSynced = 0x6e,
    /** @deprecated use MoveActorDelta, matching to official name */
    MoveEntityDelta = 0x6f,
    MoveActorDelta = 0x6f,
    SetScoreboardIdentity = 0x70,
    SetLocalPlayerAsInitialized = 0x71,
    UpdateSoftEnum = 0x72,
    NetworkStackLatency = 0x73,
    // BlockPalette = 0x74, // DEPRECATED
    // ScriptCustomEvent = 0x75, // removed
    SpawnParticleEffect = 0x76,
    AvailableActorIdentifiers = 0x77,
    LevelSoundEventV2 = 0x78,
    NetworkChunkPublisherUpdate = 0x79,
    BiomeDefinitionList = 0x7a,
    LevelSoundEvent = 0x7b,
    LevelEventGeneric = 0x7c,
    LecternUpdate = 0x7d,
    // VideoStreamConnect_DEPRECATED = 0x7e,
    AddEntity = 0x7f, // DEPRECATED
    RemoveEntity = 0x80,
    ClientCacheStatus = 0x81,
    OnScreenTextureAnimation = 0x82,
    MapCreateLockedCopy = 0x83,
    StructureTemplateDataRequest = 0x84,
    /** @deprecated use StructureTemplateDataResponse instead, to follow the real class name */
    StructureTemplateDataExport = 0x85,
    StructureTemplateDataResponse = 0x85,
    // UpdateBlockProperties = 0x86, // DEPRECATED
    ClientCacheBlobStatus = 0x87,
    ClientCacheMissResponse = 0x88,
    EducationSettings = 0x89,
    Emote = 0x8a,
    MultiplayerSettings = 0x8b,
    SettingsCommand = 0x8c,
    AnvilDamage = 0x8d,
    CompletedUsingItem = 0x8e,
    NetworkSettings = 0x8f,
    PlayerAuthInput = 0x90,
    CreativeContent = 0x91,
    PlayerEnchantOptions = 0x92,
    ItemStackRequest = 0x93,
    ItemStackResponse = 0x94,
    PlayerArmorDamage = 0x95,
    CodeBuilder = 0x96,
    UpdatePlayerGameType = 0x97,
    EmoteList = 0x98,
    PositionTrackingDBServerBroadcast = 0x99,
    PositionTrackingDBClientRequest = 0x9a,
    DebugInfo = 0x9b,
    PacketViolationWarning = 0x9c,
    MotionPredictionHints = 0x9d,
    AnimateEntity = 0x9e,
    CameraShake = 0x9f,
    PlayerFog = 0xa0,
    CorrectPlayerMovePrediction = 0xa1,
    ItemComponent = 0xa2,
    FilterText = 0xa3,
    ClientboundDebugRenderer = 0xa4,
    SyncActorProperty = 0xa5,
    AddVolumeEntity = 0xa6,
    RemoveVolumeEntity = 0xa7,
    SimulationType = 0xa8,
    NpcDialogue = 0xa9,
    /** @deprecated skip Packet ends */
    EduUriResourcePacket = 0xaa,
    EduUriResource = 0xaa,
    /** @deprecated skip Packet ends */
    CreatePhotoPacket = 0xab,
    CreatePhoto = 0xab,
    UpdateSubChunkBlocks = 0xac,
    // PhotoInfoRequest = 0xad,
    PlayerStartItemCooldown = 0xb0,
    ScriptMessage = 0xb1,
    CodeBuilderSource = 0xb2,
    TickingAreasLoadStatus = 0xb3,
    DimensionData = 0xb4,
    AgentActionEvent = 0xb5,
    ChangeMobProperty = 0xb6,
    LessonProgress = 0xb7,
    RequestAbility = 0xb8,
    RequestPermissions = 0xb9,
    ToastRequest = 0xba,
    UpdateAbilities = 0xbb,
    UpdateAdventureSettings = 0xbc,
    DeathInfo = 0xbd,
    EditorNetwork = 0xbe,
    FeatureRegistry = 0xbf,
    ServerStats = 0xc0,
    RequestNetworkSettings = 0xc1,
    GameTestRequest = 0xc2,
    GameTestResults = 0xc3,
    UpdateClientInputLocks = 0xc4,
    /** @deprecated skip Packet ends */
    // ClientCheatAbilityPacket = 0xc5, // removed
    // ClientCheatAbility = 0xc5, // removed
    /** @deprecated skip Packet ends */
    CameraPresetsPacket = 0xc6,
    CameraPresets = 0xc6,
    /** @deprecated skip Packet ends */
    UnlockedRecipesPacket = 0xc7,
    UnlockedRecipes = 0xc7,
    /** @deprecated skip Packet ends */
    CameraInstructionPacket = 0x12c,
    CameraInstruction = 0x12c,
    /** @deprecated skip Packet ends */
    CompressedBiomeDefinitionListPacket = 0x12d,
    CompressedBiomeDefinitionList = 0x12d,
    /** @deprecated skip Packet ends */
    TrimDataPacket = 0x12e,
    TrimData = 0x12e,
    /** @deprecated skip Packet ends */
    OpenSignPacket = 0x12f,
    OpenSign = 0x12f,
}
(MinecraftPacketIds as any).__proto__ = null;
