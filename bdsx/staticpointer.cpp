#include "staticpointer.h"
#include "nativepointer.h"
#include "networkidentifier.h"
#include "common.h"
#include "nativemodule.h"
#include "encoding.h"

#include <KR3/util/unaligned.h>

using namespace kr;

StaticPointer::StaticPointer(const JsArguments& args) noexcept
	:JsObjectT(args)
{
	StaticPointer * other = args.at<StaticPointer*>(0);
	if (other) m_address = other->m_address;
	else m_address = nullptr;
}

int32_t StaticPointer::getAddressLow() noexcept
{
	return (uint32_t)(uintptr_t)m_address;
}
int32_t StaticPointer::getAddressHigh() noexcept
{
	return (uint32_t)((uintptr_t)m_address >> 32);
}
void* StaticPointer::getAddressRaw() noexcept
{
	return m_address;
}

void StaticPointer::setAddress(int32_t lowBits, int32_t highBits) noexcept
{
	m_address = make_pointer(lowBits, highBits);
}
void StaticPointer::setAddressRaw(const void* ptr) noexcept
{
	m_address = (uint8_t*)ptr;
}
void StaticPointer::setAddressFromBuffer(JsValue buffer) throws(kr::JsException)
{
	Buffer ptr = buffer.getBuffer();
	if (ptr == nullptr) throw JsException(u"argument must be Bufferable");
	m_address = (byte*)ptr.data();
}

NativePointer* StaticPointer::clone() noexcept
{
	return NativePointer::newInstance(this);
}
NativePointer* StaticPointer::add(int32_t lowBits, int32_t highBits) noexcept
{
	NativePointer* ptr = NativePointer::newInstance(this);
	ptr->m_address = m_address + (intptr_t)makeqword(lowBits, highBits);
	return ptr;
}
NativePointer* StaticPointer::sub(int32_t lowBits, int32_t highBits) noexcept
{
	NativePointer* ptr = NativePointer::newInstance(this);
	ptr->m_address = m_address -(intptr_t)makeqword(lowBits, highBits);
	return ptr;
}
int32_t StaticPointer::subptr(StaticPointer* ptr) throws(JsException)
{
	if (ptr == nullptr) throw JsException(u"argument must be *Pointer");
	return intact<int32_t>(m_address - ptr->m_address);
}
bool StaticPointer::equals(StaticPointer* other) throws(kr::JsException)
{
	if (other == nullptr) throw JsException(u"argument must be *Pointer");
	return m_address == other->m_address;
}

uint8_t StaticPointer::getUint8(int offset) throws(JsException)
{
	return _getas<uint8_t>(offset);
}
uint16_t StaticPointer::getUint16(int offset) throws(JsException)
{
	return _getas<uint16_t>(offset);
}
uint32_t StaticPointer::getUint32(int offset) throws(JsException)
{
	return _getas<uint32_t>(offset);
}
int8_t StaticPointer::getInt8(int offset) throws(JsException)
{
	return _getas<int8_t>(offset);
}
int16_t StaticPointer::getInt16(int offset) throws(JsException)
{
	return _getas<int16_t>(offset);
}
int32_t StaticPointer::getInt32(int offset) throws(JsException)
{
	return _getas<int32_t>(offset);
}
float StaticPointer::getFloat32(int offset) throws(JsException)
{
	return _getas<float>(offset);
}
double StaticPointer::getFloat64(int offset) throws(JsException)
{
	return _getas<double>(offset);
}
NativePointer* StaticPointer::getPointer(int offset) throws(JsException)
{
	NativePointer* instance = NativePointer::newInstance();
	instance->m_address = _getas<byte*>(offset);
	return instance;
}
JsValue StaticPointer::getString(JsValue bytes, int offset, int encoding) throws(JsException)
{
	if (encoding == ExEncoding::UTF16)
	{
		pstr16 str = (pstr16)(m_address + offset);
		Text16 text;
		try
		{
			if (bytes == undefined)
			{
				text = Text16(str, mem16::find(str, '\0'));
			}
			else
			{
				text = Text16(str, bytes.cast<int>());
			}
		}
		catch (...)
		{
			accessViolation(str);
		}
		return text;
	}
	else if (encoding == ExEncoding::BUFFER)
	{
		return getBuffer(bytes.cast<int>(), offset);
	}
	else
	{
		pstr str = (pstr)(m_address + offset);
		TText16 text;
		try
		{
			Text src;
			if (bytes == undefined)
			{
				src = Text(str, mem::find(str, '\0'));
			}
			else
			{
				src = Text(str, bytes.cast<int>());
			}
			Charset cs = (Charset)encoding;
			CHARSET_CONSTLIZE(cs,
				text << (MultiByteToUtf16<cs>)src;
			);
			return text;
		}
		catch (...)
		{
			accessViolation(str);
		}
	}
}
JsValue StaticPointer::getBuffer(int bytes, int offset) throws(JsException)
{
	byte* p = m_address + offset;
	JsValue value = JsNewTypedArray(JsTypedType::Uint8, bytes);
	try
	{
		value.getBuffer().subcopy(Buffer(p, bytes));
	}
	catch (...)
	{
		accessViolation(p);
	}
	return value;
}
TText16 StaticPointer::getCxxString(int offset, int encoding) throws(JsException)
{
	String* str = (String*)(m_address + offset);
	TText16 text;
	try
	{
		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			text << (MultiByteToUtf16<cs>)Text(str->data(), str->size);
		);
		return text;
	}
	catch (...)
	{
		accessViolation(str);
	}
}

void StaticPointer::setUint8(uint8_t v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setUint16(uint16_t v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setUint32(uint32_t v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setInt8(int8_t v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setInt16(int16_t v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setInt32(int32_t v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setFloat32(float v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setFloat64(double v, int offset) throws(JsException)
{
	return _setas(v, offset);
}
void StaticPointer::setPointer(StaticPointer* v, int offset) throws(JsException)
{
	if (v == nullptr) throw JsException(u"1st argument must be *Pointer");
	return _setas(v->m_address, offset);
}
void StaticPointer::setString(JsValue buffer, int offset, int encoding) throws(JsException)
{
	if (encoding == ExEncoding::UTF16)
	{
		Text16 text = buffer.cast<Text16>();
		pstr16 str = (pstr16)(m_address + offset);
		try
		{
			size_t size = text.size();
			memcpy(str, text.data(), size);
		}
		catch (...)
		{
			accessViolation(str);
		}
	}
	else if (encoding == ExEncoding::BUFFER)
	{
		setBuffer(buffer, offset);
	}
	else
	{
		Text16 text = buffer.cast<Text16>();
		pstr16 str = (pstr16)(m_address + offset);
		try
		{
			TSZ mb;
			Charset cs = (Charset)encoding;
			CHARSET_CONSTLIZE(cs,
				mb << Utf16ToMultiByte<cs>(text);
			);

			size_t size = mb.size();
			memcpy(m_address, mb.data(), size);
			m_address += size;
		}
		catch (...)
		{
			accessViolation(str);
		}
	}
}
void StaticPointer::setBuffer(JsValue buffer, int offset) throws(JsException)
{
	void* p = m_address + offset;
	try
	{
		Buffer buf = buffer.getBuffer();
		if (buf == nullptr) throw JsException(u"argument must be buffer");
		size_t size = buf.size();
		memcpy(p, buf.data(), size);
	}
	catch (...)
	{
		accessViolation(p);
	}
}
void StaticPointer::setCxxString(Text16 text, int offset, int encoding) throws(JsException)
{
	String* str = (String*)(m_address + offset);
	TSZ utf8;
	try
	{
		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			utf8 << Utf16ToMultiByte<cs>(text);
			);
		str->assign(utf8.data(), utf8.size());
	}
	catch (...)
	{
		accessViolation(str);
	}
}

JsValue StaticPointer::getBin(int words, int offset) throws(kr::JsException)
{
	try
	{
		return Text16((char16_t*)(m_address + offset), (size_t)words);
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
void StaticPointer::setBin(kr::Text16 buffer, int offset) throws(kr::JsException)
{
	try
	{
		memcpy(m_address+offset, buffer.data(), buffer.bytes());
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

TText16 StaticPointer::toString() noexcept
{
	TText16 out;
	out << hexf((uintptr_t)m_address, sizeof(uintptr_t)*2);
	return out;
}

void StaticPointer::initMethods(JsClassT<StaticPointer>* cls) noexcept
{
	cls->setMethod(u"getAddressHigh", &StaticPointer::getAddressHigh);
	cls->setMethod(u"getAddressLow", &StaticPointer::getAddressLow);
	cls->setMethod(u"setAddress", &StaticPointer::setAddress);
	cls->setMethod(u"setAddressFromBuffer", &StaticPointer::setAddressFromBuffer);
	cls->setMethod(u"add", &StaticPointer::add);
	cls->setMethod(u"sub", &StaticPointer::sub);
	cls->setMethod(u"subptr", &StaticPointer::subptr);
	cls->setMethod(u"equals", &StaticPointer::equals);

	cls->setMethod(u"getUint8", &StaticPointer::getUint8);
	cls->setMethod(u"getUint16", &StaticPointer::getUint16);
	cls->setMethod(u"getUint32", &StaticPointer::getUint32);
	cls->setMethod(u"getInt8", &StaticPointer::getInt8);
	cls->setMethod(u"getInt16", &StaticPointer::getInt16);
	cls->setMethod(u"getInt32", &StaticPointer::getInt32);
	cls->setMethod(u"getFloat32", &StaticPointer::getFloat32);
	cls->setMethod(u"getFloat64", &StaticPointer::getFloat64);
	cls->setMethod(u"getPointer", &StaticPointer::getPointer);
	cls->setMethod(u"getString", &StaticPointer::getString);
	cls->setMethod(u"getBuffer", &StaticPointer::getBuffer);
	cls->setMethod(u"getCxxString", &StaticPointer::getCxxString);

	cls->setMethod(u"setUint8", &StaticPointer::setUint8);
	cls->setMethod(u"setUint16", &StaticPointer::setUint16);
	cls->setMethod(u"setUint32", &StaticPointer::setUint32);
	cls->setMethod(u"setInt8", &StaticPointer::setInt8);
	cls->setMethod(u"setInt16", &StaticPointer::setInt16);
	cls->setMethod(u"setInt32", &StaticPointer::setInt32);
	cls->setMethod(u"setFloat32", &StaticPointer::setFloat32);
	cls->setMethod(u"setFloat64", &StaticPointer::setFloat64);
	cls->setMethod(u"setPointer", &StaticPointer::setPointer);
	cls->setMethod(u"setString", &StaticPointer::setString);
	cls->setMethod(u"setBuffer", &StaticPointer::setBuffer);
	cls->setMethod(u"setCxxString", &StaticPointer::setCxxString);

	cls->setMethod(u"clone", &StaticPointer::clone);
	cls->setMethod(u"setBin", &StaticPointer::setBin);
	cls->setMethod(u"getBin", &StaticPointer::getBin);

	cls->setMethod(u"toString", &StaticPointer::toString);
}

ATTR_NORETURN void accessViolation(const void* address) throws(JsException)
{
	throw JsException((Text16)(TSZ16() << u"Access Violation: " << address));
}

template <typename T>
T StaticPointer::_getas(int offset) throws(JsException)
{
	byte* p = m_address + offset;
	try
	{
		T value = *(Unaligned<T>*)(p);
		return value;
	}
	catch (...)
	{
		accessViolation(p);
	}
}
template <typename T>
void StaticPointer::_setas(T value, int offset) throws(JsException)
{
	byte* p = m_address + offset;
	try
	{
		*(Unaligned<T>*)(p) = value;
	}
	catch (...)
	{
		accessViolation(p);
	}
}
