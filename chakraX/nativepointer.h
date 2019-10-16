#pragma once

#include <KR3/js/js.h>
#include <KR3/util/unaligned.h>

class NativePointer:public kr::JsObjectT<NativePointer>
{
public:

	NativePointer(const kr::JsArguments& args) noexcept;

	void setAddress(int32_t lowBits, int32_t highBits) noexcept;
	void setAddressRaw(void * ptr) noexcept;

	uint8_t readUint8() noexcept;
	uint16_t readUint16() noexcept;
	uint32_t readUint32() noexcept;
	int8_t readInt8() noexcept;
	int16_t readInt16() noexcept;
	int32_t readInt32() noexcept;
	NativePointer* readPointer() noexcept;
	kr::AText16 readUtf8(size_t bytes) noexcept;
	kr::JsValue readBuffer(size_t bytes) noexcept;

	template <typename T>
	T readas() noexcept;

	static void initMethods(kr::JsClassT<NativePointer>* cls) noexcept;

	static kr::Text16 getClassName() noexcept;

private:
	uint8_t* m_address;

};

template <typename T>
T NativePointer::readas() noexcept
{
	T value = *(kr::Unaligned<T>*)m_address;
	m_address += sizeof(T);
	return value;
}

