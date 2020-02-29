#include "nativepointer.h"
#include "reverse.h"
#include "sharedptr.h"
#include "common.h"

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
	cls->setMethod(u"writeFloat32", &NativePointer::writeFloat32);
	cls->setMethod(u"writeFloat64", &NativePointer::writeFloat64);
	cls->setMethod(u"writePointer", &NativePointer::writePointer);
	cls->setMethod(u"writeUtf8", &NativePointer::writeUtf8);
	cls->setMethod(u"writeUtf16", &NativePointer::writeUtf16);
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
float NativePointer::readFloat32() throws(kr::JsException)
{
	return _readas<float>();
}
double NativePointer::readFloat64() throws(kr::JsException)
{
	return _readas<double>();
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
		accessViolation(m_address);
	}
	return text;
}
TText16 NativePointer::readUtf8(JsValue bytes) throws(kr::JsException)
{
	TText16 text;
	try
	{
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
		text << (Utf8ToUtf16)src;
		return text;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
JsValue NativePointer::readBuffer(int bytes) throws(kr::JsException)
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
TText16 NativePointer::readCxxString() throws(kr::JsException)
{
	TText16 text;
	try
	{
		String* str = (String*)m_address;
		m_address += sizeof(String);

		text << (Utf8ToUtf16)Text(str->data(), str->size);
		return text;
	}
	catch (...)
	{
		accessViolation(m_address);
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
void NativePointer::writeFloat32(float v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writeFloat64(double v) throws(kr::JsException)
{
	_writeas(v);
}
void NativePointer::writePointer(StaticPointer* v) throws(kr::JsException)
{
	if (v == nullptr) throw JsException(u"argument must be *Pointer");
	_writeas(v->getAddressRaw());
}
void NativePointer::writeUtf16(kr::Text16 text) throws(kr::JsException)
{
	try
	{
		size_t size = text.size();
		memcpy(m_address, text.data(), size);
		m_address += size * sizeof(char16);
	}
	catch (...)
	{
		accessViolation(m_address);
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
		accessViolation(m_address);
	}
}
void NativePointer::writeBuffer(kr::JsValue buffer) throws(kr::JsException)
{
	try
	{
		Buffer buf = buffer.getBuffer();
		if (buf == nullptr) throw kr::JsException(u"argument must be buffer");
		size_t size = buf.size();
		memcpy(m_address, buf.data(), size);
		m_address += size;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
void NativePointer::writeCxxString(kr::Text16 text) throws(kr::JsException)
{
	TSZ utf8;
	try
	{
		String* str = (String*)m_address;
		utf8 << toUtf8(text);
		str->assign(utf8.data(), utf8.size());
		m_address += sizeof(String);
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

uint32_t NativePointer::readVarUint() throws(kr::JsException)
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
int32_t NativePointer::readVarInt() throws(kr::JsException)
{
	uint32_t raw = readVarUint();
	return (raw >> 1) ^ -(int32_t)(raw & 1);
}
TText16 NativePointer::readVarString() throws(kr::JsException)
{
	uint32_t len = readVarUint();
	try
	{
		byte* ptr = m_address;
		ptr += len;
		return TText16((Utf8ToUtf16)Text((char*)ptr, len));
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

void NativePointer::writeVarUint(uint32_t value) throws(kr::JsException)
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
void NativePointer::writeVarInt(int32_t value) throws(kr::JsException)
{
	return writeVarUint((value << 1) ^ (value >> 31));
}
void NativePointer::writeVarString(kr::Text16 value) throws(kr::JsException)
{
	try
	{
		Utf16ToUtf8 convert = value;
		size_t size = convert.size();
		writeVarUint(intact<uint32_t>(size));
		convert.copyTo((char*)m_address);
		m_address += size;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}

template <typename T>
T NativePointer::_readas() throws(kr::JsException)
{
	try
	{
		T value = *(kr::Unaligned<T>*)m_address;
		m_address += sizeof(T);
		return value;
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
template <typename T>
void NativePointer::_writeas(T value) throws(kr::JsException)
{
	try
	{
		*(kr::Unaligned<T>*)m_address = value;
		m_address += sizeof(T);
	}
	catch (...)
	{
		accessViolation(m_address);
	}
}
