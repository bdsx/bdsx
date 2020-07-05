#include "reverse.h"
#include "mcf.h"

#include <KR3/data/map.h>

using namespace kr;


CxxLinkedListData::Iterator::Iterator(Node* node) noexcept
	:node(node)
{
}
CxxLinkedListData::Iterator& CxxLinkedListData::Iterator::operator ++() noexcept
{
	node = node->next;
	return *this;
}
bool CxxLinkedListData::Iterator::operator ==(const Iterator& other) const noexcept
{
	return node == other.node;
}
bool CxxLinkedListData::Iterator::operator !=(const Iterator& other) const noexcept
{
	return node != other.node;
}

CxxLinkedListData::Iterator CxxLinkedListData::begin() noexcept
{
	return axis->next;
}
CxxLinkedListData::Iterator CxxLinkedListData::end() noexcept
{
	return axis;
}

mce::UUID mce::UUID::generate() noexcept
{
	UUID out;
	g_mcf.Crypto$Random$generateUUID(&out);
	return out;
}
//
//kr::TText SystemAddress::toString(bool writePort, char portDelineator) noexcept
//{
//	kr::TText out(46_sz);
//	g_mcf.RakNet$SystemAddress$ToString(this, writePort, out.data(), portDelineator);
//	out.resize(strlen(out.data()));
//	return out;
//}
// const SystemAddress UNASSIGNED_SYSTEM_ADDRESS;

bool NetworkIdentifier::operator ==(const NetworkIdentifier& ni) const noexcept
{
	return g_mcf.NetworkIdentifier$$_equals_(this, &ni);
}
bool NetworkIdentifier::operator !=(const NetworkIdentifier& ni) const noexcept
{
	return !g_mcf.NetworkIdentifier$$_equals_(this, &ni);
}
size_t NetworkIdentifier::getHash() const noexcept
{
	return g_mcf.NetworkIdentifier$getHash(this);
}
Text NetworkIdentifier::getAddress() const noexcept
{
	RakNet::SystemIndex idx = address.GetSystemIndex();
	RakNet::RakPeer* rakpeer = g_server->networkHandler()->instance->peer();
	RakNet::SystemAddress addr = rakpeer->GetSystemAddressFromIndex(idx);
	return (Text)addr.ToString();
}
size_t std::hash<NetworkIdentifier>::operator ()(const NetworkIdentifier& ni) const noexcept
{
	return ni.getHash();
}

VectorData::VectorData() noexcept
{
	m_begin = nullptr;
	m_end = nullptr;
	m_cap = nullptr;
}
VectorData::VectorData(Dirty_t) noexcept
{
}
VectorData::~VectorData() noexcept
{
	g_mcf.free(m_begin);
	// operator delete(begin);
}
void* VectorData::_alloc(size_t bytesize) noexcept
{
	return g_mcf.std$_Allocate$_alloc16_(bytesize);
}

String::String() noexcept
{
	pointer = 0;
	u1 = 0;
	size = 0;
	capacity = 15;
}
String::String(Dirty_t) noexcept
{
}
String::String(String&& _move) noexcept
{
	pointer = _move.pointer;
	u1 = _move.u1;
	size = _move.size;
	capacity = _move.capacity;

	_move.pointer = 0;
	_move.u1 = 0;
	_move.size = 0;
	_move.capacity = 15;
}
String::~String() noexcept
{
	g_mcf.std$string$_Tidy_deallocate(this);
}
char* String::data() noexcept
{
	return capacity >= 16 ? pointer : buffer;
}
kr::Text String::text() noexcept
{
	char* d = data();
	return kr::Text(d, size);
}
String* String::assign(const char* str, size_t size) noexcept
{
	return g_mcf.std$string$assign(this, str, size);
}
String* String::append(const char* str, size_t size) noexcept
{
	return g_mcf.std$string$append(this, str, size);
}
void String::resize(size_t size, char init) noexcept
{
	std::string a;
	return g_mcf.std$string$resize(this, size, init);
}

HashedString::HashedString() noexcept
{
	hash = 0;
}
HashedString::HashedString(Text text) noexcept
{
	str.assign(text.data(), text.size());
	hash = getHash(text);
}
HashedString& HashedString::operator = (kr::Text text) noexcept
{
	str.assign(text.data(), text.size());
	hash = getHash(text);
	return *this;
}
size_t HashedString::getHash(kr::Text text) noexcept
{
	if (text.empty()) return 0;
	intptr_t hash = 0xCBF29CE484222325;
	for (char chr : text)
	{
		if (chr == '\0') break;
		hash = (hash * 0x100000001B3) ^ chr;
	}
	return hash;
}

void* DataBuffer::getData() noexcept
{
	return type < 10 ? this : data;
}

Text ReadOnlyBinaryStream::getData() noexcept
{
	return Text(data.data(), data.size);
}

String Certificate::getXuid() const noexcept
{
	String out = Dirty;
	g_mcf.ExtendedCertificate$getXuid(&out, *this);
	return out;
}
String Certificate::getId() const noexcept
{
	String out = Dirty;
	g_mcf.ExtendedCertificate$getIdentityName(&out, *this);
	return out;
}

Dimension::FilterLambda::FilterLambda(Dimension* _this) noexcept
	:m_this(_this)
{
}
bool Dimension::FilterLambda::operator ()(ServerPlayer* player) noexcept
{
	return player->getDimenionId() == m_this->id() && player->loaded();
}
kr::FilterIterable<Vector<ServerPlayer*>, Dimension::FilterLambda> Dimension::players() noexcept
{
	return filterIterable(level->players, FilterLambda(this));
}

ServerPlayer* ServerNetworkHandler::_getServerPlayer(const NetworkIdentifier& ni, byte data) noexcept
{
	return g_mcf.ServerNetworkHandler$_getServerPlayer(this, ni, data);
}

ServerNetworkHandler** NetworkHandler::getServer(size_t serverIndex) noexcept
{
	return (&serversBegin())[serverIndex];
}
void NetworkHandler::send(const NetworkIdentifier& ni, Packet* packet, unsigned char u) noexcept
{
	return g_mcf.NetworkHandler$send(this, &ni, packet, u);
}
NetworkHandler::Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni) noexcept
{
	return g_mcf.NetworkHandler$_getConnectionFromId(this, ni);
}
EncryptedNetworkPeer * NetworkHandler::getEncryptedPeerForUser(const NetworkIdentifier& ni) noexcept
{
	return g_mcf.NetworkHandler$getEncryptedPeerForUser(this, ni);
}

AttributeInstance* BaseAttributeMap::getMutableInstance(AttributeId type) noexcept
{
	return g_mcf.BaseAttributeMap$getMutableInstance(this, (uint32_t)type);
}

CommandOrigin::CommandOrigin(VFTable* vftable, ServerLevel* level) noexcept
	:vftable(vftable), level(level)
{
	g_mcf.Crypto$Random$generateUUID(&uuid);
}

String ServerCommandOrigin::getRequestId() noexcept
{
	String out = Dirty;
	vftable->getRequestId(this, &out);
	return out;
}
String ServerCommandOrigin::getName() noexcept
{
	String out = Dirty;
	vftable->getName(this, &out);
	return out;
}

Dimension* Level::createDimension(DimensionId id) noexcept
{
	return g_mcf.Level$createDimension(this, id);
}

Actor* Level::fetchEntity(ActorUniqueID id) noexcept
{
	// 3rd bool: return null if not loaded?
	return g_mcf.Level$fetchEntity(this, id, true);
}

MCRESULT MinecraftCommands::executeCommand(SharedPtr<CommandContext>&ctx, bool b)
{
	MCRESULT out;
	g_mcf.MinecraftCommands$executeCommand(this, &out, ctx, b);
	return out;
}

MinecraftPacketIds Packet::getId() noexcept
{
	return vftable->getId(this);
}
String Packet::getName() noexcept
{
	String name = Dirty;
	vftable->getName(this, &name);
	return name;
}

void SharedPtrData::RefCounter::addRef() noexcept
{
	InterlockedIncrement(&useRef);
	InterlockedIncrement(&weakRef);
}
void SharedPtrData::RefCounter::release() noexcept
{
	if (InterlockedDecrement(&useRef) == 0)
	{
		vftable->_Destroy(this);
	}
	if (InterlockedDecrement(&weakRef) == 0)
	{
		vftable->_Delete_This(this);
	}
}
SharedPtrData::SharedPtrData() noexcept
{
	pointer = nullptr;
	ref = nullptr;
}
SharedPtrData::SharedPtrData(Dirty_t) noexcept
{
}
SharedPtrData::SharedPtrData(const SharedPtrData& value) noexcept
{
	pointer = value.pointer;
	ref = value.ref;
	if (ref) ref->addRef();
}
SharedPtrData::SharedPtrData(SharedPtrData&& value) noexcept
{
	pointer = value.pointer;
	ref = value.ref;
	value.ref = nullptr;
}
SharedPtrData::~SharedPtrData() noexcept
{
	if (ref) ref->release();
}
SharedPtrData& SharedPtrData::operator =(const SharedPtrData& value) noexcept
{
	this->~SharedPtrData();
	new(this) SharedPtrData(value);
	return *this;
}
SharedPtrData& SharedPtrData::operator =(SharedPtrData&& value) noexcept
{
	this->~SharedPtrData();
	new(this) SharedPtrData(move(value));
	return *this;
}
bool SharedPtrData::exists() const noexcept
{
	return ref != nullptr;
}
void SharedPtrData::addRef() const noexcept
{
	ref->addRef();
}
void SharedPtrData::discard() noexcept
{
	if (ref)
	{
		ref->release();
		ref = nullptr;
	}
	pointer = nullptr;
}

int ServerInstance::makeScriptId() noexcept
{
#ifndef NDEBUG
	static bool first = false;
	if (!first)
	{
		first = true;
		_assert(scriptEngine()->chakra->scriptCounter == 0);
	}
#endif
	return ++(scriptEngine()->chakra->scriptCounter);
}
Dimension* ServerInstance::createDimension(DimensionId id) noexcept
{
	return minecraft()->something->level->createDimension(id);
}
Dimension* ServerInstance::createDimensionByName(Text16 text) noexcept
{
	static const Map<Text16, DimensionId, true> names = {
		{u"Overworld", DimensionId::Overworld},
		{u"Nether", DimensionId::Nether},
		{u"TheEnd", DimensionId::TheEnd},
	};
	auto iter = names.find(text);
	if (iter == names.end()) return nullptr;
	return createDimension(iter->second);
}
Actor* ServerInstance::getActorFromNetworkIdentifier(const NetworkIdentifier& ni) noexcept
{
	return minecraft()->something->shandler->_getServerPlayer(ni);
}

bool Actor::isServerPlayer() noexcept
{
	return vftable == g_mcf.ServerPlayer$$_vftable_;
}
ActorType Actor::getEntityTypeId() noexcept
{
	return vftable->getEntityTypeId()(this);
}
DimensionId Actor::getDimenionId() noexcept
{
	DimensionId id;
	return *vftable->getDimensionId()(this, &id);
}
AttributeInstance* Actor::getAttribute(AttributeId id) noexcept
{
	return attributes()->getMutableInstance(id);
}

void ServerPlayer::sendNetworkPacket(Packet* packet) noexcept
{
	g_mcf.ServerPlayer$sendNetworkPacket(this, packet);
}

void executeCommand(Text command) noexcept
{
	//Level * level = g_server->vftable->getLevel(g_server);
	//CommandContext ctx;
	//;
	//SharedPointer<CommandContext> ptr;

	//level->commands->executeCommand(, false);
}
