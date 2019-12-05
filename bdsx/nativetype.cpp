#include "nativetype.h"
#include "nativepointer.h"

#include <KR3/meta/text.h>

using namespace kr;

template <typename T>
static void Primitive::newPrimitiveType(JsClassT<Primitive>* cls, Text16 name, const JsPropertyId& nameId, const JsPropertyId& sizeId) noexcept
{
	JsValue nt = JsObjectT::newInstanceRaw({});
	cls->set(name, nt);
	nt.set(sizeId, intact<int>(sizeof(T)));
	nt.set(nameId, name);
	Primitive* instance = nt.getNativeObject<Primitive>();
	instance->m_get = [](const void* src)->JsValue {
		return *(T*)src;
	};
	instance->m_set = [](void* dest, JsValue value) {
		*(T*)dest = value.cast<T>();
	};
}


Primitive::Primitive(const JsArguments& args) noexcept
	:JsObjectT(args)
{
	m_get = [](const void* src)->JsValue { accessViolation(nullptr); };
	m_set = [](void* dest, JsValue value) { accessViolation(nullptr); };
}

JsValue Primitive::get(NativePointer* src) throws(JsException)
{
	if (src == nullptr) throw JsException(u"1st argument must be NativePointer");
	void* ptr = src->getAddressRaw();
	try
	{
		return m_get(ptr);
	}
	catch (...)
	{
		accessViolation(ptr);
	}
}
void Primitive::set(NativePointer* dest, JsValue value) throws(JsException)
{
	if (dest == nullptr) throw JsException(u"1st argument must be NativePointer");
	void* ptr = dest->getAddressRaw();
	try
	{
		m_set(ptr, value);
	}
	catch (...)
	{
		accessViolation(ptr);
	}
}

void Primitive::initMethods(JsClassT<Primitive>* cls) noexcept
{
	cls->setMethod(u"set", &Primitive::set);
	cls->setMethod(u"get", &Primitive::get);
	kr::JsPropertyId sizeId = u"size";
	kr::JsPropertyId nameId = u"name";
	newPrimitiveType<uint8_t>(cls, u"Uint8", nameId, sizeId);
	newPrimitiveType<uint16_t>(cls, u"Uint16", nameId, sizeId);
	newPrimitiveType<uint32_t>(cls, u"Uint32", nameId, sizeId);
	newPrimitiveType<int8_t>(cls, u"Int8", nameId, sizeId);
	newPrimitiveType<int16_t>(cls, u"Int16", nameId, sizeId);
	newPrimitiveType<int32_t>(cls, u"Int32", nameId, sizeId);
	newPrimitiveType<float>(cls, u"Float32", nameId, sizeId);
	newPrimitiveType<double>(cls, u"Float64", nameId, sizeId);
}
