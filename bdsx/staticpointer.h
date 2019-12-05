#pragma once

#include <KR3/main.h>
#include <KR3/js/js.h>
#include "reverse.h"

class NativePointer;

class StaticPointer :public kr::JsObjectT<StaticPointer>
{
public:
	static constexpr const char16_t className[] = u"StaticPointer";
	static constexpr bool global = false;

	StaticPointer(const kr::JsArguments& args) noexcept;

	int32_t getAddressLow() noexcept;
	int32_t getAddressHigh() noexcept;
	void* getAddressRaw() noexcept;
	void setAddress(int32_t lowBits, int32_t highBits) noexcept;
	void setAddressRaw(const void* ptr) noexcept;
	void setAddressFromBuffer(kr::JsValue buffer) throws(kr::JsException);

	NativePointer* clone() noexcept;
	NativePointer* add(int32_t lowBits, int32_t highBits) noexcept;
	NativePointer* sub(int32_t lowBits, int32_t highBits) noexcept;
	int32_t subptr(StaticPointer* ptr) throws(kr::JsException);
	bool equals(StaticPointer* other) throws(kr::JsException);

	uint8_t getUint8(int offset) throws(kr::JsException);
	uint16_t getUint16(int offset) throws(kr::JsException);
	uint32_t getUint32(int offset) throws(kr::JsException);
	int8_t getInt8(int offset) throws(kr::JsException);
	int16_t getInt16(int offset) throws(kr::JsException);
	int32_t getInt32(int offset) throws(kr::JsException);
	float getFloat32(int offset) throws(kr::JsException);
	double getFloat64(int offset) throws(kr::JsException);
	NativePointer* getPointer(int offset) throws(kr::JsException);
	kr::Text16 getUtf16(kr::JsValue bytes, int offset) throws(kr::JsException);
	kr::TText16 getUtf8(kr::JsValue bytes, int offset) throws(kr::JsException);
	kr::JsValue getBuffer(int bytes, int offset) throws(kr::JsException);
	kr::TText16 getCxxString(int offset) throws(kr::JsException);

	void setUint8(uint8_t v, int offset) throws(kr::JsException);
	void setUint16(uint16_t v, int offset) throws(kr::JsException);
	void setUint32(uint32_t v, int offset) throws(kr::JsException);
	void setInt8(int8_t v, int offset) throws(kr::JsException);
	void setInt16(int16_t v, int offset) throws(kr::JsException);
	void setInt32(int32_t v, int offset) throws(kr::JsException);
	void setFloat32(float v, int offset) throws(kr::JsException);
	void setFloat64(double v, int offset) throws(kr::JsException);
	void setPointer(StaticPointer* v, int offset) throws(kr::JsException);
	void setUtf16(kr::Text16 text, int offset) throws(kr::JsException);
	void setUtf8(kr::Text16 text, int offset) throws(kr::JsException);
	void setBuffer(kr::JsValue buffer, int offset) throws(kr::JsException);
	void setCxxString(kr::Text16 text, int offset) throws(kr::JsException);

	kr::TText16 toString() noexcept;

	static void initMethods(kr::JsClassT<StaticPointer>* cls) noexcept;

private:

	template <typename T>
	T _getas(int offset) throws(kr::JsException);
	template <typename T>
	void _setas(T value, int offset) throws(kr::JsException);

	template <typename T>
	T _readas() throws(kr::JsException);
	template <typename T>
	void _writeas(T value) throws(kr::JsException);

protected:
	uint8_t* m_address;

};

template <typename T>
class StaticPointerT:public StaticPointer
{
protected:
	using StaticPointer::StaticPointer;

public:
	T*& ptr() const noexcept
	{
		return (T*&)m_address;
	}
};

ATTR_NORETURN void accessViolation(const void* address) throws(kr::JsException);
