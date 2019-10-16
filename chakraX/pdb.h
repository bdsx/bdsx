#pragma once

#include <KR3/main.h>

class PdbReader
{
public:
	PdbReader() noexcept;
	~PdbReader() noexcept;
	void* getFunctionAddress(const char * name) noexcept;

private:
	void* m_process;
	uint64_t m_base;
};
