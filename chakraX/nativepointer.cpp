#include "nativepointer.h"

using namespace kr;


NativePointer::NativePointer(const JsArguments& args) noexcept
	:JsObjectT<NativePointer>(args)
{
}

void NativePointer::setAddress(int32_t lowBits, int32_t highBits) noexcept
{
	m_address = (uint8_t*)(((intptr_t)highBits << 32) | (intptr_t)(lowBits));
}
void NativePointer::setAddressRaw(void* ptr) noexcept
{
	m_address = (uint8_t*)ptr;
}
void NativePointer::move(int32_t lowBits, int32_t highBits) noexcept
{
	m_address += ((intptr_t)highBits << 32) | (intptr_t)(lowBits);
}
void NativePointer::initMethods(JsClassT<NativePointer>* cls) noexcept
{
	cls->setMethod(u"setAddress", &NativePointer::setAddress);
	cls->setMethod(u"move", &NativePointer::move);
	cls->setMethod(u"readUint8", &NativePointer::readUint8);
	cls->setMethod(u"readUint16", &NativePointer::readUint16);
	cls->setMethod(u"readUint32", &NativePointer::readUint32);
	cls->setMethod(u"readInt8", &NativePointer::readInt8);
	cls->setMethod(u"readInt16", &NativePointer::readInt16);
	cls->setMethod(u"readInt32", &NativePointer::readInt32);
	cls->setMethod(u"readPointer", &NativePointer::readPointer);
	cls->setMethod(u"readUtf8", &NativePointer::readUtf8);
	cls->setMethod(u"readBuffer", &NativePointer::readBuffer);
	cls->setMethod(u"toString", &NativePointer::toString);
}

uint8_t NativePointer::readUint8() throws(kr::JsException)
{
	return *m_address++;
}
uint16_t NativePointer::readUint16() throws(kr::JsException)
{
	return readas<uint16_t>();
}
uint32_t NativePointer::readUint32() throws(kr::JsException)
{
	return readas<uint32_t>();
}

int8_t NativePointer::readInt8() throws(kr::JsException)
{
	return *m_address++;
}
int16_t NativePointer::readInt16() throws(kr::JsException)
{
	return readas<int16_t>();
}
int32_t NativePointer::readInt32() throws(kr::JsException)
{
	return readas<int32_t>();
}

NativePointer* NativePointer::readPointer() throws(kr::JsException)
{
	NativePointer * pointer = NativePointer::newInstance();
	pointer->m_address = readas<byte*>();
	return pointer;
}
AText16 NativePointer::readUtf8(JsValue bytes) throws(kr::JsException)
{
	try
	{
		Text src;
		if (bytes == undefined)
		{
			byte * end = mem::find(m_address, '\0');
			src = Text((char*)m_address, (char*)end);
		}
		else
		{
			src = Text((char*)m_address, bytes.cast<int>());
			m_address = (byte*)src.end();
		}
		AText16 text;
		text << (Utf8ToUtf16)src;
		return text;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
kr::JsValue NativePointer::readBuffer(int bytes) throws(kr::JsException)
{
	JsValue value = JsNewTypedArray(JsTypedArrayType::Uint8, bytes);
	value.getBuffer().subcopy(Buffer(m_address, bytes));
	m_address += bytes;
	return value;
}
kr::TText16 NativePointer::toString() noexcept
{
	TText16 out;
	out << (void*)m_address;
	return out;
}
