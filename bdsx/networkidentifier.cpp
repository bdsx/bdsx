#include "networkidentifier.h"
#include "actor.h"
#include "mcf.h"

using namespace kr;

Map<NetworkIdentifier, JsPersistent> JsNetworkIdentifier::s_networkIdentifiers;

JsNetworkIdentifier::JsNetworkIdentifier(const JsArguments& args) noexcept
	:JsObjectT(args)
{
}
JsValue JsNetworkIdentifier::getAddress() noexcept
{
	Connection* conn = g_server->networkHandler->getConnectionFromId(identifier);
	if (conn == nullptr) return JsNewArray(0);
	EncryptedNetworkPeer* epeer = conn->epeer;
	if (epeer == nullptr) return JsNewArray(0);
	RaknetNetworkPeer* netpeer = epeer->peer;
	if (netpeer == nullptr) return JsNewArray(0);
	RakPeer* rakpeer = netpeer->peer;
	if (rakpeer == nullptr) return JsNewArray(0);
	TmpArray<SystemAddress> arr = rakpeer->getConnections();
	JsValue out = JsNewArray(arr.size());
	int idx = 0;
	for (SystemAddress& addr : arr)
	{
		out.set(idx++, addr.toString());
	}
	return out;
}
kr::JsValue JsNetworkIdentifier::getActor() noexcept
{
	Actor* p = g_server->getActorFromNetworkIdentifier(identifier);
	if (p == nullptr) return nullptr;
	return NativeActor::fromRaw(p);
}
void JsNetworkIdentifier::assignTo(StaticPointer* ptr) throws(JsException)
{
	if (ptr == nullptr) throw JsException(u"1st argument must be *Pointer");
	NetworkIdentifier* p = (NetworkIdentifier*)ptr->getAddressRaw();
	try
	{
		*p = identifier;
	}
	catch (...)
	{
		accessViolation(p);
	}
}

JsValue JsNetworkIdentifier::fromRaw(const NetworkIdentifier& ni) noexcept
{
	auto res = s_networkIdentifiers.insert({ ni, JsPersistent() });
	if (!res.second) return res.first->second;

	JsValue jsni = JsNetworkIdentifier::newInstanceRaw({});
	jsni.getNativeObject<JsNetworkIdentifier>()->identifier = ni;
	res.first->second = jsni;
	return jsni;
}
JsValue JsNetworkIdentifier::fromPointer(StaticPointer* ptr) throws(JsException)
{
	if (ptr == nullptr) throw JsException(u"1st argument must be *Pointer");
	NetworkIdentifier* ni = (NetworkIdentifier*)ptr->getAddressRaw();
	return fromRaw(*ni);
}
void JsNetworkIdentifier::dispose(const NetworkIdentifier& ni) noexcept
{
	s_networkIdentifiers.erase(ni);
}
void JsNetworkIdentifier::initMethods(JsClassT<JsNetworkIdentifier>* cls) noexcept
{
	cls->setMethod(u"getAddress", &JsNetworkIdentifier::getAddress);
	cls->setMethod(u"getActor", &JsNetworkIdentifier::getActor);
	cls->setMethod(u"assignTo", &JsNetworkIdentifier::assignTo);
	cls->setStaticMethod(u"fromPointer", &JsNetworkIdentifier::fromPointer);
}
void JsNetworkIdentifier::clearMethods() noexcept
{
	reset();
}
void JsNetworkIdentifier::reset() noexcept
{
	s_networkIdentifiers.clear();
}
