#pragma once

#include <stdint.h>

#include <KR3/win/windows.h>
#include <WinSock2.h>
#include <ws2ipdef.h>

#define RAKNET_SUPPORT_IPV6 1

#include <RakPeer.h>
#include <RakNetTypes.h>

struct ReadOnlyBinaryStream;
struct Player;
struct ServerPlayer;
struct Cerificate;
struct ServerNetworkHandler;
struct BlockSource;
struct AddPlatform_win32;
struct ServerInstance;
struct NetworkHandler;
struct DedicatedServer;
struct ScriptEngine;
struct AppPlatform_win32;
struct LoopbackPacketSender;
struct EducationOptions;
struct DBStorage;
struct MinecraftServerScriptEngine;
struct IMinecraftApp;
struct ServerInstanceEventCoordinator;
struct ConnectionReqeust;
struct MinecraftEventing;
struct ResourcePackManager;
struct VanilaGameModuleServer;
struct VanilaServerGameplayEventListener;
struct Whitelist;
struct PrivateKeyManager;
struct MinecraftCommands;
struct Actor;
struct ActorDefinitionGroup;
struct Block;
struct SimpleContainer;
struct BaseAttributeMap;
struct AttributeInstance;
struct ServerLevel;
struct BinaryStream;
struct EntityRegistryOwned;
struct VanillaAppConfigs;
struct VanillaGameModuleDedicatedServer;
struct NetworkIdentifier;
struct EncryptedNetworkPeer;
struct String;
struct Certificate;
struct Packet;
struct Dimension;
struct Level;
struct MCRESULT;
struct NetworkIdentifierWithSubId;
struct Actor$VFTable;
struct SharedPtrData;
struct ItemStack;
struct AuxDataBlockItem;
struct CommandOutputSender;
struct CommandContext;
struct CommandOrigin;
struct CommandOutput;

enum class ActorUniqueID :uint64_t;
enum class ActorRuntimeID :uint64_t;

template <typename KEY, typename VALUE>
struct UMap;
template <typename T>
struct SharedPtr;
template <typename T>
struct Vector;

enum Dirty_t { Dirty };

#define OFFSETFIELD(type, name, offset) using name##_t = type; name##_t &name() noexcept { return *(name##_t*)((byte*)this + offset); };

namespace mce
{
	struct UUID
	{
		uint32_t v1;
		uint16_t v2;
		uint16_t v3;
		uint64_t v4;

		static UUID generate() noexcept;
	};
}

enum PacketReadResult :uint32_t
{
	PacketReadNoError = 0,
	PacketReadError = 1,
};
enum class DimensionId :uint32_t
{
	Undefined,
	Overworld,
	Nether,
	TheEnd,
};
enum class ActorType :uint32_t;
enum class MinecraftPacketIds :uint32_t;

struct CxxLinkedListData
{
	struct Node
	{
		Node* next;
	};

	struct Iterator
	{
		Iterator(Node* node) noexcept;
		Iterator& operator ++() noexcept;
		bool operator ==(const Iterator& other) const noexcept;
		bool operator !=(const Iterator& other) const noexcept;

		Node* node;
	};

	Node* axis;
	size_t count;

	Iterator begin() noexcept;
	Iterator end() noexcept;
};

template <typename T>
struct CxxLinkedList:CxxLinkedListData
{
public:

};

struct NetworkIdentifier
{
	static constexpr size_t size = sizeof(RakNet::AddressOrGUID);
	RakNet::AddressOrGUID address;

	bool operator ==(const NetworkIdentifier& ni) const noexcept;
	bool operator !=(const NetworkIdentifier& ni) const noexcept;
	size_t getHash() const noexcept;
	kr::Text getAddress() const noexcept;
};

template <>
struct std::hash<NetworkIdentifier>
{
	size_t operator ()(const NetworkIdentifier& ni) const noexcept;
};

struct MCRESULT
{
	uint32_t result;
};

struct SharedPtrData
{
	struct RefCounter
	{
		RefCounter() = delete;

		struct VFTable
		{
			void (*_Destroy)(RefCounter*);
			void (*_Delete_This)(RefCounter*);
		};
		VFTable* vftable;
		uint32_t useRef;
		uint32_t weakRef;
		// data?

		void addRef() noexcept;
		void release() noexcept;
	};

	void* pointer;
	RefCounter* ref;

	SharedPtrData() noexcept;
	SharedPtrData(Dirty_t) noexcept;
	SharedPtrData(const SharedPtrData& value) noexcept;
	SharedPtrData(SharedPtrData&& value) noexcept;
	~SharedPtrData() noexcept;

	SharedPtrData& operator =(const SharedPtrData& value) noexcept;
	SharedPtrData& operator =(SharedPtrData&& value) noexcept;

	bool exists() const noexcept;
	void addRef() const noexcept;
	void discard() noexcept;
};


struct VectorData
{
	void* m_begin;
	void* m_end;
	void* m_cap;

	VectorData() noexcept;
	VectorData(Dirty_t) noexcept;

protected:
	~VectorData() noexcept;
	static void* _alloc(size_t bytesize) noexcept;
};

template <typename T>
struct Vector :VectorData
{
	using VectorData::VectorData;

	~Vector() noexcept
	{
		kr::mema::dtor(begin(), end());
	}

	void reserve(size_t new_cap) noexcept
	{
		new_cap = kr::maxt(capacity() * 3 / 2, new_cap);
		T* new_data = (T*)_alloc(new_cap * sizeof(T));
		size_t _size = size();
		kr::mema::ctor_move(new_data, (T*)m_begin, _size);
		m_begin = new_data;
		m_end = new_data + _size;
		m_cap = new_data + new_cap;
	}
	void resize(size_t new_size) noexcept
	{
		T* new_end = begin() + new_size;
		T* old_end = end();
		if (new_end == old_end) return;
		if (new_end < old_end)
		{
			kr::mema::dtor(new_end, old_end);
		}
		else
		{
			if (new_end > m_cap) reserve(new_size);
			kr::mema::ctor(end(), new_end);
		}
		m_end = new_end;
	}
	void push(T value) noexcept
	{
		if (m_cap == m_end) reserve(size() + 1);
		T* old_end = (T*)m_end;
		m_end = old_end + 1;
		new(old_end) T(std::move(value));
	}
	T* prepare() noexcept
	{
		if (m_cap == m_end) reserve(size() + 1);
		T* old_end = (T*)m_end;
		m_end = old_end + 1;
		new(old_end) T();
		return old_end;
	}
	T pop() throws(kr::EofException)
	{
		if (m_begin == m_end) throw kr::EofException();
		m_end = (T*)m_end - 1;
		return *std::move((T*)m_end);
	}
	T* begin() noexcept
	{
		return (T*)m_begin;
	}
	T* end() noexcept
	{
		return (T*)m_end;
	}
	const T* begin() const noexcept
	{
		return (T*)m_begin;
	}
	const T* end() const noexcept
	{
		return (T*)m_end;
	}
	size_t size() const noexcept
	{
		return end() - begin();
	}
	size_t capacity() const noexcept
	{
		return (T*)m_cap - begin();
	}
	T& operator [](size_t idx) noexcept
	{
		_assert(idx < size());
		return begin()[idx];
	}
	const T& operator [](size_t idx) const noexcept
	{
		_assert(idx < size());
		return begin()[idx];
	}
};

struct String
{
	union
	{
		struct
		{
			char* pointer;
			void* u1;
		};
		char buffer[16];
	};
	size_t size;
	size_t capacity;

	String() noexcept;
	String(Dirty_t) noexcept;
	String(String&& _move) noexcept;
	~String() noexcept;
	char* data() noexcept;
	kr::Text text() noexcept;
	String* assign(const char* str, size_t size) noexcept;
	String* append(const char* str, size_t size) noexcept;
	void resize(size_t size, char init = char()) noexcept;
};

template <typename T>
struct SharedPtr :SharedPtrData
{
	using SharedPtrData::SharedPtrData;

	T* pointer() const noexcept
	{
		return (T*)SharedPtrData::pointer;
	}
};



enum class ActorType :uint32_t
{
	Player = 0x13f,
};

enum class MinecraftPacketIds :uint32_t
{
	Login = 0x01,
	PlayStatus = 0x02,
	ServerToClientHandshake = 0x03,
	ClientToServerHandshake = 0x04,
	Disconnect = 0x05,
	ResourcePacksInfo = 0x06,
	ResourcePackStack = 0x07,
	ResourcePackClientResponse = 0x08,
	Text = 0x09,
	SetTime = 0x0a,
	StartGame = 0x0b,
	AddPlayer = 0x0c,
	AddEntity = 0x0d,
	RemoveEntity = 0x0e,
	AddItemEntity = 0x0f,
	TakeItemEntity = 0x11,
	MoveEntity = 0x12,
	MovePlayer = 0x13,
	RiderJump = 0x14,
	UpdateBlock = 0x15,
	AddPainting = 0x16,
	Explode = 0x17,
	LevelSoundEventOld = 0x18,
	LevelEvent = 0x19,
	BlockEvent = 0x1a,
	EntityEvent = 0x1b,
	MobEffect = 0x1c,
	UpdateAttributes = 0x1d,
	InventoryTransaction = 0x1e,
	MobEquipment = 0x1f,
	MobArmorEquipment = 0x20,
	Interact = 0x21,
	BlockPickRequest = 0x22,
	EntityPickRequest = 0x23,
	PlayerAction = 0x24,
	EntityFall = 0x25,
	HurtArmor = 0x26,
	SetEntityData = 0x27,
	SetEntityMotion = 0x28,
	SetEntityLink = 0x29,
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
	BlockEntityData = 0x38,
	PlayerInput = 0x39,
	LevelChunk = 0x3a,
	SetCommandsEnabled = 0x3b,
	SetDifficulty = 0x3c,
	ChangeDimension = 0x3d,
	SetPlayerGameType = 0x3e,
	PlayerList = 0x3f,
	SimpleEvent = 0x40,
	TelemetryEvent = 0x41,
	SpawnExperienceOrb = 0x42,
	ClientboundMapItemData = 0x43,
	MapInfoRequest = 0x44,
	RequestChunkRadius = 0x45,
	ChunkRadiusUpdate = 0x46,
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
	UpdateEquipment = 0x51,
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
	InitiateWebSocketConnection = 0x5f,
	SetLastHurtBy = 0x60,
	BookEdit = 0x61,
	NpcRequest = 0x62,
	PhotoTransfer = 0x63,
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
	MoveEntityDelta = 0x6f,
	SetScoreboardIdentityPacket = 0x70,
	SetLocalPlayerAsInitializedPacket = 0x71,
	UpdateSoftEnumPacket = 0x72,
	NetworkStackLatencyPacket = 0x73,
	ScriptCustomEventPacket = 0x75,
	SpawnParticleEffect = 0x76,
	AvailableEntityIdentifiers = 0x77,
	LevelSoundEventV2 = 0x78,
	NetworkChunkPublisherUpdate = 0x79,
	BiomeDefinitionList = 0x7a,
	LevelSoundEvent = 0x7b,
	LevelEventGeneric = 0x7c,
	LecternUpdate = 0x7d,
	VideoStreamConnect = 0x7e,
	ClientCacheStatus = 0x81,
	OnScreenTextureAnimation = 0x82,
	MapCreateLockedCopy = 0x83,
	StructureTemplateDataExportRequest = 0x84,
	StructureTemplateDataExportResponse = 0x85,
	UpdateBlockProperties = 0x86,
	ClientCacheBlobStatus = 0x87,
	ClientCacheMissResponse = 0x88,
};

struct HashedString
{
	size_t hash;
	String str;

	HashedString() noexcept;
	HashedString(kr::Text text) noexcept;

	HashedString& operator = (kr::Text text) noexcept;

	static size_t getHash(kr::Text text) noexcept;
};

struct ItemStack
{
	struct Info
	{
		AuxDataBlockItem* item;
		uint32_t v1;
		uint32_t v2;
	};

	void* vftable;
	Info* info;
	intptr_t offset_10;
	Block* block;
	uint32_t offset_20; // 23 : byte?
	float offset_24;
	intptr_t offset_28;
	float offset_30;
	float offset_34;
	byte offset_38[0xd8];
};

struct InventoryTransaction
{
	struct NodeData
	{
		// 20:Vector<ProfilerLite::ScopedData*>
	};
	InventoryTransaction() = delete;

	float offset_00;
	CxxLinkedList<Vector<ItemStack>> itemlist;
	// 40 : ptr, ptr
	OFFSETFIELD(ItemStack*, items, 0x70);
};

struct ComplexInventoryTransaction
{
	enum class Type:uint32_t
	{
		ItemUse=2,
		ItemUseOnAction=3,
		ItemRelease=4,
	};

	void* vftable;
	Type transactionType;
	InventoryTransaction transaction;
};

struct ItemReleaseInventoryTransaction : ComplexInventoryTransaction
{
	OFFSETFIELD(ItemStack, item, 0x70);
};

struct ItemUseOnActionInventoryTransaction : ComplexInventoryTransaction
{
	OFFSETFIELD(ItemStack, item, 0x78);
};

struct ItemUseInventoryTransaction : ComplexInventoryTransaction
{
	OFFSETFIELD(ItemStack, item, 0x88);
};

struct ItemStackListItem
{
	uint32_t offset_00;
	uint32_t offset_04;
	uint32_t offset_08;
	uint32_t offset_0c;
	ItemStack item;
};

struct ItemStackList
{
	uint32_t v1;
	uint32_t v2;
	uint32_t v3;
	uint32_t v4;
	Vector<ItemStack> items;
};

struct AuxDataBlockItem
{
	void* vftable;
};

struct ExtendedStreamReadResult
{
	uint64_t u1; // 1

};

struct Packet
{
	Packet() = delete;
	struct VFTable
	{
		void(*destructor)(Packet*);
		MinecraftPacketIds(*getId)(Packet*);
		void (*getName)(Packet*, String* name);
		void (*write)(Packet*, BinaryStream*);
		PacketReadResult(*read)(Packet*, BinaryStream*);
		ExtendedStreamReadResult*(*readExtended)(Packet*, ExtendedStreamReadResult*, BinaryStream*);
		bool (*unknown)(Packet*);
	};

	MinecraftPacketIds getId() noexcept;
	String getName() noexcept;

	VFTable* vftable;
	uint32_t u1; // 2
	uint32_t u2; // 1
	uint8_t serverIndex;
	void* packetEventDispatcherInstance;
	uint32_t u3;
};

struct UpdateAttributesPacket :Packet
{
	struct AttributeData
	{
		float current; // 0
		float minv; // 4
		float maxv; // 8
		float defaultv; // c
		HashedString name; // 10
	};

	ActorRuntimeID actorId;
	Vector<AttributeData> list;
};

struct LoginPacket :Packet
{
	uint32_t u5; //0x184
	ConnectionReqeust* connreq;
};

struct InventoryTransactionPacket : Packet
{
	ComplexInventoryTransaction* transaction;
};

struct CommandPacket :Packet
{
	String command;
	// CommandOriginData
};

struct ChatPacket :Packet
{
	uint8_t u5; // ?
	String name;
	String message;
};

struct ReadOnlyBinaryStreamVTable
{
	ReadOnlyBinaryStreamVTable() = delete;
	void (*destructor)() noexcept;
	bool (*read)(ReadOnlyBinaryStream* _this, void*, size_t) noexcept;
};

struct DataBuffer
{
	DataBuffer() = delete;
	void* data; // 0
	void* unknown; // 8
	size_t size; // 10
	size_t type; // 18 // (x < 10) > this + pointer

	void* getData() noexcept;
};

struct ReadOnlyBinaryStream
{
	ReadOnlyBinaryStream() = delete;
	ReadOnlyBinaryStreamVTable* vftable; // 0
	size_t pointer; // 8
	void* u1; // 10
	String data;

	kr::Text getData() noexcept;
};

struct NetworkIdentifierWithSubId
{
	NetworkIdentifierWithSubId() = delete;
};

template <typename KEY, typename VALUE>
struct Pair;

template <typename KEY, typename VALUE>
struct UMap
{
	UMap() = delete;
	enum class IteratorPointer :uintptr_t
	{
	};
	struct Iterator
	{
		Pair<KEY, VALUE>* ptr;
		uint64_t unknown2;
	};

	void* umap_data;
	Pair<KEY, VALUE>* umap_end;
};

struct ServerNetworkHandler
{
	ServerNetworkHandler() = delete;
	struct Client
	{
		Client() = delete;
	};

	void* vftable; // 0x0
	void* vtable2; // 0x8
	void* vtable3; // 0x10
	byte unknown[0x68]; // 0x18
	std::string xuid; // 0x80
	byte unknown2[0x2E8 - 0x80 - sizeof(std::string)];
	UMap<NetworkIdentifier, typename ServerNetworkHandler::Client> map; // 0x2E8

	ServerPlayer* _getServerPlayer(const NetworkIdentifier& ni, byte data = 0) noexcept;
};

using ClientMap = UMap<NetworkIdentifier, ServerNetworkHandler::Client>;

struct Certificate
{
	Certificate() = delete;
	String getXuid() const noexcept;
	String getId() const noexcept;
};

struct Dimension
{
	Dimension() = delete;
	void* vftable; // 0
	void* vftable2; // 8
	void* initialized; // 10
	String name; // 18
	ServerLevel* level; // 38
	void* offset_48; // 40
	BlockSource* blockSource; // 48
	OFFSETFIELD(DimensionId, id, 0xb0);

	class FilterLambda
	{
	private:
		Dimension* const m_this;

	public:
		FilterLambda(Dimension* _this) noexcept;
		bool operator ()(ServerPlayer* player) noexcept;
	};
	kr::FilterIterable<Vector<ServerPlayer*>, FilterLambda> players() noexcept;
};

struct ChunkPos
{
	ChunkPos() = delete;
	int x, y;
};

struct BlockLegacy
{
	BlockLegacy() = delete;
};

enum Reliability
{
};
enum Compressibility
{
};

struct Block :public BlockLegacy
{
};

// public: virtual void __cdecl Dimension::onChunkLoaded(class LevelChunk& __ptr64) __ptr64
// public: class std::shared_ptr<class LevelChunk> __cdecl ChunkSource::getAvailableChunk(class ChunkPos const& __ptr64) __ptr64

// public: class Block const& __ptr64 __cdecl BlockSource::getBlock(class BlockPos const& __ptr64)const __ptr64
// public: struct Brightness __cdecl BlockSource::getRawBrightness(class BlockPos const& __ptr64, bool, bool)const __ptr64
// public: class Biome* __ptr64 __cdecl BlockSource::tryGetBiome(class BlockPos const& __ptr64)const __ptr64
// public: class LevelChunk* __ptr64 __cdecl BlockSource::getChunk(class ChunkPos const& __ptr64)const __ptr64

// public: class BlockPos const __cdecl LevelChunk::getTopRainBlockPos(class ChunkBlockPos const& __ptr64) __ptr64
// public: class Block const& __ptr64 __cdecl LevelChunk::getExtraBlock(class ChunkBlockPos const& __ptr64)const __ptr64
// public: class BlockActor* __ptr64 __cdecl LevelChunk::getBlockEntity(class ChunkBlockPos const& __ptr64) __ptr64
// public: short __cdecl LevelChunk::getAboveTopSolidBlock(class ChunkBlockPos const& __ptr64, bool, bool, bool) __ptr64
// public: __cdecl ChunkViewSource::ChunkViewSource(class ChunkSource& __ptr64, enum ChunkSource::LoadMode) __ptr64
// public: virtual class Block const& __ptr64 __cdecl BlockLegacy::sanitizeFillBlock(class BlockSource& __ptr64, class BlockPos const& __ptr64, class Block const& __ptr64)const __ptr64
// public: class Player* __ptr64 __cdecl Dimension::findPlayer(class std::function<bool __cdecl(class Player const& __ptr64)>)const __ptr64

struct ChunkSource
{
	ChunkSource() = delete;
	void* vftable;
};

struct ChunkViewSource :ChunkSource
{
	intptr_t v;
	ServerLevel* level;
	Dimension* dimension;
	byte unknown[0x170 - sizeof(void*) * 3 - sizeof(ChunkSource)];

};

struct TickingArea
{
	TickingArea() = delete;
	// ChunkViewSource = 0xa8;
	// BlockSource = 0x218
	// TickingAreaView = 0x2d8;
};

struct BlockSource
{
	BlockSource() = delete;
	void* vftable;
	void* u1;
	ServerLevel* level;
	ChunkViewSource* chunkView;
	Dimension* dimension;
};

struct WorldGenerator
{
	WorldGenerator() = delete;
};

struct DBChunkStorage
{
	DBChunkStorage() = delete;
	intptr_t u1;
	ServerLevel* level;
	Dimension* dimension;
	WorldGenerator* generator;
	WorldGenerator* generator2;
	// pos * 0x38 // 0xe8
};

struct LevelChunk
{
	LevelChunk() = delete;
	ServerLevel* level;
	Dimension* dimension;
	int u1, u2, u3, u4, u5, u6;
	ChunkPos pos; // 8 bytes?
	intptr_t u7;
	DBChunkStorage* storage;
};

struct ConnectionReqeust
{
	ConnectionReqeust() = delete;
	void* u1;
	Certificate* cert;
};


struct ServerMetrics
{
	ServerMetrics() = delete;
};
struct ServerMetricsImpl :ServerMetrics
{
};

struct VanilaGameModuleServer
{
	void* vftable;
	VanilaServerGameplayEventListener* listener;
};

struct VanilaServerGameplayEventListener
{
	void* vftable1;
	void* vftable2;
	void* vftable3;
	void* vftable4;
};

struct Level
{
	Level() = delete;
	void* vftable; // BlockSourceListener
	void* vftable2; // IWorldRegistriesProvider
	Vector<void*> vector1;
	Vector<void*> vector2;
	Vector<void*> vector3;
	Vector<ServerPlayer*> players;

	Dimension* createDimension(DimensionId id) noexcept;
	Actor* fetchEntity(ActorUniqueID id) noexcept;
};

struct ServerLevel :Level
{
	ServerLevel() = delete;
	OFFSETFIELD(LoopbackPacketSender*, packetSender, 0x830);
	OFFSETFIELD(Vector<Actor*>, actors, 0x1590);
};

struct Minecraft
{
	struct Something
	{
		NetworkHandler* network;
		ServerLevel* level;
		ServerNetworkHandler* shandler;
	};
	void* vftable;
	ServerInstance* serverInstance;
	MinecraftEventing* minecraftEventing;
	ResourcePackManager* resourcePackManager;
	void* offset_20;
	SharedPtr<VanilaGameModuleServer> vanillaGameModuleServer;
	Whitelist* whitelist;
	String* permissionsJsonFileName;
	PrivateKeyManager* privateKeyManager;
	void* offset_50;
	void* offset_58;
	void* offset_60;
	void* offset_68;
	void* offset_70;
	ServerMetrics* serverMetrics;
	void* offset_80;
	void* offset_88;
	void* offset_90;
	void* offset_98; // 407D99D5318ABC87  000001C96691DC08  0000000000000708  
	MinecraftCommands* commands; // 000001C96694EA80  

	Something* something; // 000001C9693B6420  
	void* offset_B0;      // 000001C96691C2A0  
	void* offset_B8;      // 000001C96691C340  
	NetworkHandler* network;
	LoopbackPacketSender* LoopbackPacketSender;
	DedicatedServer* server;
	void* offset_D8; // 0000000000000000  
	SharedPtr<EntityRegistryOwned> entityRegistryOwned;
};

struct AppPlatform_win32
{
};

struct ScriptCommandOrigin
{
	struct VFTable
	{
		void (*destructor)(ScriptCommandOrigin*);
		Level* (*getLevel)(ScriptCommandOrigin*);
	};
	VFTable* vftable;
};

struct Automation
{
	struct AutomationClient;

	Automation() = delete;

};

struct AddPlatform_win32
{
	AddPlatform_win32() = delete;

	void* vftable;

};

struct DedicatedServer :ScriptCommandOrigin
{
	struct Something
	{
		Vector<void*> vector1;
		Vector<void*> vector2;
		void* u1;
		void* u2;
	};
	DedicatedServer() = delete;

	void* vtable2;
	AddPlatform_win32* platformptr;
	Minecraft* minecraft;
	Automation::AutomationClient* automationClient;
	Something* offset_28;
	void* offset_30;
	void* offset_38;
	VanillaAppConfigs* configs;
	VanillaGameModuleDedicatedServer* gameModule;
	// end expected
};

struct BlockPos
{
	uint32_t x, y, z;
};
struct Vec3
{
	float x, y, z;
};
enum class AttributeId :uint32_t
{
	ZombieSpawnReinforcementsChange = 1,
	PlayerHunger = 2,
	PlayerSaturation = 3,
	PlayerExhaustion = 4,
	PlayerLevel = 5,
	PlayerExperience = 6,
	Health = 7,
	FollowRange = 8,
	KnockbackRegistance = 9,
	MovementSpeed = 10,
	UnderwaterMovementSpeed = 11,
	AttackDamage = 12,
	Absorption = 13,
	Luck = 14,
	JumpStrength = 15, // for horse?
};
struct Attribute
{
	AttributeId id;
	uint32_t u1;
	void* u2;
	String name;
};
struct BaseAttributeMap
{
	AttributeInstance* getMutableInstance(AttributeId type) noexcept;
};
struct AttributeInstance
{
	void* vftable;
	void* u1;
	void* u2;

	OFFSETFIELD(float, currentValue, 0x84);
	OFFSETFIELD(float, minValue, 0x7C);
	OFFSETFIELD(float, maxValue, 0x80);
	OFFSETFIELD(float, defaultValue, 0x78);
};
struct CommandOrigin
{
	struct VFTable
	{
		void (*destructor)(CommandOrigin* origin);
		void(*getRequestId)(CommandOrigin* origin, String* dest);
		void(*getName)(CommandOrigin* origin, String* dest);
		BlockPos(*getBlockPosition)(CommandOrigin* origin);
		Vec3(*getWorldPosition)(CommandOrigin* origin);
		Level* (*getLevel)(CommandOrigin* origin);
		Dimension* (*getDimension)(CommandOrigin* origin);
		Actor* (*getEntity)(CommandOrigin* origin);

		OFFSETFIELD(CommandOrigin*, returnThis, 0xA0);
		//enum CommandPermissionLevel getPermissionsLevel(CommandOrigin* origin);
		//std::unique_ptr<class CommandOrigin, struct std::default_delete<class CommandOrigin> > clone(CommandOrigin* origin);
		//std::optional<class BlockPos> getCursorHitBlockPos(CommandOrigin* origin);
		//std::optional<class Vec3> getCursorHitPos(CommandOrigin* origin);
		//bool hasChatPerms(CommandOrigin* origin);
		//bool hasTellPerms(CommandOrigin* origin);
		//bool canUseAbility(CommandOrigin* origin, enum AbilitiesIndex);
		//bool isWorldBuilder(CommandOrigin* origin);
		//bool tryToPlace(CommandOrigin* origin, BlockSource*, BlockPos*, Block*, ActorBlockSyncMessage*);
		//bool isSelectorExpansionAllowed(CommandOrigin* origin);
		//const NetworkIdentifier* getSourceId(CommandOrigin* origin);
		//bool tryToPlace(CommandOrigin* origin, BlockSource*, BlockPos*, Block*, ActorBlockSyncMessage*)const;
		//returnThis(?)
		//* _purecall
		//CommandOriginData toCommandOriginData(CommandOrigin* origin, void)const __ptr64
		//void const* __ptr64 std::_Func_impl_no_alloc<<lambda_021dc86630ccd8ca1bb987a3bb3e1f2b>, std::shared_ptr<DefinitionInstanceTyped<InsomniaDefinition> > >::_Get(void)const __ptr64
		//void FloatsInLiquidDescription::serializeData(Json::Value& __ptr64)const __ptr64
		//void _setUUID(mce::UUID const& __ptr64) __ptr64
	};
	VFTable* vftable;
	mce::UUID uuid;
	ServerLevel* level;

	CommandOrigin(VFTable* vftable, ServerLevel* level) noexcept;
};

struct PlayerCommandOrigin :CommandOrigin
{
};

struct ServerCommandOrigin :CommandOrigin
{
	String guid;

	String getRequestId() noexcept;
	String getName() noexcept;
};

struct CommandContext
{
	CommandContext() = delete;

	String command;
	ServerCommandOrigin* origin;
};


struct MinecraftCommands
{
	MinecraftCommands() = delete;

	CommandOutputSender* sender;
	void* u1;
	size_t u2; //1
	Minecraft* minecraft;

	MCRESULT executeCommand(SharedPtr<CommandContext>&, bool);
};

struct BinaryStream
{
	BinaryStream() = delete;
};

struct RaknetNetworkPeer
{
	RaknetNetworkPeer() = delete;
	void* vftable;
	void* u1; // null
	void* u2; // null
	RakNet::RakPeer* peer;
	RakNet::AddressOrGUID addr;
};

struct EncryptedNetworkPeer
{
	EncryptedNetworkPeer() = delete;
	void* vftable;
	SharedPtr<RaknetNetworkPeer> peer;
};

struct CompressedNetworkPeer
{
	CompressedNetworkPeer() = delete;
	void* vftable; // 0
	byte unknown[0x40]; // 0
	EncryptedNetworkPeer* peer;
};

struct BatchedNetworkPeer
{
	BatchedNetworkPeer() = delete;
	void* vftable;
	CompressedNetworkPeer* peer;
	BinaryStream stream;
};

struct RakNetInstance
{
	void* vftable;
	NetworkHandler* handler;
	OFFSETFIELD(RakNet::RakPeer*, peer, 0x1b8);
};

struct LocalConnector;
struct RakNetServerLocator;

struct NetworkHandler
{
	struct Connection
	{
		Connection() = delete;
		NetworkIdentifier ni;
		void* u1; // null
		void* u2; // null
		void* u3; // null
		SharedPtr<EncryptedNetworkPeer> epeer;
		SharedPtr<BatchedNetworkPeer> bpeer;
		SharedPtr<BatchedNetworkPeer> bpeer2;
		uint8_t u4;
	};

	NetworkHandler() = delete;
	void* vftable; // 0x0
	void* vtable2; // 0x8
	void* vtable3; // 0x10
	RakNetInstance* instance;
	LocalConnector* local;
	RakNetServerLocator* locator;
	OFFSETFIELD(ServerNetworkHandler**, serversBegin, 0x258);
	OFFSETFIELD(BatchedNetworkPeer*, bpeer, 0xd0);

	void send(const NetworkIdentifier& ni, Packet* packet, unsigned char u) noexcept;
	Connection* getConnectionFromId(const NetworkIdentifier& ni) noexcept;
	ServerNetworkHandler** getServer(size_t serverIndex) noexcept;
	EncryptedNetworkPeer* getEncryptedPeerForUser(const NetworkIdentifier& ni) noexcept;
};


struct ChakraInterface
{
	ChakraInterface() = delete;
	void* vftable;
	void* u1;
	uint32_t scriptCounter;
};


struct ServerInstance
{
	ServerInstance() = delete;
	void* vftable;

	OFFSETFIELD(DedicatedServer*, server, 0x88);
	OFFSETFIELD(Minecraft*, minecraft, 0x90);
	OFFSETFIELD(NetworkHandler*, networkHandler, 0x98);
	OFFSETFIELD(LoopbackPacketSender*, sender, 0xa0);
	OFFSETFIELD(EducationOptions*, educationOptions, 0xc0);
	OFFSETFIELD(DBStorage*, storage, 0xc8);
	OFFSETFIELD(MinecraftServerScriptEngine*, scriptEngine, 0x1f8);

	int makeScriptId() noexcept;
	Dimension* createDimension(DimensionId id) noexcept;
	Dimension* createDimensionByName(kr::Text16 text) noexcept;
	Actor* getActorFromNetworkIdentifier(const NetworkIdentifier& ni) noexcept;
};

struct ScriptEngine
{
	ScriptEngine() = delete;
	void* vftable;
	ChakraInterface* chakra;
};

struct MinecraftServerScriptEngine :public ScriptEngine
{
};

struct Actor$VFTable
{
	OFFSETFIELD(ActorType(*)(Actor*), getEntityTypeId, 0x4f8);
	OFFSETFIELD(DimensionId* (*)(Actor*, DimensionId*), getDimensionId, 0x538);
};

struct Actor
{
	Actor() = delete;
	Actor$VFTable* vftable;
	void* offset_08; // 000001C0E59C7530
	void* offset_10; // 0000000000000010 // flags?
	void* offset_18; // 0000000000000001
	void* offset_20; // 0000000000000005
	void* offset_28; // 0000000000000000
	void* offset_30; // 0000000000000000
	void* offset_38; // 0000000000000000
	void* offset_40; // 000000000000000F
	void* offset_48; // 0000000000000000
	void* offset_50; // self or null
	void* offset_58; // 0000000000000000
	void* offset_60; // 0000000000000000  
	void* offset_68; // 0000000000000000  
	void* offset_70; // 0000000000000000  
	void* offset_78; // 0000000000000000  
	void* offset_80; // 0000000000000000  
	void* offset_88; // 0000000000000000  
	void* offset_90; // 0000000000000000  
	void* offset_98; // 0000000000000000  
	void* offset_a0; // 0000000000000000  
	void* offset_a8; // 0000000000000000  
	void* offset_b0; // 0000000000000000  
	void* offset_b8; // 0000000000000000  
	void* offset_c0; // 0000000000000001  
	ActorDefinitionGroup* group;
	void* offset_d0; // 000001C0F1004EC0  
	ActorUniqueID uniqueId;
	void* offset_e0; // 0000000000000000  
	void* offset_e8; // 0000000000000000  
	void* offset_f0; // C2B4019000000000  
	void* offset_f8; // C2B4019000000000  
	void* offset_100; // 0000000000000000  
	void* offset_108; // FFFFFFFFFFFFFFFE  
	void* offset_110; // 42440000C18673F2  
	void* offset_118; // 00000000C127FFB7  
	void* offset_120; // FFFFFF7C00000000  
	void* offset_128; // 0000400E00000000  
	void* offset_130; // 000001C0F0A56350  
	void* offset_138; // 000001C0F0A566D8  
	void* offset_140; // 000001C0F0A567B8  
	void* offset_148; // 000000000000FFFF  
	void* offset_150; // 000001C0F17AFB10  
	void* offset_158; // BDA0902E3D78D121  
	void* offset_160; // 3F8000003B852F34  
	void* offset_168; // 000000003F800000  
	void* offset_170; // 0000000000000000  
	void* offset_178; // 0000000101000101  
	Block* block;
	void* offset_188; // 0000000000000000
	void* offset_190; // 0000000000000000  
	void* offset_198; // 0000000000000000  
	void* offset_1a0; // 0000000000000000  
	void* offset_1a8; // 0000000000000000  
	void* offset_1b0; // 0000000000000000  
	void* offset_1b8; // 0000000000000000  
	void* offset_1c0; // 55EAF0E702AA4D71  
	String combined;

	OFFSETFIELD(BlockSource*, blockSource, 0x348);
	OFFSETFIELD(Dimension*, dimension, 0x350);
	OFFSETFIELD(ServerLevel*, level, 0x358);
	OFFSETFIELD(bool, loaded, 0x361); // ? guessed
	OFFSETFIELD(String, ns, 0x390); // "minecraft"
	OFFSETFIELD(String, name, 0x3b0); // "wandering_trader"
	OFFSETFIELD(String, u, 0x3d0); // ""
	OFFSETFIELD(String, className, 0x3f0); // minecraft:player<>
	OFFSETFIELD(String, identifier, 0x418); // minecraft:player
	OFFSETFIELD(BaseAttributeMap*, attributes, 0x438);
	OFFSETFIELD(ActorRuntimeID, runtimeId, 0x4f8);

	bool isServerPlayer() noexcept;
	ActorType getEntityTypeId() noexcept;
	DimensionId getDimenionId() noexcept;
	AttributeInstance* getAttribute(AttributeId id) noexcept;
};

struct Mob :public Actor
{
};

struct Skeleton :public Mob
{
};

struct Player :Actor
{
};

struct LoopbackPacketSender
{
	void* vftable;
	void* offset_8; // null
	NetworkHandler* networkHandler;
};

struct ServerPlayer :Player
{
	OFFSETFIELD(SimpleContainer, container, 0x550);
	OFFSETFIELD(NetworkIdentifier, networkIdentifier, 0xB50);
	OFFSETFIELD(LoopbackPacketSender, packetSender, 0x10d0);

	void sendNetworkPacket(Packet* packet) noexcept;
};

namespace moodvcamel
{
	struct ConcurrentQueue;
}

struct LevelChunkGarbageCollector
{
	Dimension* dimension;
	moodvcamel::ConcurrentQueue * queue;
};
