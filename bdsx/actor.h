#pragma once

#include <KR3/js/js.h>
#include <KR3/data/map.h>

#include "reverse.h"
#include "staticpointer.h"

class NativeActor;
class JsNetworkIdentifier;

class NativeActor:public kr::JsObjectT<NativeActor, StaticPointerT<Actor>>
{
public:
	static constexpr const char16_t className[] = u"Actor";
	static constexpr bool global = false;

	NativeActor(const kr::JsArguments& args) noexcept;
	~NativeActor() noexcept;

	bool isPlayer() noexcept;
	int getDimension() noexcept;
	kr::TText16 getIdentifier() noexcept;
	int getUniqueIdLow() noexcept;
	int getUniqueIdHigh() noexcept;
	kr::TText16 getUniqueIdBin() noexcept;
	NativePointer* getRuntimeId() noexcept;
	int getTypeId() noexcept;
	void setAttribute(int attribute, float value) noexcept;
	float getAttribute(int attribute) noexcept;
	kr::JsValue getNetworkIdentifier() noexcept;
	void sendPacket(StaticPointer* packet) throws(JsException);

	static kr::JsValue fromRaw(Actor* actor) throws(JsException);
	static kr::JsValue fromPointer(StaticPointer* ptr) throws(JsException);
	static kr::JsValue fromUniqueId(int lowbits, int highbits) throws(JsException);
	static kr::JsValue fromUniqueIdBin(kr::Text16 bin) throws(JsException);
	static void initMethods(kr::JsClassT<NativeActor>* cls) noexcept;
	static void reset() noexcept;
	static void clearMethods() noexcept;

private:
	static void _removeActor(Actor* actor) noexcept;

	static kr::JsPersistent s_onActorDestroyed;
	static kr::Map<Actor*, kr::JsPersistent> s_actorMap;
};