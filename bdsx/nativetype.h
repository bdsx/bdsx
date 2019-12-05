#pragma once

#include <KR3/js/js.h>
#include <KR3/data/map.h>

class NativePointer;

class Primitive:public kr::JsObjectT<Primitive>
{
public:
	static constexpr const char16_t className[] = u"Primitive";
	static constexpr bool global = false;

	Primitive(const kr::JsArguments& args) noexcept;

	kr::JsValue get(NativePointer* src) throws(kr::JsException);
	void set(NativePointer* dest, kr::JsValue value) throws(kr::JsException);

	static void initMethods(kr::JsClassT<Primitive>* cls) noexcept;

protected:
	kr::JsValue(*m_get)(const void* src);
	void (*m_set)(void* dest, kr::JsValue value);

private:
	template <typename T>
	static void newPrimitiveType(kr::JsClassT<Primitive>* cls, kr::Text16 name, const kr::JsPropertyId& nameId, const kr::JsPropertyId& sizeId) noexcept;
};
