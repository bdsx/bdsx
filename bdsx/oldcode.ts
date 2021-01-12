
// TODO:
// NetworkIdentifier::getHash 사용한 해쉬맵을 만들어야함
// bdsx.bat installer fix
// download dlls on installer

// redirect x button close

// 				SetConsoleCtrlHandler([](DWORD CtrlType)->BOOL {
// 					switch (CtrlType)
// 					{
// 					case CTRL_CLOSE_EVENT:
// 					case CTRL_LOGOFF_EVENT:
// 					case CTRL_SHUTDOWN_EVENT:
// 						g_mainPump->post([] {
// 			g_mcf.stopServer();
// 							});
// 						ThreadHandle::getCurrent()->terminate();
// 						return true;
// 					}



// struct Cerificate;
// struct BlockSource;
// struct AddPlatform_win32;
// struct ServerInstance;
// struct ScriptEngine;
// struct AppPlatform_win32;
// struct EducationOptions;
// struct DBStorage;
// struct MinecraftServerScriptEngine;
// struct IMinecraftApp;
// struct ServerInstanceEventCoordinator;
// struct ActorDefinitionGroup;
// struct Block;
// struct SimpleContainer;
// struct BaseAttributeMap;
// struct ServerLevel;
// struct VanillaAppConfigs;
// struct VanillaGameModuleDedicatedServer;
// struct String;
// struct Dimension;
// struct ItemStack;
// struct AuxDataBlockItem;
// struct CommandOutput;

// enum class ActorUniqueID :uint64_t;

// template <typename KEY, typename VALUE>
// struct UMap;
// template <typename T>

// #define OFFSETFIELD(type, name, offset) using name##_t = type; name##_t &name() noexcept { return *(name##_t*)((byte*)this + offset); };

// enum class DimensionId :uint32_t
// {
// 	Undefined,
// 	Overworld,
// 	Nether,
// 	TheEnd,
// };
// enum class MinecraftPacketIds :uint32_t;

// struct CxxLinkedListData
// {
// 	struct Node
// 	{
// 		Node* next;
// 	};

// 	struct Iterator
// 	{
// 		Iterator(Node* node) noexcept;
// 		Iterator& operator ++() noexcept;
// 		bool operator ==(const Iterator& other) const noexcept;
// 		bool operator !=(const Iterator& other) const noexcept;

// 		Node* node;
// 	};

// 	Node* axis;
// 	size_t count;

// 	Iterator begin() noexcept;
// 	Iterator end() noexcept;
// };

// template <typename T>
// struct CxxLinkedList:CxxLinkedListData
// {
// public:

// };

// struct ItemStack
// {
// 	struct Info
// 	{
// 		AuxDataBlockItem* item;
// 		uint32_t v1;
// 		uint32_t v2;
// 	};

// 	void* vftable;
// 	Info* info;
// 	intptr_t offset_10;
// 	Block* block;
// 	uint32_t offset_20; // 23 : byte?
// 	float offset_24;
// 	intptr_t offset_28;
// 	float offset_30;
// 	float offset_34;
// 	byte offset_38[0xd8];
// };

// struct InventoryTransaction
// {
// 	struct NodeData
// 	{
// 		// 20:Vector<ProfilerLite::ScopedData*>
// 	};
// 	InventoryTransaction() = delete;

// 	float offset_00;
// 	CxxLinkedList<Vector<ItemStack>> itemlist;
// 	// 40 : ptr, ptr
// 	OFFSETFIELD(ItemStack*, items, 0x70);
// };

// struct ComplexInventoryTransaction
// {
// 	enum class Type:uint32_t
// 	{
// 		ItemUse=2,
// 		ItemUseOnAction=3,
// 		ItemRelease=4,
// 	};

// 	void* vftable;
// 	Type transactionType;
// 	InventoryTransaction transaction;
// };

// struct ItemReleaseInventoryTransaction : ComplexInventoryTransaction
// {
// 	OFFSETFIELD(ItemStack, item, 0x70);
// };

// struct ItemUseOnActionInventoryTransaction : ComplexInventoryTransaction
// {
// 	OFFSETFIELD(ItemStack, item, 0x78);
// };

// struct ItemUseInventoryTransaction : ComplexInventoryTransaction
// {
// 	OFFSETFIELD(ItemStack, item, 0x88);
// };

// struct ItemStackListItem
// {
// 	uint32_t offset_00;
// 	uint32_t offset_04;
// 	uint32_t offset_08;
// 	uint32_t offset_0c;
// 	ItemStack item;
// };

// struct ItemStackList
// {
// 	uint32_t v1;
// 	uint32_t v2;
// 	uint32_t v3;
// 	uint32_t v4;
// 	Vector<ItemStack> items;
// };

// struct AuxDataBlockItem
// {
// 	void* vftable;
// };

// struct UpdateAttributesPacket :Packet
// {
// 	struct AttributeData
// 	{
// 		float current; // 0
// 		float minv; // 4
// 		float maxv; // 8
// 		float defaultv; // c
// 		HashedString name; // 10
// 	};

// 	ActorRuntimeID actorId;
// 	Vector<AttributeData> list;
// };

// struct CommandPacket :Packet
// {
// 	String command;
// 	// CommandOriginData
// };

// struct ChatPacket :Packet
// {
// 	uint8_t u5; // ?
// 	String name;
// 	String message;
// };

// struct DataBuffer
// {
// 	DataBuffer() = delete;
// 	void* data; // 0
// 	void* unknown; // 8
// 	size_t size; // 10
// 	size_t type; // 18 // (x < 10) > this + pointer

// 	void* getData() noexcept;
// };

// template <typename KEY, typename VALUE>
// struct Pair;

// template <typename KEY, typename VALUE>
// struct UMap
// {
// 	UMap() = delete;
// 	enum class IteratorPointer :uintptr_t
// 	{
// 	};
// 	struct Iterator
// 	{
// 		Pair<KEY, VALUE>* ptr;
// 		uint64_t unknown2;
// 	};

// 	void* umap_data;
// 	Pair<KEY, VALUE>* umap_end;
// };

// 	void* vftable; // 0x0
// 	void* vtable2; // 0x8
// 	void* vtable3; // 0x10
// 	byte unknown[0x68]; // 0x18
// 	std::string xuid; // 0x80
// 	byte unknown2[0x2E8 - 0x80 - sizeof(std::string)];
// 	UMap<NetworkIdentifier, typename ServerNetworkHandler::Client> map; // 0x2E8

// 	ServerPlayer* _getServerPlayer(const NetworkIdentifier& ni, byte data = 0) noexcept;
// };

// using ClientMap = UMap<NetworkIdentifier, ServerNetworkHandler::Client>;

// struct Dimension
// {
// 	Dimension() = delete;
// 	void* vftable; // 0
// 	void* vftable2; // 8
// 	void* initialized; // 10
// 	String name; // 18
// 	ServerLevel* level; // 38
// 	void* offset_48; // 40
// 	BlockSource* blockSource; // 48
// 	OFFSETFIELD(DimensionId, id, 0xb0);

// 	class FilterLambda
// 	{
// 	private:
// 		Dimension* const m_this;

// 	public:
// 		FilterLambda(Dimension* _this) noexcept;
// 		bool operator ()(ServerPlayer* player) noexcept;
// 	};
// 	kr::FilterIterable<Vector<ServerPlayer*>, FilterLambda> players() noexcept;
// };

// struct ChunkPos
// {
// 	ChunkPos() = delete;
// 	int x, y;
// };

// struct BlockLegacy
// {
// 	BlockLegacy() = delete;
// };

// enum Reliability
// {
// };
// enum Compressibility
// {
// };

// struct Block :public BlockLegacy
// {
// };

// struct PacketViolationHandler
// {
// 	PacketViolationHandler() = delete;
// };

// enum PacketViolationResponse : int32_t
// {
// };

// // public: virtual void __cdecl Dimension::onChunkLoaded(class LevelChunk& __ptr64) __ptr64
// // public: class std::shared_ptr<class LevelChunk> __cdecl ChunkSource::getAvailableChunk(class ChunkPos const& __ptr64) __ptr64

// // public: class Block const& __ptr64 __cdecl BlockSource::getBlock(class BlockPos const& __ptr64)const __ptr64
// // public: struct Brightness __cdecl BlockSource::getRawBrightness(class BlockPos const& __ptr64, bool, bool)const __ptr64
// // public: class Biome* __ptr64 __cdecl BlockSource::tryGetBiome(class BlockPos const& __ptr64)const __ptr64
// // public: class LevelChunk* __ptr64 __cdecl BlockSource::getChunk(class ChunkPos const& __ptr64)const __ptr64

// // public: class BlockPos const __cdecl LevelChunk::getTopRainBlockPos(class ChunkBlockPos const& __ptr64) __ptr64
// // public: class Block const& __ptr64 __cdecl LevelChunk::getExtraBlock(class ChunkBlockPos const& __ptr64)const __ptr64
// // public: class BlockActor* __ptr64 __cdecl LevelChunk::getBlockEntity(class ChunkBlockPos const& __ptr64) __ptr64
// // public: short __cdecl LevelChunk::getAboveTopSolidBlock(class ChunkBlockPos const& __ptr64, bool, bool, bool) __ptr64
// // public: __cdecl ChunkViewSource::ChunkViewSource(class ChunkSource& __ptr64, enum ChunkSource::LoadMode) __ptr64
// // public: virtual class Block const& __ptr64 __cdecl BlockLegacy::sanitizeFillBlock(class BlockSource& __ptr64, class BlockPos const& __ptr64, class Block const& __ptr64)const __ptr64
// // public: class Player* __ptr64 __cdecl Dimension::findPlayer(class std::function<bool __cdecl(class Player const& __ptr64)>)const __ptr64

// struct ChunkSource
// {
// 	ChunkSource() = delete;
// 	void* vftable;
// };

// struct ChunkViewSource :ChunkSource
// {
// 	intptr_t v;
// 	ServerLevel* level;
// 	Dimension* dimension;
// 	byte unknown[0x170 - sizeof(void*) * 3 - sizeof(ChunkSource)];

// };

// struct TickingArea
// {
// 	TickingArea() = delete;
// 	// ChunkViewSource = 0xa8;
// 	// BlockSource = 0x218
// 	// TickingAreaView = 0x2d8;
// };

// struct BlockSource
// {
// 	BlockSource() = delete;
// 	void* vftable;
// 	void* u1;
// 	ServerLevel* level;
// 	ChunkViewSource* chunkView;
// 	Dimension* dimension;
// };

// struct WorldGenerator
// {
// 	WorldGenerator() = delete;
// };

// struct DBChunkStorage
// {
// 	DBChunkStorage() = delete;
// 	intptr_t u1;
// 	ServerLevel* level;
// 	Dimension* dimension;
// 	WorldGenerator* generator;
// 	WorldGenerator* generator2;
// 	// pos * 0x38 // 0xe8
// };

// struct LevelChunk
// {
// 	LevelChunk() = delete;
// 	ServerLevel* level;
// 	Dimension* dimension;
// 	int u1, u2, u3, u4, u5, u6;
// 	ChunkPos pos; // 8 bytes?
// 	intptr_t u7;
// 	DBChunkStorage* storage;
// };

// struct AppPlatform_win32
// {
// };

// struct Automation
// {
// 	struct AutomationClient;

// 	Automation() = delete;

// };

// struct AddPlatform_win32
// {
// 	AddPlatform_win32() = delete;

// 	void* vftable;

// };

// 	void* vtable2;
// 	AddPlatform_win32* platformptr;
// 	Minecraft* minecraft;
// 	Automation::AutomationClient* automationClient;
// 	Something* offset_28;
// 	void* offset_30;
// 	void* offset_38;
// 	VanillaAppConfigs* configs;
// 	VanillaGameModuleDedicatedServer* gameModule;
// 	// end expected
// };

// enum class AttributeId :uint32_t
// {
// 	ZombieSpawnReinforcementsChange = 1,
// 	PlayerHunger = 2,
// 	PlayerSaturation = 3,
// 	PlayerExhaustion = 4,
// 	PlayerLevel = 5,
// 	PlayerExperience = 6,
// 	Health = 7,
// 	FollowRange = 8,
// 	KnockbackRegistance = 9,
// 	MovementSpeed = 10,
// 	UnderwaterMovementSpeed = 11,
// 	AttackDamage = 12,
// 	Absorption = 13,
// 	Luck = 14,
// 	JumpStrength = 15, // for horse?
// };
// struct Attribute
// {
// 	AttributeId id;
// 	uint32_t u1;
// 	void* u2;
// 	String name;
// };
// struct LocalConnector;
// struct RakNetServerLocator;

// struct ChakraInterface
// {
// 	ChakraInterface() = delete;
// 	void* vftable;
// 	void* u1;
// 	uint32_t scriptCounter;
// };

// struct ScriptEngine
// {
// 	ScriptEngine() = delete;
// 	void* vftable;
// 	ChakraInterface* chakra;
// };

// struct MinecraftServerScriptEngine :public ScriptEngine
// {
// };

// struct Mob :public Actor
// {
// };

// struct Skeleton :public Mob
// {
// };

// namespace moodvcamel
// {
// 	struct ConcurrentQueue;
// }

// struct LevelChunkGarbageCollector
// {
// 	Dimension* dimension;
// 	moodvcamel::ConcurrentQueue * queue;
// };

// using namespace kr;


// CxxLinkedListData::Iterator::Iterator(Node* node) noexcept
// 	:node(node)
// {
// }
// CxxLinkedListData::Iterator& CxxLinkedListData::Iterator::operator ++() noexcept
// {
// 	node = node->next;
// 	return *this;
// }
// bool CxxLinkedListData::Iterator::operator ==(const Iterator& other) const noexcept
// {
// 	return node == other.node;
// }
// bool CxxLinkedListData::Iterator::operator !=(const Iterator& other) const noexcept
// {
// 	return node != other.node;
// }

// CxxLinkedListData::Iterator CxxLinkedListData::begin() noexcept
// {
// 	return axis->next;
// }
// CxxLinkedListData::Iterator CxxLinkedListData::end() noexcept
// {
// 	return axis;
// }

// //
// //kr::TText SystemAddress::toString(bool writePort, char portDelineator) noexcept
// //{
// //	kr::TText out(46_sz);
// //	g_mcf.RakNet$SystemAddress$ToString(this, writePort, out.data(), portDelineator);
// //	out.resize(strlen(out.data()));
// //	return out;
// //}
// // const SystemAddress UNASSIGNED_SYSTEM_ADDRESS;

// void* DataBuffer::getData() noexcept
// {
// 	return type < 10 ? this : data;
// }

// Dimension::FilterLambda::FilterLambda(Dimension* _this) noexcept
// 	:m_this(_this)
// {
// }
// bool Dimension::FilterLambda::operator ()(ServerPlayer* player) noexcept
// {
// 	return player->getDimenionId() == m_this->id();
// }
// kr::FilterIterable<Vector<ServerPlayer*>, Dimension::FilterLambda> Dimension::players() noexcept
// {
// 	return filterIterable(level->players, FilterLambda(this));
// }

// void executeCommand(Text command) noexcept
// {
// 	//Level * level = g_server->vftable->getLevel(g_server);
// 	//CommandContext ctx;
// 	//;
// 	//SharedPointer<CommandContext> ptr;

// 	//level->commands->executeCommand(, false);
// }
