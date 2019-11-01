#pragma once

#include <KR3/main.h>
#include <chrono>

#include <KR3/wl/windows.h>
#include <WinSock2.h>

struct ReadOnlyBinaryStream;
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


#define OFFSETFIELD(type, name, offset) type &name() noexcept { return *(type*)((byte*)this + offset); };

template <typename KEY, typename VALUE>
struct UMap;


enum PacketReadResult
{
	PacketReadNoError,
	PacketReadError
};

enum MinecraftPacketIds:uint32_t
{
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

	const char* data() noexcept;
	kr::Text text() noexcept;
	void deallocate() noexcept;
};

struct Packet
{
	Packet() = delete;
	void* vtable;
	uint32_t u1; // 2
	uint32_t u2; // 1
	uint8_t data;

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
	ReadOnlyBinaryStreamVTable* vtable; // 0
	size_t pointer; // 8
	void* u1; // 10
	void* u2; // 18
	void* u3; // 20
	void* u4; // 28
	DataBuffer* data; // 30

	kr::Text getData() noexcept;
};

struct NetworkIdentifier
{
	NetworkIdentifier() = delete;
	uint64_t value;

	kr::TText16 toString() const noexcept;
};

template <typename KEY, typename VALUE>
struct Pair;

template <typename KEY, typename VALUE>
struct UMap
{
	UMap() = delete;
	enum class IteratorPointer:uintptr_t
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

	void* vtable; // 0x0
	void* vtable2; // 0x8
	void* vtable3; // 0x10
	byte unknown[0x68]; // 0x18
	std::string xuid; // 0x80
	byte unknown2[0x2E8 - 0x80 - sizeof(std::string)];
	UMap<NetworkIdentifier, typename ServerNetworkHandler::Client> map; // 0x2E8

	ServerPlayer * _getServerPlayer(NetworkIdentifier& ni, byte data) noexcept;
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
};

struct ServerLevel
{
	ServerLevel() = delete;
};

struct ChunkPos
{
	ChunkPos() = delete;
	int x, y;
};

struct ServerPlayer
{
	ServerPlayer() = delete;
	byte unknown[0xcf8];
	BlockSource* blockSource;
	Dimension* dimension;
	ServerLevel* level;
};

struct BlockLegacy
{
	BlockLegacy() = delete;
};

struct Block:public BlockLegacy
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
	void* vtable;
};

struct ChunkViewSource:ChunkSource
{
	intptr_t v;
	ServerLevel* level;
	Dimension* dimension;
	byte unknown[0x170 - sizeof(void*)*3 - sizeof(ChunkSource)];

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
	void* vtable;
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

struct LoginPacket:Packet
{
	void* u3; // 18
	void* u4; // 20
	ConnectionReqeust* connreq; // 28
};

struct MinecraftEventing;
struct ResourcePackManager;
struct VanilaGameModuleServer;
struct Whitelist;
struct PrivateKeyManager;
struct ServerMetrics
{
	ServerMetrics() = delete;
};
struct ServerMetricsImpl :ServerMetrics
{
};

struct Minecraft
{
	Minecraft() = delete;
	void* vtable;
	ServerInstance* serverInstance;
	MinecraftEventing* minecraftEventing;
	ResourcePackManager* resourcePackManager;
	void* u1;
	VanilaGameModuleServer* vanillaGameModuleServer;
	void* gameModuleServerRefCount;
	Whitelist* whitelist;
	String* permissionsJsonFileName;
	PrivateKeyManager* privateKeyManager;
	void* u2;
	void* u3;
	void* u4;
	void* u5;
	void* u6;
	ServerMetrics* serverMetrics;
	void* u7;
	void* u8;
	void* u9;
	void* u10; // 407D99D5318ABC87  000001C96691DC08  0000000000000708  
	void* u11; // 000001C96694EA80  
	void* u12; // 000001C9693B6420  
	void* u13; // 000001C96691C2A0  
	void* u14; // 000001C96691C340  
	NetworkHandler* network;
	LoopbackPacketSender* LoopbackPacketSender;
	DedicatedServer* server;
	void* u15; // 0000000000000000  
	void* u16; // 000001C96691DCA0  
	void* u17; // 000001C96691DC90  .&const std::_Ref_count_obj<class EntityRegistryOwned>::`vftable'; 

};

struct VanillaAppConfigs;
struct VanillaGameModuleDedicatedServer;

struct AppPlatform_win32
{
};

struct DedicatedServer
{
	DedicatedServer() = delete;
	void* vtable;
	void* vtable2;
	AddPlatform_win32 * platform;
	Minecraft* minecraft;
	void* automationClient;
	void* u1;
	void* u2;
	void* u3;
	VanillaAppConfigs * configs;
	VanillaGameModuleDedicatedServer * module;
};

struct SystemAddress
{
	union// In6OrIn4
	{
#if RAKNET_SUPPORT_IPV6==1
		struct sockaddr_storage sa_stor;
		sockaddr_in6 addr6;
#endif

		sockaddr_in addr4;
	} address;

	kr::TText toString(bool writePort = true, char portDelineator = ':') noexcept;
};

struct RakPeer
{
	RakPeer() = delete;
	void* vtable;

	kr::TmpArray<SystemAddress> getConnections() noexcept;
};

struct BinaryStream
{
	BinaryStream() = delete;
};

struct RaknetNetworkPeer
{
	RaknetNetworkPeer() = delete;
	void* vtable;
	RakPeer* peer;
};

struct EncryptedNetworkPeer
{
	EncryptedNetworkPeer() = delete;
	void* vtable;
	RaknetNetworkPeer* peer;
};

struct CompressedNetworkPeer
{
	CompressedNetworkPeer() = delete;
	void* vtable; // 0
	byte unknown[0x40]; // 0
	EncryptedNetworkPeer* peer;
};

struct BatchedNetworkPeer
{
	BatchedNetworkPeer() = delete;
	void* vtable;
	CompressedNetworkPeer* peer;
	BinaryStream stream;
};

struct Connection
{
	Connection() = delete;
	byte unknown[0xb0];
	EncryptedNetworkPeer* epeer;
	CompressedNetworkPeer* cpeer;
	BatchedNetworkPeer* bpeer;
	BatchedNetworkPeer* bpeer2;
	byte u1;
};

struct NetworkHandler
{
	NetworkHandler() = delete;
	void* vtable; // 0x0
	void* vtable2; // 0x8
	void* vtable3; // 0x10
	byte unknown[0x1f0]; // 18
	ServerNetworkHandler** servers[1]; // 0x208

	Connection * getConnectionFromId(const NetworkIdentifier& ni) noexcept;
	ServerNetworkHandler ** getServer(uint32_t packetId) noexcept;
	EncryptedNetworkPeer * getEncryptedPeerForUser(const NetworkIdentifier& ni) noexcept;
};


struct ChakraInterface
{
	ChakraInterface() = delete;
	void* vtable;
	void* u1;
	uint32_t scriptCounter;
};


struct ServerInstance
{
	ServerInstance() = delete;
	void* vtable;
	AppPlatform_win32* platform;
	void* vtable2;
	DedicatedServer* server;
	Minecraft* minecraft;
	NetworkHandler* networkHandler;
	LoopbackPacketSender * sender;
	void* u1;
	void* u2;
	void* u3;
	EducationOptions* educationOptions;
	DBStorage* storage;
	void* us[37];
	MinecraftServerScriptEngine* scriptEngine;
	void* us2[10];
};

struct ScriptEngine
{
	ScriptEngine() = delete;
	void* vtable;
	ChakraInterface* chakra;
};

struct MinecraftServerScriptEngine:public ScriptEngine
{
};

extern DedicatedServer* g_server;
extern ServerInstance* g_serverInstance;
