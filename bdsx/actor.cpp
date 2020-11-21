#include "actor.h"
#include "mcf.h"
#include "native.h"
#include "networkidentifier.h"
#include "nativepointer.h"
#include "jsctx.h"

#include <KR3/mt/criticalsection.h>

using namespace kr;

#ifndef NDEBUG
static CriticalSection s_csActorMap;
#endif

JsPersistent NativeActor::s_onActorDestroyed;
Map<Actor*, JsPersistent> NativeActor::s_actorMap;
using ActorMapIterator = Map<Actor*, JsPersistent>::iterator;

static const Text attribNames[] = {
	"minecraft:zombie.spawn.reinforcements",
	"minecraft:player.hunger",
	"minecraft:player.saturation",
	"minecraft:player.exhaustion",
	"minecraft:player.level",
	"minecraft:player.experience",
	"minecraft:health",
	"minecraft:follow_range",
	"minecraft:knockback_registance",
	"minecraft:movement",
	"minecraft:underwater_movement",
	"minecraft:attack_damage",
	"minecraft:absorption",
	"minecraft:luck",
	"minecraft:horse.jump_strength",
};

NativeActor::NativeActor(const JsArguments& args) noexcept
	:JsObjectT(args)
{
}
NativeActor::~NativeActor() noexcept
{
}

bool NativeActor::isPlayer() noexcept
{
	return ptr()->isServerPlayer();
}
int NativeActor::getDimension() noexcept
{
	return (int)ptr()->getDimenionId();
}
TText16 NativeActor::getIdentifier() noexcept
{
	TText16 out;
	out << (Utf8ToUtf16)ptr()->identifier().text();
	return out;
}
int NativeActor::getUniqueIdLow() noexcept
{
	ActorUniqueID id = *ptr()->getUniqueId();
	return lodword((qword&)id);
}
int NativeActor::getUniqueIdHigh() noexcept
{
	ActorUniqueID id = *ptr()->getUniqueId();
	return hidword((qword&)id);
}
TText16 NativeActor::getUniqueIdBin() noexcept
{
	TText16 text;
	ActorUniqueID id = *ptr()->getUniqueId();
	text.writeas<ActorUniqueID>(id);
	return move(text);
}
NativePointer* NativeActor::getRuntimeId() noexcept
{
	NativePointer* p = NativePointer::newInstance();
	p->setAddressRaw((void*)ptr()->runtimeId());
	return p;
}
int NativeActor::getTypeId() noexcept
{
	return (int)ptr()->getEntityTypeId();
}
void NativeActor::setAttribute(int attribute, float value) noexcept
{
	if (attribute < 1) return;
	if ((uint)attribute > countof(attribNames)) return;

	Actor* actor = ptr();
	AttributeInstance* attr = actor->getAttribute((AttributeId)attribute);

	SharedPtr<Packet> packetc = Dirty;
	g_mcf.MinecraftPackets$createPacket(&packetc, MinecraftPacketIds::UpdateAttributes);
	UpdateAttributesPacket* packet = (UpdateAttributesPacket*)packetc.pointer();
	packet->actorId = actor->runtimeId();

	UpdateAttributesPacket::AttributeData* data = packet->list.prepare();
	data->name = attribNames[attribute - 1];
	data->current = attr->currentValue() = value;
	data->minv = attr->minValue();
	data->maxv = attr->maxValue();
	data->defaultv = attr->defaultValue();

	if (actor->isServerPlayer())
	{
		static_cast<ServerPlayer*>(actor)->sendNetworkPacket(packet);
	}
}
float NativeActor::getAttribute(int attribute) noexcept
{
	if (attribute < 1) return 0;
	if ((uint)attribute > countof(attribNames)) return 0;
	AttributeInstance* attr = ptr()->getAttribute((AttributeId)attribute);
	if (!attr) return 0;
	return attr->currentValue();
}
kr::JsValue NativeActor::getNetworkIdentifier() noexcept
{
	Actor* actor = ptr();
	if (!actor->isServerPlayer()) return nullptr;
	auto& ni = static_cast<ServerPlayer*>(actor)->networkIdentifier();
	return JsNetworkIdentifier::fromRaw(ni);
}
void NativeActor::sendPacket(StaticPointer* packet) throws(JsException)
{
	Actor* actor = ptr();
	if (!actor->isServerPlayer()) throw JsException(u"sendPacket: is not Player");
	void* addr = packet->getAddressRaw();
	try
	{
		static_cast<ServerPlayer*>(actor)->sendNetworkPacket((Packet*)addr);
	}
	catch (...)
	{
		accessViolation(addr);
	}
}

kr::JsValue NativeActor::fromRaw(Actor* actor) throws(JsException)
{
	if (actor == nullptr) return nullptr;

#ifndef NDEBUG
	CsLock _lock = s_csActorMap;
#endif
	auto res = s_actorMap.insert({ actor, nullptr });
	if (!res.second) return res.first->second;

	JsValue jsactor = NativeActor::newInstanceRaw({});
	res.first->second = jsactor;
	JsPersistent test = jsactor;
	jsactor.getNativeObject<NativeActor>()->ptr() = actor;
	return jsactor;
}
kr::JsValue NativeActor::fromPointer(StaticPointer* ptr) throws(JsException)
{
	if (ptr == nullptr) throw JsException(u"1st argument must be *Pointer");
	Actor* actor = (Actor*)ptr->getAddressRaw();
	return fromRaw(actor);
}
JsValue NativeActor::fromUniqueId(int lowbits, int highbits) throws(JsException)
{
	return fromRaw(g_server->minecraft()->something->level->fetchEntity((ActorUniqueID)makeqword(lowbits, highbits)));
}
JsValue NativeActor::fromUniqueIdBin(Text16 bin) throws(JsException)
{
	ActorUniqueID id = bin.readas<ActorUniqueID>();
	return fromRaw(g_server->minecraft()->something->level->fetchEntity(id));
}
void NativeActor::initMethods(JsClassT<NativeActor>* cls) noexcept
{
	cls->setMethod(u"isPlayer", &NativeActor::isPlayer);
	cls->setMethod(u"getNetworkIdentifier", &NativeActor::getNetworkIdentifier);
	cls->setMethod(u"getIdentifier", &NativeActor::getIdentifier);
	cls->setMethod(u"sendPacket", &NativeActor::sendPacket);
	cls->setMethod(u"getTypeId", &NativeActor::getTypeId);
	cls->setMethod(u"getUniqueIdLow", &NativeActor::getUniqueIdLow);
	cls->setMethod(u"getUniqueIdHigh", &NativeActor::getUniqueIdHigh);
	cls->setMethod(u"getRuntimeId", &NativeActor::getRuntimeId);
	cls->setMethod(u"getDimension", &NativeActor::getDimension);
	cls->setMethod(u"setAttribute", &NativeActor::setAttribute);
	cls->setMethod(u"getAttribute", &NativeActor::getAttribute);
	cls->setStaticMethod(u"setOnDestroy", [](JsValue listener) {
		storeListener(&s_onActorDestroyed, listener);
		});
	cls->setStaticMethod(u"fromPointer", &NativeActor::fromPointer);
	cls->setStaticMethod(u"fromUniqueId", &NativeActor::fromUniqueId);

	{
		McftRenamer renamer;

		// hookOnActorRelease
		MCF_HOOK(Level$removeEntityReferences,
			{ 0x48, 0x8B, 0xC4, 0x55, 0x57, 0x41, 0x54, 0x41, 0x56, 0x41, 0x57, 0x48, 0x8D, 0x68, 0xA1 }
		)(Level * level, Actor * actor, bool b) {
			_assert((intptr_t)actor > 0);
			_removeActor(actor);
		};

		// hookOnActorDestructor
		MCF_HOOK(Actor$dtor$Actor,
			{ 0x40, 0x57, 0x48, 0x83, 0xEC, 0x30, 0x48, 0xC7, 0x44, 0x24, 0x20, 0xFE, 0xFF, 0xFF, 0xFF }
		)(Actor* actor) {
			_assert((intptr_t)actor > 0);
			if (!isContextThread())
			{
#ifndef NDEBUG
				CsLock _lock = s_csActorMap;
				_assert(!s_actorMap.has(actor));
#endif
				return;
			}
			_removeActor(actor);
		};
	}
}
void NativeActor::reset() noexcept
{
	s_onActorDestroyed = JsPersistent();
#ifndef NDEBUG
	CsLock _lock = s_csActorMap;
#endif
	s_actorMap.clear();
}
void NativeActor::clearMethods() noexcept
{
	reset();
}

void NativeActor::_removeActor(Actor* actor) noexcept
{
#ifndef NDEBUG
	CsLock _lock = s_csActorMap;
#endif
	auto iter = s_actorMap.find(actor);
	if (iter == s_actorMap.end()) return;
	JsScope _scope;
	NativeActor* jsactor = JsValue(iter->second).getNativeObject<NativeActor>();
	s_actorMap.erase(iter);
	delete jsactor;
}
