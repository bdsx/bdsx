#include "reversed.h"

using namespace kr;

void* DataBuffer::getData() noexcept
{
	return type < 10 ? this : data;
}

Text ReadOnlyBinaryStream::getData() noexcept
{
	void* p = data->getData();
	return Text((char*)p + pointer, (char*)p + data->size);
}
