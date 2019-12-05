#pragma once

#include <KR3/js/js.h>
#include <KR3/data/map.h>
#include "reverse.h"

class StaticPointer;
class NativeActor;

class JsNetworkIdentifier:public kr::JsObjectT<JsNetworkIdentifier>
{
public:
	static constexpr const char16_t className[] = u"NetworkIdentifier";
	static constexpr bool global = false;

	NetworkIdentifier identifier;

	JsNetworkIdentifier(const kr::JsArguments& args) noexcept;
	kr::JsValue getAddress() noexcept;
	kr::JsValue getActor() noexcept;
	void assignTo(StaticPointer* ptr) throws(JsException);
	
	static void initMethods(kr::JsClassT<JsNetworkIdentifier>* cls) noexcept;
	static void clearMethods() noexcept;
	static void reset() noexcept;

	static kr::JsValue fromRaw(const NetworkIdentifier& ni) noexcept;
	static kr::JsValue fromPointer(StaticPointer* ptr) throws(kr::JsException);
	static void dispose(const NetworkIdentifier& ni) noexcept;

private:
	static kr::Map<NetworkIdentifier, kr::JsPersistent> s_networkIdentifiers;
};
