#include "nativepointer.h"
#include "reverse.h"

using namespace kr;


NativePointer::NativePointer(const JsArguments& args) noexcept
	:JsObjectT<NativePointer>(args)
{
}

int32_t NativePointer::getAddressLow() noexcept
{
	return (int32_t)(intptr_t)m_address;
}
int32_t NativePointer::getAddressHigh() noexcept
{
	return (int32_t)((intptr_t)m_address >> 32);
}
void* NativePointer::getAddressRaw() noexcept
{
	return m_address;
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
	cls->setMethod(u"readCxxString", &NativePointer::readCxxString);
	cls->setMethod(u"readUtf8", &NativePointer::readUtf8);
	cls->setMethod(u"readUtf16", &NativePointer::readUtf16);
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
TText16 NativePointer::readCxxString() throws(kr::JsException)
{
	try
	{
		String * str = (String*)m_address;
		m_address += sizeof(String);

		TText16 text;
		text << (Utf8ToUtf16)Text(str->data(), str->size);
		return text;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
Text16 NativePointer::readUtf16(JsValue bytes) throws(kr::JsException)
{
	try
	{
		Text16 text;
		if (bytes == undefined)
		{
			char16* end = mem16::find((char16*)m_address, '\0');
			text = Text16((char16*)m_address, end);
			m_address = (byte*)end;
		}
		else
		{
			text = Text16((char16*)m_address, bytes.cast<int>());
			m_address = (byte*)text.end();
		}
		return text;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
TText16 NativePointer::readUtf8(JsValue bytes) throws(kr::JsException)
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
		TText16 text;
		text << (Utf8ToUtf16)src;
		return text;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
JsValue NativePointer::readBuffer(int bytes) throws(kr::JsException)
{
	JsValue value = JsNewTypedArray(JsTypedArrayType::Uint8, bytes);
	value.getBuffer().subcopy(Buffer(m_address, bytes));
	m_address += bytes;
	return value;
}
TText16 NativePointer::toString() noexcept
{
	TText16 out;
	out << (void*)m_address;
	return out;
}
