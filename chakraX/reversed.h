#pragma once

#include <KR3/main.h>

struct ReadOnlyBinaryStream;

struct ReadOnlyBinaryStreamVTable
{
	void (*destructor)() noexcept;
	bool (*read)(ReadOnlyBinaryStream* _this, void*, size_t) noexcept;
};

struct DataBuffer
{
	void* data; // 0
	void* unknown; // 8
	size_t size; // 10
	size_t type; // 18 // (x < 10) > this + pointer

	void* getData() noexcept;
};

struct ReadOnlyBinaryStream
{
	ReadOnlyBinaryStreamVTable* vtable; // 0
	size_t pointer; // 8
	void* u1; // 10
	void* u2; // 18
	void* u3; // 20
	void* u4; // 28
	DataBuffer* data; // 30

	kr::Text getData() noexcept;
};

enum PacketReadResult
{
	PacketReadNoError,
	PacketReadError
};
