#include "nativepointer.h"

using namespace kr;


NativePointer::NativePointer(const JsArguments& args) noexcept
	:JsObjectT<NativePointer>(args)
{
}

void NativePointer::setAddress(int32_t lowBits, int32_t highBits) noexcept
{
	m_address = (uint8_t*)(uintptr_t)(((uintptr_t)highBits << 32) | (lowBits));
}
void NativePointer::setAddressRaw(void* ptr) noexcept
{
	m_address = (uint8_t*)ptr;
}
void NativePointer::initMethods(JsClassT<NativePointer>* cls) noexcept
{
	cls->setMethod(u"setAddress", &NativePointer::setAddress);
	cls->setMethod(u"readUint8", &NativePointer::readUint8);
	cls->setMethod(u"readUint16", &NativePointer::readUint16);
	cls->setMethod(u"readUint32", &NativePointer::readUint32);
	cls->setMethod(u"readInt8", &NativePointer::readInt8);
	cls->setMethod(u"readInt16", &NativePointer::readInt16);
	cls->setMethod(u"readInt32", &NativePointer::readInt32);
	cls->setMethod(u"readPointer", &NativePointer::readPointer);
	cls->setMethod(u"readUtf8", &NativePointer::readUtf8);
	cls->setMethod(u"readBuffer", &NativePointer::readBuffer);
}

Text16 NativePointer::getClassName() noexcept
{
	return u"NativePointer";
}

uint8_t NativePointer::readUint8() noexcept
{
	return *m_address++;
}
uint16_t NativePointer::readUint16() noexcept
{
	return readas<uint16_t>();
}
uint32_t NativePointer::readUint32() noexcept
{
	return readas<uint32_t>();
}

int8_t NativePointer::readInt8() noexcept
{
	return *m_address++;
}
int16_t NativePointer::readInt16() noexcept
{
	return readas<int16_t>();
}
int32_t NativePointer::readInt32() noexcept
{
	return readas<int32_t>();
}

NativePointer* NativePointer::readPointer() noexcept
{
	NativePointer * pointer = NativePointer::newInstance();
	pointer->m_address = readas<byte*>();
	return pointer;
}
AText16 NativePointer::readUtf8(size_t bytes) noexcept
{
	Text src((char*)m_address, bytes);
	m_address = (byte*)src.end();

	AText16 text;
	text << (Utf8ToUtf16)src;
	return text;
}
kr::JsValue NativePointer::readBuffer(size_t bytes) noexcept
{
	JsValue value(JsNewTypedArray(JsTypedArrayType::Uint8, bytes));
	value.getBuffer().subcopy(Buffer(m_address, bytes));
	m_address += bytes;
	return value;
}

