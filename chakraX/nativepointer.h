#pragma once

#include <KR3/js/js.h>
#include <KR3/util/unaligned.h>

class NativePointer:public kr::JsObjectT<NativePointer>
{
public:
	static constexpr char16_t className[] = u"NativePointer";
	static constexpr bool global = false;

	NativePointer(const kr::JsArguments& args) noexcept;

	int32_t getAddressLow() noexcept;
	int32_t getAddressHigh() noexcept;
	void* getAddressRaw() noexcept;
	void setAddress(int32_t lowBits, int32_t highBits) noexcept;
	void move(int32_t lowBits, int32_t highBits) noexcept;
	void setAddressRaw(void * ptr) noexcept;

	uint8_t readUint8() throws(kr::JsException);
	uint16_t readUint16() throws(kr::JsException);
	uint32_t readUint32() throws(kr::JsException);
	int8_t readInt8() throws(kr::JsException);
	int16_t readInt16() throws(kr::JsException);
	int32_t readInt32() throws(kr::JsException);
	NativePointer* readPointer() throws(kr::JsException);
	kr::TText16 readCxxString() throws(kr::JsException);
	kr::Text16 readUtf16(JsValue bytes) throws(kr::JsException);
	kr::TText16 readUtf8(JsValue bytes) throws(kr::JsException);
	kr::JsValue readBuffer(int bytes) throws(kr::JsException);
	kr::TText16 toString() noexcept;

	template <typename T>
	T readas() throws(kr::JsException);

	static void initMethods(kr::JsClassT<NativePointer>* cls) noexcept;
	
private:
	uint8_t* m_address;

};

template <typename T>
T NativePointer::readas() throws(kr::JsException)
{
	try
	{
		T value = *(kr::Unaligned<T>*)m_address;
		m_address += sizeof(T);
		return value;
	}
	catch (...)
	{
		throw kr::JsException((kr::Text16)(kr::TSZ16() << u"Failed to read " << (void*)m_address));
	}
}

