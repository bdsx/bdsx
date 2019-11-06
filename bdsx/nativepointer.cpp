#include "nativepointer.h"
#include "reverse.h"

using namespace kr;

//
//class SEHException {};
//class SEHCatcher
//{
//private:
//	_se_translator_function m_func;
//
//public:
//	SEHCatcher() noexcept
//	{
//		m_func = _set_se_translator([](unsigned int, EXCEPTION_POINTERS*){ throw SEHException(); });
//	}
//	~SEHCatcher() noexcept
//	{
//		_set_se_translator(m_func);
//	}
//};

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
	m_address = (uint8_t*)(((uintptr_t)(uint32_t)highBits << 32) | (uintptr_t)((uint32_t)lowBits));
}
void NativePointer::setAddressRaw(void* ptr) noexcept
{
	m_address = (uint8_t*)ptr;
}
NativePointer* NativePointer::clone() noexcept
{
	NativePointer * ptr = NativePointer::newInstance();
	ptr->m_address = m_address;
	return ptr;
}
void NativePointer::move(int32_t lowBits, int32_t highBits) noexcept
{
	m_address += ((intptr_t)highBits << 32) | (intptr_t)(lowBits);
}
void NativePointer::initMethods(JsClassT<NativePointer>* cls) noexcept
{
	cls->setMethod(u"getAddressHigh", &NativePointer::getAddressHigh);
	cls->setMethod(u"getAddressLow", &NativePointer::getAddressLow);
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
	cls->setMethod(u"readUtf16", &NativePointer::readUtf16);
	cls->setMethod(u"readBuffer", &NativePointer::readBuffer);
	cls->setMethod(u"readCxxString", &NativePointer::readCxxString);

	cls->setMethod(u"writeUint8", &NativePointer::writeUint8);
	cls->setMethod(u"writeUint16", &NativePointer::writeUint16);
	cls->setMethod(u"writeUint32", &NativePointer::writeUint32);
	cls->setMethod(u"writeInt8", &NativePointer::writeInt8);
	cls->setMethod(u"writeInt16", &NativePointer::writeInt16);
	cls->setMethod(u"writeInt32", &NativePointer::writeInt32);
	cls->setMethod(u"writePointer", &NativePointer::writePointer);
	cls->setMethod(u"writeUtf8", &NativePointer::writeUtf8);
	cls->setMethod(u"writeUtf16", &NativePointer::writeUtf16);
	cls->setMethod(u"writeBuffer", &NativePointer::writeBuffer);
	cls->setMethod(u"writeCxxString", &NativePointer::writeCxxString);

	cls->setMethod(u"toString", &NativePointer::toString);
}

uint8_t NativePointer::readUint8() throws(kr::JsException)
{
	return _readas<uint8_t>();
}
uint16_t NativePointer::readUint16() throws(kr::JsException)
{
	return _readas<uint16_t>();
}
uint32_t NativePointer::readUint32() throws(kr::JsException)
{
	return _readas<int32_t>();
}
int8_t NativePointer::readInt8() throws(kr::JsException)
{
	return _readas<int8_t>();
}
int16_t NativePointer::readInt16() throws(kr::JsException)
{
	return _readas<int16_t>();
}
int32_t NativePointer::readInt32() throws(kr::JsException)
{
	return _readas<int32_t>();
}
NativePointer* NativePointer::readPointer() throws(kr::JsException)
{
	NativePointer* pointer = NativePointer::newInstance();
	pointer->m_address = _readas<byte*>();
	return pointer;
}
Text16 NativePointer::readUtf16(JsValue bytes) throws(kr::JsException)
{
	Text16 text;
	try
	{
		// SEHCatcher catcher;
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
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
	return text;
}
TText16 NativePointer::readUtf8(JsValue bytes) throws(kr::JsException)
{
	TText16 text;
	try
	{
		// SEHCatcher catcher;
		Text src;
		if (bytes == undefined)
		{
			byte* end = mem::find(m_address, '\0');
			src = Text((char*)m_address, (char*)end);
		}
		else
		{
			src = Text((char*)m_address, bytes.cast<int>());
			m_address = (byte*)src.end();
		}
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
	try
	{
		// SEHCatcher catcher;
		value.getBuffer().subcopy(Buffer(m_address, bytes));
		m_address += bytes;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
	return value;
}
TText16 NativePointer::readCxxString() throws(kr::JsException)
{
	TText16 text;
	try
	{
		// SEHCatcher catcher;
		String* str = (String*)m_address;
		m_address += sizeof(String);

		text << (Utf8ToUtf16)Text(str->data(), str->size);
		return text;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}

void NativePointer::writeUint8(uint8_t v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writeUint16(uint16_t v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writeUint32(uint32_t v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writeInt8(int8_t v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writeInt16(int16_t v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writeInt32(int32_t v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writePointer(NativePointer* v) throws(kr::JsException)
{
	_writeas(v->getAddressRaw());
}
void NativePointer::writeUtf16(kr::Text16 text) throws(kr::JsException)
{
	try
	{
		// SEHCatcher catcher;
		size_t size = text.size();
		memcpy(m_address, text.data(), size);
		m_address += size * sizeof(char16);
	}
	catch(...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
void NativePointer::writeUtf8(kr::Text16 text) throws(kr::JsException)
{
	try
	{
		TSZ utf8;
		utf8 << toUtf8(text);

		size_t size = utf8.size();
		memcpy(m_address, utf8.data(), size);
		m_address += size;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
void NativePointer::writeBuffer(kr::JsValue buffer) throws(kr::JsException)
{
	try
	{
		// SEHCatcher catcher;
		Buffer buf = buffer.getBuffer();
		if (buf == nullptr) throw kr::JsException(u"argument must be buffer");
		size_t size = buf.size();
		memcpy(m_address, buf.data(), size);
		m_address += size;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
void NativePointer::writeCxxString(kr::Text16 text) throws(kr::JsException)
{
	TSZ utf8;
	try
	{
		// SEHCatcher catcher;
		String* str = (String*)m_address;
		utf8 << toUtf8(text);
		str->assign(utf8.data(), utf8.size());
		m_address += sizeof(String);
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}

TText16 NativePointer::toString() noexcept
{
	TText16 out;
	out << (void*)m_address;
	return out;
}

template <typename T>
T NativePointer::_readas() throws(kr::JsException)
{
	try
	{
		// SEHCatcher catcher;
		T value = *(kr::Unaligned<T>*)m_address;
		m_address += sizeof(T);
		return value;
	}
	catch(...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}

template <typename T>
void NativePointer::_writeas(T value) throws(kr::JsException)
{
	try
	{
		// SEHCatcher catcher;
		*(kr::Unaligned<T>*)m_address = value;
		m_address += sizeof(T);
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}
