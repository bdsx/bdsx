#include "nativepointer.h"
#include "reverse.h"
#include "sharedptr.h"
#include "common.h"
#include "encoding.h"

#include <KR3/util/unaligned.h>

using namespace kr;

NativePointer::NativePointer(const JsArguments& args) noexcept
	:JsObjectT(args)
{
}
void NativePointer::initMethods(JsClassT<NativePointer>* cls) noexcept
{
	cls->setMethod(u"move", &NativePointer::move);

	cls->setMethod(u"readUint8", &NativePointer::readUint8);
	cls->setMethod(u"readUint16", &NativePointer::readUint16);
	cls->setMethod(u"readUint32", &NativePointer::readUint32);
	cls->setMethod(u"readInt8", &NativePointer::readInt8);
	cls->setMethod(u"readInt16", &NativePointer::readInt16);
	cls->setMethod(u"readInt32", &NativePointer::readInt32);
	cls->setMethod(u"readFloat32", &NativePointer::readFloat32);
	cls->setMethod(u"readFloat64", &NativePointer::readFloat64);
	cls->setMethod(u"readPointer", &NativePointer::readPointer);
	cls->setMethod(u"readString", &NativePointer::readString);
	cls->setMethod(u"readBuffer", &NativePointer::readBuffer);
	cls->setMethod(u"readCxxString", &NativePointer::readCxxString);

	cls->setMethod(u"writeUint8", &NativePointer::writeUint8);
	cls->setMethod(u"writeUint16", &NativePointer::writeUint16);
	cls->setMethod(u"writeUint32", &NativePointer::writeUint32);
	cls->setMethod(u"writeInt8", &NativePointer::writeInt8);
	cls->setMethod(u"writeInt16", &NativePointer::writeInt16);
	cls->setMethod(u"writeInt32", &NativePointer::writeInt32);
	cls->setMethod(u"writeFloat32", &NativePointer::writeFloat32);
	cls->setMethod(u"writeFloat64", &NativePointer::writeFloat64);
	cls->setMethod(u"writePointer", &NativePointer::writePointer);
	cls->setMethod(u"writeString", &NativePointer::writeString);
	cls->setMethod(u"writeBuffer", &NativePointer::writeBuffer);
	cls->setMethod(u"writeCxxString", &NativePointer::writeCxxString);

	cls->setMethod(u"readVarUint", &NativePointer::readVarUint);
	cls->setMethod(u"readVarInt", &NativePointer::readVarInt);
	cls->setMethod(u"readVarString", &NativePointer::readVarString);

	cls->setMethod(u"writeVarUint", &NativePointer::writeVarUint);
	cls->setMethod(u"writeVarInt", &NativePointer::writeVarInt);
	cls->setMethod(u"writeVarString", &NativePointer::writeVarString);
}
void NativePointer::move(int32_t lowBits, int32_t highBits) noexcept
{
	m_address += (intptr_t)makeqword(lowBits, highBits);
}

uint8_t NativePointer::readUint8() throws(JsException)
{
	return _readas<uint8_t>();
}
uint16_t NativePointer::readUint16() throws(JsException)
{
	return _readas<uint16_t>();
}
uint32_t NativePointer::readUint32() throws(JsException)
{
	return _readas<int32_t>();
}
int8_t NativePointer::readInt8() throws(JsException)
{
	return _readas<int8_t>();
}
int16_t NativePointer::readInt16() throws(JsException)
{
	return _readas<int16_t>();
}
int32_t NativePointer::readInt32() throws(JsException)
{
	return _readas<int32_t>();
}
float NativePointer::readFloat32() throws(JsException)
{
	return _readas<float>();
}
double NativePointer::readFloat64() throws(JsException)
{
	return _readas<double>();
}
NativePointer* NativePointer::readPointer() throws(JsException)
{
	NativePointer* pointer = NativePointer::newInstance();
	pointer->m_address = _readas<byte*>();
	return pointer;
}
JsValue NativePointer::readString(JsValue bytes, int encoding) throws(JsException)
{
	if (encoding == ExEncoding::UTF16)
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
			accessViolation(m_address);
		}
	}
	else if (encoding == ExEncoding::BUFFER)
	{
		return readBuffer(bytes.cast<int>());
	}
	else
	{
		try
		{
			TText16 text;
			Text src;
			if (bytes == undefined)
			{
				byte* end = mem::find(m_address, '\0');
				src = Text((char*)m_address, (char*)end);
			}
			else
			{
				src = Text((char*)m_address, bytes.cast<int>());
			}
			m_address = (byte*)src.end();
			Charset cs = (Charset)encoding;
			CHARSET_CONSTLIZE(cs,
				text << (MultiByteToUtf16<cs>)src;
			);
			return text;
		}
		catch (...)
		{
			accessViolation(m_address);
		}
	}
}
JsValue NativePointer::readBuffer(int bytes) throws(JsException)
{
	JsValue value = JsNewTypedArray(JsTypedArrayType::Uint8, bytes);
	try
	{
		value.getBuffer().subcopy(Buffer(m_address, bytes));
		m_address += bytes;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
	return value;
}
TText16 NativePointer::readCxxString(int encoding) throws(JsException)
{
	TText16 text;
	try
	{
		String* str = (String*)m_address;
		m_address += sizeof(String);

		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			text << (MultiByteToUtf16<cs>)Text(str->data(), str->size);
		);
		return text;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

void NativePointer::writeUint8(uint8_t v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeUint16(uint16_t v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeUint32(uint32_t v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeInt8(int8_t v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeInt16(int16_t v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeInt32(int32_t v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeFloat32(float v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writeFloat64(double v) throws(JsException)
{
	_writeas(v);
}
void NativePointer::writePointer(StaticPointer* v) throws(JsException)
{
	if (v == nullptr) throw JsException(u"argument must be *Pointer");
	_writeas(v->getAddressRaw());
}
void NativePointer::writeString(JsValue buffer, int encoding) throws(JsException)
{
	if (encoding == ExEncoding::UTF16)
	{
		try
		{
			Text16 text = buffer.cast<Text16>();
			size_t size = text.size();
			memcpy(m_address, text.data(), size);
			m_address += size * sizeof(char16);
		}
		catch (...)
		{
			accessViolation(m_address);
		}
	}
	else if (encoding == ExEncoding::BUFFER)
	{
		writeBuffer(buffer);
	}
	else
	{
		try
		{
			Text16 text = buffer.cast<Text16>();
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
			accessViolation(m_address);
		}
	}
}
void NativePointer::writeBuffer(JsValue buffer) throws(JsException)
{
	try
	{
		Buffer buf = buffer.getBuffer();
		if (buf == nullptr) throw JsException(u"argument must be buffer");
		size_t size = buf.size();
		memcpy(m_address, buf.data(), size);
		m_address += size;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
void NativePointer::writeCxxString(Text16 text, int encoding) throws(JsException)
{
	TSZ mb;
	try
	{
		String* str = (String*)m_address;
		mb << toUtf8(text);
		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			mb << Utf16ToMultiByte<cs>(text);
		);
		str->assign(mb.data(), mb.size());
		m_address += sizeof(String);
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

uint32_t NativePointer::readVarUint() throws(JsException)
{
	try
	{
		uint32_t value = 0;
		for (int i = 0; i <= 28; i += 7) {
			byte b = *m_address++;
			value |= ((b & 0x7f) << i);

			if ((b & 0x80) == 0) {
				return value;
			}
		}
	}
	catch (...)
	{
		accessViolation(m_address);
	}
	throw JsException(u"VarInt did not terminate after 5 bytes!");
}
int32_t NativePointer::readVarInt() throws(JsException)
{
	uint32_t raw = readVarUint();
	return (raw >> 1) ^ -(int32_t)(raw & 1);
}
TText16 NativePointer::readVarString(int encoding) throws(JsException)
{
	uint32_t len = readVarUint();
	try
	{
		byte* ptr = m_address;
		m_address += len;
		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			return TText16((MultiByteToUtf16<cs>)Text((char*)ptr, len));
		);
		return TText16();
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

void NativePointer::writeVarUint(uint32_t value) throws(JsException)
{
	for (;;) {
		if ((value >> 7) != 0) {
			*m_address++ = value | 0x80;
		}
		else {
			*m_address++ = value & 0x7f;
			return;
		}
		value = (value >> 7);
	}
}
void NativePointer::writeVarInt(int32_t value) throws(JsException)
{
	return writeVarUint((value << 1) ^ (value >> 31));
}
void NativePointer::writeVarString(Text16 value, int encoding) throws(JsException)
{
	try
	{
		Charset cs = (Charset)encoding;
		CHARSET_CONSTLIZE(cs,
			Utf16ToMultiByte<cs> convert = value;
			size_t size = convert.size();
			writeVarUint(intact<uint32_t>(size));
			convert.copyTo((char*)m_address);
			m_address += size;
		);
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

template <typename T>
T NativePointer::_readas() throws(JsException)
{
	try
	{
		T value = *(Unaligned<T>*)m_address;
		m_address += sizeof(T);
		return value;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
template <typename T>
void NativePointer::_writeas(T value) throws(JsException)
{
	try
	{
		*(Unaligned<T>*)m_address = value;
		m_address += sizeof(T);
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
