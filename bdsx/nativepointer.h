#pragma once

#include <KR3/js/js.h>

#include "staticpointer.h"

class SharedPointer;

class NativePointer:public kr::JsObjectT<NativePointer, StaticPointer>
{
public:
	static constexpr const char16_t className[] = u"NativePointer";
	static constexpr bool global = false;

	NativePointer(const kr::JsArguments& args) noexcept;

	void move(int32_t lowBits, int32_t highBits) noexcept;

	uint8_t readUint8() throws(kr::JsException);
	uint16_t readUint16() throws(kr::JsException);
	uint32_t readUint32() throws(kr::JsException);
	int8_t readInt8() throws(kr::JsException);
	int16_t readInt16() throws(kr::JsException);
	int32_t readInt32() throws(kr::JsException);
	float readFloat32() throws(kr::JsException);
	double readFloat64() throws(kr::JsException);
	NativePointer* readPointer() throws(kr::JsException);
	kr::JsValue readString(kr::JsValue bytes, int encoding) throws(kr::JsException);
	kr::JsValue readBuffer(int bytes) throws(kr::JsException);
	kr::TText16 readCxxString(int encoding) throws(kr::JsException);

	void writeUint8(uint8_t v) throws(kr::JsException);
	void writeUint16(uint16_t v) throws(kr::JsException);
	void writeUint32(uint32_t v) throws(kr::JsException);
	void writeInt8(int8_t v) throws(kr::JsException);
	void writeInt16(int16_t v) throws(kr::JsException);
	void writeInt32(int32_t v) throws(kr::JsException);
	void writeFloat32(float v) throws(kr::JsException);
	void writeFloat64(double v) throws(kr::JsException);
	void writePointer(StaticPointer* v) throws(kr::JsException);
	void writeString(kr::JsValue buffer, int encoding) throws(kr::JsException);
	void writeBuffer(kr::JsValue buffer) throws(kr::JsException);
	void writeCxxString(kr::Text16 text, int encoding) throws(kr::JsException);

	uint32_t readVarUint() throws(kr::JsException);
	int32_t readVarInt() throws(kr::JsException);
	kr::TText16 readVarString(int encoding) throws(kr::JsException);

	void writeVarUint(uint32_t v) throws(kr::JsException);
	void writeVarInt(int32_t v) throws(kr::JsException);
	void writeVarString(kr::Text16 v, int encoding) throws(kr::JsException);

	static void initMethods(kr::JsClassT<NativePointer>* cls) noexcept;

	
private:
	template <typename T>
	T _readas() throws(kr::JsException);
	template <typename T>
	void _writeas(T value) throws(kr::JsException);
};
