#include "reverse.h"
#include "funchook.h"

#include <KR3/wl/windows.h>

using namespace kr;

DedicatedServer* g_server;
ServerInstance* g_serverInstance;

void* DataBuffer::getData() noexcept
{
	return type < 10 ? this : data;
}

Text ReadOnlyBinaryStream::getData() noexcept
{
	void* p = data->getData();
	return Text((char*)p + pointer, (char*)p + data->size);
}

String Certificate::getXuid() const noexcept
{
	String out;
	g_mcf.ExtendedCertificate$getXuid(&out, *this);
	return out;
}
String Certificate::getId() const noexcept
{
	String out;
	g_mcf.ExtendedCertificate$getIdentityName(&out, *this);
	return out;
}

ServerPlayer* ServerNetworkHandler::_getServerPlayer(NetworkIdentifier& ni, byte data) noexcept
{
	return g_mcf.ServerNetworkHandler$_getServerPlayer(this, ni, data);
}

TText16 NetworkIdentifier::toString() const noexcept
{
	TText16 out(0_sz, sizeof(value));
	byte* p = (byte*)&value;
	byte* p_end = p + sizeof(value);
	do
	{
		out.push(*p++);
	} while (p != p_end);
	return out;
}

ServerNetworkHandler** NetworkHandler::getServer(uint32_t packetId) noexcept
{
	uint32_t serverIdx = (packetId >> 10) & 3;
	return servers[serverIdx];
}
Connection* NetworkHandler::getConnectionFromId(const NetworkIdentifier& ni) noexcept
{
	return g_mcf.NetworkHandler$_getConnectionFromId(this, ni);
}
EncryptedNetworkPeer * NetworkHandler::getEncryptedPeerForUser(const NetworkIdentifier& ni) noexcept
{
	return g_mcf.NetworkHandler$getEncryptedPeerForUser(this, ni);
}
TText SystemAddress::toString(bool writePort, char portDelineator) noexcept
{
	TText out(46_sz);
	g_mcf.RakNet$SystemAddress$ToString(this, writePort, out.data(), portDelineator);
	out.resize(strlen(out.data()));
	return out;
}
TmpArray<SystemAddress> RakPeer::getConnections() noexcept
{
	TmpArray<SystemAddress> list;
	uint16_t size;
	g_mcf.RakNet$RakPeer$GetConnectionList(this, nullptr, &size);
	if (size == 0) return list;
	list.resize(size);
	g_mcf.RakNet$RakPeer$GetConnectionList(this, list.data(), &size);
	return list;
}

const char* String::data() noexcept
{
	return capacity >= 16 ? pointer : buffer;
}
Text String::text() noexcept
{
	const char * d = data();
	return Text(d, size);
}
void String::construct() noexcept
{
	return g_mcf.std$string$string(this);
}
void String::destruct() noexcept
{
	return g_mcf.std$string$_Tidy_deallocate(this);
}
String* String::assign(const char* str, size_t size) noexcept
{
	return g_mcf.std$string$assign(this, str, size);
}
String* String::append(const char* str, size_t size) noexcept
{
	return g_mcf.std$string$assign(this, str, size);
}